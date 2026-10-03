#!/usr/bin/env python3
"""
KFC Web & SQLite API Server
Phục vụ website và lưu đơn hàng trực tiếp vào file `orders.db`
"""

import http.server
import json
import os
import socketserver
import urllib.parse
from init_db import save_order, get_all_orders, init_database

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class KFCRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def _set_cors_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_cors_headers(200)

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        if parsed_path.path == "/api/orders":
            orders = get_all_orders()
            self._set_cors_headers(200)
            self.wfile.write(json.dumps({"success": True, "orders": orders}, ensure_ascii=False).encode("utf-8"))
            return
        elif parsed_path.path == "/api/health":
            self._set_cors_headers(200)
            self.wfile.write(json.dumps({"status": "ok", "db": "orders.db"}, ensure_ascii=False).encode("utf-8"))
            return

        return super().do_GET()

    def do_POST(self):
        parsed_path = urllib.parse.urlparse(self.path)
        if parsed_path.path == "/api/orders":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)

            try:
                order_payload = json.loads(post_data.decode("utf-8"))
                save_order(order_payload)
                
                response_data = {
                    "success": True,
                    "message": "Đơn hàng đã được lưu thành công vào SQLite orders.db!",
                    "orderId": order_payload.get("orderId"),
                }
                self._set_cors_headers(200)
                self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode("utf-8"))
            except Exception as e:
                self._set_cors_headers(400)
                self.wfile.write(json.dumps({"success": False, "error": str(e)}, ensure_ascii=False).encode("utf-8"))
            return

        self._set_cors_headers(404)
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))


def run_server():
    init_database()
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), KFCRequestHandler) as httpd:
        print(f"🚀 KFC Server đang chạy tại http://localhost:{PORT}")
        print(f"📁 Cơ sở dữ liệu SQLite: orders.db (Bảng 'orders' & 'order_items')")
        print("Nhấn Ctrl+C để dừng server.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer đã dừng.")


if __name__ == "__main__":
    run_server()
