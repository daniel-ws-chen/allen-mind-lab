const BACKUP_FORMAT='aml-kids-backup';
const BACKUP_VERSION=1;
const MAX_FILE_BYTES=1024*1024;
const RESTORE_POINT_KEY='amlKidsBackupRestorePointV1';

const exportButton=document.getElementById('exportButton');
const importButton=document.getElementById('importButton');
const undoImportButton=document.getElementById('undoImportButton');
const backupFile=document.getElementById('backupFile');
const confirmImport=document.getElementById('confirmImport');
const importPreview=document.getElementById('importPreview');
const statusBox=document.getElementById('statusBox');

let pendingBackup=null;

function parseStoredArray(raw){
  if(raw===null||raw===undefined) return [];
  try{
    const value=JSON.parse(raw);
    return Array.isArray(value)?value:[];
  }catch{return [];}
}
function learningSummary(storage){
  const units=window.AML_KIDS_CATALOG?.units||[];
  let activeUnits=0;
  let pendingMistakes=0;
  units.forEach(unit=>{
    const awards=new Set(parseStoredArray(storage[unit.awards]??null));
    const mistakes=parseStoredArray(storage[unit.mistakes]??null);
    if(awards.size||mistakes.length) activeUnits++;
    pendingMistakes+=mistakes.filter(item=>!awards.has(item.id)).length;
  });
  const points=Number(storage.amlKidsRewardWalletV1||0);
  return {activeUnits,pendingMistakes,points:Number.isFinite(points)?points:0};
}

function amlKidsStorage({includeRestorePoint=false}={}){
  const storage={};
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(!key||!key.startsWith('amlKids')) continue;
    if(!includeRestorePoint&&key===RESTORE_POINT_KEY) continue;
    storage[key]=localStorage.getItem(key);
  }
  return storage;
}

function updateSummary(){
  const storage=amlKidsStorage();
  const summary=learningSummary(storage);
  document.getElementById('backupKeyCount').textContent=Object.keys(storage).length;
  document.getElementById('backupPoints').textContent=summary.points.toLocaleString();
  document.getElementById('backupActiveUnits').textContent=summary.activeUnits.toLocaleString();
  document.getElementById('backupPendingMistakes').textContent=summary.pendingMistakes.toLocaleString();
  undoImportButton.disabled=!localStorage.getItem(RESTORE_POINT_KEY);
}

function setStatus(message,kind=''){
  statusBox.textContent=message;
  statusBox.dataset.kind=kind;
}

function dateStamp(){
  const d=new Date();
  const pad=n=>String(n).padStart(2,'0');
  return d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'-'+pad(d.getHours())+pad(d.getMinutes());
}

function makePayload(storage){
  return {
    format:BACKUP_FORMAT,
    formatVersion:BACKUP_VERSION,
    catalogVersion:window.AML_KIDS_CATALOG?.version||null,
    createdAt:new Date().toISOString(),
    storage
  };
}

function downloadPayload(payload,filename){
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;
  link.download=filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),0);
}

exportButton.addEventListener('click',()=>{
  const storage=amlKidsStorage();
  const payload=makePayload(storage);
  downloadPayload(payload,'aml-kids-backup-'+dateStamp()+'.json');
  setStatus('備份檔已建立，共包含 '+Object.keys(storage).length+' 筆 AML Kids 本機資料。','success');
});

function resetImport(){
  pendingBackup=null;
  importPreview.hidden=true;
  importPreview.textContent='';
  confirmImport.checked=false;
  importButton.disabled=true;
}

function validBackup(data){
  if(!data||data.format!==BACKUP_FORMAT||data.formatVersion!==BACKUP_VERSION) return '這不是目前支援的 AML Kids 備份格式。';
  if(!data.storage||typeof data.storage!=='object'||Array.isArray(data.storage)) return '備份檔缺少有效的 storage 資料。';
  const entries=Object.entries(data.storage);
  if(entries.length>500) return '備份檔包含過多資料，已停止匯入。';
  if(entries.some(([key,value])=>!key.startsWith('amlKids')||key===RESTORE_POINT_KEY||(value!==null&&typeof value!=='string'))) return '備份檔含有不允許的資料鍵或資料格式。';
  return '';
}

function createRestorePoint(){
  const snapshot={
    createdAt:new Date().toISOString(),
    storage:amlKidsStorage()
  };
  localStorage.setItem(RESTORE_POINT_KEY,JSON.stringify(snapshot));
}

function clearCurrentAmlKidsData(){
  const keys=[];
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(key&&key.startsWith('amlKids')&&key!==RESTORE_POINT_KEY) keys.push(key);
  }
  keys.forEach(key=>localStorage.removeItem(key));
}

backupFile.addEventListener('change',async()=>{
  resetImport();
  const file=backupFile.files?.[0];
  if(!file) return;
  if(file.size>MAX_FILE_BYTES){
    setStatus('備份檔超過 1 MB，為安全起見不進行讀取。','error');
    return;
  }
  try{
    const data=JSON.parse(await file.text());
    const error=validBackup(data);
    if(error){
      setStatus(error,'error');
      return;
    }
    pendingBackup=data;
    const count=Object.keys(data.storage).length;
    const created=data.createdAt?new Date(data.createdAt):null;
    const summary=learningSummary(data.storage);
    const currentCatalogVersion=window.AML_KIDS_CATALOG?.version??null;
    const catalogMismatch=data.catalogVersion!=null&&currentCatalogVersion!=null&&Number(data.catalogVersion)!==Number(currentCatalogVersion);
    importPreview.hidden=false;
    const createdText=created&&!Number.isNaN(created.getTime())?created.toLocaleString('zh-TW'):'未知';
    importPreview.innerHTML=
      '<span>備份時間：<strong>'+createdText+'</strong></span>'+
      '<span>資料筆數：<strong>'+count+'</strong></span>'+
      '<span>學習點數：<strong>'+summary.points.toLocaleString()+'</strong></span>'+
      '<span>有學習紀錄：<strong>'+summary.activeUnits+' 個單元</strong></span>'+
      '<span>待訂正：<strong>'+summary.pendingMistakes+' 題</strong></span>'+
      '<span>Catalog 版本：<strong>'+(data.catalogVersion??'未知')+'</strong></span>'+
      (catalogMismatch?'<span class="backup-warning"><strong>版本提醒：</strong>這份備份建立於 Catalog v'+data.catalogVersion+'，目前網站為 v'+currentCatalogVersion+'。仍可匯入，但匯入後建議回 My AML Kids 檢查進度。</span>':'');
    setStatus(catalogMismatch?'備份檔格式有效，但 Catalog 版本不同；請確認預覽後再匯入。':'備份檔已通過格式檢查。確認後即可匯入。','warning');
  }catch{
    setStatus('無法讀取這個 JSON 備份檔。','error');
  }
});

confirmImport.addEventListener('change',()=>{
  importButton.disabled=!(pendingBackup&&confirmImport.checked);
});

importButton.addEventListener('click',()=>{
  if(!pendingBackup||!confirmImport.checked) return;
  const entries=Object.entries(pendingBackup.storage);
  try{
    createRestorePoint();
    entries.forEach(([key,value])=>{
      if(value===null) localStorage.removeItem(key);
      else localStorage.setItem(key,value);
    });
    setStatus('匯入完成，共恢復 '+entries.length+' 筆 AML Kids 學習資料。已保留一份匯入前還原點。','success');
    updateSummary();
    resetImport();
    backupFile.value='';
  }catch{
    setStatus('匯入時發生錯誤，部分資料可能尚未完成寫入。請保留原備份檔。','error');
  }
});

undoImportButton.addEventListener('click',()=>{
  const raw=localStorage.getItem(RESTORE_POINT_KEY);
  if(!raw) return;
  try{
    const snapshot=JSON.parse(raw);
    if(!snapshot||typeof snapshot.storage!=='object'||Array.isArray(snapshot.storage)) throw new Error('bad restore point');
    const entries=Object.entries(snapshot.storage);
    if(entries.some(([key,value])=>!key.startsWith('amlKids')||key===RESTORE_POINT_KEY||(value!==null&&typeof value!=='string'))) throw new Error('bad restore point');
    clearCurrentAmlKidsData();
    entries.forEach(([key,value])=>{
      if(value!==null) localStorage.setItem(key,value);
    });
    localStorage.removeItem(RESTORE_POINT_KEY);
    setStatus('已復原到上次匯入前的 AML Kids 學習狀態。','success');
    updateSummary();
  }catch{
    setStatus('匯入前還原點無法使用，未進行復原。','error');
  }
});

updateSummary();
