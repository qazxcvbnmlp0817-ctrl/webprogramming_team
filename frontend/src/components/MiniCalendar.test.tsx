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
