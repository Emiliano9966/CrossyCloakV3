const contentInput = document.getElementById('content');
const cloakBtn = document.getElementById('cloakBtn');
const previewFrame = document.getElementById('previewFrame');

// Vercel serverless function proxy endpoint
const PROXY_URL = '/api/proxy';

// Preview content in the iframe
function loadPreview(contentOrUrl) {
    const isUrl = contentOrUrl.match(/^https?:\/\//i);
    let src;
    if (isUrl) {
        src = `${PROXY_URL}?url=${encodeURIComponent(contentOrUrl)}`;
    } else {
        src = `data:text/html;charset=utf-8,${encodeURIComponent(contentOrUrl)}`;
    }
    previewFrame.src = src;
}

// Open content in about:blank tab with full-screen iframe
function openCloaked(contentOrUrl) {
    const win = window.open('about:blank', '_blank');
    if (!win) {
        alert('Popup blocked! Please allow popups for this site.');
        return;
    }

    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Blank Page</title>
            <style>
                body { margin: 0; padding: 0; }
                iframe {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    border: none; background: white;
                }
            </style>
        </head>
        <body>
    `);

    const isUrl = contentOrUrl.match(/^https?:\/\//i);
    let iframeSrc;
    if (isUrl) {
        iframeSrc = `${PROXY_URL}?url=${encodeURIComponent(contentOrUrl)}`;
    } else {
        iframeSrc = `data:text/html;charset=utf-8,${encodeURIComponent(contentOrUrl)}`;
    }

    // Sandbox attributes for max compatibility
    const sandbox = 'allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation';

    win.document.write(`
            <iframe src="${iframeSrc}" sandbox="${sandbox}"></iframe>
        </body>
        </html>
    `);
    win.document.close();
}

// Event listeners
cloakBtn.addEventListener('click', () => {
    const content = contentInput.value.trim();
    if (!content) {
        alert('Please enter a URL or HTML code!');
        return;
    }
    openCloaked(content);
});

// Live preview on input
contentInput.addEventListener('input', () => {
    const content = contentInput.value.trim();
    if (content) {
        loadPreview(content);
    } else {
        previewFrame.src = 'about:blank';
    }
});