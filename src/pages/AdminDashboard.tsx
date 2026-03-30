import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, CheckCircle, XCircle, Clock, Shield, Star,
  BarChart3, Eye, Trash2, RefreshCw, TrendingUp,
  FolderOpen, MessageSquare, Activity, LogOut,
  MapPin, ChevronDown, ChevronUp, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Professional = Tables<"professionals"> & { categories?: { name: string } | null };
type Review = Tables<"reviews"> & { professionals?: { full_name: string } | null };
type Category = Tables<"categories">;

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview" | "professionals" | "reviews" | "categories">("overview");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPro, setExpandedPro] = useState<string | null>(null);
  const [showCreatePro, setShowCreatePro] = useState(false);
  const [showCreateCat, setShowCreateCat] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);

  // Create professional form state
  const [newPro, setNewPro] = useState({
    full_name: "", email: "", phone: "", category_id: "",
    area: "", city: "Vasai", description: "", headline: "",
    experience_years: "", hourly_rate: "", coverage_radius_km: "5",
  });

  // Create category form state
  const [newCat, setNewCat] = useState({
    name: "", slug: "", icon: "", description: "",
    services_included: [{ title: "", description: "" }] as { title: string; description: string }[],
    process_steps: [{ step: 1, title: "", description: "" }] as { step: number; title: string; description: string }[],
    faqs: [{ question: "", answer: "" }] as { question: string; answer: string }[],
    price_info: "",
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin-login");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [prosRes, revRes, catRes] = await Promise.all([
      supabase.from("professionals").select("*, categories(name)").order("created_at", { ascending: false }),
      supabase.from("reviews").select("*, professionals(full_name)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);
    if (prosRes.data) setProfessionals(prosRes.data as Professional[]);
    if (revRes.data) setReviews(revRes.data as Review[]);
    if (catRes.data) setCategories(catRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, fetchData]);

  // Realtime subscriptions
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "professionals" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, fetchData]);

  const updateProfessionalStatus = async (id: string, status: "approved" | "rejected" | "suspended") => {
    const { error } = await supabase.from("professionals").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Professional ${status}` });
    }
  };

  const updateVerification = async (id: string, verification: "verified" | "unverified") => {
    const { error } = await supabase.from("professionals").update({ verification }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Verification updated` });
    }
  };

  const approveReview = async (id: string) => {
    const { error } = await supabase.from("reviews").update({ is_approved: true }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Review approved" });
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Review deleted" });
  };

  const toggleCategory = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from("categories").update({ is_active: !isActive }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: `Category ${!isActive ? "activated" : "deactivated"}` });
  };

  const updateCategory = async () => {
    if (!editingCat) return;
    setCreating(true);
    const { error } = await supabase.from("categories").update({
      name: editingCat.name,
      icon: editingCat.icon || null,
      description: editingCat.description || null,
      services_included: (editingCat as any).services_included || [],
      process_steps: (editingCat as any).process_steps || [],
      faqs: (editingCat as any).faqs || [],
      price_info: (editingCat as any).price_info || null,
    }).eq("id", editingCat.id);
    setCreating(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Category updated" });
      setEditingCat(null);
      fetchData();
    }
  };

  const createProfessional = async () => {
    if (!newPro.full_name || !newPro.email || !newPro.phone || !newPro.category_id || !newPro.area) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { error } = await supabase.from("professionals").insert({
      full_name: newPro.full_name,
      email: newPro.email,
      phone: newPro.phone,
      category_id: newPro.category_id,
      area: newPro.area,
      city: newPro.city || "Vasai",
      description: newPro.description || null,
      headline: newPro.headline || null,
      experience_years: newPro.experience_years ? parseInt(newPro.experience_years) : null,
      hourly_rate: newPro.hourly_rate ? parseInt(newPro.hourly_rate) : null,
      coverage_radius_km: newPro.coverage_radius_km ? parseInt(newPro.coverage_radius_km) : 5,
      status: "approved",
    });
    setCreating(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Professional created successfully" });
      setShowCreatePro(false);
      setNewPro({ full_name: "", email: "", phone: "", category_id: "", area: "", city: "Vasai", description: "", headline: "", experience_years: "", hourly_rate: "", coverage_radius_km: "5" });
      fetchData();
    }
  };

  const createCategory = async () => {
    if (!newCat.name) {
      toast({ title: "Error", description: "Category name is required", variant: "destructive" });
      return;
    }
    setCreating(true);
    const slug = newCat.slug || newCat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { error } = await supabase.from("categories").insert({
      name: newCat.name,
      slug,
      icon: newCat.icon || null,
      description: newCat.description || null,
      services_included: newCat.services_included.filter(s => s.title),
      process_steps: newCat.process_steps.filter(s => s.title),
      faqs: newCat.faqs.filter(f => f.question),
      price_info: newCat.price_info || null,
    });
    setCreating(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Category created successfully" });
      setShowCreateCat(false);
      setNewCat({ name: "", slug: "", icon: "", description: "", services_included: [{ title: "", description: "" }], process_steps: [{ step: 1, title: "", description: "" }], faqs: [{ question: "", answer: "" }], price_info: "" });
      fetchData();
    }
  };

  if (authLoading || (loading && professionals.length === 0)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const pendingPros = professionals.filter((p) => p.status === "pending");
  const approvedPros = professionals.filter((p) => p.status === "approved");
  const rejectedPros = professionals.filter((p) => p.status === "rejected");
  const pendingReviews = reviews.filter((r) => !r.is_approved);
  const approvedReviews = reviews.filter((r) => r.is_approved);
  const activeCategories = categories.filter((c) => c.is_active);
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0";

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: BarChart3 },
    { key: "professionals" as const, label: "Professionals", icon: Users, badge: pendingPros.length },
    { key: "reviews" as const, label: "Reviews", icon: MessageSquare, badge: pendingReviews.length },
    { key: "categories" as const, label: "Categories", icon: FolderOpen },
  ];

  const statusColor = (s: string) => {
    switch (s) {
      case "approved": return "bg-accent/10 text-accent border-accent/20";
      case "pending": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
      case "suspended": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background safe-bottom mobile-scroll">
      {/* Top bar */}
      <header className="sticky top-0 z-50 glass safe-top border-b border-border">
        <div className="flex items-center justify-between h-14 px-4 md:px-6 max-w-7xl mx-auto safe-x">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <MapPin className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">NearServ</span>
            <Badge variant="outline" className="text-xs hidden sm:inline-flex">Admin</Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-accent">
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }} className="gap-1.5 text-muted-foreground">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time platform management</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.key
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.badge ? (
                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full font-bold ${
                  tab === t.key ? "bg-accent-foreground/20 text-accent-foreground" : "bg-destructive/10 text-destructive"
                }`}>
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Professionals", value: professionals.length, icon: Users, color: "text-accent", sub: `${approvedPros.length} active` },
                { label: "Pending Approval", value: pendingPros.length, icon: Clock, color: "text-yellow-500", sub: "needs action" },
                { label: "Total Reviews", value: reviews.length, icon: Star, color: "text-yellow-500", sub: `avg ${avgRating}★` },
                { label: "Categories", value: activeCategories.length, icon: FolderOpen, color: "text-accent", sub: `${categories.length} total` },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-xl border border-border p-4 md:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                    <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/50" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  <p className="text-xs text-accent mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent pending professionals */}
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  Pending Professionals
                </h3>
                {pendingPros.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No pending approvals 🎉</p>
                ) : (
                  <div className="space-y-3">
                    {pendingPros.slice(0, 5).map((pro) => (
                      <div key={pro.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{pro.full_name}</p>
                          <p className="text-xs text-muted-foreground">{pro.categories?.name} · {pro.area}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Button size="sm" className="h-7 px-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => updateProfessionalStatus(pro.id, "approved")}>
                            <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="destructive" className="h-7 px-2" onClick={() => updateProfessionalStatus(pro.id, "rejected")}>
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent pending reviews */}
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-yellow-500" />
                  Pending Reviews
                </h3>
                {pendingReviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No pending reviews 🎉</p>
                ) : (
                  <div className="space-y-3">
                    {pendingReviews.slice(0, 5).map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-foreground truncate">{r.reviewer_name}</p>
                            <div className="flex gap-0.5">
                              {Array.from({ length: r.rating }).map((_, i) => (
                                <Star key={i} className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">For: {r.professionals?.full_name}</p>
                        </div>
                        <Button size="sm" className="h-7 px-2 bg-accent text-accent-foreground hover:bg-accent/90 shrink-0" onClick={() => approveReview(r.id)}>
                          <CheckCircle className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stats breakdown */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-accent" />
                Professionals by Category
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((cat) => {
                  const count = professionals.filter((p) => p.category_id === cat.id).length;
                  const approved = professionals.filter((p) => p.category_id === cat.id && p.status === "approved").length;
                  return (
                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50">
                      <div>
                        <p className="text-sm font-medium text-foreground">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{approved} active</p>
                      </div>
                      <span className="text-lg font-bold text-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* PROFESSIONALS TAB */}
        {tab === "professionals" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Header with create button */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2 flex-wrap text-xs">
                <span className="px-2.5 py-1 rounded-full bg-secondary text-foreground font-medium">All ({professionals.length})</span>
                <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-600 font-medium">Pending ({pendingPros.length})</span>
                <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">Approved ({approvedPros.length})</span>
                <span className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive font-medium">Rejected ({rejectedPros.length})</span>
              </div>
              <Dialog open={showCreatePro} onOpenChange={setShowCreatePro}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
                    <Plus className="w-4 h-4" /> Add Professional
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-display">Create Professional</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Full Name *</Label>
                        <Input placeholder="John Doe" value={newPro.full_name} onChange={(e) => setNewPro({ ...newPro, full_name: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Email *</Label>
                        <Input type="email" placeholder="john@example.com" value={newPro.email} onChange={(e) => setNewPro({ ...newPro, email: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Phone *</Label>
                        <Input placeholder="9876543210" value={newPro.phone} onChange={(e) => setNewPro({ ...newPro, phone: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Category *</Label>
                        <Select value={newPro.category_id} onValueChange={(v) => setNewPro({ ...newPro, category_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent>
                            {categories.filter(c => c.is_active).map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Headline</Label>
                      <Input placeholder="e.g. Expert Plumber" value={newPro.headline} onChange={(e) => setNewPro({ ...newPro, headline: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Area *</Label>
                        <Input placeholder="Waliv" value={newPro.area} onChange={(e) => setNewPro({ ...newPro, area: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">City</Label>
                        <Input placeholder="Vasai" value={newPro.city} onChange={(e) => setNewPro({ ...newPro, city: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Experience (yrs)</Label>
                        <Input type="number" placeholder="2" value={newPro.experience_years} onChange={(e) => setNewPro({ ...newPro, experience_years: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Hourly Rate (₹)</Label>
                        <Input type="number" placeholder="500" value={newPro.hourly_rate} onChange={(e) => setNewPro({ ...newPro, hourly_rate: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Radius (km)</Label>
                        <Input type="number" placeholder="5" value={newPro.coverage_radius_km} onChange={(e) => setNewPro({ ...newPro, coverage_radius_km: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Description</Label>
                      <Textarea placeholder="Brief description of services..." value={newPro.description} onChange={(e) => setNewPro({ ...newPro, description: e.target.value })} rows={3} />
                    </div>
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={createProfessional} disabled={creating}>
                      {creating ? "Creating..." : "Create Professional"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {professionals.length === 0 ? (
              <p className="text-muted-foreground text-center py-16">No professionals registered yet.</p>
            ) : (
              professionals.map((pro) => (
                <div key={pro.id} className="bg-card rounded-xl border border-border overflow-hidden">
                  <div
                    className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 cursor-pointer"
                    onClick={() => setExpandedPro(expandedPro === pro.id ? null : pro.id)}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                      {pro.avatar_url ? (
                        <img src={pro.avatar_url} alt={pro.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground text-sm">{pro.full_name}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${statusColor(pro.status)}`}>
                          {pro.status}
                        </span>
                        {pro.verification === "verified" && (
                          <Shield className="w-3.5 h-3.5 text-accent" />
                        )}
                        {pro.is_premium && (
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {pro.categories?.name} · {pro.area}, {pro.city} · {pro.phone}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {pro.status === "pending" && (
                        <>
                          <Button size="sm" className="h-8 bg-accent text-accent-foreground hover:bg-accent/90 gap-1" onClick={(e) => { e.stopPropagation(); updateProfessionalStatus(pro.id, "approved"); }}>
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="h-8 gap-1" onClick={(e) => { e.stopPropagation(); updateProfessionalStatus(pro.id, "rejected"); }}>
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </Button>
                        </>
                      )}
                      {expandedPro === pro.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedPro === pro.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-border px-4 md:px-5 py-4 bg-secondary/30">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-medium text-foreground truncate">{pro.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Experience</p>
                          <p className="font-medium text-foreground">{pro.experience_years ? `${pro.experience_years} years` : "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Per Day Rate</p>
                          <p className="font-medium text-foreground">{pro.hourly_rate ? `₹${pro.hourly_rate}` : "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Coverage</p>
                          <p className="font-medium text-foreground">{pro.coverage_radius_km} km</p>
                        </div>
                      </div>
                      {pro.description && (
                        <p className="text-sm text-muted-foreground mb-4">{pro.description}</p>
                      )}

                      {/* Aadhaar Card Details */}
                      {((pro as any).aadhaar_number || (pro as any).aadhaar_front_url || (pro as any).aadhaar_back_url) && (
                        <div className="mb-4 p-4 rounded-lg bg-card border border-border">
                          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-accent" /> Aadhaar Card Details
                          </h4>
                          {(pro as any).aadhaar_number && (
                            <p className="text-sm text-foreground mb-3">
                              <span className="text-muted-foreground">Number:</span>{" "}
                              <span className="font-mono font-medium">{(pro as any).aadhaar_number}</span>
                            </p>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(pro as any).aadhaar_front_url && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Front</p>
                                <a href={(pro as any).aadhaar_front_url} target="_blank" rel="noopener noreferrer">
                                  <img src={(pro as any).aadhaar_front_url} alt="Aadhaar front" className="w-full h-32 rounded-lg object-cover border border-border hover:opacity-80 transition-opacity" />
                                </a>
                              </div>
                            )}
                            {(pro as any).aadhaar_back_url && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Back</p>
                                <a href={(pro as any).aadhaar_back_url} target="_blank" rel="noopener noreferrer">
                                  <img src={(pro as any).aadhaar_back_url} alt="Aadhaar back" className="w-full h-32 rounded-lg object-cover border border-border hover:opacity-80 transition-opacity" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        {pro.status === "approved" && (
                          <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => updateProfessionalStatus(pro.id, "suspended")}>
                            Suspend
                          </Button>
                        )}
                        {pro.status !== "approved" && pro.status !== "pending" && (
                          <Button size="sm" className="h-8 gap-1 text-xs bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => updateProfessionalStatus(pro.id, "approved")}>
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </Button>
                        )}
                        {pro.verification !== "verified" ? (
                          <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => updateVerification(pro.id, "verified")}>
                            <Shield className="w-3.5 h-3.5" /> Verify
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => updateVerification(pro.id, "unverified")}>
                            Revoke Verification
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => navigate(`/professional/${pro.id}`)}>
                          <Eye className="w-3.5 h-3.5" /> View Profile
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* REVIEWS TAB */}
        {tab === "reviews" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex gap-2 flex-wrap text-xs mb-2">
              <span className="px-2.5 py-1 rounded-full bg-secondary text-foreground font-medium">All ({reviews.length})</span>
              <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-600 font-medium">Pending ({pendingReviews.length})</span>
              <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">Approved ({approvedReviews.length})</span>
            </div>

            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-16">No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-card rounded-xl border border-border p-4 md:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-foreground text-sm">{review.reviewer_name}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`}
                            />
                          ))}
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${
                          review.is_approved ? "bg-accent/10 text-accent border-accent/20" : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                        }`}>
                          {review.is_approved ? "Approved" : "Pending"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        For: {review.professionals?.full_name || "Unknown"} · {new Date(review.created_at).toLocaleDateString()}
                      </p>
                      {review.comment && (
                        <p className="text-sm text-foreground mt-2 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {!review.is_approved && (
                        <Button size="sm" className="h-8 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => approveReview(review.id)}>
                          Approve
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" className="h-8" onClick={() => deleteReview(review.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* CATEGORIES TAB */}
        {tab === "categories" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Create category button */}
            <div className="flex justify-end">
              <Dialog open={showCreateCat} onOpenChange={setShowCreateCat}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90">
                    <Plus className="w-4 h-4" /> Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display">Create Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Name *</Label>
                      <Input placeholder="e.g. AC Technician" value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Slug</Label>
                      <Input placeholder="auto-generated" value={newCat.slug} onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Icon (lucide name)</Label>
                      <Input placeholder="e.g. wrench, zap, camera" value={newCat.icon} onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Detailed Description</Label>
                      <p className="text-xs text-muted-foreground">Describe all services offered, work process, what the professional does, etc. (Urban Company style)</p>
                      <Textarea placeholder="e.g. AC Technician services include:&#10;• AC installation &amp; uninstallation&#10;• Gas refilling &amp; leak repair&#10;• Deep cleaning &amp; servicing&#10;• PCB repair &amp; compressor replacement&#10;&#10;Process: The technician inspects the unit, diagnoses the issue, provides a quote, and completes the repair on-site..." value={newCat.description} onChange={(e) => setNewCat({ ...newCat, description: e.target.value })} rows={8} />
                    </div>
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={createCategory} disabled={creating}>
                      {creating ? "Creating..." : "Create Category"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {categories.length === 0 ? (
              <p className="text-muted-foreground text-center py-16">No categories found.</p>
            ) : (
              categories.map((cat) => {
                const proCount = professionals.filter((p) => p.category_id === cat.id).length;
                return (
                  <div key={cat.id} className="bg-card rounded-xl border border-border p-4 md:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-foreground">{cat.name}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${
                            cat.is_active ? "bg-accent/10 text-accent border-accent/20" : "bg-secondary text-muted-foreground border-border"
                          }`}>
                            {cat.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {cat.slug} · {proCount} professional{proCount !== 1 ? "s" : ""}
                        </p>
                        {cat.description && (
                          <p className="text-xs text-muted-foreground mt-2 whitespace-pre-line line-clamp-3">{cat.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setEditingCat(cat)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant={cat.is_active ? "outline" : "default"}
                          className={`h-8 text-xs ${!cat.is_active ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
                          onClick={() => toggleCategory(cat.id, cat.is_active)}
                        >
                          {cat.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Edit category dialog */}
            <Dialog open={!!editingCat} onOpenChange={(open) => !open && setEditingCat(null)}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display">Edit Category</DialogTitle>
                </DialogHeader>
                {editingCat && (
                  <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Name</Label>
                      <Input value={editingCat.name} onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Icon (lucide name)</Label>
                      <Input value={editingCat.icon || ""} onChange={(e) => setEditingCat({ ...editingCat, icon: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Detailed Description</Label>
                      <p className="text-xs text-muted-foreground">Describe all services, work process, pricing info, etc.</p>
                      <Textarea value={editingCat.description || ""} onChange={(e) => setEditingCat({ ...editingCat, description: e.target.value })} rows={10} />
                    </div>
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={updateCategory} disabled={creating}>
                      {creating ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
