import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import Navbar from '../../components/Navbar'
import {
  fetchSchoolStats, fetchSchoolVisitors, fetchSchoolPosts,
  deleteSchoolPost, fetchSchoolUsers, updateSchoolUserRole, approveSchoolUser
} from '../../api/adminSchool'
import type { SchoolStats, VisitorPoint, PostItem, AdminUser } from '../../api/adminSchool'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)

export default function SchoolAdminPage() {
  const navigate = useNavigate()
  const [stats, setStats]       = useState<SchoolStats | null>(null)
  const [visitors, setVisitors] = useState<VisitorPoint[]>([])
  const [posts, setPosts]       = useState<PostItem[]>([])
  const [users, setUsers]       = useState<AdminUser[]>([])
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    Promise.all([
      fetchSchoolStats(),
      fetchSchoolVisitors(),
      fetchSchoolUsers(),
    ]).then(([s, v, u]) => {
      setStats(s); setVisitors(v); setUsers(u)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchSchoolPosts(page).then(data => {
      setPosts(data.posts)
      setTotalPages(data.totalPages)
    })
  }, [page])

  const handleDelete = async (postId: number) => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return
    await deleteSchoolPost(postId)
    fetchSchoolPosts(page).then(data => { setPosts(data.posts); setTotalPages(data.totalPages) })
  }

  const handleRoleChange = async (userId: number, currentRole: string | null) => {
    const newRole = currentRole === 'DEPT_ADMIN' ? '' : 'DEPT_ADMIN'
    await updateSchoolUserRole(userId, newRole)
    fetchSchoolUsers().then(setUsers)
  }

  const handleApprove = async (userId: number, approved: boolean) => {
    await approveSchoolUser(userId, !approved)
    fetchSchoolUsers().then(setUsers)
  }

  const lineData = {
    labels: visitors.map(v => v.date.slice(5)),
    datasets: [{
      label: '방문자 수',
      data: visitors.map(v => v.count),
      borderColor: '#111827',
      backgroundColor: 'rgba(17,24,39,0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#111827',
    }],
  }

  const doughnutData = {
    labels: ['게시글', '공지사항'],
    datasets: [{
      data: [stats?.totalPosts ?? 0, stats?.totalNotices ?? 0],
      backgroundColor: ['#111827', '#d1d5db'],
      borderWidth: 0,
    }],
  }

  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
    },
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

      {/* 헤더 */}
      <section className="bg-black text-white py-10 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">School Admin</p>
            <h1 className="text-2xl font-bold">학교 관리자 대시보드</h1>
            <p className="text-gray-400 text-sm mt-1">게시물 관리 및 학과 관리자 권한 관리</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="border border-gray-600 text-gray-300 px-4 py-2 text-xs hover:border-white hover:text-white transition"
          >
            <i className="fas fa-arrow-left mr-2" />돌아가기
          </button>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon="fa-file-alt"  label="총 게시글"    value={stats?.totalPosts ?? 0} />
          <StatCard icon="fa-bullhorn"  label="총 공지사항"  value={stats?.totalNotices ?? 0} />
          <StatCard icon="fa-eye"       label="오늘 방문자"  value={stats?.todayVisitors ?? 0} />
        </div>

        {/* 차트 영역 */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">방문자 추이 (최근 30일)</h2>
            <Line data={lineData} options={lineOptions} />
          </div>
          <div className="border-2 border-black p-6 flex flex-col items-center justify-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">게시물 현황</h2>
            <div style={{ width: 200, height: 200 }}>
              <Doughnut
                data={doughnutData}
                options={{ plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }}
              />
            </div>
          </div>
        </div>

        {/* 게시글 관리 */}
        <div className="border-2 border-black p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">게시글 관리</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
                  <th className="text-left pb-3 pr-4">제목</th>
                  <th className="text-left pb-3 pr-4">작성자</th>
                  <th className="text-left pb-3 pr-4">카테고리</th>
                  <th className="text-left pb-3 pr-4">조회수</th>
                  <th className="text-left pb-3 pr-4">작성일</th>
                  <th className="text-left pb-3">관리</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p, i) => (
                  <tr key={p.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                    <td className="py-3 pr-4 max-w-xs truncate">
                      <a href={`/post/${p.id}`} target="_blank" rel="noreferrer"
                         className="hover:underline">{p.title}</a>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{p.author}</td>
                    <td className="py-3 pr-4">
                      <span className="border border-gray-300 px-2 py-0.5 text-xs">{p.category}</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{p.viewCount}</td>
                    <td className="py-3 pr-4 text-gray-400 text-xs">{p.createdDate?.slice(0, 10)}</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs border border-red-300 text-red-500 px-3 py-1 hover:bg-red-50 transition"
                      >삭제</button>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-sm">게시글이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex gap-1.5 mt-5 justify-center">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 text-xs border transition ${
                    page === i ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 학과 관리자 계정 관리 */}
        <div className="border-2 border-black p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">학과 관리자 계정 관리</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
                  <th className="text-left pb-3 pr-4">이름</th>
                  <th className="text-left pb-3 pr-4">아이디</th>
                  <th className="text-left pb-3 pr-4">역할</th>
                  <th className="text-left pb-3 pr-4">상태</th>
                  <th className="text-left pb-3 pr-4">역할 관리</th>
                  <th className="text-left pb-3">승인 관리</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                    <td className="py-3 pr-4 font-medium">{u.name}</td>
                    <td className="py-3 pr-4 text-gray-500">{u.username}</td>
                    <td className="py-3 pr-4">
                      <span className="border border-gray-300 px-2 py-0.5 text-xs font-mono">
                        {u.adminRole ?? '없음'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-bold ${u.approved ? 'text-green-600' : 'text-amber-500'}`}>
                        {u.approved ? '승인됨' : '대기 중'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => handleRoleChange(u.id, u.adminRole)}
                        className="text-xs border border-gray-300 px-3 py-1 hover:border-black hover:bg-gray-50 transition"
                      >
                        {u.adminRole === 'DEPT_ADMIN' ? '역할 박탈' : 'DEPT_ADMIN 부여'}
                      </button>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleApprove(u.id, u.approved)}
                        className={`text-xs border px-3 py-1 transition ${
                          u.approved
                            ? 'border-red-300 text-red-500 hover:bg-red-50'
                            : 'border-green-400 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {u.approved ? '승인 취소' : '승인'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-sm">관리자 계정이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
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
