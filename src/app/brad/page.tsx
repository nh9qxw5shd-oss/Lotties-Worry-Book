import { createClient } from "@/lib/supabase/server";
import { BradViewClient } from "./BradViewClient";
import type { Worry } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BradViewPage() {
  const supabase = createClient();
  const { data: worries } = await supabase
    .from("lwb_worries")
    .select("*")
    .order("created_at", { ascending: false });

  return <BradViewClient worries={(worries ?? []) as Worry[]} />;
}
