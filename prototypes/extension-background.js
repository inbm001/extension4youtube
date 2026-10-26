importScripts('overlay.js');
chrome.action.onClicked.addListener(async tab=>{
  if(!tab.id||!/^https:\/\/(www\.)?youtube\.com\//.test(tab.url||''))return;
  try{
    await chrome.scripting.executeScript({target:{tabId:tab.id},func:toggleBookmarkOverlay,args:[chrome.runtime.getURL('index.html')]});
    await chrome.action.setBadgeText({tabId:tab.id,text:''});
  }catch(error){
    console.error('Could not open bookmark overlay',error);
    await chrome.action.setBadgeText({tabId:tab.id,text:'!'});
  }
});
chrome.runtime.onMessage.addListener((message,sender)=>{
  if(message?.type!=='close-bookmark-overlay'||!sender.tab?.id||sender.url!==chrome.runtime.getURL('index.html'))return;
  chrome.scripting.executeScript({target:{tabId:sender.tab.id},func:()=>document.getElementById('extension4youtube-search-overlay-prototype')?.close()}).catch(console.error);
});
