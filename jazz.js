'use strict';
/* mind. jazz keys
   A small Web Audio band that answers your typing. Keys are mapped to the scale of the chord that is
   sounding, so every letter lands on a good note. A walking bass and brushes join while you write. */
const Jazz=(()=>{
  const NAMES=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
  const Q={
    maj9:{v:[4,7,11,14],sc:[0,2,4,6,7,9,11],lab:'maj9'},
    maj7:{v:[4,7,11,14],sc:[0,2,4,5,7,9,11],lab:'maj7'},
    m9:{v:[3,7,10,14],sc:[0,2,3,5,7,9,10],lab:'m9'},
    m7:{v:[3,7,10,14],sc:[0,2,3,5,7,9,10],lab:'m7'},
    m7b5:{v:[3,6,10,13],sc:[0,1,3,5,6,8,10],lab:'m7♭5'},
    dom:{v:[4,10,14,21],sc:[0,2,4,5,7,9,10],lab:'13'},
    alt:{v:[4,10,13,15],sc:[0,1,3,4,6,8,10],lab:'7alt'},
    d7:{v:[4,10,14,17],sc:[0,2,4,5,7,9,10],lab:'7'}
  };
  const PROGS={
    'ii-v-i':{name:'ii–V–I',ch:[[2,'m9'],[7,'dom'],[0,'maj9'],[9,'alt']]},
    minor:{name:'Minor',ch:[[2,'m7b5'],[7,'alt'],[0,'m9'],[0,'m9']]},
    autumn:{name:'Autumn',ch:[[2,'m7'],[7,'dom'],[0,'maj7'],[5,'maj7'],[11,'m7b5'],[4,'alt'],[9,'m9'],[9,'m9']]},
    blues:{name:'Blues',ch:[[0,'d7'],[5,'d7'],[0,'d7'],[0,'d7'],[5,'d7'],[5,'d7'],[0,'d7'],[9,'alt'],[2,'m7'],[7,'d7'],[0,'d7'],[7,'d7']]}
  };
  const ROWS=[['zxcvbnm,./',0],['asdfghjkl;',3],['qwertyuiop',6],['1234567890',9]];
  const lis={note:[],chord:[]};
  const emit=(k,v)=>lis[k].forEach(f=>{try{f(v)}catch(e){}});
  const cfg=()=>settings;
  const mtof=m=>440*Math.pow(2,(m-69)/12);
  let ctx=null,keysIn=null,bus=null,master=null,wet=null,dry=null,noiseBuf=null,timer=0,nextT=0,beat=0,bar=0,lastAct=-1e9,lastKey=0,chords=[];
  const pianos=[],lit=new Map();

  /* ----- audio graph ----- */
  function build(){
    const A=window.AudioContext||window.webkitAudioContext;if(!A)return false;
    try{ctx=new A({latencyHint:'interactive'})}catch(e){ctx=new A()}
    const comp=ctx.createDynamicsCompressor();comp.threshold.value=-20;comp.ratio.value=3.5;comp.attack.value=.004;comp.release.value=.25;
    master=ctx.createGain();master.connect(comp);comp.connect(ctx.destination);
    bus=ctx.createGain();
    const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=6400;
    dry=ctx.createGain();wet=ctx.createGain();
    const verb=ctx.createConvolver();verb.buffer=impulse(2.4);
    bus.connect(lp);lp.connect(dry);lp.connect(verb);verb.connect(wet);dry.connect(master);wet.connect(master);
    keysIn=ctx.createGain();const tg=ctx.createGain();tg.gain.value=.9;keysIn.connect(tg);tg.connect(bus);
    const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=4.4;lg.gain.value=.09;lfo.connect(lg);lg.connect(tg.gain);lfo.start();
    noiseBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);
    const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    mix();return true;
  }
  function impulse(sec){
    const r=ctx.sampleRate,n=Math.floor(r*sec),b=ctx.createBuffer(2,n,r);
    for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.6)}
    return b;
  }
  function ensure(){
    if(!ctx&&!build())return false;
    if(ctx.state==='suspended')ctx.resume();
    return true;
  }
  function mix(){
    if(!ctx)return;const s=cfg(),t=ctx.currentTime,r=s.jzReverb/100;
    master.gain.setTargetAtTime(s.volume/100*.95,t,.03);
    wet.gain.setTargetAtTime(r*.95,t,.05);dry.gain.setTargetAtTime(1-r*.3,t,.05);
  }
  const env=(g,t,a,peak,dec,sus,dur)=>{
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);
    g.gain.exponentialRampToValueAtTime(Math.max(sus,.0003),t+a+dec);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  };

  /* ----- voices ----- */
  function rhodes(f,t,vel,dur){
    const g=ctx.createGain(),car=ctx.createOscillator(),mod=ctx.createOscillator(),mg=ctx.createGain(),tine=ctx.createOscillator(),tg=ctx.createGain();
    car.frequency.value=f;mod.frequency.value=f;tine.frequency.value=f*7;
    mg.gain.setValueAtTime(f*(1+vel*2.4),t);mg.gain.exponentialRampToValueAtTime(f*.12,t+.55);
    mod.connect(mg);mg.connect(car.frequency);car.connect(g);
    tg.gain.setValueAtTime(vel*.05,t);tg.gain.exponentialRampToValueAtTime(.0001,t+.08);tine.connect(tg);tg.connect(g);
    env(g,t,.004,vel*.34,.55,vel*.07,dur);g.connect(keysIn);
    [car,mod,tine].forEach(o=>{o.start(t);o.stop(t+dur+.1)});
  }
  function vibes(f,t,vel,dur){
    const g=ctx.createGain(),a=ctx.createOscillator(),b=ctx.createOscillator(),bg=ctx.createGain();
    a.frequency.value=f;b.frequency.value=f*4.02;bg.gain.setValueAtTime(vel*.5,t);bg.gain.exponentialRampToValueAtTime(.001,t+.35);
    a.connect(g);b.connect(bg);bg.connect(g);env(g,t,.003,vel*.3,1.4,vel*.02,dur);g.connect(keysIn);
    [a,b].forEach(o=>{o.start(t);o.stop(t+dur+.1)});
  }
  function pluck(f,t,vel,dur){
    const g=ctx.createGain(),o=ctx.createOscillator(),o2=ctx.createOscillator(),lp=ctx.createBiquadFilter();
    o.type='triangle';o2.type='sawtooth';o.frequency.value=f;o2.frequency.value=f*1.003;
    lp.type='lowpass';lp.frequency.setValueAtTime(3200*vel+500,t);lp.frequency.exponentialRampToValueAtTime(420,t+.35);
    const m2=ctx.createGain();m2.gain.value=.25;o2.connect(m2);m2.connect(lp);o.connect(lp);lp.connect(g);
    env(g,t,.003,vel*.3,.5,vel*.02,dur);g.connect(keysIn);
    [o,o2].forEach(x=>{x.start(t);x.stop(t+dur+.1)});
  }
  function bassNote(m,t,vel,dur){
    const f=mtof(m),o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter(),m2=ctx.createGain();
    o.type='sine';o2.type='triangle';o.frequency.value=f;o2.frequency.value=f;m2.gain.value=.4;
    lp.type='lowpass';lp.frequency.setValueAtTime(760,t);lp.frequency.exponentialRampToValueAtTime(230,t+.3);
    o.connect(lp);o2.connect(m2);m2.connect(lp);lp.connect(g);env(g,t,.006,vel*.55,.2,vel*.1,dur);g.connect(master);
    [o,o2].forEach(x=>{x.start(t);x.stop(t+dur+.1)});
  }
  function noise(t,kind,vel){
    const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
    s.buffer=noiseBuf;s.playbackRate.value=.9+Math.random()*.2;
    let a=.001,pk=.06,dec=.25;
    if(kind==='ride'){f.type='bandpass';f.frequency.value=7600;f.Q.value=1.1;pk=.075;dec=.32}
    else if(kind==='hat'){f.type='highpass';f.frequency.value=6500;pk=.05;dec=.05}
    else{f.type='bandpass';f.frequency.value=2600;f.Q.value=.6;a=.02;pk=.05;dec=.16}
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(pk*vel,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+dec);
    s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random()*.5);s.stop(t+a+dec+.05);
  }
  function voice(m,t,vel,dur){
    const i=cfg().jzInstr,f=mtof(m);
    if(i==='vibes')vibes(f,t,vel,dur||2.6);else if(i==='pluck')pluck(f,t,vel,dur||1.3);else rhodes(f,t,vel,dur||2.4);
  }

  /* ----- harmony ----- */
  function chordAt(i){
    const s=cfg(),P=PROGS[s.jzProg]||PROGS['ii-v-i'],n=P.ch.length,c=P.ch[((i%n)+n)%n],root=(s.jzKey+c[0])%12,q=Q[c[1]];
    return {root,Q:q,name:NAMES[root]+q.lab,idx:((i%n)+n)%n};
  }
  function chordNow(){
    if(ctx){for(let i=chords.length-1;i>=0;i--)if(chords[i].t<=ctx.currentTime+.02)return chords[i].c}
    return chordAt(0);
  }
  function fold(m,lo,hi){while(m>hi)m-=12;while(m<lo)m+=12;return m}
  function degreeOf(ch){
    const c=String(ch).toLowerCase();
    for(const [row,base] of ROWS){const i=row.indexOf(c);if(i>=0)return base+i}
    return c.codePointAt(0)%14;
  }
  function pitchOf(ch,c){
    const d=degreeOf(ch),oct=Math.floor(d/7),idx=d%7;
    return fold(48+c.root+c.Q.sc[idx]+12*oct,48,83);
  }
  function voicing(c){const base=48+c.root;return c.Q.v.map(v=>fold(base+v,50,78))}

  /* ----- the band ----- */
  const bandOn=()=>{const s=cfg();return s.sound&&s.jzBand&&(!s.jzIdle||performance.now()-lastAct<9000)};
  function playBeat(t,b,bi){
    const bd=60/cfg().jzTempo,c=chordAt(bi);
    if(b===0){
      chords.push({t,c});if(chords.length>8)chords.shift();
      setTimeout(()=>emit('chord',c),Math.max(0,(t-ctx.currentTime)*1000));
    }
    if(!bandOn())return;
    const nx=chordAt(bi+1),sc=c.Q.sc,root=36+c.root;
    let m;
    if(b===0)m=root;
    else if(b===1)m=root+sc[[1,2,4][Math.floor(Math.random()*3)]];
    else if(b===2)m=root+(Math.random()<.6?7:sc[5]);
    else m=36+nx.root+(Math.random()<.5?-1:1);
    bassNote(fold(m,33,52),t,.78+Math.random()*.22,bd*1.05);
    noise(t,'ride',b%2?.7:1);
    if(b===1||b===3){noise(t+bd*2/3,'ride',.42);noise(t,'hat',.8)}
    if((b===0&&Math.random()<.35)||((b===2||b===3)&&Math.random()<.28)){
      const st=t+bd*2/3;voicing(c).forEach((m2,i)=>voice(m2,st+i*.011,.34+Math.random()*.12,1.4));
    }
  }
  function sched(){
    if(!ctx)return;const now=ctx.currentTime;
    if(nextT<now-.5)nextT=now+.05;
    while(nextT<now+.12){
      playBeat(nextT,beat,bar);nextT+=60/cfg().jzTempo;beat++;if(beat>=4){beat=0;bar++}
    }
  }
  function startClock(){
    if(timer||!ensure())return;
    nextT=ctx.currentTime+.08;beat=0;bar=0;chords=[];
    timer=setInterval(sched,25);
  }
  function stopClock(){clearInterval(timer);timer=0}

  /* ----- piano views ----- */
  function el(n,a){const e=document.createElementNS('http://www.w3.org/2000/svg',n);for(const k in a)e.setAttribute(k,a[k]);return e}
  function pianoSvg(){
    const lo=48,hi=83,ww=14,wh=64,bw=9,bh=40,whites=[];
    for(let m=lo;m<=hi;m++)if([0,2,4,5,7,9,11].includes(m%12))whites.push(m);
    const svg=el('svg',{viewBox:'0 0 '+whites.length*ww+' '+wh,class:'piano',role:'img','aria-label':'Keys that light up as you play'});
    whites.forEach((m,i)=>svg.append(el('rect',{x:i*ww+.5,y:.5,width:ww-1,height:wh-1,rx:2,class:'pk w','data-m':m})));
    for(let m=lo;m<=hi;m++){
      if(![1,3,6,8,10].includes(m%12))continue;
      const wi=whites.indexOf(m-1);if(wi<0)continue;
      svg.append(el('rect',{x:(wi+1)*ww-bw/2,y:.5,width:bw,height:bh,rx:1.6,class:'pk b','data-m':m}));
    }
    pianos.push(svg);return svg;
  }
  function light(m){
    clearTimeout(lit.get(m));
    for(const p of pianos){const k=p.querySelector('[data-m="'+m+'"]');if(k)k.classList.add('on')}
    lit.set(m,setTimeout(()=>{for(const p of pianos){const k=p.querySelector('[data-m="'+m+'"]');if(k)k.classList.remove('on')}},520));
  }

  /* ----- playing ----- */
  function note(m,vel,t){
    voice(m,t||ctx.currentTime+.004,vel);
    const d=Math.max(0,((t||ctx.currentTime)-ctx.currentTime)*1000);
    setTimeout(()=>{light(m);emit('note',{m,vel})},d);
  }
  function active(){return !!cfg().sound&&ensure()}
  const api={
    NAMES,PROGS,Q,
    on(k,f){lis[k].push(f)},
    piano:pianoSvg,
    enabled:()=>!!cfg().sound,
    mix,
    setOn(v){cfg().sound=v;if(v){if(ensure())startClock()}else stopClock()},
    chordNames(){const s=cfg(),P=PROGS[s.jzProg]||PROGS['ii-v-i'];return P.ch.map((c,i)=>chordAt(i).name)},
    current:chordNow,
    key(ch,shift){
      if(!active())return;
      const now=performance.now();if(now-lastKey<28)return;lastKey=now;lastAct=now;startClock();
      note(pitchOf(ch,chordNow()),(.62+Math.random()*.3)*(shift?1.18:1));
    },
    space(){
      if(!active())return;lastAct=performance.now();startClock();
      const c=chordNow(),m=fold(36+c.root+(Math.random()<.5?0:7),33,52);
      bassNote(m,ctx.currentTime+.004,.85,.5);noise(ctx.currentTime+.004,'brush',.8);
    },
    back(){
      if(!active())return;lastAct=performance.now();
      const c=chordNow();note(fold(48+c.root+c.Q.sc[[0,2,4][Math.floor(Math.random()*3)]],48,67),.45);
    },
    type(ev){
      if(!ev||!ev.inputType||!cfg().sound)return;
      if(ev.inputType.startsWith('insert')){
        const ch=ev.data==null?' ':ev.data;
        if(/^\s+$/.test(ch))api.space();else api.key(ch,ch!==ch.toLowerCase()&&ch===ch.toUpperCase());
      }else if(ev.inputType.startsWith('delete'))api.back();
    },
    knot(){
      if(!active())return;lastAct=performance.now();startClock();
      const c=chordNow(),t=ctx.currentTime+.01;
      bassNote(fold(36+c.root,33,52),t,.95,1.2);noise(t,'ride',1);
      voicing(c).forEach((m,i)=>{voice(m,t+i*.028,.5+Math.random()*.1,2.8);setTimeout(()=>light(m),i*28)});
      emit('note',{m:voicing(c)[0],vel:1,big:true});
    },
    demo(){
      if(!ensure())return;lastAct=performance.now();startClock();
      const bd=60/cfg().jzTempo,t0=ctx.currentTime+.06,degs=[2,4,6,9,8,6,4,7,5,2];
      degs.forEach((d,i)=>{
        const t=t0+Math.floor(i/2)*bd+(i%2?bd*2/3:0),c=chordNow();
        const m=fold(48+c.root+c.Q.sc[d%7]+12*Math.floor(d/7)+12,52,80);
        note(m,.7+Math.random()*.2,t);
      });
    },
    /* the control panel behind the Keys button */
    panel(){
      const s=cfg(),pills=h('div',{class:'kp-chords'}),
        save=()=>saveSettings();
      const drawPills=()=>{
        const names=api.chordNames();
        pills.replaceChildren(...names.map((n,i)=>h('span',{class:'kp-chord','data-i':i},n)));
        const c=chordNow();pills.querySelectorAll('.kp-chord').forEach(p=>p.classList.toggle('now',+p.dataset.i===c.idx));
      };
      api.on('chord',c=>{
        pills.querySelectorAll('.kp-chord').forEach(p=>p.classList.toggle('now',+p.dataset.i===c.idx));
        document.querySelectorAll('[data-chord]').forEach(e=>{e.textContent=c.name;e.hidden=!s.sound});
      });
      const sw=h('button',{class:'switch',type:'button',role:'switch','aria-checked':s.sound?'true':'false','aria-label':'Jazz keys on'});
      sw.addEventListener('click',()=>{
        const v=sw.getAttribute('aria-checked')!=='true';sw.setAttribute('aria-checked',String(v));
        api.setOn(v);save();syncKeysButton();
      });
      const range=(label,key,min,max,fmt)=>{
        const out=h('span',{class:'val'},fmt(s[key])),inp=h('input',{type:'range',min,max,step:1,'aria-label':label});inp.value=s[key];
        inp.addEventListener('input',()=>{s[key]=+inp.value;out.textContent=fmt(s[key]);save();mix()});
        return h('div',{class:'row stack'},h('div',{class:'kp-rl'},h('span',{class:'lbl'},label),out),inp);
      };
      const seg=(label,key,opts,after)=>{
        const e=h('div',{class:'seg',role:'radiogroup','aria-label':label});
        segment(e,opts,s[key],v=>{s[key]=v;save();if(after)after()});
        return h('div',{class:'row stack'},h('span',{class:'lbl'},label),e);
      };
      const sw2=(label,key)=>{
        const b=h('button',{class:'switch',type:'button',role:'switch','aria-checked':s[key]?'true':'false','aria-label':label});
        b.addEventListener('click',()=>{const v=b.getAttribute('aria-checked')!=='true';b.setAttribute('aria-checked',String(v));s[key]=v;save()});
        return h('div',{class:'row'},h('span',{class:'lbl'},label),b);
      };
      const keySel=h('select',{class:'field',style:'width:auto;height:34px','aria-label':'Key'},NAMES.map((n,i)=>h('option',{value:i},n+(s.jzProg==='minor'?' minor':' major'))));
      keySel.value=s.jzKey;keySel.addEventListener('change',()=>{s.jzKey=+keySel.value;chords=[];save();drawPills()});
      const wrap=h('div',{class:'kp'},
        h('div',{class:'kp-head'},h('div',null,h('h3',null,'Jazz keys'),h('p',null,'Every letter lands on a good note. A band joins while you write.')),sw),
        pills,
        api.piano(),
        seg('Sound','jzInstr',[['rhodes','Rhodes'],['vibes','Vibes'],['pluck','Pluck']]),
        seg('Changes','jzProg',[['ii-v-i','ii–V–I'],['minor','Minor'],['autumn','Autumn'],['blues','Blues']],()=>{chords=[];drawPills();keySel.querySelectorAll('option').forEach((o,i)=>o.textContent=NAMES[i]+(s.jzProg==='minor'?' minor':' major'))}),
        h('div',{class:'row'},h('span',{class:'lbl'},'Key'),keySel),
        range('Tempo','jzTempo',60,160,v=>v+' bpm'),
        range('Volume','volume',0,100,v=>v+'%'),
        range('Room','jzReverb',0,100,v=>v+'%'),
        sw2('Bass and brushes','jzBand'),
        sw2('Band only while I type','jzIdle'),
        h('div',{class:'kp-foot'},h('button',{class:'btn small primary',type:'button',onclick:()=>{if(!s.sound){sw.click()}api.demo()}},'Play a phrase')));
      drawPills();return wrap;
    }
  };
  function syncKeysButton(){
    const b=document.getElementById('keysBtn');if(b)b.setAttribute('aria-pressed',cfg().sound?'true':'false');
    const mini=document.getElementById('pianoMini');if(mini)mini.hidden=!cfg().sound;
    document.querySelectorAll('[data-chord]').forEach(e=>{e.hidden=!cfg().sound;if(cfg().sound)e.textContent=chordNow().name});
  }
  api.sync=syncKeysButton;
  return api;
})();
