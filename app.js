(() => {
  'use strict';
  const G = window.DIRTYBROWN_GUIDE;
  if (!G) return;

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
      <p class="build-tradeoff"><strong>The trade:</strong> fewer Discipline shield and mana tools. Shadowform comes later than level 30’s 21-point budget.</p>
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
    document.querySelector('#farm-grid').innerHTML=G.dungeons.map(d=>`<article class="farm-card"><h3>${esc(d.name)}</h3><div class="farm-subhead">DROP TARGETS</div>${d.drops.map(farmItem).join('')}<div class="farm-subhead quest-label">QUEST REWARDS</div>${d.quests.length?d.quests.map(farmItem).join(''):'<p class="no-quest">No selected quest reward.</p>'}</article>`).join('');
    document.querySelector('#farm-caveat').textContent=G.farmCaveat;
  }
  function farmItem(x) {
    return `<button class="farm-item" data-record="${esc(x.key)}"><img src="${esc(x.icon)}" alt="" loading="lazy"><span>${esc(x.name)}</span></button>`;
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

  renderMainBuild();renderChoices();renderGear();renderPressure();renderNextSteps();
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-record]');
    if(button){openRecord(button.dataset.record,button.dataset.rank);return;}
    if(event.target.closest('.close-button'))document.querySelector('#detail-dialog').close();
  });
  document.querySelector('#detail-dialog').addEventListener('click',event=>{if(event.target===event.currentTarget)event.currentTarget.close();});
})();
