import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'

const CATEGORIES = ['일반', '학사', '장학', '행사', '취업']

export default function NoticeEditPage() {
  const navigate = useNavigate()
  const { noticeId } = useParams<{ noticeId: string }>()
  const id = Number(noticeId)

  const [title, setTitle]       = useState('')
  const [category, setCategory] = useState('학사')
  const [content, setContent]   = useState('')
  const [targetGrades, setTargetGrades] = useState<number[]>([1, 2, 3, 4])
  const [isPublicToOutsiders, setIsPublicToOutsiders] = useState(false)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const username   = sessionStorage.getItem('username') ?? ''
    const memberType = sessionStorage.getItem('memberType') ?? ''

    async function load() {
      const res = await fetch(`/api/notices/${id}`)
      if (!res.ok) { navigate(-1); return }
      const data = await res.json()

      const isAuthor = username === data.authorUsername
      if (!isAuthor && memberType !== 'admin') {
        navigate(-1)
        return
      }

      setTitle(data.title)
      setCategory(data.category)
      setContent(data.content ?? '')
      setTargetGrades(data.targetGrades ?? [1, 2, 3, 4])
      setIsPublicToOutsiders(data.isPublicToOutsiders ?? false)
      setLoading(false)
    }
    load()
  }, [id, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }
    const res = await fetch(`/api/notices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, category, targetGrades, isPublicToOutsiders }),
    })
    if (res.ok) navigate(`/notice/${id}`)
    else alert('수정에 실패했습니다. 다시 시도해주세요.')
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

  return (
    <div className="bg-white text-black font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />

      <section className="bg-black text-white py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold">
            <i className="fas fa-pen mr-2" />공지 수정
          </h1>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">카테고리</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="border border-black px-3 py-2 text-sm outline-none"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">제목</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="border border-black px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">내용</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              rows={12}
              className="border border-black px-3 py-2 text-sm outline-none resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">학년 태그</label>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4].map(g => (
                <label key={g} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-black w-4 h-4"
                    checked={targetGrades.includes(g)}
                    onChange={e => setTargetGrades(prev =>
                      e.target.checked ? [...prev, g] : prev.filter(v => v !== g)
                    )}
                  />
                  {g}학년
                </label>
              ))}
            </div>
          </div>

          {/* 외부인 공개 */}
          <div className="flex items-center gap-2 py-2">
            <input
              id="publicToOutsiders"
              type="checkbox"
              className="accent-black w-4 h-4"
              checked={isPublicToOutsiders}
              onChange={e => setIsPublicToOutsiders(e.target.checked)}
            />
            <label htmlFor="publicToOutsiders" className="text-sm font-medium cursor-pointer">
              외부인 공개 <span className="text-gray-400 font-normal">(비소속 학생/비로그인 유저도 열람 가능)</span>
            </label>
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <button
              type="button"
              onClick={() => navigate(`/notice/${id}`)}
              className="px-6 py-2 text-sm border border-black font-medium hover:bg-gray-100 transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm bg-black text-white font-medium hover:bg-gray-800 transition"
            >
              저장
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
