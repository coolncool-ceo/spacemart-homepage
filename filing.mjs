import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';

const OUT = 'U:/.claude/projects/spacemart_homepage/filing';

// 날짜 포맷: 20261027
const today = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  timeZone: 'Asia/Seoul'
}).replace(/\. /g, '').replace('.', '');

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--lang=ko-KR'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
await page.setExtraHTTPHeaders({ 'Accept-Language': 'ko-KR,ko;q=0.9' });

// ── 1. 메인 페이지 (팝업 포함) 스크린샷 ──
console.log('① 메인 팝업 스크린샷...');
await page.goto('https://spacemart.co.kr', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({
  path: `${OUT}/01_공고게시_메인팝업_${today}.png`,
  fullPage: false,
});
console.log('  → 01_공고게시_메인팝업 저장');

// ── 2. 1차 공고 상세 스크린샷 ──
console.log('② 1차 공고 상세 스크린샷...');
await page.goto('https://spacemart.co.kr/notice-1.html', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({
  path: `${OUT}/02_1차공고_전체화면_${today}.png`,
  fullPage: true,
});
console.log('  → 02_1차공고_전체화면 저장');

// ── 3. 1차 공고 PDF (A4) ──
console.log('③ 1차 공고 PDF 생성...');
await page.emulateMediaType('print');
await page.pdf({
  path: `${OUT}/03_1차공고_법원제출용_${today}.pdf`,
  format: 'A4',
  printBackground: true,
  margin: { top: '20mm', bottom: '20mm', left: '18mm', right: '18mm' },
  displayHeaderFooter: true,
  headerTemplate: `
    <div style="font-size:9px; color:#666; width:100%; padding:0 18mm; box-sizing:border-box; display:flex; justify-content:space-between;">
      <span>주식회사 우주상회 해산 및 채권신고 공고 (1차)</span>
      <span>https://spacemart.co.kr/notice-1.html</span>
    </div>`,
  footerTemplate: `
    <div style="font-size:9px; color:#666; width:100%; padding:0 18mm; box-sizing:border-box; display:flex; justify-content:space-between;">
      <span>출력일: ${new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}</span>
      <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>`,
});
console.log('  → 03_1차공고_법원제출용 PDF 저장');

await browser.close();
console.log('\n✓ 파일링 완료 →', OUT);
