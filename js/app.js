// 加载Express模块
const express = require('express');
 
// 加载MySQL模块
const mysql = require('mysql2');
 
// 加载bodyParser模块
const bodyParser = require('body-parser');
 
// 加载MD5模块
const md5 = require('md5');

// 处理路径
const path = require('path');
 
// 创建MySQL连接池
const pool = mysql.createPool({
  host: '127.0.0.1', //MySQL服务器地址
  port: 3306, //MySQL服务器端口号
  user: 'root', //数据库用户的用户名
  password: '123456', //数据库用户密码
  database: 'tracker_user', //数据库名称
  connectionLimit: 20, //最大连接数
  charset: 'utf8mb4' //数据库服务器的编码方式
});
 
// 创建服务器对象
const server = express();
 
server.use(bodyParser.urlencoded({
  extended: false
}));

// 解析 JSON 请求体，便于 fetch 提交
server.use(express.json());
 
 
// 加载CORS模块
const cors = require('cors');
 
// 使用CORS中间件
server.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5050', 'http://127.0.0.1:5050'],
  optionsSuccessStatus: 200
}));

// 前端静态文件，便于直接通过 3000 访问页面
server.use(express.static(path.join(__dirname, '..')));

// 健康检查
server.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// 简单的统一错误响应
function serverError(res, tag, error) {
  console.error(tag, error);
  res.status(500).json({ message: 'server error', code: 500 });
}

function parseJsonSafe(text, fallback) {
  try {
    const obj = JSON.parse(text || '');
    return Array.isArray(obj) ? obj : fallback;
  } catch (_e) {
    return fallback;
  }
}
 
//用户注册接口
server.post('/register', (req, res) => {
  // 获取用户名和密码信息
  const { username, password, nickname = '', email = '' } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password are required', code: 400 });
  }
  //以username为条件进行查找操作，以保证用户名的唯一性
  let sql = 'SELECT COUNT(id) AS count FROM tracker_user_info WHERE username=?';
  pool.query(sql, [username], (error, results) => {
    if (error) {
      console.error('register count error', error);
      return res.status(500).json({ message: 'server error', code: 500 });
    }
    let count = results[0].count;
    if (count == 0) {

      // 将用户的相关信息插入到数据表
      sql = 'INSERT tracker_user_info(username,nickname,email,password,is_admin,is_superadmin) VALUES(?,?,?,MD5(?),0,0)';
      pool.query(sql, [username, nickname, email, password], (insertError) => {
        if (insertError) {
          console.error('register insert error', insertError);
          return res.status(500).json({ message: 'server error', code: 500 });
        }
        res.status(200).json({
          message: 'ok',
          code: 200,
          result: { username, nickname, email, is_admin: 0, is_superadmin: 0 }
        });
      })
    } else {
      res.status(409).json({
        message: 'user exists',
        code: 409
      });
    }
  });
});
 
// 用户登录接口
server.post('/login', (req, res) => {
  //获取用户名和密码信息
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password are required', code: 400 });
  }
  const sql = 'SELECT id,username,nickname,email,password,is_admin,is_superadmin FROM tracker_user_info WHERE username=?';
  pool.query(sql, [username], (error, results) => {
    if (error) {
      return serverError(res, 'login query error', error);
    }
    // 检查用户名
    if (results.length === 0) {
      return res.status(404).json({ message: 'user not found', code: 404 });
    }

    // 检查密码
    const user = results[0];
    const hashed = md5(password);
    if (hashed !== user.password) {
      return res.status(401).json({ message: 'incorrect password', code: 401 });
    }

    res.status(200).json({
      message: 'ok',
      code: 200,
      result: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        is_admin: Number(user.is_admin) === 1,
        is_superadmin: Number(user.is_superadmin) === 1
      }
    });
  });
 
});

// 每日一题：写入或更新（按日期唯一）
server.post('/admin/daily', (req, res) => {
  const { date, title, content, link, difficulty = 'green' } = req.body;
  if (!date || !title || !content || !link) {
    return res.status(400).json({ message: 'date,title,content,link are required', code: 400 });
  }
  const sql = `
    INSERT INTO daily_questions(date,title,content,link,difficulty,created_at,updated_at)
    VALUES(?,?,?,?,?,NOW(),NOW())
    ON DUPLICATE KEY UPDATE
      title=VALUES(title),
      content=VALUES(content),
      link=VALUES(link),
      difficulty=VALUES(difficulty),
      updated_at=NOW();
  `;
  pool.query(sql, [date, title, content, link, difficulty], (error) => {
    if (error) return serverError(res, 'admin daily upsert error', error);
    res.status(200).json({ message: 'ok', code: 200 });
  });
});

// 每日一题：最近列表
server.get('/admin/daily/recent', (_req, res) => {
  const sql = 'SELECT id,title,content,link,date,difficulty FROM daily_questions ORDER BY date DESC, id DESC LIMIT 10';
  pool.query(sql, (error, results) => {
    if (error) return serverError(res, 'admin daily recent error', error);
    res.json({ message: 'ok', code: 200, result: results || [] });
  });
});

// 每日一题：最新一条给前台 daily.js
server.get('/daily/latest', (_req, res) => {
  const sql = 'SELECT id,title,content,link,date,difficulty FROM daily_questions ORDER BY date DESC, id DESC LIMIT 1';
  pool.query(sql, (error, results) => {
    if (error) return serverError(res, 'daily latest error', error);
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'not found', code: 404 });
    }
    res.json({ message: 'ok', code: 200, result: results[0] });
  });
});

// 算法地图：新增节点
server.post('/admin/map', (req, res) => {
  const { module: mod, difficulty = '入门', title, link = '', summary = '', tags = [], resources = [] } = req.body;
  if (!mod || !title) {
    return res.status(400).json({ message: 'module and title are required', code: 400 });
  }
  const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);
  const resourcesJson = JSON.stringify(Array.isArray(resources) ? resources : []);
  const sql = `
    INSERT INTO map_nodes(module,difficulty,title,link,summary,tags,resources,created_at)
    VALUES(?,?,?,?,?,?,?,NOW());
  `;
  pool.query(sql, [mod, difficulty, title, link, summary, tagsJson, resourcesJson], (error) => {
    if (error) return serverError(res, 'admin map insert error', error);
    res.json({ message: 'ok', code: 200 });
  });
});

// 算法地图：删除节点
server.delete('/admin/map/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM map_nodes WHERE id=?';
  pool.query(sql, [id], (error, result) => {
    if (error) return serverError(res, 'admin map delete error', error);
    res.json({ message: 'ok', code: 200, deleted: result.affectedRows });
  });
});

// 算法地图：列表给前台 map.js
server.get('/map/list', (_req, res) => {
  const sql = 'SELECT id,module,difficulty,title,link,summary,tags,resources,created_at FROM map_nodes ORDER BY id DESC LIMIT 200';
  pool.query(sql, (error, results) => {
    if (error) return serverError(res, 'map list error', error);
    const mapped = (results || []).map(r => ({
      id: r.id,
      module: r.module,
      difficulty: r.difficulty,
      title: r.title,
      link: r.link,
      summary: r.summary,
      tags: parseJsonSafe(r.tags, []),
      resources: parseJsonSafe(r.resources, []),
      created_at: r.created_at
    }));
    res.json({ message: 'ok', code: 200, result: mapped });
  });
});

// 用户列表（后台展示）
server.get('/admin/users', (_req, res) => {
  const sql = 'SELECT id,username,nickname,email,is_admin,is_superadmin FROM tracker_user_info ORDER BY id ASC';
  pool.query(sql, (error, results) => {
    if (error) return serverError(res, 'admin users list error', error);
    const mapped = (results || []).map(r => ({
      id: r.id,
      username: r.username,
      nickname: r.nickname,
      email: r.email,
      is_admin: Number(r.is_admin) === 1,
      is_superadmin: Number(r.is_superadmin) === 1
    }));
    res.json({ message: 'ok', code: 200, result: mapped });
  });
});

// 切换 admin 状态（superadmin 操作；此处未做鉴权，前端自行控制）
server.post('/admin/users/:id/role', (req, res) => {
  const { id } = req.params;
  const { is_admin } = req.body;
  if (typeof is_admin === 'undefined') {
    return res.status(400).json({ message: 'is_admin is required', code: 400 });
  }
  const sql = 'UPDATE tracker_user_info SET is_admin=? WHERE id=? AND is_superadmin=0';
  pool.query(sql, [is_admin ? 1 : 0, id], (error, result) => {
    if (error) return serverError(res, 'admin role update error', error);
    res.json({ message: 'ok', code: 200, changed: result.affectedRows });
  });
});
 
// 指定服务器对象监听的端口号
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});