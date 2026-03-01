import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ListingCard } from "@/components/listings/ListingCard";
import { Badge } from "@/components/ui/badge";
import { Package, CreditCard, Star, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [userListings, setUserListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserListings();
    }
  }, [user]);

  const fetchUserListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user listings:", error);
    } else {
      setUserListings(data || []);
    }
    setLoading(false);
  };

  const stats = [
    { icon: Package, label: "Active Listings", value: userListings.length.toString() },
    { icon: CreditCard, label: "Credits", value: "50" }, // Demo value
    { icon: Star, label: "Trust Score", value: "92" }, // Demo value
    { icon: TrendingUp, label: "Total Views", value: "0" }, // Demo value
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Manage your listings and account.</p>
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
