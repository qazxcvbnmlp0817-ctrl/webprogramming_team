import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const STEP_LABELS = ['본인 확인', '인증', '새 비밀번호 설정', '완료']

export default function FindPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [memberType, setMemberType] = useState<'student' | 'professor' | 'admin'>('student')
  const [name, setName] = useState('')
  const [univ, setUniv] = useState('')
  const [college, setCollege] = useState('')
  const [studentId, setStudentId] = useState('')
  const [phone1, setPhone1] = useState('')
  const [phone2, setPhone2] = useState('')
  const [phone3, setPhone3] = useState('')
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone')
  const [authCode, setAuthCode] = useState('')
  const [timerActive, setTimerActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(180)
  const [newPw, setNewPw] = useState('')
  const [newPwConfirm, setNewPwConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showPwConfirm, setShowPwConfirm] = useState(false)
  const [error, setError] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

  const sendCode = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimeLeft(180)
    setTimerActive(true)
  }

  const handleStep1 = () => {
    if (!name || !phone1 || !phone2 || !phone3) {
      setError('모든 항목을 입력해주세요.')
      return
    }
    setError('')
    setStep(2)
  }

  const handleStep2 = () => {
    if (!authCode) {
      setError('인증번호를 입력해주세요.')
      return
    }
    setError('')
    setStep(3)
  }

  const handleStep3 = async () => {
    if (!newPw || !newPwConfirm) {
      setError('비밀번호를 입력해주세요.')
      return
    }
    if (newPw !== newPwConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (newPw.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }
    setError('')
    setStep(4)
  }

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="min-h-screen pt-14 px-4 pb-12 bg-gray-50">
        <div className="max-w-xl mx-auto">

          <div className="flex items-center justify-center py-8 gap-2">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold
                    ${step > i + 1 ? 'bg-black border-black text-white' : step === i + 1 ? 'bg-black border-black text-white' : 'border-gray-300 text-gray-400'}`}>
                    {step > i + 1 ? '✓' : `0${i + 1}`}
                  </div>
                  <span className={`text-xs whitespace-nowrap ${step === i + 1 ? 'font-bold text-black' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <span className={`text-sm mb-4 mx-1 ${step > i + 1 ? 'text-black' : 'text-gray-300'}`}>→</span>
                )}
              </div>
            ))}
          </div>

          <div className="border-2 border-black bg-white p-8">

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold">01. 본인 확인</h2>
                <p className="text-sm text-gray-500 -mt-2">회원가입 시 등록한 정보를 입력해주세요.</p>

                <div>
                  <p className="text-sm font-medium mb-2">회원 유형</p>
                  <div className="flex gap-2">
                    {([
                      { value: 'student', label: '학생' },
                      { value: 'professor', label: '교수/조교' },
                      { value: 'admin', label: '관리자' },
                    ] as const).map(t => (
                      <button key={t.value} type="button" onClick={() => setMemberType(t.value)}
                        className={`flex-1 py-2 text-sm font-bold border-2 transition
                          ${memberType === t.value ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:border-black'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">이름</label>
                  <input type="text" placeholder="이름 입력" value={name} onChange={e => setName(e.target.value)}
                    className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">소속 대학</label>
                  <select value={univ} onChange={e => { setUniv(e.target.value); setCollege('') }}
                    className="w-full border-2 border-black px-3 py-2 text-sm outline-none bg-white">
                    <option value="">선택해주세요</option>
                    <option value="mokpo">국립목포대학교</option>
                    <option value="suncheon">국립순천대학교</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">학과 / 학부</label>
                  <select value={college} onChange={e => setCollege(e.target.value)}
                    className="w-full border-2 border-black px-3 py-2 text-sm outline-none bg-white" disabled={!univ}>
                    <option value="">선택해주세요</option>
                    {univ === 'mokpo' && ['공과대학', '인문사회과학대학', '자연과학대학', '경영대학'].map(c => <option key={c} value={c}>{c}</option>)}
                    {univ === 'suncheon' && ['공과대학', '인문예술대학', '자연과학대학', '농업생명과학대학'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">학번</label>
                  <input type="text" placeholder="학번 입력" value={studentId} onChange={e => setStudentId(e.target.value)}
                    className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">휴대폰 번호</label>
                  <div className="flex gap-2 items-center">
                    <input type="text" maxLength={3} placeholder="010" value={phone1} onChange={e => setPhone1(e.target.value)}
                      className="w-20 border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50 text-center" />
                    <span>-</span>
                    <input type="text" maxLength={4} placeholder="0000" value={phone2} onChange={e => setPhone2(e.target.value)}
                      className="w-24 border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50 text-center" />
                    <span>-</span>
                    <input type="text" maxLength={4} placeholder="0000" value={phone3} onChange={e => setPhone3(e.target.value)}
                      className="w-24 border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50 text-center" />
                  </div>
                </div>

                {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}

                <button onClick={handleStep1}
                  className="w-full bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition mt-2">
                  확인
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold">02. 인증</h2>
                <p className="text-sm text-gray-500 -mt-2">본인 인증 방법을 선택해주세요.</p>

                <div className="flex border-2 border-black">
                  {(['phone', 'email'] as const).map(m => (
                    <button key={m} type="button" onClick={() => setAuthMethod(m)}
                      className={`flex-1 py-2 text-sm font-bold transition
                        ${authMethod === m ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}>
                      {m === 'phone' ? '휴대폰 인증' : '이메일 인증'}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">휴대폰 번호</label>
                  <div className="flex gap-2 items-center">
                    <input type="text" maxLength={3} placeholder="010" value={phone1}
                      className="w-20 border-2 border-black px-3 py-2 text-sm outline-none bg-gray-50 text-center" readOnly />
                    <span>-</span>
                    <input type="text" maxLength={4} placeholder="0000" value={phone2}
                      className="w-24 border-2 border-black px-3 py-2 text-sm outline-none bg-gray-50 text-center" readOnly />
                    <span>-</span>
                    <input type="text" maxLength={4} placeholder="0000" value={phone3}
                      className="w-24 border-2 border-black px-3 py-2 text-sm outline-none bg-gray-50 text-center" readOnly />
                    <button type="button" onClick={sendCode}
                      className="border-2 border-black px-3 py-2 text-sm font-bold hover:bg-gray-50 whitespace-nowrap">
                      인증번호 발송
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">인증번호 입력</label>
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

                {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}

                <div className="flex gap-3 mt-2">
                  <button onClick={() => setStep(1)}
                    className="flex-1 border-2 border-black py-2.5 text-sm font-bold hover:bg-gray-50 transition">
                    이전
                  </button>
                  <button onClick={handleStep2}
                    className="flex-1 bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition">
                    다음
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold">03. 새 비밀번호 설정</h2>
                <p className="text-sm text-gray-500 -mt-2">새로운 비밀번호를 입력해주세요.</p>

                <div>
                  <label className="block text-sm font-medium mb-1">새 비밀번호</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="비밀번호 입력"
                      value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      className="w-full border-2 border-black px-3 py-2 pr-10 text-sm outline-none focus:bg-gray-50"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                      {showPw ? (
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

                <div>
                  <label className="block text-sm font-medium mb-1">새 비밀번호 확인</label>
                  <div className="relative">
                    <input
                      type={showPwConfirm ? 'text' : 'password'}
                      placeholder="비밀번호 다시 입력"
                      value={newPwConfirm}
                      onChange={e => setNewPwConfirm(e.target.value)}
                      className="w-full border-2 border-black px-3 py-2 pr-10 text-sm outline-none focus:bg-gray-50"
                    />
                    <button type="button" onClick={() => setShowPwConfirm(!showPwConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                      {showPwConfirm ? (
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
                  {newPw && newPwConfirm && newPw !== newPwConfirm && (
                    <p className="text-xs text-red-600 mt-1">비밀번호가 일치하지 않습니다.</p>
                  )}
                </div>

                <div className="bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500">
                  <p className="font-medium text-gray-700 mb-1">비밀번호 안내</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>8자 이상 16자 이하</li>
                    <li>영문, 숫자, 특수문자를 포함해야 합니다.</li>
                    <li>연속된 숫자 및 문자 사용 불가</li>
                  </ul>
                </div>

                {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}

                <div className="flex gap-3 mt-2">
                  <button onClick={() => setStep(2)}
                    className="flex-1 border-2 border-black py-2.5 text-sm font-bold hover:bg-gray-50 transition">
                    이전
                  </button>
                  <button onClick={handleStep3}
                    className="flex-1 bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition">
                    확인
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col items-center gap-6 py-10 text-center">
                <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold">비밀번호 변경이 완료되었습니다.</h2>
                <p className="text-sm text-gray-500">새로운 비밀번호로 로그인해주세요.</p>
                <button onClick={() => navigate('/login')}
                  className="w-full bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition">
                  로그인 페이지로 이동
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 bg-gray-50 border border-gray-200 px-5 py-4 text-xs text-gray-500">
            <p className="font-medium text-gray-700 mb-2">💡 비밀번호 찾기 이용 안내</p>
            <ul className="list-disc list-inside space-y-1">
              <li>본인 인증 후 새로운 비밀번호로 변경할 수 있습니다.</li>
              <li>휴대폰 또는 이메일 인증 중 선택하여 진행할 수 있습니다.</li>
              <li>인증번호는 3분간 유효합니다.</li>
              <li>비밀번호 변경 후 기존 비밀번호는 사용할 수 없습니다.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}
