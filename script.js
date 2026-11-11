const data = window.PORTFOLIO || {projects:[]};
const grid = document.getElementById('projectGrid');
function render(category='all') {
 const items=data.projects.filter(p=>category==='all'||p.category===category);
 grid.innerHTML=items.length?items.map((p,i)=>`<article class="project-card"><div class="project-visual"><span class="card-badge">${escapeHTML(p.status)}</span></div><div class="card-content"><span class="card-meta">${escapeHTML(p.version||`PROJECT / ${String(i+1).padStart(3,'0')}`)} · ${escapeHTML(p.category)}</span><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.description)}</p><div class="card-bottom"><span>${p.url?'사용해 보기':'준비 중'}</span>${p.url?`<a href="${safeUrl(p.url)}" target="_blank" rel="noopener noreferrer">프로젝트 보기 ↗</a>`:'<span>COMING SOON ↗</span>'}</div></div></article>`).join(''):'<div class="empty">아직 이 분야에 공개된 프로젝트가 없어요.<br>새로운 제작 기록을 준비하고 있습니다.</div>';
}
function escapeHTML(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function safeUrl(url){try{let u=new URL(url);return ['https:','http:'].includes(u.protocol)?escapeHTML(u.href):'#'}catch{return '#'}}
document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active');render(btn.dataset.filter)}));
const notion = document.getElementById('notionLink');if(data.notion){notion.href=safeUrl(data.notion);notion.target='_blank';notion.rel='noopener noreferrer'}else{notion.textContent='노션 포트폴리오 준비 중 ↗'}
const contact = document.getElementById('contactLink');if(data.email){contact.href='mailto:'+encodeURIComponent(data.email)}else{contact.href='#about';contact.textContent='연락처 준비 중 ↗'}
const menuBtn=document.getElementById('menuBtn');menuBtn.addEventListener('click',()=>{let nav=document.querySelector('.topbar nav');nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',nav.classList.contains('open'))});document.querySelectorAll('.topbar nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.topbar nav').classList.remove('open')));
render();
