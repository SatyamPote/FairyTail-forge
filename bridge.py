import http.server
import socketserver
import urllib.request
import json
import webbrowser
import os

PORT = 8000
OLLAMA_URL = "http://localhost:11434/api/generate"

class BridgeHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Fix CORS issues
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/ollama':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                # Forward request to local Ollama
                req = urllib.request.Request(
                    OLLAMA_URL, 
                    data=post_data, 
                    headers={'Content-Type': 'application/json'}
                )
                with urllib.request.urlopen(req) as response:
                    res_data = response.read()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(res_data)
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            super().do_POST()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print(f"--- FAIRYTAIL FORGE BRIDGE ---")
    print(f"Server starting at http://localhost:{PORT}")
    print(f"This window must stay open while using the Studio.")
    
    # Open the browser automatically
    webbrowser.open(f"http://localhost:{PORT}/studio.html")
    
    with socketserver.TCPServer(("", PORT), BridgeHandler) as httpd:
        httpd.serve_forever()
