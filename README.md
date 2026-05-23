# 轻舟（Qingzhou）

> 两岸猿声啼不住，轻舟已过万重山。——李白《早发白帝城》

**基于大模型技术的智慧银行理财顾问智能体**。用 AI 把复杂的理财世界变成一叶轻舟，为不同客群提供差异化、合规、多模态的智能理财服务。

---

## 核心能力

- **千人千面**：基于用户风险偏好、资产状况、投资目标，生成个性化资产配置方案
- **三层合规护栏**：注入检测 → 关键词拦截 → 语义审查 → 强制标签追加
- **三种交互模式**：经典版（专业稳重）/ 关怀版（大字语音）/ 青春版（数据驱动）
- **RAG 知识库**：1260 只理财产品，6 大品类，按用户画像自动过滤
- **语音交互**：元景语音交互 3.0 API，3 种高自然度音色
- **量化评估**：夏普比率 / 最大回撤 / VaR / CVaR / 蒙特卡洛模拟
- **多模态输入**：支持图片上传 + GLM-5 视觉理解

---

## 页面结构

```
index.html         欢迎页 · 模式选择
chat.html          对话核心 · AI 理财顾问
recommend.html     推荐中心 · 配置方案 + 市场热点 + 周报
account.html       账户管理 · 资产总览 + 快捷操作 + 持仓
mine.html          我的 · 设置与档案
```

---

## 技术栈

纯静态 HTML/CSS/JS，零构建工具，浏览器直接运行。

| 层级 | 技术 |
|------|------|
| 前端 | HTML5 + CSS3（Custom Properties）+ Vanilla JS（ES6+） |
| 图表 | Chart.js 4.x（CDN） |
| 语音识别 | Web Speech API |
| 语音合成 | 元景语音交互 3.0（WebSocket） + macOS `say` 降级 |
| AI 模型 | DeepSeek-V3.2（对话）/ GLM-5（多模态） |
| 后端代理 | Python `server.py`（CORS 代理 + TTS 代理） |
| 市场数据 | akshare（LPR / 国债 / PE / 黄金 / 汇率） |
| 测试 | Playwright（E2E）+ Python 静态分析 |

---

## 本地运行

```bash
cd qingzhou
python3 server.py
# 浏览器打开 http://localhost:8765
```

> `server.py` 负责 CORS 代理（转发 API 请求到元景万悟平台）和 TTS 语音合成代理。

---

## 量化评分

```
合规安全 90.7 · 对话质量 87.4 · 理财专业度 88.7
技术实现 90.0 · 用户体验 85.9 · 安全隐私 94.5
性能加载 87.0

综合 89.2 分（7 维度 × 35 指标）
E2E 功能测试：24/24 全部通过
```

---

## 设计系统

瑞士网格银行（Müller-Brockmann + Build），通过 CSS 自定义属性实现三模式主题切换。

| 令牌 | 经典版 | 关怀版 | 青春版 |
|------|--------|--------|--------|
| 底色 | `#FAF8F5` 暖白 | `#FBF7F0` 暖米 | `#0F0F14` 深黑 |
| 主色 | `#1A1F2E` 深蓝 | `#2C2416` 深棕 | `#E8E8F0` 浅灰 |
| Accent | `#C8A45C` 暖金 | `#C04A1A` 赤土橙 | `#7C5CF0` 紫 |
| Display | Cormorant Garamond | Noto Serif SC | JetBrains Mono |
| Body | Inter · SF Pro | Inter · SF Pro | Inter · SF Pro |

---

## 文件结构

```
qingzhou/
├── index.html                 欢迎页
├── chat.html                  对话页
├── recommend.html             推荐中心
├── account.html               账户管理
├── mine.html                  我的 · 设置
├── css/
│   └── style.css              全站样式（三模式 + 响应式）
├── js/
│   ├── storage.js             localStorage 读写封装
│   ├── config.js              API 配置
│   ├── api.js                 API 调用封装
│   ├── router.js              L1 前端意图路由
│   ├── chat.js                对话页逻辑
│   ├── recommend.js           推荐中心逻辑
│   ├── account.js             账户页逻辑
│   ├── mine.js                我的页逻辑
│   ├── data.js                Fallback 预设数据
│   ├── profile_engine.js      画像引擎 + System Prompt 构建
│   ├── risk_calculator.js     理财量化计算引擎
│   ├── market_data.js         市场宏观数据
│   ├── demo_products_index.js 产品索引（1260 只）
│   ├── product_catalog.js     产品编目加载器
│   └── products_*.js          六品类产品数据
├── server.py                  本地开发服务器 + API 代理
├── sync_products.py           产品数据同步 + 市场数据抓取
└── tests/
    ├── e2e_test.py            Playwright E2E 全功能测试
    └── run_all.py             7 维度量化评估
```

---

## 平台依赖

- **元景万悟智能体平台**：对话模型（DeepSeek-V3.2）+ 多模态（GLM-5）+ 语音交互 3.0
- **akshare**：中国金融市场实时数据
- **Chart.js**：仪表盘图表渲染

---

## 团队

- 廖福临 · 浙江工业大学金融学 2024 级
- Pegasus Design · UI 设计系统
- Claude Code · AI 辅助开发

---

## 许可

本项目为学术竞赛作品，仅供学习交流使用。

⚠️ 理财非存款，产品有风险，投资须谨慎。
