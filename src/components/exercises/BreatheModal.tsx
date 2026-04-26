"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SausageDog, pickLine } from "@/components/SausageDog";
import { DOG_LINES } from "@/lib/types";

type Phase = "in" | "hold1" | "out" | "hold2";

const PHASE_LABEL: Record<Phase, string> = {
  in: "Breathe in",
  hold1: "Hold",
  out: "Breathe out",
  hold2: "Hold",
};

const PHASE_ORDER: Phase[] = ["in", "hold1", "out", "hold2"];
const PHASE_SECONDS = 4;
const DEFAULT_CYCLES = 4;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function BreatheModal({ open, onClose }: Props) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [count, setCount] = useState(PHASE_SECONDS);
  const [done, setDone] = useState(false);
  const [intro] = useState(() => pickLine(DOG_LINES.breathe));

  useEffect(() => {
    if (!open) return;
    setPhaseIdx(0);
    setCycle(0);
    setCount(PHASE_SECONDS);
    setDone(false);
  }, [open]);

  useEffect(() => {
    if (!open || done) return;
    const tick = setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1;
        // advance phase
        setPhaseIdx((idx) => {
          const next = idx + 1;
          if (next >= PHASE_ORDER.length) {
            setCycle((cy) => {
              const ncy = cy + 1;
              if (ncy >= DEFAULT_CYCLES) {
                setDone(true);
              }
              return ncy;
            });
            return 0;
          }
          return next;
        });
        return PHASE_SECONDS;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [open, done]);

  if (!open) return null;

  const phase = PHASE_ORDER[phaseIdx];
  const circleScale =
    phase === "in" ? 1.4 : phase === "hold1" ? 1.4 : phase === "out" ? 1 : 1;
  const transitionDuration = phase === "in" || phase === "out" ? PHASE_SECONDS : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-cream-50 via-lavender-soft to-sage-soft">
      {/* Close button — equal weight, top right */}
      <div className="flex items-center justify-end px-5 pt-6">
        <button
          onClick={onClose}
          className="flex h-12 items-center justify-center rounded-2xl bg-white/80 px-5 text-sm font-medium text-ink shadow-soft transition active:scale-[0.98]"
          aria-label="Close"
        >
          Close
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-10">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key="breathing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <h2 className="mb-3 font-serif text-3xl font-medium text-ink">
                {PHASE_LABEL[phase]}
              </h2>
              <p className="mb-10 font-serif text-xl text-ink-soft">{count}</p>

              <motion.div
                key={phase}
                initial={{ scale: phase === "in" ? 1 : phase === "out" ? 1.4 : circleScale }}
                animate={{ scale: circleScale }}
                transition={{ duration: transitionDuration, ease: "easeInOut" }}
                className="flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-rose-soft via-honey-soft to-sage-soft shadow-warm"
              >
                <div className="h-40 w-40 rounded-full bg-white/40 backdrop-blur-sm" />
              </motion.div>

              <p className="mt-12 text-xs uppercase tracking-widest text-ink-muted">
                Round {Math.min(cycle + 1, DEFAULT_CYCLES)} of {DEFAULT_CYCLES}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center"
            >
              <h2 className="mb-2 font-serif text-3xl font-medium text-ink">
                Done — how do you feel?
              </h2>
              <p className="mb-10 max-w-xs text-sm text-ink-soft">
                No right answer. Just notice.
              </p>

              <div className="flex w-full max-w-xs flex-col gap-3">
                <button
                  onClick={onClose}
                  className="rounded-2xl bg-white/80 py-4 text-base text-ink shadow-soft transition active:scale-[0.98]"
                >
                  Better
                </button>
                <button
                  onClick={onClose}
                  className="rounded-2xl bg-white/80 py-4 text-base text-ink shadow-soft transition active:scale-[0.98]"
                >
                  Same
                </button>
                <button
                  onClick={() => {
                    setPhaseIdx(0);
                    setCycle(0);
                    setCount(PHASE_SECONDS);
                    setDone(false);
                  }}
                  className="rounded-2xl bg-white/80 py-4 text-base text-ink shadow-soft transition active:scale-[0.98]"
                >
                  Want another round
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pointer-events-none">
        <SausageDog mood="idle" message={intro} size={110} floating />
      </div>
    </div>
  );
}
