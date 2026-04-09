/**
 * ONG Enlace — Website Logic & Animations
 * =========================================
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ─────────────────────────────────────────
       1. HEADER: scroll effect
    ───────────────────────────────────────── */
    const header = document.getElementById('header');

    const onScroll = () => {
        if (window.scrollY > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });


    /* ─────────────────────────────────────────
       2. SMOOTH SCROLL for nav links
    ───────────────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

            window.scrollTo({ top, behavior: 'smooth' });
        });
    });


    /* ─────────────────────────────────────────
       3. INTERSECTION OBSERVER: scroll reveal
    ───────────────────────────────────────── */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Un-observe once revealed for performance
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px'
    });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        revealObserver.observe(el);
    });


    /* ─────────────────────────────────────────
       4. ACTIVE NAV LINK on scroll (highlight)
    ───────────────────────────────────────── */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    const highlightNav = () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === `#${current}`) {
                link.style.color = 'var(--primary)';
            }
        });
    };

    window.addEventListener('scroll', highlightNav, { passive: true });


    /* ─────────────────────────────────────────
       5. CONTACT FORM: submission animation
    ───────────────────────────────────────── */
    const contactForm = document.getElementById('contactForm');
    const submitBtn   = document.getElementById('submitBtn');

    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled  = true;
            submitBtn.style.opacity = '0.8';

            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> ¡Mensaje Enviado!';
                submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #047857 100%)';
                submitBtn.style.opacity    = '1';
                contactForm.reset();

                setTimeout(() => {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.style.background = '';
                    submitBtn.disabled  = false;
                }, 3500);
            }, 1600);
        });
    }


    /* ─────────────────────────────────────────
       6. HERO STATS: animated counter
    ───────────────────────────────────────── */
    const animateCounter = (el, target, suffix = '') => {
        const duration = 1800;
        const start    = performance.now();
        const isFloat  = target % 1 !== 0;

        const step = (timestamp) => {
            const elapsed  = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 4); // ease-out-quart
            const value    = eased * target;

            el.textContent = (isFloat ? value.toFixed(1) : Math.floor(value)) + suffix;

            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    // Trigger counter when hero stats come into view
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(el => {
                    const raw    = el.textContent.trim();
                    const num    = parseFloat(raw);
                    const suffix = raw.replace(num, '');
                    if (!isNaN(num)) animateCounter(el, num, suffix);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) statsObserver.observe(heroStats);


    /* ─────────────────────────────────────────
       7. SOCIAL PILL: show on load with delay
    ───────────────────────────────────────── */
    const pill = document.querySelector('.social-pill');
    if (pill) {
        // Show tab after a short delay
        setTimeout(() => {
            pill.style.opacity = '1';
        }, 1200);
    }


    /* ─────────────────────────────────────────
       8. AREA CARDS: stagger on scroll
    ───────────────────────────────────────── */
    const areaCards = document.querySelectorAll('.area-card');
    areaCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.07}s`;
    });


    /* ─────────────────────────────────────────
       9. PARALLAX: subtle hero effect
    ───────────────────────────────────────── */
    const heroImage = document.querySelector('.hero-image-main');

    if (heroImage && window.innerWidth > 1024) {
        window.addEventListener('scroll', () => {
            const y = window.scrollY * 0.25;
            heroImage.style.transform = `translateY(${y}px)`;
        }, { passive: true });
    }


    /* ─────────────────────────────────────────
       RSS NEWS FEED
    ───────────────────────────────────────── */
    const newsGrid    = document.getElementById('newsGrid');
    const newsLoading = document.getElementById('newsLoading');

    const RSS_SOURCES = [
        {
            url:   'https://feeds.bbci.co.uk/mundo/noticias/rss.xml',
            label: 'BBC Mundo'
        },
        {
            url:   'https://news.un.org/feed/subscribe/es/news/topic/human-rights/feed/rss.xml',
            label: 'ONU · DD.HH.'
        }
    ];

    const formatNewsDate = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleDateString('es-CL', {
                day: '2-digit', month: 'long', year: 'numeric'
            });
        } catch (e) { return ''; }
    };

    const renderNewsCards = (items, sourceName) => {
        if (newsLoading) newsLoading.remove();

        items.slice(0, 6).forEach((item, i) => {
            const card    = document.createElement('div');
            card.className = 'news-card reveal';
            card.style.transitionDelay = `${i * 0.08}s`;

            const imgUrl  = item.thumbnail || (item.enclosure && item.enclosure.link) || '';
            const rawDesc = (item.description || '').replace(/<[^>]*>/g, '').trim();
            const desc    = rawDesc.length > 155 ? rawDesc.slice(0, 155) + '…' : rawDesc;
            const dateStr = item.pubDate ? formatNewsDate(item.pubDate) : '';
            const safeTitle = (item.title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            card.innerHTML = `
                <div class="news-img">
                    ${imgUrl
                        ? `<img src="${imgUrl}" alt="${safeTitle}" loading="lazy"
                               onerror="this.parentElement.innerHTML='<i class=\\'fas fa-newspaper\\'></i>'">`
                        : '<i class="fas fa-newspaper"></i>'}
                </div>
                <div class="news-body">
                    <span class="news-source">
                        <i class="fas fa-globe-americas"></i> ${sourceName}
                    </span>
                    ${dateStr ? `<p class="news-date"><i class="far fa-calendar-alt"></i> ${dateStr}</p>` : ''}
                    <h3 class="news-title">${safeTitle}</h3>
                    ${desc ? `<p class="news-desc">${desc}</p>` : ''}
                    <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="news-link">
                        Leer más <i class="fas fa-arrow-right"></i>
                    </a>
                </div>`;

            newsGrid.appendChild(card);
            revealObserver.observe(card);
        });
    };

    const fetchNewsRSS = async () => {
        const base = 'https://api.rss2json.com/v1/api.json?rss_url=';

        for (const src of RSS_SOURCES) {
            try {
                const res  = await fetch(`${base}${encodeURIComponent(src.url)}&count=6`);
                if (!res.ok) continue;
                const data = await res.json();
                if (data.status === 'ok' && data.items && data.items.length) {
                    renderNewsCards(data.items, src.label);
                    return; // success — stop trying further sources
                }
            } catch (e) { /* try next source */ }
        }

        // All sources failed — show friendly fallback
        if (newsLoading) {
            newsLoading.innerHTML = `
                <i class="fas fa-satellite-dish"></i>
                <p style="margin-top:1rem;">No se pudieron cargar las noticias en este momento.<br>
                <a href="https://news.un.org/es/news/topic/human-rights"
                   target="_blank" rel="noopener noreferrer">Ver noticias en ONU Noticias »</a></p>`;
            newsLoading.className = 'news-error';
        }
    };

    if (newsGrid) fetchNewsRSS();


    /* ─────────────────────────────────────────
       DONATION AMOUNT SELECTOR
    ───────────────────────────────────────── */
    const amountBtns        = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('customAmount');
    const donateBtn         = document.getElementById('donateBtn');
    let   selectedAmount    = 10000;

    const buildDonateHref = (amt) => {
        const fmt = amt.toLocaleString('es-CL');
        return `mailto:contacto@ongenlace.cl`
             + `?subject=Donaci%C3%B3n%20ONG%20Enlace%20%E2%80%94%20%24${fmt}`
             + `&body=Hola%2C%20deseo%20realizar%20una%20donaci%C3%B3n%20de%20%24${fmt}%20CLP%20a%20ONG%20Enlace.`
             + `%0A%0APor%20favor%20ind%C3%ADqueme%20c%C3%B3mo%20proceder.%0A%0AGracias.`;
    };

    amountBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            amountBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedAmount = parseInt(btn.dataset.value, 10);
            if (customAmountInput) customAmountInput.value = '';
            if (donateBtn) donateBtn.href = buildDonateHref(selectedAmount);
        });
    });

    if (customAmountInput) {
        customAmountInput.addEventListener('input', () => {
            const val = parseInt(customAmountInput.value, 10);
            if (val > 0) {
                amountBtns.forEach(b => b.classList.remove('active'));
                selectedAmount = val;
                if (donateBtn) donateBtn.href = buildDonateHref(val);
            }
        });
    }

    // Set initial link
    if (donateBtn) donateBtn.href = buildDonateHref(selectedAmount);

});

