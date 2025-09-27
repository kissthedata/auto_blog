const { chromium } = require('playwright');

async function naverBlogReactTest() {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('네이버 블로그 React 기반 에디터 테스트...');

        // 현재 사용자가 있는 페이지로 이동 (이미 로그인된 상태라고 가정)
        await page.goto('https://blog.naver.com/qorskawls12?Redirect=Write&');
        await page.waitForTimeout(3000);

        // mainFrame iframe으로 이동
        console.log('mainFrame iframe 찾는 중...');

        const mainFrame = await page.frameLocator('#mainFrame');

        // React 앱이 로드될 때까지 대기
        console.log('React 앱 로딩 대기...');
        await page.waitForTimeout(5000);

        // 제목 입력 필드 찾기 (React 컴포넌트)
        console.log('제목 입력 필드 찾는 중...');
        const titleSelectors = [
            'input[placeholder*="제목"]',
            'input[placeholder*="title"]',
            '[data-testid*="title"]',
            '.title input',
            'input[type="text"]'
        ];

        let titleFound = false;
        for (const selector of titleSelectors) {
            try {
                const titleInput = mainFrame.locator(selector).first();
                await titleInput.waitFor({ timeout: 3000 });
                await titleInput.fill('안녕하세요 - 제목 테스트');
                console.log(`✅ 제목 입력 성공: ${selector}`);
                titleFound = true;
                break;
            } catch (e) {
                console.log(`❌ ${selector} 실패`);
            }
        }

        // 본문 에디터 찾기 (React 기반)
        console.log('본문 에디터 찾는 중...');
        const editorSelectors = [
            '[contenteditable="true"]',
            '[data-testid*="editor"]',
            '[data-testid*="content"]',
            '.editor [contenteditable="true"]',
            '.content [contenteditable="true"]',
            '[role="textbox"]',
            '.se-component [contenteditable="true"]',
            'div[contenteditable="true"]'
        ];

        let editorFound = false;
        for (const selector of editorSelectors) {
            try {
                console.log(`시도: ${selector}`);
                const editor = mainFrame.locator(selector).first();
                await editor.waitFor({ timeout: 5000 });

                await editor.click();
                await editor.fill('안녕하세요! 이것은 자동화 테스트입니다.');

                console.log(`✅ 본문 에디터 입력 성공: ${selector}`);
                editorFound = true;
                break;
            } catch (e) {
                console.log(`❌ ${selector} 실패: ${e.message}`);
            }
        }

        if (!editorFound) {
            console.log('에디터를 찾지 못했습니다. 다른 방법을 시도합니다...');

            // 키보드로 텍스트 입력 시도
            console.log('키보드 입력 방식 시도...');
            try {
                // iframe 내부로 포커스 이동
                await mainFrame.locator('body').click();
                await page.keyboard.press('Tab'); // 에디터로 포커스 이동
                await page.keyboard.press('Tab');
                await page.keyboard.press('Tab');

                await page.keyboard.type('안녕하세요! 키보드 입력 테스트입니다.');
                console.log('✅ 키보드 입력 시도 완료');
            } catch (e) {
                console.log('❌ 키보드 입력 실패:', e.message);
            }
        }

        console.log('\n=== 현재 상태 확인 ===');
        console.log('브라우저를 유지합니다. 결과를 확인해주세요.');
        console.log('5분 후 자동 종료됩니다.');

        // 5분 대기
        await page.waitForTimeout(300000);

    } catch (error) {
        console.error('오류 발생:', error);
    } finally {
        await browser.close();
    }
}

naverBlogReactTest().catch(console.error);