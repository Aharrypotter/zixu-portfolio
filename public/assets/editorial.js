(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const english = () => root.lang === 'en';
  const translate = container => container.querySelectorAll('[data-zh]').forEach(el => {
    el.innerHTML = el.dataset[english() ? 'en' : 'zh'];
  });
  const browsers = [];
  document.querySelectorAll('[data-editorial-browser]').forEach(container => {
    const rows = Array.from(container.querySelectorAll('[data-entry]'));
    const preview = container.querySelector('[data-preview-content]');
    let active;
    const select = row => {
      if (!row || row.hidden) return;
      active = row;
      rows.forEach(item => item.classList.toggle('is-active', item === row));
      preview.replaceChildren(row.querySelector('template').content.cloneNode(true));
      translate(preview);
    };
    rows.forEach(row => {
      row.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') select(row); });
      row.addEventListener('focus', () => select(row));
    });
    select(rows[0]);
    browsers.push({rows, select, refresh: () => select(active)});
  });
  let topic = 'all';
  const updateFilter = () => {
    let count = 0;
    browsers.forEach(browser => {
      browser.rows.forEach(row => { row.hidden = topic !== 'all' && row.dataset.topic !== topic; if (!row.hidden) count++; });
      browser.select(browser.rows.find(row => !row.hidden));
    });
    document.querySelectorAll('[data-writing-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.writingFilter === topic)));
    const counter = document.querySelector('[data-writing-count]');
    if (counter) counter.textContent = english() ? `${count} articles` : `${count} 篇`;
  };
  document.querySelectorAll('[data-writing-filter]').forEach(button => button.addEventListener('click', () => {
    topic = button.dataset.writingFilter;
    updateFilter();
  }));
  const legacyLanguage = document.querySelector('.career-home, #work-list, #pr-results');
  if (!legacyLanguage) {
    root.lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'zh-CN';
    const button = document.querySelector('#language');
    const apply = () => {
      translate(document);
      button.textContent = english() ? '中' : 'EN';
      button.setAttribute('aria-label', english() ? '切换为中文' : 'Switch to English');
    };
    button?.addEventListener('click', () => {
      root.lang = english() ? 'zh-CN' : 'en'; apply();
      const url = new URL(location.href);
      if (english()) url.searchParams.set('lang', 'en'); else url.searchParams.delete('lang');
      history.replaceState(null, '', url);
    });
    apply();
  }
  new MutationObserver(() => { browsers.forEach(b => b.refresh()); if(document.querySelector('[data-writing-count]')) updateFilter(); }).observe(root, {attributes:true, attributeFilter:['lang']});
  if (document.querySelector('[data-writing-count]')) updateFilter();
  const menu = document.querySelector('#site-menu');
  const toggle = document.querySelector('.menu-toggle');
  const close = document.querySelector('.menu-close');
  let oldOverflow = '';
  toggle?.addEventListener('click', () => {
    oldOverflow = document.body.style.overflow;
    menu.showModal(); document.body.style.overflow = 'hidden';
    toggle.setAttribute('aria-expanded', 'true'); close.focus();
  });
  close?.addEventListener('click', () => menu.close());
  menu?.addEventListener('close', () => {
    document.body.style.overflow = oldOverflow;
    toggle.setAttribute('aria-expanded', 'false'); toggle.focus({preventScroll:true});
  });
  menu?.addEventListener('click', event => { if (event.target.closest('a')) menu.close(); });
  const path = url => url.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
  document.querySelectorAll('.site-header nav a').forEach(a => {
    const url = new URL(a.href); if (path(url) === path(new URL(location.href)) && !url.hash) a.setAttribute('aria-current', 'page');
  });
  const curtain = document.querySelector('.page-curtain');
  const label = curtain?.querySelector('span');
  const key = 'zixu-page-entry';
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || 'null'); sessionStorage.removeItem(key);
    if (saved && Date.now() - saved.at < 5000 && saved.path === location.pathname && !reduced.matches) {
      label.textContent = saved.label;
      curtain.animate([{transform:'translateY(0)'},{transform:'translateY(-120%)'}], {duration:220,easing:'cubic-bezier(.7,0,.3,1)'});
    }
  } catch { /* Navigation works without session storage. */ }
  let navigating = false;
  document.addEventListener('click', event => {
    const a = event.target.closest('a[href]');
    if (!a || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || a.hasAttribute('download') || (a.target && a.target !== '_self')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
    if (path(url) === path(new URL(location.href)) || !(/\/$|\.html$/.test(url.pathname))) return;
    if (english()) url.searchParams.set('lang','en');
    if (reduced.matches || !curtain?.animate) { if (url.href !== a.href) { event.preventDefault(); location.assign(url.href); } return; }
    event.preventDefault(); if (navigating) return; navigating = true;
    const title = a.querySelector('h3')?.textContent || a.textContent.trim();
    label.textContent = title.slice(0,55);
    try { sessionStorage.setItem(key, JSON.stringify({at:Date.now(),path:url.pathname,label:label.textContent})); } catch {}
    let done = false;
    const go = () => { if(done)return; done = true; location.assign(url.href); };
    const animation = curtain.animate([{transform:'translateY(120%)'},{transform:'translateY(0)'}], {duration:180,easing:'cubic-bezier(.7,0,.3,1)',fill:'forwards'});
    animation.finished.then(go,go); setTimeout(go,300);
  });
  window.addEventListener('pageshow', event => { if (event.persisted) { navigating = false; curtain?.getAnimations().forEach(a => a.cancel()); } });
  root.classList.add('editorial-ready');
})();
