import { useEffect, useState } from 'react'
import type { ProfessorDto } from '../../types/department'
import type { ProfessorEnhancement } from '../../data/departmentExtras'
import { fetchLectureOfferings, type LectureOfferingDto } from '../../api/timetable'
import { fetchDeptClassSchedules, type ClassScheduleDto } from '../../api/classSchedules'
import SourceBadge from './SourceBadge'

interface ProfessorSectionProps {
  professors: ProfessorDto[]
  enhancements: ProfessorEnhancement[]
  deptId?: number | null
}

interface SelectedProfessor {
  professor: ProfessorDto
  detail: ProfessorEnhancement
}

function isInvalidProfessorName(name: unknown): boolean {
  if (typeof name !== 'string') return true
  const trimmed = name.trim()
  return trimmed === '' || trimmed === '교수' || trimmed === '교수님'
}

function mailtoHref(professor: ProfessorDto) {
  const subject = encodeURIComponent(`${professor.name} 교수님께 문의드립니다`)
  return `mailto:${professor.email}?subject=${subject}`
}

function specialtyToKeywords(specialty: string | null | undefined): string[] {
  if (!specialty) return ['전공 분야']
  const tokens = specialty.split(/[,、·/]\s*/).map(s => s.trim()).filter(Boolean)
  return tokens.length > 0 ? tokens : ['전공 분야']
}

function resolveDetail(
  professor: ProfessorDto,
  enhancements: ProfessorEnhancement[],
): ProfessorEnhancement {
  const match = enhancements.find(e => e.name && e.name.trim() === professor.name.trim())
  return {
    lab: match?.lab && match.lab.trim() ? match.lab : '공식 미공개',
    courses: match?.courses && match.courses.length > 0
      ? match.courses
      : specialtyToKeywords(professor.specialty),
  }
}

export default function ProfessorSection({ professors, enhancements, deptId }: ProfessorSectionProps) {
  const [selected, setSelected] = useState<SelectedProfessor | null>(null)
  const [offerings, setOfferings] = useState<LectureOfferingDto[]>([])
  const [classSchedules, setClassSchedules] = useState<ClassScheduleDto[]>([])
  const effectiveProfessors = professors.filter(professor => !isInvalidProfessorName(professor.name))

  useEffect(() => {
    fetchLectureOfferings()
      .then(setOfferings)
      .catch(err => console.error('[ProfessorSection] 개설강좌 로드 실패:', err))
  }, [])

  useEffect(() => {
    if (!deptId) return
    fetchDeptClassSchedules(deptId, '2026-1')
      .then(setClassSchedules)
      .catch(err => console.error('[ProfessorSection] 수업 시간표 로드 실패:', err))
  }, [deptId])

  useEffect(() => {
    if (!selected) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selected])

  function getProfessorOfferings(name: string) {
    // LectureOffering has no professor FK, so the existing opened-course list
    // remains a professorName string-match fallback.
    return offerings.filter(o =>
      o.professorName.split(',').map(s => s.trim()).includes(name)
    )
  }

  function getProfessorSchedules(professorId: number) {
    return classSchedules.filter(schedule => schedule.professorId === professorId)
  }

  return (
    <section id="professors" className="max-w-6xl mx-auto px-4 py-12 scroll-mt-32">
      <div className="flex items-end justify-between gap-4 mb-6 border-b-2 border-black pb-3">
        <div>
          <p className="text-sm text-gray-500">Faculty</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-3xl font-black">교수진</h2>
            <SourceBadge type={effectiveProfessors.some(professor => !professor.email) ? 'partial' : 'official'} />
          </div>
        </div>
        <p className="text-sm font-semibold">{effectiveProfessors.length}명</p>
      </div>

      {effectiveProfessors.length === 0 ? (
        <div className="border-2 border-black p-8 text-center">
          <i className="fas fa-user-tie text-3xl mb-3 block text-gray-400" />
          <p className="font-black">교수진 공식 데이터 연결 대기 중</p>
          <p className="text-sm text-gray-500 mt-2">
            현재 학과의 교수진 정보가 아직 등록되지 않았습니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {effectiveProfessors.map(professor => {
            const detail = resolveDetail(professor, enhancements)
            return (
              <article key={professor.id} className="border-2 border-black p-5 hover:bg-gray-50 transition">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 border-2 border-black bg-white flex items-center justify-center shrink-0">
                    <i className="fas fa-user text-xl" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-lg truncate">{professor.name}</h3>
                    <p className="text-sm text-gray-600 break-keep">{professor.specialty}</p>
                    {professor.email ? (
                      <a
                        href={mailtoHref(professor)}
                        className="text-xs text-gray-500 mt-1 break-all hover:text-black hover:underline"
                      >
                        {professor.email}
                      </a>
                    ) : (
                      <span className="inline-block mt-2 border border-black px-2 py-0.5 text-xs font-bold">
                        이메일 공식 미공개
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 border-t border-gray-200 pt-3 text-sm">
                  <p className="font-bold flex items-center gap-1">
                    <i className="fas fa-flask text-xs" />
                    연구실
                  </p>
                  <p className="text-sm text-gray-600 mt-1 break-keep">{detail.lab}</p>
                  <p className="font-bold flex items-center gap-1 mt-3">
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
                </div>
                <button
                  type="button"
                  onClick={() => setSelected({ professor, detail })}
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
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="w-8 h-8 border border-white hover:bg-white hover:text-black transition"
                aria-label="닫기"
              >
                <i className="fas fa-xmark" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: '전공', value: selected.professor.specialty },
                { label: '이메일', value: selected.professor.email || '이메일 공식 미공개' },
                { label: '연구실', value: selected.detail.lab },
                { label: '관련 전공 키워드', value: selected.detail.courses.join(', ') },
              ].map(item => (
                <div key={item.label} className="grid grid-cols-[96px_1fr] gap-3 border-b border-gray-200 pb-3 text-sm">
                  <p className="font-black">{item.label}</p>
                  <p className="text-gray-600 break-keep">{item.value}</p>
                </div>
              ))}
              <div className="grid grid-cols-[96px_1fr] gap-3 border-b border-gray-200 pb-3 text-sm">
                <p className="font-black">개설 강좌</p>
                {(() => {
                  const profOfferings = getProfessorOfferings(selected.professor.name)
                  if (profOfferings.length === 0) {
                    return <p className="text-gray-400">강좌 정보 없음</p>
                  }
                  return (
                    <div className="flex flex-col gap-1.5">
                      {profOfferings.map(o => (
                        <div key={o.id}>
                          <span className="font-medium text-gray-800">{o.courseName}</span>
                          <span className="ml-2 text-xs text-gray-500">{o.completionType} · {o.targetYear} · {o.lectureTime}</span>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
              <div className="grid grid-cols-[96px_1fr] gap-3 border-b border-gray-200 pb-3 text-sm">
                <p className="font-black">수업 시간표</p>
                {(() => {
                  const profSchedules = getProfessorSchedules(selected.professor.id)
                  if (profSchedules.length === 0) {
                    return <p className="text-gray-400">등록된 수업 시간표 없음</p>
                  }
                  return (
                    <div className="flex flex-col gap-1.5">
                      {profSchedules.map(schedule => (
                        <div key={schedule.id}>
                          <span className="font-medium text-gray-800">{schedule.courseName}</span>
                          <span className="ml-2 text-xs text-gray-500">
                            {schedule.dayOfWeek} {schedule.startTime}~{schedule.endTime} · {schedule.room || '강의실 미정'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
              {selected.professor.email ? (
                <a
                  href={mailtoHref(selected.professor)}
                  className="block text-center border-2 border-black bg-black text-white py-3 font-black hover:bg-white hover:text-black transition"
                >
                  이메일 보내기
                </a>
              ) : (
                <button type="button" disabled className="w-full border-2 border-gray-400 text-gray-400 py-3 font-black cursor-not-allowed">
                  이메일 공식 미공개
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
