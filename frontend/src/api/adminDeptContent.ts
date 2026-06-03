import type { DeptPageContentDto } from '../types/department'
import { readError } from './_error'

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

function deptParam(deptId?: number) {
  return deptId != null ? `deptId=${deptId}` : ''
}

function qs(...parts: string[]) {
  const filtered = parts.filter(Boolean)
  return filtered.length ? '?' + filtered.join('&') : ''
}

export async function fetchDeptContent(deptId?: number): Promise<DeptPageContentDto> {
  const res = await fetch('/api/admin/dept/content' + qs(deptParam(deptId)), { headers: headers() })
  handle403(res)
  if (!res.ok) throw new Error('학과 콘텐츠를 불러오지 못했습니다')
  return res.json()
}

export async function updateDeptContent(body: DeptPageContentDto, deptId?: number): Promise<void> {
  const res = await fetch('/api/admin/dept/content' + qs(deptParam(deptId)), {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  })
  handle403(res)
  if (!res.ok) throw new Error(await readError(res, '학과 콘텐츠 저장에 실패했습니다.'))
}

export async function updateDeptContentSection(
  section: string,
  value: DeptPageContentDto,
  deptId?: number,
): Promise<void> {
  const res = await fetch(
    `/api/admin/dept/content/section/${section}` + qs(deptParam(deptId)),
    {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(value),
    },
  )
  handle403(res)
  if (!res.ok) throw new Error(await readError(res, '학과 콘텐츠 저장에 실패했습니다.'))
}
