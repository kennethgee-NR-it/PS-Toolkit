  // ---------- controls ----------
  const C=document.getElementById('controls');
  const seg=(key,opts,style='')=>`<div class="seg" role="group" ${style?`style="${style}"`:''}>${opts.map(([v,l])=>`<button type="button" data-seg="${key}" data-v="${v}" aria-pressed="${String(cfg[key])===String(v)}">${l}</button>`).join('')}</div>`;
  const chk=(key,label,hint,dis)=>`<label class="check${dis?' disabled':''}"><input type="checkbox" data-chk="${key}" ${cfg[key]&&!dis?'checked':''} ${dis?'disabled':''}><span>${label}${hint?`<span class="hint">${hint}</span>`:''}</span></label>`;
  const num=(key,label,unit,min,max,step=1)=>`<label class="row">${label} <span><input type="number" inputmode="decimal" autocomplete="off" data-num="${key}" min="${min}" max="${max}" step="${step}" value="${cfg[key]}"> ${unit}</span></label>`;
  const modelSel=()=>{ const grp=[['Full-motion arms',k=>MODELS[k].type==='Full motion'],['Fixed, tilt and articulating',k=>MODELS[k].type!=='Full motion']];
    return `<label class="row stack">Mount <select data-sel="model">${grp.map(([l,f])=>`<optgroup label="${l}">${Object.keys(MODELS).filter(f).map(k=>`<option value="${k}" ${cfg.model===k?'selected':''}>${MODELS[k].name}</option>`).join('')}</optgroup>`).join('')}</select></label>`; };
  const sel=(key,label,obj)=>`<label class="row stack">${label} <select data-sel="${key}">${Object.entries(obj).map(([k,v])=>`<option value="${k}" ${String(cfg[key])===k?'selected':''}>${typeof v==='string'?v:v.name}</option>`).join('')}</select></label>`;
  function acc(id,title,summary,body){ return `<details class="acc" data-acc="${id}" ${UI.open[id]?'open':''}><summary><span class="h">${title}</span><span class="v">${summary}</span></summary><div class="body">${body}</div></details>`; }
  function renderQuick(){
    const c=calc(), M=c.M, ic=issueCount(), n=ic.bad+ic.warn, ft=v=>{ const f=Math.floor(v/12); return `${f}′ ${fmt(v-f*12,2)}″`; };
    const fld=(label,input,hint,cls='')=>`<label class="qf ${cls}"><span>${label}</span>${input}${hint?`<small>${hint}</small>`:''}</label>`;
    const ni=(k,min,max,step,ph)=>`<input type="number" inputmode="decimal" autocomplete="off" data-num="${k}" min="${min}" max="${max}" step="${step}" value="${k==='hook'&&!cfg[k]?'':cfg[k]}"${ph!=null?` placeholder="${ph}"`:''}>`;
    const hookF=M.cart?'':fld('Hook distance (in)',ni('hook',0,60,0.125,fmt(c.hookEst,2)),c.hookMeasured?'Measured. Bottom edge to top of the bracket hooks.':'Not measured: using an estimate. Measure with the brackets on the display.',c.hookMeasured?'':'warn');
    const offF=(!M.cart&&c.MD.type==='Full motion')?fld('Plate top above hook rail (in)',ni('hookOffset',-24,24,0.125),'Negative if the plate top is lower.'):'';
    const html=`<div class="qtop"><h3>Essentials</h3><span class="qbtns">${n?`<button type="button" class="chip bad" data-go="design" data-scroll="checks">${n} issue${n>1?'s':''} →</button> `:'<span class="chip ok">Checks pass</span> '}</span></div>
      <div><div class="qf"><span>Display size</span></div>${seg('size',[[55,'55″'],[65,'65″'],[75,'75″'],[85,'85″']])}</div>
      <div class="qgrid">${fld('Bottom bezel height (in)',`<input type="number" inputmode="decimal" autocomplete="off" data-bbnum="1" min="20" max="80" step="0.25" value="${fmt(c.bottom,2)}">`,`Standard ${fmt(cfg.standardH)} in ± ${fmt(cfg.tolerance)}`)}${hookF}${offF}${fld('Nearest seat (ft)',ni('near',2,20,0.5),'Closest viewer to the screen')}${fld('Farthest seat (ft)',ni('far',4,40,0.5),`Screen suits up to ${fmt(c.maxFar,0)} ft`)}${fld('Seats',ni('seats',1,46,1),'')}</div>
      <div class="qres ${c.hookMeasured||M.cart?'':'warn'}">${M.cart?`<span>Set the cart rail so the bottom bezel is at</span><b>${fmt(c.bottom,2)} in</b>`:`<span>Mark the top of the mount at</span><b>${fmt(c.plateTop,2)} in</b><small>${ft(c.plateTop)} from the finished floor${c.hookMeasured?'':' (estimate: measure the hook distance)'}</small>`}</div>`;
    return html; }
  function paintQuick(){ const h=renderQuick(); const c=calc(), ic=issueCount(), n=ic.bad+ic.warn;
    Q2.innerHTML=`<details class="qd" ${UI.q2?'open':''}><summary><span class="h">Essentials</span><span class="v">${c.M.cart?`Bottom bezel ${fmt(c.bottom,2)} in`:`Mount top ${fmt(c.plateTop,2)} in`}, ${cfg.size}″ display, farthest seat ${fmt(cfg.far)} ft${n?`, ${n} issue${n>1?'s':''}`:''}</span></summary><div class="qbody">${h}<div><button type="button" class="btn small" data-go="design">← All design settings</button></div></div></details>`; }
  document.getElementById('quickPlan').addEventListener('toggle',e=>{ if(e.target.classList&&e.target.classList.contains('qd')){ UI.q2=e.target.open; save(); } },true);
  function renderControls(){
    const c=calc(), P=c.P, B=c.B, M=c.M;
    C.innerHTML =
      acc('room','Room',`${cfg.seats} seats, farthest seat ${cfg.far} ft`,
        num('seats','Seats','people',1,46)+num('near','Nearest seat from screen','ft',2,20)+num('far','Farthest seat from screen','ft',4,40)+num('ceil','Ceiling height','in',84,180)
        +`<label class="row">Main content</label>${seg('content',[['general','General (video, slides)'],['detailed','Detailed (spreadsheets)']])}`
        +`<p class="learn">Measure from the display wall to the eyes of the person in the farthest seat. That one number decides the screen size.</p>`)
      +acc('platform','Platform and video bar',`${P.short}, ${B.short}`,
        sel('platform','Platform',PLATFORMS)
        +`<label class="row">Room calendars live in</label>${seg('calendar',[['google','Google Workspace'],['m365','Microsoft 365']])}`
        +`<p class="learn">${P.mac?`<b>Zoom Rooms on a Mac mini.</b> The Mac mini runs the Zoom Rooms app. The video bar plugs into it by USB, the display by HDMI, and an iPad running the Zoom Rooms Controller app pairs with the room as the touch controller.`:P.appliance?`<b>Appliance mode.</b> The video bar runs ${P.app} itself. A Tap IP controller pairs over the network and takes PoE.`:`<b>Compute mode.</b> A ${P.compute} runs ${P.app}. The video bar plugs into it by USB, the Tap controller by its Cat5e kit, and the display by HDMI.`}</p>`
        +sel('bar','Video device',Object.fromEntries(Object.entries(BARS).map(([k,v])=>[k,v.short+' (up to '+v.seats+')'])))
        +chk('sight','Logitech Sight tabletop camera','A second camera in the middle of the table for a face-on view.',!B.sight))
      +acc('display','Displays',`${cfg.dispCount} × ${cfg.size} in, video bar ${cfg.barPos}`,
        `<label class="row">Size</label>${seg('size',[[55,'55"'],[65,'65"'],[75,'75"'],[85,'85"']])}`
        +`<label class="row">Number of displays</label>${seg('dispCount',[[1,'One'],[2,'Two']])}`
        +num('dispLb','Weight, each','lb',20,250)
        +`<label class="row">Video bar position</label>${seg('barPos',[['above','Above the display'],['below','Below the display']])}`
        +((cfg.bar==='mini'||cfg.bar==='bar')?`<label class="row">Bar mounts with</label>${seg('barMount',[['tv','TV mount'],['wall','Wall mount']])}`:`<p class="hint">${B.mounts}.</p>`)
        +`<p class="learn">Typical VESA for a ${cfg.size}-inch display is ${c.D.vesa}, and typical weight is about ${DISP[cfg.size].lb} lb. Enter the real weight from the display’s spec sheet.</p>`)
      +acc('furniture','Furniture and people',`Table ${fmt(cfg.tableH)} in, eye height ${fmt(cfg.eyeH)} in${cfg.credenza?', credenza '+fmt(cfg.credH)+' in':''}`,
        num('tableH','Table height','in',24,42,0.5)+num('eyeH','Seated eye height','in',40,56,0.5)
        +chk('credenza','Credenza or cabinet under the display','The display has to clear the top.')
        +(cfg.credenza?num('credH','Credenza height','in',18,48,0.5)+num('credGap','Gap above credenza','in',1,24,0.5):'')
        +`<p class="learn">Standard conference tables are about 29 to 30 in high; seated eye height for an average adult is about 46 to 48 in.</p>`)
      +acc('height','Height calculator',`Bottom bezel ${fmt(c.bottom,1)} in → mount top ${fmt(c.plateTop,1)} in${c.hookMeasured?'':' (hook not measured)'}`,
        `<div class="calcstep"><span class="cn">1</span><div><b>Bottom bezel height</b><span class="hint">Your standard is ${fmt(cfg.standardH)} in, plus or minus ${fmt(cfg.tolerance)}.</span></div></div>`
        +`<div class="seg" role="group" style="margin:6px 0">${[cfg.standardH-cfg.tolerance,cfg.standardH-2.5,cfg.standardH,cfg.standardH+2.5,cfg.standardH+cfg.tolerance].map(v=>`<button type="button" data-bb="${v}" aria-pressed="${cfg.refType==='bottom'&&Math.abs(cfg.refH-v)<0.01}">${fmt(v,1).replace('.0','')}″</button>`).join('')}</div>`
        +`<label class="row">Exact height <span><input type="number" data-bbnum="1" min="20" max="80" step="0.25" value="${fmt(c.bottom,2)}"> in</span></label>`
        +`<div class="calcstep"><span class="cn">2</span><div><b>Hook distance</b><span class="hint">With the brackets bolted to the display, measure from the display’s bottom edge to the top of the bracket hooks.</span></div></div>`
        +`<label class="row">Measured hook distance <span><input type="number" data-num="hook" min="0" max="60" step="0.125" value="${cfg.hook||''}" placeholder="${fmt(c.hookEst,1)}"> in</span></label>`
        +(c.hookMeasured?'':`<p class="hint" style="color:var(--warn)">Not measured yet; using an estimate of ${fmt(c.hookEst,1)} in.</p>`)
        +`<div class="calcstep"><span class="cn">3</span><div><b>Mount offset</b><span class="hint">${c.MD.type==='Full motion'?'Full-motion arm: with the arm level, measure from the rail the hooks sit on to the top of the wall plate. Enter it as negative if the wall plate top is lower.':'Fixed or tilt mount: usually 0, because the hooks sit on the top rail of the wall plate.'}</span></div></div>`
        +num('hookOffset','Wall plate top above the hook rail','in',-24,24,0.125)
        +`<div class="result"><span>Mark the top of the mount at</span><b>${fmt(c.plateTop,2)} in</b><span>${(v=>{ const f=Math.floor(v/12); return `${f}′ ${fmt(v-f*12,2)}″ from the finished floor`; })(c.plateTop)}</span></div>`
        +`<details class="adv"><summary>Advanced settings</summary>`
        +num('standardH','Company standard bottom bezel','in',30,70,0.5)+num('tolerance','Allowed variation, plus or minus','in',0,12,0.5)
        +`<label class="row">Set the display height by</label>${seg('refType',[['bottom','Bottom bezel'],['center','Center'],['top','Top bezel']])}`
        +num('refH',{bottom:'Bottom bezel above floor',center:'Screen center above floor',top:'Top bezel above floor'}[cfg.refType],'in',12,110,0.5)
        +num('bezel','Bezel width (each edge)','in',0,3,0.1)+num('plateH','Wall plate height','in',4,30,0.5)
        +`<label class="row">Find the mount height from</label>${seg('plateMethod',[['hook','Hook distance'],['vesa','VESA position']])}`
        +(cfg.plateMethod==='vesa'?num('vesaFromBottom','VESA center above bottom edge (0 = centered)','in',0,60,0.25)+num('plateOffset','VESA center above wall plate center','in',-12,12,0.25):'')
        +`</details>`)
      +acc('mount','Mounting',M.name+(M.cart?'':', '+c.MD.short),
        `<label class="row">Wall type</label>${['framed','masonry','cart'].map(f=>f).length?`<div class="seg" role="group">${[['framed','Drywall / framed'],['masonry','Concrete / masonry'],['cart','Cart']].map(([f,l])=>`<button type="button" data-fam="${f}" aria-pressed="${M.fam===f}">${l}</button>`).join('')}</div>`:''}`
        +sel('mount','Wall detail',Object.fromEntries(Object.entries(MOUNTS).filter(([k,v])=>v.fam===M.fam)))
        +(M.cart?'':sel('anchor','Anchor method',Object.assign({auto:'Mount manufacturer’s hardware'},Object.fromEntries(Object.entries(ANCH).filter(([k,v])=>v.walls.includes(cfg.mount)&&!(k==='toggle'&&cfg.mount==='metal'&&cfg.backing)).map(([k,v])=>[k,v.name]))))+(AK()?`<p class="hint">${anchorSpec(AK())}</p>`:'')+(AK()==='toggle'&&!M.masonry?sel('dwThk','Drywall thickness',{'0.5':'1/2 in','0.625':'5/8 in'}):'')+modelSel()+`<p class="hint">${c.MD.type}${c.MD.cap?', rated '+c.MD.cap+' lb':''}${c.MD.vesa?', VESA up to '+c.MD.vesa.join(' × '):''}. ${c.MD.note}</p>`)
        +(cfg.mount==='metal'?chk('backing','Backing added between studs','Plywood or steel backing, or a stud-mount plate rated for steel studs.'):'')
        +(cfg.mount==='cmu'?chk('cmuGrouted','Anchor cells are solid or grouted','Check by drilling a small test hole.'):'')

        +`<p class="learn">${M.cart?'A cart makes the room portable. The display mounts to the cart’s VESA rails, the video bar to its soundbar mount, and the compute to its device panel.':'What the wall is made of decides the fasteners. Find out before the install day: tap, use a stud finder, or drill a small test hole.'}</p>`)
      +(M.cart?'':acc('layout','Wall layout and studs',`${cfg.dispCount>1?'Two displays':'Display'} ${cfg.centerOnWall?'centered on a '+fmt(cfg.wallW,0)+' in wall':'at '+fmt(cfg.centerX,1)+' in'}; studs from ${fmt(cfg.firstStud,1)} in`,
        num('wallW','Wall width, corner to corner','in',24,600,0.25)
        +chk('centerOnWall','Center the display'+(cfg.dispCount>1?'s':'')+' on the wall')
        +(cfg.centerOnWall?'':num('centerX','Display center from the left corner','in',0,600,0.25))
        +(cfg.dispCount>1?num('dispGap','Gap between the two bezels (0 = touching)','in',0,24,0.125):'')
        +num('tvW','Display overall width (0 = estimate)','in',0,90,0.125)
        +`<p class="hint">Estimate: ${fmt(c.D.w+2*cfg.bezel,2)} in. Use the spec sheet’s overall width so touching bezels line up exactly.</p>`
        +num('vesaX','VESA center right of display center','in',-12,12,0.125)
        +(M.masonry?'':num('firstStud','First stud center from the left corner','in',0,48,0.125)
        +`<label class="row">Stud spacing</label>${seg('studSpacing',[[16,'16 in'],[24,'24 in']])}`)
        +num('plateW','Wall plate width','in',4,48,0.25)
        +num('slide','Display can slide on the mount, ±','in',0,12,0.25)
        +`<p class="hint">${c.MD.short}: ${c.MD.manual?'the manual allows 8 in of side-to-side shift (±4 in), and the plate spans 16, 18 or 24 in studs. Measure the plate’s real lag-slot span and enter it as the width.':'check the plate’s lag-slot span and how far the display brackets can slide along the rail.'}</p>`
        +num('boxW','Recess box width','in',3,16,0.25)+num('boxH','Recess box height','in',3,16,0.25)
        +`<p class="learn">Measure from the left corner of the wall. The guide centers the displays, then moves each wall plate sideways to catch studs, and slides the display back to center on its mount. The recess box goes in a stud bay behind the display, clear of the plate.</p>`))
      +acc('audio','Audio and extras',[cfg.pods?cfg.pods+' mic pods':'','Tap'+(P.appliance?' IP':''),cfg.scheduler?'scheduler':'',cfg.wireless?'wireless share':''].filter(Boolean).join(', '),
        num('pods',B.podName+'s','',0,7)
        +`<p class="learn">${B.pods?`${B.short} supports up to ${B.pods} mic pods${cfg.bar==='plus'?'; Rally Plus includes two':''}. Recommended here: about ${c.recPods}.`:`${B.short} has no mic pod input; it relies on its built-in mics.`}</p>`
        +(P.appliance?`<label class="row">Controller</label>${seg('tapGen',[['1','Tap IP'],['2','Tap IP 2']])}`:'')
        +chk('scheduler','Tap Scheduler outside the door','PoE scheduling panel.')
        +(cfg.scheduler?`<label class="row">Scheduler model</label>${seg('schedGen',[['1','Tap Scheduler'],['2','Tap Scheduler 2']])}`+sel('schedMount','Scheduler mounts on',SCHED_MOUNTS)+`<p class="hint">Runs as a ${SCHED_APP[P.vendor]}.</p>`:'')
        +chk('hdmiIngest','Wired HDMI sharing','A laptop HDMI cable at the table, into the Tap (compute mode) or the video bar’s HDMI input (appliance mode).')
        +chk('wireless','Wireless sharing base','For example Barco ClickShare.'))
      +acc('acc','Logitech accessories',(()=>{ const on=ACC.filter(a=>accOn(a.id)).map(a=>a.name); return on.length?on.length+' selected':'None selected'; })(),
        ACC.filter(a=>a.for.includes(cfg.bar) && !(a.compute&&P.appliance) && !(a.nomac&&P.mac)).map(a=>`<label class="check"><input type="checkbox" data-accitem="${a.id}" ${cfg.acc[a.id]?'checked':''}><span>${a.name}${B.isNew?' <span class="hint" style="display:inline">(confirm for Rally Bar 2)</span>':''}<span class="hint">${a.desc}</span></span></label>`).join('')
        +`<p class="learn">Only accessories that work with the ${B.short}${P.appliance?' in appliance mode':''} are listed.</p>`)
      +acc('cables','Cable runs',`HDMI ${cfg.hdmiLen} ft${P.appliance?'':', USB '+cfg.usbLen+' ft'}`,
        num('hdmiLen','HDMI run to display','ft',1,100)+`<label class="row">HDMI type</label>${seg('hdmiType',[['passive','Passive'],['active','Active or fiber']])}`
        +(P.appliance?'':num('usbLen','USB, video bar to compute','ft',1,60)+`<label class="row">USB type</label>${seg('usbType',[['passive','Passive'],['active','Active extension']])}`+(P.mac?'':num('tapLen','Tap Cat5e run','ft',3,150))));
  }
  C.addEventListener('toggle',e=>{ const d=e.target; if(d.dataset&&d.dataset.acc){ UI.open[d.dataset.acc]=d.open; save(); } },true);
  const Q2=document.getElementById('quickPlan');
  const bind=(type,fn)=>[C,Q2].forEach(r=>r.addEventListener(type,e=>fn(e,r)));
  bind('click',(e,R)=>{ const q=e.target.closest('[data-bb]'); if(q){ setBottom(Number(q.dataset.bb)); preset=null; update(); const nb=R.querySelector(`[data-bb="${q.dataset.bb}"]`); if(nb) nb.focus(); return; } });
  bind('click',(e,R)=>{ const f=e.target.closest('[data-fam]'); if(f){ cfg.mount=({framed:'wood',masonry:'concrete',cart:cfg.size>75?'cartxl':'cart'})[f.dataset.fam]; preset=null; update(); const nf=R.querySelector(`[data-fam="${f.dataset.fam}"]`); if(nf) nf.focus(); } });
  bind('click',(e,R)=>{ const b=e.target.closest('[data-seg]'); if(!b) return; const k=b.dataset.seg; let v=b.dataset.v; if(['size','dispCount','studSpacing'].includes(k)) v=Number(v);
    if(k==='refType'){ const c0=calc(); cfg.refH = Math.round((v==='center'?c0.center:v==='top'?c0.top:c0.bottom)*2)/2; }
    if(k==='barMount'){ cfg.acc.tvmount = v==='tv'; cfg.acc.wallmount = v==='wall'; }
    cfg[k]=v; if(k==='size'){ cfg.dispLb=DISP[v].lb; } preset=null; update(); const nb=R.querySelector(`[data-seg="${k}"][data-v="${v}"]`); if(nb) nb.focus(); });
  bind('change',(e,R)=>{ const t=e.target; let focusSel=null;
    if(t.dataset.chk){ cfg[t.dataset.chk]=t.checked; focusSel=`[data-chk="${t.dataset.chk}"]`; }
    if(t.dataset.sel){ const k=t.dataset.sel; cfg[k]= t.value; if(k==='bar') normalize(); if(k==='platform' && PLATFORMS[cfg.platform].appliance && cfg.bar==='plus') {} focusSel=`[data-sel="${k}"]`; }
    if(t.dataset.num){ let v=parseFloat(t.value); if(t.dataset.num==='hook'&&isNaN(v)) v=0; if(!isNaN(v)) cfg[t.dataset.num]=v; focusSel=`[data-num="${t.dataset.num}"]`; }
    if(t.dataset.bbnum){ const v=parseFloat(t.value); if(!isNaN(v)) setBottom(v); focusSel='[data-bbnum="1"]'; }
    if(t.dataset.accitem){ cfg.acc[t.dataset.accitem]=t.checked; if(t.dataset.accitem==='tvmount'&&t.checked) cfg.barMount='tv'; if(t.dataset.accitem==='wallmount'&&t.checked) cfg.barMount='wall'; focusSel=`[data-accitem="${t.dataset.accitem}"]`; }
    if(t.dataset.sel==='model'){ const m=MODELS[cfg.model]; cfg.plateH = m.plateH; cfg.plateW = m.plateW!=null?m.plateW:16; cfg.slide = m.slide!=null?m.slide:2; }
    preset=null; update(); if(focusSel){ const el=R.querySelector(focusSel); if(el) el.focus(); } });

