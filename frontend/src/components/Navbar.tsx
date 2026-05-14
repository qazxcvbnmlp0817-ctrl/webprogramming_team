import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/notice',     label: '공지사항' },
  { to: '/board',      label: '게시판' },
  { to: '/schedule',   label: '일정' },
  { to: '/department', label: '학과정보' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 w-full bg-black text-white z-50 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg tracking-tight hover:opacity-80 transition">
          학과정보통합서비스
        </Link>

        {/* 데스크탑 메뉴 */}
        <ul className="hidden md:flex gap-8 text-sm font-medium">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={`pb-1 hover:opacity-70 transition border-b-2 ${
                  pathname === to ? 'border-white' : 'border-transparent'
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
          <Link
            to="/login"
            className="border border-white text-white text-sm px-3 py-1 rounded hover:bg-white hover:text-black transition"
          >
            로그인
          </Link>
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
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`hover:opacity-70 ${pathname === to ? 'border-b border-white pb-1 font-medium' : ''}`}
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
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="border border-white text-center py-1 rounded hover:bg-white hover:text-black transition"
          >
            로그인
          </Link>
        </div>
      )}
    </nav>
  )
}
