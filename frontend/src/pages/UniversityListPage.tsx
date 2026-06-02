import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { UniversityDto } from '../types/university'
import { fetchUniversities } from '../api/universities'
import { fetchActivityRanking, type ActivityData } from '../api/activity'
import { useDept } from '../context/DeptContext'
import AdminBanner from '../components/common/AdminBanner'
import UniversityCard, { activityScore } from '../components/common/UniversityCard'

type SortMode = 'active' | 'alpha'

export default function UniversityListPage() {
  const [universities, setUniversities]   = useState<UniversityDto[]>([])
  const [activityMap, setActivityMap]     = useState<Map<number, ActivityData>>(new Map())
  const [menuOpen, setMenuOpen]           = useState(false)
  const [searchQuery, setSearchQuery]     = useState('')
  const [sortMode, setSortMode]           = useState<SortMode>('active')
  const { setUniversityInfo }             = useDept()
  const navigate                          = useNavigate()

  useEffect(() => {
    let cancelled = false
    fetchUniversities().then(data => { if (!cancelled) setUniversities(data) })
    fetchActivityRanking('univ').then(list => {
      if (!cancelled) setActivityMap(new Map(list.map(a => [a.scopeId, a])))
    })
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const list = q
      ? universities.filter(u => u.name.toLowerCase().includes(q))
      : [...universities]

    if (sortMode === 'active') {
      list.sort((a, b) =>
        activityScore(b, activityMap.get(b.id)) -
        activityScore(a, activityMap.get(a.id))
      )
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    }
    return list
  }, [universities, activityMap, searchQuery, sortMode])

  const maxScore = useMemo(
    () => Math.max(...universities.map(u => activityScore(u, activityMap.get(u.id))), 1),
    [universities, activityMap]
  )
  const maxDepts = useMemo(
    () => Math.max(...universities.map(u => u.totalDeptCount), 1),
    [universities]
  )
  const maxSchools = useMemo(
    () => Math.max(...universities.map(u => u.schools.length), 1),
    [universities]
  )
  const maxVisitors = useMemo(
    () => Math.max(...[...activityMap.values()].map(a => a.weeklyVisitors), 1),
    [activityMap]
  )
  const maxPosts = useMemo(
    () => Math.max(...[...activityMap.values()].map(a => a.newPosts), 1),
    [activityMap]
  )
  const maxComments = useMemo(
    () => Math.max(...[...activityMap.values()].map(a => a.newComments), 1),
    [activityMap]
  )

  const handleSelect = (univ: UniversityDto) => {
    setUniversityInfo(univ.id, univ.name)
    navigate('/school/departments')
  }

  return (
    <div className="bg-white text-black font-sans">
      <nav className="fixed top-0 left-0 w-full bg-black text-white z-50 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/universities" className="font-bold text-lg tracking-tight hover:opacity-80 transition">
            학과정보통합서비스
          </Link>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="border border-white text-white text-sm px-3 py-1 rounded hover:bg-white hover:text-black transition">
              로그인
            </Link>
          </div>
          <button
            onClick={() => setMenuOpen(p => !p)}
            className="md:hidden text-white focus:outline-none"
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={menuOpen}
          >
            <i className="fas fa-bars text-xl" />
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-black border-t border-gray-700 px-4 py-4 flex flex-col gap-4 text-sm">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-2 border border-white text-center py-1 rounded hover:bg-white hover:text-black transition"
            >
              로그인
            </Link>
          </div>
        )}
      </nav>

      <div className="pt-14" />

      <section className="bg-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <i className="fas fa-university mr-3" />대학교 선택
          </h1>
          <p className="text-gray-400 text-sm md:text-base">소속 대학교를 선택하세요</p>
        </div>
      </section>

      <AdminBanner scope="selection" />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="대학교 이름 검색..."
            className="flex-1 border-2 border-black px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <div className="flex border-2 border-black overflow-hidden">
            <button
              onClick={() => setSortMode('active')}
              aria-label="활동 많은 순"
              className={`px-4 py-2 text-sm font-medium transition ${
                sortMode === 'active' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              활동 많은 순
            </button>
            <button
              onClick={() => setSortMode('alpha')}
              aria-label="가나다 순"
              className={`px-4 py-2 text-sm font-medium transition border-l-2 border-black ${
                sortMode === 'alpha' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              가나다 순
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-20">검색 결과가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(univ => (
              <UniversityCard
                key={univ.id}
                univ={univ}
                activityData={activityMap.get(univ.id)}
                maxScore={maxScore}
                maxDepts={maxDepts}
                maxSchools={maxSchools}
                maxVisitors={maxVisitors}
                maxPosts={maxPosts}
                maxComments={maxComments}
                onSelect={() => handleSelect(univ)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
