"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createWorry } from "@/lib/actions";
import { SausageDog, pickLine } from "@/components/SausageDog";
import { DOG_LINES, EMOTION_OPTIONS, type Emotion } from "@/lib/types";

type Step = "feel" | "tree" | "act" | "letgo" | "saved";

export default function NewWorryPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [feelings, setFeelings] = useState("");
  const [emotionTags, setEmotionTags] = useState<Emotion[]>([]);
  const [intensity, setIntensity] = useState(5);
  const [actionNeeded, setActionNeeded] = useState("");
  const [setDownNote, setSetDownNote] = useState("");
  const [step, setStep] = useState<Step>("feel");
  const [canActOn, setCanActOn] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dogIntro = useMemo(() => pickLine(DOG_LINES.beforeNew), []);

  const toggleEmotion = (e: Emotion) => {
    setEmotionTags((cur) =>
      cur.includes(e) ? cur.filter((x) => x !== e) : [...cur, e],
    );
  };

  const submit = (act: boolean) => {
    setError(null);
    setCanActOn(act);
    startTransition(async () => {
      const res = await createWorry({
        title: title.trim() || "(untitled)",
        description: description.trim(),
        feelings: feelings.trim(),
        emotion_tags: emotionTags,
        intensity_initial: intensity,
        can_act_on: act,
        action_needed: act ? actionNeeded.trim() : undefined,
        set_down_note: !act ? setDownNote.trim() : undefined,
      });
      if (res?.error) {
        setError(res.error);
      } else {
        setStep("saved");
        setTimeout(() => router.push("/lottie"), 2000);
      }
    });
  };

  return (
    <main className="mx-auto max-w-md px-5 pb-32 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <Link
          href="/lottie"
          className="rounded-full bg-white/80 px-3 py-1.5 text-sm text-ink-soft shadow-soft"
        >
          ← Back
        </Link>
        <span className="text-xs uppercase tracking-widest text-ink-muted">
          {step === "feel" && "Step 1 of 2"}
          {step === "tree" && "Step 2 of 2"}
          {step === "act" && "Almost there"}
          {step === "letgo" && "Almost there"}
        </span>
      </header>

      <AnimatePresence mode="wait">
        {step === "feel" && (
          <motion.section
            key="feel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="text-center">
              <SausageDog mood="tilt" message={dogIntro} size={110} />
            </div>

            <h1 className="font-serif text-2xl font-medium leading-tight">
              What&rsquo;s on your mind?
            </h1>

            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A line or two…"
              className="w-full rounded-2xl border border-cream-200 bg-white/80 px-4 py-3 text-base shadow-soft placeholder:text-ink-muted"
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-ink-soft">
                Tell me more (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What's it about? Doesn't need to be tidy."
                className="w-full rounded-2xl border border-cream-200 bg-white/80 px-4 py-3 text-base shadow-soft placeholder:text-ink-muted"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink-soft">
                How does it feel? (optional)
              </label>
              <textarea
                value={feelings}
                onChange={(e) => setFeelings(e.target.value)}
                rows={2}
                placeholder="In your body, in your head…"
                className="w-full rounded-2xl border border-cream-200 bg-white/80 px-4 py-3 text-base shadow-soft placeholder:text-ink-muted"
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-ink-soft">
                Or tap any that fit
              </p>
              <div className="flex flex-wrap gap-2">
                {EMOTION_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => toggleEmotion(e)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      emotionTags.includes(e)
                        ? "border-rose bg-rose text-white"
                        : "border-cream-200 bg-white/70 text-ink-soft"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-end justify-between">
                <label className="text-sm font-medium text-ink-soft">
                  How heavy does it feel right now?
                </label>
                <span className="font-serif text-3xl text-ink">{intensity}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="lwb-slider"
              />
              <div className="mt-1 flex justify-between text-xs text-ink-muted">
                <span>a wisp</span>
                <span>a brick</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep("tree")}
              disabled={!title.trim()}
              className="w-full rounded-2xl bg-ink py-4 text-base font-medium text-cream-50 shadow-soft transition active:scale-[0.98] disabled:opacity-40"
            >
              Next
            </button>
          </motion.section>
        )}

        {step === "tree" && (
          <motion.section
            key="tree"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center">
              <SausageDog
                mood="tilt"
                message="Just one more thing…"
                size={110}
              />
            </div>

            <div>
              <h1 className="font-serif text-2xl font-medium leading-snug">
                Is there anything that could actually be done about this?
              </h1>
              <p className="mt-2 text-sm text-ink-soft">
                There&rsquo;s no wrong answer. Some worries can be acted on. Some
                are best to set down.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setStep("act")}
                className="flex w-full items-center gap-4 rounded-3xl bg-gradient-to-br from-sage-soft to-sage/40 px-5 py-5 text-left shadow-soft transition active:scale-[0.98]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-2xl">
                  🌱
                </div>
                <div className="flex-1">
                  <div className="font-serif text-lg text-ink">
                    Yes, something could help
                  </div>
                  <div className="text-sm text-ink-soft">
                    Make a plan with Brad
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStep("letgo")}
                className="flex w-full items-center gap-4 rounded-3xl bg-gradient-to-br from-lavender-soft to-lavender/30 px-5 py-5 text-left shadow-soft transition active:scale-[0.98]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-2xl">
                  🪶
                </div>
                <div className="flex-1">
                  <div className="font-serif text-lg text-ink">
                    No, this one&rsquo;s just spinning
                  </div>
                  <div className="text-sm text-ink-soft">
                    Set it down here
                  </div>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep("feel")}
              className="w-full rounded-2xl bg-white/70 py-3 text-sm text-ink-soft"
            >
              ← Back
            </button>
          </motion.section>
        )}

        {step === "act" && (
          <motion.section
            key="act"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="text-center">
              <SausageDog mood="wag" size={100} />
            </div>

            <h1 className="font-serif text-2xl font-medium leading-snug">
              What would help shift it?
            </h1>
            <p className="-mt-2 text-sm text-ink-soft">
              Even a rough thought. Brad will pick it up from here.
            </p>

            <textarea
              autoFocus
              value={actionNeeded}
              onChange={(e) => setActionNeeded(e.target.value)}
              rows={5}
              placeholder="A call, a decision, an answer, a hug, a plan…"
              className="w-full rounded-2xl border border-cream-200 bg-white/80 px-4 py-3 text-base shadow-soft placeholder:text-ink-muted"
            />

            {error && (
              <p className="rounded-xl bg-rose-soft/40 px-4 py-2 text-sm text-rose-deep">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("tree")}
                className="rounded-2xl bg-white/70 px-5 py-3.5 text-sm text-ink-soft"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => submit(true)}
                disabled={pending}
                className="flex-1 rounded-2xl bg-ink py-3.5 text-base font-medium text-cream-50 shadow-soft transition active:scale-[0.98] disabled:opacity-60"
              >
                {pending ? "Putting it down…" : "Put it on the board"}
              </button>
            </div>
          </motion.section>
        )}

        {step === "letgo" && (
          <motion.section
            key="letgo"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="text-center">
              <SausageDog mood="curl" size={100} />
            </div>

            <h1 className="font-serif text-2xl font-medium leading-snug">
              Want to note anything as you set it down?
            </h1>
            <p className="-mt-2 text-sm text-ink-soft">
              Optional. Sometimes naming the loop helps quiet it.
            </p>

            <textarea
              autoFocus
              value={setDownNote}
              onChange={(e) => setSetDownNote(e.target.value)}
              rows={4}
              placeholder="e.g. 'I keep going round on this and there's nothing I can do tonight.'"
              className="w-full rounded-2xl border border-cream-200 bg-white/80 px-4 py-3 text-base shadow-soft placeholder:text-ink-muted"
            />

            {error && (
              <p className="rounded-xl bg-rose-soft/40 px-4 py-2 text-sm text-rose-deep">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("tree")}
                className="rounded-2xl bg-white/70 px-5 py-3.5 text-sm text-ink-soft"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => submit(false)}
                disabled={pending}
                className="flex-1 rounded-2xl bg-ink py-3.5 text-base font-medium text-cream-50 shadow-soft transition active:scale-[0.98] disabled:opacity-60"
              >
                {pending ? "Setting it down…" : "Set it down"}
              </button>
            </div>
          </motion.section>
        )}

        {step === "saved" && (
          <motion.section
            key="saved"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center gap-4 pt-12 text-center"
          >
            <SausageDog
              mood="happy"
              size={160}
              message={
                canActOn
                  ? pickLine(DOG_LINES.afterSave)
                  : pickLine(DOG_LINES.setDown)
              }
            />
            <h2 className="font-serif text-2xl font-medium">
              {canActOn ? "On the board." : "Set down."}
            </h2>
            <p className="max-w-xs text-sm text-ink-soft">
              {canActOn
                ? "Brad will see it next time he looks. Taking you to your board…"
                : "It can rest here now. Taking you to your board…"}
            </p>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
