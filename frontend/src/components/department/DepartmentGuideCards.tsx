import type { GuideCard } from '../../data/departmentExtras'

interface DepartmentGuideCardsProps {
  guideCards: GuideCard[]
}

export default function DepartmentGuideCards({ guideCards }: DepartmentGuideCardsProps) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">Student Guide</p>
          <h2 className="text-2xl md:text-3xl font-black">학과 활용 가이드</h2>
        </div>
        <p className="border-2 border-black px-3 py-1 text-xs font-bold w-fit">
          학생용 참고 정보
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {guideCards.map(card => (
          <article key={card.title} className="border-2 border-black p-4 min-h-44 flex flex-col justify-between hover:bg-gray-50 transition">
            <div>
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center mb-4">
                <i className={`fas ${card.icon}`} />
              </div>
              <h3 className="font-black text-lg">{card.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mt-2 break-keep">{card.description}</p>
            </div>
            <p className="mt-5 text-xs font-black border-t border-gray-200 pt-3">{card.action}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
