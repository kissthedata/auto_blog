class BookReviewAI {
    constructor() {
        this.uploadedImages = [];
        this.maxImages = 5;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const generateBtn = document.getElementById('generateBtn');
        const copyBtn = document.getElementById('copyBtn');

        // 드래그 앤 드롭
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));

        // 파일 선택
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // 생성 버튼
        generateBtn.addEventListener('click', this.generateReview.bind(this));

        // 복사 버튼
        copyBtn.addEventListener('click', this.copyResult.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.remove('drag-over');

        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    processFiles(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (this.uploadedImages.length + imageFiles.length > this.maxImages) {
            alert(`최대 ${this.maxImages}장까지만 업로드할 수 있습니다.`);
            return;
        }

        imageFiles.forEach(file => {
            if (this.uploadedImages.length < this.maxImages) {
                this.addImage(file);
            }
        });

        this.updateGenerateButton();
    }

    addImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = {
                file: file,
                dataUrl: e.target.result,
                id: Date.now() + Math.random()
            };

            this.uploadedImages.push(imageData);
            this.renderImagePreview(imageData);
        };
        reader.readAsDataURL(file);
    }

    renderImagePreview(imageData) {
        const preview = document.getElementById('imagePreview');

        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
            <img src="${imageData.dataUrl}" alt="업로드된 이미지">
            <button class="image-remove" onclick="bookReviewAI.removeImage('${imageData.id}')">×</button>
        `;

        preview.appendChild(imageItem);
    }

    removeImage(imageId) {
        this.uploadedImages = this.uploadedImages.filter(img => img.id != imageId);
        this.renderAllPreviews();
        this.updateGenerateButton();
    }

    renderAllPreviews() {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = '';
        this.uploadedImages.forEach(imageData => {
            this.renderImagePreview(imageData);
        });
    }

    updateGenerateButton() {
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.disabled = this.uploadedImages.length === 0;
    }

    async generateReview() {
        if (this.uploadedImages.length === 0) {
            alert('먼저 책 사진을 업로드해주세요.');
            return;
        }

        this.showLoading(true);

        try {
            // 1. OCR로 텍스트 추출
            console.log('OCR 처리 중...');
            const extractedTexts = await this.performOCR();

            // 2. ChatGPT로 서평 생성
            console.log('AI 서평 생성 중...');
            const review = await this.generateAIReview(extractedTexts);

            // 3. 결과 표시
            this.showResult(review);

        } catch (error) {
            console.error('서평 생성 중 오류:', error);
            alert('서평 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            this.showLoading(false);
        }
    }

    async performOCR() {
        // Google Vision API 호출
        // 현재는 더미 데이터로 대체
        console.log('Google Vision API 호출 시뮬레이션...');

        await this.sleep(2000); // 2초 대기 (API 호출 시뮬레이션)

        return [
            "책 제목: 홈 사피엔스",
            "저자: 유발 하라리",
            "출판사: 김영사",
            "인류의 역사와 문명에 대한 통찰력 있는 분석을 담은 책입니다.",
            "농업혁명, 인지혁명, 과학혁명을 통해 인류의 발전 과정을 설명합니다."
        ];
    }

    async generateAIReview(extractedTexts) {
        // ChatGPT API 호출
        // 현재는 더미 데이터로 대체
        console.log('ChatGPT API 호출 시뮬레이션...');

        const userPrompt = document.getElementById('promptInput').value;

        await this.sleep(3000); // 3초 대기 (API 호출 시뮬레이션)

        const sampleReview = `📚 홈 사피엔스 - 인류의 놀라운 여정

유발 하라리의 「홈 사피엔스」는 정말 놀라운 책이었습니다! 🌟

이 책을 읽으면서 인류가 어떻게 지구의 지배자가 되었는지에 대한 흥미진진한 이야기에 완전히 빠져들었어요. 특히 인지혁명, 농업혁명, 과학혁명이라는 세 번의 큰 변화를 통해 우리 인류의 역사를 설명하는 방식이 정말 인상적이었습니다.

🧠 **인지혁명**: 상상력의 힘
가장 흥미로웠던 부분은 인간이 다른 동물과 차별화되는 점이 바로 '상상의 산물'을 믿는 능력이라는 것이었어요. 돈, 종교, 국가 같은 것들이 모두 인간의 상상 속에서 나온 것이지만, 이것들이 수백만 명을 하나로 묶어주는 강력한 힘이 된다는 설명이 정말 충격적이었습니다.

🌾 **농업혁명**: 축복인가 저주인가?
농업혁명을 '역사상 최대의 사기'라고 표현한 부분도 정말 인상깊었어요. 농업이 인류에게 풍요를 가져다주었지만, 동시에 더 많은 노동과 계급 사회를 만들어냈다는 관점이 새로웠습니다.

🔬 **과학혁명**: 무지의 인정
"우리는 모른다"를 인정하는 것이 과학 발전의 출발점이라는 메시지도 인상적이었어요. 겸손함이 얼마나 중요한지 다시 한번 깨닫게 되었습니다.

이 책은 단순히 역사책이 아니라, 현재 우리가 살고 있는 세상을 이해하는 새로운 관점을 제공해주는 책입니다. ${userPrompt ? `특히 ${userPrompt}한 관점에서 보면` : ''} 인류의 미래에 대해서도 생각해볼 수 있는 깊이 있는 내용이었어요.

📖 **추천 대상**
- 인류 역사에 관심이 있는 분
- 철학적 사고를 좋아하는 분
- 세상을 바라보는 새로운 관점을 원하는 분

정말 강력하게 추천하는 책입니다! 🙌

#홈사피엔스 #유발하라리 #인류역사 #철학 #책추천 #서평`;

        return sampleReview;
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        const generateBtn = document.getElementById('generateBtn');

        if (show) {
            loading.style.display = 'block';
            generateBtn.disabled = true;
        } else {
            loading.style.display = 'none';
            generateBtn.disabled = false;
        }
    }

    showResult(review) {
        const resultSection = document.getElementById('resultSection');
        const resultEditor = document.getElementById('resultEditor');

        resultEditor.value = review;
        resultSection.style.display = 'block';

        // 결과 섹션으로 스크롤
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    async copyResult() {
        const resultEditor = document.getElementById('resultEditor');

        try {
            await navigator.clipboard.writeText(resultEditor.value);

            const copyBtn = document.getElementById('copyBtn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ 복사완료!';
            copyBtn.style.background = '#48bb78';

            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '#48bb78';
            }, 2000);

        } catch (err) {
            console.error('복사 실패:', err);
            alert('복사에 실패했습니다. 수동으로 복사해주세요.');
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 앱 초기화
const bookReviewAI = new BookReviewAI();