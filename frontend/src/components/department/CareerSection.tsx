import type { CareerItem } from '../../data/departmentExtras'
import SourceBadge from './SourceBadge'

interface CareerSectionProps {
  careers: CareerItem[]
}

export default function CareerSection({ careers }: CareerSectionProps) {
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
            <div className="mt-5 pt-5 border-t border-gray-200 space-y-4 text-sm">
              <div>
                <p className="font-black mb-2">추천 준비</p>
                <ul className="space-y-1 text-gray-600">
                  {(career.preparation ?? ['전공 과목 정리', '관련 활동 기록', '희망 직무 탐색']).map(item => (
                    <li key={item} className="flex gap-2">
                      <i className="fas fa-check text-xs mt-1 text-black" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-black mb-2">연결 과목</p>
                <div className="flex flex-wrap gap-1.5">
                  {(career.courses ?? ['전공기초', '전공심화', '캡스톤디자인']).map(course => (
                    <span key={course} className="border border-black px-2 py-0.5 text-xs font-bold">
                      {course}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-black text-white p-3">
                <p className="text-xs font-bold text-gray-300">포트폴리오 예시</p>
                <p className="text-sm font-semibold mt-1 leading-relaxed">
                  {career.portfolio ?? '수업 결과물, 팀 프로젝트, 현장실습 기록을 한 묶음으로 정리'}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
