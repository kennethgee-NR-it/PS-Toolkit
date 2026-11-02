  // ---------- database ----------
  // The rooms state still saves to localStorage first, then copies to the MySQL API in server/. On load the page
  // takes the database copy, unless this device has changes the database hasn't accepted yet (offline, or a save
  // that failed), in which case those are sent first. ?project=<id> in the address opens that project.
  const DB=(()=>{
    const API=location.protocol.startsWith('http')?'/api':null; // opened from a file: browser storage only
    const MKEY='av-room-guide-db'; // { project, version, dirty } for this device
    let key=null, meta={}, seq=0, timer=null, busy=null, again=false, conflict=false, msg='', synced=null;
    try{ meta=JSON.parse(localStorage.getItem(MKEY)||'{}')||{}; }catch(e){ meta={}; }
    const putMeta=()=>{ try{ localStorage.setItem(MKEY,JSON.stringify(meta)); }catch(e){} };
    const local=()=>{ try{ return localStorage.getItem(key); }catch(e){ return null; } };
    // the open tab and selected room belong to this device, so they're left out of what's synced
    const shared=s=>{ if(!s) return s; try{ const o=JSON.parse(s); delete o.ui; delete o.active; return JSON.stringify(o); }catch(e){ return s; } };
    const h=t=>String(t==null?'':t).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[m]);
    const at=()=>new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
    async function call(path,opt={}){ if(!API) throw Object.assign(new Error('Opened from a file'),{status:0}); const r=await fetch(API+path,Object.assign({headers:{'Content-Type':'application/json'}},opt)); const b=await r.json().catch(()=>({}));
      if(!r.ok) throw Object.assign(new Error(b.error||r.statusText),{status:r.status,body:b}); return b; }
    function status(s,bad){ msg=s; const m=document.getElementById('dbMsg'); if(m){ m.textContent=s; m.style.color=bad?'var(--bad)':''; }
      const c=document.getElementById('dbChip'); if(c){ const tone=conflict||(bad&&meta.dirty)?'bad':meta.dirty||!meta.project?'warn':'ok'; c.className='syncst '+tone; c.textContent=conflict?'Save conflict: choose a version':meta.dirty?'Not synced yet':meta.project?'Saved to the database':'Not in the database yet'; }
      const k=document.getElementById('dbConflict'); if(k) k.hidden=!conflict; }
    const linkTo=id=>location.pathname+(id?'?project='+id:'')+location.hash;

    // send this device's copy; on a 409 that turns out to be our own earlier save (a keepalive send whose reply was lost), adopt its version
    function push(force,keepalive){
      if(!API) return Promise.resolve();
      if(busy){ again=true; return busy; }
      const data=shared(local()), s=seq; if(!data) return Promise.resolve();
      if(!meta.project){ let named=false; try{ named=!!(JSON.parse(data).report||{}).client; }catch(e){} // no database row until the company has a name
        if(!named){ status('Add a company name to save this company to the database.'); return Promise.resolve(); } }
      busy=(async()=>{ try{
        if(!meta.project){ const r=await call('/projects',{method:'POST',body:JSON.stringify({data})}); meta.project=r.id; meta.version=r.version; history.replaceState(null,'',linkTo(r.id)); }
        else { const r=await call('/projects/'+meta.project,{method:'PUT',keepalive:!!keepalive,body:JSON.stringify({data,version:meta.version,force:!!force})}); meta.version=r.version; }
        conflict=false; synced=data; if(s===seq) meta.dirty=false; putMeta(); status(`Saved to the database at ${at()}.`);
      }catch(e){
        if(e.status===409){ const p=await call('/projects/'+meta.project).catch(()=>null);
          if(p&&p.data===data){ meta.version=p.version; synced=data; if(s===seq) meta.dirty=false; putMeta(); status(`Saved to the database at ${at()}.`); }
          else { conflict=true; status('Someone else saved this project after you opened it. Choose which version to keep.',true); } }
        else if(e.status===404&&meta.project){ meta.project=null; meta.version=null; putMeta(); again=true; } // deleted on the server: save as a new project
        else status('Can’t reach the database. Changes are kept on this device and will sync when it’s back.',true);
      }finally{ busy=null; if(again&&!conflict){ again=false; push(); } else again=false; } })();
      return busy;
    }
    return {
      async load(k){ key=k;
        if(!API){ status('Opened as a file, so this saves in this browser only. Open http://localhost:3000 to use the database.',true); return local(); }
        const qp=Number(new URLSearchParams(location.search).get('project'))||null;
        if(qp&&qp!==meta.project){ // a link to a different project: send any unsynced work first, then switch
          if(meta.dirty&&meta.project) await push();
          if(meta.dirty&&meta.project&&!confirm('This device has changes to another project that haven’t reached the database. Open the linked project anyway and lose them?')){ history.replaceState(null,'',linkTo(meta.project)); status(msg); return local(); }
          meta={project:qp}; putMeta(); try{ localStorage.removeItem(key); }catch(e){} }
        if(!meta.project){ if(meta.dirty) push(); status('This company isn’t in the database yet. It’s added once it has a name.'); return local(); }
        if(meta.dirty){ await push(); return local(); }
        try{ const p=await call('/projects/'+meta.project); let d=p.data;
          try{ const o=JSON.parse(d), l=JSON.parse(local()||'{}')||{}; if(l.ui) o.ui=l.ui; if(l.active) o.active=l.active; d=JSON.stringify(o); localStorage.setItem(key,d); }catch(e){}
          synced=p.data; meta.version=p.version; putMeta();
          if(!qp) history.replaceState(null,'',linkTo(meta.project)); status(`Loaded from the database (last saved ${new Date(p.updated_at).toLocaleString('en-US')}).`); return d; }
        catch(e){ if(e.status===404){ meta={}; putMeta(); status('That project isn’t in the database any more. Changes will save it as a new project.',true); return local(); }
          status('Can’t reach the database. Showing the copy saved on this device.',true); return local(); }
      },
      changed(){ if(shared(local())===synced) return; seq++; meta.dirty=true; putMeta(); status(msg); if(conflict) return; clearTimeout(timer); timer=setTimeout(()=>push(),1500); },
      flush(){ if(meta.dirty&&meta.project&&!conflict){ clearTimeout(timer); push(false,true); } },
      markDirty(){ meta.dirty=true; putMeta(); },
      keepMine(){ return push(true); },
      takeTheirs(){ meta.dirty=false; conflict=false; putMeta(); leave(linkTo(meta.project)); },
      async open(id){ if(id===meta.project) return; if(meta.dirty&&meta.project){ clearTimeout(timer); await push(); }
        if(meta.dirty&&meta.project&&!confirm('Some changes to this project haven’t reached the database. Open the other project anyway and lose them?')) return;
        meta={project:id}; putMeta(); leave(linkTo(id)); },
      async create(){ if(meta.dirty&&meta.project){ clearTimeout(timer); await push(); }
        if(meta.dirty&&meta.project&&!confirm('Some changes to this project haven’t reached the database. Start a new project anyway and lose them?')) return;
        meta={}; putMeta(); try{ sessionStorage.setItem('ps-newco','1'); }catch(e){} leave(linkTo(null)); },
      isNew(){ try{ const n=sessionStorage.getItem('ps-newco'); sessionStorage.removeItem('ps-newco'); return !!n; }catch(e){ return false; } },
      current(){ return meta.project; },
      rows(){ return call('/projects'); },
      async list(){ const L=document.getElementById('dbList'); if(!L) return; status(msg);
        let rows; try{ rows=await DB.rows(); }catch(e){ L.innerHTML='<li class="hint">Can’t reach the database.</li>'; return; }
        L.innerHTML=rows.length?rows.map(p=>`<li><span><b>${h(p.name||'Untitled project')}</b>${p.site?` · ${h(p.site)}`:''}<br><small>${p.room_count} room${p.room_count===1?'':'s'} · saved ${h(new Date(p.updated_at).toLocaleString('en-US'))}</small></span>${p.id===meta.project?'<span class="chip ok">Open now</span>':`<button type="button" class="btn small" data-dbopen="${p.id}">Open</button>`}</li>`).join(''):'<li class="hint">No projects saved yet.</li>'; },
    };
    // reload into another project without the page writing the current rooms back on the way out
    function leave(url){ clearTimeout(timer); clearTimeout(saveT); saveT=null; window.removeEventListener('pagehide',flushOnHide); try{ localStorage.removeItem(key); }catch(e){} location.href=url; }
  })();
  document.addEventListener('click',e=>{ const t=e.target;
    if(t.closest('[data-project]')) DB.list();
    const o=t.closest('[data-dbopen]'); if(o) DB.open(Number(o.dataset.dbopen));
    if(t.closest('[data-dbnew]')) DB.create();
    if(t.closest('#dbMine')) DB.keepMine();
    if(t.closest('#dbTheirs')) DB.takeTheirs(); });

  // ---------- company switcher (top bar) ----------
  const CO={ btn:document.getElementById('coBtn'), menu:document.getElementById('coMenu'), find:document.getElementById('coFind'), list:document.getElementById('coList'), rows:null };
  function coRender(){ const q=CO.find.value.trim().toLowerCase(), cur=DB.current(), h=t=>String(t==null?'':t).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[m]);
    if(CO.rows===null){ CO.list.innerHTML='<li class="hint">Loading…</li>'; return; }
    // this device's company is always listed, even when the database list doesn't include it or can't be reached
    let rows=(CO.rows||[]).slice(); if(!cur||!rows.some(p=>p.id===cur)) rows.unshift({id:cur,name:RPT.client,site:RPT.site,room_count:ROOMS.length,unsaved:!cur});
    rows=rows.filter(p=>!q||`${p.name} ${p.site}`.toLowerCase().includes(q));
    CO.list.innerHTML=(CO.rows?'':'<li class="hint">Can’t reach the database. Showing this device’s company only.</li>')+(rows.length?rows.map(p=>{ const on=p.id===cur||p.unsaved, sub=[p.site,`${p.room_count} room${p.room_count===1?'':'s'}`,p.unsaved?'not saved yet':''].filter(Boolean).map(h).join(' · ');
      return `<li><button type="button" class="coitem${on?' cur':''}" ${on?'aria-current="true" data-coclose':`data-dbopen="${p.id}"`}><span class="ck" aria-hidden="true">${on?'✓':''}</span><span><b>${h(p.name||'Untitled company')}</b><small>${sub}</small></span></button></li>`; }).join('')
      :`<li class="hint">No company matches “${h(CO.find.value)}”.</li>`); }
  async function coOpen(){ CO.menu.hidden=false; CO.btn.setAttribute('aria-expanded','true'); CO.find.value=''; CO.rows=null; coRender(); CO.find.focus();
    try{ CO.rows=await DB.rows(); }catch(e){ CO.rows=false; } if(!CO.menu.hidden) coRender(); }
  function coClose(focus){ if(CO.menu.hidden) return; CO.menu.hidden=true; CO.btn.setAttribute('aria-expanded','false'); if(focus) CO.btn.focus(); }
  CO.btn.addEventListener('click',()=>CO.menu.hidden?coOpen():coClose());
  CO.find.addEventListener('input',coRender);
  CO.find.addEventListener('keydown',e=>{ if(e.key==='Enter'){ const b=CO.list.querySelector('button'); if(b){ e.preventDefault(); b.click(); } } if(e.key==='ArrowDown'){ const b=CO.list.querySelector('button'); if(b){ e.preventDefault(); b.focus(); } } });
  CO.list.addEventListener('keydown',e=>{ const bs=[...CO.list.querySelectorAll('button')], i=bs.indexOf(document.activeElement); if(i<0) return;
    if(e.key==='ArrowDown'){ e.preventDefault(); (bs[i+1]||bs[i]).focus(); } if(e.key==='ArrowUp'){ e.preventDefault(); (bs[i-1]||CO.find).focus(); } });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!CO.menu.hidden){ e.stopPropagation(); coClose(true); } },true);
  document.addEventListener('click',e=>{ if(!CO.menu.hidden&&(!e.target.closest('#coSw')||e.target.closest('[data-coclose],[data-project]'))) coClose(); });

