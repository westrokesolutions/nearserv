import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench, Zap, Globe, Palette, GraduationCap, Camera,
  Dumbbell, Hammer, CalendarDays, Scale, ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, any> = {
  wrench: Wrench, zap: Zap, code: Globe, palette: Palette,
  "book-open": GraduationCap, camera: Camera, dumbbell: Dumbbell,
  hammer: Hammer, calendar: CalendarDays, scale: Scale,
};

const colorPalettes = [
  "bg-accent/10 text-accent",
  "bg-gold/10 text-gold",
  "bg-destructive/10 text-destructive",
  "bg-primary/10 text-primary",
  "bg-accent/10 text-accent",
  "bg-gold/10 text-gold",
  "bg-destructive/10 text-destructive",
  "bg-primary/10 text-primary",
  "bg-accent/10 text-accent",
  "bg-gold/10 text-gold",
];

const CategoriesSection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{ name: string; slug: string; icon: string | null }[]>([]);

  useEffect(() => {
    supabase.from("categories").select("name, slug, icon").eq("is_active", true).order("name").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4"
        >
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Services We Offer
            </h2>
            <p className="text-muted-foreground text-lg">
              Choose from a wide range of professional services
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/search")} className="group shrink-0">
            View All
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => {
            const Icon = iconMap[cat.icon || ""] || Wrench;
            const palette = colorPalettes[i % colorPalettes.length];
            return (
              <motion.button
                key={cat.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/category/${cat.slug}`)}
                className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-card border border-border hover:border-accent/40 hover:shadow-elevated transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-2xl ${palette} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <Icon className="w-7 h-7" />
                </div>
                <span className="font-display font-semibold text-foreground text-sm text-center leading-tight">{cat.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
