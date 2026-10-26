(function (scope) {
  const groups = [
    ['베이스', 'bass'], ['베이스 패턴', 'bass pattern', 'bass patterns'],
    ['사운드 디자인', 'sound design'], ['에이블톤', 'Ableton', 'Ableton Live', '에이블톤 라이브'],
    ['피아노', 'piano'], ['핑거스타일', 'fingerstyle'], ['재즈', 'jazz'],
    ['컨트리', 'country'], ['네오소울', 'neo soul', 'neosoul'],
    ['타브악보', 'TAB', 'tabs', 'tablature'], ['작곡', 'composition', 'songwriting'],
    ['음악이론', 'music theory'], ['코드 진행', 'chord progression'],
    ['청음', 'ear training'], ['샘플링', 'sampling'], ['편곡', 'arrangement'],
    ['딥러닝', 'deep learning'], ['머신러닝', 'machine learning'],
    ['클로드 코드', 'Claude Code'], ['스킬', 'skills', 'skill'],
    ['에이전트 스킬', 'agent skills'], ['하네스', 'harness', 'hanness'],
    ['피그마', 'Figma'], ['로직프로', 'Logic Pro'], ['노트북LM', 'NotebookLM'],
    ['타입스크립트','TypeScript'], ['리액트','React'], ['자바스크립트','JavaScript'], ['도커','Docker']
  ];
  const normalize = s => String(s).normalize('NFKC').toLowerCase().replace(/\s+/g, '');
  function forms(term) {
    const key = normalize(term);
    const group = groups.find(g => g.some(x => normalize(x) === key));
    return group ? group.map(normalize) : [key];
  }
  function tagMatches(video, term) {
    const needles = forms(term);
    return video.tags.some(tag => [tag, ...(video.aliases?.[tag] || [])].some(value => needles.some(n => normalize(value).includes(n))));
  }
  function matches(video, query, mode = 'both') {
    let prepared = query;
    const phrases = groups.flatMap(group => group.filter(value => /\s/.test(value)).map(value => ({value, canonical: normalize(group[0])}))).sort((a,b)=>b.value.length-a.value.length);
    for(const phrase of phrases){
      const escaped=phrase.value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s+');
      prepared=prepared.replace(new RegExp('(?<![a-zA-Z0-9])'+escaped+'(?![a-zA-Z0-9])','gi'),phrase.canonical);
    }
    return prepared.trim().split(/\s+/).filter(Boolean).every(term => tagMatches(video, term) || (mode === 'both' && forms(term).some(x => normalize(video.title).includes(x))));
  }
  const categories = [
    {id:'tab', name:'TAB', terms:['TAB','타브악보']},
    {id:'composition', name:'작곡', terms:['작곡','편곡','비트메이킹','샘플링','멜로디','코드 진행','음악 프로듀싱','에이블톤','로직프로','FL 스튜디오','FL Studio','DAW']},
    {id:'sound', name:'사운드디자인', terms:['사운드 디자인','신디','오디오 플러그인','채널 스트립']},
    {id:'theory', name:'음악이론', terms:['음악이론','경과화음','청음','화음','선법','하모니','곡 구조']},
    {id:'ai', name:'AI 활용', terms:['AI','인공지능','딥러닝','머신러닝','Deep Learning','Machine Learning','GPT','DeepSeek','클로드','Claude','MCP','에이전트 스킬','클로드 스킬','SKILL.md','taste skill','pstack','Jev','하네스','LLM','RAG','GraphRAG','Gemini','노트북LM','챗GPT']},
    {id:'code', name:'프로그래밍', terms:['개발','코딩','HTML','CSS','리액트','useState','도커','TypeScript','Next.js','CLI','MSA','트랜잭션']},
    {id:'design', name:'디자인', terms:['피그마','웹디자인','웹 디자인','모션그래픽','디자이너','프로토타이핑','UIUX']},
    {id:'cooking', name:'요리', terms:['요리','레시피','카레','소스 만들기','토마토 소스','크림 소스','sauce','고기','샌드위치','쇼가야키','해동']},
    {id:'food', name:'맛집', terms:['맛집','뷔페','카페','다이닝','식품 리뷰']}
  ];
  function inCategory(video, id) {
    const category = categories.find(c => c.id === id);
    return !category || category.terms.some(term => {
      const needles=forms(term);
      return video.tags.some(tag => [tag,...(video.aliases?.[tag]||[])].some(value => needles.some(needle => {
        if(!/^[a-z0-9]+$/.test(needle))return normalize(value).includes(needle);
        const escaped=needle.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        return new RegExp('(?<![a-z0-9])'+escaped.split('').join('\\s*')+'(?![a-z0-9])','i').test(String(value).normalize('NFKC'));
      })));
    });
  }
  function inWatchStatus(video,status){
    return status==='all'||(['watching','completed'].includes(status)&&video.status===status);
  }
  const watchLabel=status=>status==='watching'?'시청중':status==='completed'?'완료':'';
  function suggestionTerm(query){
    const words=query.trim().split(/\s+/).filter(Boolean);
    for(let start=0;start<words.length;start++){
      const tail=words.slice(start).join(' ');
      if(groups.some(group=>group.some(value=>normalize(value)===normalize(tail))))return tail;
    }
    return words.at(-1)||'';
  }
  function suggestionRemainder(query,tag){
    const words=query.trim().split(/\s+/).filter(Boolean);
    for(let start=0;start<words.length;start++){
      const tail=normalize(words.slice(start).join(' '));
      if(groups.some(group=>group.some(value=>normalize(value)===tail)&&group.some(value=>normalize(tag).includes(normalize(value)))))return words.slice(0,start).join(' ');
    }
    return words.slice(0,-1).join(' ');
  }
  const api = {normalize, forms, groups, matches, tagMatches, categories, inCategory, inWatchStatus, watchLabel, suggestionRemainder, suggestionTerm};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else scope.SearchCore = api;
})(typeof window === 'undefined' ? {} : window);

