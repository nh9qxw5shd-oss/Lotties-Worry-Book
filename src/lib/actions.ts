"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

interface CreateWorryInput {
  title: string;
  description?: string;
  feelings?: string;
  emotion_tags: string[];
  intensity_initial: number;
  can_act_on: boolean;
  action_needed?: string;
  set_down_note?: string;
}

export async function createWorry(input: CreateWorryInput) {
  const supabase = createClient();
  const status = input.can_act_on ? "new" : "set_down";
  const completed_at = !input.can_act_on ? new Date().toISOString() : null;

  const { error } = await supabase.from("lwb_worries").insert({
    title: input.title,
    description: input.description || null,
    feelings: input.feelings || null,
    emotion_tags: input.emotion_tags,
    intensity_initial: input.intensity_initial,
    can_act_on: input.can_act_on,
    action_needed: input.action_needed || null,
    set_down_note: input.set_down_note || null,
    status,
    completed_at,
  });

  if (error) return { error: error.message };
  revalidatePath("/lottie");
  revalidatePath("/brad");
  revalidatePath("/");
  return { ok: true };
}

export async function markSeen(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("lwb_worries")
    .update({ status: "seen", seen_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "new");
  if (error) return { error: error.message };
  revalidatePath("/brad");
  revalidatePath("/lottie");
}

export async function addPromise(id: string, promise: string, eta: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("lwb_worries")
    .update({
      brads_promise: promise,
      brads_promise_eta: eta || null,
      promised_at: new Date().toISOString(),
      status: "in_progress",
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/brad");
  revalidatePath("/lottie");
}

export async function markDone(id: string, intensity_resolved: number | null) {
  const supabase = createClient();
  const { error } = await supabase
    .from("lwb_worries")
    .update({
      status: "done",
      completed_at: new Date().toISOString(),
      intensity_resolved,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/brad");
  revalidatePath("/lottie");
}

export async function reopenWorry(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("lwb_worries")
    .update({ status: "new", completed_at: null, intensity_resolved: null })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/brad");
  revalidatePath("/lottie");
}

export async function deleteWorry(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("lwb_worries").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/brad");
  revalidatePath("/lottie");
}

interface CreateReflectionInput {
  worry_id?: string | null;
  question: string;
  answer: string;
}

export async function createReflection(input: CreateReflectionInput) {
  const supabase = createClient();
  const answer = input.answer.trim();
  if (!answer) return { ok: true };

  const { error } = await supabase.from("lwb_reflections").insert({
    worry_id: input.worry_id ?? null,
    question: input.question,
    answer,
  });
  if (error) return { error: error.message };
  revalidatePath("/lottie");
  return { ok: true };
}

export async function getReflections(worry_id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lwb_reflections")
    .select("*")
    .eq("worry_id", worry_id)
    .order("created_at", { ascending: false });
  if (error) return { error: error.message, data: [] };
  return { data: data ?? [] };
}

interface SettingsInput {
  dog_name?: string | null;
  worry_time_enabled?: boolean;
  worry_time_hour?: number;
  show_companion?: boolean;
}

export async function upsertSettings(input: SettingsInput) {
  const supabase = createClient();
  const { error } = await supabase
    .from("lwb_settings")
    .update(input)
    .eq("id", 1);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
