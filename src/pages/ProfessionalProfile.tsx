import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, BadgeCheck, Star, MapPin, Phone, MessageCircle,
  Clock, Briefcase, Award, Shield, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Professional = Tables<"professionals"> & { categories: { name: string } | null };
type Review = Tables<"reviews">;

interface PendingBooking {
  fullName: string;
  phone: string;
  email?: string;
  preferredDate: string;
  preferredTime: string;
  customTime?: string;
  workersNeeded: number;
  shiftPreference: string;
  hoursNeeded: number;
  paymentOffer?: string;
  jobDescription?: string;
  serviceName?: string;
  location?: string;
}

const ProfessionalProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState(false);
  const [hired, setHired] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<PendingBooking | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("pendingBooking");
    if (stored) {
      try { setPendingBooking(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (id) fetchProfessional();
  }, [id]);

  const fetchProfessional = async () => {
    setLoading(true);
    const [proRes, revRes] = await Promise.all([
      supabase.from("professionals").select("*, categories(name)").eq("id", id!).single(),
      supabase.from("reviews").select("*").eq("professional_id", id!).eq("is_approved", true),
    ]);
    if (proRes.data) setProfessional(proRes.data as Professional);
    if (revRes.data) setReviews(revRes.data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-[calc(5rem+var(--safe-area-top))] flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">Professional not found</p>
          <Button onClick={() => navigate("/search")}>Back to Search</Button>
        </div>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";
  const catName = professional.categories?.name || "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-[calc(5rem+var(--safe-area-top))] pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border overflow-hidden shadow-medium"
          >
            {professional.is_premium && (
              <div className="bg-gold/10 text-gold-foreground text-sm font-semibold px-6 py-2 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Featured Professional · Premium Member
              </div>
            )}
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={professional.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"}
                  alt={professional.full_name}
                  className="w-28 h-28 rounded-2xl object-cover ring-2 ring-border"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      {professional.full_name}
                    </h1>
                    {professional.verification === "verified" && (
                      <BadgeCheck className="w-6 h-6 text-accent" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-lg mb-3">
                    {professional.headline || catName}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-gold fill-gold" />
                      <span className="font-semibold text-foreground">{avgRating}</span>
                      <span className="text-muted-foreground">({reviews.length} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {professional.area}, {professional.city}
                    </div>
                    {professional.experience_years && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Briefcase className="w-4 h-4" />
                        {professional.experience_years} years
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {professional.availability_status || "Available"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-semibold flex-1"
                  onClick={() => window.open(`tel:${professional.phone}`)}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl font-semibold flex-1 border-emerald text-emerald hover:bg-emerald-light"
                  onClick={() => window.open(`https://wa.me/${professional.phone.replace(/[^0-9]/g, "")}`)}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>

            <div className="border-t border-border p-6 md:p-8 space-y-8">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground mb-3">About</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {professional.description || `Experienced ${catName.toLowerCase()} professional serving the ${professional.area}, ${professional.city} area.`}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground mb-3">Services</h2>
                  <ul className="space-y-2">
                    {[`${catName} Consultation`, "Emergency Service", "Regular Maintenance", "Project Work"].map((s) => (
                      <li key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground mb-3">Details</h2>
                  <div className="space-y-3">
                    {professional.hourly_rate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Rate</span>
                        <span className="font-semibold text-foreground">₹{professional.hourly_rate}/hr</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-semibold text-foreground">{catName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Coverage</span>
                      <span className="font-semibold text-foreground">{professional.coverage_radius_km} km</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Verification</span>
                      <span className="flex items-center gap-1 font-semibold text-accent">
                        {professional.verification === "verified" ? <><Shield className="w-3.5 h-3.5" /> Verified</> : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-display text-lg font-bold text-foreground mb-4">
                  Reviews ({reviews.length})
                </h2>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="p-4 rounded-xl bg-secondary/50 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">{r.reviewer_name}</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: r.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-gold fill-gold" />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(r.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No reviews yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfessionalProfile;
