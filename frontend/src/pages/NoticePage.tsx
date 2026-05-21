import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import FilterTabs from '../components/FilterTabs'
import FeaturedCard from '../components/FeaturedCard'
import Sidebar from '../components/Sidebar'
import Pagination from '../components/Pagination'
import { fetchNotices } from '../api/notices'
import { useDept } from '../context/DeptContext'
import { useDeptFetch } from '../hooks/useDeptFetch'

const NOTICE_TABS = ['전체', '학사', '장학', '행사', '취업']
const GRADE_TABS  = ['전체', '1학년', '2학년', '3학년', '4학년']

export default function NoticePage() {
  const { selectedDeptId, selectedDeptName } = useDept()
  const navigate = useNavigate()
  const [active, setActive]           = useState('전체')
  const [gradeFilter, setGradeFilter] = useState('전체')
  const [search, setSearch]           = useState('')
  const [page, setPage]               = useState(1)
  const PER_PAGE = 10

  useEffect(() => { setPage(1) }, [active, gradeFilter, search])

  const canWrite = ['professor', 'admin'].includes(sessionStorage.getItem('memberType') ?? '')

  const { data, loading } = useDeptFetch(fetchNotices, selectedDeptId)
  const featured = data?.featured ?? null
  const notices  = data?.notices  ?? []

  const filtered = useMemo(() => notices.filter(n => {
    const catOk    = active === '전체' || n.category === active
    const searchOk = search === '' || n.title.toLowerCase().includes(search.toLowerCase())
    const gradeOk  = gradeFilter === '전체' || (n.targetGrades ?? [1,2,3,4]).includes(Number(gradeFilter[0]))
    return catOk && searchOk && gradeOk
  }), [notices, active, gradeFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const pageItems  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const categoryCounts = NOTICE_TABS.map(label => ({
    label,
    count: label === '전체' ? notices.length : notices.filter(n => n.category === label).length,
  }))

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="pt-14" />

      <section className="bg-black text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              <i className="fas fa-bullhorn mr-2" />공지사항
            </h1>
            {selectedDeptName && (
              <p className="text-gray-400 text-sm mt-1">{selectedDeptName} 공지사항</p>
            )}
          </div>
          {canWrite && (
            <button
              onClick={() => navigate('/dept/notice/write')}
              className="px-4 py-2 text-sm bg-white text-black font-medium hover:bg-gray-200 transition flex items-center gap-1.5"
            >
              <i className="fas fa-pen" />공지 작성
            </button>
          )}
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
              <FeaturedCard
                category={featured.category}
                title={featured.title}
                date={featured.date}
                meta={`👁 ${featured.viewCount}`}
              />
            )}

            <div className="mb-4">
              <div className="flex items-center border border-black">
                <i className="fas fa-search px-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="제목으로 검색..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 py-2 pr-4 text-sm outline-none bg-white"
                />
              </div>
            </div>
            <FilterTabs tabs={NOTICE_TABS} active={active} onChange={setActive} />
            <div className="flex flex-wrap gap-2 mb-6">
              {GRADE_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setGradeFilter(tab)}
                  aria-pressed={gradeFilter === tab}
                  className={`px-3 py-1 text-xs border font-medium transition ${
                    gradeFilter === tab ? 'border-black bg-black text-white' : 'border-gray-400 text-gray-600 hover:border-black hover:text-black'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                {pageItems.map(notice => {
                  const thumbUrl = notice.attachments?.find(a => a.isImage)?.url
                  return (
                  <div
                    key={notice.id}
                    onClick={() => navigate(`/notice/${notice.id}`)}
                    className="flex gap-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer"
                  >
                    {thumbUrl && (
                      <img src={thumbUrl} alt="" className="w-20 h-16 object-cover flex-shrink-0 border border-gray-300" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-black leading-snug line-clamp-2">
                        {notice.title}
                      </p>
                      <div className="flex items-center flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                        <span className="border border-black text-black px-1.5 py-0.5 font-medium">{notice.category}</span>
                        {(notice.targetGrades ?? []).length > 0 && (notice.targetGrades ?? []).length < 4 && (
                          <span className="border border-gray-400 text-gray-500 px-1.5 py-0.5">
                            {(notice.targetGrades ?? []).map(g => `${g}학년`).join('·')}
                          </span>
                        )}
                        <span className="font-medium text-gray-700">{notice.author}</span>
                        <span>{notice.date}</span>
                        <span><i className="fas fa-eye mr-0.5" />{notice.viewCount}</span>
                      </div>
                    </div>
                  </div>
                  )
                })}
                {filtered.length === 0 && (
                  <div className="py-16 text-center text-gray-400">
                    <i className="fas fa-inbox text-3xl mb-3 block" />공지사항이 없습니다.
                  </div>
                )}
                <Pagination current={page} total={totalPages} onChange={setPage} />
              </div>

              <Sidebar
                categoryWidget={{ title: '카테고리', items: categoryCounts, onSelect: setActive }}
                recentWidget={{
                  title: '최근 공지',
                  items: notices.slice(0, 5).map(n => ({ title: n.title, sub: n.date })),
                }}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
