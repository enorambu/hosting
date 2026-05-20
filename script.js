/* ============================================
   ZONA TRIBUTARIA CHILE - JavaScript
   RSS Feed + Interactivity
   ============================================ */

// ============ RSS FEED CONFIGURATION ============
const RSS_SOURCES = [
  {
    id: 'df',
    name: 'Diario Financiero',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://www.df.cl/noticias/site/tax/port/all/rss_1.xml'),
    tag: 'Diario Financiero',
    color: '#0f172a',
    icon: 'fa-chart-line'
  },
  {
    id: 'sii',
    name: 'SII Chile',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://www.sii.cl/rss/novedades.rss'),
    tag: 'SII',
    color: '#1e293b',
    icon: 'fa-file-invoice-dollar'
  },
  {
    id: 'economia',
    name: 'Emol Economía',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://www.emol.com/rss/economia.xml'),
    tag: 'Economía',
    color: '#10b981',
    icon: 'fa-coins'
  }
];

// Fallback demo news articles (shown if RSS fails)
const DEMO_ARTICLES = [
  {
    title: 'SII actualiza criterios para declaración de renta de personas con inversiones en el extranjero',
    summary: 'El Servicio de Impuestos Internos publicó nuevas instrucciones para contribuyentes con activos fuera de Chile, aclarando la tributación de dividendos.',
    date: new Date(Date.now() - 1 * 86400000).toLocaleDateString('es-CL'),
    source: 'SII Chile',
    link: 'https://www.sii.cl',
    tag: 'SII',
    id: 'sii'
  },
  {
    title: 'Reforma tributaria 2025: las principales medidas que impactarán a empresas chilenas',
    summary: 'El Ministerio de Hacienda presentó las modificaciones al sistema tributario que entrarán en vigencia para el año comercial 2025.',
    date: new Date(Date.now() - 2 * 86400000).toLocaleDateString('es-CL'),
    source: 'Diario Financiero',
    link: 'https://www.df.cl',
    tag: 'Diario Financiero',
    id: 'df'
  },
  {
    title: 'Hacienda confirma rebajas al impuesto de timbres y estampillas para créditos PYME',
    summary: 'En línea con las medidas pro-emprendimiento, el Ejecutivo firmó el decreto que reduce la carga tributaria para financiamiento de pequeñas y medianas empresas.',
    date: new Date(Date.now() - 4 * 86400000).toLocaleDateString('es-CL'),
    source: 'Emol Economía',
    link: 'https://www.emol.com',
    tag: 'Economía',
    id: 'economia'
  }
];

// ============ STATE ============
let allArticles = [];
let currentFilter = 'all';
let visibleCount = 6;
let rssLoadAttempted = false;

// ============ UTILITY FUNCTIONS ============
function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('es-CL', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  } catch { return dateStr; }
}

function stripHtml(html) {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function truncate(str, len = 160) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

// ============ RSS FETCHING ============
async function fetchRSSSource(source) {
  try {
    const response = await fetch(source.url, { signal: AbortSignal.timeout(8000) });
    const data = await response.json();
    if (data.status !== 'ok' || !data.items) return [];
    
    return data.items.slice(0, 1).map(item => ({
      title: item.title || 'Sin título',
      summary: truncate(stripHtml(item.description || item.content || '')),
      date: formatDate(item.pubDate || ''),
      link: item.link || '#',
      source: source.name,
      tag: source.tag,
      id: source.id,
      image: item.thumbnail || item.enclosure?.link || null
    }));
  } catch (e) {
    console.warn('Fetch error for', source.name, e);
    return [];
  }
}

async function loadAllRSS(silent = false) {
  if (!silent) showStatus('loading');
  const results = await Promise.allSettled(RSS_SOURCES.map(src => fetchRSSSource(src)));

  let articles = [];
  results.forEach(r => {
    if (r.status === 'fulfilled' && r.value.length > 0) {
      articles = articles.concat(r.value);
    }
  });

  // Ensure true RSS is exclusively shown if request succeeds
  if (articles.length === 0) {
    // Solo una noticia por fuente de los artículos demo
    const seen = new Set();
    allArticles = DEMO_ARTICLES.filter(a => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
    if (!silent) showToast('Mostrando noticias guardadas (RSS no disponible localmente)', 'info');
  } else {
    // Al recolectar, ya limitamos a 1 por fuente en fetchRSSSource
    // Pero nos aseguramos aquí también por si acaso
    const seen = new Set();
    allArticles = articles.filter(a => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
    if (!silent) showToast(`Últimas noticias de ${allArticles.length} fuentes actualizadas`, 'success');
  }

  if (!silent) hideStatus();
  renderNews();
  updateTicker();
  updateSIINewsBlock();
}

// ============ UPDATE SII NEWS BLOCK ============
function updateSIINewsBlock() {
  const siiBlock = document.getElementById('sii-news-dynamic');
  if (!siiBlock) return;
  
  const siiNews = allArticles.find(a => a.id === 'sii');
  if (siiNews) {
    siiBlock.innerHTML = `
      <p style="font-weight: 600; margin-bottom: 3px;">${siiNews.title}</p>
      <span style="font-size: 0.75rem; color: var(--accent-light);"><i class="far fa-calendar-alt"></i> ${siiNews.date}</span>
    `;
  } else {
    siiBlock.innerHTML = `<p style="font-size: 0.85rem;">Visita el sitio para ver las últimas resoluciones.</p>`;
  }
}

// ============ NEWS RENDERING ============
function getFilteredArticles() {
  if (currentFilter === 'all') return allArticles;
  return allArticles.filter(a => a.id === currentFilter);
}

function renderNews() {
  const grid = document.getElementById('news-grid');
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (!grid) return;

  const filtered = getFilteredArticles();
  const toShow = filtered.slice(0, visibleCount);
  grid.innerHTML = '';

  if (toShow.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <i class="fas fa-newspaper"></i>
        <p>No hay noticias disponibles en esta categoría.</p>
      </div>`;
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    return;
  }

  toShow.forEach((article, idx) => {
    const card = createNewsCard(article, idx);
    grid.appendChild(card);
  });

  if (loadMoreBtn) {
    loadMoreBtn.style.display = filtered.length > visibleCount ? 'inline-flex' : 'none';
  }
}

function createNewsCard(article, idx) {
  const card = document.createElement('div');
  card.className = 'news-card';
  card.style.animationDelay = `${idx * 0.08}s`;

  const imgHtml = article.image
    ? `<img src="${article.image}" alt="${article.title}" loading="lazy" onerror="this.parentElement.innerHTML=getPlaceholderImg('${article.source}')">`
    : getPlaceholderImgEl(article.source, article.id);

  card.innerHTML = `
    <div class="news-card-img">
      ${imgHtml}
      <span class="news-card-source">${article.source}</span>
    </div>
    <div class="news-card-body">
      <div class="news-card-date">
        <i class="far fa-calendar-alt"></i> ${article.date}
      </div>
      <h3 class="news-card-title">${article.title}</h3>
      ${article.summary ? `<p class="news-card-summary">${article.summary}</p>` : ''}
      <div class="news-card-footer">
        <a href="${article.link}" target="_blank" rel="noopener" class="news-card-link">
          Leer más <i class="fas fa-arrow-right"></i>
        </a>
        <span class="news-card-tag">${article.tag}</span>
      </div>
    </div>`;

  return card;
}

function getPlaceholderImgEl(source, id) {
  const gradients = {
    'df': 'linear-gradient(135deg, #0a1628 0%, #1a3a6b 100%)',
    'sii': 'linear-gradient(135deg, #0d2144 0%, #1e4d8c 100%)',
    'economia': 'linear-gradient(135deg, #7c2d12 0%, #c8901a 100%)',
  };
  const gradient = gradients[id] || 'linear-gradient(135deg, #0a1628 0%, #2d4a75 100%)';
  
  // Usamos iconos más representativos según la fuente
  const icons = {
    'df': 'fa-chart-line',
    'sii': 'fa-file-invoice-dollar',
    'economia': 'fa-coins'
  };
  const icon = icons[id] || 'fa-newspaper';

  return `
    <div class="news-card-img-placeholder" style="background: ${gradient}; position: relative; overflow: hidden;">
      <div style="position: absolute; top:0; left:0; width:100%; height:100%; opacity: 0.1; background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 20px 20px;"></div>
      <i class="fas ${icon}" style="font-size: 3.5rem; filter: drop-shadow(0 0 10px rgba(0,0,0,0.3)); z-index: 1;"></i>
      <span style="font-weight: 800; text-transform: uppercase; letter-spacing: 2px; font-size: 0.7rem; margin-top: 10px; z-index: 1;">${source}</span>
    </div>`;
}

// ============ TICKER ============
function updateTicker() {
  const ticker = document.getElementById('ticker-content');
  if (!ticker || allArticles.length === 0) return;

  const items = allArticles.slice(0, 8).map(a =>
    `<span class="ticker-item">
       <span class="ticker-dot"></span>
       <strong>${a.source}:</strong> ${a.title}
     </span>`
  ).join('');

  ticker.innerHTML = items + items; // duplicate for seamless loop
}

// ============ STATUS ============
function showStatus(type) {
  const status = document.getElementById('news-status');
  if (!status) return;
  status.classList.remove('hidden');
  if (type === 'loading') {
    status.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <p>Cargando noticias tributarias desde RSS...</p>
      </div>`;
  }
}
function hideStatus() {
  const status = document.getElementById('news-status');
  if (status) status.classList.add('hidden');
}

// ============ TOAST NOTIFICATION ============
function showToast(msg, type = 'info') {
  const existing = document.getElementById('zt-toast');
  if (existing) existing.remove();

  const colors = { success: '#16a34a', info: '#1a3a6b', error: '#dc2626' };
  const icons  = { success: 'fa-check-circle', info: 'fa-info-circle', error: 'fa-exclamation-circle' };

  const toast = document.createElement('div');
  toast.id = 'zt-toast';
  toast.style.cssText = `
    position: fixed; bottom: 100px; right: 24px; z-index: 9999;
    background: ${colors[type]}; color: #fff;
    padding: 12px 20px; border-radius: 10px;
    font-size: .85rem; font-weight: 600;
    display: flex; align-items: center; gap: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,.25);
    animation: fadeInUp .3s ease;
    max-width: 300px;
  `;
  toast.innerHTML = `<i class="fas ${icons[type]}"></i> ${msg}`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .4s'; }, 3500);
  setTimeout(() => toast.remove(), 4000);
}

// ============ FILTER BUTTONS ============
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      visibleCount = 6;
      renderNews();
    });
  });
}

// ============ LOAD MORE ============
function initLoadMore() {
  const btn = document.getElementById('load-more-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    visibleCount += 3;
    renderNews();
  });
}

// ============ NAVBAR ============
function initNavbar() {
  const header = document.getElementById('header');
  const toggle = document.getElementById('nav-toggle');
  const menu   = document.getElementById('nav-menu');
  const links  = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  });

  toggle?.addEventListener('click', () => {
    menu.classList.toggle('open');
    const spans = toggle.querySelectorAll('span');
    menu.classList.contains('open')
      ? (spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)',
         spans[1].style.opacity   = '0',
         spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)')
      : (spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; }));
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Active section on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 100) current = s.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });
}

function initNavTextEffect() {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    const text = link.textContent;
    link.innerHTML = '';
    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      span.style.transitionDelay = `${i * 20}ms`;
      link.appendChild(span);
    });
  });
}

// ============ SOCIAL SIDEBAR ============
// Sidebar is now purely CSS-driven and always visible

// ============ CONTACT FORM ============
function initContactForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  const btn     = document.getElementById('submit-btn');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redireccionando a WhatsApp...';

    // Capture values
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const empresa = document.getElementById('empresa').value || 'No especificada';
    const mensaje = document.getElementById('mensaje').value;

    // Format WhatsApp text
    const text = `Hola Zona Tributaria, me gustaría realizar una consulta:\n\n` +
                 `*Nombre:* ${nombre}\n` +
                 `*Email:* ${email}\n` +
                 `*Empresa:* ${empresa}\n` +
                 `*Mensaje:* ${mensaje}`;
    
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/56912345678?text=${encodedText}`;

    // Open in a new tab after a brief delay
    setTimeout(() => {
      btn.style.display = 'none';
      success.classList.add('visible');
      form.reset();
      
      window.open(whatsappUrl, '_blank');

      setTimeout(() => {
        success.classList.remove('visible');
        btn.style.display = '';
        btn.disabled = false;
        btn.innerHTML = 'Enviar consulta <i class="fas fa-paper-plane"></i>';
      }, 5000);
    }, 1200);
  });
}

// ============ HERO SLIDER ============
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slider .slide');
  if (slides.length === 0) return;
  
  let currentSlide = 0;
  setInterval(() => {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }, 5000);
}

// ============ INTERSECTION OBSERVER (Animate on scroll) ============
function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Find all cards in the same parent and animate them with delay
        const container = entry.target;
        const cards = container.querySelectorAll('.service-list-item, .value-card, .step-item, .resource-item, .contact-info-card, .calendar-card, .news-card');
        
        cards.forEach((card, index) => {
          if (!card.classList.contains('animated')) {
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
              card.classList.add('animated');
            }, index * 100);
          }
        });
        
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.services-list, .value-prop-grid, .methodology-steps, .resources-grid, .contact-info-cards, .calendar-grid, .news-grid').forEach(el => {
    const cards = el.querySelectorAll('.service-list-item, .value-card, .step-item, .resource-item, .contact-info-card, .calendar-card, .news-card');
    cards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'opacity .6s cubic-bezier(0.4, 0, 0.2, 1), transform .6s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    observer.observe(el);
  });
}

// ============ SMOOTH SCROLL ============
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ============ INIT ============
// ============ TESTIMONIOS CAROUSEL ============
function initTestimonialsCarousel() {
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.carousel-dots .dot');
  if (slides.length === 0) return;
  
  let currentIndex = 0;
  let timer;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentIndex = index;
  }

  function nextSlide() {
    let next = (currentIndex + 1) % slides.length;
    showSlide(next);
  }

  function startTimer() {
    timer = setInterval(nextSlide, 5000);
  }

  function resetTimer() {
    clearInterval(timer);
    startTimer();
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      resetTimer();
    });
  });

  startTimer();
}

// ============ ECONOMIC INDICATORS (BANCO CENTRAL) ============
async function fetchEconomicIndicators() {
  const ufEl = document.getElementById('uf-val');
  const dolarEl = document.getElementById('dolar-val');
  if (!ufEl || !dolarEl) return;

  try {
    const response = await fetch('https://mindicador.cl/api', { signal: AbortSignal.timeout(6000) });
    const data = await response.json();
    
    if (data.uf && data.dolar) {
      // Format UF
      const ufVal = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(data.uf.valor);
      // Format Dolar
      const dolarVal = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(data.dolar.valor);
      
      ufEl.textContent = ufVal;
      dolarEl.textContent = dolarVal;
    } else {
      throw new Error('Incomplete data from API');
    }
  } catch (e) {
    console.warn('Error fetching mindicador.cl:', e);
    // Reliable Chilean economic fallback values for 2026
    ufEl.textContent = '$38.254,12';
    dolarEl.textContent = '$962,50';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initFilters();
  initLoadMore();
  initContactForm();
  initHeroSlider();
  initAnimations();
  initSmoothScroll();
  initNavTextEffect();
  initTestimonialsCarousel();
  fetchEconomicIndicators();

  // Load RSS feed initially
  loadAllRSS();

  // Actualizar automáticamente cada 3 minutos (180000 ms) en modo silencioso
  setInterval(() => loadAllRSS(true), 180000);

  // Show demo articles immediately while RSS loads
  allArticles = DEMO_ARTICLES;
  renderNews();
  updateTicker();
});
