import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Footer = () => {
  const { loading, isProfessional } = useAuth();

  return (
    <footer className="bg-foreground text-background/70 safe-bottom">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 py-14">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <MapPin className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-background">NearServ</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              India's trusted platform for local professional services. Connecting you with verified experts near you.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-accent/20 hover:text-accent transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-background mb-4 text-sm uppercase tracking-wider">For Customers</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/search" className="hover:text-accent transition-colors">Find Services</Link></li>
              <li><Link to="/search" className="hover:text-accent transition-colors">Browse Categories</Link></li>
              <li><Link to="/" className="hover:text-accent transition-colors">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-background mb-4 text-sm uppercase tracking-wider">For Professionals</h4>
            <ul className="space-y-2.5 text-sm">
              {!loading && !isProfessional && <li><Link to="/register" className="hover:text-accent transition-colors">Register</Link></li>}
              <li><Link to="/" className="hover:text-accent transition-colors">Premium Listing</Link></li>
              <li><Link to="/" className="hover:text-accent transition-colors">Verification</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-background mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                support@nearserv.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                +91 98765 43210
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                Vasai, Maharashtra, India
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} NearServ. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-accent transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
