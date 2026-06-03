import type { NoticeDto } from '../types/notice'
import type { PostDto } from '../types/post'
import type { ScheduleDto } from '../types/schedule'
import type { SchoolInfoDto } from '../types/schoolInfo'

export async function fetchFacultyMainData(facultyId: number): Promise<{
  notices: NoticeDto[]
  posts: PostDto[]
  schedules: ScheduleDto[]
  today: string
}> {
  const res = await fetch(`/api/faculty/main?facultyId=${facultyId}`)
  if (!res.ok) throw new Error('학부 메인 데이터 로딩 실패')
  return res.json()
}

export async function fetchFacultyNotices(facultyId: number): Promise<{ featured: NoticeDto; notices: NoticeDto[] }> {
  const res = await fetch(`/api/faculty/notices?facultyId=${facultyId}`)
  if (!res.ok) throw new Error('학부 공지사항 로딩 실패')
  return res.json()
}

export async function fetchFacultySchedules(facultyId: number): Promise<ScheduleDto[]> {
  const res = await fetch(`/api/faculty/schedules?facultyId=${facultyId}`)
  if (!res.ok) throw new Error('학부 일정 로딩 실패')
  return res.json()
}

// DB 연동 시 URL만 실제 엔드포인트로 교체하면 됨

export async function fetchSchoolNotices(univId: number): Promise<{ featured?: NoticeDto; notices: NoticeDto[] }> {
  const res = await fetch(`/api/school/notices?univId=${univId}`)
  if (!res.ok) throw new Error('학교 공지사항 로딩 실패')
  return res.json()
}

export async function fetchSchoolPosts(univId: number): Promise<{ featured?: PostDto; posts: PostDto[] }> {
  const res = await fetch(`/api/school/posts?univId=${univId}`)
  if (!res.ok) throw new Error('학교 게시판 로딩 실패')
  return res.json()
}

export async function fetchSchoolSchedules(univId: number): Promise<ScheduleDto[]> {
  const res = await fetch(`/api/school/schedules?univId=${univId}`)
  if (!res.ok) throw new Error('학교 일정 로딩 실패')
  return res.json()
}

export async function fetchSchoolInfo(univId: number): Promise<SchoolInfoDto> {
  const res = await fetch(`/api/school/info?univId=${univId}`)
  if (!res.ok) throw new Error('학교 정보 로딩 실패')
  return res.json()
}

export async function fetchFacultyPosts(facultyId: number): Promise<{ featured: PostDto; posts: PostDto[] }> {
  const res = await fetch(`/api/faculty/posts?facultyId=${facultyId}`)
  if (!res.ok) throw new Error('학부 게시판 로딩 실패')
  return res.json()
}
