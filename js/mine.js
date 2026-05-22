/**
 * 轻舟 Qingzhou — mine.html 页面逻辑
 */

let currentMode = 'classic';
// FONT_SIZE_MAP, MODE_DEFAULT_FONT, applyFontSize 定义在 storage.js（共享模块）

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  // 优先使用 localStorage 记住用户最后选择
  // URL 参数优先（用户显式选择），localStorage 兜底
  currentMode = params.get('mode') || Storage.get('qingzhou_mode') || 'classic';
  Storage.set('qingzhou_mode', currentMode);
  document.body.className = 'mode-' + currentMode;

  // 应用字体大小
  const savedFontSize = Storage.get('qingzhou_fontSize') || MODE_DEFAULT_FONT[currentMode] || 'medium';
  applyFontSize(savedFontSize);

  renderModeSelector();
  renderFontSize();
  renderVoiceToggle();
  renderRiskProfile();
  renderArchive();
  renderPrefs();

  // 恢复昵称
  const userInfo = Storage.get('qingzhou_userInfo');
  if (userInfo?.nickname) {
    document.getElementById('profileName').textContent = userInfo.nickname;
  }
  // 恢复头像
  if (userInfo?.avatar) {
    document.getElementById('profileAvatar').innerHTML = `<img src="${userInfo.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
  }

  // 恢复已保存的账户安全信息
  const savedPhone = Storage.get('qingzhou_accountPhone');
  if (savedPhone) {
    document.getElementById('accountPhone').textContent = savedPhone.slice(0, 3) + '****' + savedPhone.slice(-4);
  }
  const savedEmail = Storage.get('qingzhou_accountEmail');
  if (savedEmail) {
    const parts = savedEmail.split('@');
    document.getElementById('accountEmail').textContent = parts[0].slice(0, 3) + '***@' + (parts[1] || '');
  }
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
      // 联动字体到模式默认值
      const defaultFont = MODE_DEFAULT_FONT[m.id] || 'medium';
      Storage.set('qingzhou_fontSize', defaultFont);
      applyFontSize(defaultFont);
      renderFontSize();
      // 联动语音：关怀版默认开启
      if (m.id === 'senior') Storage.set('qingzhou_voiceEnabled', true);
      renderVoiceToggle();
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
      applyFontSize(s.id);
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
    { key: 'amount', label: '可投金额', format: v => v ? (v >= 10000 ? (v/10000).toFixed(0) + ' 万元' : v.toLocaleString() + ' 元') : '—' },
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
        <span style="font-size:var(--font-size-msg);font-weight:600;" id="archiveVal-${f.key}">${display}</span>
        <button class="retry-btn" style="padding:2px 8px;font-size:11px;margin-left:8px;" onclick="editArchiveField('${f.key}','${f.label}','${escapeHtml(String(val||''))}')">✎ 编辑</button>
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
          <span class="source">[${({chat_extraction:'对话提取',manual_edit:'手动修改',risk_assessment:'风险评估',chat_confirmed:'对话确认',system_default:'系统默认'})[h.source]||h.source}]</span>
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

// mine.html 里所有画像变更都调这个——同步刷新上下文
window._profileChangeTimer = null;
window._notifyProfileChanged = function() {
  clearTimeout(window._profileChangeTimer);
  window._profileChangeTimer = setTimeout(() => {
    if (typeof onProfileChanged === 'function') onProfileChanged();
  }, 300);
};

function logout() {
  if (confirm('退出后对话记录将清空，但已保存的个人档案和风险评估结果会保留。确认退出？')) {
    Storage.logout();
    window.location.href = 'index.html';
  }
}

// ── Modal Helpers ──
let modalCallback = null;
function openModal(title, fields, cb) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = fields.map((f, i) =>
    `<label>${f.label}</label><input type="${f.type||'text'}" id="modalField${i}" value="${f.value||''}" placeholder="${f.placeholder||''}" autocomplete="off">`
  ).join('');
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.getElementById('modalField0')?.focus();
  modalCallback = cb;
  document.getElementById('modalConfirm').onclick = () => {
    const values = fields.map((_, i) => document.getElementById('modalField' + i)?.value || '');
    closeModal();
    if (cb) cb(values.length === 1 ? values[0] : values);
  };
}
function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  modalCallback = null;
}

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const info = Storage.get('qingzhou_userInfo') || {};
    info.avatar = dataUrl;
    Storage.set('qingzhou_userInfo', info);
    document.getElementById('profileAvatar').innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    showToast('头像已更新');
  };
  reader.readAsDataURL(file);
}

function editProfile() {
  const currentName = document.getElementById('profileName').textContent;
  openModal('编辑个人资料', [
    { label: '昵称', value: currentName, placeholder: '输入您的昵称' }
  ], (name) => {
    if (name && name.trim()) {
      const info = Storage.get('qingzhou_userInfo') || {};
      info.nickname = name.trim();
      Storage.set('qingzhou_userInfo', info);
      document.getElementById('profileName').textContent = name.trim();
      showToast('昵称已更新');
    }
  });
}

function changePhone() {
  const saved = Storage.get('qingzhou_accountPhone') || '13812341234';
  openModal('更换绑定手机', [
    { label: '新手机号', type: 'tel', value: saved, placeholder: '输入11位手机号' }
  ], (phone) => {
    if (phone && phone.length >= 11) {
      const masked = phone.slice(0, 3) + '****' + phone.slice(-4);
      Storage.set('qingzhou_accountPhone', phone);
      document.getElementById('accountPhone').textContent = masked;
      showToast('手机号已更新');
    } else {
      showToast('手机号格式不正确');
    }
  });
}

function changeEmail() {
  const saved = Storage.get('qingzhou_accountEmail') || 'zhangsan@example.com';
  openModal('更换绑定邮箱', [
    { label: '新邮箱', type: 'email', value: saved, placeholder: '输入邮箱地址' }
  ], (email) => {
    if (email && email.includes('@')) {
      const parts = email.split('@');
      const masked = parts[0].slice(0, 3) + '***@' + parts[1];
      Storage.set('qingzhou_accountEmail', email);
      document.getElementById('accountEmail').textContent = masked;
      showToast('邮箱已更新');
    } else {
      showToast('邮箱格式不正确');
    }
  });
}

function changePassword() {
  openModal('修改登录密码', [
    { label: '新密码', type: 'password', placeholder: '至少6位' },
    { label: '确认新密码', type: 'password', placeholder: '再次输入' }
  ], (values) => {
    if (values[0] && values[0].length >= 6 && values[0] === values[1]) {
      Storage.set('qingzhou_accountPassword', values[0]);
      showToast('密码已修改');
    } else if (values[0] !== values[1]) {
      showToast('两次密码不一致');
    } else {
      showToast('密码长度不足6位');
    }
  });
}

function editArchiveField(key, label, currentValue) {
  openModal('编辑' + label, [
    { label: label, value: currentValue, placeholder: '输入新的' + label }
  ], (newValue) => {
    if (!newValue || !newValue.trim()) return;
    const val = newValue.trim();
    const profile = Storage.get('qingzhou_userProfile') || {};
    const oldValue = profile[key] || null;

    // 格式化：amount 去掉"元""万"等，存数字
    if (key === 'amount') {
      const num = parseInt(val.replace(/[^0-9]/g, ''));
      if (isNaN(num)) { showToast('请输入有效数字'); return; }
      profile[key] = num;
    } else if (key === 'interests') {
      profile[key] = val.split(/[,，、\s]+/).filter(Boolean);
    } else {
      profile[key] = val;
    }

    Storage.set('qingzhou_userProfile', profile);
    Storage.addProfileHistory({
      field: key, oldValue, newValue: profile[key],
      source: 'manual_edit', timestamp: new Date().toISOString(),
      confidence: 1, context: '用户在"我的"页面手动编辑', confirmed: true
    });
    if (typeof onProfileChanged === 'function') onProfileChanged();
    renderArchive();
    showToast(label + '已更新');
  });
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
