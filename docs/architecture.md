Folder Structure (Simplified)

job-importer/
├── client/                  # Next.js frontend
│   └── app/                 # Pages (Jobs, Dashboard)
│   └── components/          # Reusable UI components
│   └── socket.js            # Socket.IO client setup
│   └── layout.jsx           # Toastify + layout
│
├── server/                  # Express backend
│   ├── index.js             # Express server entry point
│   ├── routes/              # API routes (import-logs, jobs)
│   ├── controllers/         # Route handlers
│   ├── jobs/                # BullMQ queue & worker
│   ├── services/            # Job fetcher from XML API
│   ├── models/              # Mongoose models: Job, ImportLog
│   └── config/              # DB and Redis configs
│
├── .env                     # Environment variables
├── package.json
└── README.md

⚙️ High-Level System Architecture

        ┌──────────────────────────────┐
        │         Frontend (Next.js)   │
        │    - Dashboard page          │
        │    - Jobs listing page       │
        │    - Uses fetch + socket.io  │
        └─────────────┬────────────────┘
                      │
                      ▼
        ┌──────────────────────────────┐
        │       Express Backend        │
        │  - Routes: /import-logs      │
        │            /import-jobs      │
        │            /jobs?page=x      │
        │  - Emits socket events       │
        └─────────────┬────────────────┘
                      │
                      ▼
     ┌──────────── MongoDB Atlas ─────────────┐
     │ - Job collection                       │
     │ - ImportLog collection                 │
     └────────────────────────────────────────┘

                      ▲
                      │
        ┌──────────────────────────────┐
        │      BullMQ (Redis Queue)    │
        │ - Scheduler triggers import  │
        │ - Worker saves data to DB    │
        └──────────────────────────────┘
                      ▲
                      │
        ┌──────────────────────────────┐
        │     External XML Feeds       │
        │     - jobicy.com             │
        │     - higheredjobs.com       │
        └──────────────────────────────┘