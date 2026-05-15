import { useEffect, useState, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import type { UniversityDto } from '../types/university'
import type { DepartmentDetailDto } from '../types/department'
import { fetchUniversity } from '../api/universities'
import { fetchDepartmentDetail } from '../api/departments'
import { useDept } from '../context/DeptContext'

// ── 스켈레톤 ──────────────────────────────────────────────────────────────────
function SkeletonBlock({ h = 'h-4', w = 'w-full' }: { h?: string; w?: string }) {
  return <div className={`${h} ${w} bg-gray-200 animate-pulse rounded`} />
}

function DetailSkeleton() {
  return (
    <div className="p-6 space-y-8">
      <div className="space-y-3">
        <SkeletonBlock h="h-6" w="w-40" />
        <SkeletonBlock h="h-4" />
        <SkeletonBlock h="h-4" w="w-5/6" />
      </div>
      <div className="space-y-3">
        <SkeletonBlock h="h-5" w="w-28" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-100 p-4 space-y-2">
              <SkeletonBlock h="h-4" w="w-24" />
              <SkeletonBlock h="h-3" w="w-36" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonBlock h="h-5" w="w-28" />
        {[...Array(4)].map((_, i) => <SkeletonBlock key={i} h="h-9" />)}
      </div>
    </div>
  )
}

// ── 학과 상세 ─────────────────────────────────────────────────────────────────
function DepartmentDetail({ dept }: { dept: DepartmentDetailDto }) {
  return (
    <div className="p-6 space-y-8 overflow-y-auto">
      <section>
        <h3 className="text-xl font-bold mb-3 pb-2 border-b-2 border-black">{dept.name}</h3>
        <p className="text-gray-700 text-sm leading-relaxed">{dept.description}</p>
      </section>

      <section>
        <h4 className="text-base font-bold mb-3 flex items-center gap-2">
          <i className="fas fa-chalkboard-teacher" />교수진
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {dept.professors.map(prof => (
            <div key={prof.id} className="border-2 border-black p-3 flex gap-3 items-start hover:bg-gray-50 transition">
              <div className="w-10 h-10 bg-gray-200 border border-gray-300 flex items-center justify-center flex-shrink-0 rounded-full">
                <i className="fas fa-user text-gray-400" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm">{prof.name}</p>
                <p className="text-xs text-gray-600 mt-0.5">{prof.specialty}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{prof.email}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4 className="text-base font-bold mb-3 flex items-center gap-2">
          <i className="fas fa-book-open" />교육과정
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full border-2 border-black text-sm">
            <thead>
              <tr className="bg-black text-white">
                <th className="px-3 py-2 text-left font-medium border-r border-gray-700">과목명</th>
                <th className="px-3 py-2 text-center font-medium border-r border-gray-700">학년</th>
                <th className="px-3 py-2 text-center font-medium border-r border-gray-700">구분</th>
                <th className="px-3 py-2 text-center font-medium">학점</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dept.curriculum.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium border-r border-gray-200">{c.name}</td>
                  <td className="px-3 py-2 text-center border-r border-gray-200">{c.year}</td>
                  <td className="px-3 py-2 text-center border-r border-gray-200">
                    {c.required
                      ? <span className="border border-black px-1.5 py-0.5 text-xs font-medium">필수</span>
                      : <span className="text-gray-500 text-xs">선택</span>}
                  </td>
                  <td className="px-3 py-2 text-center">{c.credit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h4 className="text-base font-bold mb-3 flex items-center gap-2">
          <i className="fas fa-map-marker-alt" />연락정보
        </h4>
        <div className="border-2 border-black p-4 grid grid-cols-1 gap-3">
          {[
            { icon: 'fa-location-dot', label: '주소',     value: dept.address },
            { icon: 'fa-phone',        label: '전화',     value: dept.phone },
            { icon: 'fa-envelope',     label: '이메일',   value: dept.email },
            { icon: 'fa-clock',        label: '운영시간', value: dept.hours },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <i className={`fas ${icon} text-sm mt-0.5 flex-shrink-0`} />
              <div>
                <p className="font-semibold text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="text-sm text-gray-800">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-1 border-t border-gray-200">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-black text-white px-5 py-2 text-sm font-bold hover:bg-gray-800 transition"
        >
          <i className="fas fa-home text-xs" />이 학과 포털로 이동
        </Link>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-gray-400 gap-3">
      <i className="fas fa-hand-pointer text-4xl" />
      <p className="text-sm font-medium">학과를 선택하세요</p>
      <p className="text-xs text-center text-gray-400">왼쪽 목록에서 학과를 클릭하면<br />상세 정보가 표시됩니다</p>
    </div>
  )
}

// ── 메인 ──────────────────────────────────────────────────────────────────────
export default function UniversityShowPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setDept } = useDept()

  const [univ, setUniv]         = useState<UniversityDto | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })

  const [selectedId, setSelectedId]       = useState<number | null>(null)
  const [detail, setDetail]               = useState<DepartmentDetailDto | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetchUniversity(Number(id)).then(setUniv).catch(() => navigate('/universities'))
  }, [id, navigate])

  const selectDept = useCallback((deptId: number, deptName: string, schoolName: string, u: UniversityDto) => {
    setSelectedId(deptId)
    setDetailLoading(true)
    setError(null)
    setDept({
      selectedDeptId: deptId,
      selectedDeptName: deptName,
      selectedUniversityId: u.id,
      selectedUniversityName: u.name,
      selectedSchoolName: schoolName,
    })
    fetchDepartmentDetail(deptId)
      .then(setDetail)
      .catch(e => setError(e.message))
      .finally(() => setDetailLoading(false))
  }, [setDept])

  if (!univ) return null

  return (
    <div className="bg-white text-black font-sans">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 w-full bg-black text-white z-50 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/universities" className="font-bold text-lg tracking-tight hover:opacity-80 transition">
            학과정보통합서비스
          </Link>
          <ul className="hidden md:flex gap-8 text-sm font-medium">
            <li><Link to="/school/notice"   className="pb-1 hover:opacity-70 transition border-b-2 border-transparent text-gray-300">공지사항</Link></li>
            <li><Link to="/school/board"    className="pb-1 hover:opacity-70 transition border-b-2 border-transparent text-gray-300">게시판</Link></li>
            <li><Link to="/school/schedule" className="pb-1 hover:opacity-70 transition border-b-2 border-transparent text-gray-300">일정</Link></li>
          </ul>
          <div className="hidden md:flex items-center gap-3 text-sm text-gray-400">
            <span>
              <Link to="/universities" className="hover:text-white transition">대학교 선택</Link>
              <span className="mx-1">›</span>
              <span className="text-white font-medium">{univ.name}</span>
            </span>
            <Link to="/login" className="border border-white text-white text-sm px-3 py-1 rounded hover:bg-white hover:text-black transition">로그인</Link>
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
            <Link to="/universities" className="hover:opacity-70 text-gray-300">
              <i className="fas fa-arrow-left mr-1 text-xs" />대학교 선택으로
            </Link>
            <Link to="/school/notice"   className="hover:opacity-70 text-gray-300">공지사항</Link>
            <Link to="/school/board"    className="hover:opacity-70 text-gray-300">게시판</Link>
            <Link to="/school/schedule" className="hover:opacity-70 text-gray-300">일정</Link>
            <Link to="/login" onClick={() => setMenuOpen(false)} className="mt-2 border border-white text-center py-1 rounded hover:bg-white hover:text-black transition">로그인</Link>
          </div>
        )}
      </nav>

      <div className="pt-14" />

      {/* ── 1. 히어로 (원본 복원) ── */}
      <section className="bg-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-xs mb-3">
            <Link to="/universities" className="hover:text-gray-300 transition">대학교 선택</Link>
            <span className="mx-1">›</span>
            <span>{univ.name}</span>
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <i className="fas fa-university mr-3" />{univ.name}
          </h1>
          <p className="text-gray-400 text-sm md:text-base mb-2">{today}</p>
          <p className="text-gray-400 text-sm md:text-base">{univ.description}</p>
          <div className="flex justify-center gap-3 mt-6">
            <span className="inline-flex items-center gap-1.5 border border-white text-white text-xs px-3 py-1.5">
              <i className="fas fa-building text-xs" />{univ.schools.length}개 단과대학
            </span>
            <span className="inline-flex items-center gap-1.5 border border-white text-white text-xs px-3 py-1.5">
              <i className="fas fa-door-open text-xs" />{univ.totalDeptCount}개 학과
            </span>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        {/* ── 2. 학부·학과 선택 (신규 통합 섹션) ── */}
        <section>
          <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-gray-700">
            <i className="fas fa-list-ul text-sm" />학부·학과 선택
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-[35fr_65fr] gap-0 border-2 border-black">

            {/* 사이드바: 학과 목록 */}
            <aside className="border-r-0 lg:border-r-2 border-black">
              <div className="bg-black text-white px-4 py-3">
                <span className="font-bold text-sm">
                  <i className="fas fa-sitemap mr-2" />학과 목록
                </span>
              </div>
              <div className="overflow-y-auto max-h-[480px]">
                {univ.schools.map(school => (
                  <div key={school.id}>
                    <div className="px-4 py-2 bg-gray-100 text-xs font-bold text-gray-600 border-b border-gray-200 uppercase tracking-wide">
                      {school.name}
                    </div>
                    {school.faculties.map(faculty => (
                      <div key={faculty.id}>
                        <div className="px-4 py-1.5 text-xs text-gray-500 font-semibold border-b border-gray-100 flex items-center gap-1">
                          <i className="fas fa-layer-group text-[10px]" />{faculty.name}
                        </div>
                        {faculty.depts.map(dept => (
                          <button
                            key={dept.id}
                            onClick={() => selectDept(dept.id, dept.name, school.name, univ)}
                            className={`w-full text-left px-6 py-2.5 text-sm border-b border-gray-100 transition flex items-center justify-between gap-2
                              ${selectedId === dept.id
                                ? 'bg-black text-white font-medium hover:bg-gray-900'
                                : 'hover:bg-gray-50'}`}
                          >
                            <span className="truncate">{dept.name}</span>
                            {selectedId === dept.id && <i className="fas fa-chevron-right text-xs flex-shrink-0" />}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </aside>

            {/* 콘텐츠: 학과 상세 */}
            <div className="border-t-2 lg:border-t-0 border-black flex flex-col">
              <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
                <span className="font-bold text-sm">
                  <i className="fas fa-info-circle mr-2" />
                  {detail ? detail.name : '학과 상세 정보'}
                </span>
                {detailLoading && (
                  <span className="text-xs text-gray-400 flex items-center gap-1.5">
                    <i className="fas fa-spinner fa-spin" />불러오는 중...
                  </span>
                )}
              </div>
              <div className="flex-1">
                {detailLoading ? (
                  <DetailSkeleton />
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
                    <i className="fas fa-exclamation-triangle text-3xl text-red-400" />
                    <p className="text-sm">{error}</p>
                    <button
                      onClick={() => selectedId && detail && selectDept(selectedId, detail.name, '', univ)}
                      className="text-xs border border-black px-3 py-1.5 hover:bg-black hover:text-white transition"
                    >
                      다시 시도
                    </button>
                  </div>
                ) : detail ? (
                  <DepartmentDetail dept={detail} />
                ) : (
                  <EmptyState />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. 소속 단과대학 (원본 복원) ── */}
        <section>
          <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-gray-700">
            <i className="fas fa-building text-sm" />소속 단과대학
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {univ.schools.map(school => (
              <div
                key={school.id}
                className="border border-gray-200 p-4 text-sm hover:border-black transition"
              >
                <p className="font-semibold mb-1">{school.name}</p>
                <p className="text-xs text-gray-400">
                  {school.faculties.length}개 학부 · {school.faculties.reduce((sum, f) => sum + f.depts.length, 0)}개 학과
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. 바로가기 (원본 복원) ── */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { to: '/school/notice',   icon: 'fa-bullhorn',     label: '공지사항' },
              { to: '/school/board',    icon: 'fa-comments',     label: '게시판' },
              { to: '/school/schedule', icon: 'fa-calendar-alt', label: '일정' },
              { to: '/school/info',     icon: 'fa-university',   label: '학교정보' },
            ].map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center gap-3 py-6 border-2 border-black hover:bg-black hover:text-white transition font-medium text-sm"
              >
                <i className={`fas ${icon} text-2xl`} />{label}
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}
