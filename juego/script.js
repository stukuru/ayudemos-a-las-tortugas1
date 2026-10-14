const TOTAL=20,TIME=55,CLOCK_RATE=1.4,MAX_ERRORS=4;
const AU=new Audio('assets/audio/inicio.mp3');AU.loop=true;AU.volume=.5;
let muted=false,fading=null,gfade=null;
const VM=new Audio('assets/audio/victoria.mp3');VM.volume=.6;
const GO=new Audio('assets/audio/derrota.mp3');GO.volume=.6;
const GM=new Audio('assets/audio/juego.mp3');GM.loop=true;GM.volume=.45;
const IM = {
  lbg: 'assets/images/fondo-derrota.png',
  ldead: 'assets/images/tortuga-muerta.png',
  lbtn: 'assets/images/boton-reiniciar-rojo.png',
  lt: 'assets/images/titulo-derrota.png',
  wtitle: 'assets/images/titulo-ganaste.png',
  wpop: 'assets/images/confeti.png',
  again: 'assets/images/boton-volver-a-jugar.png',
  wgold: 'assets/images/tortuga-dorada.png',
  sbg: 'assets/images/fondo-inicio.png',
  sturtle: 'assets/images/tortuga-inicio.png',
  sbtn: 'assets/images/boton-comenzar.png',
  title: 'assets/images/titulo.png',
  play: 'assets/images/boton-jugar.png',
  reu: 'assets/images/boton-reutilizar.png',
  jelly: 'assets/images/medusa.png',
  alga: 'assets/images/alga.png',
  crab: 'assets/images/cangrejo.png',
  bag: 'assets/images/bolsa-plastica.png',
  tote: 'assets/images/bolsa-reutilizable.png',
  bottle: 'assets/images/botella-plastica.png',
  cup: 'assets/images/vaso-plastico.png',
  glass: 'assets/images/botella-vidrio.png',
  news: 'assets/images/diario.png',
  clock: 'assets/images/reloj.png',
  restart: 'assets/images/boton-reiniciar.png'
};
const TV = 'assets/images/tortuga-verde.png';
const BG = 'assets/images/fondo-juego.png';
const ITEMS=[
{k:'jelly',n:'Medusa',nat:1},{k:'alga',n:'Alga',nat:1},{k:'crab',n:'Cangrejo',nat:1},
{k:'bag',n:'Bolsa plástica',b:'pla'},{k:'tote',n:'Bolsa reutilizable',b:'reu'},
{k:'bottle',n:'Botella plástica',b:'pla'},{k:'cup',n:'Vaso plástico',b:'pla'},
{k:'glass',n:'Botella de vidrio',b:'vid'},{k:'news',n:'Diario',b:'pap'}];
const BINS={pla:'Plástico',vid:'Vidrio',pap:'Papel y cartón',reu:'Reutilizar'};
const TIPS={
'Bolsa plástica':'Las bolsas parecen medusas para las tortugas. Van al contenedor de plástico, y mejor aún: usa bolsas reutilizables.',
'Bolsa reutilizable':'Se usa muchas veces: es la alternativa a la bolsa desechable.',
'Botella plástica':'Las botellas de plástico se reciclan en el contenedor de plástico.',
'Vaso plástico':'Los envases de plástico limpios se reciclan en el contenedor de plástico.',
'Botella de vidrio':'El vidrio se recicla una y otra vez en su propio contenedor.',
'Caja de cartón':'El cartón limpio y seco va a papel y cartón.',
'Diario':'El papel va a papel y cartón.',
'Medusa':'La medusa es alimento natural de la tortuga laúd.',
'Alga':'Las tortugas verdes comen algas y pastos marinos.',
'Cangrejo':'Algunas tortugas marinas comen crustáceos.'};
const WHY={
'Bolsa plástica':'Las bolsas plásticas suelen reciclarse solo si están limpias y secas. Lo mejor es no usarlas: si se escapan al mar, parecen medusas para las tortugas.',
'Bolsa reutilizable':'Está hecha para usarse muchas veces. Si la botas con la basura, se produce más residuo y se gasta más material.',
'Botella plástica':'Los envases de plástico se reciclan si van limpios y separados. Mezclados con restos de comida o papel se ensucian y muchas veces ya no se pueden reciclar.',
'Vaso plástico':'Los envases de plástico se reciclan si van limpios y separados. Si se mezclan con papel o vidrio, contaminan ese material.',
'Botella de vidrio':'El vidrio se recicla una y otra vez sin perder calidad, pero solo si va en su contenedor. Mezclado con otros residuos se rompe y se pierde.',
'Diario':'El papel se recicla si está limpio y seco. Mezclado con plástico o restos de comida se ensucia y ya no sirve para reciclar.'};
const FACTS=[
'Las tortugas confunden las bolsas con medusas.',
'Las tortugas jóvenes suelen comer más plástico que las adultas.',
'En Chile la Ley 21.100 prohíbe entregar bolsas plásticas en el comercio.',
'El plástico tarda muchísimo tiempo en degradarse y se rompe en microplásticos.',
'Se estima que hasta el 52 % de las tortugas marinas del mundo podría haber ingerido residuos.',
'Primero reducir, luego reutilizar y al final reciclar.'];
const $=s=>document.querySelector(s);
const area=$('#area'),turtle=$('#turtle'),ov=$('#ov'),toastEl=$('#toast');
let gold=false;
let S,raf,last,tt;
$('#game').style.backgroundImage='url('+BG+')';turtle.src=TV;

function hud(){
  $('#time').textContent=Math.max(0,Math.ceil(S.time));$('#time').classList.toggle('low',S.time<=10&&!!S.run);$('#pts').textContent=S.pts+'/'+TOTAL;
  const l=$('#lifebar');l.style.width=Math.max(0,S.life)+'%';
  l.style.background=S.life>60?'#4ade80':S.life>30?'#facc15':'#ef4444';
}
function toast(m,bad){
  toastEl.textContent=m;toastEl.className='show'+(bad?' bad':'');
  clearTimeout(tt);tt=setTimeout(()=>toastEl.className='',3800);
}
function pick(){
  const nat=Math.random()<.35,pool=ITEMS.filter(i=>!!i.nat===nat);
  return pool[Math.floor(Math.random()*pool.length)];
}
function start(g){
  g=g===true;
  ov.style.backgroundImage='';
  GO.pause();GO.currentTime=0;VM.pause();VM.currentTime=0;
  if(!AU.paused)stopMusic();
  gameMusic();
  ov.className='';
  cancelAnimationFrame(raf);toastEl.className='';
  ov.style.display='none';
  area.querySelectorAll('.item').forEach(i=>i.remove());
  S={time:TIME,pts:0,life:100,spawned:0,done:0,eaten:0,errs:[],items:[],sel:null,lastSp:-9,t:0,run:true,tx:area.clientWidth/2,tg:area.clientWidth/2,tt:1};drag=null;
  gold=g;turtle.src=g?IM.wgold:TV;
  hud();last=performance.now();raf=requestAnimationFrame(loop);
}
let drag=null;
function spawn(){
  const d=pick(),el=document.createElement('div');
  el.className='item';el.innerHTML='<img src="'+IM[d.k]+'" draggable="false"><small>'+d.n+'</small>';
  const it={d,el,x:Math.random()*(area.clientWidth-68),y:-70,drag:false,moved:0,sx:0,sy:0,dx:0,dy:0};
  place(it);
  const down=e=>{
    if(!S.run||drag)return;
    const t=e.changedTouches?e.changedTouches[0]:e;
    e.preventDefault();
    const r=area.getBoundingClientRect();
    drag=it;it.drag=true;it.moved=0;it.sx=t.clientX;it.sy=t.clientY;
    it.dx=t.clientX-r.left-it.x;it.dy=t.clientY-r.top-it.y;
  };
  el.addEventListener('touchstart',down,{passive:false});
  el.addEventListener('mousedown',down);
  area.appendChild(el);S.items.push(it);S.spawned++;
}
function pt(e){return e.changedTouches?e.changedTouches[0]:e}
function mv(e){
  if(!drag)return;e.preventDefault();
  const t=pt(e),it=drag,r=area.getBoundingClientRect();
  it.moved=Math.max(it.moved,Math.abs(t.clientX-it.sx),Math.abs(t.clientY-it.sy));
  it.x=Math.min(Math.max(t.clientX-r.left-it.dx,0),area.clientWidth-68);
  it.y=Math.min(Math.max(t.clientY-r.top-it.dy,-40),area.clientHeight-40);
  place(it);
}
function up(e){
  if(!drag)return;e.preventDefault();
  const t=pt(e),it=drag;drag=null;it.drag=false;
  if(!S.run||!S.items.includes(it))return;
  if(it.moved<8){
    const was=S.sel===it;
    if(S.sel)S.sel.el.classList.remove('sel');
    S.sel=was?null:it;if(!was)it.el.classList.add('sel');
    return;
  }
  const bin=[...document.querySelectorAll('.bin')].find(b=>{const q=b.getBoundingClientRect();return t.clientX>=q.left&&t.clientX<=q.right&&t.clientY>=q.top&&t.clientY<=q.bottom});
  if(bin)sort(it,bin.dataset.b);
}
window.addEventListener('touchmove',mv,{passive:false});
window.addEventListener('mousemove',mv);
window.addEventListener('touchend',up,{passive:false});
window.addEventListener('mouseup',up);
window.addEventListener('touchcancel',()=>{if(drag){drag.drag=false;drag=null}});
area.addEventListener('click',e=>{
  if(!S.run||!S.sel||e.target.closest('.item'))return;
  const r=area.getBoundingClientRect(),it=S.sel;
  it.x=Math.min(Math.max(e.clientX-r.left-34,0),area.clientWidth-68);place(it);
});
function place(it){it.el.style.transform='translate('+it.x+'px,'+it.y+'px)'}
function remove(it){
  it.el.remove();S.items=S.items.filter(i=>i!==it);
  if(S.sel===it)S.sel=null;S.done++;
}
function err(type,it,bin){
  S.errs.push({type:type,n:it.d.n,bin:bin});
  S.life-=100/MAX_ERRORS;
  if(type==='eaten')S.eaten++;
}
function sort(it,bin){
  if(!S.run)return;remove(it);
  if(it.d.nat){
    err('food',it);toast('❌ ¡Eso era comida de la tortuga! '+TIPS[it.d.n],1);
  }else if(bin===it.d.b){
    S.pts++;toast('✅ '+it.d.n+' → '+BINS[bin]+'. '+TIPS[it.d.n]);
  }else{
    err('wrong',it,bin);toast('❌ '+it.d.n+' no va en «'+BINS[bin]+'». Va en «'+BINS[it.d.b]+'».',1);
  }
  hud();
}
function eat(it){
  remove(it);
  if(it.d.nat){S.pts++;toast('La tortuga comió '+it.d.n.toLowerCase()+': ¡es su alimento!')}
  else{err('eaten',it);toast('⚠️ '+FACTS[(S.eaten-1)%FACTS.length],1)}
  hud();
}
function miss(it){
  remove(it);
  if(it.d.nat)toast('La tortuga no alcanzó a comer '+it.d.n.toLowerCase()+'. Acércala a la tortuga.');
  else{err('left',it);toast('🌊 '+it.d.n+' quedó flotando en el mar. Llévala a su contenedor.',1)}
  hud();
}
function loop(n){
  if(!S.run)return;
  const dt=Math.min((n-last)/1000,.1);last=n;S.time-=dt*CLOCK_RATE;S.t+=dt;
  const W=area.clientWidth,H=area.clientHeight,mult=1+S.t/10;
  S.tt-=dt;
  if(S.tt<=0||Math.abs(S.tg-S.tx)<4){S.tg=40+Math.random()*(W-80);S.tt=.5+Math.random()*.9}
  S.tx+=Math.sign(S.tg-S.tx)*Math.min(Math.abs(S.tg-S.tx),90*mult*dt);
  turtle.style.left=S.tx+'px';
  const spd=$('#spd');spd.textContent='Velocidad ×'+mult.toFixed(1);
  spd.style.background=mult<2?'rgba(0,0,0,.5)':mult<3?'#d97706':'#dc2626';
  const gap=Math.max(1.1,2.1-S.t*.03),fall=Math.max(3.2,5.6-S.t*.07);
  if(S.spawned<TOTAL&&(S.items.length<1||S.t-S.lastSp>gap)){spawn();S.lastSp=S.t}
  for(const it of S.items.slice()){
    if(it.drag)continue;
    it.y+=H/fall*dt;
    if(it.y>H-95){
      if(Math.abs(it.x+34-S.tx)<56)eat(it);
      else if(it.y>H-30)miss(it);
      else place(it);
    }else place(it);
  }
  hud();
  if(S.life<=0)return end('dead');
  if(S.done>=TOTAL)return end('finish');
  if(S.time<=0)return end('time');
  raf=requestAnimationFrame(loop);
}
function reasons(){
  const seen={},out=[];
  S.errs.forEach(e=>{
    const k=e.type==='wrong'?e.type+e.n+e.bin:e.type;
    if(seen[k])return;seen[k]=1;
    if(e.type==='wrong')out.push('<b>'+e.n+' en «'+BINS[e.bin]+'».</b> '+(WHY[e.n]||''));
    else if(e.type==='eaten')out.push('<b>La tortuga comió basura ('+e.n.toLowerCase()+').</b> Los residuos que llegan al mar pueden ser tragados por animales que los confunden con alimento. En la vida real, no dejes basura en calles, ríos ni playas, y llévala siempre a su contenedor.');
    else if(e.type==='left')out.push('<b>'+e.n+' quedó flotando.</b> En la vida real, un residuo que no se clasifica termina en la calle, los ríos y el mar. Si no hay un contenedor cerca, llévalo contigo hasta encontrar uno.');
    else out.push('<b>Tiraste '+e.n.toLowerCase()+' como si fuera basura.</b> Es alimento natural de las tortugas. En la vida real, no saques ni arrojes animales o algas del mar: forman parte de su ecosistema.');
  });
  return out;
}
function end(r){
  stopGame();
  const win=r==='finish';
  if(!win&&!muted){GO.currentTime=0;GO.play().catch(()=>{})}
  if(win&&!muted){VM.currentTime=0;VM.play().catch(()=>{})}
  S.run=false;cancelAnimationFrame(raf);
  const perfect=win&&S.pts===TOTAL,tips=reasons(),ul=t=>t.length?'<ul>'+t.map(x=>'<li>'+x+'</li>').join('')+'</ul>':'';
  if(win){
    gold=perfect;
    const h='<h1>'+(perfect?'¡Perfecto!':'¡Lo lograste!')+'</h1><p>'+(perfect?'Clasificaste los '+TOTAL+' objetos a tiempo y sin errores: '+S.pts+' de '+TOTAL+' puntos.':'Pasaron los '+TOTAL+' objetos antes de que se acabara el tiempo. Acertaste con '+S.pts+' de '+TOTAL+' y cometiste '+S.errs.length+' '+(S.errs.length===1?'error':'errores')+' (el límite era '+MAX_ERRORS+').')+'</p>'+
    (perfect?'<p><b>Recompensa:</b> ¡desbloqueaste la skin dorada con corona para la tortuga!</p><p><b>En la vida real:</b> lo mejor es reducir. La bolsa que no se usa nunca llega al mar. Primero reduce, luego reutiliza y al final recicla.</p>':
    '<p>Llega a '+TOTAL+' de '+TOTAL+' puntos, sin errores, para ganar la skin dorada.</p>'+(tips.length?'<p><b>Cómo mejorar en la vida real:</b></p>'+ul(tips):''));
    ov.className='win';ov.style.backgroundImage='url('+IM.sbg+')';
    ov.innerHTML='<img class="wt" data-k="wtitle" alt="¡Ganaste!"><div class="wcard">'+h+'</div>'+
    '<div class="wstage"><button id="again" aria-label="Volver a jugar"><img data-k="again" alt="Volver a jugar"></button>'+
    '<div class="wbox"><img class="wpop" data-k="wpop" alt=""><img class="wtur" '+(perfect?'data-k="wgold"':'src="'+TV+'"')+' alt="Tortuga"></div></div>';
  }else{
    if(r==='time')tips.push('<b>Se acabó el tiempo.</b> En la vida real, decidir rápido dónde va cada residuo evita que se acumule la basura. Aprende de memoria qué va en cada contenedor.');
    if(!tips.length)tips.push('En la vida real, clasificar rápido y bien evita que los residuos queden en la calle y lleguen al mar. Piensa dónde va cada cosa antes de tirarla.');
    const msg=r==='time'?'No me ayudaste a clasificar a tiempo: el reloj se acabó y la basura que quedó en el mar terminó en mi estómago.':'Cometiste demasiados errores y ya no pude seguir nadando.';
    ov.className='lose';ov.style.backgroundImage='url('+IM.lbg+')';
    ov.innerHTML='<div class="ltop"><img class="ldead" data-k="ldead" alt="Tortuga"><img class="lt" data-k="lt" alt="La tortuga no sobrevivió..."></div><div class="lcard"><p>'+msg+'</p><p><b>Cómo mejorar en la vida real:</b></p>'+ul(tips)+'</div>'+
    '<div class="lstage"><button id="again" aria-label="Reiniciar"><img data-k="lbtn" alt="Reiniciar"></button></div>';
  }
  fill(ov);ov.scrollTop=0;
  ov.style.display='flex';$('#again').onclick=()=>start(perfect);
}
function fill(r){r.querySelectorAll('img[data-k]').forEach(i=>{i.src=IM[i.dataset.k];i.draggable=false})}
function intro(){
  ov.className='intro';
  ov.innerHTML='<img class="ttl" data-k="title" alt="¡Guardián del Mar!">'+
  '<div class="card"><span class="deco" style="left:6px;top:-12px">🐠</span><span class="deco" style="left:44px;top:-8px">⭐</span><span class="deco" style="right:8px;bottom:-12px">🐟</span>'+
  '<p>Eres el guardián del mar. Tienes <b>'+TIME+' segundos</b>, y el reloj corre rápido, para clasificar <b>'+TOTAL+' objetos</b> que caen al agua. Para ganar debes clasificarlos todos antes de que se acabe el tiempo. Muévelos con el dedo: arrástralos (o tócalos y luego toca el mar para moverlos de lado). La tortuga nada sola y cada vez más rápido.</p></div>'+
  '<div class="card g"><h2>CLASIFICA ALIMENTO</h2><div class="row">'+
  '<div class="tile" style="background:#fbe6b3"><img data-k="jelly">medusa</div>'+
  '<div class="tile" style="background:#cfeac4"><img data-k="alga">alga</div>'+
  '<div class="tile" style="background:#f9d3c0"><img data-k="crab">cangrejo</div></div>'+
  '<p style="text-align:center">Llévalos hacia la tortuga para que los coma.</p></div>'+
  '<div class="card"><h2>SEPARA BASURA</h2><div class="trash"><b>Basura:</b>'+
  '<img data-k="bag"><img data-k="bottle"><img data-k="cup"><img data-k="glass"><img data-k="news"><img data-k="tote"></div>'+
  '<p style="text-align:center">Aléjala de la tortuga y arrástrala (o tócala y luego toca el contenedor).</p><div class="row">'+
  '<div class="mini" style="--bg:#f9c9d4;--bd:#f2a5b8"><img data-k="bottle">PLÁSTICO</div>'+
  '<div class="mini" style="--bg:#c4dffa;--bd:#9cc8f0"><img data-k="glass">VIDRIO</div>'+
  '<div class="mini" style="--bg:#fbe19a;--bd:#f2cc6b"><img data-k="news">PAPEL Y CARTÓN</div>'+
  '<div class="mini" style="--bg:#d9c9f6;--bd:#bca5ec"><img data-k="tote">REUTILIZAR</div></div></div>'+
  '<div class="card p"><h2>SI PIERDES</h2><div class="lifemini"><i></i></div><div class="lose">'+
  '<span style="flex:1">Cada error baja la barra de vida (arriba a la derecha): basura comida por la tortuga, contenedor equivocado, comida natural botada o basura que cae al mar. Con '+MAX_ERRORS+' errores o si se acaba el tiempo, la tortuga muere.</span></div></div>'+
  '<div class="card y"><h2>RECOMPENSAS</h2><div class="lose"><img class="tg" style="width:54px" src="'+IM.wgold+'"><span style="flex:1">¡Al obtener el 100% de los puntos ganas una skin de tortuga dorada con corona! :D</span></div></div>'+
  '<button id="go" aria-label="Jugar"><img data-k="play"></button>';
  fill(ov);$('#go').onclick=start;
  clearInterval(fading);AU.volume=.5;
  if(!muted)AU.play().catch(()=>{});
}
function unlock(){if(!muted&&ov.className==='intro'&&AU.paused)AU.play().catch(()=>{})}
['pointerdown','touchstart','click','keydown'].forEach(e=>document.addEventListener(e,unlock,{passive:true}));
function gameMusic(){if(muted)return;clearInterval(gfade);GM.volume=.45;if(GM.paused)GM.play().catch(()=>{})}
function stopGame(){
  clearInterval(gfade);
  gfade=setInterval(()=>{GM.volume=Math.max(0,GM.volume-.1);if(GM.volume<=0.01){clearInterval(gfade);GM.pause();GM.currentTime=0;GM.volume=.45}},60);
}
function stopMusic(){
  clearInterval(fading);
  fading=setInterval(()=>{AU.volume=Math.max(0,AU.volume-.1);if(AU.volume<=0.01){clearInterval(fading);AU.pause();AU.currentTime=0;AU.volume=.5}},60);
}
document.querySelectorAll('.bin').forEach(b=>b.onclick=()=>{
  if(!S||!S.run)return;
  if(S.sel)sort(S.sel,b.dataset.b);else toast('Primero toca un objeto y luego el contenedor, o arrástralo.');
});
$('#rs').onclick=()=>{if(S&&S.run)start()};
S={time:TIME,pts:0,life:100,run:false,items:[]};hud();
fill(document);
intro();
const sp=$('#splash');sp.style.backgroundImage='url('+IM.sbg+')';
sp.onclick=()=>{if(!muted)AU.play().catch(()=>{});sp.classList.add('hide');setTimeout(()=>sp.style.display='none',500)};
