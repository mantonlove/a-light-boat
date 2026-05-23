/**
 * 轻舟 Qingzhou — mine.html 页面逻辑
 */

let currentMode = 'classic';
const MODE_NAMES = { classic: '经典版', senior: '关怀版', youth: '青春版' };
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
  renderVoicePresets();
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
    document.getElementById('profileAvatar').innerHTML = `<img src="${userInfo.avatar}" style="width:100%;height:100%;border-radius:16px;object-fit:cover;">`;
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
  applyFontSize(Storage.get('qingzhou_fontSize') || MODE_DEFAULT_FONT[currentMode] || 'medium');
  renderModeSelector();
  showToast('已切换到 ' + (MODE_NAMES[currentMode] || '经典版'));
}

function goBack() {
  window.location.href = 'chat.html?mode=' + (Storage.get('qingzhou_mode') || currentMode);
}

// ── Mode Selector ──
const MODE_ICONS = {
  classic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 18v-7"/><path d="M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/></svg>',
  senior: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762"/></svg>',
  youth: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>'
};

function renderModeSelector() {
  const container = document.getElementById('modeSelector');
  const modes = [
    { id: 'classic', name: '经典版' },
    { id: 'senior', name: '关怀版' },
    { id: 'youth', name: '青春版' }
  ];
  container.innerHTML = '';
  modes.forEach(m => {
    const div = document.createElement('div');
    div.className = 'mode-opt' + (currentMode === m.id ? ' active' : '');
    div.innerHTML = `<div class="m-icon">${MODE_ICONS[m.id]}</div><div class="m-label">${m.name}</div>`;
    div.onclick = () => {
      currentMode = m.id;
      Storage.set('qingzhou_mode', m.id);
      document.body.className = 'mode-' + m.id;
      const defaultFont = MODE_DEFAULT_FONT[m.id] || 'medium';
      Storage.set('qingzhou_fontSize', defaultFont);
      applyFontSize(defaultFont);
      renderFontSize();
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
    btn.className = 'font-opt' + (current === s.id ? ' active' : '');
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
    detail.innerHTML = '<p style="color:#6B7A8C;font-size:var(--fs-sm);">尚未完成风险评估。轻舟会根据对话逐步了解您的风险偏好，您也可以主动开始评估。</p>';
    return;
  }
  const gaugePercent = (risk.score / 54) * 100;
  detail.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:var(--fs-lg);font-weight:700;">${risk.label}（${risk.level}）</span>
      <span style="font-size:var(--fs-sm);color:#6B7A8C;">评分 ${risk.score}/54</span>
    </div>
    <div class="risk-gauge"><div class="risk-dot" style="left:${gaugePercent}%;"></div></div>
    <div class="risk-labels"><span>保守</span><span>稳健</span><span>平衡</span><span>进取</span><span>激进</span></div>
    <div style="margin-top:12px;font-size:var(--fs-sm);color:#3A4A5C;">
      <div>可承受最大回撤：${risk.maxDrawdown}</div>
      <div>最大建议权益仓位：${parseInt(risk.maxEquityRatio * 100)}%</div>
    </div>
  `;
  document.getElementById('profileRisk').textContent = risk.label;
}

// ── Archive with Timeline ──
function renderArchive() {
  const profile = Storage.get('qingzhou_userProfile') || {};
  const risk = Storage.get('qingzhou_riskProfile');
  const history = Storage.getProfileHistory();

  // 分组展示，用卡片网格
  const groups = [
    { name:'基础画像', icon:'👤', fields:[
      { key:'age', label:'年龄段', fmt:v=>v||'—', hint:'AI对话中提及' },
      { key:'occupation', label:'职业', fmt:v=>v||'—', hint:'自由职业/上班族/退休等' },
      { key:'income', label:'年收入', fmt:v=>v||'—', hint:'影响投资能力评估' },
      { key:'family', label:'家庭状况', fmt:v=>v||'—', hint:'已婚/有子女/赡养老人' },
    ]},
    { name:'财务画像', icon:'💰', fields:[
      { key:'amount', label:'可投金额', fmt:v=>v?(v>=10000?(v/10000).toFixed(0)+'万元':v.toLocaleString()+'元'):'—', hint:'可用于理财的总资金' },
      { key:'horizon', label:'投资期限', fmt:v=>v||'—', hint:'短期<1年/中期1-3年/长期>3年' },
      { key:'liquidity', label:'流动性需求', fmt:v=>v||'—', hint:'是否需要随时可取用' },
      { key:'existingAssets', label:'现有资产', fmt:v=>v||'—', hint:'房产/股票/基金/存款等' },
      { key:'liabilities', label:'负债情况', fmt:v=>v||'—', hint:'房贷/车贷/信用贷等' },
    ]},
    { name:'投资偏好', icon:'🎯', fields:[
      { key:'goal', label:'投资目标', fmt:v=>v||'—', hint:'教育/养老/购房/财富增值' },
      { key:'experience', label:'投资经验', fmt:v=>v||'—', hint:'几乎没有/1-3年/3年以上' },
      { key:'interests', label:'关注领域', fmt:v=>Array.isArray(v)?v.join('、'):(v||'—'), hint:'固收/指数/ESG/科技等' },
      { key:'riskComfort', label:'风险态度', fmt:v=>v||(risk?risk.label:'—'), hint:'来自风险评估+对话' },
    ]},
  ];

  let html = '';
  groups.forEach(g => {
    const filled = g.fields.filter(f => profile[f.key]).length;
    html += `<div style="margin-bottom:24px;">`;
    html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
      <span style="font-size:var(--fs-base);">${g.icon}</span>
      <span style="font-size:var(--fs-sm);font-weight:700;color:#0F1A2A;">${g.name}</span>
      <span style="font-size:var(--fs-sm);color:#6B7A8C;">${filled}/${g.fields.length} 项已填写</span>
    </div>`;
    html += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;">`;

    g.fields.forEach(f => {
      const val = profile[f.key];
      const display = f.fmt(val);
      const isSet = val && val !== '';
      html += `<div style="background:#fff;border:1px solid ${isSet?'#C8A45C':'#E4E8EC'};border-radius:12px;padding:14px 16px;transition:all .2s;cursor:pointer;"
        onclick="editArchiveField('${f.key}','${f.label}','${(val||'').toString().replace(/'/g,"\\'")}')"
        onmouseover="this.style.borderColor='#0A1628';this.style.boxShadow='0 2px 8px rgba(10,22,40,.06)'"
        onmouseout="this.style.borderColor='${isSet?'#C8A45C':'#E4E8EC'}';this.style.boxShadow='none'"
        title="点击编辑">`;
      html += `<div style="font-size:var(--fs-sm);color:#6B7A8C;margin-bottom:4px;">${f.label}</div>`;
      html += `<div style="font-size:var(--fs-base);font-weight:600;color:${isSet?'#0F1A2A':'#A0ACB8'};" id="archiveVal-${f.key}">${display}</div>`;
      html += `<div style="font-size:var(--fs-sm);color:#A0ACB8;margin-top:4px;">${isSet?'':f.hint}</div>`;
      html += `</div>`;
    });

    html += `</div></div>`;
  });

  document.getElementById('archiveContent').innerHTML = html;

  // Timeline population
  const allFields = groups.flatMap(g => g.fields);
  allFields.forEach(f => {
    const list = document.getElementById('timeline-' + f.key);
    if (!list) return;
    const items = history.filter(h => h.field === f.key);
    list.innerHTML = items.length === 0
      ? '<div>暂无变更记录</div>'
      : items.map(h => `
        <div style="padding:2px 0;font-size:var(--fs-sm);">
          ${new Date(h.timestamp).toLocaleString('zh-CN')}
          [${({chat_extraction:'对话提取',manual_edit:'手动修改',risk_assessment:'风险评估',chat_confirmed:'对话确认',system_default:'系统默认'})[h.source]||h.source}]
          ${h.oldValue||'无'} → ${h.newValue}
        </div>
      `).join('');
  });
}

window.toggleTimeline = function(btn, key) {
  const list = document.getElementById('timeline-' + key);
  if (!list) return;
  list.style.display = list.style.display === 'none' ? 'block' : 'none';
};

// ── Preferences ──
const PREF_ITEMS = [
  { key: 'recommendByRisk', label: '根据风险偏好推荐' },
  { key: 'recommendByHorizon', label: '根据投资期限筛选' },
  { key: 'marketHotPush', label: '市场热点推送' },
  { key: 'weeklyReport', label: '每周市场周报' }
];

function renderPrefs() {
  const container = document.getElementById('prefsBody');
  if (!container) return;
  const prefs = Storage.get('qingzhou_preferences') || {};
  container.innerHTML = PREF_ITEMS.map(p => `
    <div class="trow">
      <div class="tl">${p.label}</div>
      <div class="toggle${prefs[p.key] ? ' on' : ''}" onclick="togglePref('${p.key}',this)"></div>
    </div>
  `).join('');
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

// ── Voice Preset Selection ──
function renderVoicePresets() {
  const container = document.getElementById('voicePresetRow');
  if (!container) return;
  const currentId = Storage.get('qingzhou_voicePreset') || 'female_sweet';
  const presets = typeof VOICE_PRESETS !== 'undefined' ? VOICE_PRESETS : [
    { id: 'female_sweet', name: '甜美女生', desc: '亲切温暖，自然流畅', icon: '🎙️' },
    { id: 'male_warm', name: '温暖男生', desc: '低沉稳重，专业可信', icon: '🎧' },
    { id: 'male_podcast', name: '播客男生', desc: '磁性醇厚，娓娓道来', icon: '🎵' }
  ];
  container.innerHTML = presets.map(v => `
    <div class="voice-row${v.id === currentId ? ' active' : ''}" onclick="selectVoice('${v.id}')">
      <div class="voice-radio"></div>
      <div class="voice-label">
        <div class="voice-name">${v.icon} ${v.name}</div>
        <div class="voice-desc">${v.desc}</div>
      </div>
      <button class="voice-test-btn" onclick="event.stopPropagation();previewVoice('${v.id}')">试听</button>
    </div>
  `).join('');
}

function selectVoice(id) {
  Storage.set('qingzhou_voicePreset', id);
  renderVoicePresets();
  showToast('语音音色已切换');
}

// 全局音频引用，预览时停止上一个
let _previewAudio = null;

function previewVoice(id) {
  // 停止正在播放的预览
  if (_previewAudio) {
    _previewAudio.pause();
    _previewAudio = null;
  }

  const presets = typeof VOICE_PRESETS !== 'undefined' ? VOICE_PRESETS : [
    { id: 'female_sweet', name: '甜美女生', rate: 1.3 },
    { id: 'male_warm', name: '温暖男生', rate: 1.3 },
    { id: 'male_podcast', name: '播客男生', rate: 1.3 }
  ];
  const preset = presets.find(v => v.id === id) || presets[0];
  const text = '您好，我是轻舟，您的智慧银行理财顾问。很高兴为您服务。';

  // 优先使用 server.py TTS（macOS say 命令，音质好）
  fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice: id, rate: preset.rate })
  })
  .then(res => {
    if (!res.ok) throw new Error('TTS server error');
    return res.blob();
  })
  .then(blob => {
    _previewAudio = new Audio(URL.createObjectURL(blob));
    _previewAudio.play();
    showToast('试听中...');
  })
  .catch(() => {
    // Fallback: Web Speech API
    if (!('speechSynthesis' in window)) { showToast('您的浏览器不支持语音合成'); return; }
    speechSynthesis.cancel();
    const doPreview = (voices) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = preset.rate;
      if (typeof matchVoice === 'function') {
        const voice = matchVoice(preset, voices || []);
        if (voice) utterance.voice = voice;
      }
      speechSynthesis.speak(utterance);
      showToast('试听中...');
    };
    if (typeof loadVoices === 'function') {
      loadVoices().then(doPreview);
    } else {
      doPreview([]);
    }
  });
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
