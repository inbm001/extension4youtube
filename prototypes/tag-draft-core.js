(function(scope){
  const normalize=s=>String(s).normalize('NFKC').toLowerCase().replace(/\s+/g,'');
  const empty=()=>({removedAutoTags:[],customTags:[]});
  function add(base,draft,label){
    const tag=label.trim();if(!tag)return draft;
    const key=normalize(tag);
    draft.removedAutoTags=draft.removedAutoTags.filter(t=>normalize(t)!==key);
    if(!base.tags.some(t=>normalize(t)===key)&&!draft.customTags.some(t=>normalize(t)===key))draft.customTags.push(tag);
    return draft;
  }
  function remove(base,draft,label){
    const key=normalize(label);
    draft.customTags=draft.customTags.filter(t=>normalize(t)!==key);
    if(base.tags.some(t=>normalize(t)===key)&&!draft.removedAutoTags.some(t=>normalize(t)===key))draft.removedAutoTags.push(label);
    return draft;
  }
  function aliasRecord(tag,cache,groups){
    const key=normalize(tag);
    const group=groups.find(g=>g.some(value=>normalize(value)===key));
    const aliases=group?group.filter(value=>normalize(value)!==key):[];
    const changed=cache[key]?.source==='local-dictionary'&&group&&JSON.stringify(cache[key].aliases)!==JSON.stringify(aliases);
    if(!Object.hasOwn(cache,key)||cache[key].source==='unresolved'||changed){
      cache[key]={aliases,source:group?'local-dictionary':'unresolved'};
    }
    return cache[key];
  }
  function effective(base,draft,cache){
    const hidden=new Set(draft.removedAutoTags.map(normalize));
    const personal=new Set(draft.customTags.map(normalize));
    const tags=[...base.tags.filter(t=>!hidden.has(normalize(t))&&!personal.has(normalize(t))),...draft.customTags];
    const aliases={...base.aliases};
    for(const tag of draft.customTags)aliases[tag]=cache[normalize(tag)]?.aliases||[];
    return {...base,tags,aliases,customTags:[...draft.customTags]};
  }
  const api={empty,add,remove,aliasRecord,effective};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else scope.TagDraftCore=api;
})(typeof window==='undefined'?{}:window);
