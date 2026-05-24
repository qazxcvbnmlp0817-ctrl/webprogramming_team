import type { SchoolDraft, CollegeDraft, FacultyDraft, DeptDraft } from '../types/schoolDraft'

// ── College ──────────────────────────────────────────────────────────────────

export function addCollege(draft: SchoolDraft): SchoolDraft {
  const newCollege: CollegeDraft = { id: null, name: '', description: '', faculties: [] }
  return { ...draft, colleges: [...draft.colleges, newCollege] }
}

export function removeCollege(draft: SchoolDraft, ci: number): SchoolDraft {
  return { ...draft, colleges: draft.colleges.filter((_, i) => i !== ci) }
}

export function updateCollege(
  draft: SchoolDraft,
  ci: number,
  updated: CollegeDraft,
): SchoolDraft {
  return {
    ...draft,
    colleges: draft.colleges.map((c, i) => (i === ci ? updated : c)),
  }
}

// ── Faculty ───────────────────────────────────────────────────────────────────

export function addFaculty(college: CollegeDraft): CollegeDraft {
  const newFaculty: FacultyDraft = { id: null, name: '', departments: [] }
  return { ...college, faculties: [...college.faculties, newFaculty] }
}

export function removeFaculty(college: CollegeDraft, fi: number): CollegeDraft {
  return { ...college, faculties: college.faculties.filter((_, i) => i !== fi) }
}

export function updateFaculty(
  college: CollegeDraft,
  fi: number,
  updated: FacultyDraft,
): CollegeDraft {
  return {
    ...college,
    faculties: college.faculties.map((f, i) => (i === fi ? updated : f)),
  }
}

// ── Department ────────────────────────────────────────────────────────────────

export function addDept(faculty: FacultyDraft): FacultyDraft {
  const newDept: DeptDraft = { id: null, name: '', description: '', phone: '', email: '' }
  return { ...faculty, departments: [...faculty.departments, newDept] }
}

export function removeDept(faculty: FacultyDraft, di: number): FacultyDraft {
  return { ...faculty, departments: faculty.departments.filter((_, i) => i !== di) }
}

export function updateDept(
  faculty: FacultyDraft,
  di: number,
  updated: DeptDraft,
): FacultyDraft {
  return {
    ...faculty,
    departments: faculty.departments.map((d, i) => (i === di ? updated : d)),
  }
}
