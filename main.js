// Theme toggle
const toggle = document.getElementById('themeToggle');
const root = document.documentElement;

const saved = localStorage.getItem('theme');
if (saved === 'light') root.classList.add('light');

toggle.addEventListener('click', () => {
  root.classList.toggle('light');
  localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
});

const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Sending…';
  status.className = 'form-status';
  status.textContent = '';

  // Simulate a send — replace with your own endpoint (Formspree, Netlify Forms, etc.)
  await new Promise((r) => setTimeout(r, 1000));

  status.className = 'form-status success';
  status.textContent = 'Message sent! I\'ll get back to you soon.';
  form.reset();
  btn.disabled = false;
  btn.textContent = 'Send message';
});
