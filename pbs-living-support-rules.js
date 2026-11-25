/* Local rule-based suggestions, not a clinical assessment or AI inference. */
(function(root){
"use strict";
const rules=[
{re:/休息卡|休息圖卡/,easy:"我需要休息時，可以拿出休息卡。",condition:"在本人表示需要休息的情境中，出示休息卡；照顧者確認需求並提供適當休息。"},
{re:/溝通卡|需求卡/,easy:"我可以用卡片表達我的需要。",condition:"在有表達需求的機會時，使用約定的溝通卡；照顧者回應本人表達的需求。"},
{re:/等待卡/,easy:"我可以用等待卡。",condition:"在確實需要等待且本人理解約定的情境中，使用等待卡。等待長度由團隊依能力另行設定。"},
{re:/求助卡/,easy:"我需要幫忙時，可以拿出求助卡。",condition:"在需要協助時出示求助卡；照顧者提供適當協助。"},
{re:/刷牙/,easy:"我會刷牙。",condition:"在約定的盥洗時段，依個別能力完成約定的刷牙步驟。"},
{re:/收拾餐具|收好餐具/,easy:"我會收好餐具。",condition:"用餐後將約定的餐具放到指定位置。"}
];
const activities={ "起床":["我起床。","在約定時段依個別能力起床。"],"刷牙、洗臉":["我刷牙、洗臉。","依約定完成刷牙及洗臉。"],"吃早餐":["我吃早餐。","依本人需求與意願參與早餐活動；不以食量作為達成條件。"],"整理餐具":["我整理餐具。","將約定餐具放到指定位置。"],"準備就寢":["我準備睡覺。","依約定完成睡前準備，不要求立即入睡。"],"拿取牙刷":["我拿牙刷。","拿取自己的牙刷。"],"擠牙膏":["我擠牙膏。","依約定用量將牙膏擠到牙刷上。"],"刷牙":["我刷牙。","依個別能力完成約定的刷牙步驟。"],"清洗牙刷":["我洗牙刷。","依約定清洗牙刷。"]};
function suggest(g){if(Object.hasOwn(activities,g)){const [easy,condition]=activities[g];return {easy,condition,warning:"已提供規則式建議，請依本人能力及意願確認。"};}const warning=[];if(/不可以|不得|禁止|不要|不能|不准|不哭|不打人|不尖叫|不發脾氣/.test(g))warning.push("此目標含禁止或抑制語句。請改寫為本人可以學習的正向替代行為，確認其符合實際需求。");if(/乖|聽話|配合|情緒穩定|表現良好|控制情緒/.test(g))warning.push("此目標可能過於抽象，請說明可觀察的動作及達成條件。");const hits=rules.filter(r=>r.re.test(g));const match=warning.length===0&&hits.length===1?hits[0]:null;return {easy:match?match.easy:g,condition:match?match.condition:"",warning:warning.length?warning.join(" "):match?"已提供規則式建議，請確認與原目標及個人能力一致。":"未找到適用的規則，請自行確認易讀短句及達成條件。"};}
root.PBSLivingRules=Object.freeze({suggest});
})(globalThis);