# Loro

Loro is an early-stage trauma recovery support app focused on **calm, safety, and user empowerment**.  
It offers grounding tools, journaling with AI reflections, a mood tracker with local persistence, and an **encrypted Safety Plan** stored only on your device.

> ⚠️ Loro is **not a substitute for professional mental health care**.  
> If you are in crisis, call or text **988** (U.S.) or your local emergency number.

---

## ✨ Features

- **Journal & Reflection**
  - Write notes and receive an AI-supported reflection (OpenAI).
  - Handles loading/errors cleanly, no data persisted on the server.
- **Mood Tracker**
  - Daily check-ins for **mood**, **arousal**, **sleep**, and free-form notes.
  - Local persistence (90–365 days).
  - 7-day **sparkline** visualization.
  - **CSV export** (90/365 days) for sharing with a clinician or personal records.
- **Safety Plan (Encrypted)**
  - Client-side encryption using **AES-GCM** and **PBKDF2-SHA256**.
  - **Passphrase** required to unlock; passphrase is never stored.
  - Encrypted blob saved to `localStorage` on your device only.
  - Inline error if new passphrase is **under 4 characters**.
- **Calm & Breathe (scaffolding)**
  - Space for guided breathwork and downregulation tools (to be expanded).
- **Privacy**
  - `.env` is ignored by Git; API keys never committed.
  - No Safety Plan data leaves your device.

---

## 🧩 Tech Stack

- **Client:** React + Vite  
- **Server:** Node.js + Express  
- **AI:** OpenAI API (`gpt-4o-mini` default)  
- **Crypto:** WebCrypto (AES-GCM, PBKDF2-SHA256)

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+ (includes npm)

### Clone
```bash
git clone git@github.com:fairwjl/loro-app.git
cd loro

Test: PR protection check — no code changes.
