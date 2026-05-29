import type { SchoolDraft, CollegeDraft, FacultyDraft, DeptDraft } from '../../types/schoolDraft'
import {
  addCollege, removeCollege, updateCollege,
  addFaculty, removeFaculty, updateFaculty,
  addDept, removeDept, updateDept,
} from '../../utils/schoolDraftHelpers'

interface TreeEditorProps {
  draft: SchoolDraft
  onChange: (draft: SchoolDraft) => void
}

export default function SchoolTreeEditor({ draft, onChange }: TreeEditorProps) {
  return (
    <div className="space-y-3">
      {draft.colleges.map((college, ci) => (
        <CollegeEditor
          key={ci}
          college={college}
          onChange={updated => onChange(updateCollege(draft, ci, updated))}
          onRemove={() => onChange(removeCollege(draft, ci))}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange(addCollege(draft))}
        className="w-full border-2 border-dashed border-gray-300 py-2.5 text-xs text-gray-400 hover:border-black hover:text-black transition"
      >
        + 단과대학 추가
      </button>
    </div>
  )
}

// ── CollegeEditor ─────────────────────────────────────────────────────────────

interface CollegeProps {
  college: CollegeDraft
  onChange: (college: CollegeDraft) => void
  onRemove: () => void
}

function CollegeEditor({ college, onChange, onRemove }: CollegeProps) {
  return (
    <div className="border-2 border-black p-4 space-y-3">
      <div className="flex gap-2 items-start">
        <div className="flex-1 space-y-1.5">
          <input
            className="w-full border border-gray-400 px-3 py-1.5 text-sm focus:outline-none focus:border-black"
            placeholder="단과대학 이름 *"
            value={college.name}
            onChange={e => onChange({ ...college, name: e.target.value })}
          />
          <input
            className="w-full border border-gray-200 px-3 py-1 text-xs text-gray-500 focus:outline-none focus:border-black"
            placeholder="설명 (선택)"
            value={college.description}
            onChange={e => onChange({ ...college, description: e.target.value })}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="border border-red-300 text-red-400 px-2 py-1.5 text-xs hover:bg-red-50 transition"
        >
          삭제
        </button>
      </div>

      <div className="pl-4 space-y-2 border-l-2 border-gray-200">
        {college.faculties.map((faculty, fi) => (
          <FacultyEditor
            key={fi}
            faculty={faculty}
            onChange={updated => onChange(updateFaculty(college, fi, updated))}
            onRemove={() => onChange(removeFaculty(college, fi))}
          />
        ))}
        <button
          type="button"
          onClick={() => onChange(addFaculty(college))}
          className="w-full border border-dashed border-gray-300 py-1.5 text-xs text-gray-400 hover:border-gray-600 hover:text-gray-600 transition"
        >
          + 학부 추가
        </button>
      </div>
    </div>
  )
}

// ── FacultyEditor ─────────────────────────────────────────────────────────────

interface FacultyProps {
  faculty: FacultyDraft
  onChange: (faculty: FacultyDraft) => void
  onRemove: () => void
}

function FacultyEditor({ faculty, onChange, onRemove }: FacultyProps) {
  return (
    <div className="border border-gray-300 p-3 space-y-2 bg-gray-50">
      <div className="flex gap-2 items-center">
        <input
          className="flex-1 border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-black bg-white"
          placeholder="학부 이름 *"
          value={faculty.name}
          onChange={e => onChange({ ...faculty, name: e.target.value })}
        />
        <button
          type="button"
          onClick={onRemove}
          className="border border-red-300 text-red-400 px-2 py-1 text-xs hover:bg-red-50 transition"
        >
          삭제
        </button>
      </div>

      <div className="pl-3 space-y-1.5 border-l border-gray-300">
        {faculty.departments.map((dept, di) => (
          <DeptRow
            key={di}
            dept={dept}
            onChange={updated => onChange(updateDept(faculty, di, updated))}
            onRemove={() => onChange(removeDept(faculty, di))}
          />
        ))}
        <button
          type="button"
          onClick={() => onChange(addDept(faculty))}
          className="w-full border border-dashed border-gray-200 py-1 text-xs text-gray-400 hover:border-gray-400 hover:text-gray-500 transition"
        >
          + 학과 추가
        </button>
      </div>
    </div>
  )
}

// ── DeptRow ───────────────────────────────────────────────────────────────────

interface DeptProps {
  dept: DeptDraft
  onChange: (dept: DeptDraft) => void
  onRemove: () => void
}

function DeptRow({ dept, onChange, onRemove }: DeptProps) {
  return (
    <div className="flex gap-2 items-center">
      <input
        className="flex-1 border border-gray-200 px-3 py-1 text-xs focus:outline-none focus:border-black bg-white"
        placeholder="학과 이름 *"
        value={dept.name}
        onChange={e => onChange({ ...dept, name: e.target.value })}
      />
      <button
        type="button"
        onClick={onRemove}
        className="border border-red-200 text-red-400 px-2 py-0.5 text-xs hover:bg-red-50 transition"
      >
        삭제
      </button>
    </div>
  )
}
