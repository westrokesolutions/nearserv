import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle, ChevronRight, HelpCircle,
  Wrench, Zap, Globe, Palette, GraduationCap, Camera,
  Dumbbell, Hammer, CalendarDays, Scale, IndianRupee,
  ClipboardList, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfessionalCard from "@/components/ProfessionalCard";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const iconMap: Record<string, any> = {
  wrench: Wrench, zap: Zap, code: Globe, palette: Palette,
  "book-open": GraduationCap, camera: Camera, dumbbell: Dumbbell,
  hammer: Hammer, calendar: CalendarDays, scale: Scale,
};

type CategoryRow = Tables<"categories"> & {
  services_included?: { title: string; description?: string }[];
  process_steps?: { step: number; title: string; description?: string }[];
  faqs?: { question: string; answer: string }[];
  price_info?: string | null;
};

type ProfessionalWithCategory = Tables<"professionals"> & {
  categories: { name: string } | null;
};

const CategoryDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<CategoryRow | null>(null);
  const [professionals, setProfessionals] = useState<ProfessionalWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchCategory();
  }, [slug]);

  const fetchCategory = async () => {
    setLoading(true);
    const { data: cat } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug!)
      .eq("is_active", true)
      .single();

    if (cat) {
      const parsed: CategoryRow = {
        ...cat,
        services_included: Array.isArray(cat.services_included) ? cat.services_included as any : [],
        process_steps: Array.isArray(cat.process_steps) ? cat.process_steps as any : [],
        faqs: Array.isArray(cat.faqs) ? cat.faqs as any : [],
        price_info: cat.price_info as string | null,
      };
      setCategory(parsed);

      const { data: pros } = await supabase
        .from("professionals")
        .select("*, categories(name)")
        .eq("category_id", cat.id)
        .eq("status", "approved");
      if (pros) setProfessionals(pros as ProfessionalWithCategory[]);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <p className="text-muted-foreground text-lg mb-4">Category not found</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const Icon = iconMap[category.icon || ""] || Wrench;
  const services = category.services_included || [];
  const steps = category.process_steps || [];
  const faqs = category.faqs || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-[calc(5rem+var(--safe-area-top))] pb-20">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </motion.button>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-8 md:p-12 mb-8"
          >
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <Icon className="w-10 h-10" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed whitespace-pre-line">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {professionals.length} professional{professionals.length !== 1 ? "s" : ""} available
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Services Included */}
              {services.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-2xl border border-border p-6 md:p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground">Services Included</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {services.map((service, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50">
                        <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground text-sm">{service.title}</p>
                          {service.description && (
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{service.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* How It Works / Process Steps */}
              {steps.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card rounded-2xl border border-border p-6 md:p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground">How It Works</h2>
                  </div>
                  <div className="space-y-0">
                    {steps
                      .sort((a, b) => (a.step || 0) - (b.step || 0))
                      .map((step, i) => (
                        <div key={i} className="flex gap-4 relative">
                          {/* Timeline line */}
                          {i < steps.length - 1 && (
                            <div className="absolute left-5 top-10 w-0.5 h-[calc(100%-0.5rem)] bg-border" />
                          )}
                          <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm shrink-0 z-10">
                            {step.step || i + 1}
                          </div>
                          <div className="pb-8 min-w-0">
                            <p className="font-semibold text-foreground">{step.title}</p>
                            {step.description && (
                              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </motion.div>
              )}

              {/* FAQs */}
              {faqs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card rounded-2xl border border-border p-6 md:p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground">Frequently Asked Questions</h2>
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, i) => (
                      <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                        <AccordionTrigger className="text-foreground text-sm font-semibold text-left hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing Info */}
              {category.price_info && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-card rounded-2xl border border-border p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                      <IndianRupee className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground">Pricing Info</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{category.price_info}</p>
                </motion.div>
              )}

              {/* Book Now CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-accent/5 rounded-2xl border border-accent/20 p-6 text-center"
              >
                <h3 className="font-display text-lg font-bold text-foreground mb-2">Need this service?</h3>
                <p className="text-sm text-muted-foreground mb-4">Browse verified professionals and book instantly</p>
                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(category.name)}`)}
                >
                  Find Professionals
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Professionals in this category */}
          {professionals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12"
            >
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                Available {category.name} Professionals
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {professionals.slice(0, 6).map((pro, i) => (
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
              {professionals.length > 6 && (
                <div className="text-center mt-6">
                  <Button variant="outline" onClick={() => navigate(`/search?q=${encodeURIComponent(category.name)}`)}>
                    View All {professionals.length} Professionals
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryDetail;
