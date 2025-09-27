const { chromium } = require('playwright');

async function debugNaverBlogEditor() {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('현재 글쓰기 페이지 접속...');

        // 직접 글쓰기 페이지로 이동
        await page.goto('https://blog.naver.com/PostWriteForm.naver');
        await page.waitForTimeout(5000);

        console.log('현재 페이지 정보:');
        console.log('제목:', await page.title());
        console.log('URL:', page.url());

        // 페이지의 모든 input, textarea, contenteditable 요소들 찾기
        console.log('\n=== 입력 가능한 요소들 찾기 ===');

        const inputElements = await page.$$eval('input, textarea, [contenteditable="true"], iframe', elements => {
            return elements.map((el, index) => ({
                index,
                tagName: el.tagName,
                type: el.type || 'N/A',
                id: el.id || 'N/A',
                className: el.className || 'N/A',
                placeholder: el.placeholder || 'N/A',
                contentEditable: el.contentEditable || 'N/A',
                title: el.title || 'N/A'
            }));
        });

        inputElements.forEach(el => {
            console.log(`[${el.index}] ${el.tagName} - ID: ${el.id}, Class: ${el.className}, Type: ${el.type}`);
        });

        // iframe이 있는지 확인
        const frames = await page.frames();
        console.log(`\n=== 발견된 프레임 수: ${frames.length} ===`);
        frames.forEach((frame, index) => {
            console.log(`Frame ${index}: ${frame.url()}`);
        });

        // 제목 입력 필드 찾기
        console.log('\n=== 제목 입력 시도 ===');
        const titleSelectors = [
            'input[placeholder*="제목"]',
            'input[name*="title"]',
            '#title',
            '.title'
        ];

        for (const selector of titleSelectors) {
            try {
                const titleInput = await page.$(selector);
                if (titleInput) {
                    console.log(`제목 입력 필드 발견: ${selector}`);
                    await titleInput.fill('테스트 제목');
                    console.log('제목 입력 완료');
                    break;
                }
            } catch (e) {
                console.log(`${selector} 시도 실패`);
            }
        }

        // 본문 에디터 찾기 - 더 다양한 셀렉터 시도
        console.log('\n=== 본문 에디터 찾기 ===');
        const editorSelectors = [
            // 스마트에디터 관련
            'iframe[title*="에디터"]',
            'iframe[title*="본문"]',
            'iframe[name*="editor"]',
            'iframe.se-canvas-area',

            // contenteditable 관련
            '[contenteditable="true"]',
            '.se-component-content',
            '.se-text-paragraph',

            // 기타 가능한 셀렉터
            '#smartEditor',
            '.smart-editor',
            'textarea[name*="content"]',
            'div[role="textbox"]'
        ];

        let editorFound = false;
        for (const selector of editorSelectors) {
            try {
                console.log(`시도: ${selector}`);
                const editor = await page.waitForSelector(selector, { timeout: 3000 });

                if (editor) {
                    console.log(`✅ 에디터 발견: ${selector}`);

                    if (selector.includes('iframe')) {
                        console.log('iframe 에디터 처리...');
                        const frame = await editor.contentFrame();
                        const body = await frame.$('body');
                        if (body) {
                            await body.click();
                            await frame.keyboard.type('안녕하세요! 테스트 글입니다.');
                            console.log('iframe 에디터에 텍스트 입력 완료');
                        }
                    } else {
                        console.log('일반 에디터 처리...');
                        await editor.click();
                        await editor.fill('안녕하세요! 테스트 글입니다.');
                        console.log('에디터에 텍스트 입력 완료');
                    }

                    editorFound = true;
                    break;
                }
            } catch (e) {
                console.log(`❌ ${selector} 실패: ${e.message}`);
            }
        }

        if (!editorFound) {
            console.log('\n에디터를 찾지 못했습니다. DOM 구조를 더 자세히 확인합니다...');

            // 클래스명에 'editor', 'content', 'text' 포함된 요소들 찾기
            const possibleEditors = await page.$$eval('*', elements => {
                return elements
                    .filter(el => {
                        const className = el.className.toString().toLowerCase();
                        return className.includes('editor') ||
                               className.includes('content') ||
                               className.includes('text') ||
                               className.includes('se-');
                    })
                    .slice(0, 10) // 상위 10개만
                    .map(el => ({
                        tagName: el.tagName,
                        className: el.className,
                        id: el.id
                    }));
            });

            console.log('에디터 관련 가능한 요소들:');
            possibleEditors.forEach(el => {
                console.log(`${el.tagName} - Class: ${el.className}, ID: ${el.id}`);
            });
        }

        console.log('\n결과 확인을 위해 30초 대기...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('오류 발생:', error);
    } finally {
        await browser.close();
    }
}

debugNaverBlogEditor().catch(console.error);