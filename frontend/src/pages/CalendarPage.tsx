import { useState, useEffect, useMemo } from 'react'
import Navbar from '../components/Navbar'
import AdminBanner from '../components/common/AdminBanner'
import { useDept } from '../context/DeptContext'
import { isLoggedIn, getAuthItem } from '../utils/authStorage'
import {
  loadSchedules, addSchedule, updateSchedule, deleteSchedule,
  type LocalSchedule,
} from '../utils/localSchedule'
import ScheduleCalendarView from '../components/schedule/ScheduleCalendarView'
import { PERSONAL_CATEGORY_META, type ScheduleItem } from '../utils/scheduleItem'
import {
  fetchStudentClassSchedules,
  fetchStudentCourseEvents,
  fetchStudentDeptEvents,
  fetchProfessorCourses,
  fetchAssistantCourses,
  createProfessorCourseSchedule,
  createProfessorDeptSchedule,
  type ClassScheduleDto,
  type CourseEventDto,
  type DeptCourseEventDto,
} from '../api/classSchedules'
import {
  addSharedCourseEvent,
  loadSharedCourseEventsByDept,
  deleteSharedCourseEvent,
  sharedEventToScheduleItem,
} from '../utils/sharedCourseEvents'

// ── 타입 ──────────────────────────────────────────────────────────────────────

type CourseOption = { courseId: number; courseName: string }

// ── 기본 과목 목록 (API 데이터 없을 때 포함) ──────────────────────────────────

const PRESET_COURSES: CourseOption[] = [
  { courseId: 2001, courseName: '데이터베이스' },
  { courseId: 2002, courseName: '운영체제' },
  { courseId: 2003, courseName: '알고리즘' },
  { courseId: 2004, courseName: '공학윤리와 사회' },
  { courseId: 2005, courseName: '프로젝트랩' },
  { courseId: 2006, courseName: '임베디드시스템' },
  { courseId: 2007, courseName: '소프트웨어공학' },
  { courseId: 2008, courseName: '웹프로그래밍2' },
]

function mergeCourses(apiCourses: CourseOption[]): CourseOption[] {
  const existingNames = new Set(apiCourses.map(c => c.courseName))
  return [
    ...apiCourses,
    ...PRESET_COURSES.filter(c => !existingNames.has(c.courseName)),
  ]
}

// ── 유틸 ──────────────────────────────────────────────────────────────────────

const DAY_MAP: Record<string, number> = { 일: 0, 월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6 }

function pad2(n: number) { return String(n).padStart(2, '0') }

function currentSemester(): string {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() + 1 <= 7 ? '1' : '2'}`
}

// 반복 수업 시간표 → 날짜별 ScheduleItem 변환 (±3개월 범위)
function expandClassSchedule(cs: ClassScheduleDto): ScheduleItem[] {
  const targetDow = DAY_MAP[cs.dayOfWeek]
  if (targetDow === undefined) return []
  const now   = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
  const end   = new Date(now.getFullYear(), now.getMonth() + 3, 31)
  const items: ScheduleItem[] = []
  const cur = new Date(start)
  while (cur.getDay() !== targetDow) cur.setDate(cur.getDate() + 1)
  while (cur <= end) {
    const ds = `${cur.getFullYear()}-${pad2(cur.getMonth() + 1)}-${pad2(cur.getDate())}`
    items.push({
      id: `course-${cs.id}-${ds}`,
      title: cs.courseName,
      date: ds,
      category: 'course',
      startTime: cs.startTime,
      endTime: cs.endTime,
      allDay: false,
      content: `${cs.professorName} 교수 | ${cs.room}`,
      readonly: true,
    })
    cur.setDate(cur.getDate() + 7)
  }
  return items
}

function courseEventToScheduleItem(ev: CourseEventDto): ScheduleItem {
  return {
    id: `prof-event-${ev.id}`,
    title: ev.title,
    date: ev.date,
    category: ev.category,
    allDay: true,
    content: `D${ev.dday >= 0 ? '-' + ev.dday : '+' + Math.abs(ev.dday)}`,
    readonly: true,
  }
}

function deptCourseEventToScheduleItem(ev: DeptCourseEventDto): ScheduleItem {
  return {
    id: `dept-event-${ev.id}`,
    title: ev.courseName ? `[${ev.courseName}] ${ev.title}` : ev.title,
    date: ev.date,
    category: ev.category,
    allDay: true,
    content: `D${ev.dday >= 0 ? '-' + ev.dday : '+' + Math.abs(ev.dday)}`,
    readonly: true,
  }
}

// ── 수업 일정 등록 모달 ────────────────────────────────────────────────────────

function ProfEventModal({
  open,
  courses,
  onClose,
  onSubmit,
}: {
  open: boolean
  courses: CourseOption[]
  onClose: () => void
  onSubmit: (courseId: number, courseName: string, title: string, eventDate: string, category: string) => Promise<void>
}) {
  const [courseId, setCourseId] = useState<number | ''>('')
  const [title, setTitle]       = useState('')
  const [eventDate, setEventDate] = useState('')
  const [category, setCategory]  = useState('기타')
  const [loading, setLoading]    = useState(false)
  const [msg, setMsg]            = useState<string | null>(null)

  const uniqueCourses = useMemo(() => {
    const seen = new Set<number>()
    return courses.filter(c => { if (seen.has(c.courseId)) return false; seen.add(c.courseId); return true })
  }, [courses])

  if (!open) return null

  const handleSubmit = async () => {
    if (!courseId || !title || !eventDate) { setMsg('과목, 제목, 날짜는 필수입니다.'); return }
    const selected = uniqueCourses.find(c => c.courseId === Number(courseId))
    setLoading(true)
    await onSubmit(Number(courseId), selected?.courseName ?? '', title, eventDate, category)
    setLoading(false)
    setCourseId(''); setTitle(''); setEventDate(''); setCategory('기타'); setMsg(null)
    onClose()
  }

  const selectedCourse = uniqueCourses.find(c => c.courseId === Number(courseId))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-900">수업 일정 등록</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          {msg && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded">{msg}</p>}

          {/* 과목 선택 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">과목 선택 <span className="text-red-500">*</span></label>
            <select
              value={courseId}
              onChange={e => setCourseId(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white">
              <option value="">-- 과목을 선택하세요 --</option>
              {uniqueCourses.map(c => (
                <option key={c.courseId} value={c.courseId}>{c.courseName}</option>
              ))}
            </select>
            {selectedCourse && (
              <p className="mt-1 text-xs text-blue-600">선택됨: {selectedCourse.courseName}</p>
            )}
          </div>

          {/* 일정 제목 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">일정 제목 <span className="text-red-500">*</span></label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              placeholder="예: 중간고사, 과제 제출, 보강 등" />
          </div>

          {/* 날짜 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">날짜 <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={eventDate}
              onChange={e => setEventDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">카테고리</label>
            <div className="flex gap-2">
              {(['시험', '과제', '기타'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition
                    ${category === cat
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── CalendarPage ──────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { selectedDeptId } = useDept()
  const loggedIn    = isLoggedIn()
  const memberType  = getAuthItem('memberType')
  const username    = getAuthItem('username') ?? ''
  const deptId      = getAuthItem('deptId') ?? ''
  const isStudent   = memberType === 'student'
  const isProfessor = memberType === 'professor' || memberType === 'assistant'

  const [personalSchedules, setPersonalSchedules] = useState<LocalSchedule[]>([])
  const [courseSchedules, setCourseSchedules]     = useState<ScheduleItem[]>([])
  const [courseEvents, setCourseEvents]           = useState<ScheduleItem[]>([])
  const [profCourses, setProfCourses]             = useState<CourseOption[]>([])
  const [loadingCourse, setLoadingCourse]         = useState(false)
  const [profModalOpen, setProfModalOpen]         = useState(false)

  // 개인 일정 로드
  useEffect(() => { setPersonalSchedules(loadSchedules()) }, [])

  const semester = currentSemester()

  // 학생: 수업 시간표 + API 이벤트 + 교수가 등록한 공유 이벤트 로드
  useEffect(() => {
    if (!loggedIn || !isStudent || !username) return
    setLoadingCourse(true)
    Promise.all([
      fetchStudentClassSchedules(username, semester),
      fetchStudentCourseEvents(username, semester),
      deptId ? fetchStudentDeptEvents(deptId) : Promise.resolve([]),
    ]).then(([dtos, apiEvents, deptEvents]) => {
      setCourseSchedules(dtos.flatMap(expandClassSchedule))

      // 수강과목 기반 이벤트
      const fromApi = apiEvents.map(courseEventToScheduleItem)

      // 학과 전체 교수 등록 이벤트 (DB)
      const fromDept = (deptEvents as DeptCourseEventDto[]).map(deptCourseEventToScheduleItem)

      // localStorage 공유 이벤트 (같은 브라우저 동기화 폴백)
      const fromShared = loadSharedCourseEventsByDept(deptId).map(sharedEventToScheduleItem)

      // 중복 제거 (id 기준, DB 우선)
      const usedIds = new Set([...fromApi.map(e => e.id), ...fromDept.map(e => e.id)])
      const merged = [...fromApi, ...fromDept, ...fromShared.filter(e => !usedIds.has(e.id))]

      setCourseEvents(merged)
      setLoadingCourse(false)
    })
  }, [loggedIn, isStudent, username, semester, deptId])

  // 학생: 교수가 localStorage에 새 이벤트를 저장하면 실시간으로 반영
  useEffect(() => {
    if (!loggedIn || !isStudent || !deptId) return
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'class_course_events_v1') {
        const fromShared = loadSharedCourseEventsByDept(deptId).map(sharedEventToScheduleItem)
        setCourseEvents(prev => {
          // prof-event-* 와 dept-event-* 모두 보존, localStorage 공유 이벤트만 갱신
          const nonShared = prev.filter(ev => !ev.id.toString().startsWith('ce-'))
          const nonSharedIds = new Set(nonShared.map(ev => ev.id))
          return [...nonShared, ...fromShared.filter(ev => !nonSharedIds.has(ev.id))]
        })
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [loggedIn, isStudent, deptId])

  // 교수/조교: 담당 과목 목록 + 기본 과목 병합
  useEffect(() => {
    if (!loggedIn || !isProfessor || !username) return
    if (memberType === 'professor') {
      fetchProfessorCourses(username).then(dtos => {
        const seen = new Set<number>()
        const apiCourses = dtos
          .filter(c => { if (seen.has(c.courseId)) return false; seen.add(c.courseId); return true })
          .map(c => ({ courseId: c.courseId, courseName: c.courseName }))
        setProfCourses(mergeCourses(apiCourses))
      })
    } else {
      fetchAssistantCourses(username).then(dtos =>
        setProfCourses(mergeCourses(dtos.map(c => ({ courseId: c.courseId, courseName: c.courseName }))))
      )
    }
  }, [loggedIn, isProfessor, memberType, username])

  // 교수: 로그인 시 자신이 등록한 일정 캘린더에 표시 (DB + localStorage 병합)
  useEffect(() => {
    if (!loggedIn || !isProfessor || !deptId) return
    fetchStudentDeptEvents(deptId).then(dbEvents => {
      const fromDb = dbEvents.map(deptCourseEventToScheduleItem)
      const fromShared = loadSharedCourseEventsByDept(deptId)
        .filter(e => e.registeredBy === username)
        .map(sharedEventToScheduleItem)
      const dbIds = new Set(fromDb.map(e => e.id))
      const merged = [...fromDb, ...fromShared.filter(e => !dbIds.has(e.id))]
      if (merged.length > 0) setCourseEvents(merged)
    })
  }, [loggedIn, isProfessor, deptId, username])

  const allSchedules = useMemo<ScheduleItem[]>(() => [
    ...personalSchedules,
    ...courseSchedules,
    ...courseEvents,
  ], [personalSchedules, courseSchedules, courseEvents])

  const reload = () => setPersonalSchedules(loadSchedules())

  const handleSave = (data: Omit<ScheduleItem, 'id'> & { id?: string }) => {
    if (data.category === 'course') return
    const local: Omit<LocalSchedule, 'id'> & { id?: string } = {
      title:     data.title,
      date:      data.date,
      startTime: data.startTime ?? '',
      endTime:   data.endTime ?? '',
      category:  data.category as LocalSchedule['category'],
      status:    'scheduled',
      content:   data.content ?? '',
      allDay:    data.allDay ?? false,
      ...(data.id ? { id: data.id } : {}),
    }
    if (local.id) updateSchedule(local as LocalSchedule)
    else addSchedule(local as Omit<LocalSchedule, 'id'>)
    reload()
  }

  const handleDelete = (id: string) => {
    if (id.startsWith('course-')) return
    if (id.startsWith('dept-event-')) return  // DB 이벤트는 읽기 전용
    // 공유 이벤트: 교수 본인이 등록한 것만 삭제 가능
    if (id.startsWith('ce-')) {
      deleteSharedCourseEvent(id)
      setCourseEvents(prev => prev.filter(e => e.id !== id))
      return
    }
    if (id.startsWith('prof-event-')) return
    deleteSchedule(id)
    reload()
  }

  // 교수가 수업 일정 등록 → DB 저장 + localStorage 폴백
  const handleProfEventSubmit = async (
    courseId: number, courseName: string, title: string, eventDate: string, category: string,
  ) => {
    // 1. DB 저장 (학과 전체 학생에게 공유됨)
    const saved = await createProfessorDeptSchedule(username, { courseName, title, eventDate, category })

    if (saved) {
      // DB 저장 성공 → 교수 캘린더에 즉시 반영
      setCourseEvents(prev => [...prev, deptCourseEventToScheduleItem(saved)])
    } else {
      // DB 실패 시 localStorage 폴백 (같은 브라우저 동기화)
      const shared = addSharedCourseEvent({
        courseName,
        title,
        date: eventDate,
        category,
        deptId,
        registeredBy: username,
      })
      setCourseEvents(prev => [...prev, sharedEventToScheduleItem(shared)])
    }

    // 2. 수강신청 기반 course 이벤트도 저장 (enrollment 있는 학생 대상)
    if (courseId < 2001) {
      await createProfessorCourseSchedule(username, { courseId, title, eventDate, category })
    }
  }

  return (
    <div className="bg-white text-gray-900 font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />
      <AdminBanner scope="dept" targetId={selectedDeptId ?? undefined} />

      {/* 교수/조교 전용: 수업 일정 등록 버튼 */}
      {loggedIn && isProfessor && (
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-end">
          <button
            onClick={() => setProfModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
            + 수업 일정 등록
          </button>
        </div>
      )}

      <div style={{ minHeight: 'calc(100vh - 56px)' }}>
        <ScheduleCalendarView
          schedules={allSchedules}
          categoryMeta={PERSONAL_CATEGORY_META}
          loading={loadingCourse}
          canWrite={loggedIn}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </div>

      <ProfEventModal
        open={profModalOpen}
        courses={profCourses}
        onClose={() => setProfModalOpen(false)}
        onSubmit={handleProfEventSubmit}
      />
    </div>
  )
}
