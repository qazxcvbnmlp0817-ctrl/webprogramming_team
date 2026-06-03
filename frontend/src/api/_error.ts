export async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.clone().json()
    if (data && typeof data.message === 'string' && data.message.trim()) {
      return data.message
    }
  } catch {
    // fall through to text
  }
  try {
    const text = await res.text()
    if (text && text.trim() && !text.trim().startsWith('<')) {
      return text.trim()
    }
  } catch {
    // ignore
  }
  return fallback
}
