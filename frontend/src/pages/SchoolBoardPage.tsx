import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Pagination from '../components/Pagination'
import { fetchSchoolPosts } from '../api/school'
import { useDeptFetch } from '../hooks/useDeptFetch'
import { useDept } from '../context/DeptContext'

const TABS         = ['전체', '자유게시판', '질문', '스터디', '취업후기']
const GRADE_TABS   = ['전체', '1학년', '2학년', '3학년', '4학년']
const SORT_OPTIONS = ['최신순', '추천순', '댓글순']

export default function SchoolBoardPage() {
  const { selectedUniversityId, selectedUniversityName } = useDept()
  const navigate = useNavigate()
  const [active, setActive]           = useState('전체')
  const [gradeFilter, setGradeFilter] = useState('전체')
  const [sort, setSort]               = useState('최신순')
  const [search, setSearch]           = useState('')
  const [page, setPage]               = useState(1)
  const PER_PAGE = 10

  useEffect(() => { setPage(1) }, [active, gradeFilter, sort, search])

  const { data, loading } = useDeptFetch(fetchSchoolPosts, selectedUniversityId)
  const posts = data?.posts ?? []

  const filtered = useMemo(() => {
    const memberType   = sessionStorage.getItem('memberType') ?? ''
    const myGrade      = Number(sessionStorage.getItem('grade') || '0')
    const isPrivileged = memberType === 'professor' || memberType === 'admin'

    let result = posts.filter(p => {
      const catOk    = active === '전체' || p.category === active
      const searchOk = search === '' || p.title.toLowerCase().includes(search.toLowerCase())
      const gradeOk  = gradeFilter === '전체' || p.targetGrades.includes(Number(gradeFilter[0]))
      const visibleOk = p.visibility === 'public' || isPrivileged || p.targetGrades.includes(myGrade)
      return catOk && searchOk && gradeOk && visibleOk
    })
    if (sort === '최신순') result = [...result].sort((a, b) => b.date.localeCompare(a.date))
    if (sort === '추천순') result = [...result].sort((a, b) => b.likes - a.likes)
    if (sort === '댓글순') result = [...result].sort((a, b) => b.commentCount - a.commentCount)
    return result
  }, [posts, active, gradeFilter, sort, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const pageItems  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const categoryCounts = TABS.map(label => ({
    label,
    count: label === '전체' ? posts.length : posts.filter(p => p.category === label).length,
  }))

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="pt-14" />

      <section className="bg-black text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-end justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/universities/${selectedUniversityId}`} className="text-gray-400 hover:text-white transition text-sm">
              <i className="fas fa-arrow-left mr-1" />{selectedUniversityName ?? '학교 홈'}
            </Link>
            <span className="text-gray-600">›</span>
            <h1 className="text-xl font-bold"><i className="fas fa-comments mr-2" />학교 게시판</h1>
          </div>
          {sessionStorage.getItem('isLoggedIn') === 'true' && (
            <button
              onClick={() => navigate('/school/board/write')}
              className="px-4 py-2 text-sm bg-white text-black font-medium hover:bg-gray-200 transition flex items-center gap-1.5"
            >
              <i className="fas fa-pen" />글쓰기
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
            <div className="mb-4">
              <div className="flex items-center border border-black">
                <i className="fas fa-search px-3 text-gray-400" />
                <input type="text" placeholder="제목으로 검색..." value={search} onChange={e => setSearch(e.target.value)}
                  className="flex-1 py-2 pr-4 text-sm outline-none bg-white" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-y-2 mb-3">
              <div className="flex flex-wrap gap-2">
                {TABS.map(tab => (
                  <button key={tab} onClick={() => setActive(tab)} aria-pressed={active === tab}
                    className={`px-4 py-1.5 text-sm border border-black font-medium transition ${active === tab ? 'bg-black text-white' : 'bg-white text-black'}`}>
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 ml-auto">
                {SORT_OPTIONS.map(opt => (
                  <button key={opt} onClick={() => setSort(opt)} aria-pressed={sort === opt}
                    className={`px-3 py-1.5 text-sm border border-black font-medium transition ${sort === opt ? 'bg-black text-white' : 'bg-white text-black'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {GRADE_TABS.map(tab => (
                <button key={tab} onClick={() => setGradeFilter(tab)} aria-pressed={gradeFilter === tab}
                  className={`px-3 py-1 text-xs border font-medium transition ${gradeFilter === tab ? 'border-black bg-black text-white' : 'border-gray-400 text-gray-600 hover:border-black hover:text-black'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                {pageItems.map(post => {
                  const thumbUrl = post.attachments?.find(a => a.isImage)?.url ?? post.imageUrl
                  return (
                  <div key={post.id} onClick={() => navigate(`/post/${post.id}`)} className="flex gap-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer">
                    {thumbUrl && (
                      <img src={thumbUrl} alt="" className="w-20 h-16 object-cover flex-shrink-0 border border-gray-300" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-black leading-snug line-clamp-2">{post.title}</p>
                      <div className="flex items-center flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                        <span className="border border-black text-black px-1.5 py-0.5 font-medium">{post.category}</span>
                        {post.targetGrades.length < 4 && (
                          <span className="border border-gray-400 text-gray-500 px-1.5 py-0.5">
                            {post.targetGrades.map(g => `${g}학년`).join('·')}
                          </span>
                        )}
                        <span className="font-medium text-gray-700">{post.author}</span>
                        <span>{post.date}</span>
                        <span><i className="fas fa-heart mr-0.5 text-red-400" />{post.likes}</span>
                        <span><i className="fas fa-comment mr-0.5" />{post.commentCount}</span>
                        <span><i className="fas fa-eye mr-0.5" />{post.viewCount}</span>
                      </div>
                    </div>
                  </div>
                  )
                })}
                {filtered.length === 0 && (
                  <div className="py-16 text-center text-gray-400">
                    <i className="fas fa-inbox text-3xl mb-3 block" />게시글이 없습니다.
                  </div>
                )}
                <Pagination current={page} total={totalPages} onChange={setPage} />
              </div>
              <Sidebar
                categoryWidget={{ title: '카테고리', items: categoryCounts, onSelect: setActive }}
                recentWidget={{ title: '인기 게시글 TOP 5',
                  items: [...posts].sort((a, b) => b.likes - a.likes).slice(0, 5).map(p => ({ title: p.title, sub: `❤ ${p.likes}` })) }}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
