import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function MyPage() {
  const navigate = useNavigate()

  const userInfo = {
    name: sessionStorage.getItem('username') || '홍길동',
    id: sessionStorage.getItem('username') || 'student123',
    memberType: sessionStorage.getItem('memberType') === 'student' ? '학생' :
                sessionStorage.getItem('memberType') === 'professor' ? '교수/조교' : '관리자',
    university: '국립목포대학교',
    college: '공과대학',
    department: '컴퓨터공학과',
    studentId: '20210001',
  }

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="min-h-screen pt-14 px-4 bg-gray-50">
        <div className="max-w-xl mx-auto py-10">

          <section className="bg-black text-white py-8 px-6 mb-6">
            <h1 className="text-2xl font-bold mb-1">마이페이지</h1>
            <p className="text-gray-400 text-sm">내 정보를 확인하고 관리하세요.</p>
          </section>

          <div className="border-2 border-black p-6 bg-white mb-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold">{userInfo.name}</p>
                <p className="text-sm text-gray-500">{userInfo.memberType} · {userInfo.id}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 flex flex-col gap-3">
              {[
                { label: '소속 대학교', value: userInfo.university },
                { label: '단과대학', value: userInfo.college },
                { label: '학과', value: userInfo.department },
                { label: '학번', value: userInfo.studentId },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 w-24">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-2 border-black bg-white mb-4">
            {[
              { label: '내 정보 수정', icon: '✏️' },
              { label: '비밀번호 변경', icon: '🔒' },
              { label: '내가 쓴 글', icon: '📝' },
              { label: '내가 쓴 댓글', icon: '💬' },
            ].map((item) => (
              <div key={item.label}
                className="flex items-center justify-between px-5 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition">
                <span className="text-sm font-medium">{item.icon} {item.label}</span>
                <span className="text-gray-400">›</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/universities')}
              className="w-full border-2 border-black py-2.5 text-sm font-bold hover:bg-gray-50 transition"
            >
              대학교 메인으로 이동
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('isLoggedIn')
                sessionStorage.removeItem('username')
                sessionStorage.removeItem('memberType')
                window.dispatchEvent(new Event('loginChanged'))
                navigate('/login')
              }}
              className="w-full bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition"
            >
              로그아웃
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
