/**
 * Multi-role UI 검증 스크립트
 * 1. ta_cs2026 (assistant + SCHOOL_ADMIN) 로그인
 * 2. School Admin 대시보드 진입
 * 3. "전체 사용자" 탭 → 역할 드롭다운 확인
 * 4. 역할 부여 동작 확인 (본인 외 사용자 대상)
 * 5. "관리자 계정" 탭 → memberType 뱃지 확인
 * 6. 메인 페이지 AdminBanner 확인
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOT_DIR = join(__dirname, '../test-screenshots');
mkdirSync(SHOT_DIR, { recursive: true });

const BASE = 'http://localhost:5173';
let shotIdx = 1;

async function shot(page, name) {
  const file = join(SHOT_DIR, `${String(shotIdx++).padStart(2,'0')}-${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`📸 ${file}`);
  return file;
}

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();

try {
  // ── 1. 로그인 페이지 ──────────────────────────────────────────────
  console.log('\n[1] 로그인 페이지 진입...');
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await shot(page, 'login-page');

  // 아이디 입력
  await page.fill('input[placeholder*="아이디"], input[name="username"], input[type="text"]', 'ta_cs2026');

  // 비밀번호 입력
  await page.fill('input[type="password"]', 'ta1234!');

  // 회원 유형 선택 (교직원)
  const staffOptions = await page.$$('input[type="radio"]');
  for (const opt of staffOptions) {
    const val = await opt.getAttribute('value');
    const label = await page.evaluate(el => {
      const label = document.querySelector(`label[for="${el.id}"]`);
      return label?.textContent ?? el.value;
    }, opt);
    console.log(`  라디오 옵션: value="${val}" label="${label}"`);
  }

  // 교직원 선택
  const staffRadio = page.locator('input[value="staff"], label:has-text("교직원"), button:has-text("교직원")').first();
  if (await staffRadio.count() > 0) {
    await staffRadio.click();
    console.log('  교직원 선택 완료');
  }

  // 조교 역할 선택 (드롭다운이 있을 경우)
  await page.waitForTimeout(500);
  const loginRoleSelect = page.locator('select, [role="combobox"]').first();
  if (await loginRoleSelect.count() > 0) {
    const options = await loginRoleSelect.locator('option').allTextContents();
    console.log('  역할 옵션:', options);
    if (options.some(o => o.includes('조교') || o.includes('assistant'))) {
      await loginRoleSelect.selectOption({ label: options.find(o => o.includes('조교')) || 'assistant' });
    }
  }

  await shot(page, 'login-filled');

  // 로그인 버튼 클릭
  await page.locator('button[type="submit"], button:has-text("로그인")').first().click();
  await page.waitForTimeout(2000);
  console.log('  로그인 후 URL:', page.url());
  await shot(page, 'after-login');

  // ── 2. School Admin 대시보드 진입 ────────────────────────────────
  console.log('\n[2] School Admin 대시보드 진입...');
  await page.goto(`${BASE}/admin/school/1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  console.log('  대시보드 URL:', page.url());
  await shot(page, 'school-admin-dashboard');

  // ── 3. "전체 사용자" 탭 클릭 ──────────────────────────────────────
  console.log('\n[3] "전체 사용자" 탭 클릭...');
  const allUsersTab = page.locator('button:has-text("전체 사용자")').first();
  if (await allUsersTab.count() > 0) {
    await allUsersTab.click();
    await page.waitForTimeout(1000);
    await shot(page, 'all-users-tab');

    // 역할 드롭다운 확인
    const roleSelects = page.locator('select[aria-label="관리자 역할"]');
    const selectCount = await roleSelects.count();
    console.log(`  역할 드롭다운 개수: ${selectCount}`);

    if (selectCount > 0) {
      console.log('  ✅ 역할 드롭다운 표시됨');

      // 모든 드롭다운의 옵션 및 현재값 출력
      for (let i = 0; i < Math.min(selectCount, 5); i++) {
        const sel = roleSelects.nth(i);
        const opts = await sel.locator('option').allTextContents();
        const val = await sel.inputValue();
        console.log(`  [${i}] 현재값: "${val || '없음'}", 옵션: ${JSON.stringify(opts)}`);
      }

      // 드롭다운 클로즈업 스크린샷
      await roleSelects.first().scrollIntoViewIfNeeded();
      await shot(page, 'role-dropdown-visible');

      // ── 4. 역할 변경 테스트 (본인 행 제외, "없음"인 행 대상) ──────
      console.log('\n[4] 역할 변경 테스트 (본인 외 사용자)...');

      // "없음" 값인 드롭다운 찾기 (인덱스 1부터 시작 — 인덱스 0은 ta_cs2026 본인)
      let targetIdx = -1;
      for (let i = 1; i < selectCount; i++) {
        const val = await roleSelects.nth(i).inputValue();
        if (val === '') {
          targetIdx = i;
          break;
        }
      }

      if (targetIdx >= 0) {
        const targetSelect = roleSelects.nth(targetIdx);
        console.log(`  인덱스 ${targetIdx} 사용자에게 DEPT_ADMIN 부여 시도...`);
        await targetSelect.selectOption('DEPT_ADMIN');
        await page.waitForTimeout(2000);
        await shot(page, 'after-role-change');

        const afterVal = await targetSelect.inputValue();
        console.log(`  역할 변경 결과: "${afterVal}"`);
        if (afterVal === 'DEPT_ADMIN') {
          console.log('  ✅ 역할 변경 성공');
        } else {
          console.log('  ❌ 역할 변경 실패');
        }

        // 에러 메시지 없는지 확인
        const errMsg = page.locator('text=역할 변경에 실패했습니다');
        if (await errMsg.count() > 0) {
          console.log('  ❌ 에러 메시지 표시됨');
        } else {
          console.log('  ✅ 에러 메시지 없음 (정상)');
        }

        // 역할 되돌리기 (테스트 데이터 정리)
        await targetSelect.selectOption('');
        await page.waitForTimeout(1000);
        console.log('  역할 원복 완료');
      } else {
        console.log('  ⚠️ "없음" 값인 사용자(인덱스 1+)가 없어 변경 테스트 건너뜀');
      }
    } else {
      console.log('  ❌ 역할 드롭다운 미표시');
    }
  } else {
    console.log('  ❌ "전체 사용자" 탭 버튼 없음');
  }

  // ── 5. "관리자 계정" 탭 → memberType 뱃지 확인 ──────────────────
  console.log('\n[5] "관리자 계정" 탭 클릭...');
  const adminTab = page.locator('button:has-text("관리자 계정")').first();
  if (await adminTab.count() > 0) {
    await adminTab.click();
    await page.waitForTimeout(1000);
    await shot(page, 'admin-accounts-tab');

    // memberType 뱃지 확인 (파란색 border-blue-300)
    const memberTypeBadges = page.locator('.border-blue-300');
    const badgeCount = await memberTypeBadges.count();
    console.log(`  파란색 memberType 뱃지 개수: ${badgeCount}`);

    if (badgeCount > 0) {
      for (let i = 0; i < Math.min(badgeCount, 5); i++) {
        const text = await memberTypeBadges.nth(i).textContent();
        console.log(`  뱃지[${i}]: "${text?.trim()}"`);
      }
      console.log('  ✅ memberType 뱃지 표시됨');
    } else {
      console.log('  ❌ memberType 뱃지 미표시');
    }

    // "유형 / 역할" 헤더 확인
    const header = await page.locator('th:has-text("유형 / 역할")').count();
    console.log(`  "유형 / 역할" 헤더: ${header > 0 ? '✅ 있음' : '❌ 없음'}`);
  } else {
    console.log('  ❌ "관리자 계정" 탭 버튼 없음');
  }

  // ── 6. AdminBanner 확인 (ta_cs2026은 adminRole=SCHOOL_ADMIN이므로 표시돼야 함) ──
  console.log('\n[6] 메인 페이지에서 AdminBanner 표시 확인...');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await shot(page, 'main-page-with-banner');

  // AdminBanner 다양한 셀렉터로 찾기
  const bannerSelectors = [
    'text=관리자 대시보드',
    'text=관리자 페이지',
    'button:has-text("관리자")',
    '[class*="admin-banner"]',
    '[class*="AdminBanner"]',
    'a[href*="/admin"]',
  ];
  let bannerFound = false;
  for (const sel of bannerSelectors) {
    const el = page.locator(sel).first();
    if (await el.count() > 0) {
      const text = await el.textContent();
      console.log(`  AdminBanner 발견 (셀렉터: "${sel}"): "${text?.trim()}"`);
      bannerFound = true;
      break;
    }
  }
  if (!bannerFound) {
    console.log('  ⚠️ AdminBanner 자동 감지 실패 — 스크린샷 직접 확인 필요');
    // 페이지 전체 텍스트 일부 출력
    const bodyText = await page.locator('body').innerText();
    const preview = bodyText.slice(0, 500).replace(/\n+/g, ' ');
    console.log(`  페이지 텍스트 미리보기: "${preview}..."`);
  }

  console.log('\n✅ UI 테스트 완료. 스크린샷 위치:', SHOT_DIR);

} catch (err) {
  console.error('\n❌ 오류:', err.message);
  console.error(err.stack);
  await shot(page, 'error-state');
} finally {
  await browser.close();
}
