import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { SchoolPageContentDto } from '../types/schoolInfo'
import { updateSchoolContentSection } from '../api/adminSchool'

interface SchoolEditCtx {
  isEditMode: boolean
  univId: number | undefined
  saveSection: (section: string, value: SchoolPageContentDto) => Promise<void>
  saving: boolean
}

const SchoolEditContext = createContext<SchoolEditCtx>({
  isEditMode: false,
  univId: undefined,
  saveSection: async () => {},
  saving: false,
})

interface SchoolEditProviderProps {
  children: ReactNode
  univId?: number
  onSaved?: () => void
}

export function SchoolEditProvider({ children, univId, onSaved }: SchoolEditProviderProps) {
  const [saving, setSaving] = useState(false)

  const saveSection = useCallback(async (section: string, value: SchoolPageContentDto) => {
    setSaving(true)
    try {
      await updateSchoolContentSection(section, value, univId)
      onSaved?.()
    } finally {
      setSaving(false)
    }
  }, [univId, onSaved])

  return (
    <SchoolEditContext.Provider value={{ isEditMode: true, univId, saveSection, saving }}>
      {children}
    </SchoolEditContext.Provider>
  )
}

export function useSchoolEdit() {
  return useContext(SchoolEditContext)
}
