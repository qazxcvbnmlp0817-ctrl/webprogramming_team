import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import type { UniversityDto } from '../types/university'
import { fetchUniversity } from '../api/universities'
import { useDept } from '../context/DeptContext'
import Navbar from '../components/Navbar'

// ── 메인 ──────────────────────────────────────────────────────────────────────
export default function UniversityShowPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setUniversityInfo } = useDept()

  const [univ, setUniv] = useState<UniversityDto | null>(null)
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })

  useEffect(() => {
    if (!id) return
    fetchUniversity(Number(id)).then(data => {
      setUniv(data)
      setUniversityInfo(data.id, data.name)
    }).catch(() => navigate('/universities'))
  }, [id, navigate, setUniversityInfo])

  if (!univ) return null

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
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

        {/* ── 2. 소속 단과대학 ── */}
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
