// Mobile navigation
const toggle=document.querySelector('.nav-toggle');
const nav=document.querySelector('.nav');
toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');}));

// Original certificate lightbox
const viewer=document.getElementById('viewer'), viewerImg=document.getElementById('viewer-img'), viewerTitle=document.getElementById('viewer-title');
document.querySelectorAll('[data-cert]').forEach(card=>card.addEventListener('click',()=>{
 const image=card.querySelector('img');
 viewerImg.src=image.src;
 viewerTitle.textContent=card.querySelector('h3').textContent+' — ORIGINAL CERTIFICATE';
 viewer.classList.add('open');viewer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
}));
function closeViewer(){viewer.classList.remove('open');viewer.setAttribute('aria-hidden','true');document.body.style.overflow='';}
document.querySelector('.viewer-close').addEventListener('click',closeViewer);
viewer.addEventListener('click',e=>{if(e.target===viewer)closeViewer();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&viewer.classList.contains('open'))closeViewer();});

// Animated blue fire: flowing flame tongues and rising glowing embers.
(() => {
  const canvas = document.getElementById('blue-fire-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0, height = 0, dpr = 1, raf = 0, last = 0, time = 0;
  const embers = [];
  const rand = (a,b) => a + Math.random() * (b-a);

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 1.7);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = Math.round(width*dpr);
    canvas.height = Math.round(height*dpr);
    canvas.style.width = width+'px';
    canvas.style.height = height+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    embers.length = 0;
    const count = Math.max(24, Math.min(68, Math.round(width/17)));
    for(let i=0;i<count;i++){
      embers.push({
        x: rand(0,width), y: rand(0,height),
        speed: rand(.35,1.45), drift: rand(-.42,.42),
        size: rand(.7,2.3), phase: rand(0,Math.PI*2),
        life: rand(.35,1)
      });
    }
  }

  function tongue(x, base, w, h, phase, strength){
    const sway = Math.sin(time*1.45+phase)*w*.34 + Math.sin(time*2.7+phase)*w*.12;
    const tipX = x+sway;
    const tipY = base-h*(.88 + .1*Math.sin(time*1.8+phase));
    const grad = ctx.createLinearGradient(0,base,0,tipY);
    grad.addColorStop(0,'rgba(0,55,190,0)');
    grad.addColorStop(.12,`rgba(0,93,255,${.23*strength})`);
    grad.addColorStop(.42,`rgba(0,155,255,${.32*strength})`);
    grad.addColorStop(.72,`rgba(35,205,255,${.24*strength})`);
    grad.addColorStop(1,'rgba(155,245,255,0)');
    ctx.beginPath();
    ctx.moveTo(x-w*.55,base);
    ctx.bezierCurveTo(x-w*.9,base-h*.28,tipX-w*.25,base-h*.64,tipX,tipY);
    ctx.bezierCurveTo(tipX+w*.22,base-h*.64,x+w*.88,base-h*.28,x+w*.55,base);
    ctx.closePath();
    ctx.fillStyle=grad;
    ctx.shadowColor='#078fff';
    ctx.shadowBlur=18;
    ctx.fill();
    ctx.shadowBlur=0;
    // A bright, narrow inner core gives the flames a blue-white hot center.
    ctx.beginPath();
    ctx.moveTo(x-w*.12,base);
    ctx.bezierCurveTo(x-w*.2,base-h*.28,tipX-w*.08,base-h*.6,tipX,tipY+h*.12);
    ctx.bezierCurveTo(tipX+w*.1,base-h*.58,x+w*.2,base-h*.25,x+w*.12,base);
    ctx.closePath();
    const core=ctx.createLinearGradient(0,base,0,tipY);
    core.addColorStop(0,`rgba(20,135,255,${.16*strength})`);
    core.addColorStop(.65,`rgba(95,220,255,${.22*strength})`);
    core.addColorStop(1,'rgba(210,250,255,0)');
    ctx.fillStyle=core;ctx.fill();
  }

  function cluster(center, base, scale, phase, strength){
    // Broad, low blue glow beneath the moving flame tongues.
    const glow=ctx.createRadialGradient(center,base,2,center,base,scale*1.65);
    glow.addColorStop(0,`rgba(0,117,255,${.15*strength})`);
    glow.addColorStop(.55,`rgba(0,91,255,${.07*strength})`);
    glow.addColorStop(1,'rgba(0,65,255,0)');
    ctx.fillStyle=glow;ctx.fillRect(center-scale*1.7,base-scale,scale*3.4,scale);
    for(let i=0;i<7;i++){
      const offset=(i-3)*scale*.22;
      const flicker=.75+.25*Math.sin(time*2.1+phase+i);
      tongue(center+offset,base,scale*randStable(i,.22,.38),scale*(.72+.5*flicker),phase+i*.8,strength);
    }
  }
  function randStable(i,a,b){ return a+(b-a)*(.5+.5*Math.sin(i*12.989+2.3)); }

  function draw(now){
    if(!width||!height){resize();}
    const delta=Math.min((now-last)/1000||.016,.04);last=now;
    time += reduceMotion ? 0 : delta;
    ctx.clearRect(0,0,width,height);
    ctx.globalCompositeOperation='screen';

    // Side flames frame the portfolio without covering the center text.
    const base=height+12;
    cluster(width*.035,base,Math.min(145,width*.2),.4,.95);
    cluster(width*.965,base,Math.min(145,width*.2),2.2,.95);
    cluster(width*.17,base+8,Math.min(105,width*.14),1.3,.48);
    cluster(width*.83,base+8,Math.min(105,width*.14),3.1,.48);
    // Smaller blue fire tongues rise around the upper side edges too.
    cluster(4,height*.78,Math.min(82,width*.12),4.2,.34);
    cluster(width-4,height*.78,Math.min(82,width*.12),5.1,.34);

    // Glowing sparks drift upward from the flame bed.
    for(const p of embers){
      if(!reduceMotion){
        p.y -= p.speed*(.7+Math.min(width,height)/850);
        p.x += p.drift + Math.sin(time*1.4+p.phase)*.22;
        if(p.y < -8){p.y=height+rand(0,45);p.x=rand(0,width);}
      }
      const flicker=.45+.55*Math.sin(time*3+p.phase);
      ctx.beginPath();
      ctx.fillStyle=`rgba(${105+Math.round(90*flicker)},${205+Math.round(40*flicker)},255,${p.life*(.25+.55*flicker)})`;
      ctx.shadowColor='#16aaff';ctx.shadowBlur=9;
      ctx.arc(p.x,p.y,p.size*(.65+.45*flicker),0,Math.PI*2);
      ctx.fill();ctx.shadowBlur=0;
    }
    ctx.globalCompositeOperation='source-over';
    if(!reduceMotion) raf=requestAnimationFrame(draw);
  }

  resize();
  if(reduceMotion){draw(0);}
  else {raf=requestAnimationFrame(draw);}
  window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(raf);}
    else if(!reduceMotion){last=0;raf=requestAnimationFrame(draw);}
  });
})();
