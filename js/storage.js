/**
 * 轻舟 Qingzhou — localStorage 读写封装
 * 统一管理所有本地存储的键值读写与默认值
 */

const STORAGE_KEYS = {
  MODE: 'qingzhou_mode',
  FONT_SIZE: 'qingzhou_fontSize',
  VOICE_ENABLED: 'qingzhou_voiceEnabled',
  VOICE_PRESET: 'qingzhou_voicePreset',
  RISK_PROFILE: 'qingzhou_riskProfile',
  USER_INFO: 'qingzhou_userInfo',
  USER_PROFILE: 'qingzhou_userProfile',
  PREFERENCES: 'qingzhou_preferences',
  CHAT_HISTORY: 'qingzhou_chatHistory',
  PROFILE_HISTORY: 'qingzhou_profileHistory',
  CHAT_KEY_MOMENTS: 'qingzhou_chatKeyMoments',
  ALLOCATION: 'qingzhou_allocation',
  PRIVACY_READ: 'qingzhou_privacyRead',
  VOICE_GUIDE_READ: 'qingzhou_voiceGuideRead'
};

const DEFAULTS = {
  [STORAGE_KEYS.MODE]: 'classic',
  [STORAGE_KEYS.FONT_SIZE]: 'medium',
  [STORAGE_KEYS.VOICE_ENABLED]: false,
  [STORAGE_KEYS.PREFERENCES]: {
    recommendByRisk: true,
    recommendByHorizon: true,
    marketHotPush: false,
    weeklyReport: true
  }
};

const Storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : (DEFAULTS[key] ?? null);
    } catch {
      return DEFAULTS[key] ?? null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('localStorage write failed:', key, e);
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  /** 清除所有轻舟相关数据（保留 profileHistory 作为审计日志） */
  clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key !== STORAGE_KEYS.PROFILE_HISTORY) {
        localStorage.removeItem(key);
      }
    });
  },

  /** 退出登录：保留档案+评估，清除对话 */
  logout() {
    const keep = [
      STORAGE_KEYS.RISK_PROFILE,
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.PROFILE_HISTORY,
      STORAGE_KEYS.ALLOCATION
    ];
    const kept = {};
    keep.forEach(k => { kept[k] = localStorage.getItem(k); });

    this.clearAll();

    keep.forEach(k => {
      if (kept[k]) localStorage.setItem(k, kept[k]);
    });
  },

  /** 获取档案历史 */
  getProfileHistory() {
    return this.get(STORAGE_KEYS.PROFILE_HISTORY) || [];
  },

  /** 追加档案变更记录 */
  addProfileHistory(record) {
    const history = this.getProfileHistory();
    history.push(record);
    this.set(STORAGE_KEYS.PROFILE_HISTORY, history);
  },

  /** 获取关键节点 */
  getKeyMoments() {
    return this.get(STORAGE_KEYS.CHAT_KEY_MOMENTS) || [];
  },

  /** 追加关键节点 */
  addKeyMoment(event) {
    const moments = this.getKeyMoments();
    moments.push({ time: new Date().toISOString(), event });
    this.set(STORAGE_KEYS.CHAT_KEY_MOMENTS, moments);
  }
};

// ══════ 共享字体工具（chat.js & mine.js 共用，消除重复定义） ══════
const FONT_SIZE_MAP = { small:'14px', medium:'16px', large:'20px' };
const MODE_DEFAULT_FONT = { classic:'medium', senior:'large', youth:'small' };

function applyFontSize(size) {
  const px = FONT_SIZE_MAP[size] || '16px';
  const pxi = parseInt(px);
  document.documentElement.style.fontSize = px;
  // chat.html 使用的变量名
  document.documentElement.style.setProperty('--font-size-base', px);
  document.documentElement.style.setProperty('--font-size-msg', (pxi-1)+'px');
  document.documentElement.style.setProperty('--font-size-sm', (pxi-1)+'px');
  document.documentElement.style.setProperty('--font-size-xs', (pxi-3)+'px');
  document.documentElement.style.setProperty('--font-size-lg', (pxi+4)+'px');
  document.documentElement.style.setProperty('--font-size-xl', (pxi+10)+'px');
  // mine.html 使用的变量名
  document.documentElement.style.setProperty('--fs-base', px);
  document.documentElement.style.setProperty('--fs-sm', (pxi-1)+'px');
  document.documentElement.style.setProperty('--fs-lg', (pxi+4)+'px');
  document.documentElement.style.setProperty('--fs-xl', (pxi+10)+'px');
}

// ══════ 语音预设（5种可选声音，映射到系统真实语音）══════
const VOICE_PRESETS = [
  { id: 'female_sweet',   name: '甜美女生', icon: '🎙️', desc: '亲切温暖，自然流畅', rate: 1.3, pitch: 1.05, voiceName: 'female_sweet' },
  { id: 'male_warm',      name: '温暖男生', icon: '🎧', desc: '低沉稳重，专业可信', rate: 1.3, pitch: 0.90, voiceName: 'male_warm' },
  { id: 'male_podcast',   name: '播客男生', icon: '🎵', desc: '磁性醇厚，娓娓道来', rate: 1.3, pitch: 0.95, voiceName: 'male_podcast' }
];

function getVoicePreset() {
  const id = Storage.get(STORAGE_KEYS.VOICE_PRESET) || 'female_sweet';
  return VOICE_PRESETS.find(v => v.id === id) || VOICE_PRESETS[0];
}

/** 异步加载系统语音列表（voices 在首次调用后才异步就绪） */
let _cachedVoices = null;
function loadVoices() {
  if (_cachedVoices && _cachedVoices.length > 0) return Promise.resolve(_cachedVoices);
  return new Promise((resolve) => {
    if (typeof speechSynthesis === 'undefined') { resolve([]); return; }
    const voices = speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      _cachedVoices = voices;
      resolve(voices);
      return;
    }
    speechSynthesis.onvoiceschanged = () => {
      _cachedVoices = speechSynthesis.getVoices();
      resolve(_cachedVoices);
    };
    // Timeout fallback
    setTimeout(() => {
      if (!_cachedVoices) { _cachedVoices = speechSynthesis.getVoices(); }
      resolve(_cachedVoices);
    }, 2000);
  });
}

/** 根据预设找到最匹配的系统语音 */
function matchVoice(preset, voices) {
  if (!voices || voices.length === 0) return null;
  const zhVoices = voices.filter(v => v.lang === 'zh-CN');
  if (zhVoices.length === 0) return null;

  // 精确匹配预设指定的语音名
  if (preset.voiceName) {
    const exact = zhVoices.find(v => v.name === preset.voiceName);
    if (exact) return exact;
    const partial = zhVoices.find(v => v.name.includes(preset.voiceName));
    if (partial) return partial;
  }

  // 回退：第一个zh-CN语音
  return zhVoices[0];
}
