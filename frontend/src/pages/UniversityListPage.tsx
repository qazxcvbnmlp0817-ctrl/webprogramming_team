import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { UniversityDto } from '../types/university'
import { fetchUniversities } from '../api/universities'

export default function UniversityListPage() {
  const [universities, setUniversities] = useState<UniversityDto[]>([])
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetchUniversities().then(setUniversities)
  }, [])

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

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {universities.map(univ => (
            <Link
              key={univ.id}
              to={`/universities/${univ.id}`}
              className="group block border-2 border-black p-8 hover:bg-black hover:text-white transition cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <i className="fas fa-university text-3xl mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold mb-2">{univ.name}</h2>
                  <p className="text-sm text-gray-500 group-hover:text-gray-300 leading-snug">
                    {univ.description}
                  </p>
                  <div className="mt-4 flex gap-4 text-xs text-gray-400">
                    <span><i className="fas fa-building mr-1" />{univ.schools.length}개 단과대학</span>
                    <span><i className="fas fa-door-open mr-1" />{univ.totalDeptCount}개 학과</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-gray-200 group-hover:border-gray-600 flex items-center justify-between text-sm font-medium">
                <span>대학교 입장</span>
                <i className="fas fa-arrow-right text-xs transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
