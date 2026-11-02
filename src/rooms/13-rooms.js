  // ---------- rooms ----------
  const esc=t=>String(t).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[m]);
  const PJ=document.getElementById('projectDrawer'), RT=document.getElementById('roomTitle');
  function applyRoom(r){ cfg=Object.assign(defaults(), r.cfg?JSON.parse(JSON.stringify(r.cfg)):{}); if(!cfg.acc) cfg.acc={}; if(!r.cfg) seedRoom();
    [survey,done,results].forEach(o=>Object.keys(o).forEach(k=>delete o[k])); Object.assign(survey,r.survey||{}); Object.assign(done,r.done||{}); Object.assign(results,r.results||{});
    preset=r.cfg?(r.preset==null?null:r.preset):'mini'; RN.value=r.name; undoCfg=null; }
  function switchRoom(id){ const r=ROOMS.find(x=>x.id===id); if(!r) return; syncActive(); ACTIVE=id; applyRoom(r); update(); renderRooms(); }
  function loadRoomForReport(id){ if(id!==ACTIVE) switchRoom(id); }
  function uniqueName(n){ let k=n, i=2; while(ROOMS.some(r=>r.name===k)) k=`${n} ${i++}`; return k; }
  function addRoom(copy){ syncActive(); let n=ROOMS.length+1, name=copy?uniqueName(`${RN.value} (copy)`):uniqueName(`Conference room ${n}`);
    const cur=ROOMS.find(x=>x.id===ACTIVE)||{};
    const r={id:rid(),name,cfg:copy?JSON.parse(JSON.stringify(cfg)):null,survey:{},done:{},results:{},preset:copy?preset:'mini',site:copy?(cur.site||''):'',installDate:''}; ROOMS.push(r); RPT.rooms[r.id]=true; switchRoom(r.id);
    const inp=PJ.querySelector(`[data-rname="${r.id}"]`); if(inp&&!PJ.hidden){ inp.focus(); inp.select(); } }
  function roomLine(r){ const c=r.id===ACTIVE?cfg:(r.cfg||{}); const B=BARS[c.bar]; return c.size?`${c.seats} seats, ${c.dispCount>1?'2 × ':''}${c.size}″, ${B?B.short:''}`:'New room'; }
  function renderRoomDet(){ const r=ROOMS.find(x=>x.id===ACTIVE)||{}; const a=document.getElementById('rdSite'), d=document.getElementById('rdDate'); if(document.activeElement!==a) a.value=r.site||''; d.value=r.installDate||''; if(document.activeElement!==RT) RT.value=RN.value;
    document.getElementById('rdDateLbl').textContent=r.installDate?`Install ${longDay(r.installDate)}`:'Set install date'; }
  function renderRooms(){ renderRoomDet(); renderNav();
    document.getElementById('roomList').innerHTML=ROOMS.map(r=>`<li class="${r.id===ACTIVE?'cur':''}"><input type="text" data-rname="${r.id}" value="${esc(r.name)}" aria-label="Room name"><span class="rmeta">${esc(roomLine(r))}</span><div class="rdet"><label>Address<input type="text" data-rsite="${r.id}" value="${esc(r.site||'')}" placeholder="Street address, floor"></label><label>Installation date<input type="date" data-rdate="${r.id}" value="${esc(r.installDate||'')}"></label></div>
      <span class="rbtns">${r.id===ACTIVE?'<span class="chip ok">Current</span>':`<button type="button" class="btn small" data-ropen="${r.id}">Open</button>`}<button type="button" class="btn small ghost" data-rdel="${r.id}" ${ROOMS.length<2?'disabled':''}>Delete</button></span></li>`).join(''); }
  RT.addEventListener('input',()=>{ const r=ROOMS.find(x=>x.id===ACTIVE); if(!r) return; r.name=RN.value=RT.value; renderNav(); renderChrome(); save(); });
  RT.addEventListener('keydown',e=>{ if(e.key==='Enter') RT.blur(); });
  RT.addEventListener('blur',()=>{ if(!RT.value.trim()){ RT.value=RN.value=uniqueName('Conference room'); const r=ROOMS.find(x=>x.id===ACTIVE); if(r) r.name=RN.value; renderNav(); renderChrome(); save(); } });
  const RDD=document.getElementById('rdDate');
  document.getElementById('rdDateBtn').addEventListener('click',()=>{ try{ RDD.showPicker(); }catch(e){ RDD.classList.remove('vh'); RDD.focus(); } });
  RDD.addEventListener('change',()=>{ const r=ROOMS.find(x=>x.id===ACTIVE); if(!r) return; r.installDate=RDD.value; renderRoomDet(); renderChrome(); save(); });
  // the room's ⋯ menu
  const RMNB=document.getElementById('roomMenuBtn'), RMN=document.getElementById('roomMenu'), RDC=document.getElementById('roomDelCur'); let curDelArm=null;
  function roomMenu(open){ RMN.hidden=!open; RMNB.setAttribute('aria-expanded',String(open)); if(open) document.getElementById('rdSite').focus(); else { curDelArm=null; RDC.textContent='Delete this room'; } }
  RMNB.addEventListener('click',()=>roomMenu(RMN.hidden));
  document.addEventListener('click',e=>{ if(!RMN.hidden&&!e.target.closest('.pop')) roomMenu(false); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!RMN.hidden){ roomMenu(false); RMNB.focus(); } });
  RMN.addEventListener('click',e=>{ if(e.target.closest('[data-rdup]')){ roomMenu(false); addRoom(true); RT.focus(); RT.select(); } if(e.target.closest('[data-project]')) roomMenu(false); });
  RDC.addEventListener('click',()=>{ if(ROOMS.length<2){ RDC.textContent='This is the only room'; return; }
    if(!curDelArm){ curDelArm=true; RDC.textContent=`Click again to delete ${RN.value||'this room'}`; return; }
    const i=ROOMS.findIndex(r=>r.id===ACTIVE); delete RPT.rooms[ACTIVE]; ROOMS.splice(i,1); ACTIVE=ROOMS[Math.max(0,i-1)].id; applyRoom(ROOMS.find(r=>r.id===ACTIVE)); roomMenu(false); update(); renderRooms(); save(); RT.focus(); });
  document.getElementById('roomDet').addEventListener('input',e=>{ const r=ROOMS.find(x=>x.id===ACTIVE); if(!r) return; if(e.target.id==='rdSite') r.site=e.target.value; if(e.target.id==='rdDate') r.installDate=e.target.value; renderChrome(); save(); });
  document.getElementById('roomNew').addEventListener('click',()=>addRoom(false));
  document.getElementById('roomDup').addEventListener('click',()=>addRoom(true));
  const pjF={client:'pjClient',site:'pjSite'};
  function openP(){ lastF=document.activeElement; Object.entries(pjF).forEach(([k,id])=>{ document.getElementById(id).value=RPT[k]||''; }); syncActive(); renderRooms(); PJ.hidden=false; SR.hidden=false; document.getElementById('pjClient').focus(); }
  document.addEventListener('click',e=>{ if(e.target.closest('[data-project]')) openP(); if(e.target.closest('[data-close]')) closeD(); });
  PJ.addEventListener('input',e=>{ const t=e.target;
    if(t.id in {pjClient:1,pjSite:1}){ RPT[t.id==='pjClient'?'client':'site']=t.value.trim(); renderChrome(); save(); }
    if(t.dataset.rsite||t.dataset.rdate){ const r=ROOMS.find(x=>x.id===(t.dataset.rsite||t.dataset.rdate)); if(t.dataset.rsite) r.site=t.value; else r.installDate=t.value; if(r.id===ACTIVE) renderRoomDet(); renderChrome(); save(); }
    if(t.dataset.rname){ const r=ROOMS.find(x=>x.id===t.dataset.rname); r.name=t.value; if(r.id===ACTIVE){ RN.value=t.value; RT.value=t.value; } renderNav(); renderChrome(); save(); } });
  const SIMKEY='ua-access-sim-v2';
  const NETKEY='site-toolkit-net-v1';
  document.getElementById('bkSave').addEventListener('click',async()=>{ writeNow(); try{ doorApi()&&doorApi().flush&&doorApi().flush(); }catch(e){}
    try{ netApi()&&netApi().flush(); }catch(e){}
    const data={app:'site-toolkit',version:2,saved:new Date().toISOString(),rooms:localStorage.getItem(KEY),doors:localStorage.getItem(SIMKEY),net:localStorage.getItem(NETKEY),netImages:netApi()?await netApi().exportImages():{}};
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,1)],{type:'application/json'}));
    a.download=`${(RPT.client||'Professional Services Toolbox').replace(/[\\/:*?"<>|]+/g,'').trim()} backup ${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    document.getElementById('bkMsg').textContent=`Downloaded a backup of ${ROOMS.length} room${ROOMS.length>1?'s':''}${doorApi()?`, ${doorApi().list().length} door${doorApi().list().length>1?'s':''}`:''}${netApi()?' and the network with its floor plans':''}.`; });
  document.getElementById('bkFile').addEventListener('change',e=>{ const f=e.target.files[0]; if(!f) return; const rd=new FileReader();
    rd.onload=async()=>{ const m=document.getElementById('bkMsg'); let d; try{ d=JSON.parse(rd.result); }catch(err){ d=null; }
      if(!d||d.app!=='site-toolkit'){ m.style.color='var(--bad)'; m.textContent='That file isn’t a Professional Services Toolbox backup.'; return; }
      if(!confirm('Restoring replaces every room, door and report setting in this browser with the backup. Continue?')) { e.target.value=''; return; }
      try{ try{ doorApi()&&doorApi().flush(); netApi()&&netApi().flush(); }catch(e){}
        if(d.rooms) localStorage.setItem(KEY,d.rooms); if(d.doors) localStorage.setItem(SIMKEY,d.doors); if(d.net) localStorage.setItem(NETKEY,d.net); if(d.netImages&&netApi()) await netApi().importImages(d.netImages); if(d.rooms) DB.markDirty(); }catch(err){ m.style.color='var(--bad)'; m.textContent='The backup couldn’t be restored: browser storage is full or blocked.'; return; }
      clearTimeout(saveT); saveT=null; window.removeEventListener('pagehide',flushOnHide); location.reload(); };
    rd.readAsText(f); });
  let delArm=null;
  PJ.addEventListener('click',e=>{ const o=e.target.closest('[data-ropen]'); if(o){ switchRoom(o.dataset.ropen); const n=PJ.querySelector(`[data-rname="${o.dataset.ropen}"]`); if(n) n.focus(); return; }
    const d=e.target.closest('[data-rdel]'); if(!d||ROOMS.length<2) return; const id=d.dataset.rdel;
    if(delArm!==id){ delArm=id; d.textContent='Confirm delete'; d.classList.add('danger'); setTimeout(()=>{ if(delArm===id){ delArm=null; renderRooms(); } },4000); return; }
    delArm=null; const i=ROOMS.findIndex(r=>r.id===id); ROOMS.splice(i,1); delete RPT.rooms[id];
    if(id===ACTIVE){ ACTIVE=ROOMS[Math.max(0,i-1)].id; applyRoom(ROOMS.find(r=>r.id===ACTIVE)); update(); }
    renderRooms(); save(); const f=PJ.querySelector('#roomNew'); if(f) f.focus(); });
