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
