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
const FONT_SIZE_MAP = { small:'12px', medium:'16px', large:'24px', xlarge:'32px' };
const MODE_DEFAULT_FONT = { classic:'medium', senior:'large', youth:'small' };

function applyFontSize(size) {
  const px = FONT_SIZE_MAP[size] || '16px';
  const pxi = parseInt(px);
  document.documentElement.style.fontSize = px;
  // chat.html 使用的变量名
  document.documentElement.style.setProperty('--font-size-base', px);
  document.documentElement.style.setProperty('--font-size-msg', (pxi-1)+'px');
  document.documentElement.style.setProperty('--font-size-sm', (pxi-3)+'px');
  document.documentElement.style.setProperty('--font-size-xs', (pxi-5)+'px');
  document.documentElement.style.setProperty('--font-size-lg', (pxi+6)+'px');
  document.documentElement.style.setProperty('--font-size-xl', (pxi+14)+'px');
  // mine.html 使用的变量名
  document.documentElement.style.setProperty('--fs-base', px);
  document.documentElement.style.setProperty('--fs-sm', (pxi-3)+'px');
  document.documentElement.style.setProperty('--fs-lg', (pxi+6)+'px');
  document.documentElement.style.setProperty('--fs-xl', (pxi+14)+'px');
}

// ══════ 语音预设（5种可选声音）══════
const VOICE_PRESETS = [
  { id: 'gentle-female',  name: '温润女声', icon: '🎙️', desc: '温和亲切，语速适中', rate: 0.90, pitch: 1.10 },
  { id: 'deep-male',      name: '沉稳男声', icon: '🎧', desc: '低沉稳重，专业可信', rate: 0.85, pitch: 0.75 },
  { id: 'lively-female',  name: '活泼女声', icon: '🎵', desc: '轻快明亮，有节奏感', rate: 1.05, pitch: 1.30 },
  { id: 'soft-female',    name: '知性女声', icon: '🎶', desc: '端庄知性，娓娓道来', rate: 0.92, pitch: 1.05 },
  { id: 'warm-male',      name: '磁性男声', icon: '📻', desc: '温暖磁性，娓娓道来', rate: 0.82, pitch: 0.85 }
];

function getVoicePreset() {
  const id = Storage.get(STORAGE_KEYS.VOICE_PRESET) || 'gentle-female';
  return VOICE_PRESETS.find(v => v.id === id) || VOICE_PRESETS[0];
}
