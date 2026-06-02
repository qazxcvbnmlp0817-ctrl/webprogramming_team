import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useDept } from '../context/DeptContext'

interface UniversityInfo {
  name: string
  description: string | null
}

const FOOTER_HIDDEN_PATHS = ['/universities']

function extractUnivIdFromPath(pathname: string): number | null {
  const m = pathname.match(/^\/universities\/(\d+)/)
  return m ? Number(m[1]) : null
}

export default function Footer() {
  const { pathname } = useLocation()
  const { selectedUniversityId } = useDept()
  const [univInfo, setUnivInfo] = useState<UniversityInfo | null>(null)

  // URL에서 대학 ID 우선 — 없으면 context fallback
  const univId = extractUnivIdFromPath(pathname) ?? selectedUniversityId

  useEffect(() => {
    if (!univId) {
      setUnivInfo(null)
      return
    }
    fetch(`/api/universities/${univId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setUnivInfo({ name: data.name, description: data.description ?? null })
      })
      .catch(() => {})
  }, [univId])

  if (FOOTER_HIDDEN_PATHS.some(p => pathname === p)) return null
  if (!univInfo) return null

  return (
    <footer className="bg-black text-gray-500 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col items-center justify-center gap-1 text-xs text-center">
        <span className="font-semibold text-gray-400">{univInfo.name}</span>
        {univInfo.description && (
          <span className="text-gray-600">{univInfo.description}</span>
        )}
      </div>
    </footer>
  )
}
