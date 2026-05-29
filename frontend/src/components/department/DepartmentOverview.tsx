import type { DepartmentDetailDto } from '../../types/department'
import type { DepartmentExtra } from '../../data/departmentExtras'

interface DepartmentOverviewProps {
  dept: DepartmentDetailDto
  extra: DepartmentExtra
}

export default function DepartmentOverview({ dept, extra }: DepartmentOverviewProps) {
  const cards = [
    { label: '교수진', value: dept.professors.length, unit: '명', icon: 'fa-user-tie', description: '상담과 전공 지도를 맡는 교수진' },
    { label: '전공과목', value: dept.curriculum.length, unit: '개', icon: 'fa-book-open', description: '학년별로 확인하는 교육과정' },
    { label: '공지사항', value: extra.overviewCounts.notices, unit: '건', icon: 'fa-bullhorn', description: '학생이 놓치기 쉬운 학과 소식' },
    { label: '다가오는 일정', value: extra.overviewCounts.schedules, unit: '건', icon: 'fa-calendar-check', description: '수업·행사·학사 일정 요약' },
  ]

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">At a glance</p>
          <h2 className="text-2xl md:text-3xl font-black">학과 한눈에 보기</h2>
        </div>
        <span className="hidden md:inline-block border-2 border-black px-3 py-1 text-xs font-bold">
          학생이 바로 쓰는 요약
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {cards.map(card => (
          <div key={card.label} className="border-2 border-black p-4 md:p-5 min-h-40 flex flex-col justify-between hover:bg-gray-50 transition">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold">{card.label}</p>
              <i className={`fas ${card.icon} text-lg`} />
            </div>
            <p className="mt-5 text-3xl font-black">
              {card.value}
              <span className="text-base font-bold ml-1">{card.unit}</span>
            </p>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed break-keep">{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
