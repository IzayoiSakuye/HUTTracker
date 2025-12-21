// 检测注册合法性
const form = document.querySelector('form');
const usernameReg = document.getElementById('usernameReg');
const nicknameReg = document.getElementById('nicknameReg');
const emailReg = document.getElementById('emailReg');
const passwordReg = document.getElementById('passwordReg');
const confirmPass = document.getElementById('confirmPassword');

const usernameRegex = /^[A-Za-z0-9_]{6,20}$/; 
const passwordRegex = /^.{6,20}$/; 
const nicknameRegex = /^[\p{L}\p{N}_]{2,20}$/u;
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// 后端基址
const API_BASE = window.location.origin.startsWith('file') ? 'http://localhost:3000' : window.location.origin;

function addValidClass(input, isValid) {
  if (isValid) {
    input.classList.add('is-valid');
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
  }
}

// 悬浮框提示
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

function validReg() {
  const usernameValid = usernameRegex.test(usernameReg.value.trim());
  const nicknameValid = nicknameRegex.test(nicknameReg.value.trim());
  const emailValid = emailRegex.test(emailReg.value.trim());
  const passwordValid = passwordRegex.test(passwordReg.value.trim());
  const confirmValid = confirmPass.value === passwordReg.value && passwordValid;

  addValidClass(usernameReg, usernameValid);
  addValidClass(nicknameReg, nicknameValid);
  addValidClass(emailReg, emailValid);
  addValidClass(passwordReg, passwordValid);
  addValidClass(confirmPass, confirmValid);

  return usernameValid && nicknameValid && emailValid && passwordValid && confirmValid;
}

usernameReg.addEventListener('blur', function(){
  const name = usernameReg.value.trim();
  addValidClass(usernameReg, usernameRegex.test(name));
});
nicknameReg.addEventListener('blur', function(){
  const nickname = nicknameReg.value.trim();
  addValidClass(nicknameReg, nicknameRegex.test(nickname));
});
emailReg.addEventListener('blur', function(){
  const email = emailReg.value.trim();
  addValidClass(emailReg, emailRegex.test(email));
});
passwordReg.addEventListener('blur', function(){
  const pass = passwordReg.value.trim();
  addValidClass(passwordReg, passwordRegex.test(pass));
});
confirmPass.addEventListener('blur', function(){
  const confirmValid = confirmPass.value===passwordReg.value && passwordRegex.test(passwordReg.value.trim());
  addValidClass(confirmPass, confirmValid);
});

// 表单提交
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  if (!validReg()) {
    return;
  }

  const payload = {
    username: usernameReg.value.trim(),
    nickname: nicknameReg.value.trim(),
    email: emailReg.value.trim(),
    password: passwordReg.value.trim()
  };

  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(payload)
    });

    const data = await response.json();
    if (response.ok && data.code === 200) {
      showToast('注册成功，将自动跳转登陆页面', 'succes');
      window.location.href = 'login.html';
    } 
    else if(response.status === 409 || data.code === 409){
      showToast('用户已存在', 'error');
    }
    else {
      showToast(data.message || '注册失败', 'error');
    }
  } catch (error) {
    console.error('register request error', error);
    showToast('网络异常，请稍后再试', 'error');
  }
});
