import { useEffect, useState } from 'react'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * deptId가 바뀔 때마다 fetcher를 자동으로 재호출하는 범용 훅.
 * DB 연동 시 fetcher 구현체(URL)만 교체하면 되고, 훅 자체는 그대로 유지됨.
 *
 * @example
 * const { data, loading } = useDeptFetch(fetchNotices, selectedDeptId)
 */
export function useDeptFetch<T>(
  fetcher: (deptId: number) => Promise<T>,
  deptId: number | null,
): FetchState<T> {
  const [data, setData]       = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (deptId === null) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetcher(deptId)
      .then(result  => { if (!cancelled) setData(result) })
      .catch(err    => { if (!cancelled) setError(err.message) })
      .finally(()   => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [deptId]) // deptId 변경 시 자동 재요청

  return { data, loading, error }
}
