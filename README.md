<<<<<<< HEAD
# AI Career Copilot 🚀

> AI-powered resume analyzer that scores ATS compatibility, matches job descriptions, rewrites weak bullet points using Gemini AI, and exports optimized PDFs.

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

---

## 📌 Overview

**AI Career Copilot** is a full-stack SaaS application that helps job seekers improve their resumes using AI. Users upload their resume, paste a job description, and receive instant AI-powered feedback — including an ATS compatibility score, keyword gap analysis, section-by-section feedback, and AI-rewritten bullet points. The app also exports a polished, optimized PDF ready to submit.

**Live Demo:** [your-app.vercel.app](https://ai-career-copilot-tqs7.vercel.app/)

---

## 📸 Screenshots

### Landing Page
![Landing](public/screenshots/landing.png)

### Dashboard
![Dashboard](public/screenshots/dashboard.png)

### Results Page
![Results](public/screenshots/results.png)

### AI Rewriter
![Rewriter](public/screenshots/rewriter.png)

### Monitoring
![Monitoring](public/screenshots/monitoring.png)

---

## ✨ Features

### Core
- 📄 **Resume Upload** — Drag & drop PDF or DOCX files with server-side text extraction
- 🎯 **ATS Score** — Animated semicircle gauge showing ATS compatibility (0–100)
- 🔍 **Job Description Matching** — Paste a JD to get keyword gap analysis and match score
- 📊 **Section Breakdown** — Accordion feedback for Summary, Experience, Skills, Education
- ⚠️ **Experience Gap Analysis** — Side-by-side comparison of required vs your experience
- 🎓 **Education Match** — Checks if your education meets job requirements

### AI-Powered
- ✍️ **AI Resume Rewriter** — Rewrites weak bullet points into strong, quantified ones
- 📥 **PDF Export** — Downloads a complete optimized resume as a formatted PDF
- 🔄 **Fallback Model Chain** — Automatically tries multiple Gemini models if one fails

### Production-Ready
- 📈 **Score History Chart** — Track ATS score improvement over time with Recharts
- 🛡️ **Rate Limiting** — Upstash Redis prevents API abuse (5 requests/10 min per user)
- ✅ **Zod Validation** — All API inputs validated with strict schemas
- 🔒 **File Security** — Server-side file type and size validation
- 📡 **AI Monitoring Dashboard** — Tracks Gemini requests, response times, success rates

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Server Components, API Routes) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Authentication** | Clerk |
| **Database** | PostgreSQL (Neon) + Prisma ORM |
| **AI** | Google Gemini API (gemini-2.5-flash with fallback chain) |
| **File Parsing** | unpdf (PDF) + mammoth (DOCX) |
| **Charts** | Recharts |
| **PDF Export** | @react-pdf/renderer |
| **Rate Limiting** | Upstash Redis |
| **Form Validation** | Zod + React Hook Form |
| **Deployment** | Vercel |

---

## 🏗️ Architecture

```
User uploads resume (PDF/DOCX)
        ↓
Server-side text extraction (unpdf / mammoth)
        ↓
Gemini AI analysis with structured JSON prompt
        ↓
Results saved to PostgreSQL via Prisma
        ↓
Results page: ATS gauge, keyword tags, accordion feedback
        ↓
Optional: AI rewriter → PDF export
```

**Key architectural decisions:**
- Files processed directly via FormData — no external file storage needed since we only need extracted text
- Gemini API calls use a **fallback model chain** — if one model is overloaded, automatically tries the next
- Prisma client uses **singleton pattern** to prevent multiple DB connections during Next.js hot reloads
- All AI responses enforced as **structured JSON** for reliable parsing and display

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/        # Core AI analysis endpoint
│   │   ├── rewrite/        # AI resume rewriter endpoint
│   │   └── download-resume/ # PDF export endpoint
│   ├── dashboard/
│   │   ├── analyze/        # Upload page
│   │   ├── results/[id]/   # Results page
│   │   └── admin/          # AI monitoring dashboard
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── ResumeRewriter.tsx  # AI rewriter with before/after
│   ├── ScoreHistoryChart.tsx # Recharts line chart
│   ├── MonitoringCharts.tsx  # Bar chart for admin
│   ├── DashboardNav.tsx    # Active-state navbar
│   └── UserNav.tsx         # Clerk user button
├── lib/
│   ├── prisma.ts           # Prisma singleton
│   ├── ratelimit.ts        # Upstash rate limiters
│   ├── validation.ts       # Zod schemas
│   ├── aiLogger.ts         # AI request logger
│   └── actions/
│       ├── user.ts         # Clerk → DB user sync
│       └── analysis.ts     # Data fetching actions
└── prisma/
    └── schema.prisma       # DB schema
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18+
- PostgreSQL database (Neon recommended — free tier)
- Clerk account (free)
- Google Gemini API key (free tier)
- Upstash Redis (free tier)

### Installation

**1. Clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/ai-career-copilot.git
cd ai-career-copilot
```

**2. Install dependencies:**
```bash
npm install
```

**3. Set up environment variables:**

Create a `.env` file in the root:
```env
# Database
DATABASE_URL="postgresql://..."

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Gemini AI
GEMINI_API_KEY=...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

**4. Run database migrations:**
```bash
npx prisma migrate dev
npx prisma generate
```

**5. Start the development server:**
```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 📊 Database Schema

```prisma
User        # Synced from Clerk on first login
Resume      # Stores file metadata + extracted text
Analysis    # AI results: scores, feedback, keywords
AILog       # Tracks every Gemini API call for monitoring
```

---

## 🔐 Security

- **Rate limiting** — 5 analyze / 3 rewrite / 5 download requests per 10 minutes per user
- **File validation** — Server-side type checking (PDF/DOCX only) and 4MB size limit
- **Input validation** — All API inputs validated with Zod schemas before processing
- **Auth protection** — All dashboard routes protected by Clerk middleware
- **Environment variables** — All secrets stored in `.env`, never committed to git

---

## 🎯 What I Learned

- Designing a **production-ready Next.js 15** application with App Router, Server Components, and API Routes
- Integrating **Gemini AI** with structured JSON prompts and building a fallback model chain for reliability
- Implementing **rate limiting** with Upstash Redis to control AI API costs
- **Database design** for a multi-entity SaaS app (users, resumes, analyses, logs)
- Building **AI monitoring** to track request success rates, response times, and model usage
- Server-side **PDF/DOCX text extraction** without external file storage services

---

## 📄 License

MIT License — feel free to use this project as inspiration for your own portfolio.

---

## 🤝 Connect

Built by **[Your Name]**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/monisha-yadav-425212310?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/monishay20)

---

⭐ **If you found this project helpful, please give it a star!**
=======
# AI-Career-Copilot
AI-powered resume analyzer that scores ATS compatibility, matches job descriptions, rewrites weak bullet points using Gemini AI, and exports optimized PDFs — built with Next.js 15, PostgreSQL, and Clerk auth.
>>>>>>> e67d7888457685b8f49c1bb8ec1d089ad615a118
