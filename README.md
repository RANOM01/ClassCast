# ClassCast

> **A place to teach. A space to *learn.***
> A modern, high-fidelity mini learning management system built on the MERN stack with the Cyber Serif design aesthetic.

---

## 1. System Overview

**ClassCast** provides a focused, architectural learning platform connecting course creators and learners through persisted MongoDB records:
- **Instructors** create and manage technical courses, build multi-module curricula, inspect live student rosters, publish assignments and single-attempt multiple-choice quizzes, evaluate submissions, and return detailed feedback.
- **Students** explore published curricula, register with one click, study lessons with persistent resume points and completion tracking, submit coursework before deadlines, take securely scored quizzes, and review personal gradebooks.

---

## 2. Technology Stack

- **Frontend:** React 18 (Vite JavaScript template, ES Modules, no TypeScript), React Router v6, Tailwind CSS, Lucide Icons, Google Fonts (*Newsreader*, *Inter*, *Space Grotesk*).
- **Backend:** Node.js & Express.js REST API under `/api`.
- **Database:** MongoDB with Mongoose ODM, utilizing compound unique indexes (`{ student: 1, course: 1 }` and `{ quiz: 1, student: 1 }`).
- **Sessions & Security:** `express-session` with `connect-mongo` for persistent server-side sessions, HTTP-only secure cookies, and `bcryptjs` password hashing.
- **Design System:** **Cyber Serif** — Dominant background `#050505`, primary text `#EBEBEB`, accent emerald `#10B981`, glass surfaces (`rgba(255,255,255,0.02)` with `backdrop-filter: blur(12px)`), cursor spotlight tracking, shimmer borders, and ambient morphing glows.

---

## 3. Directory Layout

```
ClassCast/
├── package.json              # Root npm workspace commands
├── .gitignore
├── README.md
├── server/
│   ├── package.json          # Express, Mongoose, Connect-Mongo (type: module)
│   ├── .env.example          # Template for MongoDB Atlas & port configuration
│   ├── .env                  # Server runtime environment variables
│   ├── server.js             # Express app, session store, API routes, static production fallback
│   ├── scripts/
│   │   ├── seed.js           # Idempotent demo database seeder
│   │   └── createInstructor.js # CLI tool to provision new Instructor accounts
│   └── src/
│       ├── config/db.js      # Mongoose connection & telemetry helpers
│       ├── middleware/auth.js# requireAuth, requireInstructor, requireCourseOwner, requireStudent
│       ├── models/           # User, Course, Enrollment, Assignment, Submission, Quiz, QuizAttempt, Announcement
│       └── routes/           # REST endpoints (/api/auth, /api/courses, /api/curriculum, /api/enrollments, etc.)
└── client/
    ├── package.json          # React, Vite, Tailwind CSS (type: module)
    ├── vite.config.js        # Vite dev server with /api proxy to http://localhost:5001
    ├── tailwind.config.js    # Cyber Serif colors, fonts, animations
    ├── index.html            # Loads Newsreader, Inter, Space Grotesk fonts
    └── src/
        ├── App.jsx           # Client-side router & role guards
        ├── index.css         # Glass panels, shimmer borders, cursor spotlights, link animations
        ├── components/       # Navbar, Footer, Atmosphere, SpotlightCard, CoverPresets
        ├── context/          # AuthContext (persistent session state)
        └── pages/
            ├── HomePage.jsx          # Split hero, 3-column bento features, curriculum data table, CTA
            ├── CatalogPage.jsx       # Search & filterable catalog
            ├── CourseDetailPage.jsx  # Public syllabus preview, objectives, registration flow
            ├── LoginPage.jsx         # Sign in with quick 1-click demo credential shortcuts
            ├── SignupPage.jsx        # Public student registration
            ├── student/              # Dashboard, LessonPlayer, TakeQuizPage, StudentGradesPage
            └── instructor/           # Dashboard, CourseWorkspace (7 management tabs), Modals
```

---

## 4. Prerequisites & Configuration

### Prerequisites
1. **Node.js**: v18.0.0 or higher (v26+ supported).
2. **npm**: v9.0.0 or higher.
3. **MongoDB Connection**: A MongoDB Atlas connection string (recommended) or a local MongoDB instance.

### Configuration (`server/.env`)
The server reads its environment variables from `server/.env`. A template is provided in `server/.env.example`:

```env
PORT=5001
# Replace with your MongoDB Atlas connection string:
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/classcast?retryWrites=true&w=majority
SESSION_SECRET=classcast-cyber-serif-secure-session-key-2026
NODE_ENV=development
```

> **Setting up MongoDB Atlas (Free Tier):**
> 1. Visit [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free M0 cluster.
> 2. Under **Database Access**, create a user with read/write privileges.
> 3. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) or your IP.
> 4. Click **Connect** → **Drivers** → copy the connection string and paste it as `MONGODB_URI` in `server/.env`.

---

## 5. Installation & Setup

From the root directory:

```bash
# 1. Install all dependencies across root, server, and client:
npm run install:all

# 2. Populate idempotent demo courses, instructors, students, and coursework:
npm run seed
```

---

## 6. Demo Accounts & Credentials

All seeded accounts use the password: `Password123!`

| Role | Name | Email | Password | Status / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Instructor 1** | Dr. Elena Vance | `elena@classcast.dev` | `Password123!` | Owns featured course *"Distributed Systems"* & draft course |
| **Instructor 2** | Marcus Sterling | `marcus@classcast.dev` | `Password123!` | Owns course *"Modern WebGL & Shaders"* |
| **Student (Unenrolled)** | **Alex Rivera** | `alex@classcast.dev` | `Password123!` | **Deliberately unenrolled from Elena's course for live demo** |
| **Student 2** | Liam Chen | `liam@classcast.dev` | `Password123!` | Enrolled in Elena's course; has pending Raft submission |
| **Student 3** | Sophia Morales | `sophia@classcast.dev` | `Password123!` | Enrolled in Elena's course; has graded submission (48/50) |
| **Student 4** | Maya Patel | `maya@classcast.dev` | `Password123!` | Enrolled in Marcus's course; newly registered ("Not started") |

> **Tip:** The `LoginPage` includes quick 1-click credential buttons to instantly autofill any of these demo accounts.

---

## 7. Provisioning Additional Instructors

Public signup creates **Student** accounts only. To provision a new instructor, run the documented CLI script:

```bash
# Non-interactive CLI syntax:
npm run create-instructor -- "Prof. Ada Lovelace" "ada@classcast.dev" "SecurePass123!" "Quantum Computing Chair"

# Or run interactively (prompts for name, email, password):
npm run create-instructor
```

---

## 8. Starting the Application

### Development Mode (Concurrent Server + Vite Client)
```bash
npm run dev
```
- **Frontend:** `http://localhost:5173` (with Vite API proxy to port 5001)
- **Backend API:** `http://localhost:5001/api`

### Production Build & Startup
```bash
# 1. Build the React frontend with Vite:
npm run build

# 2. Start the Express production server (serves React build and API on port 5001):
npm start
```
- Production Application URL: `http://localhost:5001`

---

## 9. Two-Browser Walkthrough: Registration to Roster Flow

This walkthrough verifies the most critical requirement: **a real-time registration-to-roster flow across separate browser sessions without instructor re-login**.

1. **Browser 1 (Instructor Session):**
   - Open `http://localhost:5173` (or `http://localhost:5001`).
   - Click **Sign In** and select **Dr. Elena Vance** (`elena@classcast.dev` / `Password123!`).
   - On the Instructor Dashboard, click the featured course **"Distributed Systems: Consensus & Fault Tolerance"**.
   - Navigate to the **Students** tab.
   - Observe the current roster: *Liam Chen* and *Sophia Morales* are listed. **Alex Rivera is not present**.

2. **Browser 2 (Student Session - Incognito or Separate Browser):**
   - In a private/incognito window, navigate to `http://localhost:5173`.
   - Click **Sign In** and select **Alex Rivera** (`alex@classcast.dev` / `Password123!`).
   - Navigate to the **Courses Catalog** (`/catalog`) or platform home.
   - Click **Inspect** on **"Distributed Systems: Consensus & Fault Tolerance"**.
   - Notice the status: **Register for course**.
   - Click **"Register for course"**.
   - Instant confirmation appears with a **"Start learning"** button. The course is immediately persisted in MongoDB and appears under Alex's **My Learning** dashboard.

3. **Browser 1 (Instructor Session):**
   - Return to Dr. Elena Vance's browser window (or simply refocus the tab).
   - Click the **Refresh** button on the **Students** tab.
   - **Verification:** **Alex Rivera immediately appears in the roster** with:
     - Name: `Alex Rivera`
     - Email: `alex@classcast.dev`
     - Registration Date: Current timestamp
     - Lessons Completed: `0 of 5`
     - Progress: `0%`
     - Last Activity: `Not started`
   - Click on Alex Rivera to inspect his detailed coursework drawer (shows 0 completed lessons, no submissions, and no quiz attempts).

4. **Complete the Learning & Grading Loop:**
   - In Browser 2 (Alex), click **"Start learning"** to open the Lesson Player.
   - Read Lesson 1 and click **"Mark complete"** (progress updates to `1 of 5 (20%)`).
   - Click the **Tasks** tab, open the Raft assignment, write a solution, and submit.
   - Click the **Quizzes** tab, take the Consensus Quiz, confirm submission, and receive instant score review.
   - In Browser 1 (Elena), open the **Assignments** tab, view submissions for the Raft assignment, award marks (e.g., `94/100`), write feedback, and click **Return Grade**.
   - In Browser 2 (Alex), open `/student/grades` to verify personal grade and returned feedback.

---

## 10. Security & Permission Verification

1. **Unenrolled Lesson Protection:**
   - Attempting to query `/api/enrollments/course/:courseId` without an active enrollment returns `403 Forbidden` (`Access denied. You must be enrolled in this course`).
2. **Instructor Course Isolation:**
   - If *Marcus Sterling* attempts to view or modify *Dr. Elena Vance's* course workspace (`/api/courses/instructor/workspace/:courseId`), the server returns `403 Forbidden` (`Access denied. You do not own this course`).
3. **Student Privacy Protection:**
   - The `/api/enrollments/instructor/:courseId/roster` and `/api/gradebook/instructor/:courseId` endpoints strictly require the `requireInstructor` and `requireCourseOwner` middlewares. Students never receive class rosters or classmates' personal details.

---

## 11. Mobile Spot-Check Checklist

- [x] **Navigation:** Hamburger menu expands into a responsive glass drawer with working links.
- [x] **Split Hero:** Headlines scale smoothly from desktop display type to mobile screens; learning workspace preview card stacks below hero copy.
- [x] **Bento Grid:** 3-column bento collapses into a clean, padded single column without horizontal overflow.
- [x] **Curriculum Data Table:** Wrapped in a responsive horizontal scroll container with fixed cell padding.
- [x] **Lesson Player:** Features a collapsible mobile drawer for the curriculum sidebar via the "Curriculum" toggle button.
- [x] **Reduced Motion:** Fully complies with `prefers-reduced-motion` to disable animations and render immediate final values for sensitive users.
