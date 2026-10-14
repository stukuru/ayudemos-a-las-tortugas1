const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const names = { inicio: 'Inicio', problema: 'Conociendo el problema', video: 'Vídeo', juego: 'Juego', reflexion: '¿Qué podemos hacer?' };
const frame = $('#frame');
const box = $('#gamebox');
const GAME = 'juego/index.html';

function setFull(on) {
  box.classList.toggle('full', on);
  document.body.classList.toggle('full', on);
  if (on) {
    try {
      const p = box.requestFullscreen && box.requestFullscreen();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  } else if (document.fullscreenElement) {
    try { document.exitFullscreen(); } catch (e) {}
  }
}

function show(id, first) {
  if (!names[id]) id = 'inicio';
  if (box.classList.contains('full')) setFull(false);
  $$('.panel').forEach(p => p.classList.toggle('on', p.id === id));
  $$('[role=tab]').forEach(t => {
    const on = t.dataset.tab === id;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
  });
  $('#band').textContent = names[id];
  if (id === 'juego' && frame.dataset.on !== '1') {
    frame.src = GAME;
    frame.dataset.on = '1';
  } else if (id !== 'juego' && frame.dataset.on === '1') {
    frame.src = 'about:blank';
    frame.dataset.on = '0';
  }
  if (!first && location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
  window.scrollTo({ top: 0, behavior: first ? 'auto' : 'smooth' });
}

$$('[role=tab]').forEach(t => t.addEventListener('click', () => show(t.dataset.tab)));
$$('[data-go]').forEach(b => b.addEventListener('click', () => show(b.dataset.go)));
$$('video').forEach(m => {
  const s = $('source', m);
  if (s) s.addEventListener('error', () => m.closest('.media').classList.add('missing'));
});
$('#full').addEventListener('click', () => setFull(true));
$('#back').addEventListener('click', () => setFull(false));
$('#reload').addEventListener('click', () => {
  frame.src = 'about:blank';
  setTimeout(() => { frame.src = GAME; }, 60);
});
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && box.classList.contains('full')) setFull(false);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && box.classList.contains('full')) setFull(false);
});
window.addEventListener('hashchange', () => show(location.hash.slice(1)));
show(location.hash.slice(1), true);
