"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface ModeToggleProps {
  active: "lottie" | "brad";
}

export function ModeToggle({ active }: ModeToggleProps) {
  return (
    <div className="relative flex items-center rounded-full bg-white/80 p-1 shadow-soft backdrop-blur">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        className={`absolute top-1 bottom-1 rounded-full ${
          active === "lottie"
            ? "left-1 right-[50%] bg-rose"
            : "left-[50%] right-1 bg-honey-deep"
        }`}
        style={{ width: "calc(50% - 4px)" }}
      />
      <Link
        href="/lottie"
        className={`relative z-10 flex-1 rounded-full px-4 py-2 text-center text-sm font-medium transition-colors ${
          active === "lottie" ? "text-white" : "text-ink-soft"
        }`}
      >
        Lottie
      </Link>
      <Link
        href="/brad"
        className={`relative z-10 flex-1 rounded-full px-4 py-2 text-center text-sm font-medium transition-colors ${
          active === "brad" ? "text-white" : "text-ink-soft"
        }`}
      >
        Brad
      </Link>
    </div>
  );
}
