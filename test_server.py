#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8081

class TestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/test-image-data':
            # 读取图片文件
            image_path = '/Users/lzc/Pictures/测试1-辣条.jpg'
            try:
                with open(image_path, 'rb') as f:
                    image_data = f.read()
                
                self.send_response(200)
                self.send_header('Content-Type', 'image/jpeg')
                self.send_header('Content-Length', len(image_data))
                self.end_headers()
                self.wfile.write(image_data)
                print(f"图片已发送: {len(image_data)} bytes")
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(f"Error: {str(e)}".encode())
                print(f"错误: {e}")
        else:
            super().do_GET()

with socketserver.TCPServer(("", PORT), TestHandler) as httpd:
    print(f"测试服务器运行在 http://localhost:{PORT}/")
    print(f"访问 http://localhost:{PORT}/test-image.html 进行测试")
    httpd.serve_forever()