const assert=require('node:assert/strict');
const fs=require('node:fs');
const core=require('../search-core');
const videos=JSON.parse(fs.readFileSync('.logs/search-trial/videos.json','utf8'));
const pairs=[['편곡','arrangement'],['딥러닝','deep learning'],['머신러닝','machine learning'],['타입스크립트','TypeScript'],['리액트','React'],['자바스크립트','JavaScript'],['도커','Docker']];
const results=pairs.map(([korean,english])=>{
  const find=query=>videos.filter(v=>core.matches(v,query,'tags')).map(v=>v.id);
  const ko=find(korean),en=find(english);
  assert.deepEqual(en,ko,`${korean} and ${english}`);
  assert(ko.length>0,`actual sample exists for ${korean}`);
  assert(core.matches({title:'',tags:[korean]},english,'tags'));
  assert(core.matches({title:'',tags:[english]},korean,'tags'));
  return {korean,english,ids:ko};
});
assert(!core.matches({title:'',tags:['편곡']},'작곡','tags'),'related concepts are not aliases');
assert(!core.matches({title:'',tags:['machine learning']},'deep learning','tags'),'subfields are not synonyms');
fs.writeFileSync('.logs/alias-coverage-check.json',JSON.stringify(results,null,2)+'\n');
assert(!core.matches({title:'',tags:['JavaScript']},'TypeScript','tags'));
const dictionaryResults=[];
const syntheticControls=[];
for(const group of core.groups){
  for(const stored of group){
    const tagged={title:'',tags:[stored]};
    const titled={title:stored,tags:[]};
    for(const query of group){
      assert(core.matches(tagged,query,'tags'),`${query} must retrieve stored tag ${stored}`);
      assert(core.matches(titled,query,'both'),`${query} must retrieve title ${stored}`);
      assert(!core.matches(titled,query,'tags'),'tag-only mode must not read title');
      assert(!core.matches({title:'',tags:['zzqv-unrelated-control']},query,'both'),'unrelated control must not match');
      syntheticControls.push({stored,query,tagMatch:true,titleMatch:true});
    }
  }
  for(const mode of ['tags','both']){
    const queries=group.map(query=>({query,ids:videos.filter(v=>core.matches(v,query,mode)).map(v=>v.id).sort()}));
    for(const row of queries)assert.deepEqual(row.ids,queries[0].ids,`${mode}: ${row.query} versus ${queries[0].query}`);
    dictionaryResults.push({aliases:group,mode,matched:queries[0].ids.length,queries});
  }
}
fs.writeFileSync('.logs/alias-dictionary-matrix.json',JSON.stringify({scope:'Alias-equivalent retrieval on the existing 120 samples. Empty result groups are not evidence of coverage or translation quality.',groups:core.groups.length,results:dictionaryResults},null,2)+'\n');
fs.writeFileSync('.logs/alias-positive-controls.json',JSON.stringify({scope:'Synthetic controls only. Every alias is tested as stored text and query, with title exclusion and unrelated negative controls. Not actual video coverage or semantic translation validation.',groups:core.groups.length,cases:syntheticControls},null,2)+'\n');
console.log(`Passed ${pairs.length} bilingual pairs on actual samples and both directions without stored aliases.`);
console.log(`Passed ${core.groups.length} dictionary groups in tag-only and title-inclusive retrieval.`);
