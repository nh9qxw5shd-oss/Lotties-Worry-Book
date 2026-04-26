"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SausageDog, pickLine } from "@/components/SausageDog";
import { DOG_LINES, SOCRATIC_QUESTIONS, type Worry } from "@/lib/types";
import { createReflection } from "@/lib/actions";

interface Props {
  open: boolean;
  onClose: () => void;
  worry?: Worry | null;
}

export function ReflectFlow({ open, onClose, worry }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [finished, setFinished] = useState(false);
  const [pending, startTransition] = useTransition();
  const [intro] = useState(() => pickLine(DOG_LINES.reflect));
  const [outro] = useState(() => pickLine(DOG_LINES.afterTool));

  if (!open) return null;

  const reset = () => {
    setStepIdx(0);
    setAnswer("");
    setFinished(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const advance = (saveAnswer: boolean) => {
    const text = answer;
    setAnswer("");

    const next = () => {
      if (stepIdx + 1 >= SOCRATIC_QUESTIONS.length) {
        setFinished(true);
      } else {
        setStepIdx((s) => s + 1);
      }
    };

    if (saveAnswer && text.trim()) {
      startTransition(async () => {
        await createReflection({
          worry_id: worry?.id ?? null,
          question: SOCRATIC_QUESTIONS[stepIdx],
          answer: text,
        });
        next();
      });
    } else {
      next();
    }
  };

  const question = SOCRATIC_QUESTIONS[stepIdx];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-cream-50 via-lavender-soft/40 to-sage-soft/40">
      <div className="flex items-center justify-end px-5 pt-6">
        <button
          onClick={handleClose}
          className="flex h-12 items-center justify-center rounded-2xl bg-white/80 px-5 text-sm font-medium text-ink shadow-soft transition active:scale-[0.98]"
        >
          Done for now
        </button>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-10">
        <AnimatePresence mode="wait">
          {!finished && (
            <motion.section
              key={`q-${stepIdx}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-4 flex flex-1 flex-col"
            >
              <p className="mb-2 text-xs uppercase tracking-widest text-ink-muted">
                {stepIdx + 1} of {SOCRATIC_QUESTIONS.length}
              </p>

              {worry && (
                <div className="mb-4 rounded-2xl bg-white/70 p-4 shadow-soft">
                  <p className="text-xs font-medium uppercase tracking-widest text-ink-muted">
                    The thought
                  </p>
                  <p className="mt-1 font-serif text-base text-ink">
                    {worry.title}
                  </p>
                </div>
              )}

              <h2 className="mb-6 font-serif text-2xl font-medium leading-snug text-ink">
                {question}
              </h2>

              <textarea
                autoFocus
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
                placeholder="Take your time. Or skip — equally fine."
                className="w-full rounded-2xl border border-cream-200 bg-white/80 px-4 py-3 text-base shadow-soft placeholder:text-ink-muted"
              />

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => advance(false)}
                  disabled={pending}
                  className="flex-1 rounded-2xl bg-white/80 py-4 text-base text-ink shadow-soft transition active:scale-[0.98] disabled:opacity-60"
                >
                  Skip this one
                </button>
                <button
                  onClick={() => advance(true)}
                  disabled={pending}
                  className="flex-1 rounded-2xl bg-white/80 py-4 text-base text-ink shadow-soft transition active:scale-[0.98] disabled:opacity-60"
                >
                  {pending ? "…" : "Save & continue"}
                </button>
              </div>

              {stepIdx === 0 && (
                <div className="pointer-events-none mt-8">
                  <SausageDog mood="tilt" message={intro} size={90} />
                </div>
              )}
            </motion.section>
          )}

          {finished && (
            <motion.section
              key="finished"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-1 flex-col items-center justify-center text-center"
            >
              <SausageDog mood="tilt" size={140} message={outro} />
              <h2 className="mt-6 font-serif text-3xl font-medium text-ink">
                You looked. That&rsquo;s the whole exercise.
              </h2>
              <button
                onClick={handleClose}
                className="mt-10 w-full max-w-xs rounded-2xl bg-white/80 py-4 text-base text-ink shadow-soft transition active:scale-[0.98]"
              >
                Done
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
