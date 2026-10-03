(() => {
  'use strict';
  const G = window.DIRTYBROWN_GUIDE;
  if (!G) return;
  let selectedDungeon=0,npcQuery='',npcFilter='all';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const recordIndex = new Map();
  const remember = r => { if (r?.key) recordIndex.set(r.key,r); };
  G.gear.forEach(remember); G.insignia && remember(G.insignia);
  G.buildChoices.forEach(b => b.talents.forEach(t => remember({...t,kind:'talent'})));
  G.pressure.forEach(p => p.abilities.forEach(remember));
  G.dungeons.forEach(d => [...d.drops,...d.quests].forEach(remember));
  G.applications.forEach(remember); G.supplies.forEach(x=>remember(x.item));
  G.keyAbilities.forEach(remember);

  function talentChip(t) {
    return `<button class="talent-chip" data-record="${esc(t.key)}" data-rank="${t.rank}" aria-label="Inspect ${esc(t.name)}, rank ${t.rank}"><img src="${esc(t.icon)}" alt="" loading="lazy"><span><strong>${esc(t.name)}</strong><small>${t.rank}/${t.maxRank} ranks</small></span></button>`;
  }
  function tinyTalent(t) {
    return `<button class="talent-mini" data-record="${esc(t.key)}" data-rank="${t.rank}" aria-label="Inspect ${esc(t.name)}, rank ${t.rank}"><img src="${esc(t.icon)}" alt="" loading="lazy"><span>${esc(t.name)}<small>${t.rank}/${t.maxRank}</small></span></button>`;
  }
  function renderMainBuild() {
    const b=G.mainBuild;
    document.querySelector('#recommended-build').innerHTML=`
      <div class="build-summary"><div class="build-title-row"><div class="build-emblem" aria-hidden="true">21</div><div><h3>Shadow pressure</h3><div class="point-split">LEVEL 30 · ${esc(b.split)} POINTS · ${b.points} TOTAL</div></div></div>
      <p class="build-reason">I’d start here for the damage style you asked for. Shadow Weaving rewards steady pressure; Mind Flay slows your target, and Silence can shut down an important cast.</p>
      <div class="build-pills"><span>Pressure</span><span>Range</span><span>Silence</span><span>Mind Flay</span></div>
      <p class="build-tradeoff"><strong>The trade:</strong> you skip Discipline’s improved-shield and mana talents. Shadowform is beyond level 30’s 21-point budget.</p>
      <a class="builder-link" href="${esc(b.link)}" target="_blank" rel="noopener noreferrer">Open this allocation in the talent builder ↗</a></div>
      <div class="talent-preview" aria-label="Nine selected Shadow talents">${b.talents.map(talentChip).join('')}</div>`;
  }
  function renderChoices() {
    const options=G.buildChoices.filter(b=>b.kind==='alternative');
    document.querySelector('#build-choices').innerHTML=options.map(b=>`
      <article class="choice-card"><div class="choice-top"><div><h3>${b.name.startsWith('Disc')?'Discipline': 'Holy'} · ${esc(b.split)}</h3><div class="split">21 NORMAL POINTS · LEVEL 30</div></div><span class="choice-mark">ALTERNATIVE</span></div>
      <p>${esc(b.summary)}</p><p class="choice-trade"><strong>What changes:</strong> ${esc(b.tradeoff)}</p>
      <a class="builder-link" href="${esc(b.link)}" target="_blank" rel="noopener noreferrer">Explore this talent build ↗</a>
      <details><summary>See all ${b.points} talents</summary><div class="talent-mini-grid">${b.talents.map(tinyTalent).join('')}</div></details></article>`).join('');
  }
  function renderGear() {
    const stat=G.plannedStats;
    document.querySelector('#planned-stats').innerHTML=[['Stamina',stat.stamina],['Intellect',stat.intellect],['Spell damage',stat.spellPower],['Armor',stat.armor]].map(([label,value])=>`<div class="stat"><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`).join('');
    document.querySelector('#gear-grid').innerHTML=G.gear.map(x=>`<button class="item-card" data-record="${esc(x.key)}" aria-label="Inspect ${esc(x.name)}"><img class="item-icon quality-${x.quality}" src="${esc(x.icon)}" alt="" loading="lazy"><span><strong class="quality-${x.quality}">${esc(x.name)}</strong><small>${esc(x.slot)} · ${esc(x.acquisition.label)}</small></span></button>`).join('');
    document.querySelector('#trinket-note').innerHTML=`<img src="${esc(G.insignia.icon)}" alt="" loading="lazy"><span><strong>${esc(G.insignia.name)}:</strong> its PvP vendor access still needs an in-game check. It is a separate target, not counted in the 16-piece set.</span>`;
    document.querySelector('#farm-grid').innerHTML=G.dungeons.map((d,i)=>`<article class="farm-card"><h3>${esc(d.name)}</h3><p class="farm-count">${d.drops.length} selected drop${d.drops.length===1?'':'s'} · ${d.quests.length} quest reward${d.quests.length===1?'':'s'}</p><button class="farm-open" data-dungeon-index="${i}">Open route &amp; NPC notes →</button></article>`).join('');
    document.querySelector('#farm-caveat').textContent=G.farmCaveat;
  }
  function farmItem(x) {
    return `<button class="farm-item" data-record="${esc(x.key)}"><img src="${esc(x.icon)}" alt="" loading="lazy"><span>${esc(x.name)}</span></button>`;
  }
  function renderNpcRows(atlas) {
    const list=document.querySelector('#npc-list');
    const q=npcQuery.trim().toLowerCase();
    const rows=atlas.roster.filter(n=>{
      const hay=`${n.name} ${n.role} ${(n.qualitativeAreas||[]).join(' ')}`.toLowerCase();
      return (!q||hay.includes(q))&&(npcFilter==='all'||(npcFilter==='boss'&&n.role==='boss')||(npcFilter==='targets'&&(n.selectedDrops||[]).length));
    });
    list.innerHTML=rows.length?rows.map(n=>{const isSummoned=/summoned/i.test(n.role||'');return `<button class="npc-row" data-atlas-npc="${n.id}" aria-label="Open notes for ${esc(n.name)}"><span class="npc-row-role">${esc(n.role)}</span><span class="npc-row-name">${esc(n.name)}<small>${n.referenceLevel?`${isSummoned?'Summon template':'Classic reference'} level ${esc(n.referenceLevel.min)}${n.referenceLevel.max!==n.referenceLevel.min?`–${esc(n.referenceLevel.max)}`:''}`:'Level unlisted'}${n.qualitativeAreas?.length?` · ${esc(n.qualitativeAreas[0])}`:''}</small></span>${n.selectedDrops?.length?'<span class="npc-target-mark">SET ITEM</span>':''}</button>`}).join(''):'<p class="no-quest">No NPCs match this search.</p>';
    document.querySelector('#npc-result-count').textContent=`${rows.length} of ${atlas.roster.length}`;
  }
  function renderDungeons() {
    const d=G.dungeons[selectedDungeon],a=d?.atlas;
    if(!d||!a)return;
    document.querySelector('#dungeon-tabs').innerHTML=G.dungeons.map((x,i)=>`<button class="dungeon-tab" role="tab" aria-selected="${i===selectedDungeon}" data-dungeon-index="${i}">${esc(x.name)}<small>${x.drops.length} drops · ${x.quests.length} quests</small></button>`).join('');
    const min=a.levelRange?.recommendedMin,max=a.levelRange?.recommendedMax;
    const targets=[...d.drops.map(x=>({...x,atlasKind:'DROP'})),...d.quests.map(x=>({...x,atlasKind:'QUEST'}))];
    const areaList=(a.tacticalAreas||[]).map(t=>`<article class="atlas-watch"><span class="watch-label">${esc(t.dangerTier||'WATCH')} · REFERENCE</span><h4>${esc(t.label)}</h4><p>${esc(t.recommendation)}</p>${t.npcIds?.length?`<div class="route-npcs">${t.npcIds.map(id=>{const n=a.roster.find(x=>x.id===id);return n?`<button data-atlas-npc="${id}">${esc(n.name)}</button>`:''}).join('')}</div>`:''}</article>`).join('');
    const routeList=(a.routePlan||[]).map((step,i)=>`<li><span class="route-number">${String(step.order||i+1).padStart(2,'0')}</span><div><h4>${esc(step.label)}</h4><p>${esc(step.advice)}</p>${step.npcIds?.length?`<div class="route-npcs">${step.npcIds.map(id=>{const n=a.roster.find(x=>x.id===id);return n?`<button data-atlas-npc="${id}">${esc(n.name)}</button>`:''}).join('')}</div>`:''}<small>${step.coordinates?'Position record present; check its frame before navigating.':'Route landmark only · no verified beta pin.'}</small></div></li>`).join('');
    document.querySelector('#dungeon-atlas').innerHTML=`
      <div class="atlas-summary"><div><p class="eyebrow">${esc(a.map?.build||'CURRENT CLIENT MAP')} · REFERENCE ROUTE</p><h3>${esc(d.name)}</h3><p>${esc(a.entry||'Check current portal access in game.')}</p></div><span class="atlas-level">LEVEL ${min??'?'}–${max??'?'} <small>planning bracket</small></span></div>
      <div class="atlas-grid"><figure class="atlas-map"><img src="${esc(a.map?.src||'')}" alt="${esc(d.name)} map texture from client build ${esc(a.map?.build||'unknown')}"><figcaption>${esc(a.map?.renderKind||'Client map image')}. No NPC coordinate pins are verified in the current Beta.</figcaption></figure>
        <div class="atlas-route-column"><section class="route-panel"><p class="eyebrow">SUGGESTED ORDER</p><ol class="route-list">${routeList}</ol></section><section class="retreat-panel"><p class="eyebrow">IF THE PULL GOES WRONG</p><ul>${a.retreatAdvice.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section></div></div>
      <section class="watch-section"><div class="watch-heading"><div><p class="eyebrow">CAUTION AREAS</p><h3>What to watch on the route</h3></div><span>TACTICAL NOTES · NOT A MEASURED HEAT MAP</span></div><div class="watch-grid">${areaList}</div><p class="small-note">These cautions come from Classic/reference encounters and route landmarks. The source contains no player-traffic, aggro-radius, or death data, so the page does not claim a measured danger heat map.</p></section>
      <section class="atlas-targets"><div class="watch-heading"><div><p class="eyebrow">SELECTED LEVEL-30 KIT</p><h3>What you’re farming here</h3></div><span>DROP RATES UNKNOWN</span></div><div class="target-gear">${targets.map(x=>`<button class="target-gear-row" data-record="${esc(x.key)}"><span class="atlas-kind">${x.atlasKind}</span><img src="${esc(x.icon)}" alt="" loading="lazy"><span><strong>${esc(x.name)}</strong><small>${esc(x.reason)}</small></span></button>`).join('')}</div><p class="small-note">The item source labels are leads, not a promise that a current Beta NPC drops the item. Use each NPC card below to see the retained source qualification.</p></section>
      <section class="atlas-roster"><div class="roster-heading"><div><p class="eyebrow">NPC FIELD NOTES</p><h3>Find a mob or boss</h3><span id="npc-result-count" class="roster-count"></span></div><div class="roster-filters"><label>Search <input id="npc-search" type="search" placeholder="Name or area" autocomplete="off"></label><label>Show <select id="npc-filter"><option value="all">All entries</option><option value="boss">Bosses</option><option value="targets">Set-item sources</option></select></label></div></div><div id="npc-list" class="npc-list"></div><p class="small-note">World XYZ values, where present, are Classic-reference coordinates. Their map frame is not verified for live Forever navigation. Current server spawns and NPC spell associations remain unconfirmed unless a card says otherwise.</p></section>`;
    renderNpcRows(a);
  }
  function openNpc(npc) {
    const dialog=document.querySelector('#detail-dialog'),title=document.querySelector('#detail-title');
    title.textContent=npc.name;
    const head=document.createElement('div');head.className='dialog-header npc-dialog-header';
    const badge=document.createElement('span');badge.className='npc-dialog-badge';badge.textContent=npc.role;head.prepend(badge);
    const body=document.createElement('div');body.className='npc-detail';
    const isSummoned=/summoned/i.test(npc.role||'');
    const lvl=npc.referenceLevel?`${isSummoned?'Classic summon template':'Classic reference'} level ${npc.referenceLevel.min}${npc.referenceLevel.max!==npc.referenceLevel.min?`–${npc.referenceLevel.max}`:''}; not a current Beta level guarantee.`:'No reference level recorded.';
    const coords=(npc.classicReferenceSpawns||[]).map(x=>`<li>XYZ <code>${esc(Number(x.worldX).toFixed(2))}, ${esc(Number(x.worldY).toFixed(2))}, ${esc(Number(x.worldZ).toFixed(2))}</code>${x.guid?` <small>spawn ${esc(x.guid)}</small>`:''}</li>`).join('');
    const abilities=(npc.abilities||[]).map(x=>`<li><strong>${esc(x.name)}</strong>${x.schools?.length?` <span>· ${esc(x.schools.join('/'))}</span>`:''}${x.castTimeMs?` <small>· client cast ${esc(x.castTimeMs/1000)}s</small>`:''}${x.durationMs?` <small>· encoded duration ${esc(x.durationMs/1000)}s</small>`:''}</li>`).join('');
    const tips=(npc.tacticalAdvice||[]).map(x=>`<li>${esc(x)}</li>`).join('');
    const drops=(npc.selectedDrops||[]).map(x=>`<li><button class="npc-drop-link" data-record="item:${esc(x.itemId)}">${esc(x.name)}</button><small>${x.probability==null?'Drop rate unknown':`Reference rate ${esc(x.probability)}`}</small><p>${esc(x.evidence)}</p></li>`).join('');
    const presence=npc.currentPresenceEvidence||'No current Beta presence record.';
    const presenceNeedsStatus=!/(?:server spawn|beta presence)[^.]*\b(?:unverified|not verified|unknown)\b/i.test(presence);
    const presenceStatus=npc.serverSpawnVerified?' Current server spawn verified.':presenceNeedsStatus?' Current server spawn not verified.':'';
    const presenceText=/[.!?]$/.test(presence.trim())?presence:`${presence}.`;
    const summoners=(npc.referenceSummoners||[]).map(x=>`<li><strong>${esc(x.caster)}</strong> · ${esc(x.ability)}${x.spellId?` <small>(spell ${esc(x.spellId)})</small>`:''}</li>`).join('');
    const summonSection=isSummoned?`<section><h3>Classic/reference summon</h3>${summoners?`<p>Linked caster records:</p><ul>${summoners}</ul>`:'<p>No caster link retained for this summon template.</p>'}<p class="dialog-muted">This is a summoned template, not a fixed room spawn. The caster link and summon behavior are not verified in the current Beta.</p></section>`:'';
    const danger=npc.danger?`<section class="npc-threat"><h3>Threat profile</h3><p><strong>${esc(npc.danger.tier||'Reference')} caution</strong>${npc.danger.flags?.length?` · Watch for ${npc.danger.flags.map(esc).join(', ')}`:''}</p><p class="dialog-muted">${esc(npc.danger.basis||'Tactical estimate from reference encounters, not measured Beta outcomes.')}</p></section>`:'';
    body.innerHTML=`<p class="dialog-detail"><strong>${esc(lvl)}</strong></p><p class="dialog-muted">${esc(presenceText)}${presenceStatus}</p>
      <section><h3>Location</h3>${npc.qualitativeAreas?.length?`<p>${npc.qualitativeAreas.map(esc).join(' · ')}</p>`:''}${coords?`<details><summary>${npc.classicReferenceSpawns.length} Classic XYZ reference point${npc.classicReferenceSpawns.length===1?'':'s'}</summary><ul class="npc-coordinate-list">${coords}</ul></details>`:'<p>No named Classic XYZ spawn coordinate is retained for this entry.</p>'}<p class="dialog-muted">${esc(npc.coordinateBoundary||'Coordinates are a reference and are not confirmed live.')}</p></section>${summonSection}
      <section><h3>Abilities</h3>${abilities?`<ul class="npc-ability-list">${abilities}</ul>`:'<p>No NPC-to-spell association is verified in the current records.'}<p class="dialog-muted">${esc(npc.abilityBoundary||'Classic spell associations are reference leads; current Beta cast behavior is unverified.')}</p></section>
      <section><h3>How to handle it</h3>${tips?`<ul>${tips}</ul>`:'<p>No individual tactical note retained; use the route cautions and keep a cleared return lane.</p>'}</section>${danger}
      <section><h3>Selected PvP gear</h3>${drops?`<ul class="npc-drop-list">${drops}</ul>`:'<p>No piece from this selected 16-slot set is linked to this NPC in the retained records.'}</section>`;
    document.querySelector('#detail-body').replaceChildren(head,body);if(!dialog.open)dialog.showModal();
  }
  function renderPressure() {
    document.querySelector('#pressure-list').innerHTML=G.pressure.map(p=>`<article class="pressure-card"><span>0${p.number}</span><div class="pressure-icons">${p.abilities.map(a=>`<button data-record="${esc(a.key)}" aria-label="Inspect ${esc(a.name)}"><img src="${esc(a.icon)}" alt="" loading="lazy"></button>`).join('')}</div><h3>${esc(p.title)}</h3><p>${esc(p.advice)}</p></article>`).join('');
  }
  function renderNextSteps() {
    document.querySelector('#next-grid').innerHTML=`
      <article class="next-card"><h3>Professions</h3>${G.professions.map(p=>`<div class="prep-line"><strong>${esc(p.name)}</strong><small>${esc(p.level)}</small><p>${esc(p.copy)}</p></div>`).join('')}</article>
      <article class="next-card"><h3>Permanent touches</h3><p class="next-intro">Have a player with the right recipe apply these to the matching pieces.</p><div class="application-grid">${G.applications.map(a=>`<button class="application-chip" data-record="${esc(a.key)}"><img src="${esc(a.icon)}" alt="" loading="lazy"><span><strong>${esc(a.target)}</strong><small>${esc(a.label)} · ${esc(a.reason)}</small></span></button>`).join('')}</div></article>
      <article class="next-card"><h3>Carry for the fight</h3><div class="supply-grid">${G.supplies.map(s=>`<button class="supply-chip" data-record="${esc(s.item.key)}"><img src="${esc(s.item.icon)}" alt="" loading="lazy"><span>${esc(s.item.name)}<small>${esc(s.role)}</small></span></button>`).join('')}</div></article>`;
  }
  function openRecord(key,rank) {
    const r=recordIndex.get(key); if(!r)return;
    const dialog=document.querySelector('#detail-dialog');
    const title=document.querySelector('#detail-title'); title.textContent=r.name;
    const img=document.createElement('img'); img.src=r.icon; img.alt='';
    const head=document.createElement('div'); head.className='dialog-header'; head.prepend(img); const text=document.createElement('span'); text.textContent=r.slot||r.kind||''; head.append(text);
    const content=document.createElement('div');
    if(r.kind==='talent') {
      const effect=r.rankTexts?.[String(rank||r.rank)]||r.effect||r.details||'';
      content.innerHTML=`<p class="dialog-detail">${esc(effect)}</p><p class="dialog-muted">${esc(r.rank||rank||1)} of ${esc(r.maxRank||r.maxRanks||1)} ranks shown. Talent information comes from the current client record.</p>`;
    } else {
      const details=Array.isArray(r.details)?r.details:[];
      content.innerHTML=`${r.reason?`<p class="dialog-detail">${esc(r.reason)}</p>`:''}${r.acquisition?`<p class="dialog-muted">${esc(r.acquisition.label)}${r.acquisition.place?' · '+esc(r.acquisition.place):''}</p>`:''}${r.details?Array.isArray(r.details)?`<ul class="tooltip-lines">${details.map(line=>`<li>${esc(line)}</li>`).join('')}</ul>`:`<p class="dialog-detail">${esc(r.details)}</p>`:''}${r.use?`<p class="dialog-detail">${esc(r.use)}</p>`:''}${r.evidence?`<p class="dialog-muted">${esc(r.evidence)}</p>`:''}`;
    }
    const body=document.querySelector('#detail-body'); body.replaceChildren(head,content);
    if(!dialog.open)dialog.showModal();
  }

  renderMainBuild();renderChoices();renderGear();renderDungeons();renderPressure();renderNextSteps();
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-record]');
    if(button){openRecord(button.dataset.record,button.dataset.rank);return;}
    const dungeonButton=event.target.closest('[data-dungeon-index]');
    if(dungeonButton){selectedDungeon=Number(dungeonButton.dataset.dungeonIndex);npcQuery='';npcFilter='all';renderDungeons();return;}
    const npcButton=event.target.closest('[data-atlas-npc]');
    if(npcButton){const npc=G.dungeons[selectedDungeon]?.atlas?.roster.find(x=>x.id===Number(npcButton.dataset.atlasNpc));if(npc)openNpc(npc);return;}
    if(event.target.closest('.close-button'))document.querySelector('#detail-dialog').close();
  });
  document.addEventListener('input',event=>{if(event.target.id==='npc-search'){npcQuery=event.target.value;renderNpcRows(G.dungeons[selectedDungeon].atlas);}});
  document.addEventListener('change',event=>{if(event.target.id==='npc-filter'){npcFilter=event.target.value;renderNpcRows(G.dungeons[selectedDungeon].atlas);}});
  document.querySelector('#detail-dialog').addEventListener('click',event=>{if(event.target===event.currentTarget)event.currentTarget.close();});
})();
