function createTagEditor(sourceVideos,onChange){
  const KEY='extension4youtube.tag-drafts.prototype.v1';
  let store={version:1,edits:{},aliasCache:{}},current=null,saveFailed=false;
  try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved?.version===1&&saved.edits&&saved.aliasCache)store=saved;}catch{}
  const previousCache=JSON.stringify(store.aliasCache);
  for(const edit of Object.values(store.edits))for(const tag of edit.customTags)TagDraftCore.aliasRecord(tag,store.aliasCache,SearchCore.groups);
  if(JSON.stringify(store.aliasCache)!==previousCache)try{localStorage.setItem(KEY,JSON.stringify(store));}catch{saveFailed=true;}
  const dialog=document.createElement('dialog');
  dialog.className='tag-editor';
  dialog.innerHTML='<div class="line"><strong>태그 편집</strong><span style="flex:1"></span><button data-close>닫기</button></div><p data-title></p><span class="label">자동 추천 태그 · 원본 보존</span><div class="line" data-auto></div><span class="label">내 태그</span><div class="line" data-custom></div><form class="line"><input aria-label="추가할 태그" placeholder="필요한 태그 입력" maxlength="100" required><button type="submit">추가</button></form><p data-aliases></p><p data-save role="status"></p><p>이 브라우저에만 자동 저장합니다. 북마크와 YouTube는 변경하지 않습니다.</p>';
  document.body.append(dialog);
  const retry=document.createElement('button');retry.textContent='다시 저장';retry.hidden=!saveFailed;retry.onclick=()=>save();dialog.append(retry);
  const draft=()=>store.edits[current.id]||(store.edits[current.id]=TagDraftCore.empty());
  function save(){try{localStorage.setItem(KEY,JSON.stringify(store));saveFailed=false;dialog.querySelector('[data-save]').textContent='로컬 저장됨';}catch{saveFailed=true;dialog.querySelector('[data-save]').textContent='저장 실패 · 변경 내용은 아직 저장되지 않았습니다. 다시 저장을 눌러주세요.';}retry.hidden=!saveFailed;onChange();}
  function draw(){
    dialog.querySelector('[data-title]').textContent=current.title;
    const edit=draft(),auto=dialog.querySelector('[data-auto]'),custom=dialog.querySelector('[data-custom]');auto.replaceChildren();custom.replaceChildren();
    for(const tag of current.tags){const removed=edit.removedAutoTags.some(value=>SearchCore.normalize(value)===SearchCore.normalize(tag)),b=document.createElement('button');b.textContent=tag+(removed?' 복원':' ×');b.className=removed?'removed':'';b.onclick=()=>{removed?TagDraftCore.add(current,edit,tag):TagDraftCore.remove(current,edit,tag);save();draw();};auto.append(b);}
    for(const tag of edit.customTags){const b=document.createElement('button');b.textContent=tag+' ×';b.onclick=()=>{TagDraftCore.remove(current,edit,tag);save();draw();};custom.append(b);}
    if(!edit.customTags.length)custom.textContent='아직 추가한 태그가 없습니다.';
    dialog.querySelector('[data-aliases]').textContent=edit.customTags.map(tag=>{const record=store.aliasCache[SearchCore.normalize(tag)];return tag+' → '+(record?.aliases.length?record.aliases.join(', '):'별칭 미등록');}).join(' / ');
  }
  dialog.querySelector('form').onsubmit=e=>{e.preventDefault();const input=dialog.querySelector('input'),tag=input.value.trim();if(!tag)return;TagDraftCore.aliasRecord(tag,store.aliasCache,SearchCore.groups);TagDraftCore.add(current,draft(),tag);input.value='';save();draw();input.focus();};
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();
  return {open(video){current=sourceVideos.find(v=>v.id===video.id);dialog.querySelector('input').value='';dialog.querySelector('[data-save]').textContent=saveFailed?'저장 실패 · 변경 내용은 아직 저장되지 않았습니다. 다시 저장을 눌러주세요.':'자동 추천 태그와 내 태그를 분리해 저장합니다.';draw();dialog.showModal();},videos(){return sourceVideos.map(v=>TagDraftCore.effective(v,store.edits[v.id]||TagDraftCore.empty(),store.aliasCache));}};
}


