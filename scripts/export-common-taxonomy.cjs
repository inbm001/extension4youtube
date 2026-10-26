const fs=require('node:fs');
const {exportDraft}=require('../prototypes/common-taxonomy.cjs');
const draft=JSON.parse(fs.readFileSync('classification-draft.json','utf8'));
fs.writeFileSync('.logs/common-taxonomy-draft.json',JSON.stringify(exportDraft(draft),null,2)+'\n');
console.log('Exported local common taxonomy draft. No server upload or approval implied.');
