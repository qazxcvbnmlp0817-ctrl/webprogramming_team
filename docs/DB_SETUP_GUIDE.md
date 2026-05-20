# 데이터베이스 연동 가이드

> Oracle 23ai Free + Spring Data JPA 연동 절차 및 현재 구현 상태
>
> **[2026-05-20 기준] 코드 구현은 완료된 상태입니다.**
> 팀원은 아래 [로컬 Oracle 환경 구축] 섹션을 따라 Oracle을 설치하고 계정을 생성하면 바로 실행 가능합니다.

---

## 로컬 Oracle 환경 구축 (팀원 필수)

> 각 팀원이 자신의 PC에 Oracle 23ai Free를 설치하고 동일한 계정을 생성합니다.
> 추후 팀장 DB로 통합 전까지는 로컬 DB에서 독립적으로 개발합니다.

---

### Step 1 — Oracle 23ai Free 다운로드

1. 아래 Oracle 공식 페이지에 접속합니다.
   ```
   https://www.oracle.com/database/technologies/free-downloads.html
   ```

2. **Oracle Database 23ai Free** → **Windows x86 64-bit** 선택 후 다운로드
   - 파일명: `WINDOWS.X64_235000_db_home.zip` (약 3GB)
   - Oracle 계정이 필요합니다 (무료 회원가입 후 다운로드 가능)

---

### Step 2 — Oracle 23ai Free 설치

1. 다운로드한 zip 파일을 `C:\oracle\23ai\` 같이 **경로에 한글/공백이 없는 곳**에 압축 해제합니다.

2. 압축 해제된 폴더 안의 `setup.exe`를 **우클릭 → 관리자 권한으로 실행**합니다.

3. 설치 마법사 진행:
   - **Oracle Base**: `C:\oracle\23ai` (기본값 권장)
   - **비밀번호 설정**: SYS, SYSTEM, PDBADMIN 공통 비밀번호 입력
     - 예시: `Oracle1234!` (영문 대소문자 + 숫자 + 특수문자 포함 필수)
     - **이 비밀번호를 반드시 기억해 두세요**
   - 설치 완료까지 10~20분 소요

4. 설치 완료 후 자동으로 아래 항목이 생성됩니다:
   - Windows 서비스: `OracleServiceFREE` (Oracle 엔진)
   - Windows 서비스: `OracleOraDB23Home1TNSListener` (리스너, 포트 1521)
   - PDB(플러그인 DB): `freepdb1` (Spring Boot가 접속할 대상)

---

### Step 3 — Oracle 서비스 시작 확인

설치 후 서비스가 자동 시작되어 있어야 합니다. 확인 방법:

**방법 A — PowerShell로 확인**
```powershell
Get-Service | Where-Object { $_.Name -like "Oracle*" }
```
아래 두 서비스가 `Running` 상태여야 합니다:
```
OracleServiceFREE            Running
OracleOraDB23Home1TNSListener Running
```

**방법 B — Windows 서비스에서 확인**
- `Win + R` → `services.msc` 입력 → `OracleServiceFREE` 찾아서 상태 확인

**서비스가 Stopped 상태라면 시작:**
```powershell
Start-Service OracleServiceFREE
Start-Service OracleOraDB23Home1TNSListener
```

---

### Step 4 — SQL*Plus로 접속 테스트

PowerShell 또는 명령 프롬프트에서:

```powershell
sqlplus sys/[설치시비밀번호]@localhost:1521/freepdb1 as sysdba
```

접속 성공 시 아래처럼 표시됩니다:
```
SQL*Plus: Release 23.0.0.0.0
Connected to:
Oracle Database 23ai Free Release 23.0.0.0.0

SQL>
```

> 접속 안 되면 Step 3으로 돌아가 서비스 상태를 확인하세요.

---

### Step 5 — dept_user 계정 생성 및 권한 부여

SQL*Plus 접속 후 아래 명령어를 순서대로 실행합니다:

```sql
-- freepdb1 PDB에 접속
ALTER SESSION SET CONTAINER = FREEPDB1;

-- dept_user 계정 생성
CREATE USER dept_user IDENTIFIED BY dept1234;

-- 필요한 권한 부여
GRANT CREATE SESSION TO dept_user;
GRANT CREATE TABLE TO dept_user;
GRANT CREATE SEQUENCE TO dept_user;
GRANT UNLIMITED TABLESPACE TO dept_user;

-- 확인
SELECT username FROM dba_users WHERE username = 'DEPT_USER';

-- 종료
EXIT;
```

> **주의**: `CREATE SESSION` 권한이 없으면 Spring Boot가 DB에 접속 자체를 못합니다.

---

### Step 6 — SQL Developer로 접속 확인 (선택사항)

Oracle SQL Developer를 사용해 GUI로 확인할 수 있습니다.

1. SQL Developer 실행 → 좌측 상단 `+` 버튼 (새 접속)
2. 아래 정보 입력:

   | 항목 | 값 |
   |------|-----|
   | 접속 이름 | dept_user_local (자유) |
   | 사용자 이름 | dept_user |
   | 비밀번호 | dept1234 |
   | 호스트 | localhost |
   | 포트 | 1521 |
   | 서비스 이름 | freepdb1 |

3. **테스트** 버튼 → `성공` 확인 → **저장** → **접속**

> SQL Developer는 Oracle 설치 시 함께 설치되거나 별도 다운로드:
> `https://www.oracle.com/tools/downloads/sqldev-downloads.html`

---

### Step 7 — application-secret.properties 파일 생성

아래 경로에 파일을 **직접 생성**합니다 (Git에 올라가지 않으므로 각자 생성 필수):

```
demo/demo/src/main/resources/application-secret.properties
```

```properties
spring.datasource.url=jdbc:oracle:thin:@//localhost:1521/freepdb1
spring.datasource.username=dept_user
spring.datasource.password=dept1234
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver

spring.jpa.database-platform=org.hibernate.dialect.OracleDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

---

### Step 8 — 프론트엔드 빌드

```bash
cd frontend
npm install
npm run build
```

---

### Step 9 — Spring Boot 실행 및 확인

```bash
cd demo/demo
./mvnw spring-boot:run
```

콘솔에 아래 메시지가 나오면 성공:
```
Started DemoApplication in X.XXX seconds
```

`http://localhost:8080` 접속 → 목포대학교/순천대학교 목록이 보이면 정상입니다.

> 테이블은 `ddl-auto=update` 설정으로 **앱 최초 실행 시 자동 생성**됩니다.
> 대학/학과 시드 데이터도 `DataInitializer`가 자동으로 삽입합니다.

---

## 자주 발생하는 오류

### ORA-01045: user DEPT_USER lacks CREATE SESSION privilege

`application-secret.properties`는 맞는데 Spring Boot가 DB 접속을 못 하는 경우입니다.

```sql
-- sysdba로 접속 후 실행
ALTER SESSION SET CONTAINER = FREEPDB1;
GRANT CREATE SESSION TO dept_user;
```

---

### Port 1521 연결 실패 / Listener 오류

Oracle 리스너가 꺼져 있는 경우입니다.

```powershell
Start-Service OracleOraDB23Home1TNSListener
```

또는 PowerShell에서:
```powershell
lsnrctl start
```

---

### Port 8080 already in use

이전에 실행한 Spring Boot가 아직 살아 있는 경우입니다.

```powershell
netstat -ano | findstr ":8080"
# 출력된 PID로 종료
Stop-Process -Id [PID] -Force
```

---

### Spring Boot 시작 시 테이블 자동 생성 안 됨

`ddl-auto=update`인데 테이블이 안 생기면 `dept_user`에 `CREATE TABLE` 권한이 없는 것입니다.

```sql
ALTER SESSION SET CONTAINER = FREEPDB1;
GRANT CREATE TABLE TO dept_user;
GRANT UNLIMITED TABLESPACE TO dept_user;
```

---

## Oracle 서비스 시작/중지 방법

개발할 때만 Oracle을 켜두고 싶다면:

```powershell
# 시작
Start-Service OracleServiceFREE
Start-Service OracleOraDB23Home1TNSListener

# 중지
Stop-Service OracleOraDB23Home1TNSListener
Stop-Service OracleServiceFREE
```

> Oracle은 메모리를 많이 사용(약 1~2GB)하므로 개발하지 않을 때는 중지해도 됩니다.
> 서비스 자동시작이 싫다면 Windows 서비스에서 시작 유형을 `수동`으로 변경하세요.

---

## 현재 구현 완료 현황 (코드)

```
✅ application-secret.properties 구조 (팀원 로컬 생성 필요)
✅ pom.xml JPA/Oracle 의존성 활성화
✅ Entity 10개 (ddl-auto=update로 자동 테이블 생성)
✅ Repository / Service / Controller 구현 완료
✅ DataInitializer — 최초 실행 시 대학·학과 시드 데이터 자동 삽입
✅ BCrypt 암호화 활성화
✅ 더미 데이터 폴백 (DB에 글이 없으면 더미 표시)
```

---

## 참고: scopeType / scopeId 패턴

공지·게시글·일정은 학과/학부/단과대 구분을 위해 `scopeType` + `scopeId` 조합을 사용합니다.

| scopeType | scopeId | 설명 |
|-----------|---------|------|
| `"dept"` | 학과 ID (DEPTS.id) | 학과 게시물 |
| `"faculty"` | 학부 ID (FACULTY_GROUPS.id) | 학부 게시물 |
| `"univ"` | 단과대 ID (COLLEGE_SCHOOLS.id) | 단과대 게시물 |

---

## 참고: ddl-auto 옵션 설명

| 값 | 동작 | 사용 시점 |
|----|------|----------|
| `create` | 앱 시작 시 테이블 새로 생성 (기존 데이터 삭제) | 초기 개발 |
| `update` | Entity 변경분만 반영 (기존 데이터 유지) | **현재 사용 중** |
| `validate` | Entity와 DB 스키마 일치 여부만 확인 | 운영 전 검증 |
| `none` | 아무것도 하지 않음 | 운영 환경 |
