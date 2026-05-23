/**
 * 轻舟 Qingzhou — chat.html 页面逻辑
 */

const PRESET_QUESTIONS = {
  classic: ['推荐一款稳健型理财产品', '我的风险等级是什么？', '最近市场怎么样？', '如何开通手机银行理财？'],
  senior: ['什么是理财产品？', '这个保本吗？', '利息是多少？', '我该怎么买？安不安全？'],
  youth: ['20万，3年不用，怎么配？', '帮我对比两只基金', '每月定投 1000 元怎么选？', '有没有行业 ETF 推荐？']
};

const MODE_NAMES = { classic: '经典版', senior: '关怀版', youth: '青春版' };
let currentMode = 'classic';
let isListening = false;
let pendingImage = null;
let handoffActive = false;

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);

  // 优先使用 localStorage 记住用户最后选择
  // URL 参数优先（用户显式选择），localStorage 兜底
  currentMode = params.get('mode') || Storage.get('qingzhou_mode') || 'classic';
  Storage.set('qingzhou_mode', currentMode);

  document.body.className = 'mode-' + currentMode;
  document.getElementById('modeBadge').textContent = MODE_NAMES[currentMode];

  // 应用字体：优先用户保存的，否则按模式默认
  const MODE_FONT_DEFAULTS = { classic: 'medium', senior: 'large', youth: 'small' };
  const savedFontSize = Storage.get('qingzhou_fontSize');
  const defaultFont = savedFontSize || MODE_FONT_DEFAULTS[currentMode] || 'medium';
  applyFontSize(defaultFont);

  renderPresets();
  setupVoice();
  checkPrivacyGuide();
  checkVoiceGuide();

  // 恢复聊天记录（如果存在）
  const savedHistory = Storage.get('qingzhou_chatHistory');
  if (savedHistory && savedHistory.length > 0) {
    const msgContainer = document.getElementById('chatMessages');
    msgContainer.innerHTML = ''; // 清空初始欢迎消息
    savedHistory.forEach(msg => {
      // 兼容旧数据：'assistant' → 'ai'
      const role = msg.role === 'assistant' ? 'ai' : msg.role;
      // user 消息存储的是原始文本，恢复时需 escape
      const content = role === 'user' ? escapeHtml(msg.content) : msg.content;
      addMessage(role, content, msg.isFallback || false);
    });
    scrollToBottom();
  }

  const input = document.getElementById('userInput');
  input.addEventListener('input', () => {
    document.getElementById('sendBtn').disabled = !input.value.trim();
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });
  input.focus();

  // 如果是从 mine.html 来的重新评估请求
  if (params.get('action') === 'reassess') {
    setTimeout(() => startQuestionnaire(), 800);
  }
});

// ── Presets ──
function renderPresets() {
  const bar = document.getElementById('presetBar');
  bar.innerHTML = '';
  (PRESET_QUESTIONS[currentMode] || PRESET_QUESTIONS.classic).forEach(q => {
    const chip = document.createElement('span');
    chip.className = 'preset-chip';
    chip.textContent = q;
    chip.onclick = () => { document.getElementById('userInput').value = q; sendMessage(); };
    bar.appendChild(chip);
  });
}

// ── Voice ──
function setupVoice() {
  const btn = document.getElementById('voiceBtn');
  // 所有模式均显示语音按钮，关怀版默认大按钮
  btn.classList.remove('hidden');
  if (currentMode === 'senior') {
    btn.style.width = '72px';
    btn.style.height = '72px';
    btn.style.fontSize = '28px';
  } else {
    btn.style.width = '40px';
    btn.style.height = '40px';
    btn.style.fontSize = '16px';
  }
}

function toggleVoice() {
  if (isListening) { stopListening(); return; }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { showToast('您的浏览器不支持语音识别'); return; }

  const recognition = new SpeechRecognition();
  recognition.lang = 'zh-CN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  const btn = document.getElementById('voiceBtn');
  btn.classList.add('listening');
  btn.textContent = '🔴';
  isListening = true;

  recognition.start();

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    document.getElementById('userInput').value = text;
    btn.classList.remove('listening');
    btn.classList.add('success');
    btn.textContent = '🎤';
    isListening = false;
    setTimeout(() => btn.classList.remove('success'), 1000);
    sendMessage();
  };

  recognition.onerror = () => {
    btn.classList.remove('listening');
    btn.textContent = '🎤';
    isListening = false;
    if (currentMode === 'senior') {
      setTimeout(() => showToast('没听清，您再试一次？'), 300);
    }
  };

  recognition.onend = () => {
    if (isListening && currentMode === 'senior') {
      try { recognition.start(); } catch (e) { isListening = false; btn.textContent = '🎤'; }
    }
  };

  setTimeout(() => {
    if (isListening) {
      try { recognition.stop(); } catch (e) {}
      isListening = false;
      btn.classList.remove('listening');
      btn.textContent = '🎤';
    }
  }, 8000);
}

function stopListening() {
  isListening = false;
  const btn = document.getElementById('voiceBtn');
  btn.classList.remove('listening');
  btn.textContent = '🎤';
}

// ── Privacy Guide ──
function checkPrivacyGuide() {
  if (!Storage.get('qingzhou_privacyRead')) {
    document.getElementById('privacyGuide').classList.remove('hidden');
    document.getElementById('privacyTitle').textContent =
      currentMode === 'senior' ? '您的专属理财小档案' :
      currentMode === 'youth' ? '你的数据，你做主' :
      '🔒 隐私与个性化服务说明';
  }
}

function acceptPrivacy() {
  Storage.set('qingzhou_privacyRead', true);
  document.getElementById('privacyGuide').classList.add('hidden');
}

// ── Voice Guide ──
function checkVoiceGuide() {
  if (Storage.get('qingzhou_voiceGuideRead')) return;
  // 关怀版首次默认开启语音播报
  if (currentMode === 'senior') {
    Storage.set('qingzhou_voiceEnabled', true);
  }
  Storage.set('qingzhou_voiceGuideRead', true);

  if (currentMode === 'senior' && 'speechSynthesis' in window) {
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(
        '您好，我是轻舟，您的专属理财顾问。您可以直接对我说话，我会用语音回复您。试试问我：什么是理财产品？'
      );
      utterance.lang = 'zh-CN';
      utterance.rate = 0.85;
      utterance.onend = () => {
        if (Storage.get('qingzhou_voiceEnabled')) toggleVoice();
      };
      speechSynthesis.speak(utterance);
    }, 1000);
  }
}

// ── Image Upload ──
function triggerUpload() {
  document.getElementById('imageInput').click();
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    pendingImage = e.target.result;
    document.getElementById('previewImg').src = pendingImage;
    document.getElementById('imagePreview').classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  pendingImage = null;
  document.getElementById('imagePreview').classList.add('hidden');
  document.getElementById('imageInput').value = '';
}

// ── Send Message ──
async function sendMessage() {
  const input = document.getElementById('userInput');
  const text = input.value.trim();
  if (!text) return;

  if (Router.detectInjection(text)) {
    addMessage('ai', '⚠️ 抱歉，您的输入包含不符合理财顾问服务规范的内容，我无法处理该请求。作为合规的银行理财顾问，我只能基于您的财务状况和风险偏好，提供客观的产品信息和配置建议。如有具体理财需求，欢迎重新描述。');
    input.value = '';
    return;
  }

  const userContent = pendingImage
    ? `<img src="${pendingImage}" style="max-width:200px;border-radius:8px;margin-bottom:6px;display:block;"><div>${escapeHtml(text)}</div>`
    : escapeHtml(text);
  addMessage('user', userContent);
  input.value = '';
  document.getElementById('sendBtn').disabled = true;
  removeImage();

  // 保存用户消息到历史（在所有 early return 之前）
  const history = Storage.get('qingzhou_chatHistory') || [];
  history.push({ role: 'user', content: text, timestamp: new Date().toISOString() });
  Storage.set('qingzhou_chatHistory', history);

  // 重新测评 —— 先显示用户消息+清空输入框，再弹问卷
  if (/重新.*(测|评估)|再.*(测|评估|做题)|风险.*(评估|测评|问卷)|做.*(题|测评|评估)|测.*(风险|评估|问卷)/.test(text)) {
    startQuestionnaire();
    return;
  }

  const route = Router.route(text);
  if (route.action === 'compliance_block') {
    const replyText = '⚠️ 理财非存款，产品有风险，投资须谨慎。我不能对产品收益做出任何保证或承诺。您可以通过我行 APP 查看产品的完整风险说明书和过往业绩后再做判断。如有疑问，欢迎随时咨询。';
    addMessage('ai', replyText);
    history.push({ role: 'ai', content: replyText, timestamp: new Date().toISOString(), isFallback: true });
    Storage.set('qingzhou_chatHistory', history);
    return;
  }

  const loadingMsg = addLoadingDots();
  scrollToBottom();

  let result;
  try {
    result = await Api.sendMessage(text, currentMode, pendingImage);
  } catch (e) {
    console.error('sendMessage error:', e);
    result = { reply: '抱歉，系统遇到了一个小问题，请稍后再试。\n\n⚠️ 理财非存款，产品有风险，投资须谨慎。', isFallback: true };
  }

  loadingMsg.remove();

  const replyHtml = escapeHtml(result.reply).replace(/\n/g, '<br>');
  const msgEl = addMessage('ai', replyHtml, result.isFallback);

  // TTS for any mode with voice enabled
  const voiceEnabled = Storage.get('qingzhou_voiceEnabled');
  if (voiceEnabled) {
    addTtsButton(msgEl, result.reply);
    speakText(result.reply, () => {
      setTimeout(() => {
        if (Storage.get('qingzhou_voiceEnabled') && !isListening) {
          toggleVoice();
        }
      }, 1500);
    });
  } else if (currentMode === 'senior') {
    // 关怀版即使未开自动朗读也显示播放按钮
    addTtsButton(msgEl, result.reply);
  }

  if (result.toast && !result.isFallback) {
    showToast(result.toast);
  }

  history.push({ role: 'ai', content: result.reply, timestamp: new Date().toISOString(), isFallback: result.isFallback });
  Storage.set('qingzhou_chatHistory', history);

  scrollToBottom();
}

// ── Add Messages ──
function addMessage(role, content, isFallback = false) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'message ' + role;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  if (role === 'ai' || role === 'assistant') {
    avatar.innerHTML = '<img src="assets/logo.png" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
  } else {
    const userInfo = Storage.get('qingzhou_userInfo');
    if (userInfo?.avatar) {
      avatar.innerHTML = `<img src="${userInfo.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
      avatar.textContent = '👤';
    }
  }

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  if (isFallback) {
    const badge = document.createElement('span');
    badge.className = 'fallback-badge';
    badge.textContent = '离线模式 · 基于本地知识库';
    bubble.appendChild(badge);
  }

  const contentDiv = document.createElement('div');
  contentDiv.innerHTML = content;
  bubble.appendChild(contentDiv);

  if (role === 'ai' || role === 'assistant') {
    const tag = document.createElement('span');
    tag.className = 'compliance-tag';
    tag.textContent = '⚠️ 理财非存款，产品有风险，投资须谨慎。以上建议仅供参考，不构成投资承诺。';
    bubble.appendChild(tag);
  }

  div.appendChild(avatar);
  div.appendChild(bubble);
  container.appendChild(div);
  return div;
}

function addLoadingDots() {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'message ai';
  div.id = 'loadingMsg';
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.innerHTML = '<img src="assets/logo.png" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const dots = document.createElement('div');
  dots.className = 'loading-dots';
  dots.innerHTML = '<span></span><span></span><span></span>';
  bubble.appendChild(dots);
  div.appendChild(avatar);
  div.appendChild(bubble);
  container.appendChild(div);
  return { remove: () => div.remove() };
}

// ── TTS ──
function addTtsButton(msgEl, text) {
  const bubble = msgEl.querySelector('.bubble');
  const btn = document.createElement('button');
  btn.className = 'tts-btn';
  btn.textContent = '🔊';
  btn.onclick = () => {
    if (btn.classList.contains('playing')) {
      speechSynthesis.cancel();
      btn.classList.remove('playing');
      btn.textContent = '🔊';
      return;
    }
    btn.classList.add('playing');
    btn.textContent = '⏸';
    speakText(text, () => { btn.classList.remove('playing'); btn.textContent = '🔊'; });
  };
  bubble.appendChild(btn);
}

function speakText(text, onEnd) {
  if (!('speechSynthesis' in window)) { if (onEnd) onEnd(); return; }
  speechSynthesis.cancel();
  const cleanText = text.replace(/⚠️.*/s, '').replace(/\n\n/g, '。').trim();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.85;
  if (onEnd) utterance.onend = onEnd;
  speechSynthesis.speak(utterance);
}

// ── Navigation ──
function goTo(url) {
  window.location.href = url + '?mode=' + currentMode;
}

function switchMode() {
  const modes = ['classic', 'senior', 'youth'];
  const idx = modes.indexOf(currentMode);
  currentMode = modes[(idx + 1) % 3];
  Storage.set('qingzhou_mode', currentMode);
  document.body.className = 'mode-' + currentMode;
  document.getElementById('modeBadge').textContent = MODE_NAMES[currentMode];
  renderPresets();
  setupVoice();
  showToast('已切换到 ' + MODE_NAMES[currentMode]);
}

// ── Utils ──
function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function scrollToBottom() {
  const container = document.getElementById('chatMessages');
  setTimeout(() => { container.scrollTop = container.scrollHeight; }, 50);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
  return toast;
}

// ── Handoff ──
function triggerHandoff(reason) {
  handoffActive = true;
  const badge = document.getElementById('handoffBadge');
  if (badge) badge.classList.add('active');
  Storage.addKeyMoment('触发 Handoff：' + reason);

  const profile = assembleProfile();
  const syncedItems = [];
  if (profile.risk?.level) syncedItems.push('风险偏好：' + profile.risk.label + '（' + profile.risk.level + '）');
  if (profile.finance.amount) syncedItems.push('可投金额：约 ' + profile.finance.amount + ' 元');
  if (profile.finance.horizon) syncedItems.push('投资期限：' + profile.finance.horizon);

  addMessage('ai', `
    <div style="text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">📞</div>
      <strong>正在为您转接……</strong>
      <p style="font-size:var(--font-size-sm);color:var(--text-muted);margin-top:8px;">已同步以下信息给人工顾问：</p>
      <ul class="evidence-list" style="text-align:left;display:inline-block;">${syncedItems.map(i => '<li>' + i + '</li>').join('')}</ul>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:12px;">
        <button class="retry-btn" onclick="showToast('预约已提交，顾问将在工作时间回电')">预约回电</button>
        <button class="retry-btn" onclick="goTo('chat.html')" style="background:var(--bg-card);">返回</button>
      </div>
    </div>
  `);
  scrollToBottom();
}

// ── Risk Questionnaire ──
const RISK_QUESTIONS = [
  { q: '您的投资经验？', opts: ['A. 几乎没有', 'B. 1年以内', 'C. 1-3年', 'D. 3年以上'], scores: [0, 2, 4, 6] },
  { q: '您对理财产品的了解？', opts: ['A. 完全不了解', 'B. 知道一些基本概念', 'C. 比较熟悉', 'D. 非常了解'], scores: [0, 2, 4, 6] },
  { q: '您能接受的最大本金亏损？', opts: ['A. 不能接受亏损', 'B. 5%以内', 'C. 10%以内', 'D. 20%以上'], scores: [0, 3, 6, 9] },
  { q: '这笔钱的投资期限？', opts: ['A. 随时要用', 'B. 1年以内', 'C. 1-3年', 'D. 3年以上'], scores: [0, 2, 4, 6] },
  { q: '您的收入稳定性？', opts: ['A. 不稳定', 'B. 一般', 'C. 比较稳定', 'D. 非常稳定'], scores: [0, 2, 4, 6] },
  { q: '您的投资目标？', opts: ['A. 保本为主', 'B. 稳健增值', 'C. 追求较高收益', 'D. 追求高收益'], scores: [0, 3, 6, 9] },
  { q: '市场下跌10%时您会？', opts: ['A. 立刻赎回', 'B. 有点慌但观望', 'C. 继续持有', 'D. 逢低加仓'], scores: [0, 2, 4, 6] },
  { q: '可投金额占总资产比例？', opts: ['A. 大部分(>50%)', 'B. 约30-50%', 'C. 约10-30%', 'D. 小部分(<10%)'], scores: [0, 2, 4, 6] }
];

function startQuestionnaire(callback) {
  let currentQ = 0;
  let totalScore = 0;
  const answers = [];

  function showQuestion() {
    if (currentQ >= RISK_QUESTIONS.length) {
      finishQuestionnaire(totalScore, answers, callback);
      return;
    }
    const q = RISK_QUESTIONS[currentQ];
    const quizDiv = document.createElement('div');
    quizDiv.className = 'message ai';
    quizDiv.id = 'quizMsg';
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = '📋';
    const bubble = document.createElement('div');
    bubble.className = 'bubble quiz-inline';
    bubble.innerHTML = `
      <div class="quiz-progress">📋 风险偏好评估 · ${currentQ + 1}/${RISK_QUESTIONS.length}</div>
      <div class="quiz-question">${q.q}</div>
      <div class="quiz-options">${q.opts.map((o, i) => `<div class="quiz-option" data-idx="${i}"><span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;border:2px solid #C8A45C;font-size:14px;font-weight:700;color:#C8A45C;flex-shrink:0;">${'ABCD'[i]}</span><span>${o.replace(/^[A-D][.、]\s*/, '')}</span></div>`).join('')}</div>
    `;
    quizDiv.appendChild(avatar);
    quizDiv.appendChild(bubble);
    document.getElementById('chatMessages').appendChild(quizDiv);
    scrollToBottom();

    bubble.querySelectorAll('.quiz-option').forEach(opt => {
      opt.onclick = () => {
        const idx = parseInt(opt.dataset.idx);
        totalScore += q.scores[idx];
        answers.push(idx);
        quizDiv.remove();
        currentQ++;
        showQuestion();
      };
    });
  }

  function finishQuestionnaire(score, ans, cb) {
    let level, label, maxDrawdown, maxEquity;
    if (score <= 12) { level = 'R1'; label = '保守型'; maxDrawdown = '<0.5%'; maxEquity = 0; }
    else if (score <= 24) { level = 'R2'; label = '稳健型'; maxDrawdown = '<1.5%'; maxEquity = 0.10; }
    else if (score <= 36) { level = 'R3'; label = '平衡型'; maxDrawdown = '<5%'; maxEquity = 0.25; }
    else if (score <= 45) { level = 'R4'; label = '进取型'; maxDrawdown = '<15%'; maxEquity = 0.60; }
    else { level = 'R5'; label = '激进型'; maxDrawdown = '<30%'; maxEquity = 0.90; }

    const result = {
      level, score, label, maxDrawdown, maxEquityRatio: maxEquity,
      answers, assessedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString()
    };
    Storage.set('qingzhou_riskProfile', result);
    Storage.addProfileHistory({
      field: 'risk_level', oldValue: null, newValue: level,
      source: 'risk_assessment', timestamp: new Date().toISOString(),
      confidence: 1, context: '风险评估问卷', confirmed: true
    });
    Storage.addKeyMoment(`用户完成了风险评估问卷（${level}-${label}）`);

    const msgs = {
      classic: `评估完成。您的风险等级为 <strong>${level} ${label}</strong>（评分 ${score}/54）。可承受最大回撤 ${maxDrawdown}。接下来我可以为您推荐适合的产品。`,
      senior: `叔叔/阿姨，测评结果出来了——您是<strong>${label}</strong>。您可以承受 ${maxDrawdown} 以内的波动。接下来我帮您看看适合您的产品吧？`,
      youth: `风险画像出炉：<strong>${level} ${label}</strong>，评分 ${score}/54，可接受回撤 ${maxDrawdown}。接下来跑推荐？`
    };
    addMessage('ai', msgs[currentMode] || msgs.classic);

    // 清除对话历史——强制后续对话基于最新画像，不被旧数据污染
    Storage.set('qingzhou_chatHistory', []);
    showToast('对话已刷新，后续回复将基于最新画像');

    scrollToBottom();
    if (cb) cb(result);
  }

  showQuestion();
}
