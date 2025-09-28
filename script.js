class BookReviewAI {
    constructor() {
        this.uploadedImages = [];
        this.maxImages = 10;
        this.selectedRoles = {
            reading: null,    // 독서 관련
            job: null,        // 직업별 관점
            style: null       // 콘텐츠 스타일
        };
        this.bookInfo = null; // 책 정보 저장
        this.initializeEventListeners();
        this.updateGenerateButton(); // 초기 버튼 상태 설정
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

        // 책 검색 버튼
        const searchBookBtn = document.getElementById('searchBookBtn');
        searchBookBtn.addEventListener('click', this.searchBook.bind(this));

        // 책 제목 입력 엔터 키 이벤트
        const bookTitleInput = document.getElementById('bookTitleInput');
        bookTitleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchBook();
            }
        });

        // 복사 버튼들
        const copyTextBtn = document.getElementById('copyTextBtn');
        const downloadImagesBtn = document.getElementById('downloadImagesBtn');

        if (copyTextBtn) copyTextBtn.addEventListener('click', this.copyTextOnly.bind(this));
        if (downloadImagesBtn) downloadImagesBtn.addEventListener('click', this.downloadImages.bind(this));

        // 역할 버튼들
        const roleButtons = document.querySelectorAll('.role-btn');
        roleButtons.forEach(btn => {
            btn.addEventListener('click', this.handleRoleSelection.bind(this));
        });
    }

    handleRoleSelection(e) {
        const clickedBtn = e.target;
        const role = clickedBtn.dataset.role;
        const category = clickedBtn.dataset.category;

        // 같은 카테고리의 다른 버튼들에서 active 클래스 제거
        document.querySelectorAll(`[data-category="${category}"]`).forEach(btn => {
            btn.classList.remove('active');
        });

        // 클릭된 버튼에 active 클래스 추가
        clickedBtn.classList.add('active');

        // 선택된 역할 저장
        this.selectedRoles[category] = role;

    }

    async searchBook() {
        const bookTitleInput = document.getElementById('bookTitleInput');
        const searchBtn = document.getElementById('searchBookBtn');
        const bookInfo = document.getElementById('bookInfo');

        const query = bookTitleInput.value.trim();
        if (!query) {
            alert('책 제목을 입력해주세요.');
            return;
        }

        searchBtn.disabled = true;
        searchBtn.textContent = '검색 중...';

        try {
            // 네이버 검색 API 호출 (서버에서 프록시를 통해 호출해야 함)
            // 여기서는 메이브 API를 사용하는 예시를 보여줍니다
            const response = await this.callNaverBookAPI(query);

            if (response && response.items && response.items.length > 0) {
                const book = response.items[0]; // 첫 번째 결과 사용
                this.bookInfo = {
                    title: this.cleanHtmlTags(book.title),
                    author: this.cleanHtmlTags(book.author),
                    publisher: this.cleanHtmlTags(book.publisher),
                    description: this.cleanHtmlTags(book.description),
                    image: book.image,
                    pubdate: book.pubdate,
                    isbn: book.isbn
                };

                this.displayBookInfo(this.bookInfo);
                bookInfo.style.display = 'block';
            } else {
                alert('책 정보를 찾을 수 없습니다. 다른 제목으로 시도해주세요.');
                bookInfo.style.display = 'none';
                this.bookInfo = null;
            }
        } catch (error) {
            console.error('책 검색 오류:', error);
            alert('책 검색 중 오류가 발생했습니다.');
            bookInfo.style.display = 'none';
            this.bookInfo = null;
        } finally {
            searchBtn.disabled = false;
            searchBtn.textContent = '책 정보 검색';
        }
    }

    async callNaverBookAPI(query) {
        // 실제 프록션에서는 서버에서 API를 호출해야 합니다.
        // 여기서는 더미 데이터를 반환합니다.

        // 실제 구현 예시:
        // const response = await fetch('/api/naver-book-search', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ query })
        // });
        // return await response.json();

        // 더미 데이터 반환
        await this.sleep(1000); // 비동기 처리 시뮤레이션

        return {
            items: [{
                title: query + " (더미 데이터)",
                author: "김작가",
                publisher: "예시출판사",
                description: "이 책은 " + query + "에 대한 훌륭한 도서입니다. 많은 독자들에게 사랑받고 있으며, 심도 있는 내용과 유익한 정보를 담고 있습니다.",
                image: "https://via.placeholder.com/120x160/4a9bb8/ffffff?text=Book",
                pubdate: "20240101",
                isbn: "1234567890123"
            }]
        };
    }

    cleanHtmlTags(text) {
        if (!text) return '';
        return text.replace(/<[^>]*>/g, '').trim();
    }

    displayBookInfo(bookInfo) {
        document.getElementById('bookTitle').textContent = bookInfo.title;
        document.getElementById('bookAuthor').textContent = '저자: ' + bookInfo.author;
        document.getElementById('bookPublisher').textContent = '출판사: ' + bookInfo.publisher;
        document.getElementById('bookDescription').textContent = bookInfo.description;

        const bookCover = document.getElementById('bookCover');
        if (bookInfo.image) {
            bookCover.src = bookInfo.image;
            bookCover.style.display = 'block';
        } else {
            bookCover.style.display = 'none';
        }
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

    async processFiles(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (this.uploadedImages.length + imageFiles.length > this.maxImages) {
            alert(`최대 ${this.maxImages}장까지만 업로드할 수 있습니다.`);
            return;
        }

        if (imageFiles.length > 0) {
            this.showCompressionStatus(true);

            for (let i = 0; i < imageFiles.length && this.uploadedImages.length < this.maxImages; i++) {
                const file = imageFiles[i];
                const progress = ((i + 1) / imageFiles.length) * 100;

                this.updateCompressionProgress(progress, `압축 중... (${i + 1}/${imageFiles.length})`);

                await this.addImage(file);

                // 각 이미지 처리 후 잠시 대기 (UI 업데이트를 위해)
                await this.sleep(100);
            }

            this.showCompressionStatus(false);
        }

        this.updateGenerateButton();
    }

    async addImage(file) {
        try {
            // 이미지 압축 후 추가
            const compressedDataUrl = await this.compressImage(file);
            const imageData = {
                file: file,
                dataUrl: compressedDataUrl,
                id: Date.now() + Math.random(),
                originalSize: file.size,
                compressedSize: this.getDataUrlSize(compressedDataUrl)
            };

            this.uploadedImages.push(imageData);
            this.renderImagePreview(imageData);
            this.updateGenerateButton(); // 이미지 추가 후 버튼 상태 업데이트

        } catch (error) {
            console.error('이미지 압축 실패:', error);
            // 압축 실패 시 원본 사용
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageData = {
                        file: file,
                        dataUrl: e.target.result,
                        id: Date.now() + Math.random()
                    };

                    this.uploadedImages.push(imageData);
                    this.renderImagePreview(imageData);
                    this.updateGenerateButton();
                    resolve();
                };
                reader.readAsDataURL(file);
            });
        }
    }

    showCompressionStatus(show) {
        const compressionStatus = document.getElementById('compressionStatus');
        if (show) {
            compressionStatus.style.display = 'block';
            this.updateCompressionProgress(0, '이미지 압축 준비 중...');
        } else {
            setTimeout(() => {
                compressionStatus.style.display = 'none';
            }, 500); // 0.5초 후 숨김
        }
    }

    updateCompressionProgress(progress, text) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const compressionText = document.querySelector('.compression-text');

        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${Math.round(progress)}%`;
        if (compressionText) compressionText.textContent = text;
    }

    async compressImage(file) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // 최대 크기 설정 (Google Vision API 권장)
                const maxWidth = 1024;
                const maxHeight = 1024;
                const quality = 0.8; // 80% 품질

                let { width, height } = img;

                // 비율 유지하면서 크기 조정
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // 이미지 그리기
                ctx.drawImage(img, 0, 0, width, height);

                // 압축된 데이터 URL 생성
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

                console.log(`이미지 압축: ${this.formatFileSize(file.size)} → ${this.formatFileSize(this.getDataUrlSize(compressedDataUrl))}`);

                resolve(compressedDataUrl);
            };

            img.onerror = () => {
                reject(new Error('이미지 로드 실패'));
            };

            // 파일을 이미지로 로드
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    getDataUrlSize(dataUrl) {
        // data URL의 크기 계산 (대략적)
        const base64 = dataUrl.split(',')[1];
        return Math.round(base64.length * 0.75); // base64는 실제 크기의 약 133%
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        console.log('Google Vision API 호출 중...');

        try {
            const imageDataWithTexts = [];

            for (let i = 0; i < this.uploadedImages.length; i++) {
                const imageData = this.uploadedImages[i];
                // 이미지를 base64로 변환 (data:image/jpeg;base64, 부분 제거)
                const base64Image = imageData.dataUrl.split(',')[1];

                const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${config.googleVisionKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        requests: [{
                            image: {
                                content: base64Image
                            },
                            features: [{
                                type: 'TEXT_DETECTION',
                                maxResults: 50
                            }]
                        }]
                    })
                });

                if (!response.ok) {
                    throw new Error(`Google Vision API 오류: ${response.status}`);
                }

                const result = await response.json();

                let extractedText = '';
                if (result.responses && result.responses[0] && result.responses[0].textAnnotations) {
                    // 전체 텍스트 추출 (첫 번째 textAnnotation이 전체 텍스트)
                    extractedText = result.responses[0].textAnnotations[0]?.description || '';
                }

                // 이미지와 텍스트를 함께 저장
                imageDataWithTexts.push({
                    imageData: imageData,
                    text: extractedText.trim(),
                    section: this.categorizeImageContent(extractedText.trim())
                });
            }

            console.log('OCR 추출 및 분류 완료:', imageDataWithTexts);
            return imageDataWithTexts;

        } catch (error) {
            console.error('OCR 처리 중 오류:', error);

            // 오류 발생 시 더미 데이터 반환
            return this.uploadedImages.map((img, index) => ({
                imageData: img,
                text: [
                    "책 제목: 홈 사피엔스\n저자: 유발 하라리\n출판사: 김영사",
                    "목차\n1부 인지혁명\n2부 농업혁명\n3부 인류의 통합\n4부 과학혁명",
                    "인간이 다른 동물과 차별화되는 점은 바로 '상상의 산물'을 믿는 능력이다.",
                    "저자 소개\n유발 하라리는 역사학자이자 철학자로 예루살렘 히브리 대학교 교수이다."
                ][index] || "책의 내용 중 일부입니다.",
                section: ['intro', 'structure', 'content', 'conclusion'][index] || 'content'
            }));
        }
    }

    categorizeImageContent(text) {
        const lowerText = text.toLowerCase();

        // 책 제목, 저자, 출판사 관련 키워드
        if (lowerText.includes('제목') || lowerText.includes('저자') || lowerText.includes('출판') ||
            lowerText.includes('title') || lowerText.includes('author') || lowerText.includes('publisher') ||
            text.length < 100) {
            return 'intro';
        }

        // 목차, 구성 관련 키워드
        if (lowerText.includes('목차') || lowerText.includes('차례') || lowerText.includes('contents') ||
            lowerText.includes('chapter') || lowerText.includes('part') || lowerText.includes('편') ||
            lowerText.includes('장') || /\d+\.\s/.test(text) || /제\d+/.test(text)) {
            return 'structure';
        }

        // 저자 소개, 추천사, 서평 관련 키워드
        if (lowerText.includes('저자') || lowerText.includes('소개') || lowerText.includes('추천') ||
            lowerText.includes('서평') || lowerText.includes('평가') || lowerText.includes('about') ||
            lowerText.includes('biography') || lowerText.includes('review')) {
            return 'conclusion';
        }

        // 기본적으로 본문 내용으로 분류
        return 'content';
    }

    async generateAIReview(imageDataWithTexts) {
        console.log('OpenAI API 호출 중...');

        try {
            const userPrompt = document.getElementById('promptInput').value;
            const rolePrompt = this.getRolePrompt();

            // 섹션별로 이미지와 텍스트 그룹핑
            const sectionData = this.groupImagesBySection(imageDataWithTexts);

            const systemPrompt = `${rolePrompt}

서평 작성 가이드라인:
1. **책 소개** - 저자, 출판사, 기본 정보와 책의 전반적인 소개
2. **구성** - 책의 구조, 챕터 구성, 전개 방식
3. **흥미로웠던 점** - 핵심 메시지, 인상 깊은 내용, 새로운 관점
4. **총평** - 전반적인 평가, 추천 대상, 별점

형식 요구사항:
- 각 섹션은 ## 제목으로 구분
- 중요한 내용은 **볼드체** 사용
- 인상적인 문구는 > 인용문으로 표시
- 이모지 적절히 활용
- 마지막에 --- 구분선 후 해시태그 포함
- 각 섹션에 [IMAGE_PLACEHOLDER_섹션명] 자리를 만들어주세요

${userPrompt ? `추가 요청사항: ${userPrompt}` : ''}`;

            const contentPrompt = this.buildContentPrompt(sectionData);

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.openaiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user',
                            content: contentPrompt
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API 오류: ${response.status}`);
            }

            const result = await response.json();
            let review = result.choices[0]?.message?.content || '';

            // 이미지 플레이스홀더를 실제 이미지로 교체
            console.log('AI 응답 원본:', review);
            console.log('섹션 데이터:', sectionData);

            review = this.replaceImagePlaceholders(review, sectionData);

            console.log('이미지 교체 후:', review);
            console.log('AI 서평 생성 완료');
            return review;

        } catch (error) {
            console.error('AI 서평 생성 중 오류:', error);
            return this.generateFallbackReview(imageDataWithTexts);
        }
    }

    getRolePrompt() {
        const rolePrompts = {
            reviewer: "전문적인 책 서평가로서 문학적 분석과 작품성 평가에 중점을 둡니다.",
            blogger: "인기 북블로거로서 개인적인 경험과 일상을 연결하여 친근하고 공감되는 톤을 사용합니다.",
            bookclub: "독서모임 리더로서 토론 포인트와 질문거리를 제시하며 함께 읽고 싶어지게 만듭니다.",
            booktuber: "인기 북튜버로서 시청자의 관심을 끌고 참여를 유도하는 영상용 스타일을 사용합니다.",
            worker: "직장인 관점에서 업무와 커리어에 적용할 수 있는 실용적 인사이트를 중심으로 분석합니다.",
            student: "학생 관점에서 학습과 성장에 도움이 되는 내용과 시험/과제 연결점을 찾아 설명합니다.",
            teacher: "교육자로서 교육적 가치와 학습자에게 추천할 만한 내용을 중심으로 평가합니다.",
            entrepreneur: "창업가 관점에서 비즈니스 인사이트와 성장 마인드셋을 중심으로 해석합니다.",
            influencer: "SNS 인플루언서로서 짧고 임팩트 있는 내용과 해시태그를 적극 활용합니다.",
            journalist: "기자로서 객관적 사실과 분석을 중심으로 뉴스 기사 형식의 서평을 작성합니다.",
            entertainer: "엔터테이너로서 재미있고 유머러스한 톤으로 읽는 즐거움을 제공합니다.",
            healer: "힐링 에세이스트로서 감성적이고 위로가 되는 따뜻한 톤을 사용합니다."
        };

        const selectedRoles = Object.values(this.selectedRoles).filter(role => role !== null);

        if (selectedRoles.length === 0) {
            return "당신은 전문적인 책 서평가입니다. 체계적이고 매력적인 서평을 작성해주세요.";
        }

        const roleDescriptions = selectedRoles.map(role => rolePrompts[role]).filter(desc => desc);

        return `당신은 다음과 같은 복합적 관점을 가진 서평가입니다:\n- ${roleDescriptions.join('\n- ')}\n\n이러한 관점들을 조합하여 독특하고 매력적인 서평을 작성해주세요.`;
    }

    groupImagesBySection(imageDataWithTexts) {
        const sections = {
            intro: [],
            structure: [],
            content: [],
            conclusion: []
        };

        imageDataWithTexts.forEach(item => {
            sections[item.section].push(item);
        });

        return sections;
    }

    buildContentPrompt(sectionData) {
        let prompt = "다음은 책에서 추출한 섹션별 OCR 텍스트입니다. 이 정보를 참조하여 자연스러운 서평을 작성해주세요:\n\n";

        Object.keys(sectionData).forEach(section => {
            const items = sectionData[section];
            if (items.length > 0) {
                const sectionName = {
                    intro: '책 소개/표지 관련 텍스트',
                    structure: '목차/구성 관련 텍스트',
                    content: '본문 내용 텍스트',
                    conclusion: '저자 소개/추천사 관련 텍스트'
                }[section];

                prompt += `**${sectionName}:**\n`;
                items.forEach((item, index) => {
                    prompt += `이미지 ${index + 1}: ${item.text}\n`;
                });
                prompt += '\n';
            }
        });

        prompt += `
**중요한 지침:**
1. OCR로 추출한 위 텍스트들을 그대로 복사하지 마세요
2. 이 정보들을 참조하여 자연스럽고 매력적인 서평 문장으로 재작성해주세요
3. 각 섹션에 [IMAGE_PLACEHOLDER_섹션명] 자리를 만들어주세요
4. 해당 이미지의 OCR 내용을 구체적으로 언급하면서 자연스럽게 서평에 녹여내세요

예시:
❌ "책 제목: 홈사피엔스, 저자: 유발 하라리"
✅ "유발 하라리의 『홈사피엔스』는 인류 역사에 대한 통찰력 있는 작품입니다"
`;

        return prompt;
    }

    replaceImagePlaceholders(review, sectionData) {
        // 전체 이미지 목록을 만들어서 번호 매기기
        this.allImages = [];
        Object.values(sectionData).forEach(images => {
            this.allImages.push(...images);
        });

        // 플레이스홀더를 이미지 표시 + 텍스트 플레이스홀더로 교체
        const sectionMapping = {
            'intro': 'intro',
            'structure': 'structure',
            'content': 'content',
            'conclusion': 'conclusion'
        };

        Object.keys(sectionMapping).forEach(key => {
            const placeholder = `[IMAGE_PLACEHOLDER_${key}]`;
            const images = sectionData[sectionMapping[key]];

            if (images && images.length > 0) {
                // 해당 섹션의 이미지들을 표시 + 플레이스홀더
                const imageHtml = images.map(item => {
                    const imageIndex = this.allImages.findIndex(img => img.id === item.id) + 1;
                    return `
                    <div class="image-placeholder-section">
                        <div class="image-preview-small">
                            <img src="${item.imageData.dataUrl}" alt="책 이미지" />
                            <button class="copy-image-btn" onclick="bookReviewAI.copyImage(${imageIndex - 1})">
                                📋 ${imageIndex}번 사진 복사
                            </button>
                        </div>
                        <div class="placeholder-text">
                            📷 <strong>여기에 ${imageIndex}번 사진을 붙여넣어주세요</strong>
                        </div>
                    </div>`;
                }).join('');

                while (review.includes(placeholder)) {
                    review = review.replace(placeholder, imageHtml);
                }
            } else {
                while (review.includes(placeholder)) {
                    review = review.replace(placeholder, '');
                }
            }
        });

        // 대체 플레이스홀더 처리
        const alternativeMapping = {
            '책소개': 'intro',
            '구성': 'structure',
            '내용': 'content',
            '본문': 'content',
            '총평': 'conclusion',
            '저자': 'conclusion'
        };

        Object.keys(alternativeMapping).forEach(korean => {
            const placeholder = `[IMAGE_PLACEHOLDER_${korean}]`;
            const sectionKey = alternativeMapping[korean];
            const images = sectionData[sectionKey];

            if (images && images.length > 0) {
                const imageHtml = images.map(item => {
                    const imageIndex = this.allImages.findIndex(img => img.id === item.id) + 1;
                    return `
                    <div class="image-placeholder-section">
                        <div class="image-preview-small">
                            <img src="${item.imageData.dataUrl}" alt="책 이미지" />
                            <button class="copy-image-btn" onclick="bookReviewAI.copyImage(${imageIndex - 1})">
                                📋 ${imageIndex}번 사진 복사
                            </button>
                        </div>
                        <div class="placeholder-text">
                            📷 <strong>여기에 ${imageIndex}번 사진을 붙여넣어주세요</strong>
                        </div>
                    </div>`;
                }).join('');

                while (review.includes(placeholder)) {
                    review = review.replace(placeholder, imageHtml);
                }
            } else {
                while (review.includes(placeholder)) {
                    review = review.replace(placeholder, '');
                }
            }
        });

        return review;
    }

    generateFallbackReview(imageDataWithTexts) {
        const userPrompt = document.getElementById('promptInput').value;
        const selectedRoles = Object.values(this.selectedRoles).filter(role => role !== null);

        let roleText = '📖 전문 서평가';
        if (selectedRoles.length > 0) {
            const roleTexts = selectedRoles.map(role => {
                const btn = document.querySelector(`[data-role="${role}"]`);
                return btn ? btn.textContent : '';
            }).filter(text => text !== '');
            roleText = roleTexts.join(' + ');
        }

        // 섹션별로 이미지와 텍스트 그룹핑
        const sectionData = this.groupImagesBySection(imageDataWithTexts);

        let fallbackReview = `## 📚 ${roleText} 관점에서의 서평

업로드해주신 책 사진에서 텍스트를 추출했습니다! 🌟

## 📖 책 소개
[IMAGE_PLACEHOLDER_intro]
${this.generateNaturalText(sectionData.intro, 'intro')}

## 📋 구성
[IMAGE_PLACEHOLDER_structure]
${this.generateNaturalText(sectionData.structure, 'structure')}

## ✨ 흥미로웠던 점
[IMAGE_PLACEHOLDER_content]
${this.generateNaturalText(sectionData.content, 'content')}

## 🎯 총평
[IMAGE_PLACEHOLDER_conclusion]
${this.generateNaturalText(sectionData.conclusion, 'conclusion')}

${userPrompt ? `특히 ${userPrompt}한 관점에서 보면 더욱 의미있는 내용일 것 같아요.` : ''}

*현재 API 연결에 문제가 있어 임시 서평을 표시했습니다.*

---

#책추천 #서평 #독서`;

        // 이미지 플레이스홀더를 실제 이미지로 교체
        return this.replaceImagePlaceholders(fallbackReview, sectionData);
    }

    generateNaturalText(items, section) {
        if (!items || items.length === 0) {
            const defaultTexts = {
                intro: '흥미로운 책인 것 같습니다.',
                structure: '체계적으로 구성된 내용입니다.',
                content: '많은 인사이트를 제공하는 내용입니다.',
                conclusion: '추천할 만한 좋은 책입니다.'
            };
            return defaultTexts[section] || '의미있는 내용입니다.';
        }

        // OCR 텍스트를 간단하게 자연스러운 문장으로 변환
        return items.map(item => {
            const text = item.text;

            if (section === 'intro') {
                // 제목, 저자 등을 자연스럽게 변환
                if (text.includes('제목') || text.includes('저자')) {
                    return text.replace(/제목:\s*/g, '').replace(/저자:\s*/g, '').replace(/출판사:\s*/g, '');
                }
                return `표지에서 확인할 수 있듯이 ${text.substring(0, 100)}...`;
            } else if (section === 'structure') {
                return `목차를 보면 ${text.substring(0, 100)}... 의 구성으로 되어 있습니다.`;
            } else if (section === 'content') {
                return `본문에서 "${text.substring(0, 50)}..." 라는 내용이 특히 인상깊었습니다.`;
            } else {
                return `${text.substring(0, 100)}...`;
            }
        }).join(' ');
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
        const resultContent = document.getElementById('resultContent');
        const imageControls = document.getElementById('imageControls');
        const imageList = document.getElementById('imageList');

        // 이미지가 이미 HTML로 포함되어 있으므로 마크다운만 HTML로 변환
        const htmlReview = this.markdownToHtml(review);

        console.log('변환된 HTML:', htmlReview); // 디버깅용

        resultContent.innerHTML = htmlReview;

        // 이미지 리모컨 생성
        this.createImageControls(imageList);
        imageControls.style.display = 'block';

        resultSection.style.display = 'block';

        // 결과 섹션으로 스크롤
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    createImageControls(imageList) {
        imageList.innerHTML = '';

        this.uploadedImages.forEach((imageData, index) => {
            const controlItem = document.createElement('div');
            controlItem.className = 'image-control-item';

            const img = document.createElement('img');
            img.src = imageData.dataUrl;
            img.alt = `사진 ${index + 1}`;

            const label = document.createElement('div');
            label.className = 'image-label';
            label.textContent = `사진 ${index + 1}`;

            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-image-btn-small';
            copyBtn.textContent = '복사하기';
            copyBtn.onclick = () => this.copyImage(index);

            controlItem.appendChild(img);
            controlItem.appendChild(label);
            controlItem.appendChild(copyBtn);

            imageList.appendChild(controlItem);
        });
    }

    markdownToHtml(markdown) {
        let html = markdown;

        // 먼저 HTML 태그들을 임시로 보호
        const htmlTags = [];
        html = html.replace(/<div class="section-image">[\s\S]*?<\/div>/g, (match) => {
            htmlTags.push(match);
            return `__HTML_TAG_${htmlTags.length - 1}__`;
        });

        // 마크다운 변환
        html = html
            // 제목 변환
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // 볼드 변환
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // 인용문 변환
            .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
            // 줄바꿈 변환 (두 개 이상의 연속 줄바꿈을 문단 나누기로)
            .replace(/\n{2,}/g, '</p><p>')
            // 단일 줄바꿈을 <br>로
            .replace(/\n/g, '<br>')
            // 전체를 p 태그로 감싸기 (HTML 태그가 아닌 경우에만)
            .split('</p><p>')
            .map(paragraph => {
                if (paragraph.trim() &&
                    !paragraph.startsWith('<h') &&
                    !paragraph.startsWith('<blockquote') &&
                    !paragraph.includes('__HTML_TAG_')) {
                    return `<p>${paragraph}</p>`;
                }
                return paragraph;
            })
            .join('</p><p>')
            // 빈 p 태그 제거
            .replace(/<p><\/p>/g, '')
            .replace(/<p>\s*<\/p>/g, '');

        // HTML 태그들을 다시 복원
        htmlTags.forEach((tag, index) => {
            html = html.replace(`__HTML_TAG_${index}__`, tag);
        });

        return html;
    }

    async copyTextOnly() {
        const resultContent = document.getElementById('resultContent');

        try {
            // 텍스트와 플레이스홀더 추출
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = resultContent.innerHTML;

            // 이미지 복사 버튼들을 제거하고 플레이스홀더 텍스트만 남기기
            const imagePreviewDivs = tempDiv.querySelectorAll('.image-preview-small');
            imagePreviewDivs.forEach(div => div.remove());

            // 마크다운 형식으로 변환
            let textContent = tempDiv.innerHTML
                .replace(/<h1[^>]*>/g, '# ')
                .replace(/<h2[^>]*>/g, '## ')
                .replace(/<h3[^>]*>/g, '### ')
                .replace(/<\/h[1-6]>/g, '\n\n')
                .replace(/<strong[^>]*>/g, '**')
                .replace(/<\/strong>/g, '**')
                .replace(/<blockquote[^>]*>/g, '> ')
                .replace(/<\/blockquote>/g, '\n\n')
                .replace(/<br\s*\/?>/g, '\n')
                .replace(/<p[^>]*>/g, '')
                .replace(/<\/p>/g, '\n\n')
                // 플레이스홀더 텍스트 정리
                .replace(/📷\s*\*\*여기에\s*(\d+)번\s*사진을\s*붙여넣어주세요\*\*/g, '\n📷 **여기에 $1번 사진을 붙여넣어주세요**\n')
                .replace(/<[^>]*>/g, '') // 나머지 HTML 태그 제거
                .replace(/\n{3,}/g, '\n\n') // 연속된 줄바꿈 정리
                .trim();

            await navigator.clipboard.writeText(textContent);

            const copyBtn = document.getElementById('copyTextBtn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ 복사완료!';
            copyBtn.style.background = '#38a169';

            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '#48bb78';
            }, 2000);

        } catch (err) {
            console.error('텍스트 복사 실패:', err);
            alert('복사에 실패했습니다. 수동으로 복사해주세요.');
        }
    }

    async downloadImages() {
        if (this.uploadedImages.length === 0) {
            alert('다운로드할 이미지가 없습니다.');
            return;
        }

        try {
            const downloadBtn = document.getElementById('downloadImagesBtn');
            const originalText = downloadBtn.textContent;
            downloadBtn.textContent = '📥 다운로드 중...';
            downloadBtn.disabled = true;

            for (let i = 0; i < this.uploadedImages.length; i++) {
                const imageData = this.uploadedImages[i];
                const fileName = `book_image_${i + 1}.jpg`;

                // data URL을 Blob으로 변환
                const response = await fetch(imageData.dataUrl);
                const blob = await response.blob();

                // 다운로드 링크 생성
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // 연속 다운로드 사이에 약간의 지연
                await this.sleep(200);
            }

            downloadBtn.textContent = '✅ 다운로드 완료!';
            downloadBtn.style.background = '#5a67d8';

            setTimeout(() => {
                downloadBtn.textContent = originalText;
                downloadBtn.style.background = '#667eea';
                downloadBtn.disabled = false;
            }, 2000);

        } catch (err) {
            console.error('이미지 다운로드 실패:', err);
            alert('이미지 다운로드에 실패했습니다.');

            const downloadBtn = document.getElementById('downloadImagesBtn');
            downloadBtn.textContent = '📷 이미지 다운로드';
            downloadBtn.disabled = false;
        }
    }

    async copyImage(imageIndex) {
        if (!this.allImages || imageIndex >= this.allImages.length) {
            alert('이미지를 찾을 수 없습니다.');
            return;
        }

        try {
            const imageData = this.allImages[imageIndex];

            // data URL을 Blob으로 변환
            const response = await fetch(imageData.imageData.dataUrl);
            const blob = await response.blob();

            // ClipboardItem으로 이미지 복사
            const clipboardItem = new ClipboardItem({
                [blob.type]: blob
            });

            await navigator.clipboard.write([clipboardItem]);

            // 버튼 피드백
            const buttons = document.querySelectorAll('.copy-image-btn');
            const targetButton = buttons[imageIndex];

            if (targetButton) {
                const originalText = targetButton.textContent;
                targetButton.textContent = '✅ 복사완료!';
                targetButton.style.background = '#48bb78';

                setTimeout(() => {
                    targetButton.textContent = originalText;
                    targetButton.style.background = '#667eea';
                }, 1500);
            }

        } catch (err) {
            console.error('이미지 복사 실패:', err);

            // 구형 브라우저 대안 - 이미지 다운로드
            try {
                const imageData = this.allImages[imageIndex];
                const response = await fetch(imageData.imageData.dataUrl);
                const blob = await response.blob();

                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `book_image_${imageIndex + 1}.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                alert('이미지 복사가 지원되지 않아 다운로드했습니다. 다운로드된 파일을 사용해주세요.');

            } catch (downloadErr) {
                console.error('이미지 다운로드도 실패:', downloadErr);
                alert('이미지 복사/다운로드에 실패했습니다.');
            }
        }
    }

    optimizeHtmlForBlog(htmlContent) {
        // 네이버 블로그 등에서 더 잘 인식되도록 HTML 최적화
        return htmlContent
            // CSS 클래스 제거 (일부 블로그에서 무시될 수 있음)
            .replace(/class="[^"]*"/g, '')
            // 이미지 스타일 간소화
            .replace(/<div[^>]*section-image[^>]*>/g, '<div style="text-align: center; margin: 20px 0;">')
            // 인라인 스타일로 변환
            .replace(/<h1>/g, '<h1 style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #333;">')
            .replace(/<h2>/g, '<h2 style="font-size: 20px; font-weight: bold; margin: 15px 0; color: #666;">')
            .replace(/<h3>/g, '<h3 style="font-size: 18px; font-weight: bold; margin: 10px 0; color: #666;">')
            .replace(/<strong>/g, '<strong style="font-weight: bold; color: #333;">')
            .replace(/<blockquote>/g, '<blockquote style="border-left: 4px solid #ddd; padding-left: 15px; margin: 15px 0; font-style: italic; color: #666;">')
            // 이미지에 기본 스타일 추가
            .replace(/<img /g, '<img style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" ');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 앱 초기화
const bookReviewAI = new BookReviewAI();