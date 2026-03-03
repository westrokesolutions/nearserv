import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ProfessionalCard from "./ProfessionalCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type ProfessionalWithCategory = Tables<"professionals"> & {
  categories: { name: string } | null;
};

const FeaturedProfessionals = () => {
  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState<ProfessionalWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("professionals")
      .select("*, categories(name)")
      .eq("status", "approved")
      .order("is_premium", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data) setProfessionals(data as ProfessionalWithCategory[]);
        setLoading(false);
      });
  }, []);

  if (loading || professionals.length === 0) {
    return null;
  }

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4"
        >
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Featured Professionals
            </h2>
            <p className="text-muted-foreground text-lg">
              Top-rated, verified experts ready to help
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/search")} className="group">
            View all
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {professionals.map((pro, i) => (
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
      </div>
    </section>
  );
};

export default FeaturedProfessionals;
