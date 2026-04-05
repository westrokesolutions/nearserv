import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Calendar, Clock, MapPin, Phone, Mail,
  Briefcase, LogOut, History, Settings, ChevronRight,
  Star, Shield, DollarSign, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Booking = Tables<"bookings">;
type Professional = Tables<"professionals"> & { categories?: { name: string } | null };

const CustomerProfile = () => {
  const { user, loading: authLoading, isProfessional, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"bookings" | "profile" | "settings">("bookings");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/profile");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      const userPhone = user.phone?.replace("+91", "") || "";
      const userEmail = user.email || "";

      let query = supabase.from("bookings").select("*").order("created_at", { ascending: false });
      if (userPhone) {
        query = query.or(`customer_phone.eq.${userPhone},customer_email.eq.${userEmail}`);
      } else if (userEmail) {
        query = query.eq("customer_email", userEmail);
      }
      const { data: bookingData } = await query;
      if (bookingData) setBookings(bookingData);

      // Fetch professional profile if user is a professional
      const { data: proData } = await supabase
        .from("professionals")
        .select("*, categories(name)")
        .eq("user_id", user.id)
        .maybeSingle();
      if (proData) setProfessional(proData as Professional);

      setLoading(false);
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (isProfessional && tab === "bookings") {
      setTab("profile");
    }
  }, [isProfessional]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-[calc(5rem+var(--safe-area-top))] container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="w-full h-40 rounded-2xl mb-6" />
          <Skeleton className="w-full h-60 rounded-2xl" />
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    confirmed: "bg-accent/10 text-accent border-accent/20",
    completed: "bg-primary/10 text-primary border-primary/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
    pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  };

  const displayPhone = user?.phone?.replace("+91", "") || "";
  const displayName = professional?.full_name || user?.user_metadata?.full_name || displayPhone || user?.email || "User";

  const tabs = [
    ...(isProfessional ? [{ key: "profile" as const, label: "My Info", icon: User }] : []),
    { key: "bookings" as const, label: "My Bookings", icon: History, badge: bookings.length },
    { key: "settings" as const, label: "Account", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-[calc(5rem+var(--safe-area-top))] pb-20">
        <div className="container mx-auto px-4 max-w-4xl py-6">
          {/* Profile header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-6 mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center overflow-hidden">
                {professional?.avatar_url ? (
                  <img src={professional.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-accent" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">{displayName}</h1>
                {professional?.headline && (
                  <p className="text-sm text-muted-foreground mt-0.5">{professional.headline}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                  {(professional?.phone || displayPhone) && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> +91 {professional?.phone || displayPhone}
                    </span>
                  )}
                  {(professional?.email || user?.email) && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> {professional?.email || user?.email}
                    </span>
                  )}
                  {isProfessional && professional?.categories?.name && (
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                      {professional.categories.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 rounded-xl bg-secondary/50">
                <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
                <p className="text-xs text-muted-foreground">Total Bookings</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-secondary/50">
                <p className="text-2xl font-bold text-foreground">
                  {bookings.filter((b) => b.status === "confirmed").length}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-secondary/50">
                <p className="text-2xl font-bold text-foreground">
                  {bookings.filter((b) => b.status === "completed").length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
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
                {"badge" in t && t.badge != null && (
                  <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full font-bold ${
                    tab === t.key ? "bg-accent-foreground/20 text-accent-foreground" : "bg-accent/10 text-accent"
                  }`}>
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Professional Info Tab */}
          {tab === "profile" && professional && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-5 md:p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Professional Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: User, label: "Full Name", value: professional.full_name },
                    { icon: Mail, label: "Email", value: professional.email },
                    { icon: Phone, label: "Phone", value: professional.phone },
                    { icon: Briefcase, label: "Category", value: professional.categories?.name || "N/A" },
                    { icon: MapPin, label: "Area", value: `${professional.area}, ${professional.city}` },
                    { icon: Calendar, label: "Experience", value: professional.experience_years ? `${professional.experience_years} years` : "N/A" },
                    { icon: DollarSign, label: "Per Day Rate", value: professional.hourly_rate ? `₹${professional.hourly_rate}` : "N/A" },
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
                {professional.description && (
                  <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground leading-relaxed">{professional.description}</p>
                  </div>
                )}
              </div>

              {/* Status badges */}
              <div className="bg-card rounded-xl border border-border p-5 md:p-6">
                <h3 className="font-display font-bold text-foreground mb-3">Status</h3>
                <div className="flex gap-3 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border font-medium ${
                    professional.status === "approved" ? "bg-accent/10 text-accent border-accent/20"
                    : professional.status === "pending" ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                  }`}>
                    <Award className="w-3 h-3" /> {professional.status}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border font-medium ${
                    professional.verification === "verified" ? "bg-accent/10 text-accent border-accent/20" : "bg-secondary text-muted-foreground border-border"
                  }`}>
                    <Shield className="w-3 h-3" /> {professional.verification === "verified" ? "Verified" : "Not Verified"}
                  </span>
                  {professional.is_premium && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border font-medium bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                      <Star className="w-3 h-3" /> Premium
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Registered since {new Date(professional.created_at).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          )}

          {tab === "bookings" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="w-full h-32 rounded-xl" />)}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-16">
                  <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No bookings yet.</p>
                  <Button onClick={() => navigate("/search")} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Find a Professional
                  </Button>
                </div>
              ) : (
                bookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {booking.service_name || "Service Booking"}
                        </h3>
                        {booking.professional_name && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            Professional: <strong className="text-foreground">{booking.professional_name}</strong>
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className={`text-xs ${statusColors[booking.status] || statusColors.pending}`}>
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {booking.preferred_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {booking.preferred_time}
                      </span>
                      {booking.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {booking.location}
                        </span>
                      )}
                      {booking.payment_offer && (
                        <span className="font-medium text-foreground">₹{booking.payment_offer}</span>
                      )}
                    </div>

                    {booking.job_description && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{booking.job_description}</p>
                    )}

                    <p className="text-xs text-muted-foreground/60 mt-3">
                      Booked on {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {tab === "settings" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-semibold text-foreground mb-4">Account Information</h3>
                <div className="space-y-3 text-sm">
                  {displayPhone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="text-foreground">+91 {displayPhone}</span>
                    </div>
                  )}
                  {user?.email && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="text-foreground">{user.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member since</span>
                    <span className="text-foreground">{new Date(user?.created_at || "").toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full gap-2 text-destructive hover:text-destructive"
                onClick={() => { signOut(); navigate("/"); }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CustomerProfile;
