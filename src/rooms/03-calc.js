  // ---------- derived numbers ----------
  function calc(){
    const P=PLATFORMS[cfg.platform], B=BARS[cfg.bar], D=DISP[cfg.size], M=MOUNTS[cfg.mount];
    const mult = cfg.content==='detailed'?4:6;
    const maxFar = mult*D.h/12;
    const minSizeFor = s=>[55,65,75,85].find(z=>mult*DISP[z].h/12>=cfg.far);
    const overallH = D.h + 2*cfg.bezel;
    const bottom = cfg.dispBottom, center = bottom + overallH/2, top = bottom + overallH;
    const vesaC = bottom + (cfg.vesaFromBottom>0 ? cfg.vesaFromBottom : overallH/2);
    const hookEst = 17; // default hook distance (in) until a measured value is entered
    const hookUsed = cfg.hook>0 ? cfg.hook : hookEst, hookMeasured = cfg.hook>0;
    let plateC, plateTop, plateBot;
    if(cfg.plateMethod==='hook'){ plateTop = bottom + hookUsed + cfg.hookOffset; plateC = plateTop - cfg.plateH/2; plateBot = plateTop - cfg.plateH; }
    else { plateC = vesaC - cfg.plateOffset; plateTop = plateC + cfg.plateH/2; plateBot = plateC - cfg.plateH/2; }
    const hookRail = bottom + hookUsed;
    const barGap = 1.5;
    const camH = cfg.barPos==='above' ? top + barGap + B.h/2 : bottom - barGap - B.h/2;
    const barTop = cfg.barPos==='above' ? top + barGap + B.h : bottom - barGap;
    const barBot = cfg.barPos==='above' ? top + barGap : bottom - barGap - B.h;
    const MD = MODELS[cfg.model];
    const recPods = cfg.bar==='huddle'?0 : cfg.bar==='plus' ? Math.max(2,Math.ceil(cfg.seats/8)) : (cfg.seats>8?Math.ceil((cfg.seats-8)/6):0);
    const load = cfg.dispLb*cfg.dispCount + B.lb + (cfg.mount==='cart'||cfg.mount==='cartxl'?0:0);
    const drops = []; // network
    if(!P.appliance) drops.push(['Room PC (compute)', 'Ethernet', false]);
    drops.push([B.short+(P.appliance?' (room system)':' (management)'), 'Ethernet', false]);
    if(P.appliance) drops.push([cfg.tapGen==='2'?'Tap IP 2':'Tap IP', 'Ethernet (PoE)', true]);
    if(cfg.scheduler) drops.push([(cfg.schedGen==='2'?'Tap Scheduler 2':'Tap Scheduler')+' (outside the door)', 'Ethernet (PoE)', true]);
    if(cfg.wireless) drops.push(['Wireless share base (ClickShare)', 'Ethernet', false]);
    const outlets = 1 + (P.appliance?1:2) + (cfg.dispCount>1?1:0) + (cfg.wireless?1:0) + (cfg.bar==='plus'?1:0);
    return {hookUsed,hookMeasured,hookEst,hookRail,P,B,D,M,MD,mult,maxFar,minSize:minSizeFor(),camH,top,bottom,center,overallH,vesaC,plateC,plateTop,plateBot,barTop,barBot,recPods,load,drops,outlets};
  }

  function overallOf(size){ return DISP[size].h + 2*cfg.bezel; }
  function syncBottom(){ const oh=overallOf(cfg.size); cfg.dispBottom = cfg.refType==='center' ? cfg.refH - oh/2 : cfg.refType==='top' ? cfg.refH - oh : cfg.refH; }
  function setBottom(b){ cfg.refType='bottom'; cfg.refH=Math.round(b*4)/4; syncBottom(); }
  const accOn = id => { const a=ACC.find(x=>x.id===id), P=PLATFORMS[cfg.platform]; return !!(cfg.acc && cfg.acc[id]) && a.for.includes(cfg.bar) && !(a.compute && P.appliance) && !(a.nomac && P.mac); };

