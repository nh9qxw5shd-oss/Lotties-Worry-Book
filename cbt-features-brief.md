# Lottie's Worry Board — CBT Features Implementation

You are extending an existing Next.js 15 app called Lottie's Worry Board. The project is a soft, mobile-first worry journal with a Lottie/Brad mode toggle, a sausage dog companion, and a Supabase backend. All Supabase tables use the `lwb_` prefix. There is no auth — RLS policies allow anon full CRUD.

## Context you must read first

Before writing any code, read these files in order to understand the existing patterns:

1. `README.md` — overall architecture and design intent
2. `src/lib/types.ts` — existing types and dog dialogue
3. `src/lib/actions.ts` — server action patterns
4. `src/components/SausageDog.tsx` — the dog component, its mood system, and how `pickLine` works
5. `src/components/ModeToggle.tsx` — the existing toggle pattern (style reference)
6. `src/app/lottie/LottieBoardClient.tsx` — Lottie's main view and section patterns
7. `src/app/lottie/new/page.tsx` — the multi-step capture flow (study how steps animate in/out with framer-motion)
8. `src/app/globals.css` — theme tokens, slider class, paper texture
9. `tailwind.config.ts` — colour palette (cream, ink, rose, sage, honey, lavender)
10. `supabase/migrations/0001_lwb_initial.sql` — schema patterns, RLS approach, idempotency style

**Match the existing visual language exactly.** Soft palette, Fraunces serif for headings, DM Sans for body, rounded-3xl cards, shadow-soft/shadow-warm, generous whitespace, tap targets ≥ 44px. Never introduce a new colour or font. Never use `localStorage` or any browser storage API.

**Match the existing tone exactly.** Dog lines validate, never minimise. Never gamify. Never add streaks, scores, or completion stats. Every CBT exercise must be skippable with equal or greater visual weight on the skip button.

## What you are building

Three phases of CBT features. Build in order. After each phase, stop and run `npx next build` to verify nothing breaks before continuing.

---

## Phase 1: Quick Tools strip (Breathe + Ground)

**Goal:** Add two self-contained guided exercises accessible from the top of Lottie's board, usable without writing a worry.

### 1.1 Component: `src/components/QuickTools.tsx`

A horizontal strip of three buttons under the mode toggle on the Lottie view. Each button: small icon + label, rounded-2xl, white/80 background, shadow-soft. Buttons:

- **Breathe** (icon: a soft circle/lung shape) → opens BreatheModal
- **Ground** (icon: a small anchor or roots) → opens GroundModal
- **Reflect** (icon: a small thought bubble) → opens ReflectModal (built in Phase 2 — for Phase 1, this button is disabled with a faint "coming soon" state)

The strip is responsive — fits three buttons on a single row on a 375px iPhone screen. Use `flex gap-2`.

### 1.2 Component: `src/components/exercises/BreatheModal.tsx`

A full-screen modal (not a sheet) with a calming gradient background (use `from-cream-50 via-lavender-soft/40 to-sage-soft/40`).

**Box breathing flow:**
- 4 seconds inhale → 4 seconds hold → 4 seconds exhale → 4 seconds hold
- A large animated circle in the centre that scales from 1 to 1.4 over the inhale, holds, scales back to 1 over the exhale, holds. Use framer-motion `animate` with a key driven by phase.
- Phase label above the circle in Fraunces serif, large: "Breathe in" / "Hold" / "Breathe out" / "Hold"
- A subtle counter beneath the label (4… 3… 2… 1…)
- Sausage dog appears in the bottom corner in `idle` mood with a one-line message at start: "I'll breathe with you." (use existing SausageDog component)
- Auto-runs for 4 cycles by default, then shows a soft "Done — how do you feel?" screen with two buttons: "Better" / "Same" / "Want another round" (three options, no scoring stored, the buttons just close the modal — the question is purely reflective)
- Big "Close" button always visible at top-right (large tap target, soft styling, never aggressive)

**Important:** The "Close" button is the same visual weight as the start button. She can leave any time without it feeling like quitting.

### 1.3 Component: `src/components/exercises/GroundModal.tsx`

Same modal styling as BreatheModal.

**5-4-3-2-1 grounding flow:**
- One step at a time, animated in with framer-motion (slide from right, like the capture flow)
- Step 1: "Notice 5 things you can see." Free text area, optional. "Next" button.
- Step 2: "4 things you can feel." (touch — chair under you, fabric, temperature)
- Step 3: "3 things you can hear."
- Step 4: "2 things you can smell."
- Step 5: "1 thing you can taste."
- Final: a soft "You're here. You're now." screen with the dog in `curl` mood and the line "Notice — you came back to the room." Single button: "Done."

The text inputs are entirely optional. Each step has a "Skip" button equally weighted to "Next." Some users will use it as pure mindfulness without writing anything.

**Do not save the responses anywhere.** This is a transient exercise. No database writes.

### 1.4 Wire into Lottie's board

Edit `src/app/lottie/LottieBoardClient.tsx`. Add `<QuickTools />` directly under the header (between the mode toggle row and the greeting). It should feel like part of the chrome, not a feature card.

### 1.5 Add new dog lines to `src/lib/types.ts`

Extend the `DOG_LINES` object with:
```ts
breathe: [
  "I'll breathe with you.",
  "Slow is fine. There's no rush.",
  "Just follow the circle.",
],
ground: [
  "Let's come back to the room together.",
  "One sense at a time.",
  "You don't have to write anything if you don't want to.",
],
afterTool: [
  "Welcome back.",
  "Notice anything shift?",
  "That counted.",
],
```

**Stop. Run `npx next build`. Verify clean. Do not proceed until it passes.**

---

## Phase 2: Reflections (Socratic questions on worry detail)

**Goal:** Let Lottie optionally explore a thought more deeply on any worry, using guided Socratic questions. Save reflections so she can re-read them.

### 2.1 Database migration: `supabase/migrations/0002_lwb_reflections.sql`

Create a new migration following the patterns in `0001_lwb_initial.sql` (idempotent, `IF NOT EXISTS`, `lwb_set_updated_at` trigger reuse, permissive RLS for anon).

```sql
CREATE TABLE IF NOT EXISTS lwb_reflections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worry_id        uuid REFERENCES lwb_worries(id) ON DELETE CASCADE,
  question        text NOT NULL,
  answer          text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lwb_reflections_worry_idx
  ON lwb_reflections (worry_id, created_at DESC);

DROP TRIGGER IF EXISTS lwb_reflections_set_updated_at ON lwb_reflections;
CREATE TRIGGER lwb_reflections_set_updated_at
  BEFORE UPDATE ON lwb_reflections
  FOR EACH ROW EXECUTE FUNCTION lwb_set_updated_at();

ALTER TABLE lwb_reflections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lwb_reflections_anon_all ON lwb_reflections;
CREATE POLICY lwb_reflections_anon_all ON lwb_reflections
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);
```

`worry_id` is nullable so reflections can stand alone (used by the Reflect quick tool).

### 2.2 Add type to `src/lib/types.ts`

```ts
export interface Reflection {
  id: string;
  worry_id: string | null;
  question: string;
  answer: string | null;
  created_at: string;
  updated_at: string;
}

export const SOCRATIC_QUESTIONS = [
  "What's the evidence for this thought?",
  "What's the evidence against it?",
  "Is there another way to look at this?",
  "What would I tell a friend who said this to me?",
  "What's the worst that could happen — and could I cope with it?",
  "Will this matter in a week? A month? A year?",
  "What would a fair, balanced version of this thought sound like?",
] as const;
```

### 2.3 Add server actions to `src/lib/actions.ts`

```ts
export async function createReflection(input: {
  worry_id?: string | null;
  question: string;
  answer: string;
}) { ... }

export async function getReflections(worry_id: string) { ... }
```

Follow the existing action patterns (use the server supabase client, return `{ error }` or `{ ok }`). Revalidate `/lottie`.

### 2.4 Component: `src/components/exercises/ReflectFlow.tsx`

A reusable flow component that takes an optional `worry` prop and renders the seven Socratic questions one at a time.

- Same step animation as the capture flow
- Each question gets a textarea, a "Save & continue" button, and a "Skip this one" button (equal visual weight)
- Only saves answers that are non-empty
- After the last question, a soft completion screen: dog in `tilt` mood, line "You looked. That's the whole exercise." (rotated from `DOG_LINES.afterTool`)
- A persistent "Done for now" button at the top — exits at any point

The flow can be entered with or without a worry attached. If attached, reflections are linked. If standalone, `worry_id` is null.

### 2.5 Wire into Lottie's board worry detail

In `LottieBoardClient.tsx`, on each worry row (specifically `WorryRow` and `PromiseCard`), add an optional expansion: a small "Look at this thought" link near the bottom of the card. Tapping it opens ReflectFlow as a modal with that worry attached.

Also display existing reflections (if any) on the worry detail — under "Your reflections" — as a soft list of question/answer pairs. These are read-only here. Show only the most recent 3 with a "show all" expander if more.

### 2.6 Wire the Reflect quick tool

In `QuickTools.tsx`, enable the Reflect button. It opens a small picker modal:
- "Reflect on a recent worry" → shows the 3 most recent open worries, picks one → ReflectFlow with that worry
- "Just sit with a thought" → ReflectFlow with no worry attached

### 2.7 Add Socratic-specific dog lines to `DOG_LINES`

```ts
reflect: [
  "Just one question at a time.",
  "Skip any that don't fit.",
  "There's no right answer.",
],
```

**Stop. Run `npx next build`. Verify clean. Do not proceed until it passes.**

---

## Phase 3: Smart dog offers (gentle contextual suggestions)

**Goal:** The dog gently offers the right tool at the right moment. This is the most subjective phase — be conservative. Better to under-trigger than over-trigger.

### 3.1 Trigger logic

Build a small helper at `src/lib/dogOffers.ts` that, given context, returns either an offer object or null. Contexts:

```ts
type OfferContext =
  | { kind: 'high_intensity_capture'; intensity: number }
  | { kind: 'after_set_down' }
  | { kind: 'after_save' }
  | { kind: 'recent_capture_burst'; countLast60min: number };

interface DogOffer {
  message: string;
  primaryAction: { label: string; tool: 'breathe' | 'ground' | 'reflect' | 'kind_act' };
  dismissLabel: string; // always equal weight
}
```

Rules (conservative):
- `high_intensity_capture` with intensity ≥ 8 → offer **Ground** before continuing the worry tree
- `recent_capture_burst` with count ≥ 3 → offer **Breathe + suggest a small kindness to self**
- `after_set_down` → offer **a small kind act** (suggest one of: a glass of water, step outside for 60 seconds, message someone you love, put kettle on, stretch)
- `after_save` of a normal worry → no offer (don't be Clippy)

### 3.2 Component: `src/components/DogOffer.tsx`

A small card that appears inline (not a modal) with:
- The dog in `tilt` mood
- The offer message (from rotating lines)
- Two buttons: primary action label, and dismiss label
- Both buttons equal visual weight (same size, similar contrast)
- Slides in with framer-motion, slides out smoothly when dismissed

### 3.3 Wire into capture flow

In `src/app/lottie/new/page.tsx`:
- After the user sets intensity in step 1, if intensity ≥ 8, before showing the worry tree (step 2), insert a transitional screen with `<DogOffer kind="high_intensity_capture" />`. If she taps "Try it" → opens GroundModal, then returns to the worry tree on close. If she taps "Not now" → continues to worry tree.
- After saving a "set down" worry (the `step === "saved"` for `canActOn === false` branch), show a `<DogOffer kind="after_set_down" />` instead of immediately redirecting. Add a 5-second auto-redirect to `/lottie` if she doesn't interact, but the redirect cancels if she taps "Try it."

### 3.4 Wire into Lottie board

In `LottieBoardClient.tsx`, on page load, count worries created in the last 60 minutes. If ≥ 3, show a soft `<DogOffer kind="recent_capture_burst" />` banner at the top, above QuickTools. Dismissable, doesn't reappear in the same session (use a simple in-memory React state — do NOT use localStorage).

### 3.5 "Kind act" mini-flow

For the `after_set_down` and `recent_capture_burst` offers, create `src/components/exercises/KindActModal.tsx`:
- A simple modal with the dog and 5 suggestions presented as cards (a glass of water, step outside 60s, message someone, kettle on, stretch)
- Tapping a suggestion shows a 30-second soft "Go on then. I'll wait." screen with the dog in `curl` mood
- After 30 seconds (or when she taps "Done"), a brief "Welcome back" screen, then close

No database writes for kind acts. Transient.

### 3.6 Add offer-related lines to `DOG_LINES`

```ts
highIntensity: [
  "That one's heavy. Want to ground first?",
  "Before we go on — want a moment to settle?",
],
afterSetDown: [
  "Want to do one small kind thing for yourself?",
  "Setting down deserves a small reward.",
],
captureBurst: [
  "Lots came up today. Want a pause?",
  "You've put a lot down. Maybe a breath?",
],
kindActs: [
  "I'll wait right here.",
  "Go on. The board can wait.",
  "Take your time.",
],
```

**Stop. Run `npx next build`. Verify clean.**

---

## Final verification checklist

After all three phases:

1. `npx next build` passes cleanly
2. Manual review the Lottie board on mobile viewport (375px width):
   - QuickTools strip fits without overflow
   - All modals are full-screen and dismissable
   - All dog offers have equal-weight dismiss buttons
3. Verify no `localStorage`, `sessionStorage`, or browser storage APIs are used anywhere
4. Verify no streaks, scores, completion counts, or "you've used X times" copy
5. Verify the migration is idempotent — running it twice produces no errors
6. Verify all new tables/columns/policies use the `lwb_` prefix
7. Update `README.md` with a new section "CBT exercises" briefly listing what's been added and where each lives in the codebase

## What NOT to do

- Do not add notifications, push, or email
- Do not gate any existing functionality behind exercises
- Do not create an "onboarding" or "tutorial" flow
- Do not add a "wellness score" or "anxiety meter" beyond the existing 1-10 intensity per worry
- Do not change the existing colour palette, fonts, or core component patterns
- Do not introduce new dependencies beyond what's already in package.json
- Do not modify the existing capture flow steps — only insert the dog offer between them

## Tone reminders for all new copy

- Validate, never minimise ("That sounds heavy" not "Don't worry!")
- The dog is a warm presence, not a coach or therapist
- Skip/dismiss is always equally weighted with engage
- No exclamation marks in the dog's lines (slightly understated tone)
- British English throughout (recognise, organise, behaviour)

When you're done, summarise what you built phase by phase, list any decisions you made that weren't covered explicitly in this brief, and flag anything that didn't behave as expected.
