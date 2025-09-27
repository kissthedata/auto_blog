const { chromium } = require('playwright');

async function naverBlogWithAuth() {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('네이버 로그인 페이지로 이동...');
        await page.goto('https://nid.naver.com/nidlogin.login');

        console.log('=== 로그인 단계별 안내 ===');
        console.log('1. 아이디/비밀번호 입력');
        console.log('2. 2차 인증 (휴대폰 인증) 완료');
        console.log('3. 로그인이 완전히 완료되면 콘솔에서 엔터를 눌러주세요');

        // 사용자 입력 대기
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

        console.log('로그인 완료 확인. 네이버 블로그로 이동...');

        // 네이버 메인으로 이동해서 로그인 상태 확인
        await page.goto('https://naver.com');
        await page.waitForTimeout(2000);

        // 로그인 확인
        const isLoggedIn = await page.$('.MyView-module__link_login___HpHMW') === null;

        if (isLoggedIn) {
            console.log('✅ 로그인 성공 확인!');
        } else {
            console.log('❌ 로그인이 완료되지 않은 것 같습니다.');
        }

        // 네이버 블로그로 이동
        console.log('네이버 블로그로 이동...');
        await page.goto('https://blog.naver.com');
        await page.waitForTimeout(3000);

        console.log('현재 페이지:', await page.title());
        console.log('현재 URL:', page.url());

        // 글쓰기 버튼 찾기
        console.log('글쓰기 버튼을 찾는 중...');

        const writeButtonSelectors = [
            'text=글쓰기',
            '[href*="write"]',
            '.btn_write',
            '[data-clk="write"]',
            'a[title*="글쓰기"]'
        ];

        let writeClicked = false;
        for (const selector of writeButtonSelectors) {
            try {
                const button = await page.waitForSelector(selector, { timeout: 5000 });
                if (button) {
                    console.log(`글쓰기 버튼 발견: ${selector}`);
                    await button.click();
                    writeClicked = true;
                    break;
                }
            } catch (e) {
                console.log(`${selector} 찾지 못함`);
            }
        }

        if (!writeClicked) {
            console.log('글쓰기 버튼을 찾지 못했습니다.');
            console.log('수동으로 글쓰기 버튼을 클릭해주세요.');

            await new Promise(resolve => {
                const readline = require('readline').createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                readline.question('글쓰기 페이지 진입 후 엔터를 누르세요: ', () => {
                    readline.close();
                    resolve();
                });
            });
        }

        // 잠시 대기 후 현재 상태 확인
        await page.waitForTimeout(5000);
        console.log('현재 페이지:', await page.title());
        console.log('현재 URL:', page.url());

        // DOM 구조 상세 분석
        console.log('\n=== 페이지 구조 분석 ===');

        // 모든 input, textarea, contenteditable 요소 찾기
        const allInputs = await page.evaluate(() => {
            const inputs = document.querySelectorAll('input, textarea, [contenteditable="true"], iframe');
            return Array.from(inputs).map((el, i) => ({
                index: i,
                tagName: el.tagName,
                type: el.type || '',
                id: el.id || '',
                className: el.className || '',
                name: el.name || '',
                placeholder: el.placeholder || '',
                title: el.title || ''
            }));
        });

        console.log('발견된 입력 요소들:');
        allInputs.forEach(input => {
            console.log(`[${input.index}] ${input.tagName} - ID: ${input.id}, Class: ${input.className.substring(0, 50)}...`);
        });

        console.log('\n브라우저를 열어둡니다. 수동으로 에디터 구조를 확인해주세요.');
        console.log('F12 개발자도구로 제목/본문 영역의 HTML 구조를 확인 후 공유해주세요.');

        // 5분간 대기
        await page.waitForTimeout(300000);

    } catch (error) {
        console.error('오류 발생:', error);
    } finally {
        await browser.close();
    }
}

naverBlogWithAuth().catch(console.error);