import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, CheckCircle, XCircle, Clock, Shield,
  Star, BarChart3, Eye, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Professional = Tables<"professionals"> & { categories?: { name: string } | null };
type Review = Tables<"reviews"> & { professionals?: { full_name: string } | null };

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"professionals" | "reviews" | "stats">("professionals");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    const [prosRes, revRes] = await Promise.all([
      supabase.from("professionals").select("*, categories(name)"),
      supabase.from("reviews").select("*, professionals(full_name)"),
    ]);
    if (prosRes.data) setProfessionals(prosRes.data as Professional[]);
    if (revRes.data) setReviews(revRes.data as Review[]);
    setLoading(false);
  };

  const updateProfessionalStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("professionals")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Professional ${status}` });
      fetchData();
    }
  };

  const approveReview = async (id: string) => {
    const { error } = await supabase
      .from("reviews")
      .update({ is_approved: true })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review approved" });
      fetchData();
    }
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review deleted" });
      fetchData();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const pendingPros = professionals.filter((p) => p.status === "pending");
  const approvedPros = professionals.filter((p) => p.status === "approved");
  const pendingReviews = reviews.filter((r) => !r.is_approved);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mb-8">
              Manage professionals, reviews, and platform settings
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Professionals", value: professionals.length, icon: Users, color: "text-accent" },
              { label: "Pending Approval", value: pendingPros.length, icon: Clock, color: "text-gold" },
              { label: "Approved", value: approvedPros.length, icon: CheckCircle, color: "text-accent" },
              { label: "Pending Reviews", value: pendingReviews.length, icon: Star, color: "text-gold" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(["professionals", "reviews", "stats"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Professionals Tab */}
          {tab === "professionals" && (
            <div className="space-y-4">
              {professionals.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">No professionals yet.</p>
              ) : (
                professionals.map((pro) => (
                  <div
                    key={pro.id}
                    className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{pro.full_name}</h3>
                        <Badge
                          variant={pro.status === "approved" ? "default" : pro.status === "pending" ? "secondary" : "destructive"}
                        >
                          {pro.status}
                        </Badge>
                        {pro.verification === "verified" && (
                          <Shield className="w-4 h-4 text-accent" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {pro.categories?.name} · {pro.area}, {pro.city} · {pro.email}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {pro.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateProfessionalStatus(pro.id, "approved")}
                            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateProfessionalStatus(pro.id, "rejected")}
                            className="gap-1"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/professional/${pro.id}`)}
                        className="gap-1"
                      >
                        <Eye className="w-4 h-4" /> View
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {tab === "reviews" && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">No reviews yet.</p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-card rounded-xl border border-border p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground text-sm">
                            {review.reviewer_name}
                          </span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-gold fill-gold" />
                            ))}
                          </div>
                          <Badge variant={review.is_approved ? "default" : "secondary"}>
                            {review.is_approved ? "Approved" : "Pending"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          For: {review.professionals?.full_name || "Unknown"}
                        </p>
                        {review.comment && (
                          <p className="text-sm text-foreground mt-2">{review.comment}</p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!review.is_approved && (
                          <Button size="sm" onClick={() => approveReview(review.id)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                            Approve
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => deleteReview(review.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Stats Tab */}
          {tab === "stats" && (
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-accent" />
                <h2 className="font-display text-lg font-bold text-foreground">Platform Stats</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">By Category</h3>
                  <div className="space-y-2">
                    {Object.entries(
                      professionals.reduce((acc, p) => {
                        const cat = p.categories?.name || "Unknown";
                        acc[cat] = (acc[cat] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([cat, count]) => (
                      <div key={cat} className="flex justify-between text-sm">
                        <span className="text-foreground">{cat}</span>
                        <span className="font-semibold text-foreground">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">By Status</h3>
                  <div className="space-y-2">
                    {Object.entries(
                      professionals.reduce((acc, p) => {
                        acc[p.status] = (acc[p.status] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([status, count]) => (
                      <div key={status} className="flex justify-between text-sm">
                        <span className="text-foreground capitalize">{status}</span>
                        <span className="font-semibold text-foreground">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
