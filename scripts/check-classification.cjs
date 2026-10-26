const assert=require('node:assert/strict');
const fs=require('node:fs');
const core=require('../search-core');
const cases=[
  {tag:'Tailwind CSS',category:'ai',expected:false},
  {tag:'Tailwind CSS',category:'code',expected:true},
  {tag:'cocktail',category:'ai',expected:false},
  {tag:'table layout',category:'tab',expected:false},
  {tag:'AI 활용',category:'ai',expected:true},
  {tag:'guitar tablature',category:'tab',expected:true},
  {tag:'Claude Code',category:'ai',expected:true},
  {tag:'Figma',category:'design',expected:true},
  {tag:'소스 코드',category:'cooking',expected:false},
  {tag:'오픈소스',category:'cooking',expected:false},
  {tag:'소스',category:'cooking',expected:false},
  {tag:'소스 만들기',category:'cooking',expected:true},
  {tag:'토마토 소스',category:'cooking',expected:true},
  {tag:'cream sauce',category:'cooking',expected:true},
  {tag:'RAG',category:'ai',expected:true},
  {tag:'딥러닝',category:'ai',expected:true},
  {tag:'인공지능 분석',category:'ai',expected:true},
  {tag:'GPT-6 Astra',category:'ai',expected:true},
  {tag:'fragment shader',category:'ai',expected:false},
  {tag:'FL Studio',category:'composition',expected:true},
  {tag:'피아노 편곡',category:'composition',expected:true},
  {tag:'피아노 편곡',category:'theory',expected:false},
  {tag:'채보',category:'tab',expected:false},
  {tag:'transcription',category:'tab',expected:false},
  {tag:'타브악보',category:'tab',expected:true},
  {tag:'bass tabs',category:'tab',expected:true},
  {tag:'피아노 스킬',category:'ai',expected:false},
  {tag:'guitar skills',category:'ai',expected:false},
  {tag:'스킬',category:'ai',expected:false},
  {tag:'에이전트 스킬',category:'ai',expected:true},
  {tag:'agent skills',category:'ai',expected:true},
  {tag:'SKILL.md',category:'ai',expected:true}
];
for(const row of cases)assert.equal(core.inCategory({tags:[row.tag]},row.category),row.expected,JSON.stringify(row));
assert.equal(core.matches({title:'',tags:['Tailwind CSS']},'ai','tags'),true,'free-text partial search is unchanged');
assert.equal(core.inCategory({tags:['소스 코드','카레']},'cooking'),true,'independent food evidence remains valid');
assert.equal(core.inCategory({tags:['source code'],aliases:{'source code':['소스 코드']}},'cooking'),false);
assert.equal(core.matches({title:'',tags:['소스 코드']},'소스','tags'),true);
const draft=JSON.parse(fs.readFileSync('classification-draft.json','utf8'));
assert.deepEqual(draft.prototypeCategories,core.categories,'draft and prototype categories agree');
assert.deepEqual(draft.aliasGroups,core.groups,'draft aliases agree with prototype');
console.log('Passed classification boundary cases and draft consistency.');
