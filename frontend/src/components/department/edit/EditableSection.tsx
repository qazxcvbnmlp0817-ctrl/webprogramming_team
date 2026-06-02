import { useState, type ReactNode } from 'react'
import { useDeptEdit } from '../../../context/DeptEditContext'
import type { DeptPageContentDto } from '../../../types/department'

interface EditableSectionProps {
  sectionKey: string
  title: string
  value: DeptPageContentDto
  renderForm: (value: DeptPageContentDto, onChange: (v: DeptPageContentDto) => void) => ReactNode
  children: ReactNode
}

export default function EditableSection({
  sectionKey,
  title,
  value,
  renderForm,
  children,
}: EditableSectionProps) {
  const { isEditMode, saveSection, saving } = useDeptEdit()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DeptPageContentDto>(value)
  const [error, setError] = useState<string | null>(null)

  if (!isEditMode) return <>{children}</>

  const handleOpen = () => {
    setDraft(value)
    setError(null)
    setOpen(true)
  }

  const handleSave = async () => {
    setError(null)
    try {
      await saveSection(sectionKey, draft)
      setOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패')
    }
  }

  return (
    <div className="relative group outline outline-2 outline-blue-400 outline-offset-[-2px]">
      {children}
      <button
        type="button"
        onClick={handleOpen}
        className="absolute top-2 right-2 z-10 bg-black text-white text-xs px-2.5 py-1 font-bold flex items-center gap-1 hover:bg-gray-800 transition-colors"
        title={`${title} 편집`}
      >
        <i className="fas fa-pen text-[10px]" />
        편집
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white border-2 border-black w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b-2 border-black">
              <h2 className="font-black text-lg">{title}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-black"
              >
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="overflow-y-auto p-5 flex-1">
              {renderForm(draft, setDraft)}
            </div>
            {error && (
              <p className="px-5 pb-2 text-red-600 text-sm font-bold">{error}</p>
            )}
            <div className="flex justify-end gap-3 p-4 border-t-2 border-black">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="border-2 border-black px-4 py-1.5 text-sm font-bold"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-black text-white px-4 py-1.5 text-sm font-bold disabled:opacity-50"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
