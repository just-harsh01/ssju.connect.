# SSJU Connect &bull; Campus Social & PYQ Question Paper Portal

> A fully responsive, modern **Quora & Reddit hybrid web application** tailored for **Soban Singh Jeena University (SSJU)** students, faculty, and alumni.

---

## 🌟 Key Features

### 1. 🏠 Home Page (Quora & Reddit Hybrid Feed)
- **Top Bar Post Creator**: *"What do you want to ask or share about SSJU?"* with quick buttons to **Ask Question**, **Post Image**, or **Upload Paper PDF**.
- **Interactive Post Cards**:
  - Reddit/Quora style **Upvote / Downvote pill** with live score calculations.
  - Verified student / faculty badges, branch labels, and timestamp.
  - Formatted text & expandable question discussions.
  - College photos and attachments with full-screen zoom Lightbox.
  - Clickable topic tags (`#EndTermExams`, `#Placements`, `#Spandan2026`).
  - **Answers & Comments System**: Inline answer textarea with author badge, upvoting, and nested reply structure.
  - One-click post sharing & bookmarking.
- **Feed Sub-Filters**:
  - 🔥 **Everything** (All campus posts)
  - ⚡ **Top Upvoted** (Trending by votes)
  - ❓ **Doubts & Questions** (Academic Q&A)
  - 🎉 **Campus Events** (Fests, auditions, sports)
  - 📢 **Notices** (Official university announcements)
  - Stream-specific feed filtering dropdown.

---

### 2. 🏛️ Department & Stream Selection Page
- Dedicated directory of university faculties and streams:
  - **B.Tech CSE & IT** (Computer Science & Engineering)
  - **BCA & MCA** (Computer Applications)
  - **Faculty of Science** (B.Sc / M.Sc Physics, Chemistry, Math, Botany, Zoology)
  - **Commerce & Finance** (B.Com / M.Com)
  - **Management Studies** (BBA / MBA)
  - **Arts & Humanities** (B.A. / M.A.)
  - **Faculty of Law** (LL.B / LL.M)
  - **Pharmacy & Medical Sciences** (B.Pharm / D.Pharm)
- Displays active student counts, question papers count, and direct shortcuts to filter feeds or view department-specific PYQ papers.
- Ability to set primary stream in your profile.

---

### 3. 📄 Question Paper (PYQ) Vault: Upload & Download
- **Anyone can upload question paper PDFs**:
  - Upload real `.pdf` files via drag-and-drop or file picker.
  - Specify subject code, subject title, department stream, semester (1 to 8), exam year (2021–2026), and exam type (End-Term, Mid-Term, Backlog).
  - Automatically calculates file size and stores the document securely in local browser storage.
  - Earns **+25 Campus Karma** points and a *"PYQ Donor"* badge!
- **Instant PDF Downloads**:
  - One-click download button triggers fast download of the authentic PDF exam paper with proper file naming (`SSJU_CSE_CS301_2025.pdf`).
  - Pre-seeded question papers dynamically generate an official formatted SSJU university exam paper using **jsPDF** with university header, exam sections (Section A, B, C), and marking scheme!
- **Interactive Preview Modal**:
  - Inspect the question paper directly on your screen without leaving the page.
- **Filters & Search**:
  - Filter question papers by Department, Semester, and live Subject / Code search.

---

### 4. 👤 Corner Profile & Settings
- **Top-Right Corner Avatar**:
  - Clickable avatar dropdown menu with quick profile stats, stream info, dark mode toggle, and settings shortcuts.
- **Dedicated Profile View**:
  - Cover photo, customizable avatar, roll number, stream, semester, and bio.
  - **Campus Karma** reputation score and achievement badges (*"Top Doubt Solver"*, *"Campus Contributor"*, *"PYQ Uploader"*).
  - Tabbed history:
    - **My Posts**: Review all posts you created with one-click delete option.
    - **Uploaded PYQs**: View all question papers you contributed.
    - **Saved Bookmarks**: Quick access to saved questions and papers.
- **Dedicated Settings View**:
  - Edit full name, username, email, roll number, bio, primary stream, and semester.
  - **Appearance Preferences**: Toggle **Dark Mode** / **Light Mode** (persists in storage).
  - Reset to default demo data option.

---

### 5. 🔍 Universal Search
- Real-time search in top navigation bar (`/` shortcut to instantly focus).
- Unified search results spanning:
  1. Campus questions and discussions (title, description, tags).
  2. Question papers and subject codes.
  3. University streams and departments.

---

### 6. 📲 "Share the App" Feature
- Prominent **"Share App"** button in header, right sidebar, and profile dropdown.
- **Interactive Share Dialog**:
  - **Dynamic QR Code**: High-resolution SVG QR code that smartphone cameras can scan immediately.
  - **Direct URL Copy**: One-click copy with animated toast notification.
  - **Mobile Native Share**: Integrates with device Web Share API (`navigator.share`) on mobile devices.
  - **Social Sharing**: Direct share shortcuts to **WhatsApp**, **Telegram**, **Twitter / X**, and **LinkedIn**.

---

### 7. 📱 100% Fully Responsive
- **Desktop (1024px+)**: Full 3-column Reddit/Quora layout (Left navigation & streams, Center feed, Right trending & PYQ widgets).
- **Tablet (768px - 1023px)**: 2-column layout with responsive stream switcher.
- **Mobile (<768px)**: Optimized mobile web app experience:
  - Sticky top header with brand and search.
  - Floating center **(+) Ask/Post** action button.
  - Native-style **Bottom Navigation Bar** (*Feed*, *Streams*, *(+)*, *PYQs*, *Profile*).

---

## 🚀 How to Run the App

You have multiple instant options:

### Option 1: Full-Stack Node.js Engine (Recommended - Full Database & File Uploads)
Run the Node.js server to enable real file uploads up to 50MB and permanent database storage:
```bash
node server.js
```
Then visit: `http://localhost:3000`  
*(Or open the printed LAN URL on your phone while connected to the same Wi-Fi!)*

### Option 2: Windows One-Click Launcher
Double-click `start.bat` in File Explorer. It automatically launches the Node.js full-stack engine with live database and upload support!

### Option 3: Python Server Engine
```bash
python server.py
```
Then visit: `http://localhost:3000`

---

## 🌐 How to Host the Website Online (100% FREE for Newbies)

Because SSJU Connect handles **real PDF uploads, comments, upvotes, and profile persistence**, it needs a full-stack Node.js host rather than a pure static host like basic Netlify.

### 🌟 Recommended Host: Render.com (100% Free, Zero Configuration)
Render lets you deploy full Node.js web applications directly from GitHub for free with zero complex database setup:

1. **Push your code to GitHub**:
   - Create a free GitHub account (if you don't already have one) at [github.com](https://github.com).
   - Create a new repository named `ssju-connect`.
   - Push your project files to the repository.

2. **Deploy on Render**:
   - Go to [render.com](https://render.com) and create a free account (Sign in with GitHub).
   - Click **New +** &rarr; select **Web Service**.
   - Select your `ssju-connect` GitHub repository.
   - Configure settings:
     - **Name**: `ssju-connect` (or any name you choose)
     - **Region**: Singapore or Frankfurt (fastest for India)
     - **Branch**: `main`
     - **Runtime**: `Node`
     - **Build Command**: *(leave blank or `npm install`)*
     - **Start Command**: `node server.js`
     - **Instance Type**: **Free**
   - Click **Create Web Service**.

3. **Your Live Public Website**:
   - In less than 2 minutes, Render gives you a live global HTTPS URL:  
     `https://ssju-connect.onrender.com`
   - Teachers, classmates, and college friends can open this link from anywhere, download question papers, upload new PYQs, and join discussions!

---

## 📁 File Structure

```
e:\SSJU.Connect\
├── index.html          # Core responsive Quora/Reddit HTML application
├── server.js           # Full-Stack Node.js engine with REST API & PDF uploader
├── server.py           # Full-Stack Python engine with REST API & uploads
├── start.bat           # Windows 1-click quick-launch script
├── data\
│   └── db.json         # Real persistent database for posts, PYQs, and user profiles
├── uploads\
│   └── .gitkeep        # Server repository where uploaded PDF exam papers are stored
├── css\
│   └── styles.css      # Animations, vote pills, and responsive styling
├── js\
│   ├── app.bundle.js   # Production bundle with REST API, IndexedDB & UI controllers
│   ├── app.js          # Core application controller
│   ├── storage.js      # Storage controller & API sync
│   ├── data.js         # Initial mock streams, posts, papers & profiles
│   ├── pdf-helper.js   # PDF preview, download & jsPDF generator
│   └── share-helper.js # QR code generator, clipboard & social share links
├── package.json        # Project metadata & start script
└── README.md           # Documentation & hosting guide
```
