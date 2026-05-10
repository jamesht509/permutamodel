import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, target_user_id, data } = body;

    let result;

    switch (action) {
      case "ban_user": {
        const { error } = await adminClient
          .from("profiles")
          .update({ is_banned: data.is_banned })
          .eq("id", target_user_id);
        if (error) throw error;
        result = { success: true, message: data.is_banned ? "User banned" : "User unbanned" };
        break;
      }

      case "change_plan": {
        const { error } = await adminClient
          .from("profiles")
          .update({ plan: data.plan })
          .eq("id", target_user_id);
        if (error) throw error;
        result = { success: true, message: `Plan changed to ${data.plan}` };
        break;
      }

      case "verify_user": {
        const { error } = await adminClient
          .from("profiles")
          .update({ verified_level: data.verified_level })
          .eq("id", target_user_id);
        if (error) throw error;
        result = { success: true, message: `Verification set to ${data.verified_level}` };
        break;
      }

      case "update_report": {
        const { error } = await adminClient
          .from("reports")
          .update({ status: data.status, admin_notes: data.admin_notes || null })
          .eq("id", data.report_id);
        if (error) throw error;
        result = { success: true, message: `Report ${data.status}` };
        break;
      }

      case "get_metrics": {
        const { count: totalUsers } = await adminClient.from("profiles").select("*", { count: "exact", head: true });
        const { count: totalSessions } = await adminClient.from("sessions").select("*", { count: "exact", head: true });
        const { count: totalCastings } = await adminClient.from("casting_calls").select("*", { count: "exact", head: true });
        const { count: totalReviews } = await adminClient.from("reviews").select("*", { count: "exact", head: true });
        const { count: pendingReports } = await adminClient.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending");

        // Active last 24h
        const yesterday = new Date(Date.now() - 86400000).toISOString();
        const { count: activeToday } = await adminClient.from("profiles").select("*", { count: "exact", head: true }).gt("last_active", yesterday);

        // New this week
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        const { count: newThisWeek } = await adminClient.from("profiles").select("*", { count: "exact", head: true }).gt("created_at", weekAgo);

        result = { totalUsers, totalSessions, totalCastings, totalReviews, pendingReports, activeToday, newThisWeek };
        break;
      }

      case "get_users": {
        const page = data?.page || 0;
        const pageSize = 50;
        let query = adminClient
          .from("profiles")
          .select("id, name, email, role, plan, verified_level, is_banned, created_at, last_active, avatar_url, city, state, user_level, total_sessions, rating_avg")
          .order("created_at", { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (data?.search) {
          query = query.or(`name.ilike.%${data.search}%,email.ilike.%${data.search}%`);
        }
        const { data: users, error } = await query;
        if (error) throw error;
        result = users;
        break;
      }

      case "get_reports": {
        const { data: reports, error } = await adminClient
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) throw error;

        // Get reporter and reported names
        const userIds = [...new Set(reports?.flatMap(r => [r.reporter_id, r.reported_id]) || [])];
        const { data: profiles } = await adminClient
          .from("profiles")
          .select("id, name, email, avatar_url")
          .in("id", userIds);
        const profileMap = Object.fromEntries(profiles?.map(p => [p.id, p]) || []);

        result = reports?.map(r => ({
          ...r,
          reporter: profileMap[r.reporter_id] || null,
          reported: profileMap[r.reported_id] || null,
        }));
        break;
      }

      case "get_feedback": {
        const { data: feedbacks, error } = await adminClient
          .from("feedback")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) throw error;

        const userIds = [...new Set(feedbacks?.map(f => f.user_id) || [])];
        const { data: profiles } = await adminClient
          .from("profiles")
          .select("id, name, email, avatar_url")
          .in("id", userIds);
        const profileMap = Object.fromEntries(profiles?.map(p => [p.id, p]) || []);

        result = feedbacks?.map(f => ({
          ...f,
          user: profileMap[f.user_id] || null,
        }));
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
