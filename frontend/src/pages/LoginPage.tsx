import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useDept } from '../context/DeptContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setDept } = useDept()
  const [memberType, setMemberType] = useState<'student' | 'staff' | 'admin'>('student')
  const [staffRole, setStaffRole] = useState<'professor' | 'employee' | 'assistant' | ''>('')
  const [enrollmentStatus, setEnrollmentStatus] = useState('')
  const [id, setId] = useState(() => localStorage.getItem('savedId') ?? '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saveId, setSaveId] = useState(() => !!localStorage.getItem('savedId'))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!id.trim()) { setError('아이디를 입력해주세요.'); return }
    if (!password.trim()) { setError('비밀번호를 입력해주세요.'); return }
    if (memberType === 'student' && !enrollmentStatus) {
      setError('재학 상태를 선택해주세요.')
      return
    }
    if (memberType === 'staff' && !staffRole) {
      setError('교직원 구분을 선택해주세요.')
      return
    }

    setLoading(true)
    setError('')

    const apiMemberType = memberType === 'staff' ? staffRole : memberType

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: id, password, memberType: apiMemberType }),
      })

      if (!res.ok) {
        setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        return
      }

      const result = await res.json()

      if (result.success) {
        setError('')

        sessionStorage.setItem('isLoggedIn', 'true')
        sessionStorage.setItem('username', id)
        sessionStorage.setItem('memberType', apiMemberType)
        sessionStorage.setItem('name', result.name || id)
        sessionStorage.setItem('grade', result.grade != null ? String(result.grade) : '')
        sessionStorage.setItem('adminRole', result.adminRole ?? '')
        if (result.deptId != null) sessionStorage.setItem('deptId', String(result.deptId))
        else sessionStorage.removeItem('deptId')
        if (result.department)       sessionStorage.setItem('department', result.department)
        if (result.universityId)     sessionStorage.setItem('universityId', String(result.universityId))
        if (result.college)          sessionStorage.setItem('college', result.college)
        if (result.enrollmentStatus) sessionStorage.setItem('enrollmentStatus', result.enrollmentStatus)

        if (result.department || result.universityId) {
          setDept({
            selectedDeptId: result.deptId ?? null,
            selectedDeptName: result.department ?? null,
            selectedUniversityId: result.universityId ? Number(result.universityId) : null,
            selectedUniversityName: result.universityName ?? null,
            selectedSchoolName: result.college ?? null,
          })
        }

        if (saveId) {
          localStorage.setItem('savedId', id)
        } else {
          localStorage.removeItem('savedId')
        }

        window.dispatchEvent(new Event('loginChanged'))

        if (result.universityId) {
          navigate('/school/departments')
        } else {
          navigate('/universities')
        }
      } else {
        setError(result.message || '로그인에 실패했습니다.')
      }
    } catch {
      setError('서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.')
    } finally {
      setLoading(false)
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
                {(['student', 'staff', 'admin'] as const).map((t, i) => (
                  <label key={t} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="radio" name="memberType" value={t} checked={memberType === t}
                      onChange={() => { setMemberType(t); setEnrollmentStatus(''); setStaffRole('') }}
                      className="accent-black" />
                    {['학생', '교직원', '관리자'][i]}
                  </label>
                ))}
              </div>
            </div>

            {memberType === 'staff' && (
              <div>
                <label className="block text-sm font-medium mb-1">교직원 구분</label>
                <select
                  value={staffRole}
                  onChange={e => { setStaffRole(e.target.value as typeof staffRole); setError('') }}
                  className="w-full border-2 border-black px-3 py-2 text-sm outline-none bg-white"
                >
                  <option value="">선택해주세요</option>
                  <option value="professor">교수</option>
                  <option value="employee">직원</option>
                  <option value="assistant">조교</option>
                </select>
              </div>
            )}

            {memberType === 'student' && (
              <div>
                <label className="block text-sm font-medium mb-1">재학 상태</label>
                <select value={enrollmentStatus} onChange={e => { setEnrollmentStatus(e.target.value); setError('') }}
                  className="w-full border-2 border-black px-3 py-2 text-sm outline-none bg-white">
                  <option value="">선택해주세요</option>
                  <option value="freshman">신입생</option>
                  <option value="enrolled">재학생</option>
                  <option value="graduated">졸업생</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">아이디</label>
              <input type="text" placeholder="학번/교번 또는 아이디 입력" value={id}
                onChange={e => { setId(e.target.value); setError('') }}
                className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50"
                autoComplete="username" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">비밀번호</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="비밀번호 입력" value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  className="w-full border-2 border-black px-3 py-2 pr-10 text-sm outline-none focus:bg-gray-50"
                  autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
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
              <input type="checkbox" checked={saveId} onChange={e => setSaveId(e.target.checked)} className="accent-black w-4 h-4" />
              아이디 저장
            </label>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? '로그인 중...' : '로그인'}
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

        </div>
      </div>
    </div>
  )
}
