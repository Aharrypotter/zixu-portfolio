'use strict';
function filterPRs(items, {query='',repo='all',status='active',sort='updated'}={}) {
  const tokens=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return items.filter(p=>(repo==='all'||p.repo===repo)&&(status==='all'||(status==='active'?p.status!=='closed':p.status===status))&&tokens.every(t=>`${p.title} ${p.repo} #${p.number} ${p.author} ${p.explanation?Object.values(p.explanation).filter(Array.isArray).flat().join(' '):''}`.toLocaleLowerCase().includes(t))).sort((a,b)=>(sort==='created'?b.createdAt.localeCompare(a.createdAt):b.updatedAt.localeCompare(a.updatedAt))||b.id-a.id);
}
if(typeof module!=='undefined')module.exports={filterPRs};
if(typeof document!=='undefined'){
const $=s=>document.querySelector(s), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initial=new URLSearchParams(location.search);
let lang=initial.get('lang')==='en'?'en':'zh',data=null,page=1;
const state={query:initial.get('q')||'',repo:initial.get('repo')||'all',status:['active','all','merged','open','draft','closed'].includes(initial.get('status'))?initial.get('status'):'active',sort:initial.get('sort')==='created'?'created':'updated'};
const labels={active:['默认（隐藏未合并关闭）','Default (hide closed unmerged)'],all:['全部状态','All statuses'],merged:['已合并','Merged'],open:['开放中','Open'],draft:['草稿','Draft'],closed:['未合并关闭','Closed unmerged']};
const tr=(zh,en)=>lang==='zh'?zh:en;
function syncURL(){const url=new URL(location.href);for(const [k,v] of Object.entries({q:state.query,repo:state.repo==='all'?'':state.repo,status:state.status==='active'?'':state.status,sort:state.sort==='updated'?'':state.sort,lang:lang==='en'?'en':''})){if(v)url.searchParams.set(k,v);else url.searchParams.delete(k);}history.replaceState(null,'',url);}
function options(){
 const repos=data?[...new Set(data.items.map(p=>p.repo))].sort():[];
 $('#pr-repo').innerHTML=`<option value="all">${tr('全部仓库','All repositories')}</option>`+repos.map(r=>`<option value="${esc(r)}">${esc(r)} (${data.items.filter(p=>p.repo===r).length})</option>`).join('');
 $('#pr-status').innerHTML=Object.entries(labels).map(([k,v])=>`<option value="${k}">${v[lang==='zh'?0:1]}</option>`).join('');
 $('#pr-sort').innerHTML=`<option value="updated">${tr('最近更新','Recently updated')}</option><option value="created">${tr('最近创建','Recently created')}</option>`;
 if(data&&!repos.includes(state.repo))state.repo='all';
 $('#pr-search').value=state.query;$('#pr-repo').value=state.repo;$('#pr-status').value=state.status;$('#pr-sort').value=state.sort;
}
function explain(p){
 const e=p.explanation;if(!e)return `<p class="pr-explanation-pending">${tr('这条 PR 的讲解尚待补充。','Explanation pending for this PR.')}</p>`;
 const i=lang==='zh'?0:1;
 const files=e.testFiles.length?e.testFiles.map(f=>`<li><code>${esc(f)}</code></li>`).join(''):`<li>${tr('本次改动文件中未列出独立测试文件；以 PR 中的验证说明为准。','No dedicated test file was listed in this change; consult the PR validation notes.')}</li>`;
 return `<p class="pr-explanation-summary">${esc(e.problem[i])}</p><details class="pr-explanation"><summary>${tr('阅读这条 PR 的讲解','Read the PR explanation')}</summary><h3>${tr('改动与思路','Approach & changes')}</h3><p>${esc(e.change[i])}</p><h3>${tr('验证与适用边界','Validation & scope')}</h3><p>${esc(e.scope[i])}</p><h3>${tr('验证线索','Verification pointers')}</h3><ul>${files}</ul><p class="pr-explanation-source">${tr('根据公开 PR 描述与改动文件整理；测试及性能为 PR 作者报告，本页未重新运行。','Based on the public PR description and changed files. Tests and performance are author-reported, not rerun for this page.')}<br>${tr('解读日期','Reviewed')}: ${esc(e.reviewedAt.slice(0,10))} · HEAD <code>${esc(e.sourceHead.slice(0,10))}</code></p><a class="pr-source-link" href="${esc(e.source)}/files" target="_blank" rel="noopener noreferrer">${tr('查看原始改动与测试 ↗','View original changes & tests ↗')}</a></details>`;
}
function render(){
 if(!data)return;
 const all=data.items,filtered=filterPRs(all,state),pages=Math.max(1,Math.ceil(filtered.length/20));page=Math.min(page,pages);
 $('#pr-stats').innerHTML=[['默认展示','Shown by default',all.filter(p=>p.status!=='closed').length],['已合并','Merged',all.filter(p=>p.status==='merged').length],['开放中','Open',all.filter(p=>p.status==='open').length],['草稿','Draft',all.filter(p=>p.status==='draft').length],['贡献仓库','Repositories',new Set(all.filter(p=>p.status!=='closed').map(p=>p.repo)).size]].map(([zh,en,n])=>`<div class="pr-stat"><strong>${n}</strong><span>${tr(zh,en)}</span></div>`).join('');
 const stamp=new Intl.DateTimeFormat(lang==='zh'?'zh-CN':'en-GB',{timeZone:'Asia/Shanghai',dateStyle:'medium',timeStyle:'short'}).format(new Date(data.fetchedAt));
 $('#pr-snapshot').textContent=tr(`数据快照：${stamp}（UTC+08）· 状态以 GitHub 原始记录为准；PR 数量不代表工作复杂度。`,`Snapshot: ${stamp} (UTC+08). Follow GitHub links for current status; PR count does not measure complexity.`);
 const hiddenNote=state.status==='active'?tr(' · 已隐藏未合并关闭的 PR',' · Closed unmerged PRs hidden'):'';
 $('#pr-count').textContent=tr(`${filtered.length} 条符合条件 · 共 ${all.length} 条公开 PR`,`${filtered.length} matching · ${all.length} public PRs in total`)+hiddenNote;
 $('#pr-results').innerHTML=filtered.slice((page-1)*20,page*20).map(p=>`<article class="pr-row"><span class="pr-badge ${p.status}">${labels[p.status][lang==='zh'?0:1]}</span><div><span class="pr-repository">${esc(p.repo)} · #${p.number}</span><h2><a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.title)} ↗</a></h2><p class="pr-author">@${esc(p.author)}</p>${explain(p)}</div><time class="pr-date" datetime="${esc(p.updatedAt)}"><span>${tr('最近更新','Updated')}</span>${p.updatedAt.slice(0,10)}</time></article>`).join('')||`<p class="pr-empty">${tr('没有匹配的 PR。试试其他关键词、仓库或状态，也可以重置筛选。','No matching PRs. Try another search, repository or status, or reset the filters.')}</p>`;
 $('#pr-page').textContent=tr(`第 ${page} / ${pages} 页`,`Page ${page} / ${pages}`);$('#pr-prev').disabled=page<=1;$('#pr-next').disabled=page>=pages;
}
function applyLanguage(){document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.querySelectorAll('[data-zh]').forEach(e=>e.innerHTML=e.dataset[lang]);$('#language').textContent=lang==='zh'?'EN':'中';$('#language').setAttribute('aria-label',tr('Switch to English','切换为中文'));$('#pr-search').placeholder=tr('标题 / 仓库 / 编号 / 讲解','Title / repo / number / explanation');options();render();}
async function load(){
 $('#pr-error').hidden=true;$('#pr-results').setAttribute('aria-busy','true');const hiddenNote=state.status==='active'?tr(' · 已隐藏未合并关闭的 PR',' · Closed unmerged PRs hidden'):'';
 $('#pr-count').textContent=tr('正在加载公开记录…','Loading public records…');
 try{const [response,notesResponse]=await Promise.all([fetch('prs.json'),fetch('pr-explanations.json')]);if(!response.ok||!notesResponse.ok)throw new Error('Unable to load PR data');const next=await response.json(),notes=await notesResponse.json();if(!notes.byPR)throw new Error('Invalid explanations');if(!Array.isArray(next.items)||next.count!==next.items.length)throw new Error('Invalid snapshot');for(const p of next.items){if(!Object.hasOwn(labels,p.status)||['all','active'].includes(p.status)||!/^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+$/.test(p.url))throw new Error('Invalid record');}for(const p of next.items)p.explanation=notes.byPR[`${p.repo}#${p.number}`]||null;data=next;options();render();}
 catch(error){$('#pr-error').hidden=false;const hiddenNote=state.status==='active'?tr(' · 已隐藏未合并关闭的 PR',' · Closed unmerged PRs hidden'):'';
 $('#pr-count').textContent=tr('贡献记录加载失败','Unable to load contributions');}
 finally{$('#pr-results').setAttribute('aria-busy','false');}
}
for(const [id,key,event] of [['#pr-search','query','input'],['#pr-repo','repo','change'],['#pr-status','status','change'],['#pr-sort','sort','change']])$(id).addEventListener(event,e=>{state[key]=e.target.value;page=1;render();syncURL();});
$('#pr-reset').addEventListener('click',()=>{Object.assign(state,{query:'',repo:'all',status:'active',sort:'updated'});page=1;options();render();syncURL();});
$('#pr-prev').addEventListener('click',()=>{page=Math.max(1,page-1);render();$('#pr-count').scrollIntoView({block:'center'});});
$('#pr-next').addEventListener('click',()=>{page++;render();$('#pr-count').scrollIntoView({block:'center'});});
$('#language').addEventListener('click',()=>{lang=lang==='zh'?'en':'zh';applyLanguage();syncURL();});$('#pr-retry').addEventListener('click',load);applyLanguage();load();
}
