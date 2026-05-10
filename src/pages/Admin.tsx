import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Users, BarChart3, Flag, Search, Ban, Shield, Crown,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, Eye,
  Camera, Megaphone, MessageCircle, Star, Calendar, MapPin, Zap,
  ToggleLeft, ToggleRight, UserX, UserCheck, Trash2, RefreshCw,
  Globe, Database, Activity, Clock, Mail, ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Tab = "overview" | "users" | "content" | "messages" | "reports";

export default function Admin() {
  const { isAdmin, loading, adminAction } = useAdmin();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");

  if (loading) return <div className="min-h-[100dvh] flex items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAdmin) return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background gap-4">
      <Shield className="w-16 h-16 text-destructive" />
      <h1 className="font-heading text-xl font-bold text-foreground">Access Denied</h1>
      <p className="font-body text-sm text-muted-foreground">You don't have admin privileges.</p>
      <button onClick={() => navigate("/discover")} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-body">Go Home</button>
    </div>
  );

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "content", label: "Content", icon: Megaphone },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "reports", label: "Reports", icon: Flag },
  ];

  return (
    <div className="min-h-screen bg-background pb-2 md:pb-8">
      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-card transition-colors"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
        <div className="flex-1">
          <h1 className="font-heading text-lg font-bold text-foreground">Super Admin</h1>
          <p className="font-body text-[10px] text-muted-foreground">Full system control</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="font-body text-[10px] text-green-400 font-semibold">LIVE</span>
        </div>
      </div>
      <div className="flex border-b border-border overflow-x-auto scrollbar-hide">
        {tabs.map(t => { const Icon = t.icon; return (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-5 py-3 text-sm font-body whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? "border-primary text-primary font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Icon className="w-4 h-4" />{t.label}
          </button>
        ); })}
      </div>
      <div className="p-4 max-w-4xl mx-auto">
        {tab === "overview" && <OverviewTab />}
        {tab === "users" && <UsersTab adminAction={adminAction} />}
        {tab === "content" && <ContentTab />}
        {tab === "messages" && <MessagesTab />}
        {tab === "reports" && <ReportsTab adminAction={adminAction} />}
      </div>
    </div>
  );
}

function Loader() { return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>; }

function OverviewTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [liveCount, setLiveCount] = useState(0);
  const load = async () => {
    setLoading(true);
    const q = (t: string, f?: any) => { let b = (supabase.from as any)(t).select("*", { count: "exact", head: true }); if (f) b = f(b); return b; };
    const [a,b,c,d,e,f,g,h,i,j,k,l] = await Promise.all([
      q("profiles"), q("profiles", (b:any) => b.gte("last_active", new Date(Date.now()-86400000).toISOString())),
      q("profiles", (b:any) => b.eq("is_seed", true)), q("profiles", (b:any) => b.eq("is_banned", true)),
      q("sessions"), q("casting_calls"), q("tfp_requests"),
      q("tfp_requests", (b:any) => b.eq("status", "pending")),
      q("reviews"), q("messages"), q("photos"),
      q("reports", (b:any) => b.eq("status", "pending")),
    ]);
    setStats({ totalUsers: a.count, activeUsers: b.count, seedUsers: c.count, bannedUsers: d.count, totalSessions: e.count, totalCastings: f.count, totalRequests: g.count, pendingRequests: h.count, totalReviews: i.count, totalMessages: j.count, totalPhotos: k.count, pendingReports: l.count });
    const { data: recent } = await supabase.from("profiles").select("id, name, email, avatar_url, role, city, state, created_at, is_seed, device_type, signup_country").order("created_at", { ascending: false }).limit(20);
    setRecentUsers(recent || []);
    const { count: live } = await supabase.from("profiles").select("*", { count: "exact", head: true }).gte("last_active", new Date(Date.now() - 5 * 60000).toISOString());
    setLiveCount(live || 0);
    setLoading(false);
  };
  useEffect(() => {
    load();
    const channel = supabase.channel("admin-live-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, (payload) => {
        const p = payload.new as any;
        setActivityFeed(prev => [{ type: "signup", text: `${p.name || p.email} signed up`, time: new Date(), data: p }, ...prev].slice(0, 30));
        setRecentUsers(prev => [p, ...prev].slice(0, 20));
        setStats((prev: any) => prev ? { ...prev, totalUsers: (prev.totalUsers || 0) + 1 } : prev);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tfp_requests" }, () => {
        setActivityFeed(prev => [{ type: "request", text: "New TFP request sent", time: new Date() }, ...prev].slice(0, 30));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        setActivityFeed(prev => [{ type: "message", text: "New message sent", time: new Date() }, ...prev].slice(0, 30));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reviews" }, () => {
        setActivityFeed(prev => [{ type: "review", text: "New review posted", time: new Date() }, ...prev].slice(0, 30));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "photos" }, () => {
        setActivityFeed(prev => [{ type: "photo", text: "Photo uploaded", time: new Date() }, ...prev].slice(0, 30));
      })
      .subscribe();
    const interval = setInterval(load, 30000);
    return () => { supabase.removeChannel(channel); clearInterval(interval); };
  }, []);
  if (loading) return <Loader />;
  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-primary" },
    { label: "Active (24h)", value: stats?.activeUsers ?? 0, icon: Activity, color: "text-green-400" },
    { label: "Seed Profiles", value: stats?.seedUsers ?? 0, icon: UserX, color: "text-yellow-400" },
    { label: "Banned", value: stats?.bannedUsers ?? 0, icon: Ban, color: "text-destructive" },
    { label: "TFP Requests", value: stats?.totalRequests ?? 0, icon: Zap, color: "text-blue-400" },
    { label: "Pending Requests", value: stats?.pendingRequests ?? 0, icon: Clock, color: "text-orange-400" },
    { label: "Sessions", value: stats?.totalSessions ?? 0, icon: Calendar, color: "text-emerald-400" },
    { label: "Castings", value: stats?.totalCastings ?? 0, icon: Megaphone, color: "text-purple-400" },
    { label: "Reviews", value: stats?.totalReviews ?? 0, icon: Star, color: "text-amber-400" },
    { label: "Messages", value: stats?.totalMessages ?? 0, icon: MessageCircle, color: "text-sky-400" },
    { label: "Photos", value: stats?.totalPhotos ?? 0, icon: Camera, color: "text-pink-400" },
    { label: "Pending Reports", value: stats?.pendingReports ?? 0, icon: AlertTriangle, color: stats?.pendingReports ? "text-destructive" : "text-muted-foreground" },
  ];
  const feedIcons: Record<string, { icon: any; color: string }> = { signup: { icon: UserCheck, color: "text-green-400 bg-green-500/10" }, request: { icon: Zap, color: "text-blue-400 bg-blue-500/10" }, message: { icon: MessageCircle, color: "text-sky-400 bg-sky-500/10" }, review: { icon: Star, color: "text-amber-400 bg-amber-500/10" }, photo: { icon: Camera, color: "text-pink-400 bg-pink-500/10" } };
  const timeSince = (d: Date) => { const s = Math.floor((Date.now() - d.getTime()) / 1000); if (s < 5) return "just now"; if (s < 60) return `${s}s ago`; if (s < 3600) return `${Math.floor(s/60)}m ago`; return `${Math.floor(s/3600)}h ago`; };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><h2 className="font-heading text-base font-bold text-foreground">System Overview</h2><div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /><span className="font-body text-[11px] text-green-400 font-semibold">{liveCount} online now</span></div></div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-body text-muted-foreground hover:text-foreground"><RefreshCw className="w-3 h-3" /> Refresh</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map(c => { const Icon = c.icon; return (<div key={c.label} className="p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors"><Icon className={`w-5 h-5 ${c.color} mb-2`} /><p className="font-heading text-2xl font-bold text-foreground">{c.value}</p><p className="font-body text-[11px] text-muted-foreground">{c.label}</p></div>); })}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3"><Activity className="w-4 h-4 text-green-400" /><h3 className="font-heading text-sm font-bold text-foreground">Live Activity</h3>{activityFeed.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-green-500/20 text-[9px] font-bold text-green-400">{activityFeed.length}</span>}</div>
          <div className="rounded-xl border border-border bg-card/30 max-h-[400px] overflow-y-auto">
            {activityFeed.length === 0 ? (<div className="p-8 text-center"><Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" /><p className="font-body text-xs text-muted-foreground">Waiting for activity...</p><p className="font-body text-[10px] text-muted-foreground/60 mt-1">Events appear here in real-time</p></div>
            ) : activityFeed.map((item, i) => { const fi = feedIcons[item.type] || feedIcons.message; const FeedIcon = fi.icon; return (
              <div key={i} className={`flex items-center gap-3 px-3 py-2.5 border-b border-border/30 last:border-0 ${i === 0 ? "bg-foreground/[0.02]" : ""}`}><div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${fi.color}`}><FeedIcon className="w-3.5 h-3.5" /></div><p className="font-body text-xs text-foreground truncate flex-1">{item.text}</p><span className="font-body text-[10px] text-muted-foreground flex-shrink-0">{timeSince(item.time)}</span></div>
            ); })}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3"><UserCheck className="w-4 h-4 text-primary" /><h3 className="font-heading text-sm font-bold text-foreground">Recent Signups</h3></div>
          <div className="rounded-xl border border-border bg-card/30 max-h-[400px] overflow-y-auto">
            {recentUsers.filter(u => !(u as any).is_seed).length === 0 ? (<div className="p-8 text-center"><Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" /><p className="font-body text-xs text-muted-foreground">No real signups yet</p></div>
            ) : recentUsers.filter(u => !(u as any).is_seed).map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 px-3 py-2.5 border-b border-border/30 last:border-0">
                {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" /> : <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">{u.name?.charAt(0) || "?"}</div>}
                <div className="flex-1 min-w-0"><div className="flex items-center gap-1.5"><p className="font-body text-xs font-semibold text-foreground truncate">{u.name || "No name"}</p><span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-primary/20 text-primary">{u.role?.toUpperCase()}</span></div><p className="font-body text-[10px] text-muted-foreground truncate">{u.city ? `${u.city}, ${u.state}` : u.email}{(u as any).device_type ? ` · ${(u as any).device_type}` : ""}{(u as any).signup_country ? ` · ${(u as any).signup_country}` : ""}</p></div>
                <p className="font-body text-[10px] text-muted-foreground flex-shrink-0">{u.created_at ? formatDistanceToNow(new Date(u.created_at), { addSuffix: true }) : ""}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersTab({ adminAction }: { adminAction: any }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all"|"seed"|"real"|"banned"|"active">("all");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string|null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let q = (supabase.from as any)("profiles").select("*").order("created_at", { ascending: false }).limit(100);
    if (search.trim()) q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`);
    if (filter === "seed") q = q.eq("is_seed", true);
    if (filter === "real") q = q.or("is_seed.is.null,is_seed.eq.false");
    if (filter === "banned") q = q.eq("is_banned", true);
    if (filter === "active") q = q.gte("last_active", new Date(Date.now()-86400000).toISOString());
    const { data } = await q;
    setUsers(data || []);
    setLoading(false);
  }, [search, filter]);

  useEffect(() => { load(); }, [filter]);

  const toggle = async (id: string, field: string, current: boolean) => {
    const { error } = await supabase.from("profiles").update({ [field]: !current } as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`${field} → ${!current}`);
    load();
  };

  const updateField = async (id: string, field: string, value: any) => {
    const { error } = await supabase.from("profiles").update({ [field]: value } as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`${field} updated`);
  };

  const changePlan = async (id: string, plan: string) => {
    try { await adminAction("change_plan", id, { plan }); toast.success(`Plan → ${plan}`); load(); } catch (e: any) { toast.error(e.message); }
  };

  const changeVerify = async (id: string, level: string) => {
    try { await adminAction("verify_user", id, { verified_level: level }); toast.success(`Verified → ${level}`); load(); } catch (e: any) { toast.error(e.message); }
  };

  const filters = [
    { id: "all" as const, label: "All", icon: Users },
    { id: "real" as const, label: "Real", icon: UserCheck },
    { id: "seed" as const, label: "Seeds", icon: UserX },
    { id: "active" as const, label: "Active", icon: Activity },
    { id: "banned" as const, label: "Banned", icon: Ban },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && load()} placeholder="Search name, email, city..." className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
        </div>
        <button onClick={load} className="px-4 py-2.5 rounded-xl gold-gradient text-primary-foreground font-body text-sm font-semibold">Go</button>
      </div>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {filters.map(f => { const Icon = f.icon; return (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-medium whitespace-nowrap transition-all ${filter === f.id ? "gold-gradient text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}>
            <Icon className="w-3 h-3" />{f.label}
          </button>
        ); })}
      </div>
      <p className="font-body text-xs text-muted-foreground">Showing <span className="text-foreground font-semibold">{users.length}</span> users</p>

      {loading ? <Loader /> : (
        <div className="space-y-2">
          {users.map(u => {
            const exp = expanded === u.id;
            const isSeed = u.is_seed === true;
            const isActive = u.is_active !== false;
            const isBanned = u.is_banned === true;
            return (
              <div key={u.id} className={`rounded-xl border overflow-hidden transition-colors ${isSeed ? "border-yellow-500/30 bg-yellow-500/[0.03]" : isBanned ? "border-destructive/30 bg-destructive/[0.03]" : !isActive ? "border-border/50 opacity-60" : "border-border bg-card/50"}`}>
                <div role="button" tabIndex={0} onClick={() => setExpanded(exp ? null : u.id)} className="w-full flex items-center gap-3 px-3 py-3 text-left cursor-pointer">
                  <div className="relative flex-shrink-0">
                    {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">{u.name?.charAt(0)}</div>}
                    {isSeed && <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[7px] text-black font-bold">S</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${u.id}`); }}
                        className="font-heading text-sm font-semibold text-foreground hover:text-primary hover:underline truncate text-left"
                      >
                        {u.name}
                      </button>
                      {isBanned && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-destructive/20 text-destructive">BANNED</span>}
                      {isSeed && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-yellow-500/20 text-yellow-400">SEED</span>}
                      {!isActive && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-muted text-muted-foreground">OFF</span>}
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${u.plan === "pro" ? "bg-primary/20 text-primary" : u.plan === "premium" ? "bg-purple-500/20 text-purple-400" : "bg-muted text-muted-foreground"}`}>{u.plan?.toUpperCase()}</span>
                    </div>
                    <p className="font-body text-[11px] text-muted-foreground truncate">{u.email} · {u.role} · {u.city || "No city"}</p>
                    <p className="font-mono text-[10px] text-muted-foreground/70 truncate">/profile/{u.id}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/profile/${u.id}`); }}
                    title="Open profile"
                    className="p-1.5 rounded-md hover:bg-foreground/5 text-muted-foreground hover:text-primary"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  {exp ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>

                {exp && (
                  <div className="px-3 pb-4 space-y-4 border-t border-border pt-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-body">
                      <div><span className="text-muted-foreground">ID:</span> <span className="text-foreground font-mono text-[10px]">{u.id.slice(0,8)}...</span></div>
                      <div><span className="text-muted-foreground">Role:</span> <span className="text-foreground">{u.role}</span></div>
                      <div><span className="text-muted-foreground">Level:</span> <span className="text-foreground">{u.user_level}</span></div>
                      <div><span className="text-muted-foreground">Verified:</span> <span className="text-foreground">{u.verified_level || "none"}</span></div>
                      <div><span className="text-muted-foreground">Profile loc:</span> <span className="text-foreground">{u.city || "—"}{u.state ? `, ${u.state}` : ""}</span></div>
                      <div><span className="text-muted-foreground">IG:</span> <span className="text-foreground">{u.instagram || "—"}</span></div>
                      <div><span className="text-muted-foreground">Joined:</span> <span className="text-foreground">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</span></div>
                      <div><span className="text-muted-foreground">Last:</span> <span className="text-foreground">{u.last_active ? formatDistanceToNow(new Date(u.last_active), { addSuffix: true }) : "Never"}</span></div>
                    </div>
                    {/* Geo & Device tracking */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-body p-2.5 rounded-lg bg-foreground/[0.02] border border-border/50">
                      <div className="col-span-2 flex items-center gap-1.5 mb-0.5"><Globe className="w-3 h-3 text-primary" /><span className="text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">Tracking</span></div>
                      <div><span className="text-muted-foreground">Signup from:</span> <span className="text-foreground">{(u as any).signup_city ? `${(u as any).signup_city}, ${(u as any).signup_country}` : "—"}</span></div>
                      <div><span className="text-muted-foreground">Current:</span> <span className="text-foreground">{(u as any).last_known_city ? `${(u as any).last_known_city}, ${(u as any).last_known_country}` : "—"}</span></div>
                      <div><span className="text-muted-foreground">Device:</span> <span className="text-foreground">{(u as any).device_type || "—"}</span></div>
                      <div><span className="text-muted-foreground">Browser:</span> <span className="text-foreground">{(u as any).browser || "—"}</span></div>
                      <div><span className="text-muted-foreground">Logins:</span> <span className="text-foreground">{(u as any).login_count ?? 0}</span></div>
                      <div><span className="text-muted-foreground">Source:</span> <span className="text-foreground">{(u as any).signup_source || "—"}</span></div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1"><label className="font-body text-[10px] text-muted-foreground block mb-1">Sessions</label><input type="number" defaultValue={u.total_sessions ?? 0} onBlur={e => updateField(u.id, "total_sessions", parseInt(e.target.value)||0)} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm font-body text-foreground" /></div>
                      <div className="flex-1"><label className="font-body text-[10px] text-muted-foreground block mb-1">Rating</label><input type="number" step="0.1" min="0" max="5" defaultValue={u.rating_avg ?? 0} onBlur={e => updateField(u.id, "rating_avg", parseFloat(e.target.value)||0)} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm font-body text-foreground" /></div>
                      <div className="flex-1"><label className="font-body text-[10px] text-muted-foreground block mb-1">Reviews</label><input type="number" defaultValue={u.total_reviews ?? 0} onBlur={e => updateField(u.id, "total_reviews", parseInt(e.target.value)||0)} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm font-body text-foreground" /></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => toggle(u.id, "is_seed", isSeed)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-body font-semibold ${isSeed ? "bg-yellow-500/20 text-yellow-400" : "bg-card border border-border text-muted-foreground"}`}>
                        {isSeed ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}{isSeed ? "Seed ✓" : "Mark Seed"}
                      </button>
                      <button onClick={() => toggle(u.id, "is_active", isActive)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-body font-semibold ${isActive ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"}`}>
                        {isActive ? <Eye className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}{isActive ? "Active" : "Inactive"}
                      </button>
                      <button onClick={() => toggle(u.id, "is_banned", isBanned)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-body font-semibold ${isBanned ? "bg-green-500/20 text-green-400" : "bg-destructive/20 text-destructive"}`}>
                        <Ban className="w-3.5 h-3.5" />{isBanned ? "Unban" : "Ban"}
                      </button>
                      <select value={u.plan||"free"} onChange={e => changePlan(u.id, e.target.value)} className="px-3 py-2 rounded-lg text-xs font-body bg-card border border-border text-foreground"><option value="free">Free</option><option value="premium">Premium</option><option value="pro">Pro</option></select>
                      <select value={u.verified_level||"none"} onChange={e => changeVerify(u.id, e.target.value)} className="px-3 py-2 rounded-lg text-xs font-body bg-card border border-border text-foreground"><option value="none">Not Verified</option><option value="email">Email</option><option value="phone">Phone</option><option value="identity">Identity</option></select>
                      <button onClick={() => window.open(`/profile/${u.id}`, "_blank")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-body font-semibold bg-card border border-border text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" />View</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {users.length === 0 && <p className="text-center text-muted-foreground text-sm font-body py-8">No users found.</p>}
        </div>
      )}
    </div>
  );
}

function ContentTab() {
  const [sub, setSub] = useState<"castings"|"requests"|"sessions">("castings");
  const [castings, setCastings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string|null>(null);
  const [castFilter, setCastFilter] = useState<"all"|"open"|"filled"|"expired"|"unapproved"|"featured">("all");
  const loadCastings = async () => { setLoading(true); let q = supabase.from("casting_calls").select("*, creator:profiles!casting_calls_creator_id_fkey(id, name, avatar_url, email)").order("created_at", { ascending: false }).limit(100); if (castFilter === "open") q = q.eq("status", "open"); if (castFilter === "filled") q = q.eq("status", "filled"); if (castFilter === "expired") q = q.eq("status", "expired"); if (castFilter === "unapproved") q = q.eq("is_approved", false); if (castFilter === "featured") q = q.eq("featured", true); const { data } = await q; setCastings(data || []); setLoading(false); };
  const loadRequests = async () => { setLoading(true); const { data } = await supabase.from("tfp_requests").select("*, sender:profiles!tfp_requests_sender_id_fkey(name, avatar_url), receiver:profiles!tfp_requests_receiver_id_fkey(name, avatar_url)").order("created_at", { ascending: false }).limit(50); setRequests(data || []); setLoading(false); };
  const loadSessions = async () => { setLoading(true); const { data } = await supabase.from("sessions").select("*, photographer:profiles!sessions_photographer_id_fkey(name), model:profiles!sessions_model_id_fkey(name)").order("created_at", { ascending: false }).limit(50); setSessions(data || []); setLoading(false); };
  const loadApplications = async (castingId: string) => { const { data } = await supabase.from("applications").select("*, applicant:profiles!applications_applicant_id_fkey(name, avatar_url, email, role, city)").eq("casting_id", castingId).order("created_at", { ascending: false }); setApplications(data || []); };
  useEffect(() => { if (sub === "castings") loadCastings(); if (sub === "requests") loadRequests(); if (sub === "sessions") loadSessions(); }, [sub, castFilter]);
  const updateCasting = async (id: string, updates: Record<string, any>) => { const { error } = await supabase.from("casting_calls").update(updates).eq("id", id); if (error) { toast.error(error.message); return; } toast.success("Casting updated"); loadCastings(); };
  const deleteCasting = async (id: string) => { if (!confirm("Delete this casting?")) return; await supabase.from("applications").delete().eq("casting_id", id); await supabase.from("casting_calls").delete().eq("id", id); toast.success("Casting deleted"); setExpanded(null); loadCastings(); };
  const updateRequest = async (id: string, status: string) => { await supabase.from("tfp_requests").update({ status }).eq("id", id); toast.success(`Request → ${status}`); loadRequests(); };
  const deleteRequest = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("tfp_requests").delete().eq("id", id); toast.success("Deleted"); loadRequests(); };
  const updateSession = async (id: string, status: string) => { await supabase.from("sessions").update({ status }).eq("id", id); toast.success(`Session → ${status}`); loadSessions(); };
  const updateApplication = async (id: string, status: string) => { await supabase.from("applications").update({ status }).eq("id", id); toast.success(`Application → ${status}`); if (expanded) loadApplications(expanded); };
  const sc = (s: string) => ({ pending: "bg-yellow-500/20 text-yellow-400", accepted: "bg-green-500/20 text-green-400", declined: "bg-destructive/20 text-destructive", completed: "bg-primary/20 text-primary", cancelled: "bg-muted text-muted-foreground", open: "bg-green-500/20 text-green-400", filled: "bg-blue-500/20 text-blue-400", expired: "bg-muted text-muted-foreground", upcoming: "bg-sky-500/20 text-sky-400" }[s] || "bg-muted text-muted-foreground");
  const subTabs = [{ id: "castings" as const, label: "Castings", icon: Megaphone }, { id: "requests" as const, label: "TFP Requests", icon: Zap }, { id: "sessions" as const, label: "Sessions", icon: Calendar }];
  const castFilters = [{ id: "all" as const, label: "All" }, { id: "open" as const, label: "Open" }, { id: "unapproved" as const, label: "Pending" }, { id: "featured" as const, label: "Featured" }, { id: "filled" as const, label: "Filled" }, { id: "expired" as const, label: "Expired" }];
  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">{subTabs.map(t => { const Icon = t.icon; return <button key={t.id} onClick={() => { setSub(t.id); setExpanded(null); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-medium whitespace-nowrap transition-all ${sub === t.id ? "gold-gradient text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}><Icon className="w-3 h-3" />{t.label}</button>; })}</div>
      {sub === "castings" && (<>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">{castFilters.map(f => <button key={f.id} onClick={() => setCastFilter(f.id)} className={`px-3 py-1 rounded-full text-[11px] font-body font-medium whitespace-nowrap ${castFilter === f.id ? "bg-primary/20 text-primary border border-primary/30" : "bg-card/50 text-muted-foreground border border-border"}`}>{f.label}</button>)}</div>
        <p className="font-body text-xs text-muted-foreground">{castings.length} castings</p>
        {loading ? <Loader /> : <div className="space-y-2">{castings.map((c: any) => { const exp = expanded === c.id; const approved = (c as any).is_approved !== false; const featured = (c as any).featured === true; return (
          <div key={c.id} className={`rounded-xl border overflow-hidden ${!approved ? "border-yellow-500/30 bg-yellow-500/[0.03]" : featured ? "border-primary/30 bg-primary/[0.03]" : "border-border bg-card/50"}`}>
            <button onClick={() => { setExpanded(exp ? null : c.id); if (!exp) loadApplications(c.id); }} className="w-full text-left p-3 flex items-center gap-3"><div className="flex-1 min-w-0"><div className="flex items-center gap-1.5 flex-wrap"><p className="font-body text-sm font-semibold text-foreground truncate">{c.title}</p><span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${sc(c.status)}`}>{c.status}</span>{!approved && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-yellow-500/20 text-yellow-400">PENDING</span>}{featured && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-primary/20 text-primary">FEATURED</span>}</div><p className="font-body text-[11px] text-muted-foreground truncate">by {c.creator?.name || "?"} · {c.location || "—"} · {c.slots} slots</p></div>{exp ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}</button>
            {exp && (<div className="px-3 pb-4 space-y-4 border-t border-border pt-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-body"><div><span className="text-muted-foreground">Creator:</span> <span className="text-foreground">{c.creator?.name}</span></div><div><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{c.creator?.email}</span></div><div><span className="text-muted-foreground">Date:</span> <span className="text-foreground">{c.proposed_date || "Flexible"}</span></div><div><span className="text-muted-foreground">Styles:</span> <span className="text-foreground">{c.styles?.join(", ") || "—"}</span></div></div>
              <div className="p-2.5 rounded-lg bg-foreground/[0.02] border border-border/50"><p className="font-body text-xs text-muted-foreground mb-1 font-semibold">Description</p><p className="font-body text-sm text-foreground">{c.description}</p></div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => updateCasting(c.id, { is_approved: !approved })} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-body font-semibold ${approved ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>{approved ? <><XCircle className="w-3.5 h-3.5" /> Unapprove</> : <><CheckCircle className="w-3.5 h-3.5" /> Approve</>}</button>
                <button onClick={() => updateCasting(c.id, { featured: !featured })} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-body font-semibold ${featured ? "bg-primary/20 text-primary" : "bg-card border border-border text-muted-foreground"}`}><Star className={`w-3.5 h-3.5 ${featured ? "fill-primary" : ""}`} /> {featured ? "Featured ✓" : "Feature"}</button>
                <select value={c.status} onChange={e => updateCasting(c.id, { status: e.target.value })} className="px-3 py-2 rounded-lg text-xs font-body bg-card border border-border text-foreground"><option value="open">Open</option><option value="filled">Filled</option><option value="expired">Expired</option><option value="cancelled">Cancelled</option></select>
                <button onClick={() => deleteCasting(c.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-body font-semibold bg-destructive/10 text-destructive"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
              <div><p className="font-body text-xs text-muted-foreground mb-2 font-semibold">Applications ({applications.length})</p>{applications.length === 0 ? <p className="font-body text-[11px] text-muted-foreground/60">No applications yet</p> : <div className="space-y-1.5">{applications.map((app: any) => (<div key={app.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-foreground/[0.02] border border-border/50">{app.applicant?.avatar_url ? <img src={app.applicant.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{app.applicant?.name?.charAt(0) || "?"}</div>}<div className="flex-1 min-w-0"><p className="font-body text-xs font-semibold text-foreground">{app.applicant?.name || "?"}</p><p className="font-body text-[10px] text-muted-foreground">{app.applicant?.role} · {app.applicant?.city || "—"}</p></div><span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${sc(app.status)}`}>{app.status}</span>{app.status === "pending" && <div className="flex gap-1"><button onClick={() => updateApplication(app.id, "accepted")} className="p-1.5 rounded-lg bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3" /></button><button onClick={() => updateApplication(app.id, "declined")} className="p-1.5 rounded-lg bg-destructive/20 text-destructive"><XCircle className="w-3 h-3" /></button></div>}</div>))}</div>}</div>
            </div>)}
          </div>); })}{castings.length === 0 && <p className="text-center text-muted-foreground text-sm font-body py-8">No castings.</p>}</div>}
      </>)}
      {sub === "requests" && (<><p className="font-body text-xs text-muted-foreground">{requests.length} requests</p>{loading ? <Loader /> : <div className="space-y-2">{requests.map((r: any) => (<div key={r.id} className="p-3 rounded-xl border border-border bg-card/50"><div className="flex items-center justify-between mb-2"><div><p className="font-body text-sm text-foreground"><span className="font-semibold">{r.sender?.name||"?"}</span><span className="text-muted-foreground"> → </span><span className="font-semibold">{r.receiver?.name||"?"}</span></p><p className="font-body text-[11px] text-muted-foreground">{r.style||"—"} · {r.proposed_date||"—"}</p></div><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${sc(r.status)}`}>{r.status}</span></div><div className="flex gap-1.5"><select value={r.status} onChange={e => updateRequest(r.id, e.target.value)} className="px-2 py-1 rounded-lg text-[11px] font-body bg-card border border-border text-foreground"><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="declined">Declined</option><option value="completed">Completed</option></select><button onClick={() => deleteRequest(r.id)} className="px-2 py-1 rounded-lg text-[11px] font-body bg-destructive/10 text-destructive"><Trash2 className="w-3 h-3" /></button></div></div>))}{requests.length === 0 && <p className="text-center text-muted-foreground text-sm font-body py-8">No requests.</p>}</div>}</>)}
      {sub === "sessions" && (<><p className="font-body text-xs text-muted-foreground">{sessions.length} sessions</p>{loading ? <Loader /> : <div className="space-y-2">{sessions.map((s: any) => (<div key={s.id} className="p-3 rounded-xl border border-border bg-card/50"><div className="flex items-center justify-between mb-2"><div><p className="font-body text-sm text-foreground"><span className="font-semibold">{s.photographer?.name||"?"}</span><span className="text-muted-foreground"> + </span><span className="font-semibold">{s.model?.name||"?"}</span></p><p className="font-body text-[11px] text-muted-foreground">{s.location} · {s.date}</p></div><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${sc(s.status)}`}>{s.status}</span></div><select value={s.status} onChange={e => updateSession(s.id, e.target.value)} className="px-2 py-1 rounded-lg text-[11px] font-body bg-card border border-border text-foreground"><option value="upcoming">Upcoming</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>))}{sessions.length === 0 && <p className="text-center text-muted-foreground text-sm font-body py-8">No sessions.</p>}</div>}</>)}
    </div>
  );
}

function MessagesTab() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [msgSearch, setMsgSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  // Offensive word list for auto-flagging
  const FLAGGED_WORDS = [
    "fuck", "shit", "bitch", "ass", "dick", "pussy", "whore", "slut",
    "kill", "die", "threat", "nude", "nudes", "naked", "sex", "sexual",
    "meet me alone", "don't tell anyone", "cash", "cashapp", "venmo",
    "payment first", "deposit", "scam",
  ];

  const isFlagged = (text: string) => {
    const lower = text.toLowerCase();
    return FLAGGED_WORDS.some(w => lower.includes(w));
  };

  const loadConversations = async () => {
    setLoading(true);
    let query = supabase
      .from("conversations")
      .select("*, user1:profiles!conversations_user1_id_fkey(id, name, avatar_url, is_seed, is_banned), user2:profiles!conversations_user2_id_fkey(id, name, avatar_url, is_seed, is_banned)")
      .order("last_message_at", { ascending: false })
      .limit(50);

    const { data } = await query;
    let convs = data || [];

    if (search.trim()) {
      const s = search.toLowerCase();
      convs = convs.filter(c =>
        c.user1?.name?.toLowerCase().includes(s) ||
        c.user2?.name?.toLowerCase().includes(s) ||
        c.last_message_preview?.toLowerCase().includes(s)
      );
    }

    setConversations(convs);
    setLoading(false);
  };

  const loadMessages = async (convId: string) => {
    setMsgsLoading(true);
    setSelectedConv(convId);
    const { data } = await supabase
      .from("messages")
      .select("*, sender:profiles!messages_sender_id_fkey(name, avatar_url)")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(200);
    setMessages(data || []);
    setMsgsLoading(false);
  };

  useEffect(() => { loadConversations(); }, []);

  const filteredMessages = msgSearch.trim()
    ? messages.filter(m => m.content?.toLowerCase().includes(msgSearch.toLowerCase()))
    : flaggedOnly
    ? messages.filter(m => isFlagged(m.content || ""))
    : messages;

  const exportConversation = () => {
    if (!messages.length) return;
    const conv = conversations.find(c => c.id === selectedConv);
    const user1 = conv?.user1?.name || "User 1";
    const user2 = conv?.user2?.name || "User 2";
    let txt = `CONVERSATION EXPORT\n${"=".repeat(50)}\n`;
    txt += `Between: ${user1} and ${user2}\n`;
    txt += `Conversation ID: ${selectedConv}\n`;
    txt += `Exported: ${new Date().toISOString()}\n`;
    txt += `Total messages: ${messages.length}\n${"=".repeat(50)}\n\n`;

    messages.forEach(m => {
      const time = m.created_at ? new Date(m.created_at).toLocaleString() : "unknown time";
      const sender = m.sender?.name || m.sender_id?.slice(0, 8);
      const flag = isFlagged(m.content || "") ? " ⚠️ FLAGGED" : "";
      txt += `[${time}] ${sender}${flag}:\n${m.content}\n\n`;
    });

    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation_${selectedConv?.slice(0, 8)}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Conversation exported");
  };

  const flaggedCount = messages.filter(m => isFlagged(m.content || "")).length;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && loadConversations()} placeholder="Search by user name or message..." className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
        </div>
        <button onClick={loadConversations} className="px-4 py-2.5 rounded-xl gold-gradient text-primary-foreground font-body text-sm font-semibold">Go</button>
      </div>

      {!selectedConv ? (
        <>
          {/* Conversation list */}
          <p className="font-body text-xs text-muted-foreground">{conversations.length} conversations</p>
          {loading ? <Loader /> : (
            <div className="space-y-2">
              {conversations.map(c => (
                <button key={c.id} onClick={() => loadMessages(c.id)} className="w-full text-left p-3 rounded-xl border border-border bg-card/50 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[c.user1, c.user2].map((u: any, i: number) => u?.avatar_url ? (
                        <img key={i} src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-background" />
                      ) : (
                        <div key={i} className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary border-2 border-background">{u?.name?.charAt(0) || "?"}</div>
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-body text-sm font-semibold text-foreground truncate">{c.user1?.name || "?"} & {c.user2?.name || "?"}</p>
                        {(c.user1?.is_seed || c.user2?.is_seed) && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-yellow-500/20 text-yellow-400">SEED</span>}
                        {(c.user1?.is_banned || c.user2?.is_banned) && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-destructive/20 text-destructive">BANNED</span>}
                      </div>
                      <p className="font-body text-xs text-muted-foreground truncate">{c.last_message_preview || "No messages"}</p>
                    </div>
                    <p className="font-body text-[10px] text-muted-foreground flex-shrink-0">{c.last_message_at ? formatDistanceToNow(new Date(c.last_message_at), { addSuffix: true }) : ""}</p>
                  </div>
                </button>
              ))}
              {conversations.length === 0 && <p className="text-center text-muted-foreground text-sm font-body py-8">No conversations found.</p>}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Message viewer */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => { setSelectedConv(null); setMessages([]); setMsgSearch(""); setFlaggedOnly(false); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-body text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={msgSearch} onChange={e => setMsgSearch(e.target.value)} placeholder="Search in messages..." className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-card border border-border text-xs font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
            </div>
            <button onClick={() => setFlaggedOnly(!flaggedOnly)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-body font-semibold ${flaggedOnly ? "bg-destructive/20 text-destructive" : "bg-card border border-border text-muted-foreground"}`}>
              <AlertTriangle className="w-3 h-3" /> Flagged{flaggedCount > 0 ? ` (${flaggedCount})` : ""}
            </button>
            <button onClick={exportConversation} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-body font-semibold bg-card border border-border text-muted-foreground hover:text-foreground">
              <Database className="w-3 h-3" /> Export
            </button>
          </div>

          <p className="font-body text-xs text-muted-foreground">{filteredMessages.length} messages {flaggedOnly ? `(${flaggedCount} flagged)` : ""} {msgSearch ? `matching "${msgSearch}"` : ""}</p>

          {msgsLoading ? <Loader /> : (
            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-card/30 p-3">
              {filteredMessages.map(m => {
                const flagged = isFlagged(m.content || "");
                return (
                  <div key={m.id} className={`p-2.5 rounded-lg ${flagged ? "bg-destructive/[0.06] border border-destructive/20" : "bg-foreground/[0.02]"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {m.sender?.avatar_url ? (
                        <img src={m.sender.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">{m.sender?.name?.charAt(0) || "?"}</div>
                      )}
                      <span className="font-body text-xs font-semibold text-foreground">{m.sender?.name || "Unknown"}</span>
                      <span className="font-body text-[10px] text-muted-foreground">{m.created_at ? new Date(m.created_at).toLocaleString() : ""}</span>
                      {flagged && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-destructive/20 text-destructive">FLAGGED</span>}
                      {m.type === "system" && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-500/20 text-blue-400">SYSTEM</span>}
                    </div>
                    <p className="font-body text-sm text-foreground pl-7">{m.content}</p>
                  </div>
                );
              })}
              {filteredMessages.length === 0 && <p className="text-center text-muted-foreground text-sm font-body py-8">{flaggedOnly ? "No flagged messages" : "No messages"}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ReportsTab({ adminAction }: { adminAction: any }) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); const { data } = await supabase.from("reports").select("*, reporter:profiles!reports_reporter_id_fkey(name), reported:profiles!reports_reported_id_fkey(name)").order("created_at", { ascending: false }); setReports(data||[]); setLoading(false); };
  useEffect(() => { load(); }, []);
  const update = async (id: string, status: string) => { try { await adminAction("update_report", undefined, { report_id: id, status }); toast.success(`Report → ${status}`); load(); } catch (e: any) { toast.error(e.message); } };
  if (loading) return <Loader />;
  const sc: Record<string,string> = { pending: "bg-yellow-500/20 text-yellow-400", resolved: "bg-green-500/20 text-green-400", dismissed: "bg-muted text-muted-foreground" };
  return (
    <div className="space-y-3">
      <p className="font-body text-xs text-muted-foreground">{reports.length} reports</p>
      {reports.map(r => (
        <div key={r.id} className="p-4 rounded-xl border border-border bg-card/50 space-y-3">
          <div className="flex items-start justify-between">
            <div><div className="flex items-center gap-2 mb-1"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${sc[r.status]||""}`}>{r.status}</span><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-destructive/10 text-destructive uppercase">{r.category}</span></div><p className="font-body text-xs text-muted-foreground"><span className="text-foreground font-semibold">{r.reporter?.name||"?"}</span> reported <span className="text-foreground font-semibold">{r.reported?.name||"?"}</span></p></div>
            <p className="font-body text-[10px] text-muted-foreground">{r.created_at ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true }) : ""}</p>
          </div>
          {r.description && <p className="font-body text-sm text-foreground">{r.description}</p>}
          {r.status === "pending" && <div className="flex gap-2"><button onClick={() => update(r.id, "resolved")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-body font-semibold bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3" />Resolve</button><button onClick={() => update(r.id, "dismissed")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-body font-semibold bg-muted text-muted-foreground"><XCircle className="w-3 h-3" />Dismiss</button></div>}
        </div>
      ))}
      {reports.length === 0 && <p className="text-center text-muted-foreground text-sm font-body py-8">No reports.</p>}
    </div>
  );
}
