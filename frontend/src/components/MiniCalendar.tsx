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
