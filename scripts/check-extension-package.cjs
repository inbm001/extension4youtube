const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const base='.logs/extension-assets';
const manifest=JSON.parse(fs.readFileSync(path.join(base,'manifest.json'),'utf8'));
assert.equal(manifest.manifest_version,3);
assert.deepEqual(manifest.permissions,['activeTab','scripting']);
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
const referenced=[...html.matchAll(/src="([^"]+)"/g)].map(match=>match[1]);
for(const file of new Set([manifest.background.service_worker,'overlay.js',...referenced])){
  assert(!file.includes('..')&&!file.includes('://'));
  new vm.Script(fs.readFileSync(path.join(base,file),'utf8'),{filename:file});
}
assert(!html.includes('const videos='));
console.log('Passed MV3 manifest and all worker/viewer script references and syntax. No extension installation.');
