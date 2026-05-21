import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import type { PostAttachmentDto } from '../types/post'

interface NoticeDetail {
  id: number
  title: string
  date: string
  author: string
  authorUsername?: string
  category: string
  viewCount: number
  featured: boolean
  targetGrades: number[]
  content: string | null
  attachments: PostAttachmentDto[] | null
}

export default function NoticeDetailPage() {
  const { noticeId } = useParams<{ noticeId: string }>()
  const navigate = useNavigate()
  const id = Number(noticeId)

  const [notice, setNotice] = useState<NoticeDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const username   = sessionStorage.getItem('username') ?? ''
  const myName     = sessionStorage.getItem('name')     ?? ''
  const memberType = sessionStorage.getItem('memberType') ?? ''

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/notices/${id}`)
      if (!res.ok) { navigate(-1); return }
      setNotice(await res.json())
      setLoading(false)
    }
    load()
  }, [id, navigate])

  async function handleDelete() {
    if (!confirm('공지사항을 삭제하시겠습니까?')) return
    const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' })
    if (res.ok) navigate(-1)
  }

  if (loading) {
    return (
      <div className="bg-white text-black font-sans min-h-screen">
        <Navbar />
        <div className="pt-14" />
        <div className="py-32 text-center text-gray-400">
          <i className="fas fa-spinner fa-spin text-3xl mb-3 block" />불러오는 중...
        </div>
      </div>
    )
  }

  if (!notice) return null

  const isAuthor  = username === notice.authorUsername || myName === notice.author
  const canDelete = isAuthor || memberType === 'admin'

  const gradeLabel = notice.targetGrades.length < 4
    ? notice.targetGrades.map(g => `${g}학년`).join('·')
    : null

  return (
    <div className="bg-white text-black font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-black mb-6 flex items-center gap-1"
        >
          <i className="fas fa-arrow-left" /> 목록으로
        </button>

        <div className="border-b border-black pb-4 mb-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="border border-black text-black px-1.5 py-0.5 text-xs font-medium">
              {notice.category}
            </span>
            {gradeLabel && (
              <span className="border border-gray-400 text-gray-500 px-1.5 py-0.5 text-xs">
                {gradeLabel}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold mb-3">{notice.title}</h1>
          <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500">
            <span className="font-medium text-gray-800">{notice.author}</span>
            <span>{notice.date}</span>
            <span><i className="fas fa-eye mr-1" />{notice.viewCount}</span>
            {(isAuthor || canDelete) && (
              <div className="ml-auto flex gap-2">
                {isAuthor && (
                  <button
                    onClick={() => navigate(`/notice/${id}/edit`)}
                    className="text-xs border border-black px-3 py-1 hover:bg-black hover:text-white transition"
                  >수정</button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="text-xs border border-red-500 text-red-500 px-3 py-1 hover:bg-red-500 hover:text-white transition"
                  >삭제</button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="min-h-40 text-sm leading-relaxed whitespace-pre-wrap mb-6">
          {notice.content ?? ''}
        </div>

        {notice.attachments && notice.attachments.filter(a => a.isImage).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {notice.attachments.filter(a => a.isImage).map(a => (
              <img key={a.url} src={a.url} alt={a.originalName}
                className="max-w-full max-h-96 border border-gray-200 object-contain" />
            ))}
          </div>
        )}

        {notice.attachments && notice.attachments.filter(a => !a.isImage).length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">첨부파일</h3>
            <ul className="flex flex-col gap-1">
              {notice.attachments.filter(a => !a.isImage).map(a => (
                <li key={a.url} className="flex items-center gap-2 border border-gray-200 px-3 py-2 text-sm">
                  <i className="fas fa-paperclip text-gray-400 flex-shrink-0" />
                  <a href={a.url} download={a.originalName}
                    className="flex-1 truncate text-blue-600 hover:underline">
                    {a.originalName}
                  </a>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {a.fileSize < 1024 * 1024
                      ? `${(a.fileSize / 1024).toFixed(1)} KB`
                      : `${(a.fileSize / (1024 * 1024)).toFixed(1)} MB`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
