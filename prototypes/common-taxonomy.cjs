function exportDraft(source){
  if(source.status!=='draft-not-approved')throw Error('검토용 초안만 내보냅니다.');
  const strings=value=>{
    if(!Array.isArray(value)||!value.every(item=>typeof item==='string'&&item.trim()))throw Error('사전 항목이 유효하지 않습니다.');
    return [...value];
  };
  const categories=source.prototypeCategories.map(item=>{
    if(typeof item.id!=='string'||!item.id.trim()||typeof item.name!=='string'||!item.name.trim())throw Error('분류 ID와 이름이 필요합니다.');
    return {id:item.id,name:item.name,terms:strings(item.terms)};
  });
  if(new Set(categories.map(item=>item.id)).size!==categories.length)throw Error('분류 ID가 중복되었습니다.');
  return {version:source.version,status:'draft-not-approved',categories,aliasGroups:source.aliasGroups.map(strings)};
}
module.exports={exportDraft};
