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

// 작품을 추가하면 전체 개수도 자동으로 갱신됩니다.
document.querySelector('#totalCount').textContent = cards.length;
updateTools();
const contactForm = document.querySelector('#contactForm');
const statusLine = document.querySelector('#contactStatus');
const sendButton = document.querySelector('#sendIdea');
const emailAddress = 'yoon76971@naver.com';
let contactBusy = false;
document.querySelector('#copyEmail').addEventListener('click', async event=>{
 const button=event.currentTarget;
 try{await navigator.clipboard.writeText(emailAddress);button.textContent='복사했어요';}
 catch{statusLine.textContent='메일 주소를 선택해 복사해 주세요: '+emailAddress;}
});
contactForm.addEventListener('submit', async event=>{
 event.preventDefault();
 if(contactBusy || !contactForm.reportValidity()) return;
 contactBusy=true;sendButton.disabled=true;sendButton.textContent='전송 중…';
 statusLine.textContent='메일을 보내고 있어요. 잠시만 기다려 주세요.';
 statusLine.dataset.state='pending';
 const data=Object.fromEntries(new FormData(contactForm));
 
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),25000);
 try{
  const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal});
  const result=await response.json().catch(()=>({}));
  if(!response.ok || !result.ok){
   const message=result.code==='NOT_CONFIGURED'?'현재 문의 전송을 준비 중이에요. 잠시 후 다시 이용해 주세요.':result.message || '지금은 전송하지 못했어요. 입력한 내용은 유지되니 잠시 후 다시 시도해 주세요.';
   throw new Error(message);
  }
  statusLine.dataset.state='success';
  statusLine.textContent='메일 전송을 접수했어요. 소중한 의견 감사합니다!';
  contactForm.reset();
 }catch(error){
  statusLine.dataset.state='error';
  statusLine.textContent=error.name==='AbortError'?'전송 결과를 확인하지 못했어요. 중복 전송을 피하려면 잠시 기다린 후 다시 확인해 주세요.':error instanceof TypeError?'서버에 연결하지 못했어요. 인터넷 연결을 확인한 후 다시 시도해 주세요.':error.message;
 }finally{
  clearTimeout(timeout);contactBusy=false;sendButton.disabled=false;sendButton.innerHTML='전송하기 <span aria-hidden="true">→</span>';
 }
});
