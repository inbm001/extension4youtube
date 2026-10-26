const {planRegistration}=require('./bookmark-plan.cjs');
const {unpack}=require('./bookmark-format.cjs');
async function prepareRegistration(raw,result,folderId,api){
  const children=await api.getChildren(folderId);
  return planRegistration(raw,result,folderId,children);
}
async function revalidateUpdate(plan,api){
  if(plan.kind!=='update')throw Error('갱신 계획이 필요합니다.');
  const children=await api.getChildren(plan.parentId);
  const found=children.filter(item=>item.id===plan.id);
  if(found.length!==1||found[0].parentId!==plan.parentId||found[0].url!==plan.expectedUrl)return {kind:'stale',id:plan.id};
  const desired=unpack(plan.url);
  if(desired.kind!=='managed')throw Error('갱신 URL이 유효하지 않습니다.');
  const checked=planRegistration(plan.url,{outcome:'success',tags:desired.record.autoTags,aliases:desired.record.aliases},plan.parentId,children);
  if(checked.kind!=='update'||checked.id!==plan.id||checked.url!==plan.url)return {kind:'stale',id:plan.id};
  return {kind:'ready',id:plan.id,url:plan.url};
}
module.exports={prepareRegistration,revalidateUpdate};
