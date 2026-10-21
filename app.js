'use strict';
/* ================= helpers ================= */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const uid=()=>Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4);
function h(tag,attrs,...kids){
  const e=document.createElement(tag);
  if(attrs)for(const k in attrs){
    const v=attrs[k];
    if(v==null||v===false)continue;
    if(k==='class')e.className=v;
    else if(k==='style')e.style.cssText=v;
    else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);
    else e.setAttribute(k,v===true?'':v);
  }
  for(const c of kids.flat()){if(c==null||c===false)continue;e.append(c.nodeType?c:document.createTextNode(c))}
  return e;
}
const ICON={
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  pencil:'<path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  fit:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  star:'<path d="M12 3.6l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.8 1-5.9L3.5 9.8l5.9-.8z"/>'
};
function ico(n){const s=h('span',{class:'ico','aria-hidden':'true'});s.innerHTML='<svg viewBox="0 0 24 24">'+ICON[n]+'</svg>';return s}
const EMB={
  note:'<path d="M14 26V9l13-3v17"/><circle cx="11" cy="26" r="3.2"/><circle cx="24" cy="23" r="3.2"/>',
  cup:'<path d="M7 14h17v6a7 7 0 0 1-7 7h-3a7 7 0 0 1-7-7z"/><path d="M24 16h2.5a3 3 0 0 1 0 6H23"/><path d="M12 6c0 2 2 2 2 4M18 6c0 2 2 2 2 4"/>',
  leaf:'<path d="M8 26C8 14 15 8 27 7c0 12-6 19-18 19z"/><path d="M8 26l11-11"/>',
  spark:'<path d="M17 4c1 8 4 11 12 13-8 2-11 5-12 13-1-8-4-11-12-13 8-2 11-5 12-13z"/>',
  moon:'<path d="M26 21A10 10 0 1 1 13 8a8 8 0 0 0 13 13z"/>',
  key:'<circle cx="11" cy="17" r="5"/><path d="M16 17h13M25 17v5M21 17v4"/>',
  sun:'<circle cx="17" cy="17" r="6"/><path d="M17 4v4M17 26v4M4 17h4M26 17h4M7.8 7.8l2.8 2.8M23.4 23.4l2.8 2.8M26.2 7.8l-2.8 2.8M10.6 23.4l-2.8 2.8"/>',
  eye:'<path d="M3 17c4-7 9-10 14-10s10 3 14 10c-4 7-9 10-14 10S7 24 3 17z"/><circle cx="17" cy="17" r="4.5"/>',
  heart:'<path d="M17 28S5 21 5 12.5A6.5 6.5 0 0 1 17 9a6.5 6.5 0 0 1 12 3.5C29 21 17 28 17 28z"/>',
  bolt:'<path d="M19 3L7 19h9l-2 12 12-16h-9z"/>',
  anchor:'<circle cx="17" cy="8" r="3"/><path d="M17 11v18M9 17h16M6 21c0 5 5 8 11 8s11-3 11-8"/>',
  flower:'<circle cx="17" cy="17" r="3"/><path d="M17 14c-3-5-2-9 0-10 2 1 3 5 0 10zM17 20c3 5 2 9 0 10-2-1-3-5 0-10zM14 17c-5 3-9 2-10 0 1-2 5-3 10 0zM20 17c5-3 9-2 10 0-1 2-5 3-10 0z"/>',
  star:'<path d="M17 4l3.9 8 8.8 1.2-6.4 6.1 1.6 8.7L17 23.7l-7.9 4.3 1.6-8.7L4.3 13.2 13.1 12z"/>',
  crown:'<path d="M5 24l-1-13 7 6 6-9 6 9 7-6-1 13z"/><path d="M5 28h24"/>',
  wave:'<path d="M3 13c3-4 5-4 8 0s5 4 8 0 5-4 8 0M3 21c3-4 5-4 8 0s5 4 8 0 5-4 8 0"/>',
  horn:'<path d="M3 15h14l9-6v16l-9-6H3z"/><path d="M26 17h5"/>'
};
function emb(n){const s=h('span',{class:'emb','aria-hidden':'true'});s.innerHTML='<svg viewBox="0 0 34 34">'+(EMB[n]||EMB.note)+'</svg>';return s}
const fmtFull=new Intl.DateTimeFormat('en-GB',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
const fmtDay=new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long'});
let fmtVie;try{fmtVie=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Vienna'})}catch(e){fmtVie=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit'})}
const snip=(s,n)=>{s=String(s||'');if(s.length<=n)return s;const c=s.slice(0,n);const i=c.lastIndexOf(' ');return (i>n*.6?c.slice(0,i):c).replace(/[\s,.;:!?-]+$/,'')+'…'};
const veil=()=>!!(typeof settings!=='undefined'&&settings.cafe);
const maskText=t=>String(t).replace(/[\p{L}\p{N}]/gu,'•');
function toast(msg){if(veil())msg=String(msg).replace(/[“"][^”"]*[”"]/g,'“•••”');const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2400)}
function armBtn(btn,label,run){ // two-step confirmation without dialogs
  let armed=false,orig=null,timer=0;
  btn.addEventListener('click',ev=>{
    ev.stopPropagation();
    if(!armed){armed=true;orig=Array.from(btn.childNodes);btn.replaceChildren(label);btn.classList.add('armed');timer=setTimeout(()=>{armed=false;btn.replaceChildren(...orig);btn.classList.remove('armed')},3200);return}
    clearTimeout(timer);armed=false;run();
  });
}

/* ================= skins and settings ================= */
const SKINS=[
  {id:'abendrot',name:'Abendrot',note:'Burgundy dusk on the Ring',bg:'#120a0c',panel:'#26161b',accent:'#ff8b5c',ink:'#f8ede6'},
  {id:'kaffeehaus',name:'Kaffeehaus',note:'Bottle green, brass lamp',bg:'#08110e',panel:'#14261f',accent:'#e8b24a',ink:'#f0e9d7'},
  {id:'bluehour',name:'Blue Hour',note:'Midnight blue, sax amber',bg:'#060a14',panel:'#101a33',accent:'#ffac30',ink:'#e8eefa'},
  {id:'secession',name:'Secession',note:'Plum and gold leaf',bg:'#0d0711',panel:'#1d1128',accent:'#e4bc4e',ink:'#f4eadb'},
  {id:'marmor',name:'Marmor',note:'Marble top, espresso ink',bg:'#c4c9c7',panel:'#f4f4f1',accent:'#146b53',ink:'#1e1511'}
];
const mqLight=window.matchMedia?window.matchMedia('(prefers-color-scheme: light)'):{matches:false};
const mqReduce=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
const DEF={skin:'abendrot',stringStyle:'swing',swing:55,wiggle:70,fontSize:30,look:'twine',place:'thread',staff:true,askName:true,sound:true,volume:60,jzInstr:'rhodes',jzBand:true,jzIdle:true,jzTempo:104,jzKey:0,jzProg:'ii-v-i',jzReverb:40,webLayout:'drift',labels:'auto',nodeSize:100,webSpacing:100,cafe:false,cafeLock:3,cafeMute:true,cafePin:'',grain:true,clock:true,reduce:null};
let storageOK=true;
function lsGet(k){try{return localStorage.getItem(k)}catch(e){storageOK=false;return null}}
function lsSet(k,v){try{localStorage.setItem(k,v);return true}catch(e){storageOK=false;return false}}
const KEY_S='mind.settings.v1',KEY_D='mind.data.v1';
let settings=Object.assign({},DEF);
try{const raw=lsGet(KEY_S);if(raw)Object.assign(settings,JSON.parse(raw))}catch(e){}
if(!['swing','waltz','ballad','taut'].includes(settings.stringStyle))settings.stringStyle='swing';
const reduceMotion=()=>settings.reduce==null?!!mqReduce.matches:!!settings.reduce;
function saveSettings(){lsSet(KEY_S,JSON.stringify(settings))}

/* ================= data ================= */
const CAT_DEFAULT=[['Ideas',0],['Questions',3],['Feelings',2],['Plans',1],['Memories',4],['Observations',6]];
function newBook(title,sub,hue,emblem){
  return {id:uid(),title,sub:sub||'',hue:hue==null?0:hue,emblem:emblem||'note',created:Date.now(),cover:null,
    cats:CAT_DEFAULT.map(([n,s])=>({id:uid(),name:n,slot:s})),thoughts:[],links:[]};
}
function sampleBook(){
  const b=newBook('Kaffeehaus Notes','Example thoughts',0,'cup');b.sample=true;
  const cid=n=>b.cats.find(c=>c.name===n).id;
  const rows=[
    ['Melange at the window table. The light does half the thinking for me.','Feelings',52,'Window table light'],
    ['What if every idea needed a place to hang, like coats in a Kaffeehaus?','Ideas',49,'Coats in a Kaffeehaus'],
    ['Miles Davis knew it: the notes you leave out matter as much as the ones you play.','Observations',40,'The notes left out'],
    ['Why do my best ideas only show up when I am walking?','Questions',31,'Walking ideas'],
    ['Walk the Ringstraße tomorrow morning. No phone, just a notebook.','Plans',28,'Ringstraße morning'],
    ['Grandmother’s kitchen smelled of cardamom and warm milk.','Memories',26,'Cardamom kitchen'],
    ['Notes that link to each other feel less like storage and more like a conversation.','Ideas',22,'Linked like a conversation'],
    ['Syncopation is just expectation, politely disappointed.','Observations',19,'Polite syncopation'],
    ['Which of my projects would still matter in ten years?','Questions',14,'Ten years on'],
    ['Finish the outline before Thursday. One small step each evening.','Plans',9,'Thursday outline'],
    ['The tram bell at 7:42 is my alarm clock now, whether I like it or not.','Observations',6,'Tram bell, 7:42'],
    ['Carry less, think more. Fewer tabs, one good notebook.','Ideas',4,'Carry less'],
    ['Strangely calm in the Naschmarkt crowd. Everyone busy, nobody rushing.','Feelings',2.5,'Naschmarkt calm'],
    ['A thought written down is a thought you can disagree with later.','Ideas',0.8,'Disagree later']
  ];
  b.cover={mat:'cloth',base:'#7b2a38',pat:'diamonds',pc:'#f3d894',frame:'double',tcol:'#f3d894',tfont:'display',tpos:'top',talign:'left',tsize:12.5,spine:null,spineText:true,ribbon:'#f2708f',thick:34,back:{base:null,pat:null,text:'Coats on hooks, thoughts on strings. A few examples to get you started.',tfont:'serif',tcol:null,tsize:5.4},items:[{id:uid(),face:'front',type:'emb',e:'cup',x:27,y:82,s:19,r:0,c:null},{id:uid(),face:'back',type:'txt',t:'mind.',f:'display',x:50,y:90,s:9,r:0,c:null}]};
  const now=Date.now();
  rows.forEach(([text,cat,hrs,title],i)=>b.thoughts.push({id:uid(),text,title,star:i===2||i===6,cat:cid(cat),t:now-Math.round(hrs*3600e3)-((i*7)%13)*60e3}));
  [[1,6],[6,13],[2,7],[3,4],[4,10],[4,12],[8,9],[13,8],[11,1],[5,0],[12,10],[0,12],[3,6],[11,9]].forEach(([i,j])=>b.links.push([b.thoughts[i].id,b.thoughts[j].id]));
  return b;
}
let S=null;
function loadData(){
  try{
    const raw=lsGet(KEY_D);
    if(raw){const d=JSON.parse(raw);if(d&&Array.isArray(d.books)&&d.books.length){S=sanitize(d)}}
  }catch(e){}
  if(!S){const sb=sampleBook();S={books:[sb],active:sb.id,drafts:{},sampleDismissed:false}}
}
function sanitize(d){
  const books=d.books.filter(b=>b&&typeof b.id==='string').map(b=>({
    id:b.id,title:String(b.title||'Untitled').slice(0,60),sub:String(b.sub||'').slice(0,80),hue:clamp(+b.hue||0,0,7),emblem:EMB[b.emblem]?b.emblem:'note',
    created:+b.created||Date.now(),sample:!!b.sample,
    cats:(Array.isArray(b.cats)?b.cats:[]).filter(c=>c&&c.id).map(c=>({id:String(c.id),name:String(c.name||'Category').slice(0,28),slot:clamp(+c.slot||0,0,7)})),
    thoughts:(Array.isArray(b.thoughts)?b.thoughts:[]).filter(t=>t&&t.id&&typeof t.text==='string').map(t=>({id:String(t.id),text:t.text,title:String(t.title||'').slice(0,60),star:!!t.star,sk:Math.max(0,Math.floor(+t.sk||0)),cat:t.cat||null,t:+t.t||Date.now()})),
    links:(Array.isArray(b.links)?b.links:[]).filter(p=>Array.isArray(p)&&p.length===2),cover:b.cover&&typeof b.cover==='object'?b.cover:null
  }));
  books.forEach(bk=>{if(bk.cover)bk.cover=normCover(bk.cover,bk)});
  if(!books.length)throw new Error('empty');
  books.forEach(b=>{const ids=new Set(b.thoughts.map(t=>t.id));b.links=b.links.filter(p=>ids.has(p[0])&&ids.has(p[1])&&p[0]!==p[1])});
  return {books,active:books.some(b=>b.id===d.active)?d.active:books[0].id,drafts:d.drafts&&typeof d.drafts==='object'?d.drafts:{},sampleDismissed:!!d.sampleDismissed};
}
let saveTimer=0;
function save(){clearTimeout(saveTimer);saveTimer=setTimeout(flushSave,250)}
function flushSave(){clearTimeout(saveTimer);lsSet(KEY_D,JSON.stringify(S));$('#storeWarn').hidden=storageOK}
window.addEventListener('pagehide',flushSave);
document.addEventListener('visibilitychange',()=>{if(document.hidden)flushSave()});
const book=()=>S.books.find(b=>b.id===S.active)||S.books[0];
const thoughtOf=(b,id)=>b.thoughts.find(t=>t.id===id);
const catOf=(b,t)=>b.cats.find(c=>c.id===t.cat)||null;
const catVar=(b,t)=>{const c=catOf(b,t);return c?'var(--c'+c.slot+')':'var(--ink2)'};
const catName=(b,t)=>{const c=catOf(b,t);return c?c.name:'Unsorted'};
function isLinked(b,x,y){return b.links.some(p=>(p[0]===x&&p[1]===y)||(p[0]===y&&p[1]===x))}
function toggleLink(b,x,y){
  const i=b.links.findIndex(p=>(p[0]===x&&p[1]===y)||(p[0]===y&&p[1]===x));
  if(i>=0)b.links.splice(i,1);else if(x!==y)b.links.push([x,y]);
  changed({layout:false});
}
function neighbors(b,id){const out=[];for(const p of b.links){if(p[0]===id)out.push(p[1]);else if(p[1]===id)out.push(p[0])}return out.map(i=>thoughtOf(b,i)).filter(Boolean)}
function degree(b,id){let n=0;for(const p of b.links)if(p[0]===id||p[1]===id)n++;return n}
function removeThought(b,id){b.thoughts=b.thoughts.filter(t=>t.id!==id);b.links=b.links.filter(p=>p[0]!==id&&p[1]!==id);if(web.sel===id)web.sel=null;if(str.sel===id)closeKnotPop();if(sky.sel===id)sky.sel=null;changed({layout:true});updateRail()}

/* canvas colours resolved from the active skin */
let COL={};
function refreshColors(){
  const cs=getComputedStyle(document.documentElement);const g=n=>cs.getPropertyValue(n).trim();
  COL={bg:g('--bg'),panel:g('--panel'),panel2:g('--panel2'),ink:g('--ink'),ink2:g('--ink2'),accent:g('--accent'),string:g('--string'),line:g('--line'),edge:g('--edge'),edge2:g('--edge2'),c:[0,1,2,3,4,5,6,7].map(i=>g('--c'+i))};
}
const catCol=(b,t)=>{const c=catOf(b,t);return c?COL.c[c.slot]:COL.ink2};

/* ================= related thoughts (for thread suggestions) ================= */
const STOP=new Set(('that this with have from they will would there their what when where which about into than then them been were was has had can could should just like also very more some your you the and for are but not our out its dont isnt arent und der die das ist nicht ein eine einen mit für auf von den dem zum zur auch aber oder wie was wer wir ich mir mich dir sich sie nur noch schon sehr mehr').split(' '));
function toks(s){const out=new Set();for(let w of (String(s).toLowerCase().match(/\p{L}{4,}/gu)||[])){if(w.length>5&&w.endsWith('s'))w=w.slice(0,-1);if(!STOP.has(w))out.add(w)}return out}
function related(b,t,n){
  const a=toks(t.text),out=[];
  for(const o of b.thoughts){if(o.id===t.id)continue;const bt=toks(o.text);let sc=0;for(const w of a)if(bt.has(w))sc+=1+Math.min(2,w.length/8);if(sc>0)out.push([sc,o])}
  out.sort((x,y)=>y[0]-x[0]||y[1].t-x[1].t);return out.slice(0,n).map(x=>x[1]);
}

/* ================= menus and modal ================= */
let menuEl=null;
function closeMenu(){if(menuEl){menuEl.remove();menuEl=null}}
function openMenu(anchor,items){
  closeMenu();
  const m=h('div',{class:'menu',role:'menu'},items.map(it=>h('button',{class:'mi',role:'menuitem',type:'button',onclick:()=>{closeMenu();it.fn()}},
    it.color?h('i',{style:'background:'+it.color}):null,it.label,it.on?h('span',{class:'ck'},ico('check')):null)));
  document.body.append(m);menuEl=m;
  const r=anchor.getBoundingClientRect(),mw=m.offsetWidth,mh=m.offsetHeight;
  m.style.left=clamp(r.left,8,innerWidth-mw-8)+'px';
  m.style.top=(r.bottom+6+mh>innerHeight-8?Math.max(8,r.top-mh-6):r.bottom+6)+'px';
  const first=m.querySelector('.mi');if(first)first.focus();
  setTimeout(()=>{
    const off=ev=>{if(menuEl&&!menuEl.contains(ev.target)){closeMenu();document.removeEventListener('pointerdown',off,true)}};
    document.addEventListener('pointerdown',off,true);
  },0);
}
let modalOnClose=null;
function showModal(nodes,cls){const s=$('#sheet');s.className='sheet'+(cls?' '+cls:'');s.replaceChildren(...nodes);modalOnClose=null;$('#modal').classList.add('on');const f=s.querySelector('input,button');if(f)f.focus()}
function closeModal(ok){const m=$('#modal');if(!m.classList.contains('on'))return;m.classList.remove('on');const f=modalOnClose;modalOnClose=null;if(f)f(ok===true)}
$('#modalBack').addEventListener('click',()=>closeModal());
function openPicker(id){
  const b=book(),t=thoughtOf(b,id);if(!t)return;
  let q='';
  const list=h('div',{class:'sheet-list'});
  const draw=()=>{
    const items=b.thoughts.filter(o=>o.id!==id&&(!q||o.text.toLowerCase().includes(q)||titleOf(o).toLowerCase().includes(q))).sort((x,y)=>y.t-x.t).slice(0,120);
    list.replaceChildren(...(items.length?items.map(o=>{
      const on=isLinked(b,id,o.id);
      const btn=h('button',{class:'pick',type:'button','aria-pressed':on?'true':'false',style:'--cc:'+catVar(b,o)},h('i'),h('span',{class:'tx'},h('b',null,titleOf(o)),h('span',null,o.text)),h('span',{class:'ck'},on?ico('check'):null));
      btn.addEventListener('click',()=>{toggleLink(b,id,o.id);draw()});
      return btn;
    }):[h('p',{class:'mono',style:'padding:18px 10px'},'No other knots match.')]));
  };
  const search=h('input',{class:'field',type:'search',placeholder:'Search earlier thoughts','aria-label':'Search earlier thoughts',autocomplete:'off'});
  search.addEventListener('input',()=>{q=search.value.trim().toLowerCase();draw()});
  showModal([h('div',{class:'sheet-head'},h('div',{class:'eyebrow'},'Pull a thread'),h('h3',null,'Tie “'+snip(titleOf(t),26)+'” to another'),h('p',null,t.text),search),list,
    h('div',{class:'sheet-foot'},h('button',{class:'btn primary',type:'button',onclick:()=>closeModal()},'Done'))]);
  draw();
}
function catMenu(anchor,b,t){
  openMenu(anchor,[...b.cats.map(c=>({label:c.name,color:'var(--c'+c.slot+')',on:t.cat===c.id,fn:()=>{t.cat=c.id;changed({layout:false})}})),{label:'Unsorted',color:'var(--ink2)',on:!catOf(b,t),fn:()=>{t.cat=null;changed({layout:false})}}]);
}

/* ================= navigation ================= */
const VIEWS=['string','sky','notes','web','books'];
function greet(){const hr=new Date().getHours();return hr<5?'Gute Nacht':hr<11?'Guten Morgen':hr<13?'Mahlzeit':hr<18?'Guten Nachmittag':hr<22?'Guten Abend':'Gute Nacht'}
function setHeading(){
  const v=S.view,eb=$('#eyebrow'),hh=$('#h1');
  const em=t=>h('em',null,t);
  if(v==='string'){eb.textContent=fmtDay.format(new Date());hh.replaceChildren(greet()+'. ',em('Thread a thought.'))}
  else if(v==='sky'){eb.textContent='Sky';hh.replaceChildren('Write in the ',em('stars.'))}
  else if(v==='notes'){eb.textContent='Notes';hh.replaceChildren('Sort the ',em('threads.'))}
  else if(v==='web'){eb.textContent='Web';hh.replaceChildren('Wander your ',em('web.'))}
  else{eb.textContent='Library';hh.replaceChildren('Your ',em('brain books.'))}
  const b=book();
  $('#bookChip').replaceChildren(emb(b.emblem),h('span',null,b.title));
  $('#bookChip').querySelector('.emb').style.cssText='width:16px;height:16px;display:block;color:var(--c'+b.hue+')';
  $('#bookChip').querySelector('svg').style.cssText='width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round';
  $('#sampleBadge').hidden=!b.sample;
  updateRail();
}
function go(v,opts){
  if(!VIEWS.includes(v))v='string';
  closeKnotPop();$('#keysPop').hidden=true;$('#keysBtn').setAttribute('aria-expanded','false');
  S.view=v;
  for(const n of VIEWS)$('#view-'+n).hidden=n!==v;
  $$('.nav-btn[data-view]').forEach(b=>{if(b.dataset.view===v)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  setHeading();
  if(v==='string')enterString(opts);
  else if(v==='sky')enterSky(opts);
  else if(v==='notes')renderNotes(opts);
  else if(v==='web')enterWeb(opts);
  else renderBooks();
}
$$('.nav-btn[data-view]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.view)));
$('#bookChip').addEventListener('click',()=>go('books'));
$('#zoomIn').append(ico('plus'));$('#zoomOut').append(ico('minus'));$('#zoomFit').append(ico('fit'));
$('#bannerX').append(ico('x'));
$('#closeSettings').append(ico('x'));

/* data changed: refresh whatever is visible */
function changed(o){
  o=o||{};
  save();
  if(o.layout!==false)str.dirty=true;
  web.needSync=true;
  if(S.view==='notes')renderNotes({keepScroll:true});
  else if(S.view==='web')webSync();
  else if(S.view==='books')renderBooks();
  else if(S.view==='sky')skyCard();
  updateStrChrome();
  setHeading();
}
/* ================= names: every knot has one ================= */
function autoTitle(text){
  let s=String(text||'').trim().replace(/\s+/g,' ');
  const m=s.match(/^[^.!?;:—–]+/);s=(m?m[0]:s).trim();
  let w=s.split(' ').slice(0,5);
  while(w.length>2&&(w[w.length-1].length<=3||STOP.has(w[w.length-1].toLowerCase())))w.pop();
  s=w.join(' ').replace(/[\s,\-]+$/,'');
  if(s.length>38)s=snip(s,38);
  return s.charAt(0).toUpperCase()+s.slice(1);
}
const titleOf=t=>t.title&&t.title.trim()?t.title.trim():autoTitle(t.text);
function titleSuggestions(text){
  const cap=w=>w.charAt(0).toUpperCase()+w.slice(1);
  const words=[...toks(text)].sort((a,b)=>b.length-a.length);
  const hr=new Date().getHours();
  const tod=hr<5?'Nachtgedanke':hr<11?'Morgengedanke':hr<14?'Mittagsgedanke':hr<18?'Nachmittagsgedanke':hr<22?'Abendgedanke':'Nachtgedanke';
  const raw=[autoTitle(text),words.length>1?cap(words[0])+' & '+cap(words[1]):words[0]?cap(words[0]):'',snip(String(text).trim().split(/\s+/).slice(0,3).join(' '),30),tod];
  const seen=new Set(),out=[];
  for(const r of raw){const k=r.toLowerCase().replace(/…$/,'');if(r&&!seen.has(k)){seen.add(k);out.push(r)}}
  return out.slice(0,4);
}
function starBtn(t){
  const b=h('button',{class:'star'+(t.star?' on':''),type:'button','aria-pressed':t.star?'true':'false','aria-label':'Star this knot',title:'Star'},ico('star'));
  b.addEventListener('click',e=>{e.stopPropagation();t.star=!t.star;b.classList.toggle('on',t.star);b.setAttribute('aria-pressed',t.star?'true':'false');changed({layout:false})});
  return b;
}
/* click a name to rename it in place */
function inlineTitle(t,el,done){
  const inp=h('input',{class:'field t',value:titleOf(t),maxlength:'60','aria-label':'Knot name',style:'width:100%'});
  el.replaceWith(inp);inp.focus();inp.select();
  let fin=false;
  const end=ok=>{
    if(fin)return;fin=true;
    if(ok){t.title=inp.value.trim().slice(0,60);changed({layout:false});if(done)done()}
    else inp.replaceWith(el);
  };
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();end(true)}if(e.key==='Escape'){e.stopPropagation();end(false)}});
  inp.addEventListener('blur',()=>end(true));
}

/* ----- the naming screen ----- */
function openNamer(text){
  const b=book();
  if(!b.cats.some(c=>c.id===str.chip))str.chip=b.cats.length?b.cats[0].id:null;
  let cat=str.chip;const picked=new Set();
  const sugg=titleSuggestions(text);
  const col=()=>cat?'var(--c'+b.cats.find(c=>c.id===cat).slot+')':'var(--accent)';
  const badge=h('div',{class:'knotbadge'});
  const drawBadge=()=>{
    badge.style.setProperty('--cc',col());
    badge.innerHTML='<svg class="knotsvg" viewBox="0 0 64 40"><path d="M2 28 C16 28 18 8 32 8 S48 28 62 28"/><path class="r2" d="M2 12 C16 12 18 32 32 32 S48 12 62 12"/><circle cx="32" cy="20" r="6"/></svg>';
  };
  const input=h('input',{class:'namer-input',maxlength:'60',placeholder:'A name for this knot','aria-label':'Name this knot',autocomplete:'off',spellcheck:'false'});
  input.value=sugg[0]||'';
  const suggRow=h('div',{class:'namer-row'},...sugg.slice(1).map(s=>{
    const c=h('button',{class:'chip',type:'button',style:'--cc:var(--accent)'},s);
    c.addEventListener('click',()=>{input.value=s;input.focus();input.select()});return c;
  }));
  const catRow=h('div',{class:'namer-row'});
  const drawCats=()=>{
    catRow.replaceChildren(...b.cats.map(c=>{
      const bt=h('button',{class:'chip',type:'button','aria-pressed':cat===c.id?'true':'false',style:'--cc:var(--c'+c.slot+')'},h('i'),c.name);
      bt.addEventListener('click',()=>{cat=c.id;str.chip=c.id;drawCats();drawBadge()});return bt;
    }));
  };
  const rel=b.thoughts.length?related(b,{id:'',text},3):[];
  const fill=rel.length?rel:b.thoughts.slice(-3).reverse();
  const thrRow=h('div',{class:'namer-row'},...fill.map(o=>{
    const c=h('button',{class:'chip lk',type:'button','aria-pressed':'false',style:'--cc:'+catVar(b,o)},h('i'),titleOf(o));
    c.addEventListener('click',()=>{if(picked.has(o.id))picked.delete(o.id);else picked.add(o.id);c.setAttribute('aria-pressed',picked.has(o.id)?'true':'false')});return c;
  }));
  const commit=()=>{
    const title=input.value.trim().slice(0,60)||sugg[0]||autoTitle(text);
    closeModal(true);
    commitKnot(text,title,cat,[...picked]);
  };
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();commit()}});
  const sheetNodes=[
    h('div',{class:'namer-body'},
      h('div',{class:'namer-top'},badge,h('div',null,h('div',{class:'eyebrow'},'Tie a knot'),h('h3',null,'Name this knot'),h('p',null,'The name is what you will see on the string, in the web and in your notes.'))),
      input,
      h('blockquote',{class:'namer-quote',style:'--cc:'+col()},text),
      h('div',null,h('div',{class:'namer-lab'},'Or pick a name'),suggRow),
      h('div',null,h('div',{class:'namer-lab'},'Category'),catRow),
      fill.length?h('div',null,h('div',{class:'namer-lab'},rel.length?'Sounds related. Pull a thread?':'Pull a thread to a recent knot?'),thrRow):null),
    h('div',{class:'namer-foot'},h('span',{class:'hint'},h('kbd',null,'Enter'),' ties · ',h('kbd',null,'Esc'),' goes back'),
      h('div',{class:'foot-actions'},h('button',{class:'btn ghost',type:'button',onclick:()=>closeModal()},'Keep writing'),h('button',{class:'btn primary big',type:'button',onclick:commit},'Tie the knot')))
  ];
  showModal(sheetNodes,'namer');
  modalOnClose=ok=>{if(!ok){setTimeout(focusWriter,0)}};
  drawBadge();drawCats();
  input.focus();input.select();
}
function commitKnot(text,title,cat,linkIds){
  const b=book(),inp=str.inp;
  skyEnsure();
  const t={id:sky.pid||uid(),text,title,cat,sk:sky.slot||nextSlot(b),t:Date.now()};
  b.thoughts.push(t);
  sky.pid=uid();sky.slot=0;
  {const pts=conPts(hash32(t.id),Math.max(1,text.trim().split(/\s+/).length),skyOrigin(t.sk)),m=pts[pts.length-1];sky.pulses.push({x:m.x,y:m.y,t:performance.now()/1000,s:2});if(S.view==='sky'){sky.camT={x:m.x,y:m.y};sky.scrub=true}}
  sky.inp.value='';sky.draft='';sky.wb=[];
  for(const id of linkIds||[])if(thoughtOf(b,id))b.links.push([t.id,id]);
  inp.value='';str.draft='';str.births=[];str.caret=0;delete S.drafts[b.id];
  strRelayout();
  str.pops.set(t.id,performance.now()/1000);
  const it=str.byId.get(t.id);if(it)addPluck(it.kx,34);
  str.jig=1.6;
  Jazz.knot();str.scrub=false;
  save();updateStrChrome();updateRail();
  if(web.sel==null)web.needSync=true;
  $('#tray').hidden=true;
  setTimeout(focusWriter,30);
}
function focusWriter(){const el=S.view==='sky'?sky.inp:str.inp;if(el)el.focus({preventScroll:true})}
function calcStreak(){
  const days=new Set();
  for(const bk of S.books)for(const t of bk.thoughts){const d=new Date(t.t);days.add(d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate())}
  let n=0;const d=new Date();
  const key=x=>x.getFullYear()+'-'+x.getMonth()+'-'+x.getDate();
  if(!days.has(key(d)))d.setDate(d.getDate()-1);
  while(days.has(key(d))){n++;d.setDate(d.getDate()-1)}
  return n;
}
function updateRail(){
  const n=calcStreak(),el=$('#streak');
  el.hidden=n<1;if(n>=1){el.querySelector('b').textContent=n;el.querySelector('span').textContent=n===1?'day':'day streak'}
}
/* ================= STRING EDITOR =================
   The writing surface is a single long string. Words are set glyph by glyph along its curve,
   each thought ends in a knot, and linked knots are joined by loops hanging beneath the string. */
const WAVES={swing:[[.55,720,0],[.30,290,1.3],[.15,140,.4]],waltz:[[.7,840,0],[.3,280,.5]],ballad:[[.9,1300,0],[.1,420,2]],taut:[[.12,1100,0]]};
const TRACK=.6,START=150,KPAD=24,KGAP=34,STRIP=38,DX=4;
const PROMPTS=['What is circling your head right now?','Order a Melange. What is on your mind?','One small thought is enough.','What did you notice today?','Write it down before it leaves.','What are you putting off?','Something you would tell a friend at the Kaffeehaus…','What would make tomorrow lighter?'];
const str={cv:null,ctx:null,W:0,H:0,dpr:1,camX:0,scrub:false,arc:[0],arcKey:'',hist:{items:[],endS:START},byId:new Map(),
  draft:'',births:[],caret:0,focus:false,plucks:[],pops:new Map(),hover:null,sel:null,chip:null,dirty:true,last:0,drag:null,knots:[],
  draftL:null,draftKey:'',ghostL:null,ghostKey:'',trayTimer:0,wc:new Map(),amp:30,base:0,fsKey:0,inp:null,wrap:null,popBtn:null,jig:0,cx:0};
const FONT=fs=>'400 '+fs+'px Newsreader, Georgia, serif';
const strAmp=()=>3+settings.swing*.55;

function yAt(x){let y=0;const w=WAVES[settings.stringStyle];for(let i=0;i<w.length;i++)y+=w[i][0]*Math.sin(x*6.2832/w[i][1]+w[i][2]);return y*str.amp}
function dyAt(x){let y=0;const w=WAVES[settings.stringStyle];for(let i=0;i<w.length;i++)y+=w[i][0]*(6.2832/w[i][1])*Math.cos(x*6.2832/w[i][1]+w[i][2]);return y*str.amp}
function arcExtend(xMax){const a=str.arc;while(a.length*DX<xMax){const x0=(a.length-1)*DX,d=dyAt(x0+DX/2);a.push(a[a.length-1]+DX*Math.sqrt(1+d*d))}}
function sToX(s){
  const a=str.arc;arcExtend(s+12);
  let lo=0,hi=a.length-1;
  while(hi-lo>1){const m=(lo+hi)>>1;if(a[m]<=s)lo=m;else hi=m}
  const f=(s-a[lo])/Math.max(1e-6,a[hi]-a[lo]);return (lo+clamp(f,0,1))*DX;
}
function gw(ch){const k=ch;let w=str.wc.get(k);if(w==null){w=str.ctx.measureText(ch).width;str.wc.set(k,w)}return w}
function layoutText(text,startS){
  const c=str.ctx;c.font=FONT(settings.fontSize);
  const gl=[];let s=startS,u=0;
  for(const ch of text){
    const w=gw(ch),sc=s+w/2,x=sToX(sc);
    gl.push({ch,s:sc,w,x,a:Math.atan(dyAt(x)),u});
    s+=w+TRACK;u+=ch.length;
  }
  return {gl,end:s};
}
function strRelayout(){
  str.dirty=false;
  const key=settings.stringStyle+'|'+settings.swing;
  str.amp=strAmp();
  if(key!==str.arcKey){str.arcKey=key;str.arc=[0]}
  if(str.fsKey!==settings.fontSize){str.fsKey=settings.fontSize;str.wc.clear()}
  str.base=(str.H-STRIP)*.42;
  const b=book();let s=START;const items=[];str.byId.clear();
  for(const t of b.thoughts){
    const L=layoutText(t.text,s),ks=L.end+KPAD,kx=sToX(ks);
    const it={id:t.id,gl:L.gl,kx,xa:L.gl.length?L.gl[0].x:kx};
    items.push(it);str.byId.set(t.id,it);s=ks+KGAP;
  }
  str.hist={items,endS:s};str.draftKey='';str.ghostKey='';
}
function ensureDraft(){
  const key=str.draft+'|'+str.hist.endS+'|'+settings.fontSize+'|'+str.arcKey;
  if(str.draft){if(key!==str.draftKey){str.draftKey=key;str.draftL=layoutText(str.draft,str.hist.endS)}}
  else{
    const b=book(),p=PROMPTS[(new Date().getDate()+b.thoughts.length)%PROMPTS.length];
    const gk=p+'|'+key;
    if(gk!==str.ghostKey){str.ghostKey=gk;str.ghostL=layoutText(p,str.hist.endS)}
  }
}
function caretX(){
  const L=str.draft?str.draftL:null;
  if(!L||!L.gl.length||str.caret<=0)return sToX(str.hist.endS-4);
  for(let i=L.gl.length-1;i>=0;i--){const g=L.gl[i];if(g.u<str.caret)return sToX(g.s+g.w/2+TRACK/2)}
  return sToX(str.hist.endS-4);
}
function disp(x,T){
  let v=0;const P=str.plucks;
  for(let i=0;i<P.length;i++){
    const p=P[i],tt=T-p.t;if(tt<0)continue;
    const d=Math.abs(x-p.x),w=60+tt*80,e=(d-tt*480)/w;
    if(e>3||e<-3)continue;
    v+=p.a*Math.exp(-e*e)*Math.cos(e*2.4)*Math.exp(-tt*2.4);
  }
  return v;
}
const wig=()=>(settings.wiggle==null?70:settings.wiggle)/70;
function jigAt(x,T){
  if(str.jig<.01)return 0;
  const d=(x-str.cx)/300;
  return str.jig*7.5*wig()*Math.exp(-d*d)*Math.sin(x*.045-T*34);
}
const Y=(x,T)=>yAt(x)+(reduceMotion()?0:disp(x,T)+1.1*Math.sin(x/170+T*.9)+jigAt(x,T));
function addPluck(x,a){
  if(reduceMotion())return;
  const T=performance.now()/1000;
  str.plucks.push({x,t:T,a:a*wig()*(Math.random()<.5?-1:1)});
  if(str.plucks.length>28)str.plucks.shift();
}

/* ----- sizing ----- */
function sizeCanvas(o,wrap){
  const r=wrap.getBoundingClientRect();
  const dpr=Math.min(window.devicePixelRatio||1,2);
  const W=Math.max(0,Math.round(r.width)),H=Math.max(0,Math.round(r.height));
  if(W===o.W&&H===o.H&&dpr===o.dpr)return false;
  o.W=W;o.H=H;o.dpr=dpr;o.cv.width=Math.round(W*dpr);o.cv.height=Math.round(H*dpr);return true;
}

/* ----- drawing ----- */
/* a luggage tag under each knot: its name */
function tagFor(c,t,x,y,col){
  const hot0=str.hover===t.id||str.sel===t.id,name0=snip(titleOf(t),26),name=veil()&&!hot0?maskText(name0):name0;
  c.font='italic 500 15px "Bodoni Moda", Georgia, serif';
  const w=Math.ceil(c.measureText(name).width)+34,hh=26,rx=x-w/2,ry=y-hh/2;
  const hot=str.hover===t.id||str.sel===t.id;
  c.globalAlpha=1;
  c.fillStyle=hot?COL.panel2:COL.panel2;c.strokeStyle=hot?col:COL.edge2;c.lineWidth=hot?2:1.5;
  c.beginPath();c.roundRect?c.roundRect(rx,ry,w,hh,13):c.rect(rx,ry,w,hh);c.fill();c.stroke();
  c.fillStyle=col;c.beginPath();c.arc(rx+12,y,3.6,0,6.2832);c.fill();
  c.fillStyle=COL.ink;c.textAlign='left';c.textBaseline='middle';c.fillText(name,rx+22,y+.5);
  c.textBaseline='alphabetic';c.textAlign='center';c.font=FONT(settings.fontSize);
  return {x:rx,y:ry,w,h:hh};
}
function strFrame(now){
  const c=str.ctx,W=str.W,H=str.H;if(!W||!H)return;
  const dt=Math.min(.05,(now-str.last)/1000||.016);str.last=now;
  const T=now/1000,dpr=str.dpr,reduce=reduceMotion(),fs=settings.fontSize;
  if(str.dirty)strRelayout();
  ensureDraft();
  str.base=(H-STRIP)*.42;
  const cxw=caretX();str.cx=cxw;str.jig=str.jig>.01?str.jig*Math.exp(-dt*4.2):0;
  if(!str.scrub){
    const target=cxw-W*(str.draft?.56:.22);
    str.camX=reduce?target:str.camX+(target-str.camX)*(1-Math.exp(-dt*6));
  }
  const camX=str.camX,base=str.base;
  str.plucks=str.plucks.filter(p=>T-p.t<2.4);
  c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
  c.textAlign='center';c.textBaseline='alphabetic';c.font=FONT(fs);
  const x0=camX-60,x1=camX+W+60,b=book();
  const items=str.hist.items;

  /* staff lines and bar lines */
  if(settings.staff!==false){
    c.lineWidth=1;c.strokeStyle=COL.edge;c.globalAlpha=.9;
    const gap=26;
    for(let i=-2;i<=2;i++){const yy=Math.round(base+i*gap)+.5;c.beginPath();c.moveTo(0,yy);c.lineTo(W,yy);c.stroke()}
    const bar=420,i0=Math.floor((camX-60)/bar),i1=Math.ceil((camX+W+60)/bar);
    c.font='400 10px "DM Mono", ui-monospace, monospace';c.textAlign='left';c.fillStyle=COL.ink2;
    for(let i=Math.max(1,i0);i<=i1;i++){
      const xx=Math.round(i*bar-camX)+.5;
      c.globalAlpha=.9;c.beginPath();c.moveTo(xx,base-2*gap);c.lineTo(xx,base+2*gap);c.stroke();
      c.globalAlpha=.55;c.fillText(String(i),xx+5,base-2*gap-7);
    }
    c.globalAlpha=1;c.textAlign='center';c.font=FONT(fs);
  }

  /* loops between linked knots */
  c.lineWidth=1.3;
  for(const p of b.links){
    const A=str.byId.get(p[0]),B=str.byId.get(p[1]);if(!A||!B)continue;
    const xa=Math.min(A.kx,B.kx),xb=Math.max(A.kx,B.kx);
    if(xb<x0-80||xa>x1+80)continue;
    const dist=xb-xa,ya=base+Y(A.kx,T),yb=base+Y(B.kx,T);
    const depth=clamp(dist*.26,34,190);
    const hot=str.sel&&(p[0]===str.sel||p[1]===str.sel)||str.hover&&(p[0]===str.hover||p[1]===str.hover);
    c.strokeStyle=COL.accent;c.globalAlpha=hot?.9:clamp(1-dist/3200,.14,.42);c.lineWidth=hot?1.8:1.2;
    c.beginPath();c.moveTo(A.kx-camX,ya);c.quadraticCurveTo((A.kx+B.kx)/2-camX,(ya+yb)/2+depth*2,B.kx-camX,yb);c.stroke();
  }
  c.globalAlpha=1;

  /* the string itself */
  const look=settings.look;
  const trace=off=>{c.beginPath();for(let sx=-8;sx<=W+8;sx+=5){const x=sx+camX;const y=base+Y(x,T)+off(x);if(sx===-8)c.moveTo(sx,y);else c.lineTo(sx,y)}};
  if(look==='twine'){
    c.strokeStyle=COL.string;c.lineWidth=1.5;c.globalAlpha=.5;trace(x=>-1.5*Math.sin(x*.34));c.stroke();
    c.globalAlpha=.95;trace(x=>1.5*Math.sin(x*.34));c.stroke();
  }else if(look==='wire'){
    c.strokeStyle=COL.string;c.lineWidth=1.1;c.globalAlpha=1;c.shadowColor=COL.accent;c.shadowBlur=10;trace(()=>0);c.stroke();c.shadowBlur=0;
  }else{
    c.strokeStyle=COL.string;c.globalAlpha=.2;c.lineWidth=7;trace(()=>0);c.stroke();
    c.globalAlpha=.75;c.lineWidth=1;trace(()=>-3.5);c.stroke();trace(()=>3.5);c.stroke();
  }
  c.globalAlpha=1;

  /* glyph painter */
  const threaded=settings.place==='thread';
  const off=threaded?fs*.3:-fs*.2;
  const cafeOn=veil();
  const paint=(g,col,alpha,lift,sc,show)=>{
    const sx=g.x-camX;if(sx<-50||sx>W+50)return;
    const ch=cafeOn&&!show&&/[\p{L}\p{N}]/u.test(g.ch)?'•':g.ch;
    const a=g.a,cs=Math.cos(a)*sc,sn=Math.sin(a)*sc,o=off-lift,y=base+Y(g.x,T);
    c.setTransform(dpr*cs,dpr*sn,-dpr*sn,dpr*cs,dpr*(sx-Math.sin(a)*o),dpr*(y+Math.cos(a)*o));
    c.globalAlpha=alpha;
    if(threaded){c.strokeStyle=COL.panel;c.lineWidth=fs*.26;c.lineJoin='round';c.strokeText(ch,0,0)}
    c.fillStyle=col;c.fillText(ch,0,0);
  };
  const ease=p=>{const q=p-1;return 1+2.7*q*q*q+1.7*q*q};

  for(const it of items){
    if(it.kx<x0||it.xa>x1)continue;
    for(const g of it.gl){if(g.x<x0||g.x>x1)continue;const fade=clamp(1-(cxw-g.x)/(W*1.15),0,1);paint(g,COL.ink,.52+.4*fade,0,1,str.hover===it.id||str.sel===it.id)}
  }
  if(str.draft&&str.draftL){
    for(const g of str.draftL.gl){
      if(g.x<x0||g.x>x1)continue;
      const born=str.births[g.u];let p=1;
      if(born!=null&&!reduce)p=clamp((now-born)/320,0,1);
      const k=ease(p);
      paint(g,COL.ink,clamp(p*1.4,0,1),(1-k)*fs*.9,1,now-(str.lastInput||0)<2600);
    }
  }else if(str.ghostL){
    const al=.2+.08*Math.sin(T*1.6);
    for(const g of str.ghostL.gl){if(g.x<x0||g.x>x1)continue;paint(g,COL.string,al,0,1,true)}
  }
  c.setTransform(dpr,0,0,dpr,0,0);c.globalAlpha=1;

  /* knots */
  str.knots=[];
  for(const it of items){
    if(it.kx<x0||it.kx>x1)continue;
    const t=thoughtOf(b,it.id);if(!t)continue;
    const sx=it.kx-camX,sy=base+Y(it.kx,T),col=catCol(b,t);
    let r=7;const born=str.pops.get(it.id);
    if(born!=null&&!reduce){const p=clamp((T-born)/.7,0,1);r*=p<1?Math.max(0,ease(p)):1}
    const isHot=str.hover===it.id||str.sel===it.id;
    if(isHot)r+=2.2;
    const tag=tagFor(c,t,sx,sy+r+27,col);
    str.knots.push({id:it.id,sx,sy,tag});
    if(str.sel===it.id){c.globalAlpha=.28;c.fillStyle=COL.accent;c.beginPath();c.arc(sx,sy,r+7,0,6.2832);c.fill()}
    c.globalAlpha=.35;c.fillStyle='#000';c.beginPath();c.arc(sx,sy+1.8,r,0,6.2832);c.fill();
    c.globalAlpha=1;
    const gr=c.createRadialGradient(sx-r*.35,sy-r*.4,r*.1,sx,sy,r);gr.addColorStop(0,'#fff');gr.addColorStop(.25,col);gr.addColorStop(1,col);
    c.fillStyle=gr;c.beginPath();c.arc(sx,sy,r,0,6.2832);c.fill();
    c.lineWidth=2;c.strokeStyle=COL.panel;c.stroke();
    if(isHot){
      c.font='400 11px "DM Mono", ui-monospace, monospace';c.textAlign='center';
      const lab=catName(b,t)+'  ·  '+fmtFull.format(new Date(t.t));
      c.lineWidth=4;c.strokeStyle=COL.panel;c.lineJoin='round';c.strokeText(lab,sx,sy+r+54);c.fillStyle=COL.ink2;c.fillText(lab,sx,sy+r+54);
      c.font=FONT(fs);
    }
  }
  c.globalAlpha=1;

  /* caret: a needle with a bead on the string */
  {
    const sx=cxw-camX,sy=base+Y(cxw,T),a=Math.atan(dyAt(cxw));
    const alpha=str.focus?(reduce?1:.6+.4*Math.sin(T*4.2)):.35;
    c.setTransform(dpr*Math.cos(a),dpr*Math.sin(a),-dpr*Math.sin(a),dpr*Math.cos(a),dpr*sx,dpr*sy);
    c.globalAlpha=alpha;c.fillStyle=COL.accent;
    c.fillRect(-1,(threaded?-fs*.5:-fs*.95),2,fs*(threaded?.95:1.05));
    c.setTransform(dpr,0,0,dpr,0,0);
    c.globalAlpha=.35;c.beginPath();c.arc(sx,sy,9,0,6.2832);c.fill();
    c.globalAlpha=1;c.beginPath();c.arc(sx,sy,3.6,0,6.2832);c.fill();
  }

  /* overview strip */
  {
    const maxX=Math.max(cxw+W*.2,W),L=26,R=W-26,sy=H-STRIP/2-2,m=x=>L+clamp(x/maxX,0,1)*(R-L);
    c.globalAlpha=.35;c.strokeStyle=COL.ink2;c.lineWidth=1;c.beginPath();c.moveTo(L,sy);c.lineTo(R,sy);c.stroke();
    c.globalAlpha=1;
    for(const it of items){const t=thoughtOf(b,it.id);if(!t)continue;c.fillStyle=catCol(b,t);c.beginPath();c.arc(m(it.kx),sy,2.6,0,6.2832);c.fill()}
    const wa=m(camX),wb=m(camX+W);
    c.strokeStyle=COL.accent;c.globalAlpha=.8;c.lineWidth=1.4;
    c.beginPath();c.roundRect?c.roundRect(wa,sy-8,Math.max(10,wb-wa),16,6):c.rect(wa,sy-8,Math.max(10,wb-wa),16);c.stroke();
    c.globalAlpha=1;
    str.strip={L,R,maxX};
  }
  positionKnotPop();
}

/* ----- knot popover ----- */
function closeKnotPop(){str.sel=null;const p=$('#knotPop');if(p)p.hidden=true}
function openKnotPop(id){
  const b=book(),t=thoughtOf(b,id);if(!t){closeKnotPop();return}
  str.sel=id;const pop=$('#knotPop');
  const chips=b.cats.map(cat=>{const bt=h('button',{class:'chip',type:'button','aria-pressed':t.cat===cat.id?'true':'false',style:'--cc:var(--c'+cat.slot+')'},h('i'),cat.name);bt.addEventListener('click',()=>{t.cat=cat.id;changed({layout:false});openKnotPop(id)});return bt});
  const del=h('button',{class:'btn small danger',type:'button'},'Delete');armBtn(del,'Sure?',()=>removeThought(b,id));
  const n=degree(b,id);
  const ttl=h('h3',{class:'pop-title',tabindex:'0',role:'button',title:'Click to rename'},titleOf(t));
  const ren=()=>inlineTitle(t,ttl,()=>openKnotPop(id));
  ttl.addEventListener('click',ren);ttl.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ren()}});
  pop.replaceChildren(
    h('div',{class:'pop-top'},h('span',{class:'mono'},fmtFull.format(new Date(t.t))),h('span',{style:'display:flex;gap:6px'},starBtn(t),h('button',{class:'btn small icon-btn ghost',type:'button','aria-label':'Close',onclick:closeKnotPop},ico('x')))),
    ttl,
    h('p',{class:'pop-text'},t.text),
    h('div',{class:'pop-cats'},chips),
    h('div',{class:'pop-actions'},
      h('button',{class:'btn small',type:'button',onclick:()=>openPicker(id)},n?'Threads ('+n+')':'Pull a thread'),
      h('button',{class:'btn small',type:'button',onclick:()=>{notes.focus=id;notes.cat='all';notes.q='';go('notes')}},'In notes'),
      h('button',{class:'btn small',type:'button',onclick:()=>{web.focusId=id;go('web')}},'On web'),
      del));
  pop.hidden=false;positionKnotPop();
}
function positionKnotPop(){
  const pop=$('#knotPop');if(pop.hidden||!str.sel)return;
  const k=str.knots.find(k=>k.id===str.sel);
  if(!k){pop.style.visibility='hidden';return}
  pop.style.visibility='';
  const pw=pop.offsetWidth,ph=pop.offsetHeight;
  pop.style.left=clamp(k.sx-pw/2,10,Math.max(10,str.W-pw-10))+'px';
  const below=k.sy+58;
  pop.style.top=(below+ph>str.H-STRIP?Math.max(6,k.sy-ph-26):below)+'px';
}

/* ----- tray: thread suggestions after a knot ----- */
function showTray(t){
  const b=book(),tray=$('#tray');clearTimeout(str.trayTimer);
  if(b.thoughts.length<2){tray.hidden=true;return}
  const rel=related(b,t,3);
  const kids=[h('span',{class:'tray-lab'},rel.length?'These sound related. Pull a thread?':'Pull a thread to an earlier thought?')];
  for(const o of rel){
    const ch=h('button',{class:'chip lk',type:'button','aria-pressed':'false',style:'--cc:'+catVar(b,o)},h('i'),snip(o.text,36));
    ch.addEventListener('click',()=>{toggleLink(b,t.id,o.id);ch.setAttribute('aria-pressed',isLinked(b,t.id,o.id)?'true':'false');clearTimeout(str.trayTimer);str.trayTimer=setTimeout(()=>{tray.hidden=true},9000)});
    kids.push(ch);
  }
  kids.push(h('button',{class:'btn small',type:'button',onclick:()=>openPicker(t.id)},'Browse…'));
  kids.push(h('button',{class:'btn small icon-btn ghost',type:'button','aria-label':'Dismiss',onclick:()=>{tray.hidden=true}},ico('x')));
  tray.replaceChildren(...kids);tray.hidden=false;
  str.trayTimer=setTimeout(()=>{tray.hidden=true},16000);
}

/* ----- writing ----- */
function syncCaret(){str.caret=str.inp.selectionEnd==null?str.inp.value.length:str.inp.selectionEnd}
function updateBirths(old,nw,now){
  let p=0;const mx=Math.min(old.length,nw.length);
  while(p<mx&&old[p]===nw[p])p++;
  let s=0;while(s<mx-p&&old[old.length-1-s]===nw[nw.length-1-s])s++;
  const ins=nw.length-p-s,nb=str.births.slice(0,p);
  for(let i=0;i<ins;i++)nb.push(now);
  for(let i=old.length-s;i<old.length;i++)nb.push(str.births[i]);
  str.births=nb;
}
function onInput(ev){
  str.lastInput=performance.now();
  const inp=str.inp;let v=inp.value;
  if(/[\r\n]/.test(v)){const pos=inp.selectionEnd;v=v.replace(/\s*[\r\n]+\s*/g,' ');inp.value=v;inp.setSelectionRange(Math.min(pos,v.length),Math.min(pos,v.length))}
  updateBirths(str.draft,v,performance.now());
  str.draft=v;syncCaret();str.scrub=false;
  $('#tray').hidden=true;closeKnotPop();
  S.drafts[book().id]=v;if(!v)delete S.drafts[book().id];save();
  ensureDraft();
  if(ev&&ev.inputType){
    if(ev.inputType.startsWith('insert')){addPluck(caretX(),9+Math.random()*7);str.jig=Math.min(1.7,str.jig+.7)}
    else if(ev.inputType.startsWith('delete')){addPluck(caretX(),6);str.jig=Math.min(1.7,str.jig+.4)}
    Jazz.type(ev);
  }
  updateStrChrome();
}
function tie(){
  const inp=str.inp,text=inp.value.replace(/\s+/g,' ').trim();
  if(!text){inp.focus();return}
  if(settings.askName===false){
    const b=book();if(!b.cats.some(c=>c.id===str.chip))str.chip=b.cats.length?b.cats[0].id:null;
    commitKnot(text,autoTitle(text),str.chip,[]);return;
  }
  inp.blur();openNamer(text);
}
function updateStrChrome(){
  const b=book();
  $('#strStats').textContent=b.thoughts.length+(b.thoughts.length===1?' thought':' thoughts')+' · '+b.links.length+(b.links.length===1?' thread':' threads');
  const row=$('#catRow');
  if(!b.cats.some(c=>c.id===str.chip))str.chip=b.cats.length?b.cats[0].id:null;
  row.replaceChildren(h('span',{class:'lab'},'Next knot'),...b.cats.map(c=>{
    const bt=h('button',{class:'chip',type:'button','aria-pressed':str.chip===c.id?'true':'false',style:'--cc:var(--c'+c.slot+')'},h('i'),c.name);
    bt.addEventListener('click',()=>{str.chip=c.id;updateStrChrome();str.inp.focus()});return bt;
  }));
  $('#sampleBanner').hidden=!(b.sample&&!S.sampleDismissed);
  const coarse=window.matchMedia&&window.matchMedia('(pointer:coarse)').matches;
  $('#strHint').replaceChildren(...(coarse?['Tap the string to write · drag to look back']:['Type on the string · ',h('kbd',null,'Enter'),' ties a knot and names it · drag to look back']));
}
function enterString(opts){
  const b=book();
  str.draft=S.drafts[b.id]||'';str.inp.value=str.draft;str.births=[];str.caret=str.draft.length;
  str.dirty=true;str.scrub=false;$('#tray').hidden=true;str.knotHold=null;updateRail();
  if(!str.chip||!b.cats.some(c=>c.id===str.chip))str.chip=b.cats.length?b.cats[0].id:null;
  requestAnimationFrame(()=>{
    sizeCanvas(str,str.wrap);strRelayout();ensureDraft();
    if(opts&&opts.knot){const it=str.byId.get(opts.knot);if(it){str.scrub=true;str.camX=it.kx-str.W*.5;openKnotPop(opts.knot)}}
    else str.camX=caretX()-str.W*(str.draft?.56:.22);
    if(window.matchMedia&&window.matchMedia('(pointer:fine)').matches)str.inp.focus({preventScroll:true});
  });
  updateStrChrome();
}
function initString(){
  str.cv=$('#strCanvas');str.ctx=str.cv.getContext('2d');str.inp=$('#strInput');str.wrap=$('#strWrap');
  const inp=str.inp,cv=str.cv;
  inp.addEventListener('input',onInput);
  inp.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();if(!e.isComposing)tie();return}
    if(e.key==='Escape'){inp.blur();closeKnotPop();return}
    str.scrub=false;
  });
  const sc=()=>{syncCaret()};
  inp.addEventListener('keyup',sc);inp.addEventListener('click',sc);
  document.addEventListener('selectionchange',()=>{if(document.activeElement===inp)syncCaret()});
  inp.addEventListener('focus',()=>{str.focus=true});
  inp.addEventListener('blur',()=>{str.focus=false});
  $('#btnKnot').addEventListener('click',tie);
  $('#btnClear').addEventListener('click',()=>{inp.value='';str.draft='';str.births=[];str.caret=0;delete S.drafts[book().id];save();inp.focus()});
  $('#bannerNew').addEventListener('click',()=>{go('books');openBookForm(null)});
  $('#bannerX').addEventListener('click',()=>{S.sampleDismissed=true;save();updateStrChrome()});
  new ResizeObserver(()=>{if(sizeCanvas(str,str.wrap))str.dirty=true}).observe(str.wrap);

  const hit=(x,y)=>{let best=null,bd=18;for(const k of str.knots){const d=Math.hypot(k.sx-x,k.sy-y);if(d<bd){bd=d;best=k.id}if(k.tag&&x>=k.tag.x&&x<=k.tag.x+k.tag.w&&y>=k.tag.y&&y<=k.tag.y+k.tag.h&&bd>1){bd=1;best=k.id}}return best};
  const pt=e=>{const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]};
  const seek=x=>{const s=str.strip;if(!s)return;const f=clamp((x-s.L)/(s.R-s.L),0,1);str.scrub=true;str.camX=f*s.maxX-str.W/2};
  cv.addEventListener('pointerdown',e=>{
    const [x,y]=pt(e);cv.setPointerCapture(e.pointerId);
    str.drag={x,y,cam:str.camX,mode:y>str.H-STRIP?'strip':'maybe',id:e.pointerId};
    if(str.drag.mode==='strip')seek(x);
  });
  cv.addEventListener('pointermove',e=>{
    const [x,y]=pt(e),d=str.drag;
    if(d&&d.id===e.pointerId){
      if(d.mode==='strip'){seek(x)}
      else{
        if(d.mode==='maybe'&&Math.abs(x-d.x)>6)d.mode='drag';
        if(d.mode==='drag'){str.scrub=true;str.camX=d.cam-(x-d.x);cv.style.cursor='grabbing'}
      }
    }else{
      const k=hit(x,y);if(k!==str.hover){str.hover=k}
      cv.style.cursor=k?'pointer':(y>str.H-STRIP?'ew-resize':'text');
    }
  });
  const end=e=>{
    const d=str.drag;if(!d||d.id!==e.pointerId)return;str.drag=null;cv.style.cursor='text';
    if(d.mode==='maybe'){
      const [x,y]=pt(e),k=hit(x,y);
      if(k)openKnotPop(k);else{closeKnotPop();inp.focus({preventScroll:true})}
    }
  };
  cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',()=>{str.drag=null});
  cv.addEventListener('pointerleave',()=>{if(!str.drag)str.hover=null});
  cv.addEventListener('wheel',e=>{e.preventDefault();str.scrub=true;str.camX+=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)},{passive:false});
  document.fonts&&document.fonts.load&&document.fonts.load('400 30px Newsreader').then(()=>{str.wc.clear();str.dirty=true}).catch(()=>{});
  document.fonts&&document.fonts.ready&&document.fonts.ready.then(()=>{str.wc.clear();str.dirty=true});
}
/* ================= NOTES ================= */
const notes={cat:'all',q:'',sort:'new',mode:'cards',focus:null};
function segment(el,opts,value,onChange){
  el.replaceChildren(...opts.map(([v,l])=>{
    const b=h('button',{type:'button',role:'radio','aria-checked':v===value?'true':'false'},l);
    b.addEventListener('click',()=>{onChange(v);$$('button',el).forEach((x,i)=>x.setAttribute('aria-checked',opts[i][0]===v?'true':'false'))});
    return b;
  }));
}
function renderNotes(opts){
  const b=book(),body=$('#noteBody'),keep=opts&&opts.keepScroll?body.scrollTop:0;
  if(notes.cat!=='all'&&notes.cat!=='none'&&notes.cat!=='star'&&!b.cats.some(c=>c.id===notes.cat))notes.cat='all';
  renderNoteSide(b);
  segment($('#noteSort'),[['new','Newest'],['old','Oldest'],['linked','Most linked']],notes.sort,v=>{notes.sort=v;renderNoteBody(b)});
  segment($('#noteMode'),[['cards','Cards'],['cols','Columns']],notes.mode,v=>{notes.mode=v;renderNoteBody(b)});
  const s=$('#noteSearch');if(s.value!==notes.q)s.value=notes.q;
  renderNoteBody(b);
  body.scrollTop=keep;
  if(notes.focus){const id=notes.focus;notes.focus=null;flashCard(id)}
}
function flashCard(id){
  requestAnimationFrame(()=>{
    const el=$('#noteBody').querySelector('[data-id="'+id+'"]');
    if(el){el.scrollIntoView({block:'center',behavior:reduceMotion()?'auto':'smooth'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1800)}
  });
}
function renderNoteSide(b){
  const side=$('#noteSide');
  const count=c=>b.thoughts.filter(t=>c==='all'?true:c==='star'?!!t.star:c==='none'?!catOf(b,t):t.cat===c).length;
  const item=(id,name,slot,n)=>{
    const btn=h('button',{class:'catitem',type:'button','aria-pressed':notes.cat===id?'true':'false',style:'--cc:'+(slot==null?'var(--ink2)':'var(--c'+slot+')')},
      (id==='all'||id==='star')?null:h('i'),h('span',{class:'nm'},name),h('span',{class:'n'},String(n)));
    btn.addEventListener('click',()=>{notes.cat=id;renderNotes({keepScroll:false})});
    return btn;
  };
  const kids=[h('div',{class:'eyebrow'},'Categories'),h('div',{class:'catrow'},item('all','All knots',null,b.thoughts.length)),h('div',{class:'catrow'},item('star','★ Starred',null,count('star')))];
  for(const c of b.cats){
    const row=h('div',{class:'catrow'});
    const rn=h('button',{class:'btn',type:'button','aria-label':'Rename '+c.name,title:'Rename'},ico('pencil'));
    const dl=h('button',{class:'btn',type:'button','aria-label':'Delete '+c.name,title:'Delete category'},ico('x'));
    const sw=h('button',{class:'btn',type:'button','aria-label':'Change colour of '+c.name,title:'Change colour',style:'color:var(--c'+c.slot+')'},h('span',{class:'ico'},'●'));
    rn.addEventListener('click',()=>{
      const main=row.querySelector('.catitem'),inp=h('input',{class:'field',value:c.name,maxlength:'28','aria-label':'Category name',style:'height:34px;flex:1'});
      main.replaceWith(inp);inp.focus();inp.select();
      let done=false;const fin=ok=>{if(done)return;done=true;if(ok&&inp.value.trim()){c.name=inp.value.trim().slice(0,28);changed({layout:false})}else renderNotes({keepScroll:true})};
      inp.addEventListener('keydown',e=>{if(e.key==='Enter')fin(true);if(e.key==='Escape')fin(false)});inp.addEventListener('blur',()=>fin(true));
    });
    sw.addEventListener('click',()=>{c.slot=(c.slot+1)%8;changed({layout:false})});
    armBtn(dl,'✓',()=>{b.thoughts.forEach(t=>{if(t.cat===c.id)t.cat=null});b.cats=b.cats.filter(x=>x.id!==c.id);if(notes.cat===c.id)notes.cat='all';changed({layout:false})});
    row.append(item(c.id,c.name,c.slot,count(c.id)),h('span',{class:'catact'},sw,rn,dl));
    kids.push(row);
  }
  if(count('none'))kids.push(h('div',{class:'catrow'},item('none','Unsorted',null,count('none'))));
  const add=h('form',{class:'catadd'},h('input',{class:'field',placeholder:'New category','aria-label':'New category name',maxlength:'28'}),h('button',{class:'btn icon-btn',type:'submit','aria-label':'Add category'},ico('plus')));
  add.addEventListener('submit',e=>{
    e.preventDefault();const v=add.querySelector('input').value.trim();if(!v)return;
    const used=new Set(b.cats.map(c=>c.slot));let slot=[0,1,2,3,4,5,6,7].find(i=>!used.has(i));if(slot==null)slot=b.cats.length%8;
    b.cats.push({id:uid(),name:v.slice(0,28),slot});changed({layout:false});
  });
  kids.push(add);
  side.replaceChildren(...kids);
}
function filtered(b){
  const q=notes.q.trim().toLowerCase();
  let list=b.thoughts.filter(t=>(notes.cat==='all'||(notes.cat==='star'?!!t.star:notes.cat==='none'?!catOf(b,t):t.cat===notes.cat))&&(!q||t.text.toLowerCase().includes(q)||titleOf(t).toLowerCase().includes(q)||catName(b,t).toLowerCase().includes(q)));
  if(notes.sort==='old')list.sort((x,y)=>x.t-y.t);
  else if(notes.sort==='linked')list.sort((x,y)=>degree(b,y.id)-degree(b,x.id)||y.t-x.t);
  else list.sort((x,y)=>y.t-x.t);
  return list;
}
function renderNoteBody(b){
  const body=$('#noteBody'),list=filtered(b);
  if(!b.thoughts.length){
    body.replaceChildren(h('div',{class:'empty'},h('h3',null,'Nothing on the string yet'),h('p',null,'Knots you tie appear here with their names, ready to be sorted into categories and linked together.'),h('button',{class:'btn primary',type:'button',onclick:()=>go('string')},'Write the first one')));
    return;
  }
  if(!list.length){body.replaceChildren(h('div',{class:'empty'},h('h3',null,'No match'),h('p',null,'Try another word or category.')));return}
  if(notes.mode==='cols'){
    const cols=b.cats.map(c=>({id:c.id,name:c.name,slot:c.slot})).concat(b.thoughts.some(t=>!catOf(b,t))?[{id:null,name:'Unsorted',slot:null}]:[]);
    const wrap=h('div',{class:'cols'});
    for(const c of cols){
      const items=list.filter(t=>(c.id==null?!catOf(b,t):t.cat===c.id));
      const col=h('div',{class:'col',style:'--cc:'+(c.slot==null?'var(--ink2)':'var(--c'+c.slot+')')},h('div',{class:'col-head'},h('i'),c.name,h('span',{class:'n'},String(items.length))),...items.map(t=>noteCard(b,t,true)));
      col.addEventListener('dragover',e=>{e.preventDefault();col.classList.add('over')});
      col.addEventListener('dragleave',()=>col.classList.remove('over'));
      col.addEventListener('drop',e=>{e.preventDefault();col.classList.remove('over');const id=e.dataTransfer.getData('text/plain'),t=thoughtOf(b,id);if(t){t.cat=c.id;changed({layout:false})}});
      wrap.append(col);
    }
    body.replaceChildren(wrap);
  }else{
    body.replaceChildren(h('div',{class:'list'},list.map(t=>noteCard(b,t,false))));
  }
}
function noteCard(b,t,drag){
  const card=h('article',{class:'card','data-id':t.id,style:'--cc:'+catVar(b,t),draggable:drag?'true':null});
  if(drag){card.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',t.id);e.dataTransfer.effectAllowed='move'})}
  const chip=h('button',{class:'chip',type:'button','aria-haspopup':'menu','aria-label':'Category: '+catName(b,t)+'. Change.','aria-pressed':'true',style:'--cc:'+catVar(b,t)},h('i'),catName(b,t));
  chip.addEventListener('click',()=>catMenu(chip,b,t));
  const ttl=h('h3',{class:'ctitle',tabindex:'0',role:'button',title:'Click to rename'},titleOf(t));
  const ren=()=>inlineTitle(t,ttl,null);
  ttl.addEventListener('click',ren);ttl.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ren()}});
  const p=h('p',{class:'ctext',tabindex:'0',role:'button','aria-label':'Edit thought'},t.text);
  const edit=()=>{
    const ta=h('textarea',{class:'field',rows:'3','aria-label':'Edit thought'});ta.value=t.text;p.replaceWith(ta);ta.style.height='auto';ta.focus();
    const fit=()=>{ta.style.height='auto';ta.style.height=ta.scrollHeight+4+'px'};fit();ta.addEventListener('input',fit);
    let done=false;const fin=ok=>{if(done)return;done=true;const v=ta.value.replace(/\s+/g,' ').trim();if(ok&&v&&v!==t.text){t.text=v;changed({layout:true})}else ta.replaceWith(p)};
    ta.addEventListener('keydown',e=>{if(e.key==='Escape')fin(false);if(e.key==='Enter'&&(e.metaKey||e.ctrlKey))fin(true)});
    ta.addEventListener('blur',()=>fin(true));
  };
  p.addEventListener('click',edit);p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();edit()}});
  const links=h('div',{class:'links'},...neighbors(b,t.id).map(o=>{
    const l=h('button',{class:'chip lk',type:'button',title:'Jump to this thought',style:'--cc:'+catVar(b,o)},h('i'),snip(titleOf(o),28));
    l.addEventListener('click',()=>{notes.cat='all';notes.q='';notes.focus=o.id;renderNotes({keepScroll:false})});return l;
  }),h('button',{class:'chip',type:'button',onclick:()=>openPicker(t.id)},ico('plus'),neighbors(b,t.id).length?'Link':'Pull a thread'));
  const del=h('button',{class:'btn danger',type:'button'},'Delete');armBtn(del,'Sure?',()=>removeThought(b,t.id));
  card.append(h('div',{class:'card-top'},chip,h('time',{datetime:new Date(t.t).toISOString()},fmtFull.format(new Date(t.t)))),ttl,p,links,
    h('div',{class:'card-foot'},
      h('button',{class:'btn',type:'button',onclick:()=>{web.focusId=t.id;go('web')}},'On web'),
      h('button',{class:'btn',type:'button',onclick:()=>go('string',{knot:t.id})},'On string'),del,starBtn(t)));
  return card;
}
$('#noteSearch').addEventListener('input',e=>{notes.q=e.target.value;renderNoteBody(book())});
/* ================= WEB =================
   Every thought is a node, every thread an edge. Three arrangements share one small physics engine:
   Drift (organic), Clusters (grouped by category) and Score (lanes per category, left to right in time). */
const web={cv:null,ctx:null,wrap:null,W:0,H:0,dpr:1,nodes:[],byId:new Map(),edges:[],cam:{x:0,y:0,k:1},camT:null,layout:settings.webLayout,
  alpha:1,sel:null,hover:null,drag:null,linkFrom:null,q:'',hidden:new Set(),userCam:false,ticks:0,needSync:true,focusId:null,last:0,
  pointers:new Map(),pinch:null,centers:new Map(),lanes:[],rank:new Map(),scoreW:400,ptr:[0,0]};
const hexA=(hex,a)=>{const m=/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex||'');return m?'rgba('+parseInt(m[1],16)+','+parseInt(m[2],16)+','+parseInt(m[3],16)+','+a+')':hex};
const nodeR=n=>(5.5+Math.min(9,n.deg*1.7))*settings.nodeSize/100;
const wHidden=n=>web.hidden.has(n.cat||'none')||(web.isolate&&web.iso&&web.sel&&!web.iso.has(n.id));
const toWorld=(px,py)=>{const k=web.cam.k;return [(px-web.W/2)/k+web.cam.x,(py-web.H/2)/k+web.cam.y]};

function webSync(){
  const b=book();web.needSync=false;
  const old=web.byId,nodes=[],byId=new Map();
  b.thoughts.forEach((t,i)=>{
    let n=old.get(t.id);
    if(!n){
      const nb=neighbors(b,t.id).map(o=>old.get(o.id)).find(Boolean);
      const ang=nb?Math.random()*6.283:i*2.39996,rad=nb?46:30+26*Math.sqrt(i);
      n={id:t.id,x:(nb?nb.x:0)+Math.cos(ang)*rad,y:(nb?nb.y:0)+Math.sin(ang)*rad,vx:0,vy:0};
    }
    const c=catOf(b,t);
    n.t=t.t;n.cat=c?c.id:null;n.slot=c?c.slot:null;n.text=t.text;n.title=titleOf(t);n.star=!!t.star;n.lc=(n.title+' '+t.text).toLowerCase()+' '+(c?c.name.toLowerCase():'unsorted');n.deg=degree(b,t.id);
    nodes.push(n);byId.set(t.id,n);
  });
  web.nodes=nodes;web.byId=byId;
  web.edges=b.links.map(p=>[byId.get(p[0]),byId.get(p[1])]).filter(e=>e[0]&&e[1]);
  computeTargets(b);
  web.alpha=Math.max(web.alpha,.7);web.ticks=0;
  if(web.sel&&!byId.has(web.sel))web.sel=null;
  if(web.linkFrom&&!byId.has(web.linkFrom))web.linkFrom=null;
  renderLegend(b);renderDetail();updateWebStats();renderLinkBanner();
  $('#webEmpty').hidden=b.thoughts.length>0;
}
function computeTargets(b){
  const ids=b.cats.map(c=>c.id);if(b.thoughts.some(t=>!catOf(b,t)))ids.push(null);
  const m=Math.max(1,ids.length),R=130+Math.sqrt(web.nodes.length)*26;
  const nm=id=>id?b.cats.find(c=>c.id===id):{name:'Unsorted',slot:null};
  web.centers=new Map();
  ids.forEach((id,i)=>{const a=-Math.PI/2+i*(2*Math.PI/m),c=nm(id);web.centers.set(id,{x:Math.cos(a)*R*1.2,y:Math.sin(a)*R*.9,name:c.name,slot:c.slot})});
  web.lanes=ids.map((id,i)=>{const c=nm(id);return {id,y:(i-(m-1)/2)*98,name:c.name,slot:c.slot}});
  const sorted=web.nodes.slice().sort((a,c)=>a.t-c.t);web.rank=new Map();sorted.forEach((n,i)=>web.rank.set(n.id,i));
  web.scoreW=clamp(web.nodes.length*34,320,9000);
}
const LAB_W=new Map();
function labW(t){let w=LAB_W.get(t);if(w==null){w=Math.min(150,t.length*6.8+8);LAB_W.set(t,w);if(LAB_W.size>4000)LAB_W.clear()}return w}
function webStep(){
  const N=web.nodes,L=web.layout,a=Math.max(.15,web.alpha);if(!N.length)return;
  const grow=1+Math.log10(1+N.length/22)*.55,spc=clamp((settings.webSpacing||100)/100,.6,2.2)*grow;
  const rep=(L==='score'?42:L==='clusters'?58:78)*spc,rest=(L==='score'?120:L==='clusters'?80:112)*spc,n1=Math.max(1,N.length-1);
  for(const A of N){A.r=nodeR(A);A.fw=labW(snip(A.title,34))}
  for(let i=0;i<N.length;i++){
    const A=N[i];
    for(let j=i+1;j<N.length;j++){
      const B=N[j];let dx=A.x-B.x,dy=A.y-B.y,d2=dx*dx+dy*dy;
      if(d2>180000)continue;
      if(d2<1){dx=Math.random()-.5;dy=Math.random()-.5;d2=dx*dx+dy*dy+1}
      const d=Math.sqrt(d2),f=rep*a/d,fx=dx/d*f,fy=dy/d*f;
      A.vx+=fx;A.vy+=fy;B.vx-=fx;B.vy-=fy;
      if(d2<62500)collide(A,B,d,dx,dy,a);
    }
  }
  for(const [A,B] of web.edges){
    const dx=B.x-A.x,dy=B.y-A.y,d=Math.sqrt(dx*dx+dy*dy)||1,f=(d-rest)*.032*a,fx=dx/d*f,fy=dy/d*f;
    A.vx+=fx;A.vy+=fy;B.vx-=fx;B.vy-=fy;
  }
  for(const A of N){
    if(L==='drift'){const gg=.006/(grow*grow);A.vx-=A.x*gg;A.vy-=A.y*gg}
    else if(L==='clusters'){const c=web.centers.get(A.cat)||web.centers.get(null);if(c){A.vx+=(c.x-A.x)*.045;A.vy+=(c.y-A.y)*.045}A.vx-=A.x*.002;A.vy-=A.y*.002}
    else{
      const r=web.rank.get(A.id)||0,tx=(r/n1)*2*web.scoreW-web.scoreW;
      const lane=web.lanes.find(l=>l.id===A.cat)||web.lanes[0];
      A.vx+=(tx-A.x)*.08;if(lane)A.vy+=(lane.y-A.y)*.06;
    }
    if(web.drag&&web.drag.node===A&&web.drag.moved){A.vx=0;A.vy=0;continue}
    A.vx*=.78;A.vy*=.78;
    A.vx=clamp(A.vx,-26,26);A.vy=clamp(A.vy,-26,26);
    A.x+=A.vx;A.y+=A.vy;
  }
}
/* nodes never sit on top of each other, and a title never sits under a neighbouring knot or title */
function collide(A,B,d,dx,dy,a){
  const dragA=web.drag&&web.drag.node===A&&web.drag.moved,dragB=web.drag&&web.drag.node===B&&web.drag.moved;
  const wa=dragA?0:(dragB?1:.5),wb=dragB?0:(dragA?1:.5);
  const need=A.r+B.r+9;
  if(d<need){const ov=(need-d),ux=dx/d,uy=dy/d;A.x+=ux*ov*wa;A.y+=uy*ov*wa;B.x-=ux*ov*wb;B.y-=uy*ov*wb}
  /* title boxes (right of each knot) */
  const ax0=A.x+A.r+5,ax1=ax0+A.fw,bx0=B.x+B.r+5,bx1=bx0+B.fw,H=10,sf=.34;
  /* A's title vs B's body */
  let px=Math.min(ax1+B.r-B.x,B.x-(ax0-B.r)),py=Math.min(A.y+H+B.r-B.y,B.y-(A.y-H-B.r));
  if(px>0&&py>0){const sg=B.y>=A.y?1:-1;if(py<px){B.y+=sg*py*sf*wb*2;A.y-=sg*py*sf*wa*2}else{const sx=B.x>=A.x+A.fw/2?1:-1;B.x+=sx*px*sf*.5*wb*2;A.x-=sx*px*sf*.5*wa*2}}
  px=Math.min(bx1+A.r-A.x,A.x-(bx0-A.r));py=Math.min(B.y+H+A.r-A.y,A.y-(B.y-H-A.r));
  if(px>0&&py>0){const sg=A.y>=B.y?1:-1;if(py<px){A.y+=sg*py*sf*wa*2;B.y-=sg*py*sf*wb*2}else{const sx=A.x>=B.x+B.fw/2?1:-1;A.x+=sx*px*sf*.5*wa*2;B.x-=sx*px*sf*.5*wb*2}}
  /* title vs title */
  px=Math.min(ax1-bx0,bx1-ax0);py=Math.min(A.y+H-(B.y-H),B.y+H-(A.y-H));
  if(px>0&&py>0){const sg=B.y>=A.y?1:-1,m=(py<px*.9?py:0)*sf;B.y+=sg*(m||py*.2)*wb*2;A.y-=sg*(m||py*.2)*wa*2}
}
function webFit(animate){
  const vis=web.nodes.filter(n=>!wHidden(n));
  if(!vis.length||!web.W)return;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const n of vis){x0=Math.min(x0,n.x);x1=Math.max(x1,n.x);y0=Math.min(y0,n.y);y1=Math.max(y1,n.y)}
  if(web.layout==='score'){x0=Math.min(x0,-web.scoreW-90);y0=Math.min(y0,web.lanes[0]?web.lanes[0].y-40:y0);y1=Math.max(y1,web.lanes.length?web.lanes[web.lanes.length-1].y+40:y1)}
  const bw=x1-x0,bh=y1-y0;
  const k=clamp(Math.min(web.W/(bw+220),web.H/(bh+220)),.1,1.45);
  const t={x:(x0+x1)/2,y:(y0+y1)/2,k};
  if(animate&&!reduceMotion())web.camT=t;else{web.cam={x:t.x,y:t.y,k:t.k};web.camT=null}
}
function webFocus(id){
  const n=web.byId.get(id);if(!n)return;
  web.userCam=true;const t={x:n.x,y:n.y,k:Math.max(web.cam.k,1.1)};
  if(reduceMotion())web.cam=t;else web.camT=t;
}
function webFrame(now){
  const c=web.ctx,W=web.W,H=web.H;if(!W||!H)return;
  const dt=Math.min(.05,(now-web.last)/1000||.016);web.last=now;
  const T=now/1000,dpr=web.dpr;
  if(web.needSync)webSync();
  if(web.drag&&web.drag.moved)web.alpha=Math.max(web.alpha,.3);
  if(web.alpha>.02){
    webStep();web.alpha*=.985;web.ticks++;
    if(!web.userCam&&web.ticks%8===1)webFit(true);
  }
  const cam=web.cam;
  if(web.camT){
    const e=reduceMotion()?1:1-Math.exp(-dt*6),t=web.camT;
    cam.x+=(t.x-cam.x)*e;cam.y+=(t.y-cam.y)*e;cam.k+=(t.k-cam.k)*e;
    if(Math.abs(t.x-cam.x)<.4&&Math.abs(t.y-cam.y)<.4&&Math.abs(t.k-cam.k)<.002){cam.x=t.x;cam.y=t.y;cam.k=t.k;web.camT=null}
  }
  const k=cam.k,tx=W/2-cam.x*k,ty=H/2-cam.y*k,q=web.q.trim().toLowerCase(),sel=web.sel;
  c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
  {
    let step=44*k;while(step<22)step*=2;
    const ox=((tx%step)+step)%step,oy=((ty%step)+step)%step;
    c.fillStyle=COL.edge;c.globalAlpha=.9;
    for(let gx=ox;gx<W;gx+=step)for(let gy=oy;gy<H;gy+=step)c.fillRect(Math.round(gx)-1,Math.round(gy)-1,2,2);
    c.globalAlpha=1;
  }
  c.setTransform(dpr*k,0,0,dpr*k,dpr*tx,dpr*ty);
  const nbSet=new Set();
  if(sel)for(const [A,B] of web.edges){if(A.id===sel)nbSet.add(B.id);else if(B.id===sel)nbSet.add(A.id)}

  /* layout backdrops */
  if(web.layout==='clusters'){
    for(const [id,ct] of web.centers){
      const col=ct.slot==null?COL.ink2:COL.c[ct.slot],g=c.createRadialGradient(ct.x,ct.y,0,ct.x,ct.y,170);
      g.addColorStop(0,hexA(col,.16));g.addColorStop(1,hexA(col,0));c.fillStyle=g;c.beginPath();c.arc(ct.x,ct.y,170,0,6.2832);c.fill();
    }
  }else if(web.layout==='score'){
    c.strokeStyle=COL.ink2;c.globalAlpha=.28;c.lineWidth=1/Math.max(.5,k);
    for(const l of web.lanes){c.beginPath();c.moveTo(-web.scoreW-110,l.y);c.lineTo(web.scoreW+110,l.y);c.stroke()}
    c.globalAlpha=1;
  }

  /* threads */
  c.lineCap='round';
  for(const [A,B] of web.edges){
    if(wHidden(A)||wHidden(B))continue;
    const hot=sel&&(A.id===sel||B.id===sel),dim=sel&&!hot;
    const mx=(A.x+B.x)/2,my=(A.y+B.y)/2,dx=B.x-A.x,dy=B.y-A.y;
    c.strokeStyle=hot?COL.accent:COL.string;c.globalAlpha=hot?.95:dim?.07:.36;c.lineWidth=(hot?2.2:1.2)/Math.max(.6,k);
    c.beginPath();c.moveTo(A.x,A.y);c.quadraticCurveTo(mx-dy*.12,my+dx*.12,B.x,B.y);c.stroke();
  }
  c.globalAlpha=1;
  if(web.linkFrom){
    const A=web.byId.get(web.linkFrom);
    if(A){c.setLineDash([6/k,6/k]);c.strokeStyle=COL.accent;c.lineWidth=1.6/Math.max(.6,k);c.beginPath();c.moveTo(A.x,A.y);const [wx,wy]=toWorld(web.ptr[0],web.ptr[1]);c.lineTo(wx,wy);c.stroke();c.setLineDash([])}
  }

  /* nodes */
  const ring=1.8/Math.max(.7,k);
  for(const n of web.nodes){
    if(wHidden(n))continue;
    const r=nodeR(n),col=n.slot==null?COL.ink2:COL.c[n.slot];
    const dim=(sel&&n.id!==sel&&!nbSet.has(n.id))||(q&&!n.lc.includes(q));
    c.globalAlpha=dim?.2:1;
    if(n.id===sel){
      c.globalAlpha=.22+.1*Math.sin(T*3);c.fillStyle=COL.accent;c.beginPath();c.arc(n.x,n.y,r+11,0,6.2832);c.fill();c.globalAlpha=1;
    }
    c.fillStyle=col;c.beginPath();c.arc(n.x,n.y,r,0,6.2832);c.fill();
    c.lineWidth=ring;c.strokeStyle=n.id===sel?COL.accent:(n.id===web.hover?COL.ink:COL.panel);c.stroke();
    if(n.star&&n.id!==sel){c.lineWidth=ring*1.2;c.strokeStyle=COL.c[5];c.beginPath();c.arc(n.x,n.y,r+4,0,6.2832);c.stroke()}
    if(n.id===web.linkFrom){c.setLineDash([3/k,3/k]);c.strokeStyle=COL.accent;c.beginPath();c.arc(n.x,n.y,r+5,0,6.2832);c.stroke();c.setLineDash([])}
    if(n.id!==sel&&!dim){c.globalAlpha=.55;c.fillStyle='#fff';c.beginPath();c.arc(n.x-r*.3,n.y-r*.35,r*.22,0,6.2832);c.fill()}
  }
  c.globalAlpha=1;

  /* labels in screen space */
  c.setTransform(dpr,0,0,dpr,0,0);
  c.textBaseline='middle';c.textAlign='left';
  if(web.layout==='clusters'){
    c.font='400 11px "DM Mono", ui-monospace, monospace';c.textAlign='center';
    for(const [id,ct] of web.centers){const sx=ct.x*k+tx,sy=ct.y*k+ty-150*k*.5;c.fillStyle=ct.slot==null?COL.ink2:COL.c[ct.slot];c.globalAlpha=.9;c.fillText(ct.name.toUpperCase(),sx,sy-6)}
    c.textAlign='left';c.globalAlpha=1;
  }else if(web.layout==='score'){
    c.font='400 11px "DM Mono", ui-monospace, monospace';
    for(const l of web.lanes){const sx=(-web.scoreW-110)*k+tx,sy=l.y*k+ty;c.fillStyle=l.slot==null?COL.ink2:COL.c[l.slot];c.fillText(l.name.toUpperCase(),Math.max(10,sx),sy-12)}
  }
  c.font='italic 500 15px "Bodoni Moda", Georgia, serif';
  const mode=settings.labels,cafe=veil();
  /* every title gets a spot that no knot and no other title occupies; the most important ones choose first */
  const grid=new Map(),CS=80,boxes=[];
  const cellsOf=(x0,y0,x1,y1,fn)=>{for(let gx=Math.floor(x0/CS);gx<=Math.floor(x1/CS);gx++)for(let gy=Math.floor(y0/CS);gy<=Math.floor(y1/CS);gy++)fn(gx+','+gy)};
  const put=bx=>{boxes.push(bx);cellsOf(bx[0],bx[1],bx[2],bx[3],key=>{let l=grid.get(key);if(!l)grid.set(key,l=[]);l.push(bx)})};
  const free=(x0,y0,x1,y1)=>{let ok=true;cellsOf(x0,y0,x1,y1,key=>{if(!ok)return;const l=grid.get(key);if(l)for(const o of l)if(x0<o[2]&&x1>o[0]&&y0<o[3]&&y1>o[1]){ok=false;return}});return ok};
  const cands=[];
  for(const n of web.nodes){
    if(wHidden(n))continue;
    const sx=n.x*k+tx,sy=n.y*k+ty,r=nodeR(n)*k;
    if(sx<-260||sx>W+260||sy<-30||sy>H+30)continue;
    put([sx-r-2,sy-r-2,sx+r+2,sy+r+2]);
    const dim=(sel&&n.id!==sel&&!nbSet.has(n.id))||(q&&!n.lc.includes(q));
    const must=n.id===sel||n.id===web.hover;
    const pri=must?1e7:nbSet.has(n.id)?5e6:(q&&!dim)?4e6:0;
    let want=pri>0;
    if(!want&&!dim&&mode!=='off')want=mode==='always'?k>.18:k>.42;
    if(!want)continue;
    cands.push({n,sx,sy,r,dim,must,pri:pri+(n.star?9e4:0)+n.deg*2e3+n.t/1e11});
  }
  cands.sort((a,b)=>b.pri-a.pri);
  c.lineJoin='round';
  for(const cd of cands){
    const n=cd.n,reveal=!cafe||n.id===web.hover||n.id===sel&&false;
    const raw=snip(n.title,34),txt=reveal?raw:maskText(raw),tw=c.measureText(txt).width,hh=19,r=cd.r,sx=cd.sx,sy=cd.sy;
    const opts=[[sx+r+7,sy],[sx-r-7-tw,sy],[sx-tw/2,sy+r+14],[sx-tw/2,sy-r-14],[sx+r+3,sy+r+13],[sx-r-3-tw,sy+r+13],[sx+r+3,sy-r-13],[sx-r-3-tw,sy-r-13]];
    let pick=null;
    for(const o of opts){if(free(o[0]-3,o[1]-hh/2,o[0]+tw+3,o[1]+hh/2)){pick=o;break}}
    if(!pick){if(!cd.must)continue;pick=opts[0]}
    put([pick[0]-3,pick[1]-hh/2,pick[0]+tw+3,pick[1]+hh/2]);
    c.globalAlpha=cd.dim?.3:1;c.lineWidth=5;c.strokeStyle=COL.panel;c.strokeText(txt,pick[0],pick[1]);
    c.fillStyle=COL.ink;c.fillText(txt,pick[0],pick[1]);
  }
  c.globalAlpha=1;
}

/* ----- side UI ----- */
function updateWebStats(){
  const p=new Map(web.nodes.map(n=>[n.id,n.id]));
  const f=x=>{while(p.get(x)!==x){p.set(x,p.get(p.get(x)));x=p.get(x)}return x};
  for(const [a,b] of web.edges)p.set(f(a.id),f(b.id));
  const isl=new Set(web.nodes.map(n=>f(n.id))).size;
  $('#webStats').textContent=web.nodes.length+(web.nodes.length===1?' thought':' thoughts')+' · '+web.edges.length+(web.edges.length===1?' thread':' threads')+(web.nodes.length?' · '+isl+(isl===1?' island':' islands'):'');
}
function renderLegend(b){
  const leg=$('#webLegend');
  const items=b.cats.map(c=>({id:c.id,name:c.name,slot:c.slot}));
  if(b.thoughts.some(t=>!catOf(b,t)))items.push({id:'none',name:'Unsorted',slot:null});
  leg.replaceChildren(...items.map(c=>{
    const n=b.thoughts.filter(t=>c.id==='none'?!catOf(b,t):t.cat===c.id).length;
    const btn=h('button',{class:'chip',type:'button','aria-pressed':web.hidden.has(c.id)?'false':'true',style:'--cc:'+(c.slot==null?'var(--ink2)':'var(--c'+c.slot+')')},h('i'),c.name+' '+n);
    btn.addEventListener('click',()=>{if(web.hidden.has(c.id))web.hidden.delete(c.id);else web.hidden.add(c.id);if(web.sel){const sn=web.byId.get(web.sel);if(sn&&wHidden(sn))web.sel=null}renderLegend(b);renderDetail();updateWebStats()});
    return btn;
  }));
}
function renderLinkBanner(){
  const el=$('#linkBanner'),b=book();
  if(!web.linkFrom){el.hidden=true;return}
  const t=thoughtOf(b,web.linkFrom);if(!t){web.linkFrom=null;el.hidden=true;return}
  el.replaceChildren(h('span',null,'Pull a thread from “'+snip(titleOf(t),28)+'”. Click knots to tie or untie.'),h('button',{class:'btn',type:'button',onclick:()=>{web.linkFrom=null;renderLinkBanner();renderDetail()}},'Done'));
  el.hidden=false;
}
function selectNode(id,focus){
  web.sel=id;web.iso=new Set([id,...neighbors(book(),id)]);web.userCam=true;renderDetail();
  if(focus)webFocus(id);
}
function renderDetail(){
  const el=$('#webDetail'),b=book(),t=web.sel?thoughtOf(b,web.sel):null;
  if(!t){el.hidden=true;return}
  const nb=neighbors(b,t.id);
  const chip=h('button',{class:'chip',type:'button','aria-haspopup':'menu','aria-pressed':'true',style:'--cc:'+catVar(b,t)},h('i'),catName(b,t));
  chip.addEventListener('click',()=>catMenu(chip,b,t));
  const list=nb.map(o=>{const l=h('button',{class:'chip',type:'button',style:'--cc:'+catVar(b,o)},h('i'),titleOf(o));l.addEventListener('click',()=>selectNode(o.id,true));return l});
  const ttl=h('h3',{class:'d-title',tabindex:'0',role:'button',title:'Click to rename'},titleOf(t));
  const ren=()=>inlineTitle(t,ttl,()=>renderDetail());
  ttl.addEventListener('click',ren);ttl.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ren()}});
  el.replaceChildren(
    h('div',{class:'d-top'},chip,h('span',{style:'display:flex;gap:6px'},starBtn(t),h('button',{class:'btn small icon-btn ghost',type:'button','aria-label':'Close',onclick:()=>{web.sel=null;renderDetail()}},ico('x')))),
    ttl,
    h('p',{class:'d-text'},snip(t.text,220)),
    h('div',{class:'mono'},fmtFull.format(new Date(t.t))),
    h('div',null,h('div',{class:'eyebrow',style:'margin-bottom:8px'},nb.length?'Connected ('+nb.length+')':'Not connected yet'),nb.length?h('div',{class:'d-list'},list):null),
    h('div',{class:'d-actions'},
      h('button',{class:'btn small primary',type:'button',onclick:()=>{web.linkFrom=t.id;renderLinkBanner();toast('Click another knot to tie a thread')}},'Pull a thread'),
      h('button',{class:'btn small',type:'button',onclick:()=>openPicker(t.id)},'Browse…'),
      h('button',{class:'btn small',type:'button','aria-pressed':web.isolate?'true':'false',title:'Hide everything that is not connected to this knot',onclick:()=>{web.isolate=!web.isolate;web.userCam=true;webFit(true);renderDetail()}},web.isolate?'Show all':'Isolate')),
    h('div',{class:'d-actions'},
      h('button',{class:'btn small ghost',type:'button',onclick:()=>{notes.focus=t.id;notes.cat='all';notes.q='';go('notes')}},'Edit in notes'),
      h('button',{class:'btn small ghost',type:'button',onclick:()=>go('string',{knot:t.id})},'On string')));
  el.hidden=false;
}
function clickNode(n){
  const b=book();
  if(web.linkFrom&&n.id!==web.linkFrom){
    const was=isLinked(b,web.linkFrom,n.id);toggleLink(b,web.linkFrom,n.id);toast(was?'Thread removed':'Thread tied');
    web.alpha=Math.max(web.alpha,.6);return;
  }
  selectNode(n.id,false);
}
function webHit(px,py){
  const [wx,wy]=toWorld(px,py),k=web.cam.k;let best=null,bd=1e9;
  for(const n of web.nodes){if(wHidden(n))continue;const d=Math.hypot(n.x-wx,n.y-wy);if(d<nodeR(n)+9/k&&d<bd){bd=d;best=n}}
  return best;
}
function zoomBy(f,px,py){
  const cam=web.cam,k0=cam.k,k1=clamp(k0*f,.08,3.6),[wx,wy]=toWorld(px,py);
  cam.k=k1;cam.x=wx-(px-web.W/2)/k1;cam.y=wy-(py-web.H/2)/k1;web.userCam=true;web.camT=null;
}
function enterWeb(){
  web.needSync=true;web.userCam=false;web.ticks=0;web.alpha=Math.max(web.alpha,.6);
  requestAnimationFrame(()=>{
    sizeCanvas(web,web.wrap);webSync();webFit(false);
    if(web.focusId){const id=web.focusId;web.focusId=null;if(web.byId.has(id)){selectNode(id,false);webFocus(id)}}
  });
  segment($('#webLayout'),[['drift','Drift'],['clusters','Clusters'],['score','Score']],web.layout,v=>{
    web.layout=v;settings.webLayout=v;saveSettings();web.alpha=1;web.ticks=0;web.userCam=false;computeTargets(book());webFit(true);
  });
}
function initWeb(){
  web.cv=$('#webCanvas');web.ctx=web.cv.getContext('2d');web.wrap=$('#webWrap');
  const empty=h('div',{class:'empty',id:'webEmpty',hidden:true,style:'position:absolute;left:0;right:0;top:0;z-index:1;padding:0 20px'},h('h3',null,'Your web starts with a thread'),h('p',null,'Write a few thoughts on the string, then link them. The web grows from the threads you tie.'),h('button',{class:'btn primary',type:'button',onclick:()=>go('string')},'Go to the string'));
  web.wrap.append(empty);
  const cv=web.cv;
  new ResizeObserver(()=>{if(sizeCanvas(web,web.wrap)&&!web.userCam)webFit(false)}).observe(web.wrap);
  const pt=e=>{const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]};
  cv.addEventListener('pointerdown',e=>{
    const [x,y]=pt(e);cv.setPointerCapture(e.pointerId);web.pointers.set(e.pointerId,{x,y});
    if(web.pointers.size===2){
      const [a,b]=[...web.pointers.values()];web.pinch={d:Math.hypot(a.x-b.x,a.y-b.y)||1,k:web.cam.k};web.drag=null;return;
    }
    const n=webHit(x,y);
    web.drag=n?{node:n,moved:false,sx:x,sy:y}:{pan:true,moved:false,sx:x,sy:y,cx:web.cam.x,cy:web.cam.y};
    web.camT=null;
  });
  cv.addEventListener('pointermove',e=>{
    const [x,y]=pt(e);web.ptr=[x,y];
    if(web.pointers.has(e.pointerId))web.pointers.set(e.pointerId,{x,y});
    if(web.pinch&&web.pointers.size>=2){
      const [a,b]=[...web.pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y)||1;
      zoomBy(clamp(web.pinch.k*d/web.pinch.d,.22,3.6)/web.cam.k,(a.x+b.x)/2,(a.y+b.y)/2);return;
    }
    const d=web.drag;
    if(d){
      if(!d.moved&&Math.hypot(x-d.sx,y-d.sy)>5)d.moved=true;
      if(d.moved&&d.node){const [wx,wy]=toWorld(x,y);d.node.x=wx;d.node.y=wy;d.node.vx=0;d.node.vy=0;cv.style.cursor='grabbing'}
      else if(d.moved&&d.pan){web.cam.x=d.cx-(x-d.sx)/web.cam.k;web.cam.y=d.cy-(y-d.sy)/web.cam.k;web.userCam=true;cv.style.cursor='grabbing'}
    }else if(e.pointerType==='mouse'){
      const n=webHit(x,y);web.hover=n?n.id:null;cv.style.cursor=n?'pointer':(web.linkFrom?'crosshair':'grab');
    }
  });
  const up=e=>{
    web.pointers.delete(e.pointerId);if(web.pointers.size<2)web.pinch=null;
    const d=web.drag;web.drag=null;cv.style.cursor='grab';
    if(!d||d.moved)return;
    if(d.node)clickNode(d.node);
    else if(!web.linkFrom){web.sel=null;renderDetail()}
  };
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',e=>{web.pointers.delete(e.pointerId);web.pinch=null;web.drag=null});
  cv.addEventListener('pointerleave',()=>{web.hover=null});
  cv.addEventListener('wheel',e=>{e.preventDefault();const [x,y]=pt(e);zoomBy(Math.exp(-e.deltaY*.0016),x,y)},{passive:false});
  $('#zoomIn').addEventListener('click',()=>zoomBy(1.3,web.W/2,web.H/2));
  $('#zoomOut').addEventListener('click',()=>zoomBy(1/1.3,web.W/2,web.H/2));
  $('#zoomFit').addEventListener('click',()=>{web.userCam=false;webFit(true)});
  $('#webSearch').addEventListener('input',e=>{web.q=e.target.value});
}
/* ================= BRAIN BOOKS: designable, fully 3D hardbacks ================= */
const BW=196,SG=18;
const MATS=[['cloth','Cloth'],['leather','Leather'],['paper','Paper'],['velvet','Velvet'],['metal','Foil']];
const PATS=[['none','Plain'],['stripes','Stripes'],['dots','Dots'],['grid','Grid'],['checks','Checks'],['rays','Rays'],['waves','Waves'],['diamonds','Diamonds']];
const FRAMES=[['none','None'],['single','Single'],['double','Double'],['stitch','Stitched']];
const TFONTS=[['display','Bodoni'],['serif','Serif'],['sans','Sans'],['mono','Mono']];
const BASES=['#8e2f3d','#c2562d','#d9a441','#6f8f3f','#2f7a63','#2d6a8f','#33478a','#6b3f8f','#d97b8f','#3a2f2a','#1d1d22','#e9dcc0'];
const INKS=['#f3d894','#fff3df','#ffffff','#1d1410','#e8785a'];
const hex2rgb=x=>{const m=/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(x||'');return m?[parseInt(m[1],16),parseInt(m[2],16),parseInt(m[3],16)]:[128,128,128]};
const rgb2hex=(r,g,b)=>'#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
const mixHex=(a,b,t)=>{const x=hex2rgb(a),y=hex2rgb(b);return rgb2hex(lerp(x[0],y[0],t),lerp(x[1],y[1],t),lerp(x[2],y[2],t))};
const isHex=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
function defaultCover(hue,emblem){
  const src=COL.c&&isHex(COL.c[hue])?COL.c[hue]:'#c2562d';
  return {mat:'cloth',base:mixHex(src,'#000000',.2),pat:'none',pc:'#ffffff',frame:'single',tcol:'#f3d894',tfont:'display',tpos:'top',talign:'left',tsize:12.5,
    spine:null,spineText:true,ribbon:'#f2708f',thick:32,
    back:{base:null,pat:null,text:'',tfont:'serif',tcol:null,tsize:5.2},
    items:[{id:uid(),face:'front',type:'emb',e:emblem||'note',x:27,y:82,s:19,r:0,c:null},{id:uid(),face:'back',type:'txt',t:'mind.',f:'display',x:50,y:90,s:9,r:0,c:null}]};
}
function normCover(c,b){
  const d=defaultCover(b.hue,b.emblem);
  if(!c||typeof c!=='object')return d;
  const one=(v,list,f)=>list.includes(v)?v:f;
  const fonts=TFONTS.map(f=>f[0]);
  const out={mat:one(c.mat,MATS.map(m=>m[0]),'cloth'),base:isHex(c.base)?c.base:d.base,pat:one(c.pat,PATS.map(m=>m[0]),'none'),pc:isHex(c.pc)?c.pc:'#ffffff',
    frame:one(c.frame,FRAMES.map(m=>m[0]),'single'),tcol:isHex(c.tcol)?c.tcol:d.tcol,tfont:one(c.tfont,fonts,'display'),tpos:one(c.tpos,['top','middle','bottom'],'top'),
    talign:one(c.talign,['left','center'],'left'),tsize:clamp(+c.tsize||12.5,8,20),spine:isHex(c.spine)?c.spine:null,spineText:c.spineText!==false,
    ribbon:isHex(c.ribbon)?c.ribbon:null,thick:clamp(+c.thick||32,20,52)};
  const bk=c.back||{};
  out.back={base:isHex(bk.base)?bk.base:null,pat:PATS.some(p=>p[0]===bk.pat)?bk.pat:null,text:String(bk.text||'').slice(0,240),tfont:one(bk.tfont,fonts,'serif'),tcol:isHex(bk.tcol)?bk.tcol:null,tsize:clamp(+bk.tsize||5.2,3,10)};
  out.items=(Array.isArray(c.items)?c.items:[]).slice(0,28).filter(i=>i&&(i.face==='front'||i.face==='back')).map(i=>({
    id:String(i.id||uid()),face:i.face,type:i.type==='txt'?'txt':'emb',e:EMB[i.e]?i.e:'note',t:String(i.t||'').slice(0,40),f:one(i.f,fonts,'display'),
    x:clamp(+i.x||50,0,100),y:clamp(+i.y||50,0,100),s:clamp(+i.s||14,3,60),r:clamp(+i.r||0,-180,180),c:isHex(i.c)?i.c:null}));
  return out;
}
const getCover=bk=>bk.cover||defaultCover(bk.hue,bk.emblem);
const cloneCover=c=>JSON.parse(JSON.stringify(c));

function patBg(p,pc,a){
  const col=hexA(pc,a==null?.3:a),enc=encodeURIComponent;
  switch(p){
    case 'stripes':return 'repeating-linear-gradient(90deg,'+col+' 0 4cqw,transparent 4cqw 11cqw)';
    case 'dots':return 'radial-gradient(circle at 50% 50%,'+col+' 1.5cqw,transparent 1.7cqw) 0 0/9cqw 9cqw';
    case 'grid':return 'linear-gradient('+col+' .5cqw,transparent .5cqw) 0 0/10cqw 10cqw,linear-gradient(90deg,'+col+' .5cqw,transparent .5cqw) 0 0/10cqw 10cqw';
    case 'checks':return 'conic-gradient('+col+' 25%,transparent 0 50%,'+col+' 0 75%,transparent 0) 0 0/16cqw 16cqw';
    case 'rays':return 'repeating-conic-gradient(from 0deg at 30% 100%,'+col+' 0 4deg,transparent 4deg 12deg)';
    case 'waves':return 'url("data:image/svg+xml;utf8,'+enc("<svg xmlns='http://www.w3.org/2000/svg' width='40' height='16'><path d='M0 8 Q10 0 20 8 T40 8' fill='none' stroke='"+col+"' stroke-width='1.6'/></svg>")+'") 0 0/12cqw auto';
    case 'diamonds':return 'url("data:image/svg+xml;utf8,'+enc("<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M12 2L22 12L12 22L2 12Z' fill='none' stroke='"+col+"' stroke-width='1.2'/></svg>")+'") 0 0/14cqw 14cqw';
  }
  return 'none';
}
function itemEls(c,face){
  return c.items.filter(i=>i.face===face).map(i=>{
    const col=i.c||(face==='back'?(c.back.tcol||c.tcol):c.tcol);
    const e=h('div',{class:'it '+(i.type==='txt'?'tx tf-'+i.f:'em'),'data-id':i.id,
      style:'left:'+i.x+'%;top:'+i.y+'%;--r:'+i.r+'deg;color:'+col+';'+(i.type==='txt'?'font-size:'+i.s+'cqw':'width:'+i.s+'cqw;height:'+i.s+'cqw')});
    if(i.type==='txt')e.textContent=i.t||'…';else e.innerHTML='<svg viewBox="0 0 34 34">'+EMB[i.e]+'</svg>';
    return e;
  });
}
function frameEl(c){return c.frame==='none'?null:h('div',{class:'frame fr-'+c.frame,style:'border-color:'+c.tcol},h('i',{style:'border-color:'+c.tcol}))}
function frontFace(bk,c,o){
  const f=h('div',{class:'face front mat-'+c.mat+(o.flat?' flat':''),style:'--base:'+c.base});
  f.append(h('div',{class:'pat',style:'background:'+patBg(c.pat,c.pc)}),h('div',{class:'mat'}),h('div',{class:'hinge'}),frameEl(c));
  const ttl=h('div',{class:'ttl tp-'+c.tpos+' ta-'+c.talign+' tf-'+c.tfont,style:'font-size:'+c.tsize+'cqw;color:'+c.tcol},h('div',{class:'bt'},bk.title||'Untitled'));
  if(bk.sub)ttl.append(h('div',{class:'bs'},bk.sub));
  f.append(ttl,...itemEls(c,'front'),h('div',{class:'sheen'}));
  if(o.open)f.append(h('span',{class:'open-tag'},'Open'));
  return f;
}
function backFace(bk,c,o){
  const bb=c.back;
  const f=h('div',{class:'face back mat-'+c.mat+(o.flat?' flat':''),style:'--base:'+(bb.base||c.base)});
  f.append(h('div',{class:'pat',style:'background:'+patBg(bb.pat||c.pat,c.pc)}),h('div',{class:'mat'}),h('div',{class:'hinge'}),frameEl(c));
  if(bb.text)f.append(h('div',{class:'blurb tf-'+bb.tfont,style:'font-size:'+bb.tsize+'cqw;color:'+(bb.tcol||c.tcol)},bb.text));
  f.append(...itemEls(c,'back'),h('div',{class:'sheen'}));
  return f;
}
/* one fully 3D book: six faces. opts: open, preview, cover, blank */
function makeBook(bk,opts){
  opts=opts||{};
  if(opts.blank){
    const plus=(()=>{const s=h('span');s.innerHTML='<svg viewBox="0 0 24 24">'+ICON.plus+'</svg>';return s.firstChild})();
    return h('button',{class:'bk blank',type:'button','aria-label':'New brain book',style:'--T:30px'},h('div',{class:'solid'},
      h('div',{class:'face front'},h('div',{class:'plus'},plus,'New book')),h('div',{class:'face back'}),h('div',{class:'face pages'}),h('div',{class:'face spine'}),h('div',{class:'face top'}),h('div',{class:'face bottom'})));
  }
  const c=opts.cover||getCover(bk),sp=c.spine||mixHex(c.base,'#000000',.32),emb1=c.items.find(i=>i.face==='front'&&i.type==='emb');
  const spine=h('div',{class:'face spine mat-'+c.mat,style:'background:'+sp+';color:'+c.tcol},h('div',{class:'mat'}),h('div',{class:'sp-in'},
    c.spineText?h('div',{class:'sp-t tf-'+c.tfont},bk.title||'Untitled'):null,
    emb1?h('span',{class:'sp-e'},emb(emb1.e)):null));
  const edge=mixHex(c.base,'#000000',.25);
  const el=h('button',{class:'bk'+(opts.preview?' preview':''),type:'button','aria-label':opts.preview?'Book preview':'Open '+bk.title,tabindex:opts.preview?'-1':null,
    style:'--T:'+c.thick+'px;--edge:'+edge},
    h('div',{class:'solid'},frontFace(bk,c,opts),backFace(bk,c,opts),spine,
      h('div',{class:'face pages'}),h('div',{class:'face top'}),h('div',{class:'face bottom'}),
      c.ribbon?h('div',{class:'ribbon',style:'background:'+c.ribbon}):null));
  return el;
}
/* ----- shelf: books slowly turn, face you on hover, and open when chosen ----- */
const shelf={list:[],raf:0,last:0};
function shelfAdd(el,spd){
  el.classList.add('drv');
  const st={el,solid:el.querySelector('.solid'),ry:-26+Math.random()*360,rx:-4,v:0,lift:0,hover:false,hold:null,spd:spd||(15+Math.random()*9),ph:Math.random()*6.28};
  el.addEventListener('pointerenter',()=>{st.hover=true});el.addEventListener('pointerleave',()=>{st.hover=false});
  el.addEventListener('focus',()=>{st.hover=true});el.addEventListener('blur',()=>{st.hover=false});
  shelf.list.push(st);return st;
}
function shelfTick(now){
  shelf.raf=requestAnimationFrame(shelfTick);
  if(S.view!=='books'||document.hidden){shelf.last=now;return}
  const dt=Math.min(.05,(now-shelf.last)/1000||.016);shelf.last=now;
  const calm=reduceMotion(),T=now/1000;
  for(const st of shelf.list){
    if(!st.el.isConnected||st.el.classList.contains('gone'))continue;
    const front=-9,facing=st.hover||st.hold!=null,tgt=st.hold!=null?st.hold:front;
    if(facing||calm){
      const n=Math.round((st.ry-tgt)/360),goal=(calm&&!facing?-26:tgt)+n*360;
      st.ry+=(goal-st.ry)*(1-Math.exp(-dt*6.2));st.v=0;
    }else{
      st.v+=(st.spd-st.v)*(1-Math.exp(-dt*1.4));st.ry+=st.v*dt;
    }
    const rxT=facing?-2:(calm?-4:-4+Math.sin(T*.7+st.ph)*3.2);
    st.rx+=(rxT-st.rx)*(1-Math.exp(-dt*5));
    st.lift+=((st.hover?1:0)-st.lift)*(1-Math.exp(-dt*7));
    st.solid.style.transform='translateY('+(-10*st.lift).toFixed(2)+'px) rotateX('+st.rx.toFixed(2)+'deg) rotateY('+st.ry.toFixed(2)+'deg)';
  }
}
const ENDPAPER='repeating-linear-gradient(45deg,rgba(150,110,70,.10) 0 2px,transparent 2px 7px),linear-gradient(135deg,#efe3c6,#e2d2ae)';
let cineOn=false;
function openBookCine(id,srcEl){
  if(cineOn)return;
  const b=S.books.find(x=>x.id===id);
  if(!b||!srcEl||reduceMotion()||!document.body.animate){openBook(id);return}
  cineOn=true;
  const r=srcEl.getBoundingClientRect(),W=r.width||172,H=r.height||236,vw=innerWidth,vh=innerHeight;
  const st=shelf.list.find(x=>x.el===srcEl),ry0=st?st.ry:-20,rx0=st?st.rx:-4;
  const back=h('div',{class:'cine-back'}),ov=h('div',{class:'cine',role:'presentation'},back);
  const el=makeBook(b,{});el.classList.add('cine-bk');el.removeAttribute('aria-label');el.tabIndex=-1;
  el.style.left=r.left+'px';el.style.top=r.top+'px';el.style.width=W+'px';el.style.height=H+'px';
  const T=parseFloat(getComputedStyle(srcEl).getPropertyValue('--T'))||30;
  const solid=el.querySelector('.solid'),front=el.querySelector('.front');
  solid.style.transition='none';
  /* the cover becomes a door with an endpaper inside */
  const door=h('div',{class:'door'}),inner=h('div',{class:'inner',style:'background:'+ENDPAPER});
  solid.insertBefore(door,front);door.append(front,inner);
  solid.append(h('div',{class:'inb',style:'background:'+ENDPAPER}));
  /* pages */
  const N=4,leaves=[];
  const page=(cls)=>h('div',{class:cls});
  const wp=h('div',{class:'wpage'});wp.innerHTML='<svg viewBox="0 0 100 140" preserveAspectRatio="none"><path d="M0 70 C 12 58, 24 82, 36 70 S 60 58, 72 70 S 92 80, 100 68" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="72" cy="70" r="2.2" fill="currentColor"/></svg>';
  wp.style.transform='translateZ('+(T/2-1.2-N*1.1)+'px)';solid.append(wp);
  for(let i=0;i<N;i++){
    const lf=h('div',{class:'leaf'},h('div',{class:'lf'},h('i',{class:'sh'})),h('div',{class:'lb'},h('i',{class:'sh'})));
    lf.style.transform='translateZ('+(T/2-1.2-i*1.1)+'px) rotateY(0deg)';solid.append(lf);leaves.push(lf);
  }
  document.body.append(ov);ov.append(el);
  srcEl.classList.add('gone');
  const s=Math.min(1.75,(vw*.84)/(W*2),(vh*.74)/H),cx=vw/2-(r.left+W/2),cy=vh/2-(r.top+H/2)-vh*.02;
  const X=(x,y,sc,rx,ry,z)=>'translate3d('+x+'px,'+y+'px,'+(z||0)+'px) scale('+sc+') rotateX('+rx+'deg) rotateY('+ry+'deg)';
  const norm=((-14-ry0+540)%360+360)%360-180,ry1=ry0+norm;
  const anims=[];let done=false;
  const run=(node,kf,o)=>{const a=node.animate(kf,Object.assign({fill:'forwards'},o));anims.push(a);return a};
  const wait=ms=>new Promise(res=>setTimeout(res,ms));
  const finish=()=>{
    if(done)return;done=true;anims.forEach(a=>{try{a.cancel()}catch(e){}});
    if(S.active!==id||S.view!=='string')openBook(id);
    document.body.classList.add('arrive');
    ov.animate([{opacity:1},{opacity:0}],{duration:520,easing:'ease-out',fill:'forwards'}).finished.then(()=>{ov.remove();srcEl.classList.remove('gone');cineOn=false});
    setTimeout(()=>{document.body.classList.remove('arrive');focusWriter()},900);
  };
  ov.addEventListener('pointerdown',()=>{if(!done)skip()});
  const skip=()=>finish();
  (async()=>{
    run(back,[{opacity:0},{opacity:1}],{duration:500,easing:'ease-out'});
    run(solid,[{transform:X(0,0,1,rx0,ry0)},{transform:X(cx,cy,s,6,ry1)}],{duration:780,easing:'cubic-bezier(.22,.8,.24,1)'});
    await wait(760);if(done)return;
    /* the cover swings open while the book slides to centre the spread */
    run(solid,[{transform:X(cx,cy,s,6,-14)},{transform:X(cx+W*s/2,cy,s,2,0)}],{duration:1100,easing:'cubic-bezier(.45,.05,.25,1)'});
    run(door,[{transform:'translateZ('+T/2+'px) rotateY(0deg)'},{transform:'translateZ('+T/2+'px) rotateY(-179deg)'}],{duration:1100,easing:'cubic-bezier(.45,.05,.25,1)'});
    await wait(980);if(done)return;
    /* pages turn, one after another */
    leaves.forEach((lf,i)=>{
      const z=T/2-1.2-i*1.1,end=-(176-i*1.6);
      run(lf,[{transform:'translateZ('+z+'px) rotateY(0deg)'},{transform:'translateZ('+(z+10)+'px) rotateY(-84deg) rotateX(3deg)',offset:.45},{transform:'translateZ('+z+'px) rotateY('+end+'deg)'}],{duration:980,delay:i*230,easing:'cubic-bezier(.4,.1,.25,1)'});
      $$('.sh',lf).forEach(sh=>run(sh,[{opacity:0},{opacity:.55,offset:.5},{opacity:0}],{duration:980,delay:i*230,easing:'ease-in-out'}));
    });
    await wait(N*230+760);if(done)return;
    /* dive into the page: you arrive in the string */
    run(solid,[{transform:X(cx+W*s/2,cy,s,2,0)},{transform:X(0,vh*.0,Math.max(vw/W,vh/H)*1.15,0,0)}],{duration:980,easing:'cubic-bezier(.55,0,.2,1)'});
    run(back,[{opacity:1},{opacity:1,offset:.6},{opacity:0}],{duration:980,easing:'linear'});
    await wait(520);if(done)return;
    done=true;
    if(S.active!==id||S.view!=='string')openBook(id);
    document.body.classList.add('arrive');
    await wait(240);
    ov.animate([{opacity:1},{opacity:0}],{duration:520,easing:'ease-out',fill:'forwards'}).finished.then(()=>{ov.remove();srcEl.classList.remove('gone');cineOn=false});
    setTimeout(()=>{document.body.classList.remove('arrive');focusWriter()},1000);
  })();
}
let booksPer=0;
function renderBooks(){
  shelf.list=[];
  const body=$('#booksBody');
  const avail=Math.max(280,body.clientWidth-56-60);
  const per=Math.max(1,Math.floor((avail+SG)/(BW+SG)));booksPer=per;
  const kids=[h('div',{class:'books-head'},
    h('div',null,h('div',{class:'eyebrow'},S.books.length+(S.books.length===1?' book':' books')),h('p',{style:'margin-top:6px'},'Each brain book keeps its own string, categories and web. Design the cover, the back and the spine, then pull one off the shelf to carry on writing.')),
    h('button',{class:'btn primary',type:'button',onclick:()=>openBookForm(null)},ico('plus'),'New brain book'))];
  const items=S.books.map(b=>({b})).concat([{blank:true}]);
  const shelves=h('div',{class:'shelves',style:'--bw:'+BW+'px;--sg:'+SG+'px'});
  for(let i=0;i<items.length;i+=per){
    const row=items.slice(i,i+per),srow=h('div',{class:'srow'}),lrow=h('div',{class:'lrow'});
    for(const it of row){
      if(it.blank){
        const bk=makeBook(null,{blank:true});bk.addEventListener('click',()=>openBookForm(null));srow.append(bk);shelfAdd(bk,9);
        lrow.append(h('div',{class:'lcell'},h('div',{class:'nm'},'A fresh one'),h('div',{class:'mono'},'Empty pages')));
      }else{
        const b=it.b,bk=makeBook(b,{open:b.id===S.active});
        bk.addEventListener('click',()=>openBookCine(b.id,bk));srow.append(bk);const sst=shelfAdd(bk);
        const del=h('button',{class:'btn',type:'button'},'Delete');armBtn(del,'Sure?',()=>deleteBook(b.id));
        const flip=h('button',{class:'btn',type:'button',title:'Turn the book over'},'Flip');
        flip.addEventListener('click',()=>{sst.hold=sst.hold==null?172:null;flip.textContent=sst.hold==null?'Flip':'Spin'});
        lrow.append(h('div',{class:'lcell'},h('div',{class:'nm',title:b.title},b.title),
          h('div',{class:'mono'},b.thoughts.length+(b.thoughts.length===1?' knot':' knots')+' · '+b.links.length+(b.links.length===1?' thread':' threads')),
          h('div',{class:'lact'},h('button',{class:'btn',type:'button',onclick:()=>openBookForm(b.id)},'Design'),flip,del)));
      }
    }
    shelves.append(srow,h('div',{class:'board'}),lrow);
  }
  kids.push(shelves);
  body.replaceChildren(...kids);
  if(!shelf.raf)shelf.raf=requestAnimationFrame(shelfTick);
}
function resetUIState(){
  str.chip=null;str.dirty=true;str.sel=null;str.pops.clear();sky.bookId=null;
  web.byId=new Map();web.nodes=[];web.edges=[];web.sel=null;web.linkFrom=null;web.hidden.clear();web.needSync=true;web.userCam=false;
  notes.cat='all';notes.q='';notes.focus=null;
}
function openBook(id){
  flushSave();S.active=id;resetUIState();save();go('string');
}
function deleteBook(id){
  S.books=S.books.filter(b=>b.id!==id);delete S.drafts[id];
  if(!S.books.length)S.books.push(newBook('My first book','',0,'note'));
  if(!S.books.some(b=>b.id===S.active)){S.active=S.books[0].id;resetUIState()}
  save();renderBooks();setHeading();toast('Book deleted');
}

/* ----- the cover designer ----- */
function openBookForm(editId){
  const editing=editId?S.books.find(b=>b.id===editId):null;
  const hue=editing?editing.hue:S.books.length%8;
  const st={title:editing?editing.title:'',sub:editing?editing.sub:'',hue,emblem:editing?editing.emblem:'note',cover:cloneCover(editing?getCover(editing):defaultCover(hue,'note'))};
  const c=st.cover;
  let tab='cover',rx=-8,ry=-24,tx=-8,ty=-24,raf=0,spin=false,bkEl=null,dragging=null;
  const host=h('div',{class:'cd-host'});
  const apply=()=>{if(bkEl){bkEl.style.setProperty('--rx',rx+'deg');bkEl.style.setProperty('--ry',ry+'deg')}};
  const redraw=()=>{bkEl=makeBook(st,{preview:true,cover:c});host.replaceChildren(bkEl);apply()};
  const tick=()=>{
    raf=requestAnimationFrame(tick);
    if(!$('#modal').classList.contains('on')||!host.isConnected){cancelAnimationFrame(raf);return}
    if(spin&&!dragging){ry+=.7;tx=rx;ty=ry}
    else if(!dragging){rx+=(tx-rx)*.14;ry+=(ty-ry)*.14}
    apply();
  };
  const view=(x,y)=>{spin=false;tx=x;ty=y;spinBtn.classList.remove('on')};
  host.addEventListener('pointerdown',e=>{host.setPointerCapture(e.pointerId);dragging={x:e.clientX,y:e.clientY};spin=false;spinBtn.classList.remove('on');host.classList.add('grab')});
  host.addEventListener('pointermove',e=>{if(!dragging)return;ry+=(e.clientX-dragging.x)*.6;rx=clamp(rx-(e.clientY-dragging.y)*.4,-70,70);dragging={x:e.clientX,y:e.clientY};tx=rx;ty=ry});
  const endDrag=()=>{dragging=null;host.classList.remove('grab')};
  host.addEventListener('pointerup',endDrag);host.addEventListener('pointercancel',endDrag);
  host.addEventListener('dblclick',()=>view(-8,-24));
  const spinBtn=h('button',{class:'btn small',type:'button'},'Spin');
  spinBtn.addEventListener('click',()=>{spin=!spin;spinBtn.classList.toggle('on',spin)});
  const views=h('div',{class:'cd-views'},
    ...[['Front',-8,-24],['Back',-8,158],['Spine',-8,84],['Top',58,-14]].map(([l,a,b])=>{const bt=h('button',{class:'btn small',type:'button'},l);bt.addEventListener('click',()=>{rx=clamp(rx,-80,80);view(a,b)});return bt}),spinBtn);
  const stage=h('div',{class:'cd-stage'},host,views,h('p',{class:'mono',style:'text-align:center'},'Drag to turn it · double-click to reset'));

  /* small control builders */
  const lab=t=>h('div',{class:'namer-lab'},t);
  const field=(t,node)=>h('div',{class:'cd-f'},lab(t),node);
  const seg3=(opts,get,set)=>{const e=h('div',{class:'seg',role:'radiogroup'});segment(e,opts,get(),v=>{set(v);redraw()});return e};
  const range=(label,min,max,step,get,set,fmt)=>{
    const out=h('span',{class:'val'},fmt(get())),inp=h('input',{type:'range',min,max,step,'aria-label':label});inp.value=get();
    inp.addEventListener('input',()=>{set(+inp.value);out.textContent=fmt(+inp.value);redraw()});
    return h('div',{class:'cd-f'},h('div',{class:'kp-rl'},lab(label),out),inp);
  };
  const colors=(label,list,get,set,none)=>{
    const row=h('div',{class:'swatches'});
    const paint=()=>{
      $$('button.sw',row).forEach(b=>b.setAttribute('aria-checked',(b.dataset.c||'')===(get()||'')?'true':'false'));
      pick.value=isHex(get())?get():'#888888';
    };
    const pick=h('input',{type:'color',class:'cpick','aria-label':label+' custom'});
    pick.addEventListener('input',()=>{set(pick.value);paint();redraw()});
    if(none){const b=h('button',{class:'sw none',type:'button',role:'radio','aria-label':none,title:none,'data-c':''});b.addEventListener('click',()=>{set(null);paint();redraw()});row.append(b)}
    for(const col of list){const b=h('button',{class:'sw',type:'button',role:'radio','aria-label':col,'data-c':col,style:'--cc:'+col});b.addEventListener('click',()=>{set(col);paint();redraw()});row.append(b)}
    row.append(pick);paint();
    return h('div',{class:'cd-f'},lab(label),row);
  };
  const text=(label,get,set,ph,max,area)=>{
    const inp=h(area?'textarea':'input',{class:'field',maxlength:String(max||60),placeholder:ph||'','aria-label':label,rows:area?'3':null,autocomplete:'off'});
    inp.value=get();inp.addEventListener('input',()=>{set(inp.value);redraw()});return h('div',{class:'cd-f'},lab(label),inp);
  };

  /* flat face pad with draggable stickers */
  const stickerPad=face=>{
    let sel=null;
    const pad=h('div',{class:'pad-face bk'}),ctl=h('div',{class:'pad-ctl'}),pal=h('div',{class:'embs pal'});
    const mine=()=>c.items.filter(i=>i.face===face);
    const drawPad=()=>{
      const f=face==='front'?frontFace(st,c,{flat:true}):backFace(st,c,{flat:true});
      pad.replaceChildren(f);
      $$('.it',f).forEach(el=>{
        const it=c.items.find(i=>i.id===el.dataset.id);if(!it)return;
        el.classList.toggle('sel',it.id===sel);
        el.addEventListener('pointerdown',e=>{
          e.stopPropagation();e.preventDefault();el.setPointerCapture(e.pointerId);
          if(sel!==it.id){sel=it.id;$$('.it',f).forEach(x=>x.classList.toggle('sel',x===el))}
          const r=f.getBoundingClientRect();let moved=false;
          const mv=ev=>{moved=true;it.x=clamp((ev.clientX-r.left)/r.width*100,0,100);it.y=clamp((ev.clientY-r.top)/r.height*100,0,100);el.style.left=it.x+'%';el.style.top=it.y+'%';redraw()};
          const up=()=>{el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);drawCtl()};
          el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
        });
      });
      f.addEventListener('pointerdown',()=>{if(sel){sel=null;$$('.it',f).forEach(x=>x.classList.remove('sel'));drawCtl()}});
    };
    const add=it=>{
      if(c.items.length>=28){toast('That is a lot of stickers already');return}
      const n=Object.assign({id:uid(),face,type:'emb',e:'star',t:'',f:'display',x:50,y:50,s:20,r:0,c:null},it);
      c.items.push(n);sel=n.id;drawPad();drawCtl();redraw();
    };
    const drawCtl=()=>{
      const it=c.items.find(i=>i.id===sel&&i.face===face);
      const kids=[];
      if(it){
        const upd=()=>{drawPad();redraw()};
        if(it.type==='txt'){
          const ti=h('input',{class:'field',maxlength:'40',value:it.t,'aria-label':'Sticker text'});ti.addEventListener('input',()=>{it.t=ti.value;upd()});
          const fs=h('div',{class:'seg'});segment(fs,TFONTS,it.f,v=>{it.f=v;upd()});
          kids.push(h('div',{class:'cd-f'},lab('Text'),ti),h('div',{class:'cd-f'},lab('Font'),fs));
        }
        const rg=(l,min,max,get,set,fmt)=>{const out=h('span',{class:'val'},fmt(get())),inp=h('input',{type:'range',min,max,step:1,'aria-label':l});inp.value=get();inp.addEventListener('input',()=>{set(+inp.value);out.textContent=fmt(+inp.value);drawPad();redraw()});return h('div',{class:'cd-f'},h('div',{class:'kp-rl'},lab(l),out),inp)};
        kids.push(rg('Size',3,60,()=>it.s,v=>it.s=v,v=>v),rg('Turn',-180,180,()=>it.r,v=>it.r=v,v=>v+'°'),rg('Left–right',0,100,()=>it.x,v=>it.x=v,v=>v+'%'),rg('Up–down',0,100,()=>it.y,v=>it.y=v,v=>v+'%'));
        const cp=h('input',{type:'color',class:'cpick',value:it.c||(face==='back'?(c.back.tcol||c.tcol):c.tcol),'aria-label':'Sticker colour'});cp.addEventListener('input',()=>{it.c=cp.value;upd()});
        const auto=h('button',{class:'btn small',type:'button'},'Match title');auto.addEventListener('click',()=>{it.c=null;drawCtl();upd()});
        const dup=h('button',{class:'btn small',type:'button'},'Duplicate');dup.addEventListener('click',()=>add(Object.assign({},it,{id:uid(),x:clamp(it.x+8,0,100),y:clamp(it.y+8,0,100)})));
        const del=h('button',{class:'btn small danger',type:'button'},'Remove');del.addEventListener('click',()=>{c.items=c.items.filter(i=>i!==it);sel=null;drawPad();drawCtl();redraw()});
        kids.push(h('div',{class:'cd-f'},lab('Colour'),h('div',{style:'display:flex;gap:8px;align-items:center'},cp,auto)),h('div',{class:'cd-acts'},dup,del));
      }else kids.push(h('p',{class:'mono'},mine().length?'Tap a sticker on the cover to edit it, or drag it into place.':'No stickers yet. Pick a symbol above or add some text.'));
      ctl.replaceChildren(...kids);
    };
    for(const k of Object.keys(EMB)){const b=h('button',{type:'button','aria-label':'Add '+k,title:k});b.innerHTML='<svg viewBox="0 0 34 34">'+EMB[k]+'</svg>';b.addEventListener('click',()=>add({type:'emb',e:k}));pal.append(b)}
    const addTxt=h('button',{class:'btn small',type:'button'},ico('plus'),'Text');addTxt.addEventListener('click',()=>add({type:'txt',t:face==='front'?'No. 1':'a string of thoughts',f:'display',s:8}));
    drawPad();drawCtl();
    return h('div',{class:'pad'},h('div',{class:'pad-l'},pad),h('div',{class:'pad-r'},h('div',{class:'cd-f'},lab('Stickers'),pal,addTxt),ctl));
  };

  const body=h('div',{class:'cd-body'});
  const tabs=h('div',{class:'seg cd-tabs',role:'tablist'});
  const panels={
    cover:()=>[
      text('Title',()=>st.title,v=>st.title=v,'Vienna, Work, Dreams…',40),
      text('Subtitle',()=>st.sub,v=>st.sub=v,'What goes in here? (optional)',60),
      field('Material',seg3(MATS,()=>c.mat,v=>c.mat=v)),
      colors('Cover colour',BASES,()=>c.base,v=>c.base=v),
      field('Pattern',seg3(PATS,()=>c.pat,v=>c.pat=v)),
      colors('Pattern colour',['#ffffff','#f3d894','#000000','#e8785a'],()=>c.pc,v=>c.pc=v),
      field('Frame',seg3(FRAMES,()=>c.frame,v=>c.frame=v)),
      field('Thickness',seg3([[22,'Slim'],[32,'Regular'],[46,'Fat']],()=>c.thick,v=>c.thick=+v))],
    front:()=>[
      field('Title font',seg3(TFONTS,()=>c.tfont,v=>c.tfont=v)),
      field('Title sits',seg3([['top','Top'],['middle','Middle'],['bottom','Bottom']],()=>c.tpos,v=>c.tpos=v)),
      field('Align',seg3([['left','Left'],['center','Centre']],()=>c.talign,v=>c.talign=v)),
      range('Title size',8,20,.5,()=>c.tsize,v=>c.tsize=v,v=>v),
      colors('Title and gilding',INKS,()=>c.tcol,v=>c.tcol=v),
      stickerPad('front')],
    back:()=>[
      text('Back cover text',()=>c.back.text,v=>c.back.text=v,'A line for the back, like a blurb…',240,true),
      field('Text font',seg3(TFONTS,()=>c.back.tfont,v=>c.back.tfont=v)),
      range('Text size',3,10,.2,()=>c.back.tsize,v=>c.back.tsize=v,v=>v),
      colors('Back colour',BASES,()=>c.back.base,v=>c.back.base=v,'Same as front'),
      field('Back pattern',seg3([[null,'Same'],...PATS],()=>c.back.pat,v=>c.back.pat=v||null)),
      colors('Back text colour',INKS,()=>c.back.tcol,v=>c.back.tcol=v,'Same as front'),
      stickerPad('back')],
    spine:()=>[
      colors('Spine colour',BASES,()=>c.spine,v=>c.spine=v,'Auto'),
      field('Spine title',seg3([[true,'Show'],[false,'Hide']],()=>c.spineText,v=>c.spineText=v===true||v==='true')),
      colors('Ribbon bookmark',['#f2708f','#e8b24a','#78d1b0','#8fb2f2','#ffffff','#1d1d22'],()=>c.ribbon,v=>c.ribbon=v,'No ribbon')]
  };
  const drawBody=()=>{body.replaceChildren(...panels[tab]())};
  [['cover','Cover'],['front','Front'],['back','Back'],['spine','Spine']].forEach(([id,l])=>{
    const b=h('button',{type:'button',role:'tab','aria-checked':id===tab?'true':'false'},l);
    b.addEventListener('click',()=>{
      tab=id;$$('button',tabs).forEach(x=>x.setAttribute('aria-checked',x===b?'true':'false'));drawBody();
      spin=false;spinBtn.classList.remove('on');
      if(id==='back')view(-8,158);else if(id==='spine')view(-8,84);else view(-8,-24);
    });
    tabs.append(b);
  });
  const submit=()=>{
    const t=st.title.trim();if(!t){tab='cover';$$('button',tabs).forEach((x,i)=>x.setAttribute('aria-checked',i===0?'true':'false'));drawBody();toast('Give the book a title');return}
    closeModal();
    const em=c.items.find(i=>i.face==='front'&&i.type==='emb');
    const emblem=em?em.e:'note';
    if(editing){Object.assign(editing,{title:t.slice(0,40),sub:st.sub.trim().slice(0,60),cover:c,emblem});save();renderBooks();setHeading()}
    else{const nb=newBook(t.slice(0,40),st.sub.trim().slice(0,60),st.hue,emblem);nb.cover=c;S.books.push(nb);openBook(nb.id)}
  };
  showModal([
    h('div',{class:'sheet-head'},h('div',{class:'eyebrow'},editing?'Design':'New'),h('h3',null,editing?'Design your brain book':'Bind a new brain book')),
    h('div',{class:'cd'},stage,h('div',{class:'cd-panel'},tabs,body)),
    h('div',{class:'sheet-foot'},h('button',{class:'btn ghost',type:'button',onclick:()=>closeModal()},'Cancel'),h('button',{class:'btn primary',type:'button',onclick:submit},editing?'Save the book':'Bind and open'))
  ],'bookform');
  redraw();drawBody();raf=requestAnimationFrame(tick);
  setTimeout(()=>{const f=body.querySelector('input');if(f)f.focus()},30);
}

/* ================= SKY: every word becomes a star =================
   A night-sky writing view. Words you finish turn into stars joined by a thin line, a comet carries the word
   you are still typing, and each tied thought becomes a named constellation in a slowly spiralling sky. */
const sky={cv:null,ctx:null,wrap:null,inp:null,W:0,H:0,dpr:1,k:1,kT:1,cam:{x:0,y:0},camT:{x:0,y:0},scrub:false,draft:'',wb:[],pulses:[],shoot:[],nextShoot:3,
  last:0,hover:null,sel:null,drag:null,hits:[],cache:new Map(),bookId:null,pid:null,slot:0,kick:0,dust:null,focus:false};
function hash32(s){let x=2166136261;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)}return x>>>0}
function rnd(seed,i,k){let t=(seed+Math.imul(i+1,0x9e3779b1)+Math.imul(k+1,0x85ebca6b))>>>0;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}
const skyOrigin=n=>{const r=300*Math.sqrt(n),a=n*2.39996;return {x:Math.cos(a)*r,y:Math.sin(a)*r*.8}};
function conPts(seed,n,o){
  const pts=[];let x=o.x,y=o.y,a=rnd(seed,0,1)*6.283;
  for(let i=0;i<n;i++){
    if(i>0){a+=(rnd(seed,i,1)-.5)*2.1;const d=62+rnd(seed,i,2)*58;x+=Math.cos(a)*d;y+=Math.sin(a)*d*.8}
    pts.push({x,y,r:rnd(seed,i,3)});
  }
  return pts;
}
const nextSlot=b=>b.thoughts.reduce((m,t)=>Math.max(m,t.sk||0),0)+1;
function skyEnsure(){
  const b=book();
  if(sky.bookId!==b.id){sky.bookId=b.id;sky.pid=uid();sky.slot=0;sky.cache.clear();sky.sel=null;skyCard()}
  let m=b.thoughts.reduce((a,t)=>Math.max(a,t.sk||0),0);
  for(const t of b.thoughts)if(!t.sk)t.sk=++m;
  if(!sky.slot)sky.slot=m+1;
  return b;
}
function conOf(t){
  const key=t.text+'|'+t.sk;let e=sky.cache.get(t.id);
  if(e&&e.key===key)return e;
  const words=t.text.trim().split(/\s+/).slice(0,40),pts=conPts(hash32(t.id),words.length,skyOrigin(t.sk));
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9,cx=0,cy=0;
  for(const p of pts){x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);y0=Math.min(y0,p.y);y1=Math.max(y1,p.y);cx+=p.x;cy+=p.y}
  e={key,words,pts,x0,y0,x1,y1,cx:cx/pts.length,cy:cy/pts.length};sky.cache.set(t.id,e);return e;
}
const skyBg=()=>{const l=hex2rgb(COL.bg||'#120a0c');const lum=l[0]*.3+l[1]*.59+l[2]*.11;return lum>110?'#0e0c16':mixHex(COL.bg||'#120a0c','#000000',.35)};
function skyCard(){
  const el=$('#skyCard'),b=book(),t=sky.sel?thoughtOf(b,sky.sel):null;
  if(!el)return;
  if(!t){el.hidden=true;return}
  const ttl=h('h3',{class:'pop-title',tabindex:'0',role:'button',title:'Click to rename'},titleOf(t));
  const ren=()=>inlineTitle(t,ttl,()=>skyCard());
  ttl.addEventListener('click',ren);ttl.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ren()}});
  el.replaceChildren(
    h('div',{class:'pop-top'},h('span',{class:'mono'},catName(b,t)+' · '+fmtFull.format(new Date(t.t))),h('span',{style:'display:flex;gap:6px'},starBtn(t),h('button',{class:'btn small icon-btn ghost',type:'button','aria-label':'Close',onclick:()=>{sky.sel=null;skyCard()}},ico('x')))),
    ttl,h('p',{class:'pop-text'},t.text),
    h('div',{class:'pop-actions'},
      h('button',{class:'btn small',type:'button',onclick:()=>go('string',{knot:t.id})},'On string'),
      h('button',{class:'btn small',type:'button',onclick:()=>{notes.focus=t.id;notes.cat='all';notes.q='';go('notes')}},'In notes'),
      h('button',{class:'btn small',type:'button',onclick:()=>{web.focusId=t.id;go('web')}},'On web')));
  el.hidden=false;
}
function skySelect(id){
  const b=book(),t=thoughtOf(b,id);if(!t)return;
  sky.sel=id;sky.scrub=true;const e=conOf(t);sky.camT={x:e.cx,y:e.cy};skyCard();
}
const skyWordsDone=v=>{const ws=v.trim()?v.trim().split(/\s+/):[];return /\s$/.test(v)?ws.length:Math.max(0,ws.length-1)};
function enterSky(opts){
  const b=skyEnsure();
  sky.draft=S.drafts[b.id]||'';sky.inp.value=sky.draft;sky.wb=Array(skyWordsDone(sky.draft)).fill(0);sky.scrub=false;
  if(!sky.dust){sky.dust=[];for(let i=0;i<460;i++)sky.dust.push({x:Math.random()*3000,y:Math.random()*2000,z:.1+Math.random()*.5,s:.5+Math.random()*1.3,o:Math.random()*6.28,f:.6+Math.random()*2})}
  requestAnimationFrame(()=>{
    sizeCanvas(sky,sky.wrap);
    const dp=conPts(hash32(sky.pid),skyWordsDone(sky.draft)+1,skyOrigin(sky.slot)),cm=dp[dp.length-1];
    sky.cam={x:cm.x,y:cm.y};sky.camT={x:cm.x,y:cm.y};
    if(opts&&opts.knot)skySelect(opts.knot);else skyCard();
    if(window.matchMedia&&window.matchMedia('(pointer:fine)').matches)sky.inp.focus({preventScroll:true});
  });
  $('#skyHint').replaceChildren(...['Type: every word becomes a star · ',h('kbd',null,'Enter'),' ties the constellation and names it · drag to drift · scroll to zoom']);
}
function skyTie(){
  const text=sky.inp.value.replace(/\s+/g,' ').trim();
  if(!text){sky.inp.focus();return}
  if(settings.askName===false){
    const b=book();if(!b.cats.some(c=>c.id===str.chip))str.chip=b.cats.length?b.cats[0].id:null;
    commitKnot(text,autoTitle(text),str.chip,[]);return;
  }
  sky.inp.blur();openNamer(text);
}
function skyFrame(now){
  const c=sky.ctx,W=sky.W,H=sky.H;if(!W||!H)return;
  const dt=Math.min(.05,(now-sky.last)/1000||.016);sky.last=now;
  const T=now/1000,dpr=sky.dpr,reduce=reduceMotion();
  const b=skyEnsure();
  const draft=sky.draft,ws=draft.trim()?draft.trim().split(/\s+/):[];
  const done=skyWordsDone(draft),cur=/\s$/.test(draft)?'':(ws.length?ws[ws.length-1]:'');
  const dpts=conPts(hash32(sky.pid),done+1,skyOrigin(sky.slot)),comet=dpts[done];
  while(sky.wb.length<done)sky.wb.push(now);
  sky.wb.length=done;
  if(sky.kick){sky.pulses.push({x:comet.x,y:comet.y,t:T,s:.5});sky.kick=0}
  /* camera */
  if(!sky.scrub&&draft)sky.camT={x:comet.x,y:comet.y};
  sky.k+=(sky.kT-sky.k)*(1-Math.exp(-dt*6));
  const k=sky.k,e=reduce?1:1-Math.exp(-dt*4.5);
  sky.cam.x+=(sky.camT.x-sky.cam.x)*e;sky.cam.y+=(sky.camT.y-sky.cam.y)*e;
  const cx=sky.cam.x,cy=sky.cam.y,SX=x=>(x-cx)*k+W/2,SY=y=>(y-cy)*k+H/2;
  c.setTransform(dpr,0,0,dpr,0,0);
  c.fillStyle=skyBg();c.fillRect(0,0,W,H);
  /* nebulae */
  const neb=[[-300,-200,560,0],[520,320,640,3],[-120,760,520,4],[900,-300,600,2]];
  for(const [nx,ny,nr,ci] of neb){
    const x=(nx-cx*.4)*k*.6+W/2,y=(ny-cy*.4)*k*.6+H/2,r=nr*k*.8,g=c.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,hexA(COL.c[ci]||'#ff8b5c',.14));g.addColorStop(1,hexA(COL.c[ci]||'#ff8b5c',0));
    c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
  }
  /* dust */
  for(const d of sky.dust){
    const px=(((d.x-cx*d.z*k)%3000)+3000)%3000-(3000-W)/2,py=(((d.y-cy*d.z*k)%2000)+2000)%2000-(2000-H)/2;
    if(px<-4||px>W+4||py<-4||py>H+4)continue;
    c.globalAlpha=(.25+.5*(.5+.5*Math.sin(T*d.f+d.o)))*(.4+d.z);c.fillStyle='#fff6e6';
    c.beginPath();c.arc(px,py,d.s,0,6.2832);c.fill();
  }
  c.globalAlpha=1;
  /* shooting stars */
  if(!reduce){
    if(T>sky.nextShoot){sky.shoot.push({x:Math.random()*W*.8,y:Math.random()*H*.4,t:T});sky.nextShoot=T+5+Math.random()*7}
    sky.shoot=sky.shoot.filter(s=>T-s.t<1);
    for(const s of sky.shoot){
      const p=(T-s.t),x=s.x+p*620,y=s.y+p*230,g=c.createLinearGradient(x,y,x-130,y-48);
      g.addColorStop(0,'rgba(255,248,235,'+(1-p)+')');g.addColorStop(1,'rgba(255,248,235,0)');
      c.strokeStyle=g;c.lineWidth=1.6;c.beginPath();c.moveTo(x,y);c.lineTo(x-130,y-48);c.stroke();
    }
  }
  /* saved constellations */
  sky.hits=[];
  const labelFont='italic 500 15px "Bodoni Moda", Georgia, serif',wordFont='italic 400 15px Newsreader, Georgia, serif';
  const halo=skyBg();
  const centroids=new Map();
  for(const t of b.thoughts){
    const en=conOf(t);centroids.set(t.id,en);
    if(SX(en.x1)<-120||SX(en.x0)>W+120||SY(en.y1)<-120||SY(en.y0)>H+120)continue;
    const hot=sky.hover===t.id||sky.sel===t.id,col=catCol(b,t);
    c.strokeStyle=col;c.lineWidth=hot?1.8:1;c.globalAlpha=hot?.85:.3;c.lineJoin='round';
    c.beginPath();en.pts.forEach((p,i)=>{if(i)c.lineTo(SX(p.x),SY(p.y));else c.moveTo(SX(p.x),SY(p.y))});c.stroke();
    c.fillStyle=col;
    en.pts.forEach((p,i)=>{
      const x=SX(p.x),y=SY(p.y),r=(hot?3.4:2.3)*(.8+p.r*.7)*Math.max(.7,k);
      c.globalAlpha=hot?.22:.1;c.beginPath();c.arc(x,y,r*3.2,0,6.2832);c.fill();
      c.globalAlpha=hot?1:.8;c.beginPath();c.arc(x,y,r,0,6.2832);c.fill();
      sky.hits.push({id:t.id,x,y,r:16});
    });
    if(t.star){c.globalAlpha=.9;c.strokeStyle=COL.c[5];c.lineWidth=1.2;const p=en.pts[0];c.beginPath();c.arc(SX(p.x),SY(p.y),10,0,6.2832);c.stroke()}
    if(k>.25){
      c.font=labelFont;c.textAlign='center';c.textBaseline='middle';
      const lx=SX(en.cx),ly=SY(en.y1)+26*Math.max(.7,k),nm0=snip(titleOf(t),30),nm=veil()&&!hot?maskText(nm0):nm0;
      c.lineJoin='round';c.lineWidth=5;c.strokeStyle=halo;c.globalAlpha=1;c.strokeText(nm,lx,ly);
      c.fillStyle=hot?'#fff8ee':'#d9cdbf';c.globalAlpha=hot?1:.78;c.fillText(nm,lx,ly);
      const wd=c.measureText(nm).width;sky.hits.push({id:t.id,x:lx,y:ly,r:Math.max(16,wd/2)});
      if(hot&&k>.55){
        c.font=wordFont;c.textAlign='left';c.fillStyle='#fff8ee';
        en.pts.forEach((p,i)=>{const x=SX(p.x)+8,y=SY(p.y)-9;c.lineWidth=4;c.strokeStyle=halo;c.strokeText(en.words[i]||'',x,y);c.fillText(en.words[i]||'',x,y)});
      }
    }
    c.globalAlpha=1;
  }
  /* threads between constellations */
  c.setLineDash([4,7]);c.lineWidth=1;c.strokeStyle=COL.accent;
  for(const p of b.links){
    const A=centroids.get(p[0]),B=centroids.get(p[1]);if(!A||!B)continue;
    const hot=sky.sel&&(p[0]===sky.sel||p[1]===sky.sel);
    c.globalAlpha=hot?.7:.14;c.beginPath();c.moveTo(SX(A.cx),SY(A.cy));c.lineTo(SX(B.cx),SY(B.cy));c.stroke();
  }
  c.setLineDash([]);c.globalAlpha=1;
  /* the constellation being written */
  const dcol=(()=>{const cat=b.cats.find(x=>x.id===str.chip);return cat?COL.c[cat.slot]:COL.accent})();
  c.strokeStyle='#fff3df';c.lineWidth=1.5;c.globalAlpha=.8;
  c.beginPath();for(let i=0;i<done;i++){const p=dpts[i];if(i)c.lineTo(SX(p.x),SY(p.y));else c.moveTo(SX(p.x),SY(p.y))}c.stroke();
  if(done>0){ // tail to the comet
    const a=dpts[done-1],g=c.createLinearGradient(SX(a.x),SY(a.y),SX(comet.x),SY(comet.y));
    g.addColorStop(0,'rgba(255,243,223,.7)');g.addColorStop(1,hexA(dcol,.0));
    c.strokeStyle=g;c.lineWidth=1.5;c.globalAlpha=1;c.setLineDash([3,6]);c.beginPath();c.moveTo(SX(a.x),SY(a.y));c.lineTo(SX(comet.x),SY(comet.y));c.stroke();c.setLineDash([]);
  }
  for(let i=0;i<done;i++){
    const p=dpts[i],x=SX(p.x),y=SY(p.y),age=(now-sky.wb[i])/700,pr=clamp(age,0,1),sc=reduce?1:(pr<1?1+2.7*Math.pow(pr-1,3)+1.7*Math.pow(pr-1,2):1);
    const r=(3.6+p.r*2.6)*Math.max(.7,k)*Math.max(0,sc);
    c.globalAlpha=.2;c.fillStyle=dcol;c.beginPath();c.arc(x,y,r*3.4,0,6.2832);c.fill();
    c.globalAlpha=1;c.fillStyle='#fff8ee';
    c.beginPath();for(let q=0;q<8;q++){const rr=q%2?r*.45:r*1.6,a=q*Math.PI/4;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.closePath();c.fill();
    if(pr<1&&!reduce){c.globalAlpha=(1-pr)*.8;c.strokeStyle=dcol;c.lineWidth=2;c.beginPath();c.arc(x,y,8+pr*46,0,6.2832);c.stroke()}
    if(k>.5){
      c.globalAlpha=clamp(pr*1.6,0,1);c.font=wordFont;c.textAlign='left';c.textBaseline='middle';
      const wx=x+10,wy=y-11;c.lineWidth=4;c.lineJoin='round';c.strokeStyle=halo;c.strokeText(ws[i]||'',wx,wy);c.fillStyle='#fff3df';c.fillText(ws[i]||'',wx,wy);
    }
  }
  /* the comet */
  {
    const x=SX(comet.x),y=SY(comet.y),pulse=sky.focus?(reduce?1:.7+.3*Math.sin(T*5)):.45;
    let g=c.createRadialGradient(x,y,0,x,y,26);g.addColorStop(0,hexA(dcol,.85*pulse));g.addColorStop(1,hexA(dcol,0));
    c.globalAlpha=1;c.fillStyle=g;c.beginPath();c.arc(x,y,26,0,6.2832);c.fill();
    c.fillStyle='#fffaf0';c.globalAlpha=pulse;c.beginPath();c.arc(x,y,4.4,0,6.2832);c.fill();
    c.textAlign='left';c.textBaseline='middle';c.lineJoin='round';
    if(cur){
      c.globalAlpha=1;c.font='italic 500 24px Newsreader, Georgia, serif';
      c.lineWidth=6;c.strokeStyle=halo;c.strokeText(cur,x+16,y-14);c.fillStyle=dcol;c.fillText(cur,x+16,y-14);
    }else if(!draft){
      c.globalAlpha=.45+.1*Math.sin(T*1.6);c.font='italic 400 20px Newsreader, Georgia, serif';c.fillStyle='#fff3df';
      c.fillText(PROMPTS_SKY[(new Date().getDate()+b.thoughts.length)%PROMPTS_SKY.length],x+18,y-14);
    }
  }
  /* pulses */
  sky.pulses=sky.pulses.filter(p=>T-p.t<1.8);
  for(const p of sky.pulses){
    const a=T-p.t,r=a*(p.s<1?160:420)*k+6;
    c.globalAlpha=Math.max(0,1-a/(p.s<1?.7:1.8))*(p.s<1?.5:.7);c.strokeStyle=COL.accent;c.lineWidth=p.s<1?1.5:2.5;
    c.beginPath();c.arc(SX(p.x),SY(p.y),r,0,6.2832);c.stroke();
  }
  c.globalAlpha=1;
}
const PROMPTS_SKY=['Say a word. It becomes a star.','What is the first star of tonight?','Write a thing the sky would remember.','Draw a thought between the stars.'];
function initSky(){
  sky.cv=$('#skyCanvas');sky.ctx=sky.cv.getContext('2d');sky.wrap=$('#skyWrap');sky.inp=$('#skyInput');
  const inp=sky.inp,cv=sky.cv;
  new ResizeObserver(()=>sizeCanvas(sky,sky.wrap)).observe(sky.wrap);
  inp.addEventListener('input',ev=>{
    let v=inp.value;
    if(/[\r\n]/.test(v)){v=v.replace(/\s*[\r\n]+\s*/g,' ');inp.value=v}
    sky.draft=v;sky.scrub=false;sky.sel=null;skyCard();
    const b=book();S.drafts[b.id]=v;if(!v)delete S.drafts[b.id];save();
    if(ev&&ev.inputType){sky.kick=1;Jazz.type(ev)}
  });
  inp.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();if(!e.isComposing)skyTie();return}
    if(e.key==='Escape'){inp.blur();return}
    sky.scrub=false;
  });
  inp.addEventListener('focus',()=>{sky.focus=true});inp.addEventListener('blur',()=>{sky.focus=false});
  $('#skyKnot').addEventListener('click',skyTie);
  $('#skyClear').addEventListener('click',()=>{inp.value='';sky.draft='';sky.wb=[];delete S.drafts[book().id];save();inp.focus()});
  $('#skyFit').addEventListener('click',()=>{sky.kT=sky.kT>.5?.32:1;$('#skyFit').textContent=sky.kT<.5?'Zoom in':'Zoom out';sky.scrub=true;if(sky.kT<.5)sky.camT={x:0,y:0};else sky.scrub=false});
  const pt=e=>{const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]};
  const hit=(x,y)=>{let best=null,bd=1e9;for(const h2 of sky.hits){const d=Math.hypot(h2.x-x,h2.y-y);if(d<h2.r&&d<bd){bd=d;best=h2.id}}return best};
  cv.addEventListener('pointerdown',e=>{const [x,y]=pt(e);cv.setPointerCapture(e.pointerId);sky.drag={x,y,cx:sky.cam.x,cy:sky.cam.y,moved:false,id:e.pointerId}});
  cv.addEventListener('pointermove',e=>{
    const [x,y]=pt(e),d=sky.drag;
    if(d&&d.id===e.pointerId){
      if(!d.moved&&Math.hypot(x-d.x,y-d.y)>5)d.moved=true;
      if(d.moved){sky.scrub=true;sky.cam.x=d.cx-(x-d.x)/sky.k;sky.cam.y=d.cy-(y-d.y)/sky.k;sky.camT={x:sky.cam.x,y:sky.cam.y};cv.style.cursor='grabbing'}
    }else{const id=hit(x,y);sky.hover=id;cv.style.cursor=id?'pointer':'grab'}
  });
  const up=e=>{
    const d=sky.drag;if(!d||d.id!==e.pointerId)return;sky.drag=null;cv.style.cursor='grab';
    if(d.moved)return;
    const [x,y]=pt(e),id=hit(x,y);
    if(id){skySelect(id);Jazz.key(String.fromCharCode(97+(hash32(id)%20)))}
    else{sky.sel=null;skyCard();inp.focus({preventScroll:true})}
  };
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',()=>{sky.drag=null});
  cv.addEventListener('pointerleave',()=>{if(!sky.drag)sky.hover=null});
  cv.addEventListener('wheel',e=>{e.preventDefault();sky.kT=clamp(sky.kT*Math.exp(-e.deltaY*.0016),.28,1.8)},{passive:false});
}

/* ================= SETTINGS ================= */
function applySettings(){
  const r=document.documentElement;
  r.dataset.skin=SKINS.some(s=>s.id===settings.skin)?settings.skin:'abendrot';
  r.classList.toggle('reduce',reduceMotion());
  document.body.classList.toggle('usegrain',!!settings.grain);
  document.body.classList.toggle('noclock',!settings.clock);
  document.body.classList.toggle('cafe',veil());
  const cb=$('#cafeBtn');if(cb)cb.setAttribute('aria-pressed',veil()?'true':'false');
  const cbg=$('#cafeBadge');if(cbg)cbg.hidden=!veil();
  refreshColors();
}
function setSetting(k,v){
  settings[k]=v;saveSettings();applySettings();
  if(k==='cafe'){cafeSide(v)}
  if(k==='webSpacing'||k==='nodeSize'){web.alpha=Math.max(web.alpha,.8);web.ticks=0;web.userCam=false}
  if(k==='cafeLock')armIdle();
  if(['stringStyle','swing','fontSize','look','place'].includes(k))str.dirty=true;
  if(k==='webLayout'){web.layout=v;web.alpha=1;web.ticks=0;web.userCam=false;if(web.nodes.length){computeTargets(book());webFit(true)}}
}
function exportJSON(){return JSON.stringify({app:'mind',version:2,exported:new Date().toISOString(),settings,data:S},null,1)}
function downloadText(name,text,mime){
  try{
    const a=h('a',{href:URL.createObjectURL(new Blob([text],{type:mime||'text/plain'})),download:name});
    document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);return true;
  }catch(e){return false}
}
function saveBackup(){
  const name='mind-backup-'+new Date().toISOString().slice(0,10)+'.json';
  if(downloadText(name,exportJSON(),'application/json'))toast('Backup saved');else copyBackup();
}
function copyBackup(){
  const json=exportJSON();
  const fallback=()=>{const ta=$('#importBox');if(ta){ta.value=json;ta.focus();ta.select()}toast('Select and copy the backup text')};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(json).then(()=>toast('Backup copied. Paste it somewhere safe.'),fallback);
  else fallback();
}
function exportMarkdown(){
  const b=book(),out=['# '+b.title,''];
  if(b.sub)out.push('_'+b.sub+'_','');
  const groups=b.cats.map(c=>({name:c.name,id:c.id})).concat([{name:'Unsorted',id:null}]);
  for(const g of groups){
    const items=b.thoughts.filter(t=>g.id==null?!catOf(b,t):t.cat===g.id).sort((x,y)=>x.t-y.t);
    if(!items.length)continue;
    out.push('## '+g.name,'');
    for(const t of items){
      out.push('### '+(t.star?'★ ':'')+titleOf(t),'',t.text,'');
      const nb=neighbors(b,t.id);
      if(nb.length)out.push('Linked: '+nb.map(o=>'['+titleOf(o)+']').join(', '),'');
      out.push('_'+fmtFull.format(new Date(t.t))+'_','');
    }
  }
  downloadText((b.title.replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'')||'mind')+'.md',out.join('\n'),'text/markdown');
  toast('Markdown saved');
}
function restoreBackup(text){
  try{
    const o=JSON.parse(text),d=o&&o.data?o.data:o;
    const next=sanitize(d);
    S=next;if(o&&o.settings&&typeof o.settings==='object'){Object.assign(settings,o.settings);saveSettings()}
    applySettings();flushSave();resetUIState();closeSettings();go('string');toast('Backup restored');
  }catch(e){toast('That does not look like a mind. backup')}
}
function buildSettings(){
  const body=$('#drawerBody');
  const sect=(t,...kids)=>h('div',{class:'sect'},h('h4',null,t),...kids);
  const lab=(label,sub)=>h('div',null,h('span',{class:'lbl'},label),sub?h('span',{class:'sub'},sub):null);
  const rowSeg=(label,sub,key,opts)=>{const seg=h('div',{class:'seg',role:'radiogroup','aria-label':label});segment(seg,opts,settings[key],v=>setSetting(key,v));return h('div',{class:'row stack'},lab(label,sub),seg)};
  const rowRange=(label,key,min,max,step,fmt)=>{
    const out=h('span',{class:'val'},fmt(settings[key])),inp=h('input',{type:'range',min,max,step,'aria-label':label});inp.value=settings[key];
    inp.addEventListener('input',()=>{out.textContent=fmt(+inp.value);setSetting(key,+inp.value)});
    return h('div',{class:'row stack'},h('div',{style:'display:flex;justify-content:space-between;align-items:baseline'},h('span',{class:'lbl'},label),out),inp);
  };
  const rowSwitch=(label,sub,key,get)=>{
    const sw=h('button',{class:'switch',type:'button',role:'switch','aria-checked':(get?get():settings[key])?'true':'false','aria-label':label});
    sw.addEventListener('click',()=>{const v=sw.getAttribute('aria-checked')!=='true';sw.setAttribute('aria-checked',v?'true':'false');setSetting(key,v)});
    return h('div',{class:'row'},lab(label,sub),sw);
  };
  const skins=h('div',{class:'skins',role:'radiogroup','aria-label':'Theme'});
  const cur=()=>SKINS.some(s=>s.id===settings.skin)?settings.skin:'abendrot';
  for(const s of SKINS){
    const b=h('button',{class:'skin',type:'button',role:'radio','aria-checked':cur()===s.id?'true':'false'},
      h('div',{class:'pv',style:'background:'+s.bg},h('b',{style:'left:8px;top:8px;width:26px;height:26px;background:'+s.panel}),h('b',{style:'left:42px;top:13px;width:14px;height:14px;background:'+s.accent}),h('b',{style:'right:9px;bottom:8px;width:9px;height:9px;background:'+s.ink})),
      h('div',{class:'nm'},s.name),h('div',{class:'nt'},s.note));
    b.addEventListener('click',()=>{setSetting('skin',s.id);$$('.skin',skins).forEach((x,i)=>x.setAttribute('aria-checked',SKINS[i].id===s.id?'true':'false'))});
    skins.append(b);
  }
  const box=h('textarea',{class:'field',id:'importBox',rows:'3',placeholder:'Paste a backup here to restore it','aria-label':'Backup text',spellcheck:'false'});
  const restore=h('button',{class:'btn',type:'button'},'Restore backup');
  armBtn(restore,'Replace everything?',()=>{if(box.value.trim())restoreBackup(box.value);else toast('Paste a backup first')});
  const wipe=h('button',{class:'btn danger',type:'button'},'Erase everything');
  armBtn(wipe,'Really erase?',()=>{const sb=sampleBook();S={books:[sb],active:sb.id,drafts:{},sampleDismissed:false};flushSave();resetUIState();closeSettings();go('string');toast('Back to the sample book')});
  const pinRow=(()=>{
    const st=h('span',{class:'sub'},settings.cafePin?'A PIN is set':'No PIN. Any key brings the screen back');
    const inp=h('input',{class:'field',type:'password',inputmode:'numeric',maxlength:'12',placeholder:'New PIN','aria-label':'New PIN',autocomplete:'off',style:'max-width:120px;height:34px'});
    const setb=h('button',{class:'btn small',type:'button'},settings.cafePin?'Change':'Set PIN');
    setb.addEventListener('click',async()=>{if(inp.value.length<3){toast('Use at least 3 characters');return}settings.cafePin=await sha(inp.value);saveSettings();inp.value='';st.textContent='A PIN is set';setb.textContent='Change';toast('PIN saved')});
    const clr=h('button',{class:'btn small ghost',type:'button',onclick:()=>{settings.cafePin='';saveSettings();st.textContent='No PIN. Any key brings the screen back';setb.textContent='Set PIN'}},'Clear');
    return h('div',{class:'row stack'},h('div',null,h('span',{class:'lbl'},'Screen PIN'),st),h('div',{style:'display:flex;gap:8px;align-items:center'},inp,setb,clr));
  })();
  body.replaceChildren(
    sect('Café mode',
      h('p',{class:'sub',style:'color:var(--ink2);font-size:12.5px;line-height:1.4;padding:2px 0 6px'},'For writing in public. Every thought and title is veiled on screen until you hover it, what you type stays readable for a moment, and the screen can hide itself when you step away.'),
      rowSwitch('Café mode','Alt+C toggles it anywhere','cafe'),
      rowSeg('Hide the screen when idle',null,'cafeLock',[[0,'Never'],[1,'1 min'],[3,'3 min'],[10,'10 min']]),
      rowSwitch('Silence the keys','Mute jazz while café mode is on','cafeMute'),
      h('div',{class:'row'},lab('Hide now','Alt+H, or the Hide button up top'),h('button',{class:'btn small',type:'button',onclick:()=>{closeSettings();lockScreen()}},'Hide screen')),
      pinRow),
    sect('Theme',skins),
    sect('Writing',
      rowSwitch('Name every knot','Show the naming screen when you tie a thought','askName'),
      rowSeg('Rhythm','How the string rests','stringStyle',[['swing','Swing'],['waltz','Walzer'],['ballad','Ballad'],['taut','Taut']]),
      rowRange('Sway','swing',0,100,1,v=>v+'%'),
      rowRange('Wiggle','wiggle',0,100,1,v=>v+'%'),
      rowRange('Text size','fontSize',20,44,1,v=>v+' px'),
      rowSeg('String look',null,'look',[['twine','Twine'],['wire','Wire'],['ribbon','Ribbon']]),
      rowSeg('Text sits','On the string or threaded onto it','place',[['thread','Threaded'],['top','On top']]),
      rowSwitch('Staff lines','Faint stave and bar lines behind the string','staff'),
      h('div',{class:'row'},lab('Jazz keys','Sound, band and chords live behind the Keys button'),h('button',{class:'btn small',type:'button',onclick:()=>{closeSettings();toggleKeys(true)}},'Open Keys'))),
    sect('The web',
      rowSeg('Arrangement',null,'webLayout',[['drift','Drift'],['clusters','Clusters'],['score','Score']]),
      rowSeg('Titles','Placed so none sit on a knot or on each other','labels',[['auto','Auto'],['always','Always'],['off','Off']]),
      rowRange('Spacing','webSpacing',60,220,5,v=>v+'%'),
      rowRange('Node size','nodeSize',70,180,5,v=>v+'%')),
    sect('Atmosphere',
      rowSwitch('Paper grain',null,'grain'),
      rowSwitch('Vienna clock','Show the time in Wien','clock'),
      rowSwitch('Reduce motion','Calmer string, no waves','reduce',()=>reduceMotion())),
    sect('Your data',
      h('p',{class:'sub',style:'color:var(--ink2);font-size:12.5px;line-height:1.4;padding:4px 0 6px'},'Thoughts are kept in this browser only. Save a backup now and then, especially before clearing site data.'),
      h('div',{class:'data-actions'},h('button',{class:'btn',type:'button',onclick:saveBackup},'Save backup'),h('button',{class:'btn',type:'button',onclick:copyBackup},'Copy backup'),h('button',{class:'btn',type:'button',onclick:exportMarkdown},'Export book as Markdown')),
      box,h('div',{class:'data-actions'},restore,wipe)));
}
function openSettings(){buildSettings();$('#drawer').classList.add('on');$('#scrim').classList.add('on');$('#closeSettings').focus()}
function closeSettings(){$('#drawer').classList.remove('on');$('#scrim').classList.remove('on')}
/* ================= keys popover, focus, palette ================= */
function toggleKeys(open){
  const pop=$('#keysPop'),btn=$('#keysBtn');
  const on=open==null?pop.hidden:open;
  pop.hidden=!on;btn.setAttribute('aria-expanded',on?'true':'false');
}
function toggleFocus(on){
  const b=document.body;on=on==null?!b.classList.contains('focus'):on;
  b.classList.toggle('focus',on);
  if(on){if(S.view!=='string')go('string');toast('Focus mode. Esc to leave.');setTimeout(()=>str.inp.focus(),50)}
}
function openPalette(){
  let q='',sel=0,rows=[];
  const input=h('input',{class:'field',type:'search',placeholder:'Search knots, jump to a view, run a command','aria-label':'Search and commands',autocomplete:'off'});
  const list=h('div',{class:'sheet-list'});
  const cmds=[
    {label:'Go to String',kind:'View',fn:()=>go('string')},
    {label:'Go to Sky',kind:'View',fn:()=>go('sky')},
    {label:'Go to Notes',kind:'View',fn:()=>go('notes')},
    {label:'Go to Web',kind:'View',fn:()=>go('web')},
    {label:'Go to Books',kind:'View',fn:()=>go('books')},
    {label:'New brain book',kind:'Action',fn:()=>{go('books');openBookForm(null)}},
    {label:settings.sound?'Turn jazz keys off':'Turn jazz keys on',kind:'Action',fn:()=>{Jazz.setOn(!settings.sound);saveSettings();Jazz.sync()}},
    {label:'Open the Keys panel',kind:'Action',fn:()=>toggleKeys(true)},
    {label:'Focus mode',kind:'Action',fn:()=>toggleFocus(true)},
    {label:veil()?'Leave café mode':'Café mode (private in public)',kind:'Action',fn:()=>setSetting('cafe',!veil())},
    {label:'Hide the screen now',kind:'Action',fn:()=>lockScreen()},
    {label:'Resurface an old knot',kind:'Action',fn:()=>resurface()},
    {label:'Export book as Markdown',kind:'Action',fn:exportMarkdown},
    {label:'Settings',kind:'Action',fn:openSettings}
  ];
  const draw=()=>{
    const b=book(),ql=q.trim().toLowerCase();
    const c=cmds.filter(x=>!ql||x.label.toLowerCase().includes(ql)).map(x=>({cmd:x}));
    const th=b.thoughts.filter(t=>ql&&(titleOf(t).toLowerCase().includes(ql)||t.text.toLowerCase().includes(ql))).sort((x,y)=>y.t-x.t).slice(0,8).map(t=>({t}));
    rows=th.concat(c);sel=clamp(sel,0,Math.max(0,rows.length-1));
    list.replaceChildren(...(rows.length?rows.map((r,i)=>{
      const run=()=>{closeModal();if(r.cmd)r.cmd.fn();else go('string',{knot:r.t.id})};
      const btn=r.cmd
        ?h('button',{class:'pick'+(i===sel?' sel':''),type:'button'},h('span',{class:'tx'},h('b',null,r.cmd.label)),h('span',{class:'kind'},r.cmd.kind))
        :h('button',{class:'pick'+(i===sel?' sel':''),type:'button',style:'--cc:'+catVar(b,r.t)},h('i'),h('span',{class:'tx'},h('b',null,titleOf(r.t)),h('span',null,r.t.text)),h('span',{class:'kind'},'Knot'));
      btn.addEventListener('click',run);btn.addEventListener('mousemove',()=>{if(sel!==i){sel=i;$$('.pick',list).forEach((x,j)=>x.classList.toggle('sel',j===i))}});
      btn._run=run;return btn;
    }):[h('p',{class:'mono',style:'padding:18px 12px'},'Nothing matches.')]));
    const s=list.querySelector('.sel');if(s)s.scrollIntoView({block:'nearest'});
  };
  input.addEventListener('input',()=>{q=input.value;sel=0;draw()});
  input.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){e.preventDefault();sel=Math.min(rows.length-1,sel+1);draw()}
    else if(e.key==='ArrowUp'){e.preventDefault();sel=Math.max(0,sel-1);draw()}
    else if(e.key==='Enter'){e.preventDefault();const b=$$('.pick',list)[sel];if(b&&b._run)b._run()}
  });
  showModal([h('div',{class:'pin'},input),list],'palette');
  draw();
}
function resurface(){
  const b=book();if(!b.thoughts.length){toast('Nothing to resurface yet');return}
  const pool=b.thoughts.length>3?b.thoughts.slice(0,-1):b.thoughts;
  const t=pool[Math.floor(Math.random()*pool.length)];
  go('string',{knot:t.id});
}

/* ================= café mode: private in public ================= */
let locked=false,idleT=0;
function cafeSide(on){
  if(on){
    if(settings.cafeMute&&settings.sound){settings.cafeResume=true;try{Jazz.setOn(false)}catch(e){}}
    toast('Café mode on. Thoughts are veiled; hover to read one. Alt+H hides the screen.');
  }else{
    if(settings.cafeResume){settings.cafeResume=false;try{Jazz.setOn(true)}catch(e){}}
    toast('Café mode off.');
  }
  saveSettings();try{Jazz.sync()}catch(e){}
  armIdle();
}
async function sha(t){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('mind.'+t));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){return 'x'+hash32('mind.'+t)}}
function lockScreen(){
  if(locked)return;locked=true;closeKnotPop();
  const L=$('#lock');L.hidden=false;document.body.classList.add('locked');
  const pin=$('#lockPin'),row=$('#lockRow');row.hidden=!settings.cafePin;pin.value='';$('#lockMsg').textContent=settings.cafePin?'Enter your PIN to come back.':'Hidden. Click or press any key to come back.';
  if(settings.cafePin)setTimeout(()=>pin.focus(),50);else L.focus();
}
function unlockScreen(){locked=false;$('#lock').hidden=true;document.body.classList.remove('locked');armIdle();focusWriter()}
async function tryUnlock(){
  if(!settings.cafePin){unlockScreen();return}
  const v=$('#lockPin').value;if(!v)return;
  if(await sha(v)===settings.cafePin)unlockScreen();else{$('#lockMsg').textContent='Not quite. Try again.';$('#lockPin').value='';$('#lockRow').classList.remove('shake');void $('#lockRow').offsetWidth;$('#lockRow').classList.add('shake')}
}
function armIdle(){
  clearTimeout(idleT);
  if(!veil()||!settings.cafeLock||locked)return;
  idleT=setTimeout(lockScreen,settings.cafeLock*60000);
}
function initCafe(){
  const L=$('#lock');
  L.addEventListener('pointerdown',e=>{if(e.target.closest('#lockRow'))return;if(!settings.cafePin)unlockScreen()});
  L.addEventListener('keydown',e=>{if(e.target.id==='lockPin'){if(e.key==='Enter')tryUnlock();return}if(!settings.cafePin)unlockScreen()});
  $('#lockGo').addEventListener('click',tryUnlock);
  $('#cafeBtn').addEventListener('click',()=>setSetting('cafe',!veil()));
  $('#cafeHide').addEventListener('click',()=>lockScreen());
  ['pointermove','pointerdown','keydown','wheel'].forEach(ev=>document.addEventListener(ev,()=>{if(veil()&&settings.cafeLock&&!locked)armIdle()},{passive:true}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&veil()&&settings.cafeLock)lockScreen()});
  armIdle();
}

/* ================= clock, loop, start ================= */
function tickClock(){const b=$('#clock b');if(b)b.textContent=fmtVie.format(new Date())}
function loop(now){
  requestAnimationFrame(loop);
  if(document.hidden||locked)return;
  try{if(S.view==='string')strFrame(now);else if(S.view==='sky')skyFrame(now);else if(S.view==='web')webFrame(now)}catch(e){if(!loop.warned){loop.warned=true;console.error(e)}}
}
function init(){
  loadData();
  if(settings.jzV!==2){settings.jzV=2;settings.sound=true;saveSettings()}
  applySettings();
  initString();initSky();initWeb();initCafe();
  tickClock();setInterval(tickClock,20000);
  $('#openSettings').addEventListener('click',openSettings);
  $('#closeSettings').addEventListener('click',()=>{closeSettings();$('#openSettings').focus()});
  $('#scrim').addEventListener('click',closeSettings);
  $('#focusBtn').addEventListener('click',()=>toggleFocus());
  $('#palBtn').addEventListener('click',openPalette);
  $('#btnRandom').addEventListener('click',resurface);
  /* jazz keys */
  $('#keysPop').append(Jazz.panel());
  $('#pianoMini').append(Jazz.piano());
  Jazz.on('chord',c=>{$$('.chordnow[data-chord]').forEach(e=>{e.textContent=c.name;e.hidden=!settings.sound})});
  Jazz.sync();
  $('#keysBtn').addEventListener('click',e=>{e.stopPropagation();toggleKeys()});
  document.addEventListener('pointerdown',e=>{
    const pop=$('#keysPop');
    if(!pop.hidden&&!pop.contains(e.target)&&!$('#keysBtn').contains(e.target))toggleKeys(false);
  });
  new ResizeObserver(()=>{if(S.view==='books'){const w=$('#booksBody').clientWidth,per=Math.max(1,Math.floor((Math.max(280,w-116)+SG)/(BW+SG)));if(per!==booksPer)renderBooks()}}).observe($('#booksBody'));
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if($('#modal').classList.contains('on'))closeModal();else openPalette();return}
    if(e.altKey&&/^[1-5]$/.test(e.key)){e.preventDefault();go(VIEWS[+e.key-1]);return}
    if(e.altKey&&e.key.toLowerCase()==='c'){e.preventDefault();setSetting('cafe',!veil());return}
    if(e.altKey&&e.key.toLowerCase()==='h'){e.preventDefault();lockScreen();return}
    if(e.altKey&&e.key.toLowerCase()==='j'){e.preventDefault();Jazz.setOn(!settings.sound);saveSettings();Jazz.sync();return}
    if(e.key!=='Escape')return;
    if(menuEl)closeMenu();
    else if($('#modal').classList.contains('on'))closeModal();
    else if($('#drawer').classList.contains('on')){closeSettings();$('#openSettings').focus()}
    else if(!$('#keysPop').hidden)toggleKeys(false);
    else if(document.body.classList.contains('focus'))toggleFocus(false);
    else if(sky.sel&&S.view==='sky'){sky.sel=null;skyCard()}
    else if(web.linkFrom){web.linkFrom=null;renderLinkBanner();renderDetail()}
  });
  flushSave();
  S.view='string';go('string');
  requestAnimationFrame(loop);
}
init();
