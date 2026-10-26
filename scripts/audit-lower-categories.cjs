const fs=require('node:fs');
const core=require('../search-core');
const draft=require('../lower-categories-draft.json');
const videos=JSON.parse(fs.readFileSync('.logs/search-trial/videos.json','utf8'));
const rows=draft.groups.map(group=>({
  parent:group.parent,
  videos:videos.filter(v=>core.inCategory(v,group.parent)).map(video=>({
    id:video.id,title:video.title,basis:video.basis,
    candidates:group.dimensions.flatMap(dimension=>dimension.options.flatMap(option=>{
      const labels=[option.name,...option.aliases].map(core.normalize);
      const tags=video.tags.filter(tag=>[tag,...(video.aliases?.[tag]||[])].some(value=>labels.includes(core.normalize(value))));
      return tags.length?[{dimension:dimension.id,option:option.id,tags}]:[];
    }))
  }))
}));
const report={scope:'Exact existing tag or alias matches only. Proposed candidates, not semantic classification. Parent categories are prototype rules.',rows};
fs.writeFileSync('.logs/lower-category-audit.json',JSON.stringify(report,null,2)+'\n');
for(const group of rows)console.log(JSON.stringify({parent:group.parent,videos:group.videos.length,withLiteralCandidate:group.videos.filter(v=>v.candidates.length).length}));
