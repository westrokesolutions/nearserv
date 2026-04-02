import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Shield, Phone, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("phone");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithOtp, verifyOtp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const redirectTo = searchParams.get("redirect") || "/";

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast({ title: "Invalid Phone", description: "Enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await signInWithOtp(`+91${phone}`);
      setOtpSent(true);
      toast({ title: "OTP Sent!", description: `A verification code has been sent to +91 ${phone}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({ title: "Invalid OTP", description: "Please enter the 6-digit code.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(`+91${phone}`, otp);
      toast({ title: "Welcome!" });
      navigate(redirectTo);
    } catch (error: any) {
      toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: "Enter your email", description: "Please enter your email address first.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      toast({ title: "Reset link sent!", description: `Check your inbox at ${email} for a password reset link.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin || isAdminLogin) {
        await signIn(email, password);
        toast({ title: isAdminLogin ? "Welcome, Admin!" : "Welcome back!" });
        navigate(isAdminLogin ? "/admin" : redirectTo);
      } else {
        await signUp(email, password, fullName);
        await signIn(email, password);
        toast({ title: "Account created! Welcome to NearServ." });
        navigate(redirectTo);
      }
    } catch (error: any) {
      const message = error.message === "Failed to fetch"
        ? "Network error. Please check your connection and try again."
        : error.message;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-[calc(5rem+var(--safe-area-top))] pb-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-4"
        >
          <div className="text-center mb-8">
            {isAdminLogin ? (
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-primary" />
              </div>
            ) : null}
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {isAdminLogin ? "Admin Portal" : isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-muted-foreground">
              {isAdminLogin
                ? "Sign in to the NearServ management console"
                : isLogin
                ? "Sign in to your NearServ account"
                : "Join NearServ today"}
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-medium p-6 md:p-8">
            {/* Admin toggle */}
            <div className="flex items-center justify-between mb-6 p-3 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Admin Login</span>
              </div>
              <Switch
                checked={isAdminLogin}
                onCheckedChange={(checked) => {
                  setIsAdminLogin(checked);
                  if (checked) { setIsLogin(true); setLoginMethod("email"); }
                }}
              />
            </div>

            {/* Login method toggle (not shown for admin) */}
            {!isAdminLogin && isLogin && (
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => { setLoginMethod("phone"); setOtpSent(false); setOtp(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    loginMethod === "phone"
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card border-border text-muted-foreground hover:border-accent/50"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  Mobile OTP
                </button>
                <button
                  onClick={() => setLoginMethod("email")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    loginMethod === "email"
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card border-border text-muted-foreground hover:border-accent/50"
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
              </div>
            )}

            {/* Phone OTP login */}
            {loginMethod === "phone" && isLogin && !isAdminLogin ? (
              <div className="space-y-4">
                {!otpSent ? (
                  <>
                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-2 mb-1.5">
                        <Phone className="w-4 h-4 text-accent" />
                        Mobile Number
                      </Label>
                      <div className="flex">
                        <span className="flex items-center px-3 bg-secondary rounded-l-md border border-r-0 border-input text-sm text-muted-foreground">+91</span>
                        <Input
                          id="phone"
                          placeholder="9876543210"
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
                    >
                      {loading ? "Sending..." : "Send OTP"}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-2">
                      <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code sent to <strong className="text-foreground">+91 {phone}</strong>
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <Button
                      onClick={handleVerifyOtp}
                      disabled={loading}
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
                    >
                      {loading ? "Verifying..." : "Verify & Sign In"}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <button
                      onClick={() => { setOtpSent(false); setOtp(""); }}
                      className="text-sm text-muted-foreground hover:text-foreground w-full text-center transition-colors"
                    >
                      Change number
                    </button>
                  </>
                )}
              </div>
            ) : (
              /* Email login / signup form */
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {!isLogin && !isAdminLogin && (
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={isAdminLogin ? "admin@nearserv.com" : "you@example.com"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
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
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
                >
                  {loading
                    ? "Please wait..."
                    : isAdminLogin
                    ? "Sign In to Dashboard"
                    : isLogin
                    ? "Sign In"
                    : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            )}

            {!isAdminLogin && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => { setIsLogin(!isLogin); setLoginMethod(isLogin ? "email" : "phone"); setOtpSent(false); setOtp(""); }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <span className="font-semibold text-accent">
                    {isLogin ? "Sign up" : "Sign in"}
                  </span>
                </button>
              </div>
            )}

            {isAdminLogin && (
              <p className="text-xs text-muted-foreground text-center mt-6">
                This portal is for authorized administrators only.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
