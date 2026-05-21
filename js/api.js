/**
 * 轻舟 Qingzhou — API 调用封装
 * 元景万悟平台接口 + fallback 降级 + 误差处理
 */

const Api = {
  async sendMessage(text, mode) {
    // 检查是否强制使用 fallback
    if (API_CONFIG.useFallback) {
      return this._fallbackResponse(text, mode);
    }

    // 读取用户档案
    const profile = assembleProfile();
    const systemPrompt = buildSystemPrompt(mode);

    // 截断检查
    const chatHistory = Storage.get('qingzhou_chatHistory') || [];
    const truncation = checkTruncation(chatHistory);
    let messages = chatHistory;
    if (truncation.needsTruncation) {
      messages = truncation.keepRounds;
      // 生成摘要（此处用 L1 规则摘要，在线时可升级为 L2 LLM 摘要）
      const summary = l1BuildSummary();
      localStorage.setItem('qingzhou_conversationSummary', summary);
    }

    // 构建请求体
    const body = {
      prompt: text,
      mode: mode,
      history: messages.slice(-20), // 最近 10 轮
      user_profile: {
        risk: profile.risk?.level || null,
        amount: profile.finance.amount,
        horizon: profile.finance.horizon,
        goal: profile.finance.goal
      },
      system_prompt: systemPrompt
    };

    // 发送请求（带超时）
    try {
      const response = await this._fetchWithTimeout(body);
      return this._handleSuccess(response, mode);
    } catch (err) {
      console.warn('API call failed, using fallback:', err.message);
      return this._fallbackResponse(text, mode);
    }
  },

  async _fetchWithTimeout(body) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
      const res = await fetch(API_CONFIG.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.token}`
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  },

  _handleSuccess(data, mode) {
    const reply = data.reply || data.content || data.text || '';

    // 处理档案更新
    if (data.profile_update && Array.isArray(data.profile_update)) {
      const result = handleProfileUpdate(data.profile_update);
      if (result?.toast) {
        // 返回 toast 信息让 chat.js 显示
        return { reply, isFallback: false, toast: result.toast, profileUpdated: true };
      }
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
