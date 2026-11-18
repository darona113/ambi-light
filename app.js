(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const media = window.AMBI_MEDIA;
  if (!media) return;
  const gallery = $('#gallery');
  const lightbox = $('#lightbox');
  const contact = $('#contact-dialog');
  let filtered = [...media.projects];
  let lightboxPhotos = [];
  let lightboxTitle = '';
  let currentPhoto = 0;
  let touchStartX = null;
  let toastTimer;
  $('#year').textContent = new Date().getFullYear();
  $('#hero-image').src = media.hero;
  const iconPaths = {
    'arrow-up-right': '<path d="M6 18 18 6M6 6h12v12"/>',
    'layers': '<rect x="6" y="6" width="14" height="14" rx="2"/><path d="M16 3H5a2 2 0 0 0-2 2v11"/>'
  };
  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.innerHTML = iconPaths[name];
    return svg;
  }

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('visible'), 4200);
  }
  function syncScrollLock() {
    document.body.classList.toggle('modal-open', $$('dialog[open]').length > 0);
  }
  function openDialog(dialog) {
    const playingVideo = $('#work-video');
    if (playingVideo && !playingVideo.paused) playingVideo.pause();
    dialog.showModal();
    syncScrollLock();
  }
  $$('[data-contact]').forEach(b => b.addEventListener('click', () => openDialog(contact)));
  $$('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('close', syncScrollLock);
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (dialog === lightbox || event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  $$('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('+79199905036');
      const message = 'Номер скопирован. Вставьте его в поиск контактов MAX.';
      if (contact.open) $('.dialog-note', contact).textContent = message;
      else toast(message);
      const label = button.getAttribute('aria-label');
      button.setAttribute('aria-label', 'Номер скопирован');
      setTimeout(() => label ? button.setAttribute('aria-label', label) : button.removeAttribute('aria-label'), 4000);
    } catch {
      // Clipboard can be unavailable on local file previews and older TV browsers.
      if (contact.open) $('.dialog-note', contact).textContent = 'Номер для MAX: +7 919 990-50-36';
      else toast('Номер для MAX: +7 919 990-50-36');
      const phone = $('.dialog-phone');
      if (contact.open) {
        const range = document.createRange();
        range.selectNodeContents(phone);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }));

  const menuButton = $('.menu-toggle');
  const mobileNav = $('#mobile-nav');
  function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
    mobileNav.hidden = true;
  }
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
    mobileNav.hidden = isOpen;
  });
  $$('a', mobileNav).forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  window.matchMedia('(min-width:851px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

  const solutions = [
    { image: 'assets/project-08.webp', caption: 'Линии, которые делают архитектуру выразительнее', alt: 'Готовая контурная подсветка сложной кровли загородного дома' },
    { image: 'assets/project-12.webp', caption: 'Маленькие огоньки. Большое настроение.', alt: 'Гирлянды и световая бахрома на кирпичном загородном доме' },
    { image: 'assets/project-01.webp', caption: 'Чтобы оставаться на улице чуть дольше', alt: 'Реальная работа: гирлянды над зоной отдыха с костровой чашей' }
  ];
  function selectSolution(index, focus = false) {
    const solution = solutions[index];
    $$('.solution-item').forEach((el, i) => {
      el.classList.toggle('active', i === index);
      el.setAttribute('aria-selected', String(i === index));
      el.tabIndex = i === index ? 0 : -1;
      if (i === index && focus) el.focus();
    });
    const image = $('#solution-image');
    image.src = solution.image;
    image.alt = solution.alt;
    $('#solution-caption').textContent = solution.caption;
    $('.solution-image-count').textContent = `0${index + 1} / 03`;
    $('#solution-panel').setAttribute('aria-labelledby', `solution-tab-${index}`);
  }
  $$('.solution-item').forEach((button, index) => {
    button.addEventListener('click', () => selectSolution(index));
    button.addEventListener('keydown', e => {
      let next;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (index + 1) % solutions.length;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (index + solutions.length - 1) % solutions.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = solutions.length - 1;
      if (next !== undefined) { e.preventDefault(); selectSolution(next, true); }
    });
  });
  function updateArrows() {
    $('#gallery-prev').disabled = gallery.scrollLeft < 5;
    $('#gallery-next').disabled = gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth - 5;
  }
  function renderGallery() {
    gallery.replaceChildren();
    filtered.forEach((project, index) => {
      const photo = project.photos[0];
      const button = document.createElement('button');
      button.className = 'gallery-card';
      button.setAttribute('aria-label', `Открыть подборку: ${project.title}${project.photos.length > 1 ? ', ' + project.photos.length + ' фото' : ''}`);
      const frame = document.createElement('span'); frame.className = 'gallery-image';
      const image = document.createElement('img');
      image.src = photo.src; image.alt = `${project.title}. ${photo.detail}`; image.loading = 'lazy'; image.decoding = 'async'; image.width = 1280; image.height = 1280;
      const enlarge = document.createElement('span'); enlarge.className = 'gallery-enlarge'; enlarge.append(icon('arrow-up-right')); enlarge.setAttribute('aria-hidden', 'true');
      frame.append(image, enlarge);
      if (project.photos.length > 1) {
        const badge = document.createElement('span'); badge.className = 'gallery-stack';
        badge.append(icon('layers'), document.createTextNode(`${project.photos.length} фото`));
        frame.append(badge);
      }
      const caption = document.createElement('span'); caption.className = 'gallery-caption';
      const text = document.createElement('span');
      const strong = document.createElement('strong'); strong.textContent = project.title;
      const small = document.createElement('small'); small.textContent = project.detail;
      text.append(strong, small);
      const count = document.createElement('span'); count.className = 'gallery-count'; count.textContent = String(index + 1).padStart(2, '0');
      caption.append(text, count);
      button.append(frame, caption);
      button.addEventListener('click', () => openProject(project));
      gallery.append(button);
    });
    gallery.scrollTo({ left: 0, behavior: 'instant' });
    const n = filtered.length;
    $('#gallery-status').textContent = `${n} ${n === 1 ? 'подборка' : n < 5 ? 'подборки' : 'подборок'} · ${filtered.reduce((sum, p) => sum + p.photos.length, 0)} фото`;
    requestAnimationFrame(updateArrows);
  }
  function openProject(project) {
    lightboxPhotos = project.photos;
    lightboxTitle = project.title;
    currentPhoto = 0;
    const hasCollection = lightboxPhotos.length > 1;
    lightbox.classList.toggle('has-collection', hasCollection);
    $$('.lightbox-prev,.lightbox-next').forEach(button => { button.hidden = !hasCollection; });
    const thumbs = $('#lightbox-thumbs');
    thumbs.replaceChildren(); thumbs.hidden = !hasCollection;
    if (hasCollection) lightboxPhotos.forEach((photo, index) => {
      const button = document.createElement('button');
      button.className = 'lightbox-thumb'; button.setAttribute('aria-label', `Ракурс ${index + 1}: ${photo.detail}`);
      const image = document.createElement('img'); image.src = photo.src; image.alt = ''; image.width = 68; image.height = 52;
      button.append(image); button.addEventListener('click', () => { currentPhoto = index; showPhoto(); });
      thumbs.append(button);
    });
    showPhoto(); openDialog(lightbox);
  }
  function showPhoto() {
    const photo = lightboxPhotos[currentPhoto];
    $('#lightbox-image').src = photo.src;
    $('#lightbox-image').alt = `${lightboxTitle}. ${photo.detail}`;
    $('#lightbox-caption').textContent = `${lightboxTitle} · ${photo.detail}`;
    $('#lightbox-count').textContent = `${currentPhoto + 1} / ${lightboxPhotos.length}`;
    $$('.lightbox-thumb').forEach((button, index) => {
      button.classList.toggle('active', index === currentPhoto);
      button.setAttribute('aria-current', String(index === currentPhoto));
    });
  }
  function nextPhoto(direction) { currentPhoto = (currentPhoto + direction + lightboxPhotos.length) % lightboxPhotos.length; showPhoto(); }
  $('.lightbox-prev').addEventListener('click', () => nextPhoto(-1));
  $('.lightbox-next').addEventListener('click', () => nextPhoto(1));
  lightbox.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); nextPhoto(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); nextPhoto(-1); }
  });
  lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    if (touchStartX !== null) {
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 55) nextPhoto(delta < 0 ? 1 : -1);
      touchStartX = null;
    }
  }, { passive: true });
  $$('.filter').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filtered = media.projects.filter(project => filter === 'all' || project.categories.includes(filter));
    $$('.filter').forEach(el => { el.classList.toggle('active', el === button); el.setAttribute('aria-pressed', String(el === button)); });
    renderGallery();
  }));
  function moveGallery(direction) {
    const card = $('.gallery-card');
    gallery.scrollBy({ left: direction * (card.getBoundingClientRect().width + parseFloat(getComputedStyle(gallery).gap)), behavior: window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth' });
  }
  $('#gallery-prev').addEventListener('click', () => moveGallery(-1));
  $('#gallery-next').addEventListener('click', () => moveGallery(1));
  gallery.addEventListener('scroll', updateArrows, { passive: true });
  gallery.addEventListener('keydown', e => {
    if (e.target !== gallery) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); moveGallery(e.key === 'ArrowRight' ? 1 : -1); }
  });
  window.addEventListener('resize', updateArrows, { passive: true });
  renderGallery();

  const video = $('#work-video');
  const videoPlay = $('#video-play');
  const videoPlayLabel = $('#video-play-label');
  video.src = media.video.src; video.poster = media.video.poster;
  video.controls = false; videoPlay.hidden = false;
  videoPlay.addEventListener('click', async () => {
    video.controls = true;
    videoPlay.setAttribute('aria-busy', 'true');
    videoPlayLabel.textContent = 'Загружаем видео…';
    try { await video.play(); }
    catch { videoPlayLabel.textContent = 'Попробовать ещё раз'; toast('Не удалось запустить видео. Нажмите воспроизведение ещё раз.'); }
    finally { videoPlay.removeAttribute('aria-busy'); }
  });
  video.addEventListener('play', () => { videoPlay.hidden = true; });
  video.addEventListener('pause', () => {
    videoPlayLabel.textContent = video.ended ? 'Посмотреть ещё раз' : 'Продолжить просмотр';
    videoPlay.hidden = false;
  });
  video.addEventListener('ended', () => { videoPlayLabel.textContent = 'Посмотреть ещё раз'; videoPlay.hidden = false; });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting && !video.paused) video.pause();
    }, { threshold: 0 }).observe(video);
  }

  const header = $('.header');
  const mobileBar = $('.mobile-contact');
  let framePending = false;
  function updateScroll() {
    header.classList.toggle('scrolled', window.scrollY > 30);
    const contactVisible = $('#contacts').getBoundingClientRect().top < window.innerHeight * .8;
    mobileBar.classList.toggle('visible', window.scrollY > 500 && !contactVisible && mobileNav.hidden);
    framePending = false;
  }
  window.addEventListener('scroll', () => { if (!framePending) { requestAnimationFrame(updateScroll); framePending = true; } }, { passive: true });
  updateScroll();
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
    }), { threshold: .08, rootMargin: '0px 0px 20px 0px' });
    $$('.reveal').forEach(el => observer.observe(el));
    document.documentElement.classList.add('motion-ready');
  }
})();
