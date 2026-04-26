"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Worry } from "@/lib/types";
import { SausageDog } from "@/components/SausageDog";
import { ModeToggle } from "@/components/ModeToggle";
import { markDone } from "@/lib/actions";

interface Props {
  worries: Worry[];
  dogName: string | null;
}

export function LottieBoardClient({ worries, dogName }: Props) {
  const promised = worries.filter((w) => w.status === "in_progress");
  const seen = worries.filter((w) => w.status === "seen");
  const newOnes = worries.filter((w) => w.status === "new");
  const setDown = worries.filter((w) => w.status === "set_down").slice(0, 8);
  const done = worries.filter((w) => w.status === "done").slice(0, 8);

  const [showSetDown, setShowSetDown] = useState(false);
  const [showDone, setShowDone] = useState(false);

  return (
    <main className="mx-auto max-w-md px-5 pb-32 pt-6">
      {/* Top bar: mode toggle + settings */}
      <header className="mb-6 flex items-center gap-3">
        <div className="flex-1">
          <ModeToggle active="lottie" />
        </div>
        <Link
          href="/settings"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-ink-soft shadow-soft"
          aria-label="Settings"
        >
          ⚙
        </Link>
      </header>

      {/* Greeting */}
      <div className="mb-5 flex items-end gap-3">
        <SausageDog mood="idle" size={70} />
        <div className="flex-1">
          <h1 className="font-serif text-3xl font-medium leading-tight">
            Your board
          </h1>
          <p className="text-sm text-ink-soft">
            {worries.length === 0
              ? "Nothing on it yet."
              : promised.length > 0
                ? `Brad has a plan for ${promised.length} ${promised.length === 1 ? "worry" : "worries"}.`
                : "Brad will pick these up."}
          </p>
        </div>
      </div>

      {/* Add a worry — prominent */}
      <Link
        href="/lottie/new"
        className="mb-6 flex items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-base font-medium text-cream-50 shadow-soft transition active:scale-[0.98]"
      >
        <span className="text-xl leading-none">+</span> Add a worry
      </Link>

      {/* Brad's promises — hero section */}
      {promised.length > 0 && (
        <Section
          title="Brad's promises"
          subtitle="There's a plan for these."
          tone="honey"
        >
          {promised.map((w) => (
            <PromiseCard key={w.id} worry={w} />
          ))}
        </Section>
      )}

      {/* Seen by Brad */}
      {seen.length > 0 && (
        <Section
          title="Brad's seen these"
          subtitle="Working out what would help."
          tone="rose"
        >
          {seen.map((w) => (
            <WorryRow key={w.id} worry={w} state="seen" />
          ))}
        </Section>
      )}

      {/* Waiting */}
      {newOnes.length > 0 && (
        <Section
          title="On the board"
          subtitle="Waiting for Brad to look."
          tone="cream"
        >
          {newOnes.map((w) => (
            <WorryRow key={w.id} worry={w} state="new" />
          ))}
        </Section>
      )}

      {/* Empty state */}
      {worries.length === 0 && (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl bg-white/70 p-8 text-center shadow-soft">
          <SausageDog mood="curl" size={120} />
          <p className="font-serif text-xl">Quiet board. Quiet mind.</p>
          <p className="text-sm text-ink-soft">
            When something rattles, put it here.
          </p>
        </div>
      )}

      {/* Set down */}
      {setDown.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowSetDown((s) => !s)}
            className="flex w-full items-center justify-between rounded-3xl bg-lavender-soft/50 px-5 py-4 text-left shadow-soft"
          >
            <div>
              <div className="font-serif text-lg">Set down</div>
              <div className="text-xs text-ink-soft">
                {setDown.length} released — they don&rsquo;t need carrying.
              </div>
            </div>
            <span className="text-ink-muted">{showSetDown ? "▲" : "▼"}</span>
          </button>
          <AnimatePresence>
            {showSetDown && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2">
                  {setDown.map((w) => (
                    <ResolvedRow key={w.id} worry={w} kind="set_down" />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Done */}
      {done.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowDone((s) => !s)}
            className="flex w-full items-center justify-between rounded-3xl bg-sage-soft/60 px-5 py-4 text-left shadow-soft"
          >
            <div>
              <div className="font-serif text-lg">Resolved</div>
              <div className="text-xs text-ink-soft">
                {done.length} done. Real evidence.
              </div>
            </div>
            <span className="text-ink-muted">{showDone ? "▲" : "▼"}</span>
          </button>
          <AnimatePresence>
            {showDone && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2">
                  {done.map((w) => (
                    <ResolvedRow key={w.id} worry={w} kind="done" />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}

// ---------------- subcomponents ----------------

function Section({
  title,
  subtitle,
  tone,
  children,
}: {
  title: string;
  subtitle?: string;
  tone: "honey" | "rose" | "cream";
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-serif text-xl font-medium">{title}</h2>
        {subtitle && (
          <span className="text-xs italic text-ink-soft">{subtitle}</span>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function PromiseCard({ worry }: { worry: Worry }) {
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const [showResolve, setShowResolve] = useState(false);
  const [resolvedIntensity, setResolvedIntensity] = useState(2);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-gradient-to-br from-honey-soft to-honey/30 p-5 shadow-warm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-honey-deep">
            <span className="inline-block h-2 w-2 rounded-full bg-honey-deep" />
            Brad&rsquo;s promise
          </div>
          <h3 className="font-serif text-lg font-medium leading-snug">
            {worry.title}
          </h3>
        </div>
        <IntensityPill value={worry.intensity_initial} />
      </div>

      <div className="mt-3 rounded-2xl bg-white/70 p-4">
        <p className="font-serif italic leading-relaxed">
          &ldquo;{worry.brads_promise}&rdquo;
        </p>
        {worry.brads_promise_eta && (
          <p className="mt-2 text-xs text-ink-soft">
            ⏱ {worry.brads_promise_eta}
          </p>
        )}
      </div>

      <button
        onClick={() => setExpanded((e) => !e)}
        className="mt-3 text-xs text-ink-soft underline"
      >
        {expanded ? "Hide what I wrote" : "What I wrote"}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 text-sm">
              {worry.description && (
                <p className="text-ink">{worry.description}</p>
              )}
              {worry.feelings && (
                <p className="text-ink-soft">
                  <span className="font-medium">Feeling:</span> {worry.feelings}
                </p>
              )}
              {worry.action_needed && (
                <p className="text-ink-soft">
                  <span className="font-medium">What I thought might help:</span>{" "}
                  {worry.action_needed}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showResolve ? (
        <button
          onClick={() => setShowResolve(true)}
          className="mt-4 w-full rounded-2xl bg-ink/90 py-3 text-sm font-medium text-cream-50 shadow-soft transition active:scale-[0.98]"
        >
          Mark this resolved
        </button>
      ) : (
        <div className="mt-4 space-y-3 rounded-2xl bg-white/60 p-4">
          <p className="text-sm text-ink-soft">
            How heavy does it feel <em>now</em>?
          </p>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={10}
              value={resolvedIntensity}
              onChange={(e) => setResolvedIntensity(Number(e.target.value))}
              className="lwb-slider flex-1"
            />
            <span className="font-serif text-2xl">{resolvedIntensity}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowResolve(false)}
              className="flex-1 rounded-xl bg-white/70 py-2 text-sm text-ink-soft"
            >
              Cancel
            </button>
            <button
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await markDone(worry.id, resolvedIntensity);
                })
              }
              className="flex-1 rounded-xl bg-sage py-2 text-sm font-medium text-white"
            >
              {pending ? "…" : "Done"}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function WorryRow({
  worry,
  state,
}: {
  worry: Worry;
  state: "new" | "seen";
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/85 p-4 shadow-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-serif text-base font-medium leading-snug">
            {worry.title}
          </h3>
          {worry.description && (
            <p className="mt-1 text-sm text-ink-soft">{worry.description}</p>
          )}
          <div className="mt-2 flex items-center gap-2 text-xs">
            {state === "seen" ? (
              <span className="rounded-full bg-rose-soft/60 px-2 py-0.5 text-rose-deep">
                Brad&rsquo;s seen it
              </span>
            ) : (
              <span className="rounded-full bg-cream-200 px-2 py-0.5 text-ink-soft">
                Waiting
              </span>
            )}
            <span className="text-ink-muted">{relTime(worry.created_at)}</span>
          </div>
        </div>
        <IntensityPill value={worry.intensity_initial} />
      </div>
    </motion.div>
  );
}

function ResolvedRow({
  worry,
  kind,
}: {
  worry: Worry;
  kind: "done" | "set_down";
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 text-sm ${
        kind === "done" ? "bg-sage-soft/40" : "bg-lavender-soft/40"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="line-through decoration-1 underline-offset-2">
          {worry.title}
        </span>
        <span className="text-xs text-ink-muted">
          {kind === "done" && worry.intensity_resolved !== null
            ? `${worry.intensity_initial} → ${worry.intensity_resolved}`
            : ""}
        </span>
      </div>
    </div>
  );
}

function IntensityPill({ value }: { value: number }) {
  const tone =
    value >= 8 ? "bg-rose text-white"
    : value >= 5 ? "bg-honey text-ink"
    : "bg-sage-soft text-ink";
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-base ${tone}`}
      title={`Intensity ${value}/10`}
    >
      {value}
    </span>
  );
}

function relTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}
