"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SausageDog, pickLine } from "@/components/SausageDog";
import { DOG_LINES } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Step {
  count: number;
  sense: string;
  hint: string;
}

const STEPS: Step[] = [
  { count: 5, sense: "see", hint: "Look around. Soft, slow." },
  { count: 4, sense: "feel", hint: "The chair under you, fabric, temperature." },
  { count: 3, sense: "hear", hint: "Near sounds, far sounds." },
  { count: 2, sense: "smell", hint: "Even the absence is something." },
  { count: 1, sense: "taste", hint: "Just one." },
];

export function GroundModal({ open, onClose }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [text, setText] = useState("");
  const [finished, setFinished] = useState(false);
  const [intro] = useState(() => pickLine(DOG_LINES.ground));

  if (!open) return null;

  const reset = () => {
    setStepIdx(0);
    setText("");
    setFinished(false);
  };

  const advance = () => {
    setText("");
    if (stepIdx + 1 >= STEPS.length) {
      setFinished(true);
    } else {
      setStepIdx((s) => s + 1);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const step = STEPS[stepIdx];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-cream-50 via-lavender-soft/40 to-sage-soft/40">
      <div className="flex items-center justify-end px-5 pt-6">
        <button
          onClick={handleClose}
          className="flex h-12 items-center justify-center rounded-2xl bg-white/80 px-5 text-sm font-medium text-ink shadow-soft transition active:scale-[0.98]"
          aria-label="Close"
        >
          Close
        </button>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-10">
        <AnimatePresence mode="wait">
          {!finished && (
            <motion.section
              key={`step-${stepIdx}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-4 flex flex-1 flex-col"
            >
              <p className="mb-2 text-xs uppercase tracking-widest text-ink-muted">
                Step {stepIdx + 1} of {STEPS.length}
              </p>
              <h2 className="mb-3 font-serif text-3xl font-medium leading-tight text-ink">
                Notice {step.count} {step.count === 1 ? "thing" : "things"} you can {step.sense}.
              </h2>
              <p className="mb-6 text-sm text-ink-soft">{step.hint}</p>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                placeholder="Write if you want to. Optional."
                className="w-full rounded-2xl border border-cream-200 bg-white/80 px-4 py-3 text-base shadow-soft placeholder:text-ink-muted"
              />

              <div className="mt-6 flex gap-3">
                <button
                  onClick={advance}
                  className="flex-1 rounded-2xl bg-white/80 py-4 text-base text-ink shadow-soft transition active:scale-[0.98]"
                >
                  Skip
                </button>
                <button
                  onClick={advance}
                  className="flex-1 rounded-2xl bg-white/80 py-4 text-base text-ink shadow-soft transition active:scale-[0.98]"
                >
                  Next
                </button>
              </div>
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
              <SausageDog
                mood="curl"
                size={140}
                message="Notice — you came back to the room."
              />
              <h2 className="mt-6 font-serif text-3xl font-medium text-ink">
                You&rsquo;re here. You&rsquo;re now.
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

        {!finished && (
          <div className="pointer-events-none mt-6">
            <SausageDog mood="idle" message={stepIdx === 0 ? intro : undefined} size={90} />
          </div>
        )}
      </div>

    </div>
  );
}
