// 检测账密合法性
const form = document.querySelector('form');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');

const usernameRegex = /^[A-Za-z0-9]+$/; // 仅数字和字母
const passwordRegex = /^.{6,20}$/; // 长度 6-20 位


const API_BASE = window.location.origin.startsWith('file') ? 'http://localhost:3000' : window.location.origin;

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.padding = '10px 16px';
  toast.style.borderRadius = '6px';
  toast.style.color = '#fff';
  toast.style.background = type === 'success' ? '#28a745' : '#dc3545';
  toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
  toast.style.zIndex = '9999';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 1600);
}

function addValidClass(input, isValid) {
  if (isValid) {
    input.classList.add('is-valid');
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
  }
}

function validLogin() {
  const usernameValid = usernameRegex.test(usernameInput.value.trim());
  const passwordValid = passwordRegex.test(passwordInput.value.trim());

  addValidClass(usernameInput, usernameValid);
  addValidClass(passwordInput, passwordValid);

  return usernameValid && passwordValid;
}
usernameInput.addEventListener('blur', () => {
  const name = usernameInput.value.trim();
  addValidClass(usernameInput, usernameRegex.test(name));
});

passwordInput.addEventListener('blur', () => {
  const pass = passwordInput.value.trim();
  addValidClass(passwordInput, passwordRegex.test(pass));
});


form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  if (!validLogin()) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ username, password })
    });

    const data = await response.json();
    if (response.ok && data.code === 200) {
      // 暂时存储用户信息，用于右上角显示
      localStorage.setItem('user', JSON.stringify(data.result));
      showToast(`欢迎您 ${data.result.username}`, 'success');
      setTimeout(() => window.location.href = '../index.html', 500);
    } else if (response.status === 404 || data.code === 404) {
      showToast('用户不存在', 'error');
    } else if (response.status === 401 || data.code === 401) {
      showToast('密码错误', 'error');
    } else {
      showToast(data.message || '登录失败，请稍后再试', 'error');
    }
  } catch (error) {
    console.error('login request error', error);
    showToast('网络异常，请稍后再试', 'error');
  }
});