const filters = [...document.querySelectorAll('.filter')];
const cards = [...document.querySelectorAll('.project-card')];
const query = document.querySelector('#query');
let category = '전체';
function updateTools(){
 const term = query.value.trim().toLocaleLowerCase();
 let count = 0;
 cards.forEach(card=>{const visible=(category==='전체'||card.dataset.category===category)&&card.dataset.search.toLocaleLowerCase().includes(term);card.hidden=!visible;if(visible)count++;});
 document.querySelector('#resultCount').textContent = term ? `검색 결과 ${count}개` : `${count}개의 작은 도구`;
 document.querySelector('#empty').hidden=count>0;
 document.querySelector('#emptyTitle').textContent=term?'검색 결과가 없어요.':'아직 등록된 도구가 없어요.';
 filters.forEach(button=>{const selected=button.dataset.filter===category;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
}
filters.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.filter;updateTools();}));
query.addEventListener('input',updateTools);
document.querySelector('#resetFilters').addEventListener('click',()=>{category='전체';query.value='';updateTools();});
document.addEventListener('keydown',event=>{if(event.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){event.preventDefault();query.focus();}});
document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.open).showModal()));
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelectorAll('.close').forEach(button=>button.addEventListener('click',()=>dialog.close()));dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});});
