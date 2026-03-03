import { motion } from "framer-motion";
import { Search, UserCheck, Phone, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search Service",
    description: "Tell us what service you need and enter your location to find nearby professionals.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: UserCheck,
    title: "Choose Professional",
    description: "Compare verified professionals with ratings, reviews, and transparent pricing.",
    color: "bg-gold/10 text-gold",
  },
  {
    icon: Phone,
    title: "Book & Connect",
    description: "Contact your chosen professional directly and schedule the service at your convenience.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: CheckCircle,
    title: "Get It Done",
    description: "Enjoy quality service at your doorstep and leave a review to help others.",
    color: "bg-accent/10 text-accent",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Get professional help in 4 simple steps
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center p-6"
            >
              {/* Step number */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center shadow-md z-10">
                {i + 1}
              </div>

              <div className={`w-20 h-20 rounded-3xl ${step.color} flex items-center justify-center mx-auto mb-5 mt-4`}>
                <step.icon className="w-9 h-9" />
              </div>

              <h3 className="font-display text-lg font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-px border-t-2 border-dashed border-border" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
