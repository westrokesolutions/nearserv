import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Star, Shield, MapPin, Phone, Mail, Briefcase,
  Calendar, DollarSign, Camera, CreditCard, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import type { User as AuthUser } from "@supabase/supabase-js";

type Professional = Tables<"professionals"> & { categories?: { name: string } | null };

interface ProfileTabProps {
  professional: Professional;
  currentStatus: { color: string; icon: typeof Shield; label: string };
  StatusIcon: typeof Shield;
  user: AuthUser;
  onPhotoUpdated: () => void;
}

const ProfileTab = ({ professional, currentStatus, StatusIcon, user, onPhotoUpdated }: ProfileTabProps) => {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error } = await supabase.from("professionals").update({
        avatar_url: urlData.publicUrl,
      }).eq("id", professional.id);
      if (error) throw error;

      toast({ title: "Profile photo updated!" });
      onPhotoUpdated();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const pro = professional as any;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Profile Photo Update */}
      <div className="bg-card rounded-xl border border-border p-5 md:p-6">
        <h3 className="font-display font-bold text-foreground mb-4">Profile Photo</h3>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-border">
            {professional.avatar_url ? (
              <img src={professional.avatar_url} alt={professional.full_name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors">
              {uploadingPhoto ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              {uploadingPhoto ? "Uploading..." : "Change Photo"}
              <input type="file" accept="image/*" onChange={handlePhotoUpdate} className="hidden" disabled={uploadingPhoto} />
            </label>
            <p className="text-xs text-muted-foreground mt-2">JPG, PNG. Max 5MB.</p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-card rounded-xl border border-border p-5 md:p-6">
        <h3 className="font-display font-bold text-foreground mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: User, label: "Full Name", value: professional.full_name },
            { icon: Mail, label: "Email", value: professional.email },
            { icon: Phone, label: "Phone", value: professional.phone },
            { icon: Briefcase, label: "Category", value: professional.categories?.name || "N/A" },
            { icon: MapPin, label: "Area", value: `${professional.area}, ${professional.city}` },
            { icon: Calendar, label: "Experience", value: professional.experience_years ? `${professional.experience_years} years` : "N/A" },
            { icon: DollarSign, label: "Per Day Rate", value: professional.hourly_rate ? `₹${professional.hourly_rate}` : "N/A" },
            { icon: MapPin, label: "Coverage", value: `${professional.coverage_radius_km || 5} km radius` },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
              <item.icon className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
        {professional.headline && (
          <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Headline</p>
            <p className="text-sm font-medium text-foreground">{professional.headline}</p>
          </div>
        )}
        {professional.description && (
          <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-sm text-foreground leading-relaxed">{professional.description}</p>
          </div>
        )}
      </div>

      {/* Aadhaar Verification Status */}
      <div className="bg-card rounded-xl border border-border p-5 md:p-6">
        <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-accent" /> Aadhaar Verification
        </h3>
        {pro.aadhaar_number || pro.aadhaar_front_url ? (
          <div className="space-y-3">
            {pro.aadhaar_number && (
              <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                <p className="text-xs text-muted-foreground">Aadhaar Number</p>
                <p className="text-sm font-medium text-foreground">
                  {"●●●● ●●●● " + (pro.aadhaar_number as string).replace(/\s/g, "").slice(-4)}
                </p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border font-medium ${
                professional.verification === "verified"
                  ? "bg-accent/10 text-accent border-accent/20"
                  : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
              }`}>
                <Shield className="w-3 h-3" />
                {professional.verification === "verified" ? "Verified by Admin" : "Pending Verification"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Your Aadhaar details are only visible to admins for verification.</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No Aadhaar card details submitted. You can add them during registration.</p>
        )}
      </div>

      {/* Verification & Status */}
      <div className="bg-card rounded-xl border border-border p-5 md:p-6">
        <h3 className="font-display font-bold text-foreground mb-2">Verification & Status</h3>
        <div className="flex gap-3 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border font-medium ${currentStatus.color}`}>
            <StatusIcon className="w-3 h-3" /> {currentStatus.label}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border font-medium ${
            professional.verification === "verified" ? "bg-accent/10 text-accent border-accent/20" : "bg-secondary text-muted-foreground border-border"
          }`}>
            <Shield className="w-3 h-3" /> {professional.verification === "verified" ? "Verified" : "Not Verified"}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border font-medium ${
            professional.is_premium ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" : "bg-secondary text-muted-foreground border-border"
          }`}>
            <Star className="w-3 h-3" /> {professional.is_premium ? "Premium" : "Standard"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Member since {new Date(professional.created_at).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );
};

export default ProfileTab;
