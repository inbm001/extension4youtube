const fs=require('node:fs');
const base='.logs/grounding-comparison';
const inputs=JSON.parse(fs.readFileSync(`${base}/inputs.json`,'utf8'));
const rows=JSON.parse(fs.readFileSync(`${base}/response.json`,'utf8'));
if(rows.length!==inputs.length)throw Error('Response row count differs from source count');
const ids=new Set();
const checked=rows.map(row=>{
  const source=inputs.find(s=>s.id===row.id);
  if(!source||ids.has(row.id))throw Error('Unexpected or duplicate video ID');
  ids.add(row.id);
  if(row.basis!=='provided_description'||!Array.isArray(row.tags)||row.tags.length>5||!row.tags.every(t=>typeof t==='string'&&t.trim()))throw Error('Invalid tag shape');
  if(!Array.isArray(row.evidence)||!row.aliases||typeof row.aliases!=='object')throw Error('Missing evidence or aliases');
  for(const tag of row.tags){
    const quotes=row.evidence.filter(e=>e.tag===tag);
    if(!quotes.length||quotes.some(e=>typeof e.quote!=='string'||!e.quote.trim()||!`${source.title}\n${source.description}`.includes(e.quote)))throw Error(`Quote not found for ${row.id}: ${tag}`);
  }
  if(!Object.values(row.aliases).every(a=>Array.isArray(a)&&a.every(x=>typeof x==='string')))throw Error('Invalid aliases');
  return {...row,verification:'Each tag quote matched supplied live page text; semantic review still separate'};
});
fs.writeFileSync(`${base}/verified.json`,JSON.stringify(checked,null,2));
console.log(JSON.stringify(checked.map(r=>({id:r.id,tags:r.tags,verifiedQuotes:r.evidence.length})),null,2));
