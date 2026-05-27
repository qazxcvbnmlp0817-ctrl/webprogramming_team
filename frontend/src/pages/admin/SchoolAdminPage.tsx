import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import Navbar from '../../components/Navbar'
import {
  fetchSchoolStats, fetchSchoolVisitors, fetchSchoolPosts,
  deleteSchoolPost, fetchSchoolUsers, updateSchoolUserRole,
  fetchSchoolAllUsers, fetchSchoolPendingUsers, updateUserStatus,
  fetchAdminLogs, fetchSchoolMonthlyStats,
  fetchSchoolProfessors, fetchSchoolCourses, fetchSchoolAssignments,
  createSchoolAssignment, deleteSchoolAssignment,
} from '../../api/adminSchool'
import type {
  SchoolStats, VisitorPoint, PostItem, AdminUser, AdminLog, MonthlyStats,
  ProfessorItem, CourseItem, AssignmentItem,
} from '../../api/adminSchool'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
)

type Tab = '개요' | '게시글 관리' | '전체 사용자' | '가입 승인' | '관리자 계정' | '활동 로그' | '교수 배정'
const TABS: Tab[] = ['개요', '게시글 관리', '전체 사용자', '가입 승인', '관리자 계정', '활동 로그', '교수 배정']

export default function SchoolAdminPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const adminRole = sessionStorage.getItem('adminRole')
  const isSuperAdmin = adminRole === 'SUPER_ADMIN'
  const univId = isSuperAdmin ? Number(id) : undefined

  const [tab, setTab]               = useState<Tab>('개요')
  const [stats, setStats]           = useState<SchoolStats | null>(null)
  const [visitors, setVisitors]     = useState<VisitorPoint[]>([])
  const [monthly, setMonthly]       = useState<MonthlyStats[]>([])
  const [posts, setPosts]           = useState<PostItem[]>([])
  const [allUsers, setAllUsers]     = useState<AdminUser[]>([])
  const [pending, setPending]       = useState<AdminUser[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [logs, setLogs]             = useState<AdminLog[]>([])
  const [page, setPage]             = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)
  const [userFilter, setUserFilter] = useState<string>('전체')
  const [professors, setProfessors]   = useState<ProfessorItem[]>([])
  const [courses, setCourses]         = useState<CourseItem[]>([])
  const [assignments, setAssignments] = useState<AssignmentItem[]>([])
  const [selProfId, setSelProfId]         = useState<number | ''>('')
  const [selCourseId, setSelCourseId]     = useState<number | ''>('')
  const [selDeptId, setSelDeptId]         = useState<number | ''>('')
  const [assignError, setAssignError]     = useState<string | null>(null)
  const [roleChangeError, setRoleChangeError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetchSchoolStats(univId),
      fetchSchoolVisitors(univId),
      fetchSchoolMonthlyStats(univId),
      fetchSchoolAllUsers(univId),
      fetchSchoolPendingUsers(univId),
      fetchSchoolUsers(univId),
      fetchAdminLogs(univId),
    ]).then(([s, v, m, au, pu, admins, lg]) => {
      setStats(s); setVisitors(v); setMonthly(m)
      setAllUsers(au); setPending(pu); setAdminUsers(admins); setLogs(lg)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchSchoolPosts(page, univId).then(data => {
      setPosts(data.posts)
      setTotalPages(data.totalPages)
    })
  }, [page])

  useEffect(() => {
    if (tab !== '교수 배정') return
    Promise.all([
      fetchSchoolProfessors(univId),
      fetchSchoolCourses(univId),
      fetchSchoolAssignments(univId),
    ]).then(([p, c, a]) => { setProfessors(p); setCourses(c); setAssignments(a) })
  }, [tab, univId])

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return
    await deleteSchoolPost(postId, univId)
    fetchSchoolPosts(page, univId).then(d => { setPosts(d.posts); setTotalPages(d.totalPages) })
  }

  const handleStatusChange = async (userId: number, newStatus: string) => {
    if (newStatus === 'DELETED' && !window.confirm('삭제는 되돌릴 수 없습니다. 계속하시겠습니까?')) return
    await updateUserStatus(userId, newStatus, univId)
    const [au, pu] = await Promise.all([fetchSchoolAllUsers(univId), fetchSchoolPendingUsers(univId)])
    setAllUsers(au); setPending(pu)
    fetchAdminLogs(univId).then(setLogs)
  }

  const handleRoleChange = async (userId: number, currentRole: string | null) => {
    const newRole = currentRole === 'DEPT_ADMIN' ? '' : 'DEPT_ADMIN'
    await updateSchoolUserRole(userId, newRole, univId)
    await fetchSchoolUsers(univId).then(setAdminUsers)
    fetchAdminLogs(univId).then(setLogs)
  }

  const handleInlineRoleChange = async (userId: number, newRole: string) => {
    setRoleChangeError(null)
    try {
      await updateSchoolUserRole(userId, newRole, univId)
      const [au, all] = await Promise.all([
        fetchSchoolUsers(univId),
        fetchSchoolAllUsers(univId),
      ])
      setAdminUsers(au)
      setAllUsers(all)
    } catch {
      setRoleChangeError('역할 변경에 실패했습니다. 다시 시도해 주세요.')
    }
  }

  const filteredUsers = allUsers.filter(u => {
    if (userFilter === '학생') return u.memberType === 'student'
    if (userFilter === '교수') return u.memberType === 'professor'
    if (userFilter === '정지됨') return u.status === 'SUSPENDED'
    return true
  })

  const handleCreateSchoolAssignment = async () => {
    if (selProfId === '' || selCourseId === '' || selDeptId === '') {
      setAssignError('교수, 강의, 학과를 모두 선택하세요')
      return
    }
    try {
      await createSchoolAssignment(selProfId, selCourseId, selDeptId, univId)
      const updated = await fetchSchoolAssignments(univId)
      setAssignments(updated)
      setSelProfId(''); setSelCourseId(''); setSelDeptId('')
      setAssignError(null)
    } catch (e: unknown) {
      setAssignError(e instanceof Error ? e.message : '배정 실패')
    }
  }

  const handleDeleteSchoolAssignment = async (assignmentId: number) => {
    if (!window.confirm('배정을 취소하시겠습니까?')) return
    await deleteSchoolAssignment(assignmentId, univId)
    setAssignments(prev => prev.filter(a => a.id !== assignmentId))
  }

  const lineData = {
    labels: visitors.map(v => v.date.slice(5)),
    datasets: [{
      label: '방문자 수',
      data: visitors.map(v => v.count),
      borderColor: '#111827',
      backgroundColor: 'rgba(17,24,39,0.08)',
      fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#111827',
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

  const barData = {
    labels: monthly.map(m => m.month.slice(5) + '월'),
    datasets: [
      { label: '가입자', data: monthly.map(m => m.signups),  backgroundColor: '#111827' },
      { label: '게시글', data: monthly.map(m => m.posts),    backgroundColor: '#6b7280' },
      { label: '방문자', data: monthly.map(m => m.visitors), backgroundColor: '#d1d5db' },
    ],
  }

  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
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
              <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">School Admin</p>
              <h1 className="text-2xl font-bold">학교 관리자 대시보드</h1>
              <p className="text-gray-400 text-sm mt-1">게시물 관리 및 사용자 관리</p>
            </div>
            {isSuperAdmin && (
              <span className="border border-yellow-400 text-yellow-400 text-xs px-3 py-1 ml-4">
                감독 모드
              </span>
            )}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="border border-gray-600 text-gray-300 px-4 py-2 text-xs hover:border-white hover:text-white transition"
          >
            <i className="fas fa-arrow-left mr-2" />돌아가기
          </button>
        </div>
      </section>

      <div className="border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 flex gap-0">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium transition relative ${
                tab === t
                  ? 'border-b-2 border-black text-black -mb-px'
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              {t === '가입 승인' && pending.length > 0
                ? `가입 승인 (${pending.length})`
                : t}
            </button>
          ))}
        </div>
      </div>

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
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">방문자 추이 (최근 30일)</h2>
                <Line data={lineData} options={lineOptions} />
              </div>
              <div className="border-2 border-black p-6 flex flex-col items-center justify-center">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">게시물 현황</h2>
                <div style={{ width: 200, height: 200 }}>
                  <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }} />
                </div>
              </div>
            </div>
            <div className="border-2 border-black p-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">월별 현황 (최근 6개월)</h2>
              <Bar data={barData} options={barOptions} />
            </div>
          </>
        )}

        {tab === '게시글 관리' && (
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
                        <a href={`/post/${p.id}`} target="_blank" rel="noreferrer" className="hover:underline">{p.title}</a>
                      </td>
                      <td className="py-3 pr-4 text-gray-500">{p.author}</td>
                      <td className="py-3 pr-4">
                        <span className="border border-gray-300 px-2 py-0.5 text-xs">{p.category}</span>
                      </td>
                      <td className="py-3 pr-4 text-gray-400">{p.viewCount}</td>
                      <td className="py-3 pr-4 text-gray-400 text-xs">{p.createdDate?.slice(0, 10)}</td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDeletePost(p.id)}
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
            {totalPages > 1 && (
              <div className="flex gap-1.5 mt-5 justify-center">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i} onClick={() => setPage(i)}
                    className={`w-8 h-8 text-xs border transition ${
                      page === i ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'
                    }`}
                  >{i + 1}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === '전체 사용자' && (
          <div className="border-2 border-black p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">전체 사용자</h2>
              <select
                value={userFilter}
                onChange={e => setUserFilter(e.target.value)}
                className="border border-gray-300 text-sm px-3 py-1.5 focus:outline-none focus:border-black"
              >
                {['전체', '학생', '교수', '정지됨'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            {roleChangeError && (
              <p className="text-sm text-red-500 mb-3">{roleChangeError}</p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
                    <th className="text-left pb-3 pr-4">이름</th>
                    <th className="text-left pb-3 pr-4">아이디</th>
                    <th className="text-left pb-3 pr-4">유형</th>
                    <th className="text-left pb-3 pr-4">상태</th>
                    <th className="text-left pb-3 pr-4">관리자 역할</th>
                    <th className="text-left pb-3">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                      <td className="py-3 pr-4 font-medium">{u.name}</td>
                      <td className="py-3 pr-4 text-gray-500">{u.username}</td>
                      <td className="py-3 pr-4">
                        <span className="border border-gray-300 px-2 py-0.5 text-xs">{u.memberType}</span>
                      </td>
                      <td className="py-3 pr-4"><StatusBadge status={u.status} /></td>
                      <td className="py-3 pr-4">
                        <select
                          aria-label="관리자 역할"
                          value={u.adminRole ?? ''}
                          onChange={(e) => handleInlineRoleChange(u.id, e.target.value)}
                          className="border border-gray-300 text-xs px-2 py-1 focus:outline-none focus:border-black"
                        >
                          <option value="">없음</option>
                          <option value="SCHOOL_ADMIN">SCHOOL_ADMIN</option>
                          <option value="DEPT_ADMIN">DEPT_ADMIN</option>
                        </select>
                      </td>
                      <td className="py-3 flex gap-2">
                        {u.status === 'ACTIVE' && (
                          <button onClick={() => handleStatusChange(u.id, 'SUSPENDED')}
                            className="text-xs border border-orange-300 text-orange-500 px-3 py-1 hover:bg-orange-50 transition">정지</button>
                        )}
                        {u.status === 'SUSPENDED' && (
                          <button onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                            className="text-xs border border-green-400 text-green-600 px-3 py-1 hover:bg-green-50 transition">복구</button>
                        )}
                        {u.status !== 'DELETED' && (
                          <button onClick={() => handleStatusChange(u.id, 'DELETED')}
                            className="text-xs border border-red-300 text-red-500 px-3 py-1 hover:bg-red-50 transition">삭제</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-sm">사용자가 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
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

        {tab === '관리자 계정' && (
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">학과 관리자 계정 관리</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
                    <th className="text-left pb-3 pr-4">이름</th>
                    <th className="text-left pb-3 pr-4">아이디</th>
                    <th className="text-left pb-3 pr-4">유형 / 역할</th>
                    <th className="text-left pb-3 pr-4">상태</th>
                    <th className="text-left pb-3">역할 관리</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u, i) => (
                    <tr key={u.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                      <td className="py-3 pr-4 font-medium">{u.name}</td>
                      <td className="py-3 pr-4 text-gray-500">{u.username}</td>
                      <td className="py-3 pr-4">
                        <span className="border border-blue-300 px-2 py-0.5 text-xs text-blue-600 mr-1">
                          {u.memberType}
                        </span>
                        <span className="border border-gray-300 px-2 py-0.5 text-xs font-mono">
                          {u.adminRole ?? '없음'}
                        </span>
                      </td>
                      <td className="py-3 pr-4"><StatusBadge status={u.status} /></td>
                      <td className="py-3">
                        <button
                          onClick={() => handleRoleChange(u.id, u.adminRole)}
                          className="text-xs border border-gray-300 px-3 py-1 hover:border-black hover:bg-gray-50 transition"
                        >
                          {u.adminRole === 'DEPT_ADMIN' ? '역할 박탈' : 'DEPT_ADMIN 부여'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {adminUsers.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">관리자 계정이 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === '활동 로그' && (
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">관리자 활동 로그</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
                    <th className="text-left pb-3 pr-4">액션</th>
                    <th className="text-left pb-3 pr-4">처리자</th>
                    <th className="text-left pb-3 pr-4">대상</th>
                    <th className="text-left pb-3 pr-4">내용</th>
                    <th className="text-left pb-3">시각</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={log.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                      <td className="py-3 pr-4"><ActionBadge action={log.actionType} /></td>
                      <td className="py-3 pr-4 text-gray-500">{log.actorUsername}</td>
                      <td className="py-3 pr-4 text-gray-500">{log.targetUsername ?? '-'}</td>
                      <td className="py-3 pr-4 text-gray-400 text-xs max-w-xs truncate">{log.detail ?? '-'}</td>
                      <td className="py-3 text-gray-400 text-xs whitespace-nowrap">{relativeTime(log.createdAt)}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">활동 로그가 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === '교수 배정' && (() => {
          const uniqueDeptIds = [...new Set(professors.map(p => p.deptId))]
          return (
            <div className="space-y-6">
              <div className="border-2 border-black p-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">교수 배정 추가</h2>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">학과 선택</label>
                    <select
                      value={selDeptId}
                      onChange={e => {
                        setSelDeptId(e.target.value === '' ? '' : Number(e.target.value))
                        setSelProfId('')
                        setSelCourseId('')
                      }}
                      className="border border-gray-300 text-sm px-3 py-2 focus:outline-none focus:border-black min-w-40"
                    >
                      <option value="">-- 학과 --</option>
                      {uniqueDeptIds.map(did => (
                        <option key={did} value={did}>학과 #{did}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">교수 선택</label>
                    <select
                      value={selProfId}
                      onChange={e => setSelProfId(e.target.value === '' ? '' : Number(e.target.value))}
                      className="border border-gray-300 text-sm px-3 py-2 focus:outline-none focus:border-black min-w-48"
                    >
                      <option value="">-- 교수 --</option>
                      {professors
                        .filter(p => selDeptId === '' || p.deptId === selDeptId)
                        .map(p => (
                          <option key={p.id} value={p.id}>{p.name}{p.specialty ? ` (${p.specialty})` : ''}</option>
                        ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">강의 선택</label>
                    <select
                      value={selCourseId}
                      onChange={e => setSelCourseId(e.target.value === '' ? '' : Number(e.target.value))}
                      className="border border-gray-300 text-sm px-3 py-2 focus:outline-none focus:border-black min-w-48"
                    >
                      <option value="">-- 강의 --</option>
                      {courses
                        .filter(c => selDeptId === '' || c.deptId === selDeptId)
                        .map(c => (
                          <option key={c.id} value={c.id}>{c.name}{c.year ? ` (${c.year})` : ''}</option>
                        ))}
                    </select>
                  </div>
                  <button
                    onClick={handleCreateSchoolAssignment}
                    className="border-2 border-black bg-black text-white text-sm px-5 py-2 hover:bg-white hover:text-black transition"
                  >
                    배정 추가
                  </button>
                </div>
                {assignError && <p className="text-red-500 text-xs mt-2">{assignError}</p>}
              </div>

              <div className="border-2 border-black p-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">현재 배정 목록</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
                        <th className="text-left pb-3 pr-4">교수</th>
                        <th className="text-left pb-3 pr-4">강의</th>
                        <th className="text-left pb-3">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((a, i) => (
                        <tr key={a.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                          <td className="py-3 pr-4 font-medium">{a.professorName}</td>
                          <td className="py-3 pr-4 text-gray-600">{a.courseName}</td>
                          <td className="py-3">
                            <button
                              onClick={() => handleDeleteSchoolAssignment(a.id)}
                              className="text-xs border border-red-300 text-red-500 px-3 py-1 hover:bg-red-50 transition"
                            >취소</button>
                          </td>
                        </tr>
                      ))}
                      {assignments.length === 0 && (
                        <tr><td colSpan={3} className="py-8 text-center text-gray-400 text-sm">배정된 강의가 없습니다.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        })()}

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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE:           'border-green-400 text-green-600',
    PENDING_APPROVAL: 'border-amber-400 text-amber-500',
    SUSPENDED:        'border-orange-400 text-orange-500',
    DELETED:          'border-red-400 text-red-500',
  }
  const label: Record<string, string> = {
    ACTIVE: '활성', PENDING_APPROVAL: '승인대기', SUSPENDED: '정지됨', DELETED: '삭제됨',
  }
  const cls = map[status] ?? 'border-gray-300 text-gray-500'
  return (
    <span className={`border text-xs px-2 py-0.5 font-medium ${cls}`}>
      {label[status] ?? status}
    </span>
  )
}

function ActionBadge({ action }: { action: string }) {
  const map: Record<string, string> = {
    APPROVE:     'bg-green-100 text-green-700',
    REJECT:      'bg-red-100 text-red-700',
    SUSPEND:     'bg-orange-100 text-orange-700',
    UNSUSPEND:   'bg-blue-100 text-blue-700',
    DELETE:      'bg-red-100 text-red-700',
    ROLE_GRANT:  'bg-indigo-100 text-indigo-700',
    ROLE_REVOKE: 'bg-gray-100 text-gray-600',
  }
  const cls = map[action] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`text-xs px-2 py-0.5 font-mono font-medium ${cls}`}>{action}</span>
  )
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}시간 전`
  return `${Math.floor(hrs / 24)}일 전`
}
