import type { DepartmentDetailDto } from '../types/department'

export async function fetchDepartmentDetail(id: number): Promise<DepartmentDetailDto> {
  const res = await fetch(`/api/departments/${id}`)
  if (!res.ok) throw new Error('학과 정보를 불러오지 못했습니다')
  return res.json()
}
