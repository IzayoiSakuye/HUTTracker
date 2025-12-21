const API_BASE = window.location.origin.startsWith('file') ? 'http://localhost:3000' : window.location.origin;

function getDiff(diff){
  let difftext;
  switch (diff) {
    case 'red':
      difftext = '入门';
      break;
    case 'orange':
      difftext = '普及-';
      break;
    case 'yellow':
      difftext = '普及/提高−';
      break;
    case 'green':
      difftext = '普及+/提高';
      break;
    case 'blue':
      difftext = '提高+/省选−';
      break;
    case 'purple':
      difftext = '省选/NOI−';
      break;
    case 'black':
      difftext = 'NOI/NOI+/CTSC';
      break;
    default:
      difftext = '普及+/提高';
      break;
  }
  return difftext;
}

const fallback = {
  title: 'P13097 [FJCPC 2025] 割点',
  content: '# 示例内容\n请在后台管理填写每日一题，当前为本地示例。',
  difficulty: 'green',
  link: 'https://www.luogu.com.cn/problem/P13097',
  date: '2025-12-21',
  statue: 0
};

function renderDaily(markdown) {
  const container = document.getElementById('daily-content');
  container.innerHTML = marked.parse(markdown.content || '');
  if (window.renderMathInElement) {
    renderMathInElement(container, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ]
    });
  }

  const title = document.getElementById('daily-title');
  title.innerHTML = '';
  const prob_title = document.createElement('li');
  prob_title.className = 'prob-title';
  prob_title.innerHTML = `<h2>${markdown.title}</h2>`;
  title.appendChild(prob_title);

  const diffli = document.createElement('li');
  diffli.className = 'diff';
  const diff = document.createElement('span');
  diff.className = `badge ${markdown.difficulty || 'green'}`;
  diff.innerText = getDiff(markdown.difficulty || 'green');
  diffli.appendChild(diff);
  title.appendChild(diffli);

  const linkli = document.createElement('li');
  linkli.className = 'link';
  const link = document.createElement('a');
  link.className = 'btn btn-outline-primary';
  link.href = markdown.link;
  link.target = '_blank';
  link.textContent = '原题链接';
  linkli.appendChild(link);
  title.appendChild(linkli);

  const subli = document.createElement('li');
  subli.className = 'sub';
  const sub = document.createElement('a');
  sub.className = 'btn btn-outline-primary';
  sub.href = `${markdown.link}#submit`;
  sub.target = '_blank';
  sub.textContent = '提交代码';
  subli.appendChild(sub);
  title.appendChild(subli);

  const compli = document.createElement('li');
  compli.className = 'comp';
  const comp = document.createElement('button');
  comp.className = 'btn btn-outline-danger';
  comp.id = 'btn';
  comp.textContent = '未完成';
  compli.appendChild(comp);
  title.appendChild(compli);

  document.getElementById('btn').addEventListener('click', function(){
    if (comp.textContent === '未完成'){
      comp.className = 'btn btn-outline-success';
      comp.textContent = '已完成';
      markdown.statue = 1;  
    }
    else{
      comp.className = 'btn btn-outline-danger';
      comp.textContent = '未完成';  
      markdown.statue = 0;
    }
  });
}

async function loadDaily() {
  try {
    const res = await fetch(`${API_BASE}/daily/latest`);
    if (!res.ok) throw new Error('fail');
    const data = await res.json();
    renderDaily({
      title: data.result.title,
      content: data.result.content,
      difficulty: data.result.difficulty || 'green',
      link: data.result.link,
      date: data.result.date,
      statue: 0
    });
  } catch (_e) {
    renderDaily(fallback);
  }
}

loadDaily();