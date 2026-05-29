import { useMemo, useState } from 'react'
import type { CurriculumItemDto } from '../../types/department'
import SourceBadge from './SourceBadge'

interface CurriculumSectionProps {
  curriculum: CurriculumItemDto[]
}

const yearFilters = ['전체', '1', '2', '3', '4']
const semesterFilters = ['전체', '1학기', '2학기', '전체(1,2학기)']

function matchesYear(itemYear: string, selectedYear: string) {
  return selectedYear === '전체' || itemYear.includes(selectedYear) || itemYear.includes('전체')
}

function matchesSemester(itemSemester: string | null | undefined, selectedSemester: string) {
  const semester = itemSemester ?? ''
  return selectedSemester === '전체' || semester === selectedSemester
}

function formatYear(itemYear: string) {
  if (!itemYear) return '미공개'
  return itemYear.includes('학년') ? itemYear : `${itemYear}학년`
}

function formatSemester(itemSemester: string | null | undefined) {
  return itemSemester || '미공개'
}

function getCareerTags(name: string) {
  const tags: string[] = []
  if (/프로그래밍|소프트웨어|웹|모바일|시스템|임베디드/.test(name)) tags.push('개발')
  if (/데이터|AI|인공지능|딥러닝|분석/.test(name)) tags.push('데이터/AI')
  if (/통신|네트워크|IoT|리눅스|운영체제/.test(name)) tags.push('시스템')
  if (/캡스톤|프로젝트|설계|실습/.test(name)) tags.push('프로젝트')
  return tags.length > 0 ? tags : ['기초역량']
}

function sortCurriculum(a: CurriculumItemDto, b: CurriculumItemDto) {
  const yearOrder = (value: string) => value.includes('전체') ? 0 : Number(value.replace(/\D/g, '')) || 9
  const semesterOrder = (value: string | null | undefined) => {
    if (value === '1학기') return 1
    if (value === '2학기') return 2
    if (value === '전체(1,2학기)') return 0
    return 9
  }
  return yearOrder(a.year) - yearOrder(b.year)
    || semesterOrder(a.semester) - semesterOrder(b.semester)
    || a.name.localeCompare(b.name, 'ko')
}

export default function CurriculumSection({ curriculum }: CurriculumSectionProps) {
  const [selectedYear, setSelectedYear] = useState('전체')
  const [selectedSemester, setSelectedSemester] = useState('전체')

  const ordered = useMemo(() => [...curriculum].sort(sortCurriculum), [curriculum])
  const filtered = useMemo(
    () => ordered.filter(item =>
      matchesYear(item.year, selectedYear) && matchesSemester(item.semester, selectedSemester),
    ),
    [ordered, selectedYear, selectedSemester],
  )

  const totalCredits = filtered.reduce((sum, item) => sum + (item.credit > 0 ? item.credit : 0), 0)
  const categoryStats = useMemo(() => {
    const counts = new Map<string, number>()
    ordered.forEach(item => {
      const key = item.category || '분류 미공개'
      counts.set(key, (counts.get(key) ?? 0) + 1)
    })
    return [...counts.entries()]
  }, [ordered])
  const yearStats = yearFilters
    .filter(year => year !== '전체')
    .map(year => ({ year, count: ordered.filter(item => matchesYear(item.year, year)).length }))

  return (
    <section id="curriculum" className="max-w-6xl mx-auto px-4 py-12 scroll-mt-32">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 border-b-2 border-black pb-3">
        <div>
          <p className="text-sm text-gray-500">Curriculum 2026</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-3xl font-black">2026 교육과정</h2>
            <SourceBadge type="official" />
          </div>
          <p className="text-sm text-gray-500 mt-2">컴퓨터학부와 컴퓨터공학전공 2026 교육과정표 기준입니다.</p>
        </div>
        <div className="border-2 border-black px-4 py-2 text-sm font-black">
          표시 과목 {filtered.length}개 / 학점 합계 {totalCredits || '미공개'}
        </div>
      </div>

      {curriculum.length === 0 ? (
        <div className="border-2 border-black p-8 text-center">
          <i className="fas fa-book-open text-3xl mb-3 block text-gray-400" />
          <p className="font-black">교육과정 데이터 연결 대기 중</p>
          <p className="text-sm text-gray-500 mt-2">
            현재 학과의 공식 교육과정 데이터가 아직 등록되지 않았습니다.
          </p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-[1fr_1fr] gap-4 mb-5">
            <div className="border-2 border-black p-4">
              <p className="font-black mb-3">이수구분별 과목 수</p>
              <div className="grid grid-cols-2 gap-2">
                {categoryStats.map(([category, count]) => (
                  <div key={category} className="border border-gray-300 p-2">
                    <p className="text-xs text-gray-500 truncate">{category}</p>
                    <p className="font-black">{count}개</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-2 border-black p-4">
              <p className="font-black mb-3">학년별 과목 수</p>
              <div className="grid grid-cols-4 gap-2">
                {yearStats.map(stat => (
                  <div key={stat.year} className="bg-black text-white p-2 text-center">
                    <p className="text-xs">{stat.year}학년</p>
                    <p className="text-lg font-black">{stat.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mb-5">
            <div className="border-2 border-black p-3">
              <p className="text-xs font-bold text-gray-500 mb-2">학년</p>
              <div className="flex flex-wrap gap-2">
                {yearFilters.map(year => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setSelectedYear(year)}
                    className={`border-2 border-black px-4 py-2 text-sm font-bold transition ${
                      selectedYear === year ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    {year === '전체' ? year : `${year}학년`}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-2 border-black p-3">
              <p className="text-xs font-bold text-gray-500 mb-2">학기</p>
              <div className="flex flex-wrap gap-2">
                {semesterFilters.map(semester => (
                  <button
                    key={semester}
                    type="button"
                    onClick={() => setSelectedSemester(semester)}
                    className={`border-2 border-black px-4 py-2 text-sm font-bold transition ${
                      selectedSemester === semester ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    {semester}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {filtered.map(item => (
              <article key={`mobile-${item.year}-${item.semester}-${item.name}`} className="border-2 border-black p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-black leading-snug">{item.name}</h3>
                  <span className="border border-black px-2 py-1 text-xs font-bold shrink-0">
                    {item.required ? '필수' : '선택'}
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="border border-gray-300 p-2">
                    <dt className="text-xs text-gray-500">학년</dt>
                    <dd className="font-bold">{formatYear(item.year)}</dd>
                  </div>
                  <div className="border border-gray-300 p-2">
                    <dt className="text-xs text-gray-500">학기</dt>
                    <dd className="font-bold">{formatSemester(item.semester)}</dd>
                  </div>
                  <div className="border border-gray-300 p-2">
                    <dt className="text-xs text-gray-500">학점</dt>
                    <dd className="font-bold">{item.credit || '미공개'}</dd>
                  </div>
                  <div className="border border-gray-300 p-2">
                    <dt className="text-xs text-gray-500">이수구분</dt>
                    <dd className="font-bold">{item.category || '분류 미공개'}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {getCareerTags(item.name).map(tag => (
                    <span key={tag} className="bg-black text-white px-2 py-1 text-xs font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto border-2 border-black">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="bg-black text-white">
                  <th className="px-4 py-3 text-left font-bold border-r border-gray-700">과목명</th>
                  <th className="px-4 py-3 text-center font-bold border-r border-gray-700">학년</th>
                  <th className="px-4 py-3 text-center font-bold border-r border-gray-700">학기</th>
                  <th className="px-4 py-3 text-center font-bold border-r border-gray-700">이수구분</th>
                  <th className="px-4 py-3 text-center font-bold border-r border-gray-700">필수/선택</th>
                  <th className="px-4 py-3 text-center font-bold">학점</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(item => (
                  <tr key={`${item.year}-${item.semester}-${item.name}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold border-r border-gray-200">{item.name}</td>
                    <td className="px-4 py-3 text-center border-r border-gray-200">{formatYear(item.year)}</td>
                    <td className="px-4 py-3 text-center border-r border-gray-200">{formatSemester(item.semester)}</td>
                    <td className="px-4 py-3 text-center border-r border-gray-200">
                      <span className="border border-black px-2 py-1 text-xs font-bold">
                        {item.category || '분류 미공개'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center border-r border-gray-200">
                      {item.required ? '필수' : '선택'}
                    </td>
                    <td className="px-4 py-3 text-center">{item.credit || '미공개'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
