import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, UserPlus, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CTASection = () => {
  const navigate = useNavigate();
  const { loading, isProfessional } = useAuth();
  const showProfessionalCta = !loading && !isProfessional;

  return (
    <section className="py-16 lg:py-24 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-accent blur-[100px]" />
        <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-accent blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`grid gap-8 max-w-4xl mx-auto ${showProfessionalCta ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
          {showProfessionalCta && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-primary-foreground/5 backdrop-blur-sm rounded-3xl p-8 border border-primary-foreground/10"
            >
              <UserPlus className="w-10 h-10 text-accent mb-4" />
              <h3 className="font-display text-2xl font-bold text-primary-foreground mb-3">
                Are You a Professional?
              </h3>
              <p className="text-primary-foreground/60 text-sm mb-6 leading-relaxed">
                Join NearServ and get discovered by thousands of customers in your area. Create your profile in minutes.
              </p>
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-semibold w-full sm:w-auto"
                onClick={() => navigate("/register")}
              >
                Register Now
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {/* For customers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-primary-foreground/5 backdrop-blur-sm rounded-3xl p-8 border border-primary-foreground/10"
          >
            <Search className="w-10 h-10 text-gold mb-4" />
            <h3 className="font-display text-2xl font-bold text-primary-foreground mb-3">
              Looking for Services?
            </h3>
            <p className="text-primary-foreground/60 text-sm mb-6 leading-relaxed">
              Browse verified professionals, compare ratings, and find the perfect expert for any job — big or small.
            </p>
            <Button
              variant="outline"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 rounded-xl font-semibold w-full sm:w-auto"
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
