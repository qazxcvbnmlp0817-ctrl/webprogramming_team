import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useDept } from '../context/DeptContext'
import type { PostAttachmentDto } from '../types/post'

const CATEGORIES = ['학사', '장학', '행사', '취업']

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function NoticeWritePage() {
  const navigate = useNavigate()
  const { selectedDeptId } = useDept()
  const [title, setTitle]       = useState('')
  const [category, setCategory] = useState('학사')
  const [content, setContent]   = useState('')

  const [targetGrades, setTargetGrades] = useState<number[]>([1, 2, 3, 4])
  const [isPublicToOutsiders, setIsPublicToOutsiders] = useState(false)

  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageFiles, setImageFiles]       = useState<File[]>([])
  const [files, setFiles]                 = useState<File[]>([])

  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const memberType = sessionStorage.getItem('memberType') ?? ''
    if (memberType !== 'professor' && memberType !== 'admin') {
      navigate('/dept/notice', { replace: true })
    }
  }, [navigate])

  function handleImageAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    setImageFiles(prev => [...prev, ...selected])
    setImagePreviews(prev => [...prev, ...selected.map(f => URL.createObjectURL(f))])
    e.target.value = ''
  }

  function handleImageRemove(idx: number) {
    URL.revokeObjectURL(imagePreviews[idx])
    setImagePreviews(prev => prev.filter((_, i) => i !== idx))
    setImageFiles(prev => prev.filter((_, i) => i !== idx))
  }

  function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    setFiles(prev => [...prev, ...selected])
    e.target.value = ''
  }

  function handleFileRemove(idx: number) {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    let uploadedAttachments: PostAttachmentDto[] = []
    const allFiles = [...imageFiles, ...files]
    if (allFiles.length > 0) {
      const formData = new FormData()
      allFiles.forEach(f => formData.append('files', f))
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!uploadRes.ok) { alert('파일 업로드에 실패했습니다.'); return }
      uploadedAttachments = await uploadRes.json()
    }

    const author = sessionStorage.getItem('name') ?? '작성자'
    const res = await fetch('/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, content, category, author, targetGrades,
        scopeId: selectedDeptId ?? 1,
        attachments: uploadedAttachments,
        authorUsername: sessionStorage.getItem('username') ?? '',
        isPublicToOutsiders,
      }),
    })
    if (res.ok) {
      alert('공지사항이 등록되었습니다.')
      navigate('/dept/notice')
    } else {
      alert('등록에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className="bg-white text-black font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />

      <section className="bg-black text-white py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold">
            <i className="fas fa-bullhorn mr-2" />공지 작성
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

          {/* 학년 태그 */}
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

          {/* 외부자 공개 */}
          <div className="flex items-center gap-2 py-2">
            <input
              id="publicToOutsiders"
              type="checkbox"
              className="accent-black w-4 h-4"
              checked={isPublicToOutsiders}
              onChange={e => setIsPublicToOutsiders(e.target.checked)}
            />
            <label htmlFor="publicToOutsiders" className="text-sm font-medium cursor-pointer">
              외부자 공개 <span className="text-gray-400 font-normal">(비소속 학생/비로그인 유저도 열람 가능)</span>
            </label>
          </div>

          {/* 사진 첨부 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">사진 첨부</label>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="text-xs border border-black px-3 py-1 hover:bg-black hover:text-white transition flex items-center gap-1"
              >
                <i className="fas fa-plus" />사진 추가
              </button>
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
            {imagePreviews.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {imagePreviews.map((url, idx) => (
                  <div key={idx} className="relative w-24 h-24 border border-gray-300">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(idx)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-black text-white text-xs flex items-center justify-center hover:bg-gray-700"
                    >×</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">JPG, PNG, GIF 등 이미지 파일을 첨부할 수 있습니다.</p>
            )}
          </div>

          {/* 파일 첨부 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">파일 첨부</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs border border-black px-3 py-1 hover:bg-black hover:text-white transition flex items-center gap-1"
              >
                <i className="fas fa-plus" />파일 추가
              </button>
            </div>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileAdd} />
            {files.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {files.map((file, idx) => (
                  <li key={idx} className="flex items-center gap-2 border border-gray-200 px-3 py-2 text-sm">
                    <i className="fas fa-paperclip text-gray-400 flex-shrink-0" />
                    <span className="flex-1 truncate text-gray-800">{file.name}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatFileSize(file.size)}</span>
                    <button type="button" onClick={() => handleFileRemove(idx)} className="text-gray-400 hover:text-black flex-shrink-0">×</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400">PDF, zip, hwp 등 파일을 첨부할 수 있습니다.</p>
            )}
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <button
              type="button"
              onClick={() => navigate('/dept/notice')}
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
