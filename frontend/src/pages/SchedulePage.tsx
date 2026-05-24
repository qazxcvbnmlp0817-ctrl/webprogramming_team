import Navbar from '../components/Navbar'
import AdminBanner from '../components/common/AdminBanner'
import { useDept } from '../context/DeptContext'
import { useDeptFetch } from '../hooks/useDeptFetch'
import { fetchSchedules } from '../api/schedules'
import ScheduleCalendarView from '../components/schedule/ScheduleCalendarView'
import { API_CATEGORY_META } from '../utils/scheduleItem'

export default function SchedulePage() {
  const { selectedDeptId, selectedDeptName } = useDept()
  const { data, loading } = useDeptFetch(fetchSchedules, selectedDeptId)
  const schedules = (data ?? []).map(s => ({ ...s, id: String(s.id) }))

  return (
    <div className="bg-white text-gray-900 font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />

      <section className="bg-black text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <i className="fas fa-calendar-alt" />
            {selectedDeptName ? `${selectedDeptName} 일정` : '학과 일정'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">학과의 주요 일정을 확인하세요</p>
        </div>
      </section>

      <AdminBanner scope="dept" targetId={selectedDeptId ?? undefined} />

      <ScheduleCalendarView
        schedules={schedules}
        categoryMeta={API_CATEGORY_META}
        loading={loading}
      />
    </div>
  )
}
