/* AML Lab 2 navigation: opt-in preview only; does not touch article navigation or content. */
(function(){
"use strict";
const base="/tools-v2-preview.html";
const items=[["","互動實驗室總覽",""],["#explore","互動探索艙","--explore"],["#challenge","情境挑戰艙",""],["#support","智能支援艙","--support"],["#research","統計實驗艙",""]];
function links(){return items.map(([hash,label,suffix])=>{const a=document.createElement("a");a.href=base+hash;a.textContent=label;a.className="aml-lab-subnav"+(suffix?" aml-lab-subnav"+suffix:"");return a})}
function labHref(a){const href=a.getAttribute("href")||"";return /^\/(?:tools(?:\.html)?|tools-v2-preview\.html)(?:#.*)?$/.test(href)}
function apply(){
if(!document.body.hasAttribute("data-aml-lab-v2-preview"))return;
document.querySelectorAll(".aml-desktop-links").forEach(root=>{
const group=Array.from(root.querySelectorAll(".aml-nav-group")).find(d=>{const s=d.querySelector("summary");return s&&["互動實驗室","Interactive Lab"].includes(s.textContent.trim())});
if(group){const panel=group.querySelector(".aml-nav-panel");if(panel){panel.replaceChildren(...links());group.setAttribute("data-aml-lab-nav","true")}}
});
document.querySelectorAll(".aml-mobile-menu").forEach(menu=>{
const label=Array.from(menu.querySelectorAll(".aml-mobile-label")).find(el=>["互動實驗室","Interactive Lab"].includes(el.textContent.trim()));if(!label)return;
let node=label.nextElementSibling;while(node&&!node.classList.contains("aml-mobile-label")){const next=node.nextElementSibling;if(node.tagName==="A"&&labHref(node))node.remove();node=next}label.after(...links())
});
document.querySelectorAll(".aml-global-footer .aml-footer-group").forEach(group=>{const h=group.querySelector("h3,h4");if(!h||!["學習與互動","互動實驗室","Interactive Lab"].includes(h.textContent.trim()))return;const old=Array.from(group.querySelectorAll("a")).filter(labHref);if(!old.length)return;old[0].before(...links());old.forEach(a=>a.remove())});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});else apply();
})();
