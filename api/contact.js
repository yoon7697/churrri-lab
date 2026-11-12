const RECIPIENT = 'yoon76971@naver.com';
const EMAIL = /^[^\s<>@\r\n]+@[^\s<>@\r\n]+\.[^\s<>@\r\n]+$/;
export function createContactHandler({env=process.env,sendMail,now=Date.now}={}) {
 const recent = new Map();
 return async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  const fail=(status,code,message)=>res.status(status).json({ok:false,code,message});
  if(req.method!=='POST'){res.setHeader('Allow','POST');return fail(405,'METHOD','전송 요청 방식이 올바르지 않아요.');}
  try{
   if(new URL(req.headers.origin).host !== req.headers.host)return fail(403,'ORIGIN','이 사이트의 문의 폼을 이용해 주세요.');
  }catch{return fail(403,'ORIGIN','이 사이트의 문의 폼을 이용해 주세요.');}
  if(!String(req.headers['content-type']||'').includes('application/json'))return fail(415,'CONTENT_TYPE','입력 형식을 확인해 주세요.');
  let body=req.body;
  if(typeof body==='string'){
   if(Buffer.byteLength(body)>16384)return fail(413,'SIZE','내용이 너무 길어요.');
   try{body=JSON.parse(body);}catch{return fail(400,'INPUT','입력 내용을 확인해 주세요.');}
  }
  if(!body||typeof body!=='object'||Array.isArray(body))return fail(400,'INPUT','입력 내용을 확인해 주세요.');
  if(Buffer.byteLength(JSON.stringify(body))>16384)return fail(413,'SIZE','내용이 너무 길어요.');
  if(body.website)return fail(400,'INPUT','입력 내용을 확인해 주세요.');
  const {name='',email,subject,message}=body;
  if([name,email,subject,message].some(value=>typeof value!=='string'))return fail(400,'INPUT','입력 내용을 확인해 주세요.');
  if(name.length>60||email.length>254||subject.length>120||message.length>5000||message.trim().length<5||!subject.trim()||!EMAIL.test(email.trim())||/[\r\n]/.test(name+subject))return fail(400,'INPUT','이메일, 제목, 내용을 다시 확인해 주세요.');
  const user=env.SMTP_USER||RECIPIENT;
  if(!env.NAVER_SMTP_PASSWORD || !EMAIL.test(user))return fail(503,'NOT_CONFIGURED','메일 연결을 준비 중이에요. 메일 앱으로 직접 보내기를 이용해 주세요.');
  const timestamp=now();
  // 서버 인스턴스 단위의 기본 중복 방지입니다. 분산 봇 차단을 대체하지 않습니다.
  for(const [key,time] of recent)if(timestamp-time>=60000)recent.delete(key);
  const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
  if(recent.has(ip))return fail(429,'RATE_LIMIT','잠시 후 다시 보내주세요. 같은 기기에서는 1분 간격으로 보낼 수 있어요.');
  if(recent.size>=1000)return fail(429,'RATE_LIMIT','요청이 많아요. 잠시 후 다시 보내주세요.');
  recent.set(ip,timestamp);
  try{
   let send=sendMail;
   if(!send){
    const {default:nodemailer}=await import('nodemailer');
    const transport=nodemailer.createTransport({host:'smtp.naver.com',port:465,secure:true,auth:{user,pass:env.NAVER_SMTP_PASSWORD},connectionTimeout:8000,greetingTimeout:8000,socketTimeout:15000,disableFileAccess:true,disableUrlAccess:true});
    send=options=>transport.sendMail(options);
   }
   const result=await send({from:{name:'CHURRRI’S LAB 아이디어',address:user},to:RECIPIENT,replyTo:{name:name.trim()||email.trim(),address:email.trim()},subject:`[CHURRRI’S LAB] ${subject.trim()}`,text:`포트폴리오에서 접수한 아이디어입니다.\n\n이름: ${name.trim()||'미기재'}\n답장 이메일: ${email.trim()}\n\n${message.trim()}`,disableFileAccess:true,disableUrlAccess:true});
   if(!result?.accepted?.some(address=>String(address).toLowerCase()===RECIPIENT))throw new Error('Recipient not accepted');
   return res.status(200).json({ok:true});
  }catch{
   return fail(502,'SEND_FAILED','메일 전송 결과를 확인하지 못했어요. 잠시 후 다시 시도하거나 메일 앱을 이용해 주세요.');
  }
 };
}
export default createContactHandler();
