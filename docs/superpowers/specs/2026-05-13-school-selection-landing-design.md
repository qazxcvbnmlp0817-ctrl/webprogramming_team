# 학교 선택 랜딩 페이지 — 설계 문서

**작성일:** 2026-05-13
**작성자:** Jinsung
**상태:** 승인됨

---

## 1. 개요

### 목적
현재 `/`(메인 페이지)에 바로 접근하는 구조에서, 단과대학→학부→학과 계층을 한 페이지에서 선택한 뒤 학과 포털로 진입하는 구조로 변경한다.

### 변경 전후 흐름
```
변경 전: GET / → 컴퓨터공학과 포털 (하드코딩)

변경 후: GET /schools → 학교·학부·학과 선택(단일 페이지)
              ↓ 학과 클릭
         POST /schools/select → 세션 저장 → redirect GET /
              ↓
         GET / → 선택된 학과 포털 (동적)
```

---

## 2. 라우팅

| URL | HTTP | 컨트롤러 | 역할 |
|---|---|---|---|
| `/schools` | GET | `SchoolController` | 전체 계층 선택 페이지 |
| `/schools/select` | POST | `SchoolController` | 학과 세션 저장 → redirect `/` |
| `/faculty/{id}` | GET | `SchoolController` | 학부 페이지 (플레이스홀더) |
| `/` | GET | `MainController` | 학과 포털 (세션 없으면 `/schools` 리다이렉트) |

---

## 3. 데이터 계층

```
단과대학 (SchoolDto)
  └─ 학부 (FacultyDto)
       └─ 학과 (DeptSelectionDto)
```

### DTO 정의

```java
// SchoolDto
Long id, String name, String description, List<FacultyDto> faculties

// FacultyDto
Long id, String name, Long schoolId, List<DeptSelectionDto> depts

// DeptSelectionDto
Long id, String name, Long facultyId
```

### 더미 데이터 (목포대학교 실제 구조)

| 단과대학 | 학부 | 학과 |
|---|---|---|
| 공과대학 | 정보통신공학부 | 컴퓨터공학과, 전기전자공학과, 정보통신공학과 |
| 공과대학 | 기계시스템공학부 | 기계공학과, 토목환경공학과 |
| 인문대학 | 인문학부 | 국어국문학과, 영어영문학과, 사학과 |
| 사회과학대학 | 사회과학부 | 행정학과, 경제학과, 사회학과 |
| 자연과학대학 | 자연과학부 | 수학과, 물리학과, 화학과 |
| 사범대학 | 사범학부 | 교육학과, 수학교육과 |
| 해양수산대학 | 해양수산부 | 해양시스템공학과, 수산생명과학과 |

---

## 4. 세션 설계

| 세션 키 | 값 | 저장 시점 |
|---|---|---|
| `selectedDeptId` | Long | POST /schools/select |
| `selectedDeptName` | String | POST /schools/select |
| `selectedSchoolName` | String | POST /schools/select |

**세션 만료 처리:**
- `GET /` 진입 시 `selectedDeptName` 없으면 → `redirect:/schools`

**DB 연동 전환:**
```java
// 더미 (현재)
List<SchoolDto> schools = List.of(...);

// DB 연동 후 (한 줄 교체)
List<SchoolDto> schools = schoolService.findAll();
```

---

## 5. UI 설계

### 디자인 원칙
- 기존 메인 페이지와 동일한 흑백 Tailwind CSS 스타일 유지
- `bg-black text-white` 히어로, `border-2 border-black` 카드, `hover:bg-black hover:text-white` 인터랙션

### `/schools` 페이지 레이아웃 (문서형)

```
[NAV] 학과정보통합서비스                          [로그인]

┌─ 히어로 (bg-black) ─────────────────────────────────┐
│           학부·학과 안내                              │
│       원하는 학과를 선택하세요                        │
└──────────────────────────────────────────────────────┘

▌ 공과대학                          ← 단과대학 헤더 (border-b-2 border-black)
  ├─ 정보통신공학부          →      ← 학부명 (클릭 → /faculty/{id})
  │    컴퓨터공학과  전기전자공학과  ← 학과 (클릭 → POST /schools/select)
  ├─ 기계시스템공학부        →
  │    기계공학과  토목환경공학과

▌ 인문대학
  ├─ 인문학부                →
  │    국어국문학과  영어영문학과  사학과

... (나머지 단과대학 동일 구조)
```

- 학과는 `<button type="submit">` 폼으로 POST 전송 (deptId, deptName, schoolName)
- 학부명은 `<a href="/faculty/{id}">` 링크
- 단과대학이 추가되면 `th:each` 루프가 자동으로 항목 추가

### `/faculty/{id}` 페이지 (플레이스홀더)

```
[NAV]
┌─ 히어로 ────────────────────────────────────────────┐
│       정보통신공학부                                  │
│   이 페이지는 준비 중입니다                           │
└──────────────────────────────────────────────────────┘
← 학과 목록으로 돌아가기 (/schools)
```

### 메인 페이지 (`/`) 수정

- 히어로 `컴퓨터공학과 정보 포털` → `${selectedDeptName} 정보 포털` (세션값)
- 네비게이션에 `학과 변경` 링크 추가 (`href="/schools"`)

---

## 6. 신규·수정 파일 목록

### 신규 생성

```
controller/SchoolController.java
dto/SchoolDto.java
dto/FacultyDto.java
dto/DeptSelectionDto.java
templates/school/index.html
templates/school/faculty-placeholder.html
```

### 수정

```
controller/MainController.java   ← 세션 확인 + 리다이렉트 로직 추가
templates/main/index.html        ← 히어로 학과명 동적화, 학과 변경 링크 추가
```

---

## 7. 테스트

```
test/controller/SchoolControllerTest.java
  - GET /schools → 200 OK, 모델에 schools 포함
  - POST /schools/select → 세션에 selectedDeptName 저장
  - POST /schools/select → redirect GET /

test/controller/MainControllerTest.java (수정)
  - 세션 없이 GET / → redirect /schools
  - 세션 있을 때 GET / → 200 OK
```

---

## 8. DB 연동 확장 경로

현재: `SchoolController`에서 `List.of(...)` 하드코딩
전환: `SchoolService` 인터페이스 주입 → `findAll()` 한 줄 교체

```java
// 전환 시 컨트롤러 변경 최소화 예시
@Autowired SchoolService schoolService;  // 추가
model.addAttribute("schools", schoolService.findAll());  // List.of() 교체
```
