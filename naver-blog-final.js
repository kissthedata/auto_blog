const { chromium } = require('playwright');

async function naverBlogFinalTest() {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('네이버 블로그 글쓰기 페이지로 직접 이동...');

        // 사용자의 블로그 글쓰기 페이지로 직접 이동
        await page.goto('https://blog.naver.com/qorskawls12?Redirect=Write&');

        console.log('페이지 로딩 대기 중...');
        await page.waitForTimeout(5000);

        console.log('현재 페이지:', await page.title());
        console.log('현재 URL:', page.url());

        // 로그인이 필요한 경우 처리
        const currentUrl = page.url();
        if (currentUrl.includes('nidlogin') || currentUrl.includes('login')) {
            console.log('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');

            await new Promise(resolve => {
                const readline = require('readline').createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                readline.question('로그인 완료 후 엔터를 누르세요: ', () => {
                    readline.close();
                    resolve();
                });
            });

            // 다시 글쓰기 페이지로 이동
            await page.goto('https://blog.naver.com/qorskawls12?Redirect=Write&');
            await page.waitForTimeout(5000);
        }

        console.log('\n=== 상세 DOM 구조 분석 ===');

        // 1. 제목 입력 필드 찾기
        console.log('1. 제목 입력 필드 찾기...');
        const titleSelectors = [
            'input[placeholder*="제목"]',
            'input[name*="title"]',
            'input[id*="title"]',
            '#post-title',
            '.post-title',
            'input[type="text"]'
        ];

        let titleInput = null;
        for (const selector of titleSelectors) {
            try {
                titleInput = await page.$(selector);
                if (titleInput) {
                    console.log(`✅ 제목 입력 필드 발견: ${selector}`);
                    await titleInput.fill('안녕하세요 - 제목 테스트');
                    console.log('제목 입력 완료');
                    break;
                }
            } catch (e) {
                console.log(`❌ ${selector} 실패`);
            }
        }

        // 2. iframe 에디터 찾기 (네이버 스마트에디터는 보통 iframe 사용)
        console.log('\n2. iframe 에디터 찾기...');

        // 모든 iframe 확인
        const iframes = await page.$$('iframe');
        console.log(`발견된 iframe 개수: ${iframes.length}`);

        for (let i = 0; i < iframes.length; i++) {
            try {
                const iframe = iframes[i];
                const src = await iframe.getAttribute('src');
                const title = await iframe.getAttribute('title');
                const id = await iframe.getAttribute('id');

                console.log(`iframe[${i}] - src: ${src}, title: ${title}, id: ${id}`);

                // iframe 내부 확인
                const frame = await iframe.contentFrame();
                if (frame) {
                    // body 요소가 contenteditable인지 확인
                    const body = await frame.$('body');
                    if (body) {
                        const contentEditable = await body.getAttribute('contenteditable');
                        console.log(`  iframe[${i}] body contenteditable: ${contentEditable}`);

                        if (contentEditable === 'true') {
                            console.log(`✅ 편집 가능한 iframe 발견! iframe[${i}]`);

                            // 텍스트 입력 시도
                            await body.click();
                            await frame.keyboard.type('안녕하세요! 이것은 자동화 테스트입니다.');
                            console.log('✅ iframe 에디터에 텍스트 입력 성공!');
                            break;
                        }
                    }
                }
            } catch (e) {
                console.log(`iframe[${i}] 처리 중 오류: ${e.message}`);
            }
        }

        // 3. 일반 contenteditable 요소 찾기
        console.log('\n3. contenteditable 요소 찾기...');
        const editableElements = await page.$$('[contenteditable="true"]');
        console.log(`발견된 contenteditable 요소: ${editableElements.length}개`);

        if (editableElements.length > 0) {
            for (let i = 0; i < editableElements.length; i++) {
                try {
                    const element = editableElements[i];
                    const tagName = await element.evaluate(el => el.tagName);
                    const className = await element.getAttribute('class');

                    console.log(`contenteditable[${i}] - ${tagName}, class: ${className}`);

                    // 에디터로 보이는 요소에 텍스트 입력 시도
                    if (className && (className.includes('editor') || className.includes('content'))) {
                        await element.click();
                        await element.fill('안녕하세요! contenteditable 테스트입니다.');
                        console.log(`✅ contenteditable[${i}]에 텍스트 입력 성공!`);
                        break;
                    }
                } catch (e) {
                    console.log(`contenteditable[${i}] 처리 중 오류: ${e.message}`);
                }
            }
        }

        // 4. 모든 input과 textarea 확인
        console.log('\n4. 모든 입력 요소 확인...');
        const allInputs = await page.evaluate(() => {
            const elements = document.querySelectorAll('input, textarea');
            return Array.from(elements).map((el, i) => ({
                index: i,
                tagName: el.tagName,
                type: el.type || '',
                id: el.id || '',
                name: el.name || '',
                className: el.className || '',
                placeholder: el.placeholder || ''
            }));
        });

        allInputs.forEach(input => {
            console.log(`input[${input.index}] ${input.tagName}[${input.type}] - id: ${input.id}, name: ${input.name}, placeholder: ${input.placeholder}`);
        });

        console.log('\n=== 페이지 유지 ===');
        console.log('브라우저를 5분간 유지합니다.');
        console.log('F12 개발자도구로 에디터 구조를 확인해주세요.');
        console.log('특히 본문 입력 영역을 우클릭 → 검사 해서 HTML 구조를 확인해주세요.');

        // 5분 대기
        await page.waitForTimeout(300000);

    } catch (error) {
        console.error('오류 발생:', error);
    } finally {
        await browser.close();
    }
}

naverBlogFinalTest().catch(console.error);