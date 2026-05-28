import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { CurriculumItemDto } from '../../types/department'
import SourceBadge from './SourceBadge'

interface CurriculumSectionProps {
  curriculum: CurriculumItemDto[]
}

const yearFilters = ['전체', '1', '2', '3', '4']

function matchesYear(itemYear: string, selectedYear: string) {
  return selectedYear === '전체' || itemYear.includes(selectedYear)
}

function formatYear(itemYear: string) {
  return itemYear.includes('학년') ? itemYear : `${itemYear}학년`
}

function getCareerTags(name: string) {
  const tags: string[] = []
  if (/웹|프로그래밍|소프트웨어|앱|프론트|백엔드/.test(name)) tags.push('개발')
  if (/데이터|인공지능|AI|머신|분석/.test(name)) tags.push('데이터/AI')
  if (/보안|네트워크|운영체제|시스템|암호/.test(name)) tags.push('보안/인프라')
  if (/캡스톤|프로젝트|현장|실습/.test(name)) tags.push('포트폴리오')
  return tags.length > 0 ? tags : ['전공기초']
}

export default function CurriculumSection({ curriculum }: CurriculumSectionProps) {
  const [selectedYear, setSelectedYear] = useState('전체')

  const filtered = useMemo(
    () => curriculum.filter(item => matchesYear(item.year, selectedYear)),
    [curriculum, selectedYear],
  )

  const totalCredits = filtered.reduce((sum, item) => sum + (item.credit > 0 ? item.credit : 0), 0)
  const categoryStats = useMemo(() => {
    const counts = new Map<string, number>()
    curriculum.forEach(item => {
      const key = item.category || '분류 미공개'
      counts.set(key, (counts.get(key) ?? 0) + 1)
    })
    return [...counts.entries()].slice(0, 6)
  }, [curriculum])
  const yearStats = yearFilters
    .filter(year => year !== '전체')
    .map(year => ({ year, count: curriculum.filter(item => matchesYear(item.year, year)).length }))
  const roadmap = useMemo(
    () => yearFilters
      .filter(year => year !== '전체')
      .map(year => ({
        year,
        courses: curriculum.filter(item => matchesYear(item.year, year)).slice(0, 5),
      })),
    [curriculum],
  )

  return (
    <section id="curriculum" className="max-w-6xl mx-auto px-4 py-12 scroll-mt-32">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 border-b-2 border-black pb-3">
        <div>
          <p className="text-sm text-gray-500">Curriculum</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-3xl font-black">교육과정</h2>
            <SourceBadge type="official" />
          </div>
          <p className="text-sm text-gray-500 mt-2">학년 버튼을 눌러 과목 흐름을 바로 확인할 수 있습니다.</p>
        </div>
        <div className="border-2 border-black px-4 py-2 text-sm font-black">
          표시 과목 {filtered.length}개 · 학점 합계 {totalCredits || '공식 미공개'}
        </div>
      </div>

      {curriculum.length === 0 ? (
        <div className="border-2 border-black p-8 text-center">
          <i className="fas fa-book-open text-3xl mb-3 block text-gray-400" />
          <p className="font-black">교육과정 데이터 연결 대기 중</p>
          <p className="text-sm text-gray-500 mt-2">
            이 학과는 현재 공식 페이지에서 과목 단위 교육과정을 확인하지 못했습니다. 공지와 학사 안내 링크를 함께 확인하세요.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <a href="#contact" className="border-2 border-black px-3 py-2 text-xs font-bold hover:bg-black hover:text-white transition">
              학과 사무실 문의
            </a>
            <Link to="/dept/notice" className="border-2 border-black px-3 py-2 text-xs font-bold hover:bg-black hover:text-white transition">
              공지사항 확인
            </Link>
            <Link to="/dept/board" className="border-2 border-black px-3 py-2 text-xs font-bold hover:bg-black hover:text-white transition">
              질문 남기기
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-5 border-2 border-black p-4">
            <div className="flex items-center justify-between gap-4 mb-4">
              <p className="font-black">학년별 수강 로드맵</p>
              <p className="text-xs text-gray-500">공식 교육과정 과목명 기반</p>
            </div>
            <div className="grid md:grid-cols-4 gap-3">
              {roadmap.map(step => (
                <article key={step.year} className="border-2 border-black p-3">
                  <p className="bg-black text-white text-center py-2 font-black">{step.year}학년</p>
                  <div className="mt-3 space-y-2">
                    {step.courses.length > 0 ? step.courses.map(course => (
                      <div key={`${step.year}-${course.name}`} className="border border-gray-300 p-2">
                        <p className="text-sm font-bold leading-snug">{course.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{course.category || '분류 미공개'}</p>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-500 border border-gray-300 p-3 text-center">
                        공식 교육과정 미공개
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_1fr] gap-4 mb-5">
            <div className="border-2 border-black p-4">
              <p className="font-black mb-3">전공 분류 요약</p>
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

          <div className="flex flex-wrap gap-2 mb-5 border-2 border-black p-3">
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

          <div className="md:hidden space-y-3">
            {filtered.map(item => (
              <article key={`mobile-${item.year}-${item.name}-${item.category ?? 'none'}`} className="border-2 border-black p-4">
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
                    <dt className="text-xs text-gray-500">학점</dt>
                    <dd className="font-bold">{item.credit || '공식 미공개'}</dd>
                  </div>
                  <div className="border border-gray-300 p-2 col-span-2">
                    <dt className="text-xs text-gray-500">분류</dt>
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
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-black text-white">
                  <th className="px-4 py-3 text-left font-bold border-r border-gray-700">과목명</th>
                  <th className="px-4 py-3 text-center font-bold border-r border-gray-700">학년</th>
                  <th className="px-4 py-3 text-center font-bold border-r border-gray-700">분류</th>
                  <th className="px-4 py-3 text-center font-bold border-r border-gray-700">이수</th>
                  <th className="px-4 py-3 text-center font-bold">학점</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(item => (
                  <tr key={`${item.year}-${item.name}-${item.category ?? 'none'}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold border-r border-gray-200">{item.name}</td>
                    <td className="px-4 py-3 text-center border-r border-gray-200">{formatYear(item.year)}</td>
                    <td className="px-4 py-3 text-center border-r border-gray-200">
                      <span className="border border-black px-2 py-1 text-xs font-bold">
                        {item.category || '분류 미공개'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center border-r border-gray-200">
                      {item.required ? '필수' : '선택'}
                    </td>
                    <td className="px-4 py-3 text-center">{item.credit || '공식 미공개'}</td>
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
