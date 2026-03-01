import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, BadgeCheck, Star, MapPin, Phone, MessageCircle,
  Clock, Briefcase, Award, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockProfessionals } from "@/components/ProfessionalCard";

const mockReviews = [
  { id: "1", author: "Anita M.", rating: 5, text: "Excellent work, very professional and on time. Highly recommended!", date: "2 weeks ago" },
  { id: "2", author: "Rohan K.", rating: 4, text: "Good quality service. Fair pricing. Will hire again.", date: "1 month ago" },
  { id: "3", author: "Priyanka S.", rating: 5, text: "Best in the area! Very responsive and skilled.", date: "2 months ago" },
];

const ProfessionalProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const professional = mockProfessionals.find((p) => p.id === id);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
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
            {/* Header */}
            {professional.premium && (
              <div className="bg-gold/10 text-gold-foreground text-sm font-semibold px-6 py-2 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Featured Professional · Premium Member
              </div>
            )}
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={professional.avatar}
                  alt={professional.name}
                  className="w-28 h-28 rounded-2xl object-cover ring-2 ring-border"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      {professional.name}
                    </h1>
                    {professional.verified && (
                      <BadgeCheck className="w-6 h-6 text-accent" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-lg mb-3">{professional.headline}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-gold fill-gold" />
                      <span className="font-semibold text-foreground">{professional.rating}</span>
                      <span className="text-muted-foreground">({professional.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {professional.location}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                      {professional.experience}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Available now
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-semibold flex-1"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl font-semibold flex-1 border-emerald text-emerald hover:bg-emerald-light"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>

            {/* Details sections */}
            <div className="border-t border-border p-6 md:p-8 space-y-8">
              {/* About */}
              <div>
                <h2 className="font-display text-lg font-bold text-foreground mb-3">About</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Experienced {professional.category.toLowerCase()} professional serving the {professional.location} area
                  with {professional.experience} of hands-on experience. Committed to quality work and customer satisfaction.
                  Available for both residential and commercial projects.
                </p>
              </div>

              {/* Services & Pricing */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground mb-3">Services</h2>
                  <ul className="space-y-2">
                    {[`${professional.category} Consultation`, "Emergency Service", "Regular Maintenance", "Project Work"].map((s) => (
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
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="font-semibold text-foreground">{professional.hourlyRate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-semibold text-foreground">{professional.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Verification</span>
                      <span className="flex items-center gap-1 font-semibold text-accent">
                        {professional.verified ? <><Shield className="w-3.5 h-3.5" /> Verified</> : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h2 className="font-display text-lg font-bold text-foreground mb-4">
                  Reviews ({professional.reviewCount})
                </h2>
                <div className="space-y-4">
                  {mockReviews.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl bg-secondary/50 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">{r.author}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-gold fill-gold" />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{r.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{r.text}</p>
                    </div>
                  ))}
                </div>
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
