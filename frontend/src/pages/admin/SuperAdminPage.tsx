import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import Navbar from '../../components/Navbar'
import {
  fetchSuperStats, fetchSuperSchools, fetchSuperVisitors,
  fetchSuperInfra, fetchSuperUsers, updateUserRole, approveUser,
  fetchPendingAdmins, approveAdmin,
} from '../../api/adminSuper'
import type {
  SuperStats, School, VisitorPoint, InfraStats, AdminUser, PendingAdmin,
} from '../../api/adminSuper'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

export default function SuperAdminPage() {
  const navigate = useNavigate()
  const [stats, setStats]     = useState<SuperStats | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [visitors, setVisitors] = useState<VisitorPoint[]>([])
  const [infra, setInfra]     = useState<InfraStats | null>(null)
  const [users, setUsers]     = useState<AdminUser[]>([])
  const [pending, setPending] = useState<PendingAdmin[]>([])
  // Role chosen per pending row before clicking 승인. Default SCHOOL_ADMIN.
  const [pendingRoles, setPendingRoles] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)

  const loadAll = () =>
    Promise.all([
      fetchSuperStats(),
      fetchSuperSchools(),
      fetchSuperVisitors(),
      fetchSuperInfra(),
      fetchSuperUsers(),
      fetchPendingAdmins(),
    ]).then(([s, sch, v, i, u, p]) => {
      setStats(s); setSchools(sch); setVisitors(v); setInfra(i); setUsers(u); setPending(p)
      setLoading(false)
    }).catch(() => setLoading(false))

  useEffect(() => { loadAll() }, [])

  const handleRoleChange = async (userId: number, role: string) => {
    await updateUserRole(userId, role)
    const updated = await fetchSuperUsers()
    setUsers(updated)
  }

  const handleApprove = async (userId: number, approved: boolean) => {
    await approveUser(userId, approved)
    const updated = await fetchSuperUsers()
    setUsers(updated)
  }

  const handlePendingApprove = async (userId: number) => {
    const role = pendingRoles[userId] ?? 'SCHOOL_ADMIN'
    if (!window.confirm(`${role} 권한으로 승인하시겠습니까?`)) return
    await approveAdmin(userId, true, role)
    const [p, u] = await Promise.all([fetchPendingAdmins(), fetchSuperUsers()])
    setPending(p); setUsers(u)
  }

  const handlePendingReject = async (userId: number) => {
    if (!window.confirm('이 가입 신청을 거절하시겠습니까? 거절 후에는 로그인이 불가합니다.')) return
    await approveAdmin(userId, false)
    const p = await fetchPendingAdmins()
    setPending(p)
  }

  const visitorLineData = {
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

  const userBarData = {
    labels: ['7일 신규', '30일 신규', '전체'],
    datasets: [{
      label: '사용자',
      data: [stats?.newUsers7d ?? 0, stats?.newUsers30d ?? 0, stats?.totalUsers ?? 0],
      backgroundColor: ['#111827', '#4b5563', '#9ca3af'],
      borderWidth: 0,
    }],
  }

  const chartOptions = {
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
            <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">Super Admin</p>
            <h1 className="text-2xl font-bold">최고 관리자 대시보드</h1>
            <p className="text-gray-400 text-sm mt-1">서버 전체 현황 및 관리자 권한 관리</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="fa-users" label="총 사용자" value={stats?.totalUsers ?? 0} />
          <StatCard icon="fa-user-plus" label="신규 가입 (7일)" value={stats?.newUsers7d ?? 0} />
          <StatCard icon="fa-calendar-alt" label="신규 가입 (30일)" value={stats?.newUsers30d ?? 0} />
          <StatCard icon="fa-university" label="등록 학교" value={stats?.totalSchools ?? 0} />
        </div>

        {/* 차트 영역 */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">방문자 추이 (최근 30일)</h2>
            <Line data={visitorLineData} options={chartOptions} />
          </div>
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">사용자 현황</h2>
            <Bar data={userBarData} options={chartOptions} />
          </div>
        </div>

        {/* 학교 목록 + 인프라 */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">등록 학교 목록</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {schools.length === 0 && <p className="text-sm text-gray-400">등록된 학교가 없습니다.</p>}
              {schools.map(s => (
                <div key={s.id} className="flex items-center justify-between border border-gray-200 px-4 py-2.5 hover:bg-gray-50">
                  <span className="text-sm font-medium">{s.name}</span>
                  <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5">ID {s.id}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">서버 인프라 현황</h2>
            {infra && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">메모리 사용량</span>
                    <span className="font-medium">{infra.usedMemoryMB}MB / {infra.maxMemoryMB}MB</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5">
                    <div
                      className="bg-black h-2.5 transition-all"
                      style={{ width: `${Math.min(100, Math.round((infra.usedMemoryMB / infra.maxMemoryMB) * 100))}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {Math.round((infra.usedMemoryMB / infra.maxMemoryMB) * 100)}% 사용 중
                  </p>
                </div>
                <InfraRow label="활성 스레드" value={`${infra.activeThreads}개`} />
                <InfraRow label="서버 업타임" value={`${infra.uptimeHours}시간 ${infra.uptimeMinutes}분`} />
                <div className="mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  <span className="text-xs text-gray-500">서버 정상 운영 중</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 관리자 가입 승인 대기 */}
        <div className="border-2 border-black p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
            관리자 가입 승인 대기
            {pending.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[1.5rem] h-5 bg-amber-100 border border-amber-400 text-amber-700 text-[10px] font-bold px-1.5">
                {pending.length}
              </span>
            )}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
                  <th className="text-left pb-3 pr-4">이름</th>
                  <th className="text-left pb-3 pr-4">아이디</th>
                  <th className="text-left pb-3 pr-4">학교 ID</th>
                  <th className="text-left pb-3 pr-4">소속</th>
                  <th className="text-left pb-3 pr-4">신청일</th>
                  <th className="text-left pb-3 pr-4">부여 역할</th>
                  <th className="text-left pb-3">처리</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((u, i) => (
                  <tr key={u.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                    <td className="py-3 pr-4 font-medium">{u.name}</td>
                    <td className="py-3 pr-4 text-gray-500">{u.username}</td>
                    <td className="py-3 pr-4 text-gray-400 text-xs">{u.universityId ?? '-'}</td>
                    <td className="py-3 pr-4 text-gray-500 text-xs">{u.department ?? '-'}</td>
                    <td className="py-3 pr-4 text-gray-400 text-xs">{u.createdDate ? u.createdDate.slice(0, 10) : '-'}</td>
                    <td className="py-3 pr-4">
                      <select
                        value={pendingRoles[u.id] ?? 'SCHOOL_ADMIN'}
                        onChange={e => setPendingRoles(prev => ({ ...prev, [u.id]: e.target.value }))}
                        className="border border-gray-300 text-xs px-2 py-1 bg-white"
                      >
                        <option value="SCHOOL_ADMIN">SCHOOL_ADMIN</option>
                        <option value="DEPT_ADMIN">DEPT_ADMIN</option>
                      </select>
                    </td>
                    <td className="py-3 space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handlePendingApprove(u.id)}
                        className="text-xs border border-green-400 text-green-600 px-3 py-1 hover:bg-green-50 transition"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handlePendingReject(u.id)}
                        className="text-xs border border-red-300 text-red-500 px-3 py-1 hover:bg-red-50 transition"
                      >
                        거절
                      </button>
                    </td>
                  </tr>
                ))}
                {pending.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-sm">대기 중인 관리자 가입 신청이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 관리자 계정 관리 */}
        <div className="border-2 border-black p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">관리자 계정 관리</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
                  <th className="text-left pb-3 pr-4">이름</th>
                  <th className="text-left pb-3 pr-4">아이디</th>
                  <th className="text-left pb-3 pr-4">역할</th>
                  <th className="text-left pb-3 pr-4">학교 ID</th>
                  <th className="text-left pb-3 pr-4">상태</th>
                  <th className="text-left pb-3 pr-4">역할 변경</th>
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
                    <td className="py-3 pr-4 text-gray-400 text-xs">{u.universityId ?? '-'}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-bold ${u.approved ? 'text-green-600' : 'text-amber-500'}`}>
                        {u.approved ? '승인됨' : '대기 중'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={u.adminRole ?? ''}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="border border-gray-300 text-xs px-2 py-1 bg-white"
                      >
                        <option value="">없음</option>
                        <option value="SCHOOL_ADMIN">SCHOOL_ADMIN</option>
                        <option value="DEPT_ADMIN">DEPT_ADMIN</option>
                      </select>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleApprove(u.id, !u.approved)}
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
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-sm">관리자 계정이 없습니다.</td></tr>
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

function InfraRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-100">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
