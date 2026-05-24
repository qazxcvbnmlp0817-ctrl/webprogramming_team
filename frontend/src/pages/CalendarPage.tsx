import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import AdminBanner from '../components/common/AdminBanner'
import { useDept } from '../context/DeptContext'
import {
  loadSchedules, addSchedule, updateSchedule, deleteSchedule,
  type LocalSchedule,
} from '../utils/localSchedule'
import ScheduleCalendarView from '../components/schedule/ScheduleCalendarView'
import { PERSONAL_CATEGORY_META, type ScheduleItem } from '../utils/scheduleItem'

export default function CalendarPage() {
  const { selectedDeptId } = useDept()
  const [schedules, setSchedules] = useState<LocalSchedule[]>([])
  useEffect(() => { setSchedules(loadSchedules()) }, [])
  const reload = () => setSchedules(loadSchedules())

  const handleSave = (data: Omit<ScheduleItem, 'id'> & { id?: string }) => {
    if (data.id) {
      const existing = schedules.find(s => s.id === data.id)
      updateSchedule({
        id: data.id,
        title: data.title,
        date: data.date,
        startTime: data.startTime ?? '',
        endTime: data.endTime ?? '',
        allDay: data.allDay ?? false,
        category: data.category as LocalSchedule['category'],
        content: data.content ?? '',
        status: existing?.status ?? 'scheduled',
      })
    } else {
      addSchedule({
        title: data.title,
        date: data.date,
        startTime: data.startTime ?? '',
        endTime: data.endTime ?? '',
        allDay: data.allDay ?? false,
        category: data.category as LocalSchedule['category'],
        content: data.content ?? '',
        status: 'scheduled',
      })
    }
    reload()
  }

  const handleDelete = (id: string) => { deleteSchedule(id); reload() }

  return (
    <div className="bg-white text-gray-900 font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />
      <AdminBanner scope="dept" targetId={selectedDeptId ?? undefined} />

      <ScheduleCalendarView
        schedules={schedules}
        categoryMeta={PERSONAL_CATEGORY_META}
        canWrite
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
