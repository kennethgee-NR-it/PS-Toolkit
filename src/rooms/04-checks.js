  // ---------- checks ----------
  function checks(){
    const c=calc(), L=[]; const add=(t,b,m)=>L.push([t,b,m]);
    const {P,B,D,M}=c;
    // viewing
    if(cfg.far>c.maxFar){ add(c.minSize?'warn':'bad','Display size',`The farthest seat is ${fmt(cfg.far)} ft away, but a ${cfg.size}-inch screen suits up to about ${fmt(c.maxFar,1)} ft for ${cfg.content==='detailed'?'detailed':'general'} content.${c.minSize?` Use at least ${c.minSize} inches.`:' Even 85 inches is too small; consider a projector, dual displays near the table, or a shorter room layout.'}`); }
    else add('ok','Display size',`A ${cfg.size}-inch screen covers the farthest seat at ${fmt(cfg.far)} ft (limit about ${fmt(c.maxFar,1)} ft).`);
    if(cfg.near*12 < cfg.size*0.9) add('warn','Nearest seat',`The nearest seat is ${fmt(cfg.near)} ft from a ${cfg.size}-inch screen. Closer than about one screen diagonal, people have to turn their heads to see it all.`);
    // device capacity
    if(cfg.seats>B.seats) add('bad','Video bar size',`${B.short} is rated for up to ${B.seats} people; this room seats ${cfg.seats}.`);
    else add('ok','Video bar size',`${B.short} suits ${B.room} rooms, up to ${B.seats} people.`);
    if(P.appliance && !B.appliance) add('bad','Platform and device',`${B.short} doesn’t run meetings by itself. Use a compute platform, or add Logitech RoomMate as the appliance.`);
    if(cfg.dispCount>1 && !B.dual) add('warn','Dual displays',`${B.short} is designed around a single display. Check Logitech’s current spec before planning two.`);
    if(cfg.sight && !B.sight) add('bad','Logitech Sight',`Sight pairs with Rally Bar and Rally Bar Mini${B.isNew?'; check Logitech for Rally Bar 2 support':' only'}.`);
    // audio
    if(cfg.pods>B.pods) add('bad','Mic pods',`${B.short} supports ${B.pods?'up to '+B.pods:'no'} ${B.podName}s.`);
    else if(cfg.pods<c.recPods) add('warn','Mic coverage',`For ${cfg.seats} seats, plan about ${c.recPods} Rally Mic Pod${c.recPods>1?'s':''} so the far end of the table is heard clearly (rule of thumb).`);
    else add('ok','Mic coverage', cfg.pods?`${cfg.pods} ${B.podName}${cfg.pods>1?'s':''} for ${cfg.seats} seats.`:`The video bar’s built-in mics should cover ${cfg.seats} seats.`);
    // camera height
    if(c.camH>cfg.eyeH+37) add('warn','Camera height',`The camera sits about ${fmt(c.camH)} in off the floor, far above seated eye level (${fmt(cfg.eyeH)} in), so it looks steeply down on people. Mount the bar below the display, or lower the display.`);
    else if(c.camH<cfg.tableH+6) add('warn','Camera height',`The camera sits about ${fmt(c.camH)} in off the floor, barely above the ${fmt(cfg.tableH)} in table, so laptops and heads will block it. Mount the bar above the display, or raise the display.`);
    else add('ok','Camera height',`Camera at about ${fmt(c.camH)} in. Closer to eye level (${fmt(cfg.eyeH)} in) is better, but this is within the normal range.`);
    if(!c.M.cart){ const dev=c.bottom-cfg.standardH;
      if(Math.abs(dev)>cfg.tolerance+0.01) add('warn','Bottom bezel standard',`The bottom bezel is at ${fmt(c.bottom,1)} in, outside your ${fmt(cfg.standardH)} ± ${fmt(cfg.tolerance)} in standard.`);
      else add('ok','Bottom bezel standard',`Bottom bezel at ${fmt(c.bottom,1)} in, within your ${fmt(cfg.standardH)} ± ${fmt(cfg.tolerance)} in standard.`);
      if(cfg.plateMethod==='hook' && !c.hookMeasured) add('warn','Hook distance not measured',`The mount top height uses an estimated hook distance of ${fmt(c.hookEst,1)} in. Attach the brackets to the display and measure from its bottom edge to the top of the hooks.`); }
    if(c.bottom<cfg.tableH+6) add('warn','Display height',`The bottom bezel at ${fmt(c.bottom,1)} in is close to the ${fmt(cfg.tableH)} in table height, so the table and people’s heads will hide the lower part of the screen. Aim for at least ${fmt(cfg.tableH+6)} in.`);
    if(cfg.credenza && c.M && !c.M.cart){
      if(c.bottom < cfg.credH+2) add('bad','Credenza clearance',`The bottom bezel at ${fmt(c.bottom,1)} in is below the ${fmt(cfg.credH)} in credenza top plus a 2 in gap.`);
      else if(cfg.barPos==='below' && c.barBot < cfg.credH+1) add('bad','Credenza clearance',`The video bar below the display hits the ${fmt(cfg.credH)} in credenza.`);
      else add('ok','Credenza clearance',`${fmt((cfg.barPos==='below'?c.barBot:c.bottom)-cfg.credH,1)} in clear above the credenza.`);
    }
    if(B.isNew) add('info','New product',`${B.short} launched in October 2026. Room capacity, mic pod count and accessory compatibility here are estimates; confirm them on Logitech’s spec sheet.`);
    if(c.top + (cfg.barPos==='above'?8:0) > cfg.ceil-4) add('bad','Ceiling clearance',`The display${cfg.barPos==='above'?' and bar':''} reach about ${fmt(c.top+(cfg.barPos==='above'?8:0))} in, above the ${cfg.ceil} in ceiling.`);
    // mounting
    if(M.cart){
      const total=c.load;
      if(cfg.size<M.min||cfg.size>M.max) add('warn','Cart size',`${M.short} is recommended for ${M.min}- to ${M.max}-inch displays.${cfg.size>M.max?' Use the XL cart for an 85-inch screen.':''}`);
      else add('ok','Cart size',`${M.short} suits a ${cfg.size}-inch display.`);
      if(total>M.cap) add('bad','Cart load',`About ${fmt(total)} lb of display and video bar exceeds the cart’s ${M.cap} lb rating.`);
      if(cfg.dispCount>1 && cfg.mount==='cart') add('info','Dual displays on a cart','Two displays on the Prime cart need Heckler’s dual display kit; check the combined weight.');
      if(cfg.mount==='cart'){ const v=cartVesa(); if(v.direct) add('ok','VESA pattern',`The Prime cart takes a VESA 400 (horizontal) display directly; this display is ${D.vesa}.`); else if(v.kit) add('warn','VESA adapter',`The Prime cart mounts VESA 400 directly. This display’s ${D.vesa} pattern needs Heckler’s H497 VESA Adapter Kit (horizontal 200, 300, 500 or 600). Order it with the cart.`); else add('bad','VESA adapter',`Display VESA ${D.vesa} isn’t covered by the Prime cart or its H497 adapter kit (400 direct; 200, 300, 500, 600 with the kit).`); }
      if(cfg.mount==='cartxl') add('info','VESA pattern',`Confirm the XL cart’s VESA support against Heckler’s spec sheet for this display’s ${D.vesa} pattern before ordering.`);
      add('info','Carts and tipping','Lock the casters when in use, keep the heavy components low, and move the cart slowly over thresholds. Unplug before moving.');
    } else {
      const MD=c.MD, dv=D.vesa.split(' × ').map(Number), mountLoad=c.load*(cfg.dispCount>1?0.5:1);
      if(MD.cap){ if(mountLoad>MD.cap) add('bad','Mount capacity',`${MD.short} is rated for ${MD.cap} lb; this display${cfg.barPos&&(cfg.barMount==='tv'||cfg.bar==='huddle')?' plus video bar':''} is about ${fmt(mountLoad)} lb.`); else add('ok','Mount capacity',`${MD.short} is rated for ${MD.cap} lb; load about ${fmt(mountLoad)} lb.`); }
      else add('info','Mount capacity',`Select the ${MD.short} model rated for at least ${fmt(mountLoad)} lb, with VESA ${D.vesa}.`);
      if(MD.vesa && (dv[0]>MD.vesa[0]||dv[1]>MD.vesa[1])) add('bad','Mount VESA',`The display’s VESA ${D.vesa} is larger than ${MD.short}’s maximum of ${MD.vesa.join(' × ')}.`);
      if(MD.walls){ if(!MD.walls.includes(cfg.mount)) add(cfg.mount==='plywood'||cfg.mount==='plaster'?'warn':'bad','Mount and wall',`The ${MD.short} manual covers wood studs and solid concrete only. ${({metal:'Steel studs and drywall alone aren’t allowed.',drywall:'Drywall alone isn’t allowed.',cmu:'Concrete block isn’t covered.',brick:'Brick isn’t covered.',plywood:'Drive the lag bolts through the plywood into the studs, as a wood-stud install.',plaster:'Drive the lag bolts into the studs; the manual’s 5/8 in drywall limit means plaster may need longer lags.'})[cfg.mount]||''} ${cfg.mount==='plywood'||cfg.mount==='plaster'?'':'Use a commercial mount rated for this wall.'}`);
        else if(cfg.mount==='concrete') add('warn','Concrete anchors',`The ${MD.short} needs four 10 × 50 mm concrete anchors, which aren’t in the box (Mounting Dream supplies them on request). Drill 3/8 in (10 mm) holes 2.5 in (65 mm) deep.`);
        else add('ok','Mount and wall',`Wood studs: four M8 × 60 mm lag bolts in 7/32 in (5.5 mm) pilot holes 2.5 in (65 mm) deep, through drywall no thicker than 5/8 in (16 mm). Studs at least 2 × 4.`);
        if(MD.manual) add('info','Wall strength','The MD2198 manual requires the wall to hold five times the weight of the display and mount combined.'); }
      else if(MD.woodOnly && cfg.mount==='metal') add('bad','Mount and wall',`${MD.short} is designed for wood studs. On steel studs, use a commercial mount rated for steel studs with backing.`);
      else if(MD.woodOnly && cfg.mount==='drywall') add('bad','Mount and wall',`${MD.short} needs wood studs; drywall alone won’t hold it.`);
      else if(MD.woodOnly && M.masonry) add('warn','Mount and wall',`${MD.short}’s hardware is for wood studs. On ${M.short}, use concrete anchors rated for the load (and for full-motion leverage), per the anchor manufacturer.`);
      else if(cfg.model.startsWith('eg') && cfg.mount!=='wood') add('warn','Mount and wall',`Check the ${MD.short} manual for ${M.short}; full-motion arms put high leverage on the wall.`);
      if(MD.singleStud && cfg.size>60) add('bad','Mount size',`${MD.short} is for 32 to 60 in displays.`);
      if(MD.vesaMin && (dv[0]<MD.vesaMin[0]||dv[1]<MD.vesaMin[1])) add('bad','Mount VESA',`The display’s VESA ${D.vesa} is smaller than ${MD.short}’s minimum of ${MD.vesaMin.join(' × ')}.`);
      if(MD.type==='Full motion'){ add('info','Full-motion mount',`Full-motion arms add leverage on the wall when extended (up to ${MD.ext||'the arm’s'} in). In a conference room, set it straight and tight; a camera on the display moves with it, a wall-mounted bar doesn’t.`);
        if((cfg.bar==='mini'||cfg.bar==='bar') && cfg.barMount==='wall') add('warn','Bar and full-motion mount','The video bar is on the wall but the display can swing; the camera and screen will drift apart. Use the TV mount for video bars so the bar moves with the display.'); }
      if(cfg.mount==='metal' && !cfg.backing && AK()!=='toggle') add('warn','Metal studs',`Metal studs are thin; most mount manufacturers require backing (plywood or steel) or anchors rated for steel studs for a ${cfg.size}-inch display.`);
      if(cfg.mount==='wood') add('ok','Wood studs','Lag bolts into the center of at least two studs.');
      if(cfg.mount==='drywall' && AK()!=='toggle') add('bad','Drywall only','Drywall alone can’t hold a display, and mount manufacturers (including the MD2198 manual) forbid it. Move the mount to studs, add plywood backing between the studs, or pick a masonry wall.');
      if(cfg.mount==='plywood') add('ok','Plywood backing','Fasten into 3/4 in plywood backing that’s screwed to the studs, and still hit studs with the main lag bolts where the mount allows.');
      if(cfg.mount==='plaster') add('warn','Plaster walls','Plaster hides studs and cracks easily. Find studs with a strong magnet on the lath nails or a small test hole, drill through the plaster with a masonry bit, then into the stud with a wood bit, and use lag bolts long enough for the extra plaster thickness.');
      if(cfg.mount==='brick') add('ok','Brick','Sleeve anchors into the face of solid brick, never into mortar joints, and away from brick edges. Confirm it’s solid brick, not a brick veneer over a cavity.');
      if(cfg.mount==='concrete') add('ok','Concrete','Wedge or sleeve anchors into solid concrete, at the depth and torque the anchor manufacturer specifies.');
      if(cfg.mount==='cmu' && !cfg.cmuGrouted) add('warn','Hollow block','Anchors in hollow block hold far less. Use anchors made for hollow block, through-bolts, or grout the cells you anchor into.');
      if(cfg.mount==='cmu' && cfg.cmuGrouted) add('ok','Concrete block','Sleeve anchors into the solid face or grouted cells, never into mortar joints.');
      { const ak=AK(); if(ak){ const A=ANCH[ak], u=anchorCap(ak), fm=MD.type==='Full motion', Lo=layout();
        if(u){ const cap=4*u/4; const lv=mountLoad>cap?'bad':((ak==='toggle'&&!M.masonry)||fm||mountLoad>cap/2?'warn':'ok');
          add(lv,'Anchor capacity',`${A.name}: about ${u} lb ultimate each, so plan on ${Math.floor(u/4)} lb each, ${cap} lb for four, against a load of about ${fmt(mountLoad)} lb.${ak==='toggle'&&!M.masonry?' Toggles in drywall are a fallback: most mount manufacturers require studs or backing, and a full-motion arm multiplies the pull on the top anchors. Confirm your mount’s manual allows them.':''}${fm&&ak!=='toggle'?' Full-motion arms add leverage, so keep a wide safety margin.':''}`); }
        else add('info','Anchor method',`${A.name}: follow the anchor manufacturer’s data for hole size, embedment and load.`);
        if(ak==='tapcon'&&cfg.mount==='brick') add('warn','Tapcon in brick','Only use in solid brick faces, not mortar joints or veneer; the manufacturer’s published values are for concrete and block, so check the load with the maker.');
        if(ak==='tapcon') add('info','Tapcon spacing','Keep Tapcons at least 4 in apart and 3 in from any edge, and drill 1/4 in deeper than the embedment (1 to 1-3/4 in).');
        if(ak==='toggle'&&cfg.mount==='cmu'&&!cfg.cmuGrouted) add('info','Toggles in hollow block','SnapToggles are rated 1,080 lb ultimate in hollow block, but drill a test hole to confirm the channel opens in the cell.');
        if(masonryEdge(Lo)) add('warn','Anchor edge distance','An anchor lands within 3 in of the wall edge. Slide the plate or pick another spot.');
        Lo.tvs.forEach(t=>{ if(Lo.mode==='bay'&&!t.ok) add('warn','Toggles blocked by studs',`Mount ${t.i} has no clear bay wide enough for toggles within its ±${fmt(cfg.slide,2)} in slide (keep each toggle at least 2 in from a stud center). Move the display, use a wider plate, or add backing.`); }); } }
    }
    if(cfg.size>=75) add('info','Lifting',`A ${cfg.size}-inch display weighs about ${fmt(cfg.dispLb)} lb and is awkward to handle. Plan for ${cfg.size>=85?'three people or a display lift':'at least two people'}.`);
    // wall layout
    if(!M.cart){ const Lo=layout();
      if(Lo.tvs[0].L<0 || Lo.tvs[Lo.tvs.length-1].R>cfg.wallW) add('bad','Wall width',`The display${cfg.dispCount>1?'s':''} (${fmt(Lo.tvs[Lo.tvs.length-1].R-Lo.tvs[0].L,1)} in wide) don’t fit on the ${fmt(cfg.wallW,1)} in wall at this position.`);
      Lo.tvs.forEach(t=>{ if(Lo.useStuds && !t.ok) add('warn','Studs out of reach',`Mount ${t.i} can’t reach ${Lo.need===1?'a stud':'two studs'} while keeping display ${t.i} centered (it can slide only ±${fmt(cfg.slide,2)} in). Add plywood backing, use a wider wall plate, or move the display.`);
        else if(Lo.useStuds && Math.abs(t.shift)>0.05) add('ok',`Mount ${t.i} position`,`Mount ${t.i} sits ${fmt(Math.abs(t.shift),2)} in ${t.shift>0?'left':'right'} of display ${t.i}’s center to catch studs at ${t.used.map(s=>fmt(s,1)).join(' and ')} in; slide the display back to center on the mount.`);
        if(!t.box) add('warn','Recess box',`No spot for a ${fmt(cfg.boxW,1)} × ${fmt(cfg.boxH,1)} in recess box behind display ${t.i}, clear of the mount${M.studs?' and inside one stud bay':''}. Try a smaller box, or place it below the display.`); });
      if(cfg.dispCount>1 && cfg.dispGap===0) add('info','Touching bezels','Mark both mount tops with one laser line so the displays sit at exactly the same height, and use the spec sheet’s overall width, not an estimate.');
      if(cfg.dispCount>1 && cfg.tvW===0) add('warn','Display width',`Bezel-to-bezel layouts use an estimated overall width of ${fmt(Lo.tvW,2)} in. Enter the width from the display’s spec sheet.`);
    }
    // calendar and scheduling
    if(P.vendor==='teams' && cfg.calendar==='google') add('warn','Calendar and platform','Teams Rooms only read an Exchange room mailbox. With Google Calendar, the room still needs an Exchange Online resource account, and Google bookings only reach it if people invite its email address directly or you sync calendars with a third-party tool. See the Accounts and calendar tab.');
    else if(P.vendor==='meet' && cfg.calendar==='m365') add('warn','Calendar and platform','Google Meet hardware books through Google Workspace calendar resources. With Microsoft 365 calendars, you’ll need Google Workspace resources for these rooms, or a different platform.');
    else add('ok','Calendar and platform',`${P.app} works with ${cfg.calendar==='google'?'Google Calendar':'Microsoft 365'} room resources.`);
    if(cfg.scheduler && P.vendor==='meet') add('info','Scheduler app','Tap Scheduler doesn’t run a native Google Meet panel. Set it up as Logitech Room Booking or a partner app (such as Robin, Appspace or Envoy) on the room’s Google Calendar resource.');
    else if(cfg.scheduler) add('ok','Scheduler app',`Set up the Tap Scheduler as a ${SCHED_APP[P.vendor]}.`);
    // accessories
    if(accOn('podhub') && cfg.pods<2) add('info','Mic Pod Hub','The hub pays off with two or more pods, or when pod cables have to run under the table or ceiling.');
    if(cfg.acc.tvmount && cfg.acc.wallmount && (cfg.bar==='mini'||cfg.bar==='bar')) add('warn','Two bar mounts','Both the TV mount and wall mount are selected; the bar only needs one.');
    // cabling
    if(cfg.hdmiLen>15 && cfg.hdmiType==='passive') add('warn','HDMI length',`${fmt(cfg.hdmiLen)} ft is long for a passive 4K HDMI cable. Use an active or fiber (AOC) HDMI cable, or HDBaseT.`);
    if(!P.appliance && cfg.usbLen>10 && cfg.usbType==='passive') add('warn','USB length',`${fmt(cfg.usbLen)} ft is past the roughly 10 ft (3 m) limit for passive USB 3. Use an active USB extension the video bar manufacturer approves.`);
    // network & extras
    const poe=c.drops.filter(d=>d[2]).length;
    add('info','Network',`${c.drops.length} network drop${c.drops.length>1?'s':''}, ${poe} with PoE. Ask IT for the platform’s required firewall ports and a VLAN or DHCP reservation.`);
    if(!cfg.hdmiIngest && !cfg.wireless) add('warn','Content sharing','There’s no wired HDMI share and no wireless share; guests can only present by joining the meeting from their laptop.');
    if(!cfg.scheduler) add('info','Scheduling panel','A scheduling panel outside the door shows whether the room is booked and lets people book it on the spot.');
    return L;
  }
  const WHY={
    'Display size':'If people can’t read the screen from their seat, they stop looking at it and the meeting suffers.',
    'Video bar size':'A bar rated for a smaller room can’t frame or hear everyone at the far end.',
    'Platform and device':'Appliance mode needs a device that runs the meeting software; otherwise the room can’t join.',
    'Mic coverage':'Remote people hear the far end of the table as distant and quiet without enough mics.',
    'Camera height':'A camera far above eye level looks down on people and feels unnatural to remote participants.',
    'Metal studs':'A mount that pulls out of a thin steel stud can drop a display on someone.',
    'Hollow block':'Anchors in hollow block can crush the thin face and pull out.',
    'Cart load':'An overloaded cart can tip or fail.',
    'Cart size':'Outside the recommended range, the display can be unstable or overhang the base.',
    'HDMI length':'Long passive HDMI runs cause flickering, black screens or no 4K.',
    'USB length':'Long passive USB runs make the camera drop out mid-meeting.',
    'Ceiling clearance':'The equipment physically won’t fit.',
    'Bottom bezel standard':'Matching heights across rooms looks professional and keeps cameras and screens where people expect them.',
    'Hook distance not measured':'Every display and bracket combination is different; a guessed hook distance puts the mount, and the display, at the wrong height.',
    'Studs out of reach':'A mount fastened only to drywall will pull out.',
    'Recess box':'A box behind the mount plate or over a stud can’t be installed, and one outside the display’s footprint shows.',
    'Display width':'An estimated width puts touching bezels apart or overlapping.',
    'Drywall only':'Fasteners in drywall alone pull out under a display’s weight and leverage.',
    'Plaster walls':'Plaster cracks and hides the studs; short lags can end up holding only plaster.',
    'Credenza clearance':'The display or bar will physically sit on, or behind, the furniture.',
    'Calendar and platform':'If the room system can’t read its calendar, one-touch join and the scheduling panel won’t show meetings.',
    'Concrete anchors':'Lag bolts alone won’t hold in concrete; the wall plate needs proper expansion anchors.',
    'Mount capacity':'An overloaded mount can bend or pull out of the wall.',
    'Mount VESA':'The mount’s brackets won’t reach the display’s mounting holes.',
    'Mount and wall':'Residential mounts with wood-stud hardware can pull out of steel studs or masonry.',
    'Bar and full-motion mount':'If the screen moves and the camera doesn’t, remote people see the room from the wrong angle.'
  };
  const FIXES={
    'Display size':()=>{ const c=calc(); if(c.minSize){ cfg.size=c.minSize; cfg.dispLb=DISP[c.minSize].lb; } },
    'Video bar size':()=>{ cfg.bar=['huddle','mini','bar','plus'].find(k=>BARS[k].seats>=cfg.seats)||'plus'; normalize(); },
    'Platform and device':()=>{ cfg.platform = ({teams:'teamsWin',zoom:'zoomWin',meet:'meetCompute'})[PLATFORMS[cfg.platform].vendor]; },
    'Logitech Sight':()=>{ cfg.sight=false; },
    'Mic pods':()=>{ cfg.pods=BARS[cfg.bar].pods; },
    'Mic coverage':()=>{ cfg.pods=Math.min(calc().recPods, BARS[cfg.bar].pods); },
    'Camera height':()=>{ const c=calc(); if(c.camH>cfg.eyeH+37) cfg.barPos='below'; else cfg.barPos='above'; },
    'Display height':()=>{ setBottom(Math.max(cfg.standardH, cfg.tableH+6)); },
    'Bottom bezel standard':()=>{ setBottom(cfg.standardH); },
    'Credenza clearance':()=>{ if(cfg.barPos==='below') cfg.barPos='above'; if(calc().bottom<cfg.credH+cfg.credGap) setBottom(cfg.credH+cfg.credGap); },
    'Mount capacity':()=>{ cfg.model='chief'; },
    'Mount VESA':()=>{ cfg.model = cfg.model==='md2298'?'md2298xl':'chief'; },
    'Mount and wall':()=>{ cfg.model='chief'; },
    'Drywall only':()=>{ cfg.mount='plywood'; },
    'Studs out of reach':()=>{ cfg.mount='plywood'; },
    'Wall width':()=>{ cfg.centerOnWall=true; },
    'Mount size':()=>{ cfg.model='md2198'; },
    'Bar and full-motion mount':()=>{ cfg.barMount='tv'; },
    'Two bar mounts':()=>{ cfg.acc.wallmount = cfg.barMount==='wall'; cfg.acc.tvmount = cfg.barMount!=='wall'; },
    'Cart size':()=>{ if(cfg.size>75) cfg.mount='cartxl'; else if(cfg.size<70 && cfg.mount==='cartxl') cfg.mount='cart'; },
    'Metal studs':()=>{ cfg.backing=true; },
    'Hollow block':()=>{ cfg.cmuGrouted=true; },
    'HDMI length':()=>{ cfg.hdmiType='active'; },
    'USB length':()=>{ cfg.usbType='active'; },
    'Content sharing':()=>{ cfg.hdmiIngest=true; },
    'Dual displays':()=>{ cfg.dispCount=1; },
    'Nearest seat':()=>{ cfg.near=Math.ceil(cfg.size/12); }
  };
  function normalize(){
    const B=BARS[cfg.bar];
    if(!cfg.acc) cfg.acc={};
    syncBottom();
    if(cfg.pods>B.pods) cfg.pods=B.pods;
    if(!B.sight) cfg.sight=false;
    if(cfg.bar==='plus' && cfg.pods<2) cfg.pods=2;
  }
  function canFix(b){ if(!FIXES[b]) return false; const snap=JSON.stringify(cfg); let ok=false;
    try{ FIXES[b](); normalize(); ok=!checks().some(c=>c[1]===b&&(c[0]==='bad'||c[0]==='warn')); }catch(e){}
    const o=JSON.parse(snap); Object.keys(cfg).forEach(k=>delete cfg[k]); Object.assign(cfg,o); return ok; }
  function applyFixes(){ for(let i=0;i<4;i++){ checks().forEach(([t,b])=>{ if((t==='bad'||t==='warn') && FIXES[b]) FIXES[b](); }); normalize(); } }
  function issueCount(){ const l=checks(); return {bad:l.filter(c=>c[0]==='bad').length, warn:l.filter(c=>c[0]==='warn').length}; }

