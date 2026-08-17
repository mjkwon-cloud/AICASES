/**
 * 인트로 슬라이드 2장 → 1600x900 PNG
 *   node render.js
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = __dirname;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = process.argv[2] || ROOT;
const W = 1600, H = 900;

const JOBS = [
  ['slide1.html', '01_expected_impact.png'],
];

const pngSize = b => (b.length > 24 && b.readUInt32BE(0) === 0x89504e47)
  ? { w: b.readUInt32BE(16), h: b.readUInt32BE(20) } : null;

fs.mkdirSync(OUT, { recursive: true });

let allPass = true;
for (const [src, out] of JOBS) {
  const url = 'file:///' + path.join(ROOT, src).replace(/\\/g, '/');
  const dst = path.join(OUT, out);
  process.stdout.write(`[render] ${out} ... `);
  execFileSync(CHROME, [
    '--headless', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=2',
    '--virtual-time-budget=4000', `--window-size=${W},${H}`,
    `--screenshot=${dst}`, url,
  ], { stdio: 'ignore' });
  const s = pngSize(fs.readFileSync(dst));
  const pass = s && s.w === W * 2 && s.h === H * 2;   // 2x 레티나
  if (!pass) allPass = false;
  console.log(`${s ? s.w + '×' + s.h : '실패'} ${pass ? 'OK' : '✗ 규격 불일치'}`);
}
console.log(allPass ? '전체 OK' : '규격 확인 필요');
