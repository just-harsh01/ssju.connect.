#!/usr/bin/env python3
"""
SSJU Connect - Python Server Engine with Database & PYQ Upload support.
Serves static files, uploads, and handles REST API for database & PDF papers.
"""

import http.server
import socketserver
import webbrowser
import socket
import os
import sys
import json
import urllib.parse
from datetime import datetime

PORT = int(os.environ.get("PORT", 3000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_FILE = os.path.join(DATA_DIR, "db.json")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_phone_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def load_db():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"posts": [], "papers": [], "user": {}, "streams": []}

def save_db(data):
    try:
        tmp = DB_FILE + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        os.replace(tmp, DB_FILE)
    except Exception as e:
        print(f"Error saving db: {e}")

class SSJUHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, x-filename, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def send_json(self, status_code, data):
        payload = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/status":
            db = load_db()
            return self.send_json(200, {
                "status": "online",
                "engine": "Python",
                "postsCount": len(db.get("posts", [])),
                "papersCount": len(db.get("papers", [])),
                "user": db.get("user", {}).get("name", "Student")
            })

        if path == "/api/user":
            db = load_db()
            return self.send_json(200, db.get("user", {}))

        if path == "/api/posts":
            db = load_db()
            return self.send_json(200, db.get("posts", []))

        if path == "/api/papers":
            db = load_db()
            return self.send_json(200, db.get("papers", []))

        # Uploads file serving with inline PDF headers
        if path.startswith("/uploads/"):
            filename = os.path.basename(path)
            filepath = os.path.join(UPLOAD_DIR, filename)
            if os.path.exists(filepath):
                self.send_response(200)
                self.send_header("Content-Type", "application/pdf")
                self.send_header("Content-Length", str(os.path.getsize(filepath)))
                self.send_header("Content-Disposition", f'inline; filename="{filename}"')
                self.end_headers()
                with open(filepath, "rb") as f:
                    self.wfile.write(f.read())
                return
            else:
                self.send_error(404, "File not found")
                return

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        content_len = int(self.headers.get("Content-Length", 0))

        if path == "/api/upload":
            raw_filename = self.headers.get("x-filename", f"paper_{int(datetime.now().timestamp())}.pdf")
            raw_filename = urllib.parse.unquote(raw_filename)
            safe_name = "".join([c if c.isalnum() or c in "._-" else "_" for c in raw_filename])
            final_filename = f"{int(datetime.now().timestamp())}_{safe_name}"
            target_path = os.path.join(UPLOAD_DIR, final_filename)

            with open(target_path, "wb") as f:
                f.write(self.rfile.read(content_len))

            size_mb = round(content_len / (1024 * 1024), 1)
            size_str = f"{size_mb} MB" if content_len >= 1024*1024 else f"{max(1, round(content_len/1024))} KB"
            return self.send_json(200, {
                "success": True,
                "fileUrl": f"/uploads/{final_filename}",
                "fileName": raw_filename,
                "fileSize": size_str
            })

        body = self.rfile.read(content_len).decode("utf-8") if content_len > 0 else "{}"
        try:
            req_data = json.loads(body)
        except Exception:
            req_data = {}

        if path == "/api/user":
            db = load_db()
            user = db.get("user", {})
            user.update(req_data)
            db["user"] = user
            save_db(db)
            return self.send_json(200, {"success": True, "user": user})

        if path == "/api/posts":
            db = load_db()
            post_obj = {
                "id": f"post_{int(datetime.now().timestamp() * 1000)}",
                "createdAt": datetime.utcnow().isoformat() + "Z",
                "upvotes": 0,
                "downvotes": 0,
                "comments": [],
                **req_data
            }
            db.setdefault("posts", []).insert(0, post_obj)
            save_db(db)
            return self.send_json(201, post_obj)

        if path == "/api/papers":
            db = load_db()
            paper_obj = {
                "id": f"paper_{int(datetime.now().timestamp() * 1000)}",
                "uploadedAt": datetime.now().strftime("%Y-%m-%d"),
                "downloadsCount": 0,
                "rating": 5.0,
                "pages": 3,
                **req_data
            }
            db.setdefault("papers", []).insert(0, paper_obj)
            user = db.get("user", {})
            user["reputation"] = user.get("reputation", 0) + 25
            if "PYQ Donor" not in user.get("badges", []):
                user.setdefault("badges", []).append("PYQ Donor")
            save_db(db)
            return self.send_json(201, paper_obj)

        self.send_error(404, "Endpoint not found")

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        content_len = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_len).decode("utf-8") if content_len > 0 else "{}"
        try:
            req_data = json.loads(body)
        except Exception:
            req_data = {}

        if path == "/api/user":
            db = load_db()
            user = db.get("user", {})
            user.update(req_data)
            db["user"] = user
            save_db(db)
            return self.send_json(200, {"success": True, "user": user})

        self.send_error(404, "Endpoint not found")

def run():
    os.chdir(BASE_DIR)
    phone_ip = get_phone_ip()
    phone_url = f"http://{phone_ip}:{PORT}"
    local_url = f"http://localhost:{PORT}"

    with socketserver.TCPServer(("", PORT), SSJUHandler) as httpd:
        print("=" * 60)
        print("  🎉 SSJU CONNECT FULL-STACK PYTHON SERVER IS LIVE!")
        print("=" * 60)
        print(f"  💻 On this PC:      {local_url}")
        print(f"  📱 ON YOUR PHONE:    {phone_url}")
        print(f"  📁 PDF Uploads Path: {UPLOAD_DIR}")
        print(f"  💾 Database:         {DB_FILE}")
        print("=" * 60)
        print("  Press Ctrl+C to stop.")
        try:
            webbrowser.open(local_url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == '__main__':
    run()
