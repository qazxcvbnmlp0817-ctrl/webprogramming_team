import { Link } from 'react-router-dom'
import type { RequirementItem } from '../../data/departmentExtras'
import SourceBadge from './SourceBadge'

interface DepartmentRequirementSectionProps {
  requirements: RequirementItem[]
}

export default function DepartmentRequirementSection({ requirements }: DepartmentRequirementSectionProps) {
  return (
    <section id="requirements" className="max-w-6xl mx-auto px-4 py-12 scroll-mt-32">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 border-b-2 border-black pb-3">
        <div>
          <p className="text-sm text-gray-500">Graduation Guide</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-3xl font-black">졸업·자격증 확인 동선</h2>
            <SourceBadge type="guide" />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            졸업, 수강, 상담, 질문 메뉴로 바로 이동하는 네비게이션 허브입니다. 개인 진행률은 저장되지 않습니다.
          </p>
        </div>
        <div className="border-2 border-black px-4 py-2 text-sm font-black">
          확인 동선 {requirements.length}개
        </div>
      </div>

      <div className="mb-5 border-2 border-black p-5">
        <p className="font-black">이 페이지에서 졸업 준비 흐름을 먼저 확인하세요</p>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed break-keep">
          이 영역은 개인 완료 여부를 저장하지 않습니다. 졸업학점, 전공필수, 졸업작품, 자격증 기준을 먼저 훑어보고,
          변경 가능성이 있는 일정이나 애매한 조건은 학과 공지와 게시판 질문으로 이어지도록 구성했습니다.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {requirements.map(item => {
          const className = 'group border-2 border-black p-4 text-left transition bg-white text-black hover:bg-black hover:text-white min-h-36 flex flex-col justify-between'
          const content = (
            <>
              <span>
                <span className="flex items-start justify-between gap-3">
                  <span className="block font-black text-lg leading-snug">{item.label}</span>
                  <i className={`fas ${item.kind === 'anchor' ? 'fa-arrow-down' : 'fa-arrow-right'} mt-1 shrink-0`} />
                </span>
                <span className="block text-sm mt-2 text-gray-600 group-hover:text-gray-200 leading-relaxed break-keep">
                  {item.description}
                </span>
              </span>
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-black">
                바로 이동
                <i className="fas fa-arrow-right" />
              </span>
            </>
          )

          return item.kind === 'route' ? (
            <Link key={item.id} to={item.href} className={className}>
              {content}
            </Link>
          ) : (
            <a key={item.id} href={item.href} className={className}>
              {content}
            </a>
          )
        })}
      </div>
    </section>
  )
}
