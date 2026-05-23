#!/usr/bin/env python3
"""轻舟 Qingzhou — 本地开发服务器 + GLM-5 API 代理 + 元景语音交互3.0 TTS"""
import http.server, json, urllib.request, urllib.error, sys, os, time, subprocess, tempfile, base64, struct
from websocket import create_connection

PORT = 8765
API_URL = 'https://maas-api.ai-yuanjing.com/openapi/compatible-mode/v1/chat/completions'
API_KEY = 'sk-9b0e1c7fea0d40db830541bd4ff3b11c'
TTS_WS_URL = 'wss://maas-api.ai-yuanjing.com/openapi/v1/voice/voice_interaction'
RETRY_DELAY = 15
MAX_RETRIES = 3
TTS_INTERVAL = 3  # TTS API 调用最小间隔（秒），防 QPS 限流
_last_tts_call = 0

# 元景语音交互3.0 音色映射（高自然度）
VOICE_SPEAKER = {
    'female_sweet':  ('female_sweet',  0.95, 1.0),   # 甜美女生
    'male_warm':     ('male_warm',     0.90, 1.0),   # 温暖男生
    'male_podcast':  ('male_podcast',  0.92, 1.0),   # 播客男生
}

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/chat':
            self._handle_chat()
        elif self.path == '/api/tts':
            self._handle_tts()
        else:
            self.send_response(404)
            self.end_headers()

    def _handle_chat(self):
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

    def _handle_tts(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length))
            text = body.get('text', '').strip()
            voice_id = body.get('voice', 'gentle-female')
            rate = float(body.get('rate', 0.9))

            if not text:
                self.send_response(400)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'text is required'}).encode())
                return

            text = text.replace('\n', ' ')[:500]
            speaker_id, speed, energy = VOICE_SPEAKER.get(voice_id, ('female_sweet', 0.95, 1.0))
            final_rate = rate * speed / 0.95

            # QPS 限流控制
            global _last_tts_call
            elapsed = time.time() - _last_tts_call
            if elapsed < TTS_INTERVAL:
                time.sleep(TTS_INTERVAL - elapsed)
            _last_tts_call = time.time()

            # Step 1: 用 say 生成 prompt 音频（"请朗读：{text}"）
            prompt = f'请朗读以下文字，只朗读不回复：{text}'
            with tempfile.NamedTemporaryFile(suffix='.aiff', delete=False) as tmp:
                aiff_path = tmp.name
            in_wav = aiff_path + '.wav'

            try:
                subprocess.run(
                    ['say', '-v', 'Tingting', '-r', '200', prompt, '-o', aiff_path],
                    capture_output=True, timeout=10
                )
                subprocess.run(
                    ['afconvert', '-f', 'WAVE', '-d', 'LEI16@16000', aiff_path, in_wav],
                    capture_output=True, timeout=5
                )

                # Step 2: 通过 WebSocket 发送给元景语音 API
                ws = None
                for tts_attempt in range(3):
                    try:
                        ws = create_connection(TTS_WS_URL,
                            header={'Authorization': f'Bearer {API_KEY}'}, timeout=15)
                        break
                    except Exception as e:
                        if '429' in str(e) or '5001' in str(e):
                            if tts_attempt < 2:
                                time.sleep(5)
                                continue
                        raise
                if ws is None:
                    raise RuntimeError('TTS API connection failed after retries')

                ws.send(json.dumps({
                    'session_id': f'tts-{int(time.time()*1000)}',
                    'sample_rate': 16000, 'audio_format': 'pcm',
                    'kbps': 128, 'speed': final_rate, 'energy': energy,
                    'speaker_id': speaker_id, 'output_sample_rate': 24000
                }))

                with open(in_wav, 'rb') as f:
                    f.read(44)  # skip WAV header
                    while True:
                        chunk = f.read(4096)
                        if not chunk: break
                        ws.send_binary(chunk)
                        time.sleep(0.03)

                for _ in range(30):
                    ws.send_binary(bytes(4096))
                    time.sleep(0.03)
                ws.send(json.dumps({'eof': 1}))

                # Step 3: 接收音频输出
                audio_chunks = []
                deadline = time.time() + 25
                while time.time() < deadline:
                    try:
                        ws.settimeout(3)
                        msg = ws.recv()
                        if msg:
                            data = json.loads(msg)
                            b64 = data.get('audio', '')
                            if b64:
                                audio_chunks.append(base64.b64decode(b64))
                            if data.get('status') in (2, 3):
                                break
                    except Exception:
                        break
                ws.close()

                if not audio_chunks:
                    raise RuntimeError('TTS API returned no audio')

                # Step 4: PCM → WAV
                pcm_data = b''.join(audio_chunks)
                wav_buf = bytearray()
                wav_buf += b'RIFF'
                wav_buf += struct.pack('<I', 36 + len(pcm_data))
                wav_buf += b'WAVEfmt '
                wav_buf += struct.pack('<IHHIIHH', 16, 1, 1, 24000, 24000 * 2, 2, 16)
                wav_buf += b'data'
                wav_buf += struct.pack('<I', len(pcm_data))
                wav_buf += pcm_data

                self.send_response(200)
                self.send_header('Content-Type', 'audio/wav')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Length', str(len(wav_buf)))
                self.end_headers()
                self.wfile.write(bytes(wav_buf))

            finally:
                for p in [aiff_path, in_wav]:
                    if os.path.exists(p):
                        os.unlink(p)

        except Exception as e:
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}, ensure_ascii=False).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print(f'轻舟服务器 → http://localhost:{PORT}')
    print(f'Chat API 代理 → {API_URL}')
    print(f'TTS 语音合成 → macOS say 命令')
    http.server.HTTPServer(('0.0.0.0', PORT), ProxyHandler).serve_forever()
