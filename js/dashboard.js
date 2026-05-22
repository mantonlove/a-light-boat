/**
 * 轻舟 Qingzhou — dashboard.html 页面逻辑
 */

let currentMode = 'classic';
let pieChart = null;
let lineChart = null;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  currentMode = params.get('mode') || Storage.get('qingzhou_mode') || 'classic';
  document.body.className = 'mode-' + currentMode;

  renderDashboard();
});

function goBack() {
  window.location.href = 'chat.html?mode=' + currentMode;
}

function renderDashboard() {
  const allocation = Storage.get('qingzhou_allocation');
  const profile = assembleProfile();

  if (!allocation || !allocation.allocation || allocation.allocation.length === 0) {
    document.getElementById('emptyState').classList.remove('hidden');
    document.getElementById('dashboardContent').classList.add('hidden');
    return;
  }

  document.getElementById('emptyState').classList.add('hidden');
  document.getElementById('dashboardContent').classList.remove('hidden');

  renderRiskGauge(profile);
  renderPieChart(allocation);
  renderMetrics(allocation);  // 内含蒙特卡洛图表渲染
  renderEvidence(allocation, profile);
}

function renderRiskGauge(profile) {
  const card = document.getElementById('riskGaugeCard');
  if (!profile.risk) {
    card.innerHTML = '<h3>风险偏好</h3><p style="color:var(--text-muted);">尚未评估</p>';
    return;
  }
  const percent = (profile.risk.score / 54) * 100;
  card.innerHTML = `
    <h3>风险偏好</h3>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
      <span style="font-size:var(--font-size-lg);font-weight:700;">${profile.risk.label} · 评分 ${profile.risk.score}/54</span>
      <button class="retry-btn" onclick="goBack()">调整风险偏好</button>
    </div>
    <div class="risk-gauge"><div class="gauge-dot" style="left:${percent}%;"></div></div>
    <div class="risk-labels"><span>保守</span><span>稳健</span><span>平衡</span><span>进取</span><span>激进</span></div>
    <p style="font-size:var(--font-size-sm);color:var(--text-muted);margin-top:8px;">基于风险评估问卷 + AI 对话分析</p>
  `;
}

function renderPieChart(allocation) {
  const ctx = document.getElementById('pieChart');
  if (pieChart) pieChart.destroy();

  const colors = ['#FF8C42', '#6C5CE7', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#8B5CF6'];
  const labels = allocation.allocation.map(a => a.name);
  const data = allocation.allocation.map(a => a.ratio);
  const bgColors = allocation.allocation.map((_, i) => colors[i % colors.length]);

  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: bgColors, borderWidth: 2, borderColor: getComputedStyle(document.body).getPropertyValue('--bg-card').trim() || '#fff' }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16, font: { size: 13 }, color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#6B7280' } }
      }
    }
  });
}

function renderLineChart(allocation) {
  const ctx = document.getElementById('lineChart');
  if (lineChart) lineChart.destroy();

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const conservative = [0, 0.3, 0.5, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 3.5];
  const base = [0, 0.4, 0.7, 1.0, 1.3, 1.6, 1.9, 2.2, 2.5, 2.8, 3.2, 4.5];
  const optimistic = [0, 0.6, 0.9, 1.3, 1.7, 2.1, 2.5, 2.9, 3.3, 3.7, 4.2, 5.5];

  const textColor = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#6B7280';

  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        { label: '保守', data: conservative, borderColor: '#F59E0B', backgroundColor: 'transparent', tension: 0.4, borderDash: [5, 5] },
        { label: '基准', data: base, borderColor: '#6C5CE7', backgroundColor: 'transparent', tension: 0.4, borderWidth: 2 },
        { label: '乐观', data: optimistic, borderColor: '#10B981', backgroundColor: 'transparent', tension: 0.4, borderDash: [5, 5] }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 }, color: textColor } }
      },
      scales: {
        y: { ticks: { callback: v => v + '%', color: textColor }, grid: { color: 'rgba(128,128,128,0.1)' } },
        x: { ticks: { color: textColor }, grid: { display: false } }
      }
    }
  });
}

function renderMetrics(allocation) {
  const row = document.getElementById('metricsRow');
  const profile = assembleProfile();
  const riskLevel = profile.risk?.level || 'R3';

  // 调用 RiskCalc 实时计算
  const simData = RiskCalc.generateSimulatedReturns(riskLevel, 36);
  const analysis = RiskCalc.analyzePortfolio(allocation.allocation, simData);

  const metrics = allocation.metrics || {};
  row.innerHTML = `
    <div class="metric-card"><div class="metric-value">${(analysis.maxDrawdown*100).toFixed(1)}%</div><div class="metric-label">最大回撤 (RiskCalc)</div></div>
    <div class="metric-card"><div class="metric-value">${analysis.sharpeRatio.toFixed(2)}</div><div class="metric-label">夏普比率 (年化)</div></div>
    <div class="metric-card"><div class="metric-value">${(analysis.annualizedVolatility*100).toFixed(1)}%</div><div class="metric-label">年化波动率</div></div>
    <div class="metric-card"><div class="metric-value">${analysis.sortinoRatio.toFixed(2)}</div><div class="metric-label">Sortino比率</div></div>
    <div class="metric-card"><div class="metric-value">${(analysis.cVaR95*100).toFixed(1)}%</div><div class="metric-label">CVaR(95%)</div></div>
    <div class="metric-card"><div class="metric-value">${analysis.calmarRatio.toFixed(2)}</div><div class="metric-label">卡尔玛比率</div></div>
  `;

  // 更新蒙特卡洛折线图
  renderMonteCarloChart(analysis.monteCarlo);
}

function renderMonteCarloChart(mc) {
  const ctx = document.getElementById('lineChart');
  if (window._mcChart) window._mcChart.destroy();

  const months = mc.paths.p50.map((_, i) => i + '月');
  const textColor = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#6B7280';

  window._mcChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        { label: '悲观(P5)', data: mc.paths.p5, borderColor: '#EF4444', tension: 0.4, borderWidth: 1.5, pointRadius: 0 },
        { label: '基准(P50)', data: mc.paths.p50, borderColor: '#6C5CE7', tension: 0.4, borderWidth: 2.5, pointRadius: 0 },
        { label: '乐观(P95)', data: mc.paths.p95, borderColor: '#10B981', tension: 0.4, borderWidth: 1.5, pointRadius: 0 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: {
        title: { display: true, text: `蒙特卡洛模拟 (${mc.simulations}次) · ${mc.years}年`, font: { size: 12 }, color: textColor },
        legend: { position: 'bottom', labels: { padding: 16, font: { size: 11 }, color: textColor } }
      },
      scales: {
        y: { ticks: { callback: v => (v/10000).toFixed(1)+'万', color: textColor }, grid: { color: 'rgba(128,128,128,0.08)' } },
        x: { ticks: { color: textColor, maxTicksLimit: 12 }, grid: { display: false } }
      }
    }
  });
}

function renderEvidence(allocation, profile) {
  const list = document.getElementById('evidenceList');
  const items = [];
  if (profile.finance.amount) items.push('您提到可投金额约 ' + profile.finance.amount + ' 元');
  if (profile.finance.horizon) items.push('投资期限 ' + profile.finance.horizon + '（从对话中了解）');
  if (profile.risk?.level) items.push('风险评估结果：' + profile.risk.label + ' ' + profile.risk.level);
  if (profile.finance.goal) items.push('投资目标：' + profile.finance.goal);
  if (allocation.based_on) {
    if (allocation.based_on.risk_score) items[2] = '风险评估结果：' + allocation.based_on.risk_level + '（评分 ' + allocation.based_on.risk_score + '）';
  }
  list.innerHTML = items.map(i => '<li>' + i + '</li>').join('');
}
