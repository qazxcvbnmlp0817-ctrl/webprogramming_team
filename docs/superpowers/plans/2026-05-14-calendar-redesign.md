# MainPage 캘린더 통합 & 레이아웃 개편 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** MainPage에 커스텀 MiniCalendar 컴포넌트를 추가하고, 2/3+1/3 그리드 레이아웃으로 개편하며 Navbar에 학교 변경 버튼을 추가한다.

**Architecture:** MiniCalendar는 `schedules: ScheduleDto[]` prop을 받아 독립 렌더링한다. MainPage의 기존 `fetchMainData` 결과를 공유하여 추가 API 호출이 없다. CSS Grid의 명시적 row/column 배치로 모바일(DOM 순서 그대로)과 데스크탑(2/3+1/3)을 지원한다.

**Tech Stack:** React 19 + TypeScript, Tailwind CSS v3, Vitest + @testing-library/react, React Router DOM v7

---

## 파일 구조

| 파일 | 변경 |
|---|---|
| `frontend/src/components/MiniCalendar.tsx` | 신규 생성 |
| `frontend/src/components/MiniCalendar.test.tsx` | 신규 생성 |
| `frontend/src/pages/MainPage.tsx` | 수정 — 레이아웃 개편, MiniCalendar 통합 |
| `frontend/src/pages/MainPage.test.tsx` | 신규 생성 |
| `frontend/src/components/Navbar.tsx` | 수정 — 학교 변경 버튼 추가 |
| `frontend/src/components/Navbar.test.tsx` | 수정 — 학교 변경 버튼 테스트 추가 |

---

## Task 1: MiniCalendar 헬퍼 함수 (TDD)

**Files:**
- Create: `frontend/src/components/MiniCalendar.tsx`
- Create: `frontend/src/components/MiniCalendar.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

`frontend/src/components/MiniCalendar.test.tsx` 파일을 생성한다:

```tsx
import { buildCalendarGrid, getEventsForDate } from './MiniCalendar'
import type { ScheduleDto } from '../types/schedule'

describe('buildCalendarGrid', () => {
  test('6행 7열(42칸)을 반환한다', () => {
    const grid = buildCalendarGrid(2026, 5)
    expect(grid).toHaveLength(6)
    grid.forEach(row => expect(row).toHaveLength(7))
  })

  test('2026년 5월 1일은 금요일(index 5)이므로 앞 5칸이 null이다', () => {
    const grid = buildCalendarGrid(2026, 5)
    expect(grid[0].slice(0, 5)).toEqual([null, null, null, null, null])
    expect(grid[0][5]).toBe(1)
  })

  test('2026년 5월은 31일까지다', () => {
    const grid = buildCalendarGrid(2026, 5)
    const days = grid.flat().filter((d): d is number => d !== null)
    expect(days[days.length - 1]).toBe(31)
  })

  test('2026년 2월은 28일까지다', () => {
    const grid = buildCalendarGrid(2026, 2)
    const days = grid.flat().filter((d): d is number => d !== null)
    expect(days).toHaveLength(28)
    expect(days[days.length - 1]).toBe(28)
  })
})

describe('getEventsForDate', () => {
  const schedules: ScheduleDto[] = [
    { id: 1, title: '이벤트1', date: '2026-05-10', dday: 0, category: '학사' },
    { id: 2, title: '이벤트2', date: '2026-05-10', dday: 0, category: '시험' },
    { id: 3, title: '이벤트3', date: '2026-05-11', dday: 1, category: '행사' },
  ]

  test('해당 날짜의 이벤트만 반환한다', () => {
    expect(getEventsForDate(schedules, '2026-05-10')).toHaveLength(2)
  })

  test('이벤트 없는 날짜는 빈 배열을 반환한다', () => {
    expect(getEventsForDate(schedules, '2026-05-12')).toHaveLength(0)
  })

  test('잘못된 date 형식의 이벤트는 무시된다', () => {
    const withInvalid: ScheduleDto[] = [
      ...schedules,
      { id: 4, title: '오류', date: 'not-a-date', dday: 0, category: '기타' },
    ]
    expect(getEventsForDate(withInvalid, '2026-05-10')).toHaveLength(2)
  })
})
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

```bash
cd frontend && npx vitest run src/components/MiniCalendar.test.tsx --reporter=verbose
```

예상 결과: `Cannot find module './MiniCalendar'` 오류 또는 전체 FAIL

- [ ] **Step 3: 헬퍼 함수 구현**

`frontend/src/components/MiniCalendar.tsx` 파일을 생성한다:

```tsx
import type { ScheduleDto } from '../types/schedule'

export function buildCalendarGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length < 42) cells.push(null)
  return Array.from({ length: 6 }, (_, i) => cells.slice(i * 7, i * 7 + 7))
}

export function getEventsForDate(schedules: ScheduleDto[], dateStr: string): ScheduleDto[] {
  return schedules.filter(s => {
    if (isNaN(new Date(s.date).getTime())) return false
    return s.date === dateStr
  })
}

export default function MiniCalendar(_: { schedules: ScheduleDto[] }) {
  return <div />
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd frontend && npx vitest run src/components/MiniCalendar.test.tsx --reporter=verbose
```

예상 결과: `buildCalendarGrid > 6행 7열(42칸)을 반환한다 ✓` 등 6개 테스트 PASS

- [ ] **Step 5: 커밋**

```bash
cd frontend && git add src/components/MiniCalendar.tsx src/components/MiniCalendar.test.tsx
git commit -m "feat: add MiniCalendar helper functions (buildCalendarGrid, getEventsForDate)"
```

---

## Task 2: MiniCalendar 기본 렌더링 (TDD)

**Files:**
- Modify: `frontend/src/components/MiniCalendar.tsx`
- Modify: `frontend/src/components/MiniCalendar.test.tsx`

- [ ] **Step 1: 실패하는 테스트 추가**

`MiniCalendar.test.tsx` 파일 상단 import 블록(첫 두 줄 아래)에 아래 두 줄을 추가한다:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import MiniCalendar from './MiniCalendar'
```

그리고 파일 **하단**(기존 describe 블록 아래)에 새 describe 블록을 추가한다:

```tsx
describe('MiniCalendar 컴포넌트', () => {
  test('연/월 헤더가 렌더링된다', () => {
    render(<MiniCalendar schedules={[]} />)
    expect(screen.getByText(/\d{4}년 \d{1,2}월/)).toBeInTheDocument()
  })

  test('요일 헤더 7개가 렌더링된다', () => {
    render(<MiniCalendar schedules={[]} />)
    for (const day of ['일', '월', '화', '수', '목', '금', '토']) {
      expect(screen.getByText(day)).toBeInTheDocument()
    }
  })

  test('오늘 날짜 셀에 bg-black 클래스가 적용된다', () => {
    render(<MiniCalendar schedules={[]} />)
    const today = new Date().getDate()
    const todaySpan = screen.getAllByText(String(today)).find(el =>
      el.className.includes('bg-black')
    )
    expect(todaySpan).toBeTruthy()
  })

  test('▶ 클릭 시 표시 달이 변경된다', () => {
    render(<MiniCalendar schedules={[]} />)
    const header = screen.getByText(/\d{4}년 \d{1,2}월/)
    const before = header.textContent
    fireEvent.click(screen.getByRole('button', { name: '다음 달' }))
    expect(header.textContent).not.toBe(before)
  })

  test('◀ 클릭 시 표시 달이 변경된다', () => {
    render(<MiniCalendar schedules={[]} />)
    const header = screen.getByText(/\d{4}년 \d{1,2}월/)
    const before = header.textContent
    fireEvent.click(screen.getByRole('button', { name: '이전 달' }))
    expect(header.textContent).not.toBe(before)
  })
})
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

```bash
cd frontend && npx vitest run src/components/MiniCalendar.test.tsx --reporter=verbose
```

예상 결과: `MiniCalendar 컴포넌트` 내 테스트들 FAIL

- [ ] **Step 3: 컴포넌트 기본 구현으로 교체**

`frontend/src/components/MiniCalendar.tsx` 전체를 아래 내용으로 교체한다:

```tsx
import { useState } from 'react'
import type { ScheduleDto } from '../types/schedule'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

export function buildCalendarGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length < 42) cells.push(null)
  return Array.from({ length: 6 }, (_, i) => cells.slice(i * 7, i * 7 + 7))
}

export function getEventsForDate(schedules: ScheduleDto[], dateStr: string): ScheduleDto[] {
  return schedules.filter(s => {
    if (isNaN(new Date(s.date).getTime())) return false
    return s.date === dateStr
  })
}

function pad(n: number) { return String(n).padStart(2, '0') }
function toDateStr(y: number, m: number, d: number) { return `${y}-${pad(m)}-${pad(d)}` }

interface Props { schedules: ScheduleDto[] }

export default function MiniCalendar({ schedules }: Props) {
  const now = new Date()
  const todayStr = toDateStr(now.getFullYear(), now.getMonth() + 1, now.getDate())

  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const grid = buildCalendarGrid(year, month)

  return (
    <div className="border-2 border-black flex flex-col">
      <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
        <button onClick={prevMonth} aria-label="이전 달" className="hover:opacity-70 transition px-1">◀</button>
        <span className="font-bold text-sm">{year}년 {month}월</span>
        <button onClick={nextMonth} aria-label="다음 달" className="hover:opacity-70 transition px-1">▶</button>
      </div>

      <div className="p-3">
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-bold text-gray-500 py-1">{d}</div>
          ))}
        </div>

        {grid.map((row, ri) => (
          <div key={ri} className="grid grid-cols-7">
            {row.map((day, ci) => {
              if (day === null) return <div key={ci} className="min-h-[44px]" />
              const dateStr = toDateStr(year, month, day)
              const isToday = dateStr === todayStr
              return (
                <div key={ci} data-testid={`cell-${dateStr}`} className="flex flex-col items-center py-1 min-h-[44px]">
                  <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center ${isToday ? 'bg-black text-white rounded-full' : ''}`}>
                    {day}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd frontend && npx vitest run src/components/MiniCalendar.test.tsx --reporter=verbose
```

예상 결과: Task 1 + Task 2의 전체 테스트 PASS

- [ ] **Step 5: 커밋**

```bash
git add frontend/src/components/MiniCalendar.tsx frontend/src/components/MiniCalendar.test.tsx
git commit -m "feat: implement MiniCalendar base rendering with month navigation"
```

---

## Task 3: MiniCalendar 이벤트 점 & 팝오버 (TDD)

**Files:**
- Modify: `frontend/src/components/MiniCalendar.tsx`
- Modify: `frontend/src/components/MiniCalendar.test.tsx`

- [ ] **Step 1: 실패하는 테스트 추가**

`MiniCalendar.test.tsx`의 `describe('MiniCalendar 컴포넌트')` 블록 안에 추가한다:

```tsx
  test('이벤트 있는 날짜에 점이 렌더링된다', () => {
    const today = new Date()
    const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate())
    render(<MiniCalendar schedules={[{ id: 1, title: '중간고사', date: todayStr, dday: 0, category: '시험' }]} />)
    const cell = screen.getByTestId(`cell-${todayStr}`)
    expect(cell.querySelector('.rounded-full.bg-black:not(.w-6)')).toBeTruthy()
  })

  test('이벤트 4개이면 점 3개와 +1이 표시된다', () => {
    const today = new Date()
    const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate())
    const schedules = Array.from({ length: 4 }, (_, i) => ({
      id: i + 1, title: `이벤트${i + 1}`, date: todayStr, dday: 0, category: '학사',
    }))
    render(<MiniCalendar schedules={schedules} />)
    expect(screen.getByText('+1')).toBeInTheDocument()
  })

  test('이벤트 있는 셀에 마우스 올리면 팝오버가 나타난다', () => {
    const today = new Date()
    const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate())
    render(<MiniCalendar schedules={[{ id: 1, title: '중간고사', date: todayStr, dday: 0, category: '시험' }]} />)
    fireEvent.mouseEnter(screen.getByTestId(`cell-${todayStr}`))
    expect(screen.getByTestId('calendar-popover')).toBeInTheDocument()
    expect(screen.getByText(/중간고사/)).toBeInTheDocument()
    expect(screen.getByText(/시험/)).toBeInTheDocument()
  })

  test('마우스가 셀을 떠나면 팝오버가 사라진다', () => {
    const today = new Date()
    const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate())
    render(<MiniCalendar schedules={[{ id: 1, title: '중간고사', date: todayStr, dday: 0, category: '시험' }]} />)
    const cell = screen.getByTestId(`cell-${todayStr}`)
    fireEvent.mouseEnter(cell)
    fireEvent.mouseLeave(cell)
    expect(screen.queryByTestId('calendar-popover')).not.toBeInTheDocument()
  })

  test('이벤트 없는 셀에 마우스 올려도 팝오버가 나타나지 않는다', () => {
    render(<MiniCalendar schedules={[]} />)
    const today = new Date()
    const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate())
    fireEvent.mouseEnter(screen.getByTestId(`cell-${todayStr}`))
    expect(screen.queryByTestId('calendar-popover')).not.toBeInTheDocument()
  })

  test('이벤트 있는 셀 클릭 시 팝오버가 나타난다', () => {
    const today = new Date()
    const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate())
    render(<MiniCalendar schedules={[{ id: 1, title: '중간고사', date: todayStr, dday: 0, category: '시험' }]} />)
    fireEvent.click(screen.getByTestId(`cell-${todayStr}`))
    expect(screen.getByTestId('calendar-popover')).toBeInTheDocument()
  })

  test('팝오버 열린 상태에서 같은 셀 재클릭 시 팝오버가 닫힌다', () => {
    const today = new Date()
    const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate())
    render(<MiniCalendar schedules={[{ id: 1, title: '중간고사', date: todayStr, dday: 0, category: '시험' }]} />)
    const cell = screen.getByTestId(`cell-${todayStr}`)
    fireEvent.click(cell)
    fireEvent.click(cell)
    expect(screen.queryByTestId('calendar-popover')).not.toBeInTheDocument()
  })
```

`toDateStr` 헬퍼를 테스트 파일의 import 블록 바로 아래, 첫 번째 `describe` 블록 **위에** 추가한다:

```tsx
function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

```bash
cd frontend && npx vitest run src/components/MiniCalendar.test.tsx --reporter=verbose
```

예상 결과: 새로 추가한 7개 테스트 FAIL

- [ ] **Step 3: 이벤트 점 & 팝오버 구현**

`frontend/src/components/MiniCalendar.tsx` 전체를 아래 내용으로 교체한다:

```tsx
import { useState } from 'react'
import type { ScheduleDto } from '../types/schedule'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

export function buildCalendarGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length < 42) cells.push(null)
  return Array.from({ length: 6 }, (_, i) => cells.slice(i * 7, i * 7 + 7))
}

export function getEventsForDate(schedules: ScheduleDto[], dateStr: string): ScheduleDto[] {
  return schedules.filter(s => {
    if (isNaN(new Date(s.date).getTime())) return false
    return s.date === dateStr
  })
}

function pad(n: number) { return String(n).padStart(2, '0') }
function toDateStr(y: number, m: number, d: number) { return `${y}-${pad(m)}-${pad(d)}` }

interface Props { schedules: ScheduleDto[] }

export default function MiniCalendar({ schedules }: Props) {
  const now = new Date()
  const todayStr = toDateStr(now.getFullYear(), now.getMonth() + 1, now.getDate())

  const [year, setYear]         = useState(now.getFullYear())
  const [month, setMonth]       = useState(now.getMonth() + 1)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)
  const [popoverPos, setPopoverPos]   = useState<{ x: number; y: number } | null>(null)

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  function openPopover(e: React.MouseEvent, dateStr: string) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = Math.min(rect.left, window.innerWidth - 210)
    setHoveredDate(dateStr)
    setPopoverPos({ x, y: rect.bottom + 4 })
  }

  function closePopover() {
    setHoveredDate(null)
    setPopoverPos(null)
  }

  const grid = buildCalendarGrid(year, month)
  const popoverEvents = hoveredDate ? getEventsForDate(schedules, hoveredDate) : []

  return (
    <div className="border-2 border-black flex flex-col">
      <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
        <button onClick={prevMonth} aria-label="이전 달" className="hover:opacity-70 transition px-1">◀</button>
        <span className="font-bold text-sm">{year}년 {month}월</span>
        <button onClick={nextMonth} aria-label="다음 달" className="hover:opacity-70 transition px-1">▶</button>
      </div>

      <div className="p-3">
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-bold text-gray-500 py-1">{d}</div>
          ))}
        </div>

        {grid.map((row, ri) => (
          <div key={ri} className="grid grid-cols-7">
            {row.map((day, ci) => {
              if (day === null) return <div key={ci} className="min-h-[44px]" />
              const dateStr = toDateStr(year, month, day)
              const events  = getEventsForDate(schedules, dateStr)
              const isToday = dateStr === todayStr
              const dots    = Math.min(events.length, 3)
              const extra   = events.length > 3 ? events.length - 3 : 0

              return (
                <div
                  key={ci}
                  data-testid={`cell-${dateStr}`}
                  className={`flex flex-col items-center py-1 min-h-[44px] ${events.length > 0 ? 'cursor-pointer' : ''}`}
                  onMouseEnter={e => { if (events.length > 0) openPopover(e, dateStr) }}
                  onMouseLeave={closePopover}
                  onClick={e => {
                    if (events.length === 0) return
                    hoveredDate === dateStr ? closePopover() : openPopover(e, dateStr)
                  }}
                >
                  <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center ${isToday ? 'bg-black text-white rounded-full' : ''}`}>
                    {day}
                  </span>
                  {events.length > 0 && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {Array.from({ length: dots }).map((_, i) => (
                        <span key={i} className="w-1 h-1 rounded-full bg-black" />
                      ))}
                      {extra > 0 && <span className="text-[10px] text-gray-500">+{extra}</span>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {hoveredDate && popoverPos && popoverEvents.length > 0 && (
        <div
          data-testid="calendar-popover"
          className="fixed z-50 bg-white border-2 border-black shadow-lg p-3 min-w-[180px]"
          style={{ left: popoverPos.x, top: popoverPos.y }}
        >
          <p className="text-xs font-bold mb-2">{month}월 {Number(hoveredDate.slice(8))}일</p>
          <ul className="space-y-1">
            {popoverEvents.map(ev => (
              <li key={ev.id} className="text-xs">
                • {ev.title} <span className="text-gray-500">({ev.category})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: 전체 테스트 통과 확인**

```bash
cd frontend && npx vitest run src/components/MiniCalendar.test.tsx --reporter=verbose
```

예상 결과: 전체 테스트 PASS (헬퍼 6개 + 컴포넌트 12개)

- [ ] **Step 5: 커밋**

```bash
git add frontend/src/components/MiniCalendar.tsx frontend/src/components/MiniCalendar.test.tsx
git commit -m "feat: add event dots and hover popover to MiniCalendar"
```

---

## Task 4: MainPage 레이아웃 개편 & MiniCalendar 통합

**Files:**
- Modify: `frontend/src/pages/MainPage.tsx`
- Create: `frontend/src/pages/MainPage.test.tsx`

- [ ] **Step 1: MainPage 테스트 파일 생성**

`frontend/src/pages/MainPage.test.tsx` 파일을 생성한다:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import MainPage from './MainPage'

vi.mock('../api/universities', () => ({
  fetchMainData: () => Promise.resolve({
    notices: [
      { id: 1, title: '공지사항 제목1', date: '2026-05-10', author: '학과', category: '학사', viewCount: 10, featured: false },
    ],
    posts: [
      { id: 1, title: '인기글 제목1', date: '2026-05-10', author: '홍길동', likes: 5, category: '자유게시판', viewCount: 10, featured: false, commentCount: 0 },
    ],
    schedules: [
      { id: 1, title: '중간고사', date: '2026-05-15', dday: 1, category: '시험' },
    ],
    today: '2026-05-14 (목)',
  }),
}))

vi.mock('../context/DeptContext', () => ({
  useDept: () => ({ selectedDeptName: '컴퓨터공학과' }),
}))

function renderPage() {
  return render(<MemoryRouter><MainPage /></MemoryRouter>)
}

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
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

```bash
cd frontend && npx vitest run src/pages/MainPage.test.tsx --reporter=verbose
```

예상 결과: `캘린더가 렌더링된다` FAIL (MiniCalendar가 아직 없음)

- [ ] **Step 3: MainPage.tsx 수정**

`frontend/src/pages/MainPage.tsx` 전체를 아래 내용으로 교체한다:

```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDept } from '../context/DeptContext'
import { fetchMainData } from '../api/universities'
import Navbar from '../components/Navbar'
import MiniCalendar from '../components/MiniCalendar'
import type { NoticeDto } from '../types/notice'
import type { PostDto } from '../types/post'
import type { ScheduleDto } from '../types/schedule'

export default function MainPage() {
  const { selectedDeptName } = useDept()
  const [notices, setNotices]     = useState<NoticeDto[]>([])
  const [posts, setPosts]         = useState<PostDto[]>([])
  const [schedules, setSchedules] = useState<ScheduleDto[]>([])
  const [today, setToday]         = useState('')

  useEffect(() => {
    fetchMainData(selectedDeptName ?? '').then(data => {
      setNotices(data.notices)
      setPosts(data.posts)
      setSchedules(data.schedules)
      setToday(data.today)
    })
  }, [selectedDeptName])

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

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

          {/* 캘린더 — 데스크탑: col 1-2 row 1 / 모바일: 1번째 */}
          <div className="lg:col-span-2 lg:row-start-1">
            <MiniCalendar schedules={schedules} />
          </div>

          {/* 다가오는 일정 — 데스크탑: col 1-2 row 2 / 모바일: 2번째 */}
          <div className="lg:col-span-2 lg:row-start-2 border-2 border-black flex flex-col">
            <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm"><i className="fas fa-calendar-alt mr-2" />다가오는 일정</span>
              <Link to="/schedule" className="text-xs text-gray-300 hover:text-white transition">더보기 →</Link>
            </div>
            <ul className="flex-1 divide-y divide-gray-100">
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

          {/* 공지사항 — 데스크탑: col 3 row 1 / 모바일: 3번째 */}
          <div className="lg:col-start-3 lg:row-start-1 border-2 border-black flex flex-col">
            <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm"><i className="fas fa-bullhorn mr-2" />최신 공지사항</span>
              <Link to="/notice" className="text-xs text-gray-300 hover:text-white transition">더보기 →</Link>
            </div>
            <ul className="flex-1 divide-y divide-gray-100">
              {notices.length === 0 ? (
                <li className="px-4 py-8 text-center text-gray-400 text-sm">
                  <i className="fas fa-inbox block mb-2" />공지사항이 없습니다.
                </li>
              ) : notices.map(n => (
                <li key={n.id} className="px-4 py-3 hover:bg-gray-50 transition flex items-start justify-between gap-2">
                  <Link to="/notice" className="text-sm font-medium hover:underline leading-snug flex-1 min-w-0 line-clamp-1">{n.title}</Link>
                  <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{n.date}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 인기 게시글 — 데스크탑: col 3 row 2 / 모바일: 4번째 */}
          <div className="lg:col-start-3 lg:row-start-2 border-2 border-black flex flex-col">
            <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm"><i className="fas fa-fire mr-2" />인기 게시글</span>
              <Link to="/board" className="text-xs text-gray-300 hover:text-white transition">더보기 →</Link>
            </div>
            <ul className="flex-1 divide-y divide-gray-100">
              {posts.length === 0 ? (
                <li className="px-4 py-8 text-center text-gray-400 text-sm">
                  <i className="fas fa-inbox block mb-2" />게시글이 없습니다.
                </li>
              ) : posts.map(p => (
                <li key={p.id} className="px-4 py-3 hover:bg-gray-50 transition flex items-start justify-between gap-2">
                  <Link to="/board" className="text-sm font-medium hover:underline leading-snug flex-1 min-w-0 line-clamp-1">{p.title}</Link>
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
            { to: '/notice',     icon: 'fa-bullhorn',     label: '공지사항' },
            { to: '/board',      icon: 'fa-comments',     label: '게시판' },
            { to: '/schedule',   icon: 'fa-calendar-alt', label: '일정' },
            { to: '/department', icon: 'fa-university',   label: '학과정보' },
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

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd frontend && npx vitest run src/pages/MainPage.test.tsx --reporter=verbose
```

예상 결과: 4개 테스트 전체 PASS

- [ ] **Step 5: 커밋**

```bash
git add frontend/src/pages/MainPage.tsx frontend/src/pages/MainPage.test.tsx
git commit -m "feat: refactor MainPage layout with MiniCalendar integration"
```

---

## Task 5: Navbar 학교 변경 버튼 추가 (TDD)

**Files:**
- Modify: `frontend/src/components/Navbar.tsx`
- Modify: `frontend/src/components/Navbar.test.tsx`

- [ ] **Step 1: 실패하는 테스트 추가**

`frontend/src/components/Navbar.test.tsx` 하단에 추가한다:

```tsx
test('학교 변경 버튼이 렌더링된다', () => {
  renderNavbar()
  expect(screen.getAllByText('학교 변경').length).toBeGreaterThan(0)
})

test('학교 변경 버튼이 /universities로 연결된다', () => {
  renderNavbar()
  const links = screen.getAllByText('학교 변경')
  expect(links[0].closest('a')).toHaveAttribute('href', '/universities')
})

test('모바일 메뉴에 학교 변경 항목이 있다', () => {
  renderNavbar()
  fireEvent.click(screen.getByRole('button', { name: '메뉴 열기' }))
  const mobileMenu = screen.getByTestId('mobile-menu')
  expect(mobileMenu).toHaveTextContent('학교 변경')
})
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

```bash
cd frontend && npx vitest run src/components/Navbar.test.tsx --reporter=verbose
```

예상 결과: 새로 추가한 3개 테스트 FAIL

- [ ] **Step 3: Navbar.tsx 수정**

`frontend/src/components/Navbar.tsx` 전체를 아래 내용으로 교체한다:

```tsx
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/notice',     label: '공지사항' },
  { to: '/board',      label: '게시판' },
  { to: '/schedule',   label: '일정' },
  { to: '/department', label: '학과정보' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 w-full bg-black text-white z-50 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg tracking-tight hover:opacity-80 transition">
          학과정보통합서비스
        </Link>

        {/* 데스크탑 메뉴 */}
        <ul className="hidden md:flex gap-8 text-sm font-medium">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={`pb-1 hover:opacity-70 transition border-b-2 ${
                  pathname === to ? 'border-white' : 'border-transparent'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* 데스크탑 우측 버튼 */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/universities"
            className="border border-white text-white text-sm px-3 py-1 rounded hover:bg-white hover:text-black transition"
          >
            학교 변경
          </Link>
          <Link
            to="/login"
            className="border border-white text-white text-sm px-3 py-1 rounded hover:bg-white hover:text-black transition"
          >
            로그인
          </Link>
        </div>

        {/* 햄버거 버튼 */}
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          className="md:hidden text-white focus:outline-none"
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
        >
          <i className="fas fa-bars text-xl" />
        </button>
      </div>

      {/* 모바일 드롭다운 */}
      {menuOpen && (
        <div
          data-testid="mobile-menu"
          className="md:hidden bg-black border-t border-gray-700 px-4 py-4 flex flex-col gap-4 text-sm"
        >
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`hover:opacity-70 ${pathname === to ? 'border-b border-white pb-1 font-medium' : ''}`}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/universities"
            onClick={() => setMenuOpen(false)}
            className="border border-white text-center py-1 rounded hover:bg-white hover:text-black transition"
          >
            학교 변경
          </Link>
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="border border-white text-center py-1 rounded hover:bg-white hover:text-black transition"
          >
            로그인
          </Link>
        </div>
      )}
    </nav>
  )
}
```

- [ ] **Step 4: 전체 Navbar 테스트 통과 확인**

```bash
cd frontend && npx vitest run src/components/Navbar.test.tsx --reporter=verbose
```

예상 결과: 기존 4개 + 신규 3개 = 7개 테스트 전체 PASS

- [ ] **Step 5: 전체 테스트 실행**

```bash
cd frontend && npx vitest run --reporter=verbose
```

예상 결과: 모든 테스트 PASS

- [ ] **Step 6: 커밋**

```bash
git add frontend/src/components/Navbar.tsx frontend/src/components/Navbar.test.tsx
git commit -m "feat: add school switch button to Navbar"
```
