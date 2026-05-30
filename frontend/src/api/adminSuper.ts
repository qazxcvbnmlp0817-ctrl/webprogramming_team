import type { SchoolDraft } from '../types/schoolDraft'

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
  memberType: string
  adminRole: string | null
  status: string
  approved: boolean
  department: string | null
  universityId: string | null
  createdDate: string
}

export type PendingAdmin = AdminUser

export interface AdminLog {
  id: number
  actionType: string
  actorUsername: string
  targetUsername: string | null
  detail: string | null
  createdAt: string
}

export async function fetchAllAdminLogs(): Promise<AdminLog[]> {
  const res = await fetch('/api/admin/super/logs', { headers: headers() })
  handle403(res)
  return res.json()
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

export async function fetchPendingAdmins(): Promise<PendingAdmin[]> {
  const res = await fetch('/api/admin/super/pending-admins', { headers: headers() })
  handle403(res)
  return res.json()
}

export async function approveAdmin(
  userId: number,
  approve: boolean,
  role?: string,
): Promise<void> {
  const res = await fetch(`/api/admin/super/users/${userId}/approve-admin`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ approve, role: role ?? null }),
  })
  handle403(res)
}

export async function fetchSchoolTree(id: number): Promise<SchoolDraft> {
  const res = await fetch(`/api/admin/super/schools/${id}/tree`, { headers: headers() })
  handle403(res)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function createSchool(draft: SchoolDraft): Promise<{ id: number }> {
  const res = await fetch('/api/admin/super/schools', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(draft),
  })
  handle403(res)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateSchool(id: number, draft: SchoolDraft): Promise<void> {
  const res = await fetch(`/api/admin/super/schools/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(draft),
  })
  handle403(res)
  if (!res.ok) throw new Error(await res.text())
}

export async function deleteSchool(id: number): Promise<void> {
  const res = await fetch(`/api/admin/super/schools/${id}`, {
    method: 'DELETE',
    headers: headers(),
  })
  handle403(res)
  if (!res.ok) throw new Error(await res.text())
}
