import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const COLLEGES: Record<string, string[]> = {
  mokpo: ['공과대학', '인문사회과학대학', '자연과학대학', '경영대학'],
  suncheon: ['공과대학', '인문예술대학', '자연과학대학', '농업생명과학대학'],
}

const STEP_LABELS = ['본인 확인', '아이디 확인', '완료']

export default function FindIdPage() {
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
  const [foundId, setFoundId] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    if (!name || !phone1 || !phone2 || !phone3) {
      setError('모든 항목을 입력해주세요.')
      return
    }
    const phone = `${phone1}-${phone2}-${phone3}`
    try {
      const res = await fetch('/api/auth/find-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      })
      const result = await res.json()
      if (result.success) {
        setFoundId(result.username)
        setError('')
        setStep(2)
      } else {
        setError(result.message || '일치하는 정보가 없습니다.')
      }
    } catch {
      setError('서버 연결에 실패했습니다.')
    }
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
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setMemberType(t.value)}
                        className={`flex-1 py-2 text-sm font-bold border-2 transition
                          ${memberType === t.value ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:border-black'}`}
                      >
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
                    {univ && COLLEGES[univ]?.map(c => <option key={c} value={c}>{c}</option>)}
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

                <button onClick={handleConfirm}
                  className="w-full bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition mt-2">
                  확인
                </button>
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

                <div className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500">
                  <ul className="list-disc list-inside space-y-1">
                    <li>아이디가 기억나지 않으신가요?</li>
                    <li>로그인 후 [마이페이지]에서 아이디를 확인하실 수 있습니다.</li>
                  </ul>
                </div>

                <button onClick={() => setStep(3)}
                  className="w-full bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition">
                  로그인 이동
                </button>
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
                <button onClick={() => navigate('/login')}
                  className="w-full bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition">
                  로그인 페이지로 이동
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 bg-gray-50 border border-gray-200 px-5 py-4 text-xs text-gray-500">
            <p className="font-medium text-gray-700 mb-2">💡 아이디 찾기 이용 안내</p>
            <ul className="list-disc list-inside space-y-1">
              <li>회원가입 시 입력한 정보로만 아이디를 찾을 수 있습니다.</li>
              <li>이름, 소속 정보, 학번/교번, 휴대폰 번호가 일치해야 합니다.</li>
              <li>아이디가 여러 개인 경우, 가입한 아이디가 모두 표시됩니다.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}
