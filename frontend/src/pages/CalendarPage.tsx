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
import { fetchStudentClassSchedules, type ClassScheduleDto } from '../api/classSchedules'

const DAY_MAP: Record<string, number> = { 일: 0, 월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6 }

function pad2(n: number) { return String(n).padStart(2, '0') }

function currentSemester(): string {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() + 1 <= 7 ? '1' : '2'}`
}

// Recurring class schedule → concrete dated ScheduleItems over a ±3-month window.
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

export default function CalendarPage() {
  const { selectedDeptId } = useDept()
  const loggedIn   = isLoggedIn()
  const memberType = getAuthItem('memberType')
  const username   = getAuthItem('username') ?? ''
  const isStudent  = memberType === 'student'

  const [personalSchedules, setPersonalSchedules] = useState<LocalSchedule[]>([])
  const [courseSchedules, setCourseSchedules]     = useState<ScheduleItem[]>([])
  const [loadingCourse, setLoadingCourse]         = useState(false)

  useEffect(() => { setPersonalSchedules(loadSchedules()) }, [])

  useEffect(() => {
    if (!loggedIn || !isStudent || !username) return
    setLoadingCourse(true)
    fetchStudentClassSchedules(username, currentSemester()).then(dtos => {
      setCourseSchedules(dtos.flatMap(expandClassSchedule))
      setLoadingCourse(false)
    })
  }, [loggedIn, isStudent, username])

  const allSchedules = useMemo<ScheduleItem[]>(() => [
    ...personalSchedules,
    ...courseSchedules,
  ], [personalSchedules, courseSchedules])

  const reload = () => setPersonalSchedules(loadSchedules())

  const handleSave = (data: Omit<ScheduleItem, 'id'> & { id?: string }) => {
    if (data.category === 'course') return
    const local: Omit<LocalSchedule, 'id'> & { id?: string } = {
      title:    data.title,
      date:     data.date,
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
    deleteSchedule(id)
    reload()
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
          loading={loadingCourse}
          canWrite={loggedIn}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
