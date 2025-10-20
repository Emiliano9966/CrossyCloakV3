// === ELEMENTS ===
const searchInput = document.getElementById('searchInput');

// === CONFIG ===
const PROXY_URL = 'https://crossy-cloak-v3.vercel.app/api/proxy'; // Replace with your Vercel domain

// === HELPERS ===
function getTargetUrl(input) {
  input = input.trim();
  if (input.startsWith('g:') || !/^https?:\/\//i.test(input)) {
    const query = input.startsWith('g:') ? input.slice(2).trim() : input;
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }
  return input;
}

// === CLOAK FUNCTION ===
function openCloaked(contentOrUrl) {
  const targetUrl = getTargetUrl(contentOrUrl);
  const win = window.open('about:blank', '_blank');
  if (!win) {
    alert('Popup blocked! Please allow popups for this site.');
    return;
  }

  const iframeSrc = `${PROXY_URL}?url=${encodeURIComponent(targetUrl)}`;
  const sandbox = 'allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation';

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Crossy 🦊 Blank Page</title>
    <style>
      body { margin:0; padding:0; background:#000; }
      iframe {
        position:fixed;
        top:0; left:0;
        width:100%; height:100%;
        border:none;
      }
    </style>
    <script>
      // Auto-redirect for navigation
      window.addEventListener('message', (event) => {
        if (event.data && event.data.url && event.data.url !== window.location.href) {
          const newUrl = '${PROXY_URL}?url=' + encodeURIComponent(event.data.url);
          window.location = 'about:blank'; // Reset
          window.location = newUrl; // Redirect to cloaked version
        }
      });
    </script>
  </head>
  <body>
    <iframe src="${iframeSrc}" sandbox="${sandbox}" id="cloakFrame" onload="this.contentWindow.postMessage({ url: location.href }, '*');"></iframe>
  </body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
}

// === EVENT LISTENERS ===
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const input = searchInput.value.trim();
    if (input) {
      openCloaked(input);
    }
  }
});

// === PARTICLE BACKGROUND ===
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
const particleCount = 50;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.size = Math.random() * 1.8 + 0.5;
    this.alpha = Math.random() * 0.5 + 0.2;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height)
      this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
    ctx.fill();
  }
}

function initParticles() {
  particles = Array.from({ length: particleCount }, () => new Particle());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of particles) {
    p.update();
    p.draw();
  }
  requestAnimationFrame(animate);
}

initParticles();
animate();
