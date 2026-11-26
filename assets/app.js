import {
  COLECAO2_GAMES,
  QUICKPLAY_GAMES,
  ALL_GAMES,
  gameUrl,
  gameDesc
} from './games.js';
import {
  SUPPORTED_LANGS,
  LANG_META,
  detectInitialLang,
  persistLang,
  t,
  categoryLabel
} from './i18n.js';

const $ = (id) => document.getElementById(id);

const state = {
  lang: detectInitialLang(),
  scope: 'all',
  filter: 'todos',
  query: '',
  current: null,
  toastTimer: null
};

const CARD_PALETTES = [
  '#1f3344', '#2c2944', '#1d3a34', '#3d262f',
  '#283c52', '#3d2f24', '#2e3c28', '#252f47'
];

const norm = (str) => String(str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const esc = (str) => String(str).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

function deepUrl(game) {
  const url = new URL(window.location.href);
  url.searchParams.set('jogo', game.id);
  url.searchParams.set('lang', state.lang);
  return url.toString();
}

function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2700);
}

function renderLangSwitchers() {
  for (const containerId of ['langSwitcher', 'langSwitcherMobile']) {
    const wrap = $(containerId);
    if (!wrap) continue;
    wrap.replaceChildren();
    for (const lang of SUPPORTED_LANGS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lang-btn' + (lang === state.lang ? ' is-active' : '');
      btn.textContent = LANG_META[lang].code;
      btn.title = LANG_META[lang].native;
      btn.setAttribute('aria-pressed', String(lang === state.lang));
      btn.addEventListener('click', () => setLang(lang));
      wrap.appendChild(btn);
    }
  }
}

function applyTranslations() {
  const lang = state.lang;
  document.documentElement.lang = lang;
  document.title = state.current
    ? `${state.current.name} — Projeto Primata Games`
    : t(lang, 'metaTitle');

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', t(lang, 'metaDesc'));

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(lang, el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(lang, el.dataset.i18nPlaceholder));
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(lang, el.dataset.i18nAria));
  });

  renderLangSwitchers();
  renderColecao2();
  renderVault();
  if (state.current) updatePlayerLabels(state.current);
}

function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang) || lang === state.lang) return;
  state.lang = lang;
  persistLang(lang);
  applyTranslations();
}

function renderColecao2() {
  const grid = $('colecao2Grid');
  if (!grid) return;
  grid.replaceChildren();
  const frag = document.createDocumentFragment();
  const lang = state.lang;

  for (const game of COLECAO2_GAMES) {
    const card = document.createElement('article');
    card.className = 'c2-card';
    card.innerHTML = `
      <div class="c2-banner">
        <div class="c2-badges">
          <span class="c2-genre">${esc(categoryLabel(lang, game.category))}</span>
          <span class="c2-ea-pill">${esc(t(lang, 'badgeEarlyAccess'))}</span>
        </div>
        <span class="c2-emoji" aria-hidden="true">${game.emoji}</span>
      </div>
      <div class="c2-body">
        <h3>${esc(game.name)}</h3>
        <p>${esc(gameDesc(game, lang))}</p>
        <div class="c2-actions">
          <button type="button" class="c2-play-btn">▶ ${esc(t(lang, 'c2PlayBtn'))}</button>
          <a class="c2-ext-btn" href="${esc(gameUrl(game))}" target="_blank" rel="noopener noreferrer" title="${esc(t(lang, 'c2NewTabTitle'))}" aria-label="${esc(game.name)} — ${esc(t(lang, 'c2NewTabTitle'))}">↗</a>
        </div>
      </div>
    `;
    const banner = card.querySelector('.c2-banner');
    banner.style.setProperty('--c1', game.c1);
    banner.style.setProperty('--c2', game.c2);
    card.querySelector('.c2-play-btn').addEventListener('click', () => openGame(game, true));
    frag.appendChild(card);
  }
  grid.appendChild(frag);
}

function filteredVaultGames() {
  const lang = state.lang;
  const q = norm(state.query);
  return ALL_GAMES.filter((g) => {
    if (state.scope !== 'all' && g.source !== state.scope) return false;
    if (state.filter !== 'todos' && g.category !== state.filter) return false;
    if (!q) return true;
    const hay = norm(`${g.name} ${gameDesc(g, lang)} ${categoryLabel(lang, g.category)} ${g.source}`);
    return hay.includes(q);
  });
}

function renderVault() {
  const grid = $('vaultGrid');
  if (!grid) return;
  const list = filteredVaultGames();
  const lang = state.lang;
  grid.replaceChildren();

  const frag = document.createDocumentFragment();
  list.forEach((game, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'vault-card';
    btn.setAttribute('aria-label', `${game.name} — ${t(lang, 'playCardCta')}`);
    const bg = game.c1 || CARD_PALETTES[(idx * 3 + game.name.length) % CARD_PALETTES.length];
    btn.innerHTML = `
      <div class="vault-art">
        <div class="vault-art-top">
          <span class="vault-cat">${esc(categoryLabel(lang, game.category))}</span>
          ${game.earlyAccess ? `<span class="vault-ea">${esc(t(lang, 'badgeEarlyAccess'))}</span>` : ''}
        </div>
        <span class="vault-emoji" aria-hidden="true">${game.emoji}</span>
      </div>
      <div class="vault-body">
        <strong class="vault-title">${esc(game.name)}</strong>
        <span class="vault-desc">${esc(gameDesc(game, lang))}</span>
        <span class="vault-play"><span>${esc(t(lang, 'playCardCta'))}</span><span aria-hidden="true">↗</span></span>
      </div>
    `;
    btn.querySelector('.vault-art').style.setProperty('--accent-bg', bg);
    btn.addEventListener('click', () => openGame(game, true));
    frag.appendChild(btn);
  });
  grid.appendChild(frag);

  const countText = t(lang, list.length === 1 ? 'resultsSingle' : 'resultsPlural', { n: list.length });
  $('resultsText').textContent = `${countText} · ${t(lang, 'resultsSuffix')}`;
  $('emptyState').hidden = list.length > 0;
}

function updatePlayerLabels(game) {
  const lang = state.lang;
  const isC2 = game.source === 'colecao2';
  $('playerEyebrow').textContent = t(lang, isC2 ? 'playerEyebrowC2' : 'playerEyebrowQp');
  $('playerLoadingSub').textContent = t(lang, isC2 ? 'playerLoadingC2' : 'playerLoadingQp');
  $('playerFooterNote').textContent = t(lang, isC2 ? 'playerFooterC2' : 'playerFooterQp');
  $('playerFrame').title = `${game.name} — Projeto Primata Games`;
}

function openGame(game, pushHistory = true) {
  if (!game) return;
  const dlg = $('playerDialog');
  if (state.current?.id === game.id && dlg.open) return;

  state.current = game;
  $('playerTitle').textContent = game.name;
  $('playerIcon').textContent = game.emoji;
  $('playerNewTab').href = gameUrl(game);
  updatePlayerLabels(game);

  $('playerLoading').classList.remove('is-hidden');
  $('playerFrame').src = gameUrl(game);

  if (!dlg.open) dlg.showModal();
  document.title = `${game.name} — Projeto Primata Games`;

  if (pushHistory) {
    const url = new URL(window.location.href);
    url.searchParams.set('jogo', game.id);
    window.history.pushState({ jogo: game.id }, '', url);
  }
}

function closeGame(pushHistory = true) {
  const dlg = $('playerDialog');
  if (!dlg.open) return;
  dlg.close();
  $('playerFrame').removeAttribute('src');
  state.current = null;
  document.title = t(state.lang, 'metaTitle');

  if (pushHistory) {
    const url = new URL(window.location.href);
    url.searchParams.delete('jogo');
    window.history.pushState({ jogo: null }, '', url);
  }
}

function handlePopState() {
  const gameId = new URL(window.location.href).searchParams.get('jogo');
  const found = ALL_GAMES.find((g) => g.id === gameId);
  if (found) openGame(found, false);
  else closeGame(false);
}

function launchRandom(pool) {
  if (!pool.length) {
    toast(t(state.lang, 'toastClearSearch'));
    return;
  }
  const pick = pool[Math.floor(Math.random() * pool.length)];
  openGame(pick, true);
}

function wireEvents() {
  $('heroTotalGames').textContent = ALL_GAMES.length;
  $('vaultTotalCount').textContent = ALL_GAMES.length;
  $('navQpCount').textContent = QUICKPLAY_GAMES.length;
  $('countScopeAll').textContent = ALL_GAMES.length;
  $('countScopeQp').textContent = QUICKPLAY_GAMES.length;
  $('countScopeC2').textContent = COLECAO2_GAMES.length;
  $('year').textContent = new Date().getFullYear();

  $('scopeTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-scope]');
    if (!btn) return;
    state.scope = btn.dataset.scope;
    $('scopeTabs').querySelectorAll('button').forEach((b) => {
      const active = b === btn;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-selected', String(active));
    });
    renderVault();
  });

  $('catFilters').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    state.filter = btn.dataset.filter;
    $('catFilters').querySelectorAll('button').forEach((b) => {
      const active = b === btn;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    renderVault();
  });

  $('gameSearch').addEventListener('input', (e) => {
    state.query = e.target.value.trim();
    renderVault();
  });

  $('resetFilters').addEventListener('click', () => {
    state.query = '';
    state.scope = 'all';
    state.filter = 'todos';
    $('gameSearch').value = '';
    $('scopeTabs').querySelector('[data-scope="all"]').click();
    $('catFilters').querySelector('[data-filter="todos"]').click();
    $('gameSearch').focus();
  });

  $('randomGame').addEventListener('click', () => launchRandom(filteredVaultGames()));
  $('studioRandomBtn').addEventListener('click', () => launchRandom(ALL_GAMES));

  const drawer = $('mobileDrawer');
  const toggle = $('menuToggle');
  toggle.addEventListener('click', () => {
    const open = drawer.hidden;
    drawer.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', t(state.lang, open ? 'menuClose' : 'menuOpen'));
  });
  drawer.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      drawer.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  $('playerClose').addEventListener('click', () => closeGame(true));
  $('playerDialog').addEventListener('cancel', (e) => { e.preventDefault(); closeGame(true); });
  $('playerDialog').addEventListener('click', (e) => { if (e.target === $('playerDialog')) closeGame(true); });
  $('playerFrame').addEventListener('load', () => $('playerLoading').classList.add('is-hidden'));

  $('playerFullscreen').addEventListener('click', async () => {
    const stage = $('playerStage');
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stage.requestFullscreen();
    } catch {
      toast(t(state.lang, 'toastNoFullscreen'));
    }
  });

  $('playerCopy').addEventListener('click', async () => {
    if (!state.current) return;
    try {
      await navigator.clipboard.writeText(deepUrl(state.current));
      toast(t(state.lang, 'toastCopied'));
    } catch {
      toast(t(state.lang, 'toastCopyFail'));
    }
  });

  window.addEventListener('popstate', handlePopState);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('playerDialog').open) closeGame(true);
  });
}

wireEvents();
applyTranslations();
handlePopState();
