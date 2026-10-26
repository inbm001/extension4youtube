const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'.logs','extension-assets');
const files=new Set(['index.html','viewer.js','overlay.js','fixture.html','fixture.js','watch-fixture.html']);
const server=http.createServer((req,res)=>{
  const name=req.url==='/'?'index.html':req.url.slice(1);
  if(req.method!=='GET'||(!files.has(name)&&!/^script-\d+\.js$/.test(name))){res.writeHead(404);res.end('Not found');return;}
  res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8');
  res.setHeader('Content-Security-Policy',"script-src 'self'; object-src 'none'");
  res.setHeader('Cache-Control','no-store');
  fs.createReadStream(path.join(assets,name)).on('error',()=>{res.writeHead(500);res.end('Read failed');}).pipe(res);
});
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
server.listen(8771,'127.0.0.1',()=>{
  fs.writeFileSync(path.join(root,'.logs','extension-preview-server.json'),JSON.stringify({pid:process.pid,port:8771,root,log:'.logs/extension-preview-server.json'},null,2));
  console.log('Local CSP preview http://127.0.0.1:8771/');
});
