import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ProfessorDto } from '../../types/department'
import type { ProfessorEnhancement } from '../../data/departmentExtras'
import SourceBadge from './SourceBadge'

interface ProfessorSectionProps {
  professors: ProfessorDto[]
  enhancements: ProfessorEnhancement[]
}

interface SelectedProfessor {
  professor: ProfessorDto
  detail: ProfessorEnhancement
}

function isInvalidProfessorName(name: unknown): boolean {
  if (typeof name !== 'string') return true
  const t = name.trim()
  return t === '' || t === '교수' || t === '교수님'
}

export default function ProfessorSection({ professors, enhancements }: ProfessorSectionProps) {
  const [selected, setSelected] = useState<SelectedProfessor | null>(null)
  const defaultDetail: ProfessorEnhancement = { lab: '공식 미공개', courses: ['전공 분야'] }
  const effectiveProfessors = professors.filter(p => !isInvalidProfessorName(p.name))

  useEffect(() => {
    if (!selected) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selected])

  return (
    <section id="professors" className="max-w-6xl mx-auto px-4 py-12 scroll-mt-32">
      <div className="flex items-end justify-between gap-4 mb-6 border-b-2 border-black pb-3">
        <div>
          <p className="text-sm text-gray-500">Faculty</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-3xl font-black">교수진</h2>
            <SourceBadge type={effectiveProfessors.some(prof => !prof.email) ? 'partial' : 'official'} />
          </div>
        </div>
        <p className="text-sm font-semibold">{effectiveProfessors.length}명</p>
      </div>

      {effectiveProfessors.length === 0 ? (
        <div className="border-2 border-black p-8 text-center">
          <i className="fas fa-user-tie text-3xl mb-3 block text-gray-400" />
          <p className="font-black">교수진 공식 데이터 연결 대기 중</p>
          <p className="text-sm text-gray-500 mt-2">
            공식 페이지에서 확인 가능한 교수진 정보가 아직 없습니다. 상담은 학과 사무실 또는 공지사항을 통해 확인하세요.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <a href="#contact" className="border-2 border-black px-3 py-2 text-xs font-bold hover:bg-black hover:text-white transition">
              학과 사무실 문의
            </a>
            <Link to="/dept/notice" className="border-2 border-black px-3 py-2 text-xs font-bold hover:bg-black hover:text-white transition">
              공지사항 확인
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {effectiveProfessors.map((prof, index) => {
            const detail = enhancements.length > 0 ? enhancements[index % enhancements.length] : defaultDetail
            return (
              <article key={prof.id} className="border-2 border-black p-5 hover:bg-gray-50 transition">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 border-2 border-black bg-white flex items-center justify-center shrink-0">
                    <i className="fas fa-user text-xl" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-lg truncate">{prof.name}</h3>
                    <p className="text-sm text-gray-600 break-keep">{prof.specialty}</p>
                    {prof.email ? (
                      <p className="text-xs text-gray-500 mt-1 break-all">{prof.email}</p>
                    ) : (
                      <span className="inline-block mt-2 border border-black px-2 py-0.5 text-xs font-bold">
                        이메일 공식 미공개
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 border-t border-gray-200 pt-3 text-sm">
                  <p className="font-bold flex items-center gap-1">
                    <i className="fas fa-tags text-xs" />
                    관련 전공 키워드
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {detail.courses.map(course => (
                      <span key={course} className="border border-black px-2 py-1 text-xs font-bold">
                        {course}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-gray-500 leading-relaxed">
                    상담 시간과 연구실 호실은 학기마다 달라질 수 있어 공식 공지 또는 학과 사무실에서 확인하도록 안내합니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected({ professor: prof, detail })}
                  className="mt-5 w-full border-2 border-black py-2 text-sm font-black hover:bg-black hover:text-white transition"
                >
                  상세보기
                </button>
              </article>
            )
          })}
        </div>
      )}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/60 px-4 flex items-center justify-center"
          role="presentation"
          onMouseDown={() => setSelected(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="professor-modal-title"
            className="bg-white text-black border-2 border-black max-w-xl w-full"
            onMouseDown={event => event.stopPropagation()}
          >
            <div className="bg-black text-white p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-300">Professor Detail</p>
                <h3 id="professor-modal-title" className="text-2xl font-black">{selected.professor.name}</h3>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="w-8 h-8 border border-white hover:bg-white hover:text-black transition" aria-label="닫기">
                <i className="fas fa-xmark" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: '전공', value: selected.professor.specialty },
                { label: '이메일', value: selected.professor.email || '이메일 공식 미공개' },
                { label: '연구실', value: '공식 미공개' },
                { label: '관련 전공 키워드', value: selected.detail.courses.join(', ') },
              ].map(item => (
                <div key={item.label} className="grid grid-cols-[96px_1fr] gap-3 border-b border-gray-200 pb-3 text-sm">
                  <p className="font-black">{item.label}</p>
                  <p className="text-gray-600 break-keep">{item.value}</p>
                </div>
              ))}
              {selected.professor.email ? (
                <a
                  href={`mailto:${selected.professor.email}`}
                  className="block text-center border-2 border-black bg-black text-white py-3 font-black hover:bg-white hover:text-black transition"
                >
                  이메일 보내기
                </a>
              ) : (
                <button type="button" disabled className="w-full border-2 border-gray-400 text-gray-400 py-3 font-black cursor-not-allowed">
                  이메일 공식 미공개
                </button>
              )}
              <div className="grid sm:grid-cols-2 gap-2">
                <a
                  href="#contact"
                  onClick={() => setSelected(null)}
                  className="text-center border-2 border-black py-3 font-black hover:bg-black hover:text-white transition"
                >
                  학과 사무실 문의
                </a>
                <Link
                  to="/dept/notice"
                  className="text-center border-2 border-black py-3 font-black hover:bg-black hover:text-white transition"
                >
                  공지사항 확인
                </Link>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
