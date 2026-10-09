/* Renders every page from /content. Layout lives here; words live in /content. */
(function () {
  const S = window.SITE, page = document.body.dataset.page, app = document.getElementById("app");
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = s => esc(s).replace(/\*(.+?)\*/g, "<em>$1</em>");   // *word* = accent italic
  const paras = a => [].concat(a || []).map(t => `<p>${fmt(t)}</p>`).join("");
  const num = i => String(i + 1).padStart(2, "0");
  const btn = (l, cls = "") => l && l.label ? `<a class="btn ${cls}" href="${esc(l.href)}">${esc(l.label)}<span aria-hidden="true">→</span></a>` : "";
  const label = t => `<p class="label meta">${esc(t)}</p>`;
  const rows = items => `<ol class="rows">${items.map((it, i) => `<li class="row reveal"><span class="n meta">${num(i)}</span><h3 class="h3">${esc(it.title)}</h3><p>${fmt(it.text)}</p></li>`).join("")}</ol>`;
  const caps = g => `<div class="caps">${g.map(x => `<div class="reveal"><h3 class="h3">${esc(x.title)}</h3><ul>${x.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("")}</div>`;
  const block = (lab, inner) => `<section><div class="wrap grid">${lab ? label(lab) : ""}<div class="${lab ? "col-main" : "col-wide"}">${inner}</div></div></section>`;
  const cta = c => `<section class="cta"><div class="wrap grid"><div class="col-wide"><h2 class="display reveal">${fmt(c.headline)}</h2><p class="lede reveal">${esc(c.text || "")}</p>${btn(c.cta)}</div></div></section>`;

  function project(p) {
    const img = p.image ? `<figure><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"></figure>` : `<div class="ph" aria-hidden="true"><b>${esc(p.title.trim().charAt(0))}</b></div>`;
    const facts = [["Client", p.client], ["Role", p.role], ["Context", p.context]].filter(f => f[1]).map(f => `<dt>${f[0]}</dt><dd>${esc(f[1])}</dd>`).join("")
      + (p.scope && p.scope.length ? `<dt>Scope</dt><dd><ul>${p.scope.map(s => `<li>${esc(s)}</li>`).join("")}</ul></dd>` : "")
      + (p.outcomes && p.outcomes.length ? `<dt>Outcomes</dt><dd><ul>${p.outcomes.map(s => `<li>${esc(s)}</li>`).join("")}</ul></dd>` : "");
    const extra = p.images && p.images.length ? `<div class="extra">${p.images.map(s => `<img src="${esc(s)}" alt="" loading="lazy">`).join("")}</div>` : "";
    return `<article class="project reveal">${img}<p class="meta">${esc([p.category, p.year].filter(Boolean).join(" · "))}${p.placeholder ? '<span class="tag">Draft</span>' : ""}</p><h3 class="h3">${esc(p.title)}</h3><p>${esc(p.short || "")}</p>${facts || extra ? `<details><summary class="meta">Details</summary><dl class="facts">${facts}</dl>${extra}${p.link ? `<a href="${esc(p.link)}" rel="noopener">Visit project ↗</a>` : ""}</details>` : ""}</article>`;
  }
  function setMeta(title, desc) {
    document.title = title ? `${title} — ${S.name}` : `${S.name} — ${S.descriptor}`;
    const d = document.querySelector('meta[name="description"]'); if (d && desc) d.content = desc;
    const set = (p, v) => { const m = document.querySelector(`meta[property="${p}"]`); if (m) m.content = v; };
    set("og:title", document.title); set("og:description", desc || d.content); set("og:url", S.siteUrl + "/" + (location.pathname.split("/").pop() || ""));
    const ld = { "@context": "https://schema.org", "@type": "ProfessionalService", name: S.name, description: S.descriptor, url: S.siteUrl, email: S.email, areaServed: "Worldwide" };
    const s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(ld); document.head.appendChild(s);
  }
  const sections = {
    hero: c => `<section class="hero first"><div class="wrap"><p class="meta reveal">${esc(c.kicker)}</p><h1 class="display reveal">${fmt(c.headline)}</h1><div class="hero-foot"><span></span><div><p class="lede reveal">${esc(c.intro)}</p>${btn(c.cta)}</div></div></div></section>`,
    audiences: c => `<section style="padding:0"><div class="wrap" style="padding-top:2rem"><p class="meta" style="margin:0 0 1.2rem">${esc(c.label)}</p></div><div class="aud">${c.items.map(a => `<a href="${esc(a.href)}" data-theme="${a.theme}"><span class="meta">${esc(a.tag)}</span><h2 class="h1">${esc(a.title)}</h2><p class="lede">${esc(a.text)}</p><span class="go meta">${esc(a.cta)} →</span></a>`).join("")}</div></section>`,
    gap: c => block(c.label, `<p class="statement reveal">${esc(c.statement)}</p><div class="gap-body reveal">${paras(c.paragraphs)}</div>`),
    territories: c => block(c.label, `<h2 class="h2 reveal" style="max-width:20ch;margin-bottom:3rem">${esc(c.heading)}</h2>${rows(c.items)}${btn(c.cta, "ghost")}`),
    proof: c => block(c.label, `<div class="proof">${c.items.map(i => `<div class="reveal"><b>${esc(i.figure)}</b><span>${esc(i.text)}</span></div>`).join("")}</div>`),
    work: c => block(c.label, `<div class="projects">${window.PROJECTS.slice(0, c.count).map(project).join("")}</div>${btn(c.cta, "ghost")}`),
    about: c => block(c.label, `<p class="statement reveal" style="font-size:clamp(1.5rem,2.8vw,2.6rem);max-width:30ch">${esc(c.text)}</p>${btn(c.cta, "ghost")}`),
    cta: c => cta(c)
  };
  const intro = (k, h, t, mw) => `<section class="first"><div class="wrap"><p class="meta reveal">${esc(k)}</p><h1 class="display reveal" style="margin:1.5rem 0 2rem;max-width:${mw}">${fmt(h)}</h1><p class="lede reveal">${esc(t)}</p></div></section>`;
  const audience = c => intro(c.kicker, c.headline, c.intro, "16ch") + block(c.situationsLabel, rows(c.situations)) + block(c.capabilitiesLabel, caps(c.capabilities))
    + block(c.engagementLabel, `<p class="h2 reveal" style="max-width:24ch">${esc(c.engagementIntro)}</p><ul class="pills">${c.engagements.map(e => `<li>${esc(e)}</li>`).join("")}</ul>`) + cta(c.cta);
  function about(c) {
    const lines = a => a.map(x => `<div class="list-line reveal"><b style="font-weight:500">${esc(x.name)}</b>${x.detail ? `<span>${esc(x.detail)}</span>` : ""}</div>`).join("");
    return `<section class="first"><div class="wrap about-top"><div><p class="meta">${esc(c.kicker)}</p><h1 class="display" style="margin:1.5rem 0 2rem;max-width:15ch">${fmt(c.headline)}</h1>${paras(c.intro)}</div>${c.portrait ? `<img class="portrait" src="${esc(c.portrait)}" alt="Portrait of ${esc(S.name)}">` : ""}</div></section>`
      + block(c.worldsLabel, rows(c.worlds)) + block(c.experienceLabel, `<p class="hint">${esc(c.experienceNote)}</p>${lines(c.experience)}`) + block(c.educationLabel, lines(c.education)) + cta(c.cta);
  }
  const work = c => intro(c.kicker, c.headline, c.intro, "14ch") + `<section style="border-top:0;padding-top:0"><div class="wrap"><div class="projects">${window.PROJECTS.map(project).join("")}</div></div></section>`;
  function contact(c) {
    const L = c.labels, q = new URLSearchParams(location.search).get("i"), pre = q === "artist" ? 0 : q === "institution" ? 1 : -1;
    const f = `<form id="enq" ${c.formAction ? `action="${esc(c.formAction)}" method="post"` : ""}>
      <label>${esc(L.name)}<input name="name" required autocomplete="name"></label>
      <label>${esc(L.email)}<input name="email" type="email" required autocomplete="email"></label>
      <label>${esc(L.organisation)}<input name="organisation" autocomplete="organization"></label>
      <label>${esc(L.role)}<select name="role">${c.roleOptions.map((o, i) => `<option ${i === pre ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></label>
      <label>${esc(L.project)}<span class="hint">${esc(c.projectHint)}</span><textarea name="project" required></textarea></label>
      <label>${esc(L.timeline)}<input name="timeline"></label>
      <div><button class="btn" type="submit">${esc(L.submit)}<span aria-hidden="true">→</span></button><p class="notice" id="ok" hidden role="status">${esc(c.success)}</p></div></form>`;
    return intro(c.kicker, c.headline, c.intro, "14ch") + `<section style="border-top:0;padding-top:0"><div class="wrap">${f}<div style="margin-top:4rem"><p class="meta">${esc(c.directLabel)}</p><p><a class="h2" href="mailto:${esc(S.email)}">${esc(S.email)}</a></p><p class="hint">${esc(S.location)}${S.phone ? " · " + esc(S.phone) : ""}</p></div></div></section>`;
  }
  let html = "", seoT = "", seoD = "";
  if (page === "home") html = window.HOME.sections.filter(s => s.show).map(s => sections[s.id] ? sections[s.id](window.HOME[s.id]) : "").join("");
  else if (page === "artists" || page === "institutions") { const c = window["AUDIENCE_" + page]; document.body.dataset.theme = c.theme; html = audience(c); seoT = c.seoTitle; seoD = c.seoDescription; }
  else if (page === "about") { html = about(window.ABOUT); seoT = "About"; seoD = window.ABOUT.seoDescription; }
  else if (page === "work") { html = work(window.PROJECTS_PAGE); seoT = "Selected work"; seoD = window.PROJECTS_PAGE.seoDescription; }
  else if (page === "contact") { html = contact(window.CONTACT); seoT = "Contact"; seoD = window.CONTACT.seoDescription; }
  setMeta(seoT, seoD);
  const here = location.pathname.split("/").pop() || "index.html";
  const header = `<header class="site-header"><div class="wrap"><a class="brand" href="index.html"><b>${esc(S.name)}</b><span class="meta" style="font-size:.62rem">${esc(S.descriptor)}</span></a><button class="menu-btn" aria-expanded="false" aria-controls="nav">Menu</button><nav class="nav" id="nav" aria-label="Main"><ul>${S.nav.map(n => `<li><a href="${esc(n.href)}" ${n.href === here ? 'aria-current="page"' : ""}>${esc(n.label)}</a></li>`).join("")}</ul></nav></div></header>`;
  const footer = `<footer class="site-footer"><div class="wrap"><div><b style="font:400 1.6rem var(--f-display)">${esc(S.name)}</b><p class="meta" style="margin-top:.5rem">${esc(S.footerNote)}</p></div><div><a href="mailto:${esc(S.email)}">${esc(S.email)}</a><ul>${S.social.map(s => `<li><a href="${esc(s.href)}" rel="noopener">${esc(s.label)}</a></li>`).join("")}</ul></div></div></footer>`;
  document.body.insertAdjacentHTML("afterbegin", `<a class="skip" href="#app">Skip to content</a>` + header);
  app.innerHTML = html;
  document.body.insertAdjacentHTML("beforeend", footer);
  const btnM = document.querySelector(".menu-btn"), nav = document.getElementById("nav");
  btnM.addEventListener("click", () => { const o = nav.classList.toggle("open"); btnM.setAttribute("aria-expanded", o); btnM.textContent = o ? "Close" : "Menu"; });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("open")) btnM.click(); });
  const form = document.getElementById("enq");
  if (form && !window.CONTACT.formAction) form.addEventListener("submit", e => {
    e.preventDefault(); const d = new FormData(form);
    const body = ["Name: " + d.get("name"), "Email: " + d.get("email"), "Organisation / studio: " + d.get("organisation"), "I am: " + d.get("role"), "Timeline: " + d.get("timeline"), "", d.get("project")].join("\n");
    location.href = `mailto:${S.email}?subject=${encodeURIComponent("Enquiry from " + d.get("name"))}&body=${encodeURIComponent(body)}`;
    document.getElementById("ok").hidden = false;
  });
  const els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach(e => io.observe(e));
  } else els.forEach(e => e.classList.add("in"));
})();
