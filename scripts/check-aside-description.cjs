const assert=require('node:assert/strict');
const fs=require('node:fs');
const core=require('../search-core');
const path='.logs/search-trial/videos.json';
const original=fs.readFileSync(path,'utf8');
const videos=JSON.parse(original);
const review=JSON.parse(fs.readFileSync('.logs/aside-description-review.json','utf8'));
const before=videos.find(v=>v.id===review.id);
assert(before,'existing sample required');
assert(review.evidence.some(e=>e.supports.includes('MCP')),'MCP page evidence required');
const after={...before,tags:review.candidateTags,aliases:{}};
const cases=[
  {query:'Aside',before:true,after:true},
  {query:'MCP',before:false,after:true},
  {query:'업무 자동화',before:false,after:true},
  {query:'맛집',before:false,after:false},
  {query:'쿠팡',before:false,after:false}
];
for(const row of cases){
  assert.equal(core.matches(before,row.query,'tags'),row.before,`before ${row.query}`);
  assert.equal(core.matches(after,row.query,'tags'),row.after,`after ${row.query}`);
}
assert(!core.inCategory(before,'ai'));
assert(core.inCategory(after,'ai'));
assert(!core.inCategory(after,'food'),'task targets must not become food topics');
assert(!core.inCategory(after,'cooking'));
assert.equal(fs.readFileSync(path,'utf8'),original,'main dataset unchanged');
fs.writeFileSync('.logs/aside-retrieval-comparison.json',JSON.stringify({scope:'One manually reviewed candidate compared in memory with existing title-based tags. Not Gemini extraction, automatic pipeline validation, or overall accuracy.',id:review.id,beforeTags:before.tags,candidateTags:after.tags,cases,category:{before:[],candidate:['ai']},mainDatasetChanged:false},null,2)+'\n');
console.log('Passed Aside description candidate retrieval and example-topic exclusion; main dataset unchanged.');
