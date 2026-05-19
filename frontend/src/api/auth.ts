export async function loginApi(username: string, password: string, memberType: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, memberType }),
  })
  return res.json()
}

export async function signupApi(data: {
  username: string
  password: string
  name: string
  memberType: string
  universityId: string
  college: string
  department: string
  studentId: string
}) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function checkIdApi(username: string) {
  const res = await fetch(`/api/auth/check-id?username=${username}`)
  return res.json()
}

export async function findIdApi(name: string, phone: string) {
  const res = await fetch('/api/auth/find-id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone }),
  })
  return res.json()
}

export async function findPasswordApi(username: string, name: string, phone: string) {
  const res = await fetch('/api/auth/find-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, name, phone }),
  })
  return res.json()
}
