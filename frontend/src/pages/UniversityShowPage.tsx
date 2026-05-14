import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import type { UniversityDto } from '../types/university'
import { fetchUniversity } from '../api/universities'

export default function UniversityShowPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [univ, setUniv] = useState<UniversityDto | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })

  useEffect(() => {
    if (!id) return
    fetchUniversity(Number(id)).then(setUniv).catch(() => navigate('/universities'))
  }, [id, navigate])

  if (!univ) return null

  return (
    <div className="bg-white text-black font-sans">
      <nav className="fixed top-0 left-0 w-full bg-black text-white z-50 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/universities" className="font-bold text-lg tracking-tight hover:opacity-80 transition">
            학과정보통합서비스
          </Link>
          <ul className="hidden md:flex gap-8 text-sm font-medium">
            <li>
              <Link to={`/universities/${univ.id}/schools`} className="pb-1 hover:opacity-70 transition border-b-2 border-white text-white">
                <i className="fas fa-list-ul mr-1 text-xs" />학부·학과 선택
              </Link>
            </li>
            <li><Link to="/notice"   className="pb-1 hover:opacity-70 transition border-b-2 border-transparent text-gray-300">공지사항</Link></li>
            <li><Link to="/board"    className="pb-1 hover:opacity-70 transition border-b-2 border-transparent text-gray-300">게시판</Link></li>
            <li><Link to="/schedule" className="pb-1 hover:opacity-70 transition border-b-2 border-transparent text-gray-300">일정</Link></li>
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
            <Link to="/universities" className="hover:opacity-70 text-gray-300"><i className="fas fa-arrow-left mr-1 text-xs" />대학교 선택으로</Link>
            <Link to={`/universities/${univ.id}/schools`} className="hover:opacity-70">학부·학과 선택</Link>
            <Link to="/login" onClick={() => setMenuOpen(false)} className="mt-2 border border-white text-center py-1 rounded hover:bg-white hover:text-black transition">로그인</Link>
          </div>
        )}
      </nav>

      <div className="pt-14" />

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

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="border-2 border-black mb-10">
          <div className="bg-black text-white px-6 py-4 flex items-center gap-3">
            <i className="fas fa-list-ul" /><span className="font-bold">학부·학과 선택</span>
          </div>
          <div className="px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-lg font-semibold mb-1">원하는 학과를 선택하세요</p>
              <p className="text-sm text-gray-500">단과대학 → 학부 → 학과 순서로 선택하면 해당 학과 포털로 이동합니다.</p>
            </div>
            <Link
              to={`/universities/${univ.id}/schools`}
              className="flex-shrink-0 flex items-center gap-2 bg-black text-white px-8 py-3 font-bold text-sm hover:bg-gray-800 transition whitespace-nowrap"
            >
              학부·학과 선택하기 <i className="fas fa-arrow-right text-xs" />
            </Link>
          </div>
        </div>

        <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-gray-700">
          <i className="fas fa-building text-sm" />소속 단과대학
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          {univ.schools.map(school => (
            <Link
              key={school.id}
              to={`/universities/${univ.id}/schools`}
              className="group border border-gray-200 p-4 hover:border-black hover:bg-black hover:text-white transition text-sm"
            >
              <p className="font-semibold mb-1">{school.name}</p>
              <p className="text-xs text-gray-400 group-hover:text-gray-300">
                {school.faculties.length}개 학부 · {school.faculties.reduce((sum, f) => sum + f.depts.length, 0)}개 학과
              </p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: '/notice',     icon: 'fa-bullhorn',      label: '공지사항' },
            { to: '/board',      icon: 'fa-comments',      label: '게시판' },
            { to: '/schedule',   icon: 'fa-calendar-alt',  label: '일정' },
            { to: '/department', icon: 'fa-university',    label: '학과정보' },
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
      </main>
    </div>
  )
}
