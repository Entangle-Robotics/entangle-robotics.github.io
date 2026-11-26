'use strict';

const { demos, dataset } = window.ENTANGLE_MEDIA;
const byId = (id) => document.getElementById(id);
let playingGroup = null;

const BLOG_URLS = {
  en: 'https://www.motubrain.com/en/blog/motubrain-2/',
  zh: 'https://www.motubrain.com/zh/blog/motubrain-2/'
};

const I18N = {
  en: {
    metaTitle: 'Entangle · Human-Video In-Context World-Action Models',
    metaDesc: 'Entangle learns robot behavior from human video. Explore real-robot and RoboTwin rollouts, Context-OOD transfer, and paired training data.',
    langToggle: '中文',
    langToggleAria: '切换到中文',
    ui: {
      'skip': 'Skip to content',
      'nav.task': 'Task-OOD',
      'nav.context': 'Context-OOD',
      'nav.additional': 'Additional demos',
      'nav.robotwin': 'RoboTwin',
      'nav.dataset': 'Dataset',
      'nav.results': 'Results',
      'cta.blog': 'Tech Blog',
      'cta.blog_full': 'Tech Blog (Motubrain 2.0)',
      'cta.paper': 'Paper PDF',
      'cta.read_paper': 'Read the paper',
      'cta.read_blog': 'Read tech blog',
      'hero.subtitle': 'Scaling Human-Video In-Context World-Action Models across Unseen Tasks and Contexts',
      'hero.affiliations': 'Tsinghua University, GensPI Technology, Motubrain',
      'hero.equal': '<sup>*</sup> Equal contribution',
      'featured.title': 'Sweep with a cup',
      'featured.subtitle': 'Task-OOD · Astribot S1',
      'stats.s1': 'Mean task score on Astribot S1',
      'stats.robotwin': 'Success rate on RoboTwin',
      'stats.dataset': 'Paired episodes in Ent-Dataset',
      'section.task.title': 'Task-OOD',
      'section.task.desc': 'Six Astribot S1 tasks test generalization to unseen goals and procedures.',
      'section.context.title': 'Context-OOD',
      'section.context.desc': 'Four scene changes test whether the robot can transfer the demonstrated interaction.',
      'section.additional.title': 'Additional demos',
      'section.additional.desc': 'Generated context, object-free imitation, and InfoNCE ablations.',
      'section.robotwin.title': 'RoboTwin Simulation',
      'section.robotwin.desc': 'One successful rollout from each of the seven held-out RoboTwin tasks. Mean success across the full evaluation is <strong>69.52%</strong> over three seeds.',
      'section.dataset.title': 'Ent-Dataset',
      'section.dataset.desc': 'Paired human and robot sequences capture the same manipulations. Each tile shows six moments from a training pair.',
      'dataset.legend.real': '5,260 real',
      'dataset.legend.astr': '9,227 Astribot synthetic',
      'dataset.legend.agi': '6,782 AgiBot synthetic',
      'dataset.filter.all': 'All pairs',
      'dataset.filter.real': 'Real',
      'dataset.filter.synthetic': 'Synthetic',
      'section.results.title': 'Real-robot data scaling',
      'section.results.desc': 'Mean task scores rise from 40.8 to 83.5 as the paired continued-training data grows from 10% to the full pool.',
      'results.figcaption': 'Six real-robot tasks, 10 trials per task and configuration.',
      'results.copy.title': 'Aligned data improves task following',
      'results.copy.body': 'Entangle learns joint video–action prediction from temporally aligned human and robot sequences. At deployment, a human video specifies the procedure and the robot replans from its current observations.',
      'section.citation.title': 'Citation',
      'citation.copy': 'Copy BibTeX',
      'dialog.close': 'Close'
    },
    player: {
      playBoth: 'Play both',
      playAll: 'Play all',
      pause: 'Pause',
      positionAria: 'Shared playback position',
      speedAria: 'Playback speed',
      startError: 'Playback could not start. Try Play again.',
      loadError: 'A video could not be loaded.'
    },
    streams: {
      'Human demonstration': 'Human demonstration',
      'Robot execution': 'Robot execution',
      'Generated context': 'Generated context',
      'With InfoNCE': 'With InfoNCE',
      'Without InfoNCE': 'Without InfoNCE',
      'Generated human context': 'Generated human context',
      'Simulated execution': 'Simulated execution',
      'Generated human video': 'Generated human video',
      'Robot recording': 'Robot recording'
    },
    sources: {
      'Ent-Real': 'Ent-Real',
      'Astribot synthetic': 'Astribot synthetic',
      'AgiBot synthetic': 'AgiBot synthetic'
    },
    datasetTile: {
      watchAria: (title) => 'Watch training pair: ' + title,
      labels: 'Top: human video · Bottom: robot recording',
      dialogKind: (source) => source + ' training pair'
    },
    bibtex: {
      copied: 'Copied',
      selected: 'BibTeX selected'
    },
    demos: {},
    dataset: {}
  },
  zh: {
    metaTitle: 'Entangle · 人类视频上下文世界-动作模型',
    metaDesc: 'Entangle 从人类示范视频中学习机器人操作行为。探索真机与 RoboTwin 仿真测试、上下文分布外（Context-OOD）迁移及帧级对齐配对数据集。',
    langToggle: 'EN',
    langToggleAria: 'Switch to English',
    ui: {
      'skip': '跳转到正文',
      'nav.task': '任务泛化 (Task-OOD)',
      'nav.context': '场景泛化 (Context-OOD)',
      'nav.additional': '更多演示',
      'nav.robotwin': 'RoboTwin 仿真',
      'nav.dataset': '配对数据集',
      'nav.results': '实验结果',
      'cta.blog': '技术博客',
      'cta.blog_full': '技术博客 (Motubrain 2.0)',
      'cta.paper': '论文 PDF',
      'cta.read_paper': '阅读论文',
      'cta.read_blog': '阅读技术博客',
      'hero.subtitle': '面向未见任务与场景的人类视频上下文世界-动作模型规模化扩展',
      'hero.affiliations': '清华大学，生数科技，Motubrain',
      'hero.equal': '<sup>*</sup> 共同第一作者',
      'featured.title': '用杯子清扫木块',
      'featured.subtitle': '任务分布外 (Task-OOD) · Astribot S1',
      'stats.s1': 'Astribot S1 真机平均任务得分',
      'stats.robotwin': 'RoboTwin 仿真测试平均成功率',
      'stats.dataset': 'Ent-Dataset 时序对齐配对序列',
      'section.task.title': '任务分布外测试 (Task-OOD)',
      'section.task.desc': '6 项 Astribot S1 真机任务，测试模型对训练中从未见过的目标与操作流程的泛化能力。',
      'section.context.title': '上下文分布外测试 (Context-OOD)',
      'section.context.desc': '4 类场景与物体变化测试，验证机器人能否跨排布、跨外观、跨工具迁移人类示范中的交互方式。',
      'section.additional.title': '更多演示与消融实验',
      'section.additional.desc': '视频生成模型驱动的零样本上下文、无物体动作模仿，以及任务内对比学习（InfoNCE）消融对比。',
      'section.robotwin.title': 'RoboTwin 仿真基准测试',
      'section.robotwin.desc': '展示 7 项未参与训练的 RoboTwin 测试任务的成功执行过程。在 3 个随机种子下的完整评估平均成功率为 <strong>69.52%</strong>。',
      'section.dataset.title': 'Ent-Dataset 配对数据集',
      'section.dataset.desc': '帧级时序对齐的人类与机器人操作序列，共同捕捉同一操纵过程。每张卡片展示一对训练样本中的 6 个关键时刻。',
      'dataset.legend.real': '5,260 对真人采集',
      'dataset.legend.astr': '9,227 对 Astribot 合成',
      'dataset.legend.agi': '6,782 对 AgiBot 合成',
      'dataset.filter.all': '全部配对',
      'dataset.filter.real': '真人采集',
      'dataset.filter.synthetic': '视频合成',
      'section.results.title': '真机配对数据规模扩展效应',
      'section.results.desc': '随着持续预训练配对数据规模从 10% 扩展至 100% 全量数据池，真机平均任务得分从 40.8 稳步提升至 83.5。',
      'results.figcaption': '6 项真机测试任务，每项任务与配置各评估 10 次。',
      'results.copy.title': '帧级对齐数据显著提升任务遵循能力',
      'results.copy.body': 'Entangle 从时间严格对齐的人类与机器人序列中学习联合视频-动作预测。在部署阶段，仅需一段人类示范视频即可指定操作流程，机器人根据当前观测动态重规划并完成任务。',
      'section.citation.title': '引用格式',
      'citation.copy': '复制 BibTeX',
      'dialog.close': '关闭'
    },
    player: {
      playBoth: '同步播放',
      playAll: '全部播放',
      pause: '暂停',
      positionAria: '同步播放进度',
      speedAria: '播放倍速',
      startError: '播放未能启动，请重新点击播放。',
      loadError: '视频加载失败。'
    },
    streams: {
      'Human demonstration': '人类示范',
      'Robot execution': '机器人执行',
      'Generated context': '生成视频上下文',
      'With InfoNCE': '引入 InfoNCE',
      'Without InfoNCE': '无 InfoNCE',
      'Generated human context': '生成的人类参考视频',
      'Simulated execution': '仿真执行',
      'Generated human video': '生成的人类视频',
      'Robot recording': '机器人记录'
    },
    sources: {
      'Ent-Real': 'Ent-Real 真机采集',
      'Astribot synthetic': 'Astribot 合成数据',
      'AgiBot synthetic': 'AgiBot 合成数据'
    },
    datasetTile: {
      watchAria: (title) => '查看训练配对样本：' + title,
      labels: '上排：人类视频 · 下排：机器人记录',
      dialogKind: (source) => source + ' · 训练配对样本'
    },
    bibtex: {
      copied: '已复制',
      selected: '已选中 BibTeX'
    },
    demos: {
      'blocks': {
        title: '积木按序堆叠',
        description: '严格按照人类示范中“先左、再右、后中”的顺序将三块积木依次堆叠。'
      },
      'mouse': {
        title: '鼠标轨迹书写与点击',
        description: '拖动鼠标依次写出 C、V、P、R 四个字母轨迹，随后连续按压鼠标左键五次。'
      },
      'towel': {
        title: '双臂协同拧毛巾',
        description: '将毛巾折叠后，使用双臂夹爪向相反方向双向拧转毛巾，最后平稳放回桌面。'
      },
      'counter': {
        title: '反直觉物品重排',
        description: '完全依赖示范视频推断非常规的物品放置目标位置及先后操作顺序。'
      },
      'sweep': {
        title: '用杯子清扫木块',
        description: '拿起杯子将桌面木块扫入畚箕中，随后将工具归位放回原处。'
      },
      'obstacle': {
        title: '绕障取杯',
        description: '从左侧开口处绕过障碍物接近并抓取水杯，全程避免触碰周围障碍。'
      },
      'pens': {
        title: '新排布下的双笔入筒',
        description: '机器人将水平摆放的两支笔依次放入笔筒。期间蓝笔被碰出视野并由人工放回，机器人随后继续完成第二次放入。'
      },
      'white-mouse': {
        title: '跨外观迁移：黑鼠标换白鼠标',
        description: '测试场景中使用白色鼠标替换了参考示范视频中的黑色鼠标，机器人仍能准确完成轨迹与点击。'
      },
      'stand': {
        title: '跨物体擦拭支架',
        description: '用支架替换示范中的相框，机器人保持相同的“左手扶稳、右手擦拭”双臂协同交互。'
      },
      'banana': {
        title: '跨工具迁移：用香蕉扫木块',
        description: '遵循示范视频中“刷子扫块入畚箕”的交互逻辑，机器人改用香蕉将白色木块扫入纸盒中。'
      },
      'generated': {
        title: '生成视频上下文：笔筒整理流程',
        description: '由 Seedance 视频生成模型直接生成人类操作片段，零样本驱动机器人完成两步笔筒整理流程。'
      },
      'handover': {
        title: '无实物动作模仿：双手交接',
        description: '移除操作道具后，机器人依然精准复现示范中的左右手角色分工与释放时序。'
      },
      'cloth': {
        title: 'InfoNCE 消融：布料旋转与抛掷',
        description: '引入 InfoNCE 时，手腕旋转角度更紧密地贴合人类参考视频；无 InfoNCE 时虽能抛出布料但细节偏离示范。'
      },
      'wipe': {
        title: 'InfoNCE 消融：背面支撑擦拭',
        description: '引入 InfoNCE 时，左臂夹爪在擦拭全程持续扶稳相框；无 InfoNCE 时左臂夹爪过早撤回。'
      },
      'robotwin-place_object_scale': {
        title: '物体放上电子秤',
        description: '抓取铃铛并将其平稳放置到电子秤盘上。'
      },
      'robotwin-stamp_seal': {
        title: '印章盖印',
        description: '抓起印章并准确盖在指定颜色的目标区域上。'
      },
      'robotwin-open_microwave': {
        title: '拉开微波炉门',
        description: '握住把手向外拉动，打开铰链式微波炉门。'
      },
      'robotwin-move_stapler_pad': {
        title: '移动订书机至垫板',
        description: '将桌面上的订书机抓取并移动到彩色垫板上。'
      },
      'robotwin-place_bread_basket': {
        title: '面包放入篮中',
        description: '依次抓起两片面包并将它们全部放入篮子内。'
      },
      'robotwin-place_empty_cup': {
        title: '空杯放置杯垫',
        description: '拿起空杯并将其稳妥放置在杯垫中央。'
      },
      'robotwin-stack_blocks_three': {
        title: '三色积木堆塔',
        description: '按照红色在下、绿色居中、蓝色在上的顺序搭建三层积木塔。'
      }
    },
    dataset: {
      'real_coaster': { title: '将水杯放到杯垫上' },
      'synthetic_potato': { title: '将土豆放入盘中' },
      'real_eggplant': { title: '将茄子放入盘中' },
      'synthetic_remote': { title: '将遥控器放入篮中' },
      'real_blocks': { title: '移动木块' },
      'synthetic_toys': { title: '将玩具收纳进储物盒' },
      'real_toaster': { title: '烤制面包片' },
      'synthetic_lid': { title: '盖上储物盒盖' },
      'real_shoes': { title: '整理并摆放鞋子' },
      'synthetic_agibot_book': { title: '将书籍放到书架上' },
      'real_pour': { title: '倾倒液体' },
      'synthetic_agibot_shorts': { title: '折叠短裤' }
    }
  }
};

function detectInitialLang() {
  const param = new URLSearchParams(window.location.search).get('lang');
  if (param === 'zh' || param === 'en') return param;
  try {
    const saved = localStorage.getItem('entangle_lang');
    if (saved === 'zh' || saved === 'en') return saved;
  } catch {}
  return 'en';
}

let currentLang = detectInitialLang();
const activeDemoByGroup = {};
let activeDatasetGroup = 'all';
let activeDialogExample = null;

function t() {
  return I18N[currentLang];
}

function demoTitle(demo) {
  return t().demos[demo.id]?.title ?? demo.title;
}

function demoDescription(demo) {
  return t().demos[demo.id]?.description ?? demo.description;
}

function datasetTitle(example) {
  return t().dataset[example.id]?.title ?? example.title;
}

function streamLabel(label) {
  return t().streams[label] ?? label;
}

function sourceLabel(source) {
  const raw = source ?? 'Ent-Real';
  return t().sources[raw] ?? raw;
}

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
  delete container.refreshLocale;
}

function mountPlayer(container, comparison) {
  clearPlayer(container);
  const layout = node('div', 'streams');
  layout.style.setProperty('--streams', comparison.streams.length);
  const captionNodes = [];
  const media = comparison.streams.map((stream) => {
    const panel = node('figure', 'stream');
    const caption = node('figcaption');
    const renderCaption = () => {
      caption.replaceChildren();
      const translated = streamLabel(stream.label);
      caption.append(stream.label === 'Generated context' ? node('strong', '', translated) : translated);
    };
    renderCaption();
    captionNodes.push({ stream, renderCaption });
    const visual = node('video');
    visual.preload = 'none';
    visual.defaultMuted = true;
    visual.muted = true;
    visual.playsInline = true;
    visual.poster = stream.poster;
    visual.src = stream.video;
    visual.setAttribute('aria-label', streamLabel(stream.label));
    panel.append(caption, visual);
    layout.append(panel);
    return visual;
  });
  container.append(layout);

  const durations = comparison.streams.map((stream) => stream.duration ?? comparison.duration);
  const leader = media[durations.indexOf(Math.max(...durations))];
  const controls = node('div', 'transport');
  const getStartLabel = () => (media.length === 2 ? t().player.playBoth : t().player.playAll);
  const play = button(getStartLabel(), 'play');
  const slider = node('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '1000';
  slider.value = '0';
  slider.setAttribute('aria-label', t().player.positionAria);
  const timestamp = node('span', 'clock');
  const speed = node('select');
  speed.setAttribute('aria-label', t().player.speedAria);
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
  let lastErrorKey = null;
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
    play.textContent = getStartLabel();
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
      lastErrorKey = 'startError';
      status.textContent = t().player.startError;
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
    lastErrorKey = null;
    status.textContent = '';
    if (position >= duration(leader) - 0.05) position = 0;
    playing = true;
    play.textContent = t().player.pause;
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
      lastErrorKey = 'loadError';
      status.textContent = t().player.loadError;
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
  container.refreshLocale = () => {
    captionNodes.forEach(({ stream, renderCaption }, idx) => {
      renderCaption();
      media[idx].setAttribute('aria-label', streamLabel(stream.label));
    });
    play.textContent = playing ? t().player.pause : getStartLabel();
    slider.setAttribute('aria-label', t().player.positionAria);
    speed.setAttribute('aria-label', t().player.speedAria);
    if (lastErrorKey) status.textContent = t().player[lastErrorKey];
  };
  updateClock();
}

function setPressed(container, selected) {
  container.querySelectorAll('button').forEach((item) => {
    item.setAttribute('aria-pressed', String(item === selected));
  });
}

function showDemos(section) {
  const group = section.dataset.demoGroup;
  const list = section.querySelector('.demo-list');
  const title = section.querySelector('.stage-heading h3');
  const description = section.querySelector('.stage-heading p');
  const player = section.querySelector('.player');
  list.replaceChildren();
  const groupDemos = demos.filter((demo) => demo.group === group);
  const selectedId = activeDemoByGroup[group] ?? groupDemos[0]?.id;

  groupDemos.forEach((demo) => {
    const option = button('', 'demo-choice');
    option.dataset.demoId = demo.id;
    const thumb = node('img');
    thumb.src = demo.streams[1].poster;
    thumb.alt = '';
    thumb.loading = 'lazy';
    const labelSpan = node('span', '', demoTitle(demo));
    option.append(thumb, labelSpan);
    const select = (remount = true) => {
      activeDemoByGroup[group] = demo.id;
      title.textContent = demoTitle(demo);
      description.textContent = demoDescription(demo);
      setPressed(list, option);
      if (remount) {
        mountPlayer(player, demo);
      } else {
        player.refreshLocale?.();
      }
    };
    option.addEventListener('click', () => select(true));
    list.append(option);
    if (demo.id === selectedId) {
      select(!player.refreshLocale);
    }
  });
}

const dialog = byId('pair-dialog');

function openPair(example) {
  playingGroup?.();
  activeDialogExample = example;
  byId('pair-dialog-title').textContent = datasetTitle(example);
  byId('pair-dialog-kind').textContent = t().datasetTile.dialogKind(sourceLabel(example.source));
  mountPlayer(byId('dataset-player'), example);
  dialog.showModal();
}

function showDataset(group) {
  activeDatasetGroup = group;
  const mosaic = byId('dataset-mosaic');
  mosaic.replaceChildren();
  dataset.filter((example) => group === 'all' || example.group === group).forEach((example) => {
    const translatedTitle = datasetTitle(example);
    const tile = button('', 'pair-tile');
    tile.setAttribute('aria-label', t().datasetTile.watchAria(translatedTitle));
    const head = node('span', 'tile-title', translatedTitle);
    head.append(node('small', '', sourceLabel(example.source)));
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
    tile.append(node('span', 'tile-labels', t().datasetTile.labels));
    tile.addEventListener('click', () => openPair(example));
    mosaic.append(tile);
  });
}

function applyLanguage(lang) {
  currentLang = lang;
  const dict = t();
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = dict.metaTitle;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', dict.metaDesc);

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict.ui[key] !== undefined) el.textContent = dict.ui[key];
  });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (dict.ui[key] !== undefined) el.innerHTML = dict.ui[key];
  });
  document.querySelectorAll('[data-blog-link]').forEach((el) => {
    el.setAttribute('href', BLOG_URLS[lang]);
  });

  const langBtn = byId('lang-toggle');
  if (langBtn) {
    langBtn.textContent = dict.langToggle;
    langBtn.setAttribute('aria-label', dict.langToggleAria);
  }

  byId('featured-player')?.refreshLocale?.();
  document.querySelectorAll('[data-demo-group]').forEach(showDemos);
  showDataset(activeDatasetGroup);

  if (dialog.open && activeDialogExample) {
    byId('pair-dialog-title').textContent = datasetTitle(activeDialogExample);
    byId('pair-dialog-kind').textContent = dict.datasetTile.dialogKind(sourceLabel(activeDialogExample.source));
    byId('dataset-player')?.refreshLocale?.();
  }
}

byId('lang-toggle').addEventListener('click', () => {
  const next = currentLang === 'en' ? 'zh' : 'en';
  try {
    localStorage.setItem('entangle_lang', next);
  } catch {}
  applyLanguage(next);
});

byId('dataset-groups').addEventListener('click', (event) => {
  const control = event.target.closest('button[data-group]');
  if (!control) return;
  setPressed(byId('dataset-groups'), control);
  showDataset(control.dataset.group);
});
byId('close-pair').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  activeDialogExample = null;
  clearPlayer(byId('dataset-player'));
});

const copyBibtex = byId('copy-bibtex');
copyBibtex.addEventListener('click', async () => {
  const bibtex = byId('citation-bibtex');
  try {
    await navigator.clipboard.writeText(bibtex.textContent);
    copyBibtex.textContent = t().bibtex.copied;
  } catch {
    const range = document.createRange();
    range.selectNodeContents(bibtex);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyBibtex.textContent = t().bibtex.selected;
  }
});

mountPlayer(byId('featured-player'), demos.find((demo) => demo.id === 'sweep'));
applyLanguage(currentLang);
