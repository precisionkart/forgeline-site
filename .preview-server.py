#!/usr/bin/env python3
"""Local preview server that disables caching so the browser always shows the latest file."""
import http.server
import socketserver

PORT = 8000


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


with socketserver.TCPServer(("127.0.0.1", PORT), NoCacheHandler) as httpd:
    print(f"Preview (no-cache) running at http://localhost:{PORT}/")
    httpd.serve_forever()
