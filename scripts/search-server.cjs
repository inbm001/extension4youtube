const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const folder=path.join(root,'.logs/search-trial');
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1:8765');
  const file=url.pathname==='/'||url.pathname==='/index.html'?'index.html':url.pathname==='/videos.json'?'videos.json':null;
  if(req.method!=='GET'||!file){res.writeHead(404);return res.end('Not found');}
  res.setHeader('Content-Type',file.endsWith('.json')?'application/json; charset=utf-8':'text/html; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  fs.createReadStream(path.join(folder,file)).on('error',()=>{res.writeHead(500);res.end('Read failed');}).pipe(res);
});
server.on('error',e=>{console.error(e.message);process.exitCode=1;});
server.listen(8765,'127.0.0.1',()=>{
  fs.writeFileSync(path.join(folder,'server.json'),JSON.stringify({pid:process.pid,port:8765,root,command:'node scripts/search-server.cjs',log:'.logs/search-trial/server.json'},null,2));
  console.log('Search preview http://127.0.0.1:8765/');
});
