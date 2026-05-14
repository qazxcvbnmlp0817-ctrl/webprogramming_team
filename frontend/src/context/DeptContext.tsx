import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface DeptState {
  selectedDeptId: number | null
  selectedDeptName: string | null
  selectedUniversityId: number | null
  selectedUniversityName: string | null
  selectedSchoolName: string | null
}

interface DeptContextType extends DeptState {
  setDept: (state: DeptState) => void
  clearDept: () => void
}

const STORAGE_KEY = 'deptState'

function loadFromStorage(): DeptState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : emptyState()
  } catch {
    return emptyState()
  }
}

function emptyState(): DeptState {
  return {
    selectedDeptId: null,
    selectedDeptName: null,
    selectedUniversityId: null,
    selectedUniversityName: null,
    selectedSchoolName: null,
  }
}

const DeptContext = createContext<DeptContextType | null>(null)

export function DeptProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DeptState>(loadFromStorage)

  const setDept = (next: DeptState) => {
    setState(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const clearDept = () => {
    setState(emptyState())
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <DeptContext.Provider value={{ ...state, setDept, clearDept }}>
      {children}
    </DeptContext.Provider>
  )
}

export function useDept(): DeptContextType {
  const ctx = useContext(DeptContext)
  if (!ctx) throw new Error('useDept must be used inside DeptProvider')
  return ctx
}
