import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("lwb_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  return (
    <SettingsClient
      initial={
        data ?? {
          dog_name: null,
          worry_time_enabled: false,
          worry_time_hour: 19,
          show_companion: true,
        }
      }
    />
  );
}
