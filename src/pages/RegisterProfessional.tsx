import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User, Briefcase, FileText, MapPin, Camera,
  ArrowRight, ArrowLeft, Check, ChevronRight,
  LocateFixed, Loader2, CreditCard, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const steps = [
  { label: "Basic Info", icon: User },
  { label: "Category", icon: Briefcase },
  { label: "Experience", icon: FileText },
  { label: "Location", icon: MapPin },
  { label: "Verification", icon: CreditCard },
  { label: "Photo", icon: Camera },
];

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  categoryId: string;
  headline: string;
  experience: string;
  description: string;
  hourlyRate: string;
  city: string;
  area: string;
  coverageRadius: string;
  photoFile: File | null;
  photoPreview: string | null;
  aadhaarNumber: string;
  aadhaarFrontFile: File | null;
  aadhaarFrontPreview: string | null;
  aadhaarBackFile: File | null;
  aadhaarBackPreview: string | null;
}

const initialForm: FormData = {
  fullName: "", email: "", phone: "",
  categoryId: "", headline: "",
  experience: "", description: "", hourlyRate: "",
  city: "Vasai", area: "", coverageRadius: "5",
  photoFile: null, photoPreview: null,
  aadhaarNumber: "",
  aadhaarFrontFile: null, aadhaarFrontPreview: null,
  aadhaarBackFile: null, aadhaarBackPreview: null,
};

const LAST_STEP = steps.length - 1;

const RegisterProfessional = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [categories, setCategories] = useState<Tables<"categories">[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [showSuggestDialog, setShowSuggestDialog] = useState(false);
  const [suggestName, setSuggestName] = useState("");
  const [suggestDescription, setSuggestDescription] = useState("");
  const [suggestSubmitting, setSuggestSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, loading, isProfessional } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/auth?redirect=/register");
      return;
    }

    if (isProfessional) {
      navigate("/dashboard");
    }
  }, [user, loading, isProfessional, navigate]);

  useEffect(() => {
    supabase.from("categories").select("*").eq("is_active", true).order("name").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        email: user.email || "",
        fullName: user.user_metadata?.full_name || "",
      }));
    }
  }, [user]);

  // Auto-detect location on mount - defined inline to avoid hoisting issues
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await response.json();
          const address = data.address || {};
          const city = address.city || address.town || address.village || address.state_district || address.county || "";
          const area = address.suburb || address.neighbourhood || address.hamlet || address.road || "";
          setForm((prev) => ({ ...prev, city, area }));
        } catch {}
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  if (loading || !user || isProfessional) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{isProfessional ? "Redirecting to your dashboard..." : "Loading..."}</p>
      </div>
    );
  }

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", description: "Your browser doesn't support location detection.", variant: "destructive" });
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await response.json();
          const address = data.address || {};
          const city = address.city || address.town || address.village || address.state_district || address.county || "";
          const area = address.suburb || address.neighbourhood || address.hamlet || address.road || "";
          setForm((prev) => ({
            ...prev,
            city: city,
            area: area,
          }));
          toast({ title: "Location detected", description: `${area}, ${city}` });
        } catch {
          toast({ title: "Could not resolve location", variant: "destructive" });
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setDetectingLocation(false);
        toast({ title: "Location access denied", description: "Please enter your location manually.", variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const canNext = (): boolean => {
    switch (step) {
      case 0: return !!(form.fullName.trim() && form.email.trim() && form.phone.trim());
      case 1: return !!form.categoryId;
      case 2: return !!(form.experience && form.description.trim());
      case 3: return !!(form.city.trim() && form.area.trim());
      case 4: return true; // Aadhaar is optional
      case 5: return true;
      default: return false;
    }
  };

  const handleFileChange = (field: "photoFile" | "aadhaarFrontFile" | "aadhaarBackFile", previewField: "photoPreview" | "aadhaarFrontPreview" | "aadhaarBackPreview") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setForm((prev) => ({ ...prev, [field]: file }));
        const reader = new FileReader();
        reader.onloadend = () => setForm((prev) => ({ ...prev, [previewField]: reader.result as string }));
        reader.readAsDataURL(file);
      }
    };

  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Please sign in first", variant: "destructive" });
      navigate("/auth");
      return;
    }

    setSubmitting(true);
    try {
      let avatarUrl: string | null = null;
      let aadhaarFrontUrl: string | null = null;
      let aadhaarBackUrl: string | null = null;

      if (form.photoFile) {
        avatarUrl = await uploadFile(form.photoFile, "avatars", user.id);
      }
      if (form.aadhaarFrontFile) {
        aadhaarFrontUrl = await uploadFile(form.aadhaarFrontFile, "documents", user.id);
      }
      if (form.aadhaarBackFile) {
        aadhaarBackUrl = await uploadFile(form.aadhaarBackFile, "documents", user.id);
      }

      const { error } = await supabase.from("professionals").insert({
        user_id: user.id,
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        category_id: form.categoryId,
        headline: form.headline || null,
        experience_years: form.experience ? parseInt(form.experience) : null,
        description: form.description,
        hourly_rate: form.hourlyRate ? parseInt(form.hourlyRate) : null,
        city: form.city,
        area: form.area,
        coverage_radius_km: parseInt(form.coverageRadius),
        avatar_url: avatarUrl,
        aadhaar_number: form.aadhaarNumber || null,
        aadhaar_front_url: aadhaarFrontUrl,
        aadhaar_back_url: aadhaarBackUrl,
      } as any);

      if (error) throw error;

      toast({
        title: "Registration submitted!",
        description: "Your profile is pending admin approval. We'll notify you once it's live.",
      });
      setTimeout(() => navigate("/"), 2000);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  const goNext = () => { setDirection(1); setStep((s) => Math.min(s + 1, LAST_STEP)); };
  const goBack = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 0)); };

  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-[calc(5rem+var(--safe-area-top))] pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Join as a Professional
            </h1>
            <p className="text-muted-foreground">
              Create your profile and start getting discovered by customers nearby
            </p>
          </motion.div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-1 mb-10 overflow-x-auto pb-1">
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center">
                <button
                  onClick={() => { if (i < step) { setDirection(-1); setStep(i); } }}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    i === step
                      ? "bg-accent text-accent-foreground"
                      : i < step
                      ? "bg-emerald-light text-accent cursor-pointer"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground/40 mx-0.5" />}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-card rounded-2xl border border-border shadow-medium p-6 md:p-8 min-h-[360px] relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div key={step} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                {step === 0 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground mb-1">Basic Information</h2>
                      <p className="text-sm text-muted-foreground">Tell us about yourself</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input id="fullName" placeholder="e.g. Rajesh Sharma" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className="mt-1.5" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} className="mt-1.5" />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input id="phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="mt-1.5" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground mb-1">Service Category</h2>
                      <p className="text-sm text-muted-foreground">Choose the category that best fits your expertise</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => update("categoryId", cat.id)}
                          className={`p-4 rounded-xl text-sm font-medium text-left border transition-all ${
                            form.categoryId === cat.id
                              ? "border-accent bg-emerald-light text-accent ring-1 ring-accent/30"
                              : "border-border bg-secondary/50 text-foreground hover:border-accent/30"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                      {/* Suggest category button */}
                      <button
                        onClick={() => setShowSuggestDialog(true)}
                        className="p-4 rounded-xl text-sm font-medium text-left border border-dashed border-accent/40 bg-accent/5 text-accent hover:bg-accent/10 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Suggest a Category
                      </button>
                    </div>
                    {selectedCategory?.description && (
                      <div className="bg-secondary/50 rounded-xl border border-border p-4 mt-2">
                        <h3 className="font-display font-semibold text-sm text-foreground mb-2">
                          About {selectedCategory.name}
                        </h3>
                        <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                          {selectedCategory.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground mb-1">Experience & Skills</h2>
                      <p className="text-sm text-muted-foreground">Help customers understand your expertise</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="headline">Professional Headline</Label>
                        <Input id="headline" placeholder="e.g. Expert Plumber · 12 Years" value={form.headline} onChange={(e) => update("headline", e.target.value)} className="mt-1.5" />
                      </div>
                      <div>
                        <Label htmlFor="experience">Years of Experience *</Label>
                        <select id="experience" value={form.experience} onChange={(e) => update("experience", e.target.value)} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
                        <Textarea id="description" placeholder="Describe your services, skills, and what makes you stand out..." value={form.description} onChange={(e) => update("description", e.target.value)} className="mt-1.5 min-h-[100px]" />
                      </div>
                      <div>
                        <Label htmlFor="hourlyRate">Per Day Rate (₹)</Label>
                        <Input id="hourlyRate" type="text" placeholder="e.g. 2000" value={form.hourlyRate} onChange={(e) => update("hourlyRate", e.target.value)} className="mt-1.5" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-display text-xl font-bold text-foreground mb-1">Location & Coverage</h2>
                        <p className="text-sm text-muted-foreground">Where do you provide your services?</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5 shrink-0"
                        onClick={detectCurrentLocation}
                        disabled={detectingLocation}
                      >
                        {detectingLocation ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <LocateFixed className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">{detectingLocation ? "Detecting..." : "Use My Location"}</span>
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input id="city" placeholder="e.g. Vasai" value={form.city} onChange={(e) => update("city", e.target.value)} className="mt-1.5" />
                      </div>
                      <div>
                        <Label htmlFor="area">Area / Locality *</Label>
                        <Input id="area" placeholder="e.g. Vasai West" value={form.area} onChange={(e) => update("area", e.target.value)} className="mt-1.5" />
                      </div>
                      <div>
                        <Label htmlFor="radius">Service Coverage Radius (km)</Label>
                        <div className="flex items-center gap-4 mt-1.5">
                          <input type="range" min="1" max="50" value={form.coverageRadius} onChange={(e) => update("coverageRadius", e.target.value)} className="flex-1 accent-emerald" />
                          <span className="text-sm font-semibold text-foreground w-14 text-right">{form.coverageRadius} km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground mb-1">Identity Verification</h2>
                      <p className="text-sm text-muted-foreground">Upload your Aadhaar card for admin verification (optional but recommended)</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="aadhaarNumber">Aadhaar Card Number</Label>
                        <Input
                          id="aadhaarNumber"
                          placeholder="e.g. 1234 5678 9012"
                          value={form.aadhaarNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9\s]/g, "").slice(0, 14);
                            update("aadhaarNumber", val);
                          }}
                          className="mt-1.5"
                          maxLength={14}
                        />
                        <p className="text-xs text-muted-foreground mt-1">12-digit Aadhaar number</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Aadhaar Front Photo</Label>
                          <div className="mt-1.5">
                            {form.aadhaarFrontPreview ? (
                              <img src={form.aadhaarFrontPreview} alt="Aadhaar front" className="w-full h-32 rounded-xl object-cover border border-border" />
                            ) : (
                              <div className="w-full h-32 rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center">
                                <CreditCard className="w-8 h-8 text-muted-foreground/40" />
                              </div>
                            )}
                            <label className="cursor-pointer mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-muted transition-colors border border-border w-full justify-center">
                              <Camera className="w-3.5 h-3.5" />
                              {form.aadhaarFrontPreview ? "Change" : "Upload Front"}
                              <input type="file" accept="image/*" onChange={handleFileChange("aadhaarFrontFile", "aadhaarFrontPreview")} className="hidden" />
                            </label>
                          </div>
                        </div>

                        <div>
                          <Label>Aadhaar Back Photo</Label>
                          <div className="mt-1.5">
                            {form.aadhaarBackPreview ? (
                              <img src={form.aadhaarBackPreview} alt="Aadhaar back" className="w-full h-32 rounded-xl object-cover border border-border" />
                            ) : (
                              <div className="w-full h-32 rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center">
                                <CreditCard className="w-8 h-8 text-muted-foreground/40" />
                              </div>
                            )}
                            <label className="cursor-pointer mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-muted transition-colors border border-border w-full justify-center">
                              <Camera className="w-3.5 h-3.5" />
                              {form.aadhaarBackPreview ? "Change" : "Upload Back"}
                              <input type="file" accept="image/*" onChange={handleFileChange("aadhaarBackFile", "aadhaarBackPreview")} className="hidden" />
                            </label>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Your Aadhaar details will only be visible to admins for verification purposes.</p>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground mb-1">Profile Photo</h2>
                      <p className="text-sm text-muted-foreground">A great photo builds trust with customers</p>
                    </div>
                    <div className="flex flex-col items-center gap-6 py-4">
                      {form.photoPreview ? (
                        <img src={form.photoPreview} alt="Profile preview" className="w-32 h-32 rounded-2xl object-cover ring-4 ring-border" />
                      ) : (
                        <div className="w-32 h-32 rounded-2xl bg-secondary border-2 border-dashed border-border flex items-center justify-center">
                          <Camera className="w-10 h-10 text-muted-foreground/40" />
                        </div>
                      )}
                      <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-medium hover:bg-muted transition-colors border border-border">
                        <Camera className="w-4 h-4" />
                        {form.photoPreview ? "Change Photo" : "Upload Photo"}
                        <input type="file" accept="image/*" onChange={handleFileChange("photoFile", "photoPreview")} className="hidden" />
                      </label>
                      <p className="text-xs text-muted-foreground">JPG, PNG. Max 5MB. You can skip and add later.</p>
                    </div>

                    <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                      <h3 className="font-semibold text-sm text-foreground mb-3">Registration Summary</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Name</span>
                        <span className="text-foreground font-medium">{form.fullName || "—"}</span>
                        <span className="text-muted-foreground">Category</span>
                        <span className="text-foreground font-medium">{selectedCategory?.name || "—"}</span>
                        <span className="text-muted-foreground">Experience</span>
                        <span className="text-foreground font-medium">{form.experience ? `${form.experience} years` : "—"}</span>
                        <span className="text-muted-foreground">Location</span>
                        <span className="text-foreground font-medium">{form.area && form.city ? `${form.area}, ${form.city}` : "—"}</span>
                        <span className="text-muted-foreground">Aadhaar</span>
                        <span className="text-foreground font-medium">{form.aadhaarNumber ? "Provided" : "Not provided"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button variant="outline" onClick={goBack} disabled={step === 0} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <span className="text-sm text-muted-foreground">Step {step + 1} of {steps.length}</span>
            {step < LAST_STEP ? (
              <Button onClick={goNext} disabled={!canNext()} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Check className="w-4 h-4" /> {submitting ? "Submitting..." : "Submit"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Suggest Category Dialog */}
      <Dialog open={showSuggestDialog} onOpenChange={setShowSuggestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Suggest a New Category</DialogTitle>
            <DialogDescription>
              Can't find your service category? Suggest one and our team will review it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="suggestName">Category Name *</Label>
              <Input
                id="suggestName"
                placeholder="e.g. Solar Panel Installation"
                value={suggestName}
                onChange={(e) => setSuggestName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="suggestDesc">Description (optional)</Label>
              <Textarea
                id="suggestDesc"
                placeholder="Briefly describe the services this category would include..."
                value={suggestDescription}
                onChange={(e) => setSuggestDescription(e.target.value)}
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuggestDialog(false)}>Cancel</Button>
            <Button
              disabled={!suggestName.trim() || suggestSubmitting}
              onClick={async () => {
                if (!user) return;
                setSuggestSubmitting(true);
                try {
                  const { error } = await supabase.from("category_suggestions" as any).insert({
                    user_id: user.id,
                    name: suggestName.trim(),
                    description: suggestDescription.trim() || null,
                  } as any);
                  if (error) throw error;
                  toast({
                    title: "Suggestion submitted!",
                    description: "Our team will review your category suggestion and add it if approved.",
                  });
                  setSuggestName("");
                  setSuggestDescription("");
                  setShowSuggestDialog(false);
                } catch (err: any) {
                  toast({ title: "Error", description: err.message, variant: "destructive" });
                } finally {
                  setSuggestSubmitting(false);
                }
              }}
            >
              {suggestSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Suggestion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegisterProfessional;
