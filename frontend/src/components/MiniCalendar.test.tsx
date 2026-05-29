import { buildCalendarGrid, getEventsForDate } from './MiniCalendar'
import type { ScheduleDto } from '../types/schedule'
import { render, screen, fireEvent } from '@testing-library/react'
import MiniCalendar from './MiniCalendar'

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

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
})
