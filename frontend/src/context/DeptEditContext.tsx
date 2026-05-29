import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { DeptPageContentDto } from '../types/department'
import { updateDeptContentSection } from '../api/adminDeptContent'

interface DeptEditCtx {
  isEditMode: boolean
  deptId: number | undefined
  saveSection: (section: string, value: DeptPageContentDto) => Promise<void>
  saving: boolean
}

const DeptEditContext = createContext<DeptEditCtx>({
  isEditMode: false,
  deptId: undefined,
  saveSection: async () => {},
  saving: false,
})

interface DeptEditProviderProps {
  children: ReactNode
  deptId?: number
  onSaved?: () => void
}

export function DeptEditProvider({ children, deptId, onSaved }: DeptEditProviderProps) {
  const [saving, setSaving] = useState(false)

  const saveSection = useCallback(async (section: string, value: DeptPageContentDto) => {
    setSaving(true)
    try {
      await updateDeptContentSection(section, value, deptId)
      onSaved?.()
    } finally {
      setSaving(false)
    }
  }, [deptId, onSaved])

  return (
    <DeptEditContext.Provider value={{ isEditMode: true, deptId, saveSection, saving }}>
      {children}
    </DeptEditContext.Provider>
  )
}

export function useDeptEdit() {
  return useContext(DeptEditContext)
}
