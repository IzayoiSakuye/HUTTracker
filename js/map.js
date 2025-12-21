const modules = [
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
  },
  {
    id: 'divide-conquer',
    stage: '新手入门',
    title: '递归&分治',
    difficulty: 'easy',
    tags: ['递归', '分治'],
    desc: '学习递归与分支的基本思想',
    resources: [
      { label: '题单', link: 'https://www.luogu.com.cn/training/109' },
      { label: 'wiki', link: 'https://oi-wiki.org/basic/divide-and-conquer/' }
    ]
  },
  {
    id: 'binary',
    stage: '新手入门',
    title: '二分',
    difficulty: 'easy',
    tags: ['递归', '分治'],
    desc: '学习二分搜索，二分查找以及三分等基本思想',
    resources: [
      { label: '题单', link: 'https://www.luogu.com.cn/training/111' },
      { label: 'wiki', link: 'https://oi-wiki.org/basic/binary/' }
    ]
  },
  {
    id: 'dp-intro',
    stage: '进阶知识',
    title: '动态规划入门',
    difficulty: 'medium',
    tags: ['DP', '入门'],
    desc: '学习线性 DP、背包 DP 的经典模型。',
    resources: [
      { label: '背包九讲', link: 'https://github.com/tianyicui/pack' },
      { label: '题单', link: 'https://www.luogu.com.cn/training/211' }
    ]
  },
  {
    id: 'seg-tree',
    stage: '新手出门',
    title: '线段树',
    difficulty: 'hard',
    tags: ['数据结构', '树'],
    desc: '一种高级且通用的数据结构',
    resources: [
      { label: 'wiki', link: 'https://oi-wiki.org/ds/seg/' },
      { label: '题单', link: 'https://www.luogu.com.cn/training/206' }

    ]
  },
  {
    id: 'number-theroy',
    stage: '进阶知识',
    title: '数论',
    difficulty: 'medium',
    tags: ['数学', '数论'],
    desc: '学习简单的数论知识',
    resources: [
      { label: '入门题单', link: 'https://www.luogu.com.cn/training/117' },
      { label: '进阶题单', link: 'https://www.luogu.com.cn/training/216' }
    ]
  }
];

const stageOrder = ['新手入门', '进阶知识', '新手出门'];

function renderMap() {
  const grid = document.getElementById('map-grid');
  const keyword = document.getElementById('keyword-input').value.trim().toLowerCase();

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
  const keywordInput = document.getElementById('keyword-input');
  if (!keywordInput) return;
  keywordInput.addEventListener('input', renderMap);
}

bindMapEvents();
renderMap();

