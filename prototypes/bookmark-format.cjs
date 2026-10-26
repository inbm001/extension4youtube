const HOSTS=new Set(['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtu.be','www.youtu.be']);
const MARKER='#ytb=';
function videoId(raw){
  const url=new URL(raw);
  if(url.protocol!=='https:'||!HOSTS.has(url.hostname)||url.username||url.password)throw Error('지원하는 HTTPS YouTube 영상 주소가 아닙니다.');
  const id=url.hostname.endsWith('youtu.be')?url.pathname.split('/')[1]:url.pathname==='/watch'?url.searchParams.get('v'):url.pathname.match(/^\/(?:shorts|live|embed)\/([^/]+)\/?$/)?.[1];
  if(!id||!/^[A-Za-z0-9_-]{11}$/.test(id))throw Error('유효한 영상 ID가 없습니다.');
  return id;
}
function position(raw){
  if(raw===null||raw==='')return 0;
  if(/^\d+(?:\.\d+)?s?$/.test(raw)){
    const seconds=Math.floor(Number(raw.replace(/s$/,'')));
    if(!Number.isSafeInteger(seconds))throw Error('재생 위치가 유효하지 않습니다.');
    return seconds;
  }
  const match=/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(raw);
  if(!match||!match.slice(1).some(Boolean))throw Error('재생 위치 형식을 읽을 수 없습니다.');
  const seconds=Number(match[1]||0)*3600+Number(match[2]||0)*60+Number(match[3]||0);
  if(!Number.isSafeInteger(seconds))throw Error('재생 위치가 유효하지 않습니다.');
  return seconds;
}
function strings(value){
  if(!Array.isArray(value)||!value.every(s=>typeof s==='string'&&s.trim().length))throw Error('태그·별칭은 비어 있지 않은 문자열 배열이어야 합니다.');
  return [...new Set(value.map(s=>s.trim()))];
}
function payload(value){
  if(!value||typeof value!=='object'||value.v!==1)throw Error('지원하지 않는 자료 버전입니다.');
  if(!['watching','completed'].includes(value.status))throw Error('시청 상태가 유효하지 않습니다.');
  if(!value.aliases||typeof value.aliases!=='object'||Array.isArray(value.aliases))throw Error('별칭 자료가 유효하지 않습니다.');
  return {v:1,status:value.status,autoTags:strings(value.autoTags),customTags:strings(value.customTags),removedAutoTags:strings(value.removedAutoTags),aliases:Object.fromEntries(Object.entries(value.aliases).map(([tag,list])=>[tag,strings(list)]))};
}
function pack(raw,record){
  const id=videoId(raw),data=payload(record);
  if(!Number.isSafeInteger(record.positionSeconds)||record.positionSeconds<0)throw Error('재생 위치는 0 이상의 정수 초여야 합니다.');
  const url=new URL('https://www.youtube.com/watch');url.searchParams.set('v',id);
  if(record.positionSeconds)url.searchParams.set('t',record.positionSeconds+'s');
  url.hash=MARKER.slice(1)+encodeURIComponent(JSON.stringify(data));
  return url.href;
}
function unpack(raw){
  try{
    const id=videoId(raw),url=new URL(raw);
    if(!url.hash.startsWith(MARKER))return {kind:'unmanaged',videoId:id,originalUrl:raw};
    const parsed=JSON.parse(decodeURIComponent(url.hash.slice(MARKER.length)));
    if(parsed?.v!==1)return {kind:'unsupported',version:parsed?.v,originalUrl:raw};
    return {kind:'managed',videoId:id,record:{...payload(parsed),positionSeconds:position(url.searchParams.get('t'))}};
  }catch(error){return {kind:'invalid',message:error.message,originalUrl:raw};}
}
function register(raw,result){
  if(result?.outcome!=='success')return null;
  const tags=strings(result.tags);
  if(!tags.length)return null;
  const previous=unpack(raw);
  if(previous.kind==='invalid'||previous.kind==='unsupported')throw Error('기존 저장 자료를 안전하게 갱신할 수 없습니다.');
  const base=previous.kind==='managed'?previous.record:{v:1,status:'watching',customTags:[],removedAutoTags:[],aliases:{},positionSeconds:position(new URL(raw).searchParams.get('t'))};
  const personalAliases=Object.fromEntries(base.customTags.filter(tag=>Object.hasOwn(base.aliases,tag)).map(tag=>[tag,base.aliases[tag]]));
  const record={...base,autoTags:tags,aliases:{...base.aliases,...(result.aliases||{}),...personalAliases}};
  return {videoId:videoId(raw),url:pack(raw,record)};
}
module.exports={videoId,pack,unpack,register};
