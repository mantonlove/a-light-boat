/**
 * 轻舟 Qingzhou — API 调用封装
 * GLM-5 via 元景万悟 OpenAI 兼容接口
 * 限流 5次/分钟，内置队列调度
 */

let lastCallTime = 0;
let queueRunning = false;
const callQueue = [];

/** 限流调度器 */
async function rateLimiter() {
  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < API_CONFIG.rateLimitDelay) {
    await new Promise(r => setTimeout(r, API_CONFIG.rateLimitDelay - elapsed));
  }
  lastCallTime = Date.now();
}

const Api = {
  async sendMessage(text, mode) {
    if (API_CONFIG.useFallback) {
      return this._fallbackResponse(text, mode);
    }

    const profile = assembleProfile();
    const systemPrompt = buildSystemPrompt(mode);

    // 读取对话历史（最近 10 轮）
    const chatHistory = Storage.get('qingzhou_chatHistory') || [];
    const truncation = checkTruncation(chatHistory);
    let recentHistory = chatHistory;
    if (truncation.needsTruncation) {
      recentHistory = truncation.keepRounds;
      const summary = l1BuildSummary();
      localStorage.setItem('qingzhou_conversationSummary', summary);
    }

    // 构建 OpenAI 兼容 messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory.slice(-20).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      })),
      { role: 'user', content: text }
    ];

    try {
      await rateLimiter();
      const response = await this._fetchAPI(messages);
      return this._handleResponse(response, text, profile);
    } catch (err) {
      console.warn('GLM-5 API failed, using fallback:', err.message);
      return this._fallbackResponse(text, mode);
    }
  },

  async _fetchAPI(messages) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
      const res = await fetch(API_CONFIG.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.token}`
        },
        body: JSON.stringify({
          model: API_CONFIG.model,
          messages: messages,
          max_tokens: 2048,
          temperature: 0.7,
          stream: false
        }),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
      }

      return await res.json();
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  },

  _handleResponse(data, userText, profile) {
    const reply = data?.choices?.[0]?.message?.content || '';

    // 尝试从回复中提取档案更新（简单规则，GLM-5 会按系统提示词格式回复）
    const updates = [];
    const patterns = [
      { field: 'amount', regex: /可投金额[：:]\s*(\d+)\s*万/ },
      { field: 'horizon', regex: /投资期限[：:]\s*(\d+[年个月])/ },
      { field: 'goal', regex: /投资目标[：:]\s*(.+)/ },
    ];
    for (const p of patterns) {
      const match = reply.match(p.regex);
      if (match) {
        updates.push({ field: p.field, value: match[1], confidence: 0.7, evidence: userText });
      }
    }
    if (updates.length > 0) {
      const result = handleProfileUpdate(updates);
      return { reply, isFallback: false, toast: result?.toast || null, profileUpdated: true };
    }

    return { reply, isFallback: false };
  },

  _fallbackResponse(text, mode) {
    const fallback = findFallback(text, mode);
    return {
      reply: fallback.text,
      isFallback: true,
      fallbackId: fallback.id
    };
  }
};
