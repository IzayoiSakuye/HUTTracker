const navList = document.querySelector('.navbar .navbar-nav');
const raw = localStorage.getItem('user');
if (raw) {
  let user = JSON.parse(raw);

  // 删除登录注册页面
  const toDel = navList.querySelectorAll('a[href*="login.html"],a[href*="register.html"]');
  toDel.forEach(link => {
    link.closest('li').remove();
  });

  // 创建用户名的li
  const userli = document.createElement('li');
  userli.className = 'nav-item';
  const username = document.createElement('span');
  username.className = 'nav-link disabled un';
  username.textContent = user.nickname;
  userli.appendChild(username);
  navList.appendChild(userli);

  // 登出选项
  const logoutli = document.createElement('li');
  logoutli.className = 'nav-item';
  const logout = document.createElement('a');
  logout.className = 'nav-link lo';
  logout.href = '#';
  logout.textContent = '退出';
  logout.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    const toLogin = window.location.pathname.includes('/index/') ? 'login.html' : 'index/login.html';
    window.location.href = toLogin;

    // 删除用户名选项
    const toDel = navList.querySelectorAll('.un, .lo');
    toDel.forEach(link => {
      link.closest('li').remove();
    });

    // 添加登录注册页面
    const loginli = document.createElement('li');
    loginli.className = 'nav-item';
    const login = document.createElement('a');
    login.className = 'nav-link';
    login.href = window.location.pathname.includes('/index/') ? 'login.html' : 'index/login.html';
    login.textContent = '登录';
    userli.appendChild(login);
    navList.appendChild(loginli);

    const regli = document.createElement('li');
    regli.className = 'nav-item';
    const reg = document.createElement('a');
    reg.className = 'nav-link';
    reg.href = window.location.pathname.includes('/index/') ? 'register.html' : 'index/register.html';
    reg.textContent = '注册';
    userli.appendChild(reg);
    navList.appendChild(regli);
  });
  logoutli.appendChild(logout);
  navList.appendChild(logoutli);


}
