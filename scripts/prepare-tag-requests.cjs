const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const materials=JSON.parse(read('prompts/video-materials.json'));
if(!Array.isArray(materials.records)||!materials.records.length)throw Error('Video materials required');
const input=JSON.stringify(materials,null,2);
const variants=[['v1','prompts/gemini-core-tags-v1.txt','시험 대상 4개:'],['v2','prompts/gemini-core-tags-v2.txt','분석할 자료:']];
const out=path.join(root,'.logs/tag-requests');
fs.mkdirSync(out,{recursive:true});
const files=[];
for(const [variant,source,marker] of variants){
  const text=read(source);
  const index=text.indexOf(marker);
  if(index<0)throw Error(`Missing input boundary in ${source}`);
  const request=text.slice(0,index).trim()+'\n\n제공한 자료만 사용하고 외부 페이지를 탐색하지 마세요.\n\n분석할 자료:\n'+input+'\n';
  const filename=`${variant}.txt`;
  fs.writeFileSync(path.join(out,filename),request);
  files.push({variant,source,file:filename,sha256:crypto.createHash('sha256').update(request).digest('hex')});
}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({status:'prepared-not-run',modelRuns:0,inputSha256:crypto.createHash('sha256').update(input).digest('hex'),records:materials.records.map(r=>r.id),files},null,2)+'\n');
console.log('Prepared two local requests with identical materials. No model calls.');
