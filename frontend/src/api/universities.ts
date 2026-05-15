import type { UniversityDto } from '../types/university'
import type { NoticeDto } from '../types/notice'
import type { PostDto } from '../types/post'
import type { ScheduleDto } from '../types/schedule'

export async function fetchUniversities(): Promise<UniversityDto[]> {
  const res = await fetch('/api/universities')
  if (!res.ok) throw new Error('대학교 목록 로딩 실패')
  return res.json()
}

export async function fetchUniversity(id: number): Promise<UniversityDto> {
  const res = await fetch(`/api/universities/${id}`)
  if (!res.ok) throw new Error('대학교 로딩 실패')
  return res.json()
}

export async function fetchMainData(deptId: number): Promise<{
  notices: NoticeDto[]
  posts: PostDto[]
  schedules: ScheduleDto[]
  today: string
}> {
  const res = await fetch(`/api/main?deptId=${deptId}`)
  if (!res.ok) throw new Error('메인 데이터 로딩 실패')
  return res.json()
}
