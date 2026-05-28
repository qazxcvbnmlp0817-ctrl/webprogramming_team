import type { ScheduleDto } from '../types/schedule'

export async function fetchSchedules(deptId: number): Promise<ScheduleDto[]> {
  const res = await fetch(`/api/schedules?deptId=${deptId}`)
  if (!res.ok) throw new Error('일정 로딩 실패')
  return res.json()
}
