import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useDept } from '../context/DeptContext'
import { setAuthItem, clearAuthStorage } from '../utils/authStorage'

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useState(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  })
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in-down">
      <div className="bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-lg shadow-xl flex items-center gap-2">
        <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        {message}
      </div>
    </div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { setDept } = useDept()

  const [memberType, setMemberType] = useState<'student' | 'staff' | 'admin'>('student')
  const [staffRole, setStaffRole] = useState<'professor' | 'employee' | 'assistant' | ''>('')
  const [id, setId] = useState(() => localStorage.getItem('savedId') ?? '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saveId, setSaveId] = useState(() => !!localStorage.getItem('savedId'))
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!id.trim())       { setError('아이디를 입력해주세요.'); return }
    if (!password.trim()) { setError('비밀번호를 입력해주세요.'); return }
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

        // setDept()가 deptState를 덮어쓰기 전에 먼저 읽어야 올바른 이전 선택 정보를 보존
        const savedDeptState = (() => {
          try { return JSON.parse(localStorage.getItem('deptState') || '{}') } catch { return {} }
        })()

        clearAuthStorage()

        setAuthItem('isLoggedIn',  'true',                rememberMe)
        setAuthItem('username',    id,                    rememberMe)
        setAuthItem('memberType',  String(apiMemberType), rememberMe)
        setAuthItem('name',        result.name || id,     rememberMe)
        if (result.department)       setAuthItem('department',       result.department,              rememberMe)
        if (result.universityId)     setAuthItem('universityId',     String(result.universityId),    rememberMe)
        if (result.college)          setAuthItem('college',          result.college,                 rememberMe)
        if (result.grade != null)    setAuthItem('grade',            String(result.grade),           rememberMe)
        if (result.enrollmentStatus) setAuthItem('enrollmentStatus', result.enrollmentStatus,        rememberMe)
        if (result.adminRole)        setAuthItem('adminRole',        result.adminRole,               rememberMe)
        if (result.deptId)           setAuthItem('deptId',           String(result.deptId),          rememberMe)
        if (result.facultyId)        setAuthItem('facultyId',        String(result.facultyId),        rememberMe)

        if (result.department || result.universityId) {
          setDept({
            selectedDeptId:         result.deptId        ?? null,
            selectedDeptName:       result.department    ?? null,
            selectedUniversityId:   result.universityId  ? Number(result.universityId) : null,
            selectedUniversityName: result.universityName ?? null,
            selectedSchoolName:     result.college       ?? null,
          })
        }

        if (saveId) {
          localStorage.setItem('savedId', id)
        } else {
          localStorage.removeItem('savedId')
        }

        window.dispatchEvent(new Event('loginChanged'))

        const displayName = result.name || id
        setToastMsg(`${displayName}님 환영합니다!`)

        const doNavigate = () => {
          if (result.deptId) {
            // API가 학과 정보를 돌려준 경우 → 학과 홈으로 이동
            setDept({
              selectedDeptId:         result.deptId        ?? null,
              selectedDeptName:       result.department    ?? null,
              selectedUniversityId:   Number(result.universityId),
              selectedUniversityName: result.universityName ?? null,
              selectedSchoolName:     result.college       ?? null,
            })
            navigate('/dept/home')
          } else if (result.universityId) {
            // API가 대학교 정보를 돌려준 경우 → 학과 선택 페이지로 이동
            setDept({
              selectedDeptId:         null,
              selectedDeptName:       result.department    ?? null,
              selectedUniversityId:   Number(result.universityId),
              selectedUniversityName: result.universityName ?? null,
              selectedSchoolName:     result.college       ?? null,
            })
            navigate('/school/departments')
          } else if (savedDeptState.selectedDeptId) {
            // 로그인 전에 학과를 선택해 둔 경우 → 학과 홈으로 이동 (DeptContext 복원 필수)
            setDept(savedDeptState)
            navigate('/dept/home')
          } else if (savedDeptState.selectedUniversityId) {
            // 로그인 전에 대학교를 선택해 둔 경우 → 학과 선택 메인페이지로 이동 (DeptContext 복원 필수)
            setDept(savedDeptState)
            navigate('/school/departments')
          } else {
            navigate('/universities')
          }
        }

        setTimeout(doNavigate, 600)

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
      {toastMsg && <Toast message={toastMsg} onDone={() => setToastMsg('')} />}

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
                    <input
                      type="radio"
                      name="memberType"
                      value={t}
                      checked={memberType === t}
                      onChange={() => { setMemberType(t); setStaffRole('') }}
                      className="accent-black"
                    />
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

            <div>
              <label className="block text-sm font-medium mb-1">아이디</label>
              <input
                type="text"
                placeholder="학번/교번 또는 아이디 입력"
                value={id}
                onChange={e => { setId(e.target.value); setError('') }}
                className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">비밀번호</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  className="w-full border-2 border-black px-3 py-2 pr-10 text-sm outline-none focus:bg-gray-50"
                  autoComplete="current-password"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveId}
                  onChange={e => setSaveId(e.target.checked)}
                  className="accent-black w-4 h-4"
                />
                아이디 저장
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="accent-black w-4 h-4"
                />
                자동 로그인 유지
              </label>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
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
