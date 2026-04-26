"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SausageDog } from "@/components/SausageDog";
import { BreatheModal } from "@/components/exercises/BreatheModal";
import { GroundModal } from "@/components/exercises/GroundModal";
import { KindActModal } from "@/components/exercises/KindActModal";
import { ReflectFlow } from "@/components/exercises/ReflectFlow";
import {
  buildOffer,
  type DogOffer as DogOfferType,
  type OfferContext,
  type ToolKind,
} from "@/lib/dogOffers";

interface Props {
  context: OfferContext;
  onAccept?: () => void;
  onDismiss?: () => void;
  /**
   * Called when the chosen tool's flow has fully closed (after Accept).
   * Useful to continue a parent flow.
   */
  onToolClosed?: () => void;
}

export function DogOffer({
  context,
  onAccept,
  onDismiss,
  onToolClosed,
}: Props) {
  const offer = useMemo<DogOfferType | null>(() => buildOffer(context), [context]);
  const [visible, setVisible] = useState(true);
  const [openTool, setOpenTool] = useState<ToolKind | null>(null);

  if (!offer) return null;

  const handleAccept = () => {
    setOpenTool(offer.primaryAction.tool);
    onAccept?.();
  };

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  const handleToolClose = () => {
    setOpenTool(null);
    setVisible(false);
    onToolClosed?.();
  };

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="rounded-3xl bg-white/85 p-4 shadow-warm"
          >
            <div className="flex items-start gap-3">
              <SausageDog mood="tilt" size={70} />
              <div className="flex-1">
                <p className="font-serif italic text-ink">{offer.message}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 rounded-2xl bg-white/70 py-3 text-sm font-medium text-ink-soft shadow-soft transition active:scale-[0.98]"
              >
                {offer.dismissLabel}
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 rounded-2xl bg-white/70 py-3 text-sm font-medium text-ink shadow-soft transition active:scale-[0.98]"
              >
                {offer.primaryAction.label}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BreatheModal open={openTool === "breathe"} onClose={handleToolClose} />
      <GroundModal open={openTool === "ground"} onClose={handleToolClose} />
      <KindActModal open={openTool === "kind_act"} onClose={handleToolClose} />
      <ReflectFlow
        open={openTool === "reflect"}
        onClose={handleToolClose}
        worry={null}
      />
    </>
  );
}
