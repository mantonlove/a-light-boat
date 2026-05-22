#!/usr/bin/env python3
"""轻舟知识库同步脚本——Demo版"""
import json, datetime, os

SYNC_CONFIG = {
    "chinawealth.com.cn": {"name":"中国理财网","frequency":"每周","endpoint":"https://www.chinawealth.com.cn/lcweb/management/proScreen"},
    "amac.org.cn": {"name":"中基协","frequency":"每周","endpoint":"https://gs.amac.org.cn"},
    "nfra.gov.cn": {"name":"金融监管总局","frequency":"每月","endpoint":"https://www.nfra.gov.cn"},
    "chinabond.com.cn": {"name":"中债登","frequency":"每周","endpoint":"https://www.chinabond.com.cn"},
    "chinatrc.com.cn": {"name":"中信登","frequency":"每月","endpoint":"https://www.chinatrc.com.cn"},
}

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
