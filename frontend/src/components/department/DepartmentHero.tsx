import { Link } from 'react-router-dom'
import type { DepartmentDetailDto } from '../../types/department'
import type { DepartmentExtra } from '../../data/departmentExtras'

interface DepartmentHeroProps {
  dept: DepartmentDetailDto
  extra: DepartmentExtra
  universityName: string | null
  schoolName: string | null
}

export default function DepartmentHero({ dept, extra, universityName, schoolName }: DepartmentHeroProps) {
  const breadcrumbs = [universityName ?? '대학교', schoolName ?? '단과대학', dept.name]
  const conceptItems = ['공식정보', '학생 실사용 정보', '진로 로드맵']

  return (
    <section className="bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300 mb-5">
          {breadcrumbs.map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-2">
              <span className={index === breadcrumbs.length - 1 ? 'text-white font-bold' : ''}>{item}</span>
              {index < breadcrumbs.length - 1 && <i className="fas fa-chevron-right text-[10px]" />}
            </span>
          ))}
        </div>

        <div className="mb-7 grid grid-cols-3 border-2 border-white text-center text-xs md:text-sm font-black">
          {conceptItems.map((item, index) => (
            <div key={item} className={`px-2 py-3 ${index < conceptItems.length - 1 ? 'border-r-2 border-white' : ''}`}>
              {item}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-end">
          <div>
            <p className="inline-flex items-center gap-2 border border-white px-3 py-1 text-xs font-bold mb-4">
              <i className="fas fa-layer-group" />
              학생용 학과 정보 허브
            </p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight break-keep">{dept.name}</h1>
            <p className="mt-5 text-lg md:text-xl text-gray-200 leading-relaxed break-keep max-w-3xl">
              {extra.slogan}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {extra.keywords.map(keyword => (
                <span key={keyword} className="border border-white px-3 py-1 text-xs font-semibold">
                  #{keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <a href="#curriculum" className="bg-white text-black border-2 border-white px-4 py-3 font-bold text-center hover:bg-black hover:text-white transition">
              <i className="fas fa-book-open mr-2" />
              교육과정 보기
            </a>
            <Link to="/dept/board" className="border-2 border-white px-4 py-3 font-bold text-center hover:bg-white hover:text-black transition">
              <i className="fas fa-comments mr-2" />
              질문하기
            </Link>
            <Link to="/dept/notice" className="border-2 border-white px-4 py-3 font-bold text-center hover:bg-white hover:text-black transition">
              <i className="fas fa-bullhorn mr-2" />
              공지 보기
            </Link>
            <a href="#contact" className="border-2 border-white px-4 py-3 font-bold text-center hover:bg-white hover:text-black transition">
              <i className="fas fa-phone mr-2" />
              연락처
            </a>
            {extra.homepage && (
              <a
                href={extra.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center text-xs text-gray-300 underline underline-offset-4 hover:text-white"
              >
                공식 학과 홈페이지 열기
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
