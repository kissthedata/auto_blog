const { chromium } = require('playwright');

async function testNaverBlogPost() {
    // 브라우저 실행 (headless: false로 화면 보이게 설정)
    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000 // 동작을 천천히 해서 관찰 가능
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('네이버 로그인 페이지로 이동...');
        await page.goto('https://nid.naver.com/nidlogin.login');

        // 로그인 정보 입력 (실제 계정 정보로 변경 필요)
        console.log('로그인 정보 입력 대기...');
        console.log('수동으로 로그인해주세요. 로그인 완료 후 엔터를 누르세요.');

        // 사용자가 수동으로 로그인할 때까지 대기
        await page.waitForTimeout(30000); // 30초 대기

        console.log('네이버 블로그로 이동...');
        await page.goto('https://blog.naver.com');

        // 글쓰기 버튼 찾기 및 클릭
        console.log('글쓰기 버튼 찾는 중...');
        await page.waitForTimeout(3000);

        // 글쓰기 버튼 여러 가능한 셀렉터 시도
        const writeButtonSelectors = [
            'a[href*="write"]',
            '.btn_write',
            '[data-clk="write"]',
            'text=글쓰기'
        ];

        let writeButton = null;
        for (const selector of writeButtonSelectors) {
            try {
                writeButton = await page.waitForSelector(selector, { timeout: 5000 });
                if (writeButton) {
                    console.log(`글쓰기 버튼 발견: ${selector}`);
                    break;
                }
            } catch (e) {
                console.log(`${selector} 찾지 못함`);
            }
        }

        if (writeButton) {
            await writeButton.click();
            console.log('글쓰기 버튼 클릭 완료');
        } else {
            console.log('글쓰기 버튼을 찾지 못했습니다. 수동으로 글쓰기 페이지로 이동해주세요.');
            await page.waitForTimeout(10000);
        }

        // 에디터 영역 찾기
        console.log('에디터 영역 찾는 중...');
        await page.waitForTimeout(5000);

        // 네이버 스마트에디터 가능한 셀렉터들
        const editorSelectors = [
            'iframe[title="리치 텍스트 영역"]',
            '.se-main-container',
            '.se-component',
            '#se-main-container',
            'div[contenteditable="true"]'
        ];

        let editorFound = false;
        for (const selector of editorSelectors) {
            try {
                const editor = await page.waitForSelector(selector, { timeout: 5000 });
                if (editor) {
                    console.log(`에디터 발견: ${selector}`);

                    if (selector.includes('iframe')) {
                        // iframe인 경우
                        const frame = await editor.contentFrame();
                        await frame.fill('body', '안녕하세요');
                    } else {
                        // 일반 div인 경우
                        await editor.fill('안녕하세요');
                    }

                    console.log('"안녕하세요" 텍스트 입력 완료!');
                    editorFound = true;
                    break;
                }
            } catch (e) {
                console.log(`${selector} 찾지 못함`);
            }
        }

        if (!editorFound) {
            console.log('에디터를 찾지 못했습니다. 페이지 구조를 확인해보겠습니다.');

            // 페이지 구조 확인
            const bodyHTML = await page.content();
            console.log('현재 페이지 제목:', await page.title());
            console.log('현재 URL:', page.url());
        }

        // 결과 확인을 위해 잠시 대기
        console.log('결과 확인 중... 20초 대기');
        await page.waitForTimeout(20000);

    } catch (error) {
        console.error('오류 발생:', error);
    } finally {
        await browser.close();
    }
}

// 실행
testNaverBlogPost().catch(console.error);