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

  // Expire castings older than 30 days or past expires_at
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Expire by expires_at
  const { data: expired1 } = await supabase
    .from("casting_calls")
    .update({ status: "expired" })
    .eq("status", "open")
    .lt("expires_at", new Date().toISOString())
    .select("id");

  // Expire old castings without expires_at
  const { data: expired2 } = await supabase
    .from("casting_calls")
    .update({ status: "expired" })
    .eq("status", "open")
    .is("expires_at", null)
    .lt("created_at", thirtyDaysAgo)
    .select("id");

  const total = (expired1?.length ?? 0) + (expired2?.length ?? 0);

  return new Response(
    JSON.stringify({ expired: total }),
    { headers: { "Content-Type": "application/json" } }
  );
});
