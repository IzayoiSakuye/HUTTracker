// 检测注册合法性
const form = document.querySelector('form');
const usernameReg = document.getElementById('usernameReg');
const nicknameReg = document.getElementById('nicknameReg');
const emailReg = document.getElementById('emailReg');
const passwordReg = document.getElementById('passwordReg');
const confirmPass = document.getElementById('confirmPassword');

const usernameRegex = /^[A-Za-z0-9]+$/; // 仅数字和字母
const passwordRegex = /^.{6,20}$/; // 长度 6-20 位
const nicknameRegex = /^[\p{L}\p{N}_]{2,20}$/u;
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$/;

usernameReg.addEventListener('blur', function(){
  const name = usernameReg.value.trim();
  const nameValid = usernameRegex.test(name);
  if (nameValid) {
    usernameReg.classList.add('is-valid');
    usernameReg.classList.remove('is-invalid');
  } else {
    usernameReg.classList.add('is-invalid');
    usernameReg.classList.remove('is-valid');
  }
});
nicknameReg.addEventListener('blur', function(){
  const nickname = nicknameReg.value.trim();
  const nickValid = nicknameRegex.test(nickname);
  if (nickValid) {
    nicknameReg.classList.add('is-valid');
    nicknameReg.classList.remove('is-invalid');
  } else {
    nicknameReg.classList.add('is-invalid');
    nicknameReg.classList.remove('is-valid');
  }
});
emailReg.addEventListener('blur', function(){
  const email = emailReg.value.trim();
  const emailValid = emailRegex.test(email);
  if (emailValid) {
    emailReg.classList.add('is-valid');
    emailReg.classList.remove('is-invalid');
  } else {
    emailReg.classList.add('is-invalid');
    emailReg.classList.remove('is-valid');
  }
});
passwordReg.addEventListener('blur', function(){
  const pass = passwordReg.value.trim();
  const passValid = passwordRegex.test(pass);
  if (passValid) {
    passwordReg.classList.add('is-valid');
    passwordReg.classList.remove('is-invalid');
  } else {
    passwordReg.classList.add('is-invalid');
    passwordReg.classList.remove('is-valid');
  }
});
confirmPass.addEventListener('blur', function(){
  if (confirmPass.value===passwordReg.value && passwordRegex.test(passwordReg.value.trim())){
    confirmPass.classList.add('is-valid');
    confirmPass.classList.remove('is-invalid');
  } else {
    confirmPass.classList.add('is-invalid');
    confirmPass.classList.remove('is-valid');
  }
});


