# Kaif Dashboard

Personal dashboard — ek hi site/app me:

- 🏠 **Home widgets**: clock, total balance, is mahine ki income/expense, next reminder, pending tasks, quick actions
- 💰 **Income & Expense tracker**: entries add/delete, month filter, 6 mahine ka bar graph, category-wise donut chart (animated)
- ⏰ **Reminders**: date/time wale reminders, time aane par toast + system notification (app/page khula ho)
- ✅ **Tasks**: simple to-do list
- 💬 **WhatsApp chat**: mobile number daalo → seedha WhatsApp chat khul jayegi (country code select), recent chats, call button
- 🌐 **Language**: English, हिन्दी, Hinglish (header me select karo)
- 🌗 Dark / Light theme, ⛶ Full screen
- 📴 **Offline**: internet na ho tab bhi chalta hai (service worker + localStorage)
- 📲 **Installable**: phone/PC par "Install" karo, app ki tarah chalegi
- ☁️ **Supabase sync** (optional): same sync code se sab devices par same data
- 💾 Backup export / import (JSON)

Koi build step nahi — plain HTML/CSS/JS. Vercel par seedha deploy ho jata hai.

---

## Files

| File | Kaam |
|---|---|
| `index.html` | Poori UI (sab sections) |
| `css/style.css` | Design + animations (transform/opacity only, smooth) |
| `js/app.js` | Main logic: widgets, tracker, reminders, tasks, chat, settings |
| `js/i18n.js` | Hindi / English / Hinglish strings |
| `js/store.js` | Local data (localStorage, offline-first) |
| `js/sync.js` | Supabase sync (REST, SDK nahi chahiye) |
| `js/charts.js` | Bar & donut chart (canvas, dependency nahi) |
| `sw.js` | Service worker — offline support |
| `manifest.webmanifest` | App install + full-screen settings |
| `api/config.js` | Vercel function — env vars se Supabase config browser ko deta hai |
| `supabase/schema.sql` | Database tables + policies |

---

## 1. Local me chalana

Bas `index.html` ko kisi static server se kholo:

```bash
npx serve .          # ya: python3 -m http.server 3000
```

Local par `/api/config` nahi chalega, isliye app **local-only** mode me chalegi (sync off). Ye bilkul theek hai.

## 2. Supabase setup (sync ke liye, optional)

1. [supabase.com](https://supabase.com) par naya project banao.
2. **SQL Editor** kholo → `supabase/schema.sql` ka poora content paste karke **Run** karo.
3. **Project Settings → API** se ye 2 cheezein copy karo:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   
   ⚠️ `service_role` key kabhi mat use karna.

## 3. Vercel par deploy + env

1. GitHub repo ko Vercel me import karo (Framework: **Other** / koi preset nahi — ye static site hai).
2. **Settings → Environment Variables** me add karo:
   - `SUPABASE_URL` = `https://xxxx.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJ...`
3. **Deploy** karo. Env change kiya to **Redeploy** karna zaroori hai.

## 4. Sync kaise karein

- Settings → **Cloud sync** me ek **sync code** likho (jaise `kaif-private-2026`). Ye secret hai.
- Har device par same code daalo → same data dikhega.
- Offline kaam karo, internet aane par apne aap sync hota hai (har 1 minute + har change ke baad).

## 5. Phone/PC par app ki tarah install

- **Android/Chrome / PC Chrome/Edge**: address bar ka "Install" icon ya Settings → "Install app".
- **iPhone (Safari)**: Share button → **Add to Home Screen**.
- Installed app full-screen me khulegi. Settings me bhi ⛶ button hai.

---

## Limitations (ईमानदारी से)

- **Reminder notification** tabhi aayega jab app/browser tab khula ya background me chal raha ho. Band app ke liye proper push notification ke liye Firebase/OneSignal jaisi service chahiye — bata dena, add kar dunga.
- **Security**: abhi sync ka access "sync code" par based hai aur RLS policy `anon` ko open rakhti hai (personal use ke liye). Public sharing ke liye Supabase **Auth** (email/Google login) add karke policies ko `auth.uid()` se restrict karna chahiye.
- **144Hz smoothness**: animations `transform`/`opacity` par bani hain (GPU), `prefers-reduced-motion` me band ho jati hain. Asli 144Hz display par smoothness aapke device/browser par depend karti hai.
- WhatsApp chat ke liye number WhatsApp par registered hona chahiye.

## Updating the offline cache

Jab bhi koi CSS/JS/HTML file badle, `sw.js` me `VERSION` string badal do (jaise `kaif-v3`), taaki users ko naya version mile.
