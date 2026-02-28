import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Star, GraduationCap, CreditCard } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Profile</h1>

        {/* Profile header */}
        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary font-display text-2xl font-bold text-primary-foreground">
              R
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-card-foreground">Rahul Sharma</h2>
              <p className="text-sm text-muted-foreground">rahul@iitd.ac.in</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge className="bg-pk-green text-accent-foreground gap-1">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-pk-green text-pk-green" /> 92
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4" /> IIT Delhi
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4" /> 50 credits
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-card-foreground mb-4">Edit Profile</h3>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="Rahul Sharma" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input id="whatsapp" defaultValue="+919876543210" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College</Label>
              <Input id="college" defaultValue="IIT Delhi" disabled />
            </div>
            <Button type="button" size="lg">Save Changes</Button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
