"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Worry } from "@/lib/types";
import { addPromise, markSeen, markDone, deleteWorry } from "@/lib/actions";

interface Props {
  worries: Worry[];
}

export function BradViewClient({ worries }: Props) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const newOnes = worries.filter((w) => w.status === "new");
  const seen = worries.filter((w) => w.status === "seen");
  const inProgress = worries.filter((w) => w.status === "in_progress");
  const done = worries.filter((w) => w.status === "done").slice(0, 12);
  const setDown = worries.filter((w) => w.status === "set_down").slice(0, 12);

  return (
    <main className="mx-auto max-w-md px-5 pb-32 pt-6">
      <header className="mb-6 flex items-center justify-end">
        <Link
          href="/settings"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-ink-soft shadow-soft"
          aria-label="Settings"
        >
          ⚙
        </Link>
      </header>

      <h1 className="mb-1 font-serif text-3xl font-medium leading-tight">
        What needs you
      </h1>
      <p className="mb-6 text-sm text-ink-soft">
        Open one to acknowledge it. Add a promise when you have one.
      </p>

      {newOnes.length === 0 && seen.length === 0 && inProgress.length === 0 && (
        <div className="rounded-3xl bg-white/70 p-8 text-center shadow-soft">
          <p className="font-serif text-xl">All caught up.</p>
          <p className="mt-2 text-sm text-ink-soft">
            No active worries on the board.
          </p>
        </div>
      )}

      {newOnes.length > 0 && (
        <Section title="New" subtitle={`${newOnes.length} waiting`} accent="rose">
          {newOnes.map((w) => (
            <BradWorryCard
              key={w.id}
              worry={w}
              isOpen={openIds.has(w.id)}
              onToggle={() => toggleOpen(w.id)}
            />
          ))}
        </Section>
      )}

      {seen.length > 0 && (
        <Section
          title="Acknowledged"
          subtitle="Add a promise when ready"
          accent="cream"
        >
          {seen.map((w) => (
            <BradWorryCard
              key={w.id}
              worry={w}
              isOpen={openIds.has(w.id)}
              onToggle={() => toggleOpen(w.id)}
            />
          ))}
        </Section>
      )}

      {inProgress.length > 0 && (
        <Section
          title="In progress"
          subtitle="Promises you're keeping"
          accent="honey"
        >
          {inProgress.map((w) => (
            <BradWorryCard
              key={w.id}
              worry={w}
              isOpen={openIds.has(w.id)}
              onToggle={() => toggleOpen(w.id)}
            />
          ))}
        </Section>
      )}

      {(done.length > 0 || setDown.length > 0) && (
        <details className="mt-8 rounded-3xl bg-white/60 p-4 shadow-soft">
          <summary className="cursor-pointer font-serif text-base">
            Archive ({done.length + setDown.length})
          </summary>
          <div className="mt-4 space-y-2 text-sm">
            {done.map((w) => (
              <ArchiveRow key={w.id} worry={w} kind="done" />
            ))}
            {setDown.map((w) => (
              <ArchiveRow key={w.id} worry={w} kind="set_down" />
            ))}
          </div>
        </details>
      )}
    </main>
  );
}

function Section({
  title,
  subtitle,
  accent,
  children,
}: {
  title: string;
  subtitle?: string;
  accent: "rose" | "cream" | "honey";
  children: React.ReactNode;
}) {
  const dot = {
    rose: "bg-rose",
    cream: "bg-ink-muted",
    honey: "bg-honey-deep",
  }[accent];
  return (
    <section className="mb-7">
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <h2 className="font-serif text-lg font-medium">{title}</h2>
        {subtitle && (
          <span className="text-xs text-ink-soft">· {subtitle}</span>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function BradWorryCard({
  worry,
  isOpen,
  onToggle,
}: {
  worry: Worry;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [promise, setPromise] = useState(worry.brads_promise ?? "");
  const [eta, setEta] = useState(worry.brads_promise_eta ?? "");
  const [showDelete, setShowDelete] = useState(false);

  // auto-mark as seen when card is opened for a 'new' worry
  useEffect(() => {
    if (isOpen && worry.status === "new") {
      startTransition(async () => {
        await markSeen(worry.id);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const intensityTone =
    worry.intensity_initial >= 8
      ? "bg-rose text-white"
      : worry.intensity_initial >= 5
        ? "bg-honey text-ink"
        : "bg-sage-soft text-ink";

  return (
    <motion.article
      layout
      className="overflow-hidden rounded-3xl bg-white/90 shadow-soft"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 p-5 text-left"
      >
        <div className="flex-1">
          <h3 className="font-serif text-lg font-medium leading-snug">
            {worry.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            <span>{relTime(worry.created_at)}</span>
            {worry.emotion_tags.length > 0 && (
              <>
                <span>·</span>
                <span>{worry.emotion_tags.join(", ")}</span>
              </>
            )}
          </div>
        </div>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-lg ${intensityTone}`}
        >
          {worry.intensity_initial}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-cream-200 px-5 pb-5 pt-4">
              {worry.description && (
                <Field label="What it is">{worry.description}</Field>
              )}
              {worry.feelings && (
                <Field label="How it feels">{worry.feelings}</Field>
              )}
              {worry.action_needed && (
                <Field label="What Lottie thought might help">
                  {worry.action_needed}
                </Field>
              )}

              <div className="space-y-2 rounded-2xl bg-honey-soft/40 p-4">
                <label className="block text-xs font-bold uppercase tracking-widest text-honey-deep">
                  Brad&rsquo;s promise
                </label>
                <textarea
                  value={promise}
                  onChange={(e) => setPromise(e.target.value)}
                  rows={3}
                  placeholder="What you're going to do…"
                  className="w-full rounded-xl border border-cream-200 bg-white/80 px-3 py-2 text-sm"
                />
                <input
                  value={eta}
                  onChange={(e) => setEta(e.target.value)}
                  placeholder="When (e.g. 'tonight', 'by Friday')"
                  className="w-full rounded-xl border border-cream-200 bg-white/80 px-3 py-2 text-sm"
                />
                <button
                  disabled={pending || !promise.trim()}
                  onClick={() =>
                    startTransition(async () => {
                      await addPromise(worry.id, promise.trim(), eta.trim());
                    })
                  }
                  className="w-full rounded-xl bg-ink py-2.5 text-sm font-medium text-cream-50 disabled:opacity-50"
                >
                  {worry.brads_promise ? "Update promise" : "Make promise"}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await markDone(worry.id, null);
                    })
                  }
                  className="flex-1 rounded-xl bg-sage py-2 text-sm font-medium text-white"
                >
                  Mark resolved
                </button>
                <button
                  onClick={() => setShowDelete((s) => !s)}
                  className="rounded-xl bg-cream-200 px-4 py-2 text-sm text-ink-soft"
                >
                  ⋯
                </button>
              </div>

              {showDelete && (
                <div className="rounded-xl bg-rose-soft/50 p-3 text-sm">
                  <p className="mb-2 text-rose-deep">
                    Delete this worry permanently?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDelete(false)}
                      className="flex-1 rounded-lg bg-white/70 py-1.5"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await deleteWorry(worry.id);
                        })
                      }
                      className="flex-1 rounded-lg bg-rose-deep py-1.5 text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-muted">
        {label}
      </div>
      <p className="whitespace-pre-wrap text-sm text-ink">{children}</p>
    </div>
  );
}

function ArchiveRow({ worry, kind }: { worry: Worry; kind: "done" | "set_down" }) {
  return (
    <div
      className={`rounded-xl px-3 py-2 text-sm ${
        kind === "done" ? "bg-sage-soft/30" : "bg-lavender-soft/30"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span>{worry.title}</span>
        <span className="text-xs text-ink-muted">
          {kind === "done" ? "✓" : "·"}{" "}
          {relTime(worry.completed_at ?? worry.created_at)}
        </span>
      </div>
    </div>
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
