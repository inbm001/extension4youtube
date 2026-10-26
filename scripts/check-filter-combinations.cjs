const assert=require('node:assert/strict');
const fs=require('node:fs');
const core=require('../search-core');
const fixtures=[
  {id:'jazz-finger-tab',title:'Synthetic A',tags:['TAB','jazz','fingerstyle']},
  {id:'country-tab',title:'Synthetic B',tags:['타브악보','컨트리']},
  {id:'jazz-performance',title:'Synthetic C',tags:['재즈','핑거스타일']},
  {id:'title-only',title:'Jazz fingerstyle TAB',tags:[]},
  {id:'neo-soul-tab',title:'Synthetic D',tags:['tabs','neo soul']}
];
const cases=[
  {category:'tab',query:'재즈 핑거스타일',expected:['jazz-finger-tab']},
  {category:'tab',query:'jazz fingerstyle',expected:['jazz-finger-tab']},
  {category:'tab',query:'fingerstyle jazz',expected:['jazz-finger-tab']},
  {category:'tab',query:'country',expected:['country-tab']},
  {category:'tab',query:'네오소울',expected:['neo-soul-tab']},
  {category:'tab',query:'재즈 컨트리',expected:[]}
];
for(const row of cases){
  row.actual=fixtures.filter(v=>core.inCategory(v,row.category)&&core.matches(v,row.query,'tags')).map(v=>v.id);
  assert.deepEqual(row.actual,row.expected,row.query);
}
assert(core.matches(fixtures[3],'jazz fingerstyle','both'),'title remains searchable');
assert(!core.inCategory(fixtures[3],'tab'),'title alone is not classification evidence');
assert(!core.inCategory(fixtures[2],'tab'),'genre and technique do not imply TAB');
const report={scope:'Synthetic query composition checks only. Not Jev decisions or actual video accuracy.',cases};
fs.writeFileSync('.logs/filter-combination-check.json',JSON.stringify(report,null,2)+'\n');
console.log('Passed six synthetic filter combinations, title fallback and TAB evidence boundaries.');
