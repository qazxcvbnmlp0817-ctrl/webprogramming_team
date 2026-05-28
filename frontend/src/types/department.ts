export interface ProfessorDto {
  id: number
  name: string
  specialty: string
  email: string
}

export interface CurriculumItemDto {
  name: string
  year: string
  required: boolean
  credit: number
  category?: string
}

export interface DepartmentDetailDto {
  id: number
  name: string
  description: string
  professors: ProfessorDto[]
  curriculum: CurriculumItemDto[]
  address: string
  phone: string
  email: string
  hours: string
}
