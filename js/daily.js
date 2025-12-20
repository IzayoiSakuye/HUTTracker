
const markdown = `
# 

## 题目描述

给定一个正整数 $n$ 和一个长度为 $n-2$ 的 01 序列 $a_{2}, a_{3}, \\dots, a_{n-1}$，要求你构造一个 $n$ 个点的**无向简单连通图** $G$，使得：

- 点 $1$ 是割点，点 $n$ 不是割点。

- 对于每个 $1 < i < n$：

若 $a_{i} = 1$，则点 $i$ 在图 $G$ 中是割点；

若 $a_{i} = 0$，则点 $i$ 在图 $G$ 中不是割点。

- 图 $G$ 中各顶点的度数满足：$\\rm{deg}_1\\geq \\rm{deg}_2\\geq\\dots\\geq \\rm{deg}_n$。

如果存在多种可行的图，输出任意一种；如果不存在满足条件的图，则输出 $-1$。

简单图的定义为：无重边（即任意一对点之间至多只有一条边）且无自环（即不存在一条边两端点相同）的图。

割点的定义为：删掉该点以及它连的边后，使得图连通块个数增加的点。

## 输入格式

**本题包含多组测试数据。**

第一行一个正整数 $T$（$1\\leq T\\leq 500$），表示测试数据的组数。

对于每组数据：

第一行一个正整数 $n$（$4\\le n \\leq 1000$），表示图中点的个数。
接下来一个长度为 $n - 2$ 的 01 串，表示序列 $a_{2}, a_{3}, \\dots, a_{n-1}$。

保证所有数据的 $\\sum n\\leq 2000$。

## 输出格式

对于每组数据：

若无解，输出 $-1$；

若有解，第一行输出 $m$ （$0<m\\leq \\frac{n(n-1)}{2}$），表示图的边数。接下来 $m$ 行，每行输出两个正整数，第 $i$ 行的两个正整数表示第 $i$ 条边两个点的编号。若有多种满足题意的图，你可以输出任意一种。

## 输入输出样例 #1

### 输入 #1

\`\`\`
2
4
11
7
11000
\`\`\`

### 输出 #1

\`\`\` 
-1
6
1 2
1 3
1 4
2 5
2 6
3 7
\`\`\`

## 说明/提示

对于样例一，可以证明不存在满足题意的图。

对于样例二，图如下：

![](https://cdn.luogu.com.cn/upload/image_hosting/49d4fgs7.png?x-oss-process=image/resize,m_lfit,h_170,w_225)

其中点 $1,2,3$ 是割点，$\\rm{deg}_1\\sim\\rm{deg}_7$ 分别为：$3,3,2,1,1,1,1$，符合题意。
    `;
const container = document.getElementById('daily-content');
container.innerHTML = marked.parse(markdown);
if (window.renderMathInElement) {
  renderMathInElement(container, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false }
    ]
  });
}

// 标题组件
const title = document.getElementById('daily-title');
const prob_title = document.createElement('li');
prob_title.className = 'prob-title';
prob_title.innerHTML = '<h2>P13097 [FJCPC 2025] 割点</h2>';
title.appendChild(prob_title);

// 显示难度
const diffli = document.createElement('li');
diffli.className = 'diff';
const diff = document.createElement('div');
diff.className = 'green';
diff.innerText = '普及+/提高';
diffli.appendChild(diff);
title.appendChild(diffli);

// 跳转页面组件
const linkli = document.createElement('li');
linkli.className = 'link';
const link = document.createElement('a');
link.className = 'btn btn-outline-primary';
link.href = 'https://www.luogu.com.cn/problem/P13097';
link.target = '_blank';
link.textContent = '原题链接';
linkli.appendChild(link);
title.appendChild(linkli);

// 完成标记
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
  }
  else{
    comp.className = 'btn btn-outline-danger';
    comp.textContent = '未完成';  
  }
  
});