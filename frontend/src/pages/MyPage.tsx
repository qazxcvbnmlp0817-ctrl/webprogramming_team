import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

type Tab = '내 정보' | '내가 쓴 글' | '댓글 관리' | '내 일정 관리' | '알림 설정'

export default function MyPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('내 정보')
  const [isEditing, setIsEditing] = useState(false)

  const name     = sessionStorage.getItem('name') || '홍길동'
  const username = sessionStorage.getItem('username') || 'student1'
  const memberType = sessionStorage.getItem('memberType')
  const department = sessionStorage.getItem('department') || '컴퓨터공학과'
  const college    = sessionStorage.getItem('college') || '공과대학'
  const grade      = sessionStorage.getItem('grade')
  const enrollmentStatus = sessionStorage.getItem('enrollmentStatus')

  const memberTypeLabel =
    memberType === 'student'   ? '학생' :
    memberType === 'professor' ? '교수' :
    memberType === 'employee'  ? '직원' :
    memberType === 'assistant' ? '조교' :
    memberType === 'admin'     ? '관리자' : '회원'

  const enrollmentLabel =
    enrollmentStatus === 'freshman'  ? '신입생' :
    enrollmentStatus === 'enrolled'  ? '재학생' :
    enrollmentStatus === 'graduated' ? '졸업생' : ''

  const handleLogout = () => {
    sessionStorage.clear()
    window.dispatchEvent(new Event('loginChanged'))
    navigate('/login')
  }

  const TABS: Tab[] = ['내 정보', '내가 쓴 글', '댓글 관리', '내 일정 관리', '알림 설정']

  return (
    <div className="bg-gray-50 text-black font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />

      <section className="bg-black text-white py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold">마이페이지</h1>
          <p className="text-gray-400 text-sm mt-1">내 정보를 확인하고 관리하세요.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

        {/* 사이드바 */}
        <aside className="w-full lg:w-56 flex-shrink-0">
          {/* 프로필 카드 */}
          <div className="bg-white border-2 border-black p-5 mb-4 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center bg-gray-100 mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="font-bold text-base">{name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{memberTypeLabel} · {username}</p>
            {department && <p className="text-xs text-gray-400 mt-1">{department}</p>}
          </div>

          {/* 탭 메뉴 */}
          <nav className="bg-white border-2 border-black overflow-hidden">
            {TABS.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition flex items-center gap-2
                  ${i < TABS.length - 1 ? 'border-b border-gray-100' : ''}
                  ${activeTab === tab ? 'bg-black text-white' : 'hover:bg-gray-50'}`}>
                {tab === '내 정보' && <i className="fas fa-user w-4" />}
                {tab === '내가 쓴 글' && <i className="fas fa-pen w-4" />}
                {tab === '댓글 관리' && <i className="fas fa-comment w-4" />}
                {tab === '내 일정 관리' && <i className="fas fa-calendar w-4" />}
                {tab === '알림 설정' && <i className="fas fa-bell w-4" />}
                {tab}
              </button>
            ))}
          </nav>

          <button onClick={handleLogout}
            className="w-full mt-4 bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition border-2 border-black">
            로그아웃
          </button>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1">

          {/* 내 정보 탭 */}
          {activeTab === '내 정보' && (
            <div className="bg-white border-2 border-black p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">내 정보</h2>
                <button onClick={() => setIsEditing(!isEditing)}
                  className="text-sm border-2 border-black px-4 py-1.5 font-bold hover:bg-black hover:text-white transition">
                  {isEditing ? '취소' : '정보 수정'}
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { label: '이름', value: name },
                  { label: '아이디', value: username },
                  { label: '회원 유형', value: memberTypeLabel },
                  { label: '소속 학과', value: department },
                  { label: '단과대학', value: college },
                  ...(grade ? [{ label: '학년', value: `${grade}학년` }] : []),
                  ...(enrollmentLabel ? [{ label: '재학 상태', value: enrollmentLabel }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center border-b border-gray-100 pb-4">
                    <span className="text-sm text-gray-500 w-28 flex-shrink-0">{label}</span>
                    {isEditing && (label === '이름') ? (
                      <input defaultValue={value} className="flex-1 border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-black" />
                    ) : (
                      <span className="text-sm font-medium">{value || '-'}</span>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setIsEditing(false)}
                    className="flex-1 border-2 border-black py-2 text-sm font-bold hover:bg-gray-50 transition">취소</button>
                  <button onClick={() => setIsEditing(false)}
                    className="flex-1 bg-black text-white py-2 text-sm font-bold hover:opacity-80 transition">저장</button>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-base font-bold mb-4">비밀번호 변경</h3>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">현재 비밀번호</label>
                    <input type="password" className="w-full border-2 border-gray-200 px-3 py-2 text-sm outline-none focus:border-black" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">새 비밀번호</label>
                    <input type="password" className="w-full border-2 border-gray-200 px-3 py-2 text-sm outline-none focus:border-black" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">새 비밀번호 확인</label>
                    <input type="password" className="w-full border-2 border-gray-200 px-3 py-2 text-sm outline-none focus:border-black" />
                  </div>
                  <button className="w-full bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition mt-1">
                    비밀번호 변경
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 내가 쓴 글 탭 */}
          {activeTab === '내가 쓴 글' && (
            <div className="bg-white border-2 border-black p-6">
              <h2 className="text-lg font-bold mb-6">내가 쓴 글</h2>
              <div className="py-16 text-center text-gray-400">
                <i className="fas fa-pen text-3xl mb-3 block" />
                작성한 게시글이 없습니다.
              </div>
            </div>
          )}

          {/* 댓글 관리 탭 */}
          {activeTab === '댓글 관리' && (
            <div className="bg-white border-2 border-black p-6">
              <h2 className="text-lg font-bold mb-6">댓글 관리</h2>
              <div className="py-16 text-center text-gray-400">
                <i className="fas fa-comment text-3xl mb-3 block" />
                작성한 댓글이 없습니다.
              </div>
            </div>
          )}

          {/* 내 일정 관리 탭 */}
          {activeTab === '내 일정 관리' && (
            <div className="bg-white border-2 border-black p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">내 일정 관리</h2>
                <p className="text-xs text-gray-400">DB 연결 후 실제 일정이 표시됩니다</p>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                {['전체', '오늘', '이번 주', '이번 달', '지난 일정'].map(f => (
                  <button key={f} className="px-3 py-1.5 text-xs font-bold border-2 border-black hover:bg-black hover:text-white transition first:bg-black first:text-white">
                    {f}
                  </button>
                ))}
              </div>

              <div className="py-16 text-center text-gray-400">
                <i className="fas fa-calendar text-3xl mb-3 block" />
                등록된 일정이 없습니다.
                <p className="text-xs mt-2">일정 페이지에서 일정을 확인하세요.</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button onClick={() => navigate('/school/schedule')}
                  className="w-full border-2 border-black py-2.5 text-sm font-bold hover:bg-black hover:text-white transition">
                  학교 일정 보러 가기 →
                </button>
              </div>
            </div>
          )}

          {/* 알림 설정 탭 */}
          {activeTab === '알림 설정' && (
            <div className="bg-white border-2 border-black p-6">
              <h2 className="text-lg font-bold mb-6">알림 설정</h2>
              <div className="flex flex-col gap-4">
                {[
                  { label: '새 공지사항 알림', desc: '학과/학교 새 공지사항이 등록되면 알림' },
                  { label: '댓글 알림', desc: '내 게시글에 댓글이 달리면 알림' },
                  { label: 'D-Day 임박 알림', desc: '일정 7일 전 알림' },
                  { label: '이메일 수신', desc: '중요 공지를 이메일로 받기' },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-black transition-colors duration-200" />
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5" />
                    </label>
                  </div>
                ))}
              </div>
              <button className="w-full bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition mt-6">
                설정 저장
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
