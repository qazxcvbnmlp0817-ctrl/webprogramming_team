import type { PostAttachmentDto } from './post'

export interface NoticeDto {
  id: number
  title: string
  date: string
  author: string
  category: string
  viewCount: number
  featured: boolean
  targetGrades: number[]
  content?: string | null
  attachments?: PostAttachmentDto[] | null
  authorUsername?: string | null
  commentCount?: number
}
