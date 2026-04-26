"use client";

import { useState } from "react";
import { BreatheModal } from "@/components/exercises/BreatheModal";
import { GroundModal } from "@/components/exercises/GroundModal";
import { ReflectPickerModal } from "@/components/exercises/ReflectPickerModal";
import type { Worry } from "@/lib/types";

interface Props {
  recentWorries?: Worry[];
}

export function QuickTools({ recentWorries = [] }: Props) {
  const [open, setOpen] = useState<"breathe" | "ground" | "reflect" | null>(
    null,
  );

  return (
    <>
      <div className="mb-5 flex gap-2">
        <ToolButton label="Breathe" onClick={() => setOpen("breathe")}>
          <BreatheIcon />
        </ToolButton>
        <ToolButton label="Ground" onClick={() => setOpen("ground")}>
          <GroundIcon />
        </ToolButton>
        <ToolButton label="Reflect" onClick={() => setOpen("reflect")}>
          <ReflectIcon />
        </ToolButton>
      </div>

      <BreatheModal open={open === "breathe"} onClose={() => setOpen(null)} />
      <GroundModal open={open === "ground"} onClose={() => setOpen(null)} />
      <ReflectPickerModal
        open={open === "reflect"}
        onClose={() => setOpen(null)}
        recentWorries={recentWorries}
      />
    </>
  );
}

function ToolButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl bg-white/80 px-2 py-3 shadow-soft transition active:scale-[0.98] ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <span className="text-ink-soft">{children}</span>
      <span className="text-xs font-medium text-ink">{label}</span>
    </button>
  );
}

function BreatheIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.55"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function GroundIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4v10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7 14c0 3 2.5 5 5 5s5-2 5-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="12" cy="4" r="1.6" fill="currentColor" />
    </svg>
  );
}

function ReflectIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 9c0-2.2 2.2-4 5-4h4c2.8 0 5 1.8 5 4v3c0 2.2-2.2 4-5 4h-3l-3 3v-3.4C5.8 14.9 5 13.5 5 12V9z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
