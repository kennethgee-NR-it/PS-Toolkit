  // ---------- survey ----------
  function surveyItems(){
    const c=calc(), P=c.P, M=c.M; const G=[]; const g=(n,items)=>G.push([n,items.filter(Boolean)]);
    const it=(id,q,how,pass,fix,tool)=>({id,q,how,pass,fix,tool});
    g('Room',[
      it('dims','Room dimensions verified','Measure the room, the table, and the distance from the display wall to the farthest seat.',`Farthest seat is about ${fmt(cfg.far)} ft and the room seats ${cfg.seats}, matching the design.`,'Update the design with the field-measured dimensions.','Laser measure'),
      it('light','Lighting and windows','Check for windows behind where people sit (facing the camera) and behind the display.','No bright window behind the seats; blinds available.','Add blinds or shades, or rearrange seating.','Eyes'),
      it('acoustic','Acoustics','Clap once and listen; note hard surfaces, glass walls, HVAC noise.','No strong echo or loud HVAC; some soft surfaces.','Add acoustic panels, a rug or ceiling tiles; ask facilities about HVAC noise.','Ears, phone sound meter app'),
      it('path','Delivery path',`Measure doors, elevators and corners on the way in for a ${cfg.size}-inch box.`,'The boxed display fits through every door and turn.','Plan a different route or unbox at the door.','Tape measure')
    ]);
    const wall=[];
    if(M.cart){ wall.push(it('floor','Floor and thresholds for the cart','Check the floor surface and door thresholds along the routes the cart will travel.','Level floor; thresholds the 4-inch casters can roll over.','Add threshold ramps or limit the cart to this room.','Eyes'),
      it('cartfit','Room fits the cart','Check the cart’s footprint (the Prime is 44 in wide, about 34 in deep and 68 in tall) and the space in front of it.','Clear space for the cart and a walkway around it.','Pick another position or a smaller cart.','Tape measure')); }
    else {
      wall.push(it('wallid','Wall construction verified',`Confirm the wall is ${M.name.toLowerCase()} where the display goes.`,M.studs?'Stud locations marked, and you know whether they’re wood or steel and what’s over them (drywall, plywood or plaster).':cfg.mount==='drywall'?'A stud or backing location is found, or backing is planned.':'Solid concrete, grouted block or solid brick confirmed with a test hole.','Change the mounting design to match what’s really there.','Stud finder, magnet, test drill'),
        it('studs','Wall dimensions and stud locations',`Measure the wall corner to corner (${fmt(cfg.wallW,1)} in planned) and the first stud center from the left corner (${fmt(cfg.firstStud,1)} in planned).`,'Field measurements are entered in Wall layout, and the mount still engages the studs.','Update Wall layout; add backing if studs don’t line up.','Tape measure, stud finder'),
      it('hidden','Concealed utilities scanned','Scan for pipes, conduit and wiring where fasteners will go.','No piping, conduit or wiring in the drilling zone.','Move the mount position.','Stud finder with AC detection'),
        cfg.mount==='metal'?it('backing','Backing in the wall','Check whether backing was installed during construction, or plan to add it.','Backing present, or opening the wall to add it is approved.','Add backing or use a mount rated for steel studs with the right anchors.','Stud finder, inspection hole'):null,
        it('fire','Wall fire rating','Ask whether the display wall is fire-rated.','Wall is not fire-rated, or every penetration will be sealed with a listed firestop system.','Use surface boxes or rated firestop products.','Conversation'));
    }
    g('Display location',wall.concat([
      it('obstr','Display wall clear of obstructions',`Check for thermostats, switches, outlets and windows in the ${cfg.dispCount===2?'two displays’':'display’s'} footprint and above it for the video bar.`,'No switches, thermostats, receptacles or windows within the display and video bar footprint.','Relocate devices or adjust the display position.','Tape measure')]));
    g('Power and network',[
      it('power','Power at the display location',`Check for outlets behind the display location (about ${c.outlets} needed).`,'Recessed receptacles behind the display, on a circuit not shared with heavy loads.','Have an electrician add a recessed power and data box.','Outlet tester'),
      it('net','Network drops',`Count network drops at the display and table (${c.drops.length} needed, ${c.drops.filter(d=>d[2]).length} PoE).`,'Drops installed, tested and patched, with PoE available where required.','Add drops or a PoE switch; get IT involved.','Cable tester, PoE tester'),
      it('it','IT readiness',`Ask IT about firewall rules, VLAN or DHCP reservation, and ${c.P.license}.`,'Required firewall ports open, VLAN or DHCP reservation in place, and accounts provisioned before install day.','Send IT the platform’s network requirements.','Conversation'),
      ...(c.P.mac?[it('mac','Mac mini and iPad ready','Confirm a Mac mini on a supported macOS version and an iPad are on hand, with a place for the Mac mini (behind the display or in the credenza) and Wi-Fi or an Ethernet adapter for the iPad.','Both devices updated, with power and network at their locations.','Order a Mac mini mount and iPad stand; ask IT for Wi-Fi access.','Conversation')]:[]),
      it('cal','Room calendar resource ready',`Confirm the room’s ${cfg.calendar==='google'?'Google Workspace calendar resource':'Microsoft 365 room mailbox'} exists, and who can grant admin access${c.P.vendor==='teams'&&cfg.calendar==='google'?' (Teams Rooms also needs an Exchange Online resource account)':''}.`,'Resource account created, and an administrator is scheduled for install day.','Use the Accounts and calendar tab to request it from IT.','Conversation'),
      it('table','Cable pathway to the table','Check for a floor box, table grommet or under-table route for the Tap, mic pods and HDMI.','A concealed route (floor box, table grommet or raceway) that doesn’t cross walkways.','Add a floor box, table box or cable ramp.','Eyes')
    ]);
    return G;
  }
  const SVOPEN=new Set(); // survey items showing their “how to check”
  function renderSurvey(){
    const g0=surveyItems(), all=g0.flatMap(([,i])=>i);
    const counts={ok:0,no:0,na:0}; all.forEach(i=>{ if(survey[i.id]) counts[survey[i.id]]++; });
    const checked=counts.ok+counts.no+counts.na, blockers=all.filter(i=>survey[i.id]==='no');
    SVSTAT={total:all.length,checked,no:counts.no};
    const st=blockers.length?['bad','Not ready']:checked===all.length?['ok','Ready to install']:['warn','Survey in progress'];
    const pct=n=>`${(n/Math.max(1,all.length)*100).toFixed(1)}%`, h=t=>String(t==null?'':t).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[m]);
    document.getElementById('svSummary').innerHTML=`<div class="svline"><b>${checked} of ${all.length} checked</b><span class="${st[0]}">${blockers.length?`${blockers.length} not ready`:st[1]}</span></div>
      <span class="svbar" aria-hidden="true"><i class="ok" style="width:${pct(counts.ok)}"></i><i class="no" style="width:${pct(counts.no)}"></i><i class="na" style="width:${pct(counts.na)}"></i></span>
      ${blockers.length?`<ul>${blockers.map(b=>`<li><b>${b.q}:</b> ${b.fix}${survey[b.id+'_n']?` <i>Found on site: ${h(survey[b.id+'_n'])}</i>`:''}</li>`).join('')}</ul>`:''}`;
    document.getElementById('svFilter').innerHTML=[['all','All'],['open',`To do (${all.length-checked})`],['no',`Not ready (${counts.no})`]].map(([v,l])=>`<button type="button" class="filt" aria-pressed="${UI.svFilter===v}" data-svf="${v}">${l}</button>`).join('');
    const keep=i=>UI.svFilter==='all'||(UI.svFilter==='open'&&!survey[i.id])||(UI.svFilter==='no'&&survey[i.id]==='no');
    const groups=g0.map(([n,items])=>[n,items.filter(keep)]).filter(([,i])=>i.length);
    document.getElementById('survey').innerHTML = groups.length? groups.map(([name,items])=>`<div class="svgroup"><h3>${name}</h3>${items.map(i=>{ const no=survey[i.id]==='no', open=SVOPEN.has(i.id); return `
      <div class="svitem ${no?'no':''}"><div class="svq"><div class="q">${i.q}</div><div class="d">Ready when: ${i.pass}</div>
        ${no?`<div class="d fixd"><b>To fix:</b> ${i.fix}</div><label class="svnote">What’s blocking it<input type="text" data-svnote="${i.id}" value="${h(survey[i.id+'_n'])}" placeholder="What you found on site"></label>`:''}
        ${open?`<div class="how"><b>How to check:</b> ${i.how} <b>Tools:</b> ${i.tool}.</div>`:''}
        <button type="button" class="howbtn" data-svhow="${i.id}" aria-expanded="${open}">${open?'Hide how to check':'How to check'}</button></div>
      <div class="svbtns" role="group" aria-label="${i.q}">${[['ok','Ready'],['no','Not ready'],['na','N/A']].map(([v,l])=>`<button type="button" data-sv="${i.id}" data-v="${v}" aria-pressed="${survey[i.id]===v}">${l}</button>`).join('')}</div></div>`; }).join('')}</div>`).join('') : '<p class="hint" style="padding:12px 0">Nothing to show for this filter.</p>';
  }

