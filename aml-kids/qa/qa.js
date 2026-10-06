const catalog=window.AML_KIDS_CATALOG;
const results=[];

function add(status,title,detail){
  results.push({status,title,detail});
}
function readArray(key){
  const raw=localStorage.getItem(key);
  if(raw===null) return {ok:true,value:[]};
  try{
    const value=JSON.parse(raw);
    return Array.isArray(value)?{ok:true,value}:{ok:false,value:[]};
  }catch{
    return {ok:false,value:[]};
  }
}
function readJson(key){
  const raw=localStorage.getItem(key);
  if(raw===null) return {ok:true,value:null};
  try{return {ok:true,value:JSON.parse(raw)};}catch{return {ok:false,value:null};}
}

if(!catalog||!Array.isArray(catalog.units)){
  add('fail','共用 Catalog 無法讀取','請檢查 kids-catalog.js 是否正常載入。');
}else{
  const expectedUnits=Number(catalog.totalUnits||catalog.units.length);
  add(catalog.units.length===expectedUnits?'pass':'fail','Catalog 單元數',catalog.units.length+' 個單元；Catalog 基準為 '+expectedUnits+'。');

  const requiredMeta=['stage','grade','semester','subject','publisher','version','unit','title','url','awards','mistakes','resume'];
  const missingMeta=catalog.units.filter(u=>requiredMeta.some(k=>u[k]===undefined||u[k]===''));
  add(missingMeta.length===0?'pass':'fail','Catalog v2 學習脈絡',missingMeta.length===0?'教育階段、年級、學期、科目、出版社與版本資料完整。':missingMeta.length+' 個單元缺少跨學段 metadata。');

  const scope=catalog.currentScope;
  if(scope&&scope.stage&&scope.grade&&scope.semester){
    add('pass','目前學習範圍',(scope.label||scope.stage+scope.grade+scope.semester)+'。');
  }else{
    add('warn','目前學習範圍','currentScope 尚未完整設定。');
  }

  const urls=catalog.units.map(u=>u.url);
  add(new Set(urls).size===urls.length?'pass':'fail','Catalog 單元網址唯一性',new Set(urls).size===urls.length?'沒有重複網址。':'發現重複單元網址。');

  let parseErrors=0;
  let totalAwards=0;
  let totalMistakes=0;
  let pendingMistakes=0;

  catalog.units.forEach(unit=>{
    const awards=readArray(unit.awards);
    const mistakes=readArray(unit.mistakes);
    const resume=readJson(unit.resume);
    if(!awards.ok||!mistakes.ok||!resume.ok) parseErrors++;

    const awardSet=new Set(awards.value);
    totalAwards+=awardSet.size;
    totalMistakes+=mistakes.value.length;
    pendingMistakes+=mistakes.value.filter(m=>!awardSet.has(m.id)).length;
  });

  add(parseErrors===0?'pass':'fail','學習紀錄格式',parseErrors===0?catalog.units.length+' 個單元的 localStorage 紀錄都可正常解析。':parseErrors+' 個單元有無法解析的紀錄。');

  const wallet=Number(localStorage.getItem('amlKidsRewardWalletV1')||0);
  const expected=totalAwards*5;
  if(wallet===expected){
    add('pass','學習點數一致性','目前 '+wallet+' 點，與 '+totalAwards+' 題已領取 × 5 點一致。');
  }else if(wallet===0&&totalAwards===0){
    add('pass','學習點數一致性','目前尚未產生作答紀錄。');
  }else{
    add('warn','學習點數一致性','目前錢包為 '+wallet+' 點；依已領取題目推算為 '+expected+' 點。若曾使用早期測試版本，可能出現歷史差異。');
  }

  add('pass','錯題彙整','共記錄 '+totalMistakes+' 題曾答錯，其中 '+pendingMistakes+' 題仍待訂正。');

  const recent=readJson('amlKidsLastActivityV1');
  if(!recent.ok){
    add('fail','最近學習紀錄','最近學習紀錄無法解析。');
  }else if(!recent.value){
    add('warn','最近學習紀錄','目前還沒有最近學習紀錄；實際作答一題後再回來檢查。');
  }else{
    const path=recent.value.path||'';
    const unit=catalog.units.find(u=>u.url===path||u.url.replace(/\/$/,'')===path.replace(/\/$/,''));
    if(!unit){
      add('warn','最近學習路徑','最近路徑「'+path+'」不在目前 Catalog 中。');
    }else{
      const q=recent.value.questionId||'';
      const qOk=!q||/^q(?:0?[1-9]|[1-4]\d|50)$/.test(q);
      add(qOk?'pass':'warn','最近學習定位',unit.subject+'｜'+unit.title+(q?'｜'+q:'')+(qOk?'':'；題號格式需要確認。'));
    }
  }
}

const counts={pass:0,warn:0,fail:0};
const wrap=document.getElementById('qaList');
results.forEach(r=>{
  counts[r.status]++;
  const item=document.createElement('article');
  item.className='qa-item '+r.status;
  const title=document.createElement('strong');
  title.textContent=(r.status==='pass'?'✓ ':r.status==='warn'?'△ ':'✕ ')+r.title;
  const detail=document.createElement('span');
  detail.textContent=r.detail;
  item.append(title,detail);
  wrap.appendChild(item);
});
document.getElementById('passCount').textContent=counts.pass;
document.getElementById('warnCount').textContent=counts.warn;
document.getElementById('failCount').textContent=counts.fail;
