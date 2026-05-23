import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import type { PostDto } from '../types/post'

interface CommentDto {
  id: number
  postId: number
  author: string
  authorUsername: string | null
  content: string
  date: string
}

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>()
  const navigate   = useNavigate()
  const id         = Number(postId)

  const [post, setPost]               = useState<PostDto | null>(null)
  const [comments, setComments]       = useState<CommentDto[]>([])
  const [loading, setLoading]         = useState(true)
  const [liked, setLiked]             = useState(false)
  const [likeCount, setLikeCount]     = useState(0)
  const [commentText, setCommentText] = useState('')
  const [editingId, setEditingId]     = useState<number | null>(null)
  const [editText, setEditText]       = useState('')

  const username   = sessionStorage.getItem('username') ?? ''
  const myName     = sessionStorage.getItem('name')     ?? ''
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true'

  useEffect(() => {
    async function load() {
      const [postRes, commentRes] = await Promise.all([
        fetch(`/api/posts/${id}`),
        fetch(`/api/posts/${id}/comments`),
      ])
      if (!postRes.ok) { navigate(-1); return }
      const postData: PostDto      = await postRes.json()
      const commentData: CommentDto[] = await commentRes.json()
      setPost(postData)
      setLikeCount(postData.likes)
      setComments(commentData)

      if (username) {
        const likeRes = await fetch(`/api/posts/${id}/like?username=${encodeURIComponent(username)}`)
        if (likeRes.ok) {
          const likeData = await likeRes.json()
          setLiked(likeData.liked)
        }
      }
      setLoading(false)
    }
    load()
  }, [id, username, navigate])

  async function handleLike() {
    if (!isLoggedIn) { alert('로그인이 필요합니다.'); return }
    const res = await fetch(
      `/api/posts/${id}/like?username=${encodeURIComponent(username)}`,
      { method: 'POST' }
    )
    if (res.ok) {
      const data = await res.json()
      setLiked(data.liked)
      setLikeCount(data.likes)
    }
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim()) return
    if (!isLoggedIn) { alert('로그인이 필요합니다.'); return }
    const res = await fetch(`/api/posts/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: myName, authorUsername: username, content: commentText }),
    })
    if (res.ok) {
      const newComment: CommentDto = await res.json()
      setComments(prev => [...prev, newComment])
      setCommentText('')
      setPost(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev)
    }
  }

  async function handleCommentDelete(commentId: number) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    const memberType = sessionStorage.getItem('memberType') ?? ''
    const res = await fetch(
      `/api/posts/${id}/comments/${commentId}?username=${encodeURIComponent(username)}&memberType=${memberType}`,
      { method: 'DELETE' }
    )
    if (res.ok) {
      setComments(prev => prev.filter(c => c.id !== commentId))
      setPost(prev => prev ? { ...prev, commentCount: prev.commentCount - 1 } : prev)
    }
  }

  function startEdit(c: CommentDto) {
    setEditingId(c.id)
    setEditText(c.content)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditText('')
  }

  async function handleCommentEdit(commentId: number) {
    if (!editText.trim()) return
    const res = await fetch(`/api/posts/${id}/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editText, authorUsername: username }),
    })
    if (res.ok) {
      const updated: CommentDto = await res.json()
      setComments(prev => prev.map(c => c.id === commentId ? updated : c))
      cancelEdit()
    }
  }

  async function handleDelete() {
    if (!confirm('게시글을 삭제하시겠습니까?')) return
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
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

  if (!post) return null

  const memberType = sessionStorage.getItem('memberType') ?? ''
  const isAuthor = username === post.authorUsername || myName === post.author
  const canDelete  = isAuthor || memberType === 'admin'
  const gradeLabel = post.visibility === 'grade'
    ? post.targetGrades.map(g => `${g}학년`).join('·')
    : null

  return (
    <div className="bg-white text-black font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* 뒤로가기 */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-black mb-6 flex items-center gap-1"
        >
          <i className="fas fa-arrow-left" /> 목록으로
        </button>

        {/* 헤더 */}
        <div className="border-b border-black pb-4 mb-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="border border-black text-black px-1.5 py-0.5 text-xs font-medium">
              {post.category}
            </span>
            {gradeLabel && (
              <span className="border border-gray-400 text-gray-500 px-1.5 py-0.5 text-xs">
                {gradeLabel}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold mb-3">{post.title}</h1>
          <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500">
            <span className="font-medium text-gray-800">{post.author}</span>
            <span>{post.date}</span>
            <span><i className="fas fa-eye mr-1" />{post.viewCount}</span>
            <span><i className="fas fa-heart mr-1 text-red-400" />{likeCount}</span>
            <span><i className="fas fa-comment mr-1" />{post.commentCount}</span>
            {(isAuthor || canDelete) && (
              <div className="ml-auto flex gap-2">
                {isAuthor && (
                  <button
                    onClick={() => navigate(`/post/${id}/edit`)}
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

        {/* 본문 */}
        <div className="min-h-40 text-sm leading-relaxed whitespace-pre-wrap mb-6">
          {post.content ?? ''}
        </div>

        {/* 첨부 이미지 */}
        {post.attachments && post.attachments.filter(a => a.isImage).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.attachments.filter(a => a.isImage).map(a => (
              <img key={a.url} src={a.url} alt={a.originalName}
                className="max-w-full max-h-96 border border-gray-200 object-contain" />
            ))}
          </div>
        )}

        {/* 첨부파일 목록 */}
        {post.attachments && post.attachments.filter(a => !a.isImage).length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">첨부파일</h3>
            <ul className="flex flex-col gap-1">
              {post.attachments.filter(a => !a.isImage).map(a => (
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

        {/* 추천 버튼 */}
        <div className="flex justify-center mb-10">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-8 py-2.5 border text-sm font-medium transition ${
              liked
                ? 'bg-black text-white border-black'
                : 'border-black text-black hover:bg-gray-100'
            }`}
          >
            <i className={`fas fa-heart ${liked ? 'text-red-400' : 'text-red-300'}`} />
            추천 {likeCount}
          </button>
        </div>

        {/* 댓글 */}
        <section>
          <h2 className="text-base font-bold mb-4 border-b border-black pb-2">
            댓글 <span className="text-gray-500 font-normal">{comments.length}</span>
          </h2>

          {comments.length === 0 && (
            <p className="text-sm text-gray-400 mb-4">첫 댓글을 남겨보세요.</p>
          )}

          <ul className="flex flex-col gap-4 mb-6">
            {comments.map(c => {
              const isMyComment = c.authorUsername ? c.authorUsername === username : c.author === myName
              return (
                <li key={c.id} className="border-b border-gray-100 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{c.author}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{c.date}</span>
                      {isMyComment && editingId !== c.id && (
                        <>
                          <button
                            onClick={() => startEdit(c)}
                            className="text-xs text-gray-400 hover:text-black"
                          >수정</button>
                          <button
                            onClick={() => handleCommentDelete(c.id)}
                            className="text-xs text-gray-400 hover:text-red-500"
                          >삭제</button>
                        </>
                      )}
                      {!isMyComment && memberType === 'admin' && (
                        <button
                          onClick={() => handleCommentDelete(c.id)}
                          className="text-xs text-gray-400 hover:text-red-500"
                        >삭제</button>
                      )}
                    </div>
                  </div>
                  {editingId === c.id ? (
                    <div>
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        rows={3}
                        className="border border-black px-3 py-2 text-sm outline-none resize-none w-full"
                      />
                      <div className="flex gap-2 justify-end mt-1">
                        <button
                          onClick={cancelEdit}
                          className="text-xs border border-gray-400 px-3 py-1 hover:bg-gray-100"
                        >취소</button>
                        <button
                          onClick={() => handleCommentEdit(c.id)}
                          className="text-xs bg-black text-white px-3 py-1 hover:bg-gray-800"
                        >저장</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                  )}
                </li>
              )
            })}
          </ul>

          {isLoggedIn ? (
            <form onSubmit={handleCommentSubmit} className="flex flex-col gap-2">
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="댓글을 입력하세요..."
                rows={3}
                className="border border-black px-3 py-2 text-sm outline-none resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-black text-white font-medium hover:bg-gray-800 transition"
                >댓글 등록</button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              댓글을 작성하려면{' '}
              <button onClick={() => navigate('/login')} className="underline text-black">
                로그인
              </button>
              하세요.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
