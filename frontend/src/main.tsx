import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ── Natural background crossfade ──────────────────────────────────────────
const BG_IMAGES = ["/bg1.jpg", "/bg2.jpg", "/bg3.jpg", "/bg4.jpg", "/bg5.jpg"];
const INTERVAL_MS = 8000; // 8 s per image

function initBackgroundSlideshow() {
  // Overlay (dark tint)
  const overlay = document.createElement("div");
  overlay.className = "bg-overlay";
  document.body.prepend(overlay);

  // One div per image
  const layers = BG_IMAGES.map((src, i) => {
    const div = document.createElement("div");
    div.className = "bg-layer" + (i === 0 ? " active" : "");
    div.style.backgroundImage = `url(${src})`;
    document.body.prepend(div);
    return div;
  });

  let current = 0;

  setInterval(() => {
    layers[current].classList.remove("active");
    current = (current + 1) % layers.length;
    layers[current].classList.add("active");
  }, INTERVAL_MS);
}

initBackgroundSlideshow();
// ─────────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
