// === CLOAK PROXY CONFIG ===
const UV_URL = "https://ultraviolet-app-tau-orcin.vercel.app/service/"; // Your Ultraviolet instance
const FALLBACK_PROXY = "https://cloak-proxy.vercel.app/?url="; // Backup if UV fails

// === UTILITIES ===
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function encodeForUV(url) {
  // Converts to full URL or Google search
  if (!/^https?:\/\//i.test(url)) {
    url = "https://www.google.com/search?q=" + encodeURIComponent(url);
  }
  return btoa(url); // Base64 encode
}

// === MAIN LOADER ===
async function loadPage(input) {
  const iframe = document.getElementById("cloakFrame");
  if (!input) return;

  let targetUrl = input.trim();
  if (!targetUrl) return;

  // Handle search terms or URLs
  if (!isValidUrl(targetUrl) && !targetUrl.includes(".")) {
    targetUrl = "https://www.google.com/search?q=" + encodeURIComponent(targetUrl);
  } else if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = "https://" + targetUrl;
  }

  const encoded = encodeForUV(targetUrl);
  const uvLink = `${UV_URL}${encoded}`;

  // === TRY ULTRAVIOLET ===
  try {
    const test = await fetch(uvLink, { method: "HEAD", mode: "no-cors" });
    iframe.src = uvLink;
  } catch (err) {
    console.warn("Ultraviolet failed, using fallback proxy:", err);
    iframe.src = `${FALLBACK_PROXY}${encodeURIComponent(targetUrl)}`;
  }
}

// === EVENTS ===
document.getElementById("goButton").addEventListener("click", () => {
  const input = document.getElementById("urlInput").value;
  loadPage(input);
});

document.getElementById("urlInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    loadPage(e.target.value);
  }
});

// === DEFAULT HOME PAGE ===
window.onload = () => {
  loadPage("https://google.com");
};
