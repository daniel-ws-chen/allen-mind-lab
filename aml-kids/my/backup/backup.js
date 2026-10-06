const BACKUP_FORMAT='aml-kids-backup';
const BACKUP_VERSION=1;
const MAX_FILE_BYTES=1024*1024;

const exportButton=document.getElementById('exportButton');
const importButton=document.getElementById('importButton');
const backupFile=document.getElementById('backupFile');
const confirmImport=document.getElementById('confirmImport');
const importPreview=document.getElementById('importPreview');
const statusBox=document.getElementById('statusBox');

let pendingBackup=null;

function amlKidsStorage(){
  const storage={};
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(key&&key.startsWith('amlKids')) storage[key]=localStorage.getItem(key);
  }
  return storage;
}

function updateSummary(){
  const storage=amlKidsStorage();
  document.getElementById('backupKeyCount').textContent=Object.keys(storage).length;
  document.getElementById('backupPoints').textContent=Number(localStorage.getItem('amlKidsRewardWalletV1')||0).toLocaleString();
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

exportButton.addEventListener('click',()=>{
  const storage=amlKidsStorage();
  const payload={
    format:BACKUP_FORMAT,
    formatVersion:BACKUP_VERSION,
    catalogVersion:window.AML_KIDS_CATALOG?.version||null,
    createdAt:new Date().toISOString(),
    storage
  };
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;
  link.download='aml-kids-backup-'+dateStamp()+'.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),0);
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
  if(entries.some(([key,value])=>!key.startsWith('amlKids')||(value!==null&&typeof value!=='string'))) return '備份檔含有不允許的資料鍵或資料格式。';
  return '';
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
    importPreview.hidden=false;
    const createdText=created&&!Number.isNaN(created.getTime())?created.toLocaleString('zh-TW'):'未知';
    importPreview.innerHTML='<span>備份時間：<strong>'+createdText+'</strong></span><span>資料筆數：<strong>'+count+'</strong></span><span>Catalog 版本：<strong>'+(data.catalogVersion??'未知')+'</strong></span>';
    setStatus('備份檔已通過格式檢查。確認後即可匯入。','warning');
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
    entries.forEach(([key,value])=>{
      if(value===null) localStorage.removeItem(key);
      else localStorage.setItem(key,value);
    });
    setStatus('匯入完成，共恢復 '+entries.length+' 筆 AML Kids 學習資料。回到 My AML Kids 即可查看。','success');
    updateSummary();
    resetImport();
    backupFile.value='';
  }catch{
    setStatus('匯入時發生錯誤，部分資料可能尚未完成寫入。請保留原備份檔。','error');
  }
});

updateSummary();
