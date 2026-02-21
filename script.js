// ============================================================
//  RFADELCLOUD.COM — Script
// ============================================================

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

// ---------- Smooth scroll for nav links ----------
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      const offset = 56; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ---------- Active nav highlight on scroll ----------
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = '';
        link.style.textShadow = '';
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.style.color = 'var(--yellow)';
          link.style.textShadow = '0 0 10px var(--yellow)';
        }
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => observer.observe(s));

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  if (typedEl) type();
});
