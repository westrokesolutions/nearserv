import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User, Briefcase, FileText, MapPin, Camera,
  ArrowRight, ArrowLeft, Check, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import { toast } from "@/hooks/use-toast";

const categories = [
  "Plumbing", "Electrical", "Web Development", "Graphic Design",
  "Tutors", "Photography", "Fitness Trainers", "Carpentry",
  "Event Services", "Legal & Financial",
];

const steps = [
  { label: "Basic Info", icon: User },
  { label: "Category", icon: Briefcase },
  { label: "Experience", icon: FileText },
  { label: "Location", icon: MapPin },
  { label: "Photo", icon: Camera },
];

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  category: string;
  headline: string;
  experience: string;
  description: string;
  hourlyRate: string;
  city: string;
  area: string;
  coverageRadius: string;
  photoPreview: string | null;
}

const initialForm: FormData = {
  fullName: "", email: "", phone: "",
  category: "", headline: "",
  experience: "", description: "", hourlyRate: "",
  city: "Vasai", area: "", coverageRadius: "5",
  photoPreview: null,
};

const RegisterProfessional = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const navigate = useNavigate();

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canNext = (): boolean => {
    switch (step) {
      case 0: return !!(form.fullName.trim() && form.email.trim() && form.phone.trim());
      case 1: return !!form.category;
      case 2: return !!(form.experience && form.description.trim());
      case 3: return !!(form.city.trim() && form.area.trim());
      case 4: return true;
      default: return false;
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => update("photoPreview", reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Registration submitted!",
      description: "Your profile is pending admin approval. We'll notify you once it's live.",
    });
    setTimeout(() => navigate("/"), 2000);
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);
  const goNext = () => { setDirection(1); setStep((s) => Math.min(s + 1, 4)); };
  const goBack = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 0)); };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Join as a Professional
            </h1>
            <p className="text-muted-foreground">
              Create your profile and start getting discovered by customers nearby
            </p>
          </motion.div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-1 mb-10">
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center">
                <button
                  onClick={() => { if (i < step) { setDirection(-1); setStep(i); } }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    i === step
                      ? "bg-accent text-accent-foreground"
                      : i < step
                      ? "bg-emerald-light text-accent cursor-pointer"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i < step ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <s.icon className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 mx-1" />
                )}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-card rounded-2xl border border-border shadow-medium p-6 md:p-8 min-h-[360px] relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
              >
                {/* Step 0: Basic Info */}
                {step === 0 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground mb-1">Basic Information</h2>
                      <p className="text-sm text-muted-foreground">Tell us about yourself</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          placeholder="e.g. Rajesh Sharma"
                          value={form.fullName}
                          onChange={(e) => update("fullName", e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 1: Category */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground mb-1">Service Category</h2>
                      <p className="text-sm text-muted-foreground">Choose the category that best fits your expertise</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => update("category", cat)}
                          className={`p-4 rounded-xl text-sm font-medium text-left border transition-all ${
                            form.category === cat
                              ? "border-accent bg-emerald-light text-accent ring-1 ring-accent/30"
                              : "border-border bg-secondary/50 text-foreground hover:border-accent/30"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Experience */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground mb-1">Experience & Skills</h2>
                      <p className="text-sm text-muted-foreground">Help customers understand your expertise</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="headline">Professional Headline</Label>
                        <Input
                          id="headline"
                          placeholder="e.g. Expert Plumber · 12 Years"
                          value={form.headline}
                          onChange={(e) => update("headline", e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="experience">Years of Experience *</Label>
                        <select
                          id="experience"
                          value={form.experience}
                          onChange={(e) => update("experience", e.target.value)}
                          className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Select experience</option>
                          <option value="1">Less than 1 year</option>
                          <option value="2">1–3 years</option>
                          <option value="5">3–5 years</option>
                          <option value="8">5–10 years</option>
                          <option value="12">10+ years</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your services, skills, and what makes you stand out..."
                          value={form.description}
                          onChange={(e) => update("description", e.target.value)}
                          className="mt-1.5 min-h-[100px]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                        <Input
                          id="hourlyRate"
                          type="text"
                          placeholder="e.g. 500"
                          value={form.hourlyRate}
                          onChange={(e) => update("hourlyRate", e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Location */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground mb-1">Location & Coverage</h2>
                      <p className="text-sm text-muted-foreground">Where do you provide your services?</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          placeholder="e.g. Vasai"
                          value={form.city}
                          onChange={(e) => update("city", e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="area">Area / Locality *</Label>
                        <Input
                          id="area"
                          placeholder="e.g. Vasai West"
                          value={form.area}
                          onChange={(e) => update("area", e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="radius">Service Coverage Radius (km)</Label>
                        <div className="flex items-center gap-4 mt-1.5">
                          <input
                            type="range"
                            min="1"
                            max="50"
                            value={form.coverageRadius}
                            onChange={(e) => update("coverageRadius", e.target.value)}
                            className="flex-1 accent-emerald"
                          />
                          <span className="text-sm font-semibold text-foreground w-14 text-right">
                            {form.coverageRadius} km
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Photo */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground mb-1">Profile Photo</h2>
                      <p className="text-sm text-muted-foreground">A great photo builds trust with customers</p>
                    </div>
                    <div className="flex flex-col items-center gap-6 py-4">
                      {form.photoPreview ? (
                        <img
                          src={form.photoPreview}
                          alt="Profile preview"
                          className="w-32 h-32 rounded-2xl object-cover ring-4 ring-border"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-2xl bg-secondary border-2 border-dashed border-border flex items-center justify-center">
                          <Camera className="w-10 h-10 text-muted-foreground/40" />
                        </div>
                      )}
                      <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-medium hover:bg-muted transition-colors border border-border">
                        <Camera className="w-4 h-4" />
                        {form.photoPreview ? "Change Photo" : "Upload Photo"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-muted-foreground">JPG, PNG. Max 5MB. You can skip and add later.</p>
                    </div>

                    {/* Summary */}
                    <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                      <h3 className="font-semibold text-sm text-foreground mb-3">Registration Summary</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Name</span>
                        <span className="text-foreground font-medium">{form.fullName || "—"}</span>
                        <span className="text-muted-foreground">Category</span>
                        <span className="text-foreground font-medium">{form.category || "—"}</span>
                        <span className="text-muted-foreground">Experience</span>
                        <span className="text-foreground font-medium">{form.experience ? `${form.experience} years` : "—"}</span>
                        <span className="text-muted-foreground">Location</span>
                        <span className="text-foreground font-medium">{form.area && form.city ? `${form.area}, ${form.city}` : "—"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={goBack}
              disabled={step === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <span className="text-sm text-muted-foreground">
              Step {step + 1} of {steps.length}
            </span>

            {step < 4 ? (
              <Button
                onClick={goNext}
                disabled={!canNext()}
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Check className="w-4 h-4" />
                Submit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterProfessional;
