const API_BASE = window.location.origin.startsWith('file') ? 'http://localhost:3000' : window.location.origin;

const fallbackModules = [
  {
    id: 'complexity',
    stage: '新手入门',
    title: '复杂度',
    difficulty: 'easy',
    tags: ['复杂度'],
    desc: '学会计算时间复杂度与空间复杂度',
    resources: [
      { label: 'wiki', link: 'https://oi-wiki.org/basic/complexity/' }
    ]
  },
  {
    id: 'sort',
    stage: '新手入门',
    title: '排序',
    difficulty: 'easy',
    tags: ['排序'],
    desc: '基础的排序算法',
    resources: [
      { label: '题单', link: 'https://www.luogu.com.cn/training/107' },
      { label: 'wiki', link: 'https://oi-wiki.org/basic/sort-intro/' }
    ]
  }
];

let modules = [];

function stageOrderFromData() {
  const set = new Set();
  modules.forEach(m => set.add(m.stage || '未分组'));
  return Array.from(set);
}

function renderMap() {
  const grid = document.getElementById('map-grid');
  const keyword = document.getElementById('keyword-input').value.trim().toLowerCase();
  const stageOrder = stageOrderFromData();
  grid.innerHTML = '';
  stageOrder.forEach(stage => {
    const col = document.createElement('section');
    col.className = 'col-12 col-lg-4 map-column';

    const header = document.createElement('div');
    header.className = 'map-header';
    header.innerHTML = `<div class="title">${stage}</div>`;
    col.appendChild(header);

    const list = document.createElement('div');
    list.className = 'map-list';

    const filtered = modules.filter(m => {
      const hitStage = m.stage === stage;
      const hitKeyword = !keyword ||
        m.title.toLowerCase().includes(keyword) ||
        m.tags.some(t => t.toLowerCase().includes(keyword));
      return hitStage && hitKeyword;
    });

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'map-card empty';
      empty.textContent = '暂无匹配内容';
      list.appendChild(empty);
    } else {
      filtered.forEach(m => list.appendChild(renderCard(m)));
    }

    col.appendChild(list);
    grid.appendChild(col);
  });
}

function renderCard(mod) {
  const card = document.createElement('div');
  card.className = 'map-card';

  const badge = document.createElement('span');
  badge.className = `badge ${diff(mod.difficulty)}`;
  badge.textContent = mod.difficulty.toUpperCase();

  const title = document.createElement('div');
  title.className = 'map-cardtitle';
  title.textContent = mod.title;
  title.appendChild(badge);

  const desc = document.createElement('p');
  desc.className = 'map-carddesc';
  desc.textContent = mod.desc;

  const tags = document.createElement('div');
  tags.className = 'map-cardtags';
  mod.tags.forEach(t => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = t;
    tags.appendChild(tag);
  });

  const actions = document.createElement('div');
  actions.className = 'map-cardactions';
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
  card.appendChild(actions);
  return card;
}

function diff(level) {
  const lv = level === '入门' ? 'easy' : level === '进阶' ? 'medium' : level === '挑战' ? 'hard' : level;
  switch (lv) {
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
  const keywordInput = document.getElementById('keyword-input');
  if (!keywordInput) return;
  keywordInput.addEventListener('input', renderMap);
}

function normalizeNodes(list) {
  return (list || []).map(item => ({
    id: item.id,
    stage: item.module || '未分组',
    title: item.title,
    difficulty: item.difficulty,
    tags: Array.isArray(item.tags) && item.tags.length ? item.tags : [item.module || '未分组'],
    desc: item.summary || '',
    resources: Array.isArray(item.resources) && item.resources.length
      ? item.resources
      : (item.link ? [{ label: '资源', link: item.link }] : [])
  }));
}

async function loadMapFromApi() {
  try {
    const res = await fetch(`${API_BASE}/map/list`);
    if (!res.ok) throw new Error('fail');
    const data = await res.json();
    const normalized = normalizeNodes(data.result);
    modules = normalized.length > 0 ? normalized : fallbackModules;
  } catch (_e) {
    modules = fallbackModules;
  }
  renderMap();
}

bindMapEvents();
loadMapFromApi();

