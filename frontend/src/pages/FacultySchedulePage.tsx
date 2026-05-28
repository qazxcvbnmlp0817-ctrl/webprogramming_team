import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { fetchUniversity } from '../api/universities'
import { fetchFacultySchedules } from '../api/school'
import { useDept } from '../context/DeptContext'
import { useDeptFetch } from '../hooks/useDeptFetch'
import ScheduleCalendarView from '../components/schedule/ScheduleCalendarView'
import { API_CATEGORY_META } from '../utils/scheduleItem'

export default function FacultySchedulePage() {
  const { facultyId } = useParams<{ facultyId: string }>()
  const { selectedUniversityId } = useDept()
  const facultyIdNum = facultyId ? Number(facultyId) : null

  const { data: univ }    = useDeptFetch(fetchUniversity, selectedUniversityId)
  const { data, loading } = useDeptFetch(fetchFacultySchedules, facultyIdNum)

  const schedules = (data ?? []).map(s => ({ ...s, id: String(s.id) }))
  const school    = univ?.schools.find(s => s.faculties.some(f => f.id === facultyIdNum))
  const faculty   = school?.faculties.find(f => f.id === facultyIdNum)

  return (
    <div className="bg-white text-gray-900 font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />

      <section className="bg-black text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-500 text-xs mb-2">
            <Link to={`/school/faculty/${facultyId}`} className="hover:text-gray-300 transition">
              {faculty?.name ?? '학부'} 홈
            </Link>
            <span className="mx-1">›</span>
            <span>일정</span>
          </p>
          <h1 className="text-2xl font-bold">
            <i className="fas fa-calendar-alt mr-2" />일정
          </h1>
          {faculty && <p className="text-gray-400 text-sm mt-1">{faculty.name} 일정</p>}
        </div>
      </section>

      <ScheduleCalendarView
        schedules={schedules}
        categoryMeta={API_CATEGORY_META}
        loading={loading}
      />
    </div>
  )
}
