"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Worry } from "@/lib/types";
import { ReflectFlow } from "@/components/exercises/ReflectFlow";

interface Props {
  open: boolean;
  onClose: () => void;
  recentWorries: Worry[];
}

export function ReflectPickerModal({ open, onClose, recentWorries }: Props) {
  const [chosen, setChosen] = useState<Worry | null>(null);
  const [standalone, setStandalone] = useState(false);

  const close = () => {
    setChosen(null);
    setStandalone(false);
    onClose();
  };

  const flowOpen = chosen !== null || standalone;

  return (
    <>
      <AnimatePresence>
        {open && !flowOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end justify-center bg-ink/30 px-4 pb-6 pt-20 backdrop-blur-sm sm:items-center sm:pb-20"
            onClick={onClose}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl bg-cream-50 p-5 shadow-warm"
            >
              <h2 className="mb-1 font-serif text-2xl font-medium text-ink">
                Look at a thought
              </h2>
              <p className="mb-4 text-sm text-ink-soft">
                Pick a recent worry, or just sit with something.
              </p>

              <div className="space-y-2">
                {recentWorries.length > 0 && (
                  <div className="mb-2 text-xs uppercase tracking-widest text-ink-muted">
                    Recent worries
                  </div>
                )}
                {recentWorries.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setChosen(w)}
                    className="block w-full rounded-2xl bg-white/80 px-4 py-3 text-left shadow-soft transition active:scale-[0.98]"
                  >
                    <div className="font-serif text-base text-ink">{w.title}</div>
                    <div className="text-xs text-ink-soft">
                      Intensity {w.intensity_initial}/10
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-3 border-t border-cream-200 pt-3">
                <button
                  onClick={() => setStandalone(true)}
                  className="block w-full rounded-2xl bg-white/80 px-4 py-3 text-left shadow-soft transition active:scale-[0.98]"
                >
                  <div className="font-serif text-base text-ink">
                    Just sit with a thought
                  </div>
                  <div className="text-xs text-ink-soft">
                    No worry attached.
                  </div>
                </button>
              </div>

              <button
                onClick={onClose}
                className="mt-4 w-full rounded-2xl bg-white/60 py-3 text-sm text-ink-soft"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReflectFlow open={flowOpen} onClose={close} worry={chosen} />
    </>
  );
}
