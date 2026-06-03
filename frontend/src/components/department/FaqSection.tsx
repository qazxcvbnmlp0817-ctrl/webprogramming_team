import { useState } from 'react'
import type { FaqItem } from '../../data/departmentExtras'
import SourceBadge from './SourceBadge'

interface FaqSectionProps {
  faqs: FaqItem[]
  onReportClick: () => void
}

export default function FaqSection({ faqs, onReportClick }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState(0)
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const filteredFaqs = normalizedQuery
    ? faqs.filter(faq => [faq.category, faq.question, faq.answer].some(value => value?.toLowerCase().includes(normalizedQuery)))
    : faqs

  return (
    <section id="faq" className="max-w-6xl mx-auto px-4 py-12 pb-20 scroll-mt-32">
      <div className="mb-6 border-b-2 border-black pb-3">
        <p className="text-sm text-gray-500">FAQ</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-3xl font-black">자주 묻는 질문</h2>
          <SourceBadge type="guide" />
        </div>
        <p className="text-sm text-gray-500 mt-2">수강, 졸업, 상담처럼 자주 묻는 내용을 먼저 확인하고 필요한 경우 질문이나 수정 요청으로 이어집니다.</p>
      </div>
      <div className="mb-4 flex flex-col md:flex-row gap-3">
        <label className="flex-1 border-2 border-black flex items-center">
          <span className="px-3 text-gray-500">
            <i className="fas fa-search" />
          </span>
          <input
            type="search"
            value={query}
            onChange={event => {
              setQuery(event.target.value)
              setOpenIndex(0)
            }}
            placeholder="FAQ 검색: 수강, 졸업, 상담..."
            className="w-full py-3 pr-3 outline-none text-sm"
          />
        </label>
        <button
          type="button"
          onClick={onReportClick}
          className="border-2 border-black px-4 py-3 font-black hover:bg-black hover:text-white transition"
        >
          <i className="fas fa-flag mr-2" />
          학과정보 수정 요청
        </button>
      </div>
      <div className="space-y-3">
        {filteredFaqs.length === 0 && (
          <div className="border-2 border-black p-8 text-center">
            <p className="font-black">검색 결과가 없습니다.</p>
            <p className="text-sm text-gray-500 mt-2">검색어를 바꾸거나 학과 게시판에 질문을 남겨 주세요.</p>
          </div>
        )}
        {filteredFaqs.map((faq, index) => {
          const open = openIndex === index
          return (
            <article key={faq.question} className={`border-2 border-black ${open ? 'bg-black text-white' : 'bg-white text-black'}`}>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? -1 : index)}
                className="w-full p-4 flex items-center justify-between gap-4 text-left font-black"
              >
                <span className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 border ${open ? 'border-white text-white' : 'border-black text-black'}`}>
                    {faq.category ?? '안내'}
                  </span>
                  <span>{faq.question}</span>
                </span>
                <i className={`fas ${open ? 'fa-minus' : 'fa-plus'} shrink-0`} />
              </button>
              {open && (
                <div className="px-4 pb-4 text-sm text-gray-200 leading-relaxed border-t border-gray-700 pt-4">
                  {faq.answer}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
