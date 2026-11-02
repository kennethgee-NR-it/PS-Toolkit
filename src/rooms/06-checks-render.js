  // ---------- checks render ----------
  function renderChecks(){
    const icon={ok:'✓',warn:'!',bad:'✕',info:'i'}, order={bad:0,warn:1,info:2,ok:3};
    const all=checks(), ic=issueCount();
    document.getElementById('ckFilter').innerHTML=[['issues',`Needs attention (${ic.bad+ic.warn})`],['all',`All checks (${all.length})`]].map(([v,l])=>`<button type="button" class="btn small ${UI.ckFilter===v?'tog':''}" aria-pressed="${UI.ckFilter===v}" data-ckf="${v}">${l}</button>`).join('');
    let list=all.slice().sort((a,b)=>order[a[0]]-order[b[0]]); if(UI.ckFilter==='issues') list=list.filter(c=>c[0]==='bad'||c[0]==='warn');
    const FX={}; all.forEach(([t,b])=>{ if((t==='bad'||t==='warn')&&!(b in FX)) FX[b]=canFix(b); }); const fixable=Object.values(FX).filter(Boolean).length, FA=document.getElementById('fixAll'); FA.hidden=!fixable; FA.textContent=fixable>1?`Fix ${fixable} automatically`:'Fix automatically';
    document.getElementById('checks').innerHTML = list.length? list.map(([t,b,m])=>`<li class="${t}"><span class="ic">${icon[t]}</span><span><b>${b}.</b> ${m}${WHY[b]?`<span class="why">Why it matters: ${WHY[b]}</span>`:''}${(t==='bad'||t==='warn')&&FX[b]?`<br><button type="button" class="btn small" data-fix="${b}">Fix this</button>`:''}${b==='Hook distance not measured'?`<br><button type="button" class="btn small" data-focushook="1">Enter the hook distance</button>`:''}</span></li>`).join('')
      : `<li class="ok"><span class="ic">✓</span><span><b>No issues.</b> This design follows every best practice the guide checks.</span></li>`;
  }

