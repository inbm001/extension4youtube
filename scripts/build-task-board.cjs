const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'tasks.css'),'utf8');
const script=fs.readFileSync(path.join(root,'task-numbers.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'tasks-ui.js'),'utf8');
const html=`<!doctype html><html lang="ko"><head><title>YouTube 할 일</title><meta name="viewport" content="width=device-width, initial-scale=1"><meta charset="utf-8"><meta name="color-scheme" content="light only"><style>${css}</style></head><body><h1>YouTube 할 일</h1><span class="sum" id="summary"></span><div class="hint next-summary" id="next"></div><div class="bar" id="filters"></div><div class="tools"><input id="search" aria-label="업무 검색" placeholder="번호 · 업무 검색"><button id="refresh">새로고침</button><span id="error" role="status"></span></div><div class="wrap"><table><colgroup><col class="c-iss"><col class="c-st"><col class="c-who"><col class="c-pr"><col class="c-pre"><col class="c-prob"><col class="c-desc"><col class="c-doc"></colgroup><thead><tr><th class="iss">Aa 이슈</th><th>◌ 상태</th><th>◉ 담당</th><th>◎ 우선순위</th><th>⊖ 선행 작업</th><th>! 결정 필요</th><th>≡ 결론 · 설명</th><th>▤ 문서</th></tr></thead></table></div><script>${script}</script></body></html>`;
fs.writeFileSync(path.join(root,'tasks.html'),html);
if(fs.existsSync(path.join(root,'.logs/tag-batch-120/merged.json')))require('./build-review-pages.cjs');
console.log('Built reference-style inline task table.');
