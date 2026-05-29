# Main Page Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** MainPage에 공지사항 카테고리 필터(localStorage 영속), 인기 게시글 TOP5(좋아요 순), 공지/게시글 상세 페이지 직접 이동을 구현한다.

**Architecture:** 백엔드에서 `/api/main`이 notices 전체·posts 좋아요 TOP5를 반환하도록 수정하고, 프론트엔드 MainPage에서 카테고리 필터 상태를 사용자별 localStorage 키로 영속하며 클릭 시 상세 페이지로 navigate한다.

**Tech Stack:** Java 17 + Spring Boot (백엔드), React 18 + TypeScript + Vite + Vitest + @testing-library/react (프론트엔드)

---

## 파일 맵

| 파일 | 변경 유형 |
|------|----------|
| `demo/demo/src/main/java/com/example/demo/repository/PostRepository.java` | 메서드 1개 추가 |
| `demo/demo/src/main/java/com/example/demo/service/PostService.java` | 메서드 2개 추가 (dept, faculty) |
| `demo/demo/src/main/java/com/example/demo/controller/MainController.java` | notices 전체 반환, posts TOP5 by likes로 수정 |
| `frontend/src/pages/MainPage.tsx` | 필터 상태·UI·navigate 추가 |
| `frontend/src/pages/MainPage.test.tsx` | 기존 테스트 목 업데이트, 신규 테스트 4개 추가 |

---

## Task 1: PostRepository — 좋아요 내림차순 쿼리 메서드 추가

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/repository/PostRepository.java`

- [x] **Step 1: 메서드 추가**

`PostRepository.java`의 기존 메서드 선언 아래에 추가한다:

```java
// 기존 마지막 메서드 바로 아래에 추가
List<Post> findByScopeTypeAndScopeIdOrderByLikesDescCreatedDateDesc(
    String scopeType, Long scopeId);
```

최종 파일 상태 (`PostRepository.java` 관련 부분):
```java
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByScopeTypeAndScopeIdOrderByCreatedDateDesc(String scopeType, Long scopeId);
    Page<Post> findByScopeTypeAndScopeId(String scopeType, Long scopeId, Pageable pageable);
    long countByScopeTypeAndScopeId(String scopeType, Long scopeId);
    long countByScopeTypeAndScopeIdAndCreatedDateBetween(String scopeType, Long scopeId,
                                                          LocalDateTime start, LocalDateTime end);
    List<Post> findByAuthorUsernameOrderByCreatedDateDesc(String authorUsername);

    @Query("SELECT p.id FROM Post p WHERE p.scopeType = :scopeType AND p.scopeId = :scopeId")
    List<Long> findIdsByScopeTypeAndScopeId(@Param("scopeType") String scopeType,
                                             @Param("scopeId") Long scopeId);

    @Query(value = "SELECT COUNT(*) FROM POSTS p " +
                   "JOIN DEPTS d ON p.scope_type = 'dept' AND p.scope_id = d.id " +
                   "JOIN FACULTY_GROUPS fg ON d.faculty_id = fg.id " +
                   "JOIN COLLEGE_SCHOOLS cs ON fg.school_id = cs.id " +
                   "WHERE cs.university_id = :univId AND p.created_date > :since",
           nativeQuery = true)
    long countByUniversityId(@Param("univId") Long univId, @Param("since") LocalDateTime since);

    // 좋아요 내림차순 정렬 (동점 시 최신순)
    List<Post> findByScopeTypeAndScopeIdOrderByLikesDescCreatedDateDesc(
        String scopeType, Long scopeId);
}
```

- [x] **Step 2: 컴파일 확인**

```bash
cd demo/demo && ./mvnw compile -q
```

Expected: 오류 없이 BUILD SUCCESS

- [x] **Step 3: 커밋**

```bash
git add demo/demo/src/main/java/com/example/demo/repository/PostRepository.java
git commit -m "feat: PostRepository에 좋아요 내림차순 정렬 쿼리 추가"
```

---

## Task 2: PostService — getTopPostsByLikesForDept/Faculty 메서드 추가

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/service/PostService.java`

- [x] **Step 1: dept 스코프 메서드 추가**

`PostService.java`에서 `getPostsByDept` 메서드 아래에 추가한다:

```java
public List<PostDto> getTopPostsByLikesForDept(Long deptId, int limit) {
    List<Post> posts = postRepository
            .findByScopeTypeAndScopeIdOrderByLikesDescCreatedDateDesc("dept", deptId);
    if (posts.isEmpty()) {
        return DummyDataHelper.getPostsByDept(deptId).stream()
                .sorted((a, b) -> b.getLikes() - a.getLikes())
                .limit(limit)
                .collect(Collectors.toList());
    }
    return posts.stream().map(this::toDto).limit(limit).collect(Collectors.toList());
}
```

- [x] **Step 2: faculty 스코프 메서드 추가**

`getTopPostsByLikesForDept` 바로 아래에 추가한다:

```java
public List<PostDto> getTopPostsByLikesForFaculty(Long facultyId, int limit) {
    List<Post> posts = postRepository
            .findByScopeTypeAndScopeIdOrderByLikesDescCreatedDateDesc("faculty", facultyId);
    if (posts.isEmpty()) {
        return DummyDataHelper.getPostsByFaculty(facultyId).stream()
                .sorted((a, b) -> b.getLikes() - a.getLikes())
                .limit(limit)
                .collect(Collectors.toList());
    }
    return posts.stream().map(this::toDto).limit(limit).collect(Collectors.toList());
}
```

- [x] **Step 3: 컴파일 확인**

```bash
cd demo/demo && ./mvnw compile -q
```

Expected: BUILD SUCCESS

- [x] **Step 4: 커밋**

```bash
git add demo/demo/src/main/java/com/example/demo/service/PostService.java
git commit -m "feat: PostService에 좋아요 기준 TOP N 게시글 조회 메서드 추가"
```

---

## Task 3: MainController — /api/main, /api/faculty/main 수정

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/controller/MainController.java`

- [x] **Step 1: /api/main 수정**

`apiMain` 메서드를 아래와 같이 수정한다. `List<PostDto> posts = ...` 라인과 `result.put("notices", ...)`, `result.put("posts", ...)` 라인을 교체한다:

```java
@GetMapping("/api/main")
public Map<String, Object> apiMain(@RequestParam(required = false) Long deptId) {
    Long id = deptId != null ? deptId : 1L;
    Map<String, Object> result = new HashMap<>();
    List<NoticeDto>   notices   = noticeService.getNoticesByDept(id);
    List<ScheduleDto> schedules = scheduleService.getSchedulesByDept(id);
    result.put("notices",   notices);   // 전체 반환 (프론트에서 필터링)
    result.put("posts",     postService.getTopPostsByLikesForDept(id, 5));
    result.put("schedules", schedules);
    result.put("today", LocalDate.now()
        .format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 EEEE", Locale.KOREAN)));
    result.put("selectedDeptName", universityService.findDeptName(id));
    return result;
}
```

- [x] **Step 2: /api/faculty/main 수정**

`apiFacultyMain` 메서드도 동일 패턴으로 수정한다:

```java
@GetMapping("/api/faculty/main")
public Map<String, Object> apiFacultyMain(@RequestParam(required = false) Long facultyId) {
    Long id = facultyId != null ? facultyId : 1L;
    Map<String, Object> result = new HashMap<>();
    List<NoticeDto>   notices   = noticeService.getNoticesByFaculty(id);
    List<ScheduleDto> schedules = scheduleService.getSchedulesByFaculty(id);
    result.put("notices",   notices);   // 전체 반환
    result.put("posts",     postService.getTopPostsByLikesForFaculty(id, 5));
    result.put("schedules", schedules);
    result.put("today", LocalDate.now()
        .format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 EEEE", Locale.KOREAN)));
    result.put("selectedFacultyName", universityService.findFacultyName(id));
    return result;
}
```

- [x] **Step 3: 컴파일 확인**

```bash
cd demo/demo && ./mvnw compile -q
```

Expected: BUILD SUCCESS

- [x] **Step 4: 커밋**

```bash
git add demo/demo/src/main/java/com/example/demo/controller/MainController.java
git commit -m "feat: /api/main notices 전체 반환, posts 좋아요 TOP5 반환으로 수정"
```

---

## Task 4: 테스트 모크 업데이트 + 필터 버튼 렌더링 테스트 (Red)

**Files:**
- Modify: `frontend/src/pages/MainPage.test.tsx`

- [x] **Step 1: 테스트 파일의 모크 데이터를 업데이트하고 필터 버튼 렌더링 테스트 추가**

`frontend/src/pages/MainPage.test.tsx` 전체를 아래 내용으로 교체한다:

```tsx
import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, beforeEach } from 'vitest'
import MainPage from './MainPage'

// vi.hoisted: vi.mock 호이스팅 이전에 변수를 안전하게 초기화
const mockNavigate = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...(actual as object), useNavigate: () => mockNavigate }
})

vi.mock('../api/universities', () => ({
  fetchMainData: () => Promise.resolve({
    notices: [
      { id: 1, title: '공지사항 제목1', date: '2026-05-10', author: '학과', category: '학사', viewCount: 10, featured: false, targetGrades: [1,2,3,4] },
      { id: 2, title: '장학금 안내',    date: '2026-05-09', author: '학과', category: '장학', viewCount: 5,  featured: false, targetGrades: [1,2,3,4] },
    ],
    posts: [
      { id: 10, title: '인기글 제목1', date: '2026-05-10', author: '홍길동', likes: 45, category: '자유게시판', viewCount: 100, featured: false, commentCount: 5, targetGrades: [1,2,3,4], visibility: 'public' },
      { id: 11, title: '인기글 제목2', date: '2026-05-09', author: '김철수', likes: 30, category: '스터디',    viewCount: 80,  featured: false, commentCount: 2, targetGrades: [1,2,3,4], visibility: 'public' },
    ],
    schedules: [
      { id: 1, title: '중간고사', date: '2026-05-15', dday: 20, category: '시험' },
      { id: 2, title: '기말고사', date: '2026-06-10', dday: 1,  category: '시험' },
    ],
    today: '2026-05-14 (목)',
  }),
}))

vi.mock('../context/DeptContext', () => ({
  useDept: () => ({ selectedDeptId: 1, selectedDeptName: '컴퓨터공학과' }),
  DeptProvider: ({ children }: { children: React.ReactNode }) => children,
}))

beforeEach(() => {
  localStorage.clear()
  mockNavigate.mockClear()
})

function renderPage() {
  return render(<MemoryRouter><MainPage /></MemoryRouter>)
}

// ── 기존 테스트 ──────────────────────────────────────────────
test('캘린더가 렌더링된다', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByRole('button', { name: '다음 달' })).toBeInTheDocument()
  })
})

test('공지사항 섹션이 렌더링된다', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByText('공지사항 제목1')).toBeInTheDocument()
  })
})

test('인기 게시글 섹션이 렌더링된다', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByText('인기글 제목1')).toBeInTheDocument()
  })
})

test('다가오는 일정 섹션이 렌더링된다', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByText('중간고사')).toBeInTheDocument()
  })
})

test('D-14 이내 일정이 hero 배너에 D-Day 배지로 표시된다', async () => {
  renderPage()
  await waitFor(() => {
    const badges = screen.getAllByText('D-1')
    expect(badges.length).toBeGreaterThan(0)
  })
})

// ── 신규 테스트 ──────────────────────────────────────────────
test('공지사항 카테고리 필터 버튼 5개가 렌더링된다', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '학사' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '장학' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '행사' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '취업' })).toBeInTheDocument()
  })
})

test('학사 필터 클릭 시 학사 공지만 표시된다', async () => {
  renderPage()
  await waitFor(() => screen.getByText('장학금 안내'))

  fireEvent.click(screen.getByRole('button', { name: '학사' }))

  await waitFor(() => {
    expect(screen.getByText('공지사항 제목1')).toBeInTheDocument()
    expect(screen.queryByText('장학금 안내')).not.toBeInTheDocument()
  })
})

test('필터 클릭 시 localStorage에 사용자별 키로 저장된다', async () => {
  renderPage()
  await waitFor(() => screen.getByRole('button', { name: '장학' }))

  fireEvent.click(screen.getByRole('button', { name: '장학' }))

  expect(localStorage.getItem('mainNoticeFilter_guest')).toBe('장학')
})

test('공지사항 아이템 클릭 시 /notice/:id로 이동한다', async () => {
  renderPage()
  await waitFor(() => screen.getByText('공지사항 제목1'))

  fireEvent.click(screen.getByText('공지사항 제목1'))

  expect(mockNavigate).toHaveBeenCalledWith('/notice/1')
})

test('인기 게시글 아이템 클릭 시 /post/:id로 이동한다', async () => {
  renderPage()
  await waitFor(() => screen.getByText('인기글 제목1'))

  fireEvent.click(screen.getByText('인기글 제목1'))

  expect(mockNavigate).toHaveBeenCalledWith('/post/10')
})
```

- [x] **Step 2: 테스트 실행 — FAIL 확인**

```bash
cd frontend && npx vitest run src/pages/MainPage.test.tsx
```

Expected: 신규 테스트 5개 FAIL (필터 버튼 미존재, navigate 미구현)  
기존 테스트 5개는 PASS 유지.

---

## Task 5: MainPage.tsx — 필터 상태·버튼 UI·navigate 전체 구현 (Green)

**Files:**
- Modify: `frontend/src/pages/MainPage.tsx`

- [x] **Step 1: MainPage.tsx 전체를 아래 내용으로 교체**

```tsx
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDept } from '../context/DeptContext'
import { fetchMainData } from '../api/universities'
import Navbar from '../components/Navbar'
import MiniCalendar from '../components/MiniCalendar'
import type { NoticeDto } from '../types/notice'
import type { PostDto } from '../types/post'
import type { ScheduleDto } from '../types/schedule'
import AdminBanner from '../components/common/AdminBanner'

const NOTICE_TABS = ['전체', '학사', '장학', '행사', '취업']

export default function MainPage() {
  const { selectedDeptId, selectedDeptName } = useDept()
  const navigate = useNavigate()

  const username  = sessionStorage.getItem('username') ?? 'guest'
  const FILTER_KEY = `mainNoticeFilter_${username}`

  const [notices,       setNotices]       = useState<NoticeDto[]>([])
  const [posts,         setPosts]         = useState<PostDto[]>([])
  const [schedules,     setSchedules]     = useState<ScheduleDto[]>([])
  const [today,         setToday]         = useState('')
  const [noticeFilter,  setNoticeFilter]  = useState<string>(
    () => localStorage.getItem(FILTER_KEY) ?? '전체'
  )

  useEffect(() => {
    if (!selectedDeptId) return
    fetchMainData(selectedDeptId)
      .then(data => {
        setNotices(data.notices)
        setPosts(data.posts)
        setSchedules(data.schedules)
        setToday(data.today)
      })
      .catch(() => {})
  }, [selectedDeptId])

  const handleFilterChange = (tab: string) => {
    setNoticeFilter(tab)
    localStorage.setItem(FILTER_KEY, tab)
  }

  const filteredNotices = notices
    .filter(n => noticeFilter === '전체' || n.category === noticeFilter)
    .slice(0, 5)

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="pt-14" />

      <section className="bg-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <i className="fas fa-graduation-cap mr-3" />
            {selectedDeptName} 정보 포털
          </h1>
          <p className="text-gray-400 text-sm md:text-base mb-6">{today}</p>
          <div className="flex justify-center flex-wrap gap-2">
            {schedules.filter(s => s.dday >= 0 && s.dday <= 14).map(s => (
              <span key={s.id} className="inline-flex items-center gap-1.5 border border-white text-white text-xs px-3 py-1.5">
                <i className="fas fa-clock text-xs" />
                {s.title}
                <strong>{s.dday === 0 ? 'D-Day' : `D-${s.dday}`}</strong>
              </span>
            ))}
          </div>
        </div>
      </section>

      <AdminBanner scope="dept" targetId={selectedDeptId ?? undefined} />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

          {/* 캘린더 */}
          <div className="h-full">
            <MiniCalendar schedules={schedules} />
          </div>

          {/* 다가오는 일정 */}
          <div className="border-2 border-black flex flex-col">
            <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm"><i className="fas fa-calendar-alt mr-2" />다가오는 일정</span>
              <Link to="/dept/schedule" className="text-xs text-gray-300 hover:text-white transition">더보기 →</Link>
            </div>
            <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {schedules.length === 0 ? (
                <li className="px-4 py-8 text-center text-gray-400 text-sm">
                  <i className="fas fa-calendar block mb-2" />등록된 일정이 없습니다.
                </li>
              ) : schedules.map(s => (
                <li key={s.id} className="px-4 py-3 hover:bg-gray-50 transition flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug line-clamp-1">{s.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.date}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 bg-black text-white flex-shrink-0 whitespace-nowrap">
                    {s.dday === 0 ? 'D-Day' : `D-${s.dday}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 최신 공지사항 */}
          <div className="border-2 border-black flex flex-col">
            <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm"><i className="fas fa-bullhorn mr-2" />최신 공지사항</span>
              <Link to="/dept/notice" className="text-xs text-gray-300 hover:text-white transition">더보기 →</Link>
            </div>
            <div className="flex flex-wrap gap-1 px-4 py-2 border-b border-gray-100">
              {NOTICE_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => handleFilterChange(tab)}
                  aria-pressed={noticeFilter === tab}
                  className={`px-2 py-0.5 text-xs border font-medium transition ${
                    noticeFilter === tab
                      ? 'bg-black text-white border-black'
                      : 'border-gray-300 text-gray-500 hover:border-black hover:text-black'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <ul className="flex-1 divide-y divide-gray-100">
              {filteredNotices.length === 0 ? (
                <li className="px-4 py-8 text-center text-gray-400 text-sm">
                  <i className="fas fa-inbox block mb-2" />공지사항이 없습니다.
                </li>
              ) : filteredNotices.map(n => (
                <li
                  key={n.id}
                  onClick={() => navigate(`/notice/${n.id}`)}
                  className="px-4 py-3 hover:bg-gray-50 transition flex items-start justify-between gap-2 cursor-pointer"
                >
                  <span className="text-sm font-medium leading-snug flex-1 min-w-0 line-clamp-1">{n.title}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{n.date}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 인기 게시글 */}
          <div className="border-2 border-black flex flex-col">
            <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm"><i className="fas fa-fire mr-2" />인기 게시글</span>
              <Link to="/dept/board" className="text-xs text-gray-300 hover:text-white transition">더보기 →</Link>
            </div>
            <ul className="flex-1 divide-y divide-gray-100">
              {posts.length === 0 ? (
                <li className="px-4 py-8 text-center text-gray-400 text-sm">
                  <i className="fas fa-inbox block mb-2" />게시글이 없습니다.
                </li>
              ) : posts.map(p => (
                <li
                  key={p.id}
                  onClick={() => navigate(`/post/${p.id}`)}
                  className="px-4 py-3 hover:bg-gray-50 transition flex items-start justify-between gap-2 cursor-pointer"
                >
                  <span className="text-sm font-medium leading-snug flex-1 min-w-0 line-clamp-1">{p.title}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                    <i className="fas fa-heart text-red-400 mr-0.5" />{p.likes}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: '/dept/notice',     icon: 'fa-bullhorn',     label: '공지사항' },
            { to: '/dept/board',      icon: 'fa-comments',     label: '게시판' },
            { to: '/dept/schedule',   icon: 'fa-calendar-alt', label: '일정' },
            { to: '/dept/department', icon: 'fa-university',   label: '학과정보' },
          ].map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-3 py-6 border-2 border-black hover:bg-black hover:text-white transition font-medium text-sm"
            >
              <i className={`fas ${icon} text-2xl`} />{label}
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
```

- [x] **Step 2: 테스트 실행 — 전체 PASS 확인**

```bash
cd frontend && npx vitest run src/pages/MainPage.test.tsx
```

Expected: 10개 테스트 모두 PASS

- [x] **Step 3: 커밋**

```bash
git add frontend/src/pages/MainPage.tsx frontend/src/pages/MainPage.test.tsx
git commit -m "feat: MainPage 공지 카테고리 필터·localStorage 영속·상세 페이지 네비게이션 구현"
```

---

## Task 6: 전체 테스트 실행 및 회귀 확인

**Files:** 없음 (실행만)

- [x] **Step 1: 프론트엔드 전체 테스트 실행**

```bash
cd frontend && npx vitest run
```

Expected: 기존 모든 테스트 PASS (BoardPage, NoticePage, CalendarPage 등 포함)

- [x] **Step 2: 회귀가 있을 경우 처리**

실패 테스트가 있다면 원인을 파악한 뒤 수정한다.  
새로운 모크나 import 문제라면 해당 테스트 파일만 수정하고 구현 코드는 건드리지 않는다.

- [x] **Step 3: 최종 커밋 (회귀 수정 있을 경우에만)**

```bash
git add -p  # 수정된 테스트 파일만 선택적으로 추가
git commit -m "fix: 회귀 테스트 수정"
```

---

## 검증 체크리스트

- [x] DB에 게시글이 없을 때 더미 데이터가 좋아요 순으로 표시된다
- [x] 필터 '학사' 선택 → '학사' 카테고리 공지만 표시된다
- [x] 필터 선택 → 로그아웃 → 재로그인 후 같은 사용자명으로 접속 시 필터가 유지된다
- [x] 공지 아이템 클릭 → `/notice/:id` 상세 페이지로 이동한다
- [x] 게시글 아이템 클릭 → `/post/:id` 상세 페이지로 이동한다
- [x] '더보기 →' 링크는 여전히 목록 페이지(`/dept/notice`, `/dept/board`)로 이동한다
