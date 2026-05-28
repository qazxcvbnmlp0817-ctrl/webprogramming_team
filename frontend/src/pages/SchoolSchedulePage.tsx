import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AdminBanner from '../components/common/AdminBanner'
import { useDeptFetch } from '../hooks/useDeptFetch'
import { useDept } from '../context/DeptContext'
import { fetchSchoolSchedules } from '../api/school'
import ScheduleCalendarView from '../components/schedule/ScheduleCalendarView'
import { API_CATEGORY_META } from '../utils/scheduleItem'

export default function SchoolSchedulePage() {
  const { selectedUniversityId, selectedUniversityName } = useDept()
  const { data, loading } = useDeptFetch(fetchSchoolSchedules, selectedUniversityId)
  const schedules = (data ?? []).map(s => ({ ...s, id: String(s.id) }))

  return (
    <div className="bg-white text-gray-900 font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />

      <section className="bg-black text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link to={`/universities/${selectedUniversityId}`}
            className="text-gray-400 hover:text-white transition text-sm">
            <i className="fas fa-arrow-left mr-1" />{selectedUniversityName ?? '학교 홈'}
          </Link>
          <span className="text-gray-600">›</span>
          <h1 className="text-xl font-bold"><i className="fas fa-calendar-alt mr-2" />학교 일정</h1>
        </div>
      </section>

      <AdminBanner scope="school" targetId={selectedUniversityId ?? undefined} />

      <ScheduleCalendarView
        schedules={schedules}
        categoryMeta={API_CATEGORY_META}
        loading={loading}
      />
    </div>
  )
}
