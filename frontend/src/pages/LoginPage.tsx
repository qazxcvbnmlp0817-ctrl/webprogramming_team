import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function LoginPage() {
  return (
    <div className="bg-white text-black font-sans">
      <Navbar />

      <div className="min-h-screen flex items-center justify-center px-4 pt-14">
        <div className="w-full max-w-sm border-2 border-black p-8">
          <h1 className="text-2xl font-bold text-center mb-2">학과정보통합서비스</h1>
          <p className="text-center text-gray-500 text-sm mb-6">학과 포털 로그인</p>
          <div className="border-t border-black mb-6" />

          <form onSubmit={e => e.preventDefault()}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="username">아이디</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="학번 또는 아이디 입력"
                className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50 transition"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1" htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="비밀번호 입력"
                className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition"
            >
              로그인
            </button>
          </form>

          <div className="border-t border-gray-200 mt-6 pt-4" />
          <div className="flex justify-center gap-6 text-xs text-gray-500">
            <Link to="/register" className="hover:text-black hover:underline transition">회원가입</Link>
            <span className="text-gray-300">|</span>
            <Link to="/forgot-password" className="hover:text-black hover:underline transition">비밀번호 찾기</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
