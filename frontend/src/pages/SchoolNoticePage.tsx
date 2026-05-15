import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import FilterTabs from '../components/FilterTabs'
import FeaturedCard from '../components/FeaturedCard'
import Sidebar from '../components/Sidebar'
import Pagination from '../components/Pagination'
import { fetchSchoolNotices } from '../api/school'
import { useDeptFetch } from '../hooks/useDeptFetch'
import { useDept } from '../context/DeptContext'

const TABS = ['전체', '학사', '장학', '행사', '취업']

export default function SchoolNoticePage() {
  const { selectedUniversityId, selectedUniversityName } = useDept()
  const [active, setActive] = useState('전체')

  const { data, loading } = useDeptFetch(fetchSchoolNotices, selectedUniversityId)
  const featured = data?.featured ?? null
  const notices  = data?.notices  ?? []
  const filtered = active === '전체' ? notices : notices.filter(n => n.category === active)
  const categoryCounts = TABS.map(label => ({
    label,
    count: label === '전체' ? notices.length : notices.filter(n => n.category === label).length,
  }))

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="pt-14" />

      <section className="bg-black text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link to={`/universities/${selectedUniversityId}`} className="text-gray-400 hover:text-white transition text-sm">
            <i className="fas fa-arrow-left mr-1" />{selectedUniversityName ?? '학교 홈'}
          </Link>
          <span className="text-gray-600">›</span>
          <h1 className="text-xl font-bold"><i className="fas fa-bullhorn mr-2" />학교 공지사항</h1>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-3 block" />불러오는 중...
          </div>
        ) : (
          <>
            {featured && (
              <FeaturedCard category={featured.category} title={featured.title} date={featured.date} meta={`👁 ${featured.viewCount}`} />
            )}
            <FilterTabs tabs={TABS} active={active} onChange={setActive} />
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                {filtered.map(notice => (
                  <div key={notice.id} className="flex gap-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer">
                    <div className="w-20 h-16 bg-gray-200 flex-shrink-0 flex items-center justify-center border border-gray-300">
                      <i className="fas fa-image text-gray-400 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-black leading-snug line-clamp-2">{notice.title}</p>
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
                categoryWidget={{ title: '카테고리', items: categoryCounts, onSelect: setActive }}
                recentWidget={{ title: '최근 공지', items: notices.slice(0, 5).map(n => ({ title: n.title, sub: n.date })) }}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
