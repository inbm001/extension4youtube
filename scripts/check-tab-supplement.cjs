const assert=require('node:assert/strict');
const fs=require('node:fs');
const core=require('../search-core');
const reviews=require('../tab-page-review.json').reviews;
const definitions=[
  {id:'lCFUxsq3a7k',tags:['TAB','fingerstyle'],required:['fingerstyle','creator-provides-tab-links']},
  {id:'5HWM1Gad4O8',tags:['TAB','jazz'],required:['creator-labels-tab-and-jazz']}
];
const videos=definitions.map(definition=>{
  const review=reviews.find(row=>row.id===definition.id);
  assert(review,'page review required');
  for(const support of definition.required)assert(review.evidence.some(e=>e.supports===support));
  return {id:review.id,title:review.title,url:review.url,tags:definition.tags,aliases:{},basis:'agent-selected-literal-page-evidence',notVerified:review.notVerified};
});
const find=query=>videos.filter(video=>core.inCategory(video,'tab')&&core.matches(video,query,'tags')).map(video=>video.id);
assert.deepEqual(find('재즈'),['5HWM1Gad4O8']);
assert.deepEqual(find('jazz'),find('재즈'));
assert.deepEqual(find('핑거스타일'),['lCFUxsq3a7k']);
assert.deepEqual(find('fingerstyle'),find('핑거스타일'));
assert.deepEqual(find('재즈 핑거스타일'),[]);
assert.deepEqual(find('컨트리'),[]);
for(const video of videos)assert(!core.inCategory(video,'code'),'production credits are not topic tags');
const main=JSON.parse(fs.readFileSync('.logs/search-trial/videos.json','utf8'));
assert.equal(main.length,120);
assert(videos.every(video=>!main.some(row=>row.id===video.id)),'supplement remains separate');
fs.writeFileSync('.logs/tab-filter-trial.json',JSON.stringify({scope:'Two separately reviewed pages, manually selected literal tags. Not Gemini extraction or measured accuracy. Actual video notation unverified.',videos,results:{jazz:find('재즈'),fingerstyle:find('핑거스타일'),combined:find('재즈 핑거스타일')}},null,2)+'\n');
console.log('Passed separate two-page TAB supplement: bilingual filters, empty intersection and original dataset unchanged.');
