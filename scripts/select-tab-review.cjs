const fs=require('node:fs');
const assert=require('node:assert/strict');
const {videoId}=require('../prototypes/bookmark-format.cjs');
const source=JSON.parse(fs.readFileSync('.logs/youtube-bookmarks-2026-10-23.json','utf8'));
const seen=new Set(),candidates=[];
for(const bookmark of source.bookmarks){
  const marker=bookmark.title.match(/\bTAB(?:S|LATURE)?\b|타브(?:악보)?/i);
  if(!marker)continue;
  let id;try{id=videoId(bookmark.url);}catch{continue;}
  if(seen.has(id))continue;seen.add(id);
  const dimensions=[['genre','jazz',/\bjazz\b|재즈/i],['genre','country',/\bcountry\b|컨트리/i],['genre','neo-soul',/\bneo[ -]?soul\b|네오\s?소울/i],['technique','fingerstyle',/\bfingerstyle\b|핑거\s?스타일/i]];
  candidates.push({id,title:bookmark.title,url:`https://www.youtube.com/watch?v=${id}`,formatQuote:marker[0],literalOptions:dimensions.flatMap(([dimension,option,pattern])=>{const match=bookmark.title.match(pattern);return match?[{dimension,option,quote:match[0]}]:[];}),basis:'bookmark_title_only',status:'needs-page-review'});
}
assert(candidates.length>0);
for(const row of candidates){
  assert(row.title.includes(row.formatQuote));
  for(const option of row.literalOptions)assert(row.title.includes(option.quote));
}
const report={scope:'Review candidates selected from existing bookmark snapshot. Not Gemini extraction or verified TAB content. Not merged into 120-sample dataset.',candidates};
fs.writeFileSync('.logs/tab-review-candidates.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({candidates:candidates.length,withLiteralOptions:candidates.filter(row=>row.literalOptions.length).length}));
