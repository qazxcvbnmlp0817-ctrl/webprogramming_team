import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import FilterTabs from '../components/FilterTabs'
import FeaturedCard from '../components/FeaturedCard'
import Sidebar from '../components/Sidebar'
import Pagination from '../components/Pagination'
import { fetchNotices } from '../api/notices'
import type { NoticeDto } from '../types/notice'

const NOTICE_TABS = ['전체', '학사', '장학', '행사', '취업']
const CATEGORY_COUNTS = [
  { label: '전체', count: 32 }, { label: '학사', count: 14 },
  { label: '장학', count: 8 },  { label: '행사', count: 6 },
  { label: '취업', count: 4 },
]

export default function NoticePage() {
  const [featured, setFeatured] = useState<NoticeDto | null>(null)
  const [notices, setNotices]   = useState<NoticeDto[]>([])
  const [active, setActive]     = useState('전체')

  useEffect(() => {
    fetchNotices().then(data => {
      setFeatured(data.featured)
      setNotices(data.notices)
    })
  }, [])

  const filtered = active === '전체' ? notices : notices.filter(n => n.category === active)

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="pt-14" />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {featured && (
          <FeaturedCard
            category={featured.category}
            title={featured.title}
            date={featured.date}
            meta={`👁 ${featured.viewCount}`}
          />
        )}

        <FilterTabs tabs={NOTICE_TABS} active={active} onChange={setActive} />

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {filtered.map(notice => (
              <div
                key={notice.id}
                data-category={notice.category}
                className="flex gap-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="w-20 h-16 bg-gray-200 flex-shrink-0 flex items-center justify-center border border-gray-300">
                  <i className="fas fa-image text-gray-400 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to="/notice" className="font-semibold text-black hover:underline block leading-snug line-clamp-2">
                    {notice.title}
                  </Link>
                  <div className="flex items-center flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                    <span className="border border-black text-black px-1.5 py-0.5 font-medium">{notice.category}</span>
                    <span>{notice.date}</span>
                    <span><i className="fas fa-eye mr-0.5" />{notice.viewCount}</span>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-16 text-center text-gray-400">
                <i className="fas fa-inbox text-3xl mb-3 block" />공지사항이 없습니다.
              </div>
            )}
            <Pagination current={1} total={10} onChange={() => {}} />
          </div>

          <Sidebar
            categoryWidget={{
              title: '카테고리',
              items: CATEGORY_COUNTS,
              onSelect: setActive,
            }}
            recentWidget={{
              title: '최근 공지',
              items: notices.slice(0, 5).map(n => ({ title: n.title, sub: n.date })),
            }}
          />
        </div>
      </main>
    </div>
  )
}
