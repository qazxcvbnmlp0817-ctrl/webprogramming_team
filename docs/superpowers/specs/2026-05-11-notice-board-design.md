# Notice Board Page — Design Spec
**Date:** 2026-05-11  
**Page:** `notice/list.html` (NoticeController GET /notice)  
**Stack:** Spring Boot + Thymeleaf + Tailwind CSS (standalone, no Bootstrap)

---

## Goals
Replace the placeholder `notice/list.html` with a complete B&W minimalist notice board. Skeleton phase: dummy data only. Team member fills real data later.

---

## Section 1: Navbar (fixed top)

- `position: fixed; top: 0; width: 100%`
- Background: `#000000`, text: `#FFFFFF`
- Layout: logo left | nav links center | search input + login button right
- Active page (공지사항) shows white underline
- Mobile (< 768px): hamburger icon → full-width slide-down menu

---

## Section 2: Featured Notice + Filter Tabs

**Featured card (full width):**
- 16:9 black/white image placeholder
- Title overlay (white text on dark gradient)
- Meta: `[긴급]` badge · date · category · view count

**Filter tabs (below featured):**
- Options: 전체 | 학사 | 장학 | 행사 | 취업
- Active tab: black background + white text
- Inactive tab: border only, transparent background
- Click → JS filters the notice list by category (dummy data)

---

## Section 3: Two-Column Main Content

### Left column (70%): Notice list
Each row:
- Small B&W thumbnail placeholder (left)
- Title (bold, hover underline)
- Category badge `[학사]` style
- Date · eye icon · view count

Bottom: numeric pagination `[1] [2] [3] … [10]`

### Right column (30%): Sidebar panels
1. **Category count widget** — list of categories with post counts (dummy)
2. **Recent notices widget** — 5 latest titles + dates (dummy)

### Responsive
- Desktop (≥ 1024px): 70/30 two-column
- Tablet (768–1023px): 60/40 two-column
- Mobile (< 768px): single column (sidebar stacks below list)

---

## Technical Notes

- Tailwind CSS via CDN (`<script src="https://cdn.tailwindcss.com">`)
- No Bootstrap on this page (full replacement)
- Korean comments in code
- Thymeleaf syntax preserved (`th:each`, `th:text`, `th:href`)
- Dummy data hardcoded in HTML for skeleton phase
- File: `demo/demo/src/main/resources/templates/notice/list.html`

---

## Out of Scope (team member fills later)
- Real DB queries
- Pagination logic
- Search functionality
- Login/auth integration
