import {mkdir,copyFile,cp,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for(const file of ['index.html','style.css','script.js','favicon.svg'])await copyFile(file,`dist/${file}`);
await cp('assets','dist/assets',{recursive:true});
console.log('포트폴리오 정적 파일 빌드 완료');
