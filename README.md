# 학과 포털 — Department Info Integration Site

학과·학부·대학 정보를 한 곳에서 확인할 수 있는 통합 포털 웹 애플리케이션입니다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Backend | Spring Boot 4.0.6, Java 17, Maven |
| Database | Oracle 23ai Free (로컬, `freepdb1`) |
| ORM | Spring Data JPA / Hibernate (`ddl-auto=update`) |
| 암호화 | spring-security-crypto (BCryptPasswordEncoder) |
| Frontend | Vite 8 + React 18 + TypeScript 5 |
| 스타일 | Tailwind CSS 3 |
| 라우팅 | react-router-dom 6 |

---

## 프로젝트 구조

```
webprogramming_team-main/
├── frontend/                        # React SPA (Vite)
│   └── src/
│       ├── App.tsx                  # 라우터 정의
│       ├── context/DeptContext.tsx  # 전역 학과 선택 상태
│       ├── api/                     # fetch 함수 모음
│       │   ├── auth.ts
│       │   ├── notices.ts
│       │   ├── posts.ts
│       │   ├── schedules.ts
│       │   └── universities.ts
│       ├── components/
│       │   ├── Navbar.tsx
│       │   ├── Footer.tsx
│       │   ├── FilterTabs.tsx
│       │   ├── FeaturedCard.tsx
│       │   ├── MiniCalendar.tsx
│       │   ├── Sidebar.tsx
│       │   └── Pagination.tsx
│       └── pages/
│           ├── UniversityListPage.tsx      # 대학 목록
│           ├── UniversityShowPage.tsx      # 단과대학 목록
│           ├── SchoolDepartmentsPage.tsx   # 학교 학과 목록
│           ├── FacultyPage.tsx             # 학부 메인
│           ├── MainPage.tsx                # 학과 메인
│           ├── NoticePage.tsx              # 학과 공지
│           ├── NoticeWritePage.tsx         # 학과 공지 작성
│           ├── BoardPage.tsx               # 학과 게시판
│           ├── WritePostPage.tsx           # 학과 게시글 작성
│           ├── SchedulePage.tsx            # 학과 일정
│           ├── DepartmentPage.tsx          # 학과 정보
│           ├── FacultyNoticePage.tsx       # 학부 공지
│           ├── FacultyNoticeWritePage.tsx  # 학부 공지 작성
│           ├── FacultyBoardPage.tsx        # 학부 게시판
│           ├── FacultySchedulePage.tsx     # 학부 일정
│           ├── SchoolNoticePage.tsx        # 단과대 공지
│           ├── SchoolNoticeWritePage.tsx   # 단과대 공지 작성
│           ├── SchoolBoardPage.tsx         # 단과대 게시판
│           ├── SchoolWritePostPage.tsx     # 단과대 게시글 작성
│           ├── SchoolSchedulePage.tsx      # 단과대 일정
│           ├── SchoolInfoPage.tsx          # 단과대 정보
│           ├── LoginPage.tsx               # 로그인
│           ├── SignupPage.tsx              # 회원가입 (6단계)
│           ├── MyPage.tsx                  # 마이페이지
│           ├── FindIdPage.tsx              # 아이디 찾기
│           └── FindPasswordPage.tsx        # 비밀번호 찾기
│
└── demo/demo/                       # Spring Boot
    └── src/main/java/com/example/demo/
        ├── entity/                  # JPA 엔티티 (10개 테이블)
        │   ├── User.java            → APP_USERS
        │   ├── Notice.java          → NOTICES
        │   ├── Post.java            → POSTS
        │   ├── Schedule.java        → SCHEDULES
        │   ├── University.java      → UNIVERSITIES
        │   ├── CollegeSchool.java   → COLLEGE_SCHOOLS
        │   ├── FacultyGroup.java    → FACULTY_GROUPS
        │   ├── Department.java      → DEPTS
        │   ├── Professor.java       → PROFESSORS
        │   └── CurriculumItem.java  → CURRICULUM_ITEMS
        ├── repository/              # Spring Data JPA
        ├── service/
        │   ├── AuthService.java     # 로그인·회원가입·아이디/비번 찾기
        │   ├── NoticeService.java
        │   ├── PostService.java
        │   ├── ScheduleService.java
        │   └── UniversityService.java
        ├── controller/
        │   ├── AuthController.java
        │   ├── NoticeController.java
        │   ├── BoardController.java
        │   ├── ScheduleController.java
        │   ├── MainController.java
        │   ├── SchoolController.java
        │   ├── UniversityController.java
        │   ├── DepartmentController.java
        │   └── SpaController.java   # React SPA 폴백
        ├── dto/                     # 요청/응답 DTO
        └── util/
            ├── DataInitializer.java # 최초 실행 시 시드 데이터 삽입
            └── DummyDataHelper.java # DB 비어 있을 때 폴백 더미 데이터
```

---

## DB 테이블 구조

```
UNIVERSITIES (대학)
  └── COLLEGE_SCHOOLS (단과대학)
        └── FACULTY_GROUPS (학부)
              └── DEPTS (학과)
                    ├── PROFESSORS (교수)
                    └── CURRICULUM_ITEMS (교육과정)

APP_USERS (회원)
NOTICES   (공지사항) — scopeType: dept | faculty | univ
POSTS     (게시글)   — scopeType: dept | faculty | univ
SCHEDULES (일정)     — scopeType: dept | faculty | univ
```

### 시드 데이터 (DataInitializer)

최초 실행 시 UNIVERSITIES 테이블이 비어 있으면 자동 삽입됩니다.

| 대학 | 단과대학 | 학부 | 학과 |
|------|---------|------|------|
| 목포대학교 | 6개 | 7개 | 18개 |
| 순천대학교 | 2개 | 2개 | 4개 |

각 학과마다 교수 3명 + 교육과정 6개 자동 생성.

---

## REST API 목록

### 인증 (`/api/auth`)
| Method | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/signup` | 회원가입 |
| GET | `/api/auth/check-id?username=` | 아이디 중복 확인 |
| POST | `/api/auth/find-id` | 아이디 찾기 |
| POST | `/api/auth/find-password` | 비밀번호 찾기 (임시 비번 발급) |

### 대학 구조
| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/universities` | 전체 대학 목록 (계층 포함) |
| GET | `/api/universities/{id}` | 특정 대학 상세 |
| GET | `/api/departments/{id}` | 학과 상세 (교수·교육과정 포함) |

### 학과 (dept)
| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/main?deptId=` | 학과 메인 (공지·게시글·일정 요약) |
| GET | `/api/notices?deptId=` | 학과 공지 목록 |
| POST | `/api/notices` | 학과 공지 작성 |
| GET | `/api/posts?deptId=` | 학과 게시글 목록 |
| POST | `/api/posts` | 학과 게시글 작성 |
| GET | `/api/schedules?deptId=` | 학과 일정 |

### 학부 (faculty)
| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/faculty/main?facultyId=` | 학부 메인 요약 |
| GET | `/api/faculty/notices?facultyId=` | 학부 공지 |
| POST | `/api/faculty/notices` | 학부 공지 작성 |
| GET | `/api/faculty/posts?facultyId=` | 학부 게시글 |
| POST | `/api/faculty/posts` | 학부 게시글 작성 |
| GET | `/api/faculty/schedules?facultyId=` | 학부 일정 |

### 단과대학 (school)
| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/school/notices?schoolId=` | 단과대 공지 |
| POST | `/api/univ/notices` | 단과대 공지 작성 |
| GET | `/api/school/posts?schoolId=` | 단과대 게시글 |
| POST | `/api/univ/posts` | 단과대 게시글 작성 |
| GET | `/api/school/schedules?schoolId=` | 단과대 일정 |
| GET | `/api/school/info?schoolId=` | 단과대 정보 |

---

## 실행 방법

### 사전 조건
- Java 17
- Oracle 23ai Free 로컬 설치 및 `dept_user` 계정 설정
- Node.js 18+

### 1. DB 설정

Oracle SQL*Plus 또는 SQL Developer에서 실행:
```sql
CREATE USER dept_user IDENTIFIED BY dept1234;
GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE, UNLIMITED TABLESPACE TO dept_user;
```

### 2. 시크릿 설정 파일 생성 (git에 절대 커밋 금지)

`demo/demo/src/main/resources/application-secret.properties` 파일 생성:
```properties
spring.datasource.url=jdbc:oracle:thin:@//localhost:1521/freepdb1
spring.datasource.username=dept_user
spring.datasource.password=dept1234
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver
spring.jpa.database-platform=org.hibernate.dialect.OracleDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

### 3. 프론트엔드 빌드

```bash
cd frontend
npm install
npm run build
```

빌드 결과물은 자동으로 `demo/demo/src/main/resources/static/`에 배포됩니다.

### 4. Spring Boot 실행

```bash
cd demo/demo
./mvnw spring-boot:run
```

→ `http://localhost:8080` 접속

---

## 주요 구현 사항

- **BCrypt 암호화**: 회원가입 시 비밀번호 BCrypt 해시 저장, 로그인 시 검증
- **회원 유형**: `student`(학생) / `professor`(교수) / `staff`(직원) / `admin`(관리자)
- **공개 범위**: 게시글 작성 시 `all`(전체) / `student`(학생만) / `professor`(교수만) 선택 가능
- **학년 필터**: 학생 게시글에 대상 학년(1~4학년) 태그 설정 가능
- **DummyDataHelper**: DB에 공지·게시글·일정이 없을 경우 더미 데이터로 폴백
- **SPA 라우팅**: SpaController가 모든 프론트엔드 경로를 `index.html`로 포워딩

---

## 주의사항

- `application-secret.properties`는 `.gitignore`에 등록되어 있으며 **절대 커밋하면 안 됩니다.**
- 테이블은 `ddl-auto=update`로 자동 생성·수정됩니다. Oracle `freepdb1` PDB가 실행 중이어야 합니다.
