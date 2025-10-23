// === CONFIG ===
const PROXY_BASE = "https://crossycloaknode.emilianocabralcerroni.workers.dev/?url=";

// === ELEMENTS ===
const searchInput = document.getElementById('searchInput');

// === HELPERS ===
function isValidUrl(string) {
  try { new URL(string); return true; } catch { return false; }
}

// Build target: DuckDuckGo for searches, full URL for valid addresses
function getTargetUrl(input) {
  input = input.trim();
  if (!input) return null;

  // Non-URL -> DuckDuckGo (web search format)
  if (!isValidUrl(input)) {
    return `https://duckduckgo.com/?origin=funnel_home_google&t=h_&q=${encodeURIComponent(input)}&ia=web`;
  }

  // Valid URL -> ensure scheme
  return input.startsWith('http') ? input : 'https://' + input;
}

// Decide whether to use your worker proxy
function shouldUseWorkerFor(targetUrl) {
  // We'll NOT use the worker for DuckDuckGo searches since embedding via worker caused
  // blank pages for you. Add other domains here if you want them opened directly.
  try {
    const u = new URL(targetUrl);
    if (u.hostname.includes('duckduckgo.com')) return false;
    return true;
  } catch {
    return true;
  }
}

// === CLOAK FUNCTION USING WORKER WHEN APPROPRIATE ===
function openCloaked(contentOrUrl) {
  const targetUrl = getTargetUrl(contentOrUrl);
  if (!targetUrl) {
    alert('No URL provided!');
    return;
  }

  const useWorker = shouldUseWorkerFor(targetUrl);
  const frameSrc = useWorker ? (PROXY_BASE + encodeURIComponent(targetUrl)) : targetUrl;

  // Open a new blank window and write a small viewer page with an iframe + fallback link
  const win = window.open('about:blank', '_blank');
  if (!win) {
    alert('Popup blocked! Please allow popups for this site.');
    return;
  }

  const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Cloaked Page</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      :root { --bg:#000; --muted:#cfcfcf; --accent:#6ea8ff; }
      html,body { height:100%; margin:0; background:var(--bg); color:var(--muted); font-family:Inter,Arial,sans-serif; }
      .frame { position:fixed; inset:0; border:0; width:100%; height:100%; }
      .ui {
        position:fixed; left:12px; top:12px; z-index:9999;
        display:flex; gap:8px; align-items:center;
        background:rgba(0,0,0,0.45); padding:8px 10px; border-radius:8px;
        backdrop-filter: blur(6px);
      }
      .ui a, .ui button { color:var(--muted); text-decoration:none; border:0; background:transparent; cursor:pointer; font-size:14px; }
      .ui a:hover, .ui button:hover { color:var(--accent); }
      .msg {
        position:fixed; left:50%; bottom:22px; transform:translateX(-50%);
        background: rgba(0,0,0,0.6); color:var(--muted); padding:10px 14px; border-radius:10px; display:none;
      }
    </style>
  </head>
  <body>
    <div class="ui">
      <button id="openDirectBtn">Open Direct</button>
      <a id="openNewTab" href="${targetUrl}" target="_blank" rel="noopener">Open in new tab</a>
      <a id="closeBtn" href="#" onclick="window.close();return false;">Close</a>
    </div>

    <iframe id="cloakedFrame" class="frame" src="${frameSrc}" sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"></iframe>

    <div id="msg" class="msg">If the page doesn't display correctly try "Open Direct" or "Open in new tab".</div>

    <script>
      const frame = document.getElementById('cloakedFrame');
      const openDirectBtn = document.getElementById('openDirectBtn');
      const openNewTab = document.getElementById('openNewTab');
      const msg = document.getElementById('msg');

      // Set the direct URL (not proxied) so users can fallback
      openDirectBtn.addEventListener('click', () => {
        window.open("${targetUrl}", '_blank');
      });

      // Show a small hint after a short timeout in case embedding fails visually
      let hintTimer = setTimeout(() => {
        msg.style.display = 'block';
      }, 1600);

      // Also hide hint if user interacts
      window.addEventListener('mousemove', () => { msg.style.display='none'; clearTimeout(hintTimer); }, { once:true });

      // On iframe error or load issues we can't always detect cross-origin failures,
      // but we keep the fallback buttons visible for the user.
      frame.addEventListener('error', () => {
        msg.textContent = 'Error loading page — try Open Direct or Open in new tab.';
        msg.style.display = 'block';
      });

      // Try a basic "blank detection": if iframe remains about:blank after load, show message
      frame.addEventListener('load', () => {
        try {
          // If same-origin we can inspect; if not, this will throw — which is fine (means it loaded cross-origin).
          const doc = frame.contentDocument;
          // If doc is empty or too small, warn
          if (doc && doc.body && doc.body.children.length === 0 && doc.body.textContent.trim().length < 5) {
            msg.textContent = 'Page appears empty — try "Open Direct".';
            msg.style.display = 'block';
          }
        } catch (e) {
          // Cross-origin access throws — assume content loaded fine (can't detect more)
          // for proxied pages this won't throw because they are same-origin (via your worker)
        }
      });
    </script>
  </body>
  </html>
  `;

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

// === PARTICLE BACKGROUND (unchanged) ===
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
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
    ctx.fill();
  }
}

function initParticles() { particles = Array.from({ length: particleCount }, () => new Particle()); }
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of particles) { p.update(); p.draw(); }
  requestAnimationFrame(animate);
}
initParticles();
animate();
