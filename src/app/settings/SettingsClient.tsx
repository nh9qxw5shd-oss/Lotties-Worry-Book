"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { upsertSettings } from "@/lib/actions";
import { SausageDog } from "@/components/SausageDog";

interface InitialSettings {
  dog_name: string | null;
  worry_time_enabled: boolean;
  worry_time_hour: number;
  show_companion: boolean;
}

export function SettingsClient({ initial }: { initial: InitialSettings }) {
  const [dogName, setDogName] = useState(initial.dog_name ?? "");
  const [worryTimeEnabled, setWorryTimeEnabled] = useState(
    initial.worry_time_enabled,
  );
  const [worryTimeHour, setWorryTimeHour] = useState(initial.worry_time_hour);
  const [showCompanion, setShowCompanion] = useState(initial.show_companion);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const save = () => {
    startTransition(async () => {
      await upsertSettings({
        dog_name: dogName.trim() || null,
        worry_time_enabled: worryTimeEnabled,
        worry_time_hour: worryTimeHour,
        show_companion: showCompanion,
      });
      setSavedAt(Date.now());
    });
  };

  return (
    <main className="mx-auto max-w-md px-5 pb-32 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <Link
          href="/lottie"
          className="rounded-full bg-white/80 px-3 py-1.5 text-sm text-ink-soft shadow-soft"
        >
          ← Back
        </Link>
      </header>

      <h1 className="mb-6 font-serif text-3xl font-medium leading-tight">
        Settings
      </h1>

      {/* Dog naming */}
      <section className="mb-6 rounded-3xl bg-white/85 p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <SausageDog mood="tilt" size={70} />
          <div className="flex-1">
            <h2 className="font-serif text-lg">Your sausage dog friend</h2>
            <p className="text-xs text-ink-soft">
              Give him a name. You can change it anytime.
            </p>
          </div>
        </div>
        <input
          value={dogName}
          onChange={(e) => setDogName(e.target.value)}
          placeholder="e.g. Pickle, Biscuit, Frank…"
          className="mt-4 w-full rounded-2xl border border-cream-200 bg-cream-50 px-4 py-3 text-base"
        />
        <label className="mt-4 flex items-center justify-between rounded-2xl bg-cream-100 px-4 py-3">
          <span className="text-sm">Show him around the app</span>
          <Toggle value={showCompanion} onChange={setShowCompanion} />
        </label>
      </section>

      {/* Worry time */}
      <section className="mb-6 rounded-3xl bg-white/85 p-5 shadow-soft">
        <h2 className="font-serif text-lg">Worry time (optional)</h2>
        <p className="mt-1 text-xs text-ink-soft">
          A daily 15-min window to look at the board. The dog will gently nudge
          worries toward this time during the day. Off by default.
        </p>
        <label className="mt-4 flex items-center justify-between rounded-2xl bg-cream-100 px-4 py-3">
          <span className="text-sm">Use worry time</span>
          <Toggle value={worryTimeEnabled} onChange={setWorryTimeEnabled} />
        </label>
        {worryTimeEnabled && (
          <div className="mt-3 rounded-2xl bg-cream-100 px-4 py-3">
            <label className="mb-2 block text-sm">When?</label>
            <select
              value={worryTimeHour}
              onChange={(e) => setWorryTimeHour(Number(e.target.value))}
              className="w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-base"
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      <button
        onClick={save}
        disabled={pending}
        className="w-full rounded-2xl bg-ink py-3.5 text-base font-medium text-cream-50 shadow-soft transition active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Saving…" : savedAt ? "Saved ✓" : "Save"}
      </button>

      <p className="mt-12 text-center text-xs text-ink-muted">
        Made by Brad with love.
      </p>
    </main>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative h-7 w-12 rounded-full transition ${
        value ? "bg-sage" : "bg-cream-200"
      }`}
      aria-pressed={value}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-soft transition-transform ${
          value ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function formatHour(h: number): string {
  if (h === 0) return "12:00 AM";
  if (h < 12) return `${h}:00 AM`;
  if (h === 12) return "12:00 PM";
  return `${h - 12}:00 PM`;
}
