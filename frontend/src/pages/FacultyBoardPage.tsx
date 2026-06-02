import { useCallback, useMemo, useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Pagination from '../components/Pagination'
import { fetchUniversity } from '../api/universities'
import { fetchFacultyPosts } from '../api/school'
import { useDept } from '../context/DeptContext'
import { useDeptFetch } from '../hooks/useDeptFetch'
import type { UniversityDto } from '../types/university'
import AccessDenied from '../components/common/AccessDenied'
import { isLoggedIn, isSameFaculty } from '../utils/accessCheck'

const BOARD_TABS   = ['전체', '자유게시판', '질문', '스터디', '취업후기']
const GRADE_TABS   = ['전체', '1학년', '2학년', '3학년', '4학년']
const SORT_OPTIONS = ['최신순', '추천순', '댓글순']

export default function FacultyBoardPage() {
  const { facultyId } = useParams<{ facultyId: string }>()
  const { selectedUniversityId, setDept } = useDept()
  const navigate = useNavigate()

  const facultyIdNum = facultyId ? Number(facultyId) : null

  const { data: univ }          = useDeptFetch(fetchUniversity, selectedUniversityId)
  const { data: boardData, loading } = useDeptFetch(fetchFacultyPosts, facultyIdNum)

  const [active, setActive]           = useState('전체')
  const [gradeFilter, setGradeFilter] = useState('전체')
  const [sort, setSort]               = useState('최신순')
  const [search, setSearch]           = useState('')
  const [searchType, setSearchType]   = useState<'제목' | '작성자' | '제목+작성자'>('제목+작성자')
  const [page, setPage]               = useState(1)
  const PER_PAGE = 10

  useEffect(() => { setPage(1) }, [active, gradeFilter, sort, search, searchType])

  const memberType = sessionStorage.getItem('memberType') ?? ''
  const isAdmin = memberType === 'admin'

  const school  = univ?.schools.find(s => s.faculties.some(f => f.id === facultyIdNum))
  const faculty = school?.faculties.find(f => f.id === facultyIdNum)
  const posts   = boardData?.posts ?? []

  const filtered = useMemo(() => {
    const memberType   = sessionStorage.getItem('memberType') ?? ''
    const myGrade      = Number(sessionStorage.getItem('grade') || '0')
    const isPrivileged = memberType === 'professor' || memberType === 'admin'

    let result = posts.filter(p => {
      const catOk    = active === '전체' || p.category === active
      const q = search.toLowerCase()
      const searchOk = q === ''
        || (searchType !== '작성자' && p.title.toLowerCase().includes(q))
        || (searchType !== '제목' && p.author.toLowerCase().includes(q))
      const gradeOk  = gradeFilter === '전체' || p.targetGrades.includes(Number(gradeFilter[0]))
      const visibleOk = p.visibility === 'public' || isPrivileged || p.targetGrades.includes(myGrade)
      return catOk && searchOk && gradeOk && visibleOk
    })
    if (sort === '최신순') result = [...result].sort((a, b) => b.date.localeCompare(a.date))
    if (sort === '추천순') result = [...result].sort((a, b) => b.likes - a.likes)
    if (sort === '댓글순') result = [...result].sort((a, b) => b.commentCount - a.commentCount)
    return result
  }, [posts, active, gradeFilter, sort, search, searchType])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const pageItems  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const categoryCounts = BOARD_TABS.map(label => ({
    label,
    count: label === '전체' ? posts.length : posts.filter(p => p.category === label).length,
  }))

  const handleDeptClick = useCallback((
    deptId: number,
    deptName: string,
    schoolName: string,
    u: UniversityDto,
  ) => {
    setDept({
      selectedDeptId: deptId,
      selectedDeptName: deptName,
      selectedUniversityId: u.id,
      selectedUniversityName: u.name,
      selectedSchoolName: schoolName,
    })
    navigate('/dept/home')
  }, [setDept, navigate])

  return (
    <div className="bg-white text-black font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />

      <section className="bg-black text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-end justify-between gap-4">
          <div>
            <p className="text-gray-500 text-xs mb-2">
              <Link to={`/school/faculty/${facultyId}`} className="hover:text-gray-300 transition">
                {faculty?.name ?? '학부'} 홈
              </Link>
              <span className="mx-1">›</span>
              <span>게시판</span>
            </p>
            <h1 className="text-xl font-bold">
              <i className="fas fa-comments mr-2" />{faculty?.name ?? '학부'} 게시판
            </h1>
            {faculty && (
              <p className="text-gray-400 text-sm mt-1">소속 학과 {faculty.depts.length}개</p>
            )}
          </div>
          {isLoggedIn() && (isAdmin || isSameFaculty(facultyIdNum, faculty?.name)) && (
            <button
              onClick={() => navigate(`/school/faculty/${facultyId}/board/write`)}
              className="px-4 py-2 text-sm bg-white text-black font-medium hover:bg-gray-200 transition flex items-center gap-1.5"
            >
              <i className="fas fa-pen" />글쓰기
            </button>
          )}

          {/* 소속 학과 빠른 이동 */}
          {faculty && univ && (
            <div className="hidden md:flex flex-wrap gap-1.5 justify-end max-w-xs">
              {faculty.depts.map(dept => (
                <button
                  key={dept.id}
                  onClick={() => handleDeptClick(dept.id, dept.name, school!.name, univ)}
                  className="text-xs border border-gray-600 text-gray-300 px-2.5 py-1
                             hover:border-white hover:text-white transition-all duration-100"
                >
                  {dept.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!isAdmin && (!isLoggedIn() || !isSameFaculty(facultyIdNum, faculty?.name)) ? (
          <AccessDenied message={!isLoggedIn() ? '로그인이 필요합니다.' : '소속 학부 구성원만 이용할 수 있습니다.'} />
        ) : loading ? (
          <div className="py-16 text-center text-gray-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-3 block" />불러오는 중...
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center border border-black">
                <div className="flex border-r border-black">
                  {(['제목', '작성자', '제목+작성자'] as const).map(type => (
                    <button key={type} onClick={() => setSearchType(type)}
                      className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition ${
                        searchType === type ? 'bg-black text-white' : 'bg-white text-gray-500 hover:text-black'
                      }`}>{type}</button>
                  ))}
                </div>
                <i className="fas fa-search px-3 text-gray-400" />
                <input type="text" placeholder={`${searchType}으로 검색...`}
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="flex-1 py-2 pr-4 text-sm outline-none bg-white" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-y-2 mb-3">
              <div className="flex flex-wrap gap-2">
                {BOARD_TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActive(tab)}
                    aria-pressed={active === tab}
                    className={`px-4 py-1.5 text-sm border border-black font-medium transition ${
                      active === tab ? 'bg-black text-white' : 'bg-white text-black'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 ml-auto">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSort(opt)}
                    aria-pressed={sort === opt}
                    className={`px-3 py-1.5 text-sm border border-black font-medium transition ${
                      sort === opt ? 'bg-black text-white' : 'bg-white text-black'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

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
                {pageItems.map(post => {
                  const thumbUrl = post.attachments?.find(a => a.isImage)?.url ?? post.imageUrl
                  return (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/post/${post.id}`)}
                    className="flex gap-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer"
                  >
                    {thumbUrl && (
                      <img
                        src={thumbUrl}
                        alt=""
                        className="w-20 h-16 object-cover flex-shrink-0 border border-gray-300"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-black leading-snug line-clamp-2">{post.title}</p>
                      </div>
                      <div className="flex items-center flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                        <span className="border border-black text-black px-1.5 py-0.5 font-medium">
                          {post.category}
                        </span>
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
                recentWidget={{
                  title: '인기 게시글 TOP 5',
                  items: [...posts]
                    .sort((a, b) => b.likes - a.likes)
                    .slice(0, 5)
                    .map(p => ({ title: p.title, sub: `❤ ${p.likes}` })),
                }}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
