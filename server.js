const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const https = require('https');

// MIME 타입 매핑
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

// config.js에서 카카오 API 키 읽기
let config;
try {
    const configContent = fs.readFileSync('./config.js', 'utf8');
    // config 객체를 안전하게 추출
    const configMatch = configContent.match(/const config = ({[\s\S]*?});/);
    if (configMatch) {
        eval(`config = ${configMatch[1]}`);
    } else {
        throw new Error('config 객체를 찾을 수 없습니다');
    }
} catch (error) {
    console.error('config.js 파일을 읽을 수 없습니다:', error.message);
    process.exit(1);
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 카카오 책 검색 API 엔드포인트
    if (pathname === '/api/kakao-book-search' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const { query } = JSON.parse(body);

                if (!query) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: '검색어가 필요합니다' }));
                    return;
                }

                // 카카오 API 호출
                const kakaoUrl = `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&size=10`;

                const options = {
                    headers: {
                        'Authorization': `KakaoAK ${config.kakao.restApiKey}`,
                        'User-Agent': 'BookReviewApp/1.0'
                    }
                };

                const kakaoReq = https.get(kakaoUrl, options, (kakaoRes) => {
                    let data = '';

                    kakaoRes.on('data', chunk => {
                        data += chunk;
                    });

                    kakaoRes.on('end', () => {
                        try {
                            const result = JSON.parse(data);

                            // 카카오 API 응답을 표준 형식으로 변환
                            const transformedResult = {
                                lastBuildDate: new Date().toISOString(),
                                total: result.meta?.total_count || 0,
                                start: 1,
                                display: result.documents?.length || 0,
                                items: result.documents?.map(book => ({
                                    title: book.title,
                                    link: book.url,
                                    image: book.thumbnail || '',
                                    author: book.authors?.join(', ') || '',
                                    discount: '',
                                    publisher: book.publisher,
                                    pubdate: book.datetime ? book.datetime.substring(0, 10).replace(/-/g, '') : '',
                                    isbn: book.isbn,
                                    description: book.contents || ''
                                })) || []
                            };

                            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                            res.end(JSON.stringify(transformedResult));

                            console.log(`카카오 API 호출 성공: "${query}" - ${transformedResult.items.length}개 결과`);
                        } catch (parseError) {
                            console.error('카카오 API 응답 파싱 오류:', parseError);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'API 응답 파싱 오류' }));
                        }
                    });
                });

                kakaoReq.on('error', (error) => {
                    console.error('카카오 API 호출 오류:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: '카카오 API 호출 실패' }));
                });

            } catch (parseError) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: '잘못된 요청 형식' }));
            }
        });

        return;
    }

    // 정적 파일 서빙
    let filePath = '.' + pathname;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`서버 오류: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = 8000;
server.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다`);
    console.log('카카오 API 설정:');
    if (config.kakao && config.kakao.restApiKey) {
        console.log(`- REST API Key: ${config.kakao.restApiKey.substring(0, 10)}...`);
    } else {
        console.log('- ⚠️  카카오 API 키가 설정되지 않았습니다. config.js에서 설정해주세요.');
    }
});