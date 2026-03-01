import { Search, MapPin } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const categories = [
  "Plumbing", "Electrical", "Web Development", "Graphic Design",
  "Tutors", "Photography", "Fitness", "Carpentry",
];

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("Vasai, Maharashtra");
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/search?q=${encodeURIComponent(query)}&loc=${encodeURIComponent(location)}`);
  };

  return (
    <section className="relative overflow-hidden bg-primary pt-32 pb-24 lg:pt-40 lg:pb-32">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-accent blur-[100px]" />
        <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-accent blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center"
        >
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium">
            Trusted by 1,000+ professionals
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            Services Near You.{" "}
            <span className="text-accent">Instantly.</span>
          </h1>
          <p className="text-primary-foreground/70 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Discover verified professionals in your neighborhood. From plumbing to photography — find the right expert in seconds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row gap-3 bg-card rounded-2xl p-3 shadow-dramatic">
            <div className="flex items-center gap-2 flex-1 px-4 py-3 rounded-xl bg-secondary">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="What service do you need?"
                className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary sm:w-56">
              <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Location"
                className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 rounded-xl font-semibold text-base"
            >
              Search
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <span className="text-primary-foreground/50 text-sm">Popular:</span>
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => { setQuery(cat); navigate(`/search?q=${encodeURIComponent(cat)}&loc=${encodeURIComponent(location)}`); }}
                className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
