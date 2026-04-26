import { DOG_LINES } from "@/lib/types";
import { pickLine } from "@/components/SausageDog";

export type OfferContext =
  | { kind: "high_intensity_capture"; intensity: number }
  | { kind: "after_set_down" }
  | { kind: "after_save" }
  | { kind: "recent_capture_burst"; countLast60min: number };

export type ToolKind = "breathe" | "ground" | "reflect" | "kind_act";

export interface DogOffer {
  message: string;
  primaryAction: { label: string; tool: ToolKind };
  dismissLabel: string;
}

/**
 * Conservative offer logic — better to under-trigger than over-trigger.
 * Returns null when the context shouldn't surface an offer.
 */
export function buildOffer(ctx: OfferContext): DogOffer | null {
  switch (ctx.kind) {
    case "high_intensity_capture":
      if (ctx.intensity < 8) return null;
      return {
        message: pickLine(DOG_LINES.highIntensity),
        primaryAction: { label: "Try grounding", tool: "ground" },
        dismissLabel: "Not now",
      };

    case "recent_capture_burst":
      if (ctx.countLast60min < 3) return null;
      return {
        message: pickLine(DOG_LINES.captureBurst),
        primaryAction: { label: "Try it", tool: "breathe" },
        dismissLabel: "Not now",
      };

    case "after_set_down":
      return {
        message: pickLine(DOG_LINES.afterSetDown),
        primaryAction: { label: "Try it", tool: "kind_act" },
        dismissLabel: "Not now",
      };

    case "after_save":
      // Don't be Clippy. No offer for normal saves.
      return null;
  }
}
