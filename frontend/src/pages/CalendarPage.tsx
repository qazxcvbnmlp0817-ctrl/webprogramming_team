import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import Navbar from '../components/Navbar'
import AdminBanner from '../components/common/AdminBanner'
import { useDept } from '../context/DeptContext'
import {
  loadSchedules, addSchedule, updateSchedule, deleteSchedule,
  CATEGORY_META, todayStr,
  type LocalSchedule,
} from '../utils/localSchedule'

const CAT_KEYS: LocalSchedule['category'][] = ['meeting', 'task', 'exam', 'personal', 'other']
function pad2(n: number) { return String(n).padStart(2, '0') }
function toDS(y: number, m: number, d: number) { return `${y}-${pad2(m)}-${pad2(d)}` }
const DAYS = ['일','월','화','수','목','금','토']
function getDayColor(dow: number, isOther = false) {
  if (isOther) return 'text-gray-300'
  if (dow === 0) return 'text-red-500'
  if (dow === 6) return 'text-blue-500'
  return 'text-gray-700'
}

function HoverTooltip({ ev, pos }: { ev: LocalSchedule; pos: { x: number; y: number } }) {
  const meta = CATEGORY_META[ev.category]
  const ref = useRef<HTMLDivElement>(null)
  const [st, setSt] = useState({ top: pos.y + 12, left: pos.x + 8 })
  useEffect(() => {
    if (!ref.current) return
    const w = ref.current.offsetWidth, h = ref.current.offsetHeight
    let l = pos.x + 8, t = pos.y + 12
    if (l + w > window.innerWidth - 8) l = pos.x - w - 8
    if (t + h > window.innerHeight - 8) t = pos.y - h - 4
    setSt({ top: t, left: l })
  }, [pos])
  return (
    <div ref={ref} className="fixed z-[9999] bg-white border border-gray-200 rounded-xl shadow-2xl p-3.5 w-56 pointer-events-none" style={st}>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />
        <span className="text-sm font-bold text-gray-900 truncate">{ev.title}</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-3.5 text-center">📅</span><span>{ev.date}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-3.5 text-center">🕐</span>
          <span>{ev.allDay ? '종일' : `${ev.startTime}${ev.endTime ? ' ~ '+ev.endTime : ''}`}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-3.5 text-center">🏷</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: meta.color }}>{meta.label}</span>
        </div>
        {ev.content && (
          <div className="pt-1.5 mt-1 border-t border-gray-100 text-xs text-gray-400 line-clamp-2">{ev.content}</div>
        )}
      </div>
    </div>
  )
}

function EventChip({ ev, onHover, onLeave, onClick }: {
  ev: LocalSchedule
  onHover: (ev: LocalSchedule, pos: { x: number; y: number }) => void
  onLeave: () => void
  onClick: (ev: LocalSchedule) => void
}) {
  const meta = CATEGORY_META[ev.category]
  return (
    <div
      onMouseEnter={e => onHover(ev, { x: e.clientX, y: e.clientY })}
      onMouseMove={e => onHover(ev, { x: e.clientX, y: e.clientY })}
      onMouseLeave={onLeave}
      onClick={e => { e.stopPropagation(); onClick(ev) }}
      className="flex items-center gap-1 text-[11px] mb-0.5 px-0.5 py-0.5 rounded cursor-pointer hover:bg-gray-100 transition-colors group"
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />
      <span className="truncate text-gray-700 group-hover:text-blue-600 flex-1">{ev.title}</span>
      {!ev.allDay && <span className="text-gray-400 flex-shrink-0 text-[10px]">{ev.startTime}</span>}
    </div>
  )
}

function CalCell({ day, ds, isOther, isToday, dow, events, onCellClick, onEventClick, onHover, onLeave }: {
  day: number; ds: string; isOther: boolean; isToday: boolean; dow: number
  events: LocalSchedule[]
  onCellClick: (ds: string, rect: DOMRect) => void
  onEventClick: (ev: LocalSchedule) => void
  onHover: (ev: LocalSchedule, pos: { x: number; y: number }) => void
  onLeave: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div ref={ref}
      onClick={() => ref.current && onCellClick(ds, ref.current.getBoundingClientRect())}
      className={`min-h-[100px] border-b border-r border-gray-100 p-1.5 cursor-pointer transition-colors
        ${isOther ? 'bg-[#fafafa]' : ''} ${isToday ? 'bg-blue-50/40' : ''} hover:bg-gray-50`}>
      <div className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1
        ${isToday ? 'bg-blue-600 text-white' : getDayColor(dow, isOther)}`}>{day}</div>
      {events.slice(0, 3).map(ev => (
        <EventChip key={ev.id} ev={ev} onHover={onHover} onLeave={onLeave} onClick={onEventClick} />
      ))}
      {events.length > 3 && <div className="text-[10px] text-blue-500 px-0.5">+{events.length - 3}</div>}
    </div>
  )
}

function MiniCal({ year, month, onPrev, onNext, selectedDate, onSelect }: {
  year: number; month: number; onPrev: () => void; onNext: () => void
  selectedDate: string; onSelect: (ds: string) => void
}) {
  const today = todayStr()
  const firstDow = new Date(year, month-1, 1).getDay()
  const dim = new Date(year, month, 0).getDate()
  const prevDim = new Date(year, month-1, 0).getDate()
  const total = Math.ceil((dim + firstDow) / 7) * 7
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button onClick={onPrev} className="w-5 h-5 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded text-sm">‹</button>
        <span className="text-xs font-bold text-gray-800">{year}년 {month}월</span>
        <button onClick={onNext} className="w-5 h-5 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded text-sm">›</button>
      </div>
      <div className="grid grid-cols-7 text-center mb-0.5">
        {DAYS.map((d, i) => (
          <div key={d} className={`text-[10px] font-semibold py-0.5 ${i===0?'text-red-400':i===6?'text-blue-400':'text-gray-400'}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center">
        {Array.from({ length: total }).map((_, i) => {
          let day: number, ds: string, isOther = false
          if (i < firstDow) { day = prevDim-firstDow+i+1; ds = toDS(month===1?year-1:year, month===1?12:month-1, day); isOther = true }
          else if (i >= firstDow+dim) { day = i-firstDow-dim+1; ds = toDS(month===12?year+1:year, month===12?1:month+1, day); isOther = true }
          else { day = i-firstDow+1; ds = toDS(year, month, day) }
          const dow = i % 7, isToday = ds === today, isSel = ds === selectedDate
          return (
            <div key={i} onClick={() => onSelect(ds)} className="flex justify-center py-0.5 cursor-pointer">
              <span className={`text-[11px] w-5 h-5 flex items-center justify-center rounded-full transition hover:bg-gray-100
                ${isToday ? 'bg-gray-900 text-white font-bold' : isSel ? 'bg-blue-100 text-blue-700 font-semibold' :
                  isOther ? 'text-gray-300' : dow===0 ? 'text-red-500' : dow===6 ? 'text-blue-500' : 'text-gray-700'}`}>{day}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DayPanel({ ds, events, anchorRect, onClose, onEventClick, onAddClick }: {
  ds: string; events: LocalSchedule[]; anchorRect: DOMRect
  onClose: () => void; onEventClick: (ev: LocalSchedule) => void; onAddClick: () => void
}) {
  const [y, m, d] = ds.split('-').map(Number)
  const dow = new Date(y, m-1, d).getDay()
  const pos = useMemo(() => {
    const W = 224
    let top = anchorRect.bottom + window.scrollY + 4
    let left = anchorRect.left + window.scrollX
    if (left + W > window.innerWidth - 8) left = window.innerWidth - W - 8
    if (top + 240 > window.innerHeight + window.scrollY - 8) top = anchorRect.top + window.scrollY - 244
    return { top, left }
  }, [anchorRect])
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="fixed z-40 bg-white border border-gray-200 rounded-xl shadow-2xl w-56 overflow-hidden" style={{ top: pos.top, left: pos.left }}>
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
          <span className="text-sm font-bold text-gray-800">{m}월 {d}일 ({DAYS[dow]})</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg leading-none">✕</button>
        </div>
        <div className="px-2 py-1.5 max-h-48 overflow-y-auto">
          {events.length === 0
            ? <p className="text-xs text-gray-400 text-center py-3">일정이 없습니다</p>
            : events.map(ev => {
              const meta = CATEGORY_META[ev.category]
              return (
                <div key={ev.id} onClick={() => { onEventClick(ev); onClose() }}
                  className="flex items-center gap-2 px-1.5 py-2 rounded hover:bg-gray-50 cursor-pointer">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                  <span className="text-xs font-medium text-gray-800 truncate flex-1">{ev.title}</span>
                  {!ev.allDay && <span className="text-[10px] text-gray-400 flex-shrink-0">{ev.startTime}</span>}
                </div>
              )
            })}
        </div>
        <div className="border-t border-gray-100 px-2 py-1.5">
          <button onClick={onAddClick}
            className="w-full flex items-center gap-2 px-1.5 py-1.5 rounded hover:bg-blue-50 text-xs text-blue-600 font-semibold transition">
            + 일정 추가
          </button>
        </div>
      </div>
    </>
  )
}

function ScheduleFormModal({ initial, defaultDate, onSave, onClose }: {
  initial?: LocalSchedule | null
  defaultDate?: string
  onSave: (data: Omit<LocalSchedule, 'id'> & { id?: string }) => void
  onClose: () => void
}) {
  const [title, setTitle]     = useState(initial?.title ?? '')
  const [date, setDate]       = useState(initial?.date ?? defaultDate ?? todayStr())
  const [startTime, setStart] = useState(initial?.startTime ?? '14:00')
  const [endTime, setEnd]     = useState(initial?.endTime ?? '')
  const [allDay, setAllDay]   = useState(initial?.allDay ?? false)
  const [cat, setCat]         = useState<LocalSchedule['category']>(initial?.category ?? 'meeting')
  const [status] = useState<LocalSchedule['status']>(initial?.status ?? 'scheduled')
  const [content, setContent] = useState(initial?.content ?? '')

  const handleSave = () => {
    if (!title.trim()) { alert('제목을 입력해주세요.'); return }
    if (!date) { alert('날짜를 선택해주세요.'); return }
    onSave({ id: initial?.id, title, date, startTime, endTime, allDay, category: cat, status, content })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-[400px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">{initial ? '일정 수정' : '일정 추가'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">✕</button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <label className="text-sm font-medium text-gray-700 w-16 pt-2 flex-shrink-0">제목 <span className="text-red-500">*</span></label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              placeholder="제목을 입력하세요" />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">날짜 <span className="text-red-500">*</span></label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">시간</label>
            <div className="flex items-center gap-2 flex-1">
              <input type="time" value={startTime} onChange={e => setStart(e.target.value)}
                disabled={allDay}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-300" />
              <span className="text-gray-400 text-sm flex-shrink-0">~</span>
              <input type="time" value={endTime} onChange={e => setEnd(e.target.value)}
                disabled={allDay}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-300" />
              <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer flex-shrink-0">
                <input type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)} className="w-3.5 h-3.5 rounded" />
                종일
              </label>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">카테고리 <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-2 flex-1 border border-gray-300 rounded px-3 py-2 focus-within:border-blue-400">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors" style={{ background: CATEGORY_META[cat].color }} />
              <select value={cat} onChange={e => setCat(e.target.value as LocalSchedule['category'])}
                className="flex-1 text-sm outline-none bg-transparent text-gray-800">
                {CAT_KEYS.map(k => <option key={k} value={k}>{CATEGORY_META[k].label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0 pt-2">내용</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={4}
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
              placeholder="내용을 입력하세요" />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 transition">취소</button>
          <button onClick={handleSave}
            className="flex-1 py-2.5 bg-gray-900 text-white rounded text-sm font-semibold hover:bg-gray-700 transition">저장</button>
        </div>
      </div>
    </div>
  )
}

function DetailModal({ ev, onClose, onEdit, onDelete }: {
  ev: LocalSchedule; onClose: () => void
  onEdit: (ev: LocalSchedule) => void; onDelete: (id: string) => void
}) {
  const meta = CATEGORY_META[ev.category]
  const [y, m, d] = ev.date.split('-').map(Number)
  const dow = new Date(y, m-1, d).getDay()
  const timeLabel = ev.allDay ? '종일' : `${ev.startTime}${ev.endTime ? ' ~ '+ev.endTime : ''}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[460px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <button onClick={onClose} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition">← 목록으로</button>
          <div className="flex gap-2">
            <button onClick={() => { onEdit(ev); onClose() }}
              className="px-4 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 transition">수정</button>
            <button onClick={() => { if (window.confirm('삭제하시겠습니까?')) { onDelete(ev.id); onClose() } }}
              className="px-4 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition">삭제</button>
          </div>
        </div>
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: meta.color }} />
            <h2 className="text-xl font-bold text-gray-900 leading-snug">{ev.title}</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="flex items-center gap-4 py-3">
              <span className="text-gray-400 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.5"/><path d="M16 2v4M8 2v4M3 10h18" strokeWidth="1.5"/></svg>
              </span>
              <span className="text-sm text-gray-500 w-20 flex-shrink-0">날짜</span>
              <span className="text-sm text-gray-800">{y}년 {m}월 {d}일 ({DAYS[dow]})</span>
            </div>
            <div className="flex items-center gap-4 py-3">
              <span className="text-gray-400 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9" strokeWidth="1.5"/><path d="M12 7v5l3 3" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </span>
              <span className="text-sm text-gray-500 w-20 flex-shrink-0">시간</span>
              <span className="text-sm text-gray-800">{timeLabel}</span>
            </div>
            <div className="flex items-center gap-4 py-3">
              <span className="text-gray-400 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" strokeWidth="1.5"/><circle cx="7" cy="7" r="1" fill="currentColor"/></svg>
              </span>
              <span className="text-sm text-gray-500 w-20 flex-shrink-0">카테고리</span>
              <span className="inline-block px-3 py-0.5 rounded text-xs font-bold text-white" style={{ background: meta.color }}>{meta.label}</span>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-800 mb-3">내용</p>
          <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
            {ev.content || <span className="text-gray-400">내용 없음</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const { selectedDeptId } = useDept()
  const now = new Date()
  const [mainY, setMainY] = useState(now.getFullYear())
  const [mainM, setMainM] = useState(now.getMonth()+1)
  const [miniY, setMiniY] = useState(now.getFullYear())
  const [miniM, setMiniM] = useState(now.getMonth()+1)
  const [selDate, setSelDate] = useState(todayStr())
  const [catFilter, setCatFilter] = useState<Record<string, boolean>>({
    전체: true, meeting: true, task: true, exam: true, personal: true, other: true,
  })
  const [schedules, setSchedules] = useState<LocalSchedule[]>([])
  useEffect(() => { setSchedules(loadSchedules()) }, [])
  const reload = () => setSchedules(loadSchedules())

  const [dayPanel, setDayPanel]   = useState<{ ds: string; rect: DOMRect } | null>(null)
  const [detailEv, setDetailEv]   = useState<LocalSchedule | null>(null)
  const [formModal, setFormModal] = useState<{ initial?: LocalSchedule; date?: string } | null>(null)
  const [tooltip, setTooltip]     = useState<{ ev: LocalSchedule; pos: { x: number; y: number } } | null>(null)

  const filtered = useMemo(() => {
    if (catFilter['전체']) return schedules
    return schedules.filter(s => catFilter[s.category])
  }, [schedules, catFilter])

  const evMap = useMemo(() => {
    const map = new Map<string, LocalSchedule[]>()
    filtered.forEach(s => { const a = map.get(s.date) ?? []; a.push(s); map.set(s.date, a) })
    return map
  }, [filtered])

  const firstDow = new Date(mainY, mainM-1, 1).getDay()
  const dim = new Date(mainY, mainM, 0).getDate()
  const prevDim = new Date(mainY, mainM-1, 0).getDate()
  const totalCells = Math.ceil((dim + firstDow) / 7) * 7
  const today = todayStr()

  function prevMain() { if(mainM===1){setMainY(y=>y-1);setMainM(12)}else setMainM(m=>m-1) }
  function nextMain() { if(mainM===12){setMainY(y=>y+1);setMainM(1)}else setMainM(m=>m+1) }
  function prevMini() { if(miniM===1){setMiniY(y=>y-1);setMiniM(12)}else setMiniM(m=>m-1) }
  function nextMini() { if(miniM===12){setMiniY(y=>y+1);setMiniM(1)}else setMiniM(m=>m+1) }
  function goToday() { const n=new Date(); setMainY(n.getFullYear()); setMainM(n.getMonth()+1); setMiniY(n.getFullYear()); setMiniM(n.getMonth()+1); setSelDate(todayStr()) }

  const toggleCat = useCallback((key: string) => {
    setCatFilter(prev => {
      if (key === '전체') { const v=!prev['전체']; return { 전체:v, meeting:v, task:v, exam:v, personal:v, other:v } }
      const u = { ...prev, [key]: !prev[key] }; u['전체'] = CAT_KEYS.every(k => u[k]); return u
    })
  }, [])

  const handleSave = (data: Omit<LocalSchedule,'id'> & { id?: string }) => {
    if (data.id) updateSchedule(data as LocalSchedule)
    else addSchedule(data)
    reload(); setFormModal(null); setDetailEv(null)
  }
  const handleDelete = (id: string) => { deleteSchedule(id); reload() }
  const openEdit = (ev: LocalSchedule) => { setDetailEv(null); setFormModal({ initial: ev }) }

  const todayEvents = evMap.get(today) ?? []

  return (
    <div className="bg-white text-gray-900 font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />
      <AdminBanner scope="dept" targetId={selectedDeptId ?? undefined} />

      <div className="flex" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <aside className="hidden lg:flex flex-col gap-5 w-[188px] flex-shrink-0 bg-white border-r border-gray-200 p-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-3">일정</h2>
            <button onClick={() => setFormModal({ date: today })}
              className="w-full py-2 bg-gray-800 text-white text-sm font-semibold rounded hover:bg-gray-700 transition">
              + 일정 추가
            </button>
          </div>
          <MiniCal year={miniY} month={miniM} onPrev={prevMini} onNext={nextMini}
            selectedDate={selDate}
            onSelect={ds => { setSelDate(ds); const [y,m]=ds.split('-').map(Number); setMainY(y); setMainM(m) }} />
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2">카테고리</p>
            <div className="flex flex-col gap-2">
              {[
                { key:'전체',    color:'#1e293b',                    label:'전체' },
                { key:'meeting', color:CATEGORY_META.meeting.color,  label:'회의' },
                { key:'task',    color:CATEGORY_META.task.color,     label:'과제' },
                { key:'exam',    color:CATEGORY_META.exam.color,     label:'시험' },
                { key:'personal',color:CATEGORY_META.personal.color, label:'개인' },
                { key:'other',   color:CATEGORY_META.other.color,    label:'기타' },
              ].map(({ key, color, label }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer" onClick={() => toggleCat(key)}>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                    <span className="text-xs text-gray-700">{label}</span>
                  </div>
                  <div className={`w-4 h-4 border rounded flex items-center justify-center transition
                    ${catFilter[key] !== false ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'}`}>
                    {catFilter[key] !== false &&
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                        <path d="M1.5 5l2.5 2.5 4.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 p-5 min-w-0">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={prevMain} className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm">‹</button>
            <button onClick={nextMain} className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm">›</button>
            <h2 className="flex-1 text-center text-lg font-bold">{mainY}년 {mainM}월</h2>
            <button onClick={goToday} className="px-3 py-1.5 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50">오늘</button>
            <div className="flex items-center border border-gray-300 rounded text-xs overflow-hidden">
              <span className="px-3 py-1.5 text-gray-600">월간 보기</span>
              <span className="px-2 py-1.5 border-l border-gray-300 text-gray-400">▾</span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
            <div className="grid grid-cols-7 border-b border-gray-200">
              {DAYS.map((d, i) => (
                <div key={d} className={`text-center py-2.5 text-xs font-semibold ${i===0?'text-red-500':i===6?'text-blue-500':'text-gray-500'}`}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: totalCells }).map((_, i) => {
                let day: number, ds: string, isOther = false
                if (i < firstDow) { day=prevDim-firstDow+i+1; ds=toDS(mainM===1?mainY-1:mainY, mainM===1?12:mainM-1, day); isOther=true }
                else if (i >= firstDow+dim) { day=i-firstDow-dim+1; ds=toDS(mainM===12?mainY+1:mainY, mainM===12?1:mainM+1, day); isOther=true }
                else { day=i-firstDow+1; ds=toDS(mainY, mainM, day) }
                return (
                  <CalCell key={i} day={day} ds={ds} isOther={isOther} isToday={ds===today} dow={i%7}
                    events={evMap.get(ds) ?? []}
                    onCellClick={(ds, rect) => setDayPanel({ ds, rect })}
                    onEventClick={ev => setDetailEv(ev)}
                    onHover={(ev, pos) => setTooltip({ ev, pos })}
                    onLeave={() => setTooltip(null)} />
                )
              })}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-600 mb-3">
              오늘의 일정 ({now.getMonth()+1}/{now.getDate()} {DAYS[now.getDay()]})
            </p>
            {todayEvents.length === 0
              ? <p className="text-sm text-gray-400">오늘 일정이 없습니다.</p>
              : <div className="flex flex-col gap-1">
                {todayEvents.map(ev => {
                  const meta = CATEGORY_META[ev.category]
                  return (
                    <div key={ev.id}
                      onClick={() => setDetailEv(ev)}
                      onMouseEnter={e => setTooltip({ ev, pos: { x: e.clientX, y: e.clientY } })}
                      onMouseMove={e => setTooltip({ ev, pos: { x: e.clientX, y: e.clientY } })}
                      onMouseLeave={() => setTooltip(null)}
                      className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-gray-50 cursor-pointer transition-colors">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                      <span className="flex-1 text-sm text-gray-800">{ev.title}</span>
                      <span className="text-xs text-gray-400">{ev.allDay ? '종일' : ev.startTime}</span>
                    </div>
                  )
                })}
              </div>
            }
          </div>
        </main>
      </div>

      {tooltip && <HoverTooltip ev={tooltip.ev} pos={tooltip.pos} />}

      {dayPanel && (
        <DayPanel ds={dayPanel.ds} events={evMap.get(dayPanel.ds) ?? []} anchorRect={dayPanel.rect}
          onClose={() => setDayPanel(null)}
          onEventClick={ev => { setDetailEv(ev); setDayPanel(null) }}
          onAddClick={() => { setFormModal({ date: dayPanel.ds }); setDayPanel(null) }} />
      )}

      {detailEv && (
        <DetailModal ev={detailEv}
          onClose={() => setDetailEv(null)}
          onEdit={openEdit}
          onDelete={handleDelete} />
      )}

      {formModal && (
        <ScheduleFormModal
          initial={formModal.initial}
          defaultDate={formModal.date}
          onSave={handleSave}
          onClose={() => setFormModal(null)} />
      )}
    </div>
  )
}
