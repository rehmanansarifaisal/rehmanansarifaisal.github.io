(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Current nav state, accessible expandable mobile navigation and outside-click dismissal.
  const page = body.dataset.page || '';
  $$('.nav-links a[data-page]').forEach(link => {
    if (link.dataset.page === page) {
      link.classList.add('active');
      if (!link.hasAttribute('aria-current')) link.setAttribute('aria-current', 'page');
    }
  });
  const toggle = $('.nav-toggle');
  const nav = $('.nav-links');
  const closeNav = () => {
    nav?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Open navigation');
    nav?.querySelectorAll('.nav-dropdown[open]').forEach(d => d.removeAttribute('open'));
  };
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    nav?.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  $$('.nav-links a').forEach(link => link.addEventListener('click', closeNav));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeNav(); toggle?.focus(); } });
  document.addEventListener('click', event => {
    if (nav?.classList.contains('open') && !nav.contains(event.target) && !toggle?.contains(event.target)) closeNav();
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 1100) closeNav(); }, { passive: true });

  // Header elevation after the user scrolls away from the top.
  const header = $('[data-header]');
  const setHeaderElevation = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  setHeaderElevation();
  window.addEventListener('scroll', setHeaderElevation, { passive: true });

  // Smooth, restrained reveal-in animations. Content remains visible when JS or IO is unavailable.
  if (!reducedMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-motion');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    $$('.reveal:not(.is-visible)').forEach(el => revealObserver.observe(el));
  }

  // Robust image fallback: retain a real thumbnail from the same YouTube video if max resolution is unavailable.
  $$('.video-thumbnail[data-video-id]').forEach(img => {
    img.addEventListener('error', () => {
      const id = img.dataset.videoId;
      if (!id || img.dataset.fallbackUsed === 'true') return;
      img.dataset.fallbackUsed = 'true';
      img.src = `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
    }, { once: false });
  });

  // Light pointer tilt for wide-screen cards only; never hijack touch scrolling.
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (finePointer && !reducedMotion) {
    $$('[data-tilt]').forEach(el => {
      el.addEventListener('pointermove', event => {
        const r = el.getBoundingClientRect();
        const x = (event.clientX - r.left) / r.width - .5;
        const y = (event.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(1100px) rotateY(${x * 3}deg) rotateX(${-y * 2}deg)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // Poetry category filters.
  const poemWrap = $('#poem-list');
  if (poemWrap) {
    $$('.filter-btn').forEach(button => button.addEventListener('click', () => {
      $$('.filter-btn').forEach(item => item.classList.toggle('active', item === button));
      const category = button.dataset.filter;
      $$('.poem-card', poemWrap).forEach(card => { card.hidden = !(category === 'all' || card.dataset.category === category); });
    }));
  }

  // Quote search.
  const quoteSearch = $('#quote-search');
  if (quoteSearch) quoteSearch.addEventListener('input', () => {
    const query = quoteSearch.value.trim().toLocaleLowerCase();
    $$('.quote-card').forEach(card => { card.hidden = !card.innerText.toLocaleLowerCase().includes(query); });
  });

  // Video archive search and category filtering.
  const videoSearch = $('#video-search');
  const videoFilter = $('#video-filter');
  const videoGrid = $('#video-grid');
  const videoCount = $('#video-count');
  const videoEmpty = $('#video-empty');
  if (videoGrid && videoSearch && videoFilter) {
    const cards = $$('.video-card', videoGrid);
    const filterVideos = () => {
      const query = videoSearch.value.trim().toLocaleLowerCase();
      const category = videoFilter.value;
      let shown = 0;
      cards.forEach(card => {
        const searchableText = (card.innerText + ' ' + ($('.video-full-description', card)?.textContent || '')).toLocaleLowerCase();
        const visible = searchableText.includes(query) && (category === 'all' || card.dataset.category === category);
        card.hidden = !visible;
        if (visible) shown += 1;
      });
      if (videoCount) videoCount.textContent = `Showing ${shown} of ${cards.length} videos`;
      if (videoEmpty) videoEmpty.hidden = shown > 0;
    };
    videoSearch.addEventListener('input', filterVideos);
    videoFilter.addEventListener('change', filterVideos);
  }

  // Article renderer for existing editorial templates.
  const articleRoot = $('#article-root');
  if (articleRoot) {
    const data = {
      nafs: {title:'The Journey From Nafs To Heart', kicker:'Inner work', intro:'A reflective map of the movement from reactive habits toward a heart shaped by remembrance, sincerity and conscious choice.', cover:'../assets/images/manuscript.svg', sections:[['The first turning','Classical spiritual language often begins with awareness: noticing appetite, anger, vanity, fear and attachment without pretending they are absent.'],['From reaction to remembrance','The work is less about becoming emotionless and more about creating a pause in which remembrance can guide the response.'],['A gentler discipline','Muraqabah and muhasabah can become recurring practices of attention, gratitude and accountability, approached with humility rather than self-condemnation.']]},
      love: {title:'The Meaning Of Divine Love', kicker:'Love & devotion', intro:'Across Sufi literature, love is described as a force that loosens the grip of ego and turns the heart toward mercy, beauty and devotion.', cover:'../assets/images/moonwater.svg', sections:[['Love as orientation','The language of ishq often points to a deep orientation of the whole self—not a possession, but a direction toward the Divine.'],['Love and character','A recurring theme is that devotion should appear in conduct: patience, generosity, truthfulness and compassion are signs of an inward path becoming outwardly visible.'],['Beyond sentiment','The Sufi tradition contains poetry of longing, but also disciplines that give longing structure: prayer, remembrance, service, reflection and learning.']]},
      zikr: {title:'The Beauty Of Zikr', kicker:'Remembrance', intro:'Dhikr literally centers on remembrance. In Sufi traditions it may take vocal, silent, individual or communal forms, depending on the lineage and setting.', cover:'../assets/images/arch.svg', sections:[['A returning practice','The point is repetition that keeps remembrance near—not performance for its own sake.'],['Sound and silence','Some paths favor audible recitation, while others emphasize silent remembrance. The shared idea is attentive presence.'],['The heart as witness','Spiritual writers often connect sustained remembrance with a more watchful heart: one that notices intention, speech and action more carefully.']]},
      peace: {title:'Understanding Inner Peace', kicker:'Reflection', intro:'Inner peace is not presented as a permanent mood. It can be approached as a way of meeting changing circumstances with remembrance, patience and proportion.', cover:'../assets/images/hero-mandala.svg', sections:[['Stillness','A quiet interval can reveal the difference between what the mind is producing and what the heart is actually being asked to attend to.'],['Practice over performance','Small consistent practices—quiet prayer, gratitude, reflection, service—can give spiritual life a rhythm.'],['Compassion for the self','Gentle accountability leaves room for repair. The goal is not perfection in one moment, but a repeated return.']]},
      masters: {title:'The Wisdom Of Sufi Masters', kicker:'Teachers & voices', intro:'A reading path through figures whose writings and lives shaped different Sufi lineages and intellectual worlds.', cover:'../assets/images/manuscript.svg', sections:[['Many vocabularies','Rumi, Ibn Arabi, Rabia, Abdul Qadir Gilani, Bulleh Shah and Moinuddin Chishti speak from different cultures and centuries.'],['A shared emphasis','Their teachings vary, yet recurring themes include remembrance, humility, love, ethical transformation and the purification of intention.'],['Read with context','Poetry and aphorisms are most useful when read alongside biography, historical context and the wider Islamic intellectual tradition.']]}
    };
    const key = new URLSearchParams(location.search).get('story') || 'nafs';
    const d = data[key] || data.nafs;
    articleRoot.innerHTML = `<div class="crumbs"><a href="blogs.html">Journal</a><span aria-hidden="true">/</span>Article</div><span class="eyebrow">${d.kicker}</span><h1>${d.title}</h1><p class="lead">${d.intro}</p><div class="article-cover-large"><img src="${d.cover}" alt="Illustration for ${d.title}"></div>${d.sections.map(section=>`<section><h2>${section[0]}</h2><p>${section[1]}</p></section>`).join('')}<blockquote>“The heart is not rushed into clarity; it is trained to return.”</blockquote><div class="callout"><strong class="serif" style="font-size:1.35rem">Continue exploring</strong><p>Explore poetry, practices or the latest Qalb e Mast videos.</p><a class="btn btn-primary" href="poetry.html">Open poetry library</a></div>`;
  }

  // Owner-confirmed WhatsApp contact form.
  const contactForm = $('[data-contact-form]');
  if (contactForm) {
    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      const status = $('#contact-status');
      const digits = '923232926011';
      const formData = new FormData(contactForm);
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const topic = String(formData.get('topic') || 'General enquiry').trim();
      const message = String(formData.get('message') || '').trim();
      if (!name || !email || !message) { if (status) status.textContent = 'Please complete your name, email and message.'; return; }
      const text = `Qalb e Mast website enquiry\nName: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`;
      const url = 'https://wa.me/' + digits + '?text=' + encodeURIComponent(text);
      window.open(url, '_blank', 'noopener,noreferrer');
      if (status) status.textContent = 'WhatsApp opened. Review and send your message there.';
    });
  }

  // Quiet fixed social bubbles on screens where they do not intrude on content.
  const socialDock = document.createElement('nav');
  socialDock.className = 'social-dock';
  socialDock.setAttribute('aria-label', 'Official Qalb e Mast social profiles');
  const socials = [
    {label:'YouTube',url:'https://www.youtube.com/@Qalb-e-Mast',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z"/></svg>'},
    {label:'Facebook',url:'https://www.facebook.com/qalbemast/',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.4 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.6 1.6-1.6h1.7V3.1c-.3 0-1.4-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.7v1.9h-3v3.2h3V21h3.9Z"/></svg>'},
    {label:'Instagram',url:'https://www.instagram.com/qalb_e_mast',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm0 2A3.2 3.2 0 0 0 4 7.2v9.6A3.2 3.2 0 0 0 7.2 20h9.6a3.2 3.2 0 0 0 3.2-3.2V7.2A3.2 3.2 0 0 0 16.8 4H7.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.3-3.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z"/></svg>'},
    {label:'TikTok',url:'https://www.tiktok.com/@qalb_e_mast',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.6 6.7a6.6 6.6 0 0 1-4.1-4.1V2h-4.1v13.7a2.7 2.7 0 1 1-2.7-2.7c.4 0 .8.1 1.1.2V9a7.4 7.4 0 1 0 5.7 7.2V9.3a10.5 10.5 0 0 0 5.1 1.3V6.5c-.4.1-.7.2-1 .2Z"/></svg>'}
  ];
  socials.forEach(item => {
    const a = document.createElement('a'); a.className = 'social-bubble'; a.href = item.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', 'Follow Qalb e Mast on ' + item.label); a.title = item.label;
    a.innerHTML = item.svg + '<span class="social-dock-label">' + item.label + '</span>'; socialDock.appendChild(a);
  });
  document.body.appendChild(socialDock);
})();
