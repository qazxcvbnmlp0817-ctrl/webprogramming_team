import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { SCHEDULE_CATEGORY_LIST } from '../../utils/scheduleItem'
import type { ScheduleItem, CategoryMeta } from '../../utils/scheduleItem'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

function pad2(n: number) { return String(n).padStart(2, '0') }
function toDS(y: number, m: number, d: number) { return `${y}-${pad2(m)}-${pad2(d)}` }
function todayStr() {
  const t = new Date()
  return `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`
}
function getDayColor(dow: number, isOther = false) {
  if (isOther) return 'text-gray-300'
  if (dow === 0) return 'text-red-500'
  if (dow === 6) return 'text-blue-500'
  return 'text-gray-700'
}
function fallbackMeta(category: string): CategoryMeta {
  return { label: category, color: '#BDBDBD' }
}

// ── HoverTooltip ──────────────────────────────────────────────────────────────

function HoverTooltip({ ev, pos, meta }: {
  ev: ScheduleItem
  pos: { x: number; y: number }
  meta: CategoryMeta
}) {
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

  const timeLabel = ev.allDay ? '종일'
    : ev.startTime ? `${ev.startTime}${ev.endTime ? ' ~ ' + ev.endTime : ''}`
    : ev.dday !== undefined ? (ev.dday === 0 ? 'D-Day' : `D-${ev.dday}`)
    : ''

  return (
    <div ref={ref}
      className="fixed z-[9999] bg-white border border-gray-200 rounded-xl shadow-2xl p-3.5 w-56 pointer-events-none"
      style={st}>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />
        <span className="text-sm font-bold text-gray-900 truncate">{ev.title}</span>
        {ev.readonly && <span className="text-[10px] text-purple-500 font-medium flex-shrink-0">수업</span>}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-3.5 text-center">📅</span>
          <span>{ev.date}</span>
        </div>
        {timeLabel && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-3.5 text-center">🕐</span>
            <span>{timeLabel}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-3.5 text-center">🏷</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ background: meta.color }}>{meta.label}</span>
        </div>
        {ev.content && (
          <div className="pt-1.5 mt-1 border-t border-gray-100 text-xs text-gray-400 line-clamp-2">{ev.content}</div>
        )}
      </div>
    </div>
  )
}

// ── EventChip ─────────────────────────────────────────────────────────────────

function EventChip({ ev, meta, onHover, onLeave, onClick }: {
  ev: ScheduleItem
  meta: CategoryMeta
  onHover: (ev: ScheduleItem, pos: { x: number; y: number }) => void
  onLeave: () => void
  onClick: (ev: ScheduleItem) => void
}) {
  const secondary = ev.startTime && !ev.allDay ? ev.startTime
    : ev.dday !== undefined ? (ev.dday === 0 ? 'D-Day' : `D-${ev.dday}`)
    : null

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
      {secondary && <span className="text-gray-400 flex-shrink-0 text-[10px]">{secondary}</span>}
    </div>
  )
}

// ── CalCell ───────────────────────────────────────────────────────────────────

function CalCell({ day, ds, isOther, isToday, dow, events, categoryMeta, onCellClick, onEventClick, onHover, onLeave }: {
  day: number; ds: string; isOther: boolean; isToday: boolean; dow: number
  events: ScheduleItem[]
  categoryMeta: Record<string, CategoryMeta>
  onCellClick: (ds: string, rect: DOMRect) => void
  onEventClick: (ev: ScheduleItem) => void
  onHover: (ev: ScheduleItem, pos: { x: number; y: number }) => void
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
        <EventChip key={ev.id} ev={ev}
          meta={categoryMeta[ev.category] ?? fallbackMeta(ev.category)}
          onHover={onHover} onLeave={onLeave} onClick={onEventClick} />
      ))}
      {events.length > 3 && <div className="text-[10px] text-blue-500 px-0.5">+{events.length - 3}</div>}
    </div>
  )
}

// ── MiniCal ───────────────────────────────────────────────────────────────────

function MiniCal({ year, month, onPrev, onNext, selectedDate, onSelect }: {
  year: number; month: number; onPrev: () => void; onNext: () => void
  selectedDate: string; onSelect: (ds: string) => void
}) {
  const today = todayStr()
  const firstDow = new Date(year, month - 1, 1).getDay()
  const dim = new Date(year, month, 0).getDate()
  const prevDim = new Date(year, month - 1, 0).getDate()
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
          <div key={d} className={`text-[10px] font-semibold py-0.5
            ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center">
        {Array.from({ length: total }).map((_, i) => {
          let day: number, ds: string, isOther = false
          if (i < firstDow) {
            day = prevDim - firstDow + i + 1
            ds = toDS(month === 1 ? year - 1 : year, month === 1 ? 12 : month - 1, day)
            isOther = true
          } else if (i >= firstDow + dim) {
            day = i - firstDow - dim + 1
            ds = toDS(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1, day)
            isOther = true
          } else {
            day = i - firstDow + 1
            ds = toDS(year, month, day)
          }
          const dow = i % 7, isToday = ds === today, isSel = ds === selectedDate
          return (
            <div key={i} onClick={() => onSelect(ds)} className="flex justify-center py-0.5 cursor-pointer">
              <span className={`text-[11px] w-5 h-5 flex items-center justify-center rounded-full transition hover:bg-gray-100
                ${isToday ? 'bg-gray-900 text-white font-bold'
                  : isSel ? 'bg-blue-100 text-blue-700 font-semibold'
                  : isOther ? 'text-gray-300'
                  : dow === 0 ? 'text-red-500' : dow === 6 ? 'text-blue-500' : 'text-gray-700'}`}>{day}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── DayPanel ──────────────────────────────────────────────────────────────────

function DayPanel({ ds, events, anchorRect, categoryMeta, canWrite, onClose, onEventClick, onAddClick }: {
  ds: string; events: ScheduleItem[]; anchorRect: DOMRect
  categoryMeta: Record<string, CategoryMeta>
  canWrite: boolean
  onClose: () => void; onEventClick: (ev: ScheduleItem) => void; onAddClick: () => void
}) {
  const [y, m, d] = ds.split('-').map(Number)
  const dow = new Date(y, m - 1, d).getDay()
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
      <div className="fixed z-40 bg-white border border-gray-200 rounded-xl shadow-2xl w-56 overflow-hidden"
        style={{ top: pos.top, left: pos.left }}>
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
          <span className="text-sm font-bold text-gray-800">{m}월 {d}일 ({DAYS[dow]})</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg leading-none">✕</button>
        </div>
        <div className="px-2 py-1.5 max-h-48 overflow-y-auto">
          {events.length === 0
            ? <p className="text-xs text-gray-400 text-center py-3">일정이 없습니다</p>
            : events.map(ev => {
              const evMeta = categoryMeta[ev.category] ?? fallbackMeta(ev.category)
              const secondary = ev.startTime && !ev.allDay ? ev.startTime
                : ev.dday !== undefined ? (ev.dday === 0 ? 'D-Day' : `D-${ev.dday}`) : null
              return (
                <div key={ev.id} onClick={() => { onEventClick(ev); onClose() }}
                  className="flex items-center gap-2 px-1.5 py-2 rounded hover:bg-gray-50 cursor-pointer">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: evMeta.color }} />
                  <span className="text-xs font-medium text-gray-800 truncate flex-1">{ev.title}</span>
                  {secondary && <span className="text-[10px] text-gray-400 flex-shrink-0">{secondary}</span>}
                </div>
              )
            })}
        </div>
        {canWrite && (
          <div className="border-t border-gray-100 px-2 py-1.5">
            <button onClick={onAddClick}
              className="w-full flex items-center gap-2 px-1.5 py-1.5 rounded hover:bg-blue-50 text-xs text-blue-600 font-semibold transition">
              + 일정 추가
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// ── DeleteConfirmModal ────────────────────────────────────────────────────────

function DeleteConfirmModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-base font-bold text-gray-900 mb-2">일정 삭제</h3>
        <p className="text-sm text-gray-600 mb-1">정말 이 일정을 삭제하시겠습니까?</p>
        <p className="text-xs text-red-500 mb-5">삭제한 일정은 복구할 수 없습니다.</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            취소
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition">
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}

// ── DetailModal ───────────────────────────────────────────────────────────────

const SCHEDULE_TYPE_LABELS: Record<string, string> = {
  PERSONAL:      '개인 일정',
  COURSE:        '과목 일정',
  DEPT_NOTICE:   '학과 일정',
  SCHOOL_NOTICE: '학교 일정',
  GLOBAL_NOTICE: '전체 공지',
  GRADE_NOTICE:  '학년 공지',
  // 구형 별칭 (하위 호환)
  DEPARTMENT:    '학과 일정',
  SCHOOL:        '학교 일정',
  GLOBAL:        '전체 공지',
}

function DetailModal({ ev, meta, username, memberType, onClose, onEdit, onDelete, onToggleComplete }: {
  ev: ScheduleItem
  meta: CategoryMeta
  username?: string
  memberType?: string | null
  onClose: () => void
  onEdit: (ev: ScheduleItem) => void
  onDelete: (id: string) => void
  onToggleComplete?: (id: string) => void
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [y, m, d] = ev.date.split('-').map(Number)
  const dow = new Date(y, m - 1, d).getDay()
  const isMultiDay = ev.endDate && ev.endDate > ev.date
  const timeLabel = isMultiDay
    ? null
    : ev.allDay ? '종일'
    : ev.startTime ? `${ev.startTime}${ev.endTime ? ' ~ ' + ev.endTime : ''}`
    : null
  const ddayLabel = ev.dday !== undefined ? (ev.dday === 0 ? 'D-Day' : `D-${ev.dday}`) : null
  const endParts = ev.endDate ? ev.endDate.split('-').map(Number) : null

  // 권한 계산
  const role = memberType ?? 'student'
  const isCreator = !!username && (() => {
    // 수업 시간표(timetable/course 접두사) — 항상 수정 불가
    if (ev.readonly) return false
    // scheduleType 없음 = localStorage 개인 일정 → 항상 본인 소유
    if (!ev.scheduleType || ev.scheduleType === 'PERSONAL') return true
    // ClassEvent 기반 공지/과목 일정 → createdBy(registeredBy) 비교
    if (ev.createdBy) return ev.createdBy === username
    // createdBy 정보 없지만 교수/조교/관리자 → 본인 가능성 높음, 백엔드가 최종 검증
    return role === 'professor' || role === 'assistant' || role === 'admin'
  })()
  const canEditDelete = isCreator && (() => {
    if (!ev.scheduleType || ev.scheduleType === 'PERSONAL') return true
    // 학과/학교 일정: 학생도 본인 작성이면 수정/삭제 가능
    if (['DEPARTMENT', 'DEPT_NOTICE', 'SCHOOL', 'SCHOOL_NOTICE'].includes(ev.scheduleType)) return true
    // 과목/학년 공지: 교수·조교·관리자만
    if (['COURSE', 'GRADE_NOTICE'].includes(ev.scheduleType))
      return role === 'professor' || role === 'assistant' || role === 'admin'
    // 전체 공지: 교수·조교·관리자만
    if (['GLOBAL', 'GLOBAL_NOTICE'].includes(ev.scheduleType))
      return role === 'professor' || role === 'assistant' || role === 'admin'
    return false
  })()

  const handleDelete = () => {
    onDelete(ev.id)
    setShowDeleteConfirm(false)
    onClose()
  }

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[460px] max-h-[90vh] overflow-y-auto">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <button onClick={onClose} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition">
            ← 목록으로
          </button>
          <div className="flex items-center gap-2">
            {ev.readonly && (
              <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded">수업 시간표</span>
            )}
            {canEditDelete && (
              <>
                <button onClick={() => { onEdit(ev); onClose() }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition">
                  일정 수정
                </button>
                <button onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 border border-red-200 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition">
                  일정 삭제
                </button>
              </>
            )}
          </div>
        </div>

        <div className="px-6 pt-6 pb-2">
          {/* 완료 체크박스 (PERSONAL만) */}
          {ev.scheduleType === 'PERSONAL' && onToggleComplete && (
            <label className="flex items-center gap-2 mb-4 cursor-pointer w-fit">
              <input type="checkbox" checked={ev.isCompleted ?? false}
                onChange={() => onToggleComplete(ev.id)}
                className="w-4 h-4 rounded accent-blue-600" />
              <span className={`text-sm font-medium ${ev.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                완료
              </span>
            </label>
          )}

          <div className="flex items-center gap-3 mb-5">
            <span className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" style={{ background: meta.color }} />
            <h2 className={`text-xl font-bold leading-snug ${ev.isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
              {ev.title}
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {/* 일정 유형 */}
            {ev.scheduleType && (
              <div className="flex items-center gap-4 py-3">
                <span className="text-gray-400 flex-shrink-0 w-4 h-4 text-center text-xs font-bold">T</span>
                <span className="text-sm text-gray-500 w-20 flex-shrink-0">유형</span>
                <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700">
                  {SCHEDULE_TYPE_LABELS[ev.scheduleType] ?? ev.scheduleType}
                </span>
              </div>
            )}
            {/* 날짜 */}
            <div className="flex items-center gap-4 py-3">
              <span className="text-gray-400 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.5" />
                  <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="1.5" />
                </svg>
              </span>
              <span className="text-sm text-gray-500 w-20 flex-shrink-0">날짜</span>
              {isMultiDay && endParts ? (
                <span className="text-sm text-gray-800">
                  {y}년 {m}월 {d}일 ({DAYS[dow]}) ~ {endParts[0]}년 {endParts[1]}월 {endParts[2]}일
                </span>
              ) : (
                <span className="text-sm text-gray-800">{y}년 {m}월 {d}일 ({DAYS[dow]})</span>
              )}
            </div>
            {/* 시간 */}
            {timeLabel && (
              <div className="flex items-center gap-4 py-3">
                <span className="text-gray-400 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                    <path d="M12 7v5l3 3" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="text-sm text-gray-500 w-20 flex-shrink-0">시간</span>
                <span className="text-sm text-gray-800">{timeLabel}</span>
              </div>
            )}
            {/* D-Day */}
            {ddayLabel && (
              <div className="flex items-center gap-4 py-3">
                <span className="text-gray-400 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                    <path d="M12 7v5l3 3" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="text-sm text-gray-500 w-20 flex-shrink-0">D-Day</span>
                <span className="text-sm font-bold" style={{ color: meta.color }}>{ddayLabel}</span>
              </div>
            )}
            {/* 카테고리 */}
            <div className="flex items-center gap-4 py-3">
              <span className="text-gray-400 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" strokeWidth="1.5" />
                  <circle cx="7" cy="7" r="1" fill="currentColor" />
                </svg>
              </span>
              <span className="text-sm text-gray-500 w-20 flex-shrink-0">카테고리</span>
              <span className="inline-block px-3 py-0.5 rounded text-xs font-bold text-white"
                style={{ background: meta.color }}>{meta.label}</span>
            </div>
            {/* 작성자 */}
            {(ev as any).createdBy && (
              <div className="flex items-center gap-4 py-3">
                <span className="text-gray-400 flex-shrink-0 w-4 h-4 flex items-center justify-center text-xs">✍</span>
                <span className="text-sm text-gray-500 w-20 flex-shrink-0">작성자</span>
                <span className="text-sm text-gray-800">{(ev as any).createdBy}</span>
              </div>
            )}
            {/* 대상 학년 */}
            {(ev as any).targetGrade && (
              <div className="flex items-center gap-4 py-3">
                <span className="text-gray-400 flex-shrink-0 w-4 h-4 flex items-center justify-center text-xs">🎓</span>
                <span className="text-sm text-gray-500 w-20 flex-shrink-0">대상 학년</span>
                <span className="text-sm text-gray-800">{(ev as any).targetGrade}학년</span>
              </div>
            )}
          </div>
        </div>

        {ev.content && (
          <div className="px-6 py-4 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-800 mb-3">내용</p>
            <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{ev.content}</div>
          </div>
        )}
      </div>
    </div>
    {showDeleteConfirm && <DeleteConfirmModal onCancel={() => setShowDeleteConfirm(false)} onConfirm={handleDelete} />}
    </>
  )
}

// ── 일정 유형 정의 ─────────────────────────────────────────────────────────────

// 표준 타입명: PERSONAL | COURSE | DEPT_NOTICE | SCHOOL_NOTICE | GLOBAL_NOTICE | GRADE_NOTICE
const SCHEDULE_TYPE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  student: [
    { value: 'PERSONAL',      label: '개인 일정' },
    { value: 'DEPT_NOTICE',   label: '학과 일정' },
    { value: 'SCHOOL_NOTICE', label: '학교 일정' },
  ],
  assistant: [
    { value: 'PERSONAL',      label: '개인 일정' },
    { value: 'DEPT_NOTICE',   label: '학과 공지 (과목 무관)' },
    { value: 'GRADE_NOTICE',  label: '학년 공지 일정' },
    { value: 'COURSE',        label: '과목 일정 (과목 선택 필수)' },
    { value: 'SCHOOL_NOTICE', label: '학교 일정' },
    { value: 'GLOBAL_NOTICE', label: '학과 전체 안내' }, // 저장 시 백엔드에서 DEPT_NOTICE로 자동 변환
  ],
  professor: [
    { value: 'PERSONAL',      label: '개인 일정' },
    { value: 'COURSE',        label: '과목 일정' },
    { value: 'DEPT_NOTICE',   label: '학과 일정' },
    { value: 'GRADE_NOTICE',  label: '학년 공지 일정' },
    { value: 'SCHOOL_NOTICE', label: '학교 일정' },
    { value: 'GLOBAL_NOTICE', label: '학과 전체 안내' }, // 저장 시 백엔드에서 DEPT_NOTICE로 자동 변환
  ],
  admin: [
    { value: 'PERSONAL',      label: '개인 일정' },
    { value: 'COURSE',        label: '과목 일정' },
    { value: 'DEPT_NOTICE',   label: '학과 일정' },
    { value: 'GRADE_NOTICE',  label: '학년 공지 일정' },
    { value: 'SCHOOL_NOTICE', label: '학교 일정' },
    { value: 'GLOBAL_NOTICE', label: '전체 공지 일정' },
  ],
}

// scheduleItem.ts 의 SCHEDULE_CATEGORY_LIST 를 공통으로 사용
// → 필터·등록·수정·상세 모달 모두 동일한 목록 유지

// ── FormModal ─────────────────────────────────────────────────────────────────

function FormModal({ initial, defaultDate, memberType, myCourses, myDeptName, onSave, onClose }: {
  initial?: ScheduleItem | null
  defaultDate?: string
  memberType?: string | null
  myCourses?: { courseId: number; courseName: string }[]
  myDeptName?: string
  onSave: (data: Omit<ScheduleItem, 'id'> & { id?: string; courseId?: number; targetGrades?: number[]; isAllGrades?: boolean }) => void
  onClose: () => void
}) {
  const role = memberType ?? 'student'
  const typeOptions = SCHEDULE_TYPE_OPTIONS[role] ?? SCHEDULE_TYPE_OPTIONS.student

  const [scheduleType, setScheduleType] = useState(initial?.scheduleType ?? typeOptions[0]?.value ?? 'PERSONAL')
  const [title, setTitle]     = useState(initial?.title ?? '')
  // 시작일 기본값
  const initDate = initial?.date ?? defaultDate ?? todayStr()
  const [date, setDate]       = useState(initDate)
  // 종료일 기본값 = 시작일 (단일 날짜 이벤트 등록 시 바로 저장 가능)
  const [endDate, setEndDate] = useState(initial?.endDate ?? initDate)
  const [startTime, setStart] = useState(initial?.startTime ?? '')
  const [endTime, setEnd]     = useState(initial?.endTime ?? '')
  const [allDay, setAllDay]   = useState(initial?.allDay ?? false)
  const [cat, setCat]         = useState(initial?.category ?? 'other')
  const [content, setContent] = useState(initial?.content ?? '')
  // COURSE
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>(initial?.courseId ?? '')
  // GRADE_NOTICE
  const [allGrades, setAllGrades]   = useState(false)
  const [grades, setGrades]         = useState<number[]>([])

  const isMultiDay = endDate && endDate > date
  const needsCourse = scheduleType === 'COURSE'
  const needsGrades = ['GRADE_NOTICE', 'DEPT_NOTICE', 'SCHOOL_NOTICE', 'DEPARTMENT'].includes(scheduleType)

  const toggleGrade = (g: number) => {
    setGrades(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
    setAllGrades(false)
  }
  const toggleAllGrades = () => {
    const next = !allGrades
    setAllGrades(next)
    setGrades(next ? [1, 2, 3, 4] : [])
  }

  const handleStartDateChange = (v: string) => {
    setDate(v)
    if (!endDate || endDate < v) setEndDate(v)
  }

  const handleSave = () => {
    if (!title.trim()) { alert('제목을 입력해주세요.'); return }
    if (!date) { alert('시작일을 선택해주세요.'); return }
    if (!endDate) { alert('종료일을 선택해주세요.'); return }
    if (endDate < date) { alert('종료일은 시작일보다 빠를 수 없습니다.'); return }
    if (needsCourse && !selectedCourseId) { alert('과목을 선택해주세요.'); return }
    if (scheduleType === 'GRADE_NOTICE' && grades.length === 0) { alert('대상 학년을 선택해주세요.'); return }
    onSave({
      id: initial?.id,
      title, date, endDate: endDate || undefined,
      startTime: isMultiDay ? '' : startTime,
      endTime: isMultiDay ? '' : endTime,
      allDay: isMultiDay ? true : allDay,
      category: cat, content,
      scheduleType,
      courseId: needsCourse && selectedCourseId ? Number(selectedCourseId) : undefined,
      targetGrades: needsGrades ? grades : undefined,
      isAllGrades: allGrades,
    })
  }

  const yearMin = `${new Date().getFullYear() - 10}-01-01`
  const yearMax = `${new Date().getFullYear() + 10}-12-31`

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-[420px] flex flex-col max-h-[95dvh] sm:max-h-[90dvh]">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-base font-semibold text-gray-900">{initial ? '일정 수정' : '일정 추가'}</h3>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
        </div>

        {/* 스크롤 영역 */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">

          {/* 1. 일정 유형 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">일정 유형 <span className="text-red-500">*</span></label>
            <select value={scheduleType} onChange={e => setScheduleType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white">
              {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* 과목 선택 (COURSE) */}
          {needsCourse && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">과목 선택 <span className="text-red-500">*</span></label>
              <select value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white">
                <option value="">-- 과목 선택 --</option>
                {(myCourses ?? []).map(c => (
                  <option key={c.courseId} value={c.courseId}>{c.courseName}</option>
                ))}
              </select>
              {(myCourses ?? []).length === 0 && (
                <p className="mt-1 text-xs text-amber-600">담당/수강 과목이 없습니다. 시간표를 먼저 등록해주세요.</p>
              )}
            </div>
          )}

          {/* 대상 학년 체크박스 (GRADE_NOTICE / DEPT_NOTICE) */}
          {needsGrades && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대상 학년 {scheduleType === 'GRADE_NOTICE' && <span className="text-red-500">*</span>}
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={allGrades} onChange={toggleAllGrades}
                    className="w-4 h-4 rounded accent-blue-600" />
                  <span className="text-sm font-medium text-gray-700">전체 학년</span>
                </label>
                <div className="grid grid-cols-4 gap-2 pl-1">
                  {[1, 2, 3, 4].map(g => (
                    <label key={g} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={grades.includes(g)} onChange={() => toggleGrade(g)}
                        className="w-4 h-4 rounded accent-blue-600" />
                      <span className="text-sm text-gray-700">{g}학년</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 학과 표시 (DEPT_NOTICE) */}
          {scheduleType === 'DEPT_NOTICE' && myDeptName && (
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
              <span className="text-xs text-blue-600 font-medium">대상 학과:</span>
              <span className="text-xs text-blue-800 font-semibold">{myDeptName}</span>
            </div>
          )}

          {/* 2. 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">제목 <span className="text-red-500">*</span></label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              placeholder="제목을 입력하세요" />
          </div>

          {/* 3. 날짜 — 2열 그리드 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">시작일 <span className="text-red-500">*</span></label>
              <input type="date" value={date} onChange={e => handleStartDateChange(e.target.value)}
                min={yearMin} max={yearMax}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">종료일 <span className="text-red-500">*</span></label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                min={date || yearMin} max={yearMax}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
            </div>
          </div>
          {isMultiDay && (
            <p className="text-xs text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg -mt-2">
              기간 일정 — 시간 없이 종일 일정으로 처리됩니다.
            </p>
          )}

          {/* 4. 시간 (단일 날짜일 때만) */}
          {!isMultiDay && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">시간 <span className="text-gray-400 text-xs">(선택)</span></label>
                <button type="button" onClick={() => setAllDay(!allDay)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all
                    ${allDay ? 'bg-blue-50 text-blue-600 border-blue-300' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${allDay ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  종일 일정
                </button>
              </div>
              {!allDay && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">시작</span>
                    <input type="time" value={startTime} onChange={e => setStart(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">종료</span>
                    <input type="time" value={endTime} onChange={e => setEnd(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. 카테고리 드롭다운 — SCHEDULE_CATEGORY_LIST 공통 사용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">카테고리</label>
            <select value={cat} onChange={e => setCat(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white">
              {SCHEDULE_CATEGORY_LIST.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* 6. 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">내용 <span className="text-gray-400 text-xs">(선택)</span></label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
              placeholder="내용을 입력하세요" />
          </div>

        </div>

        {/* 버튼 */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">취소</button>
          <button onClick={handleSave}
            className="flex-1 py-3 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition">저장</button>
        </div>
      </div>
    </div>
  )
}

// ── WeekDayView ───────────────────────────────────────────────────────────────

function WeekDayView({ viewMode, selDate, evMap, today, onEventClick, categoryMeta }: {
  viewMode: '주간' | '일간'
  selDate: string
  evMap: Map<string, ScheduleItem[]>
  today: string
  onEventClick: (ev: ScheduleItem) => void
  categoryMeta: Record<string, CategoryMeta>
}) {
  // 주간 모드에서는 selDate가 무슨 요일이든 항상 해당 주 일요일부터 시작
  const baseD = new Date(selDate)
  if (viewMode === '주간') baseD.setDate(baseD.getDate() - baseD.getDay())

  const count = viewMode === '주간' ? 7 : 1
  const weekDays = Array.from({ length: count }, (_, i) => {
    const d = new Date(baseD)
    d.setDate(baseD.getDate() + i)
    const ds = toDS(d.getFullYear(), d.getMonth() + 1, d.getDate())
    return { d, ds, evs: evMap.get(ds) ?? [] }
  })

  // ── 일간 뷰: 단일 날짜 상세 카드 ──
  if (viewMode === '일간') {
    const { d, ds, evs } = weekDays[0]
    const dow = d.getDay()
    const isToday = ds === today
    return (
      <div className="mb-4">
        <div className={`rounded-xl border-2 ${isToday ? 'border-blue-400 shadow-md' : 'border-gray-200'} bg-white overflow-hidden`}>
          <div className={`px-5 py-4 flex items-center gap-4 ${isToday ? 'bg-blue-600' : dow === 0 ? 'bg-red-50' : dow === 6 ? 'bg-blue-50' : 'bg-gray-50'}`}>
            <div className={`text-4xl font-extrabold leading-none ${isToday ? 'text-white' : dow === 0 ? 'text-red-500' : dow === 6 ? 'text-blue-500' : 'text-gray-800'}`}>
              {d.getDate()}
            </div>
            <div>
              <div className={`text-base font-bold ${isToday ? 'text-white' : dow === 0 ? 'text-red-500' : dow === 6 ? 'text-blue-500' : 'text-gray-800'}`}>
                {d.getFullYear()}년 {d.getMonth() + 1}월 {d.getDate()}일 ({DAYS[dow]})
              </div>
              {isToday
                ? <div className="text-xs font-semibold text-blue-200 mt-0.5">오늘</div>
                : <div className="text-xs text-gray-400 mt-0.5">일정 {evs.length}건</div>
              }
            </div>
          </div>
          <div className="p-4 min-h-[150px]">
            {evs.length === 0
              ? <p className="text-sm text-gray-400 text-center py-10">일정이 없습니다</p>
              : evs.map(ev => {
                const m = categoryMeta[ev.category] ?? fallbackMeta(ev.category)
                return (
                  <div key={ev.id} onClick={() => onEventClick(ev)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1.5 cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ background: m.color + '18', borderLeft: `3px solid ${m.color}` }}>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: m.color }}>{ev.title}</div>
                      {!ev.allDay && ev.startTime && (
                        <div className="text-xs text-gray-400 mt-0.5">{ev.startTime}{ev.endTime ? ` ~ ${ev.endTime}` : ''}</div>
                      )}
                    </div>
                    <span className="text-[10px] text-white px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: m.color }}>{m.label}</span>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    )
  }

  // ── 주간 뷰: 7개 날짜 카드 ──
  return (
    <div className="grid grid-cols-7 gap-2 mb-4">
      {weekDays.map(({ d, ds, evs }) => {
        const dow = d.getDay()
        const isToday = ds === today
        return (
          <div key={ds}
            className={`rounded-xl border-2 flex flex-col overflow-hidden transition-shadow
              ${isToday ? 'border-blue-400 shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'} bg-white`}>
            {/* 카드 헤더 */}
            <div className={`px-1.5 pt-2.5 pb-2 text-center flex-shrink-0
              ${isToday ? 'bg-blue-600' : dow === 0 ? 'bg-red-50' : dow === 6 ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <div className={`text-[11px] font-semibold tracking-wide uppercase
                ${isToday ? 'text-blue-200' : dow === 0 ? 'text-red-400' : dow === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                {DAYS[dow]}
              </div>
              <div className={`text-2xl font-extrabold leading-tight mt-0.5
                ${isToday ? 'text-white' : dow === 0 ? 'text-red-500' : dow === 6 ? 'text-blue-500' : 'text-gray-800'}`}>
                {d.getDate()}
              </div>
              <div className={`text-[10px] mt-0.5 ${isToday ? 'text-blue-200' : 'text-gray-300'}`}>
                {d.getMonth() + 1}월
              </div>
              {evs.length > 0 && (
                <div className={`text-[10px] font-bold mt-1 w-4 h-4 rounded-full mx-auto flex items-center justify-center
                  ${isToday ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'}`}>
                  {evs.length}
                </div>
              )}
            </div>
            {/* 일정 목록 */}
            <div className="p-1.5 flex-1 min-h-[110px] flex flex-col gap-0.5 overflow-hidden">
              {evs.length === 0
                ? <p className="text-[10px] text-gray-300 text-center mt-5">없음</p>
                : evs.map(ev => {
                  const m = categoryMeta[ev.category] ?? fallbackMeta(ev.category)
                  return (
                    <div key={ev.id} onClick={() => onEventClick(ev)}
                      className="text-[10px] px-1.5 py-1 rounded cursor-pointer truncate font-medium leading-snug hover:opacity-80 transition-opacity"
                      style={{ background: m.color + '20', color: m.color, borderLeft: `2px solid ${m.color}` }}>
                      {!ev.allDay && ev.startTime && (
                        <span className="mr-0.5 opacity-70">{ev.startTime}</span>
                      )}
                      {ev.title}
                    </div>
                  )
                })
              }
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── ScheduleCalendarView (public export) ──────────────────────────────────────

export interface ScheduleCalendarViewProps {
  schedules: ScheduleItem[]
  categoryMeta: Record<string, CategoryMeta>
  loading?: boolean
  canWrite?: boolean
  memberType?: string | null
  username?: string
  myCourses?: { courseId: number; courseName: string }[]
  myDeptName?: string
  onSave?: (data: Omit<ScheduleItem, 'id'> & { id?: string; courseId?: number; targetGrades?: number[]; isAllGrades?: boolean }) => Promise<boolean> | void
  onUpdate?: (id: string, data: Omit<ScheduleItem, 'id'> & { courseId?: number; targetGrades?: number[]; isAllGrades?: boolean }) => Promise<boolean> | void
  onDelete?: (id: string) => void
  onToggleComplete?: (id: string) => void
}

export default function ScheduleCalendarView({
  schedules,
  categoryMeta,
  loading = false,
  canWrite = false,
  memberType,
  username,
  myCourses,
  myDeptName,
  onSave,
  onUpdate,
  onDelete,
  onToggleComplete,
}: ScheduleCalendarViewProps) {
  const now = new Date()
  const [mainY, setMainY] = useState(now.getFullYear())
  const [mainM, setMainM] = useState(now.getMonth() + 1)
  const [miniY, setMiniY] = useState(now.getFullYear())
  const [miniM, setMiniM] = useState(now.getMonth() + 1)
  const [selDate, setSelDate] = useState(todayStr())
  const [viewMode, setViewMode] = useState<'월간' | '주간' | '일간'>('월간')
  const [viewDropdown, setViewDropdown] = useState(false)
  const [search, setSearch] = useState('')

  const catKeys = useMemo(() => Object.keys(categoryMeta), [categoryMeta])
  const [catFilter, setCatFilter] = useState<Record<string, boolean>>(() => {
    const f: Record<string, boolean> = { 전체: true }
    Object.keys(categoryMeta).forEach(k => { f[k] = true })
    return f
  })

  const [dayPanel, setDayPanel]   = useState<{ ds: string; rect: DOMRect } | null>(null)
  const [detailEv, setDetailEv]   = useState<ScheduleItem | null>(null)
  const [formModal, setFormModal] = useState<{ initial?: ScheduleItem; date?: string } | null>(null)
  const [tooltip, setTooltip]     = useState<{ ev: ScheduleItem; pos: { x: number; y: number } } | null>(null)

  const filtered = useMemo(() => {
    let list = catFilter['전체'] ? schedules : schedules.filter(s => catFilter[s.category])
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        (s.content ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [schedules, catFilter, search])

  const evMap = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>()
    filtered.forEach(s => {
      // 종료일 없으면 시작일에만 등록
      if (!s.endDate || s.endDate <= s.date) {
        const a = map.get(s.date) ?? []
        a.push(s)
        map.set(s.date, a)
        return
      }
      // 종료일 있으면 기간 전체 날짜에 등록
      const cur = new Date(s.date)
      const end = new Date(s.endDate)
      while (cur <= end) {
        const ds = `${cur.getFullYear()}-${pad2(cur.getMonth() + 1)}-${pad2(cur.getDate())}`
        const a = map.get(ds) ?? []
        a.push(s)
        map.set(ds, a)
        cur.setDate(cur.getDate() + 1)
      }
    })
    return map
  }, [filtered])

  const firstDow   = new Date(mainY, mainM - 1, 1).getDay()
  const dim        = new Date(mainY, mainM, 0).getDate()
  const prevDim    = new Date(mainY, mainM - 1, 0).getDate()
  const totalCells = Math.ceil((dim + firstDow) / 7) * 7
  const today      = todayStr()

  function shiftSelDate(days: number) {
    setSelDate(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() + days)
      setMainY(d.getFullYear())
      setMainM(d.getMonth() + 1)
      return toDS(d.getFullYear(), d.getMonth() + 1, d.getDate())
    })
  }
  // 주간: 7일(1주)씩 이동하며 항상 일요일로 정렬
  function shiftSelDateByWeek(delta: number) {
    setSelDate(prev => {
      const d = new Date(prev)
      // 현재 주의 일요일 → delta주 이동
      const sun = new Date(d)
      sun.setDate(d.getDate() - d.getDay() + delta * 7)
      setMainY(sun.getFullYear())
      setMainM(sun.getMonth() + 1)
      return toDS(sun.getFullYear(), sun.getMonth() + 1, sun.getDate())
    })
  }
  function prevMain() {
    if (viewMode === '주간') shiftSelDateByWeek(-1)
    else if (viewMode === '일간') shiftSelDate(-1)
    else if (mainM === 1) { setMainY(y => y - 1); setMainM(12) } else setMainM(m => m - 1)
  }
  function nextMain() {
    if (viewMode === '주간') shiftSelDateByWeek(1)
    else if (viewMode === '일간') shiftSelDate(1)
    else if (mainM === 12) { setMainY(y => y + 1); setMainM(1) } else setMainM(m => m + 1)
  }
  function prevMini() { if (miniM === 1) { setMiniY(y => y - 1); setMiniM(12) } else setMiniM(m => m - 1) }
  function nextMini() { if (miniM === 12) { setMiniY(y => y + 1); setMiniM(1) } else setMiniM(m => m + 1) }
  function goToday() {
    const n = new Date()
    setMainY(n.getFullYear()); setMainM(n.getMonth() + 1)
    setMiniY(n.getFullYear()); setMiniM(n.getMonth() + 1)
    setSelDate(todayStr())
  }

  const headerLabel = useMemo(() => {
    if (viewMode === '월간') return `${mainY}년 ${mainM}월`
    if (viewMode === '일간') {
      const [y, m, d] = selDate.split('-').map(Number)
      return `${y}년 ${m}월 ${d}일`
    }
    const startD = new Date(selDate)
    const endD = new Date(startD)
    endD.setDate(startD.getDate() + 6)
    const sm = startD.getMonth() + 1, sd = startD.getDate()
    const em = endD.getMonth() + 1, ed = endD.getDate()
    if (sm === em) return `${startD.getFullYear()}년 ${sm}월 ${sd}~${ed}일`
    return `${startD.getFullYear()}년 ${sm}월 ${sd}일 ~ ${em}월 ${ed}일`
  }, [viewMode, mainY, mainM, selDate])

  const toggleCat = useCallback((key: string) => {
    setCatFilter(prev => {
      if (key === '전체') {
        const v = !prev['전체']
        const u: Record<string, boolean> = { 전체: v }
        catKeys.forEach(k => { u[k] = v })
        return u
      }
      const u = { ...prev, [key]: !prev[key] }
      u['전체'] = catKeys.every(k => u[k])
      return u
    })
  }, [catKeys])

  const handleSave = onSave
    ? async (data: Omit<ScheduleItem, 'id'> & { id?: string; courseId?: number; targetGrades?: number[]; isAllGrades?: boolean }) => {
        let success: boolean | void
        if (data.id && onUpdate) {
          success = await onUpdate(data.id, data)
        } else {
          success = await onSave(data)
        }
        // 성공(true) 또는 void(구형 호환)일 때만 모달 닫기
        if (success !== false) {
          setFormModal(null)
          setDetailEv(null)
        }
      }
    : undefined
  const openEdit = (ev: ScheduleItem) => { setDetailEv(null); setFormModal({ initial: ev }) }

  const todayEvents = evMap.get(today) ?? []
  const writeEnabled = canWrite && !!onSave

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-400">
        <i className="fas fa-spinner fa-spin text-3xl mb-3 block" />불러오는 중...
      </div>
    )
  }

  return (
    <div className="flex">
      {/* ── Left sidebar ── */}
      <aside className="hidden lg:flex flex-col gap-5 w-[188px] flex-shrink-0 bg-white border-r border-gray-200 p-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3">일정</h2>
          {writeEnabled && (
            <button onClick={() => setFormModal({ date: today })}
              className="w-full py-2 bg-gray-800 text-white text-sm font-semibold rounded hover:bg-gray-700 transition">
              + 일정 추가
            </button>
          )}
        </div>
        <MiniCal year={miniY} month={miniM} onPrev={prevMini} onNext={nextMini}
          selectedDate={selDate}
          onSelect={ds => {
            if (viewMode === '주간') {
              // 주간 모드: 선택한 날짜가 속한 주의 일요일로 스냅
              const d = new Date(ds)
              const sun = new Date(d)
              sun.setDate(d.getDate() - d.getDay())
              const sunDs = toDS(sun.getFullYear(), sun.getMonth() + 1, sun.getDate())
              setSelDate(sunDs)
              setMainY(sun.getFullYear()); setMainM(sun.getMonth() + 1)
            } else {
              setSelDate(ds)
              const [y, m] = ds.split('-').map(Number)
              setMainY(y); setMainM(m)
            }
          }} />

        {/* 검색 */}
        <div>
          <p className="text-xs font-bold text-gray-500 mb-2">🔍 일정 검색</p>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="제목, 내용 검색"
            className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-blue-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="mt-1 text-[10px] text-gray-400 hover:text-gray-600">
              ✕ 초기화
            </button>
          )}
        </div>

        {/* 카테고리 필터 */}
        <div>
          <p className="text-xs font-bold text-gray-500 mb-2">카테고리</p>
          <div className="flex flex-col gap-2">
            {[{ key: '전체', color: '#1e293b', label: '전체' },
              ...catKeys.map(k => ({ key: k, color: categoryMeta[k].color, label: categoryMeta[k].label })),
            ].map(({ key, color, label }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer" onClick={() => toggleCat(key)}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-xs text-gray-700">{label}</span>
                </div>
                <div className={`w-4 h-4 border rounded flex items-center justify-center transition
                  ${catFilter[key] !== false ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'}`}>
                  {catFilter[key] !== false && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                      <path d="M1.5 5l2.5 2.5 4.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main calendar ── */}
      <main className="flex-1 p-5 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-4">
          <button onClick={prevMain}
            className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm">‹</button>
          <button onClick={nextMain}
            className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm">›</button>
          <h2 className="flex-1 text-center text-sm sm:text-lg font-bold whitespace-nowrap">{headerLabel}</h2>
          {writeEnabled && (
            <button onClick={() => setFormModal({ date: today })}
              className="lg:hidden px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded hover:bg-gray-700 transition whitespace-nowrap">
              + 추가
            </button>
          )}
          <button onClick={goToday}
            className="px-3 py-1.5 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50">오늘</button>
          {/* View mode dropdown — functional */}
          <div className="relative">
            <button
              onClick={() => setViewDropdown(v => !v)}
              className="flex items-center border border-gray-300 rounded text-xs overflow-hidden bg-white hover:bg-gray-50 transition">
              <span className="px-3 py-1.5 text-gray-600">{viewMode} 보기</span>
              <span className="px-2 py-1.5 border-l border-gray-300 text-gray-400">▾</span>
            </button>
            {viewDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[100px]">
                {(['월간', '주간', '일간'] as const).map(v => (
                  <button key={v} onClick={() => {
                    if (v === '주간') {
                      // 주간 전환 시 selDate를 해당 주 일요일로 스냅
                      setSelDate(prev => {
                        const d = new Date(prev)
                        const sun = new Date(d)
                        sun.setDate(d.getDate() - d.getDay())
                        setMainY(sun.getFullYear())
                        setMainM(sun.getMonth() + 1)
                        return toDS(sun.getFullYear(), sun.getMonth() + 1, sun.getDate())
                      })
                    }
                    setViewMode(v); setViewDropdown(false)
                  }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition ${viewMode === v ? 'font-semibold text-blue-600' : ''}`}>
                    {v} 보기
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 모바일 전용 검색바 (사이드바 숨김 구간) */}
        <div className="lg:hidden mb-3 flex items-center gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="일정 검색"
            className="flex-1 border border-gray-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-blue-400"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 border border-gray-200 rounded">✕</button>
          )}
        </div>

        {/* 월간 뷰 */}
        {viewMode === '월간' && (
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
            <div className="grid grid-cols-7 border-b border-gray-200">
              {DAYS.map((d, i) => (
                <div key={d}
                  className={`text-center py-2.5 text-xs font-semibold
                    ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: totalCells }).map((_, i) => {
                let day: number, ds: string, isOther = false
                if (i < firstDow) {
                  day = prevDim - firstDow + i + 1
                  ds = toDS(mainM === 1 ? mainY - 1 : mainY, mainM === 1 ? 12 : mainM - 1, day)
                  isOther = true
                } else if (i >= firstDow + dim) {
                  day = i - firstDow - dim + 1
                  ds = toDS(mainM === 12 ? mainY + 1 : mainY, mainM === 12 ? 1 : mainM + 1, day)
                  isOther = true
                } else {
                  day = i - firstDow + 1
                  ds = toDS(mainY, mainM, day)
                }
                return (
                  <CalCell key={i} day={day} ds={ds} isOther={isOther} isToday={ds === today} dow={i % 7}
                    events={evMap.get(ds) ?? []}
                    categoryMeta={categoryMeta}
                    onCellClick={(ds, rect) => setDayPanel({ ds, rect })}
                    onEventClick={ev => setDetailEv(ev)}
                    onHover={(ev, pos) => setTooltip({ ev, pos })}
                    onLeave={() => setTooltip(null)} />
                )
              })}
            </div>
          </div>
        )}

        {/* 주간 / 일간 뷰 */}
        {viewMode !== '월간' && (
          <WeekDayView
            viewMode={viewMode}
            selDate={selDate}
            evMap={evMap}
            today={today}
            onEventClick={ev => setDetailEv(ev)}
            categoryMeta={categoryMeta}
          />
        )}

        {/* 오늘의 일정 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-600 mb-3">
            오늘의 일정 ({now.getMonth() + 1}/{now.getDate()} {DAYS[now.getDay()]})
          </p>
          {todayEvents.length === 0
            ? <p className="text-sm text-gray-400">오늘 일정이 없습니다.</p>
            : (
              <div className="flex flex-col gap-1">
                {todayEvents.map(ev => {
                  const evMeta = categoryMeta[ev.category] ?? fallbackMeta(ev.category)
                  const timeInfo = ev.allDay ? '종일'
                    : ev.startTime ? ev.startTime
                    : ev.dday !== undefined ? (ev.dday === 0 ? 'D-Day' : `D-${ev.dday}`)
                    : ''
                  return (
                    <div key={ev.id}
                      onClick={() => setDetailEv(ev)}
                      onMouseEnter={e => setTooltip({ ev, pos: { x: e.clientX, y: e.clientY } })}
                      onMouseMove={e => setTooltip({ ev, pos: { x: e.clientX, y: e.clientY } })}
                      onMouseLeave={() => setTooltip(null)}
                      className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-gray-50 cursor-pointer transition-colors">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: evMeta.color }} />
                      <span className="flex-1 text-sm text-gray-800">{ev.title}</span>
                      {ev.readonly && <span className="text-[10px] text-purple-500">수업</span>}
                      <span className="text-xs text-gray-400">{timeInfo}</span>
                    </div>
                  )
                })}
              </div>
            )}
        </div>
      </main>

      {/* ── Overlays ── */}
      {tooltip && (
        <HoverTooltip ev={tooltip.ev} pos={tooltip.pos}
          meta={categoryMeta[tooltip.ev.category] ?? fallbackMeta(tooltip.ev.category)} />
      )}

      {dayPanel && (
        <DayPanel
          ds={dayPanel.ds} events={evMap.get(dayPanel.ds) ?? []} anchorRect={dayPanel.rect}
          categoryMeta={categoryMeta} canWrite={writeEnabled}
          onClose={() => setDayPanel(null)}
          onEventClick={ev => { setDetailEv(ev); setDayPanel(null) }}
          onAddClick={() => { setFormModal({ date: dayPanel.ds }); setDayPanel(null) }} />
      )}

      {detailEv && (
        <DetailModal
          ev={detailEv}
          meta={categoryMeta[detailEv.category] ?? fallbackMeta(detailEv.category)}
          username={username}
          memberType={memberType}
          onClose={() => setDetailEv(null)}
          onEdit={openEdit}
          onDelete={onDelete ?? (() => {})}
          onToggleComplete={onToggleComplete} />
      )}

      {formModal && handleSave && (
        <FormModal
          initial={formModal.initial}
          defaultDate={formModal.date}
          memberType={memberType}
          myCourses={myCourses}
          myDeptName={myDeptName}
          onSave={handleSave}
          onClose={() => setFormModal(null)} />
      )}
    </div>
  )
}
