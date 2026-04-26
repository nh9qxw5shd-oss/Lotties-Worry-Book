"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export type DogMood =
  | "idle"
  | "wag"
  | "tilt"
  | "curl"
  | "peek"
  | "happy";

interface SausageDogProps {
  mood?: DogMood;
  message?: string;
  name?: string | null;
  size?: number;
  onDismiss?: () => void;
  /** Pin to bottom-right of screen as floating companion */
  floating?: boolean;
}

export function SausageDog({
  mood = "idle",
  message,
  name,
  size = 140,
  onDismiss,
  floating = false,
}: SausageDogProps) {
  const [showBubble, setShowBubble] = useState(true);

  useEffect(() => {
    if (!message) return;
    setShowBubble(true);
    const t = setTimeout(() => setShowBubble(false), 6500);
    return () => clearTimeout(t);
  }, [message]);

  // Animation variants per mood
  const bodyAnim = (() => {
    switch (mood) {
      case "wag":
        return { y: [0, -2, 0], transition: { duration: 0.6, repeat: 3 } };
      case "happy":
        return { y: [0, -8, 0], transition: { duration: 0.5, repeat: 2 } };
      case "curl":
        return { scale: 0.9 };
      default:
        return {
          y: [0, -1.5, 0],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        };
    }
  })();

  const tailAnim = (() => {
    switch (mood) {
      case "wag":
      case "happy":
        return {
          rotate: [-15, 35, -15],
          transition: { duration: 0.35, repeat: Infinity, ease: "easeInOut" },
        };
      default:
        return {
          rotate: [-10, 5, -10],
          transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
        };
    }
  })();

  const headAnim = (() => {
    if (mood === "tilt") return { rotate: -12 };
    if (mood === "curl") return { rotate: 25 };
    return { rotate: 0 };
  })();

  const eyeShape = mood === "curl" || mood === "peek" ? 0.2 : 1;

  const wrapper = floating
    ? "fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2"
    : "flex flex-col items-center gap-3";

  return (
    <div className={wrapper} aria-hidden={false}>
      <AnimatePresence>
        {message && showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className={`relative max-w-[260px] rounded-3xl bg-white px-5 py-3 text-[15px] leading-snug text-ink shadow-warm ${
              floating ? "mr-2" : ""
            }`}
            onClick={() => setShowBubble(false)}
          >
            <p className="font-serif italic">{message}</p>
            {name && (
              <p className="mt-1 text-xs font-medium tracking-wide text-ink-muted">
                — {name}
              </p>
            )}
            <span
              className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 bg-white"
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative cursor-pointer select-none"
        style={{ width: size, height: size * 0.75 }}
        animate={bodyAnim}
        onClick={() => onDismiss?.()}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          viewBox="0 0 200 150"
          className="h-full w-full overflow-visible"
          fill="none"
        >
          {/* shadow */}
          <ellipse
            cx="100"
            cy="138"
            rx="68"
            ry="6"
            fill="rgba(58,46,42,0.12)"
          />

          {/* tail */}
          <motion.g style={{ originX: "172px", originY: "70px" }} animate={tailAnim}>
            <path
              d="M 168 70 Q 188 56 184 30"
              stroke="#D89B9E"
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>

          {/* back legs */}
          <rect x="118" y="100" width="14" height="30" rx="7" fill="#B57579" />
          <rect x="142" y="100" width="14" height="30" rx="7" fill="#B57579" />

          {/* body */}
          <rect x="42" y="62" width="138" height="50" rx="25" fill="#D89B9E" />

          {/* spot */}
          <ellipse cx="120" cy="80" rx="14" ry="9" fill="#B57579" opacity="0.5" />

          {/* front legs */}
          <rect x="48" y="100" width="14" height="30" rx="7" fill="#B57579" />
          <rect x="72" y="100" width="14" height="30" rx="7" fill="#B57579" />

          {/* head group */}
          <motion.g style={{ originX: "55px", originY: "70px" }} animate={headAnim}>
            {/* ear (back) */}
            <path
              d="M 60 36 Q 78 30 80 60 Q 70 70 56 64 Z"
              fill="#B57579"
            />
            {/* head */}
            <ellipse cx="50" cy="68" rx="34" ry="30" fill="#D89B9E" />
            {/* snout */}
            <ellipse cx="22" cy="78" rx="14" ry="9" fill="#E8C4C8" />
            {/* nose */}
            <ellipse cx="13" cy="76" rx="4.5" ry="3.8" fill="#3A2E2A" />
            {/* mouth */}
            <path
              d="M 18 82 Q 22 86 28 84"
              stroke="#3A2E2A"
              strokeWidth="1.4"
              strokeLinecap="round"
              fill="none"
            />
            {/* eye */}
            <motion.ellipse
              cx="46"
              cy="64"
              rx="3.5"
              ry={3.5 * eyeShape}
              fill="#3A2E2A"
              animate={{ ry: [3.5, 0.5, 3.5] }}
              transition={{
                duration: 0.25,
                repeat: Infinity,
                repeatDelay: 4,
                ease: "easeInOut",
              }}
            />
            {/* eye highlight */}
            {mood !== "curl" && (
              <circle cx="47.2" cy="62.8" r="0.9" fill="#fff" />
            )}
            {/* ear (front, floppy) */}
            <motion.path
              d="M 38 38 Q 56 30 70 58 Q 56 76 36 64 Z"
              fill="#B57579"
              animate={
                mood === "wag" || mood === "happy"
                  ? { rotate: [0, -6, 0] }
                  : { rotate: 0 }
              }
              style={{ originX: "50px", originY: "44px" }}
              transition={{
                duration: 0.4,
                repeat: mood === "wag" || mood === "happy" ? Infinity : 0,
              }}
            />
            {/* cheek blush */}
            <ellipse cx="36" cy="78" rx="5" ry="3" fill="#E8B4B8" opacity="0.6" />
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}

/** Pick a random line from a category */
export function pickLine(lines: readonly string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}
