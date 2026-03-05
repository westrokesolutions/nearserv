import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Star, Clock, CheckCircle, Shield, Eye,
  MapPin, Phone, Mail, Briefcase, Edit2, RefreshCw,
  Activity, LogOut, MessageSquare, TrendingUp,
  Award, Calendar, DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Professional = Tables<"professionals"> & { categories?: { name: string } | null };
type Review = Tables<"reviews">;

const ProfessionalDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "reviews" | "profile">("overview");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/dashboard");
    }
  }, [user, authLoading, navigate]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: proData } = await supabase
      .from("professionals")
      .select("*, categories(name)")
      .eq("user_id", user.id)
      .maybeSingle();

    if (proData) {
      setProfessional(proData as Professional);

      const { data: revData } = await supabase
        .from("reviews")
        .select("*")
        .eq("professional_id", proData.id)
        .order("created_at", { ascending: false });

      if (revData) setReviews(revData);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  // Realtime subscription
  useEffect(() => {
    if (!user || !professional) return;

    const channel = supabase
      .channel("pro-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "professionals", filter: `user_id=eq.${user.id}` }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews", filter: `professional_id=eq.${professional.id}` }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, professional?.id, fetchData]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">No Professional Profile</h2>
          <p className="text-muted-foreground text-sm mb-6">Register as a professional to access your dashboard.</p>
          <Button onClick={() => navigate("/register")} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
            <Award className="w-4 h-4" /> Register as Professional
          </Button>
        </motion.div>
      </div>
    );
  }

  const approvedReviews = reviews.filter((r) => r.is_approved);
  const avgRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length).toFixed(1)
    : "0.0";
  const totalReviews = approvedReviews.length;

  const statusConfig: Record<string, { color: string; icon: typeof CheckCircle; label: string }> = {
    approved: { color: "bg-accent/10 text-accent border-accent/20", icon: CheckCircle, label: "Active" },
    pending: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Clock, label: "Pending Approval" },
    rejected: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: Clock, label: "Rejected" },
    suspended: { color: "bg-orange-500/10 text-orange-600 border-orange-500/20", icon: Clock, label: "Suspended" },
  };

  const currentStatus = statusConfig[professional.status] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: TrendingUp },
    { key: "reviews" as const, label: "Reviews", icon: MessageSquare, badge: totalReviews },
    { key: "profile" as const, label: "My Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="flex items-center justify-between h-14 px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <MapPin className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">NearServ</span>
            <Badge variant="outline" className="text-xs hidden sm:inline-flex">Professional</Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-accent">
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-muted-foreground text-xs hidden sm:inline-flex">
              Home
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }} className="gap-1.5 text-muted-foreground">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Profile header card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-5 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
              {professional.avatar_url ? (
                <img src={professional.avatar_url} alt={professional.full_name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">{professional.full_name}</h1>
                {professional.verification === "verified" && (
                  <Shield className="w-4 h-4 text-accent" />
                )}
                {professional.is_premium && (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{professional.headline || professional.categories?.name}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border font-medium ${currentStatus.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {currentStatus.label}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {professional.area}, {professional.city}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={() => navigate(`/professional/${professional.id}`)}>
              <Eye className="w-3.5 h-3.5" /> View Public Profile
            </Button>
          </div>
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
                  tab === t.key ? "bg-accent-foreground/20 text-accent-foreground" : "bg-accent/10 text-accent"
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
            {/* Status banner */}
            {professional.status === "pending" && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Profile Under Review</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Your profile is being reviewed by our team. You'll be notified once it's approved.</p>
                </div>
              </div>
            )}
            {professional.status === "rejected" && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Profile Rejected</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Your profile was not approved. Please contact support for more details.</p>
                </div>
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Rating", value: `${avgRating}★`, icon: Star, color: "text-yellow-500", sub: `${totalReviews} reviews` },
                { label: "Status", value: currentStatus.label, icon: StatusIcon, color: "text-accent", sub: professional.status },
                { label: "Experience", value: professional.experience_years ? `${professional.experience_years}y` : "N/A", icon: Calendar, color: "text-accent", sub: "years of work" },
                { label: "Rate", value: professional.hourly_rate ? `₹${professional.hourly_rate}/hr` : "N/A", icon: DollarSign, color: "text-accent", sub: "hourly rate" },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                    <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/50" />
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  <p className="text-xs text-accent mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Recent reviews */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-accent" />
                Recent Reviews
              </h3>
              {approvedReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No reviews yet. Once clients review your work, they'll appear here.</p>
              ) : (
                <div className="space-y-3">
                  {approvedReviews.slice(0, 5).map((r) => (
                    <div key={r.id} className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{r.reviewer_name}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground ml-auto">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* REVIEWS TAB */}
        {tab === "reviews" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex gap-2 flex-wrap text-xs mb-2">
              <span className="px-2.5 py-1 rounded-full bg-secondary text-foreground font-medium">Total ({reviews.length})</span>
              <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">Published ({approvedReviews.length})</span>
              <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-600 font-medium">Pending ({reviews.length - approvedReviews.length})</span>
            </div>

            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-16">No reviews received yet.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-card rounded-xl border border-border p-4 md:p-5">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-semibold text-foreground text-sm">{review.reviewer_name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${
                      review.is_approved ? "bg-accent/10 text-accent border-accent/20" : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                    }`}>
                      {review.is_approved ? "Published" : "Pending"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>}
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* PROFILE TAB */}
        {tab === "profile" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-5 md:p-6">
              <h3 className="font-display font-bold text-foreground mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: User, label: "Full Name", value: professional.full_name },
                  { icon: Mail, label: "Email", value: professional.email },
                  { icon: Phone, label: "Phone", value: professional.phone },
                  { icon: Briefcase, label: "Category", value: professional.categories?.name || "N/A" },
                  { icon: MapPin, label: "Area", value: `${professional.area}, ${professional.city}` },
                  { icon: Calendar, label: "Experience", value: professional.experience_years ? `${professional.experience_years} years` : "N/A" },
                  { icon: DollarSign, label: "Hourly Rate", value: professional.hourly_rate ? `₹${professional.hourly_rate}` : "N/A" },
                  { icon: MapPin, label: "Coverage", value: `${professional.coverage_radius_km || 5} km radius` },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                    <item.icon className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {professional.headline && (
                <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Headline</p>
                  <p className="text-sm font-medium text-foreground">{professional.headline}</p>
                </div>
              )}

              {professional.description && (
                <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground leading-relaxed">{professional.description}</p>
                </div>
              )}
            </div>

            <div className="bg-card rounded-xl border border-border p-5 md:p-6">
              <h3 className="font-display font-bold text-foreground mb-2">Verification & Status</h3>
              <div className="flex gap-3 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border font-medium ${currentStatus.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {currentStatus.label}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border font-medium ${
                  professional.verification === "verified"
                    ? "bg-accent/10 text-accent border-accent/20"
                    : "bg-secondary text-muted-foreground border-border"
                }`}>
                  <Shield className="w-3 h-3" />
                  {professional.verification === "verified" ? "Verified" : "Not Verified"}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border font-medium ${
                  professional.is_premium
                    ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                    : "bg-secondary text-muted-foreground border-border"
                }`}>
                  <Star className="w-3 h-3" />
                  {professional.is_premium ? "Premium" : "Standard"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Member since {new Date(professional.created_at).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
