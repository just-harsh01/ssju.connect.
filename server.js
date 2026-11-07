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

const DEFAULT_DB = {
  "user": {
    "id": "user_ssju_01",
    "name": "Arjun Singh Negi",
    "username": "arjun_ssju",
    "email": "arjun.negi@ssju.ac.in",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80",
    "bio": "BCA 3rd Year student @ SSJU Almora Campus. Interested in Web Development & Open Source. Feel free to ask programming doubts!",
    "stream": "bca_mca",
    "streamName": "Computer Applications & IT",
    "semester": 5,
    "rollNo": "SSJU/2023/BCA/042",
    "reputation": 340,
    "badges": ["Campus Contributor", "Top Doubt Solver", "PYQ Uploader"],
    "bookmarks": ["post_2", "paper_1"],
    "upvotedPosts": ["post_1", "post_3"],
    "downvotedPosts": []
  },
  "streams": [
    {
      "id": "science",
      "name": "Faculty of Science",
      "code": "B.Sc / M.Sc",
      "icon": "🔬",
      "description": "Physics, Chemistry, Mathematics, Botany, Zoology, Geology, Statistics, Biotechnology & Forestry.",
      "studentCount": 2450,
      "papersCount": 78,
      "color": "from-emerald-600 to-teal-700",
      "semesters": [1, 2, 3, 4, 5, 6]
    },
    {
      "id": "arts",
      "name": "Faculty of Arts & Humanities",
      "code": "B.A / M.A",
      "icon": "📚",
      "description": "Hindi, English, Sanskrit, History, Political Science, Sociology, Geography, Economics, Psychology & Journalism.",
      "studentCount": 3100,
      "papersCount": 92,
      "color": "from-rose-600 to-pink-700",
      "semesters": [1, 2, 3, 4, 5, 6]
    },
    {
      "id": "commerce",
      "name": "Faculty of Commerce",
      "code": "B.Com / M.Com",
      "icon": "📊",
      "description": "Corporate Accounting, Auditing, Financial Management, Taxation, Banking, Business Economics & E-Commerce.",
      "studentCount": 1680,
      "papersCount": 54,
      "color": "from-amber-600 to-orange-700",
      "semesters": [1, 2, 3, 4, 5, 6]
    },
    {
      "id": "bca_mca",
      "name": "Computer Applications & IT",
      "code": "BCA / MCA / PGDCA",
      "icon": "💻",
      "description": "Programming, Data Structures, Web Technologies, Database Systems, Software Engineering, AI & Python.",
      "studentCount": 1220,
      "papersCount": 46,
      "color": "from-blue-600 to-indigo-700",
      "semesters": [1, 2, 3, 4, 5, 6]
    },
    {
      "id": "education",
      "name": "Faculty of Education",
      "code": "B.Ed / M.Ed",
      "icon": "🎓",
      "description": "Teacher Education, Philosophical & Sociological Foundations, Educational Psychology, Curriculum & Pedagogy.",
      "studentCount": 920,
      "papersCount": 38,
      "color": "from-sky-600 to-cyan-700",
      "semesters": [1, 2, 3, 4]
    },
    {
      "id": "management",
      "name": "Management Studies",
      "code": "BBA / MBA",
      "icon": "📈",
      "description": "Business Administration, Marketing Strategy, Financial Management, Human Resource & Tourism Management.",
      "studentCount": 840,
      "papersCount": 32,
      "color": "from-purple-600 to-violet-800",
      "semesters": [1, 2, 3, 4]
    },
    {
      "id": "law",
      "name": "Faculty of Law",
      "code": "LL.B / LL.M",
      "icon": "⚖️",
      "description": "Constitutional Law of India, Criminal Jurisprudence, Civil Code, Law of Torts, Evidence Act & Moot Courts.",
      "studentCount": 610,
      "papersCount": 26,
      "color": "from-slate-700 to-zinc-900",
      "semesters": [1, 2, 3, 4, 5, 6]
    },
    {
      "id": "yoga",
      "name": "Yoga & Alternative Therapy",
      "code": "B.A / B.Sc & M.A / M.Sc (Yoga)",
      "icon": "🧘",
      "description": "Yogic Philosophy, Patanjali Yoga Sutras, Naturopathy, Asanas, Pranayama, Human Anatomy & Wellness Science.",
      "studentCount": 520,
      "papersCount": 20,
      "color": "from-lime-600 to-emerald-800",
      "semesters": [1, 2, 3, 4, 5, 6]
    },
    {
      "id": "visual_arts",
      "name": "Visual Arts & Performing Arts",
      "code": "B.F.A / M.F.A & Music",
      "icon": "🎨",
      "description": "Fine Arts, Painting, Sculpture, Traditional Folk Art (Aipan of Kumaon), Classical Vocal & Instrumental Music.",
      "studentCount": 390,
      "papersCount": 16,
      "color": "from-fuchsia-600 to-pink-800",
      "semesters": [1, 2, 3, 4, 5, 6]
    },
    {
      "id": "pharmacy",
      "name": "Pharmacy & Medical Sciences",
      "code": "B.Pharm / D.Pharm",
      "icon": "💊",
      "description": "Pharmaceutics, Pharmacology, Pharmacognosy, Pharmaceutical Chemistry, Biochemistry & Clinical Trials.",
      "studentCount": 480,
      "papersCount": 22,
      "color": "from-teal-600 to-cyan-800",
      "semesters": [1, 2, 3, 4, 5, 6, 7, 8]
    }
  ],
  "posts": [
    {
      "id": "post_1",
      "author": {
        "name": "Pooja Bisht",
        "username": "pooja_b",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
        "stream": "bca_mca",
        "streamLabel": "BCA - 5th Sem",
        "isVerifiedStudent": true
      },
      "title": "How to prepare for Data Structures & Algorithms for upcoming campus placement drives?",
      "content": "SSJU Almora training and placement cell announced that technical recruiters are visiting next semester. For 2nd and 3rd year students in Computer Applications and Sciences, what specific topics in DSA should we prioritize? Should we focus on LeetCode Top 150 or Striver's SDE sheet? Also, do they ask core OS and DBMS questions in round 1 technical interview?",
      "category": "Doubt / Question",
      "streamId": "bca_mca",
      "tags": ["Placements", "DSA", "CampusHiring", "SSJU"],
      "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
      "upvotes": 42,
      "downvotes": 1,
      "createdAt": "2026-10-12T10:30:00Z",
      "comments": [
        {
          "id": "c_1",
          "author": {
            "name": "Rohit Joshi",
            "username": "rohit_j",
            "avatar": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
            "streamLabel": "Alumni / Software Engineer"
          },
          "content": "From my experience, Striver's A2Z DSA sheet is solid for campus placements. Ensure you master Binary Trees, Graphs (BFS/DFS), and Dynamic Programming basics. For DBMS, normalize tables up to BCNF and know SQL indexing!",
          "upvotes": 18,
          "createdAt": "2026-10-12T11:45:00Z"
        },
        {
          "id": "c_2",
          "author": {
            "name": "Dr. K. S. Rawat",
            "username": "rawat_faculty",
            "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
            "streamLabel": "Faculty - Dept of Computer Applications"
          },
          "content": "Good question Pooja. The department is also organizing a 3-day hands-on workshop on Mock Technical Interviews in the Central Seminar Hall next Wednesday. Attendance is highly encouraged.",
          "upvotes": 24,
          "createdAt": "2026-10-12T14:10:00Z"
        }
      ]
    },
    {
      "id": "post_2",
      "author": {
        "name": "Aditya Pant",
        "username": "aditya_sc",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        "stream": "science",
        "streamLabel": "B.Sc Physics - 4th Sem",
        "isVerifiedStudent": true
      },
      "title": "Glimpse of today's Astronomy Club telescope setup at Almora Upper Ground! 🌌🔭",
      "content": "The sky was crystal clear tonight over the Kumaon hills! The Physics Society & Astronomy Club set up the 8-inch reflector telescope near the SSJU Administrative block. We got spectacular views of Saturn's rings and Jupiter's Galilean moons. Huge shoutout to everyone who braved the cold breeze to join us. Next stargazing session is scheduled during the upcoming meteor shower!",
      "category": "Campus Events",
      "streamId": "science",
      "tags": ["AstronomyClub", "CampusLife", "Almora", "PhysicsSociety"],
      "image": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
      "upvotes": 68,
      "downvotes": 0,
      "createdAt": "2026-10-11T20:15:00Z",
      "comments": [
        {
          "id": "c_3",
          "author": {
            "name": "Deepa Mehta",
            "username": "deepa_m",
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
            "streamLabel": "B.A. English - 2nd Sem"
          },
          "content": "It was magical! The view of Saturn was so sharp. Please do another session next Saturday so students from lower campus hostels can also reach on time.",
          "upvotes": 9,
          "createdAt": "2026-10-11T21:00:00Z"
        }
      ]
    },
    {
      "id": "post_3",
      "author": {
        "name": "Neha Tiwari",
        "username": "neha_comm",
        "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
        "stream": "commerce",
        "streamLabel": "B.Com Honours - 5th Sem",
        "isVerifiedStudent": true
      },
      "title": "Notice regarding Central Library book renewal & Extended hours for Mid-Term Exams",
      "content": "Official update from University Central Library: Library reading halls will now remain open until 9:00 PM on weekdays starting next Monday due to mid-semester exams. Also, students can renew up to 4 textbooks simultaneously through the online portal without library fine. Make sure to carry your university ID card for biometric gate entry.",
      "category": "Official Announcement",
      "streamId": "commerce",
      "tags": ["CentralLibrary", "Exams2026", "CampusNotice", "SSJU"],
      "image": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
      "upvotes": 53,
      "downvotes": 2,
      "createdAt": "2026-10-10T09:00:00Z",
      "comments": [
        {
          "id": "c_4",
          "author": {
            "name": "Virendra Singh",
            "username": "viren_bca",
            "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
            "streamLabel": "BCA - 3rd Sem"
          },
          "content": "Much needed! The WiFi connection in the 2nd-floor digital section has also been upgraded to high-speed fiber.",
          "upvotes": 7,
          "createdAt": "2026-10-10T10:20:00Z"
        }
      ]
    },
    {
      "id": "post_4",
      "author": {
        "name": "Manoj Bhatt",
        "username": "manoj_yoga",
        "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
        "stream": "yoga",
        "streamLabel": "M.A. Yoga - 1st Sem",
        "isVerifiedStudent": true
      },
      "title": "Morning Sunrise Pranayama & Hatha Yoga Camp on University Lawn this Sunday 🧘‍♂️",
      "content": "The Department of Yoga & Alternative Therapy is organizing a sunrise practical meditation and Surya Namaskar session this Sunday at 6:30 AM. Students from all faculties (Science, Arts, Commerce, Law, B.Ed) are welcome! Mats will be provided by the department.",
      "category": "Campus Events",
      "streamId": "yoga",
      "tags": ["YogaDepartment", "Wellness", "SSJUAlmora", "Health"],
      "image": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80",
      "upvotes": 71,
      "downvotes": 0,
      "createdAt": "2026-10-09T14:20:00Z",
      "comments": [
        {
          "id": "c_5",
          "author": {
            "name": "Siddharth Verma",
            "username": "sid_law",
            "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
            "streamLabel": "LL.B - 2nd Sem"
          },
          "content": "Count the Law faculty students in! Great initiative for relieving exam stress.",
          "upvotes": 8,
          "createdAt": "2026-10-09T16:12:00Z"
        }
      ]
    }
  ],
  "papers": [
    {
      "id": "paper_1",
      "title": "Data Structures and File Organization (BCA-301)",
      "subjectCode": "BCA-301",
      "streamId": "bca_mca",
      "streamName": "Computer Applications & IT",
      "semester": 3,
      "examYear": 2025,
      "examType": "End-Term Regular",
      "uploaderName": "Arjun Singh Negi",
      "uploaderStream": "BCA",
      "uploadedAt": "2026-09-18",
      "fileSize": "1.4 MB",
      "pages": 4,
      "downloadsCount": 184,
      "rating": 4.9,
      "description": "Official End-Term examination paper covering Stacks, Queues, Binary Trees, AVL Trees, Graphs, Sorting algorithms, and dynamic file indexing.",
      "tags": ["DSA", "DataStructures", "Semester3", "EndTerm2025"],
      "fileUrl": null,
      "pdfDataUrl": null
    },
    {
      "id": "paper_2",
      "title": "Childhood and Growing Up (B.Ed Core Paper I)",
      "subjectCode": "BED-101",
      "streamId": "education",
      "streamName": "Faculty of Education",
      "semester": 1,
      "examYear": 2025,
      "examType": "End-Term Regular",
      "uploaderName": "Sunita Arya",
      "uploaderStream": "B.Ed",
      "uploadedAt": "2026-08-20",
      "fileSize": "1.2 MB",
      "pages": 4,
      "downloadsCount": 145,
      "rating": 4.8,
      "description": "Covers psychological development, Piaget's cognitive development theory, Vygotsky's socio-cultural theory, and adolescent learning in school environments.",
      "tags": ["BEd", "ChildPsychology", "Semester1", "Education"],
      "fileUrl": null,
      "pdfDataUrl": null
    },
    {
      "id": "paper_3",
      "title": "Quantum Mechanics & Modern Physics (PHY-501)",
      "subjectCode": "PHY-501",
      "streamId": "science",
      "streamName": "Faculty of Science",
      "semester": 5,
      "examYear": 2024,
      "examType": "End-Term Regular",
      "uploaderName": "Aditya Pant",
      "uploaderStream": "B.Sc Physics",
      "uploadedAt": "2026-06-14",
      "fileSize": "1.7 MB",
      "pages": 5,
      "downloadsCount": 132,
      "rating": 4.9,
      "description": "Complete question paper including 1D Schrodinger wave equation, photoelectric effect, Compton effect, operator formalism, and hydrogen atom energy states.",
      "tags": ["Physics", "QuantumMechanics", "BSc", "Sem5"],
      "fileUrl": null,
      "pdfDataUrl": null
    },
    {
      "id": "paper_4",
      "title": "Foundations of Yogic Sciences & Philosophy (YOG-101)",
      "subjectCode": "YOG-101",
      "streamId": "yoga",
      "streamName": "Yoga & Alternative Therapy",
      "semester": 1,
      "examYear": 2025,
      "examType": "End-Term Regular",
      "uploaderName": "Manoj Bhatt",
      "uploaderStream": "M.A. Yoga",
      "uploadedAt": "2026-07-10",
      "fileSize": "1.0 MB",
      "pages": 3,
      "downloadsCount": 118,
      "rating": 4.9,
      "description": "Questions on Patanjali Yoga Sutras, Ashtanga Yoga, Hatha Yoga Pradipika, subtle anatomy (Chakras and Nadis), and modern wellness science.",
      "tags": ["Yoga", "Philosophy", "Semester1", "SSJU"],
      "fileUrl": null,
      "pdfDataUrl": null
    },
    {
      "id": "paper_5",
      "title": "Financial Accounting & Corporate Auditing (COM-302)",
      "subjectCode": "COM-302",
      "streamId": "commerce",
      "streamName": "Faculty of Commerce",
      "semester": 3,
      "examYear": 2025,
      "examType": "End-Term Regular",
      "uploaderName": "Neha Tiwari",
      "uploaderStream": "B.Com",
      "uploadedAt": "2026-05-30",
      "fileSize": "1.2 MB",
      "pages": 4,
      "downloadsCount": 88,
      "rating": 4.6,
      "description": "Corporate financial statements, partnership accounting, depreciation methodologies, goodwill valuation, and internal auditing guidelines.",
      "tags": ["Accounting", "Finance", "BCom", "Auditing"],
      "fileUrl": null,
      "pdfDataUrl": null
    },
    {
      "id": "paper_6",
      "title": "Constitutional Law of India - Part I & II (LAW-101)",
      "subjectCode": "LAW-101",
      "streamId": "law",
      "streamName": "Faculty of Law",
      "semester": 1,
      "examYear": 2024,
      "examType": "End-Term Regular",
      "uploaderName": "Siddharth Verma",
      "uploaderStream": "LL.B",
      "uploadedAt": "2026-04-19",
      "fileSize": "1.5 MB",
      "pages": 4,
      "downloadsCount": 95,
      "rating": 4.8,
      "description": "Fundamental Rights (Articles 14 to 32), Directive Principles of State Policy, Preamble interpretations, writ petitions, and landmark Supreme Court judgments.",
      "tags": ["ConstitutionalLaw", "LLB", "Judgments", "Law"],
      "fileUrl": null,
      "pdfDataUrl": null
    },
    {
      "id": "paper_7",
      "title": "History of Modern India (1757 - 1947) (HIST-201)",
      "subjectCode": "HIST-201",
      "streamId": "arts",
      "streamName": "Faculty of Arts & Humanities",
      "semester": 2,
      "examYear": 2025,
      "examType": "End-Term Regular",
      "uploaderName": "Deepa Mehta",
      "uploaderStream": "B.A. History",
      "uploadedAt": "2026-03-15",
      "fileSize": "1.1 MB",
      "pages": 3,
      "downloadsCount": 84,
      "rating": 4.7,
      "description": "Colonial rule, revolt of 1857, socio-religious reform movements, Indian National Congress formation, Gandhian movements, and independence.",
      "tags": ["History", "ModernIndia", "BA", "Sem2"],
      "fileUrl": null,
      "pdfDataUrl": null
    }
  ],
  "settings": {
    "theme": "light",
    "filterStreamByDefault": false,
    "enableNotifications": true,
    "compactView": false
  }
};

let db = JSON.parse(JSON.stringify(DEFAULT_DB));

function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(content);
      if (!db.posts || db.posts.length === 0) {
        db.posts = DEFAULT_DB.posts;
        db.papers = DEFAULT_DB.papers;
        db.streams = DEFAULT_DB.streams;
        saveDB();
      }
      console.log(`[Database] Loaded from ${DB_FILE} (${db.posts.length} posts, ${db.papers.length} papers)`);
    } catch (e) {
      console.error('[Database] Failed to read db.json, using default state:', e);
      db = JSON.parse(JSON.stringify(DEFAULT_DB));
      saveDB();
    }
  } else {
    db = JSON.parse(JSON.stringify(DEFAULT_DB));
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
  // ASSET FALLBACK ROUTING (JS, CSS, BUNDLES)
  // ========================================================
  if (pathname === '/js/app.bundle.js' || pathname === '/app.bundle.js') {
    let p = path.join(__dirname, 'app.bundle.js');
    if (!fs.existsSync(p)) p = path.join(__dirname, 'js', 'app.bundle.js');
    if (fs.existsSync(p)) {
      res.writeHead(200, {
        'Content-Type': 'text/javascript; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(p).pipe(res);
      return;
    }
  }

  if (pathname === '/css/styles.css' || pathname === '/styles.css') {
    let p = path.join(__dirname, 'styles.css');
    if (!fs.existsSync(p)) p = path.join(__dirname, 'css', 'styles.css');
    if (fs.existsSync(p)) {
      res.writeHead(200, {
        'Content-Type': 'text/css; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(p).pipe(res);
      return;
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
    const ext = path.extname(fullPath).toLowerCase();

    // If an asset file (.js, .css, .png, etc.) is missing, return 404 instead of index.html
    if (err || !stats.isFile()) {
      if (['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.pdf', '.woff', '.woff2'].includes(ext)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end(`Asset not found: ${pathname}`);
      }
      // Only fallback to index.html for SPA page routes
      fullPath = path.join(__dirname, 'index.html');
    }

    const contentType = MIME_TYPES[path.extname(fullPath).toLowerCase()] || 'application/octet-stream';

    fs.readFile(fullPath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Internal Server Error: ${readErr.code}`);
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': fullPath.endsWith('index.html') ? 'no-cache' : 'public, max-age=3600'
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
