document.getElementById('q')?.focus();
document.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||document.querySelector('dialog[open]')||typeof chrome==='undefined'||!chrome.runtime?.sendMessage)return;
  chrome.runtime.sendMessage({type:'close-bookmark-overlay'}).catch(console.error);
});
