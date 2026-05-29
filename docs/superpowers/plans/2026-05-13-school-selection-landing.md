# 학교 선택 랜딩 페이지 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** `/schools` 단일 페이지에서 단과대학→학부→학과 계층을 문서형으로 표시하고, 학과 클릭 시 세션에 저장 후 기존 메인 학과 포털(`/`)로 이동한다.

**Architecture:** `SchoolController`가 `/schools`(GET)와 `/schools/select`(POST)를 담당하며, 선택된 학과를 `HttpSession`에 저장한다. `MainController`는 세션 값이 없으면 `/schools`로 리다이렉트하고, 있으면 학과명을 모델에 담아 포털을 렌더링한다. 더미 데이터는 컨트롤러 내 `List.of(...)`로 하드코딩하며 DB 연동 시 Service 주입 한 줄로 교체 가능하다.

**Tech Stack:** Spring Boot 4.x, Thymeleaf, Tailwind CSS (CDN), Font Awesome (CDN), JUnit 5, MockMvc

---

## 파일 맵

| 상태 | 파일 | 역할 |
|---|---|---|
| 신규 | `demo/demo/src/main/java/com/example/demo/dto/DeptSelectionDto.java` | 학과 선택용 DTO |
| 신규 | `demo/demo/src/main/java/com/example/demo/dto/FacultyDto.java` | 학부 DTO (DeptSelectionDto 리스트 포함) |
| 신규 | `demo/demo/src/main/java/com/example/demo/dto/SchoolDto.java` | 단과대학 DTO (FacultyDto 리스트 포함) |
| 신규 | `demo/demo/src/main/java/com/example/demo/controller/SchoolController.java` | /schools, /schools/select, /faculty/{id} 처리 |
| 신규 | `demo/demo/src/main/resources/templates/school/index.html` | 학교·학부·학과 문서형 선택 페이지 |
| 신규 | `demo/demo/src/main/resources/templates/school/faculty-placeholder.html` | 학부 페이지 플레이스홀더 |
| 신규 | `demo/demo/src/test/java/com/example/demo/controller/SchoolControllerTest.java` | SchoolController 단위 테스트 |
| 수정 | `demo/demo/src/main/java/com/example/demo/controller/MainController.java` | 세션 확인 + 리다이렉트 로직 추가 |
| 수정 | `demo/demo/src/main/resources/templates/main/index.html` | 히어로 학과명 동적화 + 학과 변경 링크 |
| 수정 | `demo/demo/src/test/java/com/example/demo/controller/MainControllerTest.java` | 세션 있을 때 200 OK / 없을 때 리다이렉트 케이스 추가 |

---

## Task 1: DTO 클래스 3개 생성

**Files:**
- Create: `demo/demo/src/main/java/com/example/demo/dto/DeptSelectionDto.java`
- Create: `demo/demo/src/main/java/com/example/demo/dto/FacultyDto.java`
- Create: `demo/demo/src/main/java/com/example/demo/dto/SchoolDto.java`

- [x] **Step 1: DeptSelectionDto 생성**

```java
// demo/demo/src/main/java/com/example/demo/dto/DeptSelectionDto.java
package com.example.demo.dto;

public class DeptSelectionDto {
    private Long id;
    private String name;
    private Long facultyId;

    public DeptSelectionDto(Long id, String name, Long facultyId) {
        this.id = id;
        this.name = name;
        this.facultyId = facultyId;
    }

    public Long getId()      { return id; }
    public String getName()  { return name; }
    public Long getFacultyId() { return facultyId; }
}
```

- [x] **Step 2: FacultyDto 생성**

```java
// demo/demo/src/main/java/com/example/demo/dto/FacultyDto.java
package com.example.demo.dto;

import java.util.List;

public class FacultyDto {
    private Long id;
    private String name;
    private Long schoolId;
    private List<DeptSelectionDto> depts;

    public FacultyDto(Long id, String name, Long schoolId, List<DeptSelectionDto> depts) {
        this.id = id;
        this.name = name;
        this.schoolId = schoolId;
        this.depts = depts;
    }

    public Long getId()                      { return id; }
    public String getName()                  { return name; }
    public Long getSchoolId()                { return schoolId; }
    public List<DeptSelectionDto> getDepts() { return depts; }
}
```

- [x] **Step 3: SchoolDto 생성**

```java
// demo/demo/src/main/java/com/example/demo/dto/SchoolDto.java
package com.example.demo.dto;

import java.util.List;

public class SchoolDto {
    private Long id;
    private String name;
    private String description;
    private List<FacultyDto> faculties;

    public SchoolDto(Long id, String name, String description, List<FacultyDto> faculties) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.faculties = faculties;
    }

    public Long getId()                   { return id; }
    public String getName()               { return name; }
    public String getDescription()        { return description; }
    public List<FacultyDto> getFaculties() { return faculties; }
}
```

- [x] **Step 4: 컴파일 확인**

```
cd demo\demo
mvnw.cmd compile
```

Expected: `BUILD SUCCESS`

- [x] **Step 5: 커밋**

```bash
git add demo/demo/src/main/java/com/example/demo/dto/DeptSelectionDto.java
git add demo/demo/src/main/java/com/example/demo/dto/FacultyDto.java
git add demo/demo/src/main/java/com/example/demo/dto/SchoolDto.java
git commit -m "feat: add SchoolDto, FacultyDto, DeptSelectionDto"
```

---

## Task 2: SchoolControllerTest 작성 (실패 확인)

**Files:**
- Create: `demo/demo/src/test/java/com/example/demo/controller/SchoolControllerTest.java`

- [x] **Step 1: 테스트 파일 작성**

```java
// demo/demo/src/test/java/com/example/demo/controller/SchoolControllerTest.java
package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SchoolController.class)
class SchoolControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    @DisplayName("GET /schools → 200 OK, 모델에 schools 포함")
    void showSchools_returns200_withSchoolsInModel() throws Exception {
        mockMvc.perform(get("/schools"))
                .andExpect(status().isOk())
                .andExpect(view().name("school/index"))
                .andExpect(model().attributeExists("schools"));
    }

    @Test
    @DisplayName("POST /schools/select → 세션에 학과명·학교명·학과ID 저장 후 / 리다이렉트")
    void selectDept_storesSessionAttributes_andRedirectsToRoot() throws Exception {
        MockHttpSession session = new MockHttpSession();

        mockMvc.perform(post("/schools/select")
                        .param("deptId", "1")
                        .param("deptName", "컴퓨터공학과")
                        .param("schoolName", "공과대학")
                        .session(session))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/"));

        assertThat(session.getAttribute("selectedDeptName")).isEqualTo("컴퓨터공학과");
        assertThat(session.getAttribute("selectedSchoolName")).isEqualTo("공과대학");
        assertThat(session.getAttribute("selectedDeptId")).isEqualTo(1L);
    }

    @Test
    @DisplayName("GET /faculty/{id} → 200 OK, school/faculty-placeholder 뷰 반환")
    void facultyPlaceholder_returns200() throws Exception {
        mockMvc.perform(get("/faculty/1"))
                .andExpect(status().isOk())
                .andExpect(view().name("school/faculty-placeholder"));
    }
}
```

- [x] **Step 2: 테스트 실행 → 실패 확인**

```
cd demo\demo
mvnw.cmd test -Dtest=SchoolControllerTest
```

Expected: `BUILD FAILURE` — `SchoolController` 클래스가 없어서 실패.

> **참고:** POST 테스트가 403 Forbidden으로 실패하면 Spring Security CSRF가 활성화된 것이다.
> 그 경우 `.post(...)` 뒤에 `.with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())` 를 추가한다.

---

## Task 3: SchoolController 구현 + 스텁 템플릿 생성

**Files:**
- Create: `demo/demo/src/main/java/com/example/demo/controller/SchoolController.java`
- Create: `demo/demo/src/main/resources/templates/school/index.html` (스텁)
- Create: `demo/demo/src/main/resources/templates/school/faculty-placeholder.html` (스텁)

- [x] **Step 1: SchoolController 작성**

```java
// demo/demo/src/main/java/com/example/demo/controller/SchoolController.java
package com.example.demo.controller;

import com.example.demo.dto.DeptSelectionDto;
import com.example.demo.dto.FacultyDto;
import com.example.demo.dto.SchoolDto;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

/**
 * 학교·학부·학과 선택 컨트롤러
 * - GET  /schools          : 전체 계층 선택 페이지
 * - POST /schools/select   : 학과 세션 저장 → redirect /
 * - GET  /faculty/{id}     : 학부 페이지 플레이스홀더
 * TODO: [팀원] getDummySchools()를 schoolService.findAll()로 교체
 */
@Controller
public class SchoolController {

    private List<SchoolDto> getDummySchools() {
        return List.of(
            new SchoolDto(1L, "공과대학", "공학 분야 전문 인재 양성", List.of(
                new FacultyDto(1L, "정보통신공학부", 1L, List.of(
                    new DeptSelectionDto(1L, "컴퓨터공학과", 1L),
                    new DeptSelectionDto(2L, "전기전자공학과", 1L),
                    new DeptSelectionDto(3L, "정보통신공학과", 1L)
                )),
                new FacultyDto(2L, "기계시스템공학부", 1L, List.of(
                    new DeptSelectionDto(4L, "기계공학과", 2L),
                    new DeptSelectionDto(5L, "토목환경공학과", 2L)
                ))
            )),
            new SchoolDto(2L, "인문대학", "인문학적 소양과 창의적 사고 함양", List.of(
                new FacultyDto(3L, "인문학부", 2L, List.of(
                    new DeptSelectionDto(6L, "국어국문학과", 3L),
                    new DeptSelectionDto(7L, "영어영문학과", 3L),
                    new DeptSelectionDto(8L, "사학과", 3L)
                ))
            )),
            new SchoolDto(3L, "사회과학대학", "사회 현상 분석과 문제 해결 능력 배양", List.of(
                new FacultyDto(4L, "사회과학부", 3L, List.of(
                    new DeptSelectionDto(9L,  "행정학과", 4L),
                    new DeptSelectionDto(10L, "경제학과", 4L),
                    new DeptSelectionDto(11L, "사회학과", 4L)
                ))
            )),
            new SchoolDto(4L, "자연과학대학", "기초과학 연구와 응용과학 발전 선도", List.of(
                new FacultyDto(5L, "자연과학부", 4L, List.of(
                    new DeptSelectionDto(12L, "수학과", 5L),
                    new DeptSelectionDto(13L, "물리학과", 5L),
                    new DeptSelectionDto(14L, "화학과", 5L)
                ))
            )),
            new SchoolDto(5L, "사범대학", "미래 교육을 이끌 전문 교사 양성", List.of(
                new FacultyDto(6L, "사범학부", 5L, List.of(
                    new DeptSelectionDto(15L, "교육학과", 6L),
                    new DeptSelectionDto(16L, "수학교육과", 6L)
                ))
            )),
            new SchoolDto(6L, "해양수산대학", "해양 자원 개발과 수산 분야 전문 인재 육성", List.of(
                new FacultyDto(7L, "해양수산부", 6L, List.of(
                    new DeptSelectionDto(17L, "해양시스템공학과", 7L),
                    new DeptSelectionDto(18L, "수산생명과학과", 7L)
                ))
            ))
        );
    }

    @GetMapping("/schools")
    public String showSchools(Model model) {
        model.addAttribute("schools", getDummySchools());
        return "school/index";
    }

    @PostMapping("/schools/select")
    public String selectDept(
            @RequestParam Long deptId,
            @RequestParam String deptName,
            @RequestParam String schoolName,
            HttpSession session) {
        session.setAttribute("selectedDeptId",    deptId);
        session.setAttribute("selectedDeptName",  deptName);
        session.setAttribute("selectedSchoolName", schoolName);
        return "redirect:/";
    }

    @GetMapping("/faculty/{id}")
    public String facultyPlaceholder(@PathVariable Long id, Model model) {
        model.addAttribute("facultyId", id);
        return "school/faculty-placeholder";
    }
}
```

- [x] **Step 2: school/index.html 스텁 생성**

Thymeleaf가 뷰를 찾을 수 있도록 최소한의 유효한 HTML을 작성한다. (Task 4에서 완성)

```html
<!DOCTYPE html>
<!--
  학교·학부·학과 선택 페이지 (스텁 — Task 4에서 완성)
  연결 컨트롤러: SchoolController (GET /schools)
-->
<html xmlns:th="http://www.thymeleaf.org" lang="ko">
<head>
    <meta charset="UTF-8">
    <title>학과 선택 | 학과정보통합서비스</title>
</head>
<body>
    <div th:each="school : ${schools}" th:text="${school.name}"></div>
</body>
</html>
```

파일 경로: `demo/demo/src/main/resources/templates/school/index.html`

- [x] **Step 3: school/faculty-placeholder.html 스텁 생성**

```html
<!DOCTYPE html>
<!--
  학부 페이지 플레이스홀더 (스텁 — Task 5에서 완성)
  연결 컨트롤러: SchoolController (GET /faculty/{id})
-->
<html xmlns:th="http://www.thymeleaf.org" lang="ko">
<head>
    <meta charset="UTF-8">
    <title>학부 페이지 | 학과정보통합서비스</title>
</head>
<body>준비 중</body>
</html>
```

파일 경로: `demo/demo/src/main/resources/templates/school/faculty-placeholder.html`

- [x] **Step 4: 테스트 실행 → 통과 확인**

```
cd demo\demo
mvnw.cmd test -Dtest=SchoolControllerTest
```

Expected: `BUILD SUCCESS`, 3개 테스트 모두 PASS

- [x] **Step 5: 커밋**

```bash
git add demo/demo/src/main/java/com/example/demo/controller/SchoolController.java
git add demo/demo/src/main/resources/templates/school/index.html
git add demo/demo/src/main/resources/templates/school/faculty-placeholder.html
git add demo/demo/src/test/java/com/example/demo/controller/SchoolControllerTest.java
git commit -m "feat: add SchoolController with session-based dept selection"
```

---

## Task 4: school/index.html 완성 (문서형 레이아웃)

**Files:**
- Modify: `demo/demo/src/main/resources/templates/school/index.html`

- [x] **Step 1: 완성된 템플릿으로 교체**

```html
<!DOCTYPE html>
<!--
  학교·학부·학과 선택 페이지
  연결 컨트롤러: SchoolController (GET /schools)
  모델 변수: schools (List<SchoolDto>) — 단과대학→학부→학과 중첩 구조
-->
<html xmlns:th="http://www.thymeleaf.org" lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>학부·학과 안내 | 학과정보통합서비스</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-white text-black font-sans">

<!-- ===== 고정 네비게이션 바 ===== -->
<nav class="fixed top-0 left-0 w-full bg-black text-white z-50 border-b border-gray-800">
    <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a th:href="@{/schools}" class="font-bold text-lg tracking-tight hover:opacity-80 transition">
            학과정보통합서비스
        </a>
        <div class="hidden md:flex items-center gap-3">
            <a th:href="@{/login}"
               class="border border-white text-white text-sm px-3 py-1 rounded hover:bg-white hover:text-black transition">
                로그인
            </a>
        </div>
        <button onclick="toggleMenu()" class="md:hidden text-white focus:outline-none">
            <i class="fas fa-bars text-xl"></i>
        </button>
    </div>
    <div id="mobileMenu" class="hidden md:hidden bg-black border-t border-gray-700 px-4 py-4 flex flex-col gap-4 text-sm">
        <a th:href="@{/login}"
           class="mt-2 border border-white text-center py-1 rounded hover:bg-white hover:text-black transition">
            로그인
        </a>
    </div>
</nav>
<!-- ===== 네비게이션 바 끝 ===== -->

<div class="pt-14"></div>

<!-- ===== 히어로 섹션 ===== -->
<section class="bg-black text-white py-16 px-4">
    <div class="max-w-6xl mx-auto text-center">
        <h1 class="text-3xl md:text-4xl font-bold mb-2">
            <i class="fas fa-university mr-3"></i>학부·학과 안내
        </h1>
        <p class="text-gray-400 text-sm md:text-base">원하는 학과를 선택하세요</p>
    </div>
</section>
<!-- ===== 히어로 섹션 끝 ===== -->

<!-- ===== 본문: 문서형 계층 레이아웃 ===== -->
<!--
  구조: 단과대학(h2) > 학부(링크) > 학과(버튼 폼)
  th:each 루프로 DB 추가 시 자동 반영됨
-->
<main class="max-w-6xl mx-auto px-4 py-10">

    <div th:each="school : ${schools}" class="mb-12">

        <!-- 단과대학 헤더 -->
        <h2 class="text-2xl font-bold pb-3 mb-6 border-b-2 border-black flex items-center gap-2">
            <i class="fas fa-building text-xl"></i>
            <span th:text="${school.name}">단과대학명</span>
        </h2>

        <!-- 학부 목록 -->
        <div th:each="faculty : ${school.faculties}" class="mb-8 pl-4 border-l-2 border-gray-200">

            <!-- 학부명: 클릭 시 학부 페이지로 이동 (플레이스홀더) -->
            <div class="mb-3">
                <a th:href="@{/faculty/{id}(id=${faculty.id})}"
                   class="inline-flex items-center gap-2 text-lg font-semibold hover:underline transition">
                    <i class="fas fa-layer-group text-sm"></i>
                    <span th:text="${faculty.name}">학부명</span>
                    <i class="fas fa-arrow-right text-xs opacity-50"></i>
                </a>
            </div>

            <!-- 학과 목록: 각 학과는 POST 폼 버튼 -->
            <div class="flex flex-wrap gap-2 pl-6">
                <form th:each="dept : ${faculty.depts}"
                      th:action="@{/schools/select}" method="post">
                    <input type="hidden" name="deptId"    th:value="${dept.id}">
                    <input type="hidden" name="deptName"  th:value="${dept.name}">
                    <input type="hidden" name="schoolName" th:value="${school.name}">
                    <button type="submit"
                            class="border-2 border-black px-4 py-2 text-sm font-medium
                                   hover:bg-black hover:text-white transition"
                            th:text="${dept.name}">
                        학과명
                    </button>
                </form>
            </div>

        </div>
        <!-- 학부 목록 끝 -->

    </div>
    <!-- 단과대학 반복 끝 -->

</main>
<!-- ===== 본문 끝 ===== -->

<script>
    function toggleMenu() {
        document.getElementById('mobileMenu').classList.toggle('hidden');
    }
</script>

</body>
</html>
```

- [x] **Step 2: 테스트 재실행 → 여전히 통과 확인**

```
cd demo\demo
mvnw.cmd test -Dtest=SchoolControllerTest
```

Expected: `BUILD SUCCESS`

- [x] **Step 3: 커밋**

```bash
git add demo/demo/src/main/resources/templates/school/index.html
git commit -m "feat: implement school/index.html document-style layout"
```

---

## Task 5: school/faculty-placeholder.html 완성

**Files:**
- Modify: `demo/demo/src/main/resources/templates/school/faculty-placeholder.html`

- [x] **Step 1: 완성된 템플릿으로 교체**

```html
<!DOCTYPE html>
<!--
  학부 페이지 플레이스홀더
  연결 컨트롤러: SchoolController (GET /faculty/{id})
  모델 변수: facultyId (Long)
-->
<html xmlns:th="http://www.thymeleaf.org" lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>학부 페이지 | 학과정보통합서비스</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-white text-black font-sans">

<!-- ===== 네비게이션 바 ===== -->
<nav class="fixed top-0 left-0 w-full bg-black text-white z-50 border-b border-gray-800">
    <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a th:href="@{/schools}" class="font-bold text-lg tracking-tight hover:opacity-80 transition">
            학과정보통합서비스
        </a>
    </div>
</nav>
<!-- ===== 네비게이션 바 끝 ===== -->

<div class="pt-14"></div>

<!-- ===== 히어로 섹션 ===== -->
<section class="bg-black text-white py-16 px-4">
    <div class="max-w-6xl mx-auto text-center">
        <h1 class="text-3xl font-bold mb-2">
            <i class="fas fa-layer-group mr-3"></i>학부 페이지
        </h1>
        <p class="text-gray-400">이 페이지는 준비 중입니다</p>
    </div>
</section>
<!-- ===== 히어로 섹션 끝 ===== -->

<main class="max-w-6xl mx-auto px-4 py-20 text-center">
    <i class="fas fa-tools text-5xl text-gray-300 mb-6 block"></i>
    <p class="text-gray-500 text-lg mb-8">학부 페이지는 추후 구현 예정입니다.</p>
    <a th:href="@{/schools}"
       class="inline-block border-2 border-black px-6 py-3 font-medium
              hover:bg-black hover:text-white transition">
        ← 학과 목록으로 돌아가기
    </a>
</main>

</body>
</html>
```

- [x] **Step 2: 커밋**

```bash
git add demo/demo/src/main/resources/templates/school/faculty-placeholder.html
git commit -m "feat: implement faculty placeholder page"
```

---

## Task 6: MainControllerTest 새 케이스 추가 (실패 확인)

**Files:**
- Modify: `demo/demo/src/test/java/com/example/demo/controller/MainControllerTest.java`

- [x] **Step 1: 기존 테스트에 import 추가 + 새 케이스 2개 추가**

기존 파일 상단 import 블록에 아래 두 줄을 추가한다:
```java
import org.springframework.mock.web.MockHttpSession;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;  // 이미 있으면 생략
```

그런 다음 클래스 안에 아래 테스트 2개를 추가한다:

```java
@Test
@DisplayName("GET / 세션 없음 → /schools 리다이렉트")
void 세션없이_루트접근_학교선택으로_리다이렉트() throws Exception {
    mockMvc.perform(get("/"))
            .andExpect(status().is3xxRedirection())
            .andExpect(redirectedUrl("/schools"));
}

@Test
@DisplayName("GET / 세션 있음 → 200 OK, main/index 뷰 반환")
void 세션있으면_메인페이지_정상_로드() throws Exception {
    MockHttpSession session = new MockHttpSession();
    session.setAttribute("selectedDeptName", "컴퓨터공학과");

    mockMvc.perform(get("/").session(session))
            .andExpect(status().isOk())
            .andExpect(view().name("main/index"))
            .andExpect(model().attributeExists("notices"))
            .andExpect(model().attributeExists("posts"))
            .andExpect(model().attributeExists("schedules"))
            .andExpect(model().attribute("selectedDeptName", "컴퓨터공학과"));
}
```

> **주의:** 기존 `메인페이지_정상_로드` 테스트는 세션 없이 GET /를 호출하므로, 이 단계 이후로는 실패하게 된다. Task 7에서 MainController를 수정한 뒤 해당 테스트도 함께 수정한다.

- [x] **Step 2: 테스트 실행 → 새 케이스 실패 확인**

```
cd demo\demo
mvnw.cmd test -Dtest=MainControllerTest
```

Expected: `BUILD FAILURE` — 새로 추가한 2개 케이스 실패 (MainController가 아직 세션을 보지 않음)

---

## Task 7: MainController 세션 로직 추가

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/controller/MainController.java`
- Modify: `demo/demo/src/test/java/com/example/demo/controller/MainControllerTest.java`

- [x] **Step 1: MainController.java 수정**

`index` 메서드 시그니처에 `HttpSession session` 파라미터를 추가하고, 세션 확인 로직을 메서드 맨 앞에 넣는다. 아래가 수정된 전체 메서드이다:

```java
import jakarta.servlet.http.HttpSession;  // 파일 상단 import에 추가

@GetMapping("/")
public String index(Model model, HttpSession session) {

    // 세션에 학과가 선택되지 않았으면 학교 선택 페이지로 리다이렉트
    String deptName = (String) session.getAttribute("selectedDeptName");
    if (deptName == null) {
        return "redirect:/schools";
    }
    model.addAttribute("selectedDeptName", deptName);

    // 이하 기존 더미 데이터 코드 그대로 유지
    model.addAttribute("notices", List.of(
        new NoticeDto(1L, "2026년 1학기 수강신청 일정 안내", "2026-05-08", "학과사무실", "학사",  102, false),
        new NoticeDto(2L, "졸업논문 제출 마감 안내",         "2026-05-06", "학과사무실", "학사",   87, false),
        new NoticeDto(3L, "장학금 신청 안내 (5월 15일까지)", "2026-05-04", "학생처",     "장학",   65, false),
        new NoticeDto(4L, "실험실 안전교육 일정 공지",       "2026-05-02", "학과사무실", "학사",   43, false),
        new NoticeDto(5L, "2026 산학협력 세미나 개최 안내",  "2026-04-30", "학과사무실", "행사",   31, false)
    ));
    model.addAttribute("posts", List.of(
        new PostDto(1L, "중간고사 자료구조 족보 공유합니다",    "박민수", 45, "자유게시판", 312, "2026-05-01", false),
        new PostDto(2L, "카카오 인턴십 합격 후기 (2026 상반기)", "이철수", 32, "취업후기",  280, "2026-04-28", false),
        new PostDto(3L, "알고리즘 스터디 같이 할 분 모집",      "홍길동", 24, "스터디",    150, "2026-04-25", false),
        new PostDto(4L, "졸업작품 팀원 구합니다 (4인 팀)",      "김영희", 18, "자유게시판",  98, "2026-04-20", false),
        new PostDto(5L, "교수님 연구실 학부 인턴 모집 공고",    "정교수", 12, "취업후기",   74, "2026-04-18", false)
    ));
    model.addAttribute("schedules", List.of(
        new ScheduleDto(1L, "중간고사 시작",   "2026-05-12",  1, "시험"),
        new ScheduleDto(2L, "프로젝트 발표",   "2026-05-20",  9, "학사"),
        new ScheduleDto(3L, "학과 축제",       "2026-06-01", 21, "행사"),
        new ScheduleDto(4L, "기말고사 시작",   "2026-06-16", 36, "시험"),
        new ScheduleDto(5L, "여름 방학 시작",  "2026-06-27", 47, "학사")
    ));

    String today = LocalDate.now()
        .format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 EEEE", Locale.KOREAN));
    model.addAttribute("today", today);
    model.addAttribute("currentPage", "main");

    return "main/index";
}
```

- [x] **Step 2: 기존 테스트 메서드 수정**

`MainControllerTest`의 기존 `메인페이지_정상_로드` 메서드는 세션 없이 GET /를 호출하므로, 세션을 주입하도록 수정한다:

```java
@Test
@DisplayName("메인 페이지 GET / → 200 OK, main/index 뷰 반환")
void 메인페이지_정상_로드() throws Exception {
    MockHttpSession session = new MockHttpSession();
    session.setAttribute("selectedDeptName", "컴퓨터공학과");

    mockMvc.perform(get("/").session(session))
            .andExpect(status().isOk())
            .andExpect(view().name("main/index"))
            .andExpect(model().attributeExists("notices"))
            .andExpect(model().attributeExists("posts"))
            .andExpect(model().attributeExists("schedules"))
            .andExpect(model().attributeExists("today"))
            .andExpect(model().attribute("currentPage", "main"));
}
```

- [x] **Step 3: 테스트 실행 → 전체 통과 확인**

```
cd demo\demo
mvnw.cmd test -Dtest=MainControllerTest
```

Expected: `BUILD SUCCESS`, 3개 테스트 모두 PASS

- [x] **Step 4: 커밋**

```bash
git add demo/demo/src/main/java/com/example/demo/controller/MainController.java
git add demo/demo/src/test/java/com/example/demo/controller/MainControllerTest.java
git commit -m "feat: MainController session check, redirect to /schools if no dept selected"
```

---

## Task 8: main/index.html 수정

**Files:**
- Modify: `demo/demo/src/main/resources/templates/main/index.html`

- [x] **Step 1: 히어로 섹션 학과명 동적화**

`main/index.html` 84번째 줄 근처의 h1 태그를 찾아 아래와 같이 수정한다:

변경 전:
```html
<h1 class="text-3xl md:text-4xl font-bold mb-2">
    <i class="fas fa-graduation-cap mr-3"></i>컴퓨터공학과 정보 포털
</h1>
```

변경 후:
```html
<h1 class="text-3xl md:text-4xl font-bold mb-2">
    <i class="fas fa-graduation-cap mr-3"></i>
    <span th:text="${selectedDeptName + ' 정보 포털'}">학과 정보 포털</span>
</h1>
```

- [x] **Step 2: 네비게이션 바에 학과 변경 링크 추가**

데스크탑 메뉴 `<ul>` 안에 맨 앞에 아래 항목을 추가한다:

```html
<li>
    <a th:href="@{/schools}"
       class="pb-1 hover:opacity-70 transition border-b-2 border-transparent text-gray-300">
        <i class="fas fa-exchange-alt mr-1 text-xs"></i>학과 변경
    </a>
</li>
```

모바일 드롭다운 메뉴 `<div id="mobileMenu">` 안에도 동일하게 추가한다:

```html
<a th:href="@{/schools}" class="hover:opacity-70 text-gray-300">
    <i class="fas fa-exchange-alt mr-1 text-xs"></i>학과 변경
</a>
```

- [x] **Step 3: 커밋**

```bash
git add demo/demo/src/main/resources/templates/main/index.html
git commit -m "feat: main/index.html dynamic dept name and school change link"
```

---

## Task 9: 전체 테스트 실행 및 수동 검증

**Files:** 없음 (검증 단계)

- [x] **Step 1: 전체 테스트 실행**

```
cd demo\demo
mvnw.cmd test
```

Expected: `BUILD SUCCESS`, 전체 테스트 PASS

- [x] **Step 2: 서버 기동**

```
cd demo\demo
mvnw.cmd spring-boot:run
```

- [x] **Step 3: 수동 동선 검증**

브라우저에서 아래 순서로 확인한다:

1. `http://localhost:8080/` 접속 → `/schools`로 리다이렉트되는지 확인
2. `/schools` 페이지에서 단과대학→학부→학과 계층이 문서형으로 보이는지 확인
3. 학부명(예: "정보통신공학부 →") 클릭 → `/faculty/1` 플레이스홀더 페이지로 이동 확인
4. 뒤로가기 후 학과 버튼(예: "컴퓨터공학과") 클릭 → `/`로 이동, 히어로에 "컴퓨터공학과 정보 포털" 표시 확인
5. 네비게이션의 "학과 변경" 클릭 → `/schools`로 이동 확인
6. 다른 학과(예: "수학과") 클릭 → 히어로가 "수학과 정보 포털"로 바뀌는지 확인

- [x] **Step 4: 최종 커밋 (필요 시)**

변경 사항이 남아 있으면:
```bash
git add -A
git commit -m "chore: final cleanup after school selection implementation"
```
