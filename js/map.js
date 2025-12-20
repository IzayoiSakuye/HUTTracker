// 算法地图示例数据与渲染逻辑
// 可替换 modules 数据或接入后端接口

const modules = [
  {
    id: 'array-basics',
    stage: '基础',
    title: '数组与枚举',
    difficulty: 'easy',
    track: '基础',
    tags: ['数组', '模拟'],
    desc: '掌握数组遍历、前缀和、枚举思路。',
    progress: 30,
    resources: [
      { label: '题单', link: 'https://www.luogu.com.cn/training/126379' },
      { label: '讲义', link: 'https://oi-wiki.org/basic/array/' }
    ]
  },
  {
    id: 'graph-basic',
    stage: '基础',
    title: '图与遍历',
    difficulty: 'medium',
    track: '基础',
    tags: ['BFS', 'DFS'],
    desc: '理解无向/有向图存储，练习 BFS/DFS。',
    progress: 20,
    resources: [
      { label: 'OI-Wiki', link: 'https://oi-wiki.org/graph/bfs/' }
    ]
  },
  {
    id: 'dp-intro',
    stage: '进阶',
    title: '动态规划入门',
    difficulty: 'medium',
    track: '进阶',
    tags: ['DP', '入门'],
    desc: '线性 DP、背包 DP 的经典模型。',
    progress: 10,
    resources: [
      { label: '背包九讲', link: 'https://github.com/tianyicui/pack' }
    ]
  },
  {
    id: 'tree-advanced',
    stage: '进阶',
    title: '树与 LCA',
    difficulty: 'hard',
    track: '进阶',
    tags: ['树', 'LCA'],
    desc: '根植树、重心、LCA（倍增）。',
    progress: 5,
    resources: [
      { label: 'OI-Wiki', link: 'https://oi-wiki.org/graph/lca/' }
    ]
  },
  {
    id: 'contest-setup',
    stage: '竞赛',
    title: '比赛前置准备',
    difficulty: 'easy',
    track: '竞赛',
    tags: ['模板', '调试'],
    desc: '熟悉模板、常用调试、IO 优化。',
    progress: 60,
    resources: [
      { label: '模板集合', link: 'https://cp-algorithms.com/' }
    ]
  }
];

const stageOrder = ['基础', '进阶', '竞赛'];

function renderMap() {
  const grid = document.getElementById('map-grid');
  if (!grid) return;

  const track = document.getElementById('track-select').value;
  const difficulty = document.getElementById('difficulty-select').value;
  const keyword = document.getElementById('keyword-input').value.trim().toLowerCase();

  grid.innerHTML = '';

  stageOrder.forEach(stage => {
    const col = document.createElement('section');
    col.className = 'col-12 col-lg-4 map-column';

    const header = document.createElement('div');
    header.className = 'map-column__header';
    header.innerHTML = `<div class="title">${stage}</div><div class="hint">学习路径</div>`;
    col.appendChild(header);

    const list = document.createElement('div');
    list.className = 'map-column__list';

    const filtered = modules.filter(m => {
      const hitStage = m.stage === stage;
      const hitTrack = track === 'all' || m.track === track;
      const hitDiff = difficulty === 'all' || m.difficulty === difficulty;
      const hitKeyword = !keyword ||
        m.title.toLowerCase().includes(keyword) ||
        m.tags.some(t => t.toLowerCase().includes(keyword));
      return hitStage && hitTrack && hitDiff && hitKeyword;
    });

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'map-card empty';
      empty.textContent = '暂无匹配条目';
      list.appendChild(empty);
    } else {
      filtered.forEach(m => list.appendChild(renderCard(m)));
    }

    col.appendChild(list);
    grid.appendChild(col);
  });
}

function renderCard(mod) {
  const card = document.createElement('article');
  card.className = 'map-card';

  const badge = document.createElement('span');
  badge.className = `badge ${difficultyClass(mod.difficulty)}`;
  badge.textContent = mod.difficulty.toUpperCase();

  const title = document.createElement('div');
  title.className = 'map-card__title';
  title.textContent = mod.title;
  title.appendChild(badge);

  const desc = document.createElement('p');
  desc.className = 'map-card__desc';
  desc.textContent = mod.desc;

  const tags = document.createElement('div');
  tags.className = 'map-card__tags';
  mod.tags.forEach(t => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = t;
    tags.appendChild(tag);
  });

  const progressWrap = document.createElement('div');
  progressWrap.className = 'map-card__progress';
  progressWrap.innerHTML = `
    <div class="progress-label">完成度 ${mod.progress}%</div>
    <div class="progress">
      <div class="progress-bar" role="progressbar" style="width:${mod.progress}%" aria-valuenow="${mod.progress}" aria-valuemin="0" aria-valuemax="100"></div>
    </div>
  `;

  const actions = document.createElement('div');
  actions.className = 'map-card__actions';
  mod.resources.forEach(r => {
    const a = document.createElement('a');
    a.className = 'btn btn-sm btn-outline-primary';
    a.href = r.link;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = r.label;
    actions.appendChild(a);
  });

  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(tags);
  card.appendChild(progressWrap);
  card.appendChild(actions);
  return card;
}

function difficultyClass(level) {
  switch (level) {
    case 'easy':
      return 'bg-success';
    case 'medium':
      return 'bg-warning text-dark';
    case 'hard':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
}

function bindMapEvents() {
  ['track-select', 'difficulty-select', 'keyword-input'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const eventName = id === 'keyword-input' ? 'input' : 'change';
    el.addEventListener(eventName, renderMap);
  });
}

function initMap() {
  bindMapEvents();
  renderMap();
}

document.addEventListener('DOMContentLoaded', initMap);
