  loadDoors();
  if(!STORE.cfg){ seedRoom(); }
  applyLearn();
  if(DB.isNew()){ openP(); document.getElementById('pjClient').focus(); }
  update(); renderRooms(); showMod(UI.mod); showPlan(UI.plan); showSub(UI.sub);
  const h0=location.hash.slice(1); showTab(TABS.includes(h0)?h0:UI.tab);
