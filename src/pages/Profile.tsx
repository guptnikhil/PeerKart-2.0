import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Star, GraduationCap, CreditCard, Camera } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { getProxyUrl } from "@/lib/utils";

interface ProfileData {
  full_name: string | null;
  college_name: string | null;
  whatsapp_number: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [collegeName, setCollegeName] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, college_name, whatsapp_number, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setWhatsappNumber(data.whatsapp_number || "");
        setCollegeName(data.college_name || "");
        if (data.avatar_url) {
          setAvatarPreviewUrl(data.avatar_url);
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarFile(file);
      setAvatarPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    const fileExtension = avatarFile.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError);
      toast({
        title: "Upload Failed",
        description: uploadError.message,
        variant: "destructive",
      });
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    let newAvatarUrl = profile?.avatar_url;

    if (avatarFile) {
      newAvatarUrl = await uploadAvatar();
      if (!newAvatarUrl) {
        setIsSaving(false);
        return;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName,
        whatsapp_number: whatsappNumber,
        college_name: collegeName,
        avatar_url: newAvatarUrl,
      });

    if (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      fetchProfile(); // Re-fetch to ensure latest data is displayed
    }
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-2xl px-4 py-8 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Profile</h1>
          <p className="mt-2 text-muted-foreground">Loading profile data...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-2xl px-4 py-8 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">Please log in to view your profile.</p>
        </div>
        <Footer />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Profile</h1>

        {/* Profile header */}
        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16">
              {avatarPreviewUrl ? (
                <img src={getProxyUrl(avatarPreviewUrl)} alt="Avatar" className="h-full w-full rounded-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary font-display text-2xl font-bold text-primary-foreground">
                  {profile?.full_name ? profile.full_name[0].toUpperCase() : user?.email?.[0]?.toUpperCase()}
                </div>
              )}
              <Button
                variant="outline"
                size="icon"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Change avatar</span>
              </Button>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
              />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-card-foreground">{profile?.full_name || "No Name"}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge className="bg-pk-green text-accent-foreground gap-1">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4" /> {profile?.college_name || "N/A"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4" /> 0 credits {/* Placeholder for dynamic credit system */}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-card-foreground mb-4">Edit Profile</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input id="whatsapp" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College</Label>
              <Input
                id="college"
                placeholder="Your College Name"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" size="lg" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
