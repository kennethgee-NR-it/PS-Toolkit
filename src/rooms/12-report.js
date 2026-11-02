  // ---------- Word report export ----------
  // Styled after the Network Right Wi-Fi survey report: Arial, navy headings,
  // grey-bordered tables with navy header rows, light-blue group rows, amber notes.
  const DOCX_URL='https://cdn.jsdelivr.net/npm/docx@9.5.1/dist/index.iife.js';
  let docxP=null;
  function loadDocx(){ if(window.docx&&window.docx.Packer) return Promise.resolve(window.docx);
    if(!docxP) docxP=new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=DOCX_URL; s.crossOrigin='anonymous';
      s.onload=()=>window.docx&&window.docx.Packer?res(window.docx):(docxP=null,rej(new Error('load')));
      s.onerror=()=>{ docxP=null; s.remove(); rej(new Error('load')); }; document.head.appendChild(s); });
    return docxP; }

  const RD=document.getElementById('reportDrawer'), RM=document.getElementById('reportMsg');
  const rpF={client:'rpClient',site:'rpSite',person:'rpPerson',date:'rpDate',by:'rpBy',email:'rpEmail'};
  function fillReportForm(){ Object.entries(rpF).forEach(([k,id])=>{ document.getElementById(id).value=RPT[k]||''; });
    if(!RPT.date) document.getElementById('rpDate').value=new Date().toISOString().slice(0,10);
    syncActive(); document.getElementById('rpRooms').innerHTML=ROOMS.map(r=>`<label class="check"><input type="checkbox" data-rroom="${r.id}" ${RPT.rooms[r.id]!==false?'checked':''}><span>${esc(r.name)}${r.id===ACTIVE?' <span class="hint" style="display:inline">(open now)</span>':''}</span></label>`).join('');
    const dl=doorApi()?doorApi().list():[];
    document.getElementById('rpDoors').innerHTML=dl.length?dl.map(d=>`<label class="check"><input type="checkbox" data-rdoor="${d.id}" ${RPT.doors[d.id]!==false?'checked':''}><span>${esc(d.name)}<span class="hint">${esc(d.line)}</span></span></label>`).join(''):'<p class="hint">The door simulator is still loading.</p>';
    const ns=netApi()?netApi().summary():null; document.getElementById('rpNet').checked=RPT.net!==false; const ws=netApi()&&netApi().wifiSummary?netApi().wifiSummary():null; document.getElementById('rpNetHint').textContent=ns?`${ns.gateway}, ${ns.switches}, ${ns.apText||ns.aps+' APs'}; ${ns.linesDone||0} of ${ns.lines||0} lines complete${ws?`; Wi-Fi survey with ${ws.images} of ${ws.slots} images and ${ws.aps} AP${ws.aps===1?'':'s'}`:''}`:'The network planner is still loading.';
    syncTotals(); renderOpts(); }
  function syncTotals(){ const dl=doorApi()?doorApi().list():[];
    RD.querySelector('[data-allrooms]').parentElement.hidden=ROOMS.length<2; RD.querySelector('[data-alldoors]').parentElement.hidden=dl.length<2; syncOpts(); }
  function readReportForm(){ Object.entries(rpF).forEach(([k,id])=>{ RPT[k]=document.getElementById(id).value.trim(); });
    RD.querySelectorAll('[data-rroom]').forEach(c=>{ RPT.rooms[c.dataset.rroom]=c.checked; }); RD.querySelectorAll('[data-rdoor]').forEach(c=>{ RPT.doors[c.dataset.rdoor]=c.checked; }); RPT.net=document.getElementById('rpNet').checked; syncTotals(); renderChrome(); save(); }
  RD.addEventListener('click',e=>{ const b=e.target.closest('[data-allrooms]'); if(!b) return; RD.querySelectorAll('[data-rroom]').forEach(c=>{ c.checked=b.dataset.allrooms==='1'; }); readReportForm(); });
  RD.addEventListener('click',e=>{ const b=e.target.closest('[data-alldoors]'); if(!b) return; RD.querySelectorAll('[data-rdoor]').forEach(c=>{ c.checked=b.dataset.alldoors==='1'; }); readReportForm(); });
  function openR(focusDoors){ lastF=document.activeElement; fillReportForm(); RM.textContent=''; RM.className='rpmsg'; RD.hidden=false; SR.hidden=false; if(focusDoors==='net'){ const f=document.getElementById('rpNetSet'); f.scrollIntoView({block:'start'}); f.querySelector('input').focus({preventScroll:true}); } else if(focusDoors===true){ const f=document.getElementById('rpDoorsSet'); f.scrollIntoView({block:'start'}); const i=f.querySelector('input'); if(i) i.focus({preventScroll:true}); } else document.getElementById('rpClient').focus(); }
  document.addEventListener('click',e=>{ if(e.target.closest('[data-report]')) openR(UI.mod==='doors'?true:UI.mod==='net'?'net':false); });
  document.getElementById('reportClose').addEventListener('click',()=>closeD());
  RD.addEventListener('input',e=>{ if(!e.target.closest('#rpOpts')) readReportForm(); }); RD.addEventListener('change',e=>{ if(!e.target.closest('#rpOpts')) readReportForm(); });
  // ---------- report contents: every part of the report can be switched on or off ----------
  const SC_REVIEW=[['all','All criteria'],['noadv','Hide advisories'],['issues','Open items only']], SC_SURVEY=[['all','All items'],['checked','Verified items only'],['issues','Not-ready items only']];
  const RTREE=[
    {k:'f',l:'Front matter',kids:[{k:'f.cover',l:'Cover page'},{k:'f.details',l:'Project details'},{k:'f.overview',l:'Project overview'},{k:'f.roomsTable',l:'Conference rooms summary table'},{k:'f.doorsTable',l:'Doors summary table'},{k:'f.totals',l:'Project equipment totals'},{k:'f.contact',l:'Contact page'},
      {k:'f.placeholders',l:'Placeholders for blank fields',h:'Off: anything not filled in is left out instead of showing a yellow placeholder'}]},
    {k:'r',l:'Conference room sections',kids:[
      {k:'r.summary',l:'Room summary table'},
      {k:'r.design',l:'System design',kids:[
        {k:'r.review',l:'Design review',sel:['r.reviewScope',SC_REVIEW],kids:[{k:'r.impact',l:'Impact notes on open items'},{k:'r.openNote',l:'Open-items callout'}]},
        {k:'r.spec',l:'System specification'},
        {k:'r.height',l:'Mount height',kids:[{k:'r.hookImg',l:'Calculation diagram'},{k:'r.heights',l:'Heights table'}]},
        {k:'r.layout',l:'Wall layout',kids:[{k:'r.layoutTbl',l:'Position table'},{k:'r.verdicts',l:'Plate position notes'},{k:'r.wallImg',l:'Wall elevation drawing'}]}]},
      {k:'r.plan',l:'Room plan',kids:[{k:'r.metrics',l:'Room metrics'},{k:'r.drops',l:'Network drops and power'},{k:'r.topImg',l:'Plan view drawing'},{k:'r.sideImg',l:'Sightline drawing'},{k:'r.flowImg',l:'Signal flow drawing'}]},
      {k:'r.survey',l:'Site survey',sel:['r.svScope',SC_SURVEY],kids:[{k:'r.svBlock',l:'Blocking issues callout'},{k:'r.svCriteria',l:'Acceptance criteria'},{k:'r.svFix',l:'Corrective actions'}]},
      {k:'r.install',l:'Installation',kids:[{k:'r.status',l:'Progress status line'},{k:'r.steps',l:'Installation procedure',kids:[{k:'r.stepDetail',l:'Full step detail',h:'Off: a one-line status table'}]},{k:'r.tools',l:'Tools and materials'},
        {k:'r.equip',l:'Equipment list',kids:[{k:'r.alts',l:'Alternative products column'}]},{k:'r.cables',l:'Cable schedule'},{k:'r.calendar',l:'Accounts and calendar configuration'}]},
      {k:'r.accept',l:'Acceptance',kids:[{k:'r.acceptTbl',l:'Acceptance testing',kids:[{k:'r.acceptNotes',l:'Notes column'}]},{k:'r.signoff',l:'Sign-off page'}]}]},
    {k:'n',l:'Network sections',kids:[{k:'n.summary',l:'Network summary table'},{k:'n.completion',l:'Cabling completion summary',h:'Lines installed, labeled and tested, with the dates of the work'},
      {k:'n.review',l:'Design review',sel:['n.reviewScope',SC_REVIEW],kids:[{k:'n.impact',l:'Impact notes on open items'}]},{k:'n.budget',l:'Port and PoE budget'},{k:'n.rack',l:'Rack elevation'},{k:'n.equip',l:'Equipment list'},
      {k:'n.lines',l:'Line schedule',sel:['n.linesDetail',[['client','Label, location and result'],['full','Every step, with dates and initials']]]},{k:'n.qc',l:'Quality control'},{k:'n.cable',l:'Cable to order and box plan'},{k:'n.plans',l:'Floor plans with labels'}]},
    {k:'w',l:'Wi-Fi survey sections',kids:[{k:'w.details',l:'Survey details and at a glance'},{k:'w.req',l:'Coverage requirements'},{k:'w.routes',l:'Survey routes map'},{k:'w.signal',l:'Signal strength heatmaps'},{k:'w.secondary',l:'Secondary signal strength heatmaps'},{k:'w.throughput',l:'Throughput heatmaps'},{k:'w.aps',l:'Access point map and measured access points'}]},
    {k:'d',l:'Door sections',kids:[
      {k:'d.summary',l:'Door summary table'},
      {k:'d.design',l:'Design',kids:[{k:'d.review',l:'Design review',sel:['d.reviewScope',SC_REVIEW],kids:[{k:'d.impact',l:'Impact notes on open items'},{k:'d.openNote',l:'Open-items callout'}]},
        {k:'d.spec',l:'Electrical specification'},{k:'d.equip',l:'Equipment list',kids:[{k:'d.alts',l:'Alternative products column'}]}]},
      {k:'d.simulate',l:'Simulation results',kids:[{k:'d.scn',l:'Scenario table'},{k:'d.schematics',l:'Wiring schematics'},{k:'d.doorImg',l:'Door elevation drawing'}]},
      {k:'d.wiring',l:'Wiring schedule',kids:[{k:'d.wiringNotes',l:'Labeling and code notes'}]},
      {k:'d.survey',l:'Site survey',sel:['d.svScope',SC_SURVEY],kids:[{k:'d.svBlock',l:'Blocking issues callout'},{k:'d.svCriteria',l:'Acceptance criteria'},{k:'d.svFix',l:'Corrective actions'}]},
      {k:'d.install',l:'Installation',kids:[{k:'d.status',l:'Progress status line'},{k:'d.steps',l:'Installation procedure',kids:[{k:'d.stepDetail',l:'Full step detail',h:'Off: a one-line status table'}]},{k:'d.tools',l:'Tools and test equipment'}]},
      {k:'d.accept',l:'Acceptance',kids:[{k:'d.acceptTbl',l:'Acceptance testing',kids:[{k:'d.measured',l:'Measured readings column'}]},{k:'d.signoff',l:'Sign-off page'}]}]}];
  const PARENT={}, KEYS=[], SELS=[];
  (function walk(nodes,p){ nodes.forEach(n=>{ if(p) PARENT[n.k]=p; if(n.k.includes('.')) KEYS.push(n.k); if(n.sel){ SELS.push(n.sel[0]); PARENT[n.sel[0]]=n.k; } if(n.kids) walk(n.kids,n.k); }); })(RTREE,null);
  const OFF_IN={
    client:['f.placeholders','n.impact','n.review','n.budget','n.qc','n.cable','r.impact','r.openNote','r.hookImg','r.layout','r.svCriteria','r.stepDetail','r.tools','r.alts','r.cables','r.calendar','d.impact','d.openNote','d.alts','d.schematics','d.wiring','d.svCriteria','d.stepDetail','d.tools'],
    installer:['f.overview','f.contact'], full:[] };
  const SEL_IN={client:{'n.linesDetail':'client','n.reviewScope':'noadv','r.reviewScope':'noadv','d.reviewScope':'noadv','r.svScope':'all','d.svScope':'all'},installer:{'n.linesDetail':'full','n.reviewScope':'issues','r.reviewScope':'issues','d.reviewScope':'issues','r.svScope':'all','d.svScope':'all'},full:{'n.linesDetail':'full','n.reviewScope':'all','r.reviewScope':'all','d.reviewScope':'all','r.svScope':'all','d.svScope':'all'}};
  const PRESET_L=[['client','Client-facing','A clean deliverable for the client: results, drawings, equipment and sign-off, without internal procedures, tools, alternatives or placeholders.'],
    ['installer','Installer packet','Everything needed on site: open design items, full procedures, tools, wiring and cable schedules, calendar setup and acceptance forms.'],
    ['full','Everything','Every section and detail the toolkit can produce.'],['custom','Custom','Your own selection.']];
  const presetOpt=p=>{ const o={}; KEYS.forEach(k=>{ o[k]=!OFF_IN[p].includes(k); }); return Object.assign(o,SEL_IN[p]); };
  if(!RPT.opt){ RPT.opt=presetOpt('full'); RPT.preset='full';
    // carry over the earlier, coarser choices
    if(STORE.report){ const inc=RPT.inc||{}, ins=RPT.inst||{}, di=RPT.dinc||{};
      ['design','plan','survey'].forEach(k=>{ if(inc[k]===false) RPT.opt['r.'+k]=false; }); if(inc.install===false){ RPT.opt['r.install']=false; RPT.opt['r.accept']=false; }
      ['steps','stepDetail','tools','equip','cables','calendar'].forEach(k=>{ if(ins[k]===false) RPT.opt['r.'+k]=false; }); if(ins.accept===false) RPT.opt['r.acceptTbl']=false; if(ins.signoff===false) RPT.opt['r.signoff']=false;
      if(di.design===false) RPT.opt['d.design']=false; if(di.simulate===false) RPT.opt['d.simulate']=false; if(di.wiring===false) RPT.opt['d.wiring']=false; if(di.survey===false) RPT.opt['d.survey']=false; if(di.install===false) RPT.opt['d.install']=false; if(di.accept===false) RPT.opt['d.accept']=false;
      if(RPT.totals===false) RPT.opt['f.totals']=false;
      if(JSON.stringify(RPT.opt)!==JSON.stringify(presetOpt('full'))) RPT.preset='custom'; } }
  else { const base=presetOpt('full'); Object.keys(base).forEach(k=>{ if(!(k in RPT.opt)) RPT.opt[k]=base[k]; }); }
  function O(k){ let x=k; while(x){ if(RPT.opt[x]===false) return false; x=PARENT[x]; } return true; }
  const OS=k=>RPT.opt[k]||(k==='n.linesDetail'?'full':'all');
  const reviewFilter=(list,sc)=>list.filter(([t])=>sc==='all'||(sc==='noadv'&&t!=='info')||(sc==='issues'&&(t==='bad'||t==='warn')));
  const doorOpts=()=>{ const o={}; KEYS.filter(k=>k.startsWith('d.')).forEach(k=>{ o[k.slice(2)]=O(k); }); SELS.filter(k=>k.startsWith('d.')).forEach(k=>{ o[k.slice(2)]=OS(k); }); return o; };
  function matchPreset(){ const cur=JSON.stringify(Object.fromEntries([...KEYS,...SELS].map(k=>[k,RPT.opt[k]]))); return ['client','installer','full'].find(p=>JSON.stringify(Object.fromEntries([...KEYS,...SELS].map(k=>[k,presetOpt(p)[k]])))===cur)||'custom'; }
  function treeHtml(nodes){ return nodes.map(n=>{ const sel=n.sel?`<select class="rpsel" data-optsel="${n.sel[0]}" aria-label="${n.l}: show">${n.sel[1].map(([v,l])=>`<option value="${v}" ${OS(n.sel[0])===v?'selected':''}>${l}</option>`).join('')}</select>`:'';
      return `<div class="rpnode"><label class="check"><input type="checkbox" data-opt="${n.k}" ${RPT.opt[n.k]!==false?'checked':''}><span>${n.l}${n.h?`<span class="hint">${n.h}</span>`:''}</span></label>${sel}${n.kids?`<div class="subopts">${treeHtml(n.kids)}</div>`:''}</div>`; }).join(''); }
  function renderOpts(){ const box=document.getElementById('rpTree'); if(!box) return;
    const openG=[...box.querySelectorAll('details[open]')].map(d=>d.dataset.g);
    document.getElementById('rpPreset').innerHTML=PRESET_L.map(([v,l])=>`<button type="button" data-preset-r="${v}" aria-pressed="${RPT.preset===v}">${l}</button>`).join('');
    document.getElementById('rpPresetHint').textContent=(PRESET_L.find(p=>p[0]===RPT.preset)||PRESET_L[3])[2];
    box.innerHTML=RTREE.map(g=>{ const leaf=KEYS.filter(k=>k.startsWith(g.k+'.')), on=leaf.filter(O).length;
      return `<details class="rpgroup" data-g="${g.k}" ${openG.includes(g.k)?'open':''}><summary><span>${g.l}</span><span class="rpcount">${on} of ${leaf.length} on</span></summary><div class="rpgbody">${treeHtml(g.kids)}</div></details>`; }).join('');
    syncOpts(); }
  function rpSummary(){ const el=document.getElementById('rpSum'); if(!el) return; const dl=doorApi()?doorApi().list():[], nR=ROOMS.filter(r=>RPT.rooms[r.id]!==false).length, nD=dl.filter(d=>RPT.doors[d.id]!==false).length;
    const pl=(n,w)=>`${n} ${w}${n===1?'':'s'}`, who=[nR?pl(nR,'room'):'',nD?pl(nD,'door'):'',RPT.net!==false&&netApi()?'the network':''].filter(Boolean).join(', ').replace(/, ([^,]*)$/,' and $1');
    el.textContent=who?`${(PRESET_L.find(p=>p[0]===RPT.preset)||PRESET_L[3])[1]} contents, covering ${who}${RPT.client?' at '+RPT.client:''}.`:'Select at least one room or door.'; }
  function syncOpts(){ rpSummary(); const box=document.getElementById('rpTree'); if(!box) return;
    const dl=doorApi()?doorApi().list():[], nR=ROOMS.filter(r=>RPT.rooms[r.id]!==false).length, nD=dl.filter(d=>RPT.doors[d.id]!==false).length;
    box.querySelectorAll('[data-opt],[data-optsel]').forEach(el=>{ const k=el.dataset.opt||el.dataset.optsel; let p=PARENT[k], dis=false; while(p){ if(RPT.opt[p]===false) dis=true; p=PARENT[p]; }
      if(((k.startsWith('n.')||k.startsWith('w.'))&&!(RPT.net!==false&&netApi()))||(k.startsWith('r.')&&!nR)||(k.startsWith('d.')&&!nD)||(k==='f.roomsTable'&&!nR)||(k==='f.doorsTable'&&!nD)) dis=true;
      el.disabled=dis; const lab=el.closest('label'); if(lab) lab.classList.toggle('disabled',dis); });
    box.querySelectorAll('.rpgroup').forEach(g=>{ const leaf=KEYS.filter(k=>k.startsWith(g.dataset.g+'.')); g.querySelector('.rpcount').textContent=`${leaf.filter(O).length} of ${leaf.length} on`; }); }
  RD.addEventListener('click',e=>{ const b=e.target.closest('[data-preset-r]'); if(!b) return; const p=b.dataset.presetR; RPT.preset=p; if(p!=='custom') RPT.opt=presetOpt(p); renderOpts(); save(); });
  RD.addEventListener('change',e=>{ const t=e.target; if(t.dataset.opt){ RPT.opt[t.dataset.opt]=t.checked; } else if(t.dataset.optsel){ RPT.opt[t.dataset.optsel]=t.value; } else return;
    RPT.preset=matchPreset(); rpSummary(); document.querySelectorAll('[data-preset-r]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.presetR===RPT.preset)));
    document.getElementById('rpPresetHint').textContent=(PRESET_L.find(p=>p[0]===RPT.preset)||PRESET_L[3])[2]; syncOpts(); save(); });


  // SVG drawing -> PNG, with the light-theme colors baked in
  function svgVars(){ for(const sh of document.styleSheets){ let rules; try{ rules=sh.cssRules; }catch(e){ continue; }
      for(const r of rules){ if(r.selectorText===':root'&&r.style.getPropertyValue('--ink')){ let v=''; for(let i=0;i<r.style.length;i++){ const p=r.style[i]; if(p.startsWith('--')) v+=`${p}:${r.style.getPropertyValue(p)};`; } return v; } } }
    return ''; }
  function svgCss(){ let css=''; for(const sh of document.styleSheets){ let rules; try{ rules=sh.cssRules; }catch(e){ continue; }
      for(const r of rules){ if(r.type===1 && /^\.(w|case|flow|box|hubbox|t|term|screw|lever|dot|hot|okfill|badfill|warnfill|dv-lbl|dv-lead|dv-title)\b/.test(r.selectorText) && !/flow/.test(r.selectorText)) css+=r.cssText; } }
    return css; }
  function svgToPng(svg,scale=2){ return new Promise((res,rej)=>{
    const vb=(svg.match(/viewBox="([^"]+)"/)||[])[1]; if(!vb) return rej(new Error('no viewBox'));
    const [,,vw,vh]=vb.split(/\s+/).map(Number);
    const style=`<style>svg{${svgVars()}color:#17212A;font-family:"Barlow Condensed","Arial Narrow",Arial,sans-serif}${svgCss()}</style>`;
    let s=svg.replace(/<svg([^>]*)>/,(m,a)=>`<svg${a.replace(/\s(width|height)="[^"]*"/g,'')} xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}">${style}<rect x="${vb.split(/\s+/)[0]}" y="${vb.split(/\s+/)[1]}" width="${vw}" height="${vh}" fill="#FFFFFF"/>`);
    s=s.replace(/xmlns="http:\/\/www.w3.org\/2000\/svg"([^>]*)xmlns="http:\/\/www.w3.org\/2000\/svg"/,'xmlns="http://www.w3.org/2000/svg"$1');
    const img=new Image(); img.onload=()=>{ const cv=document.createElement('canvas'); cv.width=Math.round(vw*scale); cv.height=Math.round(vh*scale);
      const cx=cv.getContext('2d'); cx.fillStyle='#fff'; cx.fillRect(0,0,cv.width,cv.height); cx.drawImage(img,0,0,cv.width,cv.height);
      cv.toBlob(b=>{ if(!b) return rej(new Error('png')); b.arrayBuffer().then(buf=>res({buf,w:vw,h:vh})); },'image/png'); };
    img.onerror=()=>rej(new Error('svg')); img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s); }); }

  async function buildReport(){
    const X=await loadDocx();
    const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,ShadingType,BorderStyle,AlignmentType,HeadingLevel,Header,Footer,PageNumber,TabStopType,ImageRun,ExternalHyperlink,LevelFormat,VerticalAlign,HeightRule}=X;
    const NAVY='1F497D', BLUE='2E74B5', GREY='595959', LINE='BFBFBF', LABEL='F2F2F2', GROUP='DEEAF6', PH='FFF2CC';
    const ST={ok:['E3F1E8','2E7D4F'],warn:['FBF0DC','A86A10'],bad:['F9E2DF','BE3328'],info:['F2F2F2',GREY]};
    const W=9360;
    const dt=RPT.date?new Date(RPT.date+'T12:00:00'):new Date();
    const longDate=dt.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}), monthYear=dt.toLocaleDateString('en-US',{month:'long',year:'numeric'});
    const clean=t=>String(t==null?'':t).replace(/\s+/g,' ');

    // text helpers
    const R=(text,o={})=>new TextRun(Object.assign({text:clean(text)},o));
    const ph=(val,placeholder,o={})=>val?R(val,o):!O('f.placeholders')?null:R(placeholder,Object.assign({},o,{shading:{type:ShadingType.CLEAR,fill:PH,color:'auto'}}));
    function runsFrom(node,base={}){ const out=[]; node.childNodes.forEach(n=>{
        if(n.nodeType===3){ const t=n.textContent.replace(/\s+/g,' '); if(t) out.push(new TextRun(Object.assign({text:t},base))); }
        else if(n.nodeType===1){ const tg=n.tagName; if(tg==='BR'){ out.push(new TextRun({text:'',break:1})); return; } if(tg==='BUTTON'||tg==='INPUT'||tg==='SELECT') return;
          const o=Object.assign({},base); if(tg==='B'||tg==='STRONG') o.bold=true; if(n.classList.contains('pick')||n.classList.contains('expect')){ o.bold=true; o.color='2F7A4A'; }
          if(n.style&&n.style.color){ if(/bad/.test(n.style.color)) o.color=ST.bad[1]; else if(/warn/.test(n.style.color)) o.color=ST.warn[1]; }
          out.push(...runsFrom(n,o)); } });
      return out; }
    const htmlRuns=(html,base={})=>{ const d=document.createElement('div'); d.innerHTML=html; return runsFrom(d,base); };
    const Pg=(children,o={})=>new Paragraph(Object.assign({children:Array.isArray(children)?children:[typeof children==='string'?R(children):children],spacing:{after:120}},o));
    let OFF=0; const HL=[HeadingLevel.HEADING_1,HeadingLevel.HEADING_2,HeadingLevel.HEADING_3,HeadingLevel.HEADING_4];
    let SECSTART=false; const H1=(t,brk=true)=>{ const pb=brk&&!SECSTART; SECSTART=false; return new Paragraph({heading:HL[OFF],pageBreakBefore:pb,keepNext:true,children:[R(t)]}); };
    const H2=t=>new Paragraph({heading:HL[1+OFF],keepNext:true,children:[R(t)]});
    const H3=(children)=>new Paragraph({heading:HL[2+OFF],keepNext:true,children});
    let listN=0; const list=(items,kind='bullets')=>{ const inst=++listN; return items.map(it=>new Paragraph({numbering:{reference:kind,level:0,instance:inst},spacing:{after:60},children:typeof it==='string'?htmlRuns(it):it})); };

    // tables
    const bd=(col=LINE,sz=4)=>({style:BorderStyle.SINGLE,size:sz,color:col});
    const borders={top:bd(),bottom:bd(),left:bd(),right:bd()};
    const cell=(content,width,o={})=>new TableCell({width:{size:width,type:WidthType.DXA},borders:o.borders||borders,margins:o.margins||{top:80,bottom:80,left:120,right:120},
      shading:o.fill?{type:ShadingType.CLEAR,fill:o.fill,color:'auto'}:undefined,columnSpan:o.span,verticalAlign:o.vAlign,
      children:(Array.isArray(content)&&content[0] instanceof Paragraph)?content:[new Paragraph({spacing:{after:0},alignment:o.align,keepNext:o.keepNext,children:Array.isArray(content)?content:[typeof content==='string'||typeof content==='number'?R(content,{size:o.size||20,bold:o.bold,color:o.color}):content]})]});
    const tbl=(widths,rows,o={})=>new Table({width:{size:widths.reduce((a,b)=>a+b,0),type:WidthType.DXA},columnWidths:widths,rows,alignment:o.align});
    const headRow=(heads,widths)=>new TableRow({tableHeader:true,cantSplit:true,children:heads.map((h,i)=>cell(R(h,{bold:true,color:'FFFFFF',size:22}),widths[i],{fill:NAVY}))});
    const groupRow=(children,total,span)=>new TableRow({cantSplit:true,children:[cell(Array.isArray(children)?children:[R(children,{bold:true,color:NAVY})],total,{fill:GROUP,span,keepNext:true})]});
    const kv=(rows,w1=3000)=>tbl([w1,W-w1],rows.filter(([,v])=>!(Array.isArray(v)&&v.every(x=>x==null))).map(([k,v])=>new TableRow({cantSplit:true,children:[cell(R(k,{bold:true,size:20,color:'000000'}),w1,{fill:LABEL}),cell(Array.isArray(v)?v:(v instanceof TextRun?[v]:R(v,{size:20})),W-w1)]})));
    const grid=(heads,widths,rows)=>tbl(widths,[headRow(heads,widths),...rows.filter(r=>r.group||!r.some(v=>Array.isArray(v)&&v.length&&v.every(x=>x==null))).map(r=>r.group?groupRow(r.group,W,widths.length):new TableRow({cantSplit:true,children:r.map((v,i)=>{
      if(v&&v.cell) return cell(v.runs||R(v.text,{size:20,bold:v.bold,color:v.color}),widths[i],{fill:v.fill});
      return cell(Array.isArray(v)?v:R(v,{size:20,bold:i===0&&heads[0]!=='Result'}),widths[i]); })}))]);
    const status=(t,label)=>({cell:true,text:label,bold:true,color:ST[t][1],fill:ST[t][0]});
    const note=(runs,label='Note:')=>tbl([W],[new TableRow({cantSplit:true,children:[cell([R('⚠️  '+label+' ',{bold:true,color:'7B5B00'}),...(Array.isArray(runs)?runs:[R(runs,{color:'7B5B00'})])],W,
      {fill:'FFF8E1',margins:{top:100,bottom:100,left:160,right:160},borders:{top:bd('C9A227'),left:bd('C9A227',12),bottom:bd(),right:bd()}})]})]);
    const gap=(a=200)=>new Paragraph({spacing:{after:a},children:[]});
    async function image(svg,caption,maxH=700){ try{ const im=await svgToPng(svg); let w=624,h=im.h*w/im.w; if(h>maxH){ h=maxH; w=im.w*h/im.h; }
        const out=[new Paragraph({alignment:AlignmentType.CENTER,keepNext:!!caption,spacing:{after:caption?60:160},children:[new ImageRun({type:'png',data:im.buf,transformation:{width:Math.round(w),height:Math.round(h)}})]})];
        if(caption) out.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},children:[R(caption,{size:18,color:GREY,italics:true})]}));
        return out; }catch(e){ return [Pg(R('[Drawing could not be rendered]',{color:GREY,italics:true}))]; } }
    const domRows=sel=>[...document.querySelectorAll(sel+' tbody tr')].map(tr=>[...tr.children].map(td=>runsFrom(td,{size:20})));

    const CKN={'Mic coverage':'Microphone coverage','Mic pods':'Microphone count','Video bar size':'Video bar capacity','Lifting':'Safe handling','Network':'Network requirements','Scheduler app':'Scheduling panel app','Hook distance not measured':'Hook distance not field-verified','Bottom bezel standard':'Display height standard','Display height':'Display height above table','Studs out of reach':'Stud engagement','Recess box':'Recessed box location','Toggles blocked by studs':'Toggle anchor placement','Wall width':'Wall width','Display width':'Display overall width','Calendar and platform':'Calendar integration','Content sharing':'Content sharing','Full-motion mount':'Full-motion mount leverage','Carts and tipping':'Cart stability'};
    // ---- per-room numbers used by the summaries
    function roomStats(){ const c=calc(), ic=issueCount();
      const accRes=Object.entries(results).filter(([k,v])=>!k.endsWith('_n')&&v), aPass=accRes.filter(([,v])=>v==='Pass').length, aFail=accRes.filter(([,v])=>v==='Fail').length;
      const allSteps=steps(), nDone=allSteps.filter(x=>done[x.t]).length, svAll=surveyItems().flatMap(([,i])=>i), svNo=svAll.filter(i=>survey[i.id]==='no').length, svChk=svAll.filter(i=>survey[i.id]).length;
      const design=ic.bad+ic.warn?[ic.bad?'bad':'warn',`${ic.bad+ic.warn} open item${ic.bad+ic.warn>1?'s':''} (${ic.bad} failed, ${ic.warn} warning${ic.warn===1?'':'s'})`]:['ok','All criteria pass'];
      const site=svNo?['bad',`Not ready: ${svNo} blocking issue${svNo>1?'s':''}`]:svChk===svAll.length?['ok','Ready for installation']:['warn',`Survey in progress: ${svChk} of ${svAll.length} items verified`];
      const inst=`${nDone} of ${allSteps.length} steps complete; acceptance testing ${accRes.length?`${aPass} passed, ${aFail} failed`:'not yet started'}`;
      const short={design:ic.bad+ic.warn?`${ic.bad+ic.warn} open item${ic.bad+ic.warn>1?'s':''}`:'All pass',site:svNo?`Not ready (${svNo} blocking)`:svChk===svAll.length?'Ready':`In progress (${svChk}/${svAll.length})`,
        inst:`${nDone}/${allSteps.length} steps; ${accRes.length?`tests ${aPass} pass, ${aFail} fail`:'tests not started'}`};
      return {c,ic,accRes,aPass,aFail,allSteps,nDone,svAll,svNo,svChk,design,site,inst,short}; }
    const curRoom=()=>ROOMS.find(x=>x.id===ACTIVE)||{};
    const summaryTable=S=>{ const {c}=S, rr=curRoom(); return grid(['Item','Detail'],[3000,6360],[
      ['Room Address',[rr.site?R(rr.site,{size:20}):RPT.site?R(RPT.site,{size:20}):ph('','[Room address]',{size:20})]],['Installation Date',[rr.installDate?R(longDay(rr.installDate),{size:20}):ph('','[Installation date]',{size:20})]],
      ['Meeting Platform',c.P.name],['Video Conferencing Device',c.B.name],['Displays',`${cfg.dispCount} × ${cfg.size} in diagonal, about ${fmt(cfg.dispLb)} lb each`],['Display Mounting',c.M.cart?c.M.name:`${c.MD.name} on ${c.M.short}`],['Seating Capacity',`${cfg.seats} (farthest viewer at ${fmt(cfg.far)} ft)`],
      ['Design Review',[R(S.design[1],{size:20,bold:true,color:ST[S.design[0]][1]})]],['Site Readiness',[R(S.site[1],{size:20,bold:true,color:ST[S.site[0]][1]})]],['Installation',S.inst]]); };
    // one line per product, for the project-wide equipment totals
    function equipItems(){ const c=calc(), P=c.P, B=c.B, M=c.M, out=[]; const add=(cat,name,qty)=>{ if(qty>0) out.push([cat,name,qty]); };
      add('Licenses',`${P.app} room license`,1); add('Video conferencing device',B.name,1);
      add('Touch controller',P.mac?'Apple iPad (Zoom Rooms Controller)':P.appliance?(cfg.tapGen==='2'?'Logitech Tap IP 2':'Logitech Tap IP'):'Logitech Tap with Cat5e kit',1);
      if(!P.appliance) add('Room PC (compute)',P.compute,1);
      add('Displays',`${cfg.size}-inch commercial display`,cfg.dispCount);
      if(M.cart){ add('Display mounting',M.name,1); if(cfg.mount==='cart'&&!cartVesa().direct&&cartVesa().kit) add('Display mounting','Heckler H497 VESA Adapter Kit',1); }
      else add('Display mounting',c.MD.name,cfg.dispCount);
      if(cfg.pods) add('Microphones',B.podName,cfg.pods);
      if(cfg.sight) add('Cameras','Logitech Sight',1);
      if(cfg.scheduler) add('Room scheduling panels',cfg.schedGen==='2'?'Logitech Tap Scheduler 2':'Logitech Tap Scheduler',1);
      if(cfg.wireless) add('Wireless presentation','Wireless presentation system',1);
      ACC.filter(a=>accOn(a.id)).forEach(a=>add('Logitech accessories',a.name,1));
      return out; }

    // ---- room content (System Design, Room Plan, Survey, Install) for whichever room is loaded
    async function roomBody(body){
      const S=roomStats(), {c,ic,accRes,aPass,aFail,allSteps,nDone,svAll,svNo,svChk}=S, P=c.P, B=c.B, M=c.M, D=c.D;
      // ---- Design
      if(O('r.design')&&['r.review','r.spec','r.height','r.layout'].some(O)){
        body.push(H1('System Design'));
        body.push(Pg('The system as specified for this room, reviewed against the design criteria in the Conference Room AV Guide.'));
        if(O('r.review')){ body.push(H2('Design Review'));
        const order={bad:0,warn:1,info:2,ok:3}, lbl={ok:'Pass',warn:'Warning',bad:'Fail',info:'Advisory'}, rs=reviewFilter(checks(),OS('r.reviewScope'));
        if(rs.length) body.push(grid(['Status','Criterion','Finding'],[1300,2300,5760],rs.sort((a,b)=>order[a[0]]-order[b[0]]).map(([t,b,m])=>[status(t,lbl[t]),[R(CKN[b]||b,{size:20,bold:true})],[R(m,{size:20}),...(O('r.impact')&&WHY[b]&&(t==='bad'||t==='warn')?[R('',{break:1}),R('Impact: '+WHY[b],{size:18,color:GREY})]:[])]])));
        else body.push(Pg('No open items. The design meets every criterion the guide reviews.'));
        if(O('r.openNote')&&ic.bad+ic.warn) { body.push(gap(120)); body.push(note([R(`${ic.bad+ic.warn} open item${ic.bad+ic.warn>1?'s':''} should be resolved before equipment is ordered or installation is scheduled.`,{color:'7B5B00'})])); } }
        if(O('r.spec')){ body.push(H2('System Specification'));
        const MDs=c.MD, rows=[];
        const g=(n,items)=>{ rows.push({group:n}); items.filter(Boolean).forEach(r=>rows.push(r)); };
        g('Room and viewing',[['Seating capacity',`${cfg.seats} people`],['Viewing distance',`Closest viewer ${fmt(cfg.near,1)} ft, farthest viewer ${fmt(cfg.far,1)} ft`],['Ceiling height',`${fmt(cfg.ceil)} in AFF`],['Viewing task',cfg.content==='detailed'?'Analytical decision making (spreadsheets, detailed content)':'Basic decision making (video, presentations)']]);
        g('Collaboration platform',[['Meeting platform',P.name],['Calendar system',cfg.calendar==='google'?'Google Workspace':'Microsoft 365'],['Video conferencing device',B.name],cfg.sight?['Tabletop camera','Logitech Sight']:null,
          ['Touch controller',P.mac?'iPad with Zoom Rooms Controller':P.appliance?(cfg.tapGen==='2'?'Logitech Tap IP 2':'Logitech Tap IP'):'Logitech Tap with Cat5e kit'],!P.appliance?['Room PC (compute)',P.compute]:null]);
        g('Displays and camera',[['Displays',`${cfg.dispCount} × ${cfg.size} in diagonal, ${fmt(cfg.dispLb)} lb each, VESA ${D.vesa} (typical)`],['Video bar position',`${cfg.barPos==='above'?'Above':'Below'} the display${(cfg.bar==='mini'||cfg.bar==='bar')?`, on the ${cfg.barMount==='wall'?'wall mount':'TV mount'} for video bars`:''}`],
          ['Bottom of display',`${fmt(c.bottom,2)} in AFF (standard ${fmt(cfg.standardH)} ± ${fmt(cfg.tolerance)} in)`],['Camera height (lens)',`${fmt(c.camH,1)} in AFF (seated eye height ${fmt(cfg.eyeH)} in AFF)`]]);
        g('Furniture',[['Table height',`${fmt(cfg.tableH,1)} in AFF`],cfg.credenza?['Credenza',`${fmt(cfg.credH,1)} in AFF, ${fmt(cfg.credGap,1)} in clearance above`]:null]);
        g('Mounting',[['Wall construction',M.name+(cfg.mount==='metal'?(cfg.backing?', with backing':', no backing'):'')+(cfg.mount==='cmu'?(cfg.cmuGrouted?', grouted cells':', hollow cells'):'')],!M.cart?['Display mount',`${MDs.name}${MDs.cap?`, rated ${MDs.cap} lb`:''}`]:null,!M.cart?['Anchors and fasteners',AK()?ANCH[AK()].name:'Mount manufacturer’s hardware']:null,['Design load',`About ${fmt(c.load)} lb`]]);
        g('Audio, control and scheduling',[['Table microphones',`${cfg.pods} × ${B.podName} (about ${c.recPods} recommended)`],['Room scheduling panel',cfg.scheduler?`${cfg.schedGen==='2'?'Tap Scheduler 2':'Tap Scheduler'}, ${SCHED_MOUNTS[cfg.schedMount].toLowerCase()}`:'None'],['Content sharing',[cfg.hdmiIngest?'Wired HDMI':'',cfg.wireless?'wireless share base':''].filter(Boolean).join(' and ')||'None'],
          ['Accessories',ACC.filter(a=>accOn(a.id)).map(a=>a.name).join(', ')||'None']]);
        g('Signal cabling',[['HDMI (source to display)',`${fmt(cfg.hdmiLen)} ft, ${cfg.hdmiType==='active'?'active HDMI or AOC':'passive'}`],!P.appliance?['USB (video bar to room PC)',`${fmt(cfg.usbLen)} ft, ${cfg.usbType==='active'?'active extension':'passive'}`]:null]);
        body.push(grid(['Parameter','Specification'],[3000,6360],rows)); }
        const ft=v=>{ const f=Math.floor(v/12); return `${f}′-${fmt(v-f*12,2)}″`; };
        if(O('r.height')){ body.push(H2('Mount Height'));
        if(M.cart) body.push(kv([['Bottom of display on the cart',[R(`${fmt(c.bottom,2)} in AFF`,{bold:true,size:24,color:ST.ok[1]})]]]));
        else { body.push(kv([['Top of wall plate (layout mark)',[R(`${fmt(c.plateTop,2)} in AFF`,{bold:true,size:24,color:c.hookMeasured?ST.ok[1]:ST.warn[1]}),R(`  (${ft(c.plateTop)})`,{size:20,color:GREY})]],
            ['Calculation',`${fmt(c.bottom,2)} in bottom of display + ${fmt(c.hookUsed,2)} in hook distance${Math.abs(cfg.hookOffset)>0.01?` ${cfg.hookOffset>0?'+':'−'} ${fmt(Math.abs(cfg.hookOffset),2)} in mount offset`:''} = ${fmt(c.plateTop,2)} in`],
            ['Hook distance',[R(`${fmt(c.hookUsed,2)} in, bottom of display to top of bracket hooks`,{size:20}),R(c.hookMeasured?'  (measured)':'  (estimated: field-verify before drilling)',{size:20,bold:true,color:c.hookMeasured?ST.ok[1]:ST.warn[1]})]]]));
          if(O('r.hookImg')){ body.push(gap(160)); body.push(...await image(hookDiagram(c),'Mount height calculation',360)); } }
        const hr=[['Top of display',c.top]]; if(cfg.barPos==='above') hr.push(['Top of '+B.short,c.barTop]); hr.push([B.short+' camera (lens)',c.camH],['Display center',c.center]);
        if(!M.cart) hr.push(['Top of wall plate (layout mark)',c.plateTop],['Bottom of wall plate',c.plateBot]); hr.push(['Bottom of display',c.bottom]); if(cfg.barPos==='below') hr.push(['Bottom of '+B.short,c.barBot]);
        if(cfg.credenza&&!M.cart) hr.push(['Top of credenza',cfg.credH]); hr.push(['Seated eye height',cfg.eyeH],['Table surface',cfg.tableH]); hr.sort((a,b)=>b[1]-a[1]);
        if(O('r.heights')) body.push(grid(['Reference point','Height AFF','Feet-inches'],[4360,2500,2500],hr.map(([a,v])=>[a,[R(`${fmt(v,2)} in`,{size:20,bold:true})],ft(v)]))); }
        if(!M.cart&&O('r.layout')&&['r.layoutTbl','r.verdicts','r.wallImg'].some(O)){
          body.push(H2('Wall Layout'));
          body.push(Pg(`Horizontal dimensions are measured from the left inside corner of the display wall. The wall centerline is at ${fmt(layout().C,2)} in.`,{keepNext:true}));
          if(O('r.layoutTbl')) body.push(grid(['Item','Position from left corner','Note'],[2200,3900,3260],domRows('#layoutOut table')));
          const vs=O('r.verdicts')?[...document.querySelectorAll('#slideOut .verdict')]:[];
          if(vs.length){ body.push(gap(120)); vs.forEach(v=>{ const t=v.classList.contains('bad')?'bad':v.classList.contains('warn')?'warn':'ok'; const [h,...sp]=v.children;
            body.push(tbl([W],[new TableRow({cantSplit:true,children:[cell([new Paragraph({spacing:{after:60},children:[R(h.textContent,{bold:true,color:ST[t][1]})]}),...sp.map(s=>new Paragraph({spacing:{after:0},children:runsFrom(s,{size:20})}))],W,{fill:ST[t][0],borders:{top:bd(LINE),bottom:bd(LINE),right:bd(LINE),left:bd(ST[t][1],12)}})]})])); body.push(gap(80)); }); }
          if(O('r.wallImg')){ body.push(H3([R('Display wall elevation (to scale)')]));
          body.push(...await image(wallView(),'Front elevation of the display wall showing the wall plate, anchor locations, recessed box and heights AFF')); }
        }
      }
  
      // ---- Plan
      if(O('r.plan')&&['r.metrics','r.drops','r.topImg','r.sideImg','r.flowImg'].some(O)){
        body.push(H1('Room Plan'));
        body.push(Pg('Viewing, camera and microphone coverage, signal flow, and the network and power requirements for the room.'));
        if(O('r.metrics')){ body.push(H2('Room Metrics'));
        body.push(kv([...document.querySelectorAll('#numbers dl.kv dt')].map(dt=>[dt.textContent,dt.nextElementSibling.textContent]))); }
        if(O('r.drops')){ body.push(H2('Network Drops'));
        body.push(grid(['Device','Connection','PoE'],[4360,3200,1800],c.drops.map(d=>[d[0],d[1],d[2]?'Yes':'No'])));
        body.push(Pg(R(`Plan for about ${c.outlets} power receptacles behind the display, on a circuit not shared with heavy loads.`,{size:20,color:GREY}),{spacing:{before:80,after:120}})); }
        if(O('r.topImg')){ body.push(H2('Room Layout (Plan View)'));
        body.push(...await image(topView(),'Plan view. The shaded area approximates the camera’s horizontal field of view; seats outside it are shown in red.',560)); }
        if(O('r.sideImg')){ body.push(H2('Sightlines (Side Elevation)'));
        body.push(...await image(sideView(),'Side elevation showing sightlines from the closest and farthest viewers, and camera height relative to seated eye height.',360)); }
        if(O('r.flowImg')){ body.push(H2('Signal Flow'));
        body.push(...await image(flowView(),null,520));
        const lg=[['HDMI','7A4CC2'],['USB','2C6FB7'],['Ethernet','2D8A3E'],['Ethernet (PoE)','C97B12'],['Logitech device cable','566370']];
        body.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},children:lg.flatMap(([l,col],i)=>[R('■ ',{color:col,size:20}),R(l+(i<lg.length-1?'      ':''),{size:18,color:GREY})])})); }
      }
  
      // ---- Survey
      if(O('r.survey')){
        body.push(H1('Pre-Installation Site Survey'));
        const counts={ok:0,no:0,na:0}; svAll.forEach(i=>{ if(survey[i.id]) counts[survey[i.id]]++; });
        const st=svNo?['bad','Not ready']:svChk===svAll.length?['ok','Ready for installation']:['warn','Survey in progress'];
        body.push(Pg([R('Site readiness: ',{bold:true}),R(st[1],{bold:true,color:ST[st[0]][1]}),R(`. ${svChk} of ${svAll.length} items verified: ${counts.ok} ready, ${counts.no} not ready, ${counts.na} not applicable.`)]));
        const blockers=svAll.filter(i=>survey[i.id]==='no');
        if(O('r.svBlock')&&blockers.length){ body.push(note(blockers.flatMap((b,k)=>[...(k?[R('',{break:1})]:[]),R(b.q+': ',{bold:true,color:'7B5B00'}),R(b.fix+(survey[b.id+'_n']?` Found on site: ${survey[b.id+'_n']}`:''),{color:'7B5B00'})]),'Blocking issues:')); body.push(gap(120)); }
        const rows=[]; const rl={ok:['ok','Ready'],no:['bad','Not ready'],na:['info','N/A']};
        const svs=OS('r.svScope'), keepSv=i=>svs==='all'||(svs==='checked'&&survey[i.id])||(svs==='issues'&&survey[i.id]==='no'), crit=O('r.svCriteria'), fx=O('r.svFix');
        surveyItems().forEach(([n,items0])=>{ const items=items0.filter(keepSv); if(!items.length) return; rows.push({group:n}); items.forEach(i=>{ const v=survey[i.id];
          const det=[...(crit?[R('Criteria: ',{size:18,bold:true}),R(i.pass,{size:18})]:[]),...(fx&&v==='no'?[...(crit?[R('',{break:1})]:[]),R('Corrective action: ',{size:18,bold:true,color:ST.bad[1]}),R(i.fix,{size:18,color:ST.bad[1]})]:[])];
          rows.push([[R(i.q,{size:20,bold:true})], v?status(...rl[v]):{cell:true,text:'Not verified',color:GREY},...(crit||fx?[det.length?det:'']:[])]); }); });
        if(rows.length) body.push(crit||fx?grid(['Item','Status',crit?'Acceptance criteria':'Corrective action'],[2700,1400,5260],rows):grid(['Item','Status'],[6360,3000],rows));
        else body.push(Pg(svs==='issues'?'No items are marked not ready.':'No items have been verified yet.'));
      }
  
      // ---- Install (each part can be switched on or off in the report panel)
      const instOn=O('r.install')&&['r.status','r.steps','r.tools','r.equip','r.cables','r.calendar'].some(O), accOn2=O('r.accept')&&['r.acceptTbl','r.signoff'].some(O);
      if(instOn||accOn2){
        const IN=new Proxy({},{get:(t,k)=>O(['accept','signoff'].includes(k)?(k==='accept'?'r.acceptTbl':'r.signoff'):'r.'+k)&&(['accept','signoff'].includes(k)?accOn2:instOn)});
        const STEP_T={'Pre-stage and confirm the design':'Pre-stage equipment and confirm the design','Mark the layout':'Lay out the display wall','Assemble the cart':'Assemble the cart','Install the wall mount':'Install the wall mount','Hang the display':'Hang the display',
          'Mount the video bar and table devices':'Mount the video bar and table devices','Run and connect the cables':'Install and connect cabling','Power up and enroll':'Power up, enroll and provision','Tune and test':'Commission and test','Clean up and hand off':'Clean up and hand over'};
        body.push(H1(instOn?'Installation, Commissioning and Acceptance':'Acceptance'));
        if(IN.status) body.push(Pg([R('Status: ',{bold:true}),R(`${nDone} of ${allSteps.length} installation steps complete. Acceptance testing: ${aPass} passed, ${aFail} failed, ${acceptTests().length-accRes.length} not yet run.`)]));
        if(IN.steps){
          body.push(H2('Installation Procedure'));
          if(IN.stepDetail){
            allSteps.forEach((x,i)=>{ body.push(H3([R(`${i+1}. ${STEP_T[x.t]||x.t}  `),R(done[x.t]?'Complete':'Open',{size:20,bold:true,color:done[x.t]?ST.ok[1]:GREY})]));
              body.push(Pg(R('Procedure',{bold:true,size:20,color:GREY}),{spacing:{after:40},keepNext:true})); body.push(...list(x.d));
              body.push(Pg(R('Verification',{bold:true,size:20,color:GREY}),{spacing:{before:80,after:40},keepNext:true})); body.push(...list(x.v));
              if(x.tools.length) body.push(Pg([R('Tools and materials: ',{bold:true,size:20,color:GREY}),R(x.tools.join(', '),{size:20})],{spacing:{before:80,after:160}})); });
          } else {
            body.push(grid(['Step','Task','Status'],[900,6860,1600],allSteps.map((x,i)=>[[R(String(i+1),{size:20,bold:true})],[R(STEP_T[x.t]||x.t,{size:20})],done[x.t]?status('ok','Complete'):{cell:true,text:'Open',color:GREY}])));
          }
        }
        if(IN.tools){ body.push(H2('Tools and Materials'));
          body.push(grid(['Item','Purpose'],[3400,5960],tools().map(([a,b])=>[[R(a,{size:20,bold:true})],b.replace(/\.$/,'').replace(/^./,m=>m.toUpperCase())]))); }
        if(IN.equip){ body.push(H2('Equipment List'));
          if(O('r.alts')) body.push(Pg(R('The product specified for this room is shown in bold green; the others are equivalent alternatives. Confirm each device is certified for the meeting platform before substituting.',{size:20,color:GREY})));
          body.push(O('r.alts')?grid(['Category','Specified','Requirements','Alternatives'],[1500,2300,2560,3000],domRows('#equip')):grid(['Category','Specified','Requirements'],[2200,3400,3760],domRows('#equip').map(r=>r.slice(0,3)))); }
        if(IN.cables){ body.push(H2('Cable Schedule'));
          body.push(grid(['Source','Destination','Cable type and length','Notes'],[2300,2300,2560,2200],cables().map(r=>r.map(clean))));
          body.push(Pg(R('Label both ends of every cable with the source and destination device and port, following ANSI/TIA-606 labeling practice. Leave a service loop behind the display.',{size:20,color:GREY}),{spacing:{before:80,after:120}})); }
        if(IN.calendar){ body.push(H2('Accounts and Calendar Configuration'));
          document.querySelectorAll('#calendarGuide .svgroup').forEach(gp=>{ body.push(H3([R(gp.querySelector('h3').textContent.replace(/^Check before you leave$/,'Verification before handover'))]));
            body.push(...list([...gp.querySelectorAll('li')].map(li=>runsFrom(li)),'numbers'));
            const h=gp.querySelector('.hint'); if(h) body.push(Pg(R(h.textContent,{size:20,color:GREY,italics:true}),{spacing:{before:60,after:120}})); }); }
        if(IN.accept){ body.push(H2('Acceptance Testing'));
          body.push(Pg('Each test is performed on site with the client representative present. Record the result and any exceptions.'));
          const rs={Pass:['ok','Pass'],Fail:['bad','Fail']};
          const nt=O('r.acceptNotes'); body.push(grid(['Test','Expected result','Result',...(nt?['Notes']:[])],nt?[2200,3560,1200,2400]:[2600,5160,1600],acceptTests().map(([k,a,b])=>[[R(a,{size:20,bold:true})],b,results[k]?status(...rs[results[k]]):{cell:true,text:'Not run',color:GREY},...(nt?[results[k+'_n']||'']:[])]))); }
        if(IN.signoff){ body.push(new Paragraph({heading:HL[1+OFF],pageBreakBefore:true,keepNext:true,children:[R('Acceptance Sign-off')]}));
          body.push(Pg('By signing below, the parties confirm that the acceptance tests were performed on site and that the system is accepted as installed, subject to the punch-list items noted.'));
          const sig=(k,h=560)=>new TableRow({cantSplit:true,height:{value:h,rule:HeightRule.ATLEAST},children:[cell(R(k,{bold:true,size:20,color:'000000'}),3000,{fill:LABEL,vAlign:VerticalAlign.CENTER}),cell('',6360)]});
          body.push(tbl([3000,6360],[sig('Punch-list items',1100),sig('Client representative (name, title)'),sig('Signature'),sig('Date'),sig('Installer (name, title)'),sig('Signature'),sig('Date')])); }
      }
  
    }


    // ---- door content arrives as plain blocks from the door simulator; render them in this report's style
    const CMAP={ok:ST.ok[1],bad:ST.bad[1],warn:ST.warn[1],grey:GREY,green:'2F7A4A'};
    const bRuns=(runs,base={})=>(runs||[]).map(r=>r.br?new TextRun({text:'',break:1}):R(r.text,Object.assign({size:r.sz||base.size,bold:r.b||base.bold,color:CMAP[r.c]||base.color,italics:r.i})));
    const bCell=v=>v&&v.status?status(v.status,v.text):(v&&v.runs?bRuns(v.runs,{size:20}):String(v==null?'':v));
    const signoff=()=>{ const sig=(k,h=560)=>new TableRow({cantSplit:true,height:{value:h,rule:HeightRule.ATLEAST},children:[cell(R(k,{bold:true,size:20,color:'000000'}),3000,{fill:LABEL,vAlign:VerticalAlign.CENTER}),cell('',6360)]});
      return [new Paragraph({heading:HL[1+OFF],pageBreakBefore:true,keepNext:true,children:[R('Acceptance Sign-off')]}),
        Pg('By signing below, the parties confirm that the acceptance tests were performed on site and that the system is accepted as installed, subject to the punch-list items noted.'),
        tbl([3000,6360],[sig('Punch-list items',1100),sig('Client representative (name, title)'),sig('Signature'),sig('Date'),sig('Installer (name, title)'),sig('Signature'),sig('Date')])]; };
    async function renderBlocks(blocks,body){ let firstH=true;
      for(const b of blocks){
        if(b.t==='h'){ const lvl=b.lvl-1+OFF, brk=(b.lvl===2&&!firstH&&!b.nobrk)||!!b.brk; firstH=false; body.push(new Paragraph({heading:HL[Math.min(3,lvl)],keepNext:true,pageBreakBefore:brk,children:b.runs?bRuns(b.runs):[R(b.text)]})); }
        else if(b.t==='p') body.push(new Paragraph({spacing:{after:120},keepNext:!!b.keep,children:bRuns(b.runs)}));
        else if(b.t==='kv') body.push(kv(b.rows.map(([k,v])=>[k,typeof v==='string'?v:v&&v.ph?[ph('',v.ph,{size:20})]:bRuns(v,{size:20})])));
        else if(b.t==='table') body.push(grid(b.heads,b.widths,b.rows.map(r=>r.group?r:r.map(bCell))));
        else if(b.t==='note'){ body.push(gap(80)); body.push(note(b.runs?bRuns(b.runs,{color:'7B5B00'}):[R(b.text,{color:'7B5B00'})],b.label||'Note:')); body.push(gap(120)); }
        else if(b.t==='list') body.push(...list(b.items.map(it=>bRuns(it))));
        else if(b.t==='img') body.push(...await image(b.svg,b.caption,b.maxH||640));
        else if(b.t==='png'){ try{ const bin=atob(b.data), u8=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u8[i]=bin.charCodeAt(i);
            const dv=new DataView(u8.buffer), iw=dv.getUint32(16), ih=dv.getUint32(20), mw=Math.min(624,b.maxW||624,iw), mh=b.maxH||760; let w=mw, h=ih*w/iw; if(h>mh){ h=mh; w=iw*h/ih; }
            body.push(new Paragraph({alignment:AlignmentType.CENTER,keepNext:!!b.caption,spacing:{after:60},children:[new ImageRun({type:'png',data:u8,transformation:{width:Math.round(w),height:Math.round(h)}})]}));
            if(b.caption) body.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},children:[R(b.caption,{size:18,color:GREY,italics:true})]})); }catch(e){ body.push(Pg(R('[Floor plan could not be added]',{color:GREY,italics:true}))); } }
        else if(b.t==='phbox'){ if(O('f.placeholders')) body.push(tbl([b.small?5000:W],[new TableRow({cantSplit:true,height:{value:b.small?600:4200,rule:HeightRule.ATLEAST},children:[cell([R(b.text,{size:b.small?16:20,color:'8EAADB'})],b.small?5000:W,{fill:'F4F7FB',align:AlignmentType.CENTER,vAlign:VerticalAlign.CENTER,borders:{top:{style:BorderStyle.DASHED,size:6,color:'8EAADB'},bottom:{style:BorderStyle.DASHED,size:6,color:'8EAADB'},left:{style:BorderStyle.DASHED,size:6,color:'8EAADB'},right:{style:BorderStyle.DASHED,size:6,color:'8EAADB'}}})]})],{align:AlignmentType.CENTER})), body.push(gap(120)); }
        else if(b.t==='signoff') body.push(...signoff()); } }

    // ---- assemble: project pages, then one section per room and per door, then contact
    const ids=ROOMS.filter(r=>RPT.rooms[r.id]!==false).map(r=>r.id), startId=ACTIVE;
    const DAPI=doorApi(), doorList=DAPI?DAPI.list():[], doorIds=doorList.filter(d=>RPT.doors[d.id]!==false).map(d=>d.id);
    const NAPI=netApi(), NKEYS=['n.summary','n.completion','n.review','n.budget','n.rack','n.equip','n.lines','n.qc','n.cable','n.plans'], WKEYS=['w.details','w.req','w.routes','w.signal','w.secondary','w.throughput','w.aps'];
    const incNetCore=RPT.net!==false&&!!NAPI&&NKEYS.some(O), incWifi=RPT.net!==false&&!!NAPI&&WKEYS.some(O), incNet=incNetCore||incWifi;
    const nR=ids.length, nD=doorIds.length, multi=nR+nD+(incNetCore?1:0)+(incWifi?1:0)>1, soloRoom=nR===1&&nD===0&&!incNet;
    const by=RPT.by||'Network Right Professional Services', mail=RPT.email||'professionalservices@networkright.com';
    const parts=[nR?'AV':'',nD?'Access Control':'',incNetCore?'Network':'',incWifi?'Wi-Fi Survey':''].filter(Boolean);
    const title=parts.length===1?(nR?'Conference Room AV Report':nD?'Access Control Report':incNetCore?'Network Infrastructure Report':'Wi-Fi Network Survey Report'):(parts.slice(0,-1).join(', ')+' and '+parts[parts.length-1]+' Report');
    const plural=(n,w)=>`${n} ${w}${n===1?'':'s'}`;
    const roomInc=(l=>l.length<2?l.join(''):l.slice(0,-1).join('; ')+(l.length>2?'; ':' ')+'and '+l[l.length-1])([O('r.design')&&'the system design and design review',O('r.plan')&&'the room plan',O('r.survey')&&'the pre-installation site survey',(O('r.install')||O('r.accept'))&&'installation, commissioning and acceptance'].filter(Boolean));
    const hdr=label=>new Header({children:[new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:6,color:BLUE,space:4}},children:[ph(RPT.client,'[Company Name]',{bold:true,color:NAVY,size:20}),R(' ',{size:20}),R(`${title}${label?'  •  '+label:''}`,{color:GREY,size:20})].filter(Boolean)})]});
    const ftr=()=>new Footer({children:[new Paragraph({tabStops:[{type:TabStopType.RIGHT,position:W}],border:{top:{style:BorderStyle.SINGLE,size:4,color:BLUE,space:4}},
      children:[R(`Prepared by ${by}`,{color:GREY,size:18}),new TextRun({children:['\tPage ',PageNumber.CURRENT],color:GREY,size:18})]})]});
    const sections=[]; const sec=(children,label)=>sections.push({properties:{page:{size:{width:12240,height:15840},margin:{top:1440,right:1440,bottom:1440,left:1440,header:708,footer:708}}},headers:{default:hdr(label)},footers:{default:ftr()},children});
    const doors=nD?DAPI.report(doorIds,doorOpts()):[];
    const net=incNet?await NAPI.report({review:O('n.review'),reviewScope:OS('n.reviewScope'),impact:O('n.impact'),budget:O('n.budget'),rack:O('n.rack'),equip:O('n.equip'),completion:O('n.completion'),lines:O('n.lines'),linesDetail:OS('n.linesDetail'),qc:O('n.qc'),cable:O('n.cable'),plans:O('n.plans'),
      wifiDetails:O('w.details'),wifiReq:O('w.req'),wifiRoutes:O('w.routes'),wifiSignal:O('w.signal'),wifiSecondary:O('w.secondary'),wifiThroughput:O('w.throughput'),wifiAps:O('w.aps'),by,client:RPT.client,site:RPT.site,placeholders:O('f.placeholders')}):null;
    try{
      const names=[], stats=[], equip={}, recs=[]; const addEq=(cat,name,q,where)=>{ const k=cat+'|'+name; if(!equip[k]) equip[k]={cat,name,q:0,rooms:[]}; equip[k].q+=q; equip[k].rooms.push(where); };
      for(const id of ids){ loadRoomForReport(id); const S=roomStats(); names.push(RN.value||'Conference room'); stats.push(S); recs.push(curRoom()); equipItems().forEach(([cat,name,q])=>addEq(cat,name,q,RN.value)); }
      doors.forEach(d=>d.equip.forEach(([cat,name,q])=>addEq('Access control: '+cat.toLowerCase(),name,q,d.name)));
      if(net&&incNetCore) net.equip.forEach(([cat,name,q])=>{ if(q>0) addEq('Network: '+cat.toLowerCase(),name,q,'Network'); });
      const scope=[nR?(soloRoom?names[0]:plural(nR,'conference room')):'',nD?plural(nD,'access-controlled door'):'',net&&incNetCore?'UniFi network':'',incWifi?'Wi-Fi survey':''].filter(Boolean).join(', ').replace(/, ([^,]*)$/,' and $1');
      // cover and project pages
      const front=[];
      if(O('f.cover')){ front.push(new Paragraph({spacing:{before:480,after:120},children:[ph(RPT.client,'[Company Name]',{bold:true,color:NAVY,size:56})].filter(Boolean)}));
      front.push(new Paragraph({spacing:{after:80},children:[R(title,{color:BLUE,size:36})]}));
      front.push(new Paragraph({spacing:{after:480},children:[R(`${scope}  •  Professional Services  •  ${monthYear}`,{color:GREY,size:22})]}));
      front.push(new Paragraph({spacing:{after:200},border:{bottom:{style:BorderStyle.SINGLE,size:6,color:BLUE,space:1}},children:[]})); }
      if(O('f.details')){ front.push(H1('Project Details',false));
      front.push(kv([['Company',[ph(RPT.client,'[Company name]',{size:20})]],...(nR?[[nR>1?'Conference Rooms':'Conference Room',nR>1?`${nR}: ${names.join(', ')}`:names[0]]]:[]),...(net&&incNetCore?[['Network',`${net.summary.gateway}, ${net.summary.switches}, ${net.summary.apText}, ${plural(net.summary.devices,'home-run line')}`]]:[]),...(nD?[[nD>1?'Doors':'Door',nD>1?`${nD}: ${doors.map(d=>d.name).join(', ')}`:doors[0].name]]:[]),
        ['Location',[soloRoom&&recs[0].site?R(recs[0].site,{size:20}):ph(RPT.site,'[Site address / floor]',{size:20})]],...(soloRoom?[['Installation Date',[recs[0].installDate?R(longDay(recs[0].installDate),{size:20}):ph('','[Installation date]',{size:20})]]]:[]),['Client Contact',[ph(RPT.person,'[Name, title]',{size:20})]],['Report Date',longDate],['Prepared By',by]])); }
      if(O('f.overview')){ front.push(H1('Project Overview',false));
      const ov=[R(`${by} ${nR||nD||incNetCore?'designed':'performed'} `),...(nR?[R(`the audiovisual (AV) system${nR>1?'s':''} for `),R(soloRoom?names[0]:plural(nR,'conference room'),{bold:true})]:[]),...(nR&&nD?[R(' and ')]:[]),
        ...(nD?[R('the UniFi Access control wiring for '),R(plural(nD,'door'),{bold:true})]:[]),...(net&&incNetCore?[R(nR||nD?', and ':''),R('the UniFi network with its low-voltage home runs',{bold:!(nR||nD)})]:[]),...(net&&!incNetCore?[R(nR||nD?', and performed ':''),R('an on-site Wi-Fi survey',{bold:!(nR||nD)})]:[]),...(RPT.client||O('f.placeholders')?[R(' at '),ph(RPT.client,'[Company Name]')]:[]),R('.')];
      if(nR) ov.push(R(` For each conference room, this report documents ${roomInc}.`));
      if(nD) ov.push(R(` For each door, it documents ${(l=>l.length<2?l.join(''):l.slice(0,-1).join('; ')+(l.length>2?'; ':' ')+'and '+l[l.length-1])([O('d.design')&&'the design review and door specification',O('d.simulate')&&'the simulated operating scenarios',O('d.wiring')&&'the wiring schedule',O('d.survey')&&'the pre-installation site survey',O('d.install')&&'the installation procedure',O('d.accept')&&'acceptance testing'].filter(Boolean))}.`));
      if(incWifi&&incNetCore) ov.push(R(' It also includes the Wi-Fi survey results.'));
      if(net&&incNetCore) ov.push(R(` The network section covers the ${net.summary.gateway}, ${net.summary.switches} and ${net.summary.apText} access point${net.summary.aps===1?'':'s'}, with every cable run measured from the floor plans.`));
      if(nR) ov.push(R(' All heights are given above finished floor (AFF).'));
      front.push(Pg(ov)); }
      if(soloRoom){ if(O('r.summary')){ front.push(H2('System Summary')); front.push(summaryTable(stats[0])); } }
      else {
        if(nR&&O('f.roomsTable')){ front.push(H2('Conference Rooms in This Report'));
          front.push(grid(['Room','System','Displays','Design review','Site readiness','Installation'],[1560,2100,1200,1500,1500,1500],stats.map((S,i)=>{ const c=S.c, rc=ROOMS.find(r=>r.id===ids[i]).cfg;
            return [[R(names[i],{size:18,bold:true}),...(recs[i].site?[R('',{break:1}),R(recs[i].site,{size:16,color:GREY})]:[]),...(recs[i].installDate?[R('',{break:1}),R('Install '+longDay(recs[i].installDate),{size:16,color:GREY})]:[])],[R(`${c.P.short}; ${c.B.short}`,{size:18})],[R(`${rc.dispCount} × ${rc.size}″`,{size:18})],{cell:true,runs:[R(S.short.design,{size:18,bold:true,color:ST[S.design[0]][1]})],fill:ST[S.design[0]][0]},
              {cell:true,runs:[R(S.short.site,{size:18,bold:true,color:ST[S.site[0]][1]})],fill:ST[S.site[0]][0]},[R(S.short.inst,{size:18})]]; }))); }
        if(nD&&O('f.doorsTable')){ front.push(H2('Access-Controlled Doors in This Report'));
          front.push(grid(['Door','Hardware','Lock power','Design review','Site readiness','Installation'],[1560,2100,1200,1500,1500,1500],doors.map(d=>{ const S=d.stats;
            return [[R(d.name,{size:18,bold:true})],[R(`${S.hub}; ${S.lock}`,{size:18})],[R(S.power,{size:18})],{cell:true,runs:[R(S.short.design,{size:18,bold:true,color:ST[S.design[0]][1]})],fill:ST[S.design[0]][0]},
              {cell:true,runs:[R(S.short.site,{size:18,bold:true,color:ST[S.site[0]][1]})],fill:ST[S.site[0]][0]},[R(S.short.inst,{size:18})]]; }))); }
        if(O('f.totals')&&nR+nD+(incNetCore?1:0)>1){ front.push(H2('Project Equipment Totals'));
          front.push(Pg(R('Quantities summed across every room and door in this report. Each section’s equipment list gives the requirements and approved alternatives.',{size:20,color:GREY})));
          const all=[...names,...doors.map(d=>d.name),...(net&&incNetCore?['Network']:[])], rows=[]; let lastCat=null;
          const catKey=c=>(c.startsWith('Network')?'3':c.startsWith('Access control')?'2':'1')+c;
          Object.values(equip).sort((a,b)=>catKey(a.cat).localeCompare(catKey(b.cat))||a.name.localeCompare(b.name)).forEach(e=>{ if(e.cat!==lastCat){ rows.push({group:e.cat.charAt(0).toUpperCase()+e.cat.slice(1)}); lastCat=e.cat; }
            const where=[...new Set(e.rooms)]; rows.push([[R(e.name,{size:20})],[R(String(e.q),{size:20,bold:true})],[R(where.length===all.length&&all.length>1?'All rooms and doors':where.join(', '),{size:18})]]); });
          front.push(grid(['Item','Qty','Where'],[4560,900,3900],rows)); } }
      // a title-only front page reads oddly; drop the section when nothing in it is switched on
      if(front.length) sec(front, soloRoom?names[0]:'');
      // one section per room: its own header, numbering continues
      for(let i=0;i<ids.length;i++){ loadRoomForReport(ids[i]); const body=[];
        if(!soloRoom){ OFF=1; body.push(new Paragraph({heading:HeadingLevel.HEADING_1,pageBreakBefore:false,keepNext:true,children:[R(names[i])]}));
          body.push(Pg(R(`Conference room ${i+1} of ${nR}`,{color:GREY,size:20})));
          if(O('r.summary')) body.push(summaryTable(stats[i])); }
        else SECSTART=true;
        await roomBody(body); OFF=0; SECSTART=false;
        if(body.length) sec(body, names[i]); }
      // one section per door
      for(let i=0;i<doors.length;i++){ const d=doors[i], S=d.stats, body=[]; OFF=1;
        body.push(new Paragraph({heading:HeadingLevel.HEADING_1,pageBreakBefore:false,keepNext:true,children:[R(d.name)]}));
        body.push(Pg(R(`Access-controlled door ${i+1} of ${nD}`,{color:GREY,size:20})));
        if(O('d.summary')) body.push(grid(['Item','Detail'],[3000,6360],[['Door Hub',S.hub],['Lock',S.lock],['Lock Power',S.power],['Opening',S.opening],
          ['Design Review',[R(S.design[1],{size:20,bold:true,color:ST[S.design[0]][1]})]],['Site Readiness',[R(S.site[1],{size:20,bold:true,color:ST[S.site[0]][1]})]],['Installation',S.inst]]));
        await renderBlocks(d.blocks,body); OFF=0;
        sec(body, d.name); }
      // the network, after the rooms and doors it serves
      if(net&&incNetCore){ const body=[], S=net.summary; OFF=1;
        body.push(new Paragraph({heading:HeadingLevel.HEADING_1,pageBreakBefore:false,keepNext:true,children:[R('Network Infrastructure')]}));
        if(O('n.summary')) body.push(grid(['Item','Detail'],[3000,6360],[['Cloud Gateway',S.gateway],['PoE Switches',S.switches],['Access Points',S.apText],['Uplinks',S.uplink],['Home Runs',`${plural(S.lines||S.devices,'line')} across ${plural(S.floors,'floor')}, ${S.linesDone||0} tested and passed, ${Math.round(S.cableFt).toLocaleString('en-US')} ft of cable with allowances`],['PoE Power',S.poe],
          ['Design Review',[R(S.ic.bad+S.ic.warn?`${S.ic.bad+S.ic.warn} open item${S.ic.bad+S.ic.warn>1?'s':''}`:'All criteria pass',{size:20,bold:true,color:S.ic.bad?ST.bad[1]:S.ic.warn?ST.warn[1]:ST.ok[1]})]]]));
        await renderBlocks(net.blocks,body); OFF=0; if(incNetCore) sec(body,'Network'); }
      if(net&&net.wifi&&net.wifi.length){ const body=[]; OFF=1; body.push(new Paragraph({heading:HeadingLevel.HEADING_1,pageBreakBefore:false,keepNext:true,children:[R('Wi-Fi Network Survey')]})); await renderBlocks(net.wifi,body); OFF=0; sec(body,'Wi-Fi Survey'); }
      // contact
      if(O('f.contact')) sec([H1('Questions About This Report',false),Pg(`For questions about ${soloRoom?'this room':'this project'} or the findings in this report, please contact ${by}.`),
        Pg([R('Email: ',{bold:true}),new ExternalHyperlink({link:'mailto:'+mail,children:[new TextRun({text:mail,color:'1155CC',underline:{}})]})])], soloRoom?names[0]:'');
    } finally { if(ACTIVE!==startId) loadRoomForReport(startId); }

    const hs=(sz,col)=>({run:{font:'Arial',size:sz,bold:true,color:col}});
    const doc=new Document({creator:by,title:`${RPT.client||'Project'} ${title}`,description:title,
      styles:{default:{document:{run:{font:'Arial',size:22}}},
        paragraphStyles:[
          Object.assign({id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',quickFormat:true,paragraph:{keepNext:true,spacing:{before:320,after:160},outlineLevel:0}},hs(36,NAVY)),
          Object.assign({id:'Heading2',name:'Heading 2',basedOn:'Normal',next:'Normal',quickFormat:true,paragraph:{keepNext:true,spacing:{before:280,after:120},outlineLevel:1}},hs(28,BLUE)),
          Object.assign({id:'Heading3',name:'Heading 3',basedOn:'Normal',next:'Normal',quickFormat:true,paragraph:{keepNext:true,spacing:{before:200,after:80},outlineLevel:2}},hs(24,'1F4D78')),
          Object.assign({id:'Heading4',name:'Heading 4',basedOn:'Normal',next:'Normal',quickFormat:true,paragraph:{keepNext:true,spacing:{before:160,after:60},outlineLevel:3}},hs(22,'1F4D78'))]},
      numbering:{config:[
        {reference:'bullets',levels:[{level:0,format:LevelFormat.BULLET,text:'•',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:540,hanging:270}},run:{size:20}}}]},
        {reference:'numbers',levels:[{level:0,format:LevelFormat.DECIMAL,text:'%1.',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:540,hanging:300}},run:{size:20}}}]}]},
      sections});
    return Packer.toBlob(doc);
  }


  document.getElementById('reportGo').addEventListener('click',async()=>{
    readReportForm(); const btn=document.getElementById('reportGo');
    const dSel=(doorApi()?doorApi().list():[]).filter(d=>RPT.doors[d.id]!==false), rSel=ROOMS.filter(r=>RPT.rooms[r.id]!==false);
    const NKEYS2=['n.summary','n.completion','n.review','n.budget','n.rack','n.equip','n.lines','n.qc','n.cable','n.plans'], nSel=RPT.net!==false&&!!netApi()&&(NKEYS2.some(O)||['w.details','w.req','w.routes','w.signal','w.secondary','w.throughput','w.aps'].some(O));
    if(!rSel.length&&!dSel.length&&!nSel){ RM.className='rpmsg bad'; RM.textContent='Select at least one room, door or the network to include.'; return; }
    if(rSel.length&&!['r.summary','r.design','r.plan','r.survey','r.install','r.accept'].some(O)&&!dSel.length){ RM.className='rpmsg bad'; RM.textContent='Every conference room section is switched off. Turn at least one on under Report contents.'; return; }
    if(dSel.length&&!['d.summary','d.design','d.simulate','d.wiring','d.survey','d.install','d.accept'].some(O)&&!rSel.length){ RM.className='rpmsg bad'; RM.textContent='Every door section is switched off. Turn at least one on under Report contents.'; return; }
    btn.disabled=true; btn.textContent='Building the report…'; RM.className='rpmsg'; RM.textContent='';
    try{ const blob=await buildReport(); const d=RPT.date||new Date().toISOString().slice(0,10);
      const nn=rSel.length+dSel.length, one=nn===1&&!nSel?(rSel[0]||dSel[0]).name:'', kind=[rSel.length?'AV':'',dSel.length?'access':'',nSel?(NKEYS2.some(O)?'network':'Wi-Fi survey'):''].filter(Boolean).join(' and ').replace(/ and ([^ ]+) and /,', $1 and ')+' report';
      const base=one?`${RPT.client?RPT.client+' ':''}${one}`:`${RPT.client||'Project'}${[rSel.length?' '+rSel.length+' room'+(rSel.length>1?'s':''):'',dSel.length?' '+dSel.length+' door'+(dSel.length>1?'s':''):''].join('')}`;
      const name=`${base.replace(/[\\/:*?"<>|]+/g,'').trim()} ${kind} ${d}.docx`;
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000);
      RM.className='rpmsg ok'; RM.textContent=`Saved ${name}. Check your downloads folder.`; }
    catch(e){ RM.className='rpmsg bad'; RM.textContent=e&&e.message==='load'?'Couldn’t load the Word exporter. It needs an internet connection the first time you save a report in a session; connect and try again.':'The report couldn’t be built. Try again, and if it keeps failing, reload the page.'; console.error(e); }
    finally{ btn.disabled=false; btn.textContent='Save .docx report'; } });

