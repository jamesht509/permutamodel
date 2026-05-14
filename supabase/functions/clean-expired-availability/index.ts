import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const expected = Deno.env.get("CRON_SECRET");
  if (!expected) {
    console.error("CRON_SECRET not configured");
    return new Response("Misconfigured", { status: 500 });
  }
  if (req.headers.get("x-cron-secret") !== expected) {
    return new Response("Forbidden", { status: 403 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase
    .from("profiles")
    .update({
      available_now: false,
      available_until: null,
      availability_note: null,
    })
    .eq("available_now", true)
    .lt("available_until", new Date().toISOString())
    .select("id");

  return new Response(
    JSON.stringify({ cleaned: data?.length ?? 0, error: error?.message }),
    { headers: { "Content-Type": "application/json" } }
  );
});
