
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const esc = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);

  const normalize = (value) =>
    String(value ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const plural = (n, singular, pluralForm) =>
    n === 1 ? singular : pluralForm;

  const icon = (name) =>
    `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

  /* =========================================
     1. MENU MOBILE
  ========================================= */

  document.documentElement.classList.add('js');

  const menuToggle = $('menuToggle');
  const navLinks = $('navLinks');

  if (menuToggle && navLinks) {
    const setMenu = (open) => {
      navLinks.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute(
        'aria-label',
        open ? 'Fechar menu' : 'Abrir menu'
      );

      const menuIcon = menuToggle.querySelector('use');
      const menuLabel = menuToggle.querySelector('.menu-label');

      if (menuIcon) {
        menuIcon.setAttribute(
          'href',
          open ? '#i-x' : '#i-menu'
        );
      }

      if (menuLabel) {
        menuLabel.textContent = open ? 'Fechar' : 'Menu';
      }
    };

    menuToggle.addEventListener('click', () => {
      setMenu(!navLinks.classList.contains('open'));
    });

    navLinks.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setMenu(false);
    });

    const desktopQuery = window.matchMedia('(min-width: 901px)');

    desktopQuery.addEventListener('change', (event) => {
      if (event.matches) setMenu(false);
    });
  }

  /* =========================================
     2. LINK DA PÁGINA ATUAL
  ========================================= */

  const currentPage =
    location.pathname.split('/').pop() || 'home.html';

  $$('.nav-links a[href]').forEach((link) => {
    const href = link.getAttribute('href');

    if (
      href &&
      !href.startsWith('#') &&
      href.split('/').pop() === currentPage
    ) {
      link.setAttribute('aria-current', 'page');
    }
  });

  /* =========================================
     3. BARRA SUPERIOR
  ========================================= */

  const topbar = document.querySelector('.topbar');

  if (topbar) {
    const updateTopbar = () => {
      topbar.classList.toggle('scrolled', window.scrollY > 12);
    };

    window.addEventListener('scroll', updateTopbar, {
      passive: true
    });

    updateTopbar();
  }

  /* =========================================
     4. ANIMAÇÕES DE ENTRADA
  ========================================= */

  const revealElements = $$('.reveal');

  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => {
      element.classList.add('visible');
    });
  }

  /* =========================================
     5. ANO AUTOMÁTICO
  ========================================= */

  const year = $('year');

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /* =========================================
     6. CERTIFICADOS
     Edite os dados abaixo.
  ========================================= */

  const certificados = [
    {
      titulo: 'Segurança Cibernética',
      instituicao: '',
      categoria: 'Cibersegurança',
      data: '',
      arquivo: 'content/certificacoes/seguranca-cibernetica.pdf',
      palavrasChave: [
        'segurança',
        'cibernética',
        'cibersegurança'
      ]
    },
    {
      titulo: 'Segurança da Informação para Todos',
      instituicao: '',
      categoria: 'Segurança da Informação',
      data: '',
      arquivo: 'content/certificacoes/seguranca-da-informacao-para-todos.pdf',
      palavrasChave: [
        'segurança',
        'informação',
        'segurança da informação'
      ]
    },
    {
      titulo: 'Liderança em IA',
      instituicao: '',
      categoria: 'Inteligência Artificial',
      data: '',
      arquivo: 'content/certificacoes/lideranca-em-ia.pdf',
      palavrasChave: [
        'liderança',
        'IA',
        'inteligência artificial'
      ]
    },
    {
      titulo: 'Engenharia de Prompt',
      instituicao: '',
      categoria: 'Inteligência Artificial',
      data: '',
      arquivo: 'content/certificacoes/engenharia-de-prompt.pdf',
      palavrasChave: [
        'engenharia de prompt',
        'prompt',
        'IA',
        'inteligência artificial'
      ]
    },
    {
      titulo: 'Inteligência Artificial Generativa',
      instituicao: '',
      categoria: 'Inteligência Artificial',
      data: '',
      arquivo: 'content/certificacoes/inteligencia-artificial-generativa.pdf',
      palavrasChave: [
        'inteligência artificial',
        'IA',
        'IA generativa',
        'inteligência artificial generativa'
      ]
    }
  ];

  const grid = $('grid-certificados');
  const searchInput = $('campo-busca');
  const filtersBox = $('filtros');
  const info = $('info-resultado');

  const overlay = $('modal-overlay');
  const modal = overlay?.querySelector('.modal');
  const frame = $('modal-iframe');
  const modalTitle = $('modal-titulo');
  const modalSubtitle = $('modal-subtitulo');
  const modalNewTab = $('modal-nova-aba');
  const modalClose = $('modal-fechar');
  const modalFallback = $('modal-fallback');
  const modalFallbackLink = $('modal-fallback-link');

  const certificatesPage = Boolean(
    grid && searchInput && filtersBox && info
  );

  if (certificatesPage) {
    const tones = [
      '#d8f2a3',
      '#d5c7ff',
      '#a6dce4',
      '#f1b7a6'
    ];

    const categories = [
      ...new Set(certificados.map((item) => item.categoria))
    ];

    const getTone = (category) =>
      tones[categories.indexOf(category) % tones.length];

    let activeCategory = 'Todas';
    let lastFocused = null;

    /* ----- Contadores ----- */

    const countUp = (element, target) => {
      if (!element) return;

      const format = (number) =>
        String(number).padStart(2, '0');

      if (reduceMotion || target === 0) {
        element.textContent = format(target);
        return;
      }

      const start = performance.now();
      const duration = 800;

      const animate = (now) => {
        const progress = Math.min(
          (now - start) / duration,
          1
        );

        const value = Math.round(
          target * (1 - Math.pow(1 - progress, 3))
        );

        element.textContent = format(value);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    };

    /* ----- Filtros ----- */

    const buildFilters = () => {
      filtersBox.innerHTML = ['Todas', ...categories]
        .map((category) => `
          <button
            type="button"
            class="chip"
            data-categoria="${esc(category)}"
            aria-pressed="${category === activeCategory}"
          >${esc(category)}</button>
        `)
        .join('');
    };

    const getFilteredCertificates = () => {
      const term = normalize(searchInput.value.trim());

      return certificados
        .map((certificate, index) => ({
          ...certificate,
          originalIndex: index
        }))
        .filter((certificate) => {
          if (
            activeCategory !== 'Todas' &&
            certificate.categoria !== activeCategory
          ) {
            return false;
          }

          if (!term) return true;

          const searchableText = normalize([
            certificate.titulo,
            certificate.instituicao,
            certificate.categoria,
            ...(certificate.palavrasChave || [])
          ].join(' '));

          return searchableText.includes(term);
        });
    };

    /* ----- Cartões ----- */

    const cardHTML = (certificate, position) => `
      <article
        class="cert-card"
        style="--i:${position}; --tone:${getTone(certificate.categoria)}"
      >
        <div class="cert-top">
          <span class="cert-icon">${icon('award')}</span>
          <span class="tag">${esc(certificate.categoria)}</span>
        </div>

        <h2 class="cert-title">${esc(certificate.titulo)}</h2>

        ${
          certificate.instituicao
            ? `<p class="cert-meta">${esc(certificate.instituicao)}</p>`
            : ''
        }

        ${
          certificate.data
            ? `<p class="cert-meta">${esc(certificate.data)}</p>`
            : ''
        }

        <div class="cert-actions">
          <button
            type="button"
            class="button primary"
            data-abrir="${certificate.originalIndex}"
            data-cursor="Ver"
          >
            ${icon('eye')} Visualizar
          </button>

          <a
            class="button ghost icon-only"
            href="${esc(certificate.arquivo)}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir ${esc(certificate.titulo)} em nova aba"
          >${icon('external-link')}</a>
        </div>
      </article>
    `;

    /* ----- Renderização ----- */

    const render = () => {
      const list = getFilteredCertificates();
      const total = certificados.length;

      if (!list.length) {
        grid.innerHTML = `
          <div class="empty">
            ${icon('file-text')}
            <p>Nenhum certificado encontrado.</p>
          </div>
        `;

        info.textContent = 'Sem resultados.';
        return;
      }

      grid.innerHTML = list
        .map((certificate, index) => cardHTML(certificate, index))
        .join('');

      const filteredNow =
        searchInput.value.trim() !== '' ||
        activeCategory !== 'Todas';

      info.textContent = filteredNow
        ? `${list.length} de ${total} ${
            plural(total, 'certificado', 'certificados')
          } ${
            plural(list.length, 'encontrado', 'encontrados')
          }`
        : `${total} ${
            plural(total, 'certificado', 'certificados')
          } no total`;
    };

    /* ----- Modal de visualização ----- */

    const openModal = (certificate) => {
      if (
        !overlay ||
        !frame ||
        !modalTitle ||
        !modalNewTab ||
        !modalFallbackLink
      ) {
        window.open(
          certificate.arquivo,
          '_blank',
          'noopener,noreferrer'
        );
        return;
      }

      lastFocused = document.activeElement;

      modalTitle.textContent = certificate.titulo;

      if (modalSubtitle) {
        modalSubtitle.textContent =
          certificate.instituicao || certificate.categoria;
      }

      modalNewTab.href = certificate.arquivo;
      modalFallbackLink.href = certificate.arquivo;

      if (modalFallback) {
        modalFallback.classList.remove('visible');
      }

      frame.style.display = 'block';

      frame.onerror = () => {
        frame.style.display = 'none';
        modalFallback?.classList.add('visible');
      };

      frame.src = certificate.arquivo;

      overlay.classList.add('open');
      document.documentElement.classList.add('modal-open');
      document.body.style.overflow = 'hidden';

      modalClose?.focus();
    };

    const closeModal = () => {
      if (!overlay) return;

      overlay.classList.remove('open');
      document.documentElement.classList.remove('modal-open');
      document.body.style.overflow = '';

      if (frame) {
        frame.src = 'about:blank';
        frame.onerror = null;
      }

      if (modalFallback) {
        modalFallback.classList.remove('visible');
      }

      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    };

    /* ----- Eventos delegados ----- */

    filtersBox.addEventListener('click', (event) => {
      const button = event.target.closest('[data-categoria]');

      if (!button || !filtersBox.contains(button)) return;

      activeCategory = button.dataset.categoria;

      $$('.chip', filtersBox).forEach((chip) => {
        chip.setAttribute(
          'aria-pressed',
          String(chip === button)
        );
      });

      render();
    });

    grid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-abrir]');

      if (!button || !grid.contains(button)) return;

      const index = Number(button.dataset.abrir);
      const certificate = certificados[index];

      if (certificate) openModal(certificate);
    });

    searchInput.addEventListener('input', render);

    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }

    if (overlay) {
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeModal();
      });
    }

    document.addEventListener('keydown', (event) => {
      if (!overlay?.classList.contains('open')) return;

      if (event.key === 'Escape') {
        closeModal();
        return;
      }

      if (event.key !== 'Tab' || !modal) return;

      const focusable = $$(
        'a[href], button:not(:disabled), iframe, [tabindex]:not([tabindex="-1"])',
        modal
      ).filter((element) => element.offsetParent !== null);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    });

    /* ----- Inicialização ----- */

    buildFilters();
    render();

    countUp($('total-cert'), certificados.length);

    const totalCategories = $('total-cat');

    if (totalCategories) {
      totalCategories.textContent =
        `${categories.length} ${
          plural(categories.length, 'área', 'áreas')
        }`;
    }
  }
})();
