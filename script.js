// ==========================
//   CONFIG & GLOBAL STATE
// ==========================
let currentLanguage = 'en-US';
let selectedFeature = null;
let lastCountryCode = null;
let lastCountryName = null;
let hoverFeature = null;
let worldFeatures = [];
let lastPolygonClickTime = 0;

// Consent key p/ localStorage
const CONSENT_KEY = 'ca-consent-v2';

// ==========================
//   LOADING SCREEN (simple)
// ==========================
const loadingScreen = document.getElementById('loadingScreen');
const LOADING_MS = 1400; // short splash

let loadingHideScheduled = false;
function hideLoadingSoon(ms = LOADING_MS){
  if(!loadingScreen || loadingHideScheduled) return;
  loadingHideScheduled = true;
  setTimeout(() => loadingScreen.classList.add('hide'), ms);
}

// Start hiding splash as soon as this script runs (scripts are loaded with defer)
hideLoadingSoon();

// Refs principais
const donateBtn = document.getElementById('donateBtn');
const taglineEl = document.getElementById('tagline');
const randomBtn = document.getElementById('randomBtn');

// popup refs
const popupEl = document.getElementById('popup');
const countryFlagImg = document.getElementById('countryFlagImg');
const countryNameEl = document.getElementById('countryName');

const moviePosterEl = document.getElementById('moviePoster');
const movieTitleOriginalEl = document.getElementById('movieTitleOriginal');
const movieTitleTranslatedEl = document.getElementById('movieTitleTranslated');
const directorLineEl = document.getElementById('directorLine');
const directorLabelEl = document.getElementById('directorLabel');
const directorNameEl = document.getElementById('directorName');
const overviewTextEl = document.getElementById('overviewText');
const actionsRowEl = document.getElementById('actionsRow');
const letterboxdBtn = document.getElementById('letterboxdBtn');
const anotherBtn = document.getElementById('anotherBtn');
const closePopupBtn = document.getElementById('closePopup');

// Cookie banner
const cookieBanner = document.getElementById('cookieBanner');
const cookieTextEl = document.getElementById('cookieText');
const cookieAcceptBtn = document.getElementById('cookieAccept');
const cookieRejectBtn = document.getElementById('cookieReject');

// Starfield
const starsCanvas = document.getElementById('starsCanvas');
let starsCtx = starsCanvas ? starsCanvas.getContext('2d') : null;
let stars = [];
let starsWidth = 0;
let starsHeight = 0;
let starsPaused = false;

// ==========================
//   STARFIELD
// ==========================
function createStars(){
  stars = [];
  const area = starsWidth * starsHeight;
  const count = Math.min(900, Math.max(200, Math.floor(area / 2500)));
  for(let i=0; i<count; i++){
    stars.push({
      x: Math.random() * starsWidth,
      y: Math.random() * starsHeight,
      r: Math.random() * 1.4 + 0.3,
      baseAlpha: 0.35 + Math.random() * 0.65,
      twinkleSpeed: 0.0007 + Math.random() * 0.0014,
      offset: Math.random() * Math.PI * 2
    });
  }
}

function resizeStars(){
  if(!starsCanvas || !starsCtx) return;
  const DPR = window.devicePixelRatio || 1;
  starsWidth = window.innerWidth;
  starsHeight = window.innerHeight;
  starsCanvas.width = Math.floor(starsWidth * DPR);
  starsCanvas.height = Math.floor(starsHeight * DPR);
  starsCanvas.style.width = starsWidth + 'px';
  starsCanvas.style.height = starsHeight + 'px';
  starsCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
  createStars();
}

function renderStars(time){
  if(!starsCtx) return;
  if(starsPaused){
    requestAnimationFrame(renderStars);
    return;
  }
  starsCtx.clearRect(0,0,starsWidth, starsHeight);
  starsCtx.globalCompositeOperation = 'lighter';

  for(const s of stars){
    const alpha = s.baseAlpha * (0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.offset));
    starsCtx.globalAlpha = alpha;
    starsCtx.beginPath();
    starsCtx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    starsCtx.fillStyle = '#ffffff';
    starsCtx.fill();
  }
  starsCtx.globalAlpha = 1;

  requestAnimationFrame(renderStars);
}

function initStarfield(){
  resizeStars();
  window.addEventListener('resize', resizeStars);
  document.addEventListener('visibilitychange', ()=>{
    starsPaused = document.hidden;
  });
  starsPaused = document.hidden;
  requestAnimationFrame(renderStars);
}

// ==========================
//   GOOGLE ANALYTICS + COOKIES
// ==========================
function loadAnalytics(){
  if (window.caAnalyticsLoaded) return;
  window.caAnalyticsLoaded = true;

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;

  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-R1E41RWQL2';
  s.onload = ()=>{
    gtag('js', new Date());
    gtag('config', 'G-R1E41RWQL2', {
      anonymize_ip: true
    });
  };
  document.head.appendChild(s);
}

function showCookieBanner(){
  if (!cookieBanner) return;
  cookieBanner.classList.add('show');
}

function hideCookieBanner(){
  if (!cookieBanner) return;
  cookieBanner.classList.remove('show');
}

function applyStoredConsent(){
  try{
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === 'analytics') {
      loadAnalytics();
      hideCookieBanner();
    } else if (stored === 'essential') {
      hideCookieBanner();
    } else {
      showCookieBanner();
    }
  }catch(e){
    showCookieBanner();
  }
}

// Botões do banner
if (cookieAcceptBtn){
  cookieAcceptBtn.addEventListener('click', ()=>{
    try{ localStorage.setItem(CONSENT_KEY, 'analytics'); }catch(e){}
    loadAnalytics();
    hideCookieBanner();
  });
}
if (cookieRejectBtn){
  cookieRejectBtn.addEventListener('click', ()=>{
    try{ localStorage.setItem(CONSENT_KEY, 'essential'); }catch(e){}
    hideCookieBanner();
  });
}

// ==========================
//   LANGUAGE TEXTS
// ==========================
function applyLanguageTexts(){
  if(currentLanguage === 'pt-PT'){
    if(taglineEl) taglineEl.textContent = 'Clique num país para um filme aleatório';
    if(donateBtn) donateBtn.textContent = 'Ajude-nos';
    document.documentElement.lang = 'pt-PT';

    if (cookieTextEl && cookieAcceptBtn && cookieRejectBtn){
      cookieTextEl.textContent =
        'Usamos um pouco de Google Analytics para perceber como o CineAtlas é usado e continuar a melhorá-lo. Pode aceitar ou seguir apenas com cookies essenciais.';
      cookieAcceptBtn.textContent = 'Permitir análises';
      cookieRejectBtn.textContent = 'Só essenciais';
    }
  } else {
    if(taglineEl) taglineEl.textContent = 'Click a country for a random film';
    if(donateBtn) donateBtn.textContent = 'Support us';
    document.documentElement.lang = 'en';

    if (cookieTextEl && cookieAcceptBtn && cookieRejectBtn){
      cookieTextEl.textContent =
        'We use a bit of Google Analytics to see how CineAtlas is used and keep improving it. You can accept or continue with essential cookies only.';
      cookieAcceptBtn.textContent = 'Allow analytics';
      cookieRejectBtn.textContent = 'Essential only';
    }
  }
}
applyLanguageTexts();

// ==========================
//   LOAD & THEME
// ==========================
const fadeOverlay = document.getElementById('fadeOverlay');
window.addEventListener('load', ()=>{
  hideLoadingSoon();
  initStarfield();
  if (fadeOverlay) requestAnimationFrame(()=> fadeOverlay.style.opacity='0');
  applyStoredConsent();

  const startGlobe = () => { try { initGlobe(); } catch(e){ console.error('initGlobe error', e); } };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(startGlobe, { timeout: 1200 });
  } else {
    setTimeout(startGlobe, 700);
  }
});

const htmlEl = document.documentElement;
const themeCheckbox = document.getElementById('themeCheckbox');
const themeFade = document.getElementById('themeFade');

htmlEl.setAttribute('data-theme', 'dark');
if (themeCheckbox) themeCheckbox.checked = false;

function isLight(){ return document.documentElement.getAttribute('data-theme') === 'light'; }
function themeCap(){ return isLight() ? 'rgba(216,163,0,0.22)' : 'rgba(216,163,0,0.30)'; }
function themeSide(){ return isLight() ? 'rgba(216,163,0,0.12)' : 'rgba(216,163,0,0.10)'; }
function themeStroke(){ return isLight() ? '#a07800' : '#d8a300'; }
function getGlobeBaseColor(){ return isLight() ? 0xffffff : 0x000000; }

// ==========================
//   LANGUAGE SWITCH BUTTONS
// ==========================
document.querySelectorAll('.langBtn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const newLang = btn.dataset.lang;
    if(newLang === currentLanguage) return;

    currentLanguage = newLang;

    document.querySelectorAll('.langBtn').forEach(b=>{
      const active = b.dataset.lang === currentLanguage;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    applyLanguageTexts();
    hidePopup();
  });
});

// ==========================
//   POPUP SHOW/HIDE
// ==========================
if (closePopupBtn) closePopupBtn.onclick = () => hidePopup();

function showPopup(){
  if(!popupEl) return;
  popupEl.style.display='block';
  requestAnimationFrame(()=>{
    popupEl.classList.add('show');
    if (closePopupBtn) closePopupBtn.focus();
  });
}

function hidePopup(){
  if(!popupEl) return;
  popupEl.classList.remove('show');
  setTimeout(()=>{
    if(!popupEl.classList.contains('show')) popupEl.style.display='none';
  },200);
}

/* Fechar popup com ESC */
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape' && popupEl && popupEl.classList.contains('show')){
    hidePopup();
  }
});

function setCountryFlag(twoLetterCode, countryName){
  if(!countryFlagImg) return;
  const cc = (twoLetterCode||'').toLowerCase();
  countryFlagImg.src = `https://flagcdn.com/${cc}.svg`;
  countryFlagImg.onerror = ()=>{ countryFlagImg.style.display='none'; };
  countryFlagImg.style.display = 'inline-block';
  const nameForAlt = countryName || lastCountryName;
  countryFlagImg.alt = nameForAlt ? `Flag of ${nameForAlt}` : 'Country flag';
}

// ==========================
//   GLOBE + THEME (lazy init)
// ==========================
function normalizedDisplayName(props){
  const raw = (props.name || props.ADMIN || 'Unknown').trim();
  if (/^\s*west\s*bank\s*$/i.test(raw)) return 'Palestine';
  if (/^\s*gaza(\s*strip)?\s*$/i.test(raw)) return 'Palestine';
  return raw;
}

// Globe instance
let globe = null;
let controls = null;
let usingSolidGlobe = false;
let solidMat = null;


// Simple hover tooltip (optional)
function showGlobeHover(name, x, y){
  const tip = document.getElementById('globeHover');
  if(!tip) return;
  tip.textContent = name || '';
  tip.style.display = 'block';
  const pad = 12;
  // keep inside viewport
  const maxX = window.innerWidth - 10;
  const maxY = window.innerHeight - 10;
  const left = Math.min(x + pad, maxX);
  const top  = Math.min(y + pad, maxY);
  tip.style.left = left + 'px';
  tip.style.top  = top + 'px';
}
function hideGlobeHover(){
  const tip = document.getElementById('globeHover');
  if(!tip) return;
  tip.style.display = 'none';
}

function applyThemeToGlobe(){
  if(!globe) return;

  globe
    .atmosphereColor(isLight() ? '#f4c75a' : '#ffd58a')
    .polygonCapColor(d =>
      d === selectedFeature
        ? 'rgba(139,0,0,0.65)'
        : (d === hoverFeature ? 'rgba(216,163,0,0.65)' : themeCap())
    )
    .polygonSideColor(d =>
      d === selectedFeature
        ? 'rgba(139,0,0,0.25)'
        : (d === hoverFeature ? 'rgba(216,163,0,0.40)' : themeSide())
    )
    .polygonStrokeColor(d =>
      d === selectedFeature ? 'rgba(139,0,0,0.95)' : themeStroke()
    );

  if(usingSolidGlobe && solidMat){
    solidMat.color.setHex(getGlobeBaseColor());
    solidMat.needsUpdate = true;
  }
}

if (themeCheckbox){
  themeCheckbox.addEventListener('change', ()=>{
    const next = themeCheckbox.checked ? 'light' : 'dark';

    if (themeFade){
      themeFade.style.background = next === 'light' ? '#f7f3e7' : '#000000';
      themeFade.style.opacity = '1';
    }

    setTimeout(() => {
      htmlEl.setAttribute('data-theme', next);
      applyThemeToGlobe();
      if (themeFade) requestAnimationFrame(()=> themeFade.style.opacity = '0');
    }, 200);
  });
}

function initGlobe(){
  if (globe) return; // prevent double init

  const mount = document.getElementById('webgl-root');
  if (!mount || typeof Globe !== 'function') {
    console.error('Globe.gl not loaded or #globeViz missing');
    return;
  }

  globe = Globe()(mount)
    .backgroundColor('rgba(0,0,0,0)')
    .showAtmosphere(true)
    .atmosphereColor('#ffd58a')
    .atmosphereAltitude(0.22)
    .showGraticules(false)
    .polygonAltitude(0.01)
    .polygonCapColor(() => themeCap())
    .polygonSideColor(() => themeSide())
    .polygonStrokeColor(() => themeStroke())
    .polygonLabel(({properties:p}) => normalizedDisplayName(p))
    .polygonsTransitionDuration(300);

  controls = globe.controls();
  controls.minDistance = 160;
  controls.maxDistance = 460;
  controls.minPolarAngle = 0.2;
  controls.maxPolarAngle = Math.PI - 0.2;
  controls.enablePan = false;
  // Ensure user interaction works across browsers/devices
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.enabled = true;
  try { controls.update && controls.update(); } catch(e) {}
  // On mobile, prevent the page from handling touch gestures instead of the globe
  try {
    const el = globe.renderer && globe.renderer().domElement;
    if (el) {
      el.style.pointerEvents = 'auto';
      el.style.touchAction = 'none';
    }
  } catch(e) {}
  if (typeof globe.enablePointerInteraction === 'function') {
    globe.enablePointerInteraction(true);
  }

  function syncGlobeSize(){
    const w = window.innerWidth;
    const h = window.innerHeight;
    try{
      if (typeof globe.width === 'function') globe.width(w);
      if (typeof globe.height === 'function') globe.height(h);
      const r = (typeof globe.renderer === 'function') ? globe.renderer() : null;
      if (r && typeof r.setPixelRatio === 'function') r.setPixelRatio(window.devicePixelRatio || 1);
      if (r && typeof r.setSize === 'function') r.setSize(w, h);
    }catch(e){}
  }

  window.addEventListener('resize', syncGlobeSize);

  // Watch DPR changes (moving window between monitors)
  (function watchDPR(){
    const mk = () => window.matchMedia(`(resolution: ${(window.devicePixelRatio || 1)}dppx)`);
    let mq = mk();
    const handler = () => {
      syncGlobeSize();
      resizeStars();
      // re-arm for new DPR
      try { mq.removeEventListener('change', handler); } catch(e){}
      mq = mk();
      try { mq.addEventListener('change', handler); } catch(e){}
    };
    try { mq.addEventListener('change', handler); } catch(e){}
  })();

  syncGlobeSize();

  globe.onPolygonHover(h => {
    if(h === hoverFeature) return;
    hoverFeature = h;
    globe.polygonAltitude(d => d === selectedFeature ? 0.12 : 0.01);
    applyThemeToGlobe();
  });

  // Globe appearance: solid color that follows the theme (no texture)
  usingSolidGlobe = true;
  solidMat = new THREE.MeshStandardMaterial({
    color: getGlobeBaseColor(),
    roughness: 1,
    metalness: 0
  });
  globe.globeMaterial(solidMat);
  applyThemeToGlobe();


  // Load country polygons (prefer local asset for performance/stability)
  (async () => {
    // Use an absolute path so it works regardless of the current page URL
    // (e.g. /privacy.html, query strings, etc.) and on Vercel deployments.
    const localUrl = '/assets/world.geojson';
    const remoteUrl = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';

    async function fetchJson(url) {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

      // Helpful guard: if a hosting rewrite/404 returns HTML, res.json() throws.
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      if (ct.includes('text/html')) {
        const preview = (await res.text()).slice(0, 200);
        throw new Error(`Expected JSON but got HTML from ${url}. First bytes: ${preview}`);
      }
      return res.json();
    }

    let geo;
    try {
      geo = await fetchJson(localUrl);
    } catch (err) {
      console.warn('Local world.geojson failed, falling back to remote:', err);
      geo = await fetchJson(remoteUrl);
    }

    worldFeatures = geo.features || [];
    globe.polygonsData(worldFeatures);

    globe.onPolygonClick(f => {
      lastPolygonClickTime = Date.now();
      selectedFeature = f;
      const iso = f.properties.ISO_A2;
      const name = f.properties.ADMIN;
      lastCountryCode = iso;
      lastCountryName = name;
      if (!hasConsent()) return;
      fetchFilmForCountry(iso, name);
    });

    globe.onPolygonHover(f => {
      hoverFeature = f;
      updateGlobePolygonColors();
    });

    // Hover tooltip + highlight
    if (globe.renderer && globe.renderer().domElement) {
      globe.renderer().domElement.addEventListener('mousemove', e => {
        const now = Date.now();
        if (now - lastPolygonClickTime < 350) return;
        if (hoverFeature) {
          const name = hoverFeature.properties.ADMIN;
          showGlobeHover(name, e.clientX, e.clientY);
        } else {
          hideGlobeHover();
        }
      });

      // Hide hover when leaving canvas
      globe.renderer().domElement.addEventListener('mouseleave', () => {
        hideGlobeHover();
      });
    }

    // Now that we have polygons, apply theme once (ensures correct colors)
    applyThemeToGlobe();
  })().catch(e => {
    console.error('Failed to load country shapes:', e);
    alert('Failed to load country shapes. Open /assets/world.geojson in your browser to verify it exists.');
  });
}

// ==========================
//   GLOBE INTERACTION HELPERS
// ==========================
function getFeatureCenter(f){
  try{
    const g = f.geometry; if(!g) return null;
    let pts=[];
    if(g.type==='Polygon'){
      g.coordinates.forEach(ring => ring.forEach(([lng,lat]) => pts.push([lng,lat])));
    }
    else if(g.type==='MultiPolygon'){
      g.coordinates.forEach(poly => poly.forEach(ring => ring.forEach(([lng,lat]) => pts.push([lng,lat]))));
    }
    else return null;
    if(!pts.length) return null;
    const sum = pts.reduce((a,[lng,lat]) => {
      a.lng+=lng; a.lat+=lat; return a;
    }, {lng:0,lat:0});
    return { lng: sum.lng/pts.length, lat: sum.lat/pts.length };
  }catch(e){ return null; }
}

function spinGlobe(onDone){
  if(!globe) return;
  const duration = 900;
  const startPOV = globe.pointOfView();
  const startLng = startPOV.lng || 0;
  const startLat = startPOV.lat || 0;
  const startAlt = startPOV.altitude || startPOV.alt || 1.5;
  const totalRot = 540;

  const startTime = performance.now();
  function step(now){
    const t = Math.min(1, (now - startTime) / duration);
    const eased = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
    const pov = {
      lat: startLat,
      lng: startLng + totalRot * eased,
      altitude: startAlt + 0.4 * (1 - eased)
    };
    globe.pointOfView(pov);
    if(t < 1){
      requestAnimationFrame(step);
    } else if(onDone){
      onDone();
    }
  }
  requestAnimationFrame(step);
}

// Random country
if (randomBtn){
  randomBtn.addEventListener('click', ()=>{
    if(!globe || !worldFeatures || !worldFeatures.length) return;

    randomBtn.classList.add('is-rolling');
    setTimeout(() => {
      randomBtn.classList.remove('is-rolling');
    }, 650);

    let pickedFeature = null;
    let code = null;
    let displayName = null;

    for(let safety=0; safety<80 && !code; safety++){
      const f = worldFeatures[Math.floor(Math.random()*worldFeatures.length)];
      if(!f || !f.properties) continue;
      const origName = (f.properties.name || f.properties.ADMIN || 'Unknown').trim();
      const dispName = normalizedDisplayName(f.properties);
      const rawA3 = f.id || f.properties.iso_a3 || f.properties.ISO_A3;
      const rawA2 = f.properties.iso_a2 || f.properties.ISO_A2;

      const isWB = /^\s*west\s*bank\s*$/i.test(origName);
      const isGZ = /^\s*gaza(\s*strip)?\s*$/i.test(origName);

      let c =
          (isWB || isGZ) ? 'PS'
        : (rawA2 && rawA2 !== '-99') ? rawA2.toUpperCase()
        : rawA3 ? convertToTwoLetterCode(rawA3.toUpperCase())
        : null;

      if(c && c !== '-99'){
        pickedFeature = f;
        code = c;
        displayName = dispName;
      }
    }

    if(!code || !pickedFeature) return;
    const center = getFeatureCenter(pickedFeature) || {lat:0,lng:0};

    spinGlobe(()=>{
      selectedFeature = pickedFeature;
      globe.polygonAltitude(d => d === selectedFeature ? 0.12 : 0.01);
      applyThemeToGlobe();
      globe.pointOfView({ lat:center.lat, lng:center.lng, altitude:1.25 }, 900);
      lastCountryCode = code;
      lastCountryName = displayName;
      fetchMovie(code, displayName);
    });
  });
}

// ==========================
//   TMDB FETCH
// ==========================
const countryLanguages = {
  'PT':['pt'],'ES':['es'],'FR':['fr'],'DE':['de'],'IT':['it'],'JP':['ja'],'CN':['zh','cn'],'KR':['ko'],
  'IN':['hi','ta','te'],'BR':['pt'],'MX':['es'],'AR':['es'],'RU':['ru'],'TR':['tr'],'SA':['ar'],'EG':['ar'],
  'DZ':['ar'],'MA':['ar'],'TN':['ar'],'GB':['en'],'US':['en'],'CA':['en','fr'],'AU':['en'],'NZ':['en'],
  'SE':['sv'],'NO':['no'],'DK':['da'],'FI':['fi'],'NL':['nl'],'BE':['nl','fr'],'PL':['pl'],'CZ':['cs'],
  'GR':['el'],'IL':['he'],'PS':['ar']
};

async function discoverMovie(twoCode, useLangFilter = true, maxAttempts = 20){
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const page = Math.floor(Math.random() * 10) + 1;

    const url = new URL('/api/discover', window.location.origin);
    url.searchParams.set('country', twoCode);
    url.searchParams.set('language', currentLanguage);
    url.searchParams.set('page', String(page));

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data || !data.results) continue;

      let results = data.results;
      if (!results.length) continue;

      if (useLangFilter) {
        const expected = countryLanguages[twoCode];
        if (expected) {
          const byLang = results.filter(m => expected.includes(m.original_language));
          if (byLang.length) results = byLang;
        }
      }

      const withPoster = results.filter(m => m.poster_path);
      const pool = withPoster.length ? withPoster : results;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (pick) return pick;

    } catch (e) {
      console.error('discoverMovie error', e);
    }
  }
  return null;
}

async function getDirector(movieId){
  try {
    const url = new URL('/api/credits', window.location.origin);
    url.searchParams.set('id', String(movieId));
    url.searchParams.set('language', currentLanguage);

    const res = await fetch(url);
    const credits = await res.json();
    const crew = (credits && credits.crew) || [];
    const dir = crew.find(p => p.job === 'Director');
    return dir ? dir.name : '';
  } catch (e) {
    console.error('getDirector error', e);
    return '';
  }
}

function showAntarcticaMessage(){
  const t = {
    title: currentLanguage==='pt-PT' ? 'Antártida' : 'Antarctica',
    text:  currentLanguage==='pt-PT'
            ? 'Não encontramos nenhum filme, mas encontramos neve.'
            : "We didn’t find any movies, but we found snow."
  };
  setCountryFlag('AQ', t.title);
  if(countryNameEl) countryNameEl.innerText = t.title.toUpperCase();

  if(moviePosterEl) moviePosterEl.style.display = 'none';

  if(movieTitleOriginalEl) movieTitleOriginalEl.textContent = t.title;
  if(movieTitleTranslatedEl) movieTitleTranslatedEl.textContent = '';
  if(directorLineEl) directorLineEl.style.visibility = 'hidden';
  if(overviewTextEl) overviewTextEl.textContent = t.text;
  if(actionsRowEl) actionsRowEl.style.visibility = 'hidden';

  showPopup();
}

async function fetchMovie(twoLetterCode, countryName){
  const t = {
    loading: currentLanguage==='pt-PT'
      ? 'A escolher um filme...'
      : 'Picking a film...',
    none:    currentLanguage==='pt-PT'
      ? 'Não encontrámos nenhum filme agora. Tenta novamente ou escolhe um país vizinho.'
      : 'We couldn’t find a film right now. Try again or pick a nearby country.',
    noDesc:  currentLanguage==='pt-PT'
      ? 'Sem descrição disponível.'
      : 'No description available.',
    seeLetterboxd: currentLanguage==='pt-PT' ? 'Ver no Letterboxd' : 'See on Letterboxd',
    another: currentLanguage==='pt-PT' ? 'Outro' : 'Another one',
    directorLabel: currentLanguage==='pt-PT' ? 'Realizador:' : 'Director:'
  };

  setCountryFlag(twoLetterCode, countryName);
  if(countryNameEl) countryNameEl.innerText = countryName.toUpperCase();

  if(moviePosterEl){
    moviePosterEl.style.display = 'none';
    moviePosterEl.alt = '';
  }

  if(movieTitleOriginalEl) movieTitleOriginalEl.textContent = '';
  if(movieTitleTranslatedEl) movieTitleTranslatedEl.textContent = '';
  if(directorLineEl) directorLineEl.style.visibility = 'hidden';
  if(overviewTextEl){
    overviewTextEl.textContent = t.loading;
    overviewTextEl.classList.add('loading');
  }
  if(actionsRowEl) actionsRowEl.style.visibility = 'hidden';

  if(letterboxdBtn) letterboxdBtn.textContent = t.seeLetterboxd;
  if(anotherBtn) anotherBtn.textContent = t.another;
  if(directorLabelEl) directorLabelEl.textContent = t.directorLabel;

  showPopup();

  const lotteryPhrases = currentLanguage === 'pt-PT'
    ? ['A rodar a bobine...', 'A escolher um clássico...', 'À procura de cinema de culto...', 'Quase lá...']
    : ['Spinning the reel...', 'Picking a classic...', 'Searching world cinema...', 'Almost there...'];

  let idx = 0;
  const lotteryInterval = setInterval(() => {
    idx = (idx + 1) % lotteryPhrases.length;
    if(overviewTextEl) overviewTextEl.textContent = lotteryPhrases[idx];
  }, 160);

  let movie = await discoverMovie(twoLetterCode, true, 20);

  if(!movie && twoLetterCode === 'GL'){
    movie = await discoverMovie('DK', true, 20);
  }

  clearInterval(lotteryInterval);
  if(overviewTextEl) overviewTextEl.classList.remove('loading');

  if(!movie){
    if(movieTitleOriginalEl) movieTitleOriginalEl.textContent = countryName;
    if(movieTitleTranslatedEl) movieTitleTranslatedEl.textContent = '';
    if (overviewTextEl){
      overviewTextEl.textContent = (twoLetterCode === 'PS') ? 'FREE PALESTINE' : t.none;
    }
    if(directorLineEl) directorLineEl.style.visibility = 'hidden';
    if(actionsRowEl) actionsRowEl.style.visibility = 'hidden';
    return;
  }

  const directorName = await getDirector(movie.id);

  const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';
  const movieYear = movie.release_date ? movie.release_date.slice(0,4) : '';
  const overview = movie.overview || t.noDesc;
  const letterboxdQuery = encodeURIComponent((movie.title || '') + ' ' + (movieYear || ''));
  const letterboxdUrl = `https://letterboxd.com/search/${letterboxdQuery}/`;

  if(moviePosterEl){
    if(posterUrl){
      moviePosterEl.src = posterUrl;
      moviePosterEl.alt = movie.title || 'Movie poster';
      moviePosterEl.style.display = 'block';
    } else {
      moviePosterEl.style.display = 'none';
    }
  }

  const originalTitle = movie.original_title || movie.title || '';
  const translatedTitle = movie.title || '';

  if(movieTitleOriginalEl) movieTitleOriginalEl.textContent = originalTitle + (movieYear ? ` (${movieYear})` : '');
  if(movieTitleTranslatedEl){
    movieTitleTranslatedEl.textContent = (translatedTitle && translatedTitle !== originalTitle) ? translatedTitle : '';
  }

  if(directorNameEl) directorNameEl.textContent = directorName || '—';
  if(directorLineEl) directorLineEl.style.visibility = 'visible';

  if(overviewTextEl) overviewTextEl.textContent = overview;

  if(letterboxdBtn) letterboxdBtn.href = letterboxdUrl;

  if(actionsRowEl) actionsRowEl.style.visibility = 'visible';

  lastCountryCode = twoLetterCode;
  lastCountryName = countryName;
}

if (anotherBtn){
  anotherBtn.addEventListener('click', ()=>{
    if(lastCountryCode && lastCountryName){
      fetchMovie(lastCountryCode,lastCountryName);
    }
  });
}

// ==========================
//   UTILS: COUNTRY CODE + SNOW
// ==========================
function convertToTwoLetterCode(a3){
  const m={'AFG':'AF','ALB':'AL','DZA':'DZ','AND':'AD','AGO':'AO','ARG':'AR','ARM':'AM','AUS':'AU','AUT':'AT','AZE':'AZ','BHS':'BS','BHR':'BH','BGD':'BD','BRB':'BB','BLR':'BY','BEL':'BE','BLZ':'BZ','BEN':'BJ','BTN':'BT','BOL':'BO','BIH':'BA','BWA':'BW','BRA':'BR','BRN':'BN','BGR':'BG','BFA':'BF','BDI':'BI','KHM':'KH','CMR':'CM','CAN':'CA','CPV':'CV','CAF':'CF','TCD':'TD','CHL':'CL','CHN':'CN','COL':'CO','COM':'KM','COG':'CG','COD':'CD','CRI':'CR','HRV':'HR','CUB':'CU','CYP':'CY','CZE':'CZ','DNK':'DK','DJI':'DJ','DOM':'DO','ECU':'EC','EGY':'EG','SLV':'SV','GNQ':'GQ','ERI':'ER','EST':'EE','ETH':'ET','FJI':'FJ','FIN':'FI','FRA':'FR','GAB':'GA','GMB':'GM','GEO':'GE','DEU':'DE','GHA':'GH','GRC':'GR','GTM':'GT','GIN':'GN','GNB':'GW','GUY':'GY','HTI':'HT','HND':'HN','HUN':'HU','ISL':'IS','IND':'IN','IDN':'ID','IRN':'IR','IRQ':'IQ','IRL':'IE','ISR':'IL','ITA':'IT','JAM':'JM','JPN':'JP','JOR':'JO','KAZ':'KZ','KEN':'KE','KWT':'KW','KGZ':'KG','LAO':'LA','LVA':'LV','LBN':'LB','LSO':'LS','LBR':'LR','LBY':'LY','LTU':'LT','LUX':'LU','MDG':'MG','MWI':'MW','MYS':'MY','MDV':'MV','MLI':'ML','MLT':'MT','MRT':'MR','MUS':'MU','MEX':'MX','MDA':'MD','MCO':'MC','MNG':'MN','MNE':'ME','MAR':'MA','MOZ':'MZ','MMR':'MM','NAM':'NA','NPL':'NP','NLD':'NL','NZL':'NZ','NIC':'NI','NER':'NE','NGA':'NG','PRK':'KP','NOR':'NO','OMN':'OM','PAK':'PK','PAN':'PA','PNG':'PG','PRY':'PY','PER':'PE','PHL':'PH','POL':'PL','PRT':'PT','QAT':'QA','ROU':'RO','RUS':'RU','RWA':'RW','SAU':'SA','SEN':'SN','SRB':'RS','SLE':'SL','SGP':'SG','SVK':'SK','SVN':'SI','SOM':'SO','ZAF':'ZA','KOR':'KR','SSD':'SS','ESP':'ES','LKA':'LK','SDN':'SD','SUR':'SR','SWZ':'SZ','SWE':'SE','CHE':'CH','SYR':'SY','TWN':'TW','TJK':'TJ','TZA':'TZ','THA':'TH','TGO':'TG','TTO':'TT','TUN':'TN','TUR':'TR','TKM':'TM','UGA':'UG','UKR':'UA','ARE':'AE','GBR':'GB','USA':'US','URY':'UY','UZB':'UZ','VEN':'VE','VNM':'VN','YEM':'YE','ZMB':'ZM','ZWE':'ZW'};
  return m[a3]||a3;
}

/* Neve com fade-out suave */
const snowCanvas = document.getElementById('snowOverlay');
function startSnow(durationMs=10000){
  if(!snowCanvas) return;
  const ctx = snowCanvas.getContext('2d');
  const DPR = window.devicePixelRatio || 1;
  const resize = ()=>{
    snowCanvas.width = Math.floor(window.innerWidth * DPR);
    snowCanvas.height = Math.floor(window.innerHeight * DPR);
    snowCanvas.style.width = window.innerWidth + 'px';
    snowCanvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
  };
  resize();
  window.addEventListener('resize', resize);

  const count = Math.min(220, Math.floor(window.innerWidth * 0.28));
  const flakes = new Array(count).fill(0).map(()=>({
    x: Math.random()*window.innerWidth,
    y: Math.random()*-window.innerHeight,
    r: Math.random()*2 + 1,
    s: Math.random()*0.6 + 0.2,
    w: Math.random()*1.5 - 0.75,
    a: Math.random()*Math.PI*2
  }));

  const start = performance.now();
  const fadeDuration = 1000;
  snowCanvas.classList.add('show');

  function step(now){
    const elapsed = now - start;

    if (elapsed > durationMs && snowCanvas.classList.contains('show')) {
      snowCanvas.classList.remove('show');
    }

    ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';

    for(const f of flakes){
      f.a += 0.01;
      f.x += f.w + Math.sin(f.a)*0.2;
      f.y += f.s;
      if(f.y > window.innerHeight + 5) {
        f.y = -10;
        f.x = Math.random()*window.innerWidth;
      }
      if(f.x < -10) f.x = window.innerWidth + 10;
      if(f.x > window.innerWidth + 10) f.x = -10;

      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
      ctx.fill();
    }

    if (elapsed < durationMs + fadeDuration + 100) {
      requestAnimationFrame(step);
    } else {
      ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
      window.removeEventListener('resize', resize);
    }
  }
  requestAnimationFrame(step);
}

// ==========================
//   SERVICE WORKER
// ==========================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(console.error);
  });
}
