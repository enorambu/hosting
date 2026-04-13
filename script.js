/* ============================================
   ZONA TRIBUTARIA CHILE - JAVASCRIPT
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ===== NAVBAR =====
  const header = document.getElementById('header');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Scroll effect
  const handleScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile toggle
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const setActiveLink = () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) {
        link.classList.toggle('active', scrollY >= top && scrollY < top + height);
      }
    });
  };
  window.addEventListener('scroll', setActiveLink, { passive: true });

  // ===== HERO SLIDER =====
  const slides = document.querySelectorAll('.slide');
  let currentSlide = 0;

  if (slides.length > 0) {
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 5000);
  }

  // ===== NEWS TICKER (Demo) =====
  const tickerContent = document.getElementById('ticker-content');
  const tickerItems = [
    '🔥 Operación Renta 2026: El SII habilita formulario F22 para contribuyentes',
    '📊 IVA recaudado sube 8,3% en el último trimestre según datos del SII',
    '⚖️ Tribunal Tributario emite nueva jurisprudencia sobre crédito fiscal IVA',
    '📋 Nuevo decreto modifica plazos de declaraciones juradas para empresas',
    '💰 Impuesto a las Ganancias de Capital: claves de la nueva normativa',
    '🏛️ Ministerio de Hacienda anuncia ajustes en alícuotas del impuesto de primera categoría',
    '📌 SII lanza plataforma simplificada para pymes: requisitos y beneficios',
    '🔍 Auditoría tributaria 2026: puntos clave que revisará el SII este año',
  ];

  const tickerHTML = tickerItems.map(t => `<span>${t}</span>`).join('');
  tickerContent.innerHTML = tickerHTML + tickerHTML; // Duplicado para loop continuo

  // ===== DEMO NEWS CARDS (Skeleton) =====
  const demoGrid = document.getElementById('demo-grid');
  const newsStatus = document.getElementById('news-status');

  // Show loading
  newsStatus.classList.add('visible');

  function createSkeletonCards(count) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="news-card">
          <div class="skeleton-img"></div>
          <div class="news-card-body">
            <div class="skeleton-text medium"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text short"></div>
          </div>
        </div>
      `;
    }
    return html;
  }

  // Responsive skeleton count
  function getGridCols() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  }

  demoGrid.innerHTML = createSkeletonCards(getGridCols());
  window.addEventListener('resize', () => {
    demoGrid.innerHTML = createSkeletonCards(getGridCols());
  });

  // ===== DEMO NEWS DATA =====
  const demoNews = [
    {
      title: 'SII confirma calendario de vencimientos para Operación Renta 2026',
      excerpt: 'El Servicio de Impuestos Internos publicó las fechas definitivas para la declaración anual de impuesto a la renta de personas naturales y empresas.',
      source: 'SII',
      category: 'sii',
      date: '15 Ene 2026',
      image: 'https://picsum.photos/seed/zt-news1/600/400.jpg'
    },
    {
      title: 'Reforma tributaria: qué cambios entrarán en vigencia este año',
      excerpt: 'El Congreso aprobó modificaciones key al impuesto de primera categoría y a las reglas de tributación de dividendos para empresas chilenas.',
      source: 'Diario Financiero',
      category: 'df',
      date: '14 Ene 2026',
      image: 'https://picsum.photos/seed/zt-news2/600/400.jpg'
    },
    {
      title: 'Banco Central proyecta crecimiento económico de 2,8% para 2026',
      excerpt: 'El informe de política monetaria del BCCh actualiza las proyecciones de PIB e inflación, con implicancias para la recaudación fiscal.',
      source: 'Diario Financiero',
      category: 'economia',
      date: '13 Ene 2026',
      image: 'https://picsum.photos/seed/zt-news3/600/400.jpg'
    },
    {
      title: 'SII amplía plan de fiscalización electrónica para pymes en 2026',
      excerpt: 'Nuevo programa de digitalización busca que el 100% de las pymes emitan factura electrónica antes de fin de año.',
      source: 'SII',
      category: 'sii',
      date: '12 Ene 2026',
      image: 'https://picsum.photos/seed/zt-news4/600/400.jpg'
    },
    {
      title: 'Tribunales Tributarios registran récord de reclamaciones en 2025',
      excerpt: 'Las cortes especializadas recibieron más de 45.000 causas el año pasado, concentradas en liquidaciones de IVA y renta.',
      source: 'Diario Financiero',
      category: 'df',
      date: '11 Ene 2026',
      image: 'https://picsum.photos/seed/zt-news5/600/400.jpg'
    },
    {
      title: 'Economía global: riesgos y oportunidades para el comercio exterior chileno',
      excerpt: 'Analistas revisan el impacto de aranceles estadounidenses y el precio del cobre en las proyecciones de exportaciones nacionales.',
      source: 'Diario Financiero',
      category: 'economia',
      date: '10 Ene 2026',
      image: 'https://picsum.photos/seed/zt-news6/600/400.jpg'
    },
    {
      title: 'Crédito fiscal IVA: SII emite circular sobre requisitos de documentación',
      excerpt: 'La nueva instrucción precisa las condiciones que deben cumplir los documentos para respaldar el uso del crédito fiscal del IVA.',
      source: 'SII',
      category: 'sii',
      date: '9 Ene 2026',
      image: 'https://picsum.photos/seed/zt-news7/600/400.jpg'
    },
    {
      title: 'Impuesto Verde: nuevas obligaciones para empresas contaminantes desde abril',
      excerpt: 'Las empresas que superen los umbrales de emisiones deberán comenzar a pagar el impuesto verde en la declaración de abril.',
      source: 'Diario Financiero',
      category: 'economia',
      date: '8 Ene 2026',
      image: 'https://picsum.photos/seed/zt-news8/600/400.jpg'
    },
    {
      title: 'SII lanza herramienta online para simular declaración de renta',
      excerpt: 'La nueva calculadora permite a los contribuyentes estimar su resultado tributario antes de la operación renta oficial.',
      source: 'SII',
      category: 'sii',
      date: '7 Ene 2026',
      image: 'https://picsum.photos/seed/zt-news9/600/400.jpg'
    }
  ];

  // Render news cards
  const newsGrid = document.getElementById('news-grid');

  function renderNews(filter = 'all') {
    const filtered = filter === 'all'
      ? demoNews
      : demoNews.filter(n => n.category === filter);

    newsGrid.innerHTML = filtered.map(news => `
      <article class="news-card" onclick="window.open('#', '_blank')">
        <div class="news-card-img">
          <img src="${news.image}" alt="${news.title}" loading="lazy" />
          <span class="news-card-category">${news.category.toUpperCase()}</span>
        </div>
        <div class="news-card-body">
          <h3 class="news-card-title">${news.title}</h3>
          <p class="news-card-excerpt">${news.excerpt}</p>
          <div class="news-card-meta">
            <span class="news-card-source">${news.source}</span>
            <span class="news-card-date">${news.date}</span>
          </div>
        </div>
      </article>
    `).join('');
  }

  // Simulate loading
  setTimeout(() => {
    newsStatus.classList.remove('visible');
    demoGrid.innerHTML = '';
    renderNews();
  }, 1800);

  // Filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderNews(btn.dataset.filter);
    });
  });

  // Load more (demo)
  const loadMoreBtn = document.getElementById('load-more-btn');
  loadMoreBtn.addEventListener('click', () => {
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
    setTimeout(() => {
      const extraNews = [
        {
          title: 'Proyecto de ley busca simplificar tributación para emprendedores',
          excerpt: 'La iniciativa parliamentaria propone un régimen simplificado con menos obligaciones formales para negocios menores.',
          source: 'Diario Financiero',
          category: 'df',
          date: '6 Ene 2026',
          image: 'https://picsum.photos/seed/zt-news10/600/400.jpg'
        },
        {
          title: 'SII informa sobre cambios en certificados de residencia tributaria',
          excerpt: 'Los contribuyentes que realicen operaciones internacionales deberán actualizar sus certificados según nueva normativa.',
          source: 'SII',
          category: 'sii',
          date: '5 Ene 2026',
          image: 'https://picsum.photos/seed/zt-news11/600/400.jpg'
        },
        {
          title: 'Tipo de cambio y su impacto en la tributación de empresas exportadoras',
          excerpt: 'La volatilidad del dólar genera efectos significativos en los resultados tributarios del sector exportador nacional.',
          source: 'Diario Financiero',
          category: 'economia',
          date: '4 Ene 2026',
          image: 'https://picsum.photos/seed/zt-news12/600/400.jpg'
        }
      ];
      demoNews.push(...extraNews);
      const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
      renderNews(activeFilter);
      loadMoreBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Cargar más noticias';
    }, 1000);
  });

  // Show load more after initial load
  setTimeout(() => {
    loadMoreBtn.style.display = 'inline-flex';
  }, 2200);

  // ===== SCROLL ANIMATIONS (AOS fallback) =====
  const aosElements = document.querySelectorAll('[data-aos]');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  };

  const aosObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        aosObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  aosElements.forEach(el => aosObserver.observe(el));

  // ===== CONTACT FORM =====
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const submitBtn = document.getElementById('submit-btn');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();

    // Basic validation
    if (!nombre || !email || !mensaje) {
      // Highlight empty required fields
      contactForm.querySelectorAll('[required]').forEach(input => {
        if (!input.value.trim()) {
          input.style.borderColor = '#ef4444';
          setTimeout(() => { input.style.borderColor = ''; }, 3000);
        }
      });
      return;
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const emailInput = document.getElementById('email');
      emailInput.style.borderColor = '#ef4444';
      setTimeout(() => { emailInput.style.borderColor = ''; }, 3000);
      return;
    }

    // Simulate sending
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensaje';
      contactForm.reset();
      formSuccess.classList.add('visible');

      setTimeout(() => {
        formSuccess.classList.remove('visible');
      }, 5000);
    }, 1500);
  });

  // ===== WHATSAPP FAB - Show after scroll =====
  const whatsappFab = document.getElementById('whatsapp-fab');
  whatsappFab.style.opacity = '0';
  whatsappFab.style.transform = 'scale(0.5)';

  setTimeout(() => {
    whatsappFab.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    whatsappFab.style.opacity = '1';
    whatsappFab.style.transform = 'scale(1)';
  }, 2000);

  // ===== SMOOTH SCROLL for all anchor links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    });
  });

});