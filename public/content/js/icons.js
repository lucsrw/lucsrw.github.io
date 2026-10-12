
/* =========================================================
   Biblioteca unificada de ícones SVG
   Traçados Lucide — licença ISC
   https://lucide.dev

   Uso:
   <svg class="icon" aria-hidden="true">
     <use href="#i-mail"></use>
   </svg>

   O sprite é injetado automaticamente no documento.
   ========================================================= */

(() => {
  'use strict';

  const sprite = `
  <svg xmlns="http://www.w3.org/2000/svg"
       width="0"
       height="0"
       style="position:absolute;overflow:hidden"
       aria-hidden="true"
       focusable="false">

    <!-- Navegação e setas -->
    <symbol id="i-arrow-up-right" viewBox="0 0 24 24">
      <path d="M7 7h10v10"/>
      <path d="M7 17 17 7"/>
    </symbol>

    <symbol id="i-arrow-down-right" viewBox="0 0 24 24">
      <path d="m7 7 10 10"/>
      <path d="M17 7v10H7"/>
    </symbol>

    <symbol id="i-arrow-up" viewBox="0 0 24 24">
      <path d="m5 12 7-7 7 7"/>
      <path d="M12 19V5"/>
    </symbol>

    <symbol id="i-menu" viewBox="0 0 24 24">
      <line x1="4" x2="20" y1="12" y2="12"/>
      <line x1="4" x2="20" y1="6" y2="6"/>
      <line x1="4" x2="20" y1="18" y2="18"/>
    </symbol>

    <symbol id="i-x" viewBox="0 0 24 24">
      <path d="M18 6 6 18"/>
      <path d="m6 6 12 12"/>
    </symbol>

    <!-- Projetos e conteúdo -->
    <symbol id="i-briefcase" viewBox="0 0 24 24">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      <rect width="20" height="14" x="2" y="6" rx="2"/>
    </symbol>

    <symbol id="i-layers" viewBox="0 0 24 24">
      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/>
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
    </symbol>

    <symbol id="i-award" viewBox="0 0 24 24">
      <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/>
      <circle cx="12" cy="8" r="6"/>
    </symbol>

    <symbol id="i-compass" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </symbol>

    <symbol id="i-eye" viewBox="0 0 24 24">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
      <circle cx="12" cy="12" r="3"/>
    </symbol>

    <symbol id="i-search" viewBox="0 0 24 24">
      <path d="m21 21-4.34-4.34"/>
      <circle cx="11" cy="11" r="8"/>
    </symbol>

    <symbol id="i-file-text" viewBox="0 0 24 24">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
      <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
      <path d="M10 9H8"/>
      <path d="M16 13H8"/>
      <path d="M16 17H8"/>
    </symbol>

    <!-- Contato e redes sociais -->
    <symbol id="i-mail" viewBox="0 0 24 24">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </symbol>

    <symbol id="i-phone" viewBox="0 0 24 24">
      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>
    </symbol>

    <symbol id="i-github" viewBox="0 0 24 24">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
      <path d="M9 18c-4.51 2-5-2-7-2"/>
    </symbol>

    <symbol id="i-linkedin" viewBox="0 0 24 24">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect width="4" height="12" x="2" y="9"/>
      <circle cx="4" cy="4" r="2"/>
    </symbol>

    <symbol id="i-external-link" viewBox="0 0 24 24">
      <path d="M15 3h6v6"/>
      <path d="M10 14 21 3"/>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    </symbol>

    <!-- Formação e habilidades -->
    <symbol id="i-graduation-cap" viewBox="0 0 24 24">
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/>
      <path d="M22 10v6"/>
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
    </symbol>

    <symbol id="i-languages" viewBox="0 0 24 24">
      <path d="m5 8 6 6"/>
      <path d="m4 14 6-6 2-3"/>
      <path d="M2 5h12"/>
      <path d="M7 2h1"/>
      <path d="m22 22-5-10-5 10"/>
      <path d="M14 18h6"/>
    </symbol>

    <symbol id="i-map-pin" viewBox="0 0 24 24">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
      <circle cx="12" cy="10" r="3"/>
    </symbol>

    <symbol id="i-asterisk" viewBox="0 0 24 24">
      <path d="M12 6v12"/>
      <path d="M17.196 9 6.804 15"/>
      <path d="m6.804 9 10.392 6"/>
    </symbol>

	<symbol id="i-arrow-right" viewBox="0 0 24 24">
	  <path d="M5 12h14"/>
	  <path d="m12 5 7 7-7 7"/>
	</symbol>


  </svg>`;

  const injectSprite = () => {
    if (!document.body) return;
    if (document.getElementById('lucide-sprite')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'lucide-sprite';
    wrapper.innerHTML = sprite;

    document.body.insertAdjacentElement('afterbegin', wrapper);
  };

  if (document.body) {
    injectSprite();
  } else {
    document.addEventListener(
      'DOMContentLoaded',
      injectSprite,
      { once: true }
    );
  }
})();
