import { useEffect, useState } from 'react'

interface OverviewCounts {
  notices: number
  schedules: number
}

export function useDeptOverviewCounts(deptId: number | null | undefined): OverviewCounts | null {
  const [counts, setCounts] = useState<OverviewCounts | null>(null)

  useEffect(() => {
    if (!deptId) {
      setCounts(null)
      return
    }
    let cancelled = false

    Promise.all([
      fetch(`/api/notices?deptId=${deptId}`).then(r => r.ok ? r.json() : { notices: [] }),
      fetch(`/api/schedules?deptId=${deptId}`).then(r => r.ok ? r.json() : []),
    ])
      .then(([noticeRes, scheduleRes]) => {
        if (cancelled) return
        const notices = Array.isArray(noticeRes?.notices) ? noticeRes.notices.length : 0
        const schedules = Array.isArray(scheduleRes) ? scheduleRes.length : 0
        setCounts({ notices, schedules })
      })
      .catch(() => {
        if (!cancelled) setCounts({ notices: 0, schedules: 0 })
      })

    return () => {
      cancelled = true
    }
  }, [deptId])

  return counts
}
