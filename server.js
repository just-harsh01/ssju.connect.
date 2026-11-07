/**
 * SSJU Connect - Full-Stack Production & Local Server
 * Soban Singh Jeena University Campus Social & PYQ Vault
 * 
 * Features:
 * - Persistent JSON File Database (data/db.json)
 * - Direct PDF File Upload Engine (uploads/) supporting 50MB+ exam papers
 * - REST API for Posts, Question Papers, User Profiles, Upvotes & Comments
 * - Inline PDF Viewer & High-speed file streaming
 * - Zero external npm dependencies required (100% native Node.js)
 * - Cloud-ready: Runs on Render, Railway, Vercel, VPS, or localhost
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = '0.0.0.0';

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// MIME TYPES
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

// Database Memory State
let db = {
  user: {
    id: "user_ssju_01",
    name: "Arjun Singh Negi",
    username: "arjun_ssju",
    email: "arjun.negi@ssju.ac.in",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80",
    bio: "BCA 3rd Year student @ SSJU Almora Campus. Interested in Web Development & Open Source.",
    stream: "bca_mca",
    streamName: "Computer Applications & IT",
    semester: 5,
    rollNo: "SSJU/2023/BCA/042",
    reputation: 340,
    badges: ["Campus Contributor", "Top Doubt Solver", "PYQ Uploader"],
    bookmarks: [],
    upvotedPosts: [],
    downvotedPosts: []
  },
  streams: [],
  posts: [],
  papers: [],
  settings: {
    theme: 'light',
    filterStreamByDefault: false,
    enableNotifications: true,
    compactView: false
  }
};

// Load or Seed DB
function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(content);
      console.log(`[Database] Loaded from ${DB_FILE} (${db.posts.length} posts, ${db.papers.length} papers)`);
    } catch (e) {
      console.error('[Database] Failed to read db.json, using default state:', e);
    }
  } else {
    saveDB();
    console.log(`[Database] Created fresh database at ${DB_FILE}`);
  }
}

// Atomic Safe DB Save
function saveDB() {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('[Database] Error saving DB:', err);
  }
}

// Initial DB load
loadDB();

// Helper: Read JSON request body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 50 * 1024 * 1024) { // 50MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

// Send JSON Helper
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-filename, Authorization',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  });
  res.end(JSON.stringify(data));
}

// Get Local LAN IP for mobile preview
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-filename, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // ========================================================
  // REST API ENDPOINTS
  // ========================================================

  // GET /api/status - Server health & info
  if (pathname === '/api/status' && req.method === 'GET') {
    return sendJson(res, 200, {
      status: 'online',
      version: '2.0.0',
      database: 'JSON File (data/db.json)',
      postsCount: db.posts.length,
      papersCount: db.papers.length,
      user: db.user.name,
      uptime: Math.round(process.uptime())
    });
  }

  // GET /api/user - Fetch profile
  if (pathname === '/api/user' && req.method === 'GET') {
    return sendJson(res, 200, db.user);
  }

  // PUT or POST /api/user - Update profile
  if (pathname === '/api/user' && (req.method === 'PUT' || req.method === 'POST')) {
    try {
      const updates = await parseJsonBody(req);
      const oldName = db.user.name;
      const oldUsername = db.user.username;

      db.user = {
        ...db.user,
        ...updates
      };

      // If user name or username changed, synchronize their previous posts & uploaded papers
      if (updates.name && updates.name !== oldName) {
        db.papers.forEach(p => {
          if (p.uploaderName === oldName) {
            p.uploaderName = updates.name;
            if (updates.streamName) p.uploaderStream = updates.streamName;
          }
        });
      }

      if (updates.username && updates.username !== oldUsername) {
        db.posts.forEach(p => {
          if (p.author && p.author.username === oldUsername) {
            p.author.name = updates.name || p.author.name;
            p.author.username = updates.username;
            if (updates.avatar) p.author.avatar = updates.avatar;
          }
        });
      }

      saveDB();
      return sendJson(res, 200, { success: true, user: db.user });
    } catch (err) {
      return sendJson(res, 400, { success: false, error: err.message });
    }
  }

  // GET /api/posts - Fetch all posts
  if (pathname === '/api/posts' && req.method === 'GET') {
    return sendJson(res, 200, db.posts);
  }

  // POST /api/posts - Create new post
  if (pathname === '/api/posts' && req.method === 'POST') {
    try {
      const newPost = await parseJsonBody(req);
      const postObj = {
        id: 'post_' + Date.now(),
        createdAt: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
        comments: [],
        ...newPost
      };
      db.posts.unshift(postObj);
      saveDB();
      return sendJson(res, 201, postObj);
    } catch (err) {
      return sendJson(res, 400, { success: false, error: err.message });
    }
  }

  // POST /api/posts/:id/vote - Upvote / downvote post
  if (pathname.startsWith('/api/posts/') && pathname.endsWith('/vote') && req.method === 'POST') {
    try {
      const parts = pathname.split('/');
      const postId = parts[3];
      const { type } = await parseJsonBody(req); // 'up' or 'down'
      const post = db.posts.find(p => p.id === postId);

      if (!post) {
        return sendJson(res, 404, { success: false, error: 'Post not found' });
      }

      if (!db.user.upvotedPosts) db.user.upvotedPosts = [];
      if (!db.user.downvotedPosts) db.user.downvotedPosts = [];

      const upIndex = db.user.upvotedPosts.indexOf(postId);
      const downIndex = db.user.downvotedPosts.indexOf(postId);

      if (type === 'up') {
        if (upIndex > -1) {
          db.user.upvotedPosts.splice(upIndex, 1);
          post.upvotes = Math.max(0, post.upvotes - 1);
        } else {
          if (downIndex > -1) {
            db.user.downvotedPosts.splice(downIndex, 1);
            post.downvotes = Math.max(0, post.downvotes - 1);
          }
          db.user.upvotedPosts.push(postId);
          post.upvotes += 1;
        }
      } else if (type === 'down') {
        if (downIndex > -1) {
          db.user.downvotedPosts.splice(downIndex, 1);
          post.downvotes = Math.max(0, post.downvotes - 1);
        } else {
          if (upIndex > -1) {
            db.user.upvotedPosts.splice(upIndex, 1);
            post.upvotes = Math.max(0, post.upvotes - 1);
          }
          db.user.downvotedPosts.push(postId);
          post.downvotes += 1;
        }
      }

      saveDB();
      return sendJson(res, 200, { post, user: db.user });
    } catch (err) {
      return sendJson(res, 400, { success: false, error: err.message });
    }
  }

  // POST /api/posts/:id/comment - Add comment
  if (pathname.startsWith('/api/posts/') && pathname.endsWith('/comment') && req.method === 'POST') {
    try {
      const parts = pathname.split('/');
      const postId = parts[3];
      const commentData = await parseJsonBody(req);
      const post = db.posts.find(p => p.id === postId);

      if (!post) {
        return sendJson(res, 404, { success: false, error: 'Post not found' });
      }

      const commentObj = {
        id: 'c_' + Date.now(),
        createdAt: new Date().toISOString(),
        upvotes: 0,
        ...commentData
      };

      if (!post.comments) post.comments = [];
      post.comments.push(commentObj);
      saveDB();
      return sendJson(res, 201, commentObj);
    } catch (err) {
      return sendJson(res, 400, { success: false, error: err.message });
    }
  }

  // GET /api/papers - Fetch all question papers
  if (pathname === '/api/papers' && req.method === 'GET') {
    return sendJson(res, 200, db.papers);
  }

  // POST /api/papers - Save new question paper
  if (pathname === '/api/papers' && req.method === 'POST') {
    try {
      const newPaper = await parseJsonBody(req);
      const paperObj = {
        id: 'paper_' + Date.now(),
        uploadedAt: new Date().toISOString().split('T')[0],
        downloadsCount: 0,
        rating: 5.0,
        pages: 3,
        fileSize: newPaper.fileSize || '1.5 MB',
        ...newPaper
      };

      db.papers.unshift(paperObj);
      db.user.reputation = (db.user.reputation || 0) + 25;
      if (!db.user.badges.includes("PYQ Donor")) {
        db.user.badges.push("PYQ Donor");
      }
      saveDB();
      return sendJson(res, 201, paperObj);
    } catch (err) {
      return sendJson(res, 400, { success: false, error: err.message });
    }
  }

  // POST /api/upload - Handle Real PDF File Upload (Streams directly to disk in uploads/)
  if (pathname === '/api/upload' && req.method === 'POST') {
    try {
      const rawHeaderName = req.headers['x-filename'];
      const rawName = rawHeaderName ? decodeURIComponent(rawHeaderName) : `exam_paper_${Date.now()}.pdf`;
      const sanitized = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const safeFilename = `${Date.now()}_${sanitized}`;
      const targetFilePath = path.join(UPLOAD_DIR, safeFilename);

      const writeStream = fs.createWriteStream(targetFilePath);
      let totalBytes = 0;

      req.on('data', chunk => {
        totalBytes += chunk.length;
      });

      req.pipe(writeStream);

      writeStream.on('finish', () => {
        const sizeMb = (totalBytes / (1024 * 1024)).toFixed(1);
        const sizeStr = totalBytes >= 1024 * 1024 ? `${sizeMb} MB` : `${Math.max(1, Math.round(totalBytes / 1024))} KB`;

        console.log(`[Upload] Successfully saved real PYQ: ${safeFilename} (${sizeStr})`);

        return sendJson(res, 200, {
          success: true,
          fileUrl: `/uploads/${safeFilename}`,
          fileName: rawName,
          fileSize: sizeStr,
          bytes: totalBytes
        });
      });

      writeStream.on('error', (err) => {
        console.error('[Upload] Write error:', err);
        return sendJson(res, 500, { success: false, error: 'Failed to write uploaded file' });
      });

      return;
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // ========================================================
  // UPLOADS DIRECTORY FILE SERVING (PDFs, docs, images)
  // ========================================================
  if (pathname.startsWith('/uploads/')) {
    const rawFileName = path.basename(pathname);
    const filePath = path.join(UPLOAD_DIR, rawFileName);

    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      const isDownload = parsedUrl.searchParams.get('download') === '1';
      const disposition = isDownload ? `attachment; filename="${rawFileName}"` : 'inline';

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Length': stat.size,
        'Content-Disposition': disposition,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400'
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('File Not Found');
    }
  }

  // ========================================================
  // STATIC FILE SERVING (SPA)
  // ========================================================
  let relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  let fullPath = path.join(__dirname, relativePath);

  // Security: Prevent Directory Traversal
  if (!fullPath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA client-side routes
      fullPath = path.join(__dirname, 'index.html');
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(fullPath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Internal Server Error: ${readErr.code}`);
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
        });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, HOST, () => {
  const localIp = getLocalIp();
  console.log(`================================================================`);
  console.log(`  🎓 SSJU CONNECT SERVER IS LIVE!`);
  console.log(`  Soban Singh Jeena University Almora - Campus & PYQ Portal`);
  console.log(`================================================================`);
  console.log(`  💻 PC / Localhost:    http://localhost:${PORT}`);
  console.log(`  📱 Mobile / Campus:   http://${localIp}:${PORT}`);
  console.log(`  📁 PDF Uploads Path:  ${UPLOAD_DIR}`);
  console.log(`  💾 Database Engine:   ${DB_FILE}`);
  console.log(`================================================================`);
});
