# 한국교육컨설팅협회 (KECA) 공식 웹사이트

## 프로젝트 개요

한국교육컨설팅협회(Korea Education Consulting Association, KECA)의 공식 웹사이트입니다. AI와 에듀테크 기반 전문 교육컨설팅 기관의 전문성과 신뢰성을 전달하는 미니멀하고 모던한 단일 페이지 웹사이트입니다.

## 주요 기능

### 📋 구현된 섹션

1. **Hero Section** - 메인 헤드라인 및 CTA
2. **협회 소개** - 기관 개요, 미션/비전, 핵심 가치
3. **조직 현황** - 임원진 소개 및 조직 구성도
4. **주요 사업** - 4대 핵심 전략 사업 (탭 인터페이스)
5. **자격증 안내** - 인공지능(AI)교육전문가 자격 정보
6. **로드맵** - 중장기 발전 계획 (2025-2030)
7. **회원 혜택** - KECA 회원 혜택 안내
8. **문의** - 연락처 및 문의 폼
9. **Footer** - 사이트맵 및 저작권 정보

### ✨ 주요 기능

- ✅ 완전한 반응형 디자인 (모바일/태블릿/데스크톱)
- ✅ 부드러운 스크롤 애니메이션
- ✅ 탭 기반 콘텐츠 전환
- ✅ 숫자 카운터 애니메이션
- ✅ 모바일 햄버거 메뉴
- ✅ 스크롤 시 내비게이션 바 변화
- ✅ Intersection Observer 기반 요소 애니메이션
- ✅ Back to Top 버튼
- ✅ 접근성 최적화 (ARIA 레이블, 키보드 네비게이션)
- ✅ 시맨틱 HTML5 구조
- ✅ SEO 최적화 메타 태그

## 기술 스택

- **HTML5** - 시맨틱 마크업
- **CSS3** - CSS Variables, Flexbox, Grid, Animations
- **JavaScript (ES6+)** - Vanilla JS, Intersection Observer API
- **Google Fonts** - Inter (영문)

## 디자인 시스템

### 색상 팔레트

```css
Primary Color: #2E75B5 (프로페셔널 블루)
Secondary Color: #1F4E78 (다크 블루)
Accent Color: #00D4FF (테크 시안)
Background: #FFFFFF (화이트)
Light Background: #F8FAFB (라이트 그레이)
Text Primary: #1A1A1A (다크 그레이)
Text Secondary: #6B7280 (미디엄 그레이)
```

### 타이포그래피

- **영문 폰트**: Inter (Google Fonts)
- **한글 폰트**: Pretendard, Apple SD Gothic Neo (시스템 폰트)
- **헤딩**: 700 weight
- **본문**: 400 weight

## 파일 구조

```
KECA/
├── index.html          # 메인 HTML 파일
├── styles.css          # 전체 스타일시트
├── script.js           # JavaScript 기능
└── README.md           # 프로젝트 문서
```

## 설치 및 실행

### 1. 파일 다운로드

프로젝트 파일을 다운로드하거나 클론합니다.

```bash
git clone [repository-url]
cd KECA
```

### 2. 로컬 서버 실행

#### 방법 1: Python 내장 서버 (Python 3.x)

```bash
python -m http.server 8000
```

#### 방법 2: Node.js http-server

```bash
npx http-server -p 8000
```

#### 방법 3: VS Code Live Server

VS Code에서 `index.html`을 열고 "Go Live" 버튼을 클릭합니다.

### 3. 브라우저에서 열기

브라우저에서 `http://localhost:8000` 또는 직접 `index.html` 파일을 엽니다.

## 브라우저 호환성

- ✅ Chrome (최신)
- ✅ Firefox (최신)
- ✅ Safari (최신)
- ✅ Edge (최신)
- ✅ 모바일 브라우저 (iOS Safari, Chrome Mobile)

## 반응형 브레이크포인트

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 성능 최적화

- CSS Variables 사용으로 일관된 디자인 시스템
- Intersection Observer를 활용한 효율적인 스크롤 애니메이션
- Debounce를 통한 스크롤 이벤트 최적화
- Lazy Loading 준비 (이미지 추가 시)
- 최소한의 외부 의존성 (Google Fonts만 사용)

## 접근성 (Accessibility)

- 시맨틱 HTML5 태그 사용
- ARIA 레이블 자동 추가
- 키보드 네비게이션 지원
- "본문으로 건너뛰기" 링크
- 충분한 색상 대비 (WCAG 2.1 AA 준수)
- 포커스 인디케이터
- 스크린 리더 친화적 구조

## 커스터마이징 가이드

### 색상 변경

`styles.css` 파일의 CSS Variables를 수정하세요:

```css
:root {
    --primary-color: #2E75B5;
    --secondary-color: #1F4E78;
    --accent-color: #00D4FF;
    /* ... */
}
```

### 폰트 변경

`index.html`의 Google Fonts 링크를 수정하고, `styles.css`의 폰트 변수를 업데이트하세요:

```css
:root {
    --font-primary: 'YourFont', sans-serif;
    --font-english: 'YourEnglishFont', sans-serif;
}
```

### 콘텐츠 수정

`index.html` 파일에서 각 섹션의 텍스트를 직접 수정하세요. 주석으로 섹션이 명확하게 구분되어 있습니다.

### 연락처 정보 업데이트

Contact 섹션에서 주소, 전화번호, 이메일을 실제 정보로 교체하세요:

```html
<p>서울특별시 강남구<br>(상세 주소 추가 예정)</p>
<p>02-XXXX-XXXX<br>(전화번호 추가 예정)</p>
<p>info@keca.or.kr<br>(이메일 추가 예정)</p>
```

## 향후 개선 사항

### 추천 추가 기능

- [ ] 다크 모드 토글
- [ ] 언어 전환 (한/영)
- [ ] 뉴스/공지사항 섹션
- [ ] 갤러리/사진첩
- [ ] 동영상 임베드
- [ ] 블로그 통합
- [ ] 회원 가입/로그인 시스템
- [ ] 관리자 대시보드
- [ ] 실제 폼 제출 백엔드 연동

### 성능 개선

- [ ] 이미지 최적화 (WebP, lazy loading)
- [ ] Critical CSS 인라인
- [ ] JavaScript 번들 최적화
- [ ] Service Worker (PWA)
- [ ] CDN 연동

### SEO 최적화

- [ ] sitemap.xml 생성
- [ ] robots.txt 추가
- [ ] Open Graph 이미지
- [ ] 구조화된 데이터 (JSON-LD)
- [ ] Google Analytics 통합

## 배포

### GitHub Pages

```bash
# gh-pages 브랜치 생성 및 배포
git checkout -b gh-pages
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

Settings > Pages에서 gh-pages 브랜치를 소스로 선택하세요.

### Netlify

1. Netlify에 로그인
2. "New site from Git" 클릭
3. 저장소 연결
4. 빌드 설정 (static site)
5. Deploy

### Vercel

```bash
npm install -g vercel
vercel
```

## 라이센스

© 2026 KECA. All rights reserved.

## 문의

- **이메일**: info@keca.or.kr
- **전화**: 02-XXXX-XXXX
- **주소**: 서울특별시 강남구

---

**Made with ❤️ for Korea Education Consulting Association**
