const body=document.body;
const enter=document.querySelector('#enter');
const gate=document.querySelector('#gate');
const content=document.querySelector('#content');
const audio=document.querySelector('#song');
const player=document.querySelector('#player');
const playToggle=document.querySelector('#play-toggle');
const playIcon=document.querySelector('#play-icon');
const mute=document.querySelector('#mute');
const seek=document.querySelector('#seek');
const elapsed=document.querySelector('#elapsed');
const duration=document.querySelector('#duration');
const progress=document.querySelector('#progress');
const poemText=document.querySelector('#poem-text');
const originalPoem=poemText.textContent;
const languageToggle=document.querySelector('#language-toggle');
const poemLanguageToggle=document.querySelector('#poem-language-toggle');
let translatedPoem=null;
let isSpanish=false;

async function toggleLanguage(){
  if(!isSpanish && !translatedPoem){
    languageToggle.disabled=true;
    poemLanguageToggle.disabled=true;
    poemLanguageToggle.textContent='Carregando tradução...';
    try{
      const response=await fetch('./assets/poem-es-ar.txt');
      if(!response.ok)throw new Error('Tradução indisponível');
      translatedPoem=await response.text();
    }catch{
      poemLanguageToggle.textContent='Tradução indisponível. Tente novamente.';
      languageToggle.disabled=false;
      poemLanguageToggle.disabled=false;
      return;
    }
    languageToggle.disabled=false;
    poemLanguageToggle.disabled=false;
  }
  isSpanish=!isSpanish;
  poemText.textContent=isSpanish?translatedPoem:originalPoem;
  poemText.lang=isSpanish?'es-AR':'pt-BR';
  document.querySelector('.poem-section h2').textContent=isSpanish?'Para mi eterna hechicera':'Para minha eterna feiticeira';
  poemLanguageToggle.textContent=isSpanish?'Ler em português brasileiro':'Leer en español argentino';
  languageToggle.setAttribute('aria-label',isSpanish?'Mostrar poema em português brasileiro':'Traduzir poema para espanhol argentino');
  languageToggle.title=languageToggle.getAttribute('aria-label');
}
languageToggle.addEventListener('click',toggleLanguage);
poemLanguageToggle.addEventListener('click',toggleLanguage);

// Ilustrações distribuídas de modo estável pelas margens, sem cobrir os versos.
const decorations=['pumpkin','bat','spider'];
for(let i=0;i<18;i++){
  const image=document.createElement('img');
  image.className=`decor ${i%2?'right':'left'}`;
  image.src=`./assets/${decorations[(i*5+Math.floor(i/3))%3]}.svg`;
  image.alt='';
  image.setAttribute('aria-hidden','true');
  image.loading='lazy';
  image.style.top=`${4+i*5.3+(i%3)*.5}%`;
  document.querySelector('.poem-section').appendChild(image);
}

function formatTime(seconds){
  if(!Number.isFinite(seconds))return '0:00';
  return `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
}
function setPlayState(){
  const playing=!audio.paused;
  playIcon.textContent=playing?'Ⅱ':'▶';
  playToggle.setAttribute('aria-label',playing?'Pausar música':'Tocar música');
  playToggle.title=playing?'Pausar música':'Tocar música';
}
enter.addEventListener('click',async()=>{
  body.classList.add('entered');
  player.hidden=false;
  audio.volume=.55;
  try{await audio.play()}catch{playToggle.setAttribute('aria-label','Tocar música');}
  setPlayState();
  window.setTimeout(()=>{gate.setAttribute('aria-hidden','true');content.focus({preventScroll:true})},900);
});
playToggle.addEventListener('click',async()=>{
  if(audio.paused){try{await audio.play()}catch{}}
  else audio.pause();
  setPlayState();
});
mute.addEventListener('click',()=>{
  audio.muted=!audio.muted;
  mute.textContent=audio.muted?'♩':'♪';
  mute.setAttribute('aria-label',audio.muted?'Ativar som':'Silenciar música');
});
audio.addEventListener('play',setPlayState);
audio.addEventListener('pause',setPlayState);
audio.addEventListener('loadedmetadata',()=>duration.textContent=formatTime(audio.duration));
audio.addEventListener('timeupdate',()=>{
  elapsed.textContent=formatTime(audio.currentTime);
  if(Number.isFinite(audio.duration)&&audio.duration>0)seek.value=String(audio.currentTime/audio.duration*100);
});
seek.addEventListener('input',()=>{
  if(Number.isFinite(audio.duration))audio.currentTime=Number(seek.value)/100*audio.duration;
});
let ticking=false;
window.addEventListener('scroll',()=>{
  if(ticking)return;
  ticking=true;
  requestAnimationFrame(()=>{
    const max=document.documentElement.scrollHeight-window.innerHeight;
    progress.style.width=max>0?`${window.scrollY/max*100}%`:'0%';
    ticking=false;
  });
},{passive:true});
