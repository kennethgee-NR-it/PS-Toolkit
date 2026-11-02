  // ---------- chrome ----------
  const TABS=['design','plan','survey','install'];
  const SCR={};
  function showTab(t,focus){ if(!TABS.includes(t)) t='design'; const prev=UI.tab; if(prev!==t) SCR[prev]=window.scrollY; UI.tab=t;
    TABS.forEach(x=>{ const tb=document.getElementById('t-'+x); tb.setAttribute('aria-selected',String(x===t)); tb.tabIndex=x===t?0:-1; document.getElementById('p-'+x).hidden=x!==t; });
    if(location.hash.slice(1)!==t){ try{ history.replaceState(null,'','#'+t); }catch(e){} }
    if(focus){ window.scrollTo({top:TABS.indexOf(t)<TABS.indexOf(prev)?(SCR[t]||0):0}); document.getElementById('p-'+t).focus({preventScroll:true}); } else if(prev!==t) window.scrollTo({top:SCR[t]||0}); save(); }
  const stg=document.querySelector('.stages');
  stg.addEventListener('click',e=>{ const b=e.target.closest('[data-tab]'); if(b) showTab(b.dataset.tab); });
  stg.addEventListener('keydown',e=>{ const i=TABS.indexOf(UI.tab); let n=null; if(e.key==='ArrowRight') n=(i+1)%4; if(e.key==='ArrowLeft') n=(i+3)%4; if(e.key==='Home') n=0; if(e.key==='End') n=3;
    if(n!==null){ e.preventDefault(); showTab(TABS[n]); document.getElementById('t-'+TABS[n]).focus(); } });
  document.addEventListener('click',e=>{ const g=e.target.closest('[data-go]'); if(g){ if(g.dataset.planview) showPlan(g.dataset.planview); showTab(g.dataset.go,true);
    if(g.dataset.scroll==='checks'){ UI.ckFilter='issues'; renderChecks(); const P=document.getElementById('checksPanel'); P.scrollIntoView({block:'start'}); document.getElementById('checksH').focus({preventScroll:true}); } } });
  window.addEventListener('hashchange',()=>{ const h=location.hash.slice(1); if(TABS.includes(h)) showTab(h); });
  const SUBS=['steps','equip','cables','calendar','accept'];
  function showSub(s){ UI.sub=s; document.querySelectorAll('#subtabs [data-sub]').forEach(b=>{ const on=b.dataset.sub===s; b.setAttribute('aria-selected',String(on)); b.tabIndex=on?0:-1; document.getElementById('s-'+b.dataset.sub).hidden=!on; }); save(); }
  const SB=document.getElementById('subtabs');
  SB.addEventListener('click',e=>{ const b=e.target.closest('[data-sub]'); if(b) showSub(b.dataset.sub); });
  SB.addEventListener('keydown',e=>{ const i=SUBS.indexOf(UI.sub); let n=null; if(e.key==='ArrowRight') n=(i+1)%SUBS.length; if(e.key==='ArrowLeft') n=(i+SUBS.length-1)%SUBS.length; if(n!==null){ e.preventDefault(); showSub(SUBS[n]); SB.querySelector(`[data-sub="${SUBS[n]}"]`).focus(); } });
  function showPlan(v){ UI.plan=v; ['top','elev','side','flow'].forEach(k=>{ document.getElementById('plan'+k.charAt(0).toUpperCase()+k.slice(1)).hidden=k!==v; });
    document.getElementById('planViewTitle').textContent={top:'Room layout',elev:'Wall elevation',side:'Side view',flow:'Connections'}[v];
    document.getElementById('planSeg').innerHTML=[['top','Layout'],['elev','Elevation'],['side','Side'],['flow','Connections']].map(([k,l])=>`<button type="button" data-plan="${k}" aria-pressed="${v===k}">${l}</button>`).join(''); save(); }
  document.getElementById('planSeg').addEventListener('click',e=>{ const b=e.target.closest('[data-plan]'); if(b){ showPlan(b.dataset.plan); document.querySelector(`[data-plan="${b.dataset.plan}"]`).focus(); } });
  document.getElementById('ckFilter').addEventListener('click',e=>{ const b=e.target.closest('[data-ckf]'); if(b){ UI.ckFilter=b.dataset.ckf; renderChecks(); save(); } });
  function fixReport(before,label){ const after=issueCount(), n0=before.bad+before.warn, n1=after.bad+after.warn, left=checks().filter(c=>c[0]==='bad'||c[0]==='warn').map(c=>c[1]);
    document.getElementById('fixMsg').textContent = `${label}${n0>n1?` ${n0-n1} issue${n0-n1>1?'s':''} resolved.`:''}${n1?` Still needs you: ${left.join(', ')}.`:' All checks pass.'}`; }
  document.getElementById('checks').addEventListener('click',e=>{ const b=e.target.closest('[data-fix]'); if(b&&FIXES[b.dataset.fix]){ const before=issueCount(); FIXES[b.dataset.fix](); normalize(); preset=null; update(); fixReport(before,`Fixed: ${b.dataset.fix}.`); const f=document.getElementById('fixAll'); (f.hidden?document.getElementById('checksH'):f).focus(); } });
  document.getElementById('checks').addEventListener('click',e=>{ if(!e.target.closest('[data-focushook]')) return; const i=document.querySelector('#controls [data-num="hook"]'); if(i){ i.scrollIntoView({block:'center'}); i.focus(); } });
  document.getElementById('fixAll').addEventListener('click',()=>{ const before=issueCount(); applyFixes(); preset=null; update(); fixReport(before,'Applied the automatic fixes.'); document.getElementById('checksH').focus(); });
  document.getElementById('svFilter').addEventListener('click',e=>{ const b=e.target.closest('[data-svf]'); if(b){ UI.svFilter=b.dataset.svf; renderSurvey(); save(); } });
  document.getElementById('survey').addEventListener('click',e=>{ const hw=e.target.closest('[data-svhow]'); if(hw){ const id=hw.dataset.svhow; SVOPEN.has(id)?SVOPEN.delete(id):SVOPEN.add(id); renderSurvey(); const nb=document.querySelector(`[data-svhow="${id}"]`); if(nb) nb.focus(); } });
  document.getElementById('survey').addEventListener('input',e=>{ const id=e.target.dataset.svnote; if(id){ const v=e.target.value.trim(); if(v) survey[id+'_n']=v; else delete survey[id+'_n']; save(); } });
  document.getElementById('survey').addEventListener('click',e=>{ const b=e.target.closest('[data-sv]'); if(!b) return; const id=b.dataset.sv; survey[id]=survey[id]===b.dataset.v?undefined:b.dataset.v; if(survey[id]===undefined) delete survey[id]; renderSurvey(); renderChrome(); save(); const nb=document.querySelector(`[data-sv="${id}"][data-v="${b.dataset.v}"]`); if(nb) nb.focus(); });
  document.getElementById('steps').addEventListener('change',e=>{ const t=e.target.dataset.step; if(t){ done[t]=e.target.checked; if(!done[t]) delete done[t]; renderInstall(); renderChrome(); save(); const el=document.querySelector(`[data-step="${CSS.escape(t)}"]`); if(el) el.focus(); } });
  document.getElementById('accept').addEventListener('change',e=>{ const k=e.target.dataset.res; if(k){ results[k]=e.target.value; renderChrome(); save(); } });
  document.getElementById('accept').addEventListener('input',e=>{ const k=e.target.dataset.note; if(k){ results[k+'_n']=e.target.value; save(); } });
  RN.addEventListener('input',()=>{ renderChrome(); save(); });
  const LT=document.getElementById('learnToggle');
  function applyLearn(){ document.body.classList.toggle('learning',UI.learn); LT.setAttribute('aria-pressed',String(UI.learn)); }
  LT.addEventListener('click',()=>{ UI.learn=!UI.learn; applyLearn(); save(); });
  const DR=document.getElementById('drawer'), SR=document.getElementById('scrim'); let lastF=null;
  const openD=()=>{ lastF=document.activeElement; DR.hidden=false; SR.hidden=false; document.getElementById('drawerClose').focus(); };
  const closeD=()=>{ document.querySelectorAll('.drawer').forEach(d=>{ d.hidden=true; }); SR.hidden=true; if(lastF&&document.contains(lastF)) lastF.focus(); };
  document.getElementById('helpBtn').addEventListener('click',openD); document.getElementById('drawerClose').addEventListener('click',closeD); SR.addEventListener('click',closeD);
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&document.querySelector('.drawer:not([hidden])')) closeD(); });
  const RB=document.getElementById('resetBtn'); let armed=null;
  RB.addEventListener('click',()=>{ if(!armed){ RB.textContent='Click again to clear everything'; RB.classList.add('danger'); armed=setTimeout(()=>{ armed=null; RB.textContent='Start over'; RB.classList.remove('danger'); },4000); return; }
    clearTimeout(armed); armed=null; RB.textContent='Start over'; RB.classList.remove('danger');
    cfg=defaults(); preset='mini'; seedRoom(); [survey,done,results].forEach(o=>Object.keys(o).forEach(k=>delete o[k])); update(); renderRooms(); showTab('design',true); });
  function renderChrome(){ try{ modCounts(); }catch(e){}
    const ic=issueCount(), c=calc();
    const bd=document.getElementById('b-design'); bd.className='badge '+(ic.bad?'bad':ic.warn?'warn':'ok'); bd.textContent=ic.bad+ic.warn?`${ic.bad+ic.warn} to fix`:'No issues';
    const bp=document.getElementById('b-plan'); bp.className='badge'; bp.textContent=`${c.drops.length} drops`;
    const bv=document.getElementById('b-survey'); bv.className='badge '+(SVSTAT.no?'bad':SVSTAT.checked===SVSTAT.total&&SVSTAT.total?'ok':''); bv.textContent=SVSTAT.no?`${SVSTAT.no} blocker${SVSTAT.no>1?'s':''}`:`${SVSTAT.checked}/${SVSTAT.total}`;
    const bi=document.getElementById('b-install'); const fails=Object.entries(results).filter(([k,v])=>!k.endsWith('_n')&&v==='Fail').length; bi.className='badge '+(fails?'bad':STEPSTAT.done===STEPSTAT.total&&STEPSTAT.total?'ok':''); bi.textContent=fails?`${fails} test${fails>1?'s':''} failed`:`${STEPSTAT.done}/${STEPSTAT.total} steps`;
    document.getElementById('coName').textContent=RPT.client||'Add company name'; document.getElementById('coName').classList.toggle('empty',!RPT.client); document.getElementById('coSite').textContent=RPT.site||'';
    const r=ROOMS.find(x=>x.id===ACTIVE)||{}, i=ROOMS.indexOf(r);
    document.getElementById('rKind').textContent=ROOMS.length>1?`Conference room ${i+1} of ${ROOMS.length}`:'Conference room';
    document.getElementById('rMeta').textContent=[r.site,`${cfg.seats} seats`,c.P.short,c.B.short,`${cfg.dispCount>1?'two':'one'} ${cfg.size}″ display${cfg.dispCount>1?'s':''} on ${c.M.short}`].filter(Boolean).join(' · ');
    try{ renderNav(); }catch(e){}
  }
  function update(){
    document.getElementById('fixMsg').textContent=''; normalize(); renderControls(); paintQuick(); renderChecks();
    const wv=wallView(); document.getElementById('wallview').innerHTML=wv; document.getElementById('elevview').innerHTML=wv;
    renderHeights(); renderLayout();
    document.getElementById('topview').innerHTML=topView();
    document.getElementById('sideview').innerHTML=sideView();
    document.getElementById('flowview').innerHTML=flowView();
    renderNumbers(); renderSurvey(); renderInstall(); renderChrome(); renderPresets(); save();
  }

