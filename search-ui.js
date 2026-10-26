const engine=SearchCore;
const tagEditor=createTagEditor(videos,()=>render());
const q=document.querySelector('#q');
const state={category:'',selected:[],mode:'both',status:'all'};
const watchTabs=document.createElement('div');watchTabs.className='line';watchTabs.setAttribute('aria-label','시청 상태');q.before(watchTabs);
function button(text,selected,onClick){const b=document.createElement('button');b.textContent=text;b.setAttribute('aria-pressed',selected);b.onclick=onClick;return b;}
function tagFilter(v){return state.selected.every(t=>engine.tagMatches(v,t));}
function render(){
  const dataset=tagEditor.videos();
  const scope=dataset.filter(v=>engine.inCategory(v,state.category));
  const categories=document.querySelector('#categories');categories.replaceChildren();
  const label=document.createElement('span');label.className='label';label.textContent='대분류';categories.append(label);
  categories.append(button('전체',!state.category,()=>{state.category='';state.selected=[];render();}));
  for(const category of engine.categories){const count=dataset.filter(v=>engine.inCategory(v,category.id)).length;categories.append(button(category.name+' '+count,state.category===category.id,()=>{state.category=state.category===category.id?'':category.id;state.selected=[];render();}));}
  const children=document.querySelector('#children');children.replaceChildren();
  if(state.category){const label=document.createElement('span');label.className='label';label.textContent='하위 태그';children.append(label);const terms=[...new Set(scope.flatMap(v=>v.tags))].sort((a,b)=>scope.filter(v=>engine.tagMatches(v,b)).length-scope.filter(v=>engine.tagMatches(v,a)).length||a.localeCompare(b,'ko'));for(const tag of terms)children.append(button(tag,state.selected.includes(tag),()=>{state.selected=state.selected.includes(tag)?state.selected.filter(t=>t!==tag):[...state.selected,tag];render();}));}
  const selected=document.querySelector('#selected');selected.replaceChildren();for(const tag of state.selected)selected.append(button(tag+' ×',true,()=>{state.selected=state.selected.filter(t=>t!==tag);render();}));
  const queryMatches=scope.filter(v=>tagFilter(v)&&engine.matches(v,q.value,state.mode));
  watchTabs.replaceChildren();
  for(const [status,label] of [['all','전체'],['watching','시청중'],['completed','완료']])watchTabs.append(button(label+' '+queryMatches.filter(v=>engine.inWatchStatus(v,status)).length,state.status===status,()=>{state.status=status;render();}));
  const statusNote=document.createElement('span');statusNote.className='meta';statusNote.textContent='표본에는 실제 시청 기록이 없습니다.';watchTabs.append(statusNote);
  const found=queryMatches.filter(v=>engine.inWatchStatus(v,state.status));
  const tagsOnly=scope.filter(v=>tagFilter(v)&&engine.inWatchStatus(v,state.status)&&engine.matches(v,q.value,'tags')).length;
  document.querySelector('#count').textContent=found.length+'개 결과 / '+dataset.length+'개 · '+(state.category?engine.categories.find(c=>c.id===state.category).name:'전체')+' · 태그만 일치 '+tagsOnly+'개';
  const list=document.querySelector('#list');list.replaceChildren();
  const addWatchLabels=()=>{for(const [index,article] of Array.from(list.children).entries()){if(found[index]?.basis==='synthetic_fixture')article.querySelector('.note').textContent='가상 상태 UI 시험 · Gemini 추출 또는 실제 시청 기록 아님';const text=engine.watchLabel(found[index]?.status);if(!text)continue;const label=document.createElement('span');label.className='watch-status';label.textContent=text+' · ';label.setAttribute('aria-label','시청 상태 '+text);article.prepend(label);}};
  if(!found.length){const empty=document.createElement('div');empty.id='empty';empty.textContent='일치하는 영상이 없습니다. 검색어나 선택한 필터를 줄여보세요.';list.append(empty);}
  for(const v of found){const article=document.createElement('article'),link=document.createElement('a');link.textContent=v.title;link.href=v.url;link.target='_blank';link.rel='noopener noreferrer';article.append(link);const chips=document.createElement('div');chips.className='chips';for(const tag of v.tags)chips.append(button(tag,state.selected.includes(tag),()=>{if(!state.selected.includes(tag))state.selected.push(tag);render();}));article.append(chips);const editButton=button('태그 편집',false,()=>tagEditor.open(v));editButton.className='edit-tags';article.append(editButton);const note=document.createElement('div');note.className='note';note.textContent=v.basis==='provided_description'?'Gemini 재추출 · 실제 설명의 근거 발췌 대조 완료':v.basis==='unavailable'?'Gemini 응답 · 접근 불가':'Gemini 응답 · 제목 근거 · 내용·자막 분석 아님';article.append(note);if(v.id==='u2oDdU6z4Bw'&&v.basis==='title_only'){const warning=document.createElement('details');const summary=document.createElement('summary');summary.textContent='오분류 발견 · 원본 결과를 보존한 평가 표본';warning.append(summary,document.createTextNode('이 영상은 에이전트 스킬 모음에 관한 영상입니다. Gemini가 스택 추적 도구로 오해했습니다. 이 태그는 승인된 분류가 아닙니다.'));article.append(warning);}list.append(article);}
  const suggest=document.querySelector('#suggest');suggest.replaceChildren();const term=engine.suggestionTerm(q.value);if(term){const candidates=[...new Set(scope.flatMap(v=>v.tags))].filter(t=>engine.forms(term).some(w=>engine.normalize(t).includes(w))||scope.some(v=>v.tags.includes(t)&&(v.aliases?.[t]||[]).some(a=>engine.forms(term).some(w=>engine.normalize(a).includes(w))))).slice(0,8);for(const tag of candidates)suggest.append(button(tag,false,()=>{if(!state.selected.includes(tag))state.selected.push(tag);q.value=engine.suggestionRemainder(q.value,tag);render();q.focus();}));}
  addWatchLabels();
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===state.mode));
}
q.oninput=render;
q.onkeydown=event=>{if(event.key!=='ArrowDown')return;const first=document.querySelector('#suggest button');if(first){event.preventDefault();first.focus();}};
document.querySelector('#suggest').onkeydown=event=>{
  if(!['ArrowDown','ArrowUp'].includes(event.key))return;
  const buttons=Array.from(document.querySelectorAll('#suggest button')),index=buttons.indexOf(document.activeElement);
  if(index<0)return;
  event.preventDefault();
  if(event.key==='ArrowUp'&&index===0){q.focus();return;}
  buttons[Math.min(buttons.length-1,Math.max(0,index+(event.key==='ArrowDown'?1:-1)))].focus();
};
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;render();});
document.querySelector('#reset').onclick=()=>{state.category='';state.selected=[];state.status='all';state.mode='both';q.value='';render();q.focus();};
render();




