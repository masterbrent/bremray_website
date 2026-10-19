document.addEventListener('DOMContentLoaded',()=>{
const bar=document.createElement('div');bar.className='staging-banner';bar.textContent='DESIGN PREVIEW · Illustrative imagery · Forms do not send';document.body.prepend(bar);
document.querySelectorAll('form').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();let message=form.querySelector('[role="status"]');if(!message){message=document.createElement('p');message.setAttribute('role','status');form.append(message)}message.textContent='Preview only — your request has not been sent.';}));
});
