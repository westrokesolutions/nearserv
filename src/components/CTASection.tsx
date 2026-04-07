import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 lg:py-24 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-accent blur-[100px]" />
        <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-accent blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary-foreground/5 backdrop-blur-sm rounded-3xl p-8 border border-primary-foreground/10 text-center"
          >
            <Search className="w-10 h-10 text-gold mb-4 mx-auto" />
            <h3 className="font-display text-2xl font-bold text-primary-foreground mb-3">
              Looking for Services?
            </h3>
            <p className="text-primary-foreground/60 text-sm mb-6 leading-relaxed">
              Browse verified professionals, compare ratings, and find the perfect expert for any job — big or small.
            </p>
            <Button
              variant="outline"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 rounded-xl font-semibold"
              onClick={() => navigate("/search")}
            >
              Find Services
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
