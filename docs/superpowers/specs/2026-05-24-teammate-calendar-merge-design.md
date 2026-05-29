---
name: teammate-calendar-merge
description: 팀원(racoon809) 캘린더 UI를 공유 컴포넌트로 추출하여 개인 캘린더(/calendar)와 모든 일정 페이지(dept/school/faculty)에 통합
metadata:
  type: project
---

# 팀원 캘린더 기능 머지 설계 (v2)

## 배경 및 목표

팀원 브랜치(`webprogramming_team-racoon809-login-ui`)의 풍부한 캘린더 UI(미니캘린더 사이드바, 이벤트 칩, 호버 툴팁, 일별 패널, 추가/수정/삭제 모달)를 프로젝트 전체 일정 페이지에 통합한다.

- `/calendar` (개인, localStorage) — 팀원 UI + CRUD 활성화
- `/dept/schedule` (학과 공식, API) — 팀원 UI + 읽기 전용
- `/school/schedule` (학교 공식, API) — 팀원 UI + 읽기 전용
- `/school/faculty/:id/schedule` (학부 공식, API) — 팀원 UI + 읽기 전용

## 불변 제약

- LoginPage 교체 금지 — 현재 버전이 더 완성도 높음 (adminRole/deptId 저장, 버그 없음)
- 기존 라우팅 구조 변경 금지
- CSS/Tailwind 설정 변경 없음
- IntroAnimation, UniversityListPage 수정 금지

## 파일 구조

### 신규 파일

| 경로 | 역할 |
|---|---|
| `frontend/src/utils/scheduleItem.ts` | 공유 정규화 타입 (`ScheduleItem`, `CategoryMeta`, `API_CATEGORY_META`, `PERSONAL_CATEGORY_META`) |
| `frontend/src/components/schedule/ScheduleCalendarView.tsx` | 공유 캘린더 UI 컴포넌트 |
| `frontend/src/utils/localSchedule.ts` | localStorage CRUD (개인 캘린더 전용) |
| `frontend/src/components/ScheduleModal.tsx` | 독립형 일정 추가 모달 (예비) |
| `frontend/src/components/ScheduleDetailModal.tsx` | 독립형 상세 모달 (예비) |

### 수정 파일

| 경로 | 변경 내용 |
|---|---|
| `frontend/src/pages/CalendarPage.tsx` | `ScheduleCalendarView` 사용, localStorage CRUD 연결 |
| `frontend/src/pages/SchedulePage.tsx` | `ScheduleCalendarView` 사용, API 데이터 연결 |
| `frontend/src/pages/SchoolSchedulePage.tsx` | `ScheduleCalendarView` 사용, API 데이터 연결 |
| `frontend/src/pages/FacultySchedulePage.tsx` | `ScheduleCalendarView` 사용, API 데이터 연결 |
| `frontend/src/App.tsx` | `/calendar` 라우트 추가 |
| `demo/demo/.../SpaController.java` | `/calendar` 폴백 경로 추가 |

## 데이터 아키텍처

### ScheduleItem (공유 정규화 타입)

```typescript
interface ScheduleItem {
  id: string
  title: string
  date: string        // YYYY-MM-DD
  category: string
  startTime?: string  // HH:MM — 개인 캘린더
  endTime?: string    // HH:MM — 개인 캘린더
  allDay?: boolean    // 개인 캘린더
  content?: string    // 개인 캘린더
  dday?: number       // 서버 계산 — API 페이지
}
```

- `LocalSchedule`은 구조적으로 `ScheduleItem`의 상위집합 → 캐스트 없이 대입 가능
- API `ScheduleDto`(id: number) → `{ ...dto, id: String(dto.id) }` 변환 후 사용

### CategoryMeta

```typescript
interface CategoryMeta { label: string; color: string }
```

- `API_CATEGORY_META`: 학사/행사/시험/기타 (API 페이지용)
- `PERSONAL_CATEGORY_META`: meeting/task/exam/personal/other (개인 캘린더용)

## ScheduleCalendarView Props

```typescript
interface ScheduleCalendarViewProps {
  schedules: ScheduleItem[]
  categoryMeta: Record<string, CategoryMeta>
  loading?: boolean
  canWrite?: boolean    // true이면 추가/수정/삭제 UI 노출
  onSave?: (data: Omit<ScheduleItem, 'id'> & { id?: string }) => void
  onDelete?: (id: string) => void
}
```

- `canWrite=false` (기본값): 읽기 전용 — API 일정 페이지
- `canWrite=true` + `onSave` + `onDelete`: CRUD 활성화 — 개인 캘린더

### 미래 API 연동 방법

API 일정 페이지에 쓰기 기능을 추가할 때는 해당 페이지에서만:

```typescript
// 예: SchedulePage.tsx에 어드민 쓰기 추가 시
const isAdmin = sessionStorage.getItem('adminRole') === 'dept'
<ScheduleCalendarView
  schedules={schedules}
  categoryMeta={API_CATEGORY_META}
  loading={loading}
  canWrite={isAdmin}
  onSave={isAdmin ? handleApiSave : undefined}
  onDelete={isAdmin ? handleApiDelete : undefined}
/>
```

`ScheduleCalendarView` 자체는 변경 불필요.

## 검증 기준

1. `/calendar` — 개인 캘린더 정상 렌더링, CRUD 후 새로고침 데이터 유지
2. `/dept/schedule` — API 일정 표시, 추가/수정/삭제 UI 없음
3. `/school/schedule` — API 일정 표시, 추가/수정/삭제 UI 없음
4. `/school/faculty/:id/schedule` — API 일정 표시, 추가/수정/삭제 UI 없음
5. IntroAnimation, UniversityListPage 기존 기능 정상 동작 유지
6. TypeScript 컴파일 오류 없음 (`npx tsc --noEmit`)
7. 88개 테스트 전체 통과
