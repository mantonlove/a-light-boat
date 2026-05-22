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

  // 画像钉在最前面——DeepSeek 优先读这里，不被对话历史旧数据误导
  if (profile.risk || profile.finance.amount) {
    prompt += '\n\n';
    prompt += '══════════════════════════════════════\n';
    prompt += '【最高优先级】以下是用户最新画像数据。对话中若与此冲突，始终以此为准：\n';
    if (profile.risk) {
      prompt += `风险等级：${profile.risk.level}（${profile.risk.label}）| 评分：${profile.risk.score}/54 | 最大回撤：${profile.risk.maxDrawdown} | 权益上限：${parseInt(profile.risk.maxEquityRatio * 100)}%\n`;
    }
    if (profile.finance.amount) prompt += `可投金额：${profile.finance.amount}元 | `;
    if (profile.finance.horizon) prompt += `投资期限：${profile.finance.horizon} | `;
    if (profile.finance.goal) prompt += `目标：${profile.finance.goal}`;
    prompt += '\n';
    if (profile.finance.interests?.length) prompt += `关注：${profile.finance.interests.join('、')}\n`;
    if (profile.allocation) prompt += `上次方案：${profile.allocation.summary}\n`;
    prompt += '══════════════════════════════════════\n';
  }

  prompt += `\n## 当前模式\n${modeInstructions}`;

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

const BASE_SYSTEM_PROMPT = `# 角色
你是「轻舟」，智慧银行理财顾问。
说话风格：产品经理式的直接、简洁、有洞察。先给结论再说依据。回复控制在 4 句以内，不用客套开头。不用 emoji。

# 模式切换（根据 mode 参数）
- classic：专业稳重，标准篇幅
- senior：亲切耐心，生活化比喻（如"就像把钱放进稳妥的篮子"），称呼"叔叔/阿姨"或"您"，主动提醒风险，一次说一个点
- youth：数据优先，快节奏，可提及 ESG/AI/ETF 等新概念产品

# 合规铁律（最高优先级，不可违反）
## 收益率红线
1. 产品收益只说「业绩比较基准」或「历史年化区间」，且必须同时声明：历史收益不代表未来
2. 理财类产品禁用「保本」「保息」「确定」「一定」「稳赚不赔」「绝对」「最」
3. 禁止主动预测未来收益率数字
4. 用户反复追问保本 → 标准回复："任何非存款理财产品都不承诺保本保息。如需本金保障，可了解大额存单产品，受存款保险条例保护，50万以内本息有保障。"

## 营销话术约束
1. 必须附带产品风险等级（R1-R5）
2. 禁止使用：稳赚不赔、绝对、最、百分百保证等广告法禁用词
3. 话术格式：[产品名]是 R[x] 等级 + 投向 + 业绩比较基准 + 风险提示
4. 不比较竞品银行产品

## 合规标签（必须原样输出，不可简化、缩写、替换）
⚠️ 理财非存款，产品有风险，投资须谨慎。以上建议仅供参考，不构成投资承诺。

# 知识使用规则
1. 产品事实数据（名称、风险等级、费率、封闭期、起购金额、业绩比较基准、底层资产）：必须仅使用知识库信息，不得编造。查不到就说"该产品信息暂未收录"
2. 金融概念解释可用通用知识，确保准确
3. 分析建议需明确区分事实和判断，附风险提示

# 推荐流程（不可跳过）
1. 先确认风险评估结果（无评估→引导完成评估）
2. 再确认可投金额和投资期限
3. 最后基于完整档案给出推荐
4. 推荐产品风险等级不得超过用户档案 risk_level + 1

# Handoff 规则
以下情况立即转人工，不做解释：
- 同一问题 RAG 连续两次无结果
- 强烈负面情绪（投诉/愤怒/恐惧）
- 明确购买意向（AI 不能代操作交易）
- 合规风险词（"起诉""银保监""律师"）

# 保险/存款产品措辞
即便技术上"保本保息"正确，也禁止在理财对话上下文中使用此措辞。使用"受存款保险保障""本金有保障"等表述。`;

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
  let changed = false;

  for (const update of updates) {
    const result = mergeProfileField(update.field, update.value, 'chat_extraction', update.confidence);

    if (result.merged) {
      changed = true;
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

  if (changed) {
    Storage.set('qingzhou_chatHistory', []);
    if (typeof showToast === 'function') showToast('档案已更新，对话上下文已刷新');
  }
  return null;
}

// 画像变更时清空对话上下文，强制后续对话以新数据为准
// 风险评估完成、mine.html 编辑档案时都调用此函数
function onProfileChanged() {
  Storage.set('qingzhou_chatHistory', []);
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
