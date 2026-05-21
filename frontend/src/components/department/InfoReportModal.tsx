import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface InfoReportModalProps {
  open: boolean
  onClose: () => void
}

const reportItems: { label: string; slug: string }[] = [
  { label: '교수진',   slug: 'professor' },
  { label: '교육과정', slug: 'curriculum' },
  { label: '연락처',   slug: 'contact' },
  { label: '위치',     slug: 'location' },
  { label: '기타',     slug: 'info-update-request' },
]

export default function InfoReportModal({ open, onClose }: InfoReportModalProps) {
  const [selectedItem, setSelectedItem] = useState(reportItems[0])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (open) setSelectedItem(reportItems[0])
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 px-4 flex items-center justify-center"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        className="bg-white text-black border-2 border-black max-w-lg w-full"
        onMouseDown={event => event.stopPropagation()}
      >
        <div className="bg-black text-white p-4 flex items-center justify-between gap-4">
          <h2 id="report-modal-title" className="font-black text-xl">정보 수정 요청 안내</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 border border-white hover:bg-white hover:text-black transition" aria-label="닫기">
            <i className="fas fa-xmark" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            어떤 정보가 오래되었거나 틀렸는지 선택한 뒤 게시판에 글로 남겨주세요.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            이 창에서 직접 저장되지 않습니다. 게시판 글 작성 페이지로 이동합니다.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {reportItems.map(item => (
              <button
                key={item.slug}
                type="button"
                onClick={() => setSelectedItem(item)}
                className={`border-2 border-black px-3 py-2 text-sm font-bold transition ${
                  selectedItem.slug === item.slug ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <Link
            to={`/dept/board?tag=${selectedItem.slug}`}
            className="mt-5 block text-center border-2 border-black bg-black text-white py-3 font-black hover:bg-white hover:text-black transition"
          >
            <i className="fas fa-arrow-right mr-2" />
            게시판에서 글 작성하기
          </Link>
        </div>
      </section>
    </div>
  )
}
