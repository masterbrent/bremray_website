'use strict';
const designs=[
 {name:'Type',file:'01-type.png',description:'The closest to your white-and-black idea. Large, confident type carries the page.',alt:'Full homepage concept in black and white with oversized bold lettering and immediate installation choices'},
 {name:'Editorial',file:'02-editorial.png',description:'A serif-led layout with a compact request column, restrained photography and a quieter local feel.',alt:'Full homepage concept with large serif headings, a request column, monochrome imagery and small red accents'},
 {name:'Service desk',file:'03-service-desk.png',description:'A cobalt identity rail and a clear working area put the request at the center of the experience.',alt:'Full homepage concept with a cobalt navigation rail, a large interactive request area and a numbered service directory'}
];
document.querySelectorAll('[data-design]').forEach(button=>button.addEventListener('click',()=>{
 const i=Number(button.dataset.design),d=designs[i];
 if(!d)return;
 document.querySelectorAll('[data-design]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 document.querySelector('#design-number').textContent='Direction 0'+(i+1);
 document.querySelector('#design-title').textContent=d.name;
 document.querySelector('#design-description').textContent=d.description;
 const img=document.querySelector('#design-image');img.src=d.file;img.alt=d.alt;
 document.querySelector('#image-link').href=d.file;
 document.querySelector('#image-link').setAttribute('aria-label','Open '+d.name+' render at full size');
 document.querySelector('#full-size').href=d.file;
 document.querySelector('#image-caption').textContent='0'+(i+1)+' / '+d.name+' — full homepage render';
}));
