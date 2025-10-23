// === CONFIG ===
const UV_URL = "https://ultraviolet-app-tau-orcin.vercel.app/service/";
const FALLBACK_PROXY = "https://cloak-proxy.vercel.app/?url=";

// === ELEMENTS ===
const searchInput = document.getElementById("searchInput");

// === HELPERS ===
function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function buildUrl(input) {
  input = input.trim();
  if (!input) return null;

  // Handle Google search or invalid URLs
  if (input.startsWith("g:") || (!isValidUrl(input) && !input.includes("."))) {
    const query = input.startsWith("g:") ? input.slice(2).trim() : input;
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }

  // Add protocol if missing
  if (!/^https?:\/\//i.test(input)) {
    input = "https://" + input;
  }
  return input;
}

// === ULTRAVIOLET ENCODER ===
function encodeUV(url) {
  try {
    return btoa(url);
  } catch {
    return "";
  }
}

// === CLOAK FUNCTION ===
async function openCloaked(input) {
  const target = buildUrl(input);
  if (!target) return;

  // Build Ultraviolet encoded link
  const encoded = encodeUV(target);
  const uvLink = `${UV_URL}${encoded}`;

  // Open blank tab
  const win = window.open("about:blank", "_blank");
  if (!win) {
    alert("Popup blocked! Please allow popups for this site.");
    return;
  }

  // HTML skeleton for cloaked tab
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My Drive - Google Drive</title>
  <link rel="icon" type="image/png" href="/img/drive.png">
  <style>
    html, body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#000; }
    iframe { position:fixed; top:0; left:0; width:100%; height:100%; border:none; background:#000; }
  </style>
</head>
<body>
  <iframe id="cloakFrame" allowfullscreen sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"></iframe>
  <script>
    const iframe = document.getElementById("cloakFrame");
    const uvLink = ${JSON.stringify(uvLink)};
    const fallback = ${JSON.stringify(FALLBACK_PROXY + encodeURIComponent(target))};

    // Try loading Ultraviolet first
    fetch(uvLink, { method: "HEAD", mode: "no-cors" })
      .then(() => iframe.src = uvLink)
      .catch(() => iframe.src = fallback);

    // Safety timeout — if frame stays blank 3s, use fallback
    setTimeout(() => {
      if (!iframe.contentWindow || iframe.contentDocument.body.innerHTML.trim() === "") {
        iframe.src = fallback;
      }
    }, 3000);
  <\/script>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
}

// === EVENT LISTENER ===
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const input = searchInput.value.trim();
    if (input) openCloaked(input);
  }
});

// === PARTICLES ===
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
let particles = [];
const particleCount = 50;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
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
    ctx.fillStyle = \`rgba(255,255,255,\${this.alpha})\`;
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
