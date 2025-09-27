const { chromium } = require('playwright');

async function liveTypingTest() {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 100 // 동작을 조금 천천히
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('실시간 타이핑 테스트 시작...');

        // 현재 사용자가 있는 페이지로 이동
        await page.goto('https://blog.naver.com/qorskawls12?Redirect=Write&');
        await page.waitForTimeout(3000);

        console.log('로그인 및 에디터 접근을 기다리는 중...');
        console.log('에디터에 포커스가 맞춰질 때까지 기다려주세요...');

        // 사용자가 에디터에 포커스를 맞출 때까지 대기
        await new Promise(resolve => {
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });

            readline.question('에디터에 커서가 깜빡이면 엔터를 누르세요: ', () => {
                readline.close();
                resolve();
            });
        });

        console.log('실시간 타이핑 시작!');

        // 실시간으로 한 글자씩 타이핑
        const textToType = "안녕하세요! 이것은 실시간 타이핑 테스트입니다. 마치 사람이 직접 타이핑하는 것처럼 보입니다.";

        // 한 글자씩 천천히 타이핑
        for (let i = 0; i < textToType.length; i++) {
            const char = textToType[i];
            await page.keyboard.type(char);

            // 글자마다 랜덤한 타이핑 속도 (100-300ms)
            const delay = Math.random() * 200 + 100;
            await page.waitForTimeout(delay);

            console.log(`타이핑 진행: ${i + 1}/${textToType.length} - "${char}"`);
        }

        console.log('\n✅ 실시간 타이핑 완료!');

        // 엔터 두 번 쳐서 줄바꿈
        await page.keyboard.press('Enter');
        await page.keyboard.press('Enter');

        // 추가 텍스트도 타이핑
        const additionalText = "이제 블로그 글쓰기 자동화가 가능합니다!";

        console.log('추가 텍스트 타이핑 중...');
        for (let i = 0; i < additionalText.length; i++) {
            const char = additionalText[i];
            await page.keyboard.type(char);
            await page.waitForTimeout(150); // 좀 더 빠르게
        }

        console.log('\n=== 타이핑 완료 ===');
        console.log('결과를 확인해보세요!');
        console.log('브라우저를 2분간 유지합니다...');

        // 2분 대기
        await page.waitForTimeout(120000);

    } catch (error) {
        console.error('오류 발생:', error);
    } finally {
        await browser.close();
    }
}

liveTypingTest().catch(console.error);