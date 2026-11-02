  const fmt=(n,d=0)=>(Math.round(n*Math.pow(10,d))/Math.pow(10,d)).toFixed(d);
  const KEY='av-room-guide-v1';
  let STORE={}; try{ STORE=JSON.parse((await DB.load(KEY))||'{}')||{}; }catch(e){ STORE={}; }
  const rid=()=>'r'+Math.random().toString(36).slice(2,9);
  const longDay=iso=>{ if(!iso) return ''; const d=new Date(iso+'T12:00:00'); return isNaN(d)?iso:d.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}); };
  let ROOMS=Array.isArray(STORE.rooms)&&STORE.rooms.length?STORE.rooms:null, ACTIVE=STORE.active;
  if(ROOMS){ const r=ROOMS.find(x=>x.id===ACTIVE)||ROOMS[0]; ACTIVE=r.id; Object.assign(STORE,{cfg:r.cfg||undefined,survey:r.survey,done:r.done,results:r.results,preset:r.preset==null?null:r.preset,roomName:r.name}); if(!r.cfg) delete STORE.cfg; }
  else { ROOMS=[{id:rid(),name:STORE.roomName||'Conference room 1'}]; ACTIVE=ROOMS[0].id; }

