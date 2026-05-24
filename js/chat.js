/**
 * 轻舟 Qingzhou — chat.html 页面逻辑
 */

const PRESET_QUESTIONS = {
  classic: ['推荐一款稳健型理财产品', '我的风险等级是什么？', '最近市场怎么样？', '如何开通手机银行理财？'],
  senior: ['什么是理财产品？', '这个保本吗？', '利息是多少？', '我该怎么买？安不安全？'],
  youth: ['20万，3年不用，怎么配？', '帮我对比两只基金', '每月定投 1000 元怎么选？', '有没有行业 ETF 推荐？']
};

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
  // mode badge removed from chat header

  // 智能欢迎语
  personalizeWelcome();

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

  // 回访变化摘要
  showReengagementSummary();
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
  btn.classList.remove('hidden');
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
  Storage.set('qingzhou_chatHistory', [
    ...(Storage.get('qingzhou_chatHistory') || []),
    { role: 'user', content: text, timestamp: new Date().toISOString() }
  ]);

  // 重新测评 —— 先显示用户消息+清空输入框，再弹问卷
  if (/重新.*(测|评估)|再.*(测|评估|做题)|风险.*(评估|测评|问卷)|做.*(题|测评|评估)|测.*(风险|评估|问卷)/.test(text)) {
    startQuestionnaire();
    return;
  }

  const route = Router.route(text);
  if (route.action === 'compliance_block') {
    const replyText = '⚠️ 理财非存款，产品有风险，投资须谨慎。我不能对产品收益做出任何保证或承诺。您可以通过我行 APP 查看产品的完整风险说明书和过往业绩后再做判断。如有疑问，欢迎随时咨询。';
    addMessage('ai', replyText);
    Storage.set('qingzhou_chatHistory', [
      ...(Storage.get('qingzhou_chatHistory') || []),
      { role: 'ai', content: replyText, timestamp: new Date().toISOString(), isFallback: true }
    ]);
    return;
  }

  // 情绪检测：焦虑/恐慌 → 先安抚，调整推荐策略偏保守
  const sentiment = route.intent === 'sentiment_anxiety' ? 'anxiety' : null;
  if (sentiment) {
    Storage.addKeyMoment('检测到用户焦虑情绪');
  }

  const loadingMsg = addLoadingDots();
  scrollToBottom();

  let result;
  try {
    result = await Api.sendMessage(text, currentMode, pendingImage, sentiment);
  } catch (e) {
    console.error('sendMessage error:', e);
    result = { reply: '抱歉，系统遇到了一个小问题，请稍后再试。\n\n⚠️ 理财非存款，产品有风险，投资须谨慎。', isFallback: true };
  }

  loadingMsg.remove();

  const replyHtml = escapeHtml(result.reply).replace(/\n/g, '<br>');
  const msgEl = addMessage('ai', replyHtml, result.isFallback);

  // 白盒解释：检测到推荐内容时，追加推荐逻辑说明
  if (/推荐|配置|建议|适合|方案/.test(result.reply) && typeof buildExplanation === 'function') {
    const explanation = buildExplanation();
    if (explanation.summary) {
      const explainDiv = document.createElement('div');
      explainDiv.style.cssText = 'margin-top:10px;padding:10px 14px;background:var(--gold-light);border-radius:var(--r-sm);font-size:11px;color:var(--ink-70);line-height:1.7';
      explainDiv.innerHTML = '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--gold-dark);margin-bottom:6px">📋 推荐依据</div>' + explanation.summary;
      msgEl.querySelector('.bubble').appendChild(explainDiv);
      Storage.addProfileHistory({
        field: 'recommendation', oldValue: null, newValue: explanation.summary,
        source: 'system_generated', timestamp: explanation.timestamp,
        confidence: 1, context: 'AI推荐白盒解释', confirmed: true
      });
    }
  }

  // 收藏按钮
  addBookmarkButton(msgEl, result.reply);

  // 始终显示播放按钮；语音开启时自动朗读
  addTtsButton(msgEl, result.reply);
  const voiceEnabled = Storage.get('qingzhou_voiceEnabled');
  if (voiceEnabled) {
    speakText(result.reply, () => {
      setTimeout(() => {
        if (Storage.get('qingzhou_voiceEnabled') && !isListening) {
          toggleVoice();
        }
      }, 1500);
    });
  }

  if (result.toast && !result.isFallback) {
    showToast(result.toast);
  }

  // 智能追问：根据 AI 回复生成 2-3 个追问按钮
  addFollowUpQuestions(msgEl, result.reply);

  // 风险重评提醒：超6个月或人生阶段变化
  checkRiskReassessmentNudge(msgEl);

  // 重新读取 history（并发调用时避免覆盖其他 sendMessage 写入的数据）
  const latestHistory = Storage.get('qingzhou_chatHistory') || [];
  latestHistory.push({ role: 'ai', content: result.reply, timestamp: new Date().toISOString(), isFallback: result.isFallback });
  Storage.set('qingzhou_chatHistory', latestHistory);

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
    avatar.innerHTML = '<img src="assets/logo.png" style="width:100%;height:100%;border-radius:10px;object-fit:cover;">';
  } else {
    const userInfo = Storage.get('qingzhou_userInfo');
    if (userInfo?.avatar) {
      avatar.innerHTML = `<img src="${userInfo.avatar}" style="width:100%;height:100%;border-radius:10px;object-fit:cover;">`;
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
  avatar.innerHTML = '<img src="assets/logo.png" style="width:100%;height:100%;border-radius:10px;object-fit:cover;">';
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

// ── Bookmark ──
function addBookmarkButton(msgEl, text) {
  const bubble = msgEl.querySelector('.bubble');
  const btn = document.createElement('button');
  btn.className = 'tts-btn';
  btn.title = '收藏此回复';
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  btn.onclick = (e) => {
    e.stopPropagation();
    const bookmarks = Storage.get('qingzhou_bookmarks') || [];
    bookmarks.push({ text: text.slice(0, 200), timestamp: new Date().toISOString() });
    Storage.set('qingzhou_bookmarks', bookmarks.slice(-20)); // 最多20条
    btn.style.color = 'var(--gold)';
    btn.style.borderColor = 'var(--gold)';
    showToast('已收藏');
  };
  bubble.appendChild(btn);
}

// ── TTS ──
function addTtsButton(msgEl, text) {
  const bubble = msgEl.querySelector('.bubble');
  const btn = document.createElement('button');
  btn.className = 'tts-btn';
  btn.title = '播放语音';
  // SVG 扬声器图标（无 emoji）
  btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
  btn.onclick = (e) => {
    e.stopPropagation();
    if (btn.classList.contains('playing')) {
      speechSynthesis.cancel();
      btn.classList.remove('playing');
      btn.title = '播放语音';
      return;
    }
    btn.classList.add('playing');
    btn.title = '停止播放';
    speakText(text, () => {
      btn.classList.remove('playing');
      btn.title = '播放语音';
    });
  };
  bubble.appendChild(btn);
}

let _ttsAudio = null;

function speakText(text, onEnd) {
  // 停止正在播放的音频
  if (_ttsAudio) {
    _ttsAudio.pause();
    _ttsAudio = null;
  }

  const cleanText = text.replace(/⚠️[^]*/g, '').replace(/\n\n/g, '。').replace(/\n/g, '').trim();
  if (!cleanText) { if (onEnd) onEnd(); return; }

  const preset = typeof getVoicePreset === 'function' ? getVoicePreset() : { id: 'female_sweet', rate: 1.3 };
  const voiceId = preset.id || 'gentle-female';

  // 优先使用 server.py TTS（macOS say 命令，音质好）
  fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: cleanText, voice: voiceId, rate: preset.rate })
  })
  .then(res => {
    if (!res.ok) throw new Error('TTS server error');
    return res.blob();
  })
  .then(blob => {
    _ttsAudio = new Audio(URL.createObjectURL(blob));
    if (onEnd) _ttsAudio.onended = () => { _ttsAudio = null; onEnd(); };
    _ttsAudio.play().catch(() => { _ttsAudio = null; if (onEnd) onEnd(); });
  })
  .catch(() => {
    // Fallback: 浏览器 Web Speech API
    if (!('speechSynthesis' in window)) { if (onEnd) onEnd(); return; }
    speechSynthesis.cancel();
    const doSpeak = (voices) => {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'zh-CN';
      utterance.rate = preset.rate;
      if (typeof matchVoice === 'function') {
        const voice = matchVoice(preset, voices || []);
        if (voice) utterance.voice = voice;
      }
      if (onEnd) utterance.onend = onEnd;
      speechSynthesis.speak(utterance);
    };
    if (typeof loadVoices === 'function') {
      loadVoices().then(doSpeak);
    } else {
      doSpeak([]);
    }
  });
}

// ── Navigation ──
function goTo(url) {
  window.location.href = url + '?mode=' + currentMode;
}

// ── 回访变化摘要 ──
function showReengagementSummary() {
  const lastVisit = Storage.get('qingzhou_lastVisit');
  if (!lastVisit) return;
  const days = Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000*60*60*24));
  if (days < 1) return; // 同日不提示

  // 收集期间变化
  const changes = [];
  const keyMoments = Storage.getKeyMoments();
  const recentMoments = keyMoments.filter(m => new Date(m.time) > new Date(lastVisit));
  if (recentMoments.length > 0) {
    changes.push(`期间发生 ${recentMoments.length} 个关键事件`);
  }

  const stages = Storage.get('qingzhou_lifeStages') || [];
  const newStages = stages.filter(s => !s.detectedAt || new Date(s.detectedAt) > new Date(lastVisit));
  if (newStages.length > 0) {
    changes.push(`检测到新的人生阶段：${newStages.map(s=>s.label).join('、')}`);
  }

  const allocation = Storage.get('qingzhou_allocation');
  if (allocation?.generated_at && new Date(allocation.generated_at) > new Date(lastVisit)) {
    changes.push('已生成新的资产配置方案');
  }

  if (changes.length === 0) return;

  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'message ai';
  div.innerHTML = `
    <div class="avatar"><img src="assets/logo.png" style="width:100%;height:100%;border-radius:10px;object-fit:cover"></div>
    <div class="bubble" style="background:var(--gold-light);color:var(--gold-dark);font-size:12px;line-height:1.8">
      <div style="font-weight:700;margin-bottom:4px">📌 距上次来访已过 ${days} 天，期间变化：</div>
      ${changes.map(c => '<div>· ' + c + '</div>').join('')}
    </div>
  `;
  container.insertBefore(div, container.firstChild);
}

// ── 智能欢迎语 ──
function personalizeWelcome() {
  const welcomeEl = document.getElementById('welcomeMsg');
  if (!welcomeEl) return;

  const profile = typeof assembleProfile === 'function' ? assembleProfile() : null;
  const hours = new Date().getHours();
  const timeGreet = hours < 12 ? '早上好' : hours < 18 ? '下午好' : '晚上好';
  const userInfo = Storage.get('qingzhou_userInfo') || {};
  const name = userInfo.nickname || '';

  // 检查画像完整度
  let greeting = '';
  if (profile?.risk && profile?.finance?.amount && profile?.finance?.horizon) {
    // 画像完整：个性化问候
    greeting = `${timeGreet}${name ? '，'+name : ''}。您的${profile.risk.level} ${profile.risk.label}画像已就绪，可以直接问我配置建议。`;
  } else if (profile?.risk) {
    // 仅有风险评估
    const missing = profile.missingFields ? profile.missingFields().join('、') : '金额和期限';
    greeting = `${timeGreet}${name ? '，'+name : ''}。您的风险评估已完成，补充${missing}后我就能为您精准推荐。`;
  } else {
    // 新用户或无画像
    const lastVisit = Storage.get('qingzhou_lastVisit');
    const today = new Date().toISOString().slice(0, 10);
    if (lastVisit && lastVisit !== today) {
      const days = Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000*60*60*24));
      greeting = `欢迎回来${name ? '，'+name : ''}！距您上次来访已过 ${days} 天。请问有什么可以帮您？`;
    } else {
      greeting = `您好${name ? '，'+name : ''}！我是轻舟，您的智慧银行理财顾问。请问有什么可以帮您？`;
    }
  }

  welcomeEl.textContent = greeting;
  Storage.set('qingzhou_lastVisit', new Date().toISOString().slice(0, 10));
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

// ── 智能追问 ──
function addFollowUpQuestions(msgEl, reply) {
  const questions = [];
  if (/推荐|配置|建议|方案/.test(reply)) {
    questions.push('收益预期是多少', '这个方案稳不稳', '有没有更保守的选项');
  } else if (/风险|R1|R2|R3|R4|R5/.test(reply)) {
    questions.push('我适合哪个等级', '怎么重新评估风险', 'R3能买R4的产品吗');
  } else if (/市场|行情|走势|经济/.test(reply)) {
    questions.push('对债市有什么影响', '现在适合加仓吗', '需要赎回吗');
  } else if (/保本|保息|安全/.test(reply)) {
    questions.push('大额存单利率多少', '存款保险保障多少', '有没有低风险产品');
  } else {
    questions.push('帮我看看持仓', '最近市场怎么样', '推荐一款稳健产品');
  }

  const bubble = msgEl.querySelector('.bubble');
  const div = document.createElement('div');
  div.style.cssText = 'margin-top:12px;padding-top:8px;border-top:1px solid var(--border);display:flex;flex-wrap:wrap;gap:6px';
  div.innerHTML = questions.slice(0, 3).map(q =>
    `<span style="padding:5px 10px;border-radius:6px;border:1px solid var(--ink-15);font-size:11px;cursor:pointer;color:var(--ink-70);transition:all var(--transition)" onmouseover="this.style.borderColor='var(--ink)';this.style.background='var(--surface-raised)'" onmouseout="this.style.borderColor='var(--ink-15)';this.style.background='none'" onclick="document.getElementById('userInput').value='${q}';sendMessage()">${q}</span>`
  ).join('');
  bubble.appendChild(div);
}

// ── 风险重评提醒 ──
function checkRiskReassessmentNudge(msgEl) {
  const risk = Storage.get('qingzhou_riskProfile');
  if (!risk) return;

  const assessedAt = new Date(risk.assessedAt);
  const monthsSince = (Date.now() - assessedAt.getTime()) / (1000*60*60*24*30);
  const stages = Storage.get('qingzhou_lifeStages') || [];
  const hasStageChange = stages.length > 0;

  if (monthsSince > 6 || hasStageChange) {
    const bubble = msgEl.querySelector('.bubble');
    const nudge = document.createElement('div');
    nudge.style.cssText = 'margin-top:10px;padding:8px 12px;background:var(--gold-light);border-radius:var(--r-sm);font-size:11px;color:var(--gold-dark);line-height:1.6';
    nudge.innerHTML = monthsSince > 6
      ? `💡 您的风险评估已超过 ${Math.floor(monthsSince)} 个月，建议<a style="color:var(--ink);cursor:pointer;text-decoration:underline" onclick="startQuestionnaire()">重新评估</a>以获得更精准的建议。`
      : '💡 您的人生阶段发生了变化，建议<a style="color:var(--ink);cursor:pointer;text-decoration:underline" onclick="startQuestionnaire()">重新评估风险</a>以确保推荐方案匹配当前状况。';
    bubble.appendChild(nudge);
  }
}

// ── Handoff ──
function triggerHandoff(reason) {
  handoffActive = true;
  Storage.addKeyMoment('触发 Handoff：' + reason);

  const profile = assembleProfile();
  const syncedItems = [];
  if (profile.risk?.level) syncedItems.push('风险偏好：' + profile.risk.label + '（' + profile.risk.level + '）');
  if (profile.finance.amount) syncedItems.push('可投金额：约 ' + profile.finance.amount + ' 元');
  if (profile.finance.horizon) syncedItems.push('投资期限：' + profile.finance.horizon);
  if (profile.finance.goal) syncedItems.push('投资目标：' + profile.finance.goal);

  // 打包最近对话摘要
  const chatHistory = Storage.get('qingzhou_chatHistory') || [];
  const recentChat = chatHistory.slice(-4).map(m => (m.role==='user'?'客户':'轻舟')+'：'+m.content.slice(0,60)).join('<br>');

  // 打包产品推荐上下文
  const allocation = Storage.get('qingzhou_allocation');
  const productCtx = allocation?.allocation?.map(a => a.name+'（'+a.ratio+'%）').join('、') || '无';

  // 打包情绪标签
  const stages = Storage.get('qingzhou_lifeStages') || [];
  const stageLabel = stages.length > 0 ? stages.map(s=>s.label).join('、') : '无特殊标记';

  // 存入 handoff 记录供 Copilot 读取
  Storage.set('qingzhou_handoffPackage', {
    reason, syncedItems, recentChat, productCtx, stageLabel,
    timestamp: new Date().toISOString()
  });

  addMessage('ai', `
    <div style="text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">📞</div>
      <strong>正在为您转接人工顾问……</strong>
      <p style="font-size:12px;color:var(--ink-40);margin-top:8px;">已同步以下信息，顾问接听后可直接查看：</p>
      <div style="text-align:left;margin-top:12px;background:var(--surface);padding:14px;border-radius:var(--r-sm);font-size:11px;line-height:2;color:var(--ink-70)">
        ${syncedItems.map(i => '<div>✅ ' + i + '</div>').join('')}
        <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">💬 最近对话：<br>${recentChat || '无'}</div>
        <div>📊 推荐产品：${productCtx}</div>
        <div>🏷️ 客户阶段：${stageLabel}</div>
      </div>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:12px;">
        <button class="retry-btn" onclick="showToast('预约已提交，顾问将在工作时间回电')">预约回电</button>
        <button class="retry-btn" onclick="goTo('chat.html')">返回</button>
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
