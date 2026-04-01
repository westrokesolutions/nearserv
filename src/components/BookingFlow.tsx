import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, Mail, Calendar, Clock, Users, ArrowRight, ArrowLeft, CheckCircle2, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type BookingDetails = {
  fullName: string;
  phone: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  customTime: string;
  workersNeeded: number;
  shiftPreference: "day" | "night";
};

type Props = {
  onComplete: (details: BookingDetails) => void;
  serviceName?: string;
  location?: string;
};

const timeSlots = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM",
];

const BookingFlow = ({ onComplete, serviceName, location }: Props) => {
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<BookingDetails>({
    fullName: "",
    phone: "",
    email: "",
    preferredDate: "",
    preferredTime: "",
    customTime: "",
    workersNeeded: 1,
    shiftPreference: "day",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!details.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!details.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(details.phone.trim())) newErrors.phone = "Enter a valid 10-digit phone number";
    if (details.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) newErrors.email = "Enter a valid email";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!details.preferredDate) newErrors.preferredDate = "Please select a date";
    if (!details.preferredTime && !details.customTime) newErrors.preferredTime = "Please select or enter a time";
    if (details.workersNeeded < 1) newErrors.workersNeeded = "At least 1 worker required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) {
      setStep(3);
      onComplete(details);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
            {s < 3 && (
              <div className={`w-12 h-0.5 ${step > s ? "bg-accent" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex justify-between text-xs text-muted-foreground mb-6 px-2">
        <span className={step >= 1 ? "text-accent font-medium" : ""}>Your Details</span>
        <span className={step >= 2 ? "text-accent font-medium" : ""}>Preferences</span>
        <span className={step >= 3 ? "text-accent font-medium" : ""}>Choose Pro</span>
      </div>

      {serviceName && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 mb-6 text-sm">
          <span className="text-muted-foreground">Service: </span>
          <span className="font-semibold text-foreground">{serviceName}</span>
          {location && (
            <>
              <span className="text-muted-foreground ml-3">Location: </span>
              <span className="font-semibold text-foreground">{location}</span>
            </>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <h2 className="text-xl font-bold text-foreground">Tell us about yourself</h2>
            <p className="text-sm text-muted-foreground">We need your basic details to connect you with the right professional.</p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="flex items-center gap-2 mb-1.5">
                  <User className="w-4 h-4 text-accent" />
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={details.fullName}
                  onChange={(e) => setDetails({ ...details, fullName: e.target.value })}
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2 mb-1.5">
                  <Phone className="w-4 h-4 text-accent" />
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <div className="flex">
                  <span className="flex items-center px-3 bg-secondary rounded-l-md border border-r-0 border-input text-sm text-muted-foreground">+91</span>
                  <Input
                    id="phone"
                    placeholder="9876543210"
                    maxLength={10}
                    value={details.phone}
                    onChange={(e) => setDetails({ ...details, phone: e.target.value.replace(/\D/g, "") })}
                    className={`rounded-l-none ${errors.phone ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-2 mb-1.5">
                  <Mail className="w-4 h-4 text-accent" />
                  Email ID <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={details.email}
                  onChange={(e) => setDetails({ ...details, email: e.target.value })}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>
            </div>

            <Button onClick={handleNext} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6 rounded-xl font-semibold">
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <h2 className="text-xl font-bold text-foreground">Service Preferences</h2>
            <p className="text-sm text-muted-foreground">Choose when you'd like the service and how many workers you need.</p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="prefDate" className="flex items-center gap-2 mb-1.5">
                  <Calendar className="w-4 h-4 text-accent" />
                  Preferred Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="prefDate"
                  type="date"
                  min={today}
                  value={details.preferredDate}
                  onChange={(e) => setDetails({ ...details, preferredDate: e.target.value })}
                  className={errors.preferredDate ? "border-destructive" : ""}
                />
                {errors.preferredDate && <p className="text-xs text-destructive mt-1">{errors.preferredDate}</p>}
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1.5">
                  <Clock className="w-4 h-4 text-accent" />
                  Preferred Time <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setDetails({ ...details, preferredTime: slot })}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        details.preferredTime === slot
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-card border-border text-foreground hover:border-accent/50"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {errors.preferredTime && <p className="text-xs text-destructive mt-1">{errors.preferredTime}</p>}

                <div className="mt-3">
                  <Label htmlFor="customTime" className="text-xs text-muted-foreground mb-1.5 block">
                    Or enter your exact preferred time:
                  </Label>
                  <Input
                    id="customTime"
                    type="time"
                    value={details.customTime}
                    onChange={(e) => setDetails({ ...details, customTime: e.target.value, preferredTime: "" })}
                    className="max-w-[200px]"
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1.5">
                  <Users className="w-4 h-4 text-accent" />
                  Number of Workers Required
                </Label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDetails({ ...details, workersNeeded: Math.max(1, details.workersNeeded - 1) })}
                    className="w-10 h-10 rounded-lg bg-secondary text-foreground font-bold text-lg flex items-center justify-center hover:bg-accent/10 transition-colors"
                  >
                    −
                  </button>
                  <span className="text-xl font-bold text-foreground w-10 text-center">{details.workersNeeded}</span>
                  <button
                    onClick={() => setDetails({ ...details, workersNeeded: Math.min(10, details.workersNeeded + 1) })}
                    className="w-10 h-10 rounded-lg bg-secondary text-foreground font-bold text-lg flex items-center justify-center hover:bg-accent/10 transition-colors"
                  >
                    +
                  </button>
                </div>
                {errors.workersNeeded && <p className="text-xs text-destructive mt-1">{errors.workersNeeded}</p>}
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1.5">
                  <Sun className="w-4 h-4 text-accent" />
                  Which shift do you need?
                </Label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDetails({ ...details, shiftPreference: "day" })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                      details.shiftPreference === "day"
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-card border-border text-foreground hover:border-accent/50"
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    Day Shift
                  </button>
                  <button
                    onClick={() => setDetails({ ...details, shiftPreference: "night" })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                      details.shiftPreference === "night"
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-card border-border text-foreground hover:border-accent/50"
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    Night Shift
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setStep(1); setErrors({}); }} className="flex-1 py-6 rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 py-6 rounded-xl font-semibold">
                Now Choose the Professionals
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingFlow;
