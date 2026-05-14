import { useState, useMemo } from 'react'
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

  const eventsByDate = useMemo(() => {
    const map = new Map<string, ScheduleDto[]>()
    schedules.forEach(s => {
      if (isNaN(new Date(s.date).getTime())) return
      const arr = map.get(s.date) ?? []
      arr.push(s)
      map.set(s.date, arr)
    })
    return map
  }, [schedules])

  const grid = buildCalendarGrid(year, month)
  const popoverEvents = hoveredDate ? (eventsByDate.get(hoveredDate) ?? []) : []
  const [, popMonth, popDay] = hoveredDate ? hoveredDate.split('-') : ['', '', '']

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
              const events  = eventsByDate.get(dateStr) ?? []
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
          <p className="text-xs font-bold mb-2">{Number(popMonth)}월 {Number(popDay)}일</p>
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
