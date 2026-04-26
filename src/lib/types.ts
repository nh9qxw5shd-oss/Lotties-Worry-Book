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

export interface Reflection {
  id: string;
  worry_id: string | null;
  question: string;
  answer: string | null;
  created_at: string;
  updated_at: string;
}

export const SOCRATIC_QUESTIONS = [
  "What's the evidence for this thought?",
  "What's the evidence against it?",
  "Is there another way to look at this?",
  "What would I tell a friend who said this to me?",
  "What's the worst that could happen — and could I cope with it?",
  "Will this matter in a week? A month? A year?",
  "What would a fair, balanced version of this thought sound like?",
] as const;

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
  breathe: [
    "I'll breathe with you.",
    "Slow is fine. There's no rush.",
    "Just follow the circle.",
  ],
  ground: [
    "Let's come back to the room together.",
    "One sense at a time.",
    "You don't have to write anything if you don't want to.",
  ],
  afterTool: [
    "Welcome back.",
    "Notice anything shift?",
    "That counted.",
  ],
  reflect: [
    "Just one question at a time.",
    "Skip any that don't fit.",
    "There's no right answer.",
  ],
  highIntensity: [
    "That one's heavy. Want to ground first?",
    "Before we go on — want a moment to settle?",
  ],
  afterSetDown: [
    "Want to do one small kind thing for yourself?",
    "Setting down deserves a small reward.",
  ],
  captureBurst: [
    "Lots came up today. Want a pause?",
    "You've put a lot down. Maybe a breath?",
  ],
  kindActs: [
    "I'll wait right here.",
    "Go on. The board can wait.",
    "Take your time.",
  ],
};
