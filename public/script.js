// === CONFIG ===
const PROXY_BASE = "https://crossycloaknode.emilianocabralcerroni.workers.dev/?url=";

// === ELEMENTS ===
const searchInput = document.getElementById('searchInput');

// === HELPERS ===
function isValidUrl(string) {
  try { new URL(string); return true; } catch { return false; }
}

function getTargetUrl(input) {
  input = input.trim();
  if (!input) return null;

  // If not URL or prefixed with g:, treat as search
  if (!isValidUrl(input)) {
    // DuckDuckGo search
    return `https://duckduckgo.com/?origin=funnel_home_google&t=h_&q=${encodeURIComponent(input)}&ia=web`;
  }

  return input.startsWith('http') ? input : 'https://' + input;
}

// === CLOAK FUNCTION USING WORKER ===
function openCloaked(contentOrUrl) {
  const targetUrl = getTargetUrl(contentOrUrl);
  if (!targetUrl) return;

  // DuckDuckGo searches open in new tab (iframe blocked)
  if (targetUrl.includes('duckduckgo.com')) {
    window.open(targetUrl, '_blank');
    return;
  }

  // Use Worker proxy for everything else
  const proxiedUrl = PROXY_BASE + encodeURIComponent(targetUrl);
  const win = window.open('about:blank', '_blank');
  if (!win) {
    alert('Popup blocked! Please allow popups for this site.');
    return;
  }

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Cloaked Page</title>
    <link rel="icon" type="image/png" href="/img/drive.png">
    <style>
      html, body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#000; }
      iframe { position:fixed; top:0; left:0; width:100%; height:100%; border:none; }
    </style>
  </head>
  <body>
    <iframe src="${proxiedUrl}" allowfullscreen sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"></iframe>
  </body>
  </html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
}

// === EVENT LISTENER ===
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const input = searchInput.value.trim();
    if (input) openCloaked(input);
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
