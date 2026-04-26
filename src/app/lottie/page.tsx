import { createClient } from "@/lib/supabase/server";
import { LottieBoardClient } from "./LottieBoardClient";
import type { Worry } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LottieBoardPage() {
  const supabase = createClient();
  const { data: worries } = await supabase
    .from("lwb_worries")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: settings } = await supabase
    .from("lwb_settings")
    .select("dog_name")
    .eq("id", 1)
    .maybeSingle();

  return (
    <LottieBoardClient
      worries={(worries ?? []) as Worry[]}
      dogName={settings?.dog_name ?? null}
    />
  );
}
