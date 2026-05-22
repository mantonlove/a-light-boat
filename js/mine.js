/**
 * 轻舟 Qingzhou — mine.html 页面逻辑
 */

let currentMode = 'classic';
const FONT_SIZE_MAP = { small: '12px', medium: '16px', large: '24px', xlarge: '32px' };

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  // 优先使用 localStorage 记住用户最后选择
  currentMode = Storage.get('qingzhou_mode') || params.get('mode') || 'classic';
  Storage.set('qingzhou_mode', currentMode);
  document.body.className = 'mode-' + currentMode;

  // 应用字体大小
  const savedFontSize = Storage.get('qingzhou_fontSize') || 'medium';
  document.documentElement.style.fontSize = FONT_SIZE_MAP[savedFontSize] || '16px';

  renderModeSelector();
  renderFontSize();
  renderVoiceToggle();
  renderRiskProfile();
  renderArchive();
  renderPrefs();
});

function goBack() {
  window.location.href = 'chat.html?mode=' + currentMode;
}

// ── Mode Selector ──
function renderModeSelector() {
  const container = document.getElementById('modeSelector');
  const modes = [
    { id: 'youth', name: '青春版', icon: '🎯' },
    { id: 'senior', name: '关怀版', icon: '🌅' },
    { id: 'classic', name: '经典版', icon: '💼' }
  ];
  container.innerHTML = '';
  modes.forEach(m => {
    const div = document.createElement('div');
    div.className = 'mode-option' + (currentMode === m.id ? ' active' : '');
    div.innerHTML = `<div style="font-size:24px;">${m.icon}</div><div>${m.name}</div>`;
    div.onclick = () => {
      currentMode = m.id;
      Storage.set('qingzhou_mode', m.id);
      document.body.className = 'mode-' + m.id;
      renderModeSelector();
      showToast('已切换到 ' + m.name);
    };
    container.appendChild(div);
  });
}

// ── Font Size ──
function renderFontSize() {
  const row = document.getElementById('fontSizeRow');
  const sizes = [
    { id: 'small', label: '小' },
    { id: 'medium', label: '中' },
    { id: 'large', label: '大' },
    { id: 'xlarge', label: '超大' }
  ];
  const current = Storage.get('qingzhou_fontSize') || 'medium';
  row.innerHTML = '';
  sizes.forEach(s => {
    const btn = document.createElement('span');
    btn.className = 'font-option' + (current === s.id ? ' active' : '');
    btn.textContent = s.label;
    btn.onclick = () => {
      Storage.set('qingzhou_fontSize', s.id);
      document.documentElement.style.fontSize = FONT_SIZE_MAP[s.id] || '16px';
      renderFontSize();
    };
    row.appendChild(btn);
  });
}

// ── Voice Toggle ──
function renderVoiceToggle() {
  const toggle = document.getElementById('voiceToggle');
  if (Storage.get('qingzhou_voiceEnabled')) toggle.classList.add('on');
}
function toggleVoice() {
  const toggle = document.getElementById('voiceToggle');
  const enabled = !Storage.get('qingzhou_voiceEnabled');
  Storage.set('qingzhou_voiceEnabled', enabled);
  if (enabled) toggle.classList.add('on'); else toggle.classList.remove('on');
}

// ── Risk Profile ──
function renderRiskProfile() {
  const risk = Storage.get('qingzhou_riskProfile');
  const detail = document.getElementById('riskDetail');
  if (!risk) {
    detail.innerHTML = '<p style="color:var(--text-muted);font-size:var(--font-size-sm);">尚未完成风险评估。轻舟会根据对话逐步了解您的风险偏好，您也可以主动开始评估。</p>';
    return;
  }
  const gaugePercent = (risk.score / 54) * 100;
  detail.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:var(--font-size-lg);font-weight:700;">${risk.label}（${risk.level}）</span>
      <span class="risk-score">评分 ${risk.score}/54</span>
    </div>
    <div class="risk-gauge"><div class="gauge-dot" style="left:${gaugePercent}%;"></div></div>
    <div class="risk-labels"><span>保守</span><span>稳健</span><span>平衡</span><span>进取</span><span>激进</span></div>
    <div style="margin-top:12px;font-size:var(--font-size-sm);color:var(--text-secondary);">
      <div>可承受最大回撤：${risk.maxDrawdown}</div>
      <div>最大建议权益仓位：${parseInt(risk.maxEquityRatio * 100)}%</div>
    </div>
  `;
  document.getElementById('profileRisk').textContent = risk.label;
}

// ── Archive with Timeline ──
function renderArchive() {
  const profile = Storage.get('qingzhou_userProfile') || {};
  const fields = [
    { key: 'goal', label: '投资目标' },
    { key: 'horizon', label: '投资期限' },
    { key: 'amount', label: '可投金额', format: v => v ? v + ' 元' : '—' },
    { key: 'income', label: '收入来源' },
    { key: 'interests', label: '关注领域', format: v => Array.isArray(v) ? v.join('、') : (v || '—') }
  ];

  const history = Storage.getProfileHistory();
  let html = '';

  fields.forEach(f => {
    const val = profile[f.key];
    const display = f.format ? f.format(val) : (val || '—');
    html += `<div class="toggle-row" style="flex-wrap:wrap;">
      <div style="flex:1;">
        <div class="toggle-label">${f.label}</div>
        <span style="font-size:var(--font-size-msg);font-weight:600;">${display}</span>
        <button class="timeline-toggle" onclick="toggleTimeline(this, '${f.key}')">🕐</button>
        <div class="timeline-list" id="timeline-${f.key}"></div>
      </div>
    </div>`;
  });

  html += '<div style="text-align:center;margin-top:12px;"><button class="retry-btn" onclick="showToast(\'档案已导出（模拟）\')">导出档案</button></div>';
  document.getElementById('archiveContent').innerHTML = html;

  fields.forEach(f => {
    const list = document.getElementById('timeline-' + f.key);
    if (!list) return;
    const items = history.filter(h => h.field === f.key);
    list.innerHTML = items.length === 0
      ? '<div class="timeline-item" style="color:var(--text-muted);">暂无变更记录</div>'
      : items.map(h => `
        <div class="timeline-item">
          <span class="time">${new Date(h.timestamp).toLocaleString('zh-CN')}</span>
          <span class="source">[${h.source}]</span>
          ${h.oldValue || '无'} → ${h.newValue}
          ${h.context ? '<br><span style="color:var(--text-muted);">"' + h.context + '"</span>' : ''}
        </div>
      `).join('');
  });
}

window.toggleTimeline = function(btn, key) {
  const list = document.getElementById('timeline-' + key);
  if (!list) return;
  list.classList.toggle('open');
};

// ── Preferences ──
function renderPrefs() {
  const prefs = Storage.get('qingzhou_preferences') || {};
  ['recommendByRisk', 'recommendByHorizon', 'marketHotPush', 'weeklyReport'].forEach((key, i) => {
    const el = document.getElementById('pref' + (i + 1));
    if (prefs[key]) el.classList.add('on'); else el.classList.remove('on');
  });
}

window.togglePref = function(key, el) {
  const prefs = Storage.get('qingzhou_preferences') || {};
  prefs[key] = !prefs[key];
  Storage.set('qingzhou_preferences', prefs);
  if (prefs[key]) el.classList.add('on'); else el.classList.remove('on');
};

// ── Account Actions ──
function switchAccount() {
  if (confirm('切换账号将清除当前设置。确认？')) {
    Storage.clearAll();
    window.location.href = 'index.html';
  }
}

function logout() {
  if (confirm('退出后对话记录将清空，但已保存的个人档案和风险评估结果会保留。确认退出？')) {
    Storage.logout();
    window.location.href = 'index.html';
  }
}

function editProfile() {
  const name = prompt('输入昵称：', document.getElementById('profileName').textContent);
  if (name) {
    const info = Storage.get('qingzhou_userInfo') || {};
    info.nickname = name;
    Storage.set('qingzhou_userInfo', info);
    document.getElementById('profileName').textContent = name;
    showToast('昵称已更新');
  }
}

function changePhone() {
  const phone = prompt('输入新手机号：', '13812341234');
  if (phone && phone.length >= 11) {
    const masked = phone.slice(0, 3) + '****' + phone.slice(-4);
    document.getElementById('accountPhone').textContent = masked;
    showToast('手机号已更新');
  }
}

function changeEmail() {
  const email = prompt('输入新邮箱：', 'zhangsan@example.com');
  if (email && email.includes('@')) {
    const parts = email.split('@');
    const masked = parts[0].slice(0, 3) + '***@' + parts[1];
    document.getElementById('accountEmail').textContent = masked;
    showToast('邮箱已更新');
  }
}

function changePassword() {
  const pw = prompt('输入新密码（至少6位）：');
  if (pw && pw.length >= 6) {
    showToast('密码已修改');
  } else if (pw) {
    showToast('密码长度不足6位');
  }
}

function startReassessment() {
  window.location.href = 'chat.html?mode=' + currentMode + '&action=reassess';
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
