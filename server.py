#!/usr/bin/env python3
"""轻舟 Qingzhou — 本地开发服务器 + GLM-5 API 代理（带 QPM 限流重试）"""
import http.server, json, urllib.request, urllib.error, sys, os, time

PORT = 8765
API_URL = 'https://maas-api.ai-yuanjing.com/openapi/compatible-mode/v1/chat/completions'
API_KEY = 'sk-9b0e1c7fea0d40db830541bd4ff3b11c'
RETRY_DELAY = 15  # QPM限流后等待秒数
MAX_RETRIES = 3

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/chat':
            try:
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length)
                data = json.loads(body)

                for attempt in range(MAX_RETRIES):
                    try:
                        req = urllib.request.Request(API_URL,
                            data=json.dumps(data).encode('utf-8'),
                            headers={
                                'Content-Type': 'application/json',
                                'Authorization': f'Bearer {API_KEY}'
                            })
                        with urllib.request.urlopen(req, timeout=30) as resp:
                            result = json.loads(resp.read().decode('utf-8'))

                        # QPM限流
                        if result.get('code') == 5001:
                            if attempt < MAX_RETRIES - 1:
                                print(f'  QPM限流，{RETRY_DELAY}s后重试({attempt+1}/{MAX_RETRIES})...')
                                time.sleep(RETRY_DELAY)
                                continue
                            else:
                                self.send_response(429)
                                self.send_header('Access-Control-Allow-Origin', '*')
                                self.end_headers()
                                self.wfile.write(json.dumps({'error': 'QPM限流，请稍后重试'}).encode())
                                return

                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json; charset=utf-8')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(json.dumps(result, ensure_ascii=False).encode('utf-8'))
                        return
                    except urllib.error.HTTPError as e:
                        err_body = e.read().decode('utf-8', errors='replace')
                        if attempt < MAX_RETRIES - 1:
                            print(f'  HTTP {e.code}, retrying ({attempt+1}/{MAX_RETRIES})...')
                            time.sleep(RETRY_DELAY)
                            continue
                        self.send_response(500)
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(json.dumps({'error': f'HTTP {e.code}: {err_body[:200]}'}).encode())
                        return
                    except Exception as e:
                        if attempt < MAX_RETRIES - 1:
                            print(f'  Error: {e}, retrying ({attempt+1}/{MAX_RETRIES})...')
                            time.sleep(RETRY_DELAY)
                            continue
                        raise

            except Exception as e:
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}, ensure_ascii=False).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print(f'轻舟服务器 → http://localhost:{PORT}')
    print(f'API 代理 → {API_URL}')
    http.server.HTTPServer(('0.0.0.0', PORT), ProxyHandler).serve_forever()
