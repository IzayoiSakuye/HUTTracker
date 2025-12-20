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
      sql = 'INSERT tracker_user_info(username,nickname,email,password) VALUES(?,?,?,MD5(?))';
      pool.query(sql, [username, nickname, email, password], (insertError) => {
        if (insertError) {
          console.error('register insert error', insertError);
          return res.status(500).json({ message: 'server error', code: 500 });
        }
        res.status(200).json({
          message: 'ok',
          code: 200,
          result: { username, nickname, email }
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
  const sql = 'SELECT id,username,nickname,email,password FROM tracker_user_info WHERE username=?';
  pool.query(sql, [username], (error, results) => {
    if (error) {
      console.error('login query error', error);
      return res.status(500).json({ message: 'server error', code: 500 });
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
        email: user.email
      }
    });
  });
 
});
 
// 指定服务器对象监听的端口号
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});