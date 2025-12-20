// 检测账密合法性
const form = document.querySelector('form');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');

const usernameRegex = /^[A-Za-z0-9]+$/; // 仅数字和字母
const passwordRegex = /^.{6,20}$/; // 长度 6-20 位



usernameInput.addEventListener('blur', () => {
  const name = usernameInput.value.trim();
  const isNameValid = usernameRegex.test(name);
  if (isNameValid) {
    usernameInput.classList.add('is-valid');
    usernameInput.classList.remove('is-invalid');
  } else {
    usernameInput.classList.add('is-invalid');
    usernameInput.classList.remove('is-valid');
  }
});

passwordInput.addEventListener('blur', () => {
  const pass = usernameInput.value.trim();
  const isPassValid = passwordRegex.test(pass);
  if (isPassValid) {
    passwordInput.classList.add('is-valid');
    passwordInput.classList.remove('is-invalid');
  } else {
    passwordInput.classList.add('is-invalid');
    passwordInput.classList.remove('is-valid');
  }
});


// 表单提交
form.addEventListener('submit', function (e) {
  e.preventDefault();

  if (validLogin(usernameInput.value, passwordInput.value)) {
    console.log('表单验证通过，可以提交');
    // 提交表单数据到后端
  }
});