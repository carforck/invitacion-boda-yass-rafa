/* ══════════════════════════════════════════
   YASS & RAFA · INVITACIÓN DIGITAL 2026
   script.js — Versión 2.0
══════════════════════════════════════════ */

/* ── CONFIGURACIÓN ── */
const WA_NUMBER  = '573105080356';
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyD5K09PZ-YCKsGhU6ZUwilOMP82wHUE9GE2gzCNS8GoNv14Oje6zqeCuKWaCSvJKNq/exec';

/* ── ELEMENTOS ── */
const scrollContainer = document.getElementById('scrollContainer');
const navDots         = document.querySelectorAll('.nav-dot');
const navDotsWrap     = document.getElementById('navDots');
const musicBtn        = document.getElementById('musicBtn');
const bgMusic         = document.getElementById('bgMusic');
const rsvpForm        = document.getElementById('rsvpForm');
const rsvpSuccess     = document.getElementById('rsvpSuccess');
const mapOverlay      = document.getElementById('mapOverlay');
const mapIframe       = document.getElementById('mapIframe');

let currentSlice = 0;
let musicPlaying  = false;
let globalCupos   = '1';

/* 
  Slices con fondo claro → nav dots en modo oscuro
  0: Apertura, 4: Itinerario, 5: Dresscode, 7: RSVP
*/
const lightSlices    = [0, 4, 5, 7];
/* Slices donde el botón de música debe verse oscuro */
const darkMusicSlices = [4, 5, 7];

/* ─────────────────────────────────
   1. URL PARAMS & NOMBRE INVITADO
───────────────────────────────── */
function initGuestName() {
  const params = new URLSearchParams(window.location.search);
  const name   = params.get('invitado') || params.get('guest');
  globalCupos  = params.get('cupos') || '1';

  const greetTop  = document.getElementById('rsvpGreetingTop');
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

/* ─────────────────────────────────
   2. CUENTA REGRESIVA
───────────────────────────────── */
function updateCountdown() {
  const target = new Date('2026-05-09T16:00:00');
  const now    = new Date();
  let diff     = target - now;

  const ids    = ['cd-days', 'cd-hours', 'cd-mins', 'cd-secs'];

  if (diff <= 0) {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '00';
    });
    return;
  }

  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000)  / 60000);
  const secs  = Math.floor((diff % 60000)    / 1000);

  [days, hours, mins, secs].forEach((val, i) => {
    const el = document.getElementById(ids[i]);
    if (!el) return;
    const str = String(val).padStart(2, '0');
    if (el.textContent !== str) {
      /* Micro-animación al cambiar */
      el.style.transform = 'translateY(-4px)';
      el.style.opacity   = '0.6';
      setTimeout(() => {
        el.textContent     = str;
        el.style.transform = '';
        el.style.opacity   = '';
        el.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
      }, 150);
    }
  });
}
setInterval(updateCountdown, 1000);

/* ─────────────────────────────────
   3. NAVEGACIÓN & ANIMACIONES
───────────────────────────────── */
function getActiveSliceIndex() {
  if (!scrollContainer) return 0;
  return Math.round(scrollContainer.scrollTop / window.innerHeight);
}

function updateActiveSlice() {
  if (!scrollContainer) return;
  const idx = getActiveSliceIndex();

  if (idx !== currentSlice) {
    currentSlice = idx;

    /* Nav dots */
    navDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === idx);
    });

    /* Modo claro/oscuro de nav */
    if (navDotsWrap) {
      navDotsWrap.classList.toggle('dark', lightSlices.includes(idx));
    }

    /* Modo del botón de música */
    if (musicBtn) {
      musicBtn.classList.toggle('dark-bg', darkMusicSlices.includes(idx));
    }
  }

  revealFadeIns();
}

function revealFadeIns() {
  const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
  const viewH     = window.innerHeight;

  document.querySelectorAll('.fade-in').forEach(el => {
    const slice = el.closest('.slice');
    if (!slice) return;
    if (scrollTop + viewH > slice.offsetTop + 80) {
      el.classList.add('visible');
    }
  });

  /* Activar puntos del timeline si son visibles */
  document.querySelectorAll('.timeline-item').forEach(item => {
    const top = item.getBoundingClientRect().top;
    if (top < viewH * 0.85) item.classList.add('visible');
  });
}

if (scrollContainer) {
  scrollContainer.addEventListener('scroll', updateActiveSlice, { passive: true });
}

/* Click en nav dots */
navDots.forEach(dot => {
  dot.addEventListener('click', () => {
    const idx = parseInt(dot.dataset.slice, 10);
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: idx * window.innerHeight,
        behavior: 'smooth',
      });
    }
  });
});

/* Swipe gesture para nav (soporte adicional) */
let touchStartY = 0;
document.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
document.addEventListener('touchend', e => {
  const diff = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(diff) < 20) return; /* Ignore micro-swipes */
}, { passive: true });

/* ─────────────────────────────────
   4. MÚSICA
───────────────────────────────── */
function startMusic() {
  if (musicPlaying || !bgMusic) return;
  bgMusic.volume = 0;
  bgMusic.play().then(() => {
    musicPlaying = true;
    musicBtn?.classList.add('playing');
    /* Fade in de volumen */
    let vol = 0;
    const fadeIn = setInterval(() => {
      vol = Math.min(vol + 0.05, 0.7);
      bgMusic.volume = vol;
      if (vol >= 0.7) clearInterval(fadeIn);
    }, 120);
  }).catch(() => {});
}

function toggleMusic(e) {
  if (e) e.stopPropagation();
  if (musicPlaying) {
    /* Fade out antes de pausar */
    let vol = bgMusic.volume;
    const fadeOut = setInterval(() => {
      vol = Math.max(vol - 0.08, 0);
      bgMusic.volume = vol;
      if (vol <= 0) {
        clearInterval(fadeOut);
        bgMusic.pause();
        musicPlaying = false;
        musicBtn?.classList.remove('playing');
      }
    }, 80);
  } else {
    startMusic();
  }
}

/* Iniciar al primer toque */
const handleFirstInteraction = () => {
  startMusic();
  ['click', 'touchstart'].forEach(ev =>
    document.removeEventListener(ev, handleFirstInteraction)
  );
};
document.addEventListener('click',      handleFirstInteraction, { once: true });
document.addEventListener('touchstart', handleFirstInteraction, { once: true, passive: true });

if (musicBtn) musicBtn.addEventListener('click', toggleMusic);

/* ─────────────────────────────────
   5. MAPAS
───────────────────────────────── */
const mapData = {
  ceremony: {
    title:     'Parroquia Santa Catalina de Alejandría',
    address:   'Calle 15, Turbaco, Bolívar',
    iframeSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3924.9!2d-75.4!3d10.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDE4JzAwLjAiTiA3NcKwMjQnMDAuMCJX!5e0!3m2!1ses!2sco!4v123456789',
    mapsUrl:   'https://maps.app.goo.gl/',
  },
  reception: {
    title:     'Casa Finca Yoli',
    address:   'Urb. El Zapote, Lote #36, Turbaco',
    iframeSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3924.9!2d-75.4!3d10.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDE4JzAwLjAiTiA3NcKwMjQnMDAuMCJX!5e0!3m2!1ses!2sco!4v987654321',
    mapsUrl:   'https://maps.app.goo.gl/',
  },
};

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-map]');
  if (!btn) return;
  const data = mapData[btn.dataset.map];
  if (!data) return;

  document.getElementById('mapTitle').textContent   = data.title;
  document.getElementById('mapAddress').textContent = data.address;
  document.getElementById('mapExternalLink').href   = data.mapsUrl;
  if (mapIframe) mapIframe.src = data.iframeSrc;
  mapOverlay?.classList.add('active');
  document.body.style.overflow = 'hidden';
});

/* Cerrar mapa */
const closeMap = () => {
  mapOverlay?.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => { if (mapIframe) mapIframe.src = ''; }, 400);
};

document.getElementById('mapCloseBtn')?.addEventListener('click', closeMap);
mapOverlay?.addEventListener('click', e => {
  if (e.target === mapOverlay) closeMap();
});

/* Cerrar con ESC */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mapOverlay?.classList.contains('active')) closeMap();
});

/* ─────────────────────────────────
   6. FORMULARIO RSVP
───────────────────────────────── */
if (rsvpForm) {
  rsvpForm.addEventListener('submit', async e => {
    e.preventDefault();
    const submitBtn = rsvpForm.querySelector('.btn-rsvp');

    const nombre    = document.getElementById('guestName').value.trim();
    const telefono  = document.getElementById('guestPhone')?.value.trim() || 'N/A';
    const asistencia = document.getElementById('guestAttend').value === 'si'
      ? 'Asistirá ✅'
      : 'No asistirá ❌';
    const mensaje   = document.getElementById('guestMsg')?.value.trim() || 'Sin mensaje';

    const data = { nombre, telefono, asistencia, mensaje, cupos: globalCupos };

    submitBtn.disabled     = true;
    submitBtn.textContent  = 'Enviando…';

    try {
      await fetch(SHEETS_URL, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
    } catch (err) { console.warn('RSVP fetch error:', err); }

    /* Mostrar éxito */
    rsvpForm.style.display = 'none';
    if (rsvpSuccess) {
      rsvpSuccess.style.display = 'block';
    }

    /* Abrir WhatsApp con retraso */
    const waText = encodeURIComponent(
      `💌 *CONFIRMACIÓN BODA YASS & RAFA*\n\n` +
      `👤 *Invitado:* ${nombre}\n` +
      `👥 *Cupos:* ${globalCupos}\n` +
      `🎉 *Asistencia:* ${asistencia}\n` +
      `💬 *Mensaje:* ${mensaje}`
    );
    setTimeout(() => {
      window.open(`https://wa.me/${WA_NUMBER}?text=${waText}`, '_blank');
    }, 1800);
  });
}

/* ─────────────────────────────────
   7. CARGA INICIAL
───────────────────────────────── */
window.addEventListener('load', () => {
  initGuestName();
  updateCountdown();
  updateActiveSlice();
  revealFadeIns();
});