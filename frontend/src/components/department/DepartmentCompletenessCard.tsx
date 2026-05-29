import type { DepartmentDetailDto } from '../../types/department'
import type { DepartmentExtra } from '../../data/departmentExtras'

interface DepartmentCompletenessCardProps {
  dept: DepartmentDetailDto
  extra: DepartmentExtra
}

export default function DepartmentCompletenessCard({ dept, extra }: DepartmentCompletenessCardProps) {
  const checks = [
    { label: '공식 소개', done: dept.description.trim().length > 0, source: '공식' },
    { label: '교수진', done: dept.professors.length > 0, source: '공식' },
    { label: '교육과정', done: dept.curriculum.length > 0, source: '공식' },
    { label: '연락처', done: Boolean(dept.phone || dept.email || dept.address), source: '공식/일부' },
    { label: '진로 가이드', done: extra.careers.length > 0, source: '학생 참고' },
    { label: 'FAQ', done: extra.faqs.length > 0, source: '학생 참고' },
  ]
  const missing = checks.filter(item => !item.done).map(item => item.label)
  const officialDone = checks.filter(item => item.done && item.source !== '학생 참고').length
  const guideDone = checks.filter(item => item.done && item.source === '학생 참고').length

  return (
    <aside className="border-2 border-black p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Source Coverage</p>
          <h3 className="text-xl font-black">정보 출처 현황</h3>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-black">공식 {officialDone}개</p>
          <p className="text-sm text-gray-500">참고 {guideDone}개</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500 leading-relaxed">
        점수보다 어떤 정보가 공식 데이터이고 어떤 정보가 학생용 참고 가이드인지 구분해 보여줍니다.
      </p>
      <div className="mt-4 space-y-2">
        {checks.map(item => (
          <div key={item.label} className={`border px-3 py-2 text-xs font-bold flex items-center justify-between gap-3 ${
            item.done ? 'border-black bg-black text-white' : 'border-gray-400 text-gray-500'
          }`}>
            <span>{item.done ? '반영' : '보완 필요'} · {item.label}</span>
            <span>{item.source}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-gray-500 leading-relaxed">
        {missing.length > 0
          ? `보완 필요: ${missing.join(', ')}`
          : '공식 정보와 학생용 참고 가이드가 모두 표시됩니다.'}
      </p>
    </aside>
  )
}
