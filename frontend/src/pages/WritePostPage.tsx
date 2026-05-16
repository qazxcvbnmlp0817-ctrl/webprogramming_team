import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const CATEGORIES = ['자유게시판', '질문', '스터디', '취업후기']

export default function WritePostPage() {
  const navigate = useNavigate()
  const [title, setTitle]       = useState('')
  const [category, setCategory] = useState('자유게시판')
  const [content, setContent]   = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }
    alert('게시글이 등록되었습니다.')
    navigate('/dept/board')
  }

  return (
    <div className="bg-white text-black font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />

      <section className="bg-black text-white py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold">
            <i className="fas fa-pen mr-2" />글쓰기
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

          <div className="flex gap-2 justify-end mt-2">
            <button
              type="button"
              onClick={() => navigate('/dept/board')}
              className="px-6 py-2 text-sm border border-black font-medium hover:bg-gray-100 transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm bg-black text-white font-medium hover:bg-gray-800 transition"
            >
              등록
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
