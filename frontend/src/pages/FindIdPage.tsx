import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const STEP_LABELS = ['본인 확인', '아이디 확인', '완료']

const COLLEGES: Record<string, string[]> = {
  mokpo: ['공과대학', '인문사회과학대학', '자연과학대학', '경영대학'],
  suncheon: ['공과대학', '인문예술대학', '자연과학대학', '농업생명과학대학'],
}

const EMPLOYEE_OFFICES = [
  '교무처', '학생취업처', '기획처', '산학연구처', '입학처',
  '국제협력처', '행정실', '사무국', '지역인재부총장', '직속위원회(사업단, 기관)',
]

export default function FindIdPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [memberType, setMemberType] = useState<'student' | 'staff' | 'admin'>('student')
  const [staffRole, setStaffRole] = useState<'professor' | 'employee' | 'assistant' | ''>('')
  const [name, setName] = useState('')
  const [univ, setUniv] = useState('')
  const [college, setCollege] = useState('')
  const [studentId, setStudentId] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [employeeOffice, setEmployeeOffice] = useState('')
  const [grade, setGrade] = useState('')
  const [foundId, setFoundId] = useState('')
  const [error, setError] = useState('')

  const isAdmin    = memberType === 'admin'
  const isEmployee = memberType === 'staff' && staffRole === 'employee'
  const isStaffNonEmployee = memberType === 'staff' && (staffRole === 'professor' || staffRole === 'assistant')

  const reset = () => {
    setStaffRole(''); setGrade(''); setUniv(''); setCollege('')
    setStudentId(''); setEmployeeId(''); setEmployeeOffice(''); setError('')
  }

  const handleConfirm = async () => {
    if (!name) { setError('이름을 입력해주세요.'); return }
    if (memberType === 'staff' && !staffRole) { setError('교직원 구분을 선택해주세요.'); return }
    if (isEmployee && (!employeeId || !employeeOffice)) { setError('교번과 소속 부서를 입력해주세요.'); return }
    if (!isAdmin && !isEmployee && (!univ || !college || !studentId)) { setError('소속 대학, 단과대, 학번/교번을 모두 입력해주세요.'); return }

    try {
      const res = await fetch('/api/auth/find-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          universityId: isAdmin || isEmployee ? null : univ,
          college: isAdmin || isEmployee ? null : college,
          studentId: isEmployee ? employeeId : (isAdmin ? null : studentId),
          grade: memberType === 'student' ? grade : null,
        }),
      })
      const result = await res.json()
      if (result.success) { setFoundId(result.username); setError(''); setStep(2) }
      else setError(result.message || '일치하는 정보가 없습니다.')
    } catch { setError('서버 연결에 실패했습니다.') }
  }

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
                    {memberType === 'student' && (
                      <div>
                        <label className="block text-sm font-medium mb-1">학년</label>
                        <select value={grade} onChange={e => setGrade(e.target.value)}
                          className="w-full border-2 border-black px-3 py-2 text-sm outline-none bg-white">
                          <option value="">선택해주세요</option>
                          <option value="1">1학년</option>
                          <option value="2">2학년</option>
                          <option value="3">3학년</option>
                          <option value="4">4학년</option>
                        </select>
                      </div>
                    )}
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
                <button onClick={handleConfirm}
                  className="w-full bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition mt-2">확인</button>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col items-center gap-6 py-6">
                <h2 className="text-lg font-bold self-start">02. 아이디 확인</h2>
                <p className="text-sm text-gray-500 self-start -mt-4">회원님의 아이디는 아래와 같습니다.</p>
                <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="w-full border border-gray-200 p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">아이디</p>
                  <p className="text-2xl font-bold">{foundId}</p>
                </div>
                <button onClick={() => setStep(3)} className="w-full bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition">다음</button>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center gap-6 py-10 text-center">
                <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold">아이디 찾기가 완료되었습니다.</h2>
                <p className="text-sm text-gray-500">확인된 아이디로 로그인해주세요.</p>
                <button onClick={() => navigate('/login')} className="w-full bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition">로그인 페이지로 이동</button>
              </div>
            )}
          </div>

          <div className="mt-4 bg-gray-50 border border-gray-200 px-5 py-4 text-xs text-gray-500">
            <p className="font-medium text-gray-700 mb-2">💡 아이디 찾기 이용 안내</p>
            <ul className="list-disc list-inside space-y-1">
              <li>관리자는 이름만으로 아이디를 찾을 수 있습니다.</li>
              <li>학생/교수/조교는 소속 대학, 단과대, 학번/교번이 일치해야 합니다.</li>
              <li>직원은 교번과 소속 부서가 일치해야 합니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
