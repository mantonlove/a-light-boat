const DEMO_PRODUCTS = [
  {
    "product_id": "C001",
    "registration_code": "Z0012024001",
    "name": "活期盈",
    "issuer": "轻舟银行理财子公司",
    "type": "货币基金",
    "risk_level": "R1",
    "min_amount": 1,
    "lock_period": "活期（随时申赎）",
    "benchmark": "1.2%-1.8%（七日年化，非承诺收益）",
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
    "fee": "管理费 0.15%/年，托管费 0.05%/年",
    "redemption": "T+1 到账",
    "status": "在售",
    "tags": [
      "灵活存取",
      "零钱管理",
      "低风险",
      "现金管理"
    ],
    "data_source": "chinawealth.com.cn"
  },
  {
    "product_id": "C002",
    "registration_code": "Z0022024001",
    "name": "大额存单 3年期",
    "issuer": "轻舟银行",
    "type": "存款",
    "risk_level": "R1",
    "min_amount": 200000,
    "lock_period": "3年（可提前支取，按活期计息）",
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
    "redemption": "到期自动还本付息",
    "status": "在售",
    "tags": [
      "存款保险",
      "保本保息",
      "中长期"
    ],
    "data_source": "chinawealth.com.cn"
  },
  {
    "product_id": "C003",
    "registration_code": "Z0032024001",
    "name": "安鑫短债 30天",
    "issuer": "轻舟银行理财子公司",
    "type": "短债基金",
    "risk_level": "R2",
    "min_amount": 1000,
    "lock_period": "30天滚动持有",
    "benchmark": "2.0%-2.5%（业绩比较基准，非承诺收益）",
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
    "fee": "管理费 0.20%/年，托管费 0.05%/年",
    "redemption": "到期自动赎回，T+2 到账",
    "status": "在售",
    "tags": [
      "短期",
      "低波动",
      "流动性好",
      "稳健"
    ],
    "data_source": "chinawealth.com.cn"
  },
  {
    "product_id": "C004",
    "registration_code": "Z0042024001",
    "name": "稳享固收增强 6个月持有期",
    "issuer": "轻舟银行理财子公司",
    "type": "固定收益类",
    "risk_level": "R2",
    "min_amount": 10000,
    "lock_period": "6个月持有期",
    "benchmark": "2.8%-3.5%（业绩比较基准，非承诺收益）",
    "underlying": [
      "高等级信用债",
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
    "historical_return_1y": "3.2%",
    "historical_return_3y": "3.0%",
    "fee": "管理费 0.30%/年，托管费 0.05%/年",
    "redemption": "持有期满后 T+1 到账",
    "status": "在售",
    "tags": [
      "稳健",
      "短期限",
      "固收"
    ],
    "data_source": "chinawealth.com.cn"
  },
  {
    "product_id": "C005",
    "registration_code": "Z0052024001",
    "name": "稳盈固收+ 12个月",
    "issuer": "轻舟银行理财子公司",
    "type": "固收+",
    "risk_level": "R3",
    "min_amount": 10000,
    "lock_period": "12个月封闭期",
    "benchmark": "3.5%-4.5%（业绩比较基准，非承诺收益）",
    "underlying": [
      "债券（≥80%）",
      "股票（≤20%）",
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
    "fee": "管理费 0.40%/年，托管费 0.08%/年",
    "redemption": "封闭期满后 T+2 到账",
    "status": "在售",
    "tags": [
      "固收+",
      "中期限",
      "稳健增强"
    ],
    "data_source": "chinawealth.com.cn"
  },
  {
    "product_id": "C006",
    "registration_code": "Z0062024001",
    "name": "均衡配置混合",
    "issuer": "轻舟银行理财子公司",
    "type": "混合型",
    "risk_level": "R3",
    "min_amount": 1000,
    "lock_period": "6个月持有期",
    "benchmark": "3.0%-5.0%（业绩比较基准，非承诺收益）",
    "underlying": [
      "债券（40%-60%）",
      "股票（30%-50%）",
      "货币工具（10%-20%）"
    ],
    "suitable_for": [
      "稳健型",
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "4.5%",
    "historical_return_3y": "4.2%",
    "fee": "管理费 0.60%/年，托管费 0.10%/年",
    "redemption": "持有期满后 T+2 到账",
    "status": "在售",
    "tags": [
      "股债均衡",
      "灵活配置",
      "中等风险"
    ],
    "data_source": "chinawealth.com.cn"
  },
  {
    "product_id": "C007",
    "registration_code": "Z0072024001",
    "name": "绿色 ESG 主题混合",
    "issuer": "轻舟银行理财子公司",
    "type": "主题混合",
    "risk_level": "R3",
    "min_amount": 1000,
    "lock_period": "6个月持有期",
    "benchmark": "3.5%-6.0%（业绩比较基准，非承诺收益）",
    "underlying": [
      "ESG评级A级以上公司股票（50%-70%）",
      "绿色债券（20%-30%）",
      "货币工具（10%）"
    ],
    "suitable_for": [
      "平衡型",
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "5.2%",
    "historical_return_3y": "—",
    "fee": "管理费 0.80%/年，托管费 0.10%/年",
    "redemption": "持有期满后 T+2 到账",
    "status": "在售",
    "tags": [
      "ESG",
      "碳中和",
      "绿色金融",
      "Z世代推荐"
    ],
    "data_source": "chinawealth.com.cn"
  },
  {
    "product_id": "C008",
    "registration_code": "Z0082024001",
    "name": "沪深300指数增强",
    "issuer": "轻舟银行理财子公司",
    "type": "指数增强",
    "risk_level": "R4",
    "min_amount": 100,
    "lock_period": "3个月持有期",
    "benchmark": "跟踪沪深300指数 + 年化增强1%-2%（非承诺收益）",
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
    "fee": "管理费 0.50%/年，托管费 0.10%/年",
    "redemption": "持有期满后 T+2 到账",
    "status": "在售",
    "tags": [
      "大盘蓝筹",
      "指数投资",
      "低费率",
      "定投推荐"
    ],
    "data_source": "chinawealth.com.cn"
  },
  {
    "product_id": "C009",
    "registration_code": "Z0092024001",
    "name": "科技主题混合",
    "issuer": "轻舟银行理财子公司",
    "type": "主题混合",
    "risk_level": "R4",
    "min_amount": 1000,
    "lock_period": "12个月封闭期",
    "benchmark": "4.0%-8.0%（业绩比较基准，非承诺收益）",
    "underlying": [
      "A股科技板块龙头（60%-80%）",
      "港股科技（10%-20%）",
      "债券（10%-20%）"
    ],
    "suitable_for": [
      "进取型",
      "激进型"
    ],
    "historical_return_1y": "7.8%",
    "historical_return_3y": "5.5%",
    "fee": "管理费 1.00%/年，托管费 0.15%/年",
    "redemption": "封闭期满后 T+3 到账",
    "status": "在售",
    "tags": [
      "科技",
      "成长",
      "高弹性",
      "AI主题",
      "Z世代推荐"
    ],
    "data_source": "chinawealth.com.cn"
  },
  {
    "product_id": "C010",
    "registration_code": "Z0102024001",
    "name": "科创50 ETF联接",
    "issuer": "轻舟银行理财子公司",
    "type": "ETF联接",
    "risk_level": "R5",
    "min_amount": 100,
    "lock_period": "3个月持有期",
    "benchmark": "跟踪科创50指数（非承诺收益）",
    "underlying": [
      "科创板50成分股"
    ],
    "suitable_for": [
      "激进型"
    ],
    "historical_return_1y": "8.5%",
    "historical_return_3y": "—",
    "fee": "管理费 0.50%/年，托管费 0.10%/年",
    "redemption": "持有期满后 T+3 到账",
    "status": "在售",
    "tags": [
      "科创板",
      "高成长",
      "高波动",
      "科技创新"
    ],
    "data_source": "chinawealth.com.cn"
  }
];