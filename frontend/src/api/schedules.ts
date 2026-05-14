import { ScheduleDto } from '../types/schedule'

export async function fetchSchedules(): Promise<ScheduleDto[]> {
  const res = await fetch('/api/schedules')
  if (!res.ok) throw new Error('일정 로딩 실패')
  return res.json()
}
