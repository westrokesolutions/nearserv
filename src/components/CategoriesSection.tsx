import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Wrench, Zap, Globe, Palette, GraduationCap, Camera,
  Dumbbell, Hammer, CalendarDays, Scale,
} from "lucide-react";

const categories = [
  { name: "Plumbing", icon: Wrench, count: 48 },
  { name: "Electrical", icon: Zap, count: 62 },
  { name: "Web Development", icon: Globe, count: 35 },
  { name: "Graphic Design", icon: Palette, count: 41 },
  { name: "Tutors", icon: GraduationCap, count: 73 },
  { name: "Photography", icon: Camera, count: 29 },
  { name: "Fitness Trainers", icon: Dumbbell, count: 54 },
  { name: "Carpentry", icon: Hammer, count: 22 },
  { name: "Event Services", icon: CalendarDays, count: 38 },
  { name: "Legal & Financial", icon: Scale, count: 19 },
];

const CategoriesSection = () => {
  const navigate = useNavigate();

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
          {categories.map((cat, i) => (
            <motion.button
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/search?q=${encodeURIComponent(cat.name)}`)}
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border hover:border-accent/40 hover:shadow-elevated transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-emerald-light flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <cat.icon className="w-6 h-6 text-accent" />
              </div>
              <span className="font-medium text-foreground text-sm">{cat.name}</span>
              <span className="text-xs text-muted-foreground">{cat.count} pros</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
