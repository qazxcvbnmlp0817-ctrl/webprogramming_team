# Role Hierarchy Modal Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 역할 계층 최적화(SCHOOL_ADMIN > DEPT_ADMIN) + 모달 기반 역할 관리 UI + 최소 역할 보장 + 학과/학부 접근 범위 표시 배너 구현

**Architecture:** AdminService.updateUserRole에 roleLevel 헬퍼를 추가해 역할 계층 검증과 admin 타입 최소 역할 보장을 처리한다. 프론트엔드에서는 SchoolAdminPage의 인라인 드롭다운을 제거하고 RoleManageModal 컴포넌트를 새로 만들어 "역할 관리" 버튼으로 연결한다. DeptAdminPage/FacultyAdminPage에 sessionStorage의 department/college 값을 이용해 접근 범위 배너를 추가한다.

**Tech Stack:** Spring Boot 3 / JUnit 5 / Mockito (백엔드), React 18 / TypeScript / Vitest / @testing-library/react (프론트엔드)

---

## 파일 구조

| 파일 | 작업 |
|------|------|
| `demo/demo/src/main/java/com/example/demo/service/AdminService.java` | 수정: `updateUserRole` + `roleLevel` 헬퍼 추가 |
| `demo/demo/src/test/java/com/example/demo/service/AdminServiceRoleTest.java` | 신규: 서비스 단위 테스트 |
| `frontend/src/components/admin/RoleManageModal.tsx` | 신규: 역할 관리 모달 컴포넌트 |
| `frontend/src/components/admin/RoleManageModal.test.tsx` | 신규: 모달 Vitest 테스트 |
| `frontend/src/pages/admin/SchoolAdminPage.tsx` | 수정: 인라인 드롭다운 → 모달 버튼 교체 |
| `frontend/src/pages/admin/SchoolAdminPage.role.test.tsx` | 수정: 드롭다운 → 모달 기반 테스트로 교체 |
| `frontend/src/pages/admin/DeptAdminPage.tsx` | 수정: 학과 범위 배너 추가 |
| `frontend/src/pages/admin/FacultyAdminPage.tsx` | 수정: 학부 범위 배너 추가 |

---

## Task 1: 백엔드 — AdminService 계층 검증 (TDD)

**Files:**
- Create: `demo/demo/src/test/java/com/example/demo/service/AdminServiceRoleTest.java`
- Modify: `demo/demo/src/main/java/com/example/demo/service/AdminService.java` (lines 262-276 + 끝 부분)

- [ ] **Step 1: 실패하는 테스트 작성**

`demo/demo/src/test/java/com/example/demo/service/AdminServiceRoleTest.java` 파일 생성:

```java
package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceRoleTest {

    @Mock UserRepository userRepository;
    @Mock PageVisitRepository pageVisitRepository;
    @Mock PostRepository postRepository;
    @Mock NoticeRepository noticeRepository;
    @Mock UniversityRepository universityRepository;
    @Mock CollegeSchoolRepository collegeSchoolRepository;
    @Mock FacultyGroupRepository facultyGroupRepository;
    @Mock DepartmentRepository departmentRepository;
    @Mock AdminLogRepository adminLogRepository;
    @Mock ProfessorRepository professorRepository;
    @Mock CurriculumItemRepository curriculumItemRepository;
    @Mock ProfessorCourseAssignmentRepository assignmentRepository;

    @InjectMocks AdminService adminService;

    private User makeUser(String memberType, String adminRole) {
        User u = new User();
        u.setId(1L);
        u.setUsername("testuser");
        u.setMemberType(memberType);
        u.setAdminRole(adminRole);
        u.setUniversityId("1");
        return u;
    }

    @BeforeEach
    void setUp() {
        when(adminLogRepository.save(any())).thenReturn(null);
    }

    @Test
    void dept_admin에게_school_admin_부여_성공() {
        User user = makeUser("professor", "DEPT_ADMIN");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        var result = adminService.updateUserRole(1L, "SCHOOL_ADMIN", "actor", 1L);

        assertThat(result.get("success")).isEqualTo(true);
        assertThat(user.getAdminRole()).isEqualTo("SCHOOL_ADMIN");
    }

    @Test
    void school_admin에게_dept_admin_부여시_422() {
        User user = makeUser("professor", "SCHOOL_ADMIN");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThatThrownBy(() ->
            adminService.updateUserRole(1L, "DEPT_ADMIN", "actor", 1L))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("이미 상위 역할")
            .extracting(e -> ((ResponseStatusException) e).getStatusCode().value())
            .isEqualTo(422);
    }

    @Test
    void admin_타입_역할_박탈시_422() {
        User user = makeUser("admin", "SCHOOL_ADMIN");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThatThrownBy(() ->
            adminService.updateUserRole(1L, "", "actor", 1L))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("admin 계정은 최소 1개의 역할")
            .extracting(e -> ((ResponseStatusException) e).getStatusCode().value())
            .isEqualTo(422);
    }

    @Test
    void professor_타입_역할_박탈_성공() {
        User user = makeUser("professor", "DEPT_ADMIN");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        var result = adminService.updateUserRole(1L, "", "actor", 1L);

        assertThat(result.get("success")).isEqualTo(true);
        assertThat(user.getAdminRole()).isNull();
    }
}
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd demo/demo
./mvnw test -pl . -Dtest=AdminServiceRoleTest -q 2>&1 | tail -20
```

Expected: 4개 테스트 모두 FAIL (메서드 로직 없음)

- [ ] **Step 3: AdminService.java 수정 — updateUserRole 교체 + roleLevel 추가**

`demo/demo/src/main/java/com/example/demo/service/AdminService.java` 에서 `updateUserRole` 메서드(lines 262-276)를 다음으로 교체:

```java
public Map<String, Object> updateUserRole(Long userId, String role,
                                           String actor, Long univId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    String oldRole = user.getAdminRole();
    boolean grant = role != null && !role.isBlank();

    if (grant) {
        if (roleLevel(oldRole) > roleLevel(role)) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "이미 상위 역할(" + oldRole + ")을 보유하고 있습니다. 먼저 현재 역할을 박탈하세요.");
        }
        user.setAdminRole(role);
    } else {
        if ("admin".equals(user.getMemberType())) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "admin 계정은 최소 1개의 역할이 필요합니다.");
        }
        user.setAdminRole(null);
    }
    userRepository.save(user);
    logAction(actor,
              grant ? "ROLE_GRANT" : "ROLE_REVOKE",
              user.getUsername(),
              grant ? "역할 부여: " + role : "역할 박탈 (이전: " + oldRole + ")",
              univId);
    return Map.of("success", true);
}

private int roleLevel(String role) {
    if ("SUPER_ADMIN".equals(role)) return 3;
    if ("SCHOOL_ADMIN".equals(role)) return 2;
    if ("DEPT_ADMIN".equals(role)) return 1;
    return 0;
}
```

`roleLevel` 메서드는 기존 `private List<Long> getDeptIds` 이전 적당한 위치에 추가한다 (파일 끝 private helpers 섹션).

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd demo/demo
./mvnw test -pl . -Dtest=AdminServiceRoleTest -q 2>&1 | tail -10
```

Expected:
```
Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
```

- [ ] **Step 5: 기존 컨트롤러 테스트도 통과 확인**

```bash
cd demo/demo
./mvnw test -pl . -Dtest=SchoolAdminRoleControllerTest -q 2>&1 | tail -10
```

Expected: `Tests run: 4, Failures: 0, Errors: 0, Skipped: 0`

- [ ] **Step 6: 커밋**

```bash
git add demo/demo/src/main/java/com/example/demo/service/AdminService.java
git add demo/demo/src/test/java/com/example/demo/service/AdminServiceRoleTest.java
git commit -m "feat: AdminService 역할 계층 검증 및 최소 역할 보장 로직 추가"
```

---

## Task 2: 프론트엔드 — RoleManageModal 컴포넌트 (TDD)

**Files:**
- Create: `frontend/src/components/admin/RoleManageModal.test.tsx`
- Create: `frontend/src/components/admin/RoleManageModal.tsx`

- [ ] **Step 1: 컴포넌트 디렉토리 확인**

```bash
ls frontend/src/components/admin/ 2>/dev/null || echo "admin dir does not exist"
```

없으면 `frontend/src/components/admin/` 디렉토리 생성.

- [ ] **Step 2: 실패하는 테스트 작성**

`frontend/src/components/admin/RoleManageModal.test.tsx` 파일 생성:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import RoleManageModal from './RoleManageModal'
import type { AdminUser } from '../../api/adminSchool'

const makeUser = (overrides: Partial<AdminUser> = {}): AdminUser => ({
  id: 1,
  username: 'prof_kim',
  name: '김민준',
  memberType: 'professor',
  adminRole: null,
  status: 'ACTIVE',
  department: '컴퓨터공학과',
  universityId: '1',
  createdDate: '2026-01-01',
  ...overrides,
})

describe('RoleManageModal', () => {
  it('사용자 이름, 아이디, memberType, 현재 역할을 표시한다', () => {
    const user = makeUser({ adminRole: 'DEPT_ADMIN' })
    render(<RoleManageModal user={user} onClose={vi.fn()} onSave={vi.fn()} />)

    expect(screen.getByText('김민준')).toBeInTheDocument()
    expect(screen.getByText('(prof_kim)')).toBeInTheDocument()
    expect(screen.getByText('professor')).toBeInTheDocument()
    // 현재 역할 배지 — "DEPT_ADMIN" 텍스트가 최소 1회 등장
    expect(screen.getAllByText('DEPT_ADMIN').length).toBeGreaterThan(0)
  })

  it('admin 타입이면 없음 라디오가 disabled된다', () => {
    const user = makeUser({ memberType: 'admin', adminRole: 'SCHOOL_ADMIN' })
    render(<RoleManageModal user={user} onClose={vi.fn()} onSave={vi.fn()} />)

    // "없음" 라디오 input은 value="" 인 것
    const radios = screen.getAllByRole('radio')
    const noneRadio = radios.find(r => (r as HTMLInputElement).value === '')
    expect(noneRadio).toBeDisabled()
  })

  it('역할 변경 없으면 저장 버튼이 disabled된다', () => {
    const user = makeUser({ adminRole: 'DEPT_ADMIN' })
    render(<RoleManageModal user={user} onClose={vi.fn()} onSave={vi.fn()} />)

    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })

  it('다른 역할 선택 후 저장 클릭 시 onSave(userId, newRole)가 호출된다', async () => {
    const user = makeUser({ adminRole: null })
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<RoleManageModal user={user} onClose={vi.fn()} onSave={onSave} />)

    const deptRadio = screen.getAllByRole('radio').find(
      r => (r as HTMLInputElement).value === 'DEPT_ADMIN'
    )!
    fireEvent.click(deptRadio)
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(1, 'DEPT_ADMIN'))
  })

  it('onSave 실패 시 에러 메시지를 모달 내부에 표시한다', async () => {
    const user = makeUser({ adminRole: null })
    const onSave = vi.fn().mockRejectedValue(new Error('이미 상위 역할을 보유하고 있습니다'))
    render(<RoleManageModal user={user} onClose={vi.fn()} onSave={onSave} />)

    const deptRadio = screen.getAllByRole('radio').find(
      r => (r as HTMLInputElement).value === 'DEPT_ADMIN'
    )!
    fireEvent.click(deptRadio)
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByText('이미 상위 역할을 보유하고 있습니다')).toBeInTheDocument()
  })

  it('취소 버튼 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn()
    render(<RoleManageModal user={makeUser()} onClose={onClose} onSave={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('✕ 버튼 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn()
    render(<RoleManageModal user={makeUser()} onClose={onClose} onSave={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '닫기' }))
    expect(onClose).toHaveBeenCalled()
  })
})
```

- [ ] **Step 3: 테스트 실패 확인**

```bash
cd frontend
npx vitest run src/components/admin/RoleManageModal.test.tsx 2>&1 | tail -15
```

Expected: 에러 (파일 없음)

- [ ] **Step 4: RoleManageModal.tsx 구현**

`frontend/src/components/admin/RoleManageModal.tsx` 파일 생성:

```tsx
import { useState } from 'react'
import type { AdminUser } from '../../api/adminSchool'

interface Props {
  user: AdminUser
  onClose: () => void
  onSave: (userId: number, newRole: string) => Promise<void>
}

const ROLE_OPTIONS = [
  { value: '', label: '없음', desc: '관리자 역할 없음' },
  { value: 'DEPT_ADMIN', label: 'DEPT_ADMIN', desc: '학과 / 단과대 관리자' },
  { value: 'SCHOOL_ADMIN', label: 'SCHOOL_ADMIN', desc: '학교 전체 관리자' },
]

export default function RoleManageModal({ user, onClose, onSave }: Props) {
  const [selected, setSelected] = useState(user.adminRole ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAdminType = user.memberType === 'admin'
  const unchanged = selected === (user.adminRole ?? '')

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await onSave(user.id, selected)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '역할 변경에 실패했습니다.')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-label="역할 관리"
    >
      <div className="bg-white w-full max-w-md border-2 border-black p-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold">역할 관리</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {user.name}
              <span className="ml-1 text-gray-400">({user.username})</span>
              <span className="ml-2 border border-gray-300 px-1.5 py-0.5 text-xs">
                {user.memberType}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="text-gray-400 hover:text-black text-xl leading-none ml-4"
          >
            ✕
          </button>
        </div>

        {/* 현재 역할 */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">현재 역할</p>
          <span className="border border-gray-300 px-2 py-0.5 text-xs font-mono">
            {user.adminRole ?? '없음'}
          </span>
        </div>

        {/* 역할 선택 */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">변경할 역할</p>
          <div className="flex flex-col gap-2">
            {ROLE_OPTIONS.map(opt => {
              const disabled = opt.value === '' && isAdminType
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 border px-3 py-2 ${
                    disabled
                      ? 'opacity-40 cursor-not-allowed border-gray-200'
                      : 'cursor-pointer border-gray-300 hover:border-black'
                  } ${selected === opt.value ? 'border-black bg-gray-50' : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={opt.value}
                    checked={selected === opt.value}
                    onChange={() => !disabled && setSelected(opt.value)}
                    disabled={disabled}
                    className="accent-black"
                  />
                  <span>
                    <span className="text-sm font-medium">{opt.label || '없음'}</span>
                    <span className="text-xs text-gray-400 ml-2">{opt.desc}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-4">
          ℹ SCHOOL_ADMIN은 DEPT_ADMIN을 포함합니다.
        </p>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        {/* 버튼 */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="border border-gray-300 px-4 py-2 text-sm hover:border-black transition"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={unchanged || saving}
            className="border border-black px-4 py-2 text-sm bg-black text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: 테스트 통과 확인**

```bash
cd frontend
npx vitest run src/components/admin/RoleManageModal.test.tsx 2>&1 | tail -15
```

Expected:
```
Test Files  1 passed (1)
Tests       6 passed (6)
```

- [ ] **Step 6: 커밋**

```bash
git add frontend/src/components/admin/RoleManageModal.tsx
git add frontend/src/components/admin/RoleManageModal.test.tsx
git commit -m "feat: RoleManageModal 컴포넌트 추가 (역할 계층 UI + 최소 역할 보장)"
```

---

## Task 3: 프론트엔드 — SchoolAdminPage 모달 연결 + 테스트 업데이트

**Files:**
- Modify: `frontend/src/pages/admin/SchoolAdminPage.role.test.tsx`
- Modify: `frontend/src/pages/admin/SchoolAdminPage.tsx`

- [ ] **Step 1: 기존 테스트 파일 전체 교체**

`frontend/src/pages/admin/SchoolAdminPage.role.test.tsx` 내용을 다음으로 교체:

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
vi.mock('../../components/Navbar', () => ({ default: () => null }))

const mockUpdateRole = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))

vi.mock('../../api/adminSchool', () => ({
  fetchSchoolStats: vi.fn().mockResolvedValue({
    totalUsers: 10, totalPosts: 5, totalNotices: 3,
    pendingApprovals: 0, activeAdmins: 1, totalVisits: 100,
  }),
  fetchSchoolVisitors: vi.fn().mockResolvedValue([]),
  fetchSchoolMonthlyStats: vi.fn().mockResolvedValue([]),
  fetchSchoolAllUsers: vi.fn().mockResolvedValue([
    { id: 1, name: '김교수', username: 'prof_kim', memberType: 'professor',
      adminRole: null, status: 'ACTIVE', department: null, universityId: '1', createdDate: '' },
    { id: 2, name: '이조교', username: 'ta_lee', memberType: 'assistant',
      adminRole: 'DEPT_ADMIN', status: 'ACTIVE', department: null, universityId: '1', createdDate: '' },
  ]),
  fetchSchoolPendingUsers: vi.fn().mockResolvedValue([]),
  fetchSchoolUsers: vi.fn().mockResolvedValue([
    { id: 2, name: '이조교', username: 'ta_lee', memberType: 'assistant',
      adminRole: 'DEPT_ADMIN', status: 'ACTIVE', department: null, universityId: '1', createdDate: '' },
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

describe('SchoolAdminPage — 역할 관리 모달', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateRole.mockResolvedValue(undefined)
    sessionStorage.setItem('adminRole', 'SCHOOL_ADMIN')
    sessionStorage.setItem('username', 'school_admin')
    sessionStorage.setItem('universityId', '1')
  })

  it('"전체 사용자" 탭에 사용자마다 "역할 관리" 버튼이 표시된다', async () => {
    renderPage()
    fireEvent.click(await screen.findByText('전체 사용자'))
    const buttons = await screen.findAllByRole('button', { name: '역할 관리' })
    expect(buttons).toHaveLength(2)
  })

  it('"역할 관리" 버튼 클릭 시 모달 다이얼로그가 열린다', async () => {
    renderPage()
    fireEvent.click(await screen.findByText('전체 사용자'))
    const buttons = await screen.findAllByRole('button', { name: '역할 관리' })
    fireEvent.click(buttons[0])
    expect(await screen.findByRole('dialog', { name: /역할 관리/ })).toBeInTheDocument()
  })

  it('모달에서 DEPT_ADMIN 선택 후 저장 시 updateSchoolUserRole이 호출된다', async () => {
    renderPage()
    fireEvent.click(await screen.findByText('전체 사용자'))
    // 김교수 (adminRole: null) 행
    const buttons = await screen.findAllByRole('button', { name: '역할 관리' })
    fireEvent.click(buttons[0])
    await screen.findByRole('dialog')

    const deptRadio = screen.getAllByRole('radio').find(
      r => (r as HTMLInputElement).value === 'DEPT_ADMIN'
    )!
    fireEvent.click(deptRadio)
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() =>
      expect(mockUpdateRole).toHaveBeenCalledWith(1, 'DEPT_ADMIN', undefined)
    )
  })

  it('역할 저장 실패 시 에러 메시지가 모달 내부에 표시된다', async () => {
    mockUpdateRole.mockRejectedValueOnce(new Error('이미 상위 역할을 보유하고 있습니다'))
    renderPage()
    fireEvent.click(await screen.findByText('전체 사용자'))
    const buttons = await screen.findAllByRole('button', { name: '역할 관리' })
    fireEvent.click(buttons[0])
    await screen.findByRole('dialog')

    const deptRadio = screen.getAllByRole('radio').find(
      r => (r as HTMLInputElement).value === 'DEPT_ADMIN'
    )!
    fireEvent.click(deptRadio)
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(
      await screen.findByText('이미 상위 역할을 보유하고 있습니다')
    ).toBeInTheDocument()
  })

  it('"관리자 계정" 탭에 memberType 뱃지가 adminRole과 함께 표시된다', async () => {
    renderPage()
    fireEvent.click(await screen.findByText('관리자 계정'))
    expect(await screen.findByText('assistant')).toBeInTheDocument()
    expect(screen.getByText('DEPT_ADMIN')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인 (SchoolAdminPage 아직 미수정)**

```bash
cd frontend
npx vitest run src/pages/admin/SchoolAdminPage.role.test.tsx 2>&1 | tail -15
```

Expected: 테스트 1, 2, 3, 4 FAIL ("역할 관리" 버튼 없음)

- [ ] **Step 3: SchoolAdminPage.tsx 수정**

`frontend/src/pages/admin/SchoolAdminPage.tsx`에서 다음 변경을 순서대로 적용한다.

**3-a) import 추가** (파일 상단 import 목록에 추가):
```tsx
import RoleManageModal from '../../components/admin/RoleManageModal'
```

**3-b) 상태 변경** — `roleChangeError` 상태 제거, `roleModalUser` 상태 추가:

기존:
```tsx
const [roleChangeError, setRoleChangeError] = useState<string | null>(null)
```

교체:
```tsx
const [roleModalUser, setRoleModalUser] = useState<AdminUser | null>(null)
```

(`AdminUser` 타입은 파일 상단 import에 이미 `type { ..., AdminUser, ... }` 형태로 포함돼 있어야 한다. 없으면 `import type { AdminUser } from '../../api/adminSchool'` 추가.)

**3-c) 함수 교체** — `handleInlineRoleChange` 제거, `handleSaveRole` 추가:

기존 함수(lines 113-126) 전체 제거:
```tsx
const handleInlineRoleChange = async (userId: number, newRole: string) => {
  setRoleChangeError(null)
  try {
    await updateSchoolUserRole(userId, newRole, univId)
    const [au, all] = await Promise.all([
      fetchSchoolUsers(univId),
      fetchSchoolAllUsers(univId),
    ])
    setAdminUsers(au)
    setAllUsers(all)
  } catch {
    setRoleChangeError('역할 변경에 실패했습니다. 다시 시도해 주세요.')
  }
}
```

대신 추가:
```tsx
const handleSaveRole = async (userId: number, newRole: string) => {
  await updateSchoolUserRole(userId, newRole, univId)
  const [au, all] = await Promise.all([
    fetchSchoolUsers(univId),
    fetchSchoolAllUsers(univId),
  ])
  setAdminUsers(au)
  setAllUsers(all)
  setRoleModalUser(null)
}
```

**3-d) JSX 수정 — 에러 메시지 제거**

기존:
```tsx
{roleChangeError && (
  <p className="text-sm text-red-500 mb-3">{roleChangeError}</p>
)}
```

삭제한다.

**3-e) JSX 수정 — 인라인 드롭다운 → 역할 배지 + 버튼**

기존 `관리자 역할` td (lines 372-383):
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

교체:
```tsx
<td className="py-3 pr-4">
  <span className="border border-gray-300 px-2 py-0.5 text-xs font-mono mr-2">
    {u.adminRole ?? '없음'}
  </span>
  <button
    onClick={() => setRoleModalUser(u)}
    className="text-xs border border-gray-400 px-2 py-0.5 hover:border-black transition"
  >
    역할 관리
  </button>
</td>
```

**3-f) JSX 수정 — 모달 마운트**

컴포넌트 JSX 최상위 `</div>` 바로 앞에 추가:
```tsx
{roleModalUser && (
  <RoleManageModal
    user={roleModalUser}
    onClose={() => setRoleModalUser(null)}
    onSave={handleSaveRole}
  />
)}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd frontend
npx vitest run src/pages/admin/SchoolAdminPage.role.test.tsx 2>&1 | tail -15
```

Expected:
```
Test Files  1 passed (1)
Tests       5 passed (5)
```

- [ ] **Step 5: 커밋**

```bash
git add frontend/src/pages/admin/SchoolAdminPage.tsx
git add frontend/src/pages/admin/SchoolAdminPage.role.test.tsx
git commit -m "feat: SchoolAdminPage 인라인 드롭다운을 RoleManageModal로 교체"
```

---

## Task 4: 프론트엔드 — DeptAdminPage + FacultyAdminPage 접근 범위 배너

**Files:**
- Modify: `frontend/src/pages/admin/DeptAdminPage.tsx`
- Modify: `frontend/src/pages/admin/FacultyAdminPage.tsx`

- [ ] **Step 1: DeptAdminPage.tsx 배너 추가**

`frontend/src/pages/admin/DeptAdminPage.tsx`에서 탭 바 종료 태그(`</div>`) 바로 다음 (line 232 이후), `{tab === '학과 페이지' ? (` 바로 앞에 삽입:

기존:
```tsx
      </div>

      {tab === '학과 페이지' ? (
```

교체:
```tsx
      </div>

      {!isPrivileged && sessionStorage.getItem('department') && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
            ℹ {sessionStorage.getItem('department')} 범위의 데이터만 표시됩니다.
          </div>
        </div>
      )}

      {tab === '학과 페이지' ? (
```

- [ ] **Step 2: FacultyAdminPage.tsx 배너 추가**

`frontend/src/pages/admin/FacultyAdminPage.tsx`에서 탭 바 종료 태그 다음, main content 시작 전에 삽입.

기존 (탭 바 종료 후, `{tab === '학부 페이지' ? (` 바로 앞):
```tsx
      </div>

      {tab === '학부 페이지' ? (
```

교체:
```tsx
      </div>

      {!isSuper && sessionStorage.getItem('college') && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
            ℹ {sessionStorage.getItem('college')} 범위의 데이터만 표시됩니다.
          </div>
        </div>
      )}

      {tab === '학부 페이지' ? (
```

- [ ] **Step 3: 빌드 확인 (타입 에러 없음)**

```bash
cd frontend
npx tsc --noEmit 2>&1 | head -20
```

Expected: 출력 없음 (에러 0)

- [ ] **Step 4: 커밋**

```bash
git add frontend/src/pages/admin/DeptAdminPage.tsx
git add frontend/src/pages/admin/FacultyAdminPage.tsx
git commit -m "feat: DeptAdminPage·FacultyAdminPage 접근 범위 배너 추가"
```

---

## 최종 검증

- [ ] **전체 프론트엔드 테스트 통과 확인**

```bash
cd frontend
npx vitest run 2>&1 | tail -10
```

Expected: 모든 테스트 PASS

- [ ] **전체 백엔드 테스트 통과 확인**

```bash
cd demo/demo
./mvnw test -q 2>&1 | tail -10
```

Expected: BUILD SUCCESS, 실패 0
