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

function buildSystemPrompt(mode, sentiment = null) {
  const profile = assembleProfile();
  const summary = getConversationSummary();
  const modeInstructions = getModeInstructions(mode);

  let prompt = BASE_SYSTEM_PROMPT;

  // 情绪感知：检测到焦虑时，注入安抚指令
  if (sentiment === 'anxiety') {
    prompt += '\n\n【最高优先级】用户当前表现出焦虑或恐慌情绪。你的首要任务不是推荐产品，而是：1) 先共情安抚——承认市场波动带来的不安是正常的 2) 用数据说明长期视角——过往 N 次超过 20% 的回调最终都修复了 3) 确认用户的风险承受力是否真的匹配当前持仓 4) 只有在用户情绪稳定后，才谨慎提供保守型建议。禁止推销权益类产品。';
  }

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

  // 长期记忆：用户偏好
  const prefs = Storage.get('qingzhou_preferences') || {};
  if (prefs.exclusions?.length > 0) {
    prompt += `\n⚠️ 用户明确排除的行业/领域：${prefs.exclusions.join('、')}。不要推荐含有这些底层资产的产品。\n`;
  }
  if (prefs.style === 'concise') {
    prompt += '\n用户偏好简短直接的回复风格，给出结论+1-2条核心依据即可，不要展开。\n';
  }

  // 全生命周期画像
  const stages = Storage.get('qingzhou_lifeStages') || [];
  if (stages.length > 0) {
    prompt += '\n## 人生阶段洞察\n';
    stages.forEach(s => {
      prompt += `- ${s.label}：${s.advice}\n`;
    });
  }

  prompt += `\n## 当前模式\n${modeInstructions}`;

  const missing = profile.missingFields();
  if (missing.length > 0) {
    prompt += `\n注意：用户档案尚不完整（缺失：${missing.join('、')}）。在推荐具体产品前，请先通过自然对话了解缺失信息。\n`;
  }

  // 注入市场宏观数据
  if (typeof MARKET_DATA !== 'undefined') {
    prompt += '\n\n## 市场宏观数据\n';
    prompt += '更新：' + (MARKET_DATA.update_time||'').slice(0,19) + ' | 同步频率：每日 | 数据源：LPR(央行)/国债(中债登)/PE(沪深交易所)/黄金(上金所)/汇率(CFETS)\n';
    prompt += MARKET_DATA.market_brief + '\n';
    prompt += '关键指标：' + JSON.stringify(MARKET_DATA.key_indicators).replace(/[{}"]/g,'') + '\n';
    prompt += '⚠️ ' + MARKET_DATA.disclaimer + '\n';
  }

  // 注入知识库产品——按用户画像过滤，至多15只最匹配产品
  const allProducts = getProductData();
  if (allProducts && allProducts.length > 0) {
    // 按风险等级过滤：不超过用户等级+1
    let filtered = allProducts;
    if (profile.risk?.level) {
      const maxRisk = Math.min(5, parseInt(profile.risk.level.replace('R','')) + 1);
      filtered = filtered.filter(p => parseInt(p.risk_level.replace('R','')) <= maxRisk);
    }
    // 按金额过滤：起购金额不超过可投金额
    if (profile.finance.amount) {
      filtered = filtered.filter(p => p.min_amount <= profile.finance.amount);
    }
    // 取前15只
    const top15 = filtered.slice(0, 15);

    prompt += '\n\n---\n## 知识库产品数据（按用户画像过滤后最匹配的' + top15.length + '只）\n';
    prompt += `数据版本：${PRODUCT_META?.version||'1.0'} | 更新于：${PRODUCT_META?.updated||'2026-05-22'} | 知识库共${PRODUCT_META?.count||1260}只\n`;
    prompt += '同步频率：银行理财/基金/债券每日，保险/信托每周。数据源：中国理财网/中基协/金融监管总局/中债登/中信登\n';
    prompt += '以下是你唯一可以引用的产品信息，严禁编造。如需更多产品，请建议用户访问对应官方平台。\n\n';
    prompt += '| 产品名 | 风险 | 起购 | 期限 | 基准 | 底层资产 | 风险提示 |\n';
    top15.forEach(p => {
      const underlying = getUnderlyingAssets(p.name);
      const assets = underlying ? underlying.assets.join('、') : '—';
      const riskNote = underlying?.risk_note || '';
      prompt += `| ${p.name} | ${p.risk_level} | ${p.min_amount}元 | ${p.lock_period} | ${p.benchmark} | ${assets} | ${riskNote} |\n`;
    });
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

/** 推荐白盒解释：生成「为什么推荐这个」的可审计说明 */
function buildExplanation(products = []) {
  const profile = assembleProfile();
  const risk = profile.risk;
  const finance = profile.finance;
  const reasons = [];

  if (risk?.level) {
    reasons.push(`您的风险等级为 <strong>${risk.level} ${risk.label}</strong>（评分 ${risk.score}/54），可承受最大回撤 ${risk.maxDrawdown}`);
  }
  if (finance?.horizon) {
    reasons.push(`投资期限 <strong>${finance.horizon}</strong>`);
  }
  if (finance?.amount) {
    reasons.push(`可投金额约 <strong>${finance.amount >= 10000 ? (finance.amount / 10000).toFixed(0) + ' 万' : finance.amount + ' 元'}</strong>`);
  }
  if (finance?.goal) {
    reasons.push(`投资目标为 <strong>${finance.goal}</strong>`);
  }

  const productNotes = [];
  products.forEach(p => {
    const riskOk = risk?.level && p.risk_level ?
      parseInt(p.risk_level.replace('R','')) <= parseInt(risk.level.replace('R','')) + 1 : true;
    const lockOk = finance?.horizon ?
      (p.lock_period || '').includes('天') || (p.lock_period || '') === '—' : true;
    productNotes.push(`${p.name}（${p.risk_level}${riskOk ? ' ✅风险匹配' : ''}${lockOk ? ' ✅期限合适' : ''}）`);
  });

  return {
    summary: reasons.join(' · '),
    products: productNotes,
    timestamp: new Date().toISOString()
  };
}

function getConversationSummary() {
  return localStorage.getItem('qingzhou_conversationSummary') || null;
}

const BASE_SYSTEM_PROMPT = `# 角色
你是「轻舟」，智慧银行理财顾问。
说话风格：产品经理式的直接、简洁、有洞察。先给结论再说依据。回复控制在 4 句以内，不用客套开头。不用 emoji。

# 模式切换（根据 mode 参数）
- classic：专业稳重，标准篇幅。示例："为您筛选了2只R2产品：安鑫短债30天(基准2.0-2.5%)、稳享固收增强6个月(基准2.8-3.5%)。需进一步对比吗？"
- senior：亲切耐心，生活化比喻，称呼"叔叔/阿姨"或"您"，主动提醒风险，一次说一个点，回复≤80字。示例："叔叔/阿姨，帮您看了两款稳妥的。一款30天就能取，一款放6个月，都挺安全的——就像把钱借给信誉好的大公司，人家给点利息。您更倾向哪一种呢？"
- youth：数据优先，快节奏，回复≤100字，可提ESG/AI/ETF。示例："两只R2固收+：安鑫短债30天(年化2.3%，回撤≈0)。稳享固收增强6个月(年化3.2%)。基于你R3+20万画像，稳享性价比更高。历史不代表未来。"

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

# 术语解释规则（"人话翻译机"）
遇到以下金融术语时，必须用通俗类比解释，让完全不懂理财的人也能听懂：
- "夏普比率" → "可以理解为'每冒 1 块钱的风险，能赚多少钱'，越高越好"
- "最大回撤" → "历史上最糟糕的时候，您的账户最多亏过多少，越小越稳"
- "年化收益率" → "如果一直保持这个水平，一年大概能赚多少"
- "封闭期" → "这笔钱放进去之后多久不能取出来"
- "底层资产" → "这个产品最终把钱投到了什么地方，比如借给大公司、买国债、或者买股票"
- "净值化" → "产品的价格会随着市场每天变化，不再是固定数字"
- "固收+" → "大部分钱投在稳妥的债券上，拿稳定的利息；小部分钱去股市博取更高收益"
- "指数增强" → "跟着大盘走，但基金经理会想办法比大盘多赚一点"
- "业绩比较基准" → "产品给自己定的一个目标，但不是承诺，实际可能高也可能低"
- "R1-R5 风险等级" → "就像辣椒的辣度——R1 是微辣，R5 是变态辣"
遇到其他术语也请主动用类比解释，不要假设用户懂金融。

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

# 拒绝与替代路径
当无法满足用户要求时（风险错配/金额不足/期限不匹配/无匹配产品），必须：
1. 明确说明拒绝原因（哪个约束不满足）
2. 提供1-2个在约束边界内最接近的替代方案
3. 解释替代方案与原要求的差异
禁止只拒绝不给替代路径。

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
/** 全生命周期检测：自动识别用户人生节点 */
function detectLifeEvent() {
  const profile = Storage.get('qingzhou_userProfile') || {};
  const history = Storage.getProfileHistory();
  const events = [];

  // 规则1: 新晋家庭 — 档案中出现子女教育/母婴相关
  if (profile.goal && /教育|子女|孩子|上学|幼儿园/.test(profile.goal)) {
    events.push({ stage: 'new_family', label: '新晋家庭', advice: '转向稳健医疗险+长期教育金规划', priority: 'high' });
  }

  // 规则2: 财富上升期 — 连续3条档案更新显示资金增长
  const amountChanges = history.filter(h => h.field === 'amount' && h.newValue);
  if (amountChanges.length >= 2) {
    const latest = amountChanges[amountChanges.length - 1];
    const previous = amountChanges[amountChanges.length - 2];
    if (latest.newValue > previous.newValue * 1.3) {
      events.push({ stage: 'wealth_growth', label: '财富上升期', advice: '建议增配权益类，适度增加风险敞口', priority: 'medium' });
    }
  }

  // 规则3: 退休规划 — 档案中年龄>50或出现养老关键词
  if (profile.age && /[5-9][0-9]/.test(profile.age)) {
    events.push({ stage: 'retirement', label: '退休规划期', advice: '转向保守配置，注重现金流和本金安全', priority: 'high' });
  }
  if (profile.goal && /养老|退休|养老金/.test(profile.goal)) {
    events.push({ stage: 'retirement', label: '退休规划期', advice: '转向保守配置，注重现金流和本金安全', priority: 'high' });
  }

  // 规则4: 购房计划 — 出现大额支出+期限缩短
  if (profile.horizon && /1年|短期|随时/.test(profile.horizon) && profile.amount && profile.amount > 500000) {
    events.push({ stage: 'home_purchase', label: '购房筹备期', advice: '推荐短期高流动性产品，避免锁定长期资金', priority: 'high' });
  }

  // 去重并保存
  const existing = Storage.get('qingzhou_lifeStages') || [];
  const newEvents = events.filter(e => !existing.find(x => x.stage === e.stage));
  if (newEvents.length > 0) {
    Storage.set('qingzhou_lifeStages', [...existing, ...newEvents]);
    newEvents.forEach(e => {
      Storage.addKeyMoment(`人生节点检测：${e.label} → ${e.advice}`);
    });
  }

  return events;
}

function onProfileChanged() {
  Storage.set('qingzhou_chatHistory', []);
  detectLifeEvent(); // 档案变更时自动检测人生节点
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

/** 产品底层资产穿透数据（模拟银行投研系统） */
const UNDERLYING_ASSETS = {
  '安鑫短债': { assets: ['国债', 'AAA级同业存单', '高等级信用债'], risk_tags: [], risk_note: '' },
  '稳享固收增强': { assets: ['国债', 'AAA级信用债', '可转债(≤10%)'], risk_tags: [], risk_note: '' },
  '沪深300指数增强': { assets: ['沪深300成分股', '股指期货(对冲用)'], risk_tags: ['权益类'], risk_note: '含权益敞口，市场下跌时可能产生较大回撤' },
  '活期盈': { assets: ['国债逆回购', '银行同业存款'], risk_tags: [], risk_note: '' },
  '新能源行业精选': { assets: ['新能源产业链股票', '光伏/锂电/储能'], risk_tags: ['行业集中', '权益类'], risk_note: '行业集中度高，受新能源政策影响大' },
  '科技主题混合': { assets: ['半导体', 'AI/大模型', '消费电子'], risk_tags: ['行业集中', '权益类'], risk_note: '科技板块波动较大，建议控制仓位' },
  '全球配置': { assets: ['美股ETF', '港股通', '发达市场债券'], risk_tags: ['汇率风险', '跨境'], risk_note: '含跨境投资，受汇率波动影响' },
  '大额存单': { assets: ['银行存款'], risk_tags: [], risk_note: '受存款保险条例保护，50万以内本息有保障' },
  '天利同业存单': { assets: ['AAA级同业存单'], risk_tags: [], risk_note: '' }
};

/** 查询产品底层资产 */
function getUnderlyingAssets(productName) {
  for (const [key, val] of Object.entries(UNDERLYING_ASSETS)) {
    if (productName.includes(key)) return val;
  }
  return null;
}

function getProductData() {
  // 一级：优先用索引（快速过滤），含 i/n/r/c/a/l 字段
  if (typeof IDX !== 'undefined' && IDX.length > 0) {
    // 二级：需要全量数据时，从已加载的分类变量中合并
    let all = [];
    for (const catKey of Object.keys(window)) {
      if (catKey.startsWith('P_') && Array.isArray(window[catKey])) {
        all = all.concat(window[catKey]);
      }
    }
    if (all.length > 0) return all;
    // 降级：只有索引时返回简化版
    return IDX.map(p => ({
      product_id: p.i, name: p.n, risk_level: p.r,
      category: p.c, min_amount: p.a, lock_period: p.l,
      benchmark: '', suitable_for: [], type: '', underlying: [],
      historical_return_1y: '', historical_return_3y: '', fee: '',
      redemption: '', status: '在售', tags: [], data_source: ''
    }));
  }
  // 兼容旧版：全量数据
  if (typeof DEMO_PRODUCTS !== 'undefined') return DEMO_PRODUCTS;
  return null;
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
