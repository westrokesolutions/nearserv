import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench, Zap, Globe, Palette, GraduationCap, Camera,
  Dumbbell, Hammer, CalendarDays, Scale,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = {
  wrench: Wrench, zap: Zap, code: Globe, palette: Palette,
  "book-open": GraduationCap, camera: Camera, dumbbell: Dumbbell,
  hammer: Hammer, calendar: CalendarDays, scale: Scale,
};

const CategoriesSection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{ name: string; slug: string; icon: string | null }[]>([]);

  useEffect(() => {
    supabase.from("categories").select("name, slug, icon").eq("is_active", true).order("name").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Browse by Category
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Find the right professional for any job, big or small
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => {
            const Icon = iconMap[cat.icon || ""] || Wrench;
            return (
              <motion.button
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/search?q=${encodeURIComponent(cat.name)}`)}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border hover:border-accent/40 hover:shadow-elevated transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-emerald-light flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <span className="font-medium text-foreground text-sm">{cat.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
