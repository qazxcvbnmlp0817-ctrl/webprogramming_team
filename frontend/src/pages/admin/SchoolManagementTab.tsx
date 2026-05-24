import { useState, useEffect } from 'react'
import type { School } from '../../api/adminSuper'
import {
  fetchSuperSchools,
  fetchSchoolTree,
  createSchool,
  updateSchool,
  deleteSchool,
} from '../../api/adminSuper'
import type { SchoolDraft } from '../../types/schoolDraft'
import { emptyDraft } from '../../types/schoolDraft'
import SchoolTreeEditor from './SchoolTreeEditor'

type View = 'list' | 'create' | 'edit'

export default function SchoolManagementTab() {
  const [view, setView]           = useState<View>('list')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [schools, setSchools]     = useState<School[]>([])
  const [draft, setDraft]         = useState<SchoolDraft>(emptyDraft)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const loadSchools = () => fetchSuperSchools().then(setSchools)

  useEffect(() => { loadSchools() }, [])

  const handleCreate = () => {
    setDraft(emptyDraft)
    setEditingId(null)
    setError(null)
    setView('create')
  }

  const handleEdit = async (id: number) => {
    setError(null)
    const tree = await fetchSchoolTree(id)
    setDraft(tree)
    setEditingId(id)
    setView('edit')
  }

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`"${name}"을(를) 정말 삭제하시겠습니까?`)) return
    if (!window.confirm(
      `이 작업은 되돌릴 수 없습니다.\n학교와 모든 하위 데이터(단과대학, 학부, 학과, 교수, 교육과정)가 영구 삭제됩니다.`
    )) return
    await deleteSchool(id)
    loadSchools()
  }

  const handleSubmit = async () => {
    if (!draft.name.trim()) { setError('학교 이름은 필수입니다.'); return }
    setSubmitting(true)
    setError(null)
    try {
      if (view === 'create') {
        await createSchool(draft)
      } else if (view === 'edit' && editingId !== null) {
        await updateSchool(editingId, draft)
      }
      await loadSchools()
      setView('list')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── List 뷰 ──────────────────────────────────────────────────────────────

  if (view === 'list') {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={handleCreate}
            className="border-2 border-black bg-black text-white px-4 py-2 text-xs hover:bg-gray-900 transition"
          >
            + 새 학교 생성
          </button>
        </div>

        <div className="border-2 border-black overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
                <th className="text-left px-4 py-3 w-16">ID</th>
                <th className="text-left px-4 py-3">이름</th>
                <th className="text-left px-4 py-3">설명</th>
                <th className="text-right px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody>
              {schools.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-400 text-sm">
                    등록된 학교가 없습니다.
                  </td>
                </tr>
              )}
              {schools.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}
                >
                  <td className="px-4 py-3 text-gray-400 text-xs">{s.id}</td>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-xs">
                    {s.description || '-'}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(s.id)}
                      className="text-xs border border-gray-400 px-3 py-1 hover:bg-gray-100 transition"
                    >
                      편집
                    </button>
                    <button
                      onClick={() => handleDelete(s.id, s.name)}
                      className="text-xs border border-red-300 text-red-500 px-3 py-1 hover:bg-red-50 transition"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ── Create / Edit 폼 뷰 ───────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <button
        onClick={() => setView('list')}
        className="text-xs text-gray-500 hover:text-black flex items-center gap-1.5 transition"
      >
        <i className="fas fa-arrow-left" />
        목록으로
      </button>

      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
        {view === 'create' ? '새 학교 생성' : '학교 정보 수정'}
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">학교 이름 *</label>
          <input
            className="w-full border-2 border-black px-3 py-2 text-sm focus:outline-none"
            placeholder="예: 목포대학교"
            value={draft.name}
            onChange={e => setDraft({ ...draft, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">설명 (선택)</label>
          <input
            className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
            placeholder="학교 소개"
            value={draft.description}
            onChange={e => setDraft({ ...draft, description: e.target.value })}
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
          단과대학 구조
        </p>
        <SchoolTreeEditor draft={draft} onChange={setDraft} />
      </div>

      {error && (
        <p className="text-sm text-red-500 border border-red-200 px-3 py-2">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={() => setView('list')}
          className="border border-gray-300 px-5 py-2 text-sm hover:bg-gray-50 transition"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="border-2 border-black bg-black text-white px-5 py-2 text-sm hover:bg-gray-900 transition disabled:opacity-50"
        >
          {submitting ? '저장 중...' : view === 'create' ? '생성' : '저장'}
        </button>
      </div>
    </div>
  )
}
