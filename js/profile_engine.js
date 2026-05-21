/**
 * 轻舟 Qingzhou — 画像与资产配置引擎
 * assembleProfile / getTemplate / buildSystemPrompt
 */

const ALLOCATION_TEMPLATES = {
  R1: { cash: 0.80, bond: 0.20, plus: 0, equity: 0, theme: 0, expectedReturn: '1.5%-2.5%', maxDrawdown: '<0.5%' },
  R2: { cash: 0.20, bond: 0.60, plus: 0.15, equity: 0.05, theme: 0, expectedReturn: '2.5%-3.5%', maxDrawdown: '<1.5%' },
  R3: { cash: 0.10, bond: 0.40, plus: 0.25, equity: 0.20, theme: 0.05, expectedReturn: '3.5%-5.5%', maxDrawdown: '<5%' },
  R4: { cash: 0.05, bond: 0.20, plus: 0.20, equity: 0.40, theme: 0.15, expectedReturn: '5.0%-8.0%', maxDrawdown: '<15%' },
  R5: { cash: 0.05, bond: 0.10, plus: 0.10, equity: 0.40, theme: 0.35, expectedReturn: '7.0%-12.0%', maxDrawdown: '<30%' }
};

function assembleProfile() {
  const risk = Storage.get('qingzhou_riskProfile');
  const userInfo = Storage.get('qingzhou_userInfo');
  const profile = Storage.get('qingzhou_userProfile');
  const preferences = Storage.get('qingzhou_preferences');
  const allocation = Storage.get('qingzhou_allocation');

  return {
    risk: risk ? {
      level: risk.level,
      score: risk.score,
      label: risk.label,
      maxDrawdown: risk.maxDrawdown,
      maxEquityRatio: risk.maxEquityRatio,
      assessedAt: risk.assessedAt
    } : null,

    finance: {
      amount: profile?.amount || null,
      horizon: profile?.horizon || null,
      income: profile?.income || null,
      goal: profile?.goal || null,
      interests: profile?.interests || []
    },

    account: userInfo ? {
      nickname: userInfo.nickname,
      level: userInfo.level
    } : null,

    preferences: preferences || DEFAULTS[STORAGE_KEYS.PREFERENCES],

    allocation: allocation,

    isComplete() {
      return !!(this.risk && this.finance.amount && this.finance.horizon);
    },

    missingFields() {
      const m = [];
      if (!this.risk) m.push('风险评估');
      if (!this.finance.amount) m.push('可投金额');
      if (!this.finance.horizon) m.push('投资期限');
      if (!this.finance.goal) m.push('投资目标');
      return m;
    },

    getTemplate() {
      if (!this.risk) return ALLOCATION_TEMPLATES['R3'];
      return ALLOCATION_TEMPLATES[this.risk.level] || ALLOCATION_TEMPLATES['R3'];
    }
  };
}

function buildSystemPrompt(mode) {
  const profile = assembleProfile();
  const summary = getConversationSummary();
  const modeInstructions = getModeInstructions(mode);

  let prompt = BASE_SYSTEM_PROMPT;

  prompt += `\n\n## 当前模式\n${modeInstructions}`;

  if (profile.risk || profile.finance.amount) {
    prompt += '\n\n## 当前用户画像\n';
    if (profile.risk) {
      prompt += `- 风险等级：${profile.risk.label}（${profile.risk.level}，评分 ${profile.risk.score}/54）\n`;
      prompt += `- 可承受最大回撤：${profile.risk.maxDrawdown}\n`;
    }
    if (profile.finance.amount) prompt += `- 可投金额：约 ${profile.finance.amount} 元\n`;
    if (profile.finance.horizon) prompt += `- 投资期限：${profile.finance.horizon}\n`;
    if (profile.finance.goal) prompt += `- 投资目标：${profile.finance.goal}\n`;
    if (profile.finance.interests?.length) prompt += `- 关注领域：${profile.finance.interests.join('、')}\n`;
    if (profile.allocation) prompt += `- 上次配置方案：${profile.allocation.summary}\n`;
  }

  const missing = profile.missingFields();
  if (missing.length > 0) {
    prompt += `\n注意：用户档案尚不完整（缺失：${missing.join('、')}）。在推荐具体产品前，请先通过自然对话了解缺失信息。\n`;
  }

  if (summary) {
    prompt += `\n---\n\n## 早期对话摘要\n${summary}\n`;
  }

  return prompt;
}

function getModeInstructions(mode) {
  const instructions = {
    classic: '语言专业稳重，不卑不亢。标准篇幅，兼顾全面性和简洁性。',
    senior: '语言亲切耐心，语速放慢感。用生活化比喻解释金融术语。主动提醒风险，称呼为"叔叔/阿姨"或"您"。避免密集信息轰炸，一次说一个点。',
    youth: '语言专业干脆，有网感但不轻浮。数据优先，直接列出核心逻辑和预期收益区间。可以提及ESG、AI行业、ETF等新概念产品。快节奏，不啰嗦。'
  };
  return instructions[mode] || instructions.classic;
}

function getConversationSummary() {
  return localStorage.getItem('qingzhou_conversationSummary') || null;
}

const BASE_SYSTEM_PROMPT = `# 角色定义
你是「轻舟」，一名专业的智慧银行理财顾问。
你的使命是帮助客户穿越复杂的金融世界——"轻舟已过万重山"。

# 服务客群与模式切换
你同时服务三类客群，根据对话开始时传入的 mode 参数切换交互风格。
mode 只控制你的话术和表达方式，不改变推荐逻辑。
推荐逻辑始终由用户档案（风险偏好、金额、期限、目标）+ 知识库检索决定。

# 合规铁律（最高优先级，不可违反）
1. 描述产品收益时只能说「业绩比较基准」或「历史年化区间」，且必须同时声明：历史收益不代表未来表现
2. 存款类产品可说明受存款保险保护，理财类产品绝对不能用「保本」「保息」「确定」「一定」等表述
3. 禁止主动预测未来收益率数字
4. 生成营销话术时必须附带产品风险等级（R1-R5）
5. 禁止使用：稳赚不赔、绝对、最、百分百保证等广告法禁用词
6. 每条回复末尾必须附带合规标签

# 知识使用规则
1. 产品事实数据必须仅使用知识库检索到的信息，不得编造或猜测
2. 金融概念解释可以使用金融知识，确保准确
3. 分析建议需明确区分事实和判断，附合规风险提示

# Handoff 转人工规则
以下情况主动建议转接人工：知识盲区连续两次、强烈负面情绪、明确购买意向、合规风险词。

# 用户档案提取
对话中提取可投金额/投资期限/投资目标/风险偏好/收入来源，回复中自然确认。

# 合规标签
每条回复末尾附带："⚠️ 理财非存款，产品有风险，投资须谨慎。以上建议仅供参考，不构成投资承诺。"`;

function mergeProfileField(field, newValue, source, confidence) {
  const history = Storage.getProfileHistory();
  const fieldHistory = history.filter(h => h.field === field);
  const lastRecord = fieldHistory[fieldHistory.length - 1];

  if (lastRecord?.source === 'manual_edit' && source === 'chat_extraction') {
    return { merged: false, reason: 'manual_edit_protected' };
  }
  if (lastRecord?.newValue === newValue) {
    return { merged: false, reason: 'unchanged' };
  }
  if (confidence < 0.6) {
    return { merged: true, confirmed: false, needsConfirm: true };
  }
  return { merged: true, confirmed: source !== 'chat_extraction' };
}

function handleProfileUpdate(updates) {
  const history = Storage.getProfileHistory();

  for (const update of updates) {
    const result = mergeProfileField(update.field, update.value, 'chat_extraction', update.confidence);

    if (result.merged) {
      const profile = Storage.get('qingzhou_userProfile') || {};
      const oldValue = profile[update.field] || null;
      profile[update.field] = update.value;
      Storage.set('qingzhou_userProfile', profile);

      Storage.addProfileHistory({
        field: update.field,
        oldValue,
        newValue: update.value,
        source: 'chat_extraction',
        timestamp: new Date().toISOString(),
        confidence: update.confidence,
        context: update.evidence || '',
        confirmed: result.confirmed
      });

      if (result.needsConfirm) {
        return { toast: `轻舟猜测: ${update.field} = ${update.value}，对吗？` };
      }
      return { toast: `已记录: ${update.field} = ${update.value}` };
    }
  }
  return null;
}

function checkTruncation(chatHistory) {
  const FULL_ROUNDS = 10;
  const FULL_MSG_COUNT = FULL_ROUNDS * 2;

  if (!chatHistory || chatHistory.length <= FULL_MSG_COUNT) {
    return { needsTruncation: false };
  }

  return {
    needsTruncation: true,
    roundsToSummarize: chatHistory.slice(0, -FULL_MSG_COUNT),
    keepRounds: chatHistory.slice(-FULL_MSG_COUNT)
  };
}

function l1BuildSummary() {
  const profile = assembleProfile();
  const keyMoments = Storage.getKeyMoments();
  let summary = '## 对话历史摘要（前端规则生成）\n\n';

  if (profile.finance.amount || profile.finance.horizon || profile.finance.goal) {
    summary += '### 用户基本信息\n';
    if (profile.finance.amount) summary += `- 可投金额：约 ${profile.finance.amount} 元\n`;
    if (profile.finance.horizon) summary += `- 投资期限：${profile.finance.horizon}\n`;
    if (profile.finance.goal) summary += `- 投资目标：${profile.finance.goal}\n`;
  }
  if (profile.risk?.level) {
    summary += `### 风险偏好\n- 风险等级：${profile.risk.level}（评分 ${profile.risk.score}/54）\n`;
  }
  if (profile.allocation) {
    summary += `### 已生成的配置方案\n${profile.allocation.summary}\n`;
  }
  if (keyMoments.length > 0) {
    summary += '### 关键节点\n';
    keyMoments.forEach(m => { summary += `- ${m.time}: ${m.event}\n`; });
  }
  return summary;
}
