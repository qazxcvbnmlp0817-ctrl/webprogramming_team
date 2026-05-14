import { NoticeDto } from '../types/notice'

export async function fetchNotices(): Promise<{ featured: NoticeDto; notices: NoticeDto[] }> {
  const res = await fetch('/api/notices')
  if (!res.ok) throw new Error('공지사항 로딩 실패')
  return res.json()
}
