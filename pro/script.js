// ============================================================
//  RFADELCLOUD.COM/PRO — Script
// ============================================================

// ---------- Scroll Reveal ----------
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Stagger delay based on position among siblings
      const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
      const idx = siblings.indexOf(entry.target);
      const delay = Math.min(idx * 80, 400);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

// ---------- Typing Effect ----------
const typedEl = document.getElementById('typed-text');
const phrases = [
  'IT Support Specialist',
  'Help Desk Technician',
  'Desktop Support Engineer',
  'Problem Solver',
];
let phraseIndex = 0;
let charIndex = 0;
let deleting = false;
let pause = false;

function type() {
  if (pause) {
    setTimeout(type, 1800);
    pause = false;
    return;
  }

  const current = phrases[phraseIndex];

  if (!deleting) {
    typedEl.textContent = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      pause = true;
      deleting = true;
    }
    setTimeout(type, 80);
  } else {
    typedEl.textContent = current.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
    setTimeout(type, 40);
  }
}

// ---------- Nav shadow on scroll ----------
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// ---------- Smooth scroll for nav links ----------
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      const offset = 60;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ---------- Active nav highlight on scroll ----------
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.classList.add('active');
        }
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

// ---------- Skills Network — Ethernet Cable Mesh ----------
(function () {
  const svg = document.getElementById('network-svg');
  if (!svg) return;

  const NS  = 'http://www.w3.org/2000/svg';
  const CABLE_COLOR   = '#0066cc';
  const CABLE_OPACITY = 0.22;   // dim base wire
  const PULSE_COLOR   = '#00aaff'; // bright cyan pulse head
  const PULSE_LEN     = 0.18;   // fraction of cable length lit up per pulse

  // Edges connecting 6 nodes (0-5) in a 3×2 grid
  const EDGES = [
    [0,1],[1,2],
    [3,4],[4,5],
    [0,3],[1,4],[2,5],
    [0,4],[1,5],[1,3],
  ];

  let cables  = [];  // { pts, totalLen }
  let pulses  = [];  // { edgeIdx, progress, speed, dir, line el }

  /* ---------- geometry helpers ---------- */
  function getPortCenter(el) {
    // Connect cables to a point near the top-right corner of the card
    const r  = el.getBoundingClientRect();
    const wr = svg.getBoundingClientRect();
    return {
      x: r.left - wr.left + r.width  - 14,
      y: r.top  - wr.top  + 14,
    };
  }

  function pathPoints(a, b) {
    const midX = (a.x + b.x) / 2;
    return [
      { x: a.x, y: a.y },
      { x: midX, y: a.y },
      { x: midX, y: b.y },
      { x: b.x,  y: b.y },
    ];
  }

  function segLen(pts) {
    let l = 0;
    for (let i = 1; i < pts.length; i++)
      l += Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y);
    return l;
  }

  // Return {x,y} at fraction t along a polyline
  function posAtT(pts, total, t) {
    let remain = t * total;
    for (let i = 1; i < pts.length; i++) {
      const d = Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y);
      if (remain <= d) {
        const f = remain / d;
        return {
          x: pts[i-1].x + (pts[i].x - pts[i-1].x) * f,
          y: pts[i-1].y + (pts[i].y - pts[i-1].y) * f,
        };
      }
      remain -= d;
    }
    return pts[pts.length - 1];
  }

  /* ---------- build ---------- */
  function buildNetwork() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    cables = []; pulses = [];

    const nodes = Array.from(document.querySelectorAll('.skill-category[data-node]'))
      .sort((a, b) => +a.dataset.node - +b.dataset.node);
    if (nodes.length < 6) return;
    if (nodes[0].getBoundingClientRect().width === 0) return;

    // ---- defs: glow filter + gradient ----
    const defs = document.createElementNS(NS, 'defs');

    // Glow filter for the pulse head
    const filt = document.createElementNS(NS, 'filter');
    filt.setAttribute('id', 'pulse-glow');
    filt.setAttribute('x', '-60%'); filt.setAttribute('y', '-60%');
    filt.setAttribute('width', '220%'); filt.setAttribute('height', '220%');
    const fblur = document.createElementNS(NS, 'feGaussianBlur');
    fblur.setAttribute('stdDeviation', '2');
    fblur.setAttribute('result', 'blur');
    const fmerge = document.createElementNS(NS, 'feMerge');
    ['blur', 'SourceGraphic'].forEach(src => {
      const mn = document.createElementNS(NS, 'feMergeNode');
      mn.setAttribute('in', src);
      fmerge.appendChild(mn);
    });
    filt.appendChild(fblur); filt.appendChild(fmerge);
    defs.appendChild(filt);
    svg.appendChild(defs);

    // ---- inject WiFi icons into each card ----
    nodes.forEach(card => {
      // Remove any previously injected icon
      const old = card.querySelector('.wifi-icon');
      if (old) old.remove();

      // SVG WiFi signal: 3 arcs + dot, centered at bottom of a 20×20 viewBox
      const iconSVG = document.createElementNS(NS, 'svg');
      iconSVG.setAttribute('class', 'wifi-icon');
      iconSVG.setAttribute('viewBox', '0 0 20 20');
      iconSVG.setAttribute('aria-hidden', 'true');

      // Dot at center bottom
      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('class', 'wifi-dot');
      dot.setAttribute('cx', '10'); dot.setAttribute('cy', '17');
      dot.setAttribute('r', '1.5');
      iconSVG.appendChild(dot);

      // Three arcs (small → large), all centered at (10, 17)
      const arcData = [
        { r: 3.5, sw: '1.5' },
        { r: 6.5, sw: '1.5' },
        { r: 9.5, sw: '1.5' },
      ];
      arcData.forEach(({ r, sw }) => {
        const arc = document.createElementNS(NS, 'path');
        arc.setAttribute('class', 'wifi-arc');
        arc.setAttribute('stroke-width', sw);
        // Upper semicircle centered at (10, 17)
        arc.setAttribute('d',
          `M ${(10 - r).toFixed(1)} 17 A ${r} ${r} 0 0 1 ${(10 + r).toFixed(1)} 17`
        );
        iconSVG.appendChild(arc);
      });

      card.appendChild(iconSVG);
    });

    // ---- draw base cables + spawn pulses ----
    EDGES.forEach(([ai, bi]) => {
      const a   = getPortCenter(nodes[ai]);
      const b   = getPortCenter(nodes[bi]);
      const pts = pathPoints(a, b);
      const len = segLen(pts);

      // Base cable: dashed thin line
      const d = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
      const wire = document.createElementNS(NS, 'path');
      wire.setAttribute('d', d);
      wire.setAttribute('stroke', CABLE_COLOR);
      wire.setAttribute('stroke-width', '1.5');
      wire.setAttribute('stroke-opacity', String(CABLE_OPACITY));
      wire.setAttribute('stroke-dasharray', '5 4');
      wire.setAttribute('fill', 'none');
      svg.appendChild(wire);

      // Pulse segment: a <line> that we reposition each frame
      const pulseLine = document.createElementNS(NS, 'line');
      pulseLine.setAttribute('stroke-width', '2.5');
      pulseLine.setAttribute('stroke-linecap', 'round');
      pulseLine.setAttribute('filter', 'url(#pulse-glow)');
      svg.appendChild(pulseLine);

      const idx = cables.length;
      cables.push({ pts, len });

      pulses.push({
        edgeIdx:  idx,
        el:       pulseLine,
        progress: Math.random(),
        speed:    0.0006 + Math.random() * 0.0008,
        dir:      Math.random() < 0.5 ? 1 : -1,
      });
    });
  }

  /* ---------- animate ---------- */
  function animate() {
    for (const p of pulses) {
      p.progress += p.speed * p.dir;
      if (p.progress > 1) { p.progress = 1; p.dir = -1; }
      if (p.progress < 0) { p.progress = 0; p.dir =  1; }

      const { pts, len } = cables[p.edgeIdx];

      // Tail is PULSE_LEN behind the head (clamped)
      const headT = p.progress;
      const tailT = Math.max(0, headT - PULSE_LEN * p.dir);
      const tA = p.dir > 0 ? tailT : headT;
      const tB = p.dir > 0 ? headT : tailT;

      const head = posAtT(pts, len, tB);
      const tail = posAtT(pts, len, tA);

      p.el.setAttribute('x1', tail.x);
      p.el.setAttribute('y1', tail.y);
      p.el.setAttribute('x2', head.x);
      p.el.setAttribute('y2', head.y);

      // Color: bright cyan at head, fades toward dim blue at tail
      // Encode brightness in the stroke (use a linear-gradient-like trick via opacity)
      // We approximate with two overlapping elements by just setting stroke to PULSE_COLOR
      // and varying opacity based on distance from center
      const mid = (tA + tB) / 2;
      const distFromEdge = Math.min(mid, 1 - mid) * 2; // 0=edge, 1=center
      const glow = 0.55 + distFromEdge * 0.45;
      p.el.setAttribute('stroke', PULSE_COLOR);
      p.el.setAttribute('stroke-opacity', glow.toFixed(2));
    }
    requestAnimationFrame(animate);
  }

  /* ---------- init ---------- */
  let animationStarted = false;

  function tryBuild() {
    const nodes = document.querySelectorAll('.skill-category[data-node]');
    if (nodes.length < 6) return false;
    if (nodes[0].getBoundingClientRect().width === 0) return false;
    buildNetwork();
    if (!animationStarted) { animationStarted = true; animate(); }
    return true;
  }

  let poll = setInterval(() => { if (tryBuild()) clearInterval(poll); }, 200);
  setTimeout(() => clearInterval(poll), 10000);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildNetwork, 150);
  }, { passive: true });
})();

// ---------- Background: Floating Skill Badges ----------
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');

  const SKILLS = [
    'Active Directory', 'ServiceNow', 'Windows 11', 'macOS', 'Linux',
    'TCP/IP', 'DNS', 'DHCP', 'VPN', 'LAN / WAN',
    'MFA', '2SV', 'SSH', 'Jira', 'Confluence',
    'VMware', 'Proxmox', 'VirtualBox', 'TeamViewer',
    'Google Workspace', 'Microsoft 365', 'Entra ID',
    'Help Desk', 'Tier 1 / 2', 'ITSM', 'Ticketing',
    'Hardware Diagnostics', 'Remote Desktop', 'Onboarding',
  ];

  const FONT    = '500 12px Inter, sans-serif';
  const PAD_X   = 14;
  const RADIUS  = 20;
  const ACCENT  = '0, 102, 204';
  const COUNT   = 22;

  let W, H, badges = [];

  // Pre-measure text widths so badges have correct sizes
  ctx.font = FONT;
  const measured = SKILLS.map(s => ({ text: s, w: ctx.measureText(s).width }));

  function makeBadge() {
    const skill = measured[Math.floor(Math.random() * measured.length)];
    const bw    = skill.w + PAD_X * 2;
    const bh    = 28;
    const alpha = 0.06 + Math.random() * 0.10;   // very faint
    const speed = 0.18 + Math.random() * 0.28;   // px/frame
    const drift = (Math.random() - 0.5) * 0.18;  // gentle horizontal sway
    const x     = Math.random() * (W - bw);
    const y     = H + 10 + Math.random() * H;    // start below viewport, staggered
    return { text: skill.text, bw, bh, x, y, alpha, speed, drift };
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function drawBadge(b) {
    const { x, y, bw, bh, text, alpha } = b;
    const r = RADIUS;

    // Pill background
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + bw - r, y);
    ctx.quadraticCurveTo(x + bw, y, x + bw, y + r);
    ctx.lineTo(x + bw, y + bh - r);
    ctx.quadraticCurveTo(x + bw, y + bh, x + bw - r, y + bh);
    ctx.lineTo(x + r, y + bh);
    ctx.quadraticCurveTo(x, y + bh, x, y + bh - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle   = `rgba(${ACCENT}, ${alpha * 0.55})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${ACCENT}, ${alpha * 1.6})`;
    ctx.lineWidth   = 1;
    ctx.stroke();

    // Label
    ctx.font         = FONT;
    ctx.fillStyle    = `rgba(${ACCENT}, ${alpha * 3.5})`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + bw / 2, y + bh / 2);
  }

  function init() {
    resize();
    badges = Array.from({ length: COUNT }, makeBadge);
    // Spread initial positions across entire screen height so it's not all starting at bottom
    badges.forEach(b => { b.y = Math.random() * (H + 200) - 100; });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (const b of badges) {
      b.y     -= b.speed;
      b.x     += b.drift;
      // Fade near top: opacity ramps down in top 15% of screen
      const fadeZone = H * 0.15;
      const dispAlpha = b.y < fadeZone ? b.alpha * Math.max(0, b.y / fadeZone) : b.alpha;
      const saved = b.alpha;
      b.alpha = dispAlpha;
      drawBadge(b);
      b.alpha = saved;

      // Recycle when fully off the top
      if (b.y + b.bh < 0) {
        const fresh = makeBadge();
        b.text  = fresh.text;
        b.bw    = fresh.bw;
        b.alpha = fresh.alpha;
        b.speed = fresh.speed;
        b.drift = fresh.drift;
        b.x     = fresh.x;
        b.y     = H + 10;
      }
      // Wrap horizontal drift
      if (b.x + b.bw < 0) b.x = W;
      if (b.x > W)        b.x = -b.bw;
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); }, { passive: true });
  init();
  draw();
})();

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  if (typedEl) type();
});
