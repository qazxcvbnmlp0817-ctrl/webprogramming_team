# Main Page Features Design

**Date:** 2026-05-27  
**Scope:** MainPage 4개 기능 — 캘린더/일정, 공지사항 필터, 인기 게시글 TOP 5, 상세 페이지 네비게이션

---

## 1. 요구사항 요약

| 기능 | 요구사항 |
|------|----------|
| 캘린더 & 다가오는 일정 | DB 실데이터 연동, 없으면 더미 폴백 (이미 구현됨, 확인 필요) |
| 최신 공지사항 | 카테고리 필터 버튼 추가, 필터 상태를 사용자별 localStorage에 영속 |
| 인기 게시글 TOP 5 | 좋아요 수 기준 상위 5개 표시 (현재는 최신순) |
| 네비게이션 | 공지/게시글 클릭 시 목록이 아닌 상세 페이지로 이동 |

---

## 2. 아키텍처 & 데이터 흐름

```
[MainPage mount]
    └─ fetchMainData(deptId)  →  GET /api/main?deptId=X
           ├─ notices:   전체 목록 (날짜 DESC, 제한 없음)
           ├─ posts:     좋아요 TOP 5 (likes DESC)
           └─ schedules: 전체 (날짜 ASC)

[MainPage state]
    ├─ notices[]       ← API 전체 공지
    ├─ noticeFilter    ← localStorage 복원 (기본값: '전체')
    ├─ posts[]         ← API TOP 5 (이미 정렬됨)
    └─ schedules[]     ← API 전체

[렌더링]
    ├─ MiniCalendar      ← schedules (변경 없음)
    ├─ 다가오는 일정      ← schedules (변경 없음)
    ├─ 최신 공지사항      ← notices.filter(category).slice(0,5) + 필터 버튼
    └─ 인기 게시글        ← posts (이미 TOP 5로 정렬)
```

더미 데이터 폴백은 기존 `DummyDataHelper`가 서비스 레이어에서 그대로 담당.

---

## 3. 백엔드 변경

### 3-1. PostRepository
```java
List<Post> findByScopeTypeAndScopeIdOrderByLikesDescCreatedDateDesc(
    String scopeType, Long scopeId);
```

### 3-2. PostService — 새 메서드
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

### 3-3. MainController — `/api/main` 변경
```java
// Before
result.put("notices", notices.subList(0, Math.min(5, notices.size())));
result.put("posts",   posts.subList(0, Math.min(5, posts.size())));

// After
result.put("notices", notices);  // 전체 반환 (프론트에서 필터링)
result.put("posts",   postService.getTopPostsByLikesForDept(id, 5));
```

`/api/faculty/main`도 동일 패턴으로 적용 (faculty 스코프 메서드 추가).

---

## 4. 프론트엔드 변경 (MainPage.tsx)

### 4-1. 필터 상태 초기화 및 영속
```typescript
const NOTICE_TABS = ['전체', '학사', '장학', '행사', '취업']

// 사용자별 localStorage 키 (로그아웃 후 재로그인 시에도 유지)
const username = sessionStorage.getItem('username') ?? 'guest'
const FILTER_KEY = `mainNoticeFilter_${username}`

const [noticeFilter, setNoticeFilter] = useState<string>(
  () => localStorage.getItem(FILTER_KEY) ?? '전체'
)

const handleFilterChange = (tab: string) => {
  setNoticeFilter(tab)
  localStorage.setItem(FILTER_KEY, tab)
}

const filteredNotices = notices
  .filter(n => noticeFilter === '전체' || n.category === noticeFilter)
  .slice(0, 5)
```

### 4-2. 공지사항 섹션 UI
- 헤더 아래에 필터 버튼 행 추가 (NoticePage의 카테고리 필터와 동일 스타일)
- 공지 아이템 클릭 → `navigate(`/notice/${n.id}`)`
- `<Link to="/dept/notice">` (더보기) 유지

### 4-3. 인기 게시글 섹션
- 게시글 아이템 클릭 → `navigate(`/post/${p.id}`)`
- `<Link to="/dept/board">` (더보기) 유지
- 정렬은 백엔드가 이미 처리하므로 프론트 로직 변경 없음

### 4-4. `useNavigate` 훅 추가
MainPage에 `const navigate = useNavigate()` 추가 (현재 없음).

---

## 5. 더미 데이터 폴백 메커니즘

변경 없음. 기존 패턴 그대로 유지:
- `ScheduleService.getSchedulesByDept()` — DB 비어있으면 `DummyDataHelper.getSchedulesByDept()`
- `NoticeService.getNoticesByDept()` — DB 비어있으면 `DummyDataHelper.getNoticesByDept()`
- `PostService.getTopPostsByLikesForDept()` — DB 비어있으면 더미 데이터 좋아요 정렬 후 반환

---

## 6. 영향 범위

| 파일 | 변경 유형 |
|------|----------|
| `PostRepository.java` | 메서드 1개 추가 |
| `PostService.java` | 메서드 1개 추가 |
| `MainController.java` | `/api/main`, `/api/faculty/main` 각 2줄 수정 |
| `MainPage.tsx` | 필터 상태, 필터 버튼 UI, navigate 훅, 클릭 핸들러 수정 |
| `universities.ts` | 변경 없음 |

---

## 7. 테스트 포인트

- DB에 게시글 없을 때 더미 데이터가 좋아요 순으로 표시되는지 확인
- 필터 선택 후 로그아웃 → 재로그인 시 필터가 복원되는지 확인
- 공지/게시글 클릭 시 상세 페이지로 이동하는지 확인
- 카테고리 필터가 `filteredNotices.slice(0,5)`를 정확히 적용하는지 확인
