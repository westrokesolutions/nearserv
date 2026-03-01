import { Link } from "react-router-dom";
import { MapPin, Shield, Award } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <MapPin className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">NearServ</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Find Services
            </Link>
            <Link to="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Categories
            </Link>
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <Shield className="w-3.5 h-3.5" />
              Trust & Safety
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/search"
              className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors"
            >
              <Award className="w-4 h-4" />
              Join as Pro
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
