const API_BASE = window.location.origin.startsWith('file') ? 'http://localhost:3000' : window.location.origin;

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.top = '16px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.padding = '10px 16px';
  toast.style.borderRadius = '10px';
  toast.style.color = '#fff';
  toast.style.background = type === 'success' ? '#22c55e' : type === 'warning' ? '#f59e0b' : '#ef4444';
  toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  toast.style.zIndex = '9999';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2400);
}

function guardRole(user) {
  const isAllowed = user && (user.is_admin || user.is_superadmin);
  if (!isAllowed) {
    showToast('请使用管理员账号登录', 'warning');
    setTimeout(() => window.location.href = 'login.html', 400);
  }
  return isAllowed;
}

function updateRolePill(user) {
  const pill = document.getElementById('role-pill');
  if (!pill) return;
  if (user.is_superadmin) {
    pill.textContent = 'superadmin';
    pill.classList.add('text-primary');
  } else if (user.is_admin) {
    pill.textContent = 'admin';
  } else {
    pill.textContent = 'guest';
  }
}

async function loadDailyHistory() {
  const fallback = [];
  try {
    const res = await fetch(`${API_BASE}/admin/daily/recent`);
    if (!res.ok) throw new Error('fail');
    const data = await res.json();
    renderDailyHistory(data.result || fallback);
  } catch (_e) {
    renderDailyHistory(fallback);
  }
}

function renderDailyHistory(list) {
  const ul = document.getElementById('daily-history');
  if (!ul) return;
  ul.innerHTML = '';
  list.slice(0, 5).forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    const linkHtml = item.link ? `<a href="${item.link}" target="_blank" class="text-decoration-none">原题</a>` : '';
    const dateText = formatDate(item.date);
    li.innerHTML = `<span>${idx + 1}. ${dateText}</span><span class="fw-semibold">${item.title || ''}</span><span class="text-muted small">${linkHtml}</span>`;
    ul.appendChild(li);
  });
}

async function saveDaily() {
  const date = document.getElementById('daily-date').value;
  const title = document.getElementById('daily-title').value.trim();
  const link = document.getElementById('daily-link').value.trim();
  const content = document.getElementById('daily-content').value.trim();
  const difficulty = document.getElementById('daily-difficulty').value;
  if (!date || !title || !content || !link) {
    showToast('请填写完整的每日一题信息', 'warning');
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/admin/daily`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, title, content, link, difficulty })
    });
    if (!res.ok) throw new Error('fail');
    showToast('每日一题已更新', 'success');
    loadDailyHistory();
  } catch (_e) {
    showToast('本地保存成功（模拟）', 'success');
    renderDailyHistory([{ date, title, link, difficulty }]);
  }
}

function previewDaily() {
  const title = document.getElementById('daily-title').value.trim();
  const content = document.getElementById('daily-content').value.trim();
  const date = document.getElementById('daily-date').value;
  const link = document.getElementById('daily-link').value.trim();
  const previewText = `${date || '日期未填'} | ${title || '未命名题目'}\n${link || '未填写链接'}\n\n${content || '暂无内容'}`;
  alert(previewText);
}

async function addMapNode() {
  const payload = {
    module: document.getElementById('map-module').value.trim(),
    difficulty: document.getElementById('map-difficulty').value,
    title: document.getElementById('map-title').value.trim(),
    summary: document.getElementById('map-summary').value.trim(),
    tags: parseTags(),
    resources: parseResources()
  };
  payload.link = payload.resources[0]?.link || '';
  if (!payload.module || !payload.title) {
    showToast('请填写模块与节点标题', 'warning');
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/admin/map`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('fail');
    showToast('地图节点已添加', 'success');
    loadRecentMap();
  } catch (_e) {
    showToast('本地新增成功（模拟）', 'success');
    renderRecentMap([payload]);
  }
}

function renderRecentMap(list) {
  const wrap = document.getElementById('map-recent');
  if (!wrap) return;
  wrap.innerHTML = '';
  list.slice(0, 6).forEach(item => {
    const pill = document.createElement('div');
    pill.className = 'pill-chip';
    pill.innerHTML = `<span>${item.title}</span><span class="tag">${item.module || '未分组'}</span>`;
    wrap.prepend(pill);
  });
}

function renderMapAdminTable(list) {
  const tbody = document.getElementById('map-admin-list');
  if (!tbody) return;
  tbody.innerHTML = '';
  list.forEach((item, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${item.module || '-'}</td>
      <td>${item.title || '-'}</td>
      <td>${Array.isArray(item.tags) ? item.tags.join(', ') : ''}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger" data-id="${item.id}">删除</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function resetMapForm() {
  ['map-module', 'map-title', 'map-summary', 'map-tags', 'map-resources'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('map-difficulty').value = '入门';
}

async function loadRecentMap() {
  try {
    const res = await fetch(`${API_BASE}/map/list`);
    if (!res.ok) throw new Error('fail');
    const data = await res.json();
    const list = data.result || [];
    renderRecentMap(list);
    renderMapAdminTable(list);
  } catch (_e) {
    renderRecentMap([]);
    renderMapAdminTable([]);
  }
}

function parseTags() {
  const raw = document.getElementById('map-tags').value.trim();
  if (!raw) return [];
  return raw.split(',').map(t => t.trim()).filter(Boolean);
}

function parseResources() {
  const raw = document.getElementById('map-resources').value.trim();
  if (!raw) return [];
  return raw.split('\n').map((line, idx) => {
    const [label, url] = line.split('|');
    return {
      label: (label || `资源${idx + 1}`).trim(),
      link: (url || '').trim()
    };
  }).filter(r => r.link);
}

async function deleteMapNode(id) {
  try {
    const res = await fetch(`${API_BASE}/admin/map/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('fail');
    showToast('已删除节点', 'success');
    loadRecentMap();
  } catch (_e) {
    showToast('删除失败', 'error');
  }
}

async function loadUsers(isSuperadmin) {
  const fallback = [
    { id: 1, username: 'root', nickname: '超级管理员', email: 'root@example.com', is_admin: true, is_superadmin: true },
    { id: 2, username: 'alice', nickname: '题目维护', email: 'alice@example.com', is_admin: true, is_superadmin: false },
    { id: 3, username: 'bob', nickname: '普通用户', email: 'bob@example.com', is_admin: false, is_superadmin: false }
  ];
  try {
    const res = await fetch(`${API_BASE}/admin/users`);
    if (!res.ok) throw new Error('fail');
    const data = await res.json();
    renderUsers(data.result || fallback, isSuperadmin);
  } catch (_e) {
    renderUsers(fallback, isSuperadmin);
  }
}

function renderUsers(list, isSuperadmin) {
  const tbody = document.getElementById('user-table');
  if (!tbody) return;
  tbody.innerHTML = '';
  list.forEach((u, idx) => {
    const tr = document.createElement('tr');
    const disableToggle = !isSuperadmin || u.is_superadmin;
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${u.username}</td>
      <td>${u.nickname || '-'}</td>
      <td>${u.email || '-'}</td>
      <td>${u.is_admin ? '是' : '否'}</td>
      <td>${u.is_superadmin ? '是' : '否'}</td>
      <td>
        <button class="btn btn-sm ${u.is_admin ? 'btn-outline-danger' : 'btn-outline-primary'}" ${disableToggle ? 'disabled' : ''} data-id="${u.id}" data-admin="${u.is_admin}">
          ${u.is_admin ? '取消 admin' : '设为 admin'}
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function toggleAdmin(userId, willBeAdmin) {
  try {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_admin: willBeAdmin })
    });
    if (!res.ok) throw new Error('fail');
    showToast('权限已更新', 'success');
  } catch (_e) {
    showToast('本地更新成功（模拟）', 'success');
  }
}

(function bootstrap() {
  const raw = localStorage.getItem('user');
  const user = raw ? JSON.parse(raw) : {};
  if (!guardRole(user)) return;

  updateRolePill(user);
  loadDailyHistory();
  loadRecentMap();
  loadUsers(!!user.is_superadmin);

  document.getElementById('save-daily')?.addEventListener('click', saveDaily);
  document.getElementById('preview-daily')?.addEventListener('click', previewDaily);
  document.getElementById('add-map-node')?.addEventListener('click', addMapNode);
  document.getElementById('reset-map-form')?.addEventListener('click', resetMapForm);
  document.getElementById('map-admin-list')?.addEventListener('click', (e) => {
    if (!(e.target instanceof HTMLButtonElement)) return;
    const id = e.target.getAttribute('data-id');
    if (id) deleteMapNode(id);
  });

  document.getElementById('user-table')?.addEventListener('click', (e) => {
    if (!(e.target instanceof HTMLButtonElement)) return;
    const btn = e.target;
    const id = btn.getAttribute('data-id');
    const current = btn.getAttribute('data-admin') === 'true';
    if (btn.disabled) return;
    toggleAdmin(id, !current).then(() => loadUsers(!!user.is_superadmin));
  });
})();

function formatDate(dt) {
  if (!dt) return '';
  try {
    const d = new Date(dt);
    if (Number.isNaN(d.getTime())) return String(dt).slice(0, 10);
    return d.toISOString().slice(0, 10);
  } catch (_e) {
    return String(dt).slice(0, 10);
  }
}
