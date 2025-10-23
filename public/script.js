// === CONFIG ===
    const PROXY_BASE =
      "https://crossycloaknode.emilianocabralcerroni.workers.dev/?url=";

    // === ELEMENTS ===
    const searchInput = document.getElementById("searchInput");
    const searchInputWrapper = document.querySelector(".search-input-wrapper");

    // === HELPERS ===
    function isValidUrl(string) {
      try {
        new URL(string);
        return true;
      } catch {
        return false;
      }
    }

    function getTargetUrl(input) {
      input = input.trim();
      if (!input) return null;

      // Bing search if input is not a URL
      if (!isValidUrl(input)) {
        return `https://www.bing.com/search?q=${encodeURIComponent(
          input
        )}&qs=n&form=QBRE&sp=-1&ghc=1&lq=0&pq=${encodeURIComponent(
          input
        )}&sc=12-7&sk=&cvid=${crypto.randomUUID()}`;
      }

      return input.startsWith("http") ? input : "https://" + input;
    }

    // === CLOAK FUNCTION USING WORKER ===
    function openCloaked(contentOrUrl) {
      const targetUrl = getTargetUrl(contentOrUrl);
      if (!targetUrl) return;

      const proxiedUrl = PROXY_BASE + encodeURIComponent(targetUrl);

      const win = window.open("about:blank", "_blank");
      if (!win) return alert("Popup blocked!");

      const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          
          <link
            rel="icon"
            type="image/png"
            href="https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Google_Drive_icon_%282020%29.svg/512px-Google_Drive_icon_%282020%29.svg.png?20221103153031"
          />
          
        </head>
        <body>
          <iframe
            src="${proxiedUrl}"
            allowfullscreen
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
          ></iframe>
        </body>
      </html>`;

      win.document.open();
      win.document.write(html);
      win.document.close();
    }

    // === INPUT WIDTH UPDATE FUNCTION ===
    function updateInputWidth() {
      if (
        searchInput.value.trim() !== "" ||
        searchInput === document.activeElement
      ) {
        searchInputWrapper.classList.add("expanded");
      } else {
        searchInputWrapper.classList.remove("expanded");
      }
    }

    // === EVENT LISTENERS ===
    searchInput.addEventListener("input", updateInputWidth);
    searchInput.addEventListener("focus", updateInputWidth);
    searchInput.addEventListener("blur", updateInputWidth);

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const input = searchInput.value.trim();
        if (input) openCloaked(input);
      }
    });

    // initialize state on load
    updateInputWidth();

    // === STATIC DOT GRID BACKGROUND ===
    const canvas = document.getElementById("bgCanvas");
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawGrid();
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    function drawGrid() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const spacing = 40; // distance between dots
      const radius = 2; // dot size
      const color = "rgba(255, 255, 255, 0.05)"; // soft white/gray look

      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
      }
    }
