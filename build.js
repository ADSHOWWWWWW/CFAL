// Construit le site : lit les contenus (src/_data/*.json, modifiés via le back office)
// et produit _site/index.html. Aucun module externe nécessaire : juste Node.js.
"use strict";
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "src");
const OUT = path.join(__dirname, "_site");
const inc = (f) => fs.readFileSync(path.join(SRC, "_includes", f), "utf8");
const data = (f) => {
  const p = path.join(SRC, "_data", f + ".json");
  try { return JSON.parse(fs.readFileSync(p, "utf8")); }
  catch (e) { throw new Error(`Le fichier de contenu "${f}.json" est illisible : ${e.message}`); }
};

// ---------- utilitaires ----------
const esc = (v) => String(v ?? "")
  .replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]))
  // typographie française : espace insécable avant ? ! : ; » et après « (évite un « ? » seul en début de ligne)
  .replace(/ ([?!:;»])/g, "&nbsp;$1").replace(/« /g, "«&nbsp;");
const list = (v) => (Array.isArray(v) ? v.filter((x) => x != null && x !== "") : []);
const num = (i) => String(i + 1).padStart(2, "0");
// "/images/photo.png" -> "images/photo.png" : fonctionne quelle que soit l'adresse du site
const chemin = (v) => { v = String(v || "").trim(); return v.startsWith("/") && !v.startsWith("//") ? v.slice(1) : v; };
const tel = (v) => String(v || "").replace(/[^\d+]/g, "");
const ifv = (cond, html) => (cond ? html : "");

const ARROW = `<svg class="ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const ICONES = {
  sifflet: `<path d="M2 13a6 6 0 0 0 6 6 6 6 0 0 0 5.9-5H21a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-9.1A6 6 0 0 0 2 13Z"/><circle cx="8" cy="13" r="2.4"/>`,
  terrain: `<rect x="2.5" y="4.5" width="19" height="15" rx="1"/><path d="M12 4.5v15M2.5 8.5H8v7H2.5M21.5 8.5H16v7h5.5"/>`,
  piece: `<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5a4 4 0 0 0-6.2 1M9.3 14.5a4 4 0 0 0 6.2 1M7 10.5h6M7 13.5h6"/>`,
  ticket: `<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4Z"/><path d="M14 6v12" stroke-dasharray="2 2"/>`,
  equipe: `<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2A5 5 0 0 1 21 19"/>`,
  coeur: `<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/>`,
  etoile: `<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>`,
};
const icone = (n) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[n] || ICONES.sifflet}</svg>`;

const head = (eyebrow, titre, intro) => `
      <div class="sec-head">
        <p class="eyebrow">${esc(eyebrow)}</p>
        <h2>${esc(titre)}</h2>
        ${ifv(intro, `<p class="sec-lead">${esc(intro)}</p>`)}
      </div>`;

// ---------- contenus ----------
const g = data("general");
const c = g.contact || {};
const chiffres = data("chiffres");
const pourquoi = data("pourquoi");
const devenir = data("devenir");
const idees = data("idees");
const ressources = data("ressources");
const equipe = data("equipe");
const reunions = data("reunions");

// ---------- sections ----------
const sChiffres = list(chiffres.chiffres).map((x) =>
  `<div class="board-cell"><div class="board-n">${esc(x.nombre)}</div><div class="board-l">${esc(x.texte)}</div></div>`).join("\n      ");

const sPourquoi = list(pourquoi.raisons).map((r) => `
      <article class="reason reveal">
        <span class="reason-ic">${icone(r.icone)}</span>
        <h3 class="reason-t">${esc(r.titre)}</h3>
        <p class="reason-d">${esc(r.texte)}</p>
      </article>`).join("");

const sEtapes = list(devenir.etapes).map((e, i) => {
  const pts = list(e.points);
  return `
      <li class="step reveal">
        <span class="step-n">${num(i)}</span>
        <h3 class="step-t">${esc(e.titre)}</h3>
        <p class="step-d">${esc(e.texte)}</p>
        ${ifv(pts.length, `<ul class="step-facts">${pts.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`)}
      </li>`;
}).join("");

const sIdees = list(idees.questions).map((q, i) => `
      <div class="obj reveal">
        <button class="obj-q" aria-expanded="false" aria-controls="obj${i}">
          <span class="obj-tag">Oui mais…</span>
          <span class="obj-text">${esc(q.question)}</span>
          <span class="obj-chev">${ARROW}</span>
        </button>
        <div class="obj-a" id="obj${i}" role="region"><p>${esc(q.reponse)}</p></div>
      </div>`).join("");

const sRessources = list(ressources.ressources).map((r) => {
  const liens = list(r.liens).filter((l) => l.adresse);
  let html = "";
  if (liens.length > 1) {
    html = `<div class="rules-grid">${liens.map((l) =>
      `<a class="res-cta" href="${esc(chemin(l.adresse))}" target="_blank" rel="noopener">${esc(l.texte || l.adresse)}</a>`).join("")}</div>`;
  } else if (liens.length === 1) {
    html = `<a class="res-cta" href="${esc(chemin(liens[0].adresse))}" target="_blank" rel="noopener">${esc(liens[0].texte || liens[0].adresse)} ${ARROW}</a>`;
  }
  return `
        <div class="res reveal">
          <h3 class="res-t">${esc(r.titre)}</h3>
          <p class="res-d">${esc(r.texte)}</p>
          ${html}
        </div>`;
}).join("");

const sEquipe = list(equipe.membres).map((m, i) => `
        <div class="card reveal" role="button" tabindex="0" aria-pressed="false" aria-label="${esc(m.fonction)}. Retourner la carte.">
          <div class="card-in">
            <div class="card-face card-front">
              <span class="card-n">${num(i)}</span>
              ${ifv(m.photo, `<img class="card-photo" src="${esc(chemin(m.photo))}" alt="Photo de ${esc(m.nom)}" loading="lazy">`)}
              <div class="card-front-b">
                <span class="card-role">${esc(m.fonction)}</span>
                <span class="card-name">${esc(m.nom)}</span>
              </div>
              <span class="card-hint">Retourner ${ARROW}</span>
            </div>
            <div class="card-face card-back">
              <span class="card-role card-role--back">${esc(m.fonction)}</span>
              <p class="card-bio">${esc(m.description)}</p>
              <span class="card-name card-name--back">${esc(m.nom)}${ifv(m.niveau, ` (${esc(m.niveau)})`)}</span>
              ${ifv(m.email, `<a class="card-email" href="mailto:${esc(m.email)}">${esc(m.email)}</a>`)}
            </div>
          </div>
        </div>`).join("");

const PV_IC = `<svg class="ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2.5h8l4 4v15H6z"/><path d="M14 2.5v4h4M9 12h6M9 15.5h6M9 8.5h3"/></svg>`;
const sPV = list(reunions.pv).map((p) => {
  const lien = chemin(p.fichier || p.lien);
  return `
        <a class="pv reveal" href="${esc(lien)}" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir le procès-verbal : ${esc(p.titre)}">
          <span class="pv-ic">${PV_IC}</span>
          <span class="pv-t">${esc(p.titre)}</span>
          <span class="pv-s">${esc(p.saison)}</span>
          <span class="pv-go">${ARROW}</span>
        </a>`;
}).join("");

const contactItem = (label, href, texte, svg, blank) => `
        <div class="contact-item reveal">
          <span class="contact-icon" aria-hidden="true">${svg}</span>
          <div><span class="contact-label">${label}</span><a class="contact-value" href="${esc(href)}"${blank ? ' target="_blank" rel="noopener"' : ""}>${esc(texte)}</a></div>
        </div>`;
const sContact = [
  ifv(c.email, contactItem("E-mail", "mailto:" + c.email, c.email, `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v14H4z"/><path d="m4 7 8 6 8-6"/></svg>`)),
  ifv(c.telephone, contactItem("Téléphone", "tel:" + tel(c.telephone), c.telephone, `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/></svg>`)),
  ifv(c.facebook, contactItem("Facebook", c.facebook, "CFA Liège sur Facebook", `<svg class="ic" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 22v-9h3l.5-3.5h-3.5V7.3c0-1 .3-1.7 1.8-1.7H17V2.5c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5v2.6H7V13h3v9h3.5z"/></svg>`, true)),
  ifv(c.instagram, contactItem("Instagram", c.instagram, "CFA Liège sur Instagram", `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`, true)),
].join("");

// ---------- page ----------
const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(g.titre_onglet)}</title>
<meta name="description" content="${esc(g.description_google)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700&display=swap" rel="stylesheet">
<style>${inc("style.css")}</style>
</head>
<body>
${inc("logo-symbol.svg")}

<header class="hdr">
  <div class="wrap hdr-in">
    <a class="brand" href="#top" aria-label="CFA Liège — accueil"><svg class="logo-svg" viewBox="0 0 525 314"><use href="#cfa"/></svg></a>
    <nav class="nav" aria-label="Navigation principale">
      <a href="#pourquoi">Pourquoi</a>
      <a href="#devenir">Devenir</a>
      <a href="#idees">Oui mais…</a>
      <a href="#ressources">Ressources</a>
      <a href="#equipe">Équipe</a>
      <a href="#reunions">Réunions</a>
    </nav>
    <a class="btn hdr-cta" href="#contact">Je me lance ${ARROW}</a>
    <button class="hamburger" id="menuBtn" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="mobileMenu">
      <span></span><span></span><span></span>
    </button>
  </div>
  <nav class="mnav" id="mobileMenu" aria-label="Menu">
    <a href="#pourquoi">Pourquoi</a>
    <a href="#devenir">Devenir arbitre</a>
    <a href="#idees">Oui mais…</a>
    <a href="#ressources">Ressources</a>
    <a href="#equipe">Équipe</a>
    <a href="#reunions">Réunions</a>
    <a class="btn mnav-cta" href="#contact">Je me lance ${ARROW}</a>
  </nav>
</header>

<main id="top">

  <section class="hero">
    <div class="wrap hero-in">
      <div class="hero-txt">
        <p class="eyebrow hero-eyebrow">${esc(g.accroche)}</p>
        <h1>${esc(g.titre_ligne_1)}<br>${esc(g.titre_ligne_2)} <span class="hl">${esc(g.titre_mot_orange)}</span></h1>
        <p class="hero-sub">${esc(g.sous_titre)}</p>
        <div class="hero-cta">
          <a class="btn" href="#devenir">Devenir arbitre ${ARROW}</a>
          <a class="btn btn--ghost" href="#pourquoi">Pourquoi ?</a>
        </div>
      </div>
      <div class="hero-art-wrap">${inc("court.svg")}</div>
    </div>
  </section>

  <div class="board">
    <div class="wrap board-in" style="--n:${Math.max(1, list(chiffres.chiffres).length)}">
      ${sChiffres}
    </div>
  </div>

  <section class="section" id="pourquoi">
    <div class="wrap">${head("01 · Pourquoi", pourquoi.titre, pourquoi.intro)}
      <div class="reasons">${sPourquoi}
      </div>
    </div>
  </section>

  <section class="section section--ink" id="devenir">
    <div class="wrap">${head("02 · Comment", devenir.titre, devenir.intro)}
      <ol class="steps">${sEtapes}
      </ol>
      <div class="steps-cta"><a class="btn" href="#contact">Passer à l'action ${ARROW}</a></div>
    </div>
  </section>

  <section class="section" id="idees">
    <div class="wrap">${head("03 · Idées reçues", idees.titre, idees.intro)}
      <div class="objs">${sIdees}
      </div>
    </div>
  </section>

  <section class="section section--court" id="ressources">
    <div class="wrap">${head("04 · Ressources", ressources.titre, ressources.intro)}
      <div class="resources">${sRessources}
      </div>
    </div>
  </section>

  <section class="section" id="equipe">
    <div class="wrap">${head("05 · L'équipe", equipe.titre, equipe.intro)}
      <div class="team">${sEquipe}
      </div>
    </div>
  </section>

  <section class="section section--court" id="reunions">
    <div class="wrap">${head("06 · Réunions", reunions.titre, reunions.intro)}
      <div class="pv-list">${sPV}
      </div>
      ${ifv(reunions.note, `<p class="pv-note">${esc(reunions.note)}</p>`)}
    </div>
  </section>

  <section class="section" id="contact">
    <div class="wrap">${head("07 · Contact", g.contact_titre, g.contact_intro)}
      <div class="contact-grid">${sContact}
      </div>
    </div>
  </section>

</main>

<footer class="foot">
  <div class="wrap">
    <div class="foot-top">
      <div>
        <svg class="logo-svg" viewBox="0 0 525 314"><use href="#cfa"/></svg>
        <div class="foot-chain"><b>CFA Liège</b><span class="sep">→</span><b>CP Liège</b><span class="sep">→</span><b>AWBB</b></div>
      </div>
      <div class="foot-col">
        <h4>Le site</h4>
        <a href="#pourquoi">Pourquoi arbitrer</a>
        <a href="#devenir">Devenir arbitre</a>
        <a href="#idees">Oui mais…</a>
        <a href="#equipe">L'équipe</a>
        <a href="#contact">Contact</a>
      </div>
      <div class="foot-col">
        <h4>Liens utiles</h4>
        <a href="#ressources">L'appli des arbitres</a>
        <a href="#ressources">Les règles du jeu</a>
        <a href="https://www.cpliege.be" target="_blank" rel="noopener">CP Liège</a>
        <a href="https://www.awbb.be" target="_blank" rel="noopener">AWBB</a>
        ${ifv(c.facebook, `<a href="${esc(c.facebook)}" target="_blank" rel="noopener noreferrer">Facebook</a>`)}
        ${ifv(c.instagram, `<a href="${esc(c.instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a>`)}
      </div>
    </div>
    <div class="foot-bar">
      <span>${esc(g.pied_de_page)}</span>
      <span>Une envie de siffler ? <a href="#contact" style="color:var(--orange);font-weight:600">Rejoins-nous</a></span>
    </div>
  </div>
</footer>

<script>${inc("script.js")}</script>
</body>
</html>
`;

// ---------- écriture ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "index.html"), html);
for (const dir of ["images", "documents"]) {
  const from = path.join(SRC, dir);
  if (fs.existsSync(from)) fs.cpSync(from, path.join(OUT, dir), { recursive: true });
}
const cname = path.join(__dirname, "CNAME");
if (fs.existsSync(cname)) fs.copyFileSync(cname, path.join(OUT, "CNAME"));
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
console.log("Site construit : _site/index.html (" + Math.round(html.length / 1024) + " Ko)");
