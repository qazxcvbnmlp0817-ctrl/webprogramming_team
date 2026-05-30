import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import type { PostAttachmentDto } from '../types/post'
import AccessDenied from '../components/common/AccessDenied'
import { isLoggedIn as checkLoggedIn, isPrivileged } from '../utils/accessCheck'

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
  commentCount: number
  isPublicToOutsiders?: boolean
  scopeType?: string
  scopeId?: number
  hidden?: boolean
}

interface NoticeCommentDto {
  id: number
  noticeId: number
  author: string
  authorUsername: string
  content: string
  date: string
  parentId: number | null
}

export default function NoticeDetailPage() {
  const { noticeId } = useParams<{ noticeId: string }>()
  const navigate = useNavigate()
  const id = Number(noticeId)

  const [notice, setNotice]           = useState<NoticeDetail | null>(null)
  const [loading, setLoading]         = useState(true)
  const [comments, setComments]       = useState<NoticeCommentDto[]>([])
  const [commentText, setCommentText] = useState('')
  const [editingId, setEditingId]     = useState<number | null>(null)
  const [editText, setEditText]       = useState('')
  const [replyingToId, setReplyingToId] = useState<number | null>(null)
  const [replyText, setReplyText]       = useState('')

  const username   = sessionStorage.getItem('username') ?? ''
  const myName     = sessionStorage.getItem('name')     ?? ''
  const memberType = sessionStorage.getItem('memberType') ?? ''
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true'

  useEffect(() => {
    async function load() {
      const [noticeRes, commentRes] = await Promise.all([
        fetch(`/api/notices/${id}`),
        fetch(`/api/notices/${id}/comments`),
      ])
      if (!noticeRes.ok) { navigate(-1); return }
      const [noticeData, commentData] = await Promise.all([
        noticeRes.json(),
        commentRes.json(),
      ])
      setNotice(noticeData)
      setComments(commentData)
      setLoading(false)
    }
    load()
  }, [id, navigate])

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim()) return
    if (!isLoggedIn) { alert('로그인이 필요합니다.'); return }
    const res = await fetch(`/api/notices/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: myName, authorUsername: username, content: commentText }),
    })
    if (res.ok) {
      const newComment: NoticeCommentDto = await res.json()
      setComments(prev => [...prev, newComment])
      setCommentText('')
      setNotice(prev => prev ? { ...prev, commentCount: (prev.commentCount ?? 0) + 1 } : prev)
    }
  }

  async function handleCommentDelete(commentId: number) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    const res = await fetch(
      `/api/notices/${id}/comments/${commentId}?username=${encodeURIComponent(username)}&memberType=${memberType}`,
      { method: 'DELETE' }
    )
    if (res.ok) {
      const removed = comments.filter(c => c.id === commentId || c.parentId === commentId)
      setComments(prev => prev.filter(c => c.id !== commentId && c.parentId !== commentId))
      setNotice(prev => prev ? { ...prev, commentCount: (prev.commentCount ?? 0) - removed.length } : prev)
    }
  }

  function startEdit(c: NoticeCommentDto) {
    setEditingId(c.id)
    setEditText(c.content)
    setReplyingToId(null)  // 답글 입력폼이 열려 있으면 닫기
  }

  function cancelEdit() {
    setEditingId(null)
    setEditText('')
  }

  async function handleCommentEdit(commentId: number) {
    if (!editText.trim()) return
    const res = await fetch(`/api/notices/${id}/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editText, authorUsername: username }),
    })
    if (res.ok) {
      const updated: NoticeCommentDto = await res.json()
      setComments(prev => prev.map(c => c.id === commentId ? updated : c))
      cancelEdit()
    }
  }

  async function handleReplySubmit(parentId: number) {
    if (!replyText.trim()) return
    if (!isLoggedIn) { alert('로그인이 필요합니다.'); return }
    const res = await fetch(`/api/notices/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: myName, authorUsername: username, content: replyText, parentId }),
    })
    if (res.ok) {
      const newReply: NoticeCommentDto = await res.json()
      setComments(prev => [...prev, newReply])
      setReplyText('')
      setReplyingToId(null)
      setNotice(prev => prev ? { ...prev, commentCount: (prev.commentCount ?? 0) + 1 } : prev)
    }
  }

  async function handleDelete() {
    if (!confirm('공지사항을 삭제하시겠습니까?')) return
    const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' })
    if (res.ok) navigate(-1)
  }

  async function handleAdminHide() {
    if (!notice) return
    const newHidden = !notice.hidden
    const res = await fetch(`/api/notices/${id}/hidden`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Username': username },
      body: JSON.stringify({ hidden: newHidden }),
    })
    if (res.ok) setNotice(prev => prev ? { ...prev, hidden: newHidden } : prev)
  }

  async function handleAdminDelete() {
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

  if (!isPrivileged() && notice.scopeType && notice.scopeType !== 'univ') {
    if (!checkLoggedIn() && !notice.isPublicToOutsiders) {
      return (
        <div className="bg-white text-black font-sans min-h-screen">
          <Navbar />
          <div className="pt-14" />
          <AccessDenied message="로그인이 필요합니다." />
        </div>
      )
    }
  }

  const isAuthor  = username === notice.authorUsername || myName === notice.author
  const canDelete = isAuthor || memberType === 'admin'
  const adminRole = sessionStorage.getItem('adminRole')
  const isAdmin   = !!adminRole

  const gradeLabel = notice.targetGrades.length < 4
    ? notice.targetGrades.map(g => `${g}학년`).join('·')
    : null

  return (
    <div className="bg-white text-black font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />

      {isAdmin && (
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <div className="border border-gray-300 bg-gray-50 px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <i className="fas fa-shield-halved" />
              <span>관리자 모드</span>
              {notice.hidden && <span className="bg-gray-400 text-white px-1.5 py-0.5 text-xs">숨김 중</span>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdminHide}
                className={`text-xs border px-3 py-1 transition ${notice.hidden ? 'border-blue-400 text-blue-600 hover:bg-blue-50' : 'border-gray-400 text-gray-600 hover:bg-gray-100'}`}
              >{notice.hidden ? '표시 복원' : '숨김 처리'}</button>
              <button
                onClick={handleAdminDelete}
                className="text-xs border border-red-400 text-red-500 px-3 py-1 hover:bg-red-50 transition"
              >삭제</button>
            </div>
          </div>
        </div>
      )}

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

        {/* 댓글 */}
        <section>
          <h2 className="text-base font-bold mb-4 border-b border-black pb-2">
            댓글 <span className="text-gray-500 font-normal">{comments.length}</span>
          </h2>

          {comments.filter(c => c.parentId === null).length === 0 && (
            <p className="text-sm text-gray-400 mb-4">첫 댓글을 남겨보세요.</p>
          )}

          <ul className="flex flex-col gap-4 mb-6">
            {comments.filter(c => c.parentId === null).map(c => {
              const isMyComment = c.authorUsername === username
              const replies = comments.filter(r => r.parentId === c.id)
              return (
                <li key={c.id} className="border-b border-gray-100 pb-3">
                  {/* 원댓글 */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{c.author}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{c.date}</span>
                      {isMyComment && editingId !== c.id && (
                        <>
                          <button onClick={() => startEdit(c)} className="text-xs text-gray-400 hover:text-black">수정</button>
                          <button onClick={() => handleCommentDelete(c.id)} className="text-xs text-gray-400 hover:text-red-500">삭제</button>
                        </>
                      )}
                      {!isMyComment && memberType === 'admin' && (
                        <button onClick={() => handleCommentDelete(c.id)} className="text-xs text-gray-400 hover:text-red-500">삭제</button>
                      )}
                    </div>
                  </div>
                  {editingId === c.id ? (
                    <div>
                      <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3} className="border border-black px-3 py-2 text-sm outline-none resize-none w-full" />
                      <div className="flex gap-2 justify-end mt-1">
                        <button onClick={cancelEdit} className="text-xs border border-gray-400 px-3 py-1 hover:bg-gray-100">취소</button>
                        <button onClick={() => handleCommentEdit(c.id)} className="text-xs bg-black text-white px-3 py-1 hover:bg-gray-800">저장</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                  )}

                  {/* 답글 달기 버튼 */}
                  {isLoggedIn && editingId !== c.id && (
                    <button
                      onClick={() => { setReplyingToId(replyingToId === c.id ? null : c.id); setReplyText('') }}
                      className="text-xs text-gray-400 hover:text-black mt-1 ml-1"
                    >↩ 답글 달기</button>
                  )}

                  {/* 대댓글 목록 */}
                  {replies.length > 0 && (
                    <ul className="flex flex-col gap-2 mt-2">
                      {replies.map(reply => {
                        const isMyReply = reply.authorUsername === username
                        return (
                          <li key={reply.id} className="ml-6 pl-3 border-l-2 border-gray-200 pb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium"><span className="text-gray-400 mr-1">↩</span>{reply.author}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">{reply.date}</span>
                                {isMyReply && (
                                  <button onClick={() => handleCommentDelete(reply.id)} className="text-xs text-gray-400 hover:text-red-500">삭제</button>
                                )}
                                {!isMyReply && memberType === 'admin' && (
                                  <button onClick={() => handleCommentDelete(reply.id)} className="text-xs text-gray-400 hover:text-red-500">삭제</button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                          </li>
                        )
                      })}
                    </ul>
                  )}

                  {/* 답글 입력폼 */}
                  {replyingToId === c.id && (
                    <div className="ml-6 mt-2 flex flex-col gap-1">
                      <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="답글을 입력하세요..." rows={2} className="border border-gray-400 px-3 py-2 text-sm outline-none resize-none" />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setReplyingToId(null); setReplyText('') }} className="text-xs border border-gray-400 px-3 py-1 hover:bg-gray-100">취소</button>
                        <button onClick={() => handleReplySubmit(c.id)} className="text-xs bg-black text-white px-3 py-1 hover:bg-gray-800">등록</button>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          {isLoggedIn ? (
            <form onSubmit={handleCommentSubmit} className="flex flex-col gap-2">
              <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="댓글을 입력하세요..." rows={3} className="border border-black px-3 py-2 text-sm outline-none resize-none" />
              <div className="flex justify-end">
                <button type="submit" className="px-5 py-2 text-sm bg-black text-white font-medium hover:bg-gray-800 transition">댓글 등록</button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              댓글을 작성하려면{' '}
              <button onClick={() => navigate('/login')} className="underline text-black">로그인</button>
              하세요.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
