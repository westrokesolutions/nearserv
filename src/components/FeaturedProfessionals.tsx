import { motion } from "framer-motion";
import ProfessionalCard, { mockProfessionals } from "./ProfessionalCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FeaturedProfessionals = () => {
  const navigate = useNavigate();
  const featured = mockProfessionals.slice(0, 6);

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
          <Button
            variant="outline"
            onClick={() => navigate("/search")}
            className="group"
          >
            View all
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((pro, i) => (
            <ProfessionalCard key={pro.id} professional={pro} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProfessionals;
