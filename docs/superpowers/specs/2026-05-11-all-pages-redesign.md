# All Pages B&W Redesign — Design Spec
**Date:** 2026-05-11
**Scope:** main, board, schedule, department, login pages
**Reference:** `notice/list.html` (established design system)

---

## Shared Rules (all pages)

- Tailwind CSS CDN — no Bootstrap anywhere
- Fixed black navbar identical to `notice/list.html`
  - Logo left / nav links center / search + login right
  - Active page: white underline on the matching nav link
  - Mobile: hamburger → full-width dropdown
- Korean comments in all files
- Dummy data only (TODO markers for team members)
- `pt-14` spacer below fixed navbar

---

## Page 1: Main (`main/index.html`)

**Controller:** `MainController` (already has dummy data — no changes needed)

**Layout:**
- Hero section: department name + today's date + D-Day badges (schedules within 14 days)
- 3-column card grid (desktop) / single column (mobile):
  - Card A: 최신 공지사항 — list of 5 notices (title + date), "더보기 →" link to `/notice`
  - Card B: 인기 게시글 — list of 5 posts (title + likes ♥), "더보기 →" link to `/board`
  - Card C: 다가오는 일정 — list of 5 schedules (date + title + D-Day badge), "더보기 →" link to `/schedule`
- Quick shortcut row: 4 icon buttons (공지사항 / 게시판 / 일정 / 학과정보)

**Model variables (already provided by MainController):**
- `notices`: List\<NoticeDto\> — uses title, date
- `posts`: List\<PostDto\> — uses title, likes
- `schedules`: List\<ScheduleDto\> — uses title, date, dday
- `today`: String (formatted Korean date)
- `currentPage`: "main"

---

## Page 2: Board (`board/list.html`)

**Controller:** `BoardController` — add dummy posts + featured post

**DTO changes:** Extend `PostDto` with `category`(String), `viewCount`(int), `date`(String), `featured`(boolean) → 8-arg constructor

**Layout:** Identical structure to `notice/list.html`:
- Featured post card (image placeholder + title overlay + category + likes + date)
- Filter tabs: `자유게시판 | 질문 | 스터디 | 취업후기`
- Two-column: post list (left) + sidebar (right)
  - List row: thumbnail placeholder + title + category badge + date + ♥ likes + 👁 viewCount
  - Sidebar: category count widget + top 5 popular posts (by likes)
- Pagination (dummy)

**New model attributes:**
- `featured`: PostDto (featured=true)
- `posts`: List\<PostDto\> (9 items, varied categories)

---

## Page 3: Schedule (`schedule/list.html`)

**Controller:** `ScheduleController` — add dummy schedule list

**DTO changes:** Extend `ScheduleDto` with `category`(String) → 5-arg constructor. Keep `dday` field.

**Layout:**
- Filter tabs: `전체 | 학사 | 행사 | 시험 | 기타`
- Month-grouped list: each month header ("▶ 2026년 5월") followed by rows
  - Row: date + day-of-week + title + D-Day badge + category badge
  - JS filter hides/shows rows by `data-category`
- Sidebar: 이번 달 일정 수 (dummy count) + D-Day 임박 TOP 5 (dday ascending)
- Mobile: single column, sidebar stacks below

**New model attributes:**
- `schedules`: List\<ScheduleDto\> (10+ items, 2 months, varied categories)

---

## Page 4: Department (`department/index.html`)

**Controller:** `DepartmentController` — no DTO changes, static sections

**Layout (4 sections, full-width, sequential):**
1. **학과 소개** — heading + 2-paragraph placeholder text + grey image placeholder (right side on desktop)
2. **교수진** — 2-column card grid (desktop) / 1-column (mobile); each card: grey avatar placeholder + name + 전공 + email placeholder
3. **교육과정** — table: rows = subjects, columns = 학년(1~4) / 구분(필수/선택) / 학점. Dummy 8 subjects.
4. **위치 및 연락정보** — grey map placeholder + address + phone + email text

**Model:** `currentPage = "department"` only (all content is static dummy HTML)

---

## Page 5: Login (`auth/login.html`)

**Controller:** `AuthController` — no changes needed

**Layout:**
- Full-height centered card (white bg, 2px black border)
- Card contents: site title + divider + id input + password input + login button (black fill) + links row (회원가입 | 비밀번호 찾기)
- No sidebar, no featured section
- Mobile: card takes full width with padding

**Model:** `currentPage = "login"` only

---

## DTO Change Summary

| DTO | New fields | New constructor |
|-----|-----------|----------------|
| PostDto | category(String), viewCount(int), date(String), featured(boolean) | 8-arg |
| ScheduleDto | category(String) | 5-arg |
| NoticeDto | no change | — |

**Callers to fix after DTO changes:**
- `MainController` uses PostDto (4-arg) → update to 8-arg
- `MainController` uses ScheduleDto (4-arg) → update to 5-arg
