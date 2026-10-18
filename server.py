from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os, socket, threading, webbrowser

ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)
PORT = 8000

class Handler(SimpleHTTPRequestHandler):
    extensions_map = SimpleHTTPRequestHandler.extensions_map.copy()
    extensions_map.update({
        ".gltf": "application/json",
        ".bin": "application/octet-stream",
        ".glb": "model/gltf-binary",
        ".webp": "image/webp",
        ".js": "application/javascript",
        ".css": "text/css",
        ".html": "text/html",
    })
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

try:
    host = socket.gethostbyname(socket.gethostname())
except Exception:
    host = "127.0.0.1"

server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
print("=" * 60)
print(" Babylon MMORPG - CDN + Python Server")
print("=" * 60)
print(f" PC:        http://localhost:{PORT}")
print(f" Dien thoai: http://{host}:{PORT}  (cung Wi-Fi)")
print(" Nhan Ctrl+C de tat server.")
print("=" * 60)
threading.Timer(0.8, lambda: webbrowser.open(f"http://localhost:{PORT}")).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\nDa tat server.")
finally:
    server.server_close()
