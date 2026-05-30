export interface PostAttachmentDto {
  id: number | null
  originalName: string
  url: string
  fileSize: number
  fileType: string
  isImage: boolean
}

export interface PostDto {
  id: number
  title: string
  author: string
  likes: number
  category: string
  viewCount: number
  date: string
  featured: boolean
  commentCount: number
  notice: boolean
  imageUrl?: string | null
  targetGrades: number[]
  visibility: 'public' | 'grade'
  content?: string
  authorUsername?: string
  attachments?: PostAttachmentDto[]
  scopeType?: string
  scopeId?: number
  hidden?: boolean
}
