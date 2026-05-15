import type { NoticeDto } from '../types/notice'
import type { PostDto } from '../types/post'
import type { ScheduleDto } from '../types/schedule'
import type { UniversityDto } from '../types/university'

// DB 연동 시 URL만 실제 엔드포인트로 교체하면 됨

export async function fetchSchoolNotices(univId: number): Promise<{ featured: NoticeDto; notices: NoticeDto[] }> {
  const res = await fetch(`/api/school/notices?univId=${univId}`)
  if (!res.ok) throw new Error('학교 공지사항 로딩 실패')
  return res.json()
}

export async function fetchSchoolPosts(univId: number): Promise<{ featured: PostDto; posts: PostDto[] }> {
  const res = await fetch(`/api/school/posts?univId=${univId}`)
  if (!res.ok) throw new Error('학교 게시판 로딩 실패')
  return res.json()
}

export async function fetchSchoolSchedules(univId: number): Promise<ScheduleDto[]> {
  const res = await fetch(`/api/school/schedules?univId=${univId}`)
  if (!res.ok) throw new Error('학교 일정 로딩 실패')
  return res.json()
}

export async function fetchSchoolInfo(univId: number): Promise<UniversityDto> {
  const res = await fetch(`/api/school/info?univId=${univId}`)
  if (!res.ok) throw new Error('학교 정보 로딩 실패')
  return res.json()
}
