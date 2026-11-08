import {GAMES, QUICKPLAY_BASE, CATEGORY_LABEL} from './games.js';
const $ = id => document.getElementById(id);
const store = {filter:'todos',query:'',current:null,toastTimer:null,scrollY:0};
const themes = [
  {bg:'#233c4a',light:'#e64a2c80'}, {bg:'#293a40',light:'#f2b1518c'},
  {bg:'#302a44',light:'#ae8bfa8c'}, {bg:'#203e34',light:'#87ceac90'},
  {bg:'#3e2a30',light:'#e9668e80'}, {bg:'#29445b',light:'#5cb5ea90'},
  {bg:'#40302d',light:'#e9a35d8b'}, {bg:'#36412c',light:'#d9df768c'}
];
const baseTitle = 'Projeto Primata Games — Quickplay & Capital Criminal';
const gameUrl = game => QUICKPLAY_BASE + encodeURIComponent(game.file);
const deepUrl = game => `${window.location.origin}${window.location.pathname}?jogo=${encodeURIComponent(game.id)}`;
const norm = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const escapeHTML = str => String(str).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function card(game, index, featured=false){
  const t=themes[(index*3+game.name.length)%themes.length];
  const el=document.createElement('button');
  el.type='button';el.className=featured?'feature-card':'game-card';
  el.style.setProperty('--accent-bg',t.bg);el.style.setProperty('--accent-light',t.light);el.style.setProperty('--game-accent','#e84d34');
  el.setAttribute('aria-label',`Jogar ${game.name} no navegador`);
  el.dataset.game=game.id;
  el.innerHTML=`<div class="game-art"><div class="art-glow" aria-hidden="true"></div><span class="art-emoji" aria-hidden="true">${game.emoji}</span><span class="art-index" aria-hidden="true">${String(index+1).padStart(2,'0')}</span><span class="art-ribbon">${CATEGORY_LABEL[game.category]}</span></div><div class="${featured?'feature-body':'game-body'}"><strong class="${featured?'feature-title':'game-title'}">${escapeHTML(game.name)}</strong><span class="${featured?'feature-desc':'game-desc'}">${escapeHTML(game.desc)}</span><span class="${featured?'feature-play':'game-play'}">JOGAR NO NAVEGADOR <span class="play-arrow" aria-hidden="true">↗</span></span></div>`;
  el.addEventListener('click',()=>openGame(game,true));
  return el;
}
function renderFeatured(){const el=$('featuredGrid');GAMES.filter(g=>g.featured).slice(0,8).forEach((g,i)=>el.appendChild(card(g,i,true)));}
function filteredGames(){return GAMES.filter(g=>(store.filter==='todos'||g.category===store.filter)&&(!store.query||norm(g.name+' '+g.desc+' '+CATEGORY_LABEL[g.category]).includes(norm(store.query))));}
function renderCatalog(){const list=filteredGames();const grid=$('gamesGrid');grid.replaceChildren();const fragment=document.createDocumentFragment();list.forEach((g,i)=>fragment.appendChild(card(g,i)));grid.appendChild(fragment);$('resultsText').textContent=`${list.length} ${list.length===1?'jogo encontrado':'jogos encontrados'} · carregados do GitHub Pages`;$('emptyState').hidden=!!list.length;}
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('is-visible');clearTimeout(store.toastTimer);store.toastTimer=setTimeout(()=>el.classList.remove('is-visible'),2700);}
function openGame(game,history=true){
  if(!game)return;
  if(store.current?.id===game.id&&$('playerDialog').open)return;
  const dlg=$('playerDialog');const frame=$('playerFrame');
  store.current=game;store.scrollY=window.scrollY;
  $('playerTitle').textContent=game.name;$('playerIcon').textContent=game.emoji;$('playerNewTab').href=gameUrl(game);
  $('playerLoading').classList.remove('is-hidden');
  frame.title=game.name+' — jogo no GitHub Pages';frame.src=gameUrl(game);
  if(!dlg.open)dlg.showModal();
  document.title=game.name+' — Projeto Primata Games';
  if(history){const url=new URL(window.location.href);url.searchParams.set('jogo',game.id);historyPush(url);}
}
function historyPush(url){window.history.pushState({jogo:store.current?.id??null},'',url);}
function closeGame(history=true){const dlg=$('playerDialog');if(!dlg.open)return;dlg.close();$('playerFrame').removeAttribute('src');store.current=null;document.title=baseTitle;
  if(history){const url=new URL(window.location.href);url.searchParams.delete('jogo');historyPush(url);}
}
function handlePopState(){const gameId=new URL(location.href).searchParams.get('jogo');const game=GAMES.find(g=>g.id===gameId);if(game)openGame(game,false);else closeGame(false);}
function wire(){
  document.querySelector('.capital-image img')?.addEventListener('error',e=>{e.target.hidden=true;e.target.parentElement.classList.add('image-unavailable');});
  $('headerCount').textContent=GAMES.length;$('totalGames').textContent=GAMES.length;$('year').textContent=new Date().getFullYear();
  $('gameSearch').addEventListener('input',event=>{store.query=event.target.value.trim();renderCatalog();});
  $('filters').addEventListener('click',event=>{const btn=event.target.closest('button[data-filter]');if(!btn)return;store.filter=btn.dataset.filter;for(const button of $('filters').querySelectorAll('button')){const active=button===btn;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));}renderCatalog();});
  $('resetFilters').addEventListener('click',()=>{store.query='';$('gameSearch').value='';$('filters').querySelector('[data-filter="todos"]').click();$('gameSearch').focus();});
  $('randomGame').addEventListener('click',()=>{const games=filteredGames();if(games.length)openGame(games[Math.floor(Math.random()*games.length)],true);else toast('Limpe a busca para encontrar jogos.');});
  const menu=$('mobileNav');const toggle=$('menuToggle');toggle.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.hidden=true;toggle.setAttribute('aria-expanded','false');}));
  $('playerClose').addEventListener('click',()=>closeGame(true));
  $('playerDialog').addEventListener('cancel',event=>{event.preventDefault();closeGame(true);});
  $('playerDialog').addEventListener('click',event=>{if(event.target===$('playerDialog'))closeGame(true);});
  $('playerFrame').addEventListener('load',()=>$('playerLoading').classList.add('is-hidden'));
  $('playerFullscreen').addEventListener('click',async()=>{const stage=$('playerStage');try{if(document.fullscreenElement)await document.exitFullscreen();else await stage.requestFullscreen();}catch{toast('Tela cheia indisponível neste navegador.');}});
  $('playerCopy').addEventListener('click',async()=>{if(!store.current)return;const url=deepUrl(store.current);try{await navigator.clipboard.writeText(url);toast('Link do jogo copiado!');}catch{toast('Copie o endereço na barra do navegador.');}});
  window.addEventListener('popstate',handlePopState);
  window.addEventListener('keydown',event=>{if(event.key==='Escape'&&$('playerDialog').open){closeGame(true);}});
}
function init(){renderFeatured();renderCatalog();wire();handlePopState();}
init();
