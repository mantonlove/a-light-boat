const DEMO_PRODUCTS = [
  {
    "product_id": "BW001",
    "name": "活期盈",
    "type": "货币基金",
    "risk_level": "R1",
    "min_amount": 1,
    "lock_period": "活期（随时申赎）",
    "benchmark": "1.2%-1.8%（七日年化）",
    "underlying": [
      "银行存款",
      "同业存单",
      "短期国债",
      "央行票据"
    ],
    "suitable_for": [
      "保守型",
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "1.5%",
    "historical_return_3y": "1.6%",
    "fee": "管理费0.15%/年",
    "redemption": "T+1，单日快赎1万",
    "status": "在售",
    "tags": [
      "灵活存取",
      "零钱管理",
      "现金",
      "低风险"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BW002",
    "name": "日盈宝",
    "type": "货币基金",
    "risk_level": "R1",
    "min_amount": 100,
    "lock_period": "活期",
    "benchmark": "1.3%-1.9%（七日年化）",
    "underlying": [
      "同业存单",
      "短期融资券",
      "银行存款"
    ],
    "suitable_for": [
      "保守型",
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "1.6%",
    "historical_return_3y": "1.7%",
    "fee": "管理费0.12%/年",
    "redemption": "T+0快赎（5万以内）",
    "status": "在售",
    "tags": [
      "灵活存取",
      "T+0",
      "高流动性"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BW003",
    "name": "大额存单3年期",
    "type": "存款",
    "risk_level": "R1",
    "min_amount": 200000,
    "lock_period": "3年",
    "benchmark": "2.5%（固定利率）",
    "underlying": [
      "银行存款"
    ],
    "suitable_for": [
      "保守型",
      "稳健型"
    ],
    "historical_return_1y": "—",
    "historical_return_3y": "—",
    "fee": "无",
    "redemption": "到期还本付息，提前支取按活期0.2%计息",
    "status": "在售",
    "tags": [
      "存款保险",
      "保本",
      "中长期",
      "50万保障"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BW004",
    "name": "大额存单1年期",
    "type": "存款",
    "risk_level": "R1",
    "min_amount": 200000,
    "lock_period": "1年",
    "benchmark": "1.9%（固定利率）",
    "underlying": [
      "银行存款"
    ],
    "suitable_for": [
      "保守型",
      "稳健型"
    ],
    "historical_return_1y": "—",
    "historical_return_3y": "—",
    "fee": "无",
    "redemption": "到期本息",
    "status": "在售",
    "tags": [
      "存款保险",
      "保本",
      "短期"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BW005",
    "name": "安鑫短债30天",
    "type": "短债基金",
    "risk_level": "R2",
    "min_amount": 1000,
    "lock_period": "30天滚动持有",
    "benchmark": "2.0%-2.5%",
    "underlying": [
      "高等级短久期信用债",
      "同业存单",
      "银行存款"
    ],
    "suitable_for": [
      "保守型",
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "2.3%",
    "historical_return_3y": "2.4%",
    "fee": "管理费0.20%/年",
    "redemption": "到期自动赎回T+2",
    "status": "在售",
    "tags": [
      "短期",
      "低波动",
      "流动性好"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BW006",
    "name": "安鑫短债60天",
    "type": "短债基金",
    "risk_level": "R2",
    "min_amount": 1000,
    "lock_period": "60天滚动持有",
    "benchmark": "2.2%-2.8%",
    "underlying": [
      "高等级短久期信用债",
      "银行存款"
    ],
    "suitable_for": [
      "保守型",
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "2.5%",
    "historical_return_3y": "2.6%",
    "fee": "管理费0.22%/年",
    "redemption": "到期T+2",
    "status": "在售",
    "tags": [
      "短期",
      "低波动",
      "稳健"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BW007",
    "name": "天利同业存单指数",
    "type": "指数基金",
    "risk_level": "R2",
    "min_amount": 100,
    "lock_period": "7天锁定",
    "benchmark": "1.8%-2.2%（跟踪AAA同业存单指数）",
    "underlying": [
      "AAA级同业存单"
    ],
    "suitable_for": [
      "保守型",
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "2.0%",
    "historical_return_3y": "—",
    "fee": "管理费0.15%/年",
    "redemption": "T+2",
    "status": "在售",
    "tags": [
      "同业存单",
      "低门槛",
      "高流动性",
      "指数"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BW008",
    "name": "稳享固收增强6个月",
    "type": "固定收益类",
    "risk_level": "R2",
    "min_amount": 10000,
    "lock_period": "6个月持有期",
    "benchmark": "2.8%-3.5%",
    "underlying": [
      "高等级信用债",
      "同业存单",
      "银行存款",
      "≤10%可转债"
    ],
    "suitable_for": [
      "保守型",
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "3.2%",
    "historical_return_3y": "3.0%",
    "fee": "管理费0.30%/年",
    "redemption": "持有期满T+1",
    "status": "在售",
    "tags": [
      "稳健",
      "短期限",
      "固收"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BW009",
    "name": "稳享固收增强12个月",
    "type": "固定收益类",
    "risk_level": "R2",
    "min_amount": 10000,
    "lock_period": "12个月持有期",
    "benchmark": "3.0%-3.8%",
    "underlying": [
      "高等级信用债",
      "同业存单",
      "≤15%可转债"
    ],
    "suitable_for": [
      "保守型",
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "3.5%",
    "historical_return_3y": "3.3%",
    "fee": "管理费0.35%/年",
    "redemption": "持有期满T+1",
    "status": "在售",
    "tags": [
      "稳健",
      "中长期",
      "固收"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BW010",
    "name": "金葵花固收90天",
    "type": "固定收益类",
    "risk_level": "R2",
    "min_amount": 50000,
    "lock_period": "90天",
    "benchmark": "2.5%-3.2%",
    "underlying": [
      "高等级信用债",
      "银行存款",
      "政策性金融债"
    ],
    "suitable_for": [
      "保守型",
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "2.9%",
    "historical_return_3y": "3.0%",
    "fee": "管理费0.25%/年",
    "redemption": "到期T+1",
    "status": "在售",
    "tags": [
      "短期限",
      "固收",
      "中等门槛"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BW011",
    "name": "稳盈固收+12个月",
    "type": "固收+",
    "risk_level": "R3",
    "min_amount": 10000,
    "lock_period": "12个月封闭期",
    "benchmark": "3.5%-4.5%",
    "underlying": [
      "债券≥80%",
      "股票≤20%",
      "可转债"
    ],
    "suitable_for": [
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "4.0%",
    "historical_return_3y": "3.8%",
    "fee": "管理费0.40%/年",
    "redemption": "封闭期满T+2",
    "status": "在售",
    "tags": [
      "固收+",
      "中期限",
      "稳健增强",
      "股债搭配"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BW012",
    "name": "稳盈固收+6个月",
    "type": "固收+",
    "risk_level": "R3",
    "min_amount": 10000,
    "lock_period": "6个月持有期",
    "benchmark": "3.0%-4.0%",
    "underlying": [
      "债券≥85%",
      "股票≤15%"
    ],
    "suitable_for": [
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "3.6%",
    "historical_return_3y": "3.5%",
    "fee": "管理费0.38%/年",
    "redemption": "持有期满T+2",
    "status": "在售",
    "tags": [
      "固收+",
      "短期",
      "稳健增强"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BW013",
    "name": "均衡配置混合",
    "type": "混合型",
    "risk_level": "R3",
    "min_amount": 1000,
    "lock_period": "6个月持有期",
    "benchmark": "3.0%-5.0%",
    "underlying": [
      "债券40%-60%",
      "股票30%-50%",
      "货币工具10%-20%"
    ],
    "suitable_for": [
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "4.5%",
    "historical_return_3y": "4.2%",
    "fee": "管理费0.60%/年",
    "redemption": "持有期满T+2",
    "status": "在售",
    "tags": [
      "股债均衡",
      "灵活配置",
      "中等风险"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BW014",
    "name": "稳健增长混合1年",
    "type": "混合型",
    "risk_level": "R3",
    "min_amount": 5000,
    "lock_period": "12个月封闭期",
    "benchmark": "3.5%-5.5%",
    "underlying": [
      "债券30%-50%",
      "股票40%-60%",
      "港股≤10%"
    ],
    "suitable_for": [
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "5.0%",
    "historical_return_3y": "4.8%",
    "fee": "管理费0.70%/年",
    "redemption": "封闭期满T+2",
    "status": "在售",
    "tags": [
      "股债均衡",
      "中长期",
      "港股"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BW015",
    "name": "绿色ESG主题混合",
    "type": "主题混合",
    "risk_level": "R3",
    "min_amount": 1000,
    "lock_period": "6个月持有期",
    "benchmark": "3.5%-6.0%",
    "underlying": [
      "ESG评级A级以上股票50%-70%",
      "绿色债券20%-30%"
    ],
    "suitable_for": [
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "5.2%",
    "historical_return_3y": "—",
    "fee": "管理费0.80%/年",
    "redemption": "T+2",
    "status": "在售",
    "tags": [
      "ESG",
      "碳中和",
      "绿色金融",
      "Z世代推荐"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BW016",
    "name": "结构性存款3个月（挂钩沪深300）",
    "type": "结构性存款",
    "risk_level": "R2",
    "min_amount": 10000,
    "lock_period": "3个月",
    "benchmark": "1.5%-4.0%（保底1.5%）",
    "underlying": [
      "存款+沪深300期权"
    ],
    "suitable_for": [
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "—",
    "historical_return_3y": "—",
    "fee": "无",
    "redemption": "到期自动还本付息",
    "status": "在售",
    "tags": [
      "结构性",
      "保底收益",
      "挂钩指数"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BW017",
    "name": "结构性存款6个月（挂钩黄金）",
    "type": "结构性存款",
    "risk_level": "R2",
    "min_amount": 50000,
    "lock_period": "6个月",
    "benchmark": "1.5%-4.5%（保底1.5%）",
    "underlying": [
      "存款+黄金期权"
    ],
    "suitable_for": [
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "—",
    "historical_return_3y": "—",
    "fee": "无",
    "redemption": "到期自动",
    "status": "在售",
    "tags": [
      "结构性",
      "黄金挂钩",
      "保底"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BW018",
    "name": "结构性存款1年（挂钩中证500）",
    "type": "结构性存款",
    "risk_level": "R2",
    "min_amount": 10000,
    "lock_period": "12个月",
    "benchmark": "1.5%-5.0%（保底1.5%）",
    "underlying": [
      "存款+中证500期权"
    ],
    "suitable_for": [
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "—",
    "historical_return_3y": "—",
    "fee": "无",
    "redemption": "到期自动",
    "status": "在售",
    "tags": [
      "结构性",
      "指数挂钩",
      "保底"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "MF001",
    "name": "沪深300指数增强",
    "type": "指数增强",
    "risk_level": "R4",
    "min_amount": 100,
    "lock_period": "3个月",
    "benchmark": "跟踪沪深300+年化增强1%-2%",
    "underlying": [
      "沪深300成分股"
    ],
    "suitable_for": [
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "6.5%",
    "historical_return_3y": "4.8%",
    "fee": "管理费0.50%/年",
    "redemption": "T+2",
    "status": "在售",
    "tags": [
      "大盘蓝筹",
      "指数投资",
      "低费率",
      "定投推荐"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "MF002",
    "name": "中证500指数增强",
    "type": "指数增强",
    "risk_level": "R4",
    "min_amount": 100,
    "lock_period": "3个月",
    "benchmark": "跟踪中证500+年化增强2%-3%",
    "underlying": [
      "中证500成分股"
    ],
    "suitable_for": [
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "8.2%",
    "historical_return_3y": "6.5%",
    "fee": "管理费0.60%/年",
    "redemption": "T+2",
    "status": "在售",
    "tags": [
      "中盘成长",
      "指数",
      "定投"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "MF003",
    "name": "创业板指数基金",
    "type": "指数基金",
    "risk_level": "R5",
    "min_amount": 100,
    "lock_period": "3个月",
    "benchmark": "跟踪创业板指",
    "underlying": [
      "创业板成分股"
    ],
    "suitable_for": [
      "激进型"
    ],
    "historical_return_1y": "10.5%",
    "historical_return_3y": "7.2%",
    "fee": "管理费0.50%/年",
    "redemption": "T+2",
    "status": "在售",
    "tags": [
      "创业板",
      "高弹性",
      "高波动"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "MF004",
    "name": "科技主题混合",
    "type": "主题混合",
    "risk_level": "R4",
    "min_amount": 1000,
    "lock_period": "12个月",
    "benchmark": "4.0%-8.0%",
    "underlying": [
      "A股科技龙头60%-80%",
      "港股科技10%-20%"
    ],
    "suitable_for": [
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "7.8%",
    "historical_return_3y": "5.5%",
    "fee": "管理费1.00%/年",
    "redemption": "T+3",
    "status": "在售",
    "tags": [
      "科技",
      "成长",
      "AI主题",
      "Z世代推荐"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "MF005",
    "name": "消费行业精选",
    "type": "行业主题",
    "risk_level": "R4",
    "min_amount": 1000,
    "lock_period": "6个月",
    "benchmark": "4.0%-7.0%",
    "underlying": [
      "食品饮料龙头",
      "家电",
      "免税零售"
    ],
    "suitable_for": [
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "6.0%",
    "historical_return_3y": "5.2%",
    "fee": "管理费0.90%/年",
    "redemption": "T+2",
    "status": "在售",
    "tags": [
      "消费",
      "品牌龙头",
      "防御"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "MF006",
    "name": "医药健康主题",
    "type": "行业主题",
    "risk_level": "R4",
    "min_amount": 1000,
    "lock_period": "6个月",
    "benchmark": "4.0%-9.0%",
    "underlying": [
      "创新药",
      "医疗器械",
      "医疗服务"
    ],
    "suitable_for": [
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "5.5%",
    "historical_return_3y": "4.0%",
    "fee": "管理费1.00%/年",
    "redemption": "T+2",
    "status": "在售",
    "tags": [
      "医药",
      "创新药",
      "长期赛道"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "MF007",
    "name": "新能源行业精选",
    "type": "行业主题",
    "risk_level": "R5",
    "min_amount": 1000,
    "lock_period": "12个月",
    "benchmark": "5.0%-12.0%",
    "underlying": [
      "光伏30-40%",
      "锂电池30-40%",
      "新能源车10-20%"
    ],
    "suitable_for": [
      "激进型"
    ],
    "historical_return_1y": "9.2%",
    "historical_return_3y": "6.0%",
    "fee": "管理费1.20%/年",
    "redemption": "T+3",
    "status": "在售",
    "tags": [
      "新能源",
      "行业集中",
      "高弹性",
      "政策受益"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "MF008",
    "name": "军工主题混合",
    "type": "行业主题",
    "risk_level": "R5",
    "min_amount": 1000,
    "lock_period": "12个月",
    "benchmark": "4.0%-10.0%",
    "underlying": [
      "航空航天",
      "船舶制造",
      "国防信息化"
    ],
    "suitable_for": [
      "激进型"
    ],
    "historical_return_1y": "7.0%",
    "historical_return_3y": "5.8%",
    "fee": "管理费1.10%/年",
    "redemption": "T+3",
    "status": "在售",
    "tags": [
      "军工",
      "国防",
      "高波动"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "MF009",
    "name": "全球配置QDII",
    "type": "QDII",
    "risk_level": "R4",
    "min_amount": 1000,
    "lock_period": "6个月",
    "benchmark": "3.0%-6.0%",
    "underlying": [
      "海外股票ETF50-60%",
      "海外债券ETF20-30%",
      "REITs10-20%"
    ],
    "suitable_for": [
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "5.0%",
    "historical_return_3y": "4.5%",
    "fee": "管理费1.20%/年",
    "redemption": "T+5（含海外结算）",
    "status": "在售",
    "tags": [
      "海外配置",
      "分散风险",
      "汇率敞口",
      "全球"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "MF010",
    "name": "纳斯达克100指数QDII",
    "type": "QDII",
    "risk_level": "R4",
    "min_amount": 100,
    "lock_period": "3个月",
    "benchmark": "跟踪纳斯达克100指数",
    "underlying": [
      "纳斯达克100成分股"
    ],
    "suitable_for": [
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "12.0%",
    "historical_return_3y": "11.5%",
    "fee": "管理费0.80%/年",
    "redemption": "T+5",
    "status": "在售",
    "tags": [
      "美股",
      "科技",
      "QDII"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "MF011",
    "name": "科创50ETF联接",
    "type": "ETF联接",
    "risk_level": "R5",
    "min_amount": 100,
    "lock_period": "3个月",
    "benchmark": "跟踪科创50指数",
    "underlying": [
      "科创板50成分股"
    ],
    "suitable_for": [
      "激进型"
    ],
    "historical_return_1y": "8.5%",
    "historical_return_3y": "—",
    "fee": "管理费0.50%/年",
    "redemption": "T+3",
    "status": "在售",
    "tags": [
      "科创板",
      "高成长",
      "高波动",
      "科技创新"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "MF012",
    "name": "红利低波ETF联接",
    "type": "ETF联接",
    "risk_level": "R3",
    "min_amount": 100,
    "lock_period": "3个月",
    "benchmark": "跟踪中证红利低波指数",
    "underlying": [
      "高股息率",
      "低波动率股票"
    ],
    "suitable_for": [
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "4.5%",
    "historical_return_3y": "5.0%",
    "fee": "管理费0.40%/年",
    "redemption": "T+2",
    "status": "在售",
    "tags": [
      "红利",
      "低波",
      "价值投资",
      "分红"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "MF013",
    "name": "纯债稳健增强",
    "type": "债券基金",
    "risk_level": "R2",
    "min_amount": 100,
    "lock_period": "30天",
    "benchmark": "2.5%-3.5%",
    "underlying": [
      "国债",
      "政策性金融债",
      "高等级信用债"
    ],
    "suitable_for": [
      "保守型",
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "3.0%",
    "historical_return_3y": "3.2%",
    "fee": "管理费0.30%/年",
    "redemption": "T+2",
    "status": "在售",
    "tags": [
      "纯债",
      "低风险",
      "稳健"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "MF014",
    "name": "可转债增强基金",
    "type": "可转债基金",
    "risk_level": "R3",
    "min_amount": 1000,
    "lock_period": "6个月",
    "benchmark": "3.0%-6.0%",
    "underlying": [
      "可转债60-80%",
      "纯债20-40%"
    ],
    "suitable_for": [
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "5.5%",
    "historical_return_3y": "4.8%",
    "fee": "管理费0.60%/年",
    "redemption": "T+2",
    "status": "在售",
    "tags": [
      "可转债",
      "股债兼备",
      "弹性"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "MF015",
    "name": "同业存单AAA指数基金",
    "type": "指数基金",
    "risk_level": "R2",
    "min_amount": 100,
    "lock_period": "7天",
    "benchmark": "1.8%-2.3%",
    "underlying": [
      "AAA级同业存单"
    ],
    "suitable_for": [
      "保守型",
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "2.1%",
    "historical_return_3y": "—",
    "fee": "管理费0.15%/年",
    "redemption": "T+2",
    "status": "在售",
    "tags": [
      "同业存单",
      "超低波动",
      "现金管理"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "INS001",
    "name": "稳盈年金险",
    "type": "年金保险",
    "risk_level": "R2",
    "min_amount": 10000,
    "lock_period": "5年以上",
    "benchmark": "2.5%-3.5%（预定利率）",
    "underlying": [
      "固定收益资产"
    ],
    "suitable_for": [
      "保守型",
      "稳健型"
    ],
    "historical_return_1y": "—",
    "historical_return_3y": "—",
    "fee": "—",
    "redemption": "按保单约定",
    "status": "在售",
    "tags": [
      "养老",
      "年金",
      "保障",
      "退休规划"
    ],
    "data_source": "nfra.gov.cn",
    "category": "保险理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "INS002",
    "name": "增额终身寿险",
    "type": "寿险",
    "risk_level": "R2",
    "min_amount": 5000,
    "lock_period": "长期（10年以上）",
    "benchmark": "3.0%复利递增（保额）",
    "underlying": [
      "固定收益资产"
    ],
    "suitable_for": [
      "保守型",
      "稳健型"
    ],
    "historical_return_1y": "—",
    "historical_return_3y": "—",
    "fee": "—",
    "redemption": "按保单约定（早期退保有损失）",
    "status": "在售",
    "tags": [
      "寿险",
      "传承",
      "复利",
      "长期"
    ],
    "data_source": "nfra.gov.cn",
    "category": "保险理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "INS003",
    "name": "万能险（灵活型）",
    "type": "万能保险",
    "risk_level": "R2",
    "min_amount": 1000,
    "lock_period": "灵活（最低持有1年）",
    "benchmark": "2.0%保底+浮动（目前结算约3.5%）",
    "underlying": [
      "固定收益+权益资产"
    ],
    "suitable_for": [
      "稳健型",
      "平衡型"
    ],
    "historical_return_1y": "3.5%",
    "historical_return_3y": "3.8%",
    "fee": "初始费1%，管理费0.5%/年",
    "redemption": "T+3",
    "status": "在售",
    "tags": [
      "万能险",
      "保底",
      "灵活",
      "浮动收益"
    ],
    "data_source": "nfra.gov.cn",
    "category": "保险理财",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BD001",
    "name": "储蓄国债3年期",
    "type": "国债",
    "risk_level": "R1",
    "min_amount": 100,
    "lock_period": "3年",
    "benchmark": "2.2%-2.5%",
    "underlying": [
      "国家信用"
    ],
    "suitable_for": [
      "保守型",
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "—",
    "historical_return_3y": "—",
    "fee": "无",
    "redemption": "到期兑付，提前兑取按持有时间计息",
    "status": "在售",
    "tags": [
      "国债",
      "国家信用",
      "零风险",
      "稳健"
    ],
    "data_source": "chinabond.com.cn",
    "category": "债券",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BD002",
    "name": "储蓄国债5年期",
    "type": "国债",
    "risk_level": "R1",
    "min_amount": 100,
    "lock_period": "5年",
    "benchmark": "2.5%-2.8%",
    "underlying": [
      "国家信用"
    ],
    "suitable_for": [
      "保守型",
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "—",
    "historical_return_3y": "—",
    "fee": "无",
    "redemption": "到期兑付",
    "status": "在售",
    "tags": [
      "国债",
      "长期",
      "稳健",
      "养老推荐"
    ],
    "data_source": "chinabond.com.cn",
    "category": "债券",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BD003",
    "name": "地方政府债3年期",
    "type": "地方债",
    "risk_level": "R2",
    "min_amount": 1000,
    "lock_period": "3年",
    "benchmark": "2.4%-2.7%",
    "underlying": [
      "地方政府信用"
    ],
    "suitable_for": [
      "保守型",
      "稳健型"
    ],
    "historical_return_1y": "—",
    "historical_return_3y": "—",
    "fee": "无",
    "redemption": "到期兑付",
    "status": "在售",
    "tags": [
      "地方债",
      "准国债",
      "中等期限"
    ],
    "data_source": "chinabond.com.cn",
    "category": "债券",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BD004",
    "name": "政策性金融债1年期",
    "type": "金融债",
    "risk_level": "R2",
    "min_amount": 1000,
    "lock_period": "1年",
    "benchmark": "2.0%-2.3%",
    "underlying": [
      "政策性银行信用"
    ],
    "suitable_for": [
      "保守型",
      "稳健型"
    ],
    "historical_return_1y": "—",
    "historical_return_3y": "—",
    "fee": "无",
    "redemption": "到期兑付",
    "status": "在售",
    "tags": [
      "金融债",
      "短期限",
      "低风险"
    ],
    "data_source": "chinabond.com.cn",
    "category": "债券",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "TR001",
    "name": "基础设施信托计划",
    "type": "信托",
    "risk_level": "R4",
    "min_amount": 1000000,
    "lock_period": "2年",
    "benchmark": "5.0%-7.0%",
    "underlying": [
      "基础设施项目"
    ],
    "suitable_for": [
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "—",
    "historical_return_3y": "—",
    "fee": "管理费1.5%/年",
    "redemption": "到期分配",
    "status": "在售",
    "tags": [
      "信托",
      "高门槛",
      "基础设施"
    ],
    "data_source": "chinatrc.com.cn",
    "category": "信托",
    "synced_at": "2026-05-22T22:18:22.464464"
  },
  {
    "product_id": "BW019",
    "name": "季季盈固收90天",
    "type": "固定收益类",
    "risk_level": "R2",
    "min_amount": 5000,
    "lock_period": "90天",
    "benchmark": "2.5%-3.2%",
    "underlying": [
      "高等级信用债",
      "银行存款",
      "政策性金融债"
    ],
    "suitable_for": [
      "保守型",
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "2.8%",
    "historical_return_3y": "2.9%",
    "fee": "管理费0.25%/年",
    "redemption": "到期T+1",
    "status": "在售",
    "tags": [
      "季度",
      "固收",
      "中等门槛"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:42:58.596748"
  },
  {
    "product_id": "BW020",
    "name": "双季盈固收180天",
    "type": "固定收益类",
    "risk_level": "R2",
    "min_amount": 5000,
    "lock_period": "180天",
    "benchmark": "2.8%-3.6%",
    "underlying": [
      "高等级信用债",
      "同业存单",
      "≤10%可转债"
    ],
    "suitable_for": [
      "保守型",
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "3.1%",
    "historical_return_3y": "3.2%",
    "fee": "管理费0.28%/年",
    "redemption": "到期T+1",
    "status": "在售",
    "tags": [
      "半年度",
      "固收",
      "稳健"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:42:58.596758"
  },
  {
    "product_id": "BW021",
    "name": "鑫享混合1年",
    "type": "混合型",
    "risk_level": "R3",
    "min_amount": 10000,
    "lock_period": "12个月",
    "benchmark": "4.0%-6.0%",
    "underlying": [
      "债券30%-50%",
      "股票40%-60%",
      "可转债5%-10%"
    ],
    "suitable_for": [
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "5.2%",
    "historical_return_3y": "5.0%",
    "fee": "管理费0.70%/年",
    "redemption": "封闭期满T+2",
    "status": "在售",
    "tags": [
      "混合",
      "中长期",
      "积极配置"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:42:58.596760"
  },
  {
    "product_id": "BW022",
    "name": "养老目标2035混合",
    "type": "养老目标基金",
    "risk_level": "R3",
    "min_amount": 100,
    "lock_period": "3年",
    "benchmark": "4.0%-6.0%",
    "underlying": [
      "权益基金40%-60%",
      "债券基金30%-50%",
      "货币基金10%"
    ],
    "suitable_for": [
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "4.8%",
    "historical_return_3y": "5.5%",
    "fee": "管理费0.50%/年",
    "redemption": "持有期满T+2",
    "status": "在售",
    "tags": [
      "养老",
      "目标日期",
      "长期"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:42:58.596762"
  },
  {
    "product_id": "BW023",
    "name": "养老目标2045混合",
    "type": "养老目标基金",
    "risk_level": "R4",
    "min_amount": 100,
    "lock_period": "3年",
    "benchmark": "5.0%-8.0%",
    "underlying": [
      "权益基金50%-70%",
      "债券基金20%-40%",
      "货币基金10%"
    ],
    "suitable_for": [
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "5.5%",
    "historical_return_3y": "6.2%",
    "fee": "管理费0.50%/年",
    "redemption": "T+2",
    "status": "在售",
    "tags": [
      "养老",
      "目标日期",
      "长期",
      "积极"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:42:58.596764"
  },
  {
    "product_id": "BW024",
    "name": "美元理财6个月",
    "type": "外币理财",
    "risk_level": "R3",
    "min_amount": 2000,
    "lock_period": "6个月",
    "benchmark": "4.0%-5.0%（美元）",
    "underlying": [
      "美元债券",
      "美元存款",
      "海外货币市场工具"
    ],
    "suitable_for": [
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "4.5%",
    "historical_return_3y": "4.2%",
    "fee": "管理费0.50%/年",
    "redemption": "T+2",
    "status": "在售",
    "tags": [
      "美元",
      "外币",
      "海外"
    ],
    "data_source": "chinawealth.com.cn",
    "category": "银行理财",
    "synced_at": "2026-05-22T22:42:58.596766"
  },
  {
    "product_id": "MF016",
    "name": "中证红利指数基金",
    "type": "指数基金",
    "risk_level": "R4",
    "min_amount": 100,
    "lock_period": "3个月",
    "benchmark": "跟踪中证红利指数",
    "underlying": [
      "高股息率A股"
    ],
    "suitable_for": [
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "5.0%",
    "historical_return_3y": "5.5%",
    "fee": "管理费0.50%/年",
    "redemption": "T+2",
    "status": "在售",
    "tags": [
      "红利",
      "高股息",
      "价值"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:42:58.596767"
  },
  {
    "product_id": "MF017",
    "name": "半导体芯片ETF联接",
    "type": "ETF联接",
    "risk_level": "R5",
    "min_amount": 100,
    "lock_period": "3个月",
    "benchmark": "跟踪国证半导体芯片指数",
    "underlying": [
      "半导体芯片龙头"
    ],
    "suitable_for": [
      "激进型"
    ],
    "historical_return_1y": "12.0%",
    "historical_return_3y": "8.5%",
    "fee": "管理费0.50%/年",
    "redemption": "T+2",
    "status": "在售",
    "tags": [
      "半导体",
      "芯片",
      "高弹性",
      "科技"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:42:58.596769"
  },
  {
    "product_id": "MF018",
    "name": "人工智能主题混合",
    "type": "主题混合",
    "risk_level": "R5",
    "min_amount": 1000,
    "lock_period": "12个月",
    "benchmark": "5.0%-12.0%",
    "underlying": [
      "AI算力龙头",
      "AI应用",
      "机器人"
    ],
    "suitable_for": [
      "激进型"
    ],
    "historical_return_1y": "15.0%",
    "historical_return_3y": "10.0%",
    "fee": "管理费1.20%/年",
    "redemption": "T+3",
    "status": "在售",
    "tags": [
      "AI",
      "人工智能",
      "前沿科技",
      "Z世代推荐"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:42:58.596771"
  },
  {
    "product_id": "MF019",
    "name": "恒生科技ETF联接",
    "type": "QDII",
    "risk_level": "R5",
    "min_amount": 100,
    "lock_period": "3个月",
    "benchmark": "跟踪恒生科技指数",
    "underlying": [
      "港股科技龙头"
    ],
    "suitable_for": [
      "激进型"
    ],
    "historical_return_1y": "10.0%",
    "historical_return_3y": "7.5%",
    "fee": "管理费0.60%/年",
    "redemption": "T+4",
    "status": "在售",
    "tags": [
      "港股",
      "科技",
      "QDII",
      "恒生"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:42:58.596773"
  },
  {
    "product_id": "MF020",
    "name": "黄金ETF联接",
    "type": "商品ETF",
    "risk_level": "R4",
    "min_amount": 100,
    "lock_period": "无",
    "benchmark": "跟踪上海金交所Au99.99",
    "underlying": [
      "实物黄金合约"
    ],
    "suitable_for": [
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "8.0%",
    "historical_return_3y": "7.0%",
    "fee": "管理费0.50%/年",
    "redemption": "T+1",
    "status": "在售",
    "tags": [
      "黄金",
      "商品",
      "避险",
      "通胀对冲"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:42:58.596775"
  },
  {
    "product_id": "MF021",
    "name": "短融ETF联接",
    "type": "ETF联接",
    "risk_level": "R2",
    "min_amount": 100,
    "lock_period": "无",
    "benchmark": "跟踪中证短融指数",
    "underlying": [
      "AAA级短期融资券"
    ],
    "suitable_for": [
      "保守型",
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "2.2%",
    "historical_return_3y": "2.3%",
    "fee": "管理费0.15%/年",
    "redemption": "T+1",
    "status": "在售",
    "tags": [
      "短融",
      "低风险",
      "现金管理"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:42:58.596776"
  },
  {
    "product_id": "MF022",
    "name": "平衡混合型FOF",
    "type": "FOF",
    "risk_level": "R3",
    "min_amount": 1000,
    "lock_period": "6个月",
    "benchmark": "4.0%-6.0%",
    "underlying": [
      "偏股基金30%-50%",
      "债券基金40%-60%",
      "货币基金10%"
    ],
    "suitable_for": [
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "4.5%",
    "historical_return_3y": "4.8%",
    "fee": "管理费0.60%/年",
    "redemption": "T+3",
    "status": "在售",
    "tags": [
      "FOF",
      "基金中的基金",
      "分散",
      "稳健"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:42:58.596778"
  },
  {
    "product_id": "MF023",
    "name": "量化对冲混合",
    "type": "量化对冲",
    "risk_level": "R4",
    "min_amount": 10000,
    "lock_period": "6个月",
    "benchmark": "4.0%-7.0%",
    "underlying": [
      "股票多头+股指期货对冲"
    ],
    "suitable_for": [
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "5.5%",
    "historical_return_3y": "5.0%",
    "fee": "管理费1.50%/年",
    "redemption": "T+3",
    "status": "在售",
    "tags": [
      "量化",
      "对冲",
      "绝对收益",
      "低相关"
    ],
    "data_source": "amac.org.cn",
    "category": "公募基金",
    "synced_at": "2026-05-22T22:42:58.596780"
  },
  {
    "product_id": "INS004",
    "name": "分红型年金险",
    "type": "分红保险",
    "risk_level": "R2",
    "min_amount": 10000,
    "lock_period": "5年以上",
    "benchmark": "2.0%保底+分红（历史约3.5%）",
    "underlying": [
      "固定收益+权益分红"
    ],
    "suitable_for": [
      "保守型",
      "稳健型"
    ],
    "historical_return_1y": "—",
    "historical_return_3y": "—",
    "fee": "—",
    "redemption": "按保单约定",
    "status": "在售",
    "tags": [
      "分红",
      "年金",
      "养老"
    ],
    "data_source": "nfra.gov.cn",
    "category": "保险理财",
    "synced_at": "2026-05-22T22:42:58.596782"
  },
  {
    "product_id": "BD005",
    "name": "可转债打新基金",
    "type": "可转债基金",
    "risk_level": "R3",
    "min_amount": 1000,
    "lock_period": "3个月",
    "benchmark": "3.0%-6.0%",
    "underlying": [
      "新发可转债",
      "已上市可转债"
    ],
    "suitable_for": [
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "5.0%",
    "historical_return_3y": "4.5%",
    "fee": "管理费0.60%/年",
    "redemption": "T+2",
    "status": "在售",
    "tags": [
      "可转债",
      "打新",
      "弹性"
    ],
    "data_source": "chinabond.com.cn",
    "category": "债券",
    "synced_at": "2026-05-22T22:42:58.596783"
  },
  {
    "product_id": "BD006",
    "name": "高等级信用债基金",
    "type": "信用债基金",
    "risk_level": "R2",
    "min_amount": 100,
    "lock_period": "30天",
    "benchmark": "3.0%-4.0%",
    "underlying": [
      "AA+级以上信用债",
      "中期票据"
    ],
    "suitable_for": [
      "保守型",
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "3.5%",
    "historical_return_3y": "3.6%",
    "fee": "管理费0.40%/年",
    "redemption": "T+2",
    "status": "在售",
    "tags": [
      "信用债",
      "高等级",
      "稳健收益"
    ],
    "data_source": "chinabond.com.cn",
    "category": "债券",
    "synced_at": "2026-05-22T22:42:58.596785"
  },
  {
    "product_id": "BD007",
    "name": "政策性金融债指数",
    "type": "利率债基金",
    "risk_level": "R2",
    "min_amount": 100,
    "lock_period": "30天",
    "benchmark": "2.5%-3.0%",
    "underlying": [
      "国开债",
      "农发债",
      "进出口行债"
    ],
    "suitable_for": [
      "保守型",
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "2.8%",
    "historical_return_3y": "2.9%",
    "fee": "管理费0.30%/年",
    "redemption": "T+2",
    "status": "在售",
    "tags": [
      "利率债",
      "政策性银行",
      "低风险"
    ],
    "data_source": "chinabond.com.cn",
    "category": "债券",
    "synced_at": "2026-05-22T22:42:58.596787"
  },
  {
    "product_id": "TR002",
    "name": "房地产信托计划",
    "type": "信托",
    "risk_level": "R5",
    "min_amount": 1000000,
    "lock_period": "2年",
    "benchmark": "6.0%-9.0%",
    "underlying": [
      "商业地产项目"
    ],
    "suitable_for": [
      "激进型"
    ],
    "historical_return_1y": "—",
    "historical_return_3y": "—",
    "fee": "管理费1.8%/年",
    "redemption": "到期分配",
    "status": "在售",
    "tags": [
      "信托",
      "房地产",
      "高门槛",
      "高风险"
    ],
    "data_source": "chinatrc.com.cn",
    "category": "信托",
    "synced_at": "2026-05-22T22:42:58.596788"
  }
];
const PRODUCT_META = {"version":"1.0.2","updated":"2026-05-22T22:42:58.598595","count":60,"next_sync":"每日08:00","note":"涵盖银行理财/公募基金/保险/债券/信托5大类"};
