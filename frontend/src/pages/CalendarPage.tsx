import { useState, useEffect, useMemo } from 'react'
import Navbar from '../components/Navbar'
import AdminBanner from '../components/common/AdminBanner'
import { useDept } from '../context/DeptContext'
import { isLoggedIn, getAuthItem } from '../utils/authStorage'
import { fetchMyTimetable, type TimetableEntryDto } from '../api/timetable'
import ScheduleCalendarView from '../components/schedule/ScheduleCalendarView'
import { PERSONAL_CATEGORY_META, type ScheduleItem } from '../utils/scheduleItem'
import {
  fetchProfessorAssignedCourses,
  fetchAssistantCourses,
  fetchStudentCourseEvents,
  fetchStudentDeptEvents,
  type CourseEventDto,
  type DeptCourseEventDto,
} from '../api/classSchedules'
import {
  createSchedule,
  updateSchedule,
  deleteUnifiedSchedule,
  toggleScheduleComplete,
  type UnifiedScheduleDto,
  type ScheduleCreateReq,
  type ScheduleType,
} from '../api/unifiedSchedules'

// ── 타입 ──────────────────────────────────────────────────────────────────────

type CourseOption = { courseId: number; courseName: string }

// ── 유틸 ──────────────────────────────────────────────────────────────────────

const DAY_MAP: Record<string, number> = { 일: 0, 월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6 }
function pad2(n: number) { return String(n).padStart(2, '0') }
function currentSemester(): string {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() + 1 <= 7 ? '1' : '2'}`
}
function periodToTime(period: number): string {
  return `${String(8 + period).padStart(2, '0')}:00`
}

// DB 일정 DTO → ScheduleItem 변환
function unifiedToItem(dto: UnifiedScheduleDto): ScheduleItem {
  const isMultiDay = !!dto.endDate && dto.endDate > dto.startDate
  return {
    id: String(dto.id),
    title: dto.title,
    date: dto.startDate,
    endDate: dto.endDate ?? undefined,
    category: dto.category,
    scheduleType: dto.scheduleType,
    isCompleted: dto.isCompleted,
    courseId: dto.courseId ?? undefined,
    startTime: dto.startTime ?? undefined,
    endTime: dto.endTime ?? undefined,
    allDay: isMultiDay ? true : !dto.startTime,
    content: dto.content ?? undefined,
    createdBy: dto.createdBy,
  }
}

// 시간표 → 날짜별 ScheduleItem (±3개월, readonly)
function expandTimetableEntry(entry: TimetableEntryDto): ScheduleItem[] {
  const text = entry.offering.lectureTime?.replace(/\s+/g, '') ?? ''
  const matches = [...text.matchAll(/([월화수목금])([0-9,]+)/g)]
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
  const end   = new Date(now.getFullYear(), now.getMonth() + 3, 31)
  const items: ScheduleItem[] = []
  for (const match of matches) {
    const targetDow = DAY_MAP[match[1]]
    if (targetDow === undefined) continue
    const periods = match[2].split(',').map(Number).filter(Boolean).sort((a, b) => a - b)
    if (periods.length === 0) continue
    const startTime = periodToTime(periods[0])
    const endTime   = periodToTime(periods[periods.length - 1] + 1)
    const cur = new Date(start)
    while (cur.getDay() !== targetDow) cur.setDate(cur.getDate() + 1)
    while (cur <= end) {
      const ds = `${cur.getFullYear()}-${pad2(cur.getMonth() + 1)}-${pad2(cur.getDate())}`
      items.push({
        id: `timetable-${entry.entryId}-${match[1]}-${ds}`,
        title: entry.offering.courseName,
        date: ds,
        category: 'course',
        startTime, endTime,
        allDay: false,
        content: `${entry.offering.professorName || ''} | ${entry.offering.section}분반`,
        readonly: true,
      })
      cur.setDate(cur.getDate() + 7)
    }
  }
  return items
}

// ClassEvent 한글 카테고리 → PERSONAL_CATEGORY_META 영문 key 정규화
const CAT_NORM: Record<string, string> = {
  '시험': 'exam', '과제': 'task', '기타': 'other', '학사': 'academic', '행사': 'event',
}
function normCat(cat: string) { return CAT_NORM[cat] ?? cat }

// ClassEvent 과목 이벤트 → ScheduleItem (readonly, 학생 조회용)
function courseEventToItem(ev: CourseEventDto): ScheduleItem {
  const isMulti = ev.endDate && ev.endDate > ev.date
  return {
    id: `ce-course-${ev.id}`,
    title: ev.title,
    date: ev.date,
    endDate: ev.endDate ?? undefined,
    category: normCat(ev.category),
    scheduleType: 'COURSE',
    startTime: ev.startTime ?? undefined,
    endTime: ev.endTime ?? undefined,
    allDay: isMulti ? true : !ev.startTime,
    content: `D${ev.dday >= 0 ? '-' + ev.dday : '+' + Math.abs(ev.dday)}`,
    createdBy: ev.registeredBy,
    readonly: true,
  }
}

// ClassEvent 학과 이벤트 → ScheduleItem (readonly, 학생 조회용)
function deptEventToItem(ev: DeptCourseEventDto): ScheduleItem {
  const isMulti = ev.endDate && ev.endDate > ev.date
  return {
    id: `ce-dept-${ev.id}`,
    title: ev.courseName ? `[${ev.courseName}] ${ev.title}` : ev.title,
    date: ev.date,
    endDate: ev.endDate ?? undefined,
    category: normCat(ev.category),
    scheduleType: ev.courseName ? 'COURSE' : 'DEPT_NOTICE',
    startTime: ev.startTime ?? undefined,
    endTime: ev.endTime ?? undefined,
    allDay: isMulti ? true : !ev.startTime,
    content: ev.memo
      ? `${ev.memo} | D${ev.dday >= 0 ? '-' + ev.dday : '+' + Math.abs(ev.dday)}`
      : `D${ev.dday >= 0 ? '-' + ev.dday : '+' + Math.abs(ev.dday)}`,
    createdBy: ev.registeredBy,
    readonly: true,
  }
}

// ── CalendarPage ──────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { selectedDeptId } = useDept()
  const loggedIn   = isLoggedIn()
  const memberType = getAuthItem('memberType')
  const username   = getAuthItem('username') ?? ''

  const deptId  = getAuthItem('deptId') ?? ''
  const isStudent = memberType === 'student'

  // ── 상태 ──────────────────────────────────────────────────────────────────
  const [dbSchedules, setDbSchedules]         = useState<ScheduleItem[]>([])
  const [classEvents, setClassEvents]         = useState<ScheduleItem[]>([]) // ClassEvent 기반
  const [timetableItems, setTimetableItems]   = useState<ScheduleItem[]>([])
  const [myCourses, setMyCourses]             = useState<CourseOption[]>([])
  const [loading, setLoading]                 = useState(false)

  const semester = currentSemester()

  // ── DB 일정 로드 (통합 API) ────────────────────────────────────────────────
  useEffect(() => {
    if (!loggedIn || !username) return
    setLoading(true)
    fetch('/api/schedules/my', { headers: { 'X-Username': username } })
      .then(r => {
        if (!r.ok) throw new Error(`일정 조회 실패: ${r.status}`)
        return r.json()
      })
      .then((dtos: import('../api/unifiedSchedules').UnifiedScheduleDto[]) => {
        setDbSchedules(dtos.filter(d => d.startDate).map(unifiedToItem))
      })
      .catch(e => console.error('[CalendarPage] 일정 로드 오류:', e))
      .finally(() => setLoading(false))
  }, [loggedIn, username])

  // ── 학생: ClassEvent 기반 학과 공지 + 과목 이벤트 로드 ───────────────────
  useEffect(() => {
    if (!loggedIn || !isStudent || !username) return
    const sem = currentSemester()
    Promise.all([
      deptId ? fetchStudentDeptEvents(deptId, username) : Promise.resolve([]),
      fetchStudentCourseEvents(username, sem),
    ]).then(([deptEvs, courseEvs]) => {
      const items: ScheduleItem[] = [
        ...(deptEvs as DeptCourseEventDto[]).map(deptEventToItem),
        ...(courseEvs as CourseEventDto[]).map(courseEventToItem),
      ]
      // 통합 API 결과와 id 중복 제거
      setClassEvents(items)
    })
  }, [loggedIn, isStudent, username, deptId])

  // ── 시간표 로드 (readonly 반복 수업) ──────────────────────────────────────
  useEffect(() => {
    if (!loggedIn || !username) return
    fetchMyTimetable(username, semester)
      .then(entries => setTimetableItems(entries.flatMap(expandTimetableEntry)))
      .catch(() => {})
  }, [loggedIn, username, semester])

  // ── 과목 목록 로드 (교수·조교만, 드롭다운용) ──────────────────────────────
  useEffect(() => {
    if (!loggedIn || !username) return
    if (memberType === 'professor') {
      fetchProfessorAssignedCourses(username)
        .then(dtos => {
          const seen = new Set<number>()
          setMyCourses(
            dtos
              .filter(c => { if (seen.has(c.courseId)) return false; seen.add(c.courseId); return true })
              .map(c => ({ courseId: c.courseId, courseName: c.courseName }))
          )
        })
    } else if (memberType === 'assistant') {
      fetchAssistantCourses(username)
        .then(dtos => setMyCourses(dtos.map(c => ({ courseId: c.courseId, courseName: c.courseName }))))
    }
    // 학생은 PERSONAL만 등록 가능 → 과목 선택 불필요
  }, [loggedIn, memberType, username])

  // ── 전체 일정 (통합 DB + ClassEvent + 시간표 병합, 중복 제거) ───────────────
  const allSchedules = useMemo<ScheduleItem[]>(() => {
    const unified = [...dbSchedules, ...timetableItems]
    const usedIds = new Set(unified.map(s => s.id))
    // ClassEvent 아이템 중 id 중복 없는 것만 추가
    const extra = classEvents.filter(e => !usedIds.has(e.id))
    return [...unified, ...extra]
  }, [dbSchedules, classEvents, timetableItems])

  // ── 일정 생성 / 수정 ──────────────────────────────────────────────────────
  const handleSave = async (
    data: Omit<ScheduleItem, 'id'> & {
      id?: string
      courseId?: number
      targetGrades?: number[]
      isAllGrades?: boolean
    }
  ): Promise<boolean> => {
    // 수업 시간표 ID(timetable-*, course-*)는 직접 수정 불가 — category 'course'는 허용
    if (data.id && (data.id.startsWith('timetable-') || data.id.startsWith('course-'))) return false
    if (!username) {
      alert('로그인이 필요합니다.')
      return false
    }

    const req: ScheduleCreateReq = {
      title:         data.title,
      content:       data.content ?? '',
      scheduleType:  (data.scheduleType ?? 'PERSONAL') as ScheduleType,
      courseId:      data.courseId,
      targetGrades:  data.targetGrades,
      isAllGrades:   data.isAllGrades,
      category:      data.category,
      startDate:     data.date,
      endDate:       data.endDate ?? '',
      startTime:     data.startTime ?? '',
      endTime:       data.endTime ?? '',
    }

    if (data.id) {
      const numId = parseInt(data.id)
      if (isNaN(numId)) return false
      const updated = await updateSchedule(username, numId, req)
      if (updated) {
        setDbSchedules(prev => prev.map(s => s.id === data.id ? unifiedToItem(updated) : s))
        return true
      }
      return false
    } else {
      const created = await createSchedule(username, req)
      if (created) {
        setDbSchedules(prev => [...prev, unifiedToItem(created)])
        return true
      }
      return false
    }
  }

  // ── 일정 삭제 ─────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (id.startsWith('timetable-') || id.startsWith('course-')) return
    const numId = parseInt(id)
    if (isNaN(numId)) return
    const ok = await deleteUnifiedSchedule(username, numId)
    if (ok) setDbSchedules(prev => prev.filter(s => s.id !== id))
  }

  // ── 완료 토글 ─────────────────────────────────────────────────────────────
  const handleToggleComplete = async (id: string) => {
    const numId = parseInt(id)
    if (isNaN(numId)) return
    const updated = await toggleScheduleComplete(username, numId)
    if (updated) {
      setDbSchedules(prev => prev.map(s => s.id === id ? { ...s, isCompleted: updated.isCompleted } : s))
    }
  }

  // ── 수정 (onUpdate) ───────────────────────────────────────────────────────
  const handleUpdate = async (
    id: string,
    data: Omit<ScheduleItem, 'id'> & { courseId?: number; targetGrades?: number[]; isAllGrades?: boolean }
  ): Promise<boolean> => {
    return handleSave({ ...data, id })
  }

  return (
    <div className="bg-white text-gray-900 font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />
      <AdminBanner scope="dept" targetId={selectedDeptId ?? undefined} />

      <div style={{ minHeight: 'calc(100vh - 56px)' }}>
        <ScheduleCalendarView
          schedules={allSchedules}
          categoryMeta={PERSONAL_CATEGORY_META}
          loading={loading}
          canWrite={loggedIn}
          username={username}
          memberType={memberType}
          myCourses={myCourses}
          onSave={handleSave}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onToggleComplete={handleToggleComplete}
        />
      </div>
    </div>
  )
}
