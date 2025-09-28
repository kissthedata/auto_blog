# 책 서평 AI

사진으로 책 서평을 자동 생성하는 웹 애플리케이션입니다.

## 설정 방법

1. **설정 파일 생성**
   ```bash
   cp config.js.example config.js
   ```

2. **API 키 설정**
   `config.js` 파일을 열고 다음 API 키들을 입력하세요:

   - **Google Vision API 키**: 이미지 OCR 처리용
   - **OpenAI API 키**: AI 서평 생성용
   - **Supabase URL & Key**: 데이터베이스 연동용
   - **네이버 검색 API**: 책 정보 검색용
     - [네이버 개발자 센터](https://developers.naver.com/)에서 애플리케이션 등록
     - 검색 API 선택 후 Client ID, Client Secret 발급

3. **의존성 설치**
   ```bash
   npm install
   ```

4. **서버 실행 (선택사항)**
   네이버 API를 사용하려면 백엔드 서버가 필요합니다:
   ```bash
   # server.js.example을 server.js로 복사
   cp server.js.example server.js

   # 서버 의존성 설치
   npm install express cors node-fetch@2

   # 서버 실행
   node server.js
   ```

## 보안 주의사항

- `config.js` 파일은 절대 Git에 커밋하지 마세요
- API 키가 노출되면 즉시 재발급하세요
- `.env` 파일도 Git에 커밋하지 마세요

## 사용 방법

1. 책 제목 입력 및 정보 검색
2. 책 사진 업로드 (최대 10장)
3. 서평 스타일 선택
4. AI 서평 생성
5. 생성된 서평 복사 및 활용

## 기능

- OCR을 통한 책 텍스트 추출
- AI 기반 서평 자동 생성
- 다양한 역할별 서평 스타일
- 이미지 압축 및 최적화
- 개별 이미지 복사 기능