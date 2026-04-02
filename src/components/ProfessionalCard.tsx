import { motion } from "framer-motion";
import { Star, BadgeCheck, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface Professional {
  id: string;
  name: string;
  headline: string;
  category: string;
  rating: number;
  reviewCount: number;
  location: string;
  experience: string;
  verified: boolean;
  premium: boolean;
  avatar: string;
  hourlyRate?: string;
}

export const mockProfessionals: Professional[] = [
  {
    id: "1", name: "Rajesh Sharma", headline: "Expert Plumber · 12 Years",
    category: "Plumbing", rating: 4.9, reviewCount: 127, location: "Vasai West",
    experience: "12 years", verified: true, premium: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    hourlyRate: "₹500/hr",
  },
  {
    id: "2", name: "Priya Desai", headline: "Certified Electrician",
    category: "Electrical", rating: 4.8, reviewCount: 93, location: "Vasai East",
    experience: "8 years", verified: true, premium: false,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    hourlyRate: "₹400/hr",
  },
  {
    id: "3", name: "Amit Patel", headline: "Full-Stack Web Developer",
    category: "Web Development", rating: 4.7, reviewCount: 68, location: "Nalasopara",
    experience: "6 years", verified: true, premium: true,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    hourlyRate: "₹1,200/hr",
  },
  {
    id: "4", name: "Sneha Kulkarni", headline: "Professional Photographer",
    category: "Photography", rating: 4.9, reviewCount: 156, location: "Virar",
    experience: "10 years", verified: true, premium: false,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    hourlyRate: "₹800/hr",
  },
  {
    id: "5", name: "Vikram Joshi", headline: "Home Fitness Trainer",
    category: "Fitness Trainers", rating: 4.6, reviewCount: 42, location: "Vasai West",
    experience: "5 years", verified: false, premium: false,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    hourlyRate: "₹600/hr",
  },
  {
    id: "6", name: "Meera Nair", headline: "Creative Graphic Designer",
    category: "Graphic Design", rating: 4.8, reviewCount: 89, location: "Vasai East",
    experience: "7 years", verified: true, premium: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    hourlyRate: "₹900/hr",
  },
];

interface ProfessionalCardProps {
  professional: Professional;
  index?: number;
  onHire?: (professional: Professional) => void;
  showHireButton?: boolean;
  hiring?: boolean;
}

const ProfessionalCard = ({ professional, index = 0, onHire, showHireButton = false, hiring = false }: ProfessionalCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className={`group rounded-2xl bg-card border transition-all duration-300 hover:shadow-elevated overflow-hidden ${
        professional.premium ? "border-gold/40 ring-1 ring-gold/20" : "border-border hover:border-accent/30"
      }`}
    >
      {professional.premium && (
        <div className="bg-gold/10 text-gold-foreground text-xs font-semibold px-4 py-1.5 text-center tracking-wide">
          ⭐ FEATURED PROFESSIONAL
        </div>
      )}
      <div className="p-5 cursor-pointer" onClick={() => navigate(`/professional/${professional.id}`)}>
        <div className="flex items-start gap-4">
          <img
            src={professional.avatar}
            alt={professional.name}
            className="w-16 h-16 rounded-xl object-cover ring-2 ring-border"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-bold text-foreground truncate">{professional.name}</h3>
              {professional.verified && (
                <BadgeCheck className="w-5 h-5 text-accent shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{professional.headline}</p>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-gold fill-gold" />
                <span className="font-semibold text-foreground">{professional.rating}</span>
                <span className="text-muted-foreground">({professional.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span>{professional.location}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-sm font-medium text-accent">{professional.hourlyRate}</span>
          <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            {professional.category}
          </span>
        </div>
      </div>
      {showHireButton && onHire && (
        <div className="px-5 pb-5">
          <button
            onClick={(e) => { e.stopPropagation(); onHire(professional); }}
            disabled={hiring}
            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {hiring ? "Processing..." : "👉 Hire this Professional"}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default ProfessionalCard;
