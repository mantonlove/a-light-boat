/**
 * 轻舟 Qingzhou — recommend.html 推荐中心页面逻辑
 */

let currentMode = 'classic';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  currentMode = params.get('mode') || Storage.get('qingzhou_mode') || 'classic';
  document.body.className = 'mode-' + currentMode;
  // mode badge removed from header

  // 应用字体
  const savedFontSize = Storage.get('qingzhou_fontSize') || MODE_DEFAULT_FONT[currentMode] || 'medium';
  applyFontSize(savedFontSize);

  if (typeof showContextualTip === 'function') showContextualTip('recommend');
  renderRecommendations();
});

function goTo(url) {
  window.location.href = url + '?mode=' + currentMode;
}

function renderRecommendations() {
  const allocation = Storage.get('qingzhou_allocation');
  const emptyState = document.getElementById('emptyState');
  const recContent = document.getElementById('recContent');

  // 市场热点和周报始终显示
  renderMarketHot();
  renderWeeklyReport();
  renderMotEducation();
  renderKypAlignment();

  if (!allocation || !allocation.allocation || allocation.allocation.length === 0) {
    emptyState.classList.remove('hidden');
    recContent.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  recContent.classList.remove('hidden');

  // Render current recommendation
  const colors = ['#FF8C42', '#6C5CE7', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];
  const pieSegments = allocation.allocation.map((a, i) => {
    const prev = allocation.allocation.slice(0, i).reduce((s, x) => s + x.ratio, 0);
    return `${colors[i]} ${prev}% ${prev + a.ratio}%`;
  }).join(', ');

  document.getElementById('currentRec').innerHTML = `
    <div style="display:flex;gap:var(--s3);align-items:flex-start;margin-bottom:var(--s3)">
      <div style="width:100px;height:100px;border-radius:50%;background:conic-gradient(${pieSegments});flex-shrink:0"></div>
      <div style="flex:1">
        <div style="font-family:var(--display);font-size:18px;font-weight:600;margin-bottom:4px">${allocation.summary ? allocation.summary.slice(0,20) : '推荐配置方案'}</div>
        <div style="font-size:10px;color:var(--ink-40);margin-bottom:12px">${allocation.generated_at ? new Date(allocation.generated_at).toLocaleDateString('zh-CN') : ''} · 基于 ${allocation.based_on?.risk_level || 'R3'}</div>
        <div style="font-size:11px;line-height:2;margin-bottom:8px">
          ${allocation.allocation.map((a,i) => `<div><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${colors[i]};margin-right:6px"></span>${a.name} · ${a.ratio}%</div>`).join('')}
        </div>
      </div>
    </div>
    <div class="product-grid">
      ${allocation.allocation.map((a,i) => `
        <div class="product-card">
          <div class="pc-header">
            <span class="pc-name">${a.name || '产品'}</span>
            <span class="risk-badge risk-r${(a.risk||'R3').replace('R','')}">${a.risk || 'R3'}</span>
          </div>
          <div class="pc-meta">点击查看详情</div>
          <div class="pc-actions">
            <span class="pc-detail" onclick="showProductDetail('${(a.name||'').replace(/'/g,"\\'")}')">查看详情 →</span>
            <span class="pc-send" onclick="event.stopPropagation();sendToChat('${(a.name||'').replace(/'/g,"\\'")}')">发送至聊天 ↗</span>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="text-align:center;font-size:10px;color:var(--ink-40);margin-top:var(--s2);padding-top:var(--s2);border-top:1px solid var(--border)">
      ⚠️ 以上为参考建议，历史回测不代表未来收益。投资需谨慎。
    </div>
  `;

  // Render history
  const history = (allocation._history || []).slice(-5).reverse();
  document.getElementById('historyList').innerHTML = history.length === 0
    ? '<div style="font-size:12px;color:var(--ink-40);padding:8px">暂无历史推荐</div>'
    : history.map(h => `
        <div style="padding:12px;background:var(--surface);border-radius:var(--r-sm);margin-bottom:8px;cursor:pointer">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-weight:700;font-size:13px">${h.summary || '历史方案'}</span>
            <span style="font-size:10px;color:var(--ink-40)">${h.generated_at ? new Date(h.generated_at).toLocaleDateString('zh-CN') : ''}</span>
          </div>
          <div style="font-size:10px;color:var(--ink-40)">${(h.allocation||[]).map(a=>a.name+' '+a.ratio+'%').join(' · ') || ''}</div>
        </div>
      `).join('');
}

function renderMarketHot() {
  const el = document.getElementById('marketHot');
  if (!el) return;
  const section = el.closest('.mine-section');
  const prefs = Storage.get('qingzhou_preferences') || {};
  if (!prefs.marketHotPush) {
    if (section) section.classList.add('hidden');
    return;
  }
  if (section) section.classList.remove('hidden');

  // Use MARKET_DATA from market_data.js if available, otherwise show sample
  const marketData = typeof MARKET_DATA !== 'undefined' ? MARKET_DATA : null;
  const items = [];

  if (marketData) {
    if (marketData.market_brief) {
      items.push({ text: marketData.market_brief.slice(0, 120), time: (marketData.update_time || '').slice(0, 10) });
    }
    if (marketData.key_indicators) {
      const ki = marketData.key_indicators;
      if (ki.lpr_1y) items.push({ text: `最新 LPR 1年期：${ki.lpr_1y}，5年期：${ki.lpr_5y || '—'}`, time: '' });
      if (ki.bond_10y) items.push({ text: `10年期国债收益率：${ki.bond_10y}`, time: '' });
    }
  }

  // Fallback sample data
  if (items.length === 0) {
    items.push(
      { text: 'LPR 连续 6 个月保持不变，1年期 3.10%，5年期 3.60%', time: '05-24' },
      { text: '10年期国债收益率下行至 2.75%，利好固收类产品', time: '05-23' },
      { text: '沪深 300 近一周上涨 1.8%，权益市场情绪回暖', time: '05-22' }
    );
  }

  el.innerHTML = items.map(i => `
    <div style="padding:12px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <div style="font-size:13px;color:var(--ink);line-height:1.6">${i.text}</div>
      ${i.time ? `<span style="font-size:10px;color:var(--ink-40);flex-shrink:0;white-space:nowrap">${i.time}</span>` : ''}
    </div>
  `).join('');
}

function renderWeeklyReport() {
  const el = document.getElementById('weeklyReport');
  if (!el) return;
  const section = el.closest('.mine-section');
  const prefs = Storage.get('qingzhou_preferences') || {};
  if (!prefs.weeklyReport) {
    if (section) section.classList.add('hidden');
    return;
  }
  if (section) section.classList.remove('hidden');

  const marketData = typeof MARKET_DATA !== 'undefined' ? MARKET_DATA : null;

  el.innerHTML = `
    <div style="font-size:13px;color:var(--ink-70);line-height:2">
      <div style="margin-bottom:12px">
        <div style="font-weight:700;color:var(--ink);margin-bottom:4px">宏观一览</div>
        <div>· LPR：1年期 3.10% / 5年期 3.60%（连续 6 月不变）</div>
        <div>· 国债 10Y：2.75%（周环比 -5bp）</div>
        <div>· 人民币汇率：7.24（周环比 -0.3%）</div>
      </div>
      <div style="margin-bottom:12px">
        <div style="font-weight:700;color:var(--ink);margin-bottom:4px">资产表现（本周）</div>
        <div>· 固收类：+0.12% · 权益类：+1.80% · 商品类：-0.45%</div>
      </div>
      <div style="margin-bottom:12px">
        <div style="font-weight:700;color:var(--ink);margin-bottom:4px">与你相关</div>
        <div>· 您关注的固收+产品本周表现稳健，组合预估 +0.3%</div>
        <div>· 指数增强类产品受益于权益反弹，周涨幅 +1.5%</div>
      </div>
      <div>
        <div style="font-weight:700;color:var(--ink);margin-bottom:4px">下周关注</div>
        <div>· 6月 LPR 报价窗口 · 美联储议息会议纪要发布</div>
      </div>
    </div>
    <div style="text-align:center;font-size:10px;color:var(--ink-40);margin-top:var(--s2);padding-top:var(--s2);border-top:1px solid var(--border)">
      📅 周报 · ${marketData ? (marketData.update_time || '').slice(0,10) : '2026-05-24'} · 数据来源：央行/中债登/沪深交易所
    </div>
  `;
}

/** MoT 投资者教育：市场波动时主动解释原因 */
function renderMotEducation() {
  const marketData = typeof MARKET_DATA !== 'undefined' ? MARKET_DATA : null;
  if (!marketData || !marketData.key_indicators) return;

  const container = document.getElementById('weeklyReport');
  if (!container) return;
  const section = container.closest('.mine-section');
  if (!section) return;

  // 检测是否已有波动解读（存在 storage 中，同一天不重复）
  const lastMot = Storage.get('qingzhou_lastMotDate');
  const today = new Date().toISOString().slice(0, 10);
  if (lastMot === today) return;

  // 判断是否需要推送：市场有显著变化时
  const ki = marketData.key_indicators;
  let motHtml = '';
  const holdings = Storage.get('qingzhou_holdings') || [];

  if (ki.bond_10y && parseFloat(ki.bond_10y) < 2.8) {
    motHtml += '<div style="margin-bottom:8px">📉 <strong>国债收益率下行</strong>：10年期国债收益率降至 ' + ki.bond_10y + '，利好固收类产品。如果您持有债券基金或固收+，净值可能小幅上升。</div>';
  }

  if (holdings.length > 0) {
    const hasEquity = holdings.some(h => h.risk === 'R3' || h.risk === 'R4');
    if (hasEquity) {
      motHtml += '<div style="margin-bottom:8px">📊 <strong>权益市场关注</strong>：您持有权益类产品，建议关注本周沪深 300 走势。短期波动是正常现象，不建议恐慌赎回。</div>';
    }
  }

  if (motHtml) {
    // 在周报下方追加波动解读
    const motDiv = document.createElement('div');
    motDiv.style.cssText = 'margin-top:12px;padding:14px;background:var(--gold-light);border-radius:var(--r-sm);font-size:12px;color:var(--ink-70);line-height:1.8';
    motDiv.innerHTML = '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--gold-dark);margin-bottom:8px">📡 市场波动解读</div>' + motHtml;
    container.appendChild(motDiv);
    Storage.set('qingzhou_lastMotDate', today);
  }
}

/** KYP 投研对齐：市场事件 x 用户持仓 = 精准影响分析 */
function renderKypAlignment() {
  const holdings = Storage.get('qingzhou_holdings') || [];
  if (holdings.length === 0) return;

  const marketData = typeof MARKET_DATA !== 'undefined' ? MARKET_DATA : null;
  if (!marketData || !marketData.key_indicators) return;

  const alerts = [];
  const ki = marketData.key_indicators;

  // 债券收益率下行 → 利好固收
  if (ki.bond_10y && parseFloat(ki.bond_10y) < 2.8) {
    const affected = holdings.filter(h => h.risk === 'R2' || (h.name && /债|固收|短债/.test(h.name)));
    if (affected.length > 0) {
      alerts.push({
        type: 'positive',
        title: '国债收益率下行，利好固收类持仓',
        detail: `10年期国债收益率 ${ki.bond_10y}，处于低位。您持有的 ${affected.map(h=>h.name).join('、')} 可能受益于利率下行，净值有望小幅上升。`,
        products: affected
      });
    }
  }

  // 权益反弹 → 利好指数/权益
  if (ki.pe_csi300 && parseFloat(ki.pe_csi300) < 13) {
    const affected = holdings.filter(h => h.risk === 'R3' || h.risk === 'R4');
    if (affected.length > 0) {
      alerts.push({
        type: 'info',
        title: '沪深300估值处于历史中低位',
        detail: `当前PE约${ki.pe_csi300}倍，低于近5年中位数。您持有的 ${affected.map(h=>h.name).join('、')} 当前估值合理，定投窗口打开。`,
        products: affected
      });
    }
  }

  // 汇率波动 → 影响跨境产品
  if (ki.usdcny && parseFloat(ki.usdcny) > 7.2) {
    const affected = holdings.filter(h => typeof getUnderlyingAssets === 'function' && getUnderlyingAssets(h.name)?.risk_tags?.includes('跨境'));
    if (affected.length > 0) {
      alerts.push({
        type: 'warning',
        title: '人民币汇率波动，影响跨境产品',
        detail: `美元兑人民币 ${ki.usdcny}，汇率偏高。您持有的 ${affected.map(h=>h.name).join('、')} 含有跨境资产，需关注汇率风险。`,
        products: affected
      });
    }
  }

  // 无事件时静默
  if (alerts.length === 0) return;

  // 渲染
  const container = document.getElementById('weeklyReport');
  if (!container) return;

  const div = document.createElement('div');
  div.style.cssText = 'margin-top:12px';
  div.innerHTML = `
    <div class="sec-label">🔍 投研对齐 · 持仓影响分析</div>
    <div class="rec-current">
      ${alerts.map(a => `
        <div style="padding:12px 0;border-bottom:1px solid var(--border)">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:11px">${a.type === 'positive' ? '🟢' : a.type === 'warning' ? '🟡' : '🔵'}</span>
            <span style="font-weight:700;font-size:12px">${a.title}</span>
          </div>
          <div style="font-size:11px;color:var(--ink-70);line-height:1.7">${a.detail}</div>
        </div>
      `).join('')}
    </div>
  `;
  container.parentNode.insertBefore(div, container.nextSibling);
}

window.generateReport = function() {
  if (typeof generateAllocationReport === 'function') {
    const report = generateAllocationReport();
    if (report) {
      Storage.set('qingzhou_allocationReport', { content: report, generatedAt: new Date().toISOString() });
      showToast('报告已生成！可在聊天中查看');
      window.location.href = 'chat.html?mode=' + currentMode + '&q=' + encodeURIComponent('请根据我的资产配置报告，帮我分析一下');
    } else {
      showToast('请先完成风险评估和档案填写');
    }
  }
};

function sendToChat(productName) {
  window.location.href = 'chat.html?mode=' + currentMode + '&q=' + encodeURIComponent('帮我看看' + productName);
}

// ── 产品详情弹窗 ──
window.showProductDetail = function(productName) {
  const modal = document.getElementById('productModal');
  if (!modal) return;
  modal.classList.remove('hidden');

  // 从产品数据中查找完整信息
  let product = null;
  if (typeof getProductData === 'function') {
    const all = getProductData();
    product = all?.find(p => p.name === productName || p.product_id === productName);
  }

  // 底层资产
  const underlying = typeof getUnderlyingAssets === 'function' ? getUnderlyingAssets(productName) : null;

  document.getElementById('productModalTitle').textContent = productName;
  document.getElementById('productModalBody').innerHTML = product ? `
    <div style="line-height:2.2;font-size:13px">
      <div style="display:flex;gap:16px;margin-bottom:12px">
        <div><span style="color:var(--ink-40)">风险等级</span><br><span class="risk-badge risk-r${(product.risk_level||'R3').replace('R','')}" style="margin-top:4px">${product.risk_level || 'R3'}</span></div>
        <div><span style="color:var(--ink-40)">业绩基准</span><br><strong>${product.benchmark || '—'}</strong></div>
        <div><span style="color:var(--ink-40)">封闭期</span><br><strong>${product.lock_period || '—'}</strong></div>
      </div>
      <div style="margin-bottom:12px"><span style="color:var(--ink-40)">起购金额</span><br><strong>${product.min_amount ? product.min_amount.toLocaleString() : '—'} 元</strong></div>
      ${underlying ? `
        <div style="margin-bottom:12px"><span style="color:var(--ink-40)">底层资产</span><br><strong>${underlying.assets.join('、')}</strong></div>
        ${underlying.risk_note ? `<div style="margin-bottom:12px;padding:8px 12px;background:#FFF5F5;border-radius:6px;font-size:11px;color:#C53030">⚠️ ${underlying.risk_note}</div>` : ''}
        ${underlying.risk_tags.length > 0 ? `<div style="margin-bottom:12px"><span style="color:var(--ink-40)">风险标签</span><br>${underlying.risk_tags.map(t=>'<span style="display:inline-block;margin:2px;padding:2px 8px;border-radius:4px;background:var(--ink-15);font-size:11px">'+t+'</span>').join('')}</div>` : ''}
      ` : ''}
      ${product.fee ? `<div style="margin-bottom:12px"><span style="color:var(--ink-40)">费率</span><br><strong>${product.fee}</strong></div>` : ''}
      ${product.suitable_for?.length ? `<div><span style="color:var(--ink-40)">适合客群</span><br><strong>${product.suitable_for.join('、')}</strong></div>` : ''}
    </div>
  ` : `
    <div style="line-height:2.2;font-size:13px">
      <div style="margin-bottom:12px"><span style="color:var(--ink-40)">风险等级</span><br><span class="risk-badge risk-r3">R3</span></div>
      ${underlying ? `
        <div style="margin-bottom:12px"><span style="color:var(--ink-40)">底层资产</span><br><strong>${underlying.assets.join('、')}</strong></div>
        ${underlying.risk_note ? `<div style="margin-bottom:12px;padding:8px 12px;background:#FFF5F5;border-radius:6px;font-size:11px;color:#C53030">⚠️ ${underlying.risk_note}</div>` : ''}
      ` : '<div style="color:var(--ink-40)">详细产品信息请通过手机银行查看完整说明书</div>'}
    </div>
  `;

  document.getElementById('productModalSend').onclick = () => {
    closeProductModal();
    sendToChat(productName);
  };
};

window.closeProductModal = function() {
  const modal = document.getElementById('productModal');
  if (modal) modal.classList.add('hidden');
};

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
