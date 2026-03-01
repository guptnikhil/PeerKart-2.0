import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ListingCard } from "@/components/listings/ListingCard";
import { Badge } from "@/components/ui/badge";
import { Package, CreditCard, Star, TrendingUp, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { getProxyUrl } from "@/lib/utils";

const Dashboard = () => {
  const { user } = useAuth();
  const [userListings, setUserListings] = useState([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    setLoading(true);
    
    // Fetch listings
    const { data: listingsData, error: listingsError } = await supabase
      .from("items")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (listingsError) {
      console.error("Error fetching user listings:", listingsError);
    } else {
      setUserListings(listingsData || []);
    }

    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    } else {
      setProfile(profileData);
    }

    setLoading(false);
  };

  const stats = [
    { icon: Package, label: "Active Listings", value: userListings.length.toString() },
    { icon: Star, label: "Approved Items", value: userListings.filter((l: any) => l.status === 'approved').length.toString() },
    { icon: CreditCard, label: "Pending Items", value: userListings.filter((l: any) => l.status === 'pending' || !l.status).length.toString() },
    { icon: TrendingUp, label: "Account Age", value: profile?.created_at ? Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)) + "d" : "0d" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-20 w-20 flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={getProxyUrl(profile.avatar_url)} alt="Avatar" className="h-full w-full rounded-full object-cover shadow-md" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-primary font-display text-2xl font-bold text-primary-foreground shadow-md">
                {profile?.full_name ? profile.full_name[0].toUpperCase() : user?.email?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl font-bold text-foreground">{profile?.full_name || "Dashboard"}</h1>
              <Badge className="bg-pk-green text-accent-foreground gap-1">
                <ShieldCheck className="h-3 w-3" /> Verified
              </Badge>
            </div>
            <p className="mt-1 text-muted-foreground">{profile?.college_name || "Manage your listings and account."}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-pk-blue-pale p-2">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-2xl font-bold text-card-foreground">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* User listings */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">Your Listings</h2>
            <Badge variant="secondary">{userListings.length} items</Badge>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {userListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
