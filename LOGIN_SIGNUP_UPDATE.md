!! 학과정보통합서비스 — 로그인/회원가입 기능 구현 정리 !!



\- 구현 범위



\#프론트엔드



\* React

\* TypeScript

\* Tailwind CSS



\---



\- 구현 완료 사항



1\. 로그인 페이지 (`LoginPage.tsx`)



\- 구현 기능



\* 회원 유형 선택



&#x20; \* 학생

&#x20; \* 교수·조교

&#x20; \* 관리자

\* 아이디 / 비밀번호 입력

\* 비밀번호 보기/숨기기 토글

\* 아이디 저장 체크박스

\* 로그인 실패 에러 메시지 출력

\* 로그인 성공 시 `/universities` 이동

\* Spring Boot API(`/api/auth/login`) 연동

\* 로그인 상태 `sessionStorage` 저장



2\. 회원가입 페이지 (`SignupPage.tsx`)



6단계 멀티 스텝 회원가입 구현



STEP 1



이용약관 동의



\* 전체 동의 기능 포함



STEP 2



대학교 선택



\* 국립목포대학교

\* 국립순천대학교



STEP 3



회원 유형 선택



\* 학생

\* 교수·조교

\* 관리자



STEP 4



본인 인증



\* 3분 카운트다운 타이머 구현



STEP 5



회원 정보 입력



\* 아이디 중복 확인

\* 비밀번호 확인

\* 단과대/학과 드롭다운



STEP 6



가입 완료



\* 로그인 페이지 이동 버튼 구현



3\. 마이페이지 (`MyPage.tsx`)



\- 구현 기능



\* 프로필 카드



&#x20; \* 이름

&#x20; \* 회원유형

&#x20; \* 소속 대학교

&#x20; \* 단과대

&#x20; \* 학과

&#x20; \* 학번

\* 내 정보 수정

\* 비밀번호 변경

\* 내가 작성한 게시글

\* 내가 작성한 댓글

\* 대학교 메인 이동 버튼

\* 로그아웃 버튼



4\. 인증 API (`auth.ts`)



\- 구현 API



\* `loginApi`



&#x20; \* `/api/auth/login`

\* `signupApi`



&#x20; \* `/api/auth/signup`

\* `checkIdApi`



&#x20; \* `/api/auth/check-id`



\- 수정한 주요 파일



Navbar 수정 (`Navbar.tsx`)



\- 변경 사항



\* 로그인 상태에 따른 UI 변경



&#x20; \* 비로그인: 로그인 버튼

&#x20; \* 로그인 상태: 마이페이지 / 로그아웃 버튼

\* `sessionStorage` 기반 로그인 상태 관리

\* `loginChanged` 커스텀 이벤트 적용

\* 로그아웃 시 `/login` 이동 처리



\-  App.tsx 수정



추가 라우트



\* `/signup`

\* `/mypage`



추가 리다이렉트



\* `/admin/dashboard`

\* `/department/student`

\* `/department/professor`



\- 백엔드 구현 사항 (Spring Boot)



DTO 추가



로그인 DTO



`LoginRequestDto.java`



\* username

\* password

\* memberType



회원가입 DTO



`SignupRequestDto.java`



\* username

\* password

\* name

\* memberType

\* universityId

\* college

\* department

\* studentId



아이디 찾기 DTO



`FindIdRequestDto.java`



\* name

\* phone



비밀번호 찾기 DTO



`FindPasswordRequestDto.java`



\* username

\* name

\* phone



\- AuthController 구현 사항



구현 API



\* `POST /api/auth/login`

\* `POST /api/auth/signup`

\* `GET /api/auth/check-id`

\* `POST /api/auth/find-id`

\* `POST /api/auth/find-password`



\- 미구현 사항 (추후 작업 예정)



백엔드



\* `User Entity`

\* `UserRepository`

\* `AuthService`

\* 실제 DB 연동

\* BCrypt 비밀번호 암호화

\* SMS / 이메일 인증 API



프론트엔드



\* `FindIdPage.tsx`

\* `FindPasswordPage.tsx`



\- 실행 방법



개발 환경 (5173 포트)



Spring Boot 실행



```bash

cd webprogramming\_team-main/demo/demo

.\\mvnw spring-boot:run

```



React 실행



```bash

cd webprogramming\_team-main/frontend

npm run dev

```



실행 주소



```text

http://localhost:5173

```



\- 운영 환경 (8080 포트)



프론트 빌드



```bash

cd webprogramming\_team-main/frontend

npm run build

```



Spring Boot 실행



```bash

cd ../demo/demo

.\\mvnw spring-boot:run

```



실행 주소



```text

http://localhost:8080

```



\*\* 현재 구현 상태 \*\*



| 페이지     | URL              | 상태    |

| ------- | ---------------- | ----- |

| 로그인     | `/login`         | ✅ 완료  |

| 회원가입    | `/signup`        | ✅ 완료  |

| 마이페이지   | `/mypage`        | ✅ 완료  |

| 대학교 목록  | `/universities`  | ✅ 완료  |

| 아이디 찾기  | `/find-id`       | ❌ 미완료 |

| 비밀번호 찾기 | `/find-password` | ❌ 미완료 |



\---



!! 참고 사항 !!



현재 로그인/회원가입 기능은 전체 구현 완료 전 단계이며,

추후 DB 연동 및 인증 기능 추가 후 최종본으로 업데이트 예정입니다.



피드백 및 수정 사항 있으면 말씀 부탁드립니다. 감사합니다!

