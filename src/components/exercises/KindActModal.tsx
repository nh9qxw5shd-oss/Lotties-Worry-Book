"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SausageDog, pickLine } from "@/components/SausageDog";
import { DOG_LINES } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface KindAct {
  label: string;
  detail: string;
  emoji: string;
}

const ACTS: KindAct[] = [
  { label: "A glass of water", detail: "Slow sips.", emoji: "🥛" },
  { label: "Step outside for 60 seconds", detail: "Just air.", emoji: "🌿" },
  { label: "Message someone you love", detail: "Even one line.", emoji: "💌" },
  { label: "Put the kettle on", detail: "Make a proper one.", emoji: "🫖" },
  { label: "Stretch", detail: "Wherever you are.", emoji: "🤸" },
];

type Phase = "pick" | "doing" | "back";

export function KindActModal({ open, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("pick");
  const [chosen, setChosen] = useState<KindAct | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [waitLine] = useState(() => pickLine(DOG_LINES.kindActs));

  useEffect(() => {
    if (!open) {
      setPhase("pick");
      setChosen(null);
      setSecondsLeft(30);
    }
  }, [open]);

  useEffect(() => {
    if (phase !== "doing") return;
    setSecondsLeft(30);
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setPhase("back");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  if (!open) return null;

  const handleClose = () => {
    setPhase("pick");
    setChosen(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-cream-50 via-lavender-soft/40 to-sage-soft/40">
      <div className="flex items-center justify-end px-5 pt-6">
        <button
          onClick={handleClose}
          className="flex h-12 items-center justify-center rounded-2xl bg-white/80 px-5 text-sm font-medium text-ink shadow-soft transition active:scale-[0.98]"
        >
          Close
        </button>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-10">
        <AnimatePresence mode="wait">
          {phase === "pick" && (
            <motion.section
              key="pick"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-2 flex flex-col"
            >
              <div className="mb-6">
                <SausageDog mood="tilt" size={100} />
              </div>
              <h2 className="mb-2 font-serif text-3xl font-medium leading-tight text-ink">
                One small kind thing.
              </h2>
              <p className="mb-6 text-sm text-ink-soft">
                Pick whichever feels easiest. None of these are required.
              </p>

              <div className="space-y-2">
                {ACTS.map((a) => (
                  <button
                    key={a.label}
                    onClick={() => {
                      setChosen(a);
                      setPhase("doing");
                    }}
                    className="flex w-full items-start gap-3 rounded-2xl bg-white/80 px-4 py-3 text-left shadow-soft transition active:scale-[0.98]"
                  >
                    <span className="text-2xl">{a.emoji}</span>
                    <span className="flex-1">
                      <span className="block font-serif text-base text-ink">
                        {a.label}
                      </span>
                      <span className="block text-xs text-ink-soft">
                        {a.detail}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {phase === "doing" && (
            <motion.section
              key="doing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-1 flex-col items-center justify-center text-center"
            >
              <SausageDog mood="curl" size={140} message={waitLine} />
              <h2 className="mt-6 font-serif text-3xl font-medium text-ink">
                Go on then. I&rsquo;ll wait.
              </h2>
              {chosen && (
                <p className="mt-2 text-sm text-ink-soft">{chosen.label}.</p>
              )}
              <p className="mt-8 font-serif text-2xl text-ink">{secondsLeft}s</p>
              <button
                onClick={() => setPhase("back")}
                className="mt-10 w-full max-w-xs rounded-2xl bg-white/80 py-4 text-base text-ink shadow-soft transition active:scale-[0.98]"
              >
                Done
              </button>
            </motion.section>
          )}

          {phase === "back" && (
            <motion.section
              key="back"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-1 flex-col items-center justify-center text-center"
            >
              <SausageDog
                mood="happy"
                size={140}
                message={pickLine(DOG_LINES.afterTool)}
              />
              <h2 className="mt-6 font-serif text-3xl font-medium text-ink">
                Welcome back.
              </h2>
              <button
                onClick={handleClose}
                className="mt-10 w-full max-w-xs rounded-2xl bg-white/80 py-4 text-base text-ink shadow-soft transition active:scale-[0.98]"
              >
                Close
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
