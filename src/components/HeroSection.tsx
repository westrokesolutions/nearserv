import { Search, MapPin, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroProfessional from "@/assets/hero-professional.jpg";

const popularServices = [
  "Plumbing", "Electrical", "Photography", "Web Development", "Tutors",
];

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("Vasai, Maharashtra");
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/search?q=${encodeURIComponent(query)}&loc=${encodeURIComponent(location)}`);
  };

  return (
    <section className="relative bg-card pt-24 pb-0 lg:pt-28 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="py-8 lg:py-16"
          >
            <span className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              India's Trusted Local Services Platform
            </span>

            <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-foreground mb-5 leading-[1.1]">
              Expert Services,{" "}
              <span className="text-accent">Right at Your Doorstep</span>
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-lg leading-relaxed">
              Book verified professionals for any service — from plumbing to photography. Fast, reliable, and in your neighborhood.
            </p>

            {/* Search box */}
            <div className="bg-background rounded-2xl p-2 shadow-elevated border border-border max-w-xl">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2 flex-1 px-4 py-3 rounded-xl bg-card border border-border">
                  <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border sm:w-48">
                  <MapPin className="w-5 h-5 text-accent shrink-0" />
                  <input
                    type="text"
                    placeholder="Location"
                    className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 px-6 py-6 rounded-xl font-semibold text-sm"
                >
                  Search
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Popular tags */}
            <div className="flex flex-wrap items-center gap-2 mt-5">
              <span className="text-muted-foreground text-xs font-medium">Popular:</span>
              {popularServices.map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); navigate(`/search?q=${encodeURIComponent(s)}&loc=${encodeURIComponent(location)}`); }}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-accent/10 hover:text-accent transition-colors font-medium"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
              <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-full bg-gold/10 blur-3xl" />
              <img
                src={heroProfessional}
                alt="Professional service provider"
                className="relative z-10 w-full max-w-md mx-auto rounded-3xl object-cover shadow-dramatic"
              />
              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute z-20 -left-8 bottom-20 bg-card rounded-2xl p-4 shadow-elevated border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-accent text-lg">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">1,000+</p>
                    <p className="text-xs text-muted-foreground">Verified Professionals</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute z-20 -right-4 top-16 bg-card rounded-2xl p-4 shadow-elevated border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <span className="text-gold text-lg">⭐</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">4.8/5</p>
                    <p className="text-xs text-muted-foreground">Average Rating</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-primary mt-8 lg:mt-0">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 py-8 gap-6">
            {[
              { value: "1,000+", label: "Professionals" },
              { value: "50+", label: "Service Categories" },
              { value: "10,000+", label: "Bookings Completed" },
              { value: "4.8★", label: "Average Rating" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="font-display text-2xl md:text-3xl font-extrabold text-primary-foreground">{stat.value}</p>
                <p className="text-primary-foreground/60 text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
