// 实现悬停变色
function hoverColor(elementId){
  // 按id获取容器
  const recent = document.getElementById(elementId);
  if (recent) {
    // 添加鼠标悬停事件监听器
    recent.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a');
      if (link && recent.contains(link)) {
        link.style.color = '#580d55';
      }
    });
    // 添加鼠标移出事件监听器
    recent.addEventListener('mouseout', (e) => {
      const link = e.target.closest('a');
      if (link && recent.contains(link)) {
        link.style.color = '';
      }
    });
  }
}
// 监听，当HTML文档完全解析后执行下面的函数
document.addEventListener('DOMContentLoaded', function() {
  const contestContainer = document.getElementById('show-contest');
  const recentContestContainer = document.getElementById('show-recent-contest');
  const runningContestContainer = document.getElementById('show-running-contest');

  // 默认隐藏“正在进行”的比赛容器
  runningContestContainer.style.display = 'none';
  recentContestContainer.style.display = 'none';

  /**
   * 直接使用API接口，控制台会显示错误：
   * blocked by CORS policy: no 'Access-Control-Allow-Origin' header is present on the requested resource
   * 因为目标服务器没有配置跨域访问权限
   * 我们这里需要使用CORS跨域代理来防止被阻挡
   */
  const apiUrl = 'https://algcontest.rainng.com';
  const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(apiUrl);
  const cfApiUrl = 'https://codeforces.com/api/contest.list';

  let errorFlagDom = false;
  let errorFlagOvse = false;
  // 牛客的比赛
  fetch(proxyUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {

      const contests = JSON.parse(data.contents);
      const nowTimeStamp = Date.now() / 1000;
      const filterContest = contests.filter(contest =>{
            return contest.oj === 'NowCoder';
      });

      let runningContests = [];
      let upcomingContests = [];
      // 将读取到的比赛进行分类
      filterContest.forEach(contest => {
        if (nowTimeStamp >= contest.startTimeStamp && nowTimeStamp <= contest.endTimeStamp) {
          runningContests.push(contest);
        } else if (contest.startTimeStamp > nowTimeStamp) {
          upcomingContests.push(contest);
        }
      });

      // 正在进行的比赛
      if (runningContests.length > 0) {
        if (!runningContestContainer.querySelector('.running-title')){
          const runningTitle = document.createElement('h2');
          runningTitle.className = 'running-title';
          runningTitle.innerText = "正在进行";
          runningContestContainer.appendChild(runningTitle);
          runningContestContainer.style.display = 'block'; // 显示容器
        }
        runningContests.forEach(contest => {
          const contestElement = document.createElement('div');
          contestElement.className = "running-contest-item";
          contestElement.innerHTML = `
            <h2><a href="${contest.link}" target="_blank">${contest.name}</a></h2>
            <p><strong>平台: </strong> ${contest.oj}</p>
            <p><strong>开始时间: </strong> ${new Date(contest.startTime).toLocaleString()}</p>
            <p><strong>结束时间: </strong> ${new Date(contest.endTime).toLocaleString()}</p>
            <br>
          `;
          runningContestContainer.appendChild(contestElement);
        });
      }

      // 即将到来的比赛
      if (upcomingContests.length > 0) {
        // 防止重复
        if (runningContests.length == 0)
        {
          // 显示最近的一场比赛
          if (!recentContestContainer.querySelector('.recent-title')){
            const recentTitle = document.createElement('h2');
            recentTitle.className = 'recent-title';
            recentTitle.innerText = "即将到来";
            recentContestContainer.appendChild(recentTitle);
            recentContestContainer.style.display = 'block';
          }
        
          const recentContest = upcomingContests[0];
          const contestElement = document.createElement('div');
          contestElement.className = "recent-contest-item";
          contestElement.innerHTML = `
              <h2><a href="${recentContest.link}" target="_blank">${recentContest.name}</a></h2>
              <p><strong>平台: </strong> ${recentContest.oj}</p>
              <p><strong>开始时间: </strong> ${new Date(recentContest.startTime).toLocaleString()}</p>
              <p><strong>结束时间: </strong> ${new Date(recentContest.endTime).toLocaleString()}</p>
              <br>
            `;
          recentContestContainer.appendChild(contestElement);
        }
        
        if (!contestContainer.querySelector('.future-title')){
          const futureTitle = document.createElement('h2');
          futureTitle.className = 'future-title';
          futureTitle.innerText = "未来比赛";
          contestContainer.appendChild(futureTitle);
        }
        upcomingContests.forEach(contest => {
          const contestElement = document.createElement('li');
          contestElement.className = "contest-item";
          contestElement.innerHTML = `
            <h3><a href="${contest.link}" target="_blank">${contest.name}</a></h3>
            <p><strong>平台: </strong> ${contest.oj}</p>
            <p><strong>开始时间: </strong> ${new Date(contest.startTime).toLocaleString()}</p>
            <p><strong>结束时间: </strong> ${new Date(contest.endTime).toLocaleString()}</p>
            <br>
          `;
          contestContainer.appendChild(contestElement);
        });
      } else {
        recentContestContainer.innerHTML = '<p>没有即将到来的牛客比赛。</p>';
        contestContainer.innerHTML = '<p>没有即将到来的牛客比赛。</p>';
      }      
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
      errorFlagDom = true;
    });
    // cf的比赛
    fetch(cfApiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.status!=='OK'){
          contestContainer.innerHTML = '<p>获取比赛失败，请稍后再试。</p>'
        }
        else{
          // 筛选未开始与正在进行的比赛
          const filterContest = data.result.filter(contest =>{
            return contest.phase === 'BEFORE' || contest.phase === 'CODING';
          });

          let runningContests = [];
          let upcomingContests = [];
          
          filterContest.forEach(contest =>{
            if (contest.relativeTimeSeconds<0){
              upcomingContests.push(contest);
            }
            else{
              runningContest.push(contest);
            }
          });
          upcomingContests.reverse();

          // 正在进行的比赛
          if (runningContests.length>0){
            if (!runningContestContainer.querySelector('.running-title')){
              const runningTitle = document.createElement('h2');
              runningTitle.className = 'running-title';
              runningTitle.innerText = "正在进行";
              runningContestContainer.appendChild(runningTitle);
              runningContestContainer.style.display = 'block'; // 显示容器
            }
            
            runningContests.forEach(contest => {
              const contestElement = document.createElement('div');
              const contestLink = `https://codeforces.com/contest/${contest.id}`
              contestElement.className = "running-contest-item";
              contestElement.innerHTML = `
                <h2><a href="${contestLink}" target="_blank">${contest.name}</a></h2>
                <p><strong>平台: </strong> Codeforces</p>
                <p><strong>开始时间: </strong> ${new Date(contest.startTimeSeconds*1000).toLocaleString()}</p>
                <p><strong>结束时间: </strong> ${new Date((contest.startTimeSeconds+contest.durationSeconds)*1000).toLocaleString()}</p>
                <br>
              `;
              runningContestContainer.appendChild(contestElement);
            });
          }
          
          // 即将到来的比赛
          if (upcomingContests.length > 0) {
            // 防止重复
            if (runningContests.length == 0)
            {
              // 显示最近的一场比赛
                
              if (!recentContestContainer.querySelector('.recent-title')){
                const recentTitle = document.createElement('h2');
                recentTitle.className = 'recent-title';
                recentTitle.innerText = "即将到来";
                recentContestContainer.appendChild(recentTitle);
                recentContestContainer.style.display = 'block';
              }
              const recentContest = upcomingContests[0];
              const contestElement = document.createElement('div');
              const contestLink = `https://codeforces.com/contests`;
              contestElement.className = "recent-contest-item";
              contestElement.innerHTML = `
                <h2><a href="${contestLink}" target="_blank">${recentContest.name}</a></h2>
                <p><strong>平台: </strong> Codeforces</p>
                <p><strong>开始时间: </strong> ${new Date(recentContest.startTimeSeconds*1000).toLocaleString()}</p>
                <p><strong>结束时间: </strong> ${new Date((recentContest.startTimeSeconds+recentContest.durationSeconds)*1000).toLocaleString()}</p>
                <br>
              `;
              recentContestContainer.appendChild(contestElement);
            }
            if (!contestContainer.querySelector('.future-title')){
              const futureTitle = document.createElement('h2');
              futureTitle.className = 'future-title';
              futureTitle.innerText = "未来比赛";
              contestContainer.appendChild(futureTitle);
            }
            
            upcomingContests.forEach(contest => {
              const contestElement = document.createElement('li');
              const contestLink = `https://codeforces.com/contests`;
              contestElement.className = "contest-item";
              contestElement.innerHTML = `
                <h2><a href="${contestLink}" target="_blank">${contest.name}</a></h2>
                <p><strong>平台: </strong> Codeforces</p>
                <p><strong>开始时间: </strong> ${new Date(contest.startTimeSeconds*1000).toLocaleString()}</p>
                <p><strong>结束时间: </strong> ${new Date((contest.startTimeSeconds+contest.durationSeconds)*1000).toLocaleString()}</p>
                <br>
              `;
              contestContainer.appendChild(contestElement);
            });
          } else {
            recentContestContainer.innerHTML = '<p>没有即将到来的CF比赛。</p>';
            contestContainer.innerHTML = '<p>没有即将到来的CF比赛。</p>';
          }
        }

      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
        errorFlagOvse = true;
      });
    
    if (errorFlagDom && errorFlagOvse){
      contestContainer.innerHTML = '<p>获取比赛失败，请稍后再试。</p>'
    }
});



hoverColor('show-running-contest');
hoverColor('show-recent-contest')
hoverColor('show-contest')
