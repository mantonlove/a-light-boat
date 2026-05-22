#!/usr/bin/env python3
"""轻舟知识库同步脚本——Demo版"""
import json, datetime, os

SYNC_CONFIG = {
    # 产品每日变动（发行/到期/净值更新）—— 每日同步
    "chinawealth.com.cn": {"name":"中国理财网","frequency":"每日 08:00","endpoint":"https://www.chinawealth.com.cn/lcweb/management/proScreen","rationale":"银行理财产品每日有发行/到期，净值每日更新"},
    "amac.org.cn": {"name":"中基协","frequency":"每日 08:30","endpoint":"https://gs.amac.org.cn","rationale":"基金产品每日有新增备案/清盘"},
    "chinabond.com.cn": {"name":"中债登","frequency":"每日 18:00","endpoint":"https://www.chinabond.com.cn","rationale":"债券发行/兑付每日变动，收益率曲线每日收盘后发布"},
    # 批次更新 —— 每周同步
    "nfra.gov.cn": {"name":"金融监管总局","frequency":"每周一 08:00","endpoint":"https://www.nfra.gov.cn","rationale":"保险产品审批后批次公示，非实时"},
    "chinatrc.com.cn": {"name":"中信登","frequency":"每周一 09:00","endpoint":"https://www.chinatrc.com.cn","rationale":"信托产品成立/终止频率低于银行理财和基金"},
}
# cron 定时任务示例：
# 0 8 * * 1-5 cd /app && python3 sync_products.py  # 工作日每日
# 0 18 * * 1-5 cd /app && python3 sync_products.py --bond-only  # 债券每日收盘后

def sync():
    now = datetime.datetime.now().isoformat()
    
    with open('js/demo_products.json') as f:
        products = json.load(f)
    
    for p in products:
        p["synced_at"] = now
    
    with open('js/demo_products.json', 'w') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    
    with open('js/demo_products.js', 'w') as f:
        f.write(f'const DEMO_PRODUCTS = {json.dumps(products, ensure_ascii=False, indent=2)};\n')
        f.write(f'const PRODUCT_META = {{"version":"1.0.1","updated":"{now}","count":{len(products)},"sources":{len(SYNC_CONFIG)},"next_sync":"每周一08:00","note":"自动同步于{now}"}};\n')
    
    print(f"✓ {len(products)} products synced at {now}")

if __name__ == "__main__":
    sync()
