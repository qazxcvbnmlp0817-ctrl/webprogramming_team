import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import type { UniversityDto } from '../types/university'
import { fetchUniversity } from '../api/universities'
import { useDept } from '../context/DeptContext'

export default function SchoolSelectPage() {
  const { universityId } = useParams<{ universityId: string }>()
  const navigate = useNavigate()
  const { setDept } = useDept()
  const [univ, setUniv] = useState<UniversityDto | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!universityId) return
    fetchUniversity(Number(universityId)).then(setUniv).catch(() => navigate('/universities'))
  }, [universityId, navigate])

  function selectDept(deptId: number, deptName: string, schoolName: string) {
    setDept({
      selectedDeptId: deptId,
      selectedDeptName: deptName,
      selectedUniversityId: univ ? univ.id : null,
      selectedUniversityName: univ ? univ.name : null,
      selectedSchoolName: schoolName,
    })
    navigate('/')
  }

  if (!univ) return null

  return (
    <div className="bg-white text-black font-sans">
      <nav className="fixed top-0 left-0 w-full bg-black text-white z-50 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/universities" className="font-bold text-lg tracking-tight hover:opacity-80 transition">
            학과정보통합서비스
          </Link>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
            <Link to="/universities" className="hover:text-white transition">대학교 선택</Link>
            <span>›</span>
            <Link to={`/universities/${univ.id}`} className="hover:text-white transition">{univ.name}</Link>
            <span>›</span>
            <span className="text-white">학부·학과 선택</span>
          </div>
          <div className="hidden md:flex items-center gap-3">
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
          <div className="md:hidden bg-black border-t border-gray-700 px-4 py-4 flex flex-col gap-3 text-sm">
            <Link to="/universities" className="text-gray-300 hover:opacity-70"><i className="fas fa-arrow-left mr-1 text-xs" />대학교 선택으로</Link>
            <Link to="/login" onClick={() => setMenuOpen(false)} className="mt-2 border border-white text-center py-1 rounded hover:bg-white hover:text-black transition">로그인</Link>
          </div>
        )}
      </nav>

      <div className="pt-14" />

      <section className="bg-black text-white py-14 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-xs mb-3">
            <Link to="/universities" className="hover:text-gray-300 transition">대학교 선택</Link>
            <span className="mx-1">›</span>
            <Link to={`/universities/${univ.id}`} className="hover:text-gray-300 transition">{univ.name}</Link>
            <span className="mx-1">›</span>
            <span>학부·학과 선택</span>
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <i className="fas fa-list-ul mr-3" />학부·학과 선택
          </h1>
          <p className="text-gray-400 text-sm md:text-base">{univ.name} 소속 학과를 선택하세요</p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {univ.schools.map(school => (
          <div key={school.id} className="mb-14">
            <h2 className="text-xl font-bold pb-3 mb-6 border-b-2 border-black flex items-center gap-2">
              <i className="fas fa-building text-base" />{school.name}
            </h2>
            {school.faculties.map(faculty => (
              <div key={faculty.id} className="mb-8 pl-4 border-l-2 border-gray-200">
                <div className="mb-3">
                  <span className="inline-flex items-center gap-2 text-base font-semibold">
                    <i className="fas fa-layer-group text-sm text-gray-500" />
                    {faculty.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pl-6">
                  {faculty.depts.map(dept => (
                    <button
                      key={dept.id}
                      onClick={() => selectDept(dept.id, dept.name, school.name)}
                      className="border-2 border-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white transition"
                    >
                      {dept.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  )
}
