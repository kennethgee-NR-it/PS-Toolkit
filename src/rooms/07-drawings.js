  // ---------- drawings ----------
  // ---------- horizontal layout: TVs, plates, studs, recess boxes ----------
  const masonryEdge=Lo=>MOUNTS[cfg.mount].masonry && Lo.tvs.some(t=>t.holes.some(x=>x<3||x>cfg.wallW-3));
  function layout(){
    const c=calc(), D=c.D, M=c.M, MD=c.MD;
    const tvW = cfg.tvW>0 ? cfg.tvW : D.w+2*cfg.bezel;
    const n=cfg.dispCount, gap=n>1?cfg.dispGap:0;
    const C = cfg.centerOnWall ? cfg.wallW/2 : cfg.centerX;
    const centers = n===2 ? [C-(tvW+gap)/2, C+(tvW+gap)/2] : [C];
    const studs=[]; if(M.studs||cfg.mount==='drywall'){ for(let x=cfg.firstStud; x<=cfg.wallW; x+=cfg.studSpacing) studs.push(x); }
    const zone=cfg.plateW, margin=0.75, slide=cfg.slide, need=MD&&MD.singleStud?1:2, ak=AK(), clear=2, minSpan=Math.max(4,Math.min(8,zone-2*margin-1));
    const stud0=M.studs && cfg.mount!=='plywood' && !(cfg.mount==='metal'&&cfg.backing);
    const bay=ak==='toggle' && !M.masonry && studs.length>0;
    const mode=bay?'bay':(stud0&&(!ak||ak==='lag')?'stud':'free'), useStuds=mode==='stud';
    const tvs=centers.map((tc,i)=>{
      const vc=tc+cfg.vesaX;
      const hf=pc=>{ const a=pc-zone/2+margin, b=pc+zone/2-margin;
        if(mode==='stud'){ const u=studs.filter(x=>x>=a-.01&&x<=b+.01); return u.length>=need?u:null; }
        if(mode==='bay'){ let xl=1e9, xr=-1e9; const pts=[0,...studs,cfg.wallW];
          for(let k=0;k<pts.length-1;k++){ const lo=Math.max(a,pts[k]+(k?clear:1)), hi=Math.min(b,pts[k+1]-(k<pts.length-2?clear:1)); if(lo<=hi){ xl=Math.min(xl,lo); xr=Math.max(xr,hi); } }
          return xr-xl>=minSpan?[xl,xr]:null; }
        return [a+0.75,b-0.75]; };
      const find=lim=>{ for(let d=0;d<=lim+1e-6;d+=0.125) for(const sg of d?[1,-1]:[1]){ const h=hf(vc+sg*d); if(h) return {p:vc+sg*d,h}; } return null; };
      const r=find(slide), far=r||find(60), ok=!!r, plate=r?r.p:vc, holes=r?r.h:[];
      const pL=plate-zone/2, pR=plate+zone/2, used=holes, shiftNeed=far?vc-far.p:null;
      const L=tc-tvW/2, R=tc+tvW/2;
      // recess box: in a stud bay (framed) or centered (masonry), inside the TV footprint, clear of the plate
      let box=null;
      if(!M.cart){
        const roomBelow = (c.plateBot-2) - (c.bottom+2) >= cfg.boxH;
        const yTop = roomBelow ? c.plateBot-2 : c.plateC+cfg.boxH/2;
        const fitsX = (x)=> x-cfg.boxW/2>=L+2 && x+cfg.boxW/2<=R-2 && (roomBelow || x+cfg.boxW/2<=pL-1 || x-cfg.boxW/2>=pR+1);
        let cands=[];
        if(studs.length && !M.masonry){ for(let k=0;k<studs.length-1;k++){ const bl=studs[k]+0.75, br=studs[k+1]-0.75; if(br-bl<cfg.boxW+0.5) continue;
            const lo=bl+cfg.boxW/2+0.25, hi=br-cfg.boxW/2-0.25; for(const x of [Math.min(Math.max(vc,lo),hi), Math.min(Math.max(pR+1+cfg.boxW/2,lo),hi), Math.min(Math.max(pL-1-cfg.boxW/2,lo),hi)]) if(fitsX(x)) cands.push({x,bay:[studs[k],studs[k+1]]}); }
          if(studs.length===0) cands=[];
        } else { for(const x of [vc, pR+1+cfg.boxW/2, pL-1-cfg.boxW/2]) if(fitsX(x)) cands.push({x,bay:null}); }
        cands.sort((p,q)=>Math.abs(p.x-vc)-Math.abs(q.x-vc));
        if(cands.length) box={x:cands[0].x, bay:cands[0].bay, top:yTop, bot:yTop-cfg.boxH, below:roomBelow};
      }
      return {i:i+1, tc, vc, L, R, plate, pL, pR, ok, shift:vc-plate, shiftNeed, holes, used, box};
    });
    return {tvW, C, studs, tvs, gap, useStuds, need, mode, ak};
  }
  const fromC = (x,C)=>{ const d=x-C; return Math.abs(d)<0.05?'on the centerline':`${fmt(Math.abs(d),2)} in ${d<0?'left':'right'} of center`; };
  function slideHtml(Lo){ return Lo.tvs.map(t=>{ const sh=Math.abs(t.shift), dir=t.shift>0?'left':'right', back=t.shift>0?'right':'left', hx=t.holes.map(x=>fmt(x,2)).join(' and ');
    const what=Lo.mode==='bay'?'a clear stud bay':(Lo.mode==='stud'?'the studs':'a solid anchor spot');
    let cls='ok',h,pp;
    if(!t.ok){ cls='bad'; h=`Mount ${t.i}: can’t reach ${what} with the mount’s ±${fmt(cfg.slide,2)} in slide`; pp=(t.shiftNeed==null?'No position within 60 in works.':`It would need a ${fmt(Math.abs(t.shiftNeed),2)} in slide ${t.shiftNeed>0?'left':'right'}.`)+' Add plywood backing, use a wider plate, switch anchor method, or move the display.'; }
    else if(sh<0.05){ h=`Mount ${t.i}: no slide needed`; pp=`Center the plate on the display (center ${fmt(t.plate,2)} in). Anchors at ${hx} in from the left corner.`; }
    else { cls='warn'; h=`Mount ${t.i}: slide the plate ${fmt(sh,2)} in ${dir}`; pp=`Mark the plate center at ${fmt(t.plate,2)} in, ${fmt(sh,2)} in ${dir} of the display center (${fmt(t.vc,2)} in); anchors at ${hx} in. After mounting, slide the display ${fmt(sh,2)} in ${back} on the mount to re-center it (mount allows ±${fmt(cfg.slide,2)} in).`; }
    return `<div class="verdict ${cls}"><b>${h}</b><span>${pp}</span></div>`; }).join(''); }
  function studOpts(Lo,c){ const M=c.M; if(M.cart||M.masonry||!Lo.studs.length||cfg.mount==='plywood'||(cfg.mount==='metal'&&cfg.backing)) return '';
    const MD=c.MD, zone=cfg.plateW, mg=0.75, sl=cfg.slide, need=MD&&MD.singleStud?1:2, S=Lo.studs, lim=zone/2-mg, minSpan=Math.max(4,Math.min(8,zone-2*mg-1)), load=c.load*(cfg.dispCount>1?0.5:1);
    const f=n=>fmt(n,2), side=d=>d>0?'right':'left';
    return Lo.tvs.map(t=>{ const vc=t.vc, near=S.slice().sort((a,b)=>Math.abs(a-vc)-Math.abs(b-vc)).slice(0,S.some(x=>Math.abs(x-vc)<0.05)?3:2).sort((a,b)=>a-b);
      const on=S.some(x=>Math.abs(x-vc)<0.05);
      let best=null; for(let k=0;k+need-1<S.length;k++){ const a=S[k], b=S[k+need-1], lo=b-lim, hi=a+lim, pm=Math.min(Math.max((a+b)/2,vc-sl),vc+sl); let o={a,b,sh:pm-vc,fit:false,mz:2*(Math.max(Math.abs(pm-a),Math.abs(pm-b))+mg),needSl:null};
        if(lo<=hi){ const ps=Math.min(Math.max(vc,lo),hi); o.needSl=Math.abs(ps-vc); if(o.needSl<=sl+.001){ o.fit=true; o.sh=ps-vc; } }
        if(!best||(o.fit&&!best.fit)||(o.fit===best.fit&&(o.fit?(Math.abs(o.sh)<Math.abs(best.sh)-1e-6||(Math.abs(Math.abs(o.sh)-Math.abs(best.sh))<=1e-6&&o.sh>best.sh)):o.mz<best.mz))) best=o; }
      const studs=`Display ${t.i} center is ${on?'<b>exactly on a stud</b> ('+f(vc)+' in)':'at '+f(vc)+' in'}; nearest studs at ${near.map(f).join(', ')} in (${S.length>1?f(S[1]-S[0]):''} in spacing).`;
      let cls, head, body;
      if(best.fit){ cls=Math.abs(best.sh)<.05?'ok':'warn'; head=`Best option: lag bolts into ${need===1?'the stud at '+f(best.a):'the studs at '+f(best.a)+' and '+f(best.b)} in`;
        body=Math.abs(best.sh)<.05?'No slide needed.':`Slide the plate ${f(Math.abs(best.sh))} in ${side(best.sh)} of the display center (limit ±${f(sl)} in), then slide the display back ${f(Math.abs(best.sh))} in ${side(-best.sh)}.`; }
      else { cls='bad'; const need2=`a plate at least ${fmt(Math.ceil(best.mz*4)/4,2)} in wide (lag-slot span)${best.needSl!=null?`, or ${f(best.needSl)} in of slide at your plate width`:''}`;
        head=`Can’t lag into ${need===1?'a stud':'two studs'} with ±${f(sl)} in of slide`;
        body=`Studs at ${f(best.a)} and ${f(best.b)} in are ${f(best.b-best.a)} in apart. Your plate’s usable width is ${f(2*lim)} in (${f(zone)} in less 0.75 in edge margin each side). With ±${f(sl)} in of slide you would need ${need2}.`; }
      // toggles in the bays
      const bayAt=pc=>{ const a=pc-zone/2+mg,b=pc+zone/2-mg; let xl=1e9,xr=-1e9; const pts=[0,...S,cfg.wallW]; for(let k=0;k<pts.length-1;k++){ const l=Math.max(a,pts[k]+(k?2:1)), h=Math.min(b,pts[k+1]-(k<pts.length-2?2:1)); if(l<=h){ xl=Math.min(xl,l); xr=Math.max(xr,h); } } return xr-xl>=minSpan?[xl,xr]:null; };
      let tg=null; for(let d=0;d<=sl+1e-6&&!tg;d+=0.125) for(const sg of d?[1,-1]:[1]){ const h=bayAt(vc+sg*d); if(h){ tg={d:sg*d,h}; break; } }
      const u=anchorCap('toggle'), cap=u?Math.floor(u/4)*4:0;
      const alt=best.fit?'':`<br><b>Alternatives:</b> (1) plywood backing between the studs, then lag or screw into the backing; (2) ${tg?`all-drywall <b>SnapToggles</b> at ${f(tg.h[0])} and ${f(tg.h[1])} in${Math.abs(tg.d)>.05?` (slide the plate ${f(Math.abs(tg.d))} in ${side(tg.d)})`:''}, about ${cap} lb working capacity for four against a ${fmt(load)} lb load${load>cap?' (<b>too weak</b>)':''}, which many mount manufacturers don’t permit on drywall alone`:'SnapToggles are blocked here too: no clear bay within the slide'}; (3) a wider plate or a mount with more slide. Switch the Anchor method dropdown to see either option drawn on the wall.`;
      return `<div class="verdict ${cls}"><b>${head}</b><span>${studs}</span><span>${body}${alt}</span></div>`; }).join(''); }
  function renderLayout(){
    const c=calc(), Lo=layout(), M=c.M;
    if(M.cart){ document.getElementById('slideOut').innerHTML=''; document.getElementById('layoutOut').innerHTML='<p class="hint">On a cart, the displays mount to the cart’s rails; no wall layout is needed.</p>'; return; }
    const rows=[]; document.getElementById('slideOut').innerHTML=studOpts(Lo,c)+slideHtml(Lo);
    Lo.tvs.forEach(t=>{
      rows.push([`Display ${t.i}`,`left edge ${fmt(t.L,2)} in, center ${fmt(t.tc,2)} in, right edge ${fmt(t.R,2)} in`, fromC(t.tc,Lo.C)]);
      rows.push([`Mount ${t.i} center`, `${fmt(t.plate,2)} in (plate ${fmt(t.pL,2)} to ${fmt(t.pR,2)} in)`, fromC(t.plate,Lo.C)]);
      if(Lo.useStuds) rows.push([`Mount ${t.i} fasteners`, t.used.length?`into studs at ${t.used.map(s=>fmt(s,2)).join(', ')} in`:'no studs reachable', t.ok?(Math.abs(t.shift)>0.05?`slide the display ${fmt(Math.abs(t.shift),2)} in ${t.shift>0?'right':'left'} on the mount`:'display centered on the mount'):'<b style="color:var(--bad)">add backing</b>']);
      if(!Lo.useStuds) rows.push([`Mount ${t.i} anchors`, t.holes.length?`${ANCH[Lo.ak]?ANCH[Lo.ak].name:'fasteners'} at ${t.holes.map(x=>fmt(x,2)).join(', ')} in`:'<span style="color:var(--bad)">no spot found</span>', t.ok?(Math.abs(t.shift)>0.05?`slide the plate ${fmt(Math.abs(t.shift),2)} in ${t.shift>0?'left':'right'}, then the display back ${t.shift>0?'right':'left'}`:'no slide needed'):'<b style="color:var(--bad)">not reachable</b>']);
      if(t.box) rows.push([`Recess box ${t.i}`, `center ${fmt(t.box.x,2)} in, top ${fmt(t.box.top,2)} in, bottom ${fmt(t.box.bot,2)} in`, t.box.bay?`in the stud bay between ${fmt(t.box.bay[0],2)} and ${fmt(t.box.bay[1],2)} in`:(M.masonry?'core or surface box behind the display':'')]);
      else rows.push([`Recess box ${t.i}`,'<span style="color:var(--warn)">no clear spot found</span>','try a smaller box or move it beside the mount']);
    });
    document.getElementById('layoutOut').innerHTML=`
      <div class="bigresult" style="background:var(--bg)"><div><div class="lbl">Measure everything from the</div><b style="color:var(--ink);font-size:24px">left corner of the wall</b><div class="lbl">Wall centerline at ${fmt(Lo.C,2)} in${cfg.dispCount>1?`; displays ${cfg.dispGap>0?fmt(cfg.dispGap,2)+' in apart':'with bezels touching'}`:''}</div></div></div>
      <div class="tablewrap"><table><thead><tr><th>Item</th><th>From the left corner</th><th>Note</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>
      ${Lo.studs.length&&!M.masonry?`<p class="hint" style="margin-top:6px">Studs assumed at ${Lo.studs.slice(0,12).map(s=>fmt(s,1)).join(', ')}${Lo.studs.length>12?'…':''} in. Confirm with a stud finder and enter the first stud’s real position.</p>`:''}`;
  }
  function wallView(){
    const c=calc(), D=c.D, B=c.B, M=c.M, Lo=layout(), Wd=Math.max(cfg.wallW, Lo.tvs[Lo.tvs.length-1].R+6), s=Math.min(4, 640/Wd), floor=20+cfg.ceil*s, Wpx=Wd*s;
    const X=x=>20+x*s, Y=y=>floor-y*s, OH=c.overallH;
    let g=`<rect x="20" y="20" width="${Wpx}" height="${cfg.ceil*s}" fill="var(--wall)"/>`;
    if(cfg.mount==='plaster') g+=`<rect x="20" y="20" width="${Wpx}" height="${cfg.ceil*s}" fill="#EFE7D8" opacity=".6"/>`;
    if(cfg.mount==='brick'){ for(let y=0;y<cfg.ceil;y+=2.67){ const off=Math.round(y/2.67)%2?4:0; g+=`<line x1="20" x2="${20+Wpx}" y1="${Y(y)}" y2="${Y(y)}" stroke="#B5654A" opacity=".35"/>`; for(let x=-off;x<Wd;x+=8) g+=`<line x1="${X(Math.max(0,x))}" x2="${X(Math.max(0,x))}" y1="${Y(y)}" y2="${Y(Math.min(cfg.ceil,y+2.67))}" stroke="#B5654A" opacity=".3"/>`; } g+=`<rect x="20" y="20" width="${Wpx}" height="${cfg.ceil*s}" fill="#C47A5A" opacity=".12"/>`; }
    if(Lo.studs.length && !M.masonry) Lo.studs.forEach(x=>{ g+=`<rect x="${X(x-0.75)}" y="20" width="${Math.max(2,1.5*s)}" height="${cfg.ceil*s}" fill="${cfg.mount==='metal'?'#9AA6B0':'#C9A46A'}" opacity=".45"/><text class="dv-lbl" x="${X(x)}" y="33" text-anchor="middle" style="font-size:12px;fill:var(--muted)">${fmt(x,0)}</text>`; });
    if(cfg.mount==='concrete'){ g+=`<rect x="20" y="20" width="${Wpx}" height="${cfg.ceil*s}" fill="url(#conc)"/>`; }
    if(cfg.mount==='cmu'){ for(let y=0;y<cfg.ceil;y+=8){ const off=(y/8)%2?8:0; g+=`<line x1="20" x2="${20+Wpx}" y1="${Y(y)}" y2="${Y(y)}" stroke="var(--frame)" opacity=".35"/>`; for(let x=-off;x<Wd;x+=16) g+=`<line x1="${X(Math.max(0,x))}" x2="${X(Math.max(0,x))}" y1="${Y(y)}" y2="${Y(y+8)}" stroke="var(--frame)" opacity=".35"/>`; } }
    // centerline
    g+=`<line x1="${X(Lo.C)}" x2="${X(Lo.C)}" y1="20" y2="${floor}" stroke="var(--sig)" stroke-dasharray="8 4 2 4" opacity=".8"/><text class="dv-lbl" x="${X(Lo.C)+4}" y="50" style="fill:var(--sig)">Centerline ${fmt(Lo.C,1)} in</text>`;
    let AL=''; const LABS=[]; const lab=(y,t,tx)=>LABS.push({y,t,tx});
    const tL=Lo.tvs[0].L, tR=Lo.tvs[Lo.tvs.length-1].R;
    if(cfg.credenza && !M.cart){ const cw=Math.max(tR-tL,72), cl=(tL+tR)/2-cw/2; g+=`<rect x="${X(cl)}" y="${Y(cfg.credH)}" width="${cw*s}" height="${cfg.credH*s}" fill="#B8977A" opacity=".75" stroke="var(--frame)"/>`; lab(Y(cfg.credH),`Credenza top ${fmt(cfg.credH,1)} in`,X(cl+cw)); }
    if(M.cart){
      const cw=44, cx=Lo.C-cw/2;
      g+=`<rect x="${X(cx+8)}" y="${Y(68)}" width="${4*s}" height="${(68-4)*s}" fill="var(--frame)"/><rect x="${X(cx+cw-12)}" y="${Y(68)}" width="${4*s}" height="${(68-4)*s}" fill="var(--frame)"/>`;
      g+=`<rect x="${X(cx)}" y="${Y(6)}" width="${cw*s}" height="${3*s}" fill="var(--frame)"/>`;
      [cx+3,cx+cw-3].forEach(x=>{ g+=`<circle cx="${X(x)}" cy="${Y(2)}" r="${2*s}" fill="var(--ink)"/>`; });
      g+=`<rect x="${X(cx+10)}" y="${Y(20)}" width="${(cw-20)*s}" height="${10*s}" fill="var(--metal)" rx="2"/>`;
      lab(Y(15),c.P.appliance?'Device panel':'Compute on the device panel',X(cx+cw-10));
      lab(Y(68),`Cart frame about 68 in tall, 44 in wide`,X(cx+cw-8)); lab(Y(c.center),cfg.mount==='cart'?(cartVesa().direct?'VESA 400 rails (direct)':'VESA adapter kit H497 on the rails'):'Cart rails',X(cx+cw/2));
    } else {
      Lo.tvs.forEach(t=>{
        if(cfg.mount==='plywood') g+=`<rect x="${X(t.pL-10)}" y="${Y(c.plateTop+10)}" width="${(cfg.plateW+20)*s}" height="${(cfg.plateH+20)*s}" fill="#D9B77E" opacity=".6" stroke="#B08A50"/>`;
        if(cfg.mount==='metal'&&cfg.backing) g+=`<rect x="${X(t.pL-6)}" y="${Y(c.plateTop+6)}" width="${(cfg.plateW+12)*s}" height="${(cfg.plateH+12)*s}" fill="#C9A46A" opacity=".45"/>`;
        g+=`<rect x="${X(t.pL)}" y="${Y(c.plateTop)}" width="${cfg.plateW*s}" height="${cfg.plateH*s}" fill="var(--metal)" opacity=".85" stroke="${t.ok?'var(--ok)':'var(--bad)'}" stroke-width="2.5"/>`;
        const pts=t.holes;
        pts.forEach(x=>{ [c.plateTop-1.5,c.plateBot+1.5].forEach(y=>{ g+=`<circle cx="${X(x)}" cy="${Y(y)}" r="5.5" fill="var(--bad)" stroke="#fff" stroke-width="1.5"/>`; }); AL+=`<text class="dv-lbl" x="${X(x)}" y="${Y(c.plateC)+(x<t.plate?-3:13)}" text-anchor="middle" style="fill:var(--bad);font-weight:700">${fmt(x,1)}″</text>`; });
        g+=`<text x="${X(t.plate)}" y="${Y(c.plateTop)-4}" text-anchor="middle" style="font-family:var(--cond);font-size:13.5px;font-weight:700;fill:var(--ok)">M${t.i} ${fmt(t.plate,1)}″</text>`;
        { const sh=t.shift, ay=Y(c.plateTop)-24; if(Math.abs(sh)>0.05&&t.ok) g+=`<line x1="${X(t.vc)}" x2="${X(t.plate)}" y1="${ay}" y2="${ay}" stroke="var(--sig)" stroke-width="3" marker-end="url(#sl)"/><line x1="${X(t.vc)}" x2="${X(t.vc)}" y1="${ay-6}" y2="${ay+6}" stroke="var(--sig)" stroke-width="2"/><text class="dv-lbl" x="${(X(t.vc)+X(t.plate))/2}" y="${ay-8}" text-anchor="middle" style="fill:var(--sig);font-weight:700;font-size:14px">Slide plate ${fmt(Math.abs(sh),2)}″ ${sh>0?'left':'right'}</text>`; }
        if(t.box){ g+=`<rect x="${X(t.box.x-cfg.boxW/2)}" y="${Y(t.box.top)}" width="${cfg.boxW*s}" height="${cfg.boxH*s}" fill="var(--panel)" stroke="var(--sig)" stroke-width="1.5"/><text x="${X(t.box.x)}" y="${Y(t.box.bot)+12}" text-anchor="middle" style="font-family:var(--cond);font-size:12.5px;fill:var(--sig)">Box ${fmt(t.box.x,1)}″</text>`; }
      });
      lab(Y(c.plateTop),`Mount top ${fmt(c.plateTop,2)} in (mark this)`,X(Lo.tvs[Lo.tvs.length-1].pR));
      lab(Y(c.plateBot),`Mount bottom ${fmt(c.plateBot,1)} in`,X(Lo.tvs[Lo.tvs.length-1].pR));
      const bx=Lo.tvs.find(t=>t.box); if(bx) lab(Y((bx.box.top+bx.box.bot)/2),`Recess box ${fmt(bx.box.bot,1)}–${fmt(bx.box.top,1)} in`,X(bx.box.x+cfg.boxW/2));
    }
    Lo.tvs.forEach(t=>{
      g+=`<rect x="${X(t.L)}" y="${Y(c.top)}" width="${Lo.tvW*s}" height="${OH*s}" fill="#0F1419" opacity=".5" rx="2" stroke="#0F1419" stroke-width="2"/>`;
      g+=`<text x="${X(t.L)+8}" y="${Y(c.bottom)-8}" fill="#E5EBEF" style="font-family:var(--cond);font-size:13px">${cfg.size}″ display${cfg.dispCount>1?' '+t.i:''}</text>`; }); g+=AL;
    if(!M.cart) g+=`<line x1="${X(tL-6)}" x2="${X(tR+6)}" y1="${Y(c.plateTop)}" y2="${Y(c.plateTop)}" stroke="var(--ok)" stroke-width="2"/>`;
    const bc=Lo.C;
    if(cfg.bar==='plus'){ g+=`<rect x="${X(bc-4)}" y="${Y(c.barTop)}" width="${8*s}" height="${B.h*s}" fill="var(--metal)" rx="3" stroke="var(--frame)"/><circle cx="${X(bc)}" cy="${Y(c.camH)}" r="4" fill="#0F1419"/>`;
      [tL-9, tR+2].forEach(x=>{ g+=`<rect x="${X(x)}" y="${Y(c.center+OH*0.2)}" width="${7*s}" height="${OH*0.4*s}" fill="var(--metal)" rx="3"/>`; }); }
    else g+=`<rect x="${X(bc-B.width/2)}" y="${Y(c.barTop)}" width="${B.width*s}" height="${B.h*s}" fill="var(--metal)" stroke="var(--frame)" rx="4"/><circle cx="${X(bc)}" cy="${Y(c.camH)}" r="3.5" fill="#0F1419"/>`;
    g+=`<line x1="20" x2="${20+Wpx}" y1="${Y(cfg.eyeH)}" y2="${Y(cfg.eyeH)}" stroke="var(--sig)" stroke-dasharray="6 5" opacity=".7"/><text class="dv-lbl" x="${X(2)}" y="${Y(cfg.eyeH)-5}" style="fill:var(--sig)">Eye height ${fmt(cfg.eyeH)} in</text>`;
    g+=`<line x1="20" x2="${20+Wpx}" y1="${Y(cfg.tableH)}" y2="${Y(cfg.tableH)}" stroke="var(--muted)" stroke-dasharray="2 5"/><text class="dv-lbl" x="${X(2)}" y="${Y(cfg.tableH)-5}">Table ${fmt(cfg.tableH)} in</text>`;
    const wtitle=`${M.name}${cfg.mount==='metal'&&cfg.backing?', with backing':''}${M.cart?'':', '+c.MD.short}`;
    const R=X(tR);
    lab(Y(c.top),`Top bezel ${fmt(c.top,1)} in`,R); lab(Y(c.center),`Screen center ${fmt(c.center,1)} in`,R); lab(Y(c.bottom),`Bottom bezel ${fmt(c.bottom,1)} in`,R);
    lab(Y(c.camH),`${B.short} camera ${fmt(c.camH,1)} in`,X(bc+(cfg.bar==='plus'?4:B.width/2)));
    // horizontal dimension band under the floor
    const by=floor+14; let hb=`<line x1="${X(0)}" x2="${X(Wd)}" y1="${by}" y2="${by}" stroke="var(--line)"/>`;
    const ticks=[[0,'0']]; Lo.tvs.forEach(t=>{ ticks.push([t.L,fmt(t.L,1)],[t.R,fmt(t.R,1)]); if(!M.cart) ticks.push([t.plate,fmt(t.plate,1),'var(--ok)']); }); ticks.push([cfg.wallW,fmt(cfg.wallW,1)]);
    ticks.sort((a,b)=>a[0]-b[0]); let lastX=-99, row=0;
    ticks.forEach(([x,l,col])=>{ const px=X(x); row = (px-lastX<34)? (row+1)%2 : 0; lastX=px; hb+=`<line x1="${px}" x2="${px}" y1="${by-5}" y2="${by+5}" stroke="${col||'var(--ink)'}"/><text x="${px}" y="${by+17+row*12}" text-anchor="middle" style="font-family:var(--cond);font-size:13px;fill:${col||'var(--muted)'}">${l}</text>`; });
    g+=hb;
    const LX=20+Wpx+10;
    LABS.sort((p,q)=>p.y-q.y); let last=-99; LABS.forEach(l=>{ const ly=Math.max(l.y,last+16); last=ly;
      g+=`<polyline class="dv-lead" points="${l.tx},${l.y} ${LX-14},${l.y} ${LX-4},${ly}"/><text class="dv-lbl" x="${LX}" y="${ly+4}">${l.t}</text>`; });
    g+=`<line x1="20" x2="${20+Wpx}" y1="${floor}" y2="${floor}" stroke="var(--frame)" stroke-width="3"/>`;
    const defs=`<defs><marker id="sl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--sig)"/></marker><pattern id="conc" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="3" cy="4" r="1" fill="var(--frame)" opacity=".35"/><circle cx="10" cy="9" r="1.4" fill="var(--frame)" opacity=".25"/><circle cx="6" cy="12" r=".8" fill="var(--frame)" opacity=".35"/></pattern></defs>`;
    return `<svg viewBox="0 0 ${Wpx+270} ${Math.max(floor+48, last+20)+22}" role="img" aria-label="Front view of the display wall with positions">${defs}<text class="dv-title" x="20" y="16">${wtitle}</text><g transform="translate(0,22)">${g}</g></svg>`;
  }
  function topView(){
    const c=calc(), D=c.D, B=c.B;
    const dwFt=(cfg.dispCount*D.w+(cfg.dispCount-1)*4)/12; const depth=Math.max(cfg.far+3, 10), width=Math.max(cfg.tableW+8, dwFt+3, 12), s=Math.min(520/width, 380/depth);
    const ox=(600-width*s)/2, oy=20, X=x=>ox+x*s, Y=y=>oy+y*s, cx=width/2;
    let g=`<defs><clipPath id="roomclip"><rect x="${X(0)}" y="${Y(0)}" width="${width*s}" height="${depth*s}"/></clipPath></defs><rect x="${X(0)}" y="${Y(0)}" width="${width*s}" height="${depth*s}" fill="var(--wall)" stroke="var(--frame)" stroke-width="3"/>`;
    const dw=(cfg.dispCount*D.w+(cfg.dispCount-1)*4)/12;
    g+=`<rect x="${X(cx-dw/2)}" y="${Y(0)}" width="${dw*s}" height="5" fill="#1B2229"/>`;
    // FOV wedge
    const half=B.fov/2*Math.PI/180, R=depth*1.2;
    g+=`<polygon clip-path="url(#roomclip)" points="${X(cx)},${Y(0.4)} ${X(cx-Math.tan(half)*R)},${Y(R)} ${X(cx+Math.tan(half)*R)},${Y(R)}" fill="var(--sig)" opacity=".12"/>`;
    g+=`<circle cx="${X(cx)}" cy="${Y(0.4)}" r="5" fill="var(--ink)"/>`;
    // table
    const t0=cfg.near, t1=Math.max(cfg.near+3, cfg.far-1.5), tw=cfg.tableW;
    g+=`<rect x="${X(cx-tw/2)}" y="${Y(t0)}" width="${tw*s}" height="${(t1-t0)*s}" fill="var(--metal)" opacity=".55" stroke="var(--frame)" rx="6"/>`;
    // seats
    const seats=[]; const perSide=Math.ceil(Math.max(0,cfg.seats-1)/2), endSeat=cfg.seats%2===1||cfg.seats===1;
    const sideN=Math.floor(endSeat? (cfg.seats-1)/2 : cfg.seats/2);
    for(let i=0;i<sideN;i++){ const y=t0+0.9+(i+0.5)*((t1-t0-0.9)/sideN); seats.push([cx-tw/2-1.1,y],[cx+tw/2+1.1,y]); }
    if(endSeat) seats.push([cx, t1+1.1]);
    let outside=0;
    seats.slice(0,cfg.seats).forEach(([x,y])=>{ const ang=Math.atan2(Math.abs(x-cx), y-0.4); const out=ang>half; if(out) outside++;
      g+=`<circle cx="${X(x)}" cy="${Y(y)}" r="${Math.max(5,0.55*s)}" fill="${out?'var(--bad)':'var(--panel)'}" stroke="var(--frame)" stroke-width="1.5"/>`; });
    // mic pods
    for(let i=0;i<cfg.pods;i++){ const y=t0+(i+1)*((t1-t0)/(cfg.pods+1)); g+=`<circle cx="${X(cx)}" cy="${Y(y)}" r="7" fill="var(--ink)"/><circle clip-path="url(#roomclip)" cx="${X(cx)}" cy="${Y(y)}" r="${6*s}" fill="none" stroke="var(--ok)" stroke-dasharray="4 4" opacity=".45"/>`; }
    if(cfg.sight) g+=`<rect x="${X(cx)-6}" y="${Y((t0+t1)/2)-10}" width="12" height="20" rx="5" fill="var(--sig)"/>`;
    // dims
    g+=`<line x1="${X(width)+12}" y1="${Y(0)}" x2="${X(width)+12}" y2="${Y(cfg.far)}" stroke="var(--muted)"/><text class="dv-lbl" x="${X(width)+16}" y="${Y(cfg.far/2)}">${fmt(cfg.far)} ft to farthest seat</text>`;
    g+=`<text class="dv-lbl" x="${X(cx)}" y="${Y(0)+20}" text-anchor="middle">${cfg.dispCount} × ${cfg.size}" display, ${B.short}</text>`;
    if(outside) g+=`<text class="dv-lbl" x="${X(0)+6}" y="${Y(depth)-8}" style="fill:var(--bad);font-weight:600">${outside} seat${outside>1?'s':''} outside the camera’s view (approximate)</text>`;
    return `<svg viewBox="${Math.floor(ox-12)} 0 ${Math.ceil(width*s+190)} ${oy+depth*s+20}" role="img" aria-label="Top view of the room">${g}</svg>`;
  }
  function sideView(){
    const c=calc(), D=c.D, MD=c.MD, M=c.M; const len=Math.max(cfg.far+2,10), s=Math.min(560/(len*12), 230/cfg.ceil);
    const ox=40, floor=20+cfg.ceil*s, X=x=>ox+x*s, Y=y=>floor-y*s, dep=M.cart?20:(MD.depth||2);
    let g=`<line x1="${ox}" y1="${floor}" x2="${X(len*12)}" y2="${floor}" stroke="var(--frame)" stroke-width="3"/><line x1="${ox}" y1="20" x2="${ox}" y2="${floor}" stroke="var(--frame)" stroke-width="3"/><line x1="${ox}" y1="20" x2="${X(len*12)}" y2="20" stroke="var(--line)"/>`;
    if(cfg.credenza&&!M.cart) g+=`<rect x="${ox}" y="${Y(cfg.credH)}" width="${18*s}" height="${cfg.credH*s}" fill="#B8977A" opacity=".75"/>`;
    g+=`<rect x="${X(dep)}" y="${Y(c.top)}" width="${Math.max(3,2.5*s)}" height="${c.overallH*s}" fill="#0F1419"/>`;
    g+=`<rect x="${X(dep)}" y="${Y(c.barTop)}" width="${Math.max(5,3*s)}" height="${c.B.h*s}" fill="var(--metal)" stroke="var(--frame)"/>`;
    g+=`<rect x="${X(cfg.near*12)}" y="${Y(cfg.tableH)}" width="${(cfg.far-cfg.near-1)*12*s}" height="4" fill="var(--frame)"/>`;
    [[cfg.near,'Nearest'],[cfg.far,'Farthest']].forEach(([d,l])=>{ const x=X(d*12);
      g+=`<circle cx="${x}" cy="${Y(cfg.eyeH)}" r="6" fill="var(--panel)" stroke="var(--ink)" stroke-width="1.5"/><line x1="${x}" y1="${Y(cfg.eyeH-6)}" x2="${x}" y2="${Y(18)}" stroke="var(--ink)" stroke-width="2"/>`;
      g+=`<line x1="${x}" y1="${Y(cfg.eyeH)}" x2="${X(dep)}" y2="${Y(c.top)}" stroke="var(--sig)" stroke-dasharray="4 4" opacity=".6"/><line x1="${x}" y1="${Y(cfg.eyeH)}" x2="${X(dep)}" y2="${Y(c.bottom)}" stroke="var(--sig)" stroke-dasharray="4 4" opacity=".6"/>`;
      g+=`<text class="dv-lbl" x="${x}" y="${floor+16}" text-anchor="middle">${l}, ${fmt(d)} ft</text>`; });
    g+=`<line x1="${ox}" y1="${Y(cfg.eyeH)}" x2="${X(len*12)}" y2="${Y(cfg.eyeH)}" stroke="var(--muted)" stroke-dasharray="2 4"/>`;
    g+=`<text class="dv-lbl" x="${X(dep)+14}" y="${Y(c.camH)-6}">Camera ${fmt(c.camH)} in</text><text class="dv-lbl" x="${X(len*12)-4}" y="${Y(cfg.eyeH)-6}" text-anchor="end">Eye height ${fmt(cfg.eyeH)} in</text>`;
    g+=`<text class="dv-lbl" x="${X(dep)+14}" y="${Y(c.center)}">${M.cart?'On the cart':'Mount depth about '+fmt(dep,1)+' in'+(MD.ext?', extends to '+MD.ext+' in':'')}</text>`;
    return `<svg viewBox="0 0 640 ${floor+26}" role="img" aria-label="Side view from the display to the farthest seat">${g}</svg>`;
  }
  function flowView(){
    const c=calc(), P=c.P, B=c.B;
    const COL={hdmi:'#7A4CC2',usb:'#2C6FB7',net:'#2D8A3E',poe:'#C97B12',dev:'#566370'};
    const N={}, E=[]; const node=(id,x,y,l1,l2)=>{ N[id]={x,y,l1,l2}; };
    const xl=100, xc=380, xr=660;
    if(P.appliance){
      node('bar',xc,170,B.short,'runs '+P.app);
      node('tap',xc,300,cfg.tapGen==='2'?'Tap IP 2':'Tap IP','table controller');
      node('sw',xr,170,'Network switch','PoE ports');
      E.push(['bar','sw','net','Ethernet'],['tap','sw','poe','PoE']);
      if(cfg.hdmiIngest){ node('lap',xl,420,'Laptop','wired share'); E.push(['lap','bar','hdmi','HDMI into bar']); }
    } else {
      node('pc',xc,170,P.compute.split(' (')[0].replace('Lenovo ',''),'runs '+P.app);
      node('bar',xl,170,B.short,cfg.bar==='plus'?'camera, speakers, hubs':'camera, mics, speakers');
      node('sw',xr,170,'Network switch','');
      if(P.mac){ node('tap',xc,300,'iPad controller','Zoom Rooms Controller'); E.push(['bar','pc','usb','USB'],['tap','sw','net','Wi-Fi or Ethernet'],['pc','sw','net','Ethernet']);
        if(cfg.hdmiIngest){ node('lap',xl,420,'Laptop','wired share'); E.push(['lap','pc','hdmi','HDMI capture (USB)']); } }
      else { node('tap',xc,300,'Tap','table controller'); E.push(['bar','pc','usb','USB'],['tap','pc','dev','Tap Cat5e kit'],['pc','sw','net','Ethernet']);
        if(cfg.hdmiIngest){ node('lap',xl,420,'Laptop','wired share'); E.push(['lap','tap','hdmi','HDMI into Tap']); } }
    }
    const src=P.appliance?'bar':'pc';
    if(cfg.dispCount===2){ node('d1',xc-110,40,cfg.size+'" display','screen 1'); node('d2',xc+110,40,cfg.size+'" display','screen 2'); E.push([src,'d1','hdmi','HDMI'],[src,'d2','hdmi','HDMI']); }
    else { node('d1',xc,40,cfg.size+'" display','HDMI-CEC on'); E.push([src,'d1','hdmi','HDMI']); }
    if(cfg.pods){ if(accOn('podhub')){ node('pod',xl,40,cfg.pods+' × '+B.podName,'table mics'); node('hub',xl+100,105,'Mic Pod Hub','under the table'); E.push(['pod','hub','dev',''],['hub','bar','dev','']); }
      else { node('pod',xl,40,cfg.pods+' × '+B.podName,'table mics'); E.push(['pod','bar','dev','Mic pod cable']); } }
    if(accOn('scribe')){ node('scribe',xc,420,'Logitech Scribe','whiteboard camera'); E.push(['scribe',P.appliance?'bar':'pc','dev','per Logitech guide']); }
    if(accOn('swytch')){ node('swytch',xr,420,'Logitech Swytch','guest laptop link'); E.push(['swytch',P.appliance?'bar':'pc','dev','per Logitech guide']); }
    if(cfg.sight){ node('sight',xl,300,'Logitech Sight','table camera'); E.push(['sight','bar','dev','Sight cable']); }
    if(cfg.scheduler){ node('sch',xr,300,cfg.schedGen==='2'?'Tap Scheduler 2':'Tap Scheduler','outside the door'); E.push(['sch','sw','poe','PoE']); }
    if(cfg.wireless){ node('ws',xr+(accOn('swytch')?0:0),40,'Wireless share base','e.g. ClickShare'); E.push(['ws','sw','net','Ethernet']); }
    let g='';
    E.forEach(([a,b,t,l])=>{ const A=N[a],Bn=N[b]; const mx=(A.x+Bn.x)/2, my=(A.y+Bn.y)/2;
      g+=`<line x1="${A.x}" y1="${A.y}" x2="${Bn.x}" y2="${Bn.y}" stroke="${COL[t]}" stroke-width="3" ${t==='poe'?'stroke-dasharray="8 4"':''}/>`;
      if(l) g+=`<rect x="${mx-58}" y="${my-10}" width="116" height="18" rx="9" fill="var(--panel)" stroke="${COL[t]}"/><text x="${mx}" y="${my+3}" text-anchor="middle" class="dv-lbl" style="display:inline;font-size:11px">${l}</text>`; });
    E.forEach(()=>{});
    Object.values(N).forEach(n=>{ g+=`<rect x="${n.x-80}" y="${n.y-24}" width="160" height="48" rx="10" fill="var(--panel)" stroke="var(--frame)" stroke-width="1.5"/><text x="${n.x}" y="${n.y-3}" text-anchor="middle" class="dv-title" style="font-size:13px">${n.l1}</text><text x="${n.x}" y="${n.y+14}" text-anchor="middle" class="t s" style="font-family:var(--cond);font-size:11.5px;fill:var(--muted)">${n.l2}</text>`; });
    return `<svg viewBox="0 0 760 ${Object.values(N).some(n=>n.y>=420)?470:350}" role="img" aria-label="Connection diagram">${g}</svg>`;
  }
  function hookDiagram(c){
    const fl=300, X0=380;
    const oh=c.overallH, hk=c.hookUsed, pt=c.plateTop, bb=c.bottom, off=cfg.hookOffset;
    let g='';
    const s1=Math.min(8, 230/(Math.max(oh,hk)+4)), tx=30, tw=Math.min(170, c.D.w*s1*0.8), tb=280, th=oh*s1;
    g+=`<text class="dv-title" x="${tx}" y="20">1. Measure on the display</text>`;
    g+=`<rect x="${tx}" y="${tb-th}" width="${tw}" height="${th}" rx="4" fill="var(--ink)" opacity=".8"/>`;
    const hy=tb-hk*s1;
    [tx+tw*0.3, tx+tw*0.7].forEach(x=>{ const bh=Math.min(th*0.8, Math.max(20,(hk*0.85)*s1)); g+=`<rect x="${x-5}" y="${hy}" width="10" height="${bh}" fill="var(--metal)" stroke="var(--frame)"/><path d="M${x+5} ${hy+10} L${x+5} ${hy} L${x-9} ${hy} L${x-9} ${hy+8}" fill="none" stroke="var(--amber)" stroke-width="3" stroke-linejoin="round"/>`; });
    g+=`<line x1="${tx+tw*0.7}" y1="${hy}" x2="${tx+tw+30}" y2="${hy}" stroke="var(--amber)" stroke-dasharray="3 3"/><line x1="${tx+tw}" y1="${tb}" x2="${tx+tw+30}" y2="${tb}" stroke="var(--muted)" stroke-dasharray="3 3"/>`;
    g+=`<line x1="${tx+tw+22}" y1="${tb}" x2="${tx+tw+22}" y2="${hy}" stroke="currentColor" stroke-width="1.5" marker-start="url(#ar)" marker-end="url(#ar)"/>`;
    g+=`<text class="dv-title" x="${tx+tw+32}" y="${(tb+hy)/2-6}" style="font-size:15px;fill:var(--amber)">Hook distance</text><text class="dv-title" x="${tx+tw+32}" y="${(tb+hy)/2+15}" style="font-size:20px">${fmt(hk,2)} in</text>`;
    if(!c.hookMeasured) g+=`<text x="${tx+tw+32}" y="${(tb+hy)/2+34}" style="font-family:var(--cond);font-size:12.5px;fill:var(--warn)">estimate: measure it</text>`;
    g+=`<text x="${tx}" y="${tb+18}" style="font-family:var(--cond);font-size:12.5px;fill:var(--muted)">Back of the display, brackets attached.</text><text x="${tx}" y="${tb+33}" style="font-family:var(--cond);font-size:12.5px;fill:var(--muted)">Measure from the bottom edge to the hook tops.</text>`;
    const top=Math.max(pt,bb+oh)+8, sc=Math.min(3.2, 262/top), Yw=v=>fl-v*sc, wx=X0+20;
    g+=`<text class="dv-title" x="${X0}" y="20">2. Mark the wall</text>`;
    g+=`<rect x="${X0}" y="${Yw(top)}" width="270" height="${top*sc}" fill="var(--wall)"/>`;
    g+=`<line x1="${X0}" x2="${X0+270}" y1="${fl}" y2="${fl}" stroke="var(--frame)" stroke-width="3"/><text x="${X0+4}" y="${fl+18}" style="font-family:var(--cond);font-size:12.5px;fill:var(--muted)">Finished floor</text>`;
    g+=`<rect x="${wx+50}" y="${Yw(bb+oh)}" width="110" height="${oh*sc}" fill="none" stroke="var(--frame)" stroke-dasharray="5 4"/>`;
    if(!c.M.cart) g+=`<rect x="${wx+70}" y="${Yw(pt)}" width="70" height="${cfg.plateH*sc}" fill="var(--metal)" stroke="var(--ink)"/>`;
    g+=`<line x1="${wx+50}" x2="${wx+160}" y1="${Yw(c.hookRail)}" y2="${Yw(c.hookRail)}" stroke="var(--amber)" stroke-width="2"/>`;
    const dim=(x,y1,y2,label,col)=>{ g+=`<line x1="${x}" y1="${Yw(y1)}" x2="${x}" y2="${Yw(y2)}" stroke="${col||'currentColor'}" stroke-width="1.5" marker-start="url(#ar)" marker-end="url(#ar)"/><text x="${x+6}" y="${(Yw(y1)+Yw(y2))/2+4}" style="font-family:var(--cond);font-size:13px;fill:${col||'var(--ink)'}">${label}</text>`; };
    dim(wx+8,0,bb,`${fmt(bb,2)} in`);
    g+=`<text x="${wx+52}" y="${Yw(bb)+14}" style="font-family:var(--cond);font-size:12px;fill:var(--muted)">Bottom bezel</text>`;
    dim(wx+176,bb,c.hookRail,`+ ${fmt(hk,2)}`,'var(--amber)');
    if(Math.abs(off)>0.01) dim(wx+30,c.hookRail,pt,`${off>0?'+':'−'}${fmt(Math.abs(off),2)}`);
    g+=`<line x1="${wx+50}" x2="${X0+270}" y1="${Yw(pt)}" y2="${Yw(pt)}" stroke="var(--ok)" stroke-width="2.5"/>`;
    g+=`<rect x="${X0+112}" y="${Yw(pt)-28}" width="154" height="22" rx="11" fill="var(--ok)"/><text x="${X0+189}" y="${Yw(pt)-13}" text-anchor="middle" style="font-family:var(--cond);font-weight:600;font-size:13px;fill:#fff">Mount top ${fmt(pt,2)} in</text>`;
    const defs=`<defs><marker id="ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1 L10 5 L0 9 z" fill="context-stroke"/></marker></defs>`;
    return `<svg viewBox="0 0 660 345" role="img" aria-label="How the mount height is worked out" style="color:var(--ink)">${defs}${g}</svg>`;
  }
  function renderHeights(){
    const c=calc(), M=c.M, rows=[];
    rows.push(['Top bezel',c.top]); if(cfg.barPos==='above') rows.push([c.B.short+' top',c.barTop]);
    rows.push([c.B.short+' camera',c.camH],['Screen center',c.center]);
    if(!M.cart) rows.push(['Mount top (mark this)',c.plateTop],['Wall plate bottom',c.plateBot]);
    rows.push(['Bottom bezel',c.bottom]); if(cfg.barPos==='below') rows.push([c.B.short+' bottom',c.barBot]);
    if(cfg.credenza&&!M.cart) rows.push(['Credenza top',cfg.credH]); rows.push(['Seated eye height',cfg.eyeH],['Table top',cfg.tableH]);
    rows.sort((a,b)=>b[1]-a[1]);
    const ft=v=>{ const f=Math.floor(v/12), i=v-f*12; return `${f}′ ${fmt(i,2)}″`; };
    const formula = M.cart ? 'On a cart, set the display rail so the bottom bezel lands at this height.' : `${fmt(c.bottom,2)} in bottom bezel + ${fmt(c.hookUsed,2)} in hook distance${Math.abs(cfg.hookOffset)>0.01?` ${cfg.hookOffset>0?'+':'−'} ${fmt(Math.abs(cfg.hookOffset),2)} in mount offset`:''} = ${fmt(c.plateTop,2)} in`;
    document.getElementById('answer').innerHTML=`
      <div class="bigresult ${c.hookMeasured||M.cart?'':'warn'}">${M.cart?`<div><div class="lbl">Bottom bezel</div><b>${fmt(c.bottom,2)} in</b></div>`:`<div><div class="lbl">Mark the top of the mount at</div><b>${fmt(c.plateTop,2)} in</b><div class="lbl">${ft(c.plateTop)} from the finished floor</div></div>`}
      <div style="flex:1;min-width:220px"><div class="lbl">How it’s worked out</div><div style="font-size:14px;margin-top:4px">${formula}</div>${!c.hookMeasured&&!M.cart?'<div style="font-size:13px;color:var(--warn);margin-top:4px">The hook distance is an estimate until you measure it in the Height calculator.</div>':''}</div></div>`;
    document.getElementById('heights').innerHTML=`
      ${M.cart?'':`<div class="canvas">${hookDiagram(c)}</div>`}
      <details class="tplwrap" style="margin-top:8px"><summary>Every height on this wall</summary><div class="tablewrap" style="margin-top:8px"><table><thead><tr><th>Mark</th><th>Above floor</th><th></th></tr></thead><tbody>${rows.map(([a,v])=>`<tr><td>${a}</td><td><b>${fmt(v,2)} in</b></td><td>${ft(v)}</td></tr>`).join('')}</tbody></table></div></details>
      <p class="learn" style="margin-top:8px">Measure from the finished floor (on top of carpet or tile). Check the mark with a laser level before drilling, and measure the hook distance on the actual display: brackets differ between mounts and displays.</p>`;
  }
  function renderNumbers(){
    const c=calc(), D=c.D;
    const rows=[
      ['Image height', `${fmt(D.h,1)} in per ${cfg.size}" screen`],
      ['Maximum viewing distance', `${fmt(c.maxFar,1)} ft (${c.mult} × image height)`],
      ['Minimum display size', c.minSize?`${c.minSize} in`:'Larger than 85 in'],
      ['Camera height', `${fmt(c.camH)} in (seated eye level ${fmt(cfg.eyeH)} in)`],
      ['Top of display', `${fmt(c.top)} in, ceiling ${cfg.ceil} in`],
      ['Design load (mount or cart)', `about ${fmt(c.load)} lb`],
      ['Table microphones', `${cfg.pods} planned, about ${c.recPods} recommended`],
      ['Network drops', `${c.drops.length} (${c.drops.filter(d=>d[2]).length} PoE)`],
      ['Power receptacles behind display', `about ${c.outlets}`]
    ];
    document.getElementById('numbers').innerHTML = `<dl class="kv">${rows.map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>
      <div class="sub">Network drops</div><ul class="plain">${c.drops.map(d=>`<li>${d[0]}: ${d[1]}</li>`).join('')}</ul>
      <p class="learn" style="margin-top:10px">The 4/6 rule is a quick sizing guide; AVIXA’s DISCAS standard is the detailed method if the room is unusual.</p>`;
  }

