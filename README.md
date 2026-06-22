# NetPulse — Network Monitoring & Offline Reporting App 📡

> A real-time network health monitoring dashboard with offline-first support, automated reporting, and live status tracking — built with TypeScript.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Click%20Here-brightgreen)](https://network-reporting-offline-app.vercel.app)
[![TypeScript](https://img.shields.io/badge/Built%20with-TypeScript-3178C6)](https://github.com/shaiknagurbasha2002/netpulse-app)

---

## What Makes This Different

Most network tools require constant connectivity. NetPulse is built **offline-first** — it caches data locally, queues reports when disconnected, and syncs automatically when back online. Key differentiators:

- **Offline-first PWA architecture** — works fully without internet, syncs when reconnected
- **Automated report generation** — produces downloadable network health reports on demand
- **Real-time status dashboard** — live indicators for network health, latency, and uptime
- **TypeScript throughout** — fully typed codebase for reliability and maintainability

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript |
| Frontend | React / Next.js |
| Offline Support | Service Workers, IndexedDB |
| Styling | Tailwind CSS |
| Deploy | Vercel |

---

## Features

- 📊 **Live Dashboard** — real-time network status visualization
- 📴 **Offline Mode** — full functionality without internet connection
- 📝 **Automated Reports** — generate and download network health summaries
- 🔄 **Auto-sync** — queued data syncs automatically when connectivity is restored
- 📱 **Responsive Design** — works on desktop and mobile

---

## Screenshots

> Add a demo GIF or screenshots of the dashboard here

---

## Running Locally

```bash
git clone https://github.com/shaiknagurbasha2002/netpulse-app.git
cd netpulse-app
npm install
npm run dev
# App runs on http://localhost:3000
```

---

## Architecture Decision: Why Offline-First?

Network monitoring tools are most needed precisely when networks are unreliable. Building offline-first using Service Workers and IndexedDB ensures the app remains functional during outages — which is when it matters most. Data is queued locally and pushed to the server once connectivity is restored, avoiding data loss.

---

## Roadmap / Upcoming Features

- [ ] AI-powered anomaly detection — flag unusual network patterns automatically
- [ ] WebSocket integration for live push updates (no polling)
- [ ] Email alerts when network health drops below a threshold
- [ ] Multi-device report comparison dashboard

---

## Author

**Nagur Basha Shaik** — MS CS @ Montclair State University  
[LinkedIn](https://linkedin.com/in/YOUR-LINKEDIN) · [GitHub](https://github.com/shaiknagurbasha2002)
