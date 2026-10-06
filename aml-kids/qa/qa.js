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

  const requiredMeta=['stage','grade','semester','subject','publisher','version','unit','title','summary','url','awards','mistakes','resume'];
  const missingMeta=catalog.units.filter(u=>requiredMeta.some(k=>u[k]===undefined||u[k]===''));
  add(missingMeta.length===0?'pass':'fail','Catalog v4 學習脈絡',missingMeta.length===0?'教育階段、年級、學期、科目、出版社、版本與單元摘要資料完整。':missingMeta.length+' 個單元缺少必要 metadata。');

  const scope=catalog.currentScope;
  if(scope&&scope.stage&&scope.grade&&scope.semester){
    add('pass','目前學習範圍',(scope.label||scope.stage+scope.grade+scope.semester)+'。');
  }else{
    add('warn','目前學習範圍','currentScope 尚未完整設定。');
  }

  const urls=catalog.units.map(u=>u.url);
  add(new Set(urls).size===urls.length?'pass':'fail','Catalog 單元網址唯一性',new Set(urls).size===urls.length?'沒有重複網址。':'發現重複單元網址。');

  let parseErrors=0;
  let resumeShapeWarnings=0;
  let mistakeIdWarnings=0;
  let totalAwards=0;
  let totalMistakes=0;
  let pendingMistakes=0;

  catalog.units.forEach(unit=>{
    const awards=readArray(unit.awards);
    const mistakes=readArray(unit.mistakes);
    const resume=readJson(unit.resume);
    if(!awards.ok||!mistakes.ok||!resume.ok) parseErrors++;

    if(resume.ok&&resume.value!==null){
      const validResume=typeof resume.value==='string'||
        (typeof resume.value==='object'&&!Array.isArray(resume.value)&&typeof resume.value.id==='string');
      if(!validResume) resumeShapeWarnings++;
    }

    const awardSet=new Set(awards.value);
    const badMistakes=mistakes.value.filter(m=>!m||typeof m!=='object'||typeof m.id!=='string'||!/^q(?:0?[1-9]|[1-4]d|50)$/.test(m.id));
    mistakeIdWarnings+=badMistakes.length;
    totalAwards+=awardSet.size;
    totalMistakes+=mistakes.value.length;
    pendingMistakes+=mistakes.value.filter(m=>!awardSet.has(m.id)).length;
  });

  add(parseErrors===0?'pass':'fail','學習紀錄格式',parseErrors===0?catalog.units.length+' 個單元的 localStorage 紀錄都可正常解析。':parseErrors+' 個單元有無法解析的紀錄。');
  add(resumeShapeWarnings===0?'pass':'warn','續答定位格式',resumeShapeWarnings===0?'所有已存在的續答紀錄都可辨識。':resumeShapeWarnings+' 個單元的續答資料格式與目前預期不同。');
  add(mistakeIdWarnings===0?'pass':'warn','錯題定位格式',mistakeIdWarnings===0?'所有錯題都有可直接定位的題號。':mistakeIdWarnings+' 筆錯題缺少有效題號，可能無法直接跳回指定題目。');

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

  const scopeKey=localStorage.getItem('amlKidsMyScopeV1');
  const validScopes=new Set(catalog.units.map(u=>[u.stage,u.grade,u.semester].join('|')));
  if(!scopeKey){
    add('warn','My AML Kids 學習範圍','目前尚未儲存偏好的學習範圍，會使用 Catalog 預設範圍。');
  }else{
    add(validScopes.has(scopeKey)?'pass':'warn','My AML Kids 學習範圍',validScopes.has(scopeKey)?'目前選擇的學習範圍存在於 Catalog。':'已儲存的學習範圍不在目前 Catalog 中，頁面會自動回到預設範圍。');
  }

  const amlKeys=[];
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(key&&key.startsWith('amlKids')&&key!=='amlKidsBackupRestorePointV1') amlKeys.push(key);
  }
  add('pass','備份資料範圍','目前有 '+amlKeys.length+' 筆 amlKids 開頭的本機資料可由備份工具處理。');

  const restore=readJson('amlKidsBackupRestorePointV1');
  if(!restore.ok){
    add('warn','匯入還原點','目前還原點無法解析；若要匯入新備份，建議先保留原始備份檔。');
  }else if(restore.value){
    const validRestore=restore.value&&typeof restore.value==='object'&&
      restore.value.storage&&typeof restore.value.storage==='object'&&!Array.isArray(restore.value.storage);
    add(validRestore?'pass':'warn','匯入還原點',validRestore?'目前瀏覽器保留一份可辨識的匯入前還原點。':'目前還原點格式與預期不同。');
  }else{
    add('pass','匯入還原點','目前沒有匯入前還原點；尚未使用復原功能時屬正常狀態。');
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
