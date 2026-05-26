import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const STEP_LABELS = ['본인 확인', '새 비밀번호 설정', '완료']

const COLLEGES: Record<string, string[]> = {
  mokpo: ['공과대학', '인문사회과학대학', '자연과학대학', '경영대학'],
  suncheon: ['공과대학', '인문예술대학', '자연과학대학', '농업생명과학대학'],
}

const EMPLOYEE_OFFICES = [
  '교무처', '학생취업처', '기획처', '산학연구처', '입학처',
  '국제협력처', '행정실', '사무국', '지역인재부총장', '직속위원회(사업단, 기관)',
]

export default function FindPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [memberType, setMemberType] = useState<'student' | 'staff' | 'admin'>('student')
  const [staffRole, setStaffRole] = useState<'professor' | 'employee' | 'assistant' | ''>('')
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [univ, setUniv] = useState('')
  const [college, setCollege] = useState('')
  const [studentId, setStudentId] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [employeeOffice, setEmployeeOffice] = useState('')
  const [newPw, setNewPw] = useState('')
  const [newPwConfirm, setNewPwConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showPwConfirm, setShowPwConfirm] = useState(false)
  const [error, setError] = useState('')

  const isAdmin    = memberType === 'admin'
  const isEmployee = memberType === 'staff' && staffRole === 'employee'
  const isStaffNonEmployee = memberType === 'staff' && (staffRole === 'professor' || staffRole === 'assistant')

  const reset = () => {
    setStaffRole(''); setUniv(''); setCollege('')
    setStudentId(''); setEmployeeId(''); setEmployeeOffice(''); setError('')
  }

  const handleStep1 = async () => {
    if (!username || !name) { setError('아이디와 이름을 입력해주세요.'); return }
    if (memberType === 'staff' && !staffRole) { setError('교직원 구분을 선택해주세요.'); return }
    if (isEmployee && (!employeeId || !employeeOffice)) { setError('교번과 소속 부서를 입력해주세요.'); return }
    if (!isAdmin && !isEmployee && (!univ || !college || !studentId)) { setError('소속 대학, 단과대, 학번/교번을 모두 입력해주세요.'); return }

    try {
      const res = await fetch('/api/auth/find-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username, name,
          universityId: isAdmin || isEmployee ? null : univ,
          college: isAdmin || isEmployee ? null : college,
          studentId: isEmployee ? employeeId : (isAdmin ? null : studentId),
        }),
      })
      const result = await res.json()
      if (result.success) { setError(''); setStep(2) }
      else setError(result.message || '일치하는 정보가 없습니다.')
    } catch { setError('서버 연결에 실패했습니다.') }
  }

  const handleStep2 = async () => {
    if (!newPw || !newPwConfirm) { setError('비밀번호를 입력해주세요.'); return }
    if (newPw !== newPwConfirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    if (newPw.length < 8) { setError('비밀번호는 8자 이상이어야 합니다.'); return }
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, newPassword: newPw }),
      })
      const result = await res.json()
      if (result.success) { setError(''); setStep(3) }
      else setError(result.message || '비밀번호 변경에 실패했습니다.')
    } catch { setError('서버 연결에 실패했습니다.') }
  }

  const eyeOn = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.95 9.95 0 016.072 2.05M15 12a3 3 0 11-6 0 3 3 0 016 0zm4.243-4.243L4.757 19.243" />
    </svg>
  )
  const eyeOff = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="min-h-screen pt-14 px-4 pb-12 bg-gray-50">
        <div className="max-w-xl mx-auto">

          {/* 스텝 표시 */}
          <div className="flex items-center justify-center py-8 gap-2">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold
                    ${step > i+1 ? 'bg-black border-black text-white' : step === i+1 ? 'bg-black border-black text-white' : 'border-gray-300 text-gray-400'}`}>
                    {step > i+1 ? '✓' : `0${i+1}`}
                  </div>
                  <span className={`text-xs whitespace-nowrap ${step === i+1 ? 'font-bold text-black' : 'text-gray-400'}`}>{label}</span>
                </div>
                {i < STEP_LABELS.length-1 && <span className={`text-sm mb-4 mx-1 ${step > i+1 ? 'text-black' : 'text-gray-300'}`}>→</span>}
              </div>
            ))}
          </div>

          <div className="border-2 border-black bg-white p-8">

            {/* STEP 1 */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold">01. 본인 확인</h2>
                <p className="text-sm text-gray-500 -mt-2">회원가입 시 등록한 정보를 입력해주세요.</p>

                {/* 회원 유형 선택 */}
                <div>
                  <p className="text-sm font-medium mb-2">회원 유형</p>
                  <div className="flex gap-2">
                    {([
                      { value: 'student' as const, label: '학생' },
                      { value: 'staff'   as const, label: '교직원' },
                      { value: 'admin'   as const, label: '관리자' },
                    ]).map(t => (
                      <button key={t.value} type="button"
                        onClick={() => { setMemberType(t.value); reset() }}
                        className={`flex-1 py-2 text-sm font-bold border-2 transition
                          ${memberType === t.value ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:border-black'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 교직원 구분 드롭다운 */}
                {memberType === 'staff' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">교직원 구분</label>
                    <select value={staffRole}
                      onChange={e => { setStaffRole(e.target.value as typeof staffRole); setEmployeeId(''); setEmployeeOffice(''); setError('') }}
                      className="w-full border-2 border-black px-3 py-2 text-sm outline-none bg-white">
                      <option value="">선택해주세요</option>
                      <option value="professor">교수</option>
                      <option value="employee">직원</option>
                      <option value="assistant">조교</option>
                    </select>
                  </div>
                )}

                {/* 아이디 */}
                <div>
                  <label className="block text-sm font-medium mb-1">아이디</label>
                  <input type="text" placeholder="아이디 입력" value={username}
                    onChange={e => { setUsername(e.target.value); setError('') }}
                    className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50" />
                </div>

                {/* 이름 */}
                <div>
                  <label className="block text-sm font-medium mb-1">이름</label>
                  <input type="text" placeholder="이름 입력" value={name}
                    onChange={e => { setName(e.target.value); setError('') }}
                    className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50" />
                </div>

                {/* 학생 / 교수 / 조교: 소속 대학, 단과대, 학번 */}
                {(memberType === 'student' || isStaffNonEmployee) && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">소속 대학</label>
                      <select value={univ} onChange={e => { setUniv(e.target.value); setCollege(''); setError('') }}
                        className="w-full border-2 border-black px-3 py-2 text-sm outline-none bg-white">
                        <option value="">선택해주세요</option>
                        <option value="mokpo">국립목포대학교</option>
                        <option value="suncheon">국립순천대학교</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">소속 단과대 / 학부</label>
                      <select value={college} onChange={e => { setCollege(e.target.value); setError('') }} disabled={!univ}
                        className="w-full border-2 border-black px-3 py-2 text-sm outline-none bg-white disabled:opacity-40">
                        <option value="">선택해주세요</option>
                        {univ && COLLEGES[univ]?.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">학번 / 교번</label>
                      <input type="text" placeholder="학번 또는 교번 입력" value={studentId}
                        onChange={e => { setStudentId(e.target.value); setError('') }}
                        className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50" />
                    </div>
                  </>
                )}

                {/* 직원: 교번 + 소속 부서 드롭다운 */}
                {isEmployee && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">교번</label>
                      <input type="text" placeholder="교번 입력" value={employeeId}
                        onChange={e => { setEmployeeId(e.target.value); setError('') }}
                        className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">소속 부서</label>
                      <select value={employeeOffice} onChange={e => { setEmployeeOffice(e.target.value); setError('') }}
                        className="w-full border-2 border-black px-3 py-2 text-sm outline-none bg-white">
                        <option value="">선택해주세요</option>
                        {EMPLOYEE_OFFICES.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}
                <button onClick={handleStep1}
                  className="w-full bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition mt-2">확인</button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold">02. 새 비밀번호 설정</h2>
                <p className="text-sm text-gray-500 -mt-2">새로운 비밀번호를 입력해주세요.</p>
                <div>
                  <label className="block text-sm font-medium mb-1">새 비밀번호</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} placeholder="비밀번호 입력" value={newPw}
                      onChange={e => { setNewPw(e.target.value); setError('') }}
                      className="w-full border-2 border-black px-3 py-2 pr-10 text-sm outline-none focus:bg-gray-50" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                      {showPw ? eyeOn : eyeOff}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">새 비밀번호 확인</label>
                  <div className="relative">
                    <input type={showPwConfirm ? 'text' : 'password'} placeholder="비밀번호 다시 입력" value={newPwConfirm}
                      onChange={e => { setNewPwConfirm(e.target.value); setError('') }}
                      className="w-full border-2 border-black px-3 py-2 pr-10 text-sm outline-none focus:bg-gray-50" />
                    <button type="button" onClick={() => setShowPwConfirm(!showPwConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                      {showPwConfirm ? eyeOn : eyeOff}
                    </button>
                  </div>
                  {newPw && newPwConfirm && newPw !== newPwConfirm && (
                    <p className="text-xs text-red-600 mt-1">비밀번호가 일치하지 않습니다.</p>
                  )}
                </div>
                <div className="bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500">
                  <p className="font-medium text-gray-700 mb-1">비밀번호 안내</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>8자 이상 16자 이하</li>
                    <li>영문, 숫자, 특수문자를 포함하는 것을 권장합니다.</li>
                  </ul>
                </div>
                {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setStep(1)} className="flex-1 border-2 border-black py-2.5 text-sm font-bold hover:bg-gray-50 transition">이전</button>
                  <button onClick={handleStep2} className="flex-1 bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition">변경 완료</button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="flex flex-col items-center gap-6 py-10 text-center">
                <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold">비밀번호 변경이 완료되었습니다.</h2>
                <p className="text-sm text-gray-500">새로운 비밀번호로 로그인해주세요.</p>
                <button onClick={() => navigate('/login')} className="w-full bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition">로그인 페이지로 이동</button>
              </div>
            )}
          </div>

          <div className="mt-4 bg-gray-50 border border-gray-200 px-5 py-4 text-xs text-gray-500">
            <p className="font-medium text-gray-700 mb-2">💡 비밀번호 찾기 이용 안내</p>
            <ul className="list-disc list-inside space-y-1">
              <li>아이디, 이름, 가입 정보가 일치해야 비밀번호를 변경할 수 있습니다.</li>
              <li>비밀번호 변경 후 기존 비밀번호는 사용할 수 없습니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
