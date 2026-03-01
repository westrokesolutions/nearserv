import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background/70 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <MapPin className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-background">NearServ</span>
            </div>
            <p className="text-sm leading-relaxed">
              Services Near You. Instantly. Connecting you with verified local professionals.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-background mb-4">For Customers</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/search" className="hover:text-background transition-colors">Find Services</Link></li>
              <li><Link to="/search" className="hover:text-background transition-colors">Browse Categories</Link></li>
              <li><Link to="/" className="hover:text-background transition-colors">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-background mb-4">For Professionals</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-background transition-colors">Register</Link></li>
              <li><Link to="/" className="hover:text-background transition-colors">Premium Listing</Link></li>
              <li><Link to="/" className="hover:text-background transition-colors">Verification</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-background mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-background transition-colors">About Us</Link></li>
              <li><Link to="/" className="hover:text-background transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-background transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-background transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} NearServ. All rights reserved. Made with ❤️ in Vasai.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
