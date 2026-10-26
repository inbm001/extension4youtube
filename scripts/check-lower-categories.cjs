const assert=require('node:assert/strict');
const draft=require('../lower-categories-draft.json');
const {categories}=require('../search-core');
assert.equal(draft.status,'draft-not-approved');
assert.equal(draft.assignmentMode,'multiple-or-unclassified');
const ids=new Set();
for(const group of draft.groups){
  assert(categories.some(c=>c.id===group.parent));
  for(const dimension of group.dimensions){
    for(const option of dimension.options){
      const key=[group.parent,dimension.id,option.id].join('/');
      assert(!ids.has(key));ids.add(key);
      for(const field of ['id','name','include','exclude'])assert.equal(typeof option[field],'string');
      assert(option.include.trim()&&option.exclude.trim());
      assert(Array.isArray(option.aliases)&&option.aliases.every(a=>typeof a==='string'&&a.trim()));
    }
  }
}
console.log(`Validated ${ids.size} draft options. No model decisions or approval implied.`);
