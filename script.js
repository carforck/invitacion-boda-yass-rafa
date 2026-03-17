/* ══════════════════════════════════════════
   YASS & RAFA · INVITACIÓN DIGITAL 2026
   script.js — Versión Control Manual
══════════════════════════════════════════ */

const WA_NUMBER  = '573105080356';
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyD5K09PZ-YCKsGhU6ZUwilOMP82wHUE9GE2gzCNS8GoNv14Oje6zqeCuKWaCSvJKNq/exec';

const scrollContainer = document.getElementById('scrollContainer');
const navDots         = document.querySelectorAll('.nav-dot');
const navDotsWrap     = document.getElementById('navDots');
const musicBtn         = document.getElementById('musicBtn');
const bgMusic         = document.getElementById('bgMusic');
const rsvpForm        = document.getElementById('rsvpForm');
const rsvpSuccess     = document.getElementById('rsvpSuccess');
const mapOverlay      = document.getElementById('mapOverlay');
const mapIframe       = document.getElementById('mapIframe');

let currentSlice   = 0;
let musicPlaying   = false;
let globalCupos    = '1';

const lightSlices     = [0, 4, 5, 7];
const darkMusicSlices = [4, 5, 7];

/* ── 1. INVITADO ── */
function initGuestName() {
  const params = new URLSearchParams(window.location.search);
  const name   = params.get('invitado') || params.get('guest');
  globalCupos  = params.get('cupos') || '1';

  const greeting  = document.getElementById('rsvpGreeting');
  const cuposEl   = document.getElementById('rsvpCupos');
  const nameInput = document.getElementById('guestName');

  if (name) {
    const decoded = decodeURIComponent(name.replace(/_/g, ' '));
    if (greeting)  greeting.textContent = `¡Hola, ${decoded}!`;
    if (nameInput) nameInput.value = decoded;
  }
  if (cuposEl) {
    cuposEl.textContent = `Pase válido para ${globalCupos} persona${globalCupos !== '1' ? 's' : ''} 🌿`;
  }
}

/* ── 2. CUENTA REGRESIVA ── */
function updateCountdown() {
  const target = new Date('2026-05-09T16:00:00');
  const diff   = target - new Date();
  const ids    = ['cd-days', 'cd-hours', 'cd-mins', 'cd-secs'];

  if (diff <= 0) {
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '00'; });
    return;
  }
  const vals = [
    Math.floor(diff / 86400000),
    Math.floor((diff % 86400000) / 3600000),
    Math.floor((diff % 3600000)  / 60000),
    Math.floor((diff % 60000)    / 1000),
  ];
  vals.forEach((v, i) => {
    const el = document.getElementById(ids[i]);
    if (el) el.textContent = String(v).padStart(2, '0');
  });
}
setInterval(updateCountdown, 1000);

/* ── 3. NAVEGACIÓN Y EVENTOS DE ACTIVACIÓN ── */
function updateActiveSlice() {
  if (!scrollContainer) return;
  const idx = Math.round(scrollContainer.scrollTop / window.innerHeight);
  if (idx !== currentSlice) {
    currentSlice = idx;
    navDots.forEach((d, i) => d.classList.toggle('active', i === idx));
    if (navDotsWrap) navDotsWrap.classList.toggle('dark', lightSlices.includes(idx));
    if (musicBtn)    musicBtn.classList.toggle('dark-bg', darkMusicSlices.includes(idx));
  }
  revealFadeIns();
}

function revealFadeIns() {
  if (!scrollContainer) return;
  const viewH = window.innerHeight;
  const top   = scrollContainer.scrollTop;
  document.querySelectorAll('.fade-in').forEach(el => {
    const slice = el.closest('.slice');
    if (slice && top + viewH > slice.offsetTop + 80) el.classList.add('visible');
  });
  document.querySelectorAll('.timeline-item').forEach(item => {
    if (item.getBoundingClientRect().top < viewH * 0.88) item.classList.add('visible');
  });
}

// Escuchar scroll para actualizar navegación e iniciar música
if (scrollContainer) {
  scrollContainer.addEventListener('scroll', () => {
    updateActiveSlice();
    if (!musicPlaying) startMusic(); 
  }, { passive: true });
}

// Activar música al primer clic o toque en cualquier parte del documento
document.addEventListener('click', () => {
    if (!musicPlaying) startMusic();
}, { once: true });

navDots.forEach(dot => {
  dot.addEventListener('click', () => {
    const idx = parseInt(dot.dataset.slice, 10);
    scrollContainer?.scrollTo({ top: idx * window.innerHeight, behavior: 'smooth' });
  });
});

/* ── 4. MÚSICA ── */
function startMusic() {
  if (musicPlaying || !bgMusic) return;
  bgMusic.volume = 0;
  bgMusic.play()
    .then(() => {
      musicPlaying = true;
      musicBtn?.classList.add('playing');
      let vol = 0;
      const fi = setInterval(() => {
        vol = Math.min(vol + 0.05, 0.7);
        bgMusic.volume = vol;
        if (vol >= 0.7) clearInterval(fi);
      }, 120);
    })
    .catch(() => {
        // El navegador bloqueó el autoplay, se intentará de nuevo en la siguiente interacción
        musicPlaying = false;
    });
}

function stopMusic() {
  if (!musicPlaying || !bgMusic) return;
  let vol = bgMusic.volume;
  const fo = setInterval(() => {
    vol = Math.max(vol - 0.08, 0);
    bgMusic.volume = vol;
    if (vol <= 0) {
      clearInterval(fo);
      bgMusic.pause();
      musicPlaying = false;
      musicBtn?.classList.remove('playing');
    }
  }, 80);
}

function toggleMusic(e) {
  if (e) e.stopPropagation();
  musicPlaying ? stopMusic() : startMusic();
}
if (musicBtn) musicBtn.addEventListener('click', toggleMusic);

/* ── 5. MAPAS ── */
const mapData = {
  ceremony: {
    title:     'Parroquia Santa Catalina de Alejandría',
    address:   'Calle 15, Turbaco, Bolívar',
    iframeSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3925.337446545227!2d-75.4414532!3d10.314876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef618e404b9e757%3A0x7d6f5f9e15f8a0b!2sParroquia%20Santa%20Catalina%20de%20Alejandr%C3%ADa!5e0!3m2!1ses!2sco!4v1710000000000!5m2!1ses!2sco',
    mapsUrl:   'https://maps.app.goo.gl/9R6N3W6Z6zG2',
  },
  reception: {
    title:     'Casa Finca Yolis',
    address:   'Urb. El Zapote, Lote #36, Turbaco',
    iframeSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3925.5!2d-75.4!3d10.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDE4JzAwLjAiTiA3NcKwMjQnMDAuMCJX!5e0!3m2!1ses!2sco!4v1710000000000!5m2!1ses!2sco',
    mapsUrl:   'https://maps.app.goo.gl/9R6N3W6Z6zG3',
  },
};

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-map]');
  if (!btn) return;
  const data = mapData[btn.dataset.map];
  if (!data) return;

  const titleEl   = document.getElementById('mapTitle');
  const addressEl = document.getElementById('mapAddress');
  const linkEl    = document.getElementById('mapExternalLink');

  if (titleEl)   titleEl.textContent = data.title;
  if (addressEl) addressEl.textContent = data.address;
  if (linkEl)    linkEl.href = data.mapsUrl;
  if (mapIframe) mapIframe.src = data.iframeSrc;

  mapOverlay?.classList.add('active');
  document.body.style.overflow = 'hidden';
});

function closeMap() {
  mapOverlay?.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => { if (mapIframe) mapIframe.src = ''; }, 420);
}

document.getElementById('mapCloseBtn')?.addEventListener('click', closeMap);
mapOverlay?.addEventListener('click', e => { if (e.target === mapOverlay) closeMap(); });

/* ── 6. RSVP ── */
if (rsvpForm) {
  rsvpForm.addEventListener('submit', async e => {
    e.preventDefault();
    const submitBtn = rsvpForm.querySelector('.btn-rsvp');

    const nombre     = document.getElementById('guestName').value.trim();
    const telefono   = document.getElementById('guestPhone')?.value.trim() || 'N/A';
    const asistencia = document.getElementById('guestAttend').value === 'si' ? 'Asistirá ✅' : 'No asistirá ❌';
    const mensaje    = document.getElementById('guestMsg')?.value.trim() || 'Sin mensaje';
    const data       = { nombre, telefono, asistencia, mensaje, cupos: globalCupos };

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Enviando…'; }

    try {
      await fetch(SHEETS_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) { console.warn('RSVP error:', err); }

    rsvpForm.style.display = 'none';
    if (rsvpSuccess) rsvpSuccess.style.display = 'block';

    const waText = encodeURIComponent(
      `💌 *CONFIRMACIÓN BODA YASS & RAFA*\n\n` +
      `👤 *Invitado:* ${nombre}\n` +
      `👥 *Cupos:* ${globalCupos}\n` +
      `🎉 *Asistencia:* ${asistencia}\n` +
      `💬 *Mensaje:* ${mensaje}`
    );
    setTimeout(() => { window.open(`https://wa.me/${WA_NUMBER}?text=${waText}`, '_blank'); }, 1800);
  });
}

/* ── 7. CARGA INICIAL ── */
window.addEventListener('load', () => {
  initGuestName();
  updateCountdown();
  updateActiveSlice();
  revealFadeIns();
});