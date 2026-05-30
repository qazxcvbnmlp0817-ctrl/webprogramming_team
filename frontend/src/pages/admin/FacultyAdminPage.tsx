import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import Navbar from '../../components/Navbar'
import FacultyPage from '../FacultyPage'
import {
  fetchFacultyStats, fetchFacultyVisitors, fetchFacultyMonthlyStats,
  fetchFacultyPosts, deleteFacultyPost,
  fetchFacultyNotices, deleteFacultyNotice,
  fetchFacultyUsers, updateFacultyUserStatus,
  fetchFacultyPendingUsers,
} from '../../api/adminFaculty'
import type {
  FacultyStats, VisitorPoint, PostItem, NoticeItem, AdminUser, MonthlyStats,
} from '../../api/adminFaculty'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
)

type Tab = '개요' | '학부 페이지' | '게시글 관리' | '공지 관리' | '사용자' | '가입 승인' | '통계'
const TABS: Tab[] = ['개요', '학부 페이지', '게시글 관리', '공지 관리', '사용자', '가입 승인', '통계']

export default function FacultyAdminPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const adminRole = sessionStorage.getItem('adminRole')
  const isSuper = adminRole === 'SUPER_ADMIN'
  // facultyId always passed for both SUPER_ADMIN and SCHOOL_ADMIN (no DEPT_ADMIN here).
  const facultyId = id ? Number(id) : undefined

  const [tab, setTab]               = useState<Tab>('개요')
  const [stats, setStats]           = useState<FacultyStats | null>(null)
  const [visitors, setVisitors]     = useState<VisitorPoint[]>([])
  const [monthly, setMonthly]       = useState<MonthlyStats[]>([])
  const [posts, setPosts]           = useState<PostItem[]>([])
  const [postPage, setPostPage]     = useState(0)
  const [postTotalPages, setPostTotalPages] = useState(1)
  const [notices, setNotices]       = useState<NoticeItem[]>([])
  const [noticePage, setNoticePage] = useState(0)
  const [noticeTotalPages, setNoticeTotalPages] = useState(1)
  const [users, setUsers]           = useState<AdminUser[]>([])
  const [pending, setPending]       = useState<AdminUser[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      fetchFacultyStats(facultyId),
      fetchFacultyVisitors(facultyId),
      fetchFacultyMonthlyStats(facultyId),
      fetchFacultyUsers(facultyId),
      fetchFacultyPendingUsers(facultyId),
    ]).then(([s, v, m, u, p]) => {
      setStats(s); setVisitors(v); setMonthly(m); setUsers(u); setPending(p)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchFacultyPosts(postPage, facultyId).then(d => {
      setPosts(d.posts); setPostTotalPages(d.totalPages)
    })
  }, [postPage])

  useEffect(() => {
    fetchFacultyNotices(noticePage, facultyId).then(d => {
      setNotices(d.notices); setNoticeTotalPages(d.totalPages)
    })
  }, [noticePage])

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return
    await deleteFacultyPost(postId, facultyId)
    fetchFacultyPosts(postPage, facultyId).then(d => { setPosts(d.posts); setPostTotalPages(d.totalPages) })
  }

  const handleDeleteNotice = async (noticeId: number) => {
    if (!window.confirm('공지를 삭제하시겠습니까?')) return
    await deleteFacultyNotice(noticeId, facultyId)
    fetchFacultyNotices(noticePage, facultyId).then(d => { setNotices(d.notices); setNoticeTotalPages(d.totalPages) })
  }

  const handleStatusChange = async (userId: number, newStatus: string) => {
    if (newStatus === 'DELETED' && !window.confirm('삭제는 되돌릴 수 없습니다. 계속하시겠습니까?')) return
    await updateFacultyUserStatus(userId, newStatus, facultyId)
    fetchFacultyUsers(facultyId).then(setUsers)
    fetchFacultyPendingUsers(facultyId).then(setPending)
  }

  const lineData = {
    labels: visitors.map(v => v.date.slice(5)),
    datasets: [{
      label: '방문자 수', data: visitors.map(v => v.count),
      borderColor: '#111827', backgroundColor: 'rgba(17,24,39,0.08)',
      fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#111827',
    }],
  }
  const doughnutData = {
    labels: ['게시글', '공지사항'],
    datasets: [{
      data: [stats?.totalPosts ?? 0, stats?.totalNotices ?? 0],
      backgroundColor: ['#111827', '#d1d5db'], borderWidth: 0,
    }],
  }
  const barData = {
    labels: monthly.map(m => m.month.slice(5) + '월'),
    datasets: [
      { label: '가입자', data: monthly.map(m => m.signups),  backgroundColor: '#111827' },
      { label: '게시글', data: monthly.map(m => m.posts),    backgroundColor: '#6b7280' },
      { label: '방문자', data: monthly.map(m => m.visitors), backgroundColor: '#d1d5db' },
    ],
  }
  const lineOptions = {
    responsive: true, plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#f3f4f6' } } },
  }
  const barOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' as const, labels: { font: { size: 11 } } } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#f3f4f6' } } },
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-gray-400 text-sm">로딩 중...</p>
    </div>
  )

  return (
    <div className="bg-white text-black font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />

      <section className="bg-black text-white py-10 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">Faculty Admin</p>
              <h1 className="text-2xl font-bold">학부 관리자 대시보드</h1>
              <p className="text-gray-400 text-sm mt-1">학부 ID: {id}</p>
            </div>
            {isSuper && (
              <span className="border border-yellow-400 text-yellow-400 text-xs px-3 py-1 ml-4">
                감독 모드 (SUPER)
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/school/faculty/${id}/board/write`)}
              className="border border-gray-400 text-white px-3 py-2 text-xs hover:bg-white hover:text-black transition">
              <i className="fas fa-pen mr-2" />학부 글쓰기
            </button>
            <button onClick={() => navigate(`/school/faculty/${id}/notice/write`)}
              className="border border-gray-400 text-white px-3 py-2 text-xs hover:bg-white hover:text-black transition">
              <i className="fas fa-bullhorn mr-2" />공지 작성
            </button>
            <button onClick={() => navigate(-1)}
              className="border border-gray-600 text-gray-300 px-4 py-2 text-xs hover:border-white hover:text-white transition">
              <i className="fas fa-arrow-left mr-2" />돌아가기
            </button>
          </div>
        </div>
      </section>

      <div className="border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 flex gap-0 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition relative ${
                tab === t ? 'border-b-2 border-black text-black -mb-px' : 'text-gray-400 hover:text-black'
              }`}>
              {t === '가입 승인' && pending.length > 0
                ? `가입 승인 (${pending.length})`
                : t}
            </button>
          ))}
        </div>
      </div>

      {!isSuper && sessionStorage.getItem('college') && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
            ℹ {sessionStorage.getItem('college')} 범위의 데이터만 표시됩니다.
          </div>
        </div>
      )}

      {tab === '학부 페이지' ? (
        <FacultyPage embedded facultyIdOverride={facultyId} />
      ) : (
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {tab === '개요' && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <StatCard icon="fa-file-alt" label="총 게시글"   value={stats?.totalPosts ?? 0} />
              <StatCard icon="fa-bullhorn" label="총 공지사항" value={stats?.totalNotices ?? 0} />
              <StatCard icon="fa-eye"      label="오늘 방문자" value={stats?.todayVisitors ?? 0} />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 border-2 border-black p-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">방문자 추이 (30일)</h2>
                <Line data={lineData} options={lineOptions} />
              </div>
              <div className="border-2 border-black p-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">콘텐츠 비율</h2>
                <Doughnut data={doughnutData} />
              </div>
            </div>
          </>
        )}

        {tab === '게시글 관리' && (
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">학부 게시글</h2>
            <PostTable items={posts} onDelete={handleDeletePost} />
            <Pagination page={postPage} totalPages={postTotalPages} onChange={setPostPage} />
          </div>
        )}

        {tab === '공지 관리' && (
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">학부 공지</h2>
            <NoticeTable items={notices} onDelete={handleDeleteNotice} />
            <Pagination page={noticePage} totalPages={noticeTotalPages} onChange={setNoticePage} />
          </div>
        )}

        {tab === '사용자' && (
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">학부 사용자 (소속 학과 학생/교수 통합)</h2>
            <UserTable users={users} onStatusChange={handleStatusChange} />
          </div>
        )}

        {tab === '가입 승인' && (
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">가입 승인 대기</h2>
            {pending.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">대기 중인 가입 요청이 없습니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
                      <th className="text-left pb-3 pr-4">이름</th>
                      <th className="text-left pb-3 pr-4">아이디</th>
                      <th className="text-left pb-3 pr-4">유형</th>
                      <th className="text-left pb-3 pr-4">학과</th>
                      <th className="text-left pb-3 pr-4">가입일</th>
                      <th className="text-left pb-3">처리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((u, i) => (
                      <tr key={u.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                        <td className="py-3 pr-4 font-medium">{u.name}</td>
                        <td className="py-3 pr-4 text-gray-500">{u.username}</td>
                        <td className="py-3 pr-4">
                          <span className="border border-gray-300 px-2 py-0.5 text-xs">{u.memberType}</span>
                        </td>
                        <td className="py-3 pr-4 text-gray-500">{u.department ?? '-'}</td>
                        <td className="py-3 pr-4 text-gray-400 text-xs">{u.createdDate?.slice(0, 10)}</td>
                        <td className="py-3 flex gap-2">
                          <button onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                            className="text-xs border border-green-400 text-green-600 px-3 py-1 hover:bg-green-50 transition">승인</button>
                          <button onClick={() => handleStatusChange(u.id, 'DELETED')}
                            className="text-xs border border-red-300 text-red-500 px-3 py-1 hover:bg-red-50 transition">거절</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === '통계' && (
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">6개월 월간 통계</h2>
            <Bar data={barData} options={barOptions} />
          </div>
        )}
      </main>
      )}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="border-2 border-black p-5 hover:bg-gray-50 transition">
      <i className={`fas ${icon} text-xl text-gray-300 mb-3 block`} />
      <p className="text-3xl font-bold tabular-nums">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE:           'border-green-400 text-green-600',
    PENDING_APPROVAL: 'border-amber-400 text-amber-600',
    SUSPENDED:        'border-orange-400 text-orange-600',
    DELETED:          'border-red-400 text-red-500',
  }
  return (
    <span className={`text-xs border px-2 py-0.5 ${colors[status] ?? 'border-gray-300 text-gray-500'}`}>
      {status}
    </span>
  )
}

function PostTable({ items, onDelete }: { items: PostItem[]; onDelete: (id: number) => void }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
          <th className="text-left pb-3 pr-4">제목</th>
          <th className="text-left pb-3 pr-4">작성자</th>
          <th className="text-left pb-3 pr-4">분류</th>
          <th className="text-left pb-3 pr-4">조회수</th>
          <th className="text-left pb-3 pr-4">작성일</th>
          <th className="text-left pb-3">삭제</th>
        </tr>
      </thead>
      <tbody>
        {items.map((p, i) => (
          <tr key={p.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
            <td className="py-3 pr-4 font-medium truncate max-w-xs">{p.title}</td>
            <td className="py-3 pr-4 text-gray-500">{p.author}</td>
            <td className="py-3 pr-4 text-gray-400 text-xs">{p.category}</td>
            <td className="py-3 pr-4 text-gray-400">{p.viewCount}</td>
            <td className="py-3 pr-4 text-gray-400 text-xs">{p.createdDate?.slice(0, 10)}</td>
            <td className="py-3">
              <button onClick={() => onDelete(p.id)}
                className="text-xs border border-red-300 text-red-500 px-3 py-1 hover:bg-red-50 transition">
                삭제
              </button>
            </td>
          </tr>
        ))}
        {items.length === 0 && (
          <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-sm">게시글이 없습니다.</td></tr>
        )}
      </tbody>
    </table>
  )
}

function NoticeTable({ items, onDelete }: { items: NoticeItem[]; onDelete: (id: number) => void }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
          <th className="text-left pb-3 pr-4">제목</th>
          <th className="text-left pb-3 pr-4">작성자</th>
          <th className="text-left pb-3 pr-4">분류</th>
          <th className="text-left pb-3 pr-4">조회수</th>
          <th className="text-left pb-3 pr-4">작성일</th>
          <th className="text-left pb-3">삭제</th>
        </tr>
      </thead>
      <tbody>
        {items.map((n, i) => (
          <tr key={n.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
            <td className="py-3 pr-4 font-medium truncate max-w-xs">
              {n.featured && <span className="mr-2 text-xs bg-black text-white px-1.5 py-0.5">고정</span>}
              {n.title}
            </td>
            <td className="py-3 pr-4 text-gray-500">{n.author}</td>
            <td className="py-3 pr-4 text-gray-400 text-xs">{n.category}</td>
            <td className="py-3 pr-4 text-gray-400">{n.viewCount}</td>
            <td className="py-3 pr-4 text-gray-400 text-xs">{n.createdDate?.slice(0, 10)}</td>
            <td className="py-3">
              <button onClick={() => onDelete(n.id)}
                className="text-xs border border-red-300 text-red-500 px-3 py-1 hover:bg-red-50 transition">
                삭제
              </button>
            </td>
          </tr>
        ))}
        {items.length === 0 && (
          <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-sm">공지가 없습니다.</td></tr>
        )}
      </tbody>
    </table>
  )
}

function UserTable({ users, onStatusChange }: { users: AdminUser[]; onStatusChange: (id: number, status: string) => void }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
          <th className="text-left pb-3 pr-4">이름</th>
          <th className="text-left pb-3 pr-4">아이디</th>
          <th className="text-left pb-3 pr-4">유형</th>
          <th className="text-left pb-3 pr-4">학과</th>
          <th className="text-left pb-3 pr-4">상태</th>
          <th className="text-left pb-3 pr-4">가입일</th>
          <th className="text-left pb-3">관리</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u, i) => (
          <tr key={u.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
            <td className="py-3 pr-4 font-medium">{u.name}</td>
            <td className="py-3 pr-4 text-gray-500">{u.username}</td>
            <td className="py-3 pr-4 text-gray-400 text-xs">{u.memberType}</td>
            <td className="py-3 pr-4 text-gray-500 text-xs">{u.department ?? '-'}</td>
            <td className="py-3 pr-4"><StatusBadge status={u.status} /></td>
            <td className="py-3 pr-4 text-gray-400 text-xs">{u.createdDate?.slice(0, 10)}</td>
            <td className="py-3 space-x-1 whitespace-nowrap">
              {u.status === 'ACTIVE' && (
                <button onClick={() => onStatusChange(u.id, 'SUSPENDED')}
                  className="text-xs border border-orange-300 text-orange-500 px-2 py-1 hover:bg-orange-50 transition">정지</button>
              )}
              {u.status === 'SUSPENDED' && (
                <button onClick={() => onStatusChange(u.id, 'ACTIVE')}
                  className="text-xs border border-green-400 text-green-600 px-2 py-1 hover:bg-green-50 transition">복구</button>
              )}
              {u.status !== 'DELETED' && (
                <button onClick={() => onStatusChange(u.id, 'DELETED')}
                  className="text-xs border border-red-300 text-red-500 px-2 py-1 hover:bg-red-50 transition">삭제</button>
              )}
            </td>
          </tr>
        ))}
        {users.length === 0 && (
          <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-sm">학부 소속 사용자가 없습니다.</td></tr>
        )}
      </tbody>
    </table>
  )
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null
  return (
    <div className="mt-4 flex items-center justify-center gap-1">
      <button onClick={() => onChange(Math.max(0, page - 1))} disabled={page === 0}
        className="text-xs border border-gray-300 px-3 py-1 disabled:opacity-40 hover:bg-gray-50">
        이전
      </button>
      <span className="text-xs text-gray-500 px-3">{page + 1} / {totalPages}</span>
      <button onClick={() => onChange(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
        className="text-xs border border-gray-300 px-3 py-1 disabled:opacity-40 hover:bg-gray-50">
        다음
      </button>
    </div>
  )
}
