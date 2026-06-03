import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import Navbar from '../../components/Navbar'
import RoleManageModal from '../../components/admin/RoleManageModal'
import SchoolInfoPage from '../SchoolInfoPage'
import { SchoolEditProvider } from '../../context/SchoolEditContext'
import { getAuthItem } from '../../utils/authStorage'
import {
  fetchSchoolStats, fetchSchoolVisitors, fetchSchoolPosts,
  deleteSchoolPost, updateSchoolUserRole,
  fetchSchoolAllUsers, fetchSchoolPendingUsers, updateUserStatus,
  fetchSchoolMonthlyStats,
  fetchSchoolProfessors, fetchSchoolCourses, fetchSchoolAssignments,
  createSchoolAssignment, deleteSchoolAssignment, fetchSchoolDepts,
  fetchSchoolAdminNotices, deleteSchoolAdminNotice,
  hideSchoolPost, hideSchoolNotice,
} from '../../api/adminSchool'
import type {
  SchoolStats, VisitorPoint, PostItem, NoticeItem, AdminUser, MonthlyStats,
  ProfessorItem, CourseItem, AssignmentItem, DeptItem,
} from '../../api/adminSchool'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
)

type Tab = '개요' | '학교 페이지' | '게시글 관리' | '공지 관리' | '전체 사용자' | '가입 승인' | '교수 배정'
const TABS: Tab[] = ['개요', '학교 페이지', '게시글 관리', '공지 관리', '전체 사용자', '가입 승인', '교수 배정']

export default function SchoolAdminPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const adminRole = sessionStorage.getItem('adminRole')
  const isSuperAdmin = adminRole === 'SUPER_ADMIN'
  const univId = isSuperAdmin ? Number(id) : undefined
  const ownUniversityId = getAuthItem('universityId')
  const schoolPageUnivId = isSuperAdmin
    ? Number(id)
    : ownUniversityId
      ? Number(ownUniversityId)
      : undefined

  const [tab, setTab]               = useState<Tab>('개요')
  const [schoolPageRefresh, setSchoolPageRefresh] = useState(0)
  const [stats, setStats]           = useState<SchoolStats | null>(null)
  const [visitors, setVisitors]     = useState<VisitorPoint[]>([])
  const [monthly, setMonthly]       = useState<MonthlyStats[]>([])
  const [posts, setPosts]           = useState<PostItem[]>([])
  const [notices, setNotices]       = useState<NoticeItem[]>([])
  const [noticePage, setNoticePage] = useState(0)
  const [noticeTotalPages, setNoticeTotalPages] = useState(1)
  const [allUsers, setAllUsers]     = useState<AdminUser[]>([])
  const [pending, setPending]       = useState<AdminUser[]>([])
  const [page, setPage]             = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)
  const [userFilter, setUserFilter] = useState<string>('전체')
  const [professors, setProfessors]   = useState<ProfessorItem[]>([])
  const [courses, setCourses]         = useState<CourseItem[]>([])
  const [assignments, setAssignments] = useState<AssignmentItem[]>([])
  const [depts, setDepts]             = useState<DeptItem[]>([])
  const [selProfId, setSelProfId]         = useState<number | ''>('')
  const [selCourseId, setSelCourseId]     = useState<number | ''>('')
  const [selDeptId, setSelDeptId]         = useState<number | ''>('')
  const [assignError, setAssignError]     = useState<string | null>(null)
  const [roleModalUser, setRoleModalUser] = useState<AdminUser | null>(null)
  const [showExtProf, setShowExtProf]     = useState(false)
  const [extProfSearch, setExtProfSearch] = useState('')

  useEffect(() => {
    Promise.all([
      fetchSchoolStats(univId),
      fetchSchoolVisitors(univId),
      fetchSchoolMonthlyStats(univId),
      fetchSchoolAllUsers(univId),
      fetchSchoolPendingUsers(univId),
    ]).then(([s, v, m, au, pu]) => {
      setStats(s); setVisitors(v); setMonthly(m)
      setAllUsers(au); setPending(pu)
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
    fetchSchoolAdminNotices(noticePage, univId).then(data => {
      setNotices(data.notices)
      setNoticeTotalPages(data.totalPages)
    })
  }, [noticePage])

  useEffect(() => {
    if (tab !== '교수 배정') return
    Promise.all([
      fetchSchoolProfessors(univId),
      fetchSchoolCourses(univId),
      fetchSchoolAssignments(univId),
      fetchSchoolDepts(univId),
    ]).then(([p, c, a, d]) => { setProfessors(p); setCourses(c); setAssignments(a); setDepts(d) })
  }, [tab, univId])

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return
    await deleteSchoolPost(postId, univId)
    fetchSchoolPosts(page, univId).then(d => { setPosts(d.posts); setTotalPages(d.totalPages) })
  }

  const handleHidePost = async (postId: number, hidden: boolean) => {
    await hideSchoolPost(postId, hidden, univId)
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, hidden } : p))
  }

  const handleDeleteNotice = async (noticeId: number) => {
    if (!window.confirm('공지사항을 삭제하시겠습니까?')) return
    await deleteSchoolAdminNotice(noticeId, univId)
    fetchSchoolAdminNotices(noticePage, univId).then(d => { setNotices(d.notices); setNoticeTotalPages(d.totalPages) })
  }

  const handleHideNotice = async (noticeId: number, hidden: boolean) => {
    await hideSchoolNotice(noticeId, hidden, univId)
    setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, hidden } : n))
  }

  const handleStatusChange = async (userId: number, newStatus: string) => {
    if (newStatus === 'DELETED' && !window.confirm('삭제는 되돌릴 수 없습니다. 계속하시겠습니까?')) return
    await updateUserStatus(userId, newStatus, univId)
    const [au, pu] = await Promise.all([fetchSchoolAllUsers(univId), fetchSchoolPendingUsers(univId)])
    setAllUsers(au); setPending(pu)
  }

  const handleSaveRole = async (userId: number, newRole: string) => {
    await updateSchoolUserRole(userId, newRole, univId)
    await fetchSchoolAllUsers(univId).then(setAllUsers)
    setRoleModalUser(null)
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

        {tab === '학교 페이지' && (
          <div className="border-2 border-black p-4">
            <div className="mb-4 border-b-2 border-black pb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">School Page Editor</p>
              <h2 className="text-xl font-black mt-1">학교정보 페이지 편집</h2>
              <p className="text-sm text-gray-500 mt-1">
                학생이 보는 학교정보 허브를 미리 보면서 섹션별로 수정합니다.
              </p>
            </div>
            <SchoolEditProvider univId={univId} onSaved={() => setSchoolPageRefresh(k => k + 1)}>
              <SchoolInfoPage embedded univIdOverride={schoolPageUnivId} refreshKey={schoolPageRefresh} />
            </SchoolEditProvider>
          </div>
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
                    <tr key={p.id} className={`border-b border-gray-100 ${p.hidden ? 'opacity-50' : ''} ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                      <td className="py-3 pr-4 max-w-xs truncate">
                        {p.hidden && <span className="mr-1.5 text-xs bg-gray-400 text-white px-1.5 py-0.5">숨김</span>}
                        <a href={`/post/${p.id}`} target="_blank" rel="noreferrer" className="hover:underline">{p.title}</a>
                      </td>
                      <td className="py-3 pr-4 text-gray-500">{p.author}</td>
                      <td className="py-3 pr-4">
                        <span className="border border-gray-300 px-2 py-0.5 text-xs">{p.category}</span>
                      </td>
                      <td className="py-3 pr-4 text-gray-400">{p.viewCount}</td>
                      <td className="py-3 pr-4 text-gray-400 text-xs">{p.createdDate?.slice(0, 10)}</td>
                      <td className="py-3 flex gap-1.5">
                        <button
                          onClick={() => handleHidePost(p.id, !p.hidden)}
                          className={`text-xs border px-3 py-1 transition ${p.hidden ? 'border-blue-300 text-blue-500 hover:bg-blue-50' : 'border-gray-400 text-gray-600 hover:bg-gray-50'}`}
                        >{p.hidden ? '표시' : '숨김'}</button>
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

        {tab === '공지 관리' && (
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">공지사항 관리</h2>
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
                  {notices.map((n, i) => (
                    <tr key={n.id} className={`border-b border-gray-100 ${n.hidden ? 'opacity-50' : ''} ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                      <td className="py-3 pr-4 max-w-xs truncate">
                        {n.featured && <span className="mr-1.5 text-xs bg-black text-white px-1.5 py-0.5">고정</span>}
                        {n.hidden && <span className="mr-1.5 text-xs bg-gray-400 text-white px-1.5 py-0.5">숨김</span>}
                        <a href={`/notice/${n.id}`} target="_blank" rel="noreferrer" className="hover:underline">{n.title}</a>
                      </td>
                      <td className="py-3 pr-4 text-gray-500">{n.author}</td>
                      <td className="py-3 pr-4">
                        <span className="border border-gray-300 px-2 py-0.5 text-xs">{n.category}</span>
                      </td>
                      <td className="py-3 pr-4 text-gray-400">{n.viewCount}</td>
                      <td className="py-3 pr-4 text-gray-400 text-xs">{n.createdDate?.slice(0, 10)}</td>
                      <td className="py-3 flex gap-1.5">
                        <button
                          onClick={() => handleHideNotice(n.id, !n.hidden)}
                          className={`text-xs border px-3 py-1 transition ${n.hidden ? 'border-blue-300 text-blue-500 hover:bg-blue-50' : 'border-gray-400 text-gray-600 hover:bg-gray-50'}`}
                        >{n.hidden ? '표시' : '숨김'}</button>
                        <button
                          onClick={() => handleDeleteNotice(n.id)}
                          className="text-xs border border-red-300 text-red-500 px-3 py-1 hover:bg-red-50 transition"
                        >삭제</button>
                      </td>
                    </tr>
                  ))}
                  {notices.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-sm">공지사항이 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {noticeTotalPages > 1 && (
              <div className="flex gap-1.5 mt-5 justify-center">
                {Array.from({ length: noticeTotalPages }, (_, i) => (
                  <button
                    key={i} onClick={() => setNoticePage(i)}
                    className={`w-8 h-8 text-xs border transition ${
                      noticePage === i ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'
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
                        <span className="border border-gray-300 px-2 py-0.5 text-xs font-mono mr-2">
                          {u.adminRole ?? '-'}
                        </span>
                        <button
                          onClick={() => setRoleModalUser(u)}
                          className="text-xs border border-gray-400 px-2 py-0.5 hover:border-black transition"
                        >
                          역할 관리
                        </button>
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


        {tab === '교수 배정' && (() => {
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
                      {depts.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">교수 선택</label>
                    <div className="flex gap-2 items-center">
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
                      <button
                        onClick={() => { setShowExtProf(v => !v); setExtProfSearch('') }}
                        className="text-xs border border-gray-400 px-3 py-2 hover:bg-gray-50 transition whitespace-nowrap"
                      >
                        {showExtProf ? '닫기' : '다른 소속 교수'}
                      </button>
                    </div>
                    {showExtProf && (
                      <div className="mt-2 border border-gray-300 rounded p-3 w-80 bg-white shadow-sm">
                        <p className="text-xs text-gray-500 mb-2">학교 전체 교수 검색 (소속 무관)</p>
                        <input
                          value={extProfSearch}
                          onChange={e => setExtProfSearch(e.target.value)}
                          placeholder="교수명 검색"
                          className="w-full border border-gray-300 text-sm px-2 py-1.5 mb-2 focus:outline-none focus:border-black"
                        />
                        <div className="max-h-48 overflow-y-auto flex flex-col gap-0.5">
                          {professors
                            .filter(p => !extProfSearch || p.name.includes(extProfSearch))
                            .map(p => (
                              <button
                                key={p.id}
                                onClick={() => { setSelProfId(p.id); setShowExtProf(false) }}
                                className={`text-left text-xs px-2 py-1.5 hover:bg-gray-100 transition rounded ${selProfId === p.id ? 'bg-black text-white' : ''}`}
                              >
                                {p.name}{p.specialty ? ` (${p.specialty})` : ''}
                              </button>
                            ))}
                          {professors.filter(p => !extProfSearch || p.name.includes(extProfSearch)).length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-2">검색 결과 없음</p>
                          )}
                        </div>
                      </div>
                    )}
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

      {roleModalUser && (
        <RoleManageModal
          user={roleModalUser}
          onClose={() => setRoleModalUser(null)}
          onSave={handleSaveRole}
        />
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
