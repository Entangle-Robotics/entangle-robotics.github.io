'use strict';

const { demos, dataset } = window.ENTANGLE_MEDIA;
const byId = (id) => document.getElementById(id);
let playingGroup = null;

function node(tag, className = '', label = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (label) element.textContent = label;
  return element;
}

function button(label, className = '') {
  const control = node('button', className, label);
  control.type = 'button';
  return control;
}

function clock(seconds) {
  const whole = Math.floor(Math.max(0, seconds));
  return Math.floor(whole / 60) + ':' + String(whole % 60).padStart(2, '0');
}

function clearPlayer(container) {
  container.stopPlayback?.();
  container.replaceChildren();
  delete container.stopPlayback;
}

function mountPlayer(container, comparison) {
  clearPlayer(container);
  const layout = node('div', 'streams');
  layout.style.setProperty('--streams', comparison.streams.length);
  const media = comparison.streams.map((stream) => {
    const panel = node('figure', 'stream');
    const caption = node('figcaption');
    caption.append(stream.label === 'Generated context' ? node('strong', '', stream.label) : stream.label);
    const visual = node('video');
    visual.preload = 'none';
    visual.defaultMuted = true;
    visual.muted = true;
    visual.playsInline = true;
    visual.poster = stream.poster;
    visual.src = stream.video;
    visual.setAttribute('aria-label', stream.label);
    panel.append(caption, visual);
    layout.append(panel);
    return visual;
  });
  container.append(layout);

  const durations = comparison.streams.map((stream) => stream.duration ?? comparison.duration);
  const leader = media[durations.indexOf(Math.max(...durations))];
  const controls = node('div', 'transport');
  const startLabel = media.length === 2 ? 'Play both' : 'Play all';
  const play = button(startLabel, 'play');
  const slider = node('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '1000';
  slider.value = '0';
  slider.setAttribute('aria-label', 'Shared playback position');
  const timestamp = node('span', 'clock');
  const speed = node('select');
  speed.setAttribute('aria-label', 'Playback speed');
  [0.5, 1, 1.5, 2].forEach((value) => {
    const option = node('option', '', value + '×');
    option.value = value;
    option.selected = value === 1;
    speed.append(option);
  });
  const status = node('p', 'player-status');
  status.setAttribute('role', 'status');
  controls.append(play, slider, timestamp, speed);
  container.append(controls, status);

  let position = 0;
  let playing = false;
  let pendingStart = false;
  let requestId = 0;
  const duration = (video) => Number.isFinite(video.duration) && video.duration > 0
    ? video.duration : durations[media.indexOf(video)];

  function updateClock() {
    slider.value = Math.round(1000 * position / duration(leader));
    timestamp.textContent = clock(position) + ' / ' + clock(duration(leader));
    slider.setAttribute('aria-valuetext', timestamp.textContent);
  }

  function seek(video) {
    const target = Math.min(position, duration(video));
    if (video.readyState >= 1 && Math.abs(video.currentTime - target) > 0.02) {
      video.currentTime = target;
    }
  }

  function pause() {
    requestId++;
    playing = false;
    pendingStart = false;
    media.forEach((video) => video.pause());
    play.textContent = startLabel;
    if (playingGroup === pause) playingGroup = null;
  }

  async function startWhenReady() {
    if (!playing || !pendingStart) return;
    const inProgress = media.filter((video) => position < duration(video) - 0.02);
    if (inProgress.some((video) => video.readyState < 3 || video.seeking)) return;
    pendingStart = false;
    const id = ++requestId;
    const results = await Promise.allSettled(inProgress.map((video) => video.play()));
    if (id === requestId && results.some((result) => result.status === 'rejected')) {
      pause();
      status.textContent = 'Playback could not start. Try Play again.';
    }
  }

  function startTogether() {
    requestId++;
    pendingStart = true;
    media.forEach((video) => {
      video.pause();
      if (video.preload !== 'auto') {
        video.preload = 'auto';
        if (video.readyState < 3) video.load();
      }
      seek(video);
    });
    startWhenReady();
  }

  function start() {
    playingGroup?.();
    playingGroup = pause;
    status.textContent = '';
    if (position >= duration(leader) - 0.05) position = 0;
    playing = true;
    play.textContent = 'Pause';
    startTogether();
    updateClock();
  }

  media.forEach((video) => {
    video.addEventListener('loadedmetadata', () => {
      seek(video);
      updateClock();
    });
    video.addEventListener('canplay', startWhenReady);
    video.addEventListener('seeked', startWhenReady);
    video.addEventListener('waiting', () => {
      if (!playing || pendingStart || video.ended) return;
      position = leader.currentTime;
      startTogether();
    });
    video.addEventListener('error', () => {
      pause();
      status.textContent = 'A video could not be loaded.';
    });
  });
  leader.addEventListener('timeupdate', () => {
    if (pendingStart || leader.seeking || leader.readyState < 1) return;
    position = leader.currentTime;
    updateClock();
    if (playing && media.some((video) => !video.ended && !video.seeking
        && position < duration(video) - 0.2 && Math.abs(position - video.currentTime) > 0.18)) {
      startTogether();
    }
  });
  leader.addEventListener('ended', () => {
    pause();
    position = duration(leader);
    updateClock();
  });
  slider.addEventListener('input', () => {
    position = Number(slider.value) * duration(leader) / 1000;
    if (playing) {
      startTogether();
    } else {
      media.forEach((video) => {
        if (video.readyState < 1 && video.preload === 'none') video.preload = 'metadata';
        seek(video);
      });
    }
    updateClock();
  });
  speed.addEventListener('change', () => {
    media.forEach((video) => { video.playbackRate = Number(speed.value); });
  });
  play.addEventListener('click', () => { if (playing) pause(); else start(); });
  container.stopPlayback = pause;
  updateClock();
}

function setPressed(container, selected) {
  container.querySelectorAll('button').forEach((item) => {
    item.setAttribute('aria-pressed', String(item === selected));
  });
}

function showDemos(section) {
  const list = section.querySelector('.demo-list');
  const title = section.querySelector('.stage-heading h3');
  const description = section.querySelector('.stage-heading p');
  const player = section.querySelector('.player');
  demos.filter((demo) => demo.group === section.dataset.demoGroup).forEach((demo, index) => {
    const option = button('', 'demo-choice');
    const thumb = node('img');
    thumb.src = demo.streams[1].poster;
    thumb.alt = '';
    thumb.loading = 'lazy';
    option.append(thumb, node('span', '', demo.title));
    const select = () => {
      title.textContent = demo.title;
      description.textContent = demo.description;
      setPressed(list, option);
      mountPlayer(player, demo);
    };
    option.addEventListener('click', select);
    list.append(option);
    if (index === 0) select();
  });
}

const dialog = byId('pair-dialog');

function openPair(example) {
  playingGroup?.();
  byId('pair-dialog-title').textContent = example.title;
  byId('pair-dialog-kind').textContent = (example.source ?? 'Ent-Real') + ' training pair';
  mountPlayer(byId('dataset-player'), example);
  dialog.showModal();
}

function showDataset(group) {
  const mosaic = byId('dataset-mosaic');
  mosaic.replaceChildren();
  dataset.filter((example) => group === 'all' || example.group === group).forEach((example) => {
    const tile = button('', 'pair-tile');
    tile.setAttribute('aria-label', 'Watch training pair: ' + example.title);
    const head = node('span', 'tile-title', example.title);
    head.append(node('small', '', example.source ?? 'Ent-Real'));
    tile.append(head);
    example.steps.forEach((sequence) => {
      const row = node('span', 'frame-row');
      sequence.forEach((source) => {
        const img = node('img');
        img.src = source;
        img.alt = '';
        img.loading = 'lazy';
        row.append(img);
      });
      tile.append(row);
    });
    tile.append(node('span', 'tile-labels', 'Top: human video · Bottom: robot recording'));
    tile.addEventListener('click', () => openPair(example));
    mosaic.append(tile);
  });
}

byId('dataset-groups').addEventListener('click', (event) => {
  const control = event.target.closest('button[data-group]');
  if (!control) return;
  setPressed(byId('dataset-groups'), control);
  showDataset(control.dataset.group);
});
byId('close-pair').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => clearPlayer(byId('dataset-player')));

const copyBibtex = byId('copy-bibtex');
copyBibtex.addEventListener('click', async () => {
  const bibtex = byId('citation-bibtex');
  try {
    await navigator.clipboard.writeText(bibtex.textContent);
    copyBibtex.textContent = 'Copied';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(bibtex);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyBibtex.textContent = 'BibTeX selected';
  }
});

mountPlayer(byId('featured-player'), demos.find((demo) => demo.id === 'sweep'));
document.querySelectorAll('[data-demo-group]').forEach(showDemos);
showDataset('all');
