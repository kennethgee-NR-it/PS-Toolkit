  // ---------- state ----------
  const defaults=()=>({platform:'teamsAndroid', bar:'mini', seats:8, far:14, near:5, ceil:108, content:'general', size:65, dispCount:1, dispLb:55, dispBottom:38, barPos:'above',
    mount:'wood', anchor:'auto', dwThk:'0.625', backing:false, cmuGrouted:true, mountBrand:0, pods:0, sight:false, scheduler:true, wireless:false, hdmiIngest:true,
    hdmiLen:6, hdmiType:'passive', usbLen:6, usbType:'passive', tapLen:15, tableW:4,
    model:'chief', refType:'bottom', refH:45, hook:0, hookOffset:0, plateMethod:'hook', standardH:45, tolerance:5, bezel:0.6, vesaFromBottom:0, plateOffset:0, plateH:16, eyeH:47, tableH:30, credenza:false, credH:30, credGap:4,
    barMount:'tv', tapGen:'1', schedGen:'1', acc:{}, calendar:'google', schedMount:'wall',
    wallW:144, centerOnWall:true, centerX:72, dispGap:0, tvW:0, vesaX:0, firstStud:16, studSpacing:16, plateW:24, slide:3, boxW:9, boxH:8});
  let cfg=Object.assign(defaults(), STORE.cfg||{}); if(!cfg.acc) cfg.acc={};
  const UI=Object.assign({tab:'design', sub:'steps', plan:'top', ckFilter:'issues', svFilter:'all', learn:true, open:{room:true,platform:true,display:true,height:true}}, STORE.ui||{});
  const survey=STORE.survey||{}, done=STORE.done||{}, results=STORE.results||{};
  let preset=('preset' in STORE)?STORE.preset:'mini';
  let SVSTAT={total:0,checked:0,no:0}, STEPSTAT={total:0,done:0};
  const RN=document.getElementById('roomName'); if(STORE.roomName) RN.value=STORE.roomName;
  const RPT=Object.assign({client:'',site:'',person:'',date:'',by:'Network Right Professional Services'},STORE.report||{}); RPT.inc=Object.assign({design:true,plan:true,survey:true,install:true},RPT.inc||{}); RPT.rooms=RPT.rooms||{}; if(RPT.net==null) RPT.net=true; RPT.doors=RPT.doors||{}; RPT.dinc=Object.assign({design:true,simulate:true,wiring:true,survey:true,install:true,accept:true},RPT.dinc||{}); if(RPT.totals==null) RPT.totals=true; if(!RPT.email) RPT.email='professionalservices@networkright.com';
  RPT.inst=Object.assign({steps:true,stepDetail:true,tools:true,equip:true,cables:true,calendar:true,accept:true,signoff:true},RPT.inst||{});
  function syncActive(){ const r=ROOMS.find(x=>x.id===ACTIVE); if(!r) return; r.name=RN.value||r.name; r.cfg=JSON.parse(JSON.stringify(cfg)); r.survey=Object.assign({},survey); r.done=Object.assign({},done); r.results=Object.assign({},results); r.preset=preset; }
  let saveT=null;
  function writeNow(){ clearTimeout(saveT); saveT=null; try{ localStorage.setItem(KEY, (syncActive(),JSON.stringify({rooms:ROOMS,active:ACTIVE,ui:UI,report:RPT}))); DB.changed(); }catch(e){} }
  function save(){ clearTimeout(saveT); saveT=setTimeout(writeNow,200); }
  function flushOnHide(){ if(saveT) writeNow(); DB.flush(); } window.addEventListener('pagehide',flushOnHide); document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden') flushOnHide(); });

