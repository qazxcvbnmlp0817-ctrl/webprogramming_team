import { Link } from 'react-router-dom'
import type { StudentLifeItem } from '../../data/departmentExtras'
import SourceBadge from './SourceBadge'

interface StudentLifeQuickLinksProps {
  studentLife: StudentLifeItem[]
}

export default function StudentLifeQuickLinks({ studentLife }: StudentLifeQuickLinksProps) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-6 border-b-2 border-black pb-3">
        <p className="text-sm text-gray-500">Student Life</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-3xl font-black">학과 생활 빠른 링크</h2>
          <SourceBadge type="partial" />
        </div>
        <p className="text-sm text-gray-500 mt-2">공지, 일정, 게시판으로 이어지는 학생용 이동 동선을 모았습니다.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {studentLife.map(item => {
          const commonClass = 'border-2 border-black p-4 hover:bg-black hover:text-white transition block min-h-28'
          return item.external ? (
            <a key={item.title} href={item.href} target="_blank" rel="noopener noreferrer" className={commonClass}>
              <span className="flex items-center justify-between gap-3 font-black">
                {item.title}
                <i className="fas fa-arrow-up-right-from-square text-xs" />
              </span>
              <span className="block text-sm mt-2 opacity-80">{item.description}</span>
            </a>
          ) : (
            <Link key={item.title} to={item.href} className={commonClass}>
              <span className="flex items-center justify-between gap-3 font-black">
                {item.title}
                <i className="fas fa-arrow-right text-xs" />
              </span>
              <span className="block text-sm mt-2 opacity-80">{item.description}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
