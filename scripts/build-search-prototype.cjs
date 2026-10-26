const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'.logs/tag-batch-120/merged.json'),'utf8'));
const correctionFile=path.join(root,'.logs/tag-batch-120/pstack-grounded.json');
if(fs.existsSync(correctionFile)){
  const correction=JSON.parse(fs.readFileSync(correctionFile,'utf8'));
  const index=data.findIndex(v=>v.id===correction.id);
  if(index>=0)data[index]={...data[index],...correction};
}
const comparisonFile=path.join(root,'.logs/grounding-comparison/verified.json');
if(fs.existsSync(comparisonFile)){
  for(const correction of JSON.parse(fs.readFileSync(comparisonFile,'utf8'))){
    const index=data.findIndex(v=>v.id===correction.id);
    if(index>=0)data[index]={...data[index],...correction};
  }
}
const core=fs.readFileSync(path.join(root,'search-core.js'),'utf8');
const tagCore=fs.readFileSync(path.join(root,'prototypes/tag-draft-core.js'),'utf8');
const tagEditor=fs.readFileSync(path.join(root,'prototypes/tag-editor.js'),'utf8');
const client=fs.readFileSync(path.join(root,'search-ui.js'),'utf8');
const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>YouTube 북마크 검색 실험</title><style>
*{box-sizing:border-box}body{margin:0;background:#141414;color:#eee;font:14px/1.6 system-ui}main{max-width:1100px;margin:28px auto;padding:0 22px}header{display:flex;align-items:center;justify-content:space-between;gap:12px}h1{font-size:22px;margin:0}a{color:inherit}p{color:#aaa;margin:9px 0 18px;font-size:12px}input{width:100%;background:#222;color:#fff;border:1px solid #666;border-radius:9px;font:inherit;font-size:18px;padding:14px}button{font:inherit;cursor:pointer;border:1px solid #494949;background:#262626;color:#ddd;border-radius:6px;padding:6px 12px}button[aria-pressed=true]{background:#d7e9f9;color:#172c3d;border-color:#d7e9f9}button:focus-visible,input:focus-visible{outline:2px solid #a8cfff;outline-offset:2px}.line{display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin:12px 0}.label{font-size:12px;color:#999;min-width:56px}.panel{border-bottom:1px solid #333;padding:4px 0 10px}#children{max-height:112px;overflow-y:auto}#children button{font-size:12px;padding:4px 9px}#suggest:empty{display:none}#suggest{padding:9px;background:#1b2530;border-radius:6px}#count{font-size:13px;color:#b3cbe0;margin:18px 0}article{padding:16px 0;border-bottom:1px solid #333}article a{text-decoration:none;font-size:16px}article a:hover{text-decoration:underline}.chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.chips button{font-size:12px;border:0;border-radius:15px;padding:3px 10px;background:#293747}.note{color:#888;font-size:11px;margin-top:7px}details{color:#bba16c;font-size:12px;margin-top:7px}#selected{font-size:12px}.meta{font-size:12px;color:#888}#empty{color:#aaa;padding:30px 0}.reset{background:none;border:0;text-decoration:underline;color:#aaa;font-size:12px}@media(max-width:600px){main{padding:0 14px}h1{font-size:18px}button{padding:5px 9px}.label{width:100%}}
</style></head><body><main><header><h1>YouTube 북마크 검색 실험</h1><a class="meta" href="http://127.0.0.1:8770/" target="_blank" rel="noopener">할 일 표 ↗</a></header><p>120개 표본 · Gemini 제목 기반 태그 119개 · 대분류·한영 별칭은 로컬 검증용 사전입니다. Jev 자동 분류는 아직 적용하지 않았습니다.</p><input id="q" aria-label="검색어" placeholder="예: 17 bass, ableton, 하네스" autofocus><div class="line" id="suggest"></div><div class="panel"><div class="line" id="categories"></div><div class="line" id="children"></div><div class="line" id="selected"></div></div><div class="line"><span class="label">검색 범위</span><button data-mode="tags" aria-pressed="false">태그만</button><button data-mode="both" aria-pressed="true">태그 + 제목</button><button id="reset" class="reset">조건 초기화</button></div><div id="count"></div><div id="list"></div></main><script>${core}</script><script>const videos=${JSON.stringify(data).replace(/</g,'\\u003c')};</script><script>${client}</script></body></html>`;
fs.mkdirSync(path.join(root,'.logs/search-trial'),{recursive:true});
fs.writeFileSync(path.join(root,'.logs/search-trial/videos.json'),JSON.stringify(data,null,2));
fs.writeFileSync(path.join(root,'.logs/search-trial/index.html'),html.replace('<script>'+client,`<script>${tagCore}</script><script>${tagEditor}</script><script>`+client).replace('</style>', '.tag-editor{max-width:650px;width:92%;background:#202020;color:#ddd;border:1px solid #666;border-radius:8px}.tag-editor::backdrop{background:#0009}.tag-editor p{overflow-wrap:anywhere}.tag-editor .removed{opacity:.5;text-decoration:line-through}.tag-editor form input{flex:1;min-width:120px;font-size:14px;width:auto}.edit-tags{margin-top:8px;font-size:12px;padding:3px 9px}</style>').replace('Gemini 제목 기반 태그 119개',`Gemini 제목 근거 ${data.filter(v=>v.basis==='title_only').length}개 · 설명 근거 ${data.filter(v=>v.basis==='provided_description').length}개 · 접근 불가 ${data.filter(v=>v.basis==='unavailable').length}개`));
console.log('Updated search prototype with '+data.length+' videos');
