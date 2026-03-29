import { readFileSync, writeFileSync } from 'fs';

function inline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function mdToHtml(md) {
  const lines = md.split('\n');
  let html = '', inList = false, inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();

    if (t === '' || t === '---') {
      if (inList)  { html += '</ul>\n'; inList = false; }
      if (inTable) { html += '</tbody></table></div>\n'; inTable = false; }
      continue;
    }
    if (t.startsWith('# '))   { html += `<h1>${inline(t.slice(2))}</h1>\n`; continue; }
    if (t.startsWith('## '))  { html += `<h2>${inline(t.slice(3))}</h2>\n`; continue; }
    if (t.startsWith('### ')) { html += `<h3>${inline(t.slice(4))}</h3>\n`; continue; }

    if (t.startsWith('|')) {
      if (!inTable) {
        const cells = t.split('|').map(c => c.trim()).filter(Boolean);
        html += '<div class="legal-table-wrap"><table>\n<thead><tr>';
        html += cells.map(c => `<th>${inline(c)}</th>`).join('');
        html += '</tr></thead>\n<tbody>\n';
        inTable = true;
        if (lines[i+1] && lines[i+1].includes('---')) i++;
      } else {
        const cells = t.split('|').map(c => c.trim()).filter(Boolean);
        if (cells.every(c => /^[-:]+$/.test(c))) continue;
        html += '<tr>' + cells.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>\n';
      }
      continue;
    }

    if (t.startsWith('- ')) {
      if (inTable) { html += '</tbody></table></div>\n'; inTable = false; }
      if (!inList) { html += '<ul>\n'; inList = true; }
      html += `<li>${inline(t.slice(2))}</li>\n`;
      continue;
    }

    if (inList)  { html += '</ul>\n'; inList = false; }
    if (inTable) { html += '</tbody></table></div>\n'; inTable = false; }
    html += `<p>${inline(t)}</p>\n`;
  }
  if (inList)  html += '</ul>\n';
  if (inTable) html += '</tbody></table></div>\n';
  return html;
}

function buildPage(slug, title, lastUpdated, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow">
  <meta name="description" content="${title} — 7EMPLE creative marketing agency.">
  <link rel="canonical" href="https://7emple.com/${slug}.html">
  <title>${title} — 7EMPLE</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Inter+Display:ital,opsz,wght@0,32..144,100..900;1,32..144,100..900&display=swap" rel="stylesheet">
  <style>
    :root { --bg:#161616; --text:#F9F9F9; --muted:#BEBEBE; --dim:#999999; --border:rgba(249,249,249,0.1); --orange:#FE4C04; }
    *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
    html { -webkit-font-smoothing:antialiased; }
    body { background:var(--bg); color:var(--text); font-family:'Inter',sans-serif; font-size:15px; line-height:1.6; overflow-x:hidden; }
    img { display:block; max-width:100%; }
    a { text-decoration:none; color:inherit; }
    .wrap { max-width:1480px; margin:0 auto; padding:0 48px; }
    html,body { cursor:none; }
    #cursor { position:fixed; left:0; top:0; width:10px; height:10px; border-radius:50%; background:#fff; mix-blend-mode:difference; pointer-events:none; z-index:99999; transform:translate(-50%,-50%); transition:width .22s cubic-bezier(.16,1,.3,1),height .22s cubic-bezier(.16,1,.3,1); }
    #cursor.is-pointer { width:20px; height:20px; }
    #grain { position:fixed; inset:0; width:100%; height:100%; pointer-events:none; z-index:10001; opacity:.013; mix-blend-mode:screen; image-rendering:pixelated; }
    nav { position:fixed; top:0; left:0; right:0; z-index:1000; display:flex; align-items:center; justify-content:space-between; padding:28px 48px; }
    .nav-logo img { height:22px; width:auto; }
    .nav-right { display:flex; align-items:center; gap:32px; }
    .nav-tag { font-size:11px; color:var(--dim); letter-spacing:.08em; }
    .nav-links { list-style:none; display:flex; gap:28px; }
    .nav-links a { font-size:13px; color:var(--muted); letter-spacing:.04em; transition:color .2s; }
    .nav-links a:hover { color:var(--text); }
    .legal-hero { padding:140px 0 56px; border-bottom:1px solid var(--border); }
    .legal-eyebrow { font-size:10px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; color:var(--orange); margin-bottom:16px; }
    .legal-title { font-family:'Inter Display',sans-serif; font-size:clamp(36px,5vw,72px); font-weight:800; letter-spacing:-.04em; line-height:1.05; }
    .legal-date { font-size:13px; color:var(--dim); margin-top:14px; }
    .legal-body { max-width:800px; padding:56px 0 100px; }
    .legal-body h1 { display:none; }
    .legal-body h2 { font-family:'Inter Display',sans-serif; font-size:18px; font-weight:700; letter-spacing:-.01em; margin:52px 0 14px; padding-top:52px; border-top:1px solid var(--border); }
    .legal-body h2:first-of-type { margin-top:0; padding-top:0; border-top:none; }
    .legal-body h3 { font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); margin:28px 0 10px; }
    .legal-body p { font-size:14px; line-height:1.8; color:#C0C0C0; margin-bottom:14px; }
    .legal-body ul { margin:6px 0 16px 20px; }
    .legal-body li { font-size:14px; line-height:1.75; color:#C0C0C0; margin-bottom:6px; }
    .legal-body strong { color:var(--text); font-weight:600; }
    .legal-body a { color:var(--orange); }
    .legal-body a:hover { text-decoration:underline; }
    .legal-table-wrap { overflow-x:auto; margin:16px 0 24px; border:1px solid var(--border); border-radius:8px; }
    .legal-body table { width:100%; border-collapse:collapse; font-size:13px; }
    .legal-body th { text-align:left; padding:11px 14px; background:rgba(249,249,249,.04); color:var(--muted); font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; border-bottom:1px solid var(--border); white-space:nowrap; }
    .legal-body td { padding:11px 14px; border-bottom:1px solid rgba(249,249,249,.04); color:#C0C0C0; vertical-align:top; line-height:1.6; }
    .legal-body tr:last-child td { border-bottom:none; }
    footer { padding:40px 0 0; }
    .footer-body { display:grid; grid-template-columns:1fr 1fr 1fr; gap:80px; padding:64px 0; border-bottom:1px solid var(--border); }
    .f-brand p { font-size:13px; color:var(--muted); line-height:1.7; margin-top:12px; }
    .f-location { font-size:11px; color:var(--dim); margin-top:8px; }
    .ftr-logo-img { height:24px; width:auto; }
    .f-nav h4 { font-size:10px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); margin-bottom:16px; }
    .f-nav ul { list-style:none; display:flex; flex-direction:column; gap:10px; }
    .f-nav a { font-size:13px; color:var(--muted); transition:color .2s; }
    .f-nav a:hover { color:var(--text); }
    .footer-bottom { display:flex; justify-content:space-between; align-items:center; padding:22px 0; }
    .footer-bottom p { font-size:12px; color:var(--dim); }
    .footer-legal { display:flex; gap:20px; }
    .footer-legal a { font-size:12px; color:var(--dim); transition:color .2s; }
    .footer-legal a:hover { color:var(--text); }
    .copyright-bar { overflow:hidden; border-top:1px solid var(--border); }
    .copyright-inner { font-family:'Inter Display',sans-serif; font-size:clamp(96px,18vw,288px); font-weight:900; letter-spacing:-.07em; line-height:.78; padding:16px 48px 0; color:var(--text); white-space:nowrap; }
    [data-reveal] { opacity:0; transform:translateY(24px); transition:opacity .95s cubic-bezier(.16,1,.3,1),transform .95s cubic-bezier(.16,1,.3,1); }
    [data-reveal].in-view { opacity:1; transform:translateY(0); }
    @media (max-width:768px) {
      nav { padding:20px 24px; }
      .nav-tag { display:none; }
      .wrap { padding:0 24px; }
      .legal-hero { padding:100px 0 40px; }
      .footer-body { grid-template-columns:1fr; gap:40px; padding:40px 0; }
      .footer-bottom { flex-direction:column; align-items:flex-start; gap:10px; }
      .copyright-inner { font-size:clamp(52px,18vw,96px); padding:12px 20px 0; }
    }
  </style>
</head>
<body>
<canvas id="grain"></canvas>
<div id="cursor"></div>
<nav>
  <a href="/index.html" class="nav-logo"><img src="/brand_assets/logo.png" alt="7EMPLE"></a>
  <div class="nav-right">
    <span class="nav-tag">&#169;2026 &#8212; Creative Marketing Agency</span>
    <ul class="nav-links">
      <li><a href="/work.html">Work</a></li>
      <li><a href="/services.html">Services</a></li>
      <li><a href="/about.html">About</a></li>
      <li><a href="/contact.html">Contact</a></li>
    </ul>
  </div>
</nav>
<main>
  <div class="wrap">
    <div class="legal-hero" data-reveal>
      <div class="legal-eyebrow">Legal</div>
      <h1 class="legal-title">${title}</h1>
      <p class="legal-date">Last updated: ${lastUpdated}</p>
    </div>
    <div class="legal-body" data-reveal>
${bodyHtml}    </div>
  </div>
</main>
<footer>
  <div class="wrap">
    <div class="footer-body" data-reveal data-delay="0.1">
      <div class="f-brand">
        <div class="ftr-logo-wrap"><img src="/brand_assets/logo.png" alt="7EMPLE" class="ftr-logo-img"></div>
        <p>Every great brand was built on purpose. We exist to make sure yours is one of them.</p>
        <p class="f-location">Amersfoort, Netherlands / Global</p>
      </div>
      <div class="f-nav">
        <h4>Navigation</h4>
        <ul><li><a href="/work.html">Work</a></li><li><a href="/services.html">Services</a></li><li><a href="/about.html">About</a></li><li><a href="/contact.html">Contact</a></li></ul>
      </div>
      <div class="f-nav">
        <h4>Contact</h4>
        <ul><li><a href="mailto:info@7emple.com">info@7emple.com</a></li><li><a href="https://instagram.com/7emple.nl" target="_blank" rel="noopener">Instagram</a></li><li><a href="https://linkedin.com/company/7emple" target="_blank" rel="noopener">LinkedIn</a></li></ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&#169;2026 7EMPLE. All rights reserved.</p>
      <div class="footer-legal">
        <a href="/privacy.html">Privacy</a>
        <a href="/cookies.html">Cookies</a>
        <a href="/terms.html">Terms</a>
      </div>
      <p>Designed &amp; built by 7EMPLE.</p>
    </div>
  </div>
  <div class="copyright-bar"><div class="copyright-inner">&#169;2026</div></div>
</footer>
<script src="https://unpkg.com/lenis@1.1.14/dist/lenis.min.js"></script>
<script>
(function(){var c=document.getElementById('grain'),ctx=c.getContext('2d');c.width=700;c.height=450;var frames=[],N=4;for(var f=0;f<N;f++){var id=ctx.createImageData(700,450),d=id.data;for(var i=0;i<d.length;i+=4){var v=Math.random()*255|0;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}frames.push(id);}var fi=0,last=0;function draw(t){if(document.hidden){requestAnimationFrame(draw);return;}if(t-last>80){ctx.putImageData(frames[fi++%N],0,0);last=t;}requestAnimationFrame(draw);}requestAnimationFrame(draw);})();
(function(){var el=document.getElementById('cursor'),cx=-100,cy=-100;document.addEventListener('mousemove',function(e){cx=e.clientX;cy=e.clientY;});document.querySelectorAll('a,button').forEach(function(a){a.addEventListener('mouseenter',function(){el.classList.add('is-pointer');});a.addEventListener('mouseleave',function(){el.classList.remove('is-pointer');});});function raf(){el.style.transform='translate3d('+cx+'px,'+cy+'px,0) translate(-50%,-50%)';requestAnimationFrame(raf);}requestAnimationFrame(raf);})();
var lenis=new Lenis({duration:1.3,smoothWheel:true});function lenisRaf(t){lenis.raf(t);requestAnimationFrame(lenisRaf);}requestAnimationFrame(lenisRaf);
var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in-view');obs.unobserve(e.target);}});},{threshold:0.1});document.querySelectorAll('[data-reveal]').forEach(function(el){obs.observe(el);});
(function(){var y=new Date().getFullYear();document.querySelectorAll('.copyright-bar .copyright-inner,.footer-bottom p').forEach(function(el){el.innerHTML=el.innerHTML.replace(/\u00a9\d{4}/g,'\u00a9'+y);});})();
</script>
</body>
</html>`;
}

const pages = [
  { md: 'privacy.md', out: 'privacy.html', slug: 'privacy', title: 'Privacy Statement', date: 'March 2026' },
  { md: 'cookies.md', out: 'cookies.html', slug: 'cookies', title: 'Cookie Policy',     date: 'March 2026' },
  { md: 'terms.md',   out: 'terms.html',   slug: 'terms',   title: 'Terms of Service',  date: 'March 2026' },
];

for (const p of pages) {
  const md = readFileSync(p.md, 'utf8');
  const body = mdToHtml(md);
  writeFileSync(p.out, buildPage(p.slug, p.title, p.date, body));
  console.log('✓ ' + p.out);
}
