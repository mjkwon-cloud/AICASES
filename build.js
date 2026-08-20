#!/usr/bin/env node
/**
 * build.js — build.py 의 Node 포트 (이 PC 에 python 이 없어서 추가)
 *
 * viewer.template.html 의 //__COURSES__ 마커를 courses/**\/*.json 에서 만든
 * `const COURSES = {...}` 로 치환해 index.html 을 생성한다.
 *
 *   node build.js            # index.html 생성
 *   node build.js --dry-run  # 생성 없이 검증만
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const COURSES_DIR = path.join(ROOT, 'courses');
const TEMPLATE = path.join(ROOT, 'viewer.template.html');
const OUTPUT = path.join(ROOT, 'index.html');
const MARKER = '        //__COURSES__';
const REQUIRED_META = ['tabLabel', 'badgeClass', 'badgeText', 'title'];

const die = msg => { console.error(msg); process.exit(1); };
const readJson = f => JSON.parse(fs.readFileSync(f, 'utf8'));

function loadOrder(){
  const f = path.join(COURSES_DIR, '_order.json');
  if (fs.existsSync(f)) return readJson(f);
  return fs.readdirSync(COURSES_DIR, {withFileTypes:true})
    .filter(d => d.isDirectory()).map(d => d.name).sort();
}

function loadCourse(key){
  const dir = path.join(COURSES_DIR, key);
  const metaFile = path.join(dir, '_meta.json');
  if (!fs.existsSync(metaFile)) die(`[error] ${metaFile} 없음`);

  const meta = readJson(metaFile);
  const missing = REQUIRED_META.filter(k => !(k in meta));
  if (missing.length) die(`[error] ${metaFile}: 필수 키 누락 ${missing}`);

  const steps = fs.readdirSync(dir)
    .filter(n => /^step.*\.json$/.test(n)).sort();
  const sessions = steps.map(n => {
    const data = readJson(path.join(dir, n));
    for (const k of ['step', 'title'])
      if (!(k in data)) die(`[error] ${n}: '${k}' 키 필요`);
    if (data.hours === undefined) data.hours = '';
    if (data.slides === undefined) data.slides = [];
    return data;
  });
  if (!sessions.length) die(`[error] ${dir}: step*.json 파일이 없음`);

  meta.sessions = sessions.sort((a,b) => a.step - b.step);
  return meta;
}

const dryRun = process.argv.includes('--dry-run');

console.log('courses/ 읽는 중...');
const courses = {};
for (const key of loadOrder()) courses[key] = loadCourse(key);
for (const [key, c] of Object.entries(courses)){
  const n = c.sessions.reduce((a,s) => a + s.slides.length, 0);
  console.log(`  ${key}: ${c.sessions.length}회차 / 슬라이드 ${n}장`);
}

const payload = '        const COURSES = '
  + JSON.stringify(courses, null, 2).split('\n').join('\n        ') + ';';

if (dryRun){
  console.log('\n--- dry-run: 검증 통과 ---');
  console.log(payload.slice(0, 800) + (payload.length > 800 ? '\n...' : ''));
  process.exit(0);
}

if (!fs.existsSync(TEMPLATE)) die(`[error] 템플릿 없음: ${TEMPLATE}`);
const lines = fs.readFileSync(TEMPLATE, 'utf8').split('\n');
const hits = lines.reduce((a,l,i) => (l === MARKER ? a.concat(i) : a), []);
if (hits.length !== 1)
  die(`[error] 마커 '${MARKER}' 가 정확히 1개여야 하는데 ${hits.length}개 발견`);

const i = hits[0];
const out = [...lines.slice(0,i), ...payload.split('\n'), ...lines.slice(i+1)].join('\n');
fs.writeFileSync(OUTPUT, out);
console.log(`완료 → ${OUTPUT} (${out.length.toLocaleString()} bytes)`);
