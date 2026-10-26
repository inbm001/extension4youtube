function transition(record,event){
  if(record===null)return null;
  if(!record||!['watching','completed'].includes(record.status)||!Number.isSafeInteger(record.positionSeconds)||record.positionSeconds<0)throw Error('등록된 시청 자료가 유효하지 않습니다.');
  if(event.type==='mark'){
    if(!['watching','completed'].includes(event.status))throw Error('시청 상태가 유효하지 않습니다.');
    return {...record,status:event.status};
  }
  if(event.type!=='progress')throw Error('지원하지 않는 시청 이벤트입니다.');
  if(!Number.isFinite(event.positionSeconds)||event.positionSeconds<0||event.positionSeconds>Number.MAX_SAFE_INTEGER)throw Error('재생 위치가 유효하지 않습니다.');
  const duration=event.durationSeconds;
  const threshold=Math.ceil(duration*0.95);
  const crossed=Number.isFinite(duration)&&duration>0&&record.positionSeconds<threshold&&Math.floor(event.positionSeconds)>=threshold;
  return {...record,positionSeconds:Math.floor(event.positionSeconds),status:crossed?'completed':record.status};
}
module.exports={transition};
