const headers = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'X-Username': sessionStorage.getItem('username') ?? '',
})

function handle403(res: Response) {
  if (res.status === 403) {
    window.location.href = '/universities'
    throw new Error('Forbidden')
  }
}

export interface SuperStats {
  totalUsers: number
  newUsers7d: number
  newUsers30d: number
  totalSchools: number
}

export interface School {
  id: number
  name: string
  description: string
}

export interface VisitorPoint {
  date: string
  count: number
}

export interface InfraStats {
  usedMemoryMB: number
  maxMemoryMB: number
  activeThreads: number
  uptimeHours: number
  uptimeMinutes: number
}

export interface AdminUser {
  id: number
  username: string
  name: string
  adminRole: string | null
  approved: boolean
  universityId: string | null
}

export async function fetchSuperStats(): Promise<SuperStats> {
  const res = await fetch('/api/admin/super/stats', { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSuperSchools(): Promise<School[]> {
  const res = await fetch('/api/admin/super/schools', { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSuperVisitors(): Promise<VisitorPoint[]> {
  const res = await fetch('/api/admin/super/visitors', { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSuperInfra(): Promise<InfraStats> {
  const res = await fetch('/api/admin/super/infra', { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSuperUsers(): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/super/users', { headers: headers() })
  handle403(res)
  return res.json()
}

export async function updateUserRole(userId: number, role: string): Promise<void> {
  const res = await fetch(`/api/admin/super/users/${userId}/role`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ role }),
  })
  handle403(res)
}

export async function approveUser(userId: number, approved: boolean): Promise<void> {
  const res = await fetch(`/api/admin/super/users/${userId}/approve`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ approved }),
  })
  handle403(res)
}
