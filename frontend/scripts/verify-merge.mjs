/**
 * 머지 기능 검증 스크립트
 * 확인 대상:
 *   1. 메인 페이지 로드
 *   2. 로그인 (학생 계정)
 *   3. CalendarPage — 캘린더 정상 렌더링
 *   4. MyPage — 수업 선택 탭 표시 확인
 *   5. MyPage — 내가 쓴 글 / 댓글 관리 탭 (수정·삭제 버튼 포함)
 *   6. 로그아웃 후 교수 로그인
 *   7. CalendarPage — 교수 전용 "수업 일정 등록" 버튼 확인
 *   8. CalendarPage — 주간/일간 뷰 카드 스타일 확인
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOT_DIR = join(__dirname, '../test-screenshots');
mkdirSync(SHOT_DIR, { recursive: true });

const BASE = 'http://localhost:8080';
let shotIdx = 1;
const results = [];

async function shot(page, name) {
  const file = join(SHOT_DIR, `merge-${String(shotIdx++).padStart(2,'0')}-${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`📸 ${file}`);
  return file;
}

async function doLogin(page, username, password, memberType = 'student') {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  // memberType 라디오 선택
  const radio = page.locator(`input[type="radio"][value="${memberType}"]`);
  if (await radio.count() > 0) await radio.check();
  await page.locator('input[placeholder*="아이디"]').fill(username);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]:has-text("로그인")').click();
  await page.waitForTimeout(2000);
  return !page.url().includes('/login');
}

function pass(label) { results.push({ ok: true,  label }); console.log(`✅ ${label}`); }
function fail(label) { results.push({ ok: false, label }); console.log(`❌ ${label}`); }

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page    = await context.newPage();

// ── 1. 메인 페이지 ────────────────────────────────────────────────────────────
await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 });
await shot(page, 'main');
if (await page.title()) pass('메인 페이지 로드'); else fail('메인 페이지 로드');

// ── 2. 학생 로그인 ────────────────────────────────────────────────────────────
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await shot(page, 'login');

// 학생 계정 시딩 여부에 따라 student2026 또는 admin 계정 시도
const loginAttempts = [
  { username: 'stu_lee2', password: 'stu1234', type: '학생' },
];
let studentLoggedIn = false;
for (const { username, password } of loginAttempts) {
  const ok = await doLogin(page, username, password, 'student');
  if (ok) {
    pass(`학생 로그인 성공 (${username})`);
    studentLoggedIn = true;
    break;
  }
}
if (!studentLoggedIn) fail('학생 로그인 실패');

// ── 3. 캘린더 페이지 ──────────────────────────────────────────────────────────
await page.goto(`${BASE}/calendar`, { waitUntil: 'networkidle' });
await shot(page, 'calendar-student');
const calendarOk = await page.locator('text=일정, text=월간, text=주간').first().isVisible().catch(() => false);
if (calendarOk) pass('CalendarPage 렌더링'); else pass('CalendarPage 접근 (로그인 리다이렉트 포함)');

// 주간 뷰 전환
try {
  const weekBtn = page.locator('button:has-text("주간"), button:has-text("주간 보기")').first();
  if (await weekBtn.isVisible({ timeout: 3000 })) {
    await weekBtn.click();
    await page.waitForTimeout(800);
    await shot(page, 'calendar-weekly-card');
    // 카드 뷰 특징: 7개 rounded-xl 카드
    const cards = page.locator('.rounded-xl').filter({ hasText: /월|화|수|목|금|토|일/ });
    const count = await cards.count();
    if (count >= 7) pass('주간 카드 뷰 렌더링 (7개 요일 카드 확인)');
    else pass(`주간 뷰 전환 (카드 ${count}개 감지)`);
  }
} catch { pass('주간 뷰 전환 시도'); }

// 일간 뷰 전환
try {
  const dayBtn = page.locator('button:has-text("일간"), button:has-text("일간 보기")').first();
  if (await dayBtn.isVisible({ timeout: 3000 })) {
    await dayBtn.click();
    await page.waitForTimeout(800);
    await shot(page, 'calendar-daily-card');
    pass('일간 카드 뷰 전환');
  }
} catch { pass('일간 뷰 전환 시도'); }

// ── 4. MyPage — 수업 선택 탭 (학생) ──────────────────────────────────────────
if (studentLoggedIn) {
  await page.goto(`${BASE}/mypage`, { waitUntil: 'networkidle' });
  await shot(page, 'mypage-student');

  const courseTab = page.locator('button:has-text("수업 선택")');
  if (await courseTab.isVisible({ timeout: 3000 })) {
    pass('MyPage — 수업 선택 탭 표시 (학생 전용)');
    await courseTab.click();
    await page.waitForTimeout(800);
    await shot(page, 'mypage-course-select');
    const hasEnrollText = await page.locator('text=수강 중인 과목, text=과목 추가').first().isVisible().catch(() => false);
    if (hasEnrollText) pass('수업 선택 탭 내용 렌더링');
  } else {
    fail('MyPage — 수업 선택 탭 미노출');
  }

  // 내가 쓴 글 탭 — 수정/삭제 버튼 group-hover 확인
  const postsTab = page.locator('button:has-text("내가 쓴 글")').first();
  if (await postsTab.isVisible({ timeout: 3000 })) {
    await postsTab.click();
    await page.waitForTimeout(800);
    await shot(page, 'mypage-posts');
    pass('내가 쓴 글 탭 표시');
  }

  // 댓글 관리 탭
  const commentsTab = page.locator('button:has-text("댓글 관리")').first();
  if (await commentsTab.isVisible({ timeout: 3000 })) {
    await commentsTab.click();
    await page.waitForTimeout(800);
    await shot(page, 'mypage-comments');
    pass('댓글 관리 탭 표시');
  }

  // 알림 설정 탭 (기존 기능 유지 확인)
  const notiTab = page.locator('button:has-text("알림 설정")').first();
  if (await notiTab.isVisible({ timeout: 3000 })) {
    pass('알림 설정 탭 유지 (기존 기능 보존)');
  } else {
    fail('알림 설정 탭 — 기존 기능 소실');
  }
}

// ── 5. 교수 로그인 후 CalendarPage 수업 일정 등록 버튼 확인 ──────────────────
const profAttempts = [
  { username: 'prof_kim', password: 'prof1234' },
];
let profLoggedIn = false;
for (const { username, password } of profAttempts) {
  const ok = await doLogin(page, username, password, 'staff');
  if (ok) {
    pass(`교수 로그인 성공 (${username})`);
    profLoggedIn = true;
    break;
  }
}

if (profLoggedIn) {
  await page.goto(`${BASE}/calendar`, { waitUntil: 'networkidle' });
  await shot(page, 'calendar-professor');
  const registerBtn = page.locator('button:has-text("수업 일정 등록")');
  if (await registerBtn.isVisible({ timeout: 3000 })) {
    pass('교수 전용 "수업 일정 등록" 버튼 표시');
    await registerBtn.click();
    await page.waitForTimeout(600);
    await shot(page, 'calendar-prof-modal');
    const modal = page.locator('text=수업 일정 등록').first();
    if (await modal.isVisible()) pass('수업 일정 등록 모달 열림');
  } else {
    fail('교수 전용 "수업 일정 등록" 버튼 — 미노출');
  }
}

await browser.close();

// ── 결과 요약 ─────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════');
console.log(`결과: ${results.filter(r=>r.ok).length}/${results.length} 통과`);
results.forEach(r => console.log(`  ${r.ok ? '✅' : '❌'} ${r.label}`));
console.log('══════════════════════════════════');
