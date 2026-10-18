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
  key:'<circle cx="11" cy="17" r="5"/><path d="M16 17h13M25 17v5M21 17v4"/>'
};
function emb(n){const s=h('span',{class:'emb','aria-hidden':'true'});s.innerHTML='<svg viewBox="0 0 34 34">'+(EMB[n]||EMB.note)+'</svg>';return s}
const fmtFull=new Intl.DateTimeFormat('en-GB',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
const fmtDay=new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long'});
let fmtVie;try{fmtVie=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Vienna'})}catch(e){fmtVie=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit'})}
const snip=(s,n)=>{s=String(s||'');if(s.length<=n)return s;const c=s.slice(0,n);const i=c.lastIndexOf(' ');return (i>n*.6?c.slice(0,i):c).replace(/[\s,.;:!?-]+$/,'')+'…'};
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2400)}
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
const DEF={skin:'abendrot',stringStyle:'swing',swing:55,wiggle:70,fontSize:30,look:'twine',place:'thread',staff:true,askName:true,sound:false,volume:60,jzInstr:'rhodes',jzBand:true,jzIdle:true,jzTempo:104,jzKey:0,jzProg:'ii-v-i',jzReverb:40,webLayout:'drift',labels:'auto',nodeSize:100,grain:true,clock:true,reduce:null};
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
  return {id:uid(),title,sub:sub||'',hue:hue==null?0:hue,emblem:emblem||'note',created:Date.now(),
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
    thoughts:(Array.isArray(b.thoughts)?b.thoughts:[]).filter(t=>t&&t.id&&typeof t.text==='string').map(t=>({id:String(t.id),text:t.text,title:String(t.title||'').slice(0,60),star:!!t.star,cat:t.cat||null,t:+t.t||Date.now()})),
    links:(Array.isArray(b.links)?b.links:[]).filter(p=>Array.isArray(p)&&p.length===2)
  }));
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
function removeThought(b,id){b.thoughts=b.thoughts.filter(t=>t.id!==id);b.links=b.links.filter(p=>p[0]!==id&&p[1]!==id);if(web.sel===id)web.sel=null;if(str.sel===id)closeKnotPop();changed({layout:true});updateRail()}

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
const VIEWS=['string','notes','web','books'];
function greet(){const hr=new Date().getHours();return hr<5?'Gute Nacht':hr<11?'Guten Morgen':hr<13?'Mahlzeit':hr<18?'Guten Nachmittag':hr<22?'Guten Abend':'Gute Nacht'}
function setHeading(){
  const v=S.view,eb=$('#eyebrow'),hh=$('#h1');
  const em=t=>h('em',null,t);
  if(v==='string'){eb.textContent=fmtDay.format(new Date());hh.replaceChildren(greet()+'. ',em('Thread a thought.'))}
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
  modalOnClose=ok=>{if(!ok){setTimeout(()=>str.inp.focus(),0)}};
  drawBadge();drawCats();
  input.focus();input.select();
}
function commitKnot(text,title,cat,linkIds){
  const b=book(),inp=str.inp;
  const t={id:uid(),text,title,cat,t:Date.now()};
  b.thoughts.push(t);
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
  setTimeout(()=>inp.focus({preventScroll:true}),30);
}
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
  const name=snip(titleOf(t),26);
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
  const paint=(g,col,alpha,lift,sc)=>{
    const sx=g.x-camX;if(sx<-50||sx>W+50)return;
    const a=g.a,cs=Math.cos(a)*sc,sn=Math.sin(a)*sc,o=off-lift,y=base+Y(g.x,T);
    c.setTransform(dpr*cs,dpr*sn,-dpr*sn,dpr*cs,dpr*(sx-Math.sin(a)*o),dpr*(y+Math.cos(a)*o));
    c.globalAlpha=alpha;
    if(threaded){c.strokeStyle=COL.panel;c.lineWidth=fs*.26;c.lineJoin='round';c.strokeText(g.ch,0,0)}
    c.fillStyle=col;c.fillText(g.ch,0,0);
  };
  const ease=p=>{const q=p-1;return 1+2.7*q*q*q+1.7*q*q};

  for(const it of items){
    if(it.kx<x0||it.xa>x1)continue;
    for(const g of it.gl){if(g.x<x0||g.x>x1)continue;const fade=clamp(1-(cxw-g.x)/(W*1.15),0,1);paint(g,COL.ink,.52+.4*fade,0,1)}
  }
  if(str.draft&&str.draftL){
    for(const g of str.draftL.gl){
      if(g.x<x0||g.x>x1)continue;
      const born=str.births[g.u];let p=1;
      if(born!=null&&!reduce)p=clamp((now-born)/320,0,1);
      const k=ease(p);
      paint(g,COL.ink,clamp(p*1.4,0,1),(1-k)*fs*.9,1);
    }
  }else if(str.ghostL){
    const al=.2+.08*Math.sin(T*1.6);
    for(const g of str.ghostL.gl){if(g.x<x0||g.x>x1)continue;paint(g,COL.string,al,0,1)}
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
const wHidden=n=>web.hidden.has(n.cat||'none');
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
  web.scoreW=clamp(web.nodes.length*40,320,1000);
}
function webStep(){
  const N=web.nodes,L=web.layout,a=Math.max(.15,web.alpha);if(!N.length)return;
  const rep=L==='score'?42:L==='clusters'?58:78,rest=L==='score'?120:L==='clusters'?80:112,n1=Math.max(1,N.length-1);
  for(let i=0;i<N.length;i++){
    const A=N[i];
    for(let j=i+1;j<N.length;j++){
      const B=N[j];let dx=A.x-B.x,dy=A.y-B.y,d2=dx*dx+dy*dy;
      if(d2>180000)continue;
      if(d2<1){dx=Math.random()-.5;dy=Math.random()-.5;d2=dx*dx+dy*dy+1}
      const d=Math.sqrt(d2),f=rep*a/d,fx=dx/d*f,fy=dy/d*f;
      A.vx+=fx;A.vy+=fy;B.vx-=fx;B.vy-=fy;
    }
  }
  for(const [A,B] of web.edges){
    const dx=B.x-A.x,dy=B.y-A.y,d=Math.sqrt(dx*dx+dy*dy)||1,f=(d-rest)*.032*a,fx=dx/d*f,fy=dy/d*f;
    A.vx+=fx;A.vy+=fy;B.vx-=fx;B.vy-=fy;
  }
  for(const A of N){
    if(L==='drift'){A.vx-=A.x*.006;A.vy-=A.y*.006}
    else if(L==='clusters'){const c=web.centers.get(A.cat)||web.centers.get(null);if(c){A.vx+=(c.x-A.x)*.045;A.vy+=(c.y-A.y)*.045}A.vx-=A.x*.002;A.vy-=A.y*.002}
    else{
      const r=web.rank.get(A.id)||0,tx=(r/n1)*2*web.scoreW-web.scoreW;
      const lane=web.lanes.find(l=>l.id===A.cat)||web.lanes[0];
      A.vx+=(tx-A.x)*.08;if(lane)A.vy+=(lane.y-A.y)*.08;
    }
    if(web.drag&&web.drag.node===A&&web.drag.moved){A.vx=0;A.vy=0;continue}
    A.vx*=.78;A.vy*=.78;
    A.vx=clamp(A.vx,-26,26);A.vy=clamp(A.vy,-26,26);
    A.x+=A.vx;A.y+=A.vy;
  }
}
function webFit(animate){
  const vis=web.nodes.filter(n=>!wHidden(n));
  if(!vis.length||!web.W)return;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const n of vis){x0=Math.min(x0,n.x);x1=Math.max(x1,n.x);y0=Math.min(y0,n.y);y1=Math.max(y1,n.y)}
  if(web.layout==='score'){x0=Math.min(x0,-web.scoreW-90);y0=Math.min(y0,web.lanes[0]?web.lanes[0].y-40:y0);y1=Math.max(y1,web.lanes.length?web.lanes[web.lanes.length-1].y+40:y1)}
  const bw=x1-x0,bh=y1-y0;
  const k=clamp(Math.min(web.W/(bw+220),web.H/(bh+220)),.25,1.45);
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
  const mode=settings.labels;
  for(const n of web.nodes){
    if(wHidden(n))continue;
    const dim=(sel&&n.id!==sel&&!nbSet.has(n.id))||(q&&!n.lc.includes(q));
    const show=n.id===sel||nbSet.has(n.id)||n.id===web.hover||(q&&!dim)||(!dim&&((mode==='always'&&k>.3)||(mode==='auto'&&(k>.8||n.deg>=2))));
    if(!show)continue;
    const sx=n.x*k+tx,sy=n.y*k+ty;if(sx<-200||sx>W+40||sy<-20||sy>H+20)continue;
    const txt=snip(n.title,34),x=sx+nodeR(n)*k+7;
    c.lineJoin='round';c.lineWidth=5;c.strokeStyle=COL.panel;c.globalAlpha=dim?.3:1;c.strokeText(txt,x,sy);
    c.fillStyle=COL.ink;c.fillText(txt,x,sy);
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
  web.sel=id;web.userCam=true;renderDetail();
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
      h('button',{class:'btn small',type:'button',onclick:()=>openPicker(t.id)},'Browse…')),
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
  const cam=web.cam,k0=cam.k,k1=clamp(k0*f,.22,3.6),[wx,wy]=toWorld(px,py);
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
/* ================= BRAIN BOOKS: a shelf of hardbacks ================= */
const BW=196,SG=18;
function resetUIState(){
  str.chip=null;str.dirty=true;str.sel=null;str.pops.clear();
  web.byId=new Map();web.nodes=[];web.edges=[];web.sel=null;web.linkFrom=null;web.hidden.clear();web.needSync=true;web.userCam=false;
  notes.cat='all';notes.q='';notes.focus=null;
}
function openBook(id){
  flushSave();S.active=id;resetUIState();save();go('string');
}
/* one 3D book. data = {title,sub,hue,emblem}; opts: open (bookmark), preview, blank */
function makeBook(d,opts){
  opts=opts||{};
  const faces=opts.blank
    ?[h('div',{class:'face front'},h('div',{class:'plus'},(()=>{const s=h('span');s.innerHTML='<svg viewBox="0 0 24 24">'+ICON.plus+'</svg>';return s.firstChild})(),'New book')),h('div',{class:'face back'}),h('div',{class:'face pages'}),h('div',{class:'face spine'})]
    :[h('div',{class:'face front'},opts.open?h('span',{class:'open-tag'},'Open'):null,
        h('div',{class:'in'},h('div',null,h('div',{class:'bt'},d.title||'Untitled'),d.sub?h('div',{class:'bs'},d.sub):null),emb(d.emblem))),
      h('div',{class:'face back'}),h('div',{class:'face pages'}),h('div',{class:'face spine'})];
  const bk=h('button',{class:'bk'+(opts.blank?' blank':'')+(opts.preview?' preview':''),type:'button','aria-label':opts.blank?'New brain book':'Open '+d.title,style:'--cc:var(--c'+(d.hue||0)+')',tabindex:opts.preview?'-1':null},h('div',{class:'solid'},...faces));
  return bk;
}
let booksPer=0;
function renderBooks(){
  const body=$('#booksBody');
  const avail=Math.max(280,body.clientWidth-56-60);
  const per=Math.max(1,Math.floor((avail+SG)/(BW+SG)));booksPer=per;
  const kids=[h('div',{class:'books-head'},
    h('div',null,h('div',{class:'eyebrow'},S.books.length+(S.books.length===1?' book':' books')),h('p',{style:'margin-top:6px'},'Each brain book keeps its own string, categories and web. Pull one off the shelf to carry on writing.')),
    h('button',{class:'btn primary',type:'button',onclick:()=>openBookForm(null)},ico('plus'),'New brain book'))];
  const items=S.books.map(b=>({b})).concat([{blank:true}]);
  const shelves=h('div',{class:'shelves',style:'--bw:'+BW+'px;--sg:'+SG+'px'});
  for(let i=0;i<items.length;i+=per){
    const row=items.slice(i,i+per),srow=h('div',{class:'srow'}),lrow=h('div',{class:'lrow'});
    for(const it of row){
      if(it.blank){
        const bk=makeBook({hue:0},{blank:true});bk.addEventListener('click',()=>openBookForm(null));srow.append(bk);
        lrow.append(h('div',{class:'lcell'},h('div',{class:'nm'},'A fresh one'),h('div',{class:'mono'},'Empty pages')));
      }else{
        const b=it.b,bk=makeBook(b,{open:b.id===S.active});
        bk.addEventListener('click',()=>openBook(b.id));srow.append(bk);
        const del=h('button',{class:'btn',type:'button'},'Delete');armBtn(del,'Sure?',()=>deleteBook(b.id));
        lrow.append(h('div',{class:'lcell'},h('div',{class:'nm',title:b.title},b.title),
          h('div',{class:'mono'},b.thoughts.length+(b.thoughts.length===1?' knot':' knots')+' · '+b.links.length+(b.links.length===1?' thread':' threads')),
          h('div',{class:'lact'},h('button',{class:'btn',type:'button',onclick:()=>openBookForm(b.id)},'Edit'),del)));
      }
    }
    shelves.append(srow,h('div',{class:'board'}),lrow);
  }
  kids.push(shelves);
  body.replaceChildren(...kids);
}
function deleteBook(id){
  S.books=S.books.filter(b=>b.id!==id);delete S.drafts[id];
  if(!S.books.length)S.books.push(newBook('My first book','',0,'note'));
  if(!S.books.some(b=>b.id===S.active)){S.active=S.books[0].id;resetUIState()}
  save();renderBooks();setHeading();toast('Book deleted');
}
function openBookForm(editId){
  const editing=editId?S.books.find(b=>b.id===editId):null;
  const st={title:editing?editing.title:'',sub:editing?editing.sub:'',hue:editing?editing.hue:S.books.length%8,emblem:editing?editing.emblem:'note'};
  const prev=h('div',{class:'bf-prev'});
  const drawPrev=()=>prev.replaceChildren(makeBook(st,{preview:true}));
  const title=h('input',{class:'field',maxlength:'40',placeholder:'Vienna, Work, Dreams…','aria-label':'Title',autocomplete:'off'});
  const sub=h('input',{class:'field',maxlength:'60',placeholder:'What goes in here? (optional)','aria-label':'Subtitle',autocomplete:'off'});
  title.value=st.title;sub.value=st.sub;
  title.addEventListener('input',()=>{st.title=title.value;drawPrev()});
  sub.addEventListener('input',()=>{st.sub=sub.value;drawPrev()});
  const sw=h('div',{class:'swatches',role:'radiogroup','aria-label':'Cover colour'}),eb=h('div',{class:'embs',role:'radiogroup','aria-label':'Emblem'});
  const paintSel=()=>{
    $$('button',sw).forEach((b,i)=>b.setAttribute('aria-checked',i===st.hue?'true':'false'));
    $$('button',eb).forEach((b,i)=>b.setAttribute('aria-checked',Object.keys(EMB)[i]===st.emblem?'true':'false'));
    drawPrev();
  };
  for(let i=0;i<8;i++){const b=h('button',{class:'sw',type:'button',role:'radio','aria-label':'Colour '+(i+1),style:'--cc:var(--c'+i+')'});b.addEventListener('click',()=>{st.hue=i;paintSel()});sw.append(b)}
  for(const k of Object.keys(EMB)){const b=h('button',{type:'button',role:'radio','aria-label':k});b.innerHTML='<svg viewBox="0 0 34 34">'+EMB[k]+'</svg>';b.addEventListener('click',()=>{st.emblem=k;paintSel()});eb.append(b)}
  const submit=()=>{
    const t=title.value.trim();if(!t){title.focus();toast('Give the book a title');return}
    closeModal();
    if(editing){editing.title=t.slice(0,40);editing.sub=sub.value.trim().slice(0,60);editing.hue=st.hue;editing.emblem=st.emblem;save();renderBooks();setHeading()}
    else{const nb=newBook(t.slice(0,40),sub.value.trim().slice(0,60),st.hue,st.emblem);S.books.push(nb);openBook(nb.id)}
  };
  title.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();submit()}});
  sub.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();submit()}});
  showModal([
    h('div',{class:'sheet-head'},h('div',{class:'eyebrow'},editing?'Edit':'New'),h('h3',null,editing?'Edit brain book':'Bind a new brain book')),
    h('div',{class:'bf'},prev,h('div',{class:'bf-fields'},
      h('div',null,h('div',{class:'namer-lab'},'Title'),title),
      h('div',null,h('div',{class:'namer-lab'},'Subtitle'),sub),
      h('div',null,h('div',{class:'namer-lab'},'Cover'),sw),
      h('div',null,h('div',{class:'namer-lab'},'Emblem'),eb))),
    h('div',{class:'sheet-foot'},h('button',{class:'btn ghost',type:'button',onclick:closeModal},'Cancel'),h('button',{class:'btn primary',type:'button',onclick:submit},editing?'Save changes':'Create and open'))
  ],'bookform');
  paintSel();title.focus();
}
/* ================= SETTINGS ================= */
function applySettings(){
  const r=document.documentElement;
  r.dataset.skin=SKINS.some(s=>s.id===settings.skin)?settings.skin:'abendrot';
  r.classList.toggle('reduce',reduceMotion());
  document.body.classList.toggle('usegrain',!!settings.grain);
  document.body.classList.toggle('noclock',!settings.clock);
  refreshColors();
}
function setSetting(k,v){
  settings[k]=v;saveSettings();applySettings();
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
  body.replaceChildren(
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
      rowSeg('Titles',null,'labels',[['auto','Auto'],['always','Always'],['off','Off']]),
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
    {label:'Go to Notes',kind:'View',fn:()=>go('notes')},
    {label:'Go to Web',kind:'View',fn:()=>go('web')},
    {label:'Go to Books',kind:'View',fn:()=>go('books')},
    {label:'New brain book',kind:'Action',fn:()=>{go('books');openBookForm(null)}},
    {label:settings.sound?'Turn jazz keys off':'Turn jazz keys on',kind:'Action',fn:()=>{Jazz.setOn(!settings.sound);saveSettings();Jazz.sync()}},
    {label:'Open the Keys panel',kind:'Action',fn:()=>toggleKeys(true)},
    {label:'Focus mode',kind:'Action',fn:()=>toggleFocus(true)},
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

/* ================= clock, loop, start ================= */
function tickClock(){const b=$('#clock b');if(b)b.textContent=fmtVie.format(new Date())}
function loop(now){
  requestAnimationFrame(loop);
  if(document.hidden)return;
  try{if(S.view==='string')strFrame(now);else if(S.view==='web')webFrame(now)}catch(e){if(!loop.warned){loop.warned=true;console.error(e)}}
}
function init(){
  loadData();
  applySettings();
  initString();initWeb();
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
  if(settings.sound&&!Jazz.enabled())settings.sound=false;
  $('#keysBtn').addEventListener('click',e=>{e.stopPropagation();toggleKeys()});
  document.addEventListener('pointerdown',e=>{
    const pop=$('#keysPop');
    if(!pop.hidden&&!pop.contains(e.target)&&!$('#keysBtn').contains(e.target))toggleKeys(false);
  });
  new ResizeObserver(()=>{if(S.view==='books'){const w=$('#booksBody').clientWidth,per=Math.max(1,Math.floor((Math.max(280,w-116)+SG)/(BW+SG)));if(per!==booksPer)renderBooks()}}).observe($('#booksBody'));
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if($('#modal').classList.contains('on'))closeModal();else openPalette();return}
    if(e.altKey&&/^[1-4]$/.test(e.key)){e.preventDefault();go(VIEWS[+e.key-1]);return}
    if(e.altKey&&e.key.toLowerCase()==='j'){e.preventDefault();Jazz.setOn(!settings.sound);saveSettings();Jazz.sync();return}
    if(e.key!=='Escape')return;
    if(menuEl)closeMenu();
    else if($('#modal').classList.contains('on'))closeModal();
    else if($('#drawer').classList.contains('on')){closeSettings();$('#openSettings').focus()}
    else if(!$('#keysPop').hidden)toggleKeys(false);
    else if(document.body.classList.contains('focus'))toggleFocus(false);
    else if(web.linkFrom){web.linkFrom=null;renderLinkBanner();renderDetail()}
  });
  flushSave();
  S.view='string';go('string');
  requestAnimationFrame(loop);
}
init();
