export interface DeptDraft {
  id: number | null
  name: string
  description: string
  phone: string
  email: string
}

export interface FacultyDraft {
  id: number | null
  name: string
  departments: DeptDraft[]
}

export interface CollegeDraft {
  id: number | null
  name: string
  description: string
  faculties: FacultyDraft[]
}

export interface SchoolDraft {
  name: string
  description: string
  colleges: CollegeDraft[]
}

export const emptyDraft: SchoolDraft = {
  name: '',
  description: '',
  colleges: [],
}
