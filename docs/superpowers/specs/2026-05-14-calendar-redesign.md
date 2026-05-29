# MainPage 캘린더 통합 & 레이아웃 개편 설계

**날짜:** 2026-05-14  
**상태:** 승인됨  
**대상 파일:**
- `frontend/src/pages/MainPage.tsx` (수정)
- `frontend/src/components/Navbar.tsx` (수정)
- `frontend/src/components/MiniCalendar.tsx` (신규)

---

## 1. 목표

MainPage의 기존 3열 그리드(공지사항 / 인기 게시글 / 다가오는 일정)를 개편하여 커스텀 캘린더 컴포넌트를 통합하고, Navbar에 학교 변경 버튼을 추가한다.

---

## 2. 레이아웃

### 데스크탑 (lg 이상, 3열 Grid)

```
┌─────────────────────────────────┬──────────────────┐
│  MiniCalendar          (col 1-2)│  공지사항  (col 3)│
├─────────────────────────────────│                  │
│  다가오는 일정         (col 1-2)│  인기게시글(col 3)│
└─────────────────────────────────┴──────────────────┘
```

### 모바일 (lg 미만, 1열 스택)

DOM 순서 그대로 세로 배치:
1. MiniCalendar
2. 다가오는 일정
3. 공지사항
4. 인기게시글

### 구현 방식

HTML DOM 순서를 모바일 기준(캘린더 → 일정 → 공지 → 게시글)으로 유지하고,
Tailwind CSS Grid의 `lg:col-span-2`, `lg:col-start-3`, `lg:row-start-N`으로 데스크탑 배치를 명시한다.

```html
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div class="lg:col-span-2 lg:row-start-1"> <!-- MiniCalendar -->
  <div class="lg:col-span-2 lg:row-start-2"> <!-- 다가오는 일정 -->
  <div class="lg:col-start-3 lg:row-start-1"> <!-- 공지사항 -->
  <div class="lg:col-start-3 lg:row-start-2"> <!-- 인기게시글 -->
</div>
```

### 변경 없는 요소

- Hero 배너 (학과명, 오늘 날짜, D-Day 뱃지)
- 하단 4개 빠른 이동 버튼 그리드 (공지/게시판/일정/학과)

---

## 3. MiniCalendar 컴포넌트

### Props

```typescript
interface MiniCalendarProps {
  schedules: ScheduleDto[]
}
```

### 내부 상태

| 상태 | 타입 | 설명 |
|---|---|---|
| `currentMonth` | `{ year: number, month: number }` | 현재 표시 중인 연/월 |
| `hoveredDate` | `string \| null` | 팝오버 표시 기준 날짜 (`YYYY-MM-DD`) |
| `popoverPos` | `{ x: number, y: number } \| null` | 팝오버 절대 위치 |

### 달력 셀 표시 규칙

- **오늘**: `bg-black text-white` 배경
- **이벤트 있는 날**: 날짜 숫자 아래 흑색 점 표시
  - 이벤트 1개: 점 1개
  - 이벤트 2개: 점 2개
  - 이벤트 3개 이상: 점 3개 + `+N` 텍스트
- **색상 구분 없음**: 흑백 점만 사용, 카테고리는 팝오버 텍스트로만 구분

### 팝오버

- **트리거**: 데스크탑 `onMouseEnter` / 모바일 `onClick` (터치 이벤트)
- **닫기**: 데스크탑 `onMouseLeave` / 모바일 외부 클릭 또는 동일 셀 재클릭
- **위치**: 셀 기준 절대 좌표, 화면 우측 가장자리 감지 시 왼쪽으로 반전
- **내용**:
  ```
  📅 5월 5일
  ─────────────────
  • 어린이날 (행사)
  • 중간고사 (시험)
  ```
- **터치 타겟**: 최소 44×44px (모바일 접근성)

### 월 이동

- `◀` / `▶` 버튼으로 이전/다음 달 이동
- 데이터는 전체 `schedules` prop에서 연/월 기준 필터링 (추가 API 호출 없음)

### 데이터 처리

```typescript
// 날짜 문자열 파싱 실패 시 해당 이벤트 무시
const dateObj = new Date(schedule.date)
if (isNaN(dateObj.getTime())) return // skip
```

---

## 4. Navbar 변경

### 추가 버튼

| 속성 | 값 |
|---|---|
| 레이블 | `학교 변경` |
| 위치 (데스크탑) | 로그인 버튼 왼쪽 |
| 위치 (모바일) | 드롭다운 메뉴 내 로그인 링크 위 |
| 이동 경로 | `/universities` |
| 스타일 | 기존 로그인 버튼과 동일한 `border border-white` 아웃라인 스타일 |

---

## 5. 데이터 흐름

```
MainPage
  └─ fetchMainData(selectedDeptName)
       └─ schedules: ScheduleDto[]
            ├─ <MiniCalendar schedules={schedules} />
            └─ 다가오는 일정 섹션 (기존 리스트 렌더링 유지)
```

`MiniCalendar`는 전달받은 `schedules` 전체를 받아 내부에서 현재 표시 달 기준으로 필터링한다. 별도 API 호출 없음.

---

## 6. 엣지 케이스

| 상황 | 처리 방식 |
|---|---|
| `schedules` 빈 배열 | 달력 정상 렌더링, 점 없음 (빈 상태 메시지 불필요) |
| 같은 날 이벤트 4개 이상 | 점 3개 + `+N` 텍스트 |
| `date` 형식 오류 | `isNaN` 체크 후 해당 이벤트 무시 |
| 팝오버 화면 우측 이탈 | `getBoundingClientRect`로 감지 후 왼쪽으로 반전 |
| 모바일 hover 없음 | click/touch로 팝오버 토글 |

---

## 7. 신규 파일 목록

| 파일 | 변경 유형 |
|---|---|
| `frontend/src/components/MiniCalendar.tsx` | 신규 생성 |
| `frontend/src/pages/MainPage.tsx` | 레이아웃 및 MiniCalendar 통합 |
| `frontend/src/components/Navbar.tsx` | 학교 변경 버튼 추가 |
