import { useEffect, useState } from 'react'
import type { CareerItem } from '../../data/departmentExtras'
import SourceBadge from './SourceBadge'

interface CareerSectionProps {
  careers: CareerItem[]
}

export default function CareerSection({ careers }: CareerSectionProps) {
  const [selected, setSelected] = useState<CareerItem | null>(null)

  useEffect(() => {
    if (!selected) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selected])

  return (
    <section id="careers" className="max-w-6xl mx-auto px-4 py-12 scroll-mt-32">
      <div className="mb-6 border-b-2 border-black pb-3">
        <p className="text-sm text-gray-500">Career Roadmap</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-3xl font-black">졸업 후 진로</h2>
          <SourceBadge type="guide" />
        </div>
        <p className="text-sm text-gray-500 mt-2">학생용 진로 참고 가이드입니다. 전공을 어떤 직무로 연결할 수 있는지 빠르게 보여줍니다.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {careers.map(career => (
          <article key={career.category} className="border-2 border-black p-5 hover:bg-gray-50 transition flex flex-col">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center mb-4">
              <i className="fas fa-briefcase" />
            </div>
            <h3 className="text-xl font-black">{career.category}</h3>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">{career.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {career.jobs.map(job => (
                <span key={job} className="bg-black text-white px-2 py-1 text-xs font-semibold">
                  {job}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSelected(career)}
              className="mt-auto pt-5 w-full border-2 border-black py-2 text-sm font-black hover:bg-black hover:text-white transition"
            >
              자세히 보기
            </button>
          </article>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/60 px-4 flex items-center justify-center"
          role="presentation"
          onMouseDown={() => setSelected(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="career-modal-title"
            className="bg-white text-black border-2 border-black max-w-xl w-full max-h-[90vh] overflow-y-auto"
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="bg-black text-white p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-300">Career Detail</p>
                <h3 id="career-modal-title" className="text-2xl font-black">{selected.category}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="w-8 h-8 border border-white hover:bg-white hover:text-black transition"
                aria-label="닫기"
              >
                <i className="fas fa-xmark" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <p className="text-sm text-gray-700 leading-relaxed">{selected.description}</p>

              <div className="border-b border-gray-200 pb-4">
                <p className="font-black text-sm mb-2">직무 분야</p>
                <div className="flex flex-wrap gap-2">
                  {selected.jobs.map(job => (
                    <span key={job} className="bg-black text-white px-2 py-1 text-xs font-semibold">
                      {job}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="font-black text-sm mb-2">추천 준비</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  {(selected.preparation ?? ['전공 과목 정리', '관련 활동 기록', '희망 직무 탐색']).map(item => (
                    <li key={item} className="flex gap-2">
                      <i className="fas fa-check text-xs mt-1 text-black" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="font-black text-sm mb-2">연결 과목</p>
                <div className="flex flex-wrap gap-1.5">
                  {(selected.courses ?? ['전공기초', '전공심화', '캡스톤디자인']).map(course => (
                    <span key={course} className="border border-black px-2 py-0.5 text-xs font-bold">
                      {course}
                    </span>
                  ))}
                </div>
              </div>

              {selected.certificates && selected.certificates.length > 0 && (
                <div className="border-b border-gray-200 pb-4">
                  <p className="font-black text-sm mb-2">관련 자격증</p>
                  <div className="space-y-1.5">
                    {selected.certificates.map(cert => (
                      <a
                        key={cert.name}
                        href={cert.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between border-2 border-black px-3 py-2 text-sm hover:bg-black hover:text-white transition"
                      >
                        <span className="flex items-center gap-2">
                          <i className="fas fa-id-card" />
                          {cert.name}
                        </span>
                        <i className="fas fa-arrow-up-right-from-square text-xs opacity-70" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selected.portfolio && (
                <div className="bg-black text-white p-4">
                  <p className="text-xs font-bold text-gray-300">포트폴리오 예시</p>
                  <p className="text-sm font-semibold mt-1 leading-relaxed">{selected.portfolio}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
