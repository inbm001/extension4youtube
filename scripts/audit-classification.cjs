const fs=require('node:fs');
const assert=require('node:assert/strict');
const core=require('../search-core');
const videos=JSON.parse(fs.readFileSync('.logs/search-trial/videos.json','utf8'));
const rows=videos.map(video=>({
  id:video.id,title:video.title,
  assignments:core.categories.flatMap(category=>{
    const evidence=video.tags.filter(tag=>core.inCategory({tags:[tag],aliases:video.aliases},category.id));
    assert.equal(evidence.length>0,core.inCategory(video,category.id));
    return evidence.length?[{category:category.id,tags:evidence}]:[];
  })
}));
const report={
  scope:'Prototype keyword routing only; not measured classification accuracy. No model calls.',
  total:rows.length,
  unclassified:rows.filter(row=>!row.assignments.length).length,
  multipleCategories:rows.filter(row=>row.assignments.length>1).length,
  categoryCounts:Object.fromEntries(core.categories.map(category=>[category.id,rows.filter(row=>row.assignments.some(a=>a.category===category.id)).length])),
  rows
};
assert.equal(new Set(rows.map(row=>row.id)).size,rows.length,'video IDs must be unique');
fs.writeFileSync('.logs/classification-audit.json',JSON.stringify(report,null,2)+'\n');
const clean=value=>String(value).replace(/[\t\r\n]+/g,' ');
fs.writeFileSync('.logs/classification-audit.tsv',['id\ttitle\tcategory\tmatched_tags',...rows.flatMap(row=>row.assignments.length?row.assignments.map(a=>[row.id,row.title,a.category,a.tags.join(' | ')].map(clean).join('\t')):[[row.id,row.title,'unclassified',''].map(clean).join('\t')])].join('\n')+'\n');
console.log(JSON.stringify({total:report.total,unclassified:report.unclassified,multipleCategories:report.multipleCategories,categoryCounts:report.categoryCounts},null,2));
