let data,last='',filter='열린 것',query='';
const openIssues=new Set(),closedGroups=new Set();
const states=['진행','다음','검토필요','결정 필요','예정','상시','보류','나중','완료','닫힘'];
const filters=['열린 것',...states,'담당 claude','담당 사용자','담당 같이','전부'];
const rank=Object.fromEntries(states.map((s,i)=>[s,i]));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statusClass=s=>({'진행':'doing','다음':'todo','검토필요':'review','결정 필요':'blocked','예정':'todo','상시':'always','보류':'later','나중':'later','완료':'done','닫힘':'drop','결정됨':'done'}[s]||'later');
const pill=s=>`<span class="pill st-${statusClass(s)}">${esc(s)}</span>`;
const who=s=>`<span class="pill who-${s==='사용자'?'user':s==='같이'?'both':'claude'}">${esc(s)}</span>`;
function matchesFilter(t){const open=!['완료','닫힘'].includes(t.status);return (filter==='전부'||filter==='열린 것'&&open||filter.startsWith('담당 ')&&open&&t.owner===filter.slice(3)||filter===t.status)&&[t.id,TaskNumbers(data)[t.id],t.title,t.conclusion,t.nextAction].join(' ').toLowerCase().includes(query);}
function render(){
 const numbering=TaskNumbers(data),display=value=>String(value??'').replace(/\bT\d+\b/g,id=>numbering[id]||id);

 document.querySelector('#filters').innerHTML=filters.map(f=>`<button class="tab" data-f="${f}" aria-pressed="${f===filter}">${f}</button>`).join('');document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{filter=b.dataset.f;render();});
 const units=data.tasks.filter(t=>!['group','step'].includes(t.kind));
 document.querySelector('#summary').textContent=states.map(s=>s+' '+units.filter(t=>t.status===s).length).filter(s=>!s.endsWith(' 0')).join(' · ');
 const next=data.tasks.find(t=>t.id===data.nextTaskId);document.querySelector('#next').textContent=next?'다음: '+numbering[next.id]+' '+next.title+' — '+display(next.nextAction):'';
 const table=document.querySelector('table');table.querySelectorAll('tbody').forEach(g=>g.remove());
 for(const [gi,group]of data.boardGroups.entries()){
  const all=group.taskIds.map(id=>data.tasks.find(t=>t.id===id)).filter(t=>t&&!['group','step'].includes(t.kind));
  const ordinal=new Map(all.map(t=>[t.id,numbering[t.id]]));
  const items=all.filter(matchesFilter).sort((a,b)=>(rank[a.status]??99)-(rank[b.status]??99)||({'높음':0,'보통':1,'낮음':2}[a.priority]??2)-({'높음':0,'보통':1,'낮음':2}[b.priority]??2));if(!items.length)continue;
  const body=document.createElement('tbody');body.className='g'+(closedGroups.has(group.id)?' closed':'');
  const heading=document.createElement('tr');heading.className='gh';heading.innerHTML=`<td colspan="8"><button class="fold" aria-expanded="${!closedGroups.has(group.id)}">${closedGroups.has(group.id)?'▸':'▾'}</button> <span class="num">${gi+1}</span> <b>${esc(group.name)}</b> <span class="n">${all.length}</span></td>`;heading.querySelector('button').onclick=()=>{closedGroups.has(group.id)?closedGroups.delete(group.id):closedGroups.add(group.id);render();};body.append(heading);
  for(const t of items){
   const number=ordinal.get(t.id),expanded=openIssues.has(t.id),tr=document.createElement('tr');tr.className='r has';tr.id=t.id;tr.tabIndex=0;tr.setAttribute('aria-expanded',expanded);
   const pending=t.decisionNeeded?'결정 필요 · '+(t.decisionQuestion||''):'';
   const links=[];if(['T01','T03'].includes(t.id))links.push({url:'/review-table?id='+t.id,label:'영상 태그 비교'});if(t.review?.url)links.push({url:t.review.url,label:t.review.url.includes('figma.com')?'Figma':'결과 화면'});if((t.review?.artifacts||[]).length&&!['T01','T03'].includes(t.id))links.push({url:'/review-table?id='+t.id,label:'결과 자료'});const documentLink=links.map(l=>`<a class="tag" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join(' ');
   tr.innerHTML=`<td class="iss"><span class="caret">▸</span><span class="num">${number}</span><div class="clip" title="${esc(number+' '+t.title)}">${esc(t.title)}</div></td><td><select class="row-state pill st-${statusClass(t.status)}" aria-label="${esc(number)} 상태">${states.map(s=>`<option ${s===t.status?'selected':''}>${s}</option>`).join('')}</select></td><td>${who(t.owner)}</td><td><span class="pill pr-${esc(t.priority)}">${esc(t.priority)}</span></td><td class="muted"><div class="clip">${esc((t.depends||[]).map(id=>numbering[id]||id).join(' · '))}</div></td><td class="prob" title="${esc(pending)}"><div class="clip">${esc(pending)}</div></td><td class="muted" title="${esc(display(t.conclusion||t.detail))}"><div class="clip">${!t.decisionNeeded?'<span class="settled">결정됨'+'</span> ':''}${esc(t.conclusion||t.detail)}</div></td><td><div class="clip">${documentLink}</div></td>`;
   const detail=document.createElement('tr');detail.className='detail';detail.hidden=!expanded;
   const steps=t.steps||[];detail.innerHTML=`<td colspan="8"><ol>${steps.map((s,i)=>`<li class="${!['완료','닫힘','결정됨'].includes(s.status)?'todo':''}"><span class="num">${number}.${i+1}</span>${pill(s.status)} ${who(s.owner||t.owner)} ${esc(display(s.text))}</li>`).join('')}<li class="next-action"><span class="num">${esc(number)}</span> 다음 · ${esc(display(t.nextAction||'추가 작업 없음'))}</li></ol></td>`;
   const toggle=()=>{expanded?openIssues.delete(t.id):openIssues.add(t.id);render();};tr.onclick=e=>{if(e.target.closest('a,select,option')||String(getSelection()))return;toggle();};tr.onkeydown=e=>{if(e.target.tagName==='SELECT')return;if(['Enter',' '].includes(e.key)){e.preventDefault();toggle();}};
   tr.querySelector('select').onchange=async e=>{const status=e.target.value;if(status==='완료'&&!confirm(number+' 전체 범위를 완료로 변경할까요?')){e.target.value=t.status;return;}e.target.disabled=true;try{const r=await fetch('/task-status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:t.id,expected:JSON.stringify(t),status,confirmedComplete:status==='완료'})});if(!r.ok)throw Error(await r.text());await load();}catch(error){document.querySelector('#error').textContent=error.message;e.target.disabled=false;e.target.value=t.status;}};body.append(tr,detail);
  }
  const footer=document.createElement('tr');footer.className='gf';footer.innerHTML=`<td></td><td colspan="7"><span class="cap">COMPLETE</span> ${all.filter(t=>['완료','닫힘'].includes(t.status)).length}/${all.length}</td>`;body.append(footer);table.append(body);
 }
}
async function load(){try{const response=await fetch('/tasks.json',{cache:'no-store'});if(!response.ok)throw Error('업무를 읽지 못했습니다');const text=await response.text();if(text!==last){data=JSON.parse(text);last=text;render();}document.querySelector('#error').textContent='';}catch(e){document.querySelector('#error').textContent=e.message;}}
document.querySelector('#search').oninput=e=>{query=e.target.value.toLowerCase();if(data)render();};document.querySelector('#refresh').onclick=load;
const cols=[...document.querySelectorAll('col')],base=[290,110,64,64,100,260,420,130],key='youtube.reference-widths.v1';let widths=base.slice();try{const w=JSON.parse(localStorage.getItem(key));if(Array.isArray(w)&&w.length===8&&w.every(x=>Number.isFinite(x)&&x>=40&&x<=1500))widths=w;}catch{}
function applyWidths(){const flex=[0,5,6],fixed=widths.reduce((s,w,i)=>s+(flex.includes(i)?0:w),0),available=Math.max(document.querySelector('.wrap').clientWidth,fixed+650),weight=flex.reduce((s,i)=>s+widths[i],0);cols.forEach((c,i)=>c.style.width=(flex.includes(i)?(available-fixed)*widths[i]/weight:widths[i])+'px');document.querySelector('table').style.width=available+'px';}
new ResizeObserver(applyWidths).observe(document.querySelector('.wrap'));applyWidths();
document.querySelectorAll('thead th').forEach((th,i)=>{const h=document.createElement('div');h.className='rz';h.title='끌어서 너비 조정 · 두 번 누르면 기본';th.append(h);h.onpointerdown=e=>{e.preventDefault();const start=e.clientX,initial=widths[i];h.setPointerCapture(e.pointerId);h.onpointermove=ev=>{widths[i]=Math.max(40,Math.min(1500,initial+ev.clientX-start));applyWidths();};h.onpointerup=()=>{h.onpointermove=null;try{localStorage.setItem(key,JSON.stringify(widths));}catch{}};h.onpointercancel=h.onpointerup;};h.ondblclick=()=>{widths[i]=base[i];applyWidths();try{localStorage.setItem(key,JSON.stringify(widths));}catch{}};});
load();setInterval(load,5000);
