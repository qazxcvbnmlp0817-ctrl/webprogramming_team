import type { FacilityItem } from '../../data/departmentExtras'
import SourceBadge from './SourceBadge'

interface FacilitySectionProps {
  facilities: FacilityItem[]
}

export default function FacilitySection({ facilities }: FacilitySectionProps) {
  return (
    <section id="facilities" className="max-w-6xl mx-auto px-4 py-12 scroll-mt-32">
      <div className="mb-6 border-b-2 border-black pb-3">
        <p className="text-sm text-gray-500">Facilities</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-3xl font-black">학습 공간 가이드</h2>
          <SourceBadge type="guide" />
        </div>
        <p className="text-sm text-gray-500 mt-2">공식 시설 목록이 아니라 전공별로 어떤 공간을 활용하게 되는지 보여주는 학생용 참고 가이드입니다.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {facilities.map((facility, index) => (
          <article key={facility.name} className="border-2 border-black">
            <div className="h-36 bg-gray-100 border-b-2 border-black flex flex-col items-center justify-center">
              <span className="text-xs font-black border border-black px-2 py-1 mb-3">SPACE 0{index + 1}</span>
              <i className="fas fa-building-columns text-4xl text-gray-500" />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-black">{facility.name}</h3>
              <p className="mt-1 text-sm font-bold text-gray-700">공식 위치 미확정 · {facility.location}</p>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{facility.description}</p>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <p className="text-xs font-black mb-2">이 공간에서 할 수 있는 활동</p>
                <div className="flex flex-wrap gap-1.5">
                  {(facility.activities ?? ['전공 실습', '팀 프로젝트', '스터디']).map(activity => (
                    <span key={activity} className="bg-black text-white px-2 py-1 text-xs font-semibold">
                      {activity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
