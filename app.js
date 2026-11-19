(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const media = window.AMBI_MEDIA;
  if (!media) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const behavior = () => reducedMotion.matches ? 'auto' : 'smooth';
  const paths = {
    photo: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m3 17 5-5 4 4 3-3 6 5"/>',
    layers: '<rect x="6" y="6" width="14" height="14" rx="2"/><path d="M16 3H5a2 2 0 0 0-2 2v11"/>',
    zoom: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5M10 7v6M7 10h6"/>',
    whatsapp: '<path d="M20 11.5a8 8 0 0 1-11.7 7L4 20l1.5-4.3A8 8 0 1 1 20 11.5Z"/><path d="M8.2 7.8c-.9 2.3 2.7 6.1 5.2 6.2l1.1-1.6-2-1-1 .8a7 7 0 0 1-2.1-2.1l.8-1-1-1.7Z"/>',
    telegram: '<path d="m3 10 18-7-4 18-6-6-4 3v-5Z"/><path d="m7 13 10-7-6 9"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    max: '<path d="M20 11a8 8 0 0 1-8 8H4v-8a8 8 0 1 1 16 0Z"/><path d="M8 14V8l4 4 4-4v6"/>'
  };
  function icon(name) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('viewBox', '0 0 24 24'); el.setAttribute('class', 'icon');
    el.setAttribute('aria-hidden', 'true'); el.setAttribute('focusable', 'false');
    el.innerHTML = paths[name]; return el;
  }
  const contacts = media.contacts;
  const channels = [
    { title: 'WhatsApp', detail: 'Написать по номеру', url: contacts.whatsapp, icon: 'whatsapp' },
    { title: 'Telegram', detail: 'Открыть чат', url: contacts.telegram, icon: 'telegram' },
    ...(contacts.max ? [{ title: 'MAX', detail: 'Открыть чат', url: contacts.max, icon: 'max' }] : []),
    { title: 'Instagram', detail: '@ambi_msk', url: contacts.instagram, icon: 'instagram' }
  ];
  $$('[data-channel-list]').forEach(list => channels.forEach(channel => {
    const a = document.createElement('a'); a.className = 'channel-link'; a.href = channel.url;
    a.target = '_blank'; a.rel = 'noopener noreferrer'; a.setAttribute('aria-label', `${channel.title}: ${channel.detail}`);
    const mark = document.createElement('span'); mark.className = 'channel-icon'; mark.append(icon(channel.icon));
    const text = document.createElement('span'); const title = document.createElement('strong'); title.textContent = channel.title;
    const detail = document.createElement('small'); detail.textContent = channel.detail; text.append(title, detail); a.append(mark, text); list.append(a);
  }));
  if (contacts.max) $$('.max-contact').forEach(el => { el.hidden = true; });
  $('#year').textContent = new Date().getFullYear();
  $('#hero-image').src = media.hero;
  let toastTimer;
  function toast(message) {
    const el = $('#toast'); el.textContent = message; el.classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 4500);
  }
  const contact = $('#contact-dialog');
  const lightbox = $('#lightbox');
  function openDialog(dialog) {
    const video = $('#work-video'); if (video && !video.paused) video.pause();
    closeMenu(false); dialog.showModal(); document.body.classList.add('modal-open');
  }
  $$('[data-contact]').forEach(el => el.addEventListener('click', () => openDialog(contact)));
  $$('[data-close]').forEach(el => el.addEventListener('click', () => el.closest('dialog').close()));
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => document.body.classList.toggle('modal-open', !!$('dialog[open]')));
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (dialog === lightbox || event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    });
  });
  const menuButton = $('.menu-toggle'); const mobileNav = $('#mobile-nav');
  function closeMenu(restore = false) {
    const wasOpen = !mobileNav.hidden;
    menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Открыть меню');
    mobileNav.hidden = true; $('.header').classList.remove('menu-open');
    if (restore && wasOpen) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    if (!mobileNav.hidden) return closeMenu(true);
    mobileNav.hidden = false; menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Закрыть меню'); $('.header').classList.add('menu-open');
    $('a', mobileNav).focus();
  });
  document.addEventListener('keydown', event => {
    if (mobileNav.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); }
    if (event.key === 'Tab') {
      const focusables = [menuButton, ...$$('a', mobileNav)];
      const index = focusables.indexOf(document.activeElement);
      if (event.shiftKey && index <= 0) { event.preventDefault(); focusables.at(-1).focus(); }
      else if (!event.shiftKey && (index === focusables.length - 1 || index === -1)) { event.preventDefault(); focusables[0].focus(); }
    }
  });
  const desktopQuery = window.matchMedia('(min-width:851px)');
  desktopQuery.addEventListener('change', event => { if (event.matches) closeMenu(); });
  $$('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const target = document.getElementById(link.hash.slice(1)); if (!target) return;
    const fromMenu = mobileNav.contains(link);
    event.preventDefault(); closeMenu(); history.pushState(null, '', link.hash);
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: behavior(), block: 'start' });
      if (fromMenu) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
    });
  }));

  // Service examples use the browser's native horizontal scrolling on touch screens.
  const solutionTrack = $('#solution-track'); let currentSolution = 0;
  media.solutions.forEach((solution, index) => {
    const slide = document.createElement('figure'); slide.className = 'solution-slide';
    const image = document.createElement('img'); image.src = solution.image; image.alt = solution.alt;
    image.loading = 'lazy'; image.width = 1280; image.height = 1280;
    const caption = document.createElement('figcaption'); caption.textContent = solution.caption;
    slide.append(image, caption); solutionTrack.append(slide);
    const button = document.createElement('button'); button.className = 'solution-item';
    button.setAttribute('aria-label', `Показать пример: ${solution.title}`);
    const content = document.createElement('span'); const title = document.createElement('strong'); title.textContent = solution.title;
    const description = document.createElement('span'); description.className = 'solution-description'; description.textContent = solution.description;
    const action = document.createElement('span'); action.className = 'solution-action'; action.append(icon('photo'), document.createTextNode('Показать пример'));
    content.append(title, description, action); button.append(content); $('#solution-list').append(button);
    button.addEventListener('click', () => {
      goSolution(index);
      if (matchMedia('(max-width:600px)').matches) solutionTrack.scrollIntoView({ behavior: behavior(), block: 'center' });
    });
    const dot = document.createElement('button'); dot.className = 'slider-dot'; dot.setAttribute('aria-label', solution.title);
    dot.addEventListener('click', () => goSolution(index)); $('#solution-dots').append(dot);
  });
  function syncSolution(index) {
    currentSolution = Math.max(0, Math.min(index, media.solutions.length - 1));
    $$('.solution-item').forEach((el, i) => { el.classList.toggle('active', i === currentSolution); el.setAttribute('aria-pressed', String(i === currentSolution)); });
    $$('#solution-dots button').forEach((el, i) => { el.classList.toggle('active', i === currentSolution); el.setAttribute('aria-current', String(i === currentSolution)); });
    $('#solution-prev').disabled = currentSolution === 0; $('#solution-next').disabled = currentSolution === media.solutions.length - 1;
  }
  function goSolution(index, smooth = true) {
    index = Math.max(0, Math.min(index, media.solutions.length - 1)); syncSolution(index);
    solutionTrack.scrollTo({ left: solutionTrack.clientWidth * index, behavior: smooth ? behavior() : 'auto' });
  }
  $('#solution-prev').textContent = 'Назад'; $('#solution-next').textContent = 'Дальше';
  $('#solution-prev').addEventListener('click', () => goSolution(currentSolution - 1));
  $('#solution-next').addEventListener('click', () => goSolution(currentSolution + 1));
  solutionTrack.addEventListener('scroll', () => { if (solutionTrack.clientWidth) syncSolution(Math.round(solutionTrack.scrollLeft / solutionTrack.clientWidth)); }, { passive: true });
  solutionTrack.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); goSolution(currentSolution + (event.key === 'ArrowRight' ? 1 : -1)); }
  });
  syncSolution(0);

  const gallery = $('#gallery'); let filtered = [...media.projects];
  let galleryGesture = null; let galleryMoved = false;
  gallery.addEventListener('touchstart', e => { galleryGesture = [e.touches[0].clientX, e.touches[0].clientY]; galleryMoved = false; }, { passive: true });
  gallery.addEventListener('touchmove', e => { if (galleryGesture && Math.abs(e.touches[0].clientX - galleryGesture[0]) > 10) galleryMoved = true; }, { passive: true });
  gallery.addEventListener('click', e => { if (galleryMoved) { e.preventDefault(); e.stopImmediatePropagation(); galleryMoved = false; } }, true);
  function updateGalleryArrows() {
    $('#gallery-prev').disabled = gallery.scrollLeft < 5;
    $('#gallery-next').disabled = gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth - 5;
  }
  function renderGallery() {
    gallery.replaceChildren();
    filtered.forEach(project => {
      const photo = project.photos[0]; const button = document.createElement('button'); button.className = 'gallery-card';
      button.setAttribute('aria-label', `Открыть проект: ${project.title}`);
      const frame = document.createElement('span'); frame.className = 'gallery-image';
      const image = document.createElement('img'); image.src = photo.src; image.alt = `${project.title}. ${photo.detail}`;
      image.loading = 'lazy'; image.decoding = 'async'; image.width = 1280; image.height = 1280; image.draggable = false;
      const enlarge = document.createElement('span'); enlarge.className = 'gallery-enlarge'; enlarge.append(icon('zoom'));
      const badge = document.createElement('span'); badge.className = 'gallery-stack'; badge.append(icon('layers'), document.createTextNode(`${project.photos.length} фото`));
      frame.append(image, badge, enlarge);
      const caption = document.createElement('span'); caption.className = 'gallery-caption';
      const text = document.createElement('span'); const title = document.createElement('strong'); title.textContent = project.title;
      const detail = document.createElement('small'); detail.textContent = project.detail; text.append(title, detail); caption.append(text);
      button.append(frame, caption); button.addEventListener('click', () => openProject(project)); gallery.append(button);
    });
    gallery.scrollTo({ left: 0, behavior: 'auto' });
    $('#project-count').textContent = media.projects.length;
    $('#gallery-status').textContent = `${filtered.length} ${filtered.length === 1 ? 'проект' : filtered.length < 5 ? 'проекта' : 'проектов'} · ${filtered.reduce((n,p) => n + p.photos.length, 0)} фото`;
    requestAnimationFrame(updateGalleryArrows);
  }
  function moveGallery(direction) {
    const card = $('.gallery-card'); if (!card) return;
    gallery.scrollBy({ left: direction * (card.getBoundingClientRect().width + parseFloat(getComputedStyle(gallery).gap)), behavior: behavior() });
  }
  $('#gallery-prev').textContent = 'Назад'; $('#gallery-next').textContent = 'Дальше';
  $('#gallery-prev').addEventListener('click', () => moveGallery(-1)); $('#gallery-next').addEventListener('click', () => moveGallery(1));
  gallery.addEventListener('scroll', updateGalleryArrows, { passive: true });
  gallery.addEventListener('keydown', event => { if (event.target === gallery && ['ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); moveGallery(event.key === 'ArrowRight' ? 1 : -1); } });
  $$('.filter').forEach(button => button.addEventListener('click', () => {
    filtered = media.projects.filter(project => button.dataset.filter === 'all' || project.categories.includes(button.dataset.filter));
    $$('.filter').forEach(el => { el.classList.toggle('active', el === button); el.setAttribute('aria-pressed', String(el === button)); }); renderGallery();
  }));
  renderGallery();
  $$('[data-project]').forEach(button => button.addEventListener('click', () => {
    const project = media.projects.find(p => p.id === button.dataset.project); if (project) openProject(project);
  }));

  const lightboxTrack = $('#lightbox-track'); let photos = []; let photoIndex = 0;
  function syncPhoto(index) {
    photoIndex = Math.max(0, Math.min(index, photos.length - 1));
    $('#lightbox-count').textContent = `${photoIndex + 1} / ${photos.length}`;
    $('#lightbox-caption').textContent = photos[photoIndex].detail;
    $$('.lightbox-thumb').forEach((el, i) => { el.classList.toggle('active', i === photoIndex); el.setAttribute('aria-current', String(i === photoIndex)); });
    $('.lightbox-prev').disabled = photoIndex === 0; $('.lightbox-next').disabled = photoIndex === photos.length - 1;
  }
  function goPhoto(index, smooth = true) {
    index = Math.max(0, Math.min(index, photos.length - 1)); syncPhoto(index);
    lightboxTrack.scrollTo({ left: lightboxTrack.clientWidth * index, behavior: smooth ? behavior() : 'auto' });
  }
  function openProject(project) {
    photos = project.photos; photoIndex = 0; $('#lightbox-title').textContent = project.title;
    lightboxTrack.replaceChildren(); $('#lightbox-thumbs').replaceChildren();
    photos.forEach((photo, index) => {
      const slide = document.createElement('div'); slide.className = 'lightbox-slide'; const image = document.createElement('img');
      image.src = photo.src; image.alt = `${project.title}. ${photo.detail}`; image.draggable = false; slide.append(image); lightboxTrack.append(slide);
      const thumb = document.createElement('button'); thumb.className = 'lightbox-thumb'; thumb.setAttribute('aria-label', `Ракурс ${index + 1}: ${photo.detail}`);
      const thumbImage = document.createElement('img'); thumbImage.src = photo.src; thumbImage.alt = ''; thumbImage.width = 68; thumbImage.height = 52;
      thumb.append(thumbImage); thumb.addEventListener('click', () => goPhoto(index)); $('#lightbox-thumbs').append(thumb);
    });
    const multiple = photos.length > 1;
    lightbox.classList.toggle('has-collection', multiple); $('.lightbox-controls').hidden = !multiple;
    openDialog(lightbox); requestAnimationFrame(() => goPhoto(0, false));
  }
  $('.lightbox-prev').textContent = 'Назад'; $('.lightbox-next').textContent = 'Дальше';
  $('.lightbox-prev').addEventListener('click', () => goPhoto(photoIndex - 1)); $('.lightbox-next').addEventListener('click', () => goPhoto(photoIndex + 1));
  lightboxTrack.addEventListener('scroll', () => { if (lightboxTrack.clientWidth && photos.length) syncPhoto(Math.round(lightboxTrack.scrollLeft / lightboxTrack.clientWidth)); }, { passive: true });
  lightbox.addEventListener('keydown', event => { if (['ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); goPhoto(photoIndex + (event.key === 'ArrowRight' ? 1 : -1)); } });
  if ('ResizeObserver' in window) new ResizeObserver(() => {
    goSolution(currentSolution, false); updateGalleryArrows(); if (lightbox.open) goPhoto(photoIndex, false);
  }).observe(document.documentElement);

  const video = $('#work-video'); const videoPlay = $('#video-play'); const videoPlayLabel = $('#video-play-label');
  video.src = media.video.src; video.poster = media.video.poster; video.controls = false; videoPlay.hidden = false;
  videoPlay.addEventListener('click', async () => {
    video.controls = true; videoPlay.setAttribute('aria-busy', 'true'); videoPlayLabel.textContent = 'Загружаем видео…';
    try { await video.play(); } catch { videoPlayLabel.textContent = 'Попробовать ещё раз'; toast('Не удалось запустить видео. Попробуйте ещё раз.'); }
    finally { videoPlay.removeAttribute('aria-busy'); }
  });
  video.addEventListener('play', () => { videoPlay.hidden = true; });
  video.addEventListener('pause', () => { videoPlayLabel.textContent = video.ended ? 'Посмотреть ещё раз' : 'Продолжить просмотр'; videoPlay.hidden = false; });
  video.addEventListener('ended', () => { videoPlayLabel.textContent = 'Посмотреть ещё раз'; videoPlay.hidden = false; });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { if (!entries[0].isIntersecting && !video.paused) video.pause(); }).observe(video);
  const header = $('.header'); const mobileBar = $('.mobile-contact'); let scheduled = false;
  function updateScroll() {
    header.classList.toggle('scrolled', scrollY > 25);
    mobileBar.classList.toggle('visible', scrollY > 450 && $('#contacts').getBoundingClientRect().top > innerHeight * .8 && mobileNav.hidden && !$('dialog[open]'));
    scheduled = false;
  }
  addEventListener('scroll', () => { if (!scheduled) { requestAnimationFrame(updateScroll); scheduled = true; } }, { passive: true }); updateScroll();
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } }), { threshold: .05 });
    $$('.reveal').forEach(el => observer.observe(el)); document.documentElement.classList.add('motion-ready');
  }
})();
