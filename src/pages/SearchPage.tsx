import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, BadgeCheck, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfessionalCard from "@/components/ProfessionalCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type ProfessionalWithCategory = Tables<"professionals"> & {
  categories: { name: string } | null;
  avg_rating?: number;
  review_count?: number;
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [professionals, setProfessionals] = useState<ProfessionalWithCategory[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchProfessionals();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("name")
      .eq("is_active", true)
      .order("name");
    if (data) setCategories(data.map((c) => c.name));
  };

  const fetchProfessionals = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("professionals")
      .select("*, categories(name)")
      .eq("status", "approved");
    if (data) setProfessionals(data as ProfessionalWithCategory[]);
    setLoading(false);
  };

  const filtered = professionals.filter((p) => {
    const catName = p.categories?.name || "";
    const matchesQuery =
      !query ||
      p.full_name.toLowerCase().includes(query.toLowerCase()) ||
      catName.toLowerCase().includes(query.toLowerCase()) ||
      (p.headline || "").toLowerCase().includes(query.toLowerCase());
    const matchesCat = selectedCategory === "All" || catName === selectedCategory;
    const matchesVerified = !verifiedOnly || p.verification === "verified";
    return matchesQuery && matchesCat && matchesVerified;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-1 px-4 py-3 rounded-xl bg-card border border-border">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search services or professionals..."
                  className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button onClick={() => setQuery("")}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              <Button variant="outline" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 p-4 rounded-xl bg-card border border-border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="rounded" />
                  <BadgeCheck className="w-4 h-4 text-accent" />
                  <span className="text-sm text-foreground">Verified only</span>
                </label>
              </motion.div>
            )}
          </motion.div>

          <div className="flex flex-wrap gap-2 mb-8">
            {["All", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            {loading ? "Loading..." : `${filtered.length} professional${filtered.length !== 1 ? "s" : ""} found`}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((pro, i) => (
              <ProfessionalCard
                key={pro.id}
                professional={{
                  id: pro.id,
                  name: pro.full_name,
                  headline: pro.headline || pro.categories?.name || "",
                  category: pro.categories?.name || "",
                  rating: 0,
                  reviewCount: 0,
                  location: `${pro.area}, ${pro.city}`,
                  experience: pro.experience_years ? `${pro.experience_years} years` : "",
                  verified: pro.verification === "verified",
                  premium: pro.is_premium,
                  avatar: pro.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
                  hourlyRate: pro.hourly_rate ? `₹${pro.hourly_rate}/hr` : undefined,
                }}
                index={i}
              />
            ))}
          </div>

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No professionals found. Try adjusting your search.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchPage;
