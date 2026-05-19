import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

type MemberType = 'student' | 'professor' | 'admin'

const STEP_LABELS = ['이용약관 동의', '대학교 선택', '회원 유형 선택', '본인 인증', '정보 입력', '가입 완료']

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

const registeredIds = new Set<string>()

export default function SignupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  const [allChecked, setAllChecked] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [terms, setTerms] = useState(false)
  const [thirdParty, setThirdParty] = useState(false)
  const [marketing, setMarketing] = useState(false)

  const [selectedUniv, setSelectedUniv] = useState('')
  const [memberType, setMemberType] = useState<MemberType | ''>('')
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone')
  const [authName, setAuthName] = useState('')
  const [phone, setPhone] = useState('')
  const [authCode, setAuthCode] = useState('')
  const [timerActive, setTimerActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(180)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [userId, setUserId] = useState('')
  const [pw, setPw] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [inputName, setInputName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [college, setCollege] = useState('')
  const [department, setDepartment] = useState('')

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000)
    } else if (timeLeft === 0) {
      setTimerActive(false)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerActive, timeLeft])

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const handleAllCheck = (v: boolean) => {
    setAllChecked(v); setPrivacy(v); setTerms(v); setThirdParty(v); setMarketing(v)
  }

  const handleOne = (key: 'privacy' | 'terms' | 'thirdParty' | 'marketing', v: boolean) => {
    const n = { privacy, terms, thirdParty, marketing, [key]: v }
    setPrivacy(n.privacy); setTerms(n.terms); setThirdParty(n.thirdParty); setMarketing(n.marketing)
    setAllChecked(n.privacy && n.terms && n.thirdParty && n.marketing)
  }

  const canNext = () => {
    if (step === 1) return privacy && terms && thirdParty
    if (step === 2) return selectedUniv !== ''
    if (step === 3) return memberType !== ''
    if (step === 4) return authName !== '' && phone !== '' && authCode !== ''
    if (step === 5) return !!(userId && pw && pw === pwConfirm && inputName && studentId && college && department)
    return true
  }

  const sendCode = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimeLeft(180)
    setTimerActive(true)
  }

  const checkDuplicate = async () => {
    if (!userId) { alert('아이디를 입력해주세요.'); return }
    try {
      const res = await fetch(`/api/auth/check-id?username=${userId}`)
      const result = await res.json()
      if (registeredIds.has(userId)) {
        alert('❌ 이미 사용 중인 아이디입니다.')
      } else if (result.available) {
        alert('✅ 사용 가능한 아이디입니다.')
      } else {
        alert('❌ 이미 사용 중인 아이디입니다.')
      }
    } catch {
      if (registeredIds.has(userId)) {
        alert('❌ 이미 사용 중인 아이디입니다.')
      } else {
        alert('✅ 사용 가능한 아이디입니다.')
      }
    }
  }

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="min-h-screen pt-14 px-4 pb-12 bg-gray-50">
        <div className="max-w-xl mx-auto">

          <div className="flex items-center justify-between py-6 overflow-x-auto gap-1">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex items-center gap-1 shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold
                    ${step > i + 1 ? 'bg-black border-black text-white' : step === i + 1 ? 'bg-black border-black text-white' : 'border-gray-300 text-gray-400'}`}>
                    {step > i + 1 ? '✓' : `0${i + 1}`}
                  </div>
                  <span className={`text-xs whitespace-nowrap ${step === i + 1 ? 'font-bold text-black' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
                {i < 5 && <span className={`text-sm mb-4 mx-1 ${step > i + 1 ? 'text-black' : 'text-gray-300'}`}>→</span>}
              </div>
            ))}
          </div>

          <div className="border-2 border-black bg-white p-8">

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold">01. 이용약관 동의</h2>
                <p className="text-sm text-gray-500 -mt-2">서비스 이용을 위해 아래 약관에 동의해주세요.</p>
                <div className="border border-gray-200 divide-y divide-gray-200">
                  <label className="flex items-center gap-3 px-4 py-3 cursor-pointer bg-gray-50">
                    <input type="checkbox" checked={allChecked} onChange={e => handleAllCheck(e.target.checked)} className="accent-black w-4 h-4" />
                    <span className="text-sm font-bold">전체 동의</span>
                  </label>
                  {[
                    { key: 'privacy' as const, label: '[필수] 개인정보 수집 및 이용 동의', val: privacy },
                    { key: 'terms' as const, label: '[필수] 서비스 이용약관 동의', val: terms },
                    { key: 'thirdParty' as const, label: '[필수] 제3자 제공 동의', val: thirdParty },
                    { key: 'marketing' as const, label: '[선택] 마케팅 수신 동의', val: marketing },
                  ].map(({ key, label, val }) => (
                    <label key={key} className="flex items-center gap-3 px-4 py-3 cursor-pointer">
                      <input type="checkbox" checked={val} onChange={e => handleOne(key, e.target.checked)} className="accent-black w-4 h-4" />
                      <span className="text-sm flex-1">{label}</span>
                      <button type="button" className="text-xs border border-gray-300 px-2 py-0.5 text-gray-500">보기</button>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold">02. 대학교 선택</h2>
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

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold">03. 회원 유형 선택</h2>
                <p className="text-sm text-gray-500 -mt-2">회원 유형을 선택해주세요.</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'student' as MemberType, label: '학생' },
                    { value: 'professor' as MemberType, label: '교수 / 조교' },
                    { value: 'admin' as MemberType, label: '관리자' },
                  ].map(t => (
                    <div key={t.value} onClick={() => setMemberType(t.value)}
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
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold">04. 본인 인증</h2>
                <p className="text-sm text-gray-500 -mt-2">본인 인증 방법을 선택해주세요.</p>
                <div className="flex border-2 border-black">
                  {(['phone', 'email'] as const).map(m => (
                    <button key={m} type="button" onClick={() => setAuthMethod(m)}
                      className={`flex-1 py-2 text-sm font-bold transition-all
                        ${authMethod === m ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}>
                      {m === 'phone' ? '휴대폰 인증' : '이메일 인증'}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">이름</label>
                  <input type="text" placeholder="이름 입력" value={authName} onChange={e => setAuthName(e.target.value)}
                    className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">휴대폰 번호</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="- 제외하고 입력" value={phone} onChange={e => setPhone(e.target.value)}
                      className="flex-1 border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50" />
                    <button type="button" onClick={sendCode}
                      className="border-2 border-black px-3 py-2 text-sm font-bold hover:bg-gray-50 whitespace-nowrap">
                      인증번호 발송
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">인증번호</label>
                  <div className="relative">
                    <input type="text" placeholder="인증번호 입력" value={authCode} onChange={e => setAuthCode(e.target.value)}
                      className="w-full border-2 border-black px-3 py-2 pr-20 text-sm outline-none focus:bg-gray-50" />
                    {timerActive && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-red-600">
                        {fmt(timeLeft)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold">05. 정보 입력</h2>
                <p className="text-sm text-gray-500 -mt-2">회원 정보를 입력해주세요.</p>
                <div>
                  <label className="block text-sm font-medium mb-1">아이디</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="아이디 입력" value={userId} onChange={e => setUserId(e.target.value)}
                      className="flex-1 border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50" />
                    <button type="button" onClick={checkDuplicate}
                      className="border-2 border-black px-3 py-2 text-sm font-bold hover:bg-gray-50 whitespace-nowrap">
                      중복 확인
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">비밀번호</label>
                  <input type="password" placeholder="비밀번호 입력" value={pw} onChange={e => setPw(e.target.value)}
                    className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">비밀번호 확인</label>
                  <input type="password" placeholder="비밀번호 재입력" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)}
                    className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50" />
                  {pw && pwConfirm && pw !== pwConfirm && (
                    <p className="text-xs text-red-600 mt-1">비밀번호가 일치하지 않습니다.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">이름</label>
                  <input type="text" placeholder="이름 입력" value={inputName} onChange={e => setInputName(e.target.value)}
                    className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50" />
                </div>
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
              </div>
            )}

            {step === 6 && (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold">회원가입이 완료되었습니다!</h2>
                <p className="text-sm text-gray-500">로그인 후 서비스를 이용하실 수 있습니다.</p>
                <button
                  onClick={() => {
                    registeredIds.add(userId)
                    navigate('/login')
                  }}
                  className="mt-2 bg-black text-white px-8 py-2.5 text-sm font-bold hover:opacity-80 transition">
                  로그인 페이지로 이동
                </button>
              </div>
            )}

            {step < 6 && (
              <div className={`flex gap-3 mt-8 pt-6 border-t border-gray-200 ${step === 1 ? 'justify-center' : 'justify-end'}`}>
                {step > 1 && (
                  <button onClick={() => setStep(s => s - 1)}
                    className="border-2 border-black px-6 py-2 text-sm font-bold hover:bg-gray-50 transition">
                    이전
                  </button>
                )}
                <button onClick={() => { if (canNext()) setStep(s => s + 1) }} disabled={!canNext()}
                  className="bg-black text-white px-6 py-2 text-sm font-bold hover:opacity-80 transition disabled:opacity-40 disabled:cursor-not-allowed">
                  다음
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 bg-gray-50 border border-gray-200 px-5 py-4 text-xs text-gray-500">
            <p className="font-medium text-gray-700 mb-2">💡 안내사항</p>
            <ul className="list-disc list-inside space-y-1">
              <li>회원 유형에 따라 이용 가능한 서비스가 다를 수 있습니다.</li>
              <li>본인 인증이 완료되어야 회원가입이 진행됩니다.</li>
              <li>입력하신 정보는 회원 관리 및 서비스 제공 목적으로만 사용됩니다.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}
