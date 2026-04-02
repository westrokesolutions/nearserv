import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, BadgeCheck, X, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfessionalCard from "@/components/ProfessionalCard";
import type { Professional } from "@/components/ProfessionalCard";
import BookingFlow, { type BookingDetails } from "@/components/BookingFlow";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type ProfessionalWithCategory = Tables<"professionals"> & {
  categories: { name: string } | null;
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialLocation = searchParams.get("loc") || "";
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [professionals, setProfessionals] = useState<ProfessionalWithCategory[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState(false);
  const [hiredPro, setHiredPro] = useState<string | null>(null);

  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchProfessionals();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("name")
      .eq("is_active", true)
      .order("name");
    if (data) setCategories(data.map((c) => c.name));
  };

  const fetchProfessionals = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("professionals")
      .select("*, categories(name)")
      .eq("status", "approved");
    if (data) setProfessionals(data as ProfessionalWithCategory[]);
    setLoading(false);
  };

  const filtered = professionals.filter((p) => {
    const catName = p.categories?.name || "";
    const matchesQuery =
      !query ||
      p.full_name.toLowerCase().includes(query.toLowerCase()) ||
      catName.toLowerCase().includes(query.toLowerCase()) ||
      (p.headline || "").toLowerCase().includes(query.toLowerCase());
    const matchesCat = selectedCategory === "All" || catName === selectedCategory;
    const matchesVerified = !verifiedOnly || p.verification === "verified";
    return matchesQuery && matchesCat && matchesVerified;
  });

  const handleBookingComplete = (details: BookingDetails) => {
    setBookingDetails(details);
    setBookingComplete(true);
    // Store booking details for the profile page hire button
    sessionStorage.setItem("pendingBooking", JSON.stringify({
      ...details,
      serviceName: initialQuery || null,
      location: initialLocation || null,
    }));
  };

  const handleHire = async (professional: Professional) => {
    if (!bookingDetails) return;
    setHiring(true);

    try {
      // Save booking to database
      const { error } = await supabase.from("bookings").insert({
        customer_name: bookingDetails.fullName,
        customer_phone: bookingDetails.phone,
        customer_email: bookingDetails.email || null,
        service_name: initialQuery || null,
        location: initialLocation || null,
        preferred_date: bookingDetails.preferredDate,
        preferred_time: bookingDetails.preferredTime || bookingDetails.customTime,
        custom_time: bookingDetails.customTime || null,
        workers_needed: bookingDetails.workersNeeded,
        shift_preference: bookingDetails.shiftPreference,
        hours_needed: bookingDetails.hoursNeeded,
        payment_offer: bookingDetails.paymentOffer || null,
        job_description: bookingDetails.jobDescription || null,
        professional_id: professional.id,
        professional_name: professional.name,
        status: "confirmed",
      });

      if (error) throw error;

      // Try to send SMS confirmation
      try {
        await supabase.functions.invoke("send-booking-sms", {
          body: {
            customerPhone: `+91${bookingDetails.phone}`,
            customerName: bookingDetails.fullName,
            professionalName: professional.name,
            preferredDate: bookingDetails.preferredDate,
            preferredTime: bookingDetails.preferredTime || bookingDetails.customTime,
          },
        });
      } catch {
        // SMS is best-effort, don't block the booking
        console.log("SMS sending skipped or failed");
      }

      setHiredPro(professional.id);
      toast({
        title: "🎉 Booking Confirmed!",
        description: `You have successfully hired ${professional.name}. A confirmation SMS has been sent to +91 ${bookingDetails.phone}.`,
      });
    } catch (err: any) {
      toast({
        title: "Booking Failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setHiring(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-[calc(5rem+var(--safe-area-top))] pb-20">
        <div className="container mx-auto px-4">
          {!bookingComplete ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-8">
              <BookingFlow
                onComplete={handleBookingComplete}
                serviceName={initialQuery}
                location={initialLocation}
              />
            </motion.div>
          ) : hiredPro ? (
            /* Success state */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20 text-center max-w-md mx-auto"
            >
              <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
              <p className="text-muted-foreground mb-2">
                You have successfully hired <strong>{professionals.find(p => p.id === hiredPro)?.full_name}</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                A confirmation SMS has been sent to <strong>+91 {bookingDetails?.phone}</strong>.
              </p>
              <Button
                className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => window.location.href = "/"}
              >
                Back to Home
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Booking summary banner */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20"
              >
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <span><span className="text-muted-foreground">Customer:</span> <strong className="text-foreground">{bookingDetails?.fullName}</strong></span>
                  <span><span className="text-muted-foreground">Phone:</span> <strong className="text-foreground">+91 {bookingDetails?.phone}</strong></span>
                  {bookingDetails?.email && <span><span className="text-muted-foreground">Email:</span> <strong className="text-foreground">{bookingDetails.email}</strong></span>}
                  <span><span className="text-muted-foreground">Date:</span> <strong className="text-foreground">{bookingDetails?.preferredDate}</strong></span>
                  <span><span className="text-muted-foreground">Time:</span> <strong className="text-foreground">{bookingDetails?.preferredTime}</strong></span>
                  <span><span className="text-muted-foreground">Workers:</span> <strong className="text-foreground">{bookingDetails?.workersNeeded}</strong></span>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Now Choose Your Professional</h2>
                <p className="text-muted-foreground text-sm mb-6">Select a professional to complete your booking.</p>

                <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
                  <div className="flex items-center gap-2 flex-1 px-4 py-3 rounded-xl bg-card border border-border">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search services or professionals..."
                      className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                      <button onClick={() => setQuery("")}>
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  <Button variant="outline" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </Button>
                </div>

                {showFilters && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 p-4 rounded-xl bg-card border border-border">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="rounded" />
                      <BadgeCheck className="w-4 h-4 text-accent" />
                      <span className="text-sm text-foreground">Verified only</span>
                    </label>
                  </motion.div>
                )}
              </motion.div>

              <div className="flex flex-wrap gap-2 mb-8">
                {["All", ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === cat
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                {loading ? "Loading..." : `${filtered.length} professional${filtered.length !== 1 ? "s" : ""} found`}
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((pro, i) => (
                  <ProfessionalCard
                    key={pro.id}
                    professional={{
                      id: pro.id,
                      name: pro.full_name,
                      headline: pro.headline || pro.categories?.name || "",
                      category: pro.categories?.name || "",
                      rating: 0,
                      reviewCount: 0,
                      location: `${pro.area}, ${pro.city}`,
                      experience: pro.experience_years ? `${pro.experience_years} years` : "",
                      verified: pro.verification === "verified",
                      premium: pro.is_premium,
                      avatar: pro.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
                      hourlyRate: pro.hourly_rate ? `₹${pro.hourly_rate}/hr` : undefined,
                    }}
                    index={i}
                  />
                ))}
              </div>

              {!loading && filtered.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">No professionals found. Try adjusting your search.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchPage;
