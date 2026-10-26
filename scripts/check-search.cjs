const assert = require('node:assert/strict');
const fs = require('node:fs');
const search = require('../search-core.js');
const videos = JSON.parse(fs.readFileSync('.logs/tag-batch-120/merged.json','utf8'));
const target = videos.find(v=>v.id==='0gKJ3pgIqI0');
for(const query of ['베이스','bass','17 베이스','17 bass']) assert(search.matches({...target,tags:[],aliases:{}},query,'both'),query);
assert(!search.matches({...target,tags:[],aliases:{}},'17 bass','tags'));
assert(search.matches({...target,aliases:{}},'sound design','tags'));
assert(search.matches({...target,aliases:{}},'17 bass sound design','both'));
const korean=videos.filter(v=>search.matches(v,'베이스','tags')).map(v=>v.id);
const english=videos.filter(v=>search.matches(v,'bass','tags')).map(v=>v.id);
assert.deepEqual(korean,english);
assert(!search.matches(target,'없는검색어xyz','both'));
assert(search.inCategory(target,'sound'));
assert(!search.inCategory(target,'food'));
const correctionFile='.logs/tag-batch-120/pstack-grounded.json';
if(fs.existsSync(correctionFile)){
  const correction=JSON.parse(fs.readFileSync(correctionFile,'utf8'));
  const description=fs.readFileSync('.logs/tag-batch-120/pstack-description.txt','utf8');
  assert(correction.evidence.every(e=>description.includes(e.quote)));
  assert(!correction.tags.includes('스택 트레이스'));
  assert(!correction.tags.includes('디버깅'));
  assert(search.matches({...videos.find(v=>v.id===correction.id),...correction},'harness','tags'));
}
const comparisonFile='.logs/grounding-comparison/verified.json';
if(fs.existsSync(comparisonFile)){
  const corrections=JSON.parse(fs.readFileSync(comparisonFile,'utf8'));
  const improved={...target,...corrections.find(v=>v.id===target.id)};
  assert(search.matches(improved,'ableton 사운드디자인','tags'));
  assert(search.matches(improved,'Serum2','tags'));
}
console.log(JSON.stringify({checks:'passed',videos:videos.length,bassMatches:korean.length,titleWithoutTags:['17 베이스','17 bass'],categoryCounts:search.categories.map(c=>({name:c.name,count:videos.filter(v=>search.inCategory(v,c.id)).length}))},null,2));
