  // ---------- install ----------
  function steps(){
    const c=calc(), P=c.P, B=c.B, M=c.M, D=c.D; const S=[];
    const st=(t,tools,d,v)=>S.push({t,tools,d,v});
    st('Pre-stage and confirm the design',['Laptop','Logitech Sync account'],
      [`Confirm the room has ${P.license}, and that you have admin access in the ${P.admin}.`,`Unbox and update firmware on the ${B.short}${P.appliance?'':', the '+P.compute+','} and the Tap before going on site, if you can.`,`Confirm the display’s real weight (${fmt(cfg.dispLb)} lb planned) and VESA pattern (typical ${D.vesa}).`,'Make sure the survey shows Ready to install.'],
      ['Every device powers up and takes its firmware update.','Licenses and the room account are assigned.','Survey tab shows <span class="expect">Ready to install</span>.']);
    st('Mark the layout',M.cart?['Tape measure','Painter’s tape']:['Laser level','Tape measure','Stud finder','Pencil'],
      [`Snap a vertical centerline for the display${cfg.dispCount>1?'s':''}, aligned with the seating centerline.`, M.cart?'Mark where the cart will park, centered on the seating.':`With the brackets on the display, measure from its bottom edge to the top of the hooks${c.hookMeasured?` (design value ${fmt(c.hookUsed,2)} in)`:''}. Add it to the ${fmt(c.bottom,2)} in bottom bezel${Math.abs(cfg.hookOffset)>0.01?' and the mount offset':''}, and mark the top of the mount at ${fmt(c.plateTop,2)} in from the finished floor.`,
       ...(M.cart?[]:(()=>{ const Lo=layout(); return [`From the left corner, mark the centerline at ${fmt(Lo.C,2)} in.`, ...Lo.tvs.map(t=>`Display ${t.i}: edges at ${fmt(t.L,2)} and ${fmt(t.R,2)} in. Mount ${t.i}: plate from ${fmt(t.pL,2)} to ${fmt(t.pR,2)} in${Lo.useStuds&&t.used.length?`, lags into studs at ${t.used.map(s=>fmt(s,2)).join(' and ')} in`:''}${Math.abs(t.shift)>0.05?`, then slide display ${t.i} ${fmt(Math.abs(t.shift),2)} in ${t.shift>0?'right':'left'} on the mount`:''}.${t.box?` Recess box centered at ${fmt(t.box.x,2)} in, from ${fmt(t.box.bot,2)} to ${fmt(t.box.top,2)} in high.`:''}`)]; })()),
       `Mark the video bar ${cfg.barPos} the display, with the camera at about ${fmt(c.camH,1)} in.`, ...(M.cart?[]:[`Mark ${M.studs?'every stud center':'the anchor locations'} inside the plate area.`]), ...(cfg.credenza&&!M.cart?[`Confirm the bottom bezel clears the ${fmt(cfg.credH)} in credenza by at least 2 in.`]:[])],
      [M.cart?'The parking spot is centered on the seating and near power and network.':'Marks are level (check with the laser).', `Display center is on the room’s seating centerline.`]);
    if(M.cart){
      st('Assemble the cart',['Assembly tools supplied with the cart','Torque or hex driver'],
        ['Assemble the cart per Heckler’s instructions, with the casters installed and locked.', cfg.mount==='cart'&&!cartVesa().direct?`Fit the H497 VESA adapter kit for the display’s ${D.vesa} pattern to the cart rails first, then set the rail height so the screen bottom lands at the planned height.`:'Set the display rail height so the screen bottom lands at the planned height.','Install the device panel for the compute or power strip, and the soundbar mount for the video bar.'],
        ['Every bolt is tight; the cart doesn’t rack when pushed at the top.','Casters lock and hold the cart still.']);
    } else {
      let mt={wood:['Drill pilot holes at stud center, the size the mount manufacturer specifies.','Drive lag bolts through the mount into at least two studs, snug but not stripped.'],
        metal:cfg.backing?['Fasten the mount through the drywall into the backing, with screws the mount manufacturer specifies.']:['Use the mount manufacturer’s steel-stud kit or toggles rated for steel studs, spread across as many studs as the mount allows.'],
        concrete:['Drill with a hammer drill to the anchor manufacturer’s diameter and depth.','Blow out the dust, set the wedge or sleeve anchors, and torque to spec.'],
        plywood:['Find the studs behind the plywood backing.','Drive the mount’s lag bolts through the plywood into the studs, plus any extra screws the mount manufacturer allows into the plywood.'],
        plaster:['Find studs with a strong magnet on the lath nails, or a small test hole.','Drill through the plaster with a masonry bit, then pilot into the stud with a wood bit.','Drive lag bolts long enough to get full thread engagement in the stud past the plaster.'],
        drywall:['Stop: don’t mount on drywall alone. Open the wall and add plywood backing between the studs, or move the display to studs or masonry.'],
        brick:['Drill into the face of solid brick with a hammer drill, never into mortar joints, and keep holes away from brick edges.','Blow out the dust, set sleeve anchors, and torque to the anchor manufacturer’s spec.'],
        cmu:cfg.cmuGrouted?['Drill into the solid face or grouted cells, never a mortar joint.','Set sleeve anchors and torque to the anchor manufacturer’s spec.']:['Use anchors made for hollow block or through-bolts, or grout the cells first.']}[cfg.mount];
      let mtools=[c.MD.name+' instructions','Drill and driver', M.masonry||cfg.mount==='plaster'?'Hammer drill, masonry bits, blow-out bulb':'Wood or metal bits','Level','Socket set or torque wrench'];
      let mval=['Wall plate is level and doesn’t move when pulled hard by hand.', M.masonry?'Every anchor reached its torque without spinning.':'Every fastener went into solid material (stud or backing), not just drywall.'];
      if(c.MD.manual && c.MD.walls.includes(cfg.mount)){
        mtools=['MD2198 manual and mounting template','Stud finder','Pencil and awl','Drill',cfg.mount==='concrete'?'3/8 in (10 mm) masonry bit and hammer':'7/32 in (5.5 mm) wood bit','1/2 in (13 mm) socket wrench','Level (in the box)','Tape measure'];
        mt = cfg.mount==='concrete'
          ? ['Hold the wall plate level with its arrow pointing UP and mark the four holes.','Drill four 3/8 in (10 mm) holes 2.5 in (65 mm) deep.','Tap in four 10 × 50 mm concrete anchors (not in the box), then drive the M8 × 60 mm lag bolts with a 1/2 in (13 mm) socket until firm.']
          : ['Find two wood studs (16, 18 or 24 in centers, at least 2 × 4) and confirm the drywall is no thicker than 5/8 in (16 mm).','Hold the wall plate level with its arrow pointing UP and mark four holes on the stud centers.','Drill four 7/32 in (5.5 mm) pilot holes 2.5 in (65 mm) deep.','Drive the four M8 × 60 mm lag bolts with a 1/2 in (13 mm) socket until firm. Don’t use anchors in wood studs.'];
        mval=['All four lag bolts are firmly tightened and the plate doesn’t move.','The arrow on the wall plate points up.','The manual’s wall plate integrity test passes before the display is hung.'];
      }
      { const ak=AK(); if(ak){ const S=ANCH_STEPS(ak); mt=S.steps; mtools=mtools.concat(S.tools); mval=S.val; } }
      st('Install the wall mount',mtools,
        mt.concat([`Center the plate at ${fmt(c.plateC,1)} in and level it before final tightening.`, ...(c.MD.type==='Full motion'?['Full-motion arm: set the arm fully retracted and square to the wall for a conference room, and tighten the swivel and tilt locks.']:[])]),
        mval);
    }
    st('Hang the display',['Display VESA brackets and screws','Helpers or a display lift'],
      (c.MD.manual&&!M.cart)?['Pick the TV screws (M4, M6 or M8), washers and spacers with the manual’s chart; if an M6 or M8 screw needs the 2.5 mm spacer, remove the spacer’s inner ring.',`Attach the TV brackets to the display’s VESA ${D.vesa} holes.`,'Fit the supporting bars, then hang the display on the wall plate with two people and lock the safety screws.','Adjust: level ±3° with the two leveling bolts (loosen no more than 2 turns), tilt +5°/−15° with the handle, and slide up to 8 in side to side by loosening the four bolts (two people).']
      :[`Attach the mount’s brackets to the display with the right-length screws for its VESA ${D.vesa} pattern.`,`Lift the display onto the ${M.cart?'cart rails':'wall plate'} with ${cfg.size>=85?'three people or a lift':cfg.size>=75?'at least two people, ideally three':'two people'}.`,'Engage the safety locks or screws that stop the display lifting off.'],
      ['The display is level and the safety locks are engaged.',`Bottom of the screen is at about ${fmt(cfg.dispBottom)} in.`]);
    st('Mount the video bar and table devices',['Drill and driver','Logitech mounts in the box'],
      [cfg.bar==='plus'?`Mount the Rally PTZ camera ${cfg.barPos} the display center${accOn('mountkit')?' with the Rally Mounting Kit':''} and the two speakers either side; mount the display hub behind the display.`:cfg.bar==='huddle'?`Mount the Rally Bar Huddle ${cfg.barPos} the display with its multi-mount, level and centered.`:cfg.bar==='bar2'?`Mount the Rally Bar 2 ${cfg.barPos} the display with Logitech’s mount for it, level and centered.`:`Mount the ${B.short} ${cfg.barPos} the display with the ${cfg.barMount==='wall'?'wall mount':'TV mount'} for video bars, level and centered.`,
       ...(accOn('tapriser')?['Fit the Tap on the Tap Riser Mount.']:accOn('taptable')?['Fix the Tap with the Tap Table Mount; run its cable through the grommet.']:accOn('tapwall')?['Mount the Tap on the Tap Wall Mount.']:[]),
       ...(accOn('podhub')?['Mount the Mic Pod Hub under the table and run each pod cable to it.']:[]), ...(accOn('podmount')?['Fix the mic pods with the mic pod mounts.']:[]),
       ...(accOn('scribe')?['Mount Logitech Scribe on the wall opposite the whiteboard, per its install guide.']:[]), ...(accOn('swytch')?['Place the Swytch connector at the table where guests sit.']:[]),
       P.appliance?((accOn('tapriser')||accOn('taptable')||accOn('tapwall'))?`Connect the ${cfg.tapGen==='2'?'Tap IP 2':'Tap IP'} to its PoE drop.`:`Place the ${cfg.tapGen==='2'?'Tap IP 2':'Tap IP'} on the table.`):P.mac?'Mount the Mac mini behind the display or in the credenza on a Mac mini mount, with its vents clear, and set the iPad on a powered stand or table mount.':`Mount the ${P.compute} behind the display with the compute mount, or on the ${M.cart?'cart’s device panel':'wall'}.`,
       ...(cfg.pods?[`Place ${cfg.pods} Rally Mic Pod${cfg.pods>1?'s':''} down the table center, evenly spaced.`]:[]), ...(cfg.sight?['Place Logitech Sight in the middle of the table.']:[]),
       ...(cfg.scheduler?[`Mount the ${cfg.schedGen==='2'?'Tap Scheduler 2':'Tap Scheduler'} outside the door at about 48 in, on the ${SCHED_MOUNTS[cfg.schedMount].charAt(0).toLowerCase()+SCHED_MOUNTS[cfg.schedMount].slice(1)}.`]:[])],
      ['The camera sees every seat on its preview (check later).','Table devices sit where cables can reach them without crossing walkways.']);
    st('Run and connect the cables',['Cable tester','PoE tester','Label maker','Hook-and-loop ties'],
      cables().map(r=>`${r[0]} to ${r[1]}: ${r[2]}${r[3]?` (${/^[A-Z][a-z]/.test(r[3])?r[3].charAt(0).toLowerCase()+r[3].slice(1):r[3]})`:''}.`).concat(['Label both ends of every cable, and leave a service loop behind the display.']),
      ['Every network drop passes a cable test; PoE ports deliver power.','No cable is strained or pinched by the mount.']);
    st('Power up and enroll',['Laptop','Admin access'],
      [P.appliance?`Power the ${B.short}, pair the ${cfg.tapGen==='2'?'Tap IP 2':'Tap IP'}, and ${SIGNIN[P.vendor]}.`:`Power the ${P.compute} and ${P.mac?'iPad':'Tap'}, then ${SIGNIN[P.vendor]}.`, ...(P.mac?['On the Mac mini: create a dedicated local user that logs in automatically, set it never to sleep, turn on “Start up automatically after a power failure”, and install Zoom Rooms.','On the iPad: install Zoom Rooms Controller, pair it with the room’s pairing code, and keep it on power.']:[]),'Follow the Accounts and calendar tab for the room’s calendar.','Add every device to Logitech Sync and update firmware.','On the display: turn on HDMI-CEC, set the right input, and turn off eco modes that switch off the HDMI port.'],
      ['The room shows online in '+P.admin+'.','The display wakes when the room starts a meeting.']);
    st('Tune and test',['Laptop','Phone for a test call'],
      ['Check the camera framing with everyone seated; adjust tilt or the RightSight setting.','Make a test call to someone outside the room: check every seat can be heard clearly and there’s no echo.','Test wired and wireless sharing.'],
      ['Every acceptance test passes (see the Acceptance test tab).']);
    st('Clean up and hand off',['Vacuum','Labels'],
      ['Dress all cables, clean screens and surfaces.','Train the client on joining meetings, sharing content and getting support; leave the quick-start card on the table.','Record serial numbers, MAC addresses and the location of each device for the as-built documentation.'],
      ['The room looks finished, with no loose cables.','The client representative has signed the acceptance sign-off.']);
    return S;
  }
  function cables(){
    const c=calc(), P=c.P, B=c.B; const R=[];
    const src=P.appliance?B.short:P.compute.split(' (')[0];
    for(let i=0;i<cfg.dispCount;i++) R.push([src+' HDMI out'+(cfg.dispCount>1?' '+(i+1):''),'Display '+(i+1)+' HDMI in',(cfg.hdmiType==='active'?'Active HDMI or active optical cable (AOC), ':'Premium High Speed HDMI (18 Gbps), ')+fmt(cfg.hdmiLen)+' ft',cfg.hdmiType==='active'?'Directional: install the source end at the source':'']);
    if(!P.appliance){ R.push([B.short+' USB','Room PC USB', (cfg.usbType==='active'?'Manufacturer-approved active USB extension, ':'USB 3.x (5 Gbps) cable, ')+fmt(cfg.usbLen)+' ft','']);
      if(P.mac) R.push(['iPad controller','Room network','Wi-Fi, or an Ethernet adapter','Keep the iPad on a powered stand or mount']);
      else R.push(['Tap','Room PC','Tap Cat5e kit, '+fmt(cfg.tapLen)+' ft','USB extension over Cat5e']);
      if(accOn('strongusb')) R[R.length-2][2]='Logitech Strong USB cable, '+fmt(cfg.usbLen)+' ft';
      R.push(['Room PC','Network drop','Cat6 patch cable','']); }
    R.push([B.short,'Network drop','Cat6 patch cable',P.appliance?'Required: runs the room system':'For Logitech Sync device management']);
    if(P.appliance) R.push([cfg.tapGen==='2'?'Tap IP 2':'Tap IP','PoE network drop','Cat6 patch cable','Powered by PoE']);
    if(cfg.pods) R.push([`${cfg.pods} × ${B.podName}`, accOn('podhub')?'Rally Mic Pod Hub':B.short+(cfg.bar==='plus'?' table hub':''),'Mic pod cables (included)'+(accOn('podext')?', plus extension cables':''), accOn('podhub')?'Home-run to the hub':'Daisy-chained']);
    if(accOn('podhub')) R.push(['Rally Mic Pod Hub',B.short+(cfg.bar==='plus'?' table hub':''),'Mic pod cable','']);
    if(accOn('scribe')) R.push(['Logitech Scribe',P.appliance?B.short:'Compute','Per Logitech’s Scribe install guide','Check platform support']);
    if(accOn('swytch')) R.push(['Logitech Swytch',P.appliance?B.short:'Compute','Per Logitech’s Swytch install guide','Check support in your mode']);
    if(cfg.sight) R.push(['Logitech Sight',B.short,'Sight cable (included)','']);
    if(cfg.bar==='plus') R.push(['Rally table hub','Rally display hub','Cat6 (supplied lengths or longer per Logitech)','']);
    if(cfg.hdmiIngest) R.push(['Laptop HDMI at the table',P.appliance?B.short+' HDMI in':P.mac?'USB HDMI capture device on the Mac mini':'Tap HDMI in','HDMI table cable with USB-C adapter ring',P.mac?'Use a Zoom Rooms–supported capture device':'']);
    if(cfg.scheduler) R.push([cfg.schedGen==='2'?'Tap Scheduler 2':'Tap Scheduler','PoE network drop','Cat6 patch cable','Powered by PoE']);
    if(cfg.wireless) R.push(['Wireless share base','Network drop, plus HDMI or USB per the manufacturer','Cat6 patch cable','Follow the manufacturer’s connection guide']);
    R.push(['All powered devices','Receptacles behind the display','Manufacturer-supplied power cords','Use a surge-protective power strip']);
    return R;
  }
  function tools(){ const t=[['Laser level','marking a level display line.'],['Stud finder with AC detection','finding studs and hidden wiring.'],['Drill and driver','mount and device installation.'],['Socket set or torque wrench','lag bolts and anchors to spec.'],['Cable tester and PoE tester','verifying every network drop.'],['Label maker','labeling both ends of every cable.'],['Laptop with HDMI and USB-C','content sharing tests and admin.'],['Hook-and-loop ties and cable management','neat, serviceable cable runs.']];
    if(calc().M.masonry||cfg.mount==='plaster') t.push(['Hammer drill, masonry bits, blow-out bulb','holes in concrete, block, brick or plaster.']);
    if(calc().M.cart) t.push(['Hex keys from the cart kit','cart assembly.']);
    if(cfg.size>=75) t.push(['Display lift or extra helpers',`lifting a ${cfg.size}-inch display safely.`]);
    if(calc().MD.manual && !calc().M.cart) t.push(['MD2198 tools from the manual','pencil, Phillips screwdriver, drill, 1/2 in (13 mm) socket wrench, stud finder, awl, 7/32 in (5.5 mm) wood bit or 3/8 in (10 mm) masonry bit, hammer and tape measure.']);
    t.push(['Tape measure and the display spec sheet','overall height, bezel and VESA position for the height calculator.']);
    return t; }
  function calendarGuide(){
    const c=calc(), P=c.P, v=P.vendor, g=cfg.calendar==='google', room=RN.value||'the room';
    const sec=(title,items,note)=>`<div class="svgroup"><h3>${title}</h3><ol class="plain">${items.map(t=>`<li>${t}</li>`).join('')}</ol>${note?`<p class="hint" style="margin-top:6px">${note}</p>`:''}</div>`;
    let h='';
    if(g) h+=sec('1. Create the room in Google Workspace',[
      'In the Google Admin console, go to Directory, then Buildings and resources, then Manage resources.',
      `Add the building and floor if they don’t exist, then add a resource for ${room}: name, type, capacity (${cfg.seats}) and features such as “Video conferencing”.`,
      'The resource gets its own calendar email address; people book it from the Rooms tab in Google Calendar.']);
    else h+=sec('1. Create the room in Microsoft 365',[
      `Create a room resource account (room mailbox) for ${room} in the Microsoft 365 admin center or Exchange Online, with capacity ${cfg.seats}.`,
      v==='teams'?'Use the same account as the Teams Rooms resource account: give it a password, set the password not to expire, and assign a Teams Rooms Pro or Basic license.':'People book the room by inviting its email address from Outlook.']);
    if(v==='teams'){
      if(g) h+=sec('2. Teams Rooms with Google Calendar',[
        'Teams Rooms only read an Exchange room mailbox, so create an Exchange Online resource account for the room anyway, with a Teams Rooms license.',
        'Pick how Google users will book it: invite the room’s Exchange email address as a guest from Google Calendar, or sync the Google resource to the Exchange mailbox with a third-party calendar sync tool.',
        'For guest invites to be accepted, set the mailbox to process external meeting requests (Set-CalendarProcessing with ProcessExternalMeetingMessages $true) and to keep the meeting body so the join link survives.',
        'Test: book a Teams meeting from Google Calendar and confirm the Join button appears on the Tap.'],'The Google Calendar resource and the Exchange mailbox are separate; make sure people know which one to book, or bookings will be missed.');
      else h+=sec('2. Configure the Teams Rooms account',[
        'In Exchange Online PowerShell, set calendar processing for the room: AutomateProcessing AutoAccept, AddOrganizerToSubject $false, DeleteSubject $false, RemovePrivateProperty $false, ProcessExternalMeetingMessages $true, DeleteAttachments $true.',
        'Sign in on the device with the resource account’s user principal name and password.',
        'Confirm the room shows healthy in the Teams admin center (or Teams Rooms Pro Management portal).']);
    }
    if(v==='zoom'){
      if(g) h+=sec('2. Connect Zoom Rooms to Google Calendar',[
        'Create a dedicated Google user to manage the room calendars (don’t use a person’s own account).',
        'Share each room’s calendar resource with that user, with “Make changes and manage sharing”.',
        'In the Zoom web portal, go to Room Management, then Calendar Integration, then Add Calendar Service, choose Google Calendar, and sign in as the dedicated user.',
        `In Room Management, then Zoom Rooms, add ${room}, open its settings and pick its calendar resource from the list.`,
        'Install the Zoom for Google Workspace add-on so meetings booked in Google Calendar carry a Zoom link.']);
      else h+=sec('2. Connect Zoom Rooms to Microsoft 365',[
        'Create a dedicated, licensed Microsoft 365 service account with a mailbox for the integration.',
        'Give it delegate or impersonation access to each room mailbox.',
        'In the Zoom web portal, go to Room Management, then Calendar Integration, then Add Calendar Service, choose Office 365, and sign in as the service account.',
        `Add ${room} under Room Management, then Zoom Rooms, and pick its room mailbox as the calendar resource.`]);
      h+=sec('3. Activate the room',['In the Zoom web portal, open the room and copy its activation code.',P.mac?'Install Zoom Rooms on the Mac mini, enter the activation code, then install Zoom Rooms Controller on the iPad and pair it with the room’s pairing code.':`Enter the code on the ${P.appliance?c.B.short:'Tap'} to activate the room.`]);
    }
    if(v==='meet'){
      if(g) h+=sec('2. Enroll the Google Meet hardware',[
        'Make sure a Google Meet hardware license is available in the Admin console.',
        `On the ${P.appliance?c.B.short:'Meet Compute'}, start enrollment and sign in with an admin account (or use the enrollment code shown in the Admin console).`,
        'In the Admin console, go to Devices, then Google Meet hardware, open the device and assign it to the room’s calendar resource.',
        'Confirm the room shows its upcoming meetings on the Tap.']);
      else h+=sec('2. Google Meet with Microsoft 365 calendars',[
        'Google Meet hardware books through Google Workspace calendar resources, so create a Google Workspace resource for this room.',
        'Decide how Microsoft 365 users will book it, or consider Zoom Rooms or Teams Rooms instead.'],'Talk this through with IT before ordering hardware.');
    }
    if(cfg.scheduler){
      const gen=cfg.schedGen==='2'?'Tap Scheduler 2':'Tap Scheduler';
      const steps = v==='teams' ? [`Set the ${gen} up as a Microsoft Teams Panel and sign in with the room’s resource account.`,'Check the panel license your organization needs for Teams Panels.','Confirm the LED shows green when free and red when booked.']
        : v==='zoom' ? [`Set the ${gen} up as a Zoom Rooms Scheduling Display and pair it with ${room} from the Zoom web portal.`,'Confirm it shows the same calendar as the room.']
        : [`Set the ${gen} up as Logitech Room Booking or a partner app (Robin, Appspace, Envoy and others) connected to the room’s ${g?'Google Calendar resource':'calendar'}.`,'Logitech’s supported list for Tap Scheduler doesn’t include a native Google Meet panel, so confirm the app you choose before ordering.'];
      h+=sec(`${v==='zoom'?4:3}. Scheduling panel`,steps.concat([`Mount: ${SCHED_MOUNTS[cfg.schedMount]}.`]));
    }
    h+=sec('Check before you leave',['Book a test meeting from the calendar and confirm it appears on the Tap and the scheduling panel.','One-touch join works for the test meeting.','Walk-up booking on the panel shows up in the calendar.']);
    document.getElementById('calendarGuide').innerHTML=h;
  }
  function acceptTests(){
    return [['join','Join a scheduled meeting','One touch on the Tap joins the next booked meeting.'],['adhoc','Place an ad hoc call','A call to an external participant connects with two-way audio and video.'],['audio','Audio pickup from every seat','The far end hears the closest and farthest seats at similar levels, with no echo.'],['video','Camera framing','Every seat is in frame; automatic framing follows the occupied seats.'],
      ...(cfg.hdmiIngest?[['wired','Wired content sharing (HDMI)','A laptop shares within a few seconds of being connected.']]:[]),...(cfg.wireless?[['wless','Wireless share','A guest laptop shares through the share base.']]:[]),
      ['wake','Display power-on (HDMI-CEC)','The display turns on and switches input when the room starts a meeting.'],['vol','Volume and mute','Volume and mute controls on the Tap work, and mute status shows on the video bar.'],
      ...(cfg.scheduler?[['sched','Scheduling panel','The panel shows the room’s bookings and supports walk-up booking.']]:[]),['reboot','Recovery after power loss','After power is removed and restored, the room comes back online without intervention.']];
  }
  function renderInstall(){
    calendarGuide();
    const S=steps(); const nd=S.filter(x=>done[x.t]).length; STEPSTAT={total:S.length,done:nd}; const cur=S.findIndex(x=>!done[x.t]);
    document.getElementById('stepsProg').innerHTML=`<span class="big">${nd===S.length?'All steps done':`Step ${Math.min(nd+1,S.length)} of ${S.length}`}</span><span>${nd} done</span><span class="progress" aria-hidden="true"><i style="width:${Math.round(nd/S.length*100)}%"></i></span>${SVSTAT.no?`<button type="button" class="chip bad" data-go="survey">Survey has ${SVSTAT.no} blocker${SVSTAT.no>1?'s':''}: resolve before starting →</button>`:''}`;
    document.getElementById('tools').innerHTML=tools().map(([a,b])=>`<li><b>${a}:</b> ${b}</li>`).join('');
    document.getElementById('steps').innerHTML=S.map((x,i)=>`<li class="${done[x.t]?'done':''} ${i===cur?'current':''}"><div class="step-h"><span class="num">${i+1}</span><h4>${x.t}</h4><label><input type="checkbox" data-step="${x.t}" ${done[x.t]?'checked':''}> Done</label></div>
      <div class="stepgrid"><div><div class="sub">Do</div><ul class="plain">${x.d.map(t=>`<li>${t}</li>`).join('')}</ul></div><div><div class="sub">Tools</div><ul class="plain">${x.tools.map(t=>`<li>${t}</li>`).join('')}</ul><div class="sub">Check</div><ul class="plain">${x.v.map(t=>`<li>${t}</li>`).join('')}</ul></div></div></li>`).join('');
    // equipment
    const c=calc(), P=c.P, B=c.B, M=c.M;
    const row=(dev,type,list,pick,spec)=>`<tr><td>${dev}</td><td>${type}</td><td>${spec}</td><td>${list.map((b,i)=>i===pick?`<span class="pick">${b}</span>`:b).join('; ')}</td></tr>`;
    const E=[];
    E.push(row('Meeting platform',P.name,[P.name],0,`Requires ${P.license}`));
    E.push(row('Video conferencing device',B.name,BRANDS.bar,0,`${B.room.charAt(0).toUpperCase()+B.room.slice(1)} rooms, up to ${B.seats} people`));
    if(P.mac) E.push(row('Touch controller','iPad with the Zoom Rooms Controller app',['Apple iPad (Zoom Rooms Controller)','Logitech Tap (check Zoom’s supported controllers for Mac)'],0,'Pairs with the room over the network'));
    else E.push(row('Touch controller',P.appliance?(cfg.tapGen==='2'?'Logitech Tap IP 2':'Logitech Tap IP'):'Logitech Tap with Cat5e kit',BRANDS.ctrl,0,P.appliance?'PoE powered; pairs over the network':'Connects to the room PC'));
    if(!P.appliance) E.push(row('Room PC (compute)',P.compute,BRANDS.compute[P.vendor],0,`Certified for ${P.app}`));
    E.push(row('Display',`${cfg.dispCount} × ${cfg.size}-inch commercial display`,BRANDS.disp,0,`About ${fmt(cfg.dispLb)} lb each; VESA ${c.D.vesa} (typical)`));
    if(M.cart&&cfg.mount==='cart'&&!cartVesa().direct&&cartVesa().kit) E.push(row('VESA adapter kit','Heckler H497 VESA Adapter Kit',['Heckler H497 VESA Adapter Kit'],0,`Adapts the cart’s VESA 400 rails to the display’s ${c.D.vesa} pattern`));
    E.push(M.cart?row('Cart',M.name,BRANDS.cart,cfg.mount==='cart'?0:1,`Recommended ${M.min}–${M.max} in, up to ${M.cap} lb`):row('Wall mount',c.MD.name,BRANDS.mount,cfg.model.startsWith('md')?0:cfg.model.startsWith('eg')?1:({chief:2,peerless:3,sanus:4,premier:5})[cfg.model],`${c.MD.cap?'Rated '+c.MD.cap+' lb':'Rated for at least '+fmt(c.load)+' lb'}, on ${M.short}`));
    ACC.filter(a=>accOn(a.id)).forEach(a=>E.push(row('Logitech accessory',a.name,[a.name],0,a.desc)));
    if(cfg.pods) E.push(row('Microphones',`${cfg.pods} × ${B.podName}`,BRANDS.mic,0,'Tabletop microphones'));
    if(cfg.sight) E.push(row('Tabletop camera','Logitech Sight',['Logitech Sight'],0,'Center-of-table camera view'));
    if(cfg.scheduler) E.push(row('Room scheduling panel',cfg.schedGen==='2'?'Logitech Tap Scheduler 2':'Logitech Tap Scheduler',BRANDS.sched,0,`PoE powered; runs as a ${SCHED_APP[P.vendor]}; ${SCHED_MOUNTS[cfg.schedMount].toLowerCase()}`));
    if(cfg.wireless) E.push(row('Wireless presentation','Wireless presentation system',BRANDS.share,0,'Network connected'));
    document.getElementById('equip').innerHTML=`<thead><tr><th>Device</th><th>Type</th><th>Spec for this room</th><th>Example products</th></tr></thead><tbody>${E.join('')}</tbody>`;
    document.getElementById('cables').innerHTML=`<thead><tr><th>From</th><th>To</th><th>Cable</th><th>Notes</th></tr></thead><tbody>${cables().map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody>`;
    const tests=acceptTests();
    document.getElementById('accept').innerHTML=`<thead><tr><th>Test</th><th>Expected</th><th>Result</th><th>Notes</th></tr></thead><tbody>${tests.map(([k,a,b])=>`<tr><td><b>${a}</b></td><td>${b}</td><td><select class="meas" data-res="${k}" aria-label="Result for ${a}"><option value="">Not run</option><option ${results[k]==='Pass'?'selected':''}>Pass</option><option ${results[k]==='Fail'?'selected':''}>Fail</option></select></td><td><input class="meas" style="width:160px" data-note="${k}" value="${(results[k+'_n']||'').replace(/"/g,'&quot;')}" aria-label="Notes for ${a}"></td></tr>`).join('')}</tbody>`;
  }

