# Multi-role Management & Department-based Access Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** School Admin이 교수/조교에게 SCHOOL_ADMIN·DEPT_ADMIN 역할을 부여할 수 있고, 역할이 부여된 사용자가 로그인 후 교수 기능과 관리자 대시보드를 동시에 접근할 수 있도록 한다.

**Architecture:** 기존 `member_type` + `admin_role` 두 컬럼 조합을 그대로 활용 (DB 변경 없음). 백엔드에서 SCHOOL_ADMIN → SCHOOL_ADMIN 부여 제한을 완화하고, 프론트엔드 School Admin 대시보드에 인라인 역할 드롭다운과 memberType 뱃지를 추가한다. AdminBanner와 라우트 가드는 이미 `adminRole` 기준으로 동작 중이므로 별도 수정 불필요.

**Tech Stack:** Spring Boot 3 / JUnit 5 / MockMvc (백엔드), React 18 / TypeScript / Vitest / @testing-library/react (프론트엔드)

---

## 파일 구조

| 파일 | 변경 유형 | 책임 |
|------|---------|------|
| `demo/demo/src/main/java/com/example/demo/controller/SchoolAdminController.java` | Modify (1줄) | SCHOOL_ADMIN 부여 허용, SUPER_ADMIN 부여 금지 |
| `demo/demo/src/test/java/com/example/demo/controller/SchoolAdminRoleControllerTest.java` | Create | 역할 부여 허용/거부 단위 테스트 |
| `frontend/src/pages/admin/SchoolAdminPage.tsx` | Modify (2섹션) | 역할 드롭다운 + memberType 뱃지 |
| `frontend/src/pages/admin/SchoolAdminPage.role.test.tsx` | Create | 프론트엔드 역할 UI 테스트 |

---

### Task 1: Backend — SCHOOL_ADMIN이 SCHOOL_ADMIN 역할을 부여할 수 있도록 권한 완화

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/controller/SchoolAdminController.java:147-148`
- Create: `demo/demo/src/test/java/com/example/demo/controller/SchoolAdminRoleControllerTest.java`

- [ ] **Step 1: 테스트 파일 생성**

`demo/demo/src/test/java/com/example/demo/controller/SchoolAdminRoleControllerTest.java` 파일을 생성한다:

```java
package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SchoolAdminController.class)
class SchoolAdminRoleControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    AdminService adminService;

    @MockBean
    UserRepository userRepository;

    @BeforeEach
    void setUp() {
        User schoolAdminUser = new User();
        schoolAdminUser.setUsername("school_admin");
        schoolAdminUser.setName("학교관리자");
        schoolAdminUser.setAdminRole("SCHOOL_ADMIN");
        schoolAdminUser.setUniversityId("1");

        when(userRepository.findByUsername("school_admin"))
                .thenReturn(Optional.of(schoolAdminUser));
        when(adminService.updateUserRole(anyLong(), anyString(), anyString(), anyLong()))
                .thenReturn(Map.of("success", true, "userId", 99L));
    }

    @Test
    void schoolAdmin_deptAdmin역할_부여_200() throws Exception {
        mockMvc.perform(put("/api/admin/school/users/99/role")
                        .header("X-Username", "school_admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"DEPT_ADMIN\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void schoolAdmin_schoolAdmin역할_부여_200() throws Exception {
        mockMvc.perform(put("/api/admin/school/users/99/role")
                        .header("X-Username", "school_admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"SCHOOL_ADMIN\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void schoolAdmin_superAdmin역할_부여시_403() throws Exception {
        mockMvc.perform(put("/api/admin/school/users/99/role")
                        .header("X-Username", "school_admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"SUPER_ADMIN\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void schoolAdmin_역할_박탈_200() throws Exception {
        mockMvc.perform(put("/api/admin/school/users/99/role")
                        .header("X-Username", "school_admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"\"}"))
                .andExpect(status().isOk());
    }
}
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
cd demo/demo
./mvnw test -Dtest=SchoolAdminRoleControllerTest -q
```

예상 결과: `schoolAdmin_schoolAdmin역할_부여_200` 테스트가 **400 Bad Request** 응답으로 FAIL.

- [ ] **Step 3: SchoolAdminController.java 수정**

`demo/demo/src/main/java/com/example/demo/controller/SchoolAdminController.java`의 147-148번 줄을:

```java
        if (role != null && !role.isBlank() && !"DEPT_ADMIN".equals(role))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "School Admin은 DEPT_ADMIN만 부여 가능");
```

다음으로 교체한다:

```java
        if (role != null && !role.isBlank() && "SUPER_ADMIN".equals(role))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "SUPER_ADMIN 역할은 부여할 수 없습니다");
```

- [ ] **Step 4: 테스트 재실행 — 통과 확인**

```bash
cd demo/demo
./mvnw test -Dtest=SchoolAdminRoleControllerTest -q
```

예상 결과: 4개 테스트 모두 PASS. `BUILD SUCCESS` 출력.

- [ ] **Step 5: 커밋**

```bash
git add demo/demo/src/main/java/com/example/demo/controller/SchoolAdminController.java
git add demo/demo/src/test/java/com/example/demo/controller/SchoolAdminRoleControllerTest.java
git commit -m "feat: SCHOOL_ADMIN이 SCHOOL_ADMIN 역할 부여 가능하도록 권한 완화"
```

---

### Task 2: Frontend — "전체 사용자" 탭 인라인 역할 드롭다운

**Files:**
- Modify: `frontend/src/pages/admin/SchoolAdminPage.tsx`
- Create: `frontend/src/pages/admin/SchoolAdminPage.role.test.tsx`

- [ ] **Step 1: 테스트 파일 생성**

`frontend/src/pages/admin/SchoolAdminPage.role.test.tsx` 파일을 생성한다:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import SchoolAdminPage from './SchoolAdminPage'

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: class {}, LinearScale: class {}, PointElement: class {},
  LineElement: class {}, BarElement: class {}, ArcElement: class {},
  Title: class {}, Tooltip: class {}, Legend: class {}, Filler: class {},
}))
vi.mock('react-chartjs-2', () => ({
  Line: () => null, Doughnut: () => null, Bar: () => null,
}))

const mockUpdateRole = vi.fn().mockResolvedValue(undefined)

vi.mock('../../api/adminSchool', () => ({
  fetchSchoolStats: vi.fn().mockResolvedValue({
    totalUsers: 10, totalPosts: 5, totalNotices: 3,
    pendingApprovals: 0, activeAdmins: 1, totalVisits: 100,
  }),
  fetchSchoolVisitors: vi.fn().mockResolvedValue([]),
  fetchSchoolMonthlyStats: vi.fn().mockResolvedValue([]),
  fetchSchoolAllUsers: vi.fn().mockResolvedValue([
    { id: 1, name: '김교수', username: 'prof_kim', memberType: 'professor', adminRole: null,         status: 'ACTIVE' },
    { id: 2, name: '이조교', username: 'ta_lee',   memberType: 'assistant', adminRole: 'DEPT_ADMIN', status: 'ACTIVE' },
  ]),
  fetchSchoolPendingUsers: vi.fn().mockResolvedValue([]),
  fetchSchoolUsers: vi.fn().mockResolvedValue([
    { id: 2, name: '이조교', username: 'ta_lee', memberType: 'assistant', adminRole: 'DEPT_ADMIN', status: 'ACTIVE' },
  ]),
  fetchAdminLogs: vi.fn().mockResolvedValue([]),
  fetchSchoolPosts: vi.fn().mockResolvedValue({ posts: [], totalPages: 1 }),
  fetchSchoolProfessors: vi.fn().mockResolvedValue([]),
  fetchSchoolCourses: vi.fn().mockResolvedValue([]),
  fetchSchoolAssignments: vi.fn().mockResolvedValue([]),
  updateSchoolUserRole: mockUpdateRole,
  deleteSchoolPost: vi.fn(),
  updateUserStatus: vi.fn().mockResolvedValue(undefined),
  createSchoolAssignment: vi.fn(),
  deleteSchoolAssignment: vi.fn(),
}))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/school/1']}>
      <Routes>
        <Route path="/admin/school/:id" element={<SchoolAdminPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('SchoolAdminPage — 역할 관리', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateRole.mockResolvedValue(undefined)
    sessionStorage.setItem('adminRole', 'SCHOOL_ADMIN')
    sessionStorage.setItem('username', 'school_admin')
    sessionStorage.setItem('universityId', '1')
  })

  it('"전체 사용자" 탭에 관리자 역할 드롭다운이 표시된다', async () => {
    renderPage()
    fireEvent.click(await screen.findByText('전체 사용자'))
    const selects = await screen.findAllByRole('combobox', { name: /관리자 역할/ })
    expect(selects).toHaveLength(2)
  })

  it('드롭다운에서 DEPT_ADMIN 선택 시 updateSchoolUserRole이 호출된다', async () => {
    renderPage()
    fireEvent.click(await screen.findByText('전체 사용자'))
    const selects = await screen.findAllByRole('combobox', { name: /관리자 역할/ })
    // 김교수(adminRole: null) 행 — 첫 번째 드롭다운
    fireEvent.change(selects[0], { target: { value: 'DEPT_ADMIN' } })
    await waitFor(() => {
      expect(mockUpdateRole).toHaveBeenCalledWith(1, 'DEPT_ADMIN', undefined)
    })
  })

  it('드롭다운에서 없음 선택 시 updateSchoolUserRole이 빈 문자열로 호출된다', async () => {
    renderPage()
    fireEvent.click(await screen.findByText('전체 사용자'))
    const selects = await screen.findAllByRole('combobox', { name: /관리자 역할/ })
    // 이조교(adminRole: DEPT_ADMIN) 행 — 두 번째 드롭다운에서 없음 선택
    fireEvent.change(selects[1], { target: { value: '' } })
    await waitFor(() => {
      expect(mockUpdateRole).toHaveBeenCalledWith(2, '', undefined)
    })
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
cd frontend
npx vitest run src/pages/admin/SchoolAdminPage.role.test.tsx
```

예상 결과: `"전체 사용자" 탭에 관리자 역할 드롭다운이 표시된다` 테스트가 **combobox 요소 없음**으로 FAIL.

- [ ] **Step 3: handleInlineRoleChange 함수 추가**

`frontend/src/pages/admin/SchoolAdminPage.tsx`에서 기존 `handleRoleChange` 함수 정의 근처에 다음 함수를 추가한다:

```tsx
const handleInlineRoleChange = async (userId: number, newRole: string) => {
  await updateSchoolUserRole(userId, newRole, univId)
  const [au, all] = await Promise.all([
    fetchSchoolUsers(univId),
    fetchSchoolAllUsers(univId),
  ])
  setAdminUsers(au)
  setAllUsers(all)
}
```

- [ ] **Step 4: "전체 사용자" 탭 테이블 헤더에 컬럼 추가**

`frontend/src/pages/admin/SchoolAdminPage.tsx`의 "전체 사용자" 탭 `<thead>` 안에서 `<th className="text-left pb-3">관리</th>` 앞에 다음을 삽입한다:

```tsx
<th className="text-left pb-3 pr-4">관리자 역할</th>
```

전체 헤더 결과:
```tsx
<tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
  <th className="text-left pb-3 pr-4">이름</th>
  <th className="text-left pb-3 pr-4">아이디</th>
  <th className="text-left pb-3 pr-4">유형</th>
  <th className="text-left pb-3 pr-4">상태</th>
  <th className="text-left pb-3 pr-4">관리자 역할</th>
  <th className="text-left pb-3">관리</th>
</tr>
```

- [ ] **Step 5: "전체 사용자" 탭 각 행에 드롭다운 셀 추가**

`frontend/src/pages/admin/SchoolAdminPage.tsx`의 "전체 사용자" 탭 `<tbody>` 내 각 `<tr>` 안에서 `<td className="py-3 flex gap-2">` 앞에 다음을 삽입한다:

```tsx
<td className="py-3 pr-4">
  <select
    aria-label="관리자 역할"
    value={u.adminRole ?? ''}
    onChange={(e) => handleInlineRoleChange(u.id, e.target.value)}
    className="border border-gray-300 text-xs px-2 py-1 focus:outline-none focus:border-black"
  >
    <option value="">없음</option>
    <option value="SCHOOL_ADMIN">SCHOOL_ADMIN</option>
    <option value="DEPT_ADMIN">DEPT_ADMIN</option>
  </select>
</td>
```

- [ ] **Step 6: 테스트 재실행 — 통과 확인**

```bash
cd frontend
npx vitest run src/pages/admin/SchoolAdminPage.role.test.tsx
```

예상 결과: 3개 테스트 모두 PASS.

- [ ] **Step 7: 커밋**

```bash
git add frontend/src/pages/admin/SchoolAdminPage.tsx
git add frontend/src/pages/admin/SchoolAdminPage.role.test.tsx
git commit -m "feat: 전체 사용자 탭에 인라인 관리자 역할 드롭다운 추가"
```

---

### Task 3: Frontend — "관리자 계정" 탭 memberType 뱃지 추가

**Files:**
- Modify: `frontend/src/pages/admin/SchoolAdminPage.tsx`
- Modify: `frontend/src/pages/admin/SchoolAdminPage.role.test.tsx`

- [ ] **Step 1: 테스트 케이스 추가**

`frontend/src/pages/admin/SchoolAdminPage.role.test.tsx`의 `describe` 블록 안에 다음 테스트를 추가한다:

```tsx
it('"관리자 계정" 탭에 memberType 뱃지가 adminRole과 함께 표시된다', async () => {
  renderPage()
  fireEvent.click(await screen.findByText('관리자 계정'))
  // fetchSchoolUsers mock: 이조교(assistant, DEPT_ADMIN) 반환
  expect(await screen.findByText('assistant')).toBeInTheDocument()
  expect(screen.getByText('DEPT_ADMIN')).toBeInTheDocument()
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
cd frontend
npx vitest run src/pages/admin/SchoolAdminPage.role.test.tsx
```

예상 결과: `"관리자 계정" 탭에 memberType 뱃지가 adminRole과 함께 표시된다` 테스트가 **`assistant` 텍스트 없음**으로 FAIL. (`DEPT_ADMIN`은 이미 표시 중이라 통과)

- [ ] **Step 3: "관리자 계정" 탭 역할 셀 수정**

`frontend/src/pages/admin/SchoolAdminPage.tsx`의 "관리자 계정" 탭 `<thead>` 안에서 `<th className="text-left pb-3 pr-4">역할</th>`을 다음으로 교체한다:

```tsx
<th className="text-left pb-3 pr-4">유형 / 역할</th>
```

같은 탭의 `<tbody>` 각 행에서 역할 셀(아래 before 코드)을:

```tsx
<td className="py-3 pr-4">
  <span className="border border-gray-300 px-2 py-0.5 text-xs font-mono">
    {u.adminRole ?? '없음'}
  </span>
</td>
```

다음으로 교체한다:

```tsx
<td className="py-3 pr-4">
  <span className="border border-blue-300 px-2 py-0.5 text-xs text-blue-600 mr-1">
    {u.memberType}
  </span>
  <span className="border border-gray-300 px-2 py-0.5 text-xs font-mono">
    {u.adminRole ?? '없음'}
  </span>
</td>
```

- [ ] **Step 4: 테스트 재실행 — 통과 확인**

```bash
cd frontend
npx vitest run src/pages/admin/SchoolAdminPage.role.test.tsx
```

예상 결과: 4개 테스트 모두 PASS.

- [ ] **Step 5: 전체 프론트엔드 테스트 회귀 확인**

```bash
cd frontend
npx vitest run
```

예상 결과: 기존 테스트 포함 전체 PASS (실패 없음).

- [ ] **Step 6: 커밋**

```bash
git add frontend/src/pages/admin/SchoolAdminPage.tsx
git add frontend/src/pages/admin/SchoolAdminPage.role.test.tsx
git commit -m "feat: 관리자 계정 탭에 memberType 뱃지 추가"
```

---

## 참고: 변경 없는 항목

- **AdminBanner.tsx**: 이미 `useAdminRole()` 기준으로 동작 중. 교수 + DEPT_ADMIN 조합에서도 자동 표시됨.
- **App.tsx 라우트 가드**: `ProtectedAdmin`, `ProtectedSchoolAdmin` 이미 구현됨. adminRole 없는 사용자는 자동 차단.
- **DB 스키마**: 변경 없음. `member_type` + `admin_role` 두 컬럼 조합으로 모든 역할 표현 가능.
- **백엔드 scope 격리**: `DeptAdminController.resolveDeptId()`가 이미 `user.department`로 자동 격리 처리 중.
