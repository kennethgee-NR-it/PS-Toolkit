  // ---------- toolkit modules ----------
  const MT=document.querySelector('.mtop'), MB=document.querySelector('.mobnav'); // module frames fill the space between the phone's top and bottom bars
  const fitFrames=()=>document.documentElement.style.setProperty('--suiteH',Math.ceil(MT.getBoundingClientRect().height+MB.getBoundingClientRect().height)+'px');
  new ResizeObserver(fitFrames).observe(MT); new ResizeObserver(fitFrames).observe(MB);
  const DF=document.getElementById('doorsFrame'), DW=document.getElementById('doorsWrap'), NF=document.getElementById('netFrame'), NW=document.getElementById('netWrap');
  function netApi(){ try{ return NF.contentWindow&&NF.contentWindow.NET_API||null; }catch(e){ return null; } }
  function doorApi(){ try{ return DF.contentWindow&&DF.contentWindow.DOOR_API||null; }catch(e){ return null; } }
  // ---------- sidebar: every room, door and the network plan for this company ----------
  function roomSt(){ const ic=issueCount(), n=ic.bad+ic.warn;
    if(n) return ['warn',`${n} to fix`];
    if(STEPSTAT.total&&STEPSTAT.done===STEPSTAT.total) return ['ok','Installed'];
    if(STEPSTAT.done) return ['info',`Install ${STEPSTAT.done}/${STEPSTAT.total}`];
    if(SVSTAT.no) return ['bad',`${SVSTAT.no} blocker${SVSTAT.no>1?'s':''}`];
    if(SVSTAT.total&&SVSTAT.checked===SVSTAT.total) return ['ok','Ready to install'];
    if(SVSTAT.checked) return ['info',`Survey ${SVSTAT.checked}/${SVSTAT.total}`];
    return ['','Design']; }
  // a room not opened yet this session: its saved survey and install progress, until it's opened and checked
  function savedSt(r){ const sv=r.survey||{}, ans=Object.keys(sv).filter(k=>!k.endsWith('_n')), no=ans.filter(k=>sv[k]==='no').length, dn=Object.values(r.done||{}).filter(Boolean).length;
    if(dn) return ['info',`Install, ${dn} step${dn>1?'s':''} done`]; if(no) return ['bad',`${no} blocker${no>1?'s':''}`]; if(ans.length) return ['info',`Survey, ${ans.length} checked`]; return ['',r.cfg?'Design':'New']; }
  function renderNav(){ const cur=ROOMS.find(r=>r.id===ACTIVE); if(cur) cur.st=roomSt();
    const item=(attr,id,on,name,st)=>`<li><button type="button" class="jitem${on?' on':''}" ${attr}="${id}" ${on?'aria-current="page"':''}><span class="sdot ${st[0]}" aria-hidden="true"></span><span class="jn">${esc(name)}</span>${st[1]?`<small class="${st[0]}">${esc(st[1])}</small>`:''}</button></li>`;
    document.getElementById('navRooms').innerHTML=ROOMS.map(r=>item('data-nroom',r.id,UI.mod==='rooms'&&r.id===ACTIVE,r.name||'Untitled room',r.st||savedSt(r))).join('');
    const da=doorApi(), doors=da?da.list():null, dact=da&&da.active?da.active():null;
    document.getElementById('navDoors').innerHTML=doors?doors.map(d=>item('data-ndoor',d.id,UI.mod==='doors'&&d.id===dact,d.name||'Door',['',''])).join(''):'<li class="jempty">Loading…</li>';
    const ns=netApi()?netApi().summary():null;
    document.getElementById('navNet').innerHTML=item('data-nnet','plan',UI.mod==='net','Network plan',ns?['',`${ns.aps} AP${ns.aps===1?'':'s'}`]:['','']);
    const d=doors&&doors.find(x=>x.id===dact);
    document.getElementById('mCo').textContent=RPT.client||'Add company name';
    document.getElementById('mName').textContent=UI.mod==='doors'?(d?d.name:'Door access'):UI.mod==='net'?'Network plan':(RN.value||'Untitled room');
    const ms=document.getElementById('mSt'), st=UI.mod==='rooms'&&cur?cur.st:['','']; ms.textContent=st[1]; ms.className='mst '+st[0]; }
  const modCounts=renderNav;
  const SIDE=document.getElementById('side'), NS=document.getElementById('navScrim'), MNB=document.getElementById('mNavBtn');
  function navOpen(open){ document.body.classList.toggle('navopen',open); NS.hidden=!open; MNB.setAttribute('aria-expanded',String(open)); if(open) (SIDE.querySelector('.jitem.on')||SIDE.querySelector('button')).focus(); }
  MNB.addEventListener('click',()=>navOpen(!document.body.classList.contains('navopen')));
  NS.addEventListener('click',()=>navOpen(false));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&document.body.classList.contains('navopen')&&!document.querySelector('.drawer:not([hidden])')){ navOpen(false); MNB.focus(); } });
  SIDE.addEventListener('click',e=>{ const t=e.target;
    const r=t.closest('[data-nroom]'); if(r){ showMod('rooms'); if(r.dataset.nroom!==ACTIVE) switchRoom(r.dataset.nroom); navOpen(false); return; }
    const d=t.closest('[data-ndoor]'); if(d){ showMod('doors'); try{ doorApi().open(d.dataset.ndoor); }catch(err){} renderNav(); navOpen(false); return; }
    if(t.closest('[data-nnet]')){ showMod('net'); navOpen(false); return; }
    if(t.closest('#navRoomAdd')){ showMod('rooms'); addRoom(false); navOpen(false); RT.focus(); RT.select(); return; }
    if(t.closest('#navDoorAdd')){ showMod('doors'); try{ doorApi().add(); }catch(err){} renderNav(); navOpen(false); }
    if(t.closest('[data-project]')) navOpen(false); });
  window.AVS={ openReport:()=>openR(UI.mod==='doors'), refresh:()=>{ modCounts(); if(!RD.hidden) syncTotals(); } };
  let framed=false;
  function loadDoors(){ if(framed) return; framed=true; try{ DF.srcdoc=JSON.parse(document.getElementById('doorsSrc').textContent); }catch(e){ framed=false; }
    try{ NF.srcdoc=JSON.parse(document.getElementById('netSrc').textContent); }catch(e){} }
  function showMod(m){ UI.mod=['doors','net'].includes(m)?m:'rooms'; document.body.classList.toggle('mod-doors',UI.mod==='doors'); document.body.classList.toggle('mod-net',UI.mod==='net');
    document.querySelectorAll('.mobnav [data-mod]').forEach(b=>{ if(b.dataset.mod===UI.mod) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
    DW.hidden=UI.mod!=='doors'; NW.hidden=UI.mod!=='net'; renderNav(); save(); }
  document.querySelector('.mobnav').addEventListener('click',e=>{ const b=e.target.closest('[data-mod]'); if(b) showMod(b.dataset.mod); });
