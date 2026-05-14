# Notice Board Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder `notice/list.html` with a complete B&W minimalist notice board using Tailwind CSS, including a fixed navbar, featured notice, filter tabs, two-column list+sidebar layout, and mobile hamburger menu.

**Architecture:** Self-contained Thymeleaf template with Tailwind CDN — no Bootstrap on this page. Dummy data is injected by `NoticeController` via extended `NoticeDto`. JS filter runs client-side on `data-category` attributes.

**Tech Stack:** Spring Boot, Thymeleaf, Tailwind CSS (CDN), vanilla JS, Java 17

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `demo/demo/src/main/java/com/example/demo/dto/NoticeDto.java` | Add `category`, `viewCount`, `featured` fields |
| Modify | `demo/demo/src/main/java/com/example/demo/controller/NoticeController.java` | Inject dummy notice list + featured notice |
| Modify | `demo/demo/src/test/java/com/example/demo/controller/NoticeControllerTest.java` | Add model attribute test |
| Rewrite | `demo/demo/src/main/resources/templates/notice/list.html` | Full Tailwind B&W notice board |

---

## Task 1: Extend NoticeDto

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/dto/NoticeDto.java`

- [ ] **Step 1: Replace NoticeDto with extended version**

```java
package com.example.demo.dto;

/**
 * 공지사항 데이터 전송 객체
 * - 연결 컨트롤러: NoticeController, MainController
 * - 연결 템플릿: notice/list.html, main/index.html
 */
public class NoticeDto {

    private final Long id;
    private final String title;
    private final String date;
    private final String author;
    private final String category;   // 카테고리: 학사·장학·행사·취업
    private final int viewCount;     // 조회수
    private final boolean featured;  // 긴급/대표 공지 여부

    public NoticeDto(Long id, String title, String date, String author,
                     String category, int viewCount, boolean featured) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.author = author;
        this.category = category;
        this.viewCount = viewCount;
        this.featured = featured;
    }

    public Long getId()         { return id; }
    public String getTitle()    { return title; }
    public String getDate()     { return date; }
    public String getAuthor()   { return author; }
    public String getCategory() { return category; }
    public int getViewCount()   { return viewCount; }
    public boolean isFeatured() { return featured; }
}
```

- [ ] **Step 2: Fix MainController — NoticeDto constructor now needs 7 args**

Open `demo/demo/src/main/java/com/example/demo/controller/MainController.java`.
Find every `new NoticeDto(...)` call and add `"학사", 0, false` as the last three args.

Example before:
```java
new NoticeDto(1L, "수강신청 안내", "2026-05-10", "학사팀")
```
After:
```java
new NoticeDto(1L, "수강신청 안내", "2026-05-10", "학사팀", "학사", 0, false)
```

---

## Task 2: Write failing test → update controller → pass

**Files:**
- Modify: `demo/demo/src/test/java/com/example/demo/controller/NoticeControllerTest.java`
- Modify: `demo/demo/src/main/java/com/example/demo/controller/NoticeController.java`

- [ ] **Step 1: Add failing test for `notices` model attribute**

```java
@Test
@DisplayName("공지사항 모델에 notices 리스트 포함")
void notices_모델_속성_포함() throws Exception {
    mockMvc.perform(get("/notice"))
            .andExpect(status().isOk())
            .andExpect(model().attributeExists("notices"))
            .andExpect(model().attributeExists("featured"));
}
```

- [ ] **Step 2: Run test — expect FAIL**

```
cd demo/demo
.\mvnw.cmd test -Dtest=NoticeControllerTest#notices_모델_속성_포함
```
Expected: `AssertionError: Model attribute 'notices' does not exist`

- [ ] **Step 3: Update NoticeController with dummy data**

```java
package com.example.demo.controller;

import com.example.demo.dto.NoticeDto;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

/**
 * 공지사항 페이지 컨트롤러
 * - URL: GET /notice
 * - 렌더링 템플릿: templates/notice/list.html
 * - TODO: [팀원-공지사항 담당] 서비스 로직으로 교체
 */
@Controller
public class NoticeController {

    @GetMapping("/notice")
    public String list(Model model) {
        // 현재 페이지 식별자 (네비게이션 바 활성 메뉴 표시용)
        model.addAttribute("currentPage", "notice");

        // 긴급/대표 공지 (Featured 섹션용 더미 데이터)
        model.addAttribute("featured", new NoticeDto(
            1L, "2026년 1학기 수강신청 변경 안내", "2026-05-11",
            "학사팀", "학사", 1204, true
        ));

        // 공지 목록 더미 데이터 (실제 DB 연동 전 테스트용)
        model.addAttribute("notices", List.of(
            new NoticeDto(2L, "2026년 장학금 신청 안내", "2026-05-10", "장학팀", "장학", 892, false),
            new NoticeDto(3L, "봄 체육대회 일정 공지", "2026-05-09", "학생처", "행사", 441, false),
            new NoticeDto(4L, "현장실습 참가 모집", "2026-05-08", "취업팀", "취업", 330, false),
            new NoticeDto(5L, "교수학습 특강 안내", "2026-05-07", "교학처", "학사", 215, false),
            new NoticeDto(6L, "긴급 장학금 추가 모집", "2026-05-06", "장학팀", "장학", 178, false),
            new NoticeDto(7L, "졸업논문 제출 마감 공지", "2026-05-05", "학사팀", "학사", 654, false),
            new NoticeDto(8L, "SW 해커톤 모집", "2026-05-04", "학생처", "행사", 299, false),
            new NoticeDto(9L, "취업박람회 참가 안내", "2026-05-03", "취업팀", "취업", 410, false),
            new NoticeDto(10L, "성적 이의신청 기간 안내", "2026-05-02", "학사팀", "학사", 521, false)
        ));

        return "notice/list";
    }
}
```

- [ ] **Step 4: Run all NoticeController tests — expect PASS**

```
.\mvnw.cmd test -Dtest=NoticeControllerTest
```
Expected: `Tests run: 2, Failures: 0, Errors: 0`

- [ ] **Step 5: Commit**

```
git add demo/demo/src/main/java/com/example/demo/dto/NoticeDto.java
git add demo/demo/src/main/java/com/example/demo/controller/NoticeController.java
git add demo/demo/src/test/java/com/example/demo/controller/NoticeControllerTest.java
git commit -m "feat: extend NoticeDto and add dummy data to NoticeController"
```

---

## Task 3: Base HTML + Fixed Navbar

**Files:**
- Rewrite: `demo/demo/src/main/resources/templates/notice/list.html`

- [ ] **Step 1: Write base HTML structure with Tailwind CDN**

Replace the entire content of `notice/list.html` with:

```html
<!DOCTYPE html>
<!--
  공지사항 페이지
  연결 컨트롤러: NoticeController (GET /notice)
  스타일: Tailwind CSS (Bootstrap 미사용)
  모델 변수:
    - currentPage : "notice"
    - featured    : NoticeDto (긴급 공지)
    - notices     : List<NoticeDto> (공지 목록)
-->
<html xmlns:th="http://www.thymeleaf.org" lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>공지사항 | 학과정보통합서비스</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome 아이콘 -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-white text-black font-sans">

<!-- ===== 고정 네비게이션 바 ===== -->
<!-- 스크롤해도 상단에 고정 (fixed top-0) -->
<nav class="fixed top-0 left-0 w-full bg-black text-white z-50 border-b border-white">
    <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        <!-- 로고: 메인 페이지로 이동 -->
        <a th:href="@{/}" class="font-bold text-lg tracking-tight hover:opacity-80 transition">
            학과정보통합서비스
        </a>

        <!-- 데스크탑 메뉴 (md 이상에서 표시) -->
        <ul class="hidden md:flex gap-8 text-sm font-medium">
            <!-- 공지사항: 현재 페이지 → 흰색 언더라인 -->
            <li>
                <a th:href="@{/notice}"
                   class="pb-1 hover:opacity-70 transition border-b-2 border-white">
                    공지사항
                </a>
            </li>
            <li><a th:href="@{/board}"      class="pb-1 hover:opacity-70 transition border-b-2 border-transparent">게시판</a></li>
            <li><a th:href="@{/schedule}"   class="pb-1 hover:opacity-70 transition border-b-2 border-transparent">일정</a></li>
            <li><a th:href="@{/department}" class="pb-1 hover:opacity-70 transition border-b-2 border-transparent">학과정보</a></li>
        </ul>

        <!-- 검색 + 로그인 (데스크탑) -->
        <div class="hidden md:flex items-center gap-3">
            <div class="flex items-center border border-white rounded px-2 py-1 gap-2">
                <i class="fas fa-search text-xs opacity-70"></i>
                <input type="text" placeholder="공지 검색..." class="bg-transparent text-white text-sm outline-none placeholder-gray-400 w-32">
            </div>
            <a th:href="@{/login}" class="border border-white text-white text-sm px-3 py-1 rounded hover:bg-white hover:text-black transition">
                로그인
            </a>
        </div>

        <!-- 모바일 햄버거 버튼 (md 미만에서 표시) -->
        <button id="menuBtn" onclick="toggleMenu()"
                class="md:hidden text-white focus:outline-none">
            <i class="fas fa-bars text-xl"></i>
        </button>
    </div>

    <!-- 모바일 드롭다운 메뉴 (기본 숨김) -->
    <div id="mobileMenu" class="hidden md:hidden bg-black border-t border-gray-700 px-4 py-4 flex flex-col gap-4 text-sm">
        <a th:href="@{/notice}"      class="border-b border-white pb-1">공지사항</a>
        <a th:href="@{/board}"       class="hover:opacity-70">게시판</a>
        <a th:href="@{/schedule}"    class="hover:opacity-70">일정</a>
        <a th:href="@{/department}"  class="hover:opacity-70">학과정보</a>
        <a th:href="@{/login}"       class="mt-2 border border-white text-center py-1 rounded hover:bg-white hover:text-black transition">로그인</a>
    </div>
</nav>
<!-- ===== 네비게이션 바 끝 ===== -->

<!-- 네비게이션 바 높이만큼 상단 여백 -->
<div class="pt-14"></div>

<!-- ===== 본문 영역 (Task 4~7에서 채움) ===== -->
<main class="max-w-6xl mx-auto px-4 py-8">
    <p class="text-gray-400">콘텐츠 영역 — 다음 태스크에서 구현</p>
</main>

<!-- 햄버거 메뉴 토글 JS -->
<script>
    function toggleMenu() {
        const menu = document.getElementById('mobileMenu');
        menu.classList.toggle('hidden');
    }
</script>

</body>
</html>
```

- [ ] **Step 2: Run the Spring Boot app and open `http://localhost:8080/notice`**

```
cd demo/demo
.\mvnw.cmd spring-boot:run
```
Verify: navbar is black, fixed at top when scrolling, hamburger appears on narrow window.

- [ ] **Step 3: Commit**

```
git add demo/demo/src/main/resources/templates/notice/list.html
git commit -m "feat: add Tailwind fixed navbar to notice page"
```

---

## Task 4: Featured Notice Section

**Files:**
- Modify: `demo/demo/src/main/resources/templates/notice/list.html`

- [ ] **Step 1: Replace `<main>` placeholder with featured section**

Replace the `<main>` block with:

```html
<main class="max-w-6xl mx-auto px-4 py-8">

    <!-- ===== 긴급/대표 공지 (Featured) ===== -->
    <!-- NoticeController의 featured(NoticeDto) 변수 렌더링 -->
    <section class="mb-8">
        <div class="relative border-2 border-black overflow-hidden">
            <!-- 이미지 플레이스홀더 (실제 이미지로 교체 예정) -->
            <div class="w-full h-64 bg-gray-200 flex items-center justify-center">
                <i class="fas fa-image text-5xl text-gray-400"></i>
            </div>
            <!-- 제목 오버레이: 이미지 하단에 흑색 그라디언트 -->
            <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-5">
                <span class="inline-block bg-white text-black text-xs font-bold px-2 py-0.5 mb-2"
                      th:text="${featured.category}">카테고리</span>
                <h2 class="text-white text-xl font-bold leading-tight"
                    th:text="${featured.title}">긴급 공지 제목</h2>
                <p class="text-gray-300 text-sm mt-1">
                    <span th:text="${featured.date}">2026-05-11</span>
                    &nbsp;·&nbsp;
                    <i class="fas fa-eye mr-1"></i>
                    <span th:text="${featured.viewCount}">0</span>
                </p>
            </div>
        </div>
    </section>
    <!-- ===== Featured 끝 ===== -->

    <!-- ===== 필터 탭 + 2단 레이아웃 (Task 5~7에서 채움) ===== -->
    <p class="text-gray-400">필터 + 목록 영역 — 다음 태스크에서 구현</p>

</main>
```

- [ ] **Step 2: Verify in browser** — featured card shows title, category badge, date, view count overlaid on grey placeholder.

- [ ] **Step 3: Commit**

```
git add demo/demo/src/main/resources/templates/notice/list.html
git commit -m "feat: add featured notice section to notice page"
```

---

## Task 5: Filter Tabs + JS Filtering

**Files:**
- Modify: `demo/demo/src/main/resources/templates/notice/list.html`

- [ ] **Step 1: Replace `<!-- 필터 + 목록 영역 -->` placeholder with filter tabs and two-column wrapper**

```html
    <!-- ===== 카테고리 필터 탭 ===== -->
    <!-- 클릭 시 filterNotices(category) 호출 → 해당 카테고리만 표시 -->
    <div class="flex flex-wrap gap-2 mb-6">
        <button onclick="filterNotices('전체')"  class="filter-tab active-tab px-4 py-1.5 text-sm border border-black font-medium transition" data-cat="전체">전체</button>
        <button onclick="filterNotices('학사')"  class="filter-tab px-4 py-1.5 text-sm border border-black font-medium transition" data-cat="학사">학사</button>
        <button onclick="filterNotices('장학')"  class="filter-tab px-4 py-1.5 text-sm border border-black font-medium transition" data-cat="장학">장학</button>
        <button onclick="filterNotices('행사')"  class="filter-tab px-4 py-1.5 text-sm border border-black font-medium transition" data-cat="행사">행사</button>
        <button onclick="filterNotices('취업')"  class="filter-tab px-4 py-1.5 text-sm border border-black font-medium transition" data-cat="취업">취업</button>
    </div>
    <!-- ===== 필터 탭 끝 ===== -->

    <!-- ===== 2단 레이아웃: 공지 목록(좌 70%) + 사이드바(우 30%) ===== -->
    <div class="flex flex-col lg:flex-row gap-8">

        <!-- 왼쪽: 공지 목록 (Task 6에서 채움) -->
        <div class="flex-1" id="noticeList">
            <p class="text-gray-400">공지 목록 — Task 6에서 구현</p>
        </div>

        <!-- 오른쪽: 사이드바 (Task 7에서 채움) -->
        <aside class="lg:w-72 flex-shrink-0">
            <p class="text-gray-400">사이드바 — Task 7에서 구현</p>
        </aside>
    </div>
    <!-- ===== 2단 레이아웃 끝 ===== -->
```

- [ ] **Step 2: Add filter JS and tab style to the `<script>` block (before `</body>`)**

Replace the existing `<script>` block with:

```html
<script>
    /* 햄버거 메뉴 토글 */
    function toggleMenu() {
        document.getElementById('mobileMenu').classList.toggle('hidden');
    }

    /* 카테고리 필터: 해당 카테고리의 notice-item만 표시 */
    function filterNotices(category) {
        // 탭 활성 스타일 전환
        document.querySelectorAll('.filter-tab').forEach(btn => {
            if (btn.dataset.cat === category) {
                btn.classList.add('bg-black', 'text-white');
                btn.classList.remove('bg-white', 'text-black');
            } else {
                btn.classList.remove('bg-black', 'text-white');
                btn.classList.add('bg-white', 'text-black');
            }
        });

        // 공지 항목 표시/숨김
        document.querySelectorAll('.notice-item').forEach(item => {
            const show = category === '전체' || item.dataset.category === category;
            item.classList.toggle('hidden', !show);
        });
    }
</script>
```

Also add these inline styles inside `<head>` (Tailwind CDN doesn't support arbitrary state variants for `.active-tab`):

```html
<style>
    .active-tab { background-color: #000; color: #fff; }
    .filter-tab:not(.active-tab) { background-color: #fff; color: #000; }
</style>
```

- [ ] **Step 3: Verify in browser** — filter tabs render; clicking 학사/장학 shows/hides (the list is still placeholder, but tabs toggle styles correctly).

- [ ] **Step 4: Commit**

```
git add demo/demo/src/main/resources/templates/notice/list.html
git commit -m "feat: add category filter tabs with JS to notice page"
```

---

## Task 6: Notice List (Left Column)

**Files:**
- Modify: `demo/demo/src/main/resources/templates/notice/list.html`

- [ ] **Step 1: Replace `<div id="noticeList">` placeholder**

```html
        <!-- ===== 공지 목록: notices(List<NoticeDto>) 렌더링 ===== -->
        <div class="flex-1" id="noticeList">
            <div th:each="notice : ${notices}"
                 th:attr="data-category=${notice.category}"
                 class="notice-item flex gap-4 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition">

                <!-- 썸네일 플레이스홀더 (실제 이미지로 교체 예정) -->
                <div class="w-20 h-16 bg-gray-200 flex-shrink-0 flex items-center justify-center border border-gray-300">
                    <i class="fas fa-image text-gray-400 text-sm"></i>
                </div>

                <!-- 제목 + 메타 정보 -->
                <div class="flex-1 min-w-0">
                    <!-- 제목: /notice 상세 페이지로 이동 (팀원이 URL 교체 예정) -->
                    <a th:href="@{/notice}" class="font-semibold text-black hover:underline line-clamp-2 block leading-snug"
                       th:text="${notice.title}">공지 제목</a>
                    <div class="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
                        <!-- 카테고리 배지 -->
                        <span class="border border-black text-black px-1.5 py-0.5 font-medium"
                              th:text="${notice.category}">카테고리</span>
                        <!-- 날짜 -->
                        <span th:text="${notice.date}">2026-05-11</span>
                        <!-- 조회수 -->
                        <span>
                            <i class="fas fa-eye mr-0.5"></i>
                            <span th:text="${notice.viewCount}">0</span>
                        </span>
                    </div>
                </div>
            </div>

            <!-- 공지가 없을 때 표시 -->
            <div th:if="${#lists.isEmpty(notices)}" class="py-16 text-center text-gray-400">
                <i class="fas fa-inbox text-3xl mb-3 block"></i>
                공지사항이 없습니다.
            </div>
        </div>
        <!-- ===== 공지 목록 끝 ===== -->
```

- [ ] **Step 2: Add pagination below `</div><!-- noticeList -->`**

```html
        <!-- 페이지네이션 (더미 — 팀원이 실제 로직으로 교체) -->
        <div class="flex justify-center gap-1 mt-8">
            <button class="w-8 h-8 border border-black bg-black text-white text-sm font-medium">1</button>
            <button class="w-8 h-8 border border-black hover:bg-gray-100 text-sm">2</button>
            <button class="w-8 h-8 border border-black hover:bg-gray-100 text-sm">3</button>
            <span class="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
            <button class="w-8 h-8 border border-black hover:bg-gray-100 text-sm">10</button>
        </div>
```

- [ ] **Step 3: Verify in browser** — notice list renders with thumbnail placeholders, category badges, dates, view counts. Filter tabs hide/show rows correctly.

- [ ] **Step 4: Commit**

```
git add demo/demo/src/main/resources/templates/notice/list.html
git commit -m "feat: add notice list with filter and pagination to notice page"
```

---

## Task 7: Sidebar Panels (Right Column)

**Files:**
- Modify: `demo/demo/src/main/resources/templates/notice/list.html`

- [ ] **Step 1: Replace `<aside>` placeholder**

```html
        <!-- ===== 사이드바 ===== -->
        <aside class="lg:w-72 flex-shrink-0 flex flex-col gap-6">

            <!-- 카테고리별 글 수 위젯 -->
            <div class="border-2 border-black">
                <div class="bg-black text-white px-4 py-2 text-sm font-bold">카테고리</div>
                <ul class="divide-y divide-gray-200 text-sm">
                    <li class="flex justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer" onclick="filterNotices('전체')">
                        <span>전체</span><span class="font-medium">32</span>
                    </li>
                    <li class="flex justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer" onclick="filterNotices('학사')">
                        <span>학사</span><span class="font-medium">14</span>
                    </li>
                    <li class="flex justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer" onclick="filterNotices('장학')">
                        <span>장학</span><span class="font-medium">8</span>
                    </li>
                    <li class="flex justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer" onclick="filterNotices('행사')">
                        <span>행사</span><span class="font-medium">6</span>
                    </li>
                    <li class="flex justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer" onclick="filterNotices('취업')">
                        <span>취업</span><span class="font-medium">4</span>
                    </li>
                </ul>
            </div>

            <!-- 최근 공지 5건 위젯 -->
            <!-- notices 리스트에서 상위 5건만 표시 (th:each + iterStat) -->
            <div class="border-2 border-black">
                <div class="bg-black text-white px-4 py-2 text-sm font-bold">최근 공지</div>
                <ul class="divide-y divide-gray-200 text-sm">
                    <li th:each="notice, iterStat : ${notices}" th:if="${iterStat.index < 5}"
                        class="px-4 py-2 hover:bg-gray-50">
                        <a th:href="@{/notice}" class="block hover:underline leading-snug"
                           th:text="${notice.title}">공지 제목</a>
                        <span class="text-gray-400 text-xs" th:text="${notice.date}">날짜</span>
                    </li>
                </ul>
            </div>
        </aside>
        <!-- ===== 사이드바 끝 ===== -->
```

- [ ] **Step 2: Verify in browser** — sidebar shows category counts and recent 5 notices. Clicking category rows in sidebar also triggers filter.

- [ ] **Step 3: Commit**

```
git add demo/demo/src/main/resources/templates/notice/list.html
git commit -m "feat: add sidebar category and recent notices widgets"
```

---

## Task 8: Final test run + cleanup

- [ ] **Step 1: Run full test suite**

```
cd demo/demo
.\mvnw.cmd test
```
Expected: All tests pass (0 failures).

- [ ] **Step 2: Manual browser checks**

| Check | Expected |
|-------|----------|
| Desktop (≥ 1024px) | Navbar full, 2-column layout, sidebar visible |
| Tablet (768-1023px) | Navbar full, sidebar stacks below list |
| Mobile (< 768px) | Hamburger visible, menu slides down on click, single column |
| Filter tabs | Each tab hides/shows correct rows |
| Sidebar category click | Same filter as tabs |

- [ ] **Step 3: Final commit**

```
git add .
git commit -m "feat: complete B&W notice board page with Tailwind CSS"
```
