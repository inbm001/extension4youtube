const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'.logs','extension-assets');
const rows=[
  {id:'fixture-watching',title:'시험용 베이스 강의 A',tags:['베이스'],status:'watching'},
  {id:'fixture-completed',title:'시험용 베이스 강의 B',tags:['베이스'],status:'completed'},
  {id:'fixture-unknown',title:'시험용 베이스 강의 C',tags:['베이스']}
].map(v=>({...v,url:'#fixture',aliases:{},basis:'synthetic_fixture'}));
let html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
const refs=[...html.matchAll(/src="(script-\d+\.js)"/g)].map(m=>m[1]);
const dataFile=refs.find(name=>fs.readFileSync(path.join(assets,name),'utf8').startsWith('const videos='));
if(!dataFile)throw Error('Sample data script not found.');
fs.writeFileSync(path.join(assets,'script-80.js'),'const videos='+JSON.stringify(rows)+';');
html=html.replace(`src="${dataFile}"`,'src="script-80.js"').replace('<title>YouTube 북마크 검색 실험</title>','<title>가상 시청 상태 시험</title>').replace('<h1>YouTube 북마크 검색 실험</h1>','<h1>가상 시청 상태 시험</h1>').replace(/<p>120개 표본[\s\S]*?<\/p>/,'<p>가상 영상 3개 · 시청 상태 UI 시험 전용 · 개인 북마크 및 실제 시청 기록과 무관합니다.</p>');
fs.writeFileSync(path.join(assets,'watch-fixture.html'),html);
console.log('Built isolated three-record watch fixture; original 120 records unchanged.');
