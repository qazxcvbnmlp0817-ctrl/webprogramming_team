import { useState } from 'react'
import type { AdminUser } from '../../api/adminSchool'

interface Props {
  user: AdminUser
  onClose: () => void
  onSave: (userId: number, newRole: string) => Promise<void>
}

const ROLE_OPTIONS = [
  { value: '', label: '없음', desc: '관리자 역할 없음' },
  { value: 'DEPT_ADMIN', label: 'DEPT_ADMIN', desc: '단과대 / 학과 관리자' },
  { value: 'SCHOOL_ADMIN', label: 'SCHOOL_ADMIN', desc: '학교 관리자' },
]

export default function RoleManageModal({ user, onClose, onSave }: Props) {
  const [selected, setSelected] = useState(user.adminRole ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAdminType = user.memberType === 'admin'
  const unchanged = selected === (user.adminRole ?? '')

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await onSave(user.id, selected)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '역할 변경에 실패했습니다.')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-label="역할 관리"
    >
      <div className="bg-white w-full max-w-md border-2 border-black p-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold">역할 관리</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {user.name}
              <span className="ml-1 text-gray-400">({user.username})</span>
              <span className="ml-2 text-xs">
                유형:{' '}
                <span className="border border-gray-300 px-1.5 py-0.5">
                  {user.memberType}
                </span>
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="text-gray-400 hover:text-black text-xl leading-none ml-4"
          >
            ✕
          </button>
        </div>

        {/* 현재 역할 */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">현재 역할</p>
          <span className="border border-gray-300 px-2 py-0.5 text-xs font-mono">
            {user.adminRole ?? '없음'}
          </span>
        </div>

        {/* 역할 선택 */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">변경할 역할</p>
          <div className="flex flex-col gap-2">
            {ROLE_OPTIONS.map(opt => {
              const disabled = opt.value === '' && isAdminType
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 border px-3 py-2 ${
                    disabled
                      ? 'opacity-40 cursor-not-allowed border-gray-200'
                      : 'cursor-pointer border-gray-300 hover:border-black'
                  } ${selected === opt.value ? 'border-black bg-gray-50' : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={opt.value}
                    checked={selected === opt.value}
                    onChange={() => !disabled && setSelected(opt.value)}
                    disabled={disabled}
                    className="accent-black"
                  />
                  <span>
                    <span className="text-sm font-medium">{opt.label || '없음'}</span>
                    <span className="text-xs text-gray-400 ml-2">{opt.desc}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-4">
          ℹ SCHOOL_ADMIN은 DEPT_ADMIN을 포함합니다.
        </p>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        {/* 버튼 */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="border border-gray-300 px-4 py-2 text-sm hover:border-black transition"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={unchanged || saving}
            className="border border-black px-4 py-2 text-sm bg-black text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
