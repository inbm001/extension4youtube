function toggleBookmarkOverlay(viewerUrl){
  const id='extension4youtube-search-overlay-prototype';
  const existing=document.getElementById(id);
  if(existing){existing.close();return;}
  const previous=document.activeElement;
  const dialog=document.createElement('dialog');dialog.id=id;
  dialog.style.cssText='position:fixed;inset:0;margin:0;width:100vw;height:100vh;max-width:none;max-height:none;padding:0;border:0;background:#141414;color:white;';
  const close=document.createElement('button');close.textContent='닫기';close.setAttribute('aria-label','북마크 조회 닫기');
  close.style.cssText='position:absolute;right:16px;top:8px;z-index:1;padding:8px 16px;cursor:pointer;';
  const frame=document.createElement('iframe');frame.title='북마크 조회';frame.src=viewerUrl;
  frame.style.cssText='width:100%;height:100%;border:0;';
  close.onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>{dialog.remove();previous?.focus();},{once:true});
  dialog.append(close,frame);document.body.append(dialog);dialog.showModal();frame.focus();
}
