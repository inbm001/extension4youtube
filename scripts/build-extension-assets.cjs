const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'.logs','extension-assets');
const source=fs.readFileSync(path.join(root,'.logs','search-trial','index.html'),'utf8');
fs.mkdirSync(output,{recursive:true});
let scripts=0;
let html=source.replace(/<script>([\s\S]*?)<\/script>/g,(_,code)=>{
  const filename=`script-${scripts++}.js`;
  new vm.Script(code,{filename});
  fs.writeFileSync(path.join(output,filename),code);
  return `<script src="${filename}"></script>`;
});
if(!scripts||/<script(?![^>]*\bsrc=)[^>]*>/i.test(html))throw Error('Inline script conversion failed.');
html=html.replace(/<a class="meta" href="http:\/\/127\.0\.0\.1:8770\/"[^>]*>[\s\S]*?<\/a>/,'');
html=html.replace('<meta charset="utf-8">','<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="script-src \'self\'; object-src \'none\'">');
fs.writeFileSync(path.join(output,'index.html'),html);
for(const [sourceName,target] of [['extension-overlay.js','overlay.js'],['extension-background.js','background.js'],['extension-viewer.js','viewer.js']]){
  const code=fs.readFileSync(path.join(root,'prototypes',sourceName),'utf8');
  new vm.Script(code,{filename:sourceName});fs.writeFileSync(path.join(output,target),code);
}
fs.writeFileSync(path.join(output,'index.html'),html.replace('</body>','<script src="viewer.js"></script></body>'));
const manifest={manifest_version:3,name:'YouTube Bookmark Local Prototype',version:'0.0.1',permissions:['activeTab','scripting'],action:{default_title:'북마크 조회 시안'},background:{service_worker:'background.js'},content_security_policy:{extension_pages:"script-src 'self'; object-src 'none'"},web_accessible_resources:[{resources:['index.html'],matches:['https://www.youtube.com/*','https://youtube.com/*']}]};
fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
fs.copyFileSync(path.join(root,'prototypes','overlay-fixture.html'),path.join(output,'fixture.html'));
fs.copyFileSync(path.join(root,'prototypes','overlay-fixture.js'),path.join(output,'fixture.js'));
fs.writeFileSync(path.join(output,'build-report.json'),JSON.stringify({scripts,scope:'Local private extension package draft. Not installed; no permissions granted. Overlay not verified in actual extension. Contains private sample data; do not publish.'},null,2)+'\n');
console.log(`Prepared ${scripts} external script files in .logs/extension-assets. No extension installed.`);

