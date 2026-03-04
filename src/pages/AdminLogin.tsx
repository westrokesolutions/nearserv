import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      // The admin check happens in AuthContext; redirect to dashboard
      // and let the dashboard guard handle non-admin users
      navigate("/admin");
    } catch (error: any) {
      const message =
        error.message === "Failed to fetch"
          ? "Network error. Please check your connection."
          : error.message;
      toast({ title: "Login failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display text-3xl font-bold text-primary-foreground mb-1">
            Admin Portal
          </h1>
          <p className="text-primary-foreground/60 text-sm">
            NearServ Management Console
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-foreground">
                Admin Email
              </Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@nearserv.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-11"
            >
              {loading ? "Signing in..." : "Sign In to Dashboard"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            This portal is for authorized administrators only.
            <br />
            Unauthorized access attempts will be logged.
          </p>
        </div>

        <p className="text-primary-foreground/40 text-xs text-center mt-6">
          © {new Date().getFullYear()} NearServ. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
