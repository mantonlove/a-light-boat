/**
 * 轻舟 Qingzhou — recommend.html 推荐中心页面逻辑
 */

let currentMode = 'classic';
const MODE_NAMES = { classic: '经典版', senior: '关怀版', youth: '青春版' };

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  currentMode = params.get('mode') || Storage.get('qingzhou_mode') || 'classic';
  document.body.className = 'mode-' + currentMode;
  document.getElementById('modeBadge').textContent = MODE_NAMES[currentMode] || '经典版';

  // 应用字体
  const savedFontSize = Storage.get('qingzhou_fontSize') || MODE_DEFAULT_FONT[currentMode] || 'medium';
  applyFontSize(savedFontSize);

  renderRecommendations();
});

function goTo(url) {
  window.location.href = url + '?mode=' + currentMode;
}

function switchMode() {
  const modes = ['classic', 'senior', 'youth'];
  const idx = modes.indexOf(currentMode);
  currentMode = modes[(idx + 1) % 3];
  Storage.set('qingzhou_mode', currentMode);
  document.body.className = 'mode-' + currentMode;
  document.getElementById('modeBadge').textContent = MODE_NAMES[currentMode] || '经典版';
}

function renderRecommendations() {
  const allocation = Storage.get('qingzhou_allocation');
  const emptyState = document.getElementById('emptyState');
  const recContent = document.getElementById('recContent');

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
