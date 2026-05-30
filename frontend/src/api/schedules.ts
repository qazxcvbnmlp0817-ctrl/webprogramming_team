import type { ScheduleDto } from '../types/schedule'

export async function fetchSchedules(deptId: number): Promise<ScheduleDto[]> {
  try {
    const res = await fetch(`/api/schedules?deptId=${deptId}`)
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export async function fetchFacultySchedules(facultyId: number): Promise<ScheduleDto[]> {
  try {
    const res = await fetch(`/api/faculty/schedules?facultyId=${facultyId}`)
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export async function fetchUnivSchedules(univId: number): Promise<ScheduleDto[]> {
  try {
    const res = await fetch(`/api/univ/schedules?univId=${univId}`)
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}
