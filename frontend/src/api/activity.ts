export interface ActivityData {
  scopeId: number
  scopeType: string
  name: string
  weeklyVisitors: number
  newPosts: number
  newComments: number
  activityScore: number
}

export async function fetchActivityRanking(
  scopeType: 'univ' | 'dept' | 'faculty'
): Promise<ActivityData[]> {
  try {
    const res = await fetch(`/api/activity/ranking?scopeType=${scopeType}`)
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}
