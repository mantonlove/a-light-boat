/**
 * 轻舟 Qingzhou — recommend.html 推荐中心页面逻辑
 */

let currentMode = 'classic';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  currentMode = params.get('mode') || Storage.get('qingzhou_mode') || 'classic';
  document.body.className = 'mode-' + currentMode;
  // mode badge removed from header

  // 应用字体
  const savedFontSize = Storage.get('qingzhou_fontSize') || MODE_DEFAULT_FONT[currentMode] || 'medium';
  applyFontSize(savedFontSize);

  renderRecommendations();
});

function goTo(url) {
  window.location.href = url + '?mode=' + currentMode;
}

function renderRecommendations() {
  const allocation = Storage.get('qingzhou_allocation');
  const emptyState = document.getElementById('emptyState');
  const recContent = document.getElementById('recContent');

  // 市场热点和周报始终显示
  renderMarketHot();
  renderWeeklyReport();

  if (!allocation || !allocation.allocation || allocation.allocation.length === 0) {
    emptyState.classList.remove('hidden');
    recContent.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  recContent.classList.remove('hidden');

  // Render current recommendation
  const colors = ['#FF8C42', '#6C5CE7', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];
  const pieSegments = allocation.allocation.map((a, i) => {
    const prev = allocation.allocation.slice(0, i).reduce((s, x) => s + x.ratio, 0);
    return `${colors[i]} ${prev}% ${prev + a.ratio}%`;
  }).join(', ');

  document.getElementById('currentRec').innerHTML = `
    <div style="display:flex;gap:var(--s3);align-items:flex-start;margin-bottom:var(--s3)">
      <div style="width:100px;height:100px;border-radius:50%;background:conic-gradient(${pieSegments});flex-shrink:0"></div>
      <div style="flex:1">
        <div style="font-family:var(--display);font-size:18px;font-weight:600;margin-bottom:4px">${allocation.summary ? allocation.summary.slice(0,20) : '推荐配置方案'}</div>
        <div style="font-size:10px;color:var(--ink-40);margin-bottom:12px">${allocation.generated_at ? new Date(allocation.generated_at).toLocaleDateString('zh-CN') : ''} · 基于 ${allocation.based_on?.risk_level || 'R3'}</div>
        <div style="font-size:11px;line-height:2;margin-bottom:8px">
          ${allocation.allocation.map((a,i) => `<div><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${colors[i]};margin-right:6px"></span>${a.name} · ${a.ratio}%</div>`).join('')}
        </div>
      </div>
    </div>
    <div class="product-grid">
      ${allocation.allocation.map((a,i) => `
        <div class="product-card" onclick="sendToChat('${(a.name||'').replace(/'/g,"\\'")}')">
          <div class="pc-header">
            <span class="pc-name">${a.name || '产品'}</span>
            <span class="risk-badge risk-r${(a.risk||'R3').replace('R','')}">${a.risk || 'R3'}</span>
          </div>
          <div class="pc-meta">点击查看详情</div>
          <div class="pc-actions">
            <span class="pc-detail">查看详情 →</span>
            <span class="pc-send" onclick="event.stopPropagation();sendToChat('${(a.name||'').replace(/'/g,"\\'")}')">发送至聊天 ↗</span>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="text-align:center;font-size:10px;color:var(--ink-40);margin-top:var(--s2);padding-top:var(--s2);border-top:1px solid var(--border)">
      ⚠️ 以上为参考建议，历史回测不代表未来收益。投资需谨慎。
    </div>
  `;

  // Render history
  const history = (allocation._history || []).slice(-5).reverse();
  document.getElementById('historyList').innerHTML = history.length === 0
    ? '<div style="font-size:12px;color:var(--ink-40);padding:8px">暂无历史推荐</div>'
    : history.map(h => `
        <div style="padding:12px;background:var(--surface);border-radius:var(--r-sm);margin-bottom:8px;cursor:pointer">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-weight:700;font-size:13px">${h.summary || '历史方案'}</span>
            <span style="font-size:10px;color:var(--ink-40)">${h.generated_at ? new Date(h.generated_at).toLocaleDateString('zh-CN') : ''}</span>
          </div>
          <div style="font-size:10px;color:var(--ink-40)">${(h.allocation||[]).map(a=>a.name+' '+a.ratio+'%').join(' · ') || ''}</div>
        </div>
      `).join('');
}

function renderMarketHot() {
  const el = document.getElementById('marketHot');
  if (!el) return;
  const section = el.closest('.mine-section');
  const prefs = Storage.get('qingzhou_preferences') || {};
  if (!prefs.marketHotPush) {
    if (section) section.classList.add('hidden');
    return;
  }
  if (section) section.classList.remove('hidden');

  // Use MARKET_DATA from market_data.js if available, otherwise show sample
  const marketData = typeof MARKET_DATA !== 'undefined' ? MARKET_DATA : null;
  const items = [];

  if (marketData) {
    if (marketData.market_brief) {
      items.push({ text: marketData.market_brief.slice(0, 120), time: (marketData.update_time || '').slice(0, 10) });
    }
    if (marketData.key_indicators) {
      const ki = marketData.key_indicators;
      if (ki.lpr_1y) items.push({ text: `最新 LPR 1年期：${ki.lpr_1y}，5年期：${ki.lpr_5y || '—'}`, time: '' });
      if (ki.bond_10y) items.push({ text: `10年期国债收益率：${ki.bond_10y}`, time: '' });
    }
  }

  // Fallback sample data
  if (items.length === 0) {
    items.push(
      { text: 'LPR 连续 6 个月保持不变，1年期 3.10%，5年期 3.60%', time: '05-24' },
      { text: '10年期国债收益率下行至 2.75%，利好固收类产品', time: '05-23' },
      { text: '沪深 300 近一周上涨 1.8%，权益市场情绪回暖', time: '05-22' }
    );
  }

  el.innerHTML = items.map(i => `
    <div style="padding:12px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <div style="font-size:13px;color:var(--ink);line-height:1.6">${i.text}</div>
      ${i.time ? `<span style="font-size:10px;color:var(--ink-40);flex-shrink:0;white-space:nowrap">${i.time}</span>` : ''}
    </div>
  `).join('');
}

function renderWeeklyReport() {
  const el = document.getElementById('weeklyReport');
  if (!el) return;
  const section = el.closest('.mine-section');
  const prefs = Storage.get('qingzhou_preferences') || {};
  if (!prefs.weeklyReport) {
    if (section) section.classList.add('hidden');
    return;
  }
  if (section) section.classList.remove('hidden');

  const marketData = typeof MARKET_DATA !== 'undefined' ? MARKET_DATA : null;

  el.innerHTML = `
    <div style="font-size:13px;color:var(--ink-70);line-height:2">
      <div style="margin-bottom:12px">
        <div style="font-weight:700;color:var(--ink);margin-bottom:4px">宏观一览</div>
        <div>· LPR：1年期 3.10% / 5年期 3.60%（连续 6 月不变）</div>
        <div>· 国债 10Y：2.75%（周环比 -5bp）</div>
        <div>· 人民币汇率：7.24（周环比 -0.3%）</div>
      </div>
      <div style="margin-bottom:12px">
        <div style="font-weight:700;color:var(--ink);margin-bottom:4px">资产表现（本周）</div>
        <div>· 固收类：+0.12% · 权益类：+1.80% · 商品类：-0.45%</div>
      </div>
      <div style="margin-bottom:12px">
        <div style="font-weight:700;color:var(--ink);margin-bottom:4px">与你相关</div>
        <div>· 您关注的固收+产品本周表现稳健，组合预估 +0.3%</div>
        <div>· 指数增强类产品受益于权益反弹，周涨幅 +1.5%</div>
      </div>
      <div>
        <div style="font-weight:700;color:var(--ink);margin-bottom:4px">下周关注</div>
        <div>· 6月 LPR 报价窗口 · 美联储议息会议纪要发布</div>
      </div>
    </div>
    <div style="text-align:center;font-size:10px;color:var(--ink-40);margin-top:var(--s2);padding-top:var(--s2);border-top:1px solid var(--border)">
      📅 周报 · ${marketData ? (marketData.update_time || '').slice(0,10) : '2026-05-24'} · 数据来源：央行/中债登/沪深交易所
    </div>
  `;
}

function sendToChat(productName) {
  window.location.href = 'chat.html?mode=' + currentMode + '&q=' + encodeURIComponent('帮我看看' + productName);
}

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
