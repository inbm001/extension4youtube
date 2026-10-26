const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const routes=new Map([['/',['tasks.html','text/html; charset=utf-8']],['/tasks.json',['tasks.json','application/json; charset=utf-8']]]);
routes.set('/curriculum',['prototypes/curriculum-editor.html','text/html; charset=utf-8']);
routes.set('/search-core.js',['search-core.js','text/javascript; charset=utf-8']);
routes.set('/prototype-videos.json',['.logs/search-trial/videos.json','application/json; charset=utf-8']);
const server=http.createServer((req,res)=>{
  res.setHeader('Cache-Control','no-store');
  const url=new URL(req.url,'http://127.0.0.1:8770');
  if(req.method==='POST'&&['/review','/review-comment','/task-status'].includes(url.pathname)){
    if(req.headers.origin!=='http://127.0.0.1:8770'){res.writeHead(403);return res.end('Origin rejected');}
    let body='';req.on('data',chunk=>{body+=chunk;if(body.length>100000)req.destroy();});
    req.on('end',()=>{try{
      const input=JSON.parse(body),file=path.join(root,'tasks.json'),data=JSON.parse(fs.readFileSync(file,'utf8'));
      const task=data.tasks.find(t=>t.id===input.id);
      if(!task||(url.pathname==='/review'&&task.status!=='검토필요')||JSON.stringify(task)!==input.expected){res.writeHead(409);return res.end('항목이 변경되었습니다. 새로고침 후 다시 검토해 주세요.');}
      if(url.pathname==='/task-status'){
        if(!['검토필요','상시','진행','다음','결정 필요','예정','나중','보류','완료','닫힘'].includes(input.status)){res.writeHead(400);return res.end('유효하지 않은 상태');}
        if(input.status==='완료'&&input.confirmedComplete!==true){res.writeHead(400);return res.end('완료 확인이 필요합니다.');}
        task.statusHistory=task.statusHistory||[];task.statusHistory.push({from:task.status,to:input.status,by:'사용자',at:new Date().toISOString()});task.status=input.status;
        if(input.status==='완료'){task.reviewedAt=new Date().toISOString();task.reviewedBy='사용자';}
        const fileTemp=file+'.tmp';fs.writeFileSync(fileTemp,JSON.stringify(data,null,2)+'\n');fs.renameSync(fileTemp,file);res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({status:task.status}));
      }
      if(input.comment!==undefined&&(typeof input.comment!=='string'||input.comment.length>12000)){res.writeHead(400);return res.end('의견은 12000자 이내로 작성해 주세요.');}
      const comment=(input.comment||'').trim();
      if(url.pathname==='/review-comment'&&!comment){res.writeHead(400);return res.end('코멘트를 입력해 주세요.');}
      if(url.pathname==='/review'&&task.reviewCanComplete!==true){res.writeHead(409);return res.end('남은 범위나 검토 자료를 먼저 논의해 주세요. 검토필요 상태를 유지합니다.');}
      if(comment){task.reviewComments=task.reviewComments||[];task.reviewComments.push({text:comment,by:'사용자',at:new Date().toISOString()});task.reviewAwaitingReply=true;if(!['완료','상시'].includes(task.status))task.status='검토필요';}
      if(url.pathname==='/review'){
        task.status='완료';
        task.reviewedAt=new Date().toISOString();task.reviewedBy='사용자';
      }
      const temporary=file+'.tmp';fs.writeFileSync(temporary,JSON.stringify(data,null,2)+'\n');fs.renameSync(temporary,file);
      res.setHeader('Content-Type','application/json');res.end(JSON.stringify({status:task.status}));
    }catch{res.writeHead(400);res.end('검토 저장 실패');}});return;
  }
  if(req.method!=='GET'){res.writeHead(405);return res.end('Method not allowed');}
  if(url.pathname==='/review-table'){
    const id=url.searchParams.get('id');
    const file=id&&/^T\d+$/.test(id)&&path.join(root,'.logs/review-pages',id+'.html');
    if(!file||!fs.existsSync(file)){res.writeHead(404);return res.end('Not found');}
    res.setHeader('Content-Type','text/html; charset=utf-8');fs.createReadStream(file).pipe(res);return;
  }
  if(url.pathname==='/review-artifact'){
    const data=JSON.parse(fs.readFileSync(path.join(root,'tasks.json'),'utf8'));
    const task=data.tasks.find(t=>t.id===url.searchParams.get('id'));
    const artifact=task?.review?.artifacts?.[Number(url.searchParams.get('index'))];
    const file=artifact&&path.resolve(root,artifact.path);
    if(!file||!file.startsWith(root+path.sep)||!['.png','.json','.md','.txt'].includes(path.extname(file))||!fs.existsSync(file)){res.writeHead(404);return res.end('Not found');}
    res.setHeader('Content-Type',path.extname(file)==='.png'?'image/png':'text/plain; charset=utf-8');fs.createReadStream(file).pipe(res);return;
  }
  const route=routes.get(req.url);if(!route){res.writeHead(404);return res.end('Not found')}res.setHeader('Content-Type',route[1]);fs.createReadStream(path.join(root,route[0])).on('error',()=>{res.writeHead(500);res.end('Read failed')}).pipe(res)
});
server.on('error',e=>{console.error(e.message);process.exitCode=1});
server.listen(8770,'127.0.0.1',()=>{fs.mkdirSync(path.join(root,'.logs'),{recursive:true});fs.writeFileSync(path.join(root,'.logs/tasks-server.json'),JSON.stringify({pid:process.pid,port:8770,root,log:'.logs/tasks-server.json'},null,2));console.log('Task board http://127.0.0.1:8770/')});
