# Role Hierarchy, Modal Management & Department Access Control Design

**Date:** 2026-05-27
**Scope:** 역할 계층 최적화 + 모달 기반 역할 관리 UI + 최소 역할 보장 + 학과 접근 범위 표시

---

## 1. 요구사항 요약

| 요구사항 | 구현 방식 |
|---------|---------|
| 복수 역할 계층 (Professor + DEPT_ADMIN 등) | 기존 `member_type` + `admin_role` 두 컬럼 조합; 항상 최고 역할만 저장 |
| Admin 역할 계층: SUPER_ADMIN > SCHOOL_ADMIN > DEPT_ADMIN | `AdminService.updateUserRole`에 roleLevel 비교 로직 추가 |
| 모달 기반 역할 관리 UI | `RoleManageModal.tsx` 신규 컴포넌트 + SchoolAdminPage 버튼으로 연결 |
| 최소 1개 역할 보장 | `memberType='admin'` 계정의 `adminRole=null` 설정 차단 (422) |
| 학과 기반 데이터 격리 | 백엔드 이미 구현 완료; DeptAdminPage에 스코프 표시 배너 추가 |

---

## 2. DB 스키마

**변경 없음.** 기존 두 컬럼으로 모든 복수 역할 조합 표현 가능.

```
APP_USERS
├── member_type  VARCHAR  -- "student" | "professor" | "assistant" | "admin"
└── admin_role   VARCHAR  -- "SUPER_ADMIN" | "SCHOOL_ADMIN" | "DEPT_ADMIN" | null
```

**역할 계층 레벨:**

| admin_role | level |
|-----------|-------|
| SUPER_ADMIN | 3 |
| SCHOOL_ADMIN | 2 |
| DEPT_ADMIN | 1 |
| null | 0 |

**계층 최적화 규칙:** 새 역할의 level이 현재 역할의 level보다 낮으면 할당 거부 (422). 같거나 높으면 새 역할로 덮어씀. SCHOOL_ADMIN은 DEPT_ADMIN을 포함하므로 두 역할을 동시에 저장할 필요 없음.

**역할 조합 예시:**

| member_type | admin_role | 의미 |
|-------------|-----------|------|
| professor | null | 교수 전용 |
| professor | DEPT_ADMIN | 교수 겸 학과 관리자 |
| assistant | SCHOOL_ADMIN | 조교 겸 학교 관리자 |
| admin | SCHOOL_ADMIN | 전용 학교 관리자 (adminRole 필수) |

---

## 3. 백엔드 변경

### 3-1. AdminService.java — `updateUserRole` 계층 로직 추가

**파일:** `demo/demo/src/main/java/com/example/demo/service/AdminService.java`

```java
// updateUserRole 메서드 내 변경
public Map<String, Object> updateUserRole(Long userId, String role,
                                           String actor, Long univId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    String oldRole = user.getAdminRole();
    boolean grant = role != null && !role.isBlank();

    if (grant) {
        // 계층 최적화: 이미 상위 역할 보유 시 거부
        if (roleLevel(oldRole) > roleLevel(role)) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "이미 상위 역할(" + oldRole + ")을 보유하고 있습니다. 먼저 현재 역할을 박탈하세요.");
        }
        user.setAdminRole(role);
    } else {
        // 최소 역할 보장: admin 타입은 adminRole 필수
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

// 신규 private helper
private int roleLevel(String role) {
    if ("SUPER_ADMIN".equals(role)) return 3;
    if ("SCHOOL_ADMIN".equals(role)) return 2;
    if ("DEPT_ADMIN".equals(role)) return 1;
    return 0;
}
```

**`SchoolAdminController.updateRole`:** 기존 SUPER_ADMIN 차단 조건 유지. 추가 변경 없음.

---

## 4. 프론트엔드 변경

### 4-1. RoleManageModal.tsx (신규)

**파일:** `frontend/src/components/admin/RoleManageModal.tsx`

Props:
```ts
interface Props {
  user: AdminUser        // 관리 대상 사용자
  onClose: () => void   // 모달 닫기
  onSave: (userId: number, newRole: string) => Promise<void>  // 저장 핸들러
}
```

UI 구조:
```
┌──────────────────────────────────────────┐
│  역할 관리                        [✕]   │
│  {user.name} ({user.username})           │
│  유형: [{user.memberType}]              │
├──────────────────────────────────────────┤
│  현재 역할: [{user.adminRole ?? '없음'}] │
│                                          │
│  변경할 역할:                            │
│  ○ 없음         ← admin 타입이면 disabled │
│  ○ DEPT_ADMIN   단과대 / 학과 관리자     │
│  ○ SCHOOL_ADMIN 학교 관리자              │
│                                          │
│  ℹ SCHOOL_ADMIN은 DEPT_ADMIN을 포함합니다 │
│                                          │
│  {saveError && <에러 메시지>}           │
│                                          │
│          [취소]        [저장]           │
└──────────────────────────────────────────┘
```

동작 규칙:
- `없음` 옵션: `user.memberType === 'admin'`이면 `disabled`
- 저장 버튼: `selectedRole === user.adminRole`이면 비활성화 (변경 없음)
- API 실패 시 모달 내부에 인라인 에러 메시지 표시 (모달 닫지 않음)
- 저장 성공 시 모달 자동 닫힘

### 4-2. SchoolAdminPage.tsx 변경

**"전체 사용자" 탭:**
- 기존: 각 행에 `<select aria-label="관리자 역할">` 인라인 드롭다운
- 변경: **"역할 관리"** 버튼으로 교체 → 클릭 시 해당 사용자의 `RoleManageModal` 오픈

상태 추가:
```ts
const [roleModalUser, setRoleModalUser] = useState<AdminUser | null>(null)
```

핸들러:
```ts
const handleSaveRole = async (userId: number, newRole: string) => {
  await updateSchoolUserRole(userId, newRole, univId)
  const [au, all] = await Promise.all([fetchSchoolUsers(univId), fetchSchoolAllUsers(univId)])
  setAdminUsers(au)
  setAllUsers(all)
  setRoleModalUser(null)  // 모달 닫기
}
```

테이블 컬럼 변경: `관리자 역할` 컬럼 → 현재 `adminRole` 뱃지 + "역할 관리" 버튼

### 4-3. DeptAdminPage.tsx — 접근 범위 표시 배너 추가

**파일:** `frontend/src/pages/admin/DeptAdminPage.tsx`

대시보드 상단에 범위 표시:
```tsx
const department = sessionStorage.getItem('department')
// ...
{department && (
  <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 text-sm text-blue-700">
    ℹ {department} 범위의 데이터만 표시됩니다.
  </div>
)}
```

동일하게 `FacultyAdminPage.tsx`에도 단과대학(college) 범위 표시 배너 추가.

---

## 5. 영향 범위

| 파일 | 변경 유형 |
|------|---------|
| `AdminService.java` | `updateUserRole` 메서드 수정 + `roleLevel` helper 추가 |
| `RoleManageModal.tsx` | 신규 컴포넌트 |
| `SchoolAdminPage.tsx` | 인라인 드롭다운 → 모달 버튼으로 교체 |
| `DeptAdminPage.tsx` | 스코프 표시 배너 추가 |
| `FacultyAdminPage.tsx` | 스코프 표시 배너 추가 |

**변경 없는 파일:** DB 스키마, SchoolAdminController(조건 유지), AdminBanner, App.tsx, authStorage.ts, adminSchool.ts API

---

## 6. 테스트 포인트

- DEPT_ADMIN 사용자에게 SCHOOL_ADMIN 부여 → SCHOOL_ADMIN으로 업그레이드 성공
- SCHOOL_ADMIN 사용자에게 DEPT_ADMIN 부여 시도 → 422 에러, 모달에 에러 메시지 표시
- `memberType='admin'` 사용자: 모달에서 "없음" 옵션 disabled 확인
- `memberType='professor'` 사용자: 모달에서 "없음" 선택 → adminRole=null 성공
- DeptAdminPage 접근 시 스코프 배너에 본인 학과명 표시
- FacultyAdminPage 접근 시 스코프 배너에 본인 단과대학명 표시
