# Lottie's Worry Board 🌿

A soft, mobile-first place for Lottie to put worries down, with Brad on the other side responding with promises. Built on CBT principles — the Worry Tree, productive vs unproductive worry, externalising thoughts, and worry postponement — but with the clinical bits kept invisibly under the hood.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind · Framer Motion · Supabase (Postgres + RLS) · Vercel.

**Auth:** None. The app is gated by the unguessable Vercel URL only. Suitable for personal use; do not put sensitive data in here.

---

## What's in here

**Mode toggle** at the top of every main view switches between Lottie and Brad. Defaults to Lottie. No login.

**For Lottie:**
- Capture flow with title, free text, feelings, optional emotion chips, and a 1–10 intensity slider
- The Worry Tree gate (*"Is there anything that could actually be done about this?"*) — actionable worries get an action plan; non-actionable ones go to the **Set Down** pile
- A board where **Brad's promises sit at the top** (because she likes knowing there's a plan)
- Worries auto-flip to "Brad's seen it" the moment Brad opens them (so the gap between writing and being seen disappears)
- On resolve: prompt to re-rate intensity, giving her felt evidence that things do shift

**For Brad:**
- Same URL, just toggle to Brad mode
- Sorted by what needs you most
- Add a "Brad's Promise" with optional ETA per worry
- Mark resolved or delete; archive view for done + set-down items

**Sausage dog companion:**
- SVG-animated, multiple moods (idle, wag, tilt, curl, peek, happy)
- Rotating lines that **reflect and validate, never minimise**
- Dismissible, hideable from settings
- Unnamed by default — Lottie names him from settings

---

## Setup (one-time)

### 1. Supabase

You're using a shared Supabase project. All tables are prefixed `lwb_` to coexist non-destructively.

1. In the Supabase SQL editor, run `supabase/migrations/0001_lwb_initial.sql`.
   - Creates `lwb_worries`, `lwb_settings` (singleton), `lwb_set_updated_at()` function
   - Enables RLS with **permissive** policies (anon role has full CRUD)
   - Idempotent; if upgrading from a previous auth-based version, it will safely drop the old `owner_id` columns and policies
2. In **Project settings → API**, grab your project URL and `anon` public key.

That's it. No auth user to create.

### 2. Local dev

```bash
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

Open http://localhost:3000 — it'll redirect to `/lottie` (the default mode).

### 3. Deploy

```bash
git init
git add .
git commit -m "initial: Lottie's Worry Board"
git remote add origin <your-github-repo-url>
git push -u origin main
```

In Vercel:
1. **Import project** from GitHub
2. Add the two env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) under **Settings → Environment Variables**
3. Deploy

### 4. Add to Lottie's iPhone home screen

Open the Vercel URL in Safari → Share → Add to Home Screen. The PWA manifest gives it an app-like feel with no browser chrome.

---

## Routing

| Path            | What it shows                                    |
|-----------------|--------------------------------------------------|
| `/`             | Redirects to `/lottie`                           |
| `/lottie`       | Lottie's board (default mode)                    |
| `/lottie/new`   | Capture flow (write a worry)                     |
| `/brad`         | Brad's view                                      |
| `/settings`     | Dog name, worry time, show/hide companion        |

The mode toggle at the top of `/lottie` and `/brad` navigates between them with one tap.

---

## File map

```
src/
├── app/
│   ├── layout.tsx              # fonts (Fraunces + DM Sans), PWA meta
│   ├── globals.css             # theme variables, slider styling, paper texture
│   ├── page.tsx                # / → redirect to /lottie
│   ├── lottie/
│   │   ├── page.tsx            # Lottie's board (server)
│   │   ├── LottieBoardClient.tsx
│   │   └── new/page.tsx        # capture flow
│   ├── brad/
│   │   ├── page.tsx
│   │   └── BradViewClient.tsx
│   └── settings/
│       ├── page.tsx
│       └── SettingsClient.tsx
├── components/
│   ├── SausageDog.tsx          # the companion
│   └── ModeToggle.tsx          # the persistent Lottie/Brad pill toggle
├── lib/
│   ├── actions.ts              # all server actions (CRUD)
│   ├── types.ts                # Worry/Settings types + dog dialogue
│   └── supabase/
│       ├── client.ts
│       └── server.ts
└── supabase/migrations/
    └── 0001_lwb_initial.sql    # schema, idempotent, no auth deps
```

---

## CBT mechanics, where they live

| Technique                         | Where it lives in the app                                                                 |
|-----------------------------------|------------------------------------------------------------------------------------------|
| **Externalising thoughts**        | The whole capture flow exists for this; nothing forces resolution                        |
| **Worry Tree**                    | Step 2 of capture: actionable → action plan; not actionable → set down                   |
| **Productive vs unproductive**    | Same gate; framing makes it okay for the answer to be "no"                               |
| **Action planning**               | "What would help shift it?" + Brad's Promise pairs an actionable worry with a plan       |
| **Felt-evidence reinforcement**   | On resolve, re-rate intensity. Lottie sees `8 → 2` on her board, building real evidence  |
| **Worry postponement**            | Optional Worry Time toggle in settings                                                   |
| **Self-compassion / non-judgement** | Dog dialogue, copy throughout, soft palette, no streaks/scores/gamification             |
| **"Set down" rather than delete** | Hypothetical worries go to a soft archive, consciously placed                            |

---

## CBT exercises

Layered on top of the worry tree, all skippable, none gamified, none stored unless you write something:

| Tool | What it does | Lives in |
|------|--------------|----------|
| **Breathe** (Quick Tools) | 4-4-4-4 box breathing with a soft pulsing circle, 4 cycles default | `src/components/exercises/BreatheModal.tsx` |
| **Ground** (Quick Tools) | The 5-4-3-2-1 senses script, one step at a time, every text input optional | `src/components/exercises/GroundModal.tsx` |
| **Reflect** (Quick Tools + per-worry) | Seven Socratic questions; saves any answers you write to `lwb_reflections` | `src/components/exercises/ReflectFlow.tsx`, `src/components/exercises/ReflectPickerModal.tsx` |
| **Kind act** (offered after set-down or capture-burst) | Pick one tiny act of self-care, then a 30s "I'll wait" beat | `src/components/exercises/KindActModal.tsx` |
| **Quick Tools strip** | Three-button row directly under the chrome of Lottie's board | `src/components/QuickTools.tsx` |
| **Dog offers** (contextual nudges) | Conservative rules surface a tool at the right moment | `src/lib/dogOffers.ts`, `src/components/DogOffer.tsx` |

When dog offers fire (all conservative, all dismissable with equal weight):

- Capturing a worry at intensity ≥ 8 → offered grounding before the worry tree
- 3+ worries logged in the last 60 minutes → soft "want a pause?" banner at the top of the board (in-memory only — no storage)
- After setting a worry down (non-actionable) → offered a small kind act, with a 5-second auto-redirect that cancels if she taps in

Database: `supabase/migrations/0002_lwb_reflections.sql` adds the `lwb_reflections` table (idempotent, anon RLS, FK to `lwb_worries` with `ON DELETE CASCADE`, `worry_id` nullable for standalone reflections).

---

## Security note (worth a read)

There is **no authentication**. The Supabase RLS policies allow the anon role full CRUD on `lwb_` tables. Privacy comes from the unguessable Vercel URL — anyone who knows the URL can read and write the data.

This is fine for a private couple's app, equivalent in risk to a shared private doc. If you ever need to harden it later:
- Add Supabase auth back (single shared user, or proper roles)
- Tighten the RLS policies to require `authenticated` role and check `auth.uid()`
- Or put a Vercel password gate in front of the deployment

---

## Tweaks you might want later

- **Push notifications** for "Brad just promised something" (deliberately not built — no notification overload)
- **Email digest** for Brad: "Lottie added 2 worries today"
- **Recurring worries** detection (gentle "this one keeps coming back")
- **Gentle weekly reflection** ("you set down 3 this week, Brad kept 4 promises")

The schema has room to grow — add columns or new tables with the `lwb_` prefix.

---

Made with care for Lottie.
