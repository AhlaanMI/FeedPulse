FeedPulse

AI-Powered Product Feedback Platform

How This Works
• You will build a single full-stack web application from scratch over 5 days.
• Push all your code to a public GitHub repository and submit the link.
• We evaluate code quality, product thinking, and how you use AI features — not just if it runs.
• Read every requirement carefully. Prioritise Must-Have features first.

The Project
FeedPulse — AI-Powered Product Feedback Platform
FeedPulse is a lightweight internal tool that lets teams collect product feedback and feature requests from users,
then uses Google Gemini AI to automatically categorise, prioritise, and summarise them — giving product teams
instant clarity on what to build next.
Why this project?
• It covers the full stack — a real frontend, a real API, a real database, and a real AI integration.
• It is a product that teams actually need. This is not a to-do app.
• It tests your ability to think like an engineer and a product person at the same time.
• The AI integration (Gemini) adds genuine complexity without being overwhelming.

Suggested Tech Stack
TypeScript is strongly preferred — use plain JavaScript only if you are not comfortable with TS.
Technology Purpose
Next.js 14+ Frontend — App Router, React Server Components, pages & UI
Node.js + Express Backend API — REST endpoints, middleware, business logic
Google AI Studio Free Gemini API — AI categorisation, summarisation & priority scoring
MongoDB + Mongoose Database — store feedback, users, tags, and AI analysis results
TypeScript Preferred for both frontend and backend. JS is acceptable if needed.
Any CSS Framework Tailwind CSS, ShadCN, Chakra UI, MUI, or plain CSS — your choice
Google AI Studio — Free Tier: Sign up at aistudio.google.com and generate a free API key (no credit card required). Use the
gemini-1.5-flash model — it is free, fast, and more than capable for this task.

Suggested Project Structure
You are free to organise your project however it makes sense to you. The structure below is a guide, not a rule.
feedpulse/
├── frontend/ ← Next.js app
│ ├── app/
│ │ ├── page.tsx (Landing / Submit Feedback)
│ │ ├── dashboard/page.tsx (Admin Dashboard)
│ │ └── api/ (Next.js API routes — optional)
│ └── components/
│
├── backend/ ← Node.js + Express API
│ ├── src/
│ │ ├── routes/
│ │ ├── controllers/
│ │ ├── models/ (Mongoose schemas)
│ │ └── services/
│ │ └── gemini.service.ts ← AI integration
│ └── .env
│
├── docker-compose.yml ← Bonus
├── README.md ← Required
└── .gitignore

Core Features to Build
Build every Must Have feature. Nice to Have features improve your score. Reach features are extras that show
initiative.

Requirement 1 — Feedback Submission
The public-facing form anyone can use to submit feedback.
# Feature / Requirement Priority
1.1 A clean public page where users can submit feedback without signing in Must Have
1.2 Form fields: Title, Description (textarea), Category (Bug / Feature Request /
Improvement / Other), Name (optional), Email (optional)

Must Have
1.3 Client-side form validation — no empty titles, minimum 20 characters in description Must Have
1.4 On submit, POST to your Node.js backend API and save to MongoDB Must Have
1.5 Success and error states are shown to the user after submission Must Have
1.6 Character counter on the description field Nice to Have
1.7 Rate limiting — prevent the same IP from submitting more than 5 times per hour. Nice to Have

Requirement 2 — AI Analysis with Gemini
The heart of the product — automated intelligence on every submission.
Gemini Integration Guide: When a new feedback submission is saved to MongoDB, call Gemini immediately (or via a queue). Send
the title and description to Gemini and ask it to return a JSON object. Use a structured prompt: "Analyse this product feedback. Return
ONLY valid JSON with these fields: category, sentiment, priority_score (1-10), summary, tags." Save the Gemini response fields back
onto the feedback document in MongoDB.
Gemini Response Schema (save all fields to MongoDB):
{
"category": "Feature Request", // Bug | Feature Request | Improvement | Other
"sentiment": "Positive", // Positive | Neutral | Negative
"priority_score": 8, // 1 (low) to 10 (critical)
"summary": "User wants dark mode in the dashboard settings.",
"tags": ["UI", "Settings", "Accessibility"]
}

# Feature / Requirement Priority
2.1 Call the Gemini API when a new feedback item is submitted Must Have
2.2 Store category, sentiment, priority_score, summary, and tags from Gemini onto the
feedback document

Must Have
2.3 Handle Gemini API errors gracefully — feedback should still be saved even if AI fails Must Have
2.4 Show a badge on each feedback card indicating the AI-detected sentiment Must Have
2.5 Generate a weekly/on-demand AI summary: 'Top 3 themes from the last 7 days of
feedback.'

Nice to Have
2.6 Allow admin to manually re-trigger AI analysis on any submission Nice to Have

Requirement 3 — Admin Dashboard
Protected view for managing and reviewing all feedback.
# Feature / Requirement Priority
3.1 Protected dashboard page — only accessible after logging in with a hardcoded
admin email + password (no full auth system needed)

Must Have

3.2 Table or card list of all feedback submissions with: title, category, sentiment badge,
priority score, date

Must Have
3.3 Filter feedback by category (Bug / Feature Request / Improvement / Other) Must Have
3.4 Filter feedback by status (New / In Review / Resolved) Must Have
3.5 Admin can update the status of any feedback item (New → In Review → Resolved) Must Have
3.6 Sort feedback by date, priority score, or sentiment Nice to Have
3.7 Search feedback by keyword (searches title + summary) Nice to Have
3.8 Stats bar at the top: total feedback, open items, average priority score, most
common tag

Nice to Have
3.9 Paginate results — show 10 items per page Nice to Have

Requirement 4 — REST API (Node.js + Express)
Clean, well-structured API that the frontend consumes.
Required API Endpoints:
POST /api/feedback → Submit new feedback
GET /api/feedback → Get all feedback (admin, supports filters + pagination)
GET /api/feedback/:id → Get single feedback item
PATCH /api/feedback/:id → Update status (admin only)
DELETE /api/feedback/:id → Delete feedback (admin only)
GET /api/feedback/summary → Get AI-generated trend summary
POST /api/auth/login → Admin login (returns a session token)


# Feature / Requirement Priority
4.1 All endpoints return consistent JSON: { success, data, error, message } Must Have
4.2 Use Mongoose schemas with proper field types and validations Must Have
4.3 Protect admin routes using a simple JWT or session token middleware Must Have
4.4 Use environment variables for MongoDB URI, Gemini API Key, and JWT secret Must Have
4.5 Input sanitisation — reject obviously bad input before saving to DB Must Have
4.6 Return proper HTTP status codes (200, 201, 400, 401, 404, 500) Must Have
4.7 Separate route files, controller files, and model files — do not put all code in one file. Must Have

Requirement 5 — MongoDB Schema & Data Design
Think about how you model the data.
Minimum Required Schema — Feedback Collection:
Feedback {
title: String (required, max 120 chars)
description: String (required, min 20 chars)
category: Enum (Bug | Feature Request | Improvement | Other)
status: Enum (New | In Review | Resolved) default: New
submitterName: String (optional)
submitterEmail: String (optional, validate email format)
// AI fields — populated after Gemini responds
ai_category: String
ai_sentiment: String (Positive | Neutral | Negative)
ai_priority: Number (1–10)
ai_summary: String
ai_tags: [String]
ai_processed: Boolean default: false
createdAt: Date (auto)
updatedAt: Date (auto)
}
# Feature / Requirement Priority
5.1 Feedback schema matches the spec above with all required fields and types Must Have
5.2 Add MongoDB indexes on: status, category, ai_priority, and createdAt for query
performance

Must Have
5.3 Timestamps enabled (createdAt, updatedAt auto-managed) Must Have
5.4 If adding auth for admin, create a separate User collection — do not store admin
credentials in .env only.

Requirement 6 — GitHub Repository & README
How you present your work is part of the assessment.
# Feature / Requirement Priority
6.1 Push all code to a public GitHub repository Must Have
6.2 README.md must include: project description, tech stack, how to run locally (step
by step), environment variables needed, and screenshots

Must Have
6.3 .gitignore must include: node_modules, .env, build output folders Must Have
6.4 Meaningful commit messages — not 'update' or 'fix'. Show your work history. Must Have
6.5 At least 5 commits spread across the 3 days — not one giant commit at the end Must Have
6.6 The README includes a short note on what you would build next if you had more
time

Nice to Have
6.7 Use GitHub branches — develop on a feature branch and merge to main Nice to Have