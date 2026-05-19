import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function LoginPage() {
  const navigate = useNavigate()
  const [memberType, setMemberType] = useState<'student' | 'professor' | 'admin'>('student')
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saveId, setSaveId] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !password) {
      setError('아이디 또는 비밀번호가 일치하지 않습니다.')
      return
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: id, password, memberType }),
      })
      const result = await res.json()
      if (result.success) {
        setError('')
        sessionStorage.setItem('isLoggedIn', 'true')
        sessionStorage.setItem('username', id)
        sessionStorage.setItem('memberType', memberType)
        window.dispatchEvent(new Event('loginChanged'))
        navigate('/universities')
      } else {
        setError(result.message || '로그인에 실패했습니다.')
      }
    } catch {
      setError('서버 연결에 실패했습니다.')
    }
  }

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-4 pt-14">
        <div className="w-full max-w-sm border-2 border-black p-8 flex flex-col gap-4">

          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">로그인</h1>
            <p className="text-sm text-gray-500">학과정보통합서비스</p>
            <p className="text-xs text-gray-400">로그인 후 소속 학과 페이지로 이동합니다.</p>
          </div>

          <div className="border-t border-black" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium mb-1">회원 유형 선택</p>
              <div className="flex gap-4 border-2 border-black px-3 py-2">
                {(['student', 'professor', 'admin'] as const).map((t, i) => (
                  <label key={t} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="memberType"
                      value={t}
                      checked={memberType === t}
                      onChange={() => setMemberType(t)}
                      className="accent-black"
                    />
                    {['학생', '교수/조교', '관리자'][i]}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">아이디</label>
              <input
                type="text"
                placeholder="학번/교번 또는 아이디 입력"
                value={id}
                onChange={e => setId(e.target.value)}
                className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">비밀번호</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border-2 border-black px-3 py-2 pr-10 text-sm outline-none focus:bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.95 9.95 0 016.072 2.05M15 12a3 3 0 11-6 0 3 3 0 016 0zm4.243-4.243L4.757 19.243" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={saveId}
                onChange={e => setSaveId(e.target.checked)}
                className="accent-black w-4 h-4"
              />
              아이디 저장
            </label>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>
            )}

            <button type="submit" className="w-full bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition">
              로그인
            </button>
          </form>

          <div className="border-t border-gray-200" />

          <div className="flex justify-center gap-4 text-xs text-gray-500">
            <Link to="/signup" className="hover:text-black hover:underline">회원가입</Link>
            <span className="text-gray-300">|</span>
            <Link to="/find-id" className="hover:text-black hover:underline">아이디 찾기</Link>
            <span className="text-gray-300">|</span>
            <Link to="/find-password" className="hover:text-black hover:underline">비밀번호 찾기</Link>
          </div>

          <div className="bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500">
            <p className="font-medium text-gray-700 mb-1">⚠ 로그인 실패 시 메시지 예시</p>
            <ul className="list-disc list-inside space-y-1">
              <li>아이디 또는 비밀번호가 일치하지 않습니다.</li>
              <li>회원 유형이 일치하지 않습니다.</li>
              <li>관리자 승인 후 이용 가능합니다.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}
