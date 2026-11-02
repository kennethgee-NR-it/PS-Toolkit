  // ---------- catalog ----------
  const PLATFORMS={
    teamsWin:{name:'Microsoft Teams Rooms on Windows', short:'Teams Rooms, Windows', compute:'Lenovo ThinkSmart Core Gen 2', appliance:false, admin:'Teams admin center and Logitech Sync', license:'a Microsoft Teams Rooms license and a resource account', vendor:'teams', app:'Teams Rooms'},
    teamsAndroid:{name:'Microsoft Teams Rooms on Android', short:'Teams Rooms, Android', compute:null, appliance:true, admin:'Teams admin center and Logitech Sync', license:'a Microsoft Teams Rooms license and a resource account', vendor:'teams', app:'Teams Rooms'},
    zoomWin:{name:'Zoom Rooms on Windows', short:'Zoom Rooms, Windows', compute:'Lenovo ThinkSmart Core Gen 2', appliance:false, admin:'Zoom web portal and Logitech Sync', license:'a Zoom Rooms license', vendor:'zoom', app:'Zoom Rooms'},
    zoomMac:{name:'Zoom Rooms on Mac (Mac mini)', short:'Zoom Rooms, Mac mini', compute:'Apple Mac mini', appliance:false, mac:true, admin:'Zoom web portal and Logitech Sync', license:'a Zoom Rooms license', vendor:'zoom', app:'Zoom Rooms'},
    zoomAndroid:{name:'Zoom Rooms Appliance (Android)', short:'Zoom Rooms, appliance', compute:null, appliance:true, admin:'Zoom web portal and Logitech Sync', license:'a Zoom Rooms license', vendor:'zoom', app:'Zoom Rooms'},
    meetCompute:{name:'Google Meet with Meet Compute', short:'Google Meet, compute', compute:'Google Meet Compute (CTL or ASUS)', appliance:false, admin:'Google Admin console and Logitech Sync', license:'a Google Meet hardware license', vendor:'meet', app:'Google Meet'},
    meetAndroid:{name:'Google Meet on Android', short:'Google Meet, Android', compute:null, appliance:true, admin:'Google Admin console and Logitech Sync', license:'a Google Meet hardware license', vendor:'meet', app:'Google Meet'}
  };
  const BARS={
    huddle:{name:'Logitech Rally Bar Huddle', short:'Rally Bar Huddle', seats:6, pods:0, fov:110, lb:3, width:22, h:3.5, dual:false, sight:false, appliance:true, room:'huddle to small', podName:'Rally Mic Pod', mounts:'Multi-mount in the box: table, wall, above or below the display, or tripod'},
    mini:{name:'Logitech Rally Bar Mini', short:'Rally Bar Mini', seats:12, pods:3, fov:110, lb:5, width:28, h:3.5, dual:true, sight:true, appliance:true, room:'small to medium', podName:'Rally Mic Pod', mounts:'TV mount or wall mount for video bars'},
    bar:{name:'Logitech Rally Bar', short:'Rally Bar', seats:20, pods:3, fov:85, lb:16, width:36, h:6.5, dual:true, sight:true, appliance:true, room:'medium to large', podName:'Rally Mic Pod', mounts:'TV mount or wall mount for video bars'},
    bar2:{name:'Logitech Rally Bar 2', short:'Rally Bar 2', seats:20, pods:3, fov:115, lb:12, width:36, h:5, dual:true, sight:false, appliance:true, room:'medium to large', podName:'Rally Mic Pod 2', mounts:'Rally Bar 2 mounting options (see Logitech’s spec)', isNew:true},
    plus:{name:'Logitech Rally Plus (Rally PTZ camera, two speakers, two mic pods, hubs)', short:'Rally Plus (PTZ)', seats:46, pods:7, fov:85, lb:6, width:8, h:6, dual:true, sight:false, appliance:false, room:'large to extra large', podName:'Rally Mic Pod', mounts:'Rally Mounting Kit for the camera and speakers'}
  };
  const DISP={55:{h:26.97,w:47.94,lb:40,vesa:'300 × 300'},65:{h:31.87,w:56.65,lb:55,vesa:'400 × 400'},75:{h:36.77,w:65.37,lb:80,vesa:'400 × 400'},85:{h:41.68,w:74.09,lb:110,vesa:'600 × 400'}};
  const MOUNTS={
    wood:{name:'Drywall on wood studs', short:'wood studs', fam:'framed', studs:true},
    metal:{name:'Drywall on metal studs', short:'metal studs', fam:'framed', studs:true},
    plywood:{name:'Drywall with plywood backing', short:'plywood backing', fam:'framed', studs:true},
    plaster:{name:'Plaster and lath over wood studs', short:'plaster over studs', fam:'framed', studs:true},
    drywall:{name:'Drywall only, no stud or backing', short:'drywall only', fam:'framed'},
    concrete:{name:'Poured concrete', short:'concrete', fam:'masonry', masonry:true},
    cmu:{name:'Concrete masonry unit, CMU block', short:'concrete block', fam:'masonry', masonry:true},
    brick:{name:'Solid brick', short:'brick', fam:'masonry', masonry:true},
    cart:{name:'Heckler AV Cart Prime H700', short:'Heckler AV Cart Prime', fam:'cart', cart:true, cap:300, min:50, max:75},
    cartxl:{name:'Heckler AV Cart XL for 70 to 105 in displays', short:'Heckler AV Cart XL', fam:'cart', cart:true, cap:220, min:70, max:105}
  };
  const SIGNIN={teams:'sign in to Teams Rooms with the room’s resource account', zoom:'activate Zoom Rooms with the room’s activation code from the Zoom web portal', meet:'enroll the device in the Google Admin console and assign it to the room’s calendar resource'};
  const SCHED_APP={teams:'Microsoft Teams Panel', zoom:'Zoom Rooms Scheduling Display', meet:'Logitech Room Booking or a partner app such as Robin or Appspace'};
  const SCHED_MOUNTS={wall:'Wall or drywall (multi-surface mount, in the box)', glass:'Glass (multi-surface mount, in the box)', mullion:'Door or window mullion (mullion mount, in the box)', corner:'Corner (corner mount accessory, in the box)', angle:'Angled wall mount (sold separately)'};
  const MODELS={
    md2198:{plateW:26, slide:4, name:'Mounting Dream MD2198 full-motion mount', short:'MD2198', type:'Full motion', cap:132, vesa:[600,400], vesaMin:[200,100], sizes:'per the manual: VESA 200×100 to 600×400, up to 132 lb', depth:3.2, ext:18.9, plateH:16, walls:['wood','concrete'], manual:true, note:'From the MD2198 manual: wood studs or solid concrete only, never drywall alone. Tilt +5°/−15°, swivel ±45°, level ±3°, 8 in side shift. Concrete anchors (10 × 50 mm) aren’t in the box.'},
    md2298:{plateW:26, slide:4, name:'Mounting Dream MD2298 full-motion mount', short:'MD2298', type:'Full motion', cap:132, vesa:[600,400], sizes:'42 to 90 in (maker’s listing)', depth:2.6, ext:18.3, plateH:16, woodOnly:true, note:'Swivels ±45°, tilts +5°/−15°, extends 2.6 to 18.3 in. Fits 16, 18 or 24 in wood studs.'},
    md2298xl:{plateW:26, slide:4, name:'Mounting Dream MD2298-XL full-motion mount', short:'MD2298-XL', type:'Full motion', cap:132, vesa:[800,400], sizes:'42 to 90 in (maker’s listing)', depth:2.6, ext:18.5, plateH:16, woodOnly:true, note:'Like the MD2298, with VESA up to 800 × 400. Fits 16, 18 or 24 in wood studs.'},
    md2380:{plateW:18, slide:0, name:'Mounting Dream MD2380 dual-arm full-motion mount', short:'MD2380', type:'Full motion', cap:99, vesa:[400,400], sizes:'32 to 65 in', depth:3, ext:null, plateH:12, woodOnly:true, note:'For smaller displays. Fits 16 in wood studs.'},
    eglf2:{name:'Echogear EGLF2 dual-arm full-motion mount', short:'Echogear EGLF2', type:'Full motion', cap:125, vesa:null, sizes:'42 to 90 in', depth:2.4, ext:null, plateH:16, note:'Dual-arm full motion for 42 to 90 in displays up to 125 lb; collapses to about 2.4 in. Check its manual for VESA range and wall types.'},
    egmf2:{plateW:6, slide:0, name:'Echogear EGMF2 single-arm full-motion mount', short:'Echogear EGMF2', type:'Full motion', cap:60, vesa:[400,400], sizes:'32 to 60 in', depth:3, ext:20, plateH:10, singleStud:true, note:'Single-arm, single-stud full motion for 32 to 60 in displays up to 60 lb; VESA 100 × 100 to 400 × 400; extends 20 in.'},
    chief:{plateW:24, slide:3, name:'Chief Fusion fixed or tilt mount', short:'Chief Fusion', type:'Fixed or tilt', cap:null, vesa:null, depth:2, plateH:16, note:'Commercial mounts in many sizes; pick the model by display size, weight and VESA.'},
    peerless:{name:'Peerless-AV SmartMount fixed, tilt or articulating mount', short:'Peerless-AV SmartMount', type:'Fixed, tilt or articulating', cap:null, vesa:null, depth:2, plateH:16, note:'Commercial mounts; pick by size, weight and VESA.'},
    sanus:{name:'Sanus commercial fixed or tilt mount', short:'Sanus', type:'Fixed or tilt', cap:null, vesa:null, depth:2, plateH:16, note:'Pick by size, weight and VESA.'},
    premier:{name:'Premier Mounts fixed, tilt or articulating mount', short:'Premier Mounts', type:'Varies', cap:null, vesa:null, depth:2, plateH:16, note:'Pick by size, weight and VESA.'}
  };
  const ANCH={
    lag:{name:'Lag bolts into studs',walls:['wood','plywood','plaster']},
    toggle:{name:'1/4-20 SnapToggle bolts, between studs or in hollow block',walls:['wood','metal','drywall','cmu']},
    tapcon:{name:'1/4 in Tapcon concrete screws',walls:['concrete','brick','cmu']},
    wedge:{name:'Wedge or sleeve anchors',walls:['concrete','brick','cmu']}
  };
  const AK=()=>{ const a=cfg.anchor; return (a&&a!=='auto'&&ANCH[a]&&ANCH[a].walls.includes(cfg.mount)&&!(a==='toggle'&&cfg.mount==='metal'&&cfg.backing))?a:''; };
  const dwT=()=>Number(cfg.dwThk)||0.625;
  function anchorCap(ak){ // ultimate tension per anchor (lb) from the manufacturers' published data; plan on 1/4
    if(ak==='toggle') return cfg.mount==='cmu'?1080:(dwT()>=0.625?356:265);
    if(ak==='tapcon') return cfg.mount==='concrete'?750:(cfg.mount==='cmu'?500:null);
    return null; }
  function anchorSpec(ak){
    const u=anchorCap(ak), w=u?` Ultimate pull-out about ${u} lb each; plan on a quarter of that (${Math.floor(u/4)} lb each, ${Math.floor(u)} lb for four).`:'';
    if(ak==='toggle') return `<b>1/4-20 SnapToggle:</b> drill 1/2 in; grip 3/8 to 3-5/8 in; needs 1-7/8 in clear behind the wall; channel vertical; hole at least 2 in from a stud center. Ultimate in 1/2 in drywall 265 lb pull / 241 lb shear, 5/8 in drywall 356 / 324, hollow block 1,080 pull.${w}`;
    if(ak==='tapcon') return `<b>1/4 in Tapcon:</b> 3/16 in carbide bit, hole 1/4 in deeper than the embedment, embed 1 to 1-3/4 in, at least 4 in apart and 3 in from an edge, slot at least 5/16 in. Ultimate in 2,000 psi concrete 750 lb pull / 900 shear; medium block 500 / 1,000.${w} Never in mortar joints.`;
    if(ak==='wedge') return '<b>Wedge or sleeve anchors:</b> use the anchor manufacturer’s hole size, embedment, edge distance and torque (3/8 in is typical for mount hardware). Wedge anchors for solid concrete; sleeve anchors also suit brick and block.';
    return '<b>Lag bolts:</b> into the center of a stud, in pilot holes the mount manufacturer specifies.'; }
  const ANCH_STEPS=ak=>({
    toggle:{tools:['1/2 in drill bit','Grade 5 or stainless 1/4-20 bolts (plate + drywall + about 1/2 in long)'],steps:['Mark each toggle hole from the layout table, at least 2 in from every stud center, and confirm with a stud finder and a small test hole that the cavity behind is empty (1-7/8 in clear).','Drill 1/2 in holes square to the wall. Oversize holes cut the holding strength.','Fold each channel flat against its straps, push it through, pull the straps to seat the channel behind the drywall (channel vertical), and slide the cap down tight.','Run the bolt through the plate into the channel and tighten evenly, then snap off the straps. Don’t crush the drywall.'],val:['Each toggle is tight and the plate doesn’t move when pulled hard by hand.','No toggle sits over a stud.']},
    tapcon:{tools:['3/16 in carbide Tapcon bit and hammer drill','#3 Phillips or 1/4 in hex driver bit','Blow-out bulb or vacuum'],steps:['Mark holes at least 3 in from any edge and 4 in apart, on solid face, never a mortar joint.','Drill 3/16 in holes 1/4 in deeper than the embedment (1 to 1-3/4 in). Blow out the dust.','Drive each 1/4 in Tapcon through the plate until the head seats; stop at once, don’t over-drive or reuse a hole.'],val:['Every screw seated without spinning.','The plate doesn’t move when pulled hard by hand.']},
    wedge:{tools:['Hammer drill and carbide bit of the anchor’s diameter','Torque wrench'],steps:['Mark the holes clear of edges and mortar joints.','Drill to the anchor manufacturer’s diameter and depth, then blow out the dust.','Set the anchors through the plate and torque to the manufacturer’s spec.'],val:['Every anchor reached its torque without spinning.']},
    lag:{tools:[],steps:['Drill pilot holes at stud center, the size the mount manufacturer specifies.','Drive lag bolts into at least two studs, snug but not stripped.'],val:['Every fastener went into a stud or backing.']}}[ak]);
  const cartVesa=()=>{ const h=Number(DISP[cfg.size].vesa.split(' × ')[0]); return {h, direct:h===400, kit:[200,300,500,600].includes(h)}; };
  const ACC=[
    {id:'podhub', name:'Rally Mic Pod Hub', for:['mini','bar','plus'], desc:'Lets mic pod cables run in a star from one point under the table or above the ceiling.'},
    {id:'podext', name:'Rally Mic Pod extension cable', for:['mini','bar','plus'], desc:'Extends a mic pod run on long tables.'},
    {id:'podmount', name:'Rally Mic Pod mount', for:['mini','bar','plus'], desc:'Fixes a mic pod to the table or ceiling and hides the cable.'},
    {id:'tvmount', name:'TV mount for video bars', for:['mini','bar'], desc:'Hangs the bar from the display’s VESA mount, above or below the screen.'},
    {id:'wallmount', name:'Wall mount for video bars', for:['mini','bar'], desc:'Mounts the bar on the wall, independent of the display.'},
    {id:'mountkit', name:'Rally Mounting Kit', for:['plus'], desc:'Wall and display brackets for the Rally camera and speakers.'},
    {id:'scribe', name:'Logitech Scribe whiteboard camera', for:['huddle','mini','bar','bar2','plus'], desc:'Shares a physical whiteboard into the meeting. Check support for your platform and mode.'},
    {id:'swytch', name:'Logitech Swytch laptop connector', for:['huddle','mini','bar','bar2','plus'], desc:'Lets a guest laptop use the room’s camera, mics and display for other meeting apps. Check support for your mode.'},
    {id:'tapriser', nomac:true, name:'Tap Riser Mount', for:['huddle','mini','bar','bar2','plus'], desc:'Raises and angles the Tap on the table.'},
    {id:'taptable', nomac:true, name:'Tap Table Mount', for:['huddle','mini','bar','bar2','plus'], desc:'Fixes the Tap to the table on a swivel, with cables through a grommet.'},
    {id:'tapwall', nomac:true, name:'Tap Wall Mount', for:['huddle','mini','bar','bar2','plus'], desc:'Mounts the Tap on the wall.'},
    {id:'computemount', nomac:true, name:'Compute mount', for:['huddle','mini','bar','bar2','plus'], compute:true, desc:'Holds the compute behind the display or under the table, with cable retention.'},
    {id:'strongusb', name:'Logitech Strong USB cable', for:['huddle','mini','bar','bar2','plus'], compute:true, desc:'A long, rugged USB cable for the video bar to computer run, in 10, 25 or 45 m lengths.'}
  ];
  const BRANDS={
    bar:['Logitech Rally Bar family','Poly Studio X30 / X52 / X70','Neat Bar / Neat Bar Pro','Yealink MeetingBar A20 / A30 / A40','Cisco Room Bar / Room Bar Pro','Jabra PanaCast 50'],
    ctrl:['Logitech Tap / Tap IP / Tap IP 2','Poly TC10','Neat Pad','Yealink CTP25','Cisco Room Navigator'],
    compute:{teams:['Lenovo ThinkSmart Core Gen 2','Dell OptiPlex Micro for Teams Rooms','HP Presence compute'], zoom:['Lenovo ThinkSmart Core Gen 2 (Logitech Zoom Rooms kit)','Apple Mac mini (Zoom Rooms for Mac)','Logitech RoomMate (appliance compute)'], meet:['CTL Google Meet Compute','ASUS Google Meet Compute']},
    disp:['Samsung QM / QB series','LG UH / UR series','Sony BRAVIA BZ series','Sharp NEC MultiSync series'],
    mount:['Mounting Dream MD2198 / MD2298 / MD2298-XL / MD2380','Echogear EGLF2 / EGMF2','Chief Fusion series','Peerless-AV SmartMount series','Sanus commercial mounts','Premier Mounts','Vogel’s professional mounts'],
    cart:['Heckler AV Cart Prime H700','Heckler AV Cart XL','Chief Voyager carts','Peerless-AV SmartMount carts'],
    share:['Barco ClickShare','Airtame','Mersive Solstice'],
    sched:['Logitech Tap Scheduler / Tap Scheduler 2','Neat Pad (scheduler mode)','Poly TC10 (scheduler mode)','Yealink RoomPanel'],
    mic:['Logitech Rally Mic Pod','Shure MXA ceiling arrays (with a DSP)','Sennheiser TeamConnect Ceiling']
  };

