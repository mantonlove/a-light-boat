/**
 * 轻舟 Qingzhou — account.html 账户页面逻辑
 */

let currentMode = 'classic';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  currentMode = params.get('mode') || Storage.get('qingzhou_mode') || 'classic';
  document.body.className = 'mode-' + currentMode;

  const savedFontSize = Storage.get('qingzhou_fontSize') || MODE_DEFAULT_FONT[currentMode] || 'medium';
  applyFontSize(savedFontSize);

  if (typeof showContextualTip === 'function') showContextualTip('account');
  renderAssetOverview();
  renderQuickActions();
  renderHoldings();
});

function goTo(url) {
  window.location.href = url + '?mode=' + currentMode;
}

// ── 资产总览 ──
function renderAssetOverview() {
  const el = document.getElementById('assetOverview');
  if (!el) return;

  const account = Storage.get('qingzhou_account') || {};
  const items = [
    { label: '总资产', value: formatMoney(account.totalAssets || 356800), color: 'var(--ink)' },
    { label: '活期余额', value: formatMoney(account.balance || 48600), color: '#10B981' },
    { label: '理财持仓', value: formatMoney(account.holdingsValue || 285000), color: 'var(--gold-dark)' },
    { label: '昨日收益', value: (account.yesterdayReturn || 128.5) > 0 ? '+' + formatMoney(account.yesterdayReturn || 128.5) : formatMoney(account.yesterdayReturn || 0), color: '#EF4444' }
  ];

  el.innerHTML = items.map(i => `
    <div class="dash-metric">
      <div class="dm-val" style="color:${i.color}">${i.value}</div>
      <div class="dm-lbl">${i.label}</div>
    </div>
  `).join('');
}

// ── 快捷操作 ──
function renderQuickActions() {
  const el = document.getElementById('quickActions');
  if (!el) return;

  const actions = [
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>', label: '转账汇款', desc: '向银行卡转账' },
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>', label: '生活缴费', desc: '水电气一卡缴' },
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="18" x2="12" y2="22"/></svg>', label: '理财购买', desc: '浏览在售产品' },
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>', label: '人工客服', desc: '连线理财顾问' }
  ];

  el.innerHTML = actions.map((a, i) => `
    <div style="cursor:pointer;padding:var(--s2);border-radius:var(--r-sm);transition:all var(--transition)" onmouseover="this.style.background='var(--surface-raised)'" onmouseout="this.style.background='none'" onclick="handleQuickAction(${i})">
      <div style="color:var(--ink-70);margin-bottom:8px">${a.icon}</div>
      <div style="font-size:13px;font-weight:600">${a.label}</div>
      <div style="font-size:10px;color:var(--ink-40);margin-top:2px">${a.desc}</div>
    </div>
  `).join('');

  window._quickActions = actions;
}

window.handleQuickAction = function(idx) {
  const actions = window._quickActions || [];
  const action = actions[idx];
  if (!action) return;

  switch(idx) {
    case 0: // 转账汇款
      showTransferForm();
      break;
    case 1: // 生活缴费
      showPayForm();
      break;
    case 2: // 理财购买
      window.location.href = 'recommend.html?mode=' + currentMode;
      break;
    case 3: // 人工客服
      window.location.href = 'chat.html?mode=' + currentMode + '&action=handoff';
      break;
  }
};

function showTransferForm() {
  const modal = document.getElementById('actionModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.getElementById('actionModalTitle').textContent = '转账汇款';
  document.getElementById('actionModalBody').innerHTML = `
    <label>收款人</label><input type="text" placeholder="姓名或卡号" id="transferName">
    <label style="margin-top:12px">金额</label><input type="number" placeholder="0.00" id="transferAmount">
    <label style="margin-top:12px">备注</label><input type="text" placeholder="转账备注（选填）" id="transferNote">
  `;
  document.getElementById('actionModalConfirm').onclick = () => {
    const name = document.getElementById('transferName')?.value || '';
    const amount = document.getElementById('transferAmount')?.value || '';
    if (!name || !amount) { showToast('请填写收款人和金额'); return; }
    closeActionModal();
    showToast('转账指令已提交，请通过手机银行确认');
  };
}

function showPayForm() {
  const modal = document.getElementById('actionModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.getElementById('actionModalTitle').textContent = '生活缴费';
  document.getElementById('actionModalBody').innerHTML = `
    <label>缴费类型</label>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      <label style="display:flex;align-items:center;gap:6px;padding:10px;border:1.5px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px" onclick="document.getElementById('payType').value='水费'"><input type="radio" name="payType" value="水费" style="display:none">💧 水费</label>
      <label style="display:flex;align-items:center;gap:6px;padding:10px;border:1.5px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px" onclick="document.getElementById('payType').value='电费'"><input type="radio" name="payType" value="电费" style="display:none">⚡ 电费</label>
      <label style="display:flex;align-items:center;gap:6px;padding:10px;border:1.5px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px" onclick="document.getElementById('payType').value='燃气费'"><input type="radio" name="payType" value="燃气费" style="display:none">🔥 燃气费</label>
      <label style="display:flex;align-items:center;gap:6px;padding:10px;border:1.5px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px" onclick="document.getElementById('payType').value='通讯费'"><input type="radio" name="payType" value="通讯费" style="display:none">📱 通讯费</label>
    </div>
    <input type="hidden" id="payType" value="">
    <label>缴费金额</label><input type="number" placeholder="0.00" id="payAmount">
  `;
  document.getElementById('actionModalConfirm').onclick = () => {
    const type = document.getElementById('payType')?.value || '';
    const amount = document.getElementById('payAmount')?.value || '';
    if (!type || !amount) { showToast('请选择缴费类型并输入金额'); return; }
    closeActionModal();
    showToast(type + ' ' + amount + '元缴费已提交');
  };
}

window.closeActionModal = function() {
  const modal = document.getElementById('actionModal');
  if (modal) modal.classList.add('hidden');
};

// ── 我的持仓 ──
function renderHoldings() {
  const el = document.getElementById('holdingsList');
  if (!el) return;

  const holdings = Storage.get('qingzhou_holdings') || [
    { name: '安鑫短债 30 天', risk: 'R2', amount: 100000, return_rate: 2.3, lock_days: 30 },
    { name: '稳享固收增强 6 个月', risk: 'R3', amount: 120000, return_rate: 3.2, lock_days: 180 },
    { name: '沪深 300 指数增强', risk: 'R3', amount: 65000, return_rate: 5.8, lock_days: 0 }
  ];

  if (holdings.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:var(--s4);color:var(--ink-40);font-size:13px">暂无持仓产品</div>';
    return;
  }

  el.innerHTML = holdings.map(h => `
    <div style="padding:14px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px">
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span style="font-weight:700;font-size:13px">${h.name}</span>
          <span class="risk-badge risk-r${h.risk.replace('R','')}">${h.risk}</span>
        </div>
        <div style="font-size:11px;color:var(--ink-40)">
          持有 <strong style="color:var(--ink);font-size:14px;font-family:var(--display)">${formatMoney(h.amount)}</strong> · 年化 <strong style="color:var(--ink)">${h.return_rate}%</strong>${h.lock_days > 0 ? ' · <strong style="color:var(--ink)">' + h.lock_days + '天</strong>后到期' : ''}
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <span onclick="sendToChat('${h.name}')" style="font-size:11px;color:var(--ink);cursor:pointer;font-weight:600;white-space:nowrap">发送至聊天 ↗</span>
      </div>
    </div>
  `).join('');
}

function sendToChat(productName) {
  window.location.href = 'chat.html?mode=' + currentMode + '&q=' + encodeURIComponent('帮我看看我持有的' + productName);
}

function formatMoney(n) {
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + ' 万';
  return n.toLocaleString('zh-CN');
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
