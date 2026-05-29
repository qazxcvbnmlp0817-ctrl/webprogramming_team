# School CRUD — Super Admin 설계 문서

## Goal

SuperAdminPage에 "학교 관리" 탭을 추가하여 SUPER_ADMIN이 학교(University)와 전체 계층(단과대학 → 학부 → 학과)을 생성·수정·삭제할 수 있도록 한다.

## Architecture

- **위치:** SuperAdminPage에 탭 구조 도입. "개요" 탭(기존 내용)과 "학교 관리" 탭(신규) 2개.
- **프론트엔드 전략:** 중첩 JSON Draft state를 로컬에서 편집하다가 최종 버튼 클릭 시 단일 API 호출로 전체 트리를 저장 (all-or-nothing).
- **백엔드 전략:** 단일 `@Transactional` 내에서 University → CollegeSchool → FacultyGroup → Department 순으로 저장/수정/삭제.

## Tech Stack

- Frontend: React 18 + TypeScript, Tailwind CSS (기존 모노크롬 디자인 언어 유지)
- Backend: Spring Boot, Spring Data JPA, Oracle 23ai Free
- Auth: `X-Username` 헤더 + SUPER_ADMIN role 검증 (기존 `verifySuper()` 패턴 재사용)

---

## 1. 탭 구조 및 UI 레이아웃

### SuperAdminPage 탭 전환

기존 단일 스크롤 페이지를 두 탭으로 분리한다.

```
[ 개요 ] [ 학교 관리 ]
```

- **개요 탭**: 기존 내용 그대로 (통계, 차트, 인프라, 가입 승인, 관리자 계정)
- **학교 관리 탭**: School CRUD UI

탭 상태는 `activeTab: 'overview' | 'schools'`로 관리.

### 학교 관리 탭 — 뷰 상태

`view: 'list' | 'create' | 'edit'` 단일 state로 전환.

**List 뷰 (기본)**

```
[ + 새 학교 생성 ]                              ← 우상단

┌────────────────────────────────────────────┐
│  ID   이름              설명   [편집] [삭제] │
│   1   목포대학교         ...               │
│   2   순천대학교         ...               │
└────────────────────────────────────────────┘
```

**Create / Edit 뷰 (폼)**

```
← 목록으로

[ 학교 이름 * ]
[ 설명 (선택) ]

단과대학
┌──────────────────────────────────────────┐
│ 공학대학              [이름 편집] [삭제]   │
│   학부                                   │
│   ┌────────────────────────────────────┐ │
│   │ 컴퓨터공학부       [이름 편집] [삭제]│ │
│   │   학과                             │ │
│   │   ├ 컴퓨터공학과   [이름 편집] [삭제]│ │
│   │   └ [ + 학과 추가 ]               │ │
│   └────────────────────────────────────┘ │
│   [ + 학부 추가 ]                        │
└──────────────────────────────────────────┘
[ + 단과대학 추가 ]

                          [ 취소 ] [ 생성/저장 ]
```

디자인 언어: `border-2 border-black`, 모노크롬, `text-xs uppercase tracking-widest text-gray-500` — 기존 SuperAdminPage 스타일 그대로.

---

## 2. 데이터 모델 & API

### 요청/응답 JSON (트리 DTO)

생성(POST)과 수정(PUT) 공통 구조. `id: null`은 신규, `id: number`는 기존 항목.

```json
{
  "name": "목포대학교",
  "description": "국립 목포대학교",
  "colleges": [
    {
      "id": null,
      "name": "공학대학",
      "description": "",
      "faculties": [
        {
          "id": null,
          "name": "컴퓨터공학부",
          "departments": [
            {
              "id": null,
              "name": "컴퓨터공학과",
              "description": "",
              "phone": "",
              "email": ""
            }
          ]
        }
      ]
    }
  ]
}
```

### API 엔드포인트

| Method | 경로 | 설명 | 권한 |
|--------|------|------|------|
| `GET` | `/api/admin/super/schools` | 학교 목록 (id, name, description) | SUPER_ADMIN |
| `GET` | `/api/admin/super/schools/{id}/tree` | 특정 학교 전체 트리 (수정 폼 초기화용) | SUPER_ADMIN |
| `POST` | `/api/admin/super/schools` | 학교 + 전체 계층 일괄 생성 | SUPER_ADMIN |
| `PUT` | `/api/admin/super/schools/{id}` | 학교 + 전체 계층 일괄 수정 (merge) | SUPER_ADMIN |
| `DELETE` | `/api/admin/super/schools/{id}` | 학교 + 모든 하위 데이터 cascade 삭제 | SUPER_ADMIN |

기존 `/api/admin/super/schools` GET은 이미 존재하므로 응답 형식 확인 후 재사용.

### 백엔드 트랜잭션 전략

**POST (생성):**
```
University 저장 → id 획득
  └── CollegeSchool 저장 (universityId 세팅) → id 획득
        └── FacultyGroup 저장 (schoolId 세팅) → id 획득
              └── Department 저장 (facultyId 세팅)
단일 @Transactional — 실패 시 전체 롤백
```

**PUT (수정) — Merge 전략:**
```
1. 요청의 college id 목록 추출
2. DB 기존 college 목록과 비교
   - 요청에 없는 id → cascade 삭제
   - id = null → 신규 생성
   - id 일치 → name/description 업데이트
3. faculty, department 레벨도 동일하게 재귀 반복
```

**DELETE (cascade 삭제) 순서:**
```
1. Department 하위: ClassSchedule, Enrollment, CurriculumItem,
                    ProfessorCourseAssignment, Professor
2. Department 삭제
3. FacultyGroup 삭제
4. CollegeSchool 삭제
5. Notice/Post/Schedule (scopeType=univ, scopeId=universityId) 삭제
6. University 삭제
7. APP_USERS.universityId → null (계정 삭제 아님, 소속만 해제)
```

---

## 3. 프론트엔드 상태 관리 & 컴포넌트 구조

### TypeScript 타입 (`types/schoolDraft.ts`)

```typescript
export interface DeptDraft {
  id: number | null
  name: string
  description: string
  phone: string
  email: string
}

export interface FacultyDraft {
  id: number | null
  name: string
  departments: DeptDraft[]
}

export interface CollegeDraft {
  id: number | null
  name: string
  description: string
  faculties: FacultyDraft[]
}

export interface SchoolDraft {
  name: string
  description: string
  colleges: CollegeDraft[]
}

export const emptyDraft: SchoolDraft = {
  name: '', description: '', colleges: []
}
```

### 헬퍼 함수 (`utils/schoolDraftHelpers.ts`)

중첩 불변 업데이트를 담당하는 순수 함수 모음. 컴포넌트에서 직접 spread 연산을 반복하지 않도록 분리.

```typescript
addCollege(draft): SchoolDraft
removeCollege(draft, ci): SchoolDraft
updateCollege(draft, ci, field, value): SchoolDraft

addFaculty(draft, ci): SchoolDraft
removeFaculty(draft, ci, fi): SchoolDraft
updateFaculty(draft, ci, fi, field, value): SchoolDraft

addDept(draft, ci, fi): SchoolDraft
removeDept(draft, ci, fi, di): SchoolDraft
updateDept(draft, ci, fi, di, field, value): SchoolDraft
```

### 컴포넌트 구조

```
SuperAdminPage
├── 탭 헤더 [ 개요 | 학교 관리 ]
├── [activeTab === 'overview'] → 기존 내용 그대로
└── [activeTab === 'schools'] → SchoolManagementTab
      ├── [view === 'list'] → SchoolListView
      │     └── 학교 행: [편집] [삭제]
      └── [view === 'create' | 'edit'] → SchoolFormView
            ├── 학교 이름/설명 input
            └── SchoolTreeEditor
                  └── CollegeEditor × colleges.length
                        ├── 단과대학 이름 input + [삭제]
                        └── FacultyEditor × faculties.length
                              ├── 학부 이름 input + [삭제]
                              ├── DeptRow × departments.length
                              │     └── 학과 이름 input + [삭제]
                              └── [+ 학과 추가]
                        └── [+ 학부 추가]
                  └── [+ 단과대학 추가]
```

### API 연동 파일 (`api/adminSuper.ts` 확장)

기존 `adminSuper.ts`에 아래 함수 추가:

```typescript
fetchSchoolTree(id: number): Promise<SchoolDraft>
createSchool(draft: SchoolDraft): Promise<{ id: number }>
updateSchool(id: number, draft: SchoolDraft): Promise<void>
deleteSchool(id: number): Promise<void>
```

### 사용자 흐름

**생성:**
```
"+ 새 학교 생성" 클릭
  → draft = emptyDraft, view = 'create'
  → 폼에서 트리 편집
  → "생성" 클릭 → POST /api/admin/super/schools
  → 성공 → view = 'list', schools 목록 갱신
```

**수정:**
```
[편집] 클릭
  → GET /api/admin/super/schools/{id}/tree
  → 응답으로 draft 초기화, view = 'edit'
  → 폼에서 트리 편집 (기존 id 보존됨)
  → "저장" 클릭 → PUT /api/admin/super/schools/{id}
  → 성공 → view = 'list', schools 목록 갱신
```

**삭제:**
```
[삭제] 클릭
  → 1차 confirm("정말 삭제하시겠습니까?")
  → 2차 confirm("이 작업은 되돌릴 수 없습니다.\n학교와 모든 하위 데이터(단과대학, 학부, 학과, 교수, 교육과정)가 영구 삭제됩니다.")
  → DELETE /api/admin/super/schools/{id}
  → schools 목록 갱신
```

---

## 4. 새로 생성/수정할 파일 목록

### Frontend
| 파일 | 변경 | 내용 |
|------|------|------|
| `pages/admin/SuperAdminPage.tsx` | 수정 | 탭 구조 도입, SchoolManagementTab 추가 |
| `pages/admin/SchoolManagementTab.tsx` | 신규 | list/create/edit 뷰 관리, API 연동 |
| `pages/admin/SchoolTreeEditor.tsx` | 신규 | CollegeEditor, FacultyEditor, DeptRow 포함한 트리 편집 UI |
| `types/schoolDraft.ts` | 신규 | SchoolDraft, CollegeDraft, FacultyDraft, DeptDraft 타입 |
| `utils/schoolDraftHelpers.ts` | 신규 | 중첩 불변 업데이트 헬퍼 순수 함수 |
| `api/adminSuper.ts` | 수정 | fetchSchoolTree, createSchool, updateSchool, deleteSchool 추가 |

### Backend
| 파일 | 변경 | 내용 |
|------|------|------|
| `controller/SuperAdminController.java` | 수정 | GET tree, POST, PUT, DELETE 엔드포인트 추가 |
| `service/SchoolCrudService.java` | 신규 | 트리 생성/수정/삭제 트랜잭션 로직 |
| `dto/SchoolTreeDto.java` | 신규 | 요청/응답 중첩 DTO (SchoolTreeDto, CollegeDto, FacultyDto, DeptDto) |
