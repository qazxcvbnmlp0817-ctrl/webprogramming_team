# 학과 정보통합 서비스 웹 포털 — Frontend

학과·학부·단과대 정보를 통합 제공하는 SPA 프론트엔드입니다.  
Spring Boot 백엔드(`demo/demo`)와 함께 동작합니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 19 |
| 언어 | TypeScript 6 |
| 빌드 도구 | Vite 8 |
| 스타일 | Tailwind CSS 3 |
| 라우팅 | React Router 7 |
| 차트 | Chart.js 4 + react-chartjs-2 |

---

## 로컬 실행

> 백엔드(Spring Boot)를 먼저 실행한 상태에서 진행합니다.  
> 백엔드 설정은 `docs/DB_SETUP_GUIDE.md` 참고.

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속.

---

## 빌드 (백엔드 정적 리소스로 배포 시)

```bash
npm run build
```

`frontend/dist/` 결과물이 Spring Boot `static/` 폴더로 복사되어 `http://localhost:8080`에서 서빙됩니다.

---

## 주요 페이지

| 경로 | 설명 |
|------|------|
| `/` | 메인 (인트로 애니메이션 → 대학 선택) |
| `/main` | 인기글·최신 공지 대시보드 |
| `/notice`, `/board` | 공지사항·자유게시판 (대댓글 지원) |
| `/calendar` | 학사 일정 달력 |
| `/professor` | 교수 목록·시간표 |
| `/curriculum` | 교육과정 |
| `/admin/school` | School Admin 대시보드 |
| `/admin/dept` | Dept Admin 대시보드 |
| `/admin/faculty` | Faculty Admin 대시보드 |

---

## 역할(Role) 구조

| adminRole | 접근 가능 관리 페이지 |
|-----------|---------------------|
| `SUPER_ADMIN` | 전체 학교 CRUD |
| `SCHOOL_ADMIN` | 소속 학교 관리 (2개 버튼) |
| `DEPT_ADMIN` | 소속 학과 관리 (1개 버튼) |
| `null` | 일반 사용자 |
