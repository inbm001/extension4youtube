const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const checks=fs.readdirSync(__dirname).filter(name=>/^check-.*\.cjs$/.test(name)&&name!==path.basename(__filename)).sort();
if(!checks.length)throw Error('No local checks found.');
const results=checks.map(name=>{
  const run=spawnSync(process.execPath,[path.join(__dirname,name)],{cwd:root,encoding:'utf8',timeout:60000,maxBuffer:2*1024*1024});
  const passed=!run.error&&run.status===0;
  console.log(`${passed?'PASS':'FAIL'} ${name}`);
  if(!passed)console.error(run.error?.message||run.stderr||run.stdout);
  return {name,passed,exitCode:run.status,error:run.error?.message||null,stdout:run.stdout||'',stderr:run.stderr||''};
});
const report={scope:'Local script checks only. Not live Chrome integration, browser UI acceptance, API compliance or model accuracy.',updatedAt:new Date().toISOString(),passed:results.every(r=>r.passed),results};
fs.mkdirSync(path.join(root,'.logs'),{recursive:true});
fs.writeFileSync(path.join(root,'.logs','local-checks.json'),JSON.stringify(report,null,2)+'\n');
console.log(`${results.filter(r=>r.passed).length}/${results.length} local checks passed.`);
process.exitCode=report.passed?0:1;
