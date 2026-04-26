export type WorryStatus = "new" | "seen" | "in_progress" | "done" | "set_down";

export interface Worry {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  feelings: string | null;
  emotion_tags: string[];
  intensity_initial: number;
  intensity_resolved: number | null;
  can_act_on: boolean;
  action_needed: string | null;
  set_down_note: string | null;
  brads_promise: string | null;
  brads_promise_eta: string | null;
  promised_at: string | null;
  status: WorryStatus;
  seen_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  owner_id: string;
  dog_name: string | null;
  worry_time_enabled: boolean;
  worry_time_hour: number;
  show_companion: boolean;
}

export const EMOTION_OPTIONS = [
  "anxious",
  "sad",
  "frustrated",
  "overwhelmed",
  "tired",
  "scared",
  "lonely",
  "stuck",
] as const;

export type Emotion = (typeof EMOTION_OPTIONS)[number];

// Rotating dog lines, organised by mood/context.
// Tone rule: reflect & validate, never minimise.
export const DOG_LINES = {
  greeting: [
    "Hi. I'm here whenever you want to put something down.",
    "Glad you're here. No rush.",
    "Take your time. I'll be here.",
  ],
  beforeNew: [
    "Whatever's on your mind — let's get it out of your head and onto the page.",
    "Just write it as it comes. Doesn't have to be tidy.",
    "Putting it into words is the brave bit.",
  ],
  afterSave: [
    "That's down now. Brad will see it soon.",
    "It's out of your head and on the board. Well done.",
    "Good. One less thing rattling around.",
  ],
  setDown: [
    "That one can rest here. You don't have to carry it.",
    "Set down doesn't mean ignored — it means released.",
    "It's okay to let this one be.",
  ],
  bradPromised: [
    "Brad's on it.",
    "There's a plan now. Breathe.",
    "Brad's got this one.",
  ],
  done: [
    "Done. That happened. Real evidence.",
    "Notice how you feel now versus when you wrote this.",
    "One off the board.",
  ],
};
