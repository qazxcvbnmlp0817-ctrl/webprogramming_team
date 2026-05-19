import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDept } from '../context/DeptContext'

const SCHOOL_NAV = [
  { to: '/school/departments', label: '학과 선택' },
  { to: '/school/notice',      label: '공지사항' },
  { to: '/school/board',       label: '게시판' },
  { to: '/school/schedule',    label: '일정' },
  { to: '/school/info',        label: '학교정보' },
]

const DEPT_NAV = [
  { to: '/dept/notice',     label: '공지사항' },
  { to: '/dept/board',      label: '게시판' },
  { to: '/dept/schedule',   label: '일정' },
  { to: '/dept/department', label: '학과정보' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { selectedUniversityId, selectedUniversityName, selectedDeptName } = useDept()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const check = () => setIsLoggedIn(sessionStorage.getItem('isLoggedIn') === 'true')
    check()
    window.addEventListener('storage', check)
    window.addEventListener('loginChanged', check)
    return () => {
      window.removeEventListener('storage', check)
      window.removeEventListener('loginChanged', check)
    }
  }, [pathname])

  const isSchool = pathname.startsWith('/school') || /^\/universities\/\d+/.test(pathname)
  const navLinks = isSchool ? SCHOOL_NAV : DEPT_NAV
  const schoolHomeLink = `/universities/${selectedUniversityId}`

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn')
    sessionStorage.removeItem('username')
    sessionStorage.removeItem('memberType')
    setIsLoggedIn(false)
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-black text-white z-50 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* 로고 + 컨텍스트 배지 */}
        <div className="flex items-center gap-3">
          <Link
            to={isSchool ? schoolHomeLink : '/dept/home'}
            className="font-bold text-lg tracking-tight hover:opacity-80 transition"
          >
            학과정보통합서비스
          </Link>
          {isSchool && selectedUniversityName && (
            <span className="hidden md:inline-flex items-center gap-1 text-xs text-gray-400 border border-gray-700 px-2 py-0.5 rounded">
              <i className="fas fa-university text-[10px]" />
              {selectedUniversityName}
            </span>
          )}
          {!isSchool && selectedDeptName && (
            <span className="hidden md:inline-flex items-center gap-1 text-xs text-gray-400 border border-gray-700 px-2 py-0.5 rounded">
              <i className="fas fa-door-open text-[10px]" />
              {selectedDeptName}
            </span>
          )}
        </div>

        {/* 데스크탑 메뉴 */}
        <ul className="hidden md:flex gap-8 text-sm font-medium">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={`pb-1 hover:opacity-70 transition border-b-2 text-gray-300 ${
                  pathname === to ? 'border-white font-semibold text-white' : 'border-transparent'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* 데스크탑 우측 버튼 */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/universities"
            className="border border-white text-white text-sm px-3 py-1 rounded hover:bg-white hover:text-black transition"
          >
            학교 변경
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                to="/mypage"
                className="border border-white text-white text-sm px-3 py-1 rounded hover:bg-white hover:text-black transition"
              >
                마이페이지
              </Link>
              <button
                onClick={handleLogout}
                className="border border-white text-white text-sm px-3 py-1 rounded hover:bg-white hover:text-black transition"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="border border-white text-white text-sm px-3 py-1 rounded hover:bg-white hover:text-black transition"
            >
              로그인
            </Link>
          )}
        </div>

        {/* 햄버거 버튼 */}
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          className="md:hidden text-white focus:outline-none"
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
        >
          <i className="fas fa-bars text-xl" />
        </button>
      </div>

      {/* 모바일 드롭다운 */}
      {menuOpen && (
        <div
          data-testid="mobile-menu"
          className="md:hidden bg-black border-t border-gray-700 px-4 py-4 flex flex-col gap-4 text-sm"
        >
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`hover:opacity-70 ${
                pathname === to ? 'border-b border-white pb-1 font-medium text-white' : 'text-gray-300'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/universities"
            onClick={() => setMenuOpen(false)}
            className="border border-white text-center py-1 rounded hover:bg-white hover:text-black transition"
          >
            학교 변경
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                to="/mypage"
                onClick={() => setMenuOpen(false)}
                className="border border-white text-center py-1 rounded hover:bg-white hover:text-black transition"
              >
                마이페이지
              </Link>
              <button
                onClick={handleLogout}
                className="border border-white text-center py-1 rounded hover:bg-white hover:text-black transition w-full"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="border border-white text-center py-1 rounded hover:bg-white hover:text-black transition"
            >
              로그인
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
