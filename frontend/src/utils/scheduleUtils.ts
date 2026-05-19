import type { ScheduleDto } from '../types/schedule'

export function groupByMonth(items: ScheduleDto[]): Map<string, ScheduleDto[]> {
  const map = new Map<string, ScheduleDto[]>()
  items.forEach(item => {
    const month = item.date.slice(0, 7)
    if (!map.has(month)) map.set(month, [])
    map.get(month)!.push(item)
  })
  return map
}
