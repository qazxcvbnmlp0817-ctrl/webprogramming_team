import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react'
import Navbar from '../components/Navbar'
import { useDept } from '../context/DeptContext'
import { getAuthItem, isLoggedIn } from '../utils/authStorage'
import { loadSchedules, type LocalSchedule } from '../utils/localSchedule'
import {
  addTimetableEntry,
  fetchLectureOfferings,
  fetchMyTimetable,
  removeTimetableEntry,
  type LectureOfferingDto,
  type TimetableEntryDto,
} from '../api/timetable'
import {
  createAdminClassSchedule,
  createClassSchedule,
  deleteAdminClassSchedule,
  deleteClassSchedule,
  fetchAdminClassSchedules,
  fetchProfessorAssignments,
  fetchProfessorClassSchedules,
  fetchStudentClassSchedules,
  updateAdminClassSchedule,
  updateClassSchedule,
  type ClassScheduleDto,
  type ClassSchedulePayload,
  type ProfessorAssignmentDto,
} from '../api/classSchedules'
import { fetchDeptAssignments, type AssignmentItem } from '../api/adminDept'

const SEMESTER = '2026-1'
const WEEK_DAYS = ['월', '화', '수', '목', '금', '토']
const COLORS = ['#0f766e', '#7c3aed', '#b45309', '#0369a1', '#be123c', '#4d7c0f', '#6d28d9', '#b91c1c']
const GRID_START_MIN = 9 * 60
const GRID_END_MIN = 22 * 60
const GRID_STEP = 30
const TIME_ROWS = Array.from({ length: (GRID_END_MIN - GRID_START_MIN) / GRID_STEP }, (_, index) => GRID_START_MIN + index * GRID_STEP)

type ScheduleAssignment = ProfessorAssignmentDto | AssignmentItem
type AdminScheduleFilter = 'all' | 'scheduled' | 'unscheduled'
type AdminScheduleSort = 'course' | 'professor'

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, '')
}

function toSlots(lectureTime: string | null | undefined): Set<string> {
  const text = (lectureTime ?? '').replace(/\s+/g, '')
  const slots = new Set<string>()
  for (const match of text.matchAll(/([월화수목금토일])([0-9,]+)/g)) {
    for (const period of match[2].split(',')) {
      if (period) slots.add(`${match[1]}${period}`)
    }
  }
  return slots
}

function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function scheduleColor(schedule: ClassScheduleDto) {
  return COLORS[Math.abs(schedule.courseId ?? schedule.id) % COLORS.length]
}

function ClassScheduleGrid({
  schedules,
  title,
  emptyText,
  canEdit = false,
  onEdit,
  onDelete,
}: {
  schedules: ClassScheduleDto[]
  title: string
  emptyText: string
  canEdit?: boolean
  onEdit?: (schedule: ClassScheduleDto) => void
  onDelete?: (schedule: ClassScheduleDto) => void
}) {
  const blocks = schedules.map(schedule => {
    const dayIndex = WEEK_DAYS.indexOf(schedule.dayOfWeek)
    if (dayIndex < 0) return null
    const top = Math.max(0, (timeToMinutes(schedule.startTime) - GRID_START_MIN) / GRID_STEP)
    const height = Math.max(1, (timeToMinutes(schedule.endTime) - timeToMinutes(schedule.startTime)) / GRID_STEP)
    return { schedule, dayIndex, top, height }
  }).filter(Boolean) as Array<{ schedule: ClassScheduleDto; dayIndex: number; top: number; height: number }>

  return (
    <section className="border-2 border-black bg-white">
      <div className="flex items-center justify-between gap-3 border-b-2 border-black px-4 py-3">
        <div>
          <h2 className="text-lg font-black">{title}</h2>
          <p className="text-xs text-gray-500">{SEMESTER} · ClassSchedule 기준</p>
        </div>
        <span className="border-2 border-black px-3 py-1 text-xs font-black">{schedules.length}개</span>
      </div>
      {schedules.length === 0 ? (
        <p className="p-8 text-center text-sm text-gray-500">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[820px]">
            <div className="grid grid-cols-[64px_repeat(6,1fr)] bg-black text-white text-center text-sm font-black">
              <div className="py-2 border-r border-gray-700">시간</div>
              {WEEK_DAYS.map(day => <div key={day} className="py-2 border-r border-gray-700 last:border-r-0">{day}</div>)}
            </div>
            <div className="relative grid grid-cols-[64px_repeat(6,1fr)]" style={{ gridTemplateRows: `repeat(${TIME_ROWS.length}, 32px)` }}>
              {TIME_ROWS.map(minutes => (
                <Fragment key={minutes}>
                  <div className="border-r border-b border-gray-200 text-[11px] text-gray-500 flex items-start justify-center pt-1">
                    {minutesToTime(minutes)}
                  </div>
                  {WEEK_DAYS.map(day => <div key={`${day}-${minutes}`} className="border-r border-b border-gray-200" />)}
                </Fragment>
              ))}
              {blocks.map(({ schedule, dayIndex, top, height }) => (
                <div
                  key={schedule.id}
                  className="absolute text-white p-2 overflow-hidden"
                  style={{
                    left: `calc(64px + ${dayIndex} * ((100% - 64px) / 6))`,
                    top: `${top * 32}px`,
                    width: 'calc((100% - 64px) / 6)',
                    height: `${height * 32}px`,
                    background: scheduleColor(schedule),
                    border: '1px solid white',
                  }}
                >
                  <p className="font-black text-xs leading-tight truncate">{schedule.courseName || `과목 ${schedule.courseId}`}</p>
                  <p className="text-[11px] opacity-90 truncate">{schedule.professorName || '담당교수'} · {schedule.room || '강의실 미정'}</p>
                  {canEdit && (
                    <div className="mt-1 flex gap-1">
                      <button type="button" onClick={() => onEdit?.(schedule)} className="bg-white/90 text-black px-1.5 py-0.5 text-[10px] font-black">수정</button>
                      <button type="button" onClick={() => onDelete?.(schedule)} className="bg-black/50 text-white px-1.5 py-0.5 text-[10px] font-black">삭제</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

// lectureTime("월5,6,7 수2,3,4")을 사람이 읽는 시간 형식("월 11:00~12:30 / 수 09:30~11:00")으로 변환.
// 매핑: 1교시 = 09:00, 한 교시 = 30분.
function formatLectureTime(text: string | null | undefined): string {
  if (!text) return '강의시간 미정'
  const clean = text.replace(/\s+/g, '')
  const out: string[] = []
  for (const match of clean.matchAll(/([월화수목금토일])([0-9,]+)/g)) {
    const day = match[1]
    const periods = match[2].split(',').map(Number).filter(Boolean).sort((a, b) => a - b)
    if (periods.length === 0) continue
    const groups: number[][] = []
    let cur: number[] = [periods[0]]
    for (let i = 1; i < periods.length; i++) {
      if (periods[i] === periods[i - 1] + 1) cur.push(periods[i])
      else { groups.push(cur); cur = [periods[i]] }
    }
    groups.push(cur)
    for (const grp of groups) {
      const startMin = 510 + grp[0] * 30
      const endMin   = 510 + (grp[grp.length - 1] + 1) * 30
      const s = `${String(Math.floor(startMin / 60)).padStart(2, '0')}:${String(startMin % 60).padStart(2, '0')}`
      const e = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`
      out.push(`${day} ${s}~${e}`)
    }
  }
  return out.length > 0 ? out.join(' / ') : text
}

// 학생이 담은 LectureOffering의 lectureTime("월13,14,15,16 수9,10,11,12")을 파싱해 ClassScheduleDto 배열로 변환.
// 매핑: 1교시 = 09:00, 한 교시 = 30분 단위 (예: 9교시=13:00, 13교시=15:00, 22교시=19:30).
// 연속 교시는 한 블록으로 묶고, 비연속 교시는 따로 만듦.
function entriesToScheduleBlocks(entries: TimetableEntryDto[]): ClassScheduleDto[] {
  const result: ClassScheduleDto[] = []
  let synthetic = 1
  const periodToMinutes = (p: number) => 510 + p * 30   // period 1 → 540 = 09:00
  const minutesToHHMM = (min: number) =>
    `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

  for (const entry of entries) {
    const text = (entry.offering.lectureTime ?? '').replace(/\s+/g, '')
    for (const match of text.matchAll(/([월화수목금토일])([0-9,]+)/g)) {
      const day = match[1]
      const periods = match[2].split(',').map(Number).filter(Boolean).sort((a, b) => a - b)
      if (periods.length === 0) continue
      const groups: number[][] = []
      let cur: number[] = [periods[0]]
      for (let i = 1; i < periods.length; i++) {
        if (periods[i] === periods[i - 1] + 1) cur.push(periods[i])
        else { groups.push(cur); cur = [periods[i]] }
      }
      groups.push(cur)
      for (const grp of groups) {
        const startMin = periodToMinutes(grp[0])
        const endMin   = periodToMinutes(grp[grp.length - 1] + 1)
        result.push({
          id: entry.entryId * 100 + synthetic++,
          courseId: entry.offering.id,
          courseName: entry.offering.courseName,
          professorId: 0,
          professorName: entry.offering.professorName ?? '',
          deptId: 0,
          dayOfWeek: day,
          startTime: minutesToHHMM(startMin),
          endTime:   minutesToHHMM(endMin),
          room: `${entry.offering.section}분반`,
          semester: entry.offering.semester,
          memo: '',
        })
      }
    }
  }
  return result
}

function StudentOfferingGrid({ entries, onRemove }: { entries: TimetableEntryDto[]; onRemove: (entryId: number) => void }) {
  return (
    <section className="border-2 border-black bg-white">
      <div className="border-b-2 border-black px-4 py-3">
        <h2 className="text-lg font-black">담은 강좌 목록</h2>
        <p className="text-xs text-gray-500">수업 시간표 표시는 위 ClassSchedule 기준입니다.</p>
      </div>
      <div className="border-t border-gray-200 divide-y divide-gray-200">
        {entries.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">아직 담은 강좌가 없습니다.</p>
        ) : entries.map(entry => (
          <div key={entry.entryId} className="p-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-black text-sm">{entry.offering.courseName}</p>
              <p className="text-xs text-gray-500">{entry.offering.section}분반 · {entry.offering.professorName || '담당교수 미정'}</p>
              <p className="text-xs text-gray-700 mt-0.5">{formatLectureTime(entry.offering.lectureTime)}</p>
            </div>
            <button type="button" onClick={() => onRemove(entry.entryId)} className="border-2 border-black px-3 py-1 text-xs font-black hover:bg-black hover:text-white">제거</button>
          </div>
        ))}
      </div>
    </section>
  )
}

function PersonalScheduleList({ schedules }: { schedules: LocalSchedule[] }) {
  const upcoming = schedules
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6)

  return (
    <section className="border-2 border-black bg-white p-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
        <h2 className="text-base font-black">개인 일정</h2>
        <span className="text-xs text-gray-500">localStorage</span>
      </div>
      {upcoming.length === 0 ? (
        <p className="text-sm text-gray-500 py-3">등록된 개인 일정이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {upcoming.map(item => (
            <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="font-bold truncate">{item.title}</span>
              <span className="text-xs text-gray-500 shrink-0">{item.date}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function StudentTimetableView({ username }: { username: string }) {
  const [offerings, setOfferings] = useState<LectureOfferingDto[]>([])
  const [entries, setEntries] = useState<TimetableEntryDto[]>([])
  const [serverClassSchedules, setServerClassSchedules] = useState<ClassScheduleDto[]>([])
  const [personalSchedules, setPersonalSchedules] = useState<LocalSchedule[]>([])
  const [query, setQuery] = useState('')
  const [year, setYear] = useState('전체')
  const [completion, setCompletion] = useState('전체')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const reload = async () => {
    setLoading(true)
    const [nextOfferings, nextEntries, nextClassSchedules] = await Promise.all([
      fetchLectureOfferings(SEMESTER),
      fetchMyTimetable(username, SEMESTER),
      fetchStudentClassSchedules(username, SEMESTER).catch(() => [] as ClassScheduleDto[]),
    ])
    setOfferings(nextOfferings)
    setEntries(nextEntries)
    setServerClassSchedules(nextClassSchedules)
    setPersonalSchedules(loadSchedules())
    setLoading(false)
  }

  // 그리드에 표시할 시간 블록:
  // 1) 학생이 담은 (courseName + professorName) 쌍과 일치하는 서버 ClassSchedule이 있으면 그것 우선
  //    (교수가 수정한 실제 시간이 즉시 반영됨, 같은 과목 다른 교수 분반은 자동 제외)
  // 2) 매칭되는 ClassSchedule이 없는 강좌는 LectureOffering.lectureTime 파싱으로 폴백
  const classSchedules = useMemo(() => {
    const pairKey = (courseName: string, professorName: string | null | undefined) =>
      `${courseName}|${professorName ?? ''}`
    const myPairs = new Set(entries.map(e => pairKey(e.offering.courseName, e.offering.professorName)))
    const matchedFromServer = serverClassSchedules.filter(cs => myPairs.has(pairKey(cs.courseName, cs.professorName)))
    const coveredPairs = new Set(matchedFromServer.map(cs => pairKey(cs.courseName, cs.professorName)))
    const uncoveredEntries = entries.filter(e => !coveredPairs.has(pairKey(e.offering.courseName, e.offering.professorName)))
    const fallbackBlocks = entriesToScheduleBlocks(uncoveredEntries)
    return [...matchedFromServer, ...fallbackBlocks]
  }, [entries, serverClassSchedules])

  useEffect(() => {
    reload().catch(error => setMessage(error instanceof Error ? error.message : '시간표를 불러오지 못했습니다.'))
  }, [username])

  const selectedOfferingIds = useMemo(() => new Set(entries.map(entry => entry.offering.id)), [entries])
  const occupiedSlots = useMemo(() => {
    const set = new Set<string>()
    entries.forEach(entry => toSlots(entry.offering.lectureTime).forEach(slot => set.add(slot)))
    return set
  }, [entries])
  const totalCredits = entries.reduce((sum, entry) => sum + entry.offering.credits, 0)
  const filtered = useMemo(() => {
    const q = normalize(query)
    return offerings.filter(offering => {
      const text = normalize(`${offering.courseName} ${offering.courseCode} ${offering.professorName}`)
      return (!q || text.includes(q))
        && (year === '전체' || offering.targetYear === year || offering.targetYear === '전체학년')
        && (completion === '전체' || offering.completionType === completion)
    })
  }, [offerings, query, year, completion])

  const add = async (offeringId: number) => {
    try {
      setMessage('')
      await addTimetableEntry(username, offeringId)
      await reload()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '시간표에 담지 못했습니다.')
    }
  }

  const remove = async (entryId: number) => {
    try {
      setMessage('')
      await removeTimetableEntry(username, entryId)
      await reload()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '시간표에서 제거하지 못했습니다.')
    }
  }

  return (
    <TimetableShell badge={`담은 강좌 ${entries.length}개 · ${totalCredits}학점`}>
      {message && <NoticeMessage>{message}</NoticeMessage>}
      <div className="grid xl:grid-cols-[420px_1fr] gap-5 items-start">
        <aside className="border-2 border-black bg-white">
          <div className="p-4 border-b-2 border-black space-y-3">
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="과목명, 코드, 교수 검색" className="w-full border-2 border-black px-3 py-2 text-sm focus:outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <select value={year} onChange={event => setYear(event.target.value)} className="border-2 border-black px-2 py-2 text-sm bg-white">
                {['전체', '전체학년', '1학년', '2학년', '3학년', '4학년'].map(item => <option key={item}>{item}</option>)}
              </select>
              <select value={completion} onChange={event => setCompletion(event.target.value)} className="border-2 border-black px-2 py-2 text-sm bg-white">
                {['전체', '교양필수', '교양선택', '전문교양', '공학기초', '전공필수', '전공선택'].map(item => <option key={item}>{item}</option>)}
              </select>
            </div>
          </div>
          <div className="max-h-[760px] overflow-y-auto divide-y divide-gray-200">
            {loading ? (
              <p className="p-6 text-center text-gray-500">불러오는 중...</p>
            ) : filtered.map(offering => {
              const already = selectedOfferingIds.has(offering.id)
              const slots = toSlots(offering.lectureTime)
              const conflict = !already && slots.size > 0 && [...slots].some(slot => occupiedSlots.has(slot))
              const disabled = already || conflict
              return (
                <article key={offering.id} className={`p-4 hover:bg-gray-50 ${conflict ? 'bg-red-50' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{offering.courseName}</p>
                      <p className="text-xs text-gray-500 mt-1">{offering.courseCode}-{offering.section} · {offering.completionType} · {offering.targetYear}</p>
                    </div>
                    <button type="button" disabled={disabled} onClick={() => add(offering.id)} className={`border-2 border-black px-3 py-1 text-xs font-black shrink-0 ${already ? 'bg-gray-200 text-gray-500' : conflict ? 'bg-red-100 text-red-700' : 'hover:bg-black hover:text-white'}`}>
                      {already ? '담김' : conflict ? '겹침' : '담기'}
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-[1fr_auto] gap-2 text-xs">
                    <p className="text-gray-700">{offering.professorName || '담당교수 미정'}</p>
                    <p className="font-bold">{offering.credits}학점</p>
                    <p className="col-span-2 font-semibold">{formatLectureTime(offering.lectureTime)}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </aside>
        <div className="space-y-5">
          <ClassScheduleGrid schedules={classSchedules} title="수업 시간표" emptyText="수강신청된 과목에 등록된 수업 시간이 없습니다." />
          <PersonalScheduleList schedules={personalSchedules} />
          <StudentOfferingGrid entries={entries} onRemove={remove} />
        </div>
      </div>
    </TimetableShell>
  )
}

type ScheduleFields = Omit<ClassSchedulePayload, 'courseId' | 'professorId' | 'deptId'>

interface ScheduleRowDraft {
  clientId: string
  id?: number
  dayOfWeek: string
  startTime: string
  endTime: string
  room: string
  memo: string
}

interface CourseScheduleChanges {
  creates: ScheduleFields[]
  updates: Array<{ schedule: ClassScheduleDto; payload: ScheduleFields }>
  deletes: ClassScheduleDto[]
}

type EditableScheduleField = 'dayOfWeek' | 'startTime' | 'endTime' | 'room' | 'memo'

let scheduleDraftSeed = 0

function isSameAssignment(assignment: ScheduleAssignment, schedule: ClassScheduleDto) {
  return assignment.courseId === schedule.courseId
    && assignment.deptId === schedule.deptId
    && assignment.professorId === schedule.professorId
}

function sortSchedules(a: ClassScheduleDto, b: ClassScheduleDto) {
  const dayDiff = WEEK_DAYS.indexOf(a.dayOfWeek) - WEEK_DAYS.indexOf(b.dayOfWeek)
  if (dayDiff !== 0) return dayDiff
  return a.startTime.localeCompare(b.startTime)
}

function schedulesForAssignment(schedules: ClassScheduleDto[], assignment: ScheduleAssignment) {
  return schedules.filter(schedule => isSameAssignment(assignment, schedule)).slice().sort(sortSchedules)
}

function scheduleSummary(schedules: ClassScheduleDto[]) {
  if (schedules.length === 0) return '등록된 시간이 없습니다.'
  return schedules
    .slice()
    .sort(sortSchedules)
    .map(schedule => `${schedule.dayOfWeek} ${schedule.startTime}-${schedule.endTime}${schedule.room ? ` · ${schedule.room}` : ''}`)
    .join(', ')
}

function draftFromSchedule(schedule?: ClassScheduleDto): ScheduleRowDraft {
  return {
    clientId: schedule ? `saved-${schedule.id}` : `new-${scheduleDraftSeed++}`,
    id: schedule?.id,
    dayOfWeek: schedule?.dayOfWeek ?? '월',
    startTime: schedule?.startTime ?? '09:00',
    endTime: schedule?.endTime ?? '10:30',
    room: schedule?.room ?? '',
    memo: schedule?.memo ?? '',
  }
}

function payloadFromDraft(row: ScheduleRowDraft): ScheduleFields {
  return {
    dayOfWeek: row.dayOfWeek,
    startTime: row.startTime,
    endTime: row.endTime,
    room: row.room.trim(),
    memo: row.memo.trim(),
    semester: SEMESTER,
  }
}

function hasScheduleChanged(schedule: ClassScheduleDto, row: ScheduleRowDraft) {
  return schedule.dayOfWeek !== row.dayOfWeek
    || schedule.startTime !== row.startTime
    || schedule.endTime !== row.endTime
    || (schedule.room ?? '') !== row.room
    || (schedule.memo ?? '') !== row.memo
}

function validateScheduleRows(rows: ScheduleRowDraft[]) {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    if (!row.dayOfWeek || !row.startTime || !row.endTime) {
      return `${index + 1}번째 시간의 요일과 시간을 입력하세요.`
    }
    if (row.startTime >= row.endTime) {
      return `${index + 1}번째 시간의 종료 시간은 시작 시간 이후여야 합니다.`
    }
  }
  for (let i = 0; i < rows.length; i += 1) {
    for (let j = i + 1; j < rows.length; j += 1) {
      const a = rows[i]
      const b = rows[j]
      if (a.dayOfWeek === b.dayOfWeek && a.startTime < b.endTime && b.startTime < a.endTime) {
        return '같은 강좌 안에서 겹치는 시간이 있습니다.'
      }
    }
  }
  return ''
}

function AssignmentScheduleCard<TAssignment extends ScheduleAssignment>({
  assignment,
  schedules,
  adminMode = false,
  onEdit,
}: {
  assignment: TAssignment
  schedules: ClassScheduleDto[]
  adminMode?: boolean
  onEdit: (assignment: TAssignment) => void
}) {
  const currentSchedules = schedulesForAssignment(schedules, assignment)

  return (
    <article className="border border-gray-200 p-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-black truncate">{assignment.courseName}</p>
          {adminMode && assignment.professorName && (
            <p className="text-xs text-gray-500 mt-1 truncate">{assignment.professorName}</p>
          )}
        </div>
        <span className="border border-gray-300 px-2 py-0.5 text-[11px] font-black shrink-0">{currentSchedules.length}개</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-gray-600">{scheduleSummary(currentSchedules)}</p>
      <button
        type="button"
        onClick={() => onEdit(assignment)}
        className="mt-3 w-full border-2 border-black px-3 py-2 text-xs font-black hover:bg-black hover:text-white"
      >
        시간 편집
      </button>
    </article>
  )
}

function AdminAssignmentScheduleList({
  assignments,
  filteredAssignments,
  schedules,
  scopeDeptId,
  requiresDeptSelection,
  query,
  statusFilter,
  sortBy,
  onQueryChange,
  onStatusFilterChange,
  onSortChange,
  onEdit,
}: {
  assignments: AssignmentItem[]
  filteredAssignments: AssignmentItem[]
  schedules: ClassScheduleDto[]
  scopeDeptId?: number
  requiresDeptSelection: boolean
  query: string
  statusFilter: AdminScheduleFilter
  sortBy: AdminScheduleSort
  onQueryChange: (value: string) => void
  onStatusFilterChange: (value: AdminScheduleFilter) => void
  onSortChange: (value: AdminScheduleSort) => void
  onEdit: (assignment: AssignmentItem) => void
}) {
  return (
    <section className="border-2 border-black bg-white">
      <div className="flex flex-col gap-3 border-b-2 border-black px-4 py-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-black">관리 가능한 교수-강좌 배정</h2>
          <p className="mt-1 text-xs text-gray-500">
            {scopeDeptId ? `학과 ID ${scopeDeptId} 범위의 배정 강좌를 목록으로 관리합니다.` : '학과 선택 후 배정 강좌 목록이 표시됩니다.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-black">
          <span className="border-2 border-black px-3 py-1">배정 {assignments.length}개</span>
          <span className="border-2 border-black px-3 py-1">등록 시간 {schedules.length}개</span>
        </div>
      </div>

      {requiresDeptSelection ? (
        <div className="p-8 text-center text-sm text-gray-500">
          최고관리자는 관리할 학과를 선택한 뒤 강좌별 수업 시간을 편집할 수 있습니다.
        </div>
      ) : !scopeDeptId ? (
        <div className="p-8 text-center text-sm text-gray-500">
          학과를 선택하면 등록 가능한 강좌 목록이 표시됩니다.
        </div>
      ) : assignments.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500">
          관리 가능한 교수-강좌 배정이 없습니다.
        </div>
      ) : (
        <>
          <div className="grid gap-3 border-b border-gray-200 p-4 lg:grid-cols-[minmax(260px,1fr)_180px_180px]">
            <label className="block text-xs font-bold">
              검색
              <input
                value={query}
                onChange={event => onQueryChange(event.target.value)}
                className="mt-1 w-full border-2 border-black px-3 py-2 text-sm font-normal"
                placeholder="강좌명 또는 교수명"
              />
            </label>
            <label className="block text-xs font-bold">
              상태
              <select
                value={statusFilter}
                onChange={event => onStatusFilterChange(event.target.value as AdminScheduleFilter)}
                className="mt-1 w-full border-2 border-black bg-white px-3 py-2 text-sm"
              >
                <option value="all">전체</option>
                <option value="scheduled">시간 등록됨</option>
                <option value="unscheduled">시간 미등록</option>
              </select>
            </label>
            <label className="block text-xs font-bold">
              정렬
              <select
                value={sortBy}
                onChange={event => onSortChange(event.target.value as AdminScheduleSort)}
                className="mt-1 w-full border-2 border-black bg-white px-3 py-2 text-sm"
              >
                <option value="course">강좌명순</option>
                <option value="professor">교수명순</option>
              </select>
            </label>
          </div>

          {filteredAssignments.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              조건에 맞는 강좌가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="bg-black text-white">
                  <tr className="text-left">
                    <th className="w-[30%] px-4 py-3 font-black">강좌</th>
                    <th className="w-[18%] px-4 py-3 font-black">담당 교수</th>
                    <th className="px-4 py-3 font-black">현재 시간</th>
                    <th className="w-[96px] px-4 py-3 text-center font-black">개수</th>
                    <th className="w-[120px] px-4 py-3 text-right font-black">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAssignments.map(assignment => {
                    const currentSchedules = schedulesForAssignment(schedules, assignment)
                    return (
                      <tr key={assignment.id} className="align-top hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-black">{assignment.courseName}</p>
                          <p className="mt-1 text-xs text-gray-500">Course ID {assignment.courseId}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold">{assignment.professorName || '담당 교수 미정'}</p>
                          <p className="mt-1 text-xs text-gray-500">Professor ID {assignment.professorId}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {scheduleSummary(currentSchedules)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block min-w-10 border border-gray-300 px-2 py-1 text-xs font-black">
                            {currentSchedules.length}개
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => onEdit(assignment)}
                            className="border-2 border-black px-3 py-2 text-xs font-black hover:bg-black hover:text-white"
                          >
                            시간 편집
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function CourseScheduleEditorModal({
  open,
  assignment,
  schedules,
  adminMode,
  onClose,
  onSave,
}: {
  open: boolean
  assignment: ScheduleAssignment | null
  schedules: ClassScheduleDto[]
  adminMode?: boolean
  onClose: () => void
  onSave: (assignment: ScheduleAssignment, changes: CourseScheduleChanges) => Promise<void>
}) {
  const [rows, setRows] = useState<ScheduleRowDraft[]>([])
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !assignment) return
    const nextSchedules = schedulesForAssignment(schedules, assignment)
    setRows(nextSchedules.length > 0 ? nextSchedules.map(draftFromSchedule) : [draftFromSchedule()])
    setMessage('')
    setSaving(false)
  }, [open, assignment, schedules])

  if (!open || !assignment) return null

  const originalSchedules = schedulesForAssignment(schedules, assignment)
  const originalById = new Map(originalSchedules.map(schedule => [schedule.id, schedule]))

  const updateRow = (clientId: string, field: EditableScheduleField, value: string) => {
    setRows(currentRows => currentRows.map(row => (
      row.clientId === clientId ? { ...row, [field]: value } : row
    )))
  }

  const removeRow = (clientId: string) => {
    setRows(currentRows => currentRows.filter(row => row.clientId !== clientId))
  }

  const addRow = () => {
    setRows(currentRows => [...currentRows, draftFromSchedule()])
  }

  const submit = async () => {
    const validationMessage = validateScheduleRows(rows)
    if (validationMessage) {
      setMessage(validationMessage)
      return
    }

    const rowIds = new Set(rows.map(row => row.id).filter((id): id is number => id != null))
    const creates = rows.filter(row => row.id == null).map(payloadFromDraft)
    const updates = rows.flatMap(row => {
      if (row.id == null) return []
      const schedule = originalById.get(row.id)
      if (!schedule || !hasScheduleChanged(schedule, row)) return []
      return [{ schedule, payload: payloadFromDraft(row) }]
    })
    const deletes = originalSchedules.filter(schedule => !rowIds.has(schedule.id))

    if (creates.length === 0 && updates.length === 0 && deletes.length === 0) {
      onClose()
      return
    }

    setSaving(true)
    try {
      await onSave(assignment, { creates, updates, deletes })
      onClose()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="bg-white border-2 border-black w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="bg-black text-white px-5 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-black truncate">강좌 시간 편집</h3>
            <p className="text-xs text-gray-300 mt-1 truncate">
              {adminMode && assignment.professorName ? `${assignment.professorName} · ` : ''}{assignment.courseName}
            </p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 border border-white shrink-0">×</button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          {message && <NoticeMessage>{message}</NoticeMessage>}
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-600">요일과 시간을 행 단위로 추가하거나 수정하세요.</p>
            <button type="button" onClick={addRow} className="border-2 border-black px-3 py-2 text-xs font-black hover:bg-black hover:text-white">+ 시간 추가</button>
          </div>
          {rows.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
              저장하면 이 강좌의 등록된 수업 시간이 모두 삭제됩니다.
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((row, index) => (
                <div key={row.clientId} className="grid gap-3 border border-gray-200 p-3 md:grid-cols-[92px_130px_130px_1fr_1fr_auto]">
                  <label className="block text-xs font-bold">
                    요일
                    <select value={row.dayOfWeek} onChange={e => updateRow(row.clientId, 'dayOfWeek', e.target.value)} className="mt-1 w-full border-2 border-black px-2 py-2 text-sm bg-white">
                      {WEEK_DAYS.map(day => <option key={day}>{day}</option>)}
                    </select>
                  </label>
                  <label className="block text-xs font-bold">
                    시작
                    <input type="time" value={row.startTime} onChange={e => updateRow(row.clientId, 'startTime', e.target.value)} className="mt-1 w-full border-2 border-black px-2 py-2 text-sm" />
                  </label>
                  <label className="block text-xs font-bold">
                    종료
                    <input type="time" value={row.endTime} onChange={e => updateRow(row.clientId, 'endTime', e.target.value)} className="mt-1 w-full border-2 border-black px-2 py-2 text-sm" />
                  </label>
                  <label className="block text-xs font-bold">
                    강의실
                    <input value={row.room} onChange={e => updateRow(row.clientId, 'room', e.target.value)} className="mt-1 w-full border-2 border-black px-2 py-2 text-sm" placeholder="예: 공학관 301" />
                  </label>
                  <label className="block text-xs font-bold">
                    메모
                    <input value={row.memo} onChange={e => updateRow(row.clientId, 'memo', e.target.value)} className="mt-1 w-full border-2 border-black px-2 py-2 text-sm" placeholder="선택 입력" />
                  </label>
                  <div className="flex items-end">
                    <button type="button" onClick={() => removeRow(row.clientId)} className="w-full border-2 border-black px-3 py-2 text-xs font-black hover:bg-black hover:text-white">
                      {index + 1} 삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border-2 border-black py-2 font-black">취소</button>
            <button type="button" onClick={submit} disabled={saving} className="flex-1 bg-black text-white py-2 font-black disabled:opacity-50">{saving ? '저장 중...' : '저장'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfessorTimetableView({ username }: { username: string }) {
  const [assignments, setAssignments] = useState<ProfessorAssignmentDto[]>([])
  const [schedules, setSchedules] = useState<ClassScheduleDto[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<ProfessorAssignmentDto | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [message, setMessage] = useState('')

  const reload = async () => {
    const [nextAssignments, nextSchedules] = await Promise.all([
      fetchProfessorAssignments(username),
      fetchProfessorClassSchedules(username, SEMESTER),
    ])
    setAssignments(nextAssignments)
    setSchedules(nextSchedules)
  }

  useEffect(() => {
    reload().catch(error => setMessage(error instanceof Error ? error.message : '교수 시간표를 불러오지 못했습니다.'))
  }, [username])

  const openEditor = (assignment: ProfessorAssignmentDto) => {
    setMessage('')
    setSelectedAssignment(assignment)
    setModalOpen(true)
  }

  const openEditorForSchedule = (schedule: ClassScheduleDto) => {
    const assignment = assignments.find(item => isSameAssignment(item, schedule))
    if (!assignment) {
      setMessage('해당 수업의 담당 강좌 배정을 찾을 수 없습니다.')
      return
    }
    openEditor(assignment)
  }

  const closeEditor = () => {
    setModalOpen(false)
    setSelectedAssignment(null)
  }

  const saveCourseSchedules = async (assignment: ScheduleAssignment, changes: CourseScheduleChanges) => {
    try {
      for (const { schedule, payload } of changes.updates) {
        await updateClassSchedule(username, schedule.id, { ...payload, courseId: assignment.courseId })
      }
      for (const payload of changes.creates) {
        await createClassSchedule(username, { ...payload, courseId: assignment.courseId })
      }
      for (const schedule of changes.deletes) {
        await deleteClassSchedule(username, schedule.id)
      }
      await reload()
    } catch (error) {
      await reload().catch(() => undefined)
      throw error
    }
  }

  const remove = async (schedule: ClassScheduleDto) => {
    if (!window.confirm('이 수업 시간표를 삭제할까요?')) return
    try {
      await deleteClassSchedule(username, schedule.id)
      await reload()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '삭제에 실패했습니다.')
    }
  }

  return (
    <TimetableShell badge={`담당 강좌 ${assignments.length}개 / 등록 시간 ${schedules.length}개`}>
      {message && <NoticeMessage>{message}</NoticeMessage>}
      <div className="grid xl:grid-cols-[320px_1fr] gap-5">
        <aside className="border-2 border-black bg-white p-4">
          <h2 className="font-black mb-3">내 담당 강좌</h2>
          {assignments.length === 0 ? <p className="text-sm text-gray-500">배정된 강좌가 없습니다.</p> : (
            <div className="space-y-2">
              {assignments.map(assignment => (
                <AssignmentScheduleCard
                  key={assignment.id}
                  assignment={assignment}
                  schedules={schedules}
                  onEdit={openEditor}
                />
              ))}
            </div>
          )}
        </aside>
        <ClassScheduleGrid schedules={schedules} title="내 수업 시간표" emptyText="아직 등록된 수업 시간이 없습니다." canEdit onEdit={openEditorForSchedule} onDelete={remove} />
      </div>
      <CourseScheduleEditorModal open={modalOpen} assignment={selectedAssignment} schedules={schedules} onClose={closeEditor} onSave={saveCourseSchedules} />
    </TimetableShell>
  )
}

function AdminTimetableView({ username, adminRole }: { username: string; adminRole: string }) {
  const { selectedDeptId } = useDept()
  const authDeptId = Number(getAuthItem('deptId') ?? '') || undefined
  const scopeDeptId = selectedDeptId ?? authDeptId
  const [assignments, setAssignments] = useState<AssignmentItem[]>([])
  const [schedules, setSchedules] = useState<ClassScheduleDto[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AdminScheduleFilter>('all')
  const [sortBy, setSortBy] = useState<AdminScheduleSort>('course')
  const requiresDeptSelection = adminRole === 'SUPER_ADMIN' && !scopeDeptId

  const reload = async () => {
    if (requiresDeptSelection) {
      setSchedules([])
      setAssignments([])
      setMessage('')
      return
    }
    const [nextSchedules, nextAssignments] = await Promise.all([
      fetchAdminClassSchedules(username, SEMESTER, scopeDeptId),
      scopeDeptId ? fetchDeptAssignments(scopeDeptId) : Promise.resolve([]),
    ])
    setSchedules(nextSchedules)
    setAssignments(nextAssignments)
  }

  useEffect(() => {
    reload().catch(error => setMessage(error instanceof Error ? error.message : '관리자 시간표를 불러오지 못했습니다.'))
  }, [username, scopeDeptId, requiresDeptSelection])

  const filteredAssignments = useMemo(() => {
    const term = normalize(query)
    return assignments
      .filter(assignment => {
        const currentSchedules = schedulesForAssignment(schedules, assignment)
        const matchesQuery = !term || normalize(`${assignment.courseName} ${assignment.professorName}`).includes(term)
        const matchesStatus = statusFilter === 'all'
          || (statusFilter === 'scheduled' && currentSchedules.length > 0)
          || (statusFilter === 'unscheduled' && currentSchedules.length === 0)
        return matchesQuery && matchesStatus
      })
      .slice()
      .sort((a, b) => {
        if (sortBy === 'professor') {
          const professorDiff = a.professorName.localeCompare(b.professorName, 'ko')
          if (professorDiff !== 0) return professorDiff
        }
        const courseDiff = a.courseName.localeCompare(b.courseName, 'ko')
        if (courseDiff !== 0) return courseDiff
        return a.professorName.localeCompare(b.professorName, 'ko')
      })
  }, [assignments, query, schedules, sortBy, statusFilter])

  const openEditor = (assignment: AssignmentItem) => {
    setMessage('')
    setSelectedAssignment(assignment)
    setModalOpen(true)
  }

  const closeEditor = () => {
    setModalOpen(false)
    setSelectedAssignment(null)
  }

  const saveCourseSchedules = async (assignment: ScheduleAssignment, changes: CourseScheduleChanges) => {
    const base = {
      courseId: assignment.courseId,
      professorId: assignment.professorId,
      deptId: assignment.deptId,
    }
    try {
      for (const { schedule, payload } of changes.updates) {
        await updateAdminClassSchedule(username, schedule.id, { ...payload, ...base })
      }
      for (const payload of changes.creates) {
        await createAdminClassSchedule(username, { ...payload, ...base })
      }
      for (const schedule of changes.deletes) {
        await deleteAdminClassSchedule(username, schedule.id)
      }
      await reload()
    } catch (error) {
      await reload().catch(() => undefined)
      throw error
    }
  }

  return (
    <TimetableShell badge={`${adminRole} · 관리 시간 ${schedules.length}개`}>
      {message && <NoticeMessage>{message}</NoticeMessage>}
      {requiresDeptSelection && <NoticeMessage>최고관리자는 관리할 학과를 선택한 뒤 수업 시간표를 조회/등록할 수 있습니다.</NoticeMessage>}
      <div className="mb-4">
        <p className="text-sm text-gray-500">{scopeDeptId ? `학과 ID ${scopeDeptId} 범위` : 'SUPER_ADMIN · 학과 선택 전에는 전체 시간표를 표시하지 않습니다.'}</p>
      </div>
      <AdminAssignmentScheduleList
        assignments={assignments}
        filteredAssignments={filteredAssignments}
        schedules={schedules}
        scopeDeptId={scopeDeptId}
        requiresDeptSelection={requiresDeptSelection}
        query={query}
        statusFilter={statusFilter}
        sortBy={sortBy}
        onQueryChange={setQuery}
        onStatusFilterChange={setStatusFilter}
        onSortChange={setSortBy}
        onEdit={openEditor}
      />
      <CourseScheduleEditorModal open={modalOpen} assignment={selectedAssignment} schedules={schedules} adminMode onClose={closeEditor} onSave={saveCourseSchedules} />
    </TimetableShell>
  )
}

function NoticeMessage({ children }: { children: ReactNode }) {
  return <div className="mb-4 border-2 border-black bg-yellow-50 px-4 py-3 text-sm font-bold">{children}</div>
}

function TimetableShell({ badge, children }: { badge: string; children: ReactNode }) {
  return (
    <div className="bg-white text-black min-h-screen">
      <Navbar />
      <div className="pt-14" />
      <main className="max-w-[1500px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 border-b-2 border-black pb-4 mb-5">
          <div>
            <p className="text-sm text-gray-500">2026학년도 1학기</p>
            <h1 className="text-3xl font-black">시간표</h1>
            <p className="text-sm text-gray-500 mt-2">수업 시간표와 개인/담은 강좌 정보를 구분해서 확인합니다.</p>
          </div>
          <div className="border-2 border-black px-4 py-2 font-black text-sm">{badge}</div>
        </div>
        {children}
      </main>
    </div>
  )
}

function AccessGuide({ text }: { text: string }) {
  return (
    <div className="bg-white text-black min-h-screen">
      <Navbar />
      <main className="pt-28 max-w-xl mx-auto px-4 text-center">
        <i className="fas fa-table-cells-large text-4xl text-gray-400 mb-4 block" />
        <h1 className="text-3xl font-black">시간표</h1>
        <p className="mt-3 text-gray-600 leading-relaxed">{text}</p>
      </main>
    </div>
  )
}

export default function TimetablePage() {
  const username = getAuthItem('username') ?? ''
  const memberType = getAuthItem('memberType')
  const adminRole = getAuthItem('adminRole')
  const loggedIn = isLoggedIn() && username

  if (!loggedIn) return <AccessGuide text="로그인하면 역할에 맞는 시간표를 확인할 수 있습니다." />
  if (adminRole) return <AdminTimetableView username={username} adminRole={adminRole} />
  if (memberType === 'professor') return <ProfessorTimetableView username={username} />
  if (memberType === 'student') return <StudentTimetableView username={username} />
  return <AccessGuide text="학생, 교수 또는 관리자 권한 계정으로 이용할 수 있습니다." />
}
