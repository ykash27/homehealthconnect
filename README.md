# HomeHealth Connect — Deploy Guide

## Go live in 5 minutes with Vercel (free)

### Option A: Drag & Drop (easiest)
1. Go to **vercel.com** and sign up (free)
2. Click **"Add New Project"**
3. Drag the entire `hhc-deploy` folder into the Vercel upload area
4. Click **Deploy** — your site is live instantly at a `.vercel.app` URL

### Option B: GitHub (recommended for ongoing updates)
1. Create a free account at **github.com**
2. Create a new repository called `homehealthconnect`
3. Upload all files from this folder to the repository
4. Go to **vercel.com** → Add New Project → Import from GitHub
5. Select your repository → Deploy

### Connect your custom domain
1. Buy a domain at **namecheap.com** (e.g., homehealthconnect.io ~$12/year)
2. In Vercel dashboard → your project → Settings → Domains
3. Type your domain → Vercel gives you 2 DNS records to copy
4. In Namecheap → Advanced DNS → paste those records
5. Wait 10–30 minutes → your site is live at your custom domain

---

## Files in this package

| File | Purpose |
|------|---------|
| `index.html` | Full website + embedded React app (220 KB) |
| `app.js` | React app source (used by index.html) |
| `vercel.json` | Vercel config: routing + security headers |
| `README.md` | This file |

## What's included

- Full marketing website (hero, features, login, roles, pricing, HIPAA, CTA, footer)
- All 5 working portals: Super Admin, Agency Admin, Staffing, Clinician, Patient
- Dark/light theme toggle
- Drag-and-drop weekly calendar
- 73-exercise HEP catalog with photo diagrams
- AI fax scanner (demo mode)
- Patient file directory
- Biweekly/monthly invoicing
- Multi-agency clinician view
- Digital referral map
- Frequency scheduling modal (2w4, 3w6 codes)

## Contact

Yehudakashanian@gmail.com · 323-388-3090

