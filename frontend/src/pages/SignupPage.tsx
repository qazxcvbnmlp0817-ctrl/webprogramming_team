import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

type MemberType = 'student' | 'staff' | 'admin'
type StaffRole = 'professor' | 'employee' | 'assistant' | ''

const STEP_LABELS = ['대학교 선택', '회원 유형 선택', '정보 입력', '가입 완료']

const COLLEGES: Record<string, string[]> = {
  mokpo: ['공과대학', '인문사회과학대학', '자연과학대학', '경영대학'],
  suncheon: ['공과대학', '인문예술대학', '자연과학대학', '농업생명과학대학'],
}

const DEPARTMENTS: Record<string, string[]> = {
  공과대학: ['컴퓨터공학과', '전기공학과', '기계공학과', '건축학과'],
  인문사회과학대학: ['국어국문학과', '영어영문학과', '사회학과', '행정학과'],
  자연과학대학: ['수학과', '물리학과', '화학과', '생물학과'],
  경영대학: ['경영학과', '회계학과', '국제통상학과'],
  인문예술대학: ['국어국문학과', '미술학과', '음악학과'],
  농업생명과학대학: ['식물산업과학과', '동물자원과학과'],
}

const EMPLOYEE_OFFICES = [
  '교무처', '학생취업처', '기획처', '산학연구처', '입학처',
  '국제협력처', '행정실', '사무국', '지역인재부총장', '직속위원회(사업단, 기관)',
]

export default function SignupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [selectedUniv, setSelectedUniv] = useState('')
  const [memberType, setMemberType] = useState<MemberType | ''>('')
  const [staffRole, setStaffRole] = useState<StaffRole>('')
  const [userId, setUserId] = useState('')
  const [idChecked, setIdChecked] = useState(false)
  const [pw, setPw] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [inputName, setInputName] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [employeeOffice, setEmployeeOffice] = useState('')
  const [studentId, setStudentId] = useState('')
  const [college, setCollege] = useState('')
  const [department, setDepartment] = useState('')
  const [grade, setGrade] = useState('')
  const [enrollmentStatus, setEnrollmentStatus] = useState('')
  const [submitError, setSubmitError] = useState('')

  const isAdmin    = memberType === 'admin'
  const isEmployee = memberType === 'staff' && staffRole === 'employee'

  useEffect(() => {
    setEmployeeId(''); setEmployeeOffice('')
    setStudentId(''); setCollege(''); setDepartment('')
    if (memberType !== 'student') { setGrade(''); setEnrollmentStatus('') }
    if (memberType !== 'staff')   { setStaffRole('') }
  }, [memberType])

  useEffect(() => {
    setEmployeeId(''); setEmployeeOffice('')
    setStudentId(''); setCollege(''); setDepartment('')
  }, [staffRole])

  useEffect(() => {
    if (enrollmentStatus === 'graduated') setGrade('')
  }, [enrollmentStatus])

  const step2Valid = () => {
    if (!memberType) return false
    if (memberType === 'staff' && !staffRole) return false
    return true
  }

  const step3Valid = () => {
    if (!userId || !idChecked) return false
    if (!pw || pw !== pwConfirm) return false
    if (!inputName) return false
    if (isEmployee) {
      if (!employeeId || !employeeOffice) return false
    } else if (!isAdmin) {
      if (!studentId || !college || !department) return false
      if (memberType === 'student' && !enrollmentStatus) return false
      if (memberType === 'student' && enrollmentStatus !== 'graduated' && !grade) return false
    }
    return true
  }

  const canNext = () => {
    if (step === 1) return selectedUniv !== ''
    if (step === 2) return step2Valid()
    if (step === 3) return step3Valid()
    return true
  }

  const checkDuplicate = async () => {
    if (!userId) { alert('아이디를 입력해주세요.'); return }
    try {
      const res = await fetch(`/api/auth/check-id?username=${userId}`)
      const result = await res.json()
      if (result.available) { alert('✅ 사용 가능한 아이디입니다.'); setIdChecked(true) }
      else { alert('❌ 이미 사용 중인 아이디입니다.'); setIdChecked(false) }
    } catch { alert('중복 확인 중 오류가 발생했습니다.') }
  }

  const handleSignup = async () => {
    setSubmitError('')
    const apiMemberType = memberType === 'staff' ? staffRole : memberType
    try {
      const payload = {
        username: userId, password: pw, name: inputName,
        memberType: apiMemberType,
        universityId: selectedUniv,
        college:      isEmployee || isAdmin ? null : college,
        department:   isEmployee ? employeeOffice : (isAdmin ? null : department),
        studentId:    isEmployee ? employeeId : (isAdmin ? null : studentId),
        grade:        memberType === 'student' && enrollmentStatus !== 'graduated' ? parseInt(grade) : null,
        enrollmentStatus: memberType === 'student' ? enrollmentStatus : null,
      }
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (result.success) setStep(4)
      else setSubmitError(result.message || '회원가입에 실패했습니다.')
    } catch { setSubmitError('서버 연결에 실패했습니다.') }
  }

  const handleNext = () => {
    if (!canNext()) return
    if (step === 3) handleSignup()
    else setStep(s => s + 1)
  }

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="min-h-screen pt-14 px-4 pb-12 bg-gray-50">
        <div className="max-w-xl mx-auto">

          {/* 스텝 표시 */}
          <div className="flex items-center justify-between py-6 overflow-x-auto gap-1">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex items-center gap-1 shrink-0">
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

            {/* STEP 1: 대학교 선택 */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold">01. 대학교 선택</h2>
                <p className="text-sm text-gray-500 -mt-2">소속 대학교를 선택해주세요.</p>
                <div className="grid grid-cols-2 gap-4">
                  {[{ id: 'mokpo', name: '국립목포대학교' }, { id: 'suncheon', name: '국립순천대학교' }].map(u => (
                    <div key={u.id} onClick={() => setSelectedUniv(u.id)}
                      className={`border-2 p-6 flex flex-col items-center gap-3 cursor-pointer transition-all
                        ${selectedUniv === u.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
                      <div className="w-14 h-14 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zM12 14v7M5 12v5a7 7 0 0014 0v-5" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-center">{u.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: 회원 유형 선택 */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold">02. 회원 유형 선택</h2>
                <p className="text-sm text-gray-500 -mt-2">회원 유형을 선택해주세요.</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'student' as MemberType, label: '학생' },
                    { value: 'staff'   as MemberType, label: '교직원' },
                    { value: 'admin'   as MemberType, label: '관리자' },
                  ].map(t => (
                    <div key={t.value} onClick={() => { setMemberType(t.value); setStaffRole('') }}
                      className={`border-2 p-6 flex flex-col items-center gap-3 cursor-pointer transition-all
                        ${memberType === t.value ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
                      <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold">{t.label}</span>
                    </div>
                  ))}
                </div>
                {memberType === 'staff' && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium mb-1">교직원 구분 <span className="text-red-500">*</span></label>
                    <select value={staffRole} onChange={e => setStaffRole(e.target.value as StaffRole)}
                      className="w-full border-2 border-black px-3 py-2 text-sm outline-none bg-white">
                      <option value="">선택해주세요</option>
                      <option value="professor">교수</option>
                      <option value="employee">직원</option>
                      <option value="assistant">조교</option>
                    </select>
                    {!staffRole && <p className="text-xs text-gray-400 mt-1">교직원 구분을 선택해야 다음 단계로 진행할 수 있습니다.</p>}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: 정보 입력 */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold">03. 정보 입력</h2>
                <p className="text-sm text-gray-500 -mt-2">회원 정보를 입력해주세요.</p>

                {/* 공통: 아이디 */}
                <div>
                  <label className="block text-sm font-medium mb-1">아이디</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="아이디 입력" value={userId}
                      onChange={e => { setUserId(e.target.value); setIdChecked(false) }}
                      className="flex-1 border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50" />
                    <button type="button" onClick={checkDuplicate}
                      className="border-2 border-black px-3 py-2 text-sm font-bold hover:bg-gray-50 whitespace-nowrap">중복 확인</button>
                  </div>
                  {idChecked && <p className="text-xs text-green-600 mt-1">✅ 사용 가능한 아이디입니다.</p>}
                </div>

                {/* 공통: 비밀번호 */}
                <div>
                  <label className="block text-sm font-medium mb-1">비밀번호</label>
                  <input type="password" placeholder="비밀번호 입력" value={pw} onChange={e => setPw(e.target.value)}
                    className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">비밀번호 확인</label>
                  <input type="password" placeholder="비밀번호 재입력" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)}
                    className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50" />
                  {pw && pwConfirm && pw !== pwConfirm && <p className="text-xs text-red-600 mt-1">비밀번호가 일치하지 않습니다.</p>}
                </div>

                {/* 공통: 이름 */}
                <div>
                  <label className="block text-sm font-medium mb-1">이름</label>
                  <input type="text" placeholder="이름 입력" value={inputName} onChange={e => setInputName(e.target.value)}
                    className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50" />
                </div>

                {/* 직원 전용: 교번 + 소속 부서 */}
                {isEmployee && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">교번</label>
                      <input type="text" placeholder="교번 입력" value={employeeId} onChange={e => setEmployeeId(e.target.value)}
                        className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">소속 부서</label>
                      <select value={employeeOffice} onChange={e => setEmployeeOffice(e.target.value)}
                        className="w-full border-2 border-black px-3 py-2 text-sm outline-none bg-white">
                        <option value="">선택해주세요</option>
                        {EMPLOYEE_OFFICES.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {/* 학생 / 교수 / 조교: 학번교번 + 단과대 + 학과 */}
                {!isAdmin && !isEmployee && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">학번 / 교번</label>
                      <input type="text" placeholder="학번 또는 교번 입력" value={studentId} onChange={e => setStudentId(e.target.value)}
                        className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">소속 단과대 / 학부</label>
                      <select value={college} onChange={e => { setCollege(e.target.value); setDepartment('') }}
                        className="w-full border-2 border-black px-3 py-2 text-sm outline-none bg-white">
                        <option value="">선택해주세요</option>
                        {selectedUniv && COLLEGES[selectedUniv]?.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">소속 학과</label>
                      <select value={department} onChange={e => setDepartment(e.target.value)} disabled={!college}
                        className="w-full border-2 border-black px-3 py-2 text-sm outline-none bg-white disabled:opacity-40">
                        <option value="">선택해주세요</option>
                        {college && DEPARTMENTS[college]?.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {/* 학생 전용: 재학 상태 + 학년 */}
                {memberType === 'student' && (
                  <div className="border-t border-gray-200 pt-4 flex flex-col gap-3">
                    <p className="text-sm font-medium text-gray-700">학생 정보 <span className="text-red-500">*</span></p>
                    <div>
                      <label className="block text-sm font-medium mb-1">재학 상태</label>
                      <select value={enrollmentStatus} onChange={e => setEnrollmentStatus(e.target.value)}
                        className="w-full border-2 border-black px-3 py-2 text-sm outline-none bg-white">
                        <option value="">선택해주세요</option>
                        <option value="freshman">신입생</option>
                        <option value="enrolled">재학생</option>
                        <option value="graduated">졸업생</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${enrollmentStatus === 'graduated' ? 'text-gray-300' : ''}`}>
                        학년
                        {enrollmentStatus === 'graduated' && <span className="ml-1 text-xs font-normal text-gray-400">(졸업생 해당 없음)</span>}
                      </label>
                      <select value={grade} onChange={e => setGrade(e.target.value)}
                        disabled={enrollmentStatus === 'graduated'}
                        className="w-full border-2 border-black px-3 py-2 text-sm outline-none bg-white disabled:opacity-30 disabled:cursor-not-allowed">
                        <option value="">선택해주세요</option>
                        <option value="1">1학년</option>
                        <option value="2">2학년</option>
                        <option value="3">3학년</option>
                        <option value="4">4학년</option>
                      </select>
                    </div>
                  </div>
                )}

                {submitError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">{submitError}</p>}
              </div>
            )}

            {/* STEP 4: 완료 */}
            {step === 4 && (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold">회원가입이 완료되었습니다!</h2>
                <p className="text-sm text-gray-500">로그인 후 서비스를 이용하실 수 있습니다.</p>
                <button onClick={() => navigate('/login')}
                  className="mt-2 bg-black text-white px-8 py-2.5 text-sm font-bold hover:opacity-80 transition">
                  로그인 페이지로 이동
                </button>
              </div>
            )}

            {step < 4 && (
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 justify-end">
                {step > 1 && (
                  <button onClick={() => setStep(s => s - 1)}
                    className="border-2 border-black px-6 py-2 text-sm font-bold hover:bg-gray-50 transition">이전</button>
                )}
                <button onClick={handleNext} disabled={!canNext()}
                  className="bg-black text-white px-6 py-2 text-sm font-bold hover:opacity-80 transition disabled:opacity-40 disabled:cursor-not-allowed">
                  {step === 3 ? '가입 완료' : '다음'}
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 bg-gray-50 border border-gray-200 px-5 py-4 text-xs text-gray-500">
            <p className="font-medium text-gray-700 mb-2">💡 안내사항</p>
            <ul className="list-disc list-inside space-y-1">
              <li>회원 유형에 따라 이용 가능한 서비스가 다를 수 있습니다.</li>
              <li>입력하신 정보는 회원 관리 및 서비스 제공 목적으로만 사용됩니다.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}
