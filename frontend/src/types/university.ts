export interface DeptSelectionDto {
  id: number
  name: string
  facultyId: number
}

export interface FacultyDto {
  id: number
  name: string
  schoolId: number
  depts: DeptSelectionDto[]
}

export interface SchoolDto {
  id: number
  name: string
  description: string
  faculties: FacultyDto[]
}

export interface UniversityDto {
  id: number
  name: string
  description: string
  schools: SchoolDto[]
  totalDeptCount: number
}
