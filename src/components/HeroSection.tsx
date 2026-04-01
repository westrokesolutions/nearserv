import { Search, MapPin, ArrowRight, Crosshair, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import heroProfessional from "@/assets/hero-professional.jpg";

type CategorySuggestion = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
};

const popularServices = [
  "Plumbing", "Electrical", "Photography", "Web Development", "Tutors",
];

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Fetch matching categories as user types
  useEffect(() => {
    if (query.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug, icon")
        .eq("is_active", true)
        .ilike("name", `%${query.trim()}%`)
        .limit(6);
      if (data && data.length > 0) {
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectSuggestion = (cat: CategorySuggestion) => {
    setQuery(cat.name);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    navigate(`/search?q=${encodeURIComponent(query)}&loc=${encodeURIComponent(location)}`);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&addressdetails=1`
          );
          const data = await res.json();
          const addr = data.address || {};
          const area = addr.suburb || addr.neighbourhood || addr.village || addr.town || "";
          const city = addr.city || addr.state_district || addr.county || "";
          setLocation(area && city ? `${area}, ${city}` : area || city || `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        } catch {
          setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        }
        setDetectingLocation(false);
      },
      () => setDetectingLocation(false),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <section className="relative bg-card pt-[calc(5rem+var(--safe-area-top))] pb-0 lg:pt-[calc(7rem+var(--safe-area-top))] overflow-hidden">
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
                {/* Service search with autocomplete */}
                <div className="relative flex-1" ref={suggestionsRef}>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border">
                    <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="What service do you need?"
                      className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>

                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-elevated overflow-hidden"
                      >
                        {suggestions.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleSelectSuggestion(cat)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/10 transition-colors"
                          >
                            <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-base shrink-0">
                              {cat.icon || "🔧"}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-foreground">{cat.name}</p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Location with auto-detect */}
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border sm:w-52">
                  <MapPin className="w-5 h-5 text-accent shrink-0" />
                  <input
                    type="text"
                    placeholder="Your location"
                    className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <button
                    onClick={detectLocation}
                    disabled={detectingLocation}
                    className="shrink-0 text-accent hover:text-accent/80 transition-colors"
                    title="Detect my location"
                  >
                    {detectingLocation ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Crosshair className="w-4 h-4" />
                    )}
                  </button>
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
