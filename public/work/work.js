// Shared project narratives live in ../script.js. Each record can belong to multiple fields.
const categories = [
  ['all','全部项目','All projects'], ['open-source','开源','Open source'],
  ['compiler','编译器','Compilers'], ['inference','推理框架','Inference'],
  ['kernel','Kernel 优化','Kernel optimization'], ['dsl','DSL','DSL']
];
const resourceTypes = [['all','全部链接','All links'],['github','GitHub','GitHub'],['pr','Pull Request','Pull request'],['article','技术文章','Articles'],['wechat','公众号','WeChat']];
const workMeta = {
  dsl:{categories:['compiler','dsl'],status:['实习研发','Internship R&D'],role:['智源 · AI 编译器研发实习 / 2026.05—至今','BAAI · AI compiler research intern / May 2026–present'],result:['布局组合、编译期验证与 CUDA 降级；以真实算子验证语言接口。','Composable layouts, compile-time verification and CUDA lowering, exercised by real kernels.']},
  lightning:{categories:['open-source','kernel','dsl'],merged:true,status:['核心 PR 已合并','Core PR merged'],role:['CuTe DSL SM90 后端实现与性能验证','CuTe DSL SM90 backend implementation and performance validation'],result:['Lightning Attention PR #111 已合并；指定 H20 BF16 prefill 测试集相对 FLA 几何平均加速 2.89×。','Lightning Attention PR #111 merged; 2.89× geometric-mean speedup over FLA on the specified H20 BF16 prefill suite.'],repo:['cuLA','https://github.com/inclusionAI/cuLA']},
  tvm:{categories:['open-source','compiler'],merged:true,status:['34 个 PR 已合并','34 merged PRs'],role:['Apache TVM 开源贡献 · 前端语义与正确性修复','Apache TVM contributor · frontend semantics and correctness'],result:['覆盖模型导入、动态 shape 与量化边界，修复真实模型触发的语义问题。','Closed model-import, dynamic-shape and quantization gaps exposed by real workloads.'],repo:['Apache TVM','https://github.com/apache/tvm']},
  tirx:{categories:['compiler','kernel','dsl'],status:['本地研发','Local R&D'],role:['SM90 异步矩阵计算路径与 Kernel 开发','SM90 asynchronous matrix path and kernel development'],result:['扩展 gemm_async、布局和累加器管理，贯通 WGMMA commit / wait 与 packed GDN prefill。','Extended gemm_async, layouts and accumulator handling, connecting WGMMA commit/wait with packed GDN prefill.']},
  jax:{categories:['open-source','inference'],merged:true,status:['PR #1461 已合并','PR #1461 merged'],role:['运行时升级、分片契约修复与 TPU 后端验证','Runtime migration, sharding-contract fixes and TPU backend validation'],result:['JAX 0.8.1 → 0.10.2；TPU v6e-4 上 Qwen3-8B MMLU 保持 0.725。','JAX 0.8.1 → 0.10.2; Qwen3-8B MMLU maintained at 0.725 on TPU v6e-4.'],repo:['SGLang-JAX','https://github.com/sgl-project/sglang-jax']},
  mobile:{categories:['open-source','inference','kernel'],merged:true,status:['已合并 / 持续贡献','Merged / ongoing contributions'],role:['端侧模型支持、ARM 算子优化与运行时集成','On-device model support, ARM kernel optimization and runtime integration'],result:['Qwen3.5、GDN 与 MiniCPM5 相关贡献已合并；Spark 支持处于评审阶段。','Qwen3.5, GDN and MiniCPM5 contributions merged; Spark support under review.'],repo:['mllm','https://github.com/UbiquitousLearning/mllm']},
  fuzz:{categories:['compiler'],status:['实习项目','Internship project'],role:['先进编译实验室 · C500 / McTVM 验证基础设施','Advanced Compiler Lab · C500 / McTVM validation infrastructure'],result:['约 48 万组用例，修复 3 个 C++ 缺陷；单轮验证由 12 小时缩短至 30 分钟。','Approximately 480,000 cases and three C++ fixes; a validation round reduced from 12 hours to 30 minutes.']}
};
const tvmSource = projects.find(p=>p.id==='tvm');
// Keep GDN links under their own work item, not under the merged Lightning PR.
projects.find(p=>p.id==='lightning').links=projects.find(p=>p.id==='lightning').links.filter(([,url])=>url.endsWith('/111'));
const workItems = projects.flatMap(p=>p.id==='tvm' ? [
  {...p,title:['TVM · 前端语义与量化正确性','TVM · Frontend semantics & quantization'],summary:['让真实模型被正确导入：补齐算子、动态 shape 与量化语义的边界。','Making real models import correctly across operators, dynamic shapes and quantization boundaries.'],body:p.body.map(b=>b.slice(0,2))},
  {id:'tirx',title:['TIRx · SM90 支持与 Kernel 开发','TIRx · SM90 support & kernel development'],summary:['将 Hopper 异步矩阵计算表达为编译器可管理的布局、累加器与执行依赖。','Expressing Hopper asynchronous matrix computation through compiler-managed layouts, accumulators and execution dependencies.'],body:tvmSource.body.map(b=>[b[2]]),note:['本地研发单独呈现，不计入 Apache TVM 已合并 PR 数量；不将本地支持等同于上游发布。','Local R&D is separate from the Apache TVM merged-PR count and is not presented as an upstream release.'],links:[]}
] : [p]).map(p=>({...p,...workMeta[p.id]})).concat(additions);

// Add confirmed articles here: {project:'dsl',type:'wechat'|'article',label:['中文','English'],url:'https://…'}.
// Never use a search page or a placeholder as a published article.
const editorialResources = [];
const resources = workItems.flatMap(p=>[
  ...(p.repo?[{project:p.id,type:'github',label:[p.repo[0],p.repo[0]],url:p.repo[1]}]:[]),
  ...p.links.map(([label,url])=>({project:p.id,type:url.includes('/pull/')?'pr':'github',label:[label,label],url}))
]).concat(editorialResources);
const escapeHTML = value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tr = values=>values[language==='zh'?0:1];
const params = new URLSearchParams(location.search);
let category=categories.some(c=>c[0]===params.get('category'))?params.get('category'):'all';
let resourceType=resourceTypes.some(c=>c[0]===params.get('resource'))?params.get('resource'):'all';
if(params.get('lang')==='en')language='en';
const matches=p=>category==='all'||p.categories.includes(category);
const typeLabel=type=>resourceTypes.find(t=>t[0]===type)[language==='zh'?1:2];
function externalLink(r){
  const url=new URL(r.url);
  if(url.protocol!=='https:')throw new Error('Portfolio resources must use HTTPS');
  return `<a href="${escapeHTML(url.href)}" target="_blank" rel="noopener noreferrer"><small>${escapeHTML(typeLabel(r.type))}</small>${escapeHTML(tr(r.label))} ↗</a>`;
}
function renderWork(){
  document.querySelector('#category-filters').innerHTML=categories.map(([id,zh,en])=>`<button type="button" data-category="${id}" aria-pressed="${id===category}">${language==='zh'?zh:en}<span>${workItems.filter(p=>id==='all'||p.categories.includes(id)).length}</span></button>`).join('');
  const visible=workItems.filter(matches);
  document.querySelector('#result-count').textContent=language==='zh'?`${visible.length} 项工作 · 同一项目可跨领域归类`:`${visible.length} works · Projects may span multiple fields`;
  document.querySelector('#work-list').innerHTML=visible.map(p=>`<article class="work-entry" id="${p.id}" aria-labelledby="title-${p.id}">
    <aside class="work-aside"><div class="work-number">${String(workItems.indexOf(p)+1).padStart(2,'0')}</div><div class="work-domain">${p.categories.map(c=>escapeHTML(categories.find(t=>t[0]===c)[language==='zh'?1:2])).join(' / ')}</div><span class="work-status ${p.merged?'merged':''}">${escapeHTML(tr(p.status))}</span></aside>
    <div><h2 id="title-${p.id}">${escapeHTML(tr(p.title))}</h2><p class="work-summary">${escapeHTML(tr(p.summary))}</p>
    <dl class="entry-facts"><div><dt>${tr(['我的工作','My contribution'])}</dt><dd>${escapeHTML(tr(p.role))}</dd></div><div><dt>${tr(['交付与结果','Deliverables & results'])}</dt><dd>${escapeHTML(tr(p.result))}</dd></div></dl>
    <div class="entry-links">${resources.filter(r=>r.project===p.id).map(externalLink).join('')}</div>
    ${resources.some(r=>r.project===p.id)?'':`<p class="no-public">${tr(['暂无公开代码或文章链接','No public code or article link available.'])}</p>`}
    <details class="work-detail"><summary>${tr(['实现细节与验证边界','Implementation & validation scope'])}</summary>${tr(p.body).map(t=>`<p>${escapeHTML(t)}</p>`).join('')}${(caseNotes[p.id]||[]).map(([heading,body])=>`<h3>${escapeHTML(tr(heading))}</h3><p>${escapeHTML(tr(body))}</p>`).join('')}${p.note?`<p class="evidence-note">${escapeHTML(tr(p.note))}</p>`:''}</details></div></article>`).join('');
  renderResources();
}
function renderResources(){
  const relevant=resources.filter(r=>workItems.some(p=>p.id===r.project&&matches(p)));
  document.querySelector('#resource-filters').innerHTML=resourceTypes.map(([id,zh,en])=>`<button type="button" data-resource="${id}" aria-pressed="${id===resourceType}">${language==='zh'?zh:en}<span>${relevant.filter(r=>id==='all'||r.type===id).length}</span></button>`).join('');
  const visible=relevant.filter(r=>resourceType==='all'||r.type===resourceType);
  document.querySelector('#resource-count').textContent=language==='zh'?`${visible.length} 个链接 · 跟随上方领域筛选`:`${visible.length} links · Scoped to the selected field`;
  document.querySelector('#resources').innerHTML=visible.length?visible.map(r=>{
    const p=workItems.find(p=>p.id===r.project);
    return `<div class="resource-row"><span class="resource-type">${escapeHTML(typeLabel(r.type))}</span><a href="${escapeHTML(r.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(tr(r.label))} ↗</a><a class="resource-project" href="#${p.id}">${escapeHTML(tr(p.title))} ↑</a></div>`;
  }).join(''):`<p class="empty-resources">${resourceType==='wechat'?tr(['公众号文章尚未收录。已公开的实现与评审记录可从 GitHub 和 Pull Request 分类查看。','No WeChat articles listed yet. Public implementation and review records are available under GitHub and Pull Request.']):tr(['当前分类暂无已收录链接。可以切换链接类型或查看全部项目。','No resources listed for this selection. Choose another resource type or browse all projects.'])}</p>`;
}
function syncURL(){const u=new URL(location.href);for(const [key,value] of [['category',category],['resource',resourceType],['lang',language]]){if(value==='all'||(key==='lang'&&value==='zh'))u.searchParams.delete(key);else u.searchParams.set(key,value);}history.replaceState(null,'',u);}
document.querySelector('#category-filters').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;category=b.dataset.category;renderWork();syncURL();document.querySelector(`[data-category="${category}"]`).focus();});
document.querySelector('#resource-filters').addEventListener('click',e=>{const b=e.target.closest('[data-resource]');if(!b)return;resourceType=b.dataset.resource;renderResources();syncURL();document.querySelector(`[data-resource="${resourceType}"]`).focus();});
function applyLanguage(){document.documentElement.lang=language==='zh'?'zh-CN':'en';document.querySelectorAll('[data-zh]').forEach(e=>e.innerHTML=e.dataset[language]);const b=document.querySelector('#language');b.textContent=language==='zh'?'EN':'中';b.setAttribute('aria-label',language==='zh'?'Switch to English':'切换为中文');renderWork();}
document.querySelector('#language').addEventListener('click',()=>{language=language==='zh'?'en':'zh';applyLanguage();syncURL();});
applyLanguage();
// Hashes are stable project permalinks, including on a direct initial visit.
if(location.hash){const target=document.getElementById(location.hash.slice(1));if(target)requestAnimationFrame(()=>target.scrollIntoView());}
