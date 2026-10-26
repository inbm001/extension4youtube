const format=require('./bookmark-format.cjs');
function planRegistration(raw,result,folderId,bookmarks){
  if(typeof folderId!=='string'||!folderId.trim())throw Error('대상 폴더가 필요합니다.');
  if(!Array.isArray(bookmarks))throw Error('북마크 목록이 필요합니다.');
  if(result?.outcome!=='success')return {kind:'noop',reason:'no-generated-tags'};
  if(!Array.isArray(result.tags)||!result.tags.every(tag=>typeof tag==='string'&&tag.trim()))throw Error('생성 태그가 유효하지 않습니다.');
  if(!result.tags.length)return {kind:'noop',reason:'no-generated-tags'};
  const ids=new Set();
  for(const item of bookmarks){
    if(!item||typeof item!=='object'||typeof item.id!=='string'||!item.id.trim())throw Error('북마크 ID가 유효하지 않습니다.');
    if(ids.has(item.id))throw Error('북마크 ID가 중복되었습니다.');
    ids.add(item.id);
  }
  const id=format.videoId(raw);
  const matches=bookmarks.filter(item=>{
    if(item.parentId!==folderId||typeof item.url!=='string')return false;
    try{return format.videoId(item.url)===id;}catch{return false;}
  });
  const managed=matches.filter(item=>format.unpack(item.url).kind==='managed');
  if(managed.length>1)return {kind:'conflict',reason:'multiple-managed-bookmarks',ids:managed.map(item=>item.id)};
  if(matches.some(item=>['invalid','unsupported'].includes(format.unpack(item.url).kind)))return {kind:'conflict',reason:'unreadable-matching-bookmark',ids:matches.map(item=>item.id)};
  if(!managed.length&&matches.length)return {kind:'conflict',reason:'unmanaged-existing-bookmark',ids:matches.map(item=>item.id)};
  const existing=managed[0];
  const generated=format.register(existing?.url||raw,result);
  if(existing?.url===generated.url)return {kind:'noop',reason:'unchanged',id:existing.id};
  return existing?{kind:'update',id:existing.id,parentId:folderId,expectedUrl:existing.url,url:generated.url}:{kind:'create',parentId:folderId,url:generated.url};
}
module.exports={planRegistration};
