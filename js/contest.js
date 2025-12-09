// 实现获取最近比赛
function getRecentContest(contests){
  let earliest = null;
  for (let contest of contests){
    // console.log(contest);
    if (earliest===null || contest.startTimeStamp<earliest.startTimeStamp){
      earliest = contest;
    }
  }
  return earliest;
}
// 监听，当HTML文档完全解析后执行下面的函数
document.addEventListener('DOMContentLoaded', function() {
  const contestContainer = document.getElementById('show-contest');
  const recentContestContainer = document.getElementById('show-recent-contest');
  const runningContestContainer = document.getElementById('show-running-contest');

  // 默认隐藏“正在进行”的比赛容器
  runningContestContainer.style.display = 'none';

  /**
   * 直接使用API接口，控制台会显示错误：
   * blocked by CORS policy: no 'Access-Control-Allow-Origin' header is present on the requested resource
   * 因为目标服务器没有配置跨域访问权限
   * 我们这里需要使用CORS跨域代理来防止被阻挡
   */
  const apiUrl = 'https://algcontest.rainng.com';
  const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(apiUrl);

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

      let runningContests = [];
      let upcomingContests = [];
      // 将读取到的比赛进行分类
      contests.forEach(contest => {
        if (nowTimeStamp >= contest.startTimeStamp && nowTimeStamp <= contest.endTimeStamp) {
          runningContests.push(contest);
        } else if (contest.startTimeStamp > nowTimeStamp) {
          upcomingContests.push(contest);
        }
      });

      // 正在进行的比赛
      if (runningContests.length > 0) {
        const runningTitle = document.createElement('h2');
        runningTitle.className = 'running-title';
        runningTitle.innerText = "正在进行";
        runningContestContainer.appendChild(runningTitle);
        runningContestContainer.style.display = 'block'; // 显示容器
        runningContests.forEach(contest => {
          const contestElement = document.createElement('div');
          contestElement.className = "running-contest-item";
          contestElement.innerHTML = `
            <h2><a href="${contest.link}" target="_blank">${contest.name}</a></h2>
            <p><strong>平台: </strong> ${contest.oj}</p>
            <p><strong>开始时间: </strong> ${new Date(contest.startTime).toLocaleString()}</p>
            <p><strong>结束时间: </strong> ${new Date(contest.endTime).toLocaleString()}</p>
          `;
          runningContestContainer.appendChild(contestElement);
        });
      }

      // 即将到来的比赛
      if (upcomingContests.length > 0) {
        // 显示最近的一场比赛
        const recentContest = getRecentContest(contests);
        const recentTitle = document.createElement('h2');
        recentTitle.className = 'recent-title';
        recentTitle.innerText = "即将到来";
        recentContestContainer.appendChild(recentTitle);
        const recentContestElement = document.createElement('div');
        recentContestElement.className = "recent-contest-item";
        recentContestElement.innerHTML = `
            <h2><a href="${recentContest.link}" target="_blank">${recentContest.name}</a></h2>
            <p><strong>平台: </strong> ${recentContest.oj}</p>
            <p><strong>开始时间: </strong> ${new Date(recentContest.startTime).toLocaleString()}</p>
            <p><strong>结束时间: </strong> ${new Date(recentContest.endTime).toLocaleString()}</p>
          `;
        recentContestContainer.appendChild(recentContestElement);

        // 显示所有其他未来的比赛
        const futureContest = getRecentContest(contests);
        const futureTitle = document.createElement('h2');
        futureTitle.className = 'future-title';
        futureTitle.innerText = "未来比赛";
        contestContainer.appendChild(futureTitle);
        upcomingContests.forEach(contest => {
          const contestElement = document.createElement('div');
          contestElement.className = "contest-item";
          contestElement.innerHTML = `
            <h3><a href="${contest.link}" target="_blank">${contest.name}</a></h3>
            <p><strong>平台: </strong> ${contest.oj}</p>
            <p><strong>开始时间: </strong> ${new Date(contest.startTime).toLocaleString()}</p>
            <p><strong>结束时间: </strong> ${new Date(contest.endTime).toLocaleString()}</p>
          `;
          contestContainer.appendChild(contestElement);
        });
      } else {
        recentContestContainer.innerHTML = '<p>没有即将到来的比赛。</p>';
      }
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
      contestContainer.innerHTML = '<p>加载比赛信息失败，请稍后再试。</p>';
    });
});
