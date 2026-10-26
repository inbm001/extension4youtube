(function(scope){
  function taskNumbers(data){
    const result={};
    for(const [gi,group]of data.boardGroups.entries()){
      let index=0;
      for(const id of group.taskIds){
        const task=data.tasks.find(t=>t.id===id);if(!task)continue;
        if(task.kind==='group')result[id]=String(gi+1);
        else if(task.kind!=='step')result[id]=`${gi+1}.${++index}`;
      }
    }
    for(const task of data.tasks)for(const [i,step]of (task.steps||[]).entries())if(step.taskId&&result[task.id])result[step.taskId]=result[task.id]+'.'+(i+1);
    return result;
  }
  if(typeof module!=='undefined'&&module.exports)module.exports=taskNumbers;
  else scope.TaskNumbers=taskNumbers;
})(typeof window==='undefined'?{}:window);
