(() => {
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  const page = document.body.dataset.page || '';
  $$('.nav-links a').forEach(a => {
    if (a.dataset.page === page) a.classList.add('active');
  });

  const toggle = $('.nav-toggle');
  const nav = $('.nav-links');
  toggle?.addEventListener('click', () => nav?.classList.toggle('open'));
  $$('.nav-links a').forEach(a => a.addEventListener('click', () => nav?.classList.remove('open')));

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && window.gsap) {
    gsap.from('.brand', {y:-18, opacity:0, duration:.75, ease:'power3.out'});
    gsap.from('.hero-copy > *', {y:24, opacity:0, duration:.8, stagger:.08, delay:.12, ease:'power3.out'});
  }

  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (window.gsap) gsap.to(entry.target,{y:0,opacity:1,duration:.8,ease:'power3.out'});
        else { entry.target.style.opacity = 1; entry.target.style.transform = 'none'; }
        io.unobserve(entry.target);
      }
    }), {threshold:.12});
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => {el.style.opacity=1;el.style.transform='none'});

  $$('.card, .mast, .video-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      if (reduce) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      card.style.transform = `translateY(-7px) rotateX(${(-y*4).toFixed(2)}deg) rotateY(${(x*5).toFixed(2)}deg)`;
    });
    card.addEventListener('pointerleave', () => card.style.transform='');
  });

  // Page-to-page veil transition; gracefully degrades without GSAP.
  const veil = $('.page-transition');
  if (veil && !reduce) {
    document.addEventListener('click', e => {
      const link = e.target.closest('a');
      if (!link || !link.href || link.target === '_blank' || link.origin !== location.origin) return;
      const u = new URL(link.href);
      if (u.pathname === location.pathname && !u.search) return;
      e.preventDefault();
      if (window.gsap) gsap.to(veil,{y:'0%',duration:.55,ease:'power2.in',onComplete:()=>location.href=link.href});
      else location.href=link.href;
    });
  }

  // Home-only Three.js particle field.
  const canvas = $('#three-bg');
  if (canvas && window.THREE && !reduce) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, .1, 100);
    camera.position.z = 7;
    const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6)); renderer.setSize(innerWidth,innerHeight);
    const count = Math.min(1500, Math.floor(innerWidth*1.4));
    const geo = new THREE.BufferGeometry(); const pts = new Float32Array(count*3);
    for(let i=0;i<count;i++){pts[i*3]=(Math.random()-.5)*10;pts[i*3+1]=(Math.random()-.5)*7;pts[i*3+2]=(Math.random()-.5)*8;}
    geo.setAttribute('position',new THREE.BufferAttribute(pts,3));
    const mat = new THREE.PointsMaterial({color:0xc8a461,size:.018,transparent:true,opacity:.7});
    scene.add(new THREE.Points(geo,mat));
    const tick=()=>{scene.rotation.y += .00022; scene.rotation.x += .00007; renderer.render(scene,camera); requestAnimationFrame(tick)}; tick();
    addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
  }

  // Poetry filters.
  const poemWrap = $('#poem-list');
  if (poemWrap) {
    $$('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
      const f = btn.dataset.filter;
      $$('.poem-card', poemWrap).forEach(card => card.style.display = (f==='all'||card.dataset.category===f)?'block':'none');
    }));
  }

  // Quote search/filter.
  const qSearch = $('#quote-search');
  if (qSearch) qSearch.addEventListener('input', () => {
    const q = qSearch.value.toLowerCase();
    $$('.quote-card').forEach(c => c.style.display = c.innerText.toLowerCase().includes(q) ? '' : 'none');
  });

  // Article renderer.
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
    articleRoot.innerHTML = `<div class="crumbs"><a href="blogs.html">Blogs</a> / Article</div><div class="accent-line"></div><span class="eyebrow">${d.kicker}</span><h1>${d.title}</h1><p class="lead">${d.intro}</p><div class="article-cover-large"><img src="${d.cover}" alt="Decorative artwork for ${d.title}"></div>${d.sections.map(s=>`<section><h2>${s[0]}</h2><p>${s[1]}</p></section>`).join('')}<blockquote>"The heart is not rushed into clarity; it is trained to return."</blockquote><div class="callout"><strong class="serif" style="font-size:1.5rem">Continue the library</strong><p>Move from this article into poetry, practices or the latest Qalb e Mast videos.</p><a class="btn" href="poetry.html">Open Poetry Library</a></div>`;
  }


  // Official social profiles: fixed, accessible bubble icons across the site.
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
    const a = document.createElement('a');
    a.className = 'social-bubble'; a.href = item.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', 'Follow Qalb e Mast on ' + item.label); a.title = item.label;
    a.innerHTML = item.svg + '<span class="social-dock-label">' + item.label + '</span>';
    socialDock.appendChild(a);
  });
  document.body.appendChild(socialDock);

  // Official WhatsApp contact supplied by the owner in international format (digits only).
  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      const status = document.getElementById('contact-status');
      const suppliedDigits = '923232926011';
      const data = new FormData(contactForm);
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const topic = String(data.get('topic') || 'General enquiry').trim();
      const message = String(data.get('message') || '').trim();
      if (!name || !email || !message) {
        if (status) status.textContent = 'Please complete your name, email and message.';
        return;
      }
      if (!/^923\d{9}$/.test(suppliedDigits)) {
        if (status) status.innerHTML = 'WhatsApp could not be opened with the supplied contact number. Please email <a href="mailto:qalbemast@gmail.com">qalbemast@gmail.com</a> for now.';
        return;
      }
      const text = `Qalb e Mast website enquiry\nName: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`;
      window.open('https://wa.me/' + suppliedDigits + '?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
      if (status) status.textContent = 'WhatsApp opened in a new tab. Review and send your message there.';
    });
  }

})();
