import { motion } from "framer-motion";
import { Search, UserCheck, Phone } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search",
    description: "Tell us what service you need and your location",
  },
  {
    icon: UserCheck,
    title: "Compare",
    description: "Browse verified professionals with ratings and reviews",
  },
  {
    icon: Phone,
    title: "Connect",
    description: "Contact your chosen professional directly — no middleman",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-secondary/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            How NearServ Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Getting help has never been easier
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px border-t-2 border-dashed border-border" />
              )}
              <div className="w-20 h-20 rounded-2xl bg-accent/10 border-2 border-accent/20 flex items-center justify-center mx-auto mb-6">
                <step.icon className="w-8 h-8 text-accent" />
              </div>
              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent text-accent-foreground text-sm font-bold mb-4">
                {i + 1}
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
