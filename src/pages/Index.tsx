import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/ListingCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Users, Zap, GraduationCap, ArrowRight } from "lucide-react";
import logo from "@/assets/peerkart-logo.png";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Students Only",
    description: "College email verification ensures a safe, trusted community.",
  },
  {
    icon: Zap,
    title: "AI-Validated Listings",
    description: "Every listing is scored by AI for quality and authenticity.",
  },
  {
    icon: Users,
    title: "Seller Trust Scores",
    description: "Transparent ratings help you buy with confidence.",
  },
  {
    icon: GraduationCap,
    title: "Campus-Based",
    description: "Filter by college to find deals right on your campus.",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [recentListings, setRecentListings] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentListings();
  }, []);

  const fetchRecentListings = async () => {
    setLoadingRecent(true);
    setErrorInfo(null);
    const { data, error } = await supabase
      .from("items")
      .select(`
        *,
        profiles (
          full_name,
          college_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
      console.error("Error fetching recent listings:", error);
      if (error.code === '42P01') {
        setErrorInfo("DATABASE_MISSING_TABLES");
      } else {
        setErrorInfo(error.message);
      }
    } else {
      console.log("Fetched items successfully:", data); // DEBUG LOG
      setRecentListings(data || []);
    }
    setLoadingRecent(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,hsl(221_83%_53%_/_0.3),transparent_70%)]" />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex animate-fade-in">
              <img src={logo} alt="PeerKart" className="h-20 w-20 rounded-2xl shadow-lg animate-float" />
            </div>
            <h1 className="animate-fade-in font-display text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
              Peer<span className="text-[#00d084]">Kart</span>
            </h1>
            <p className="mt-4 animate-fade-in font-display text-lg text-white/90 md:text-xl" style={{ animationDelay: "0.1s" }}>
              Built by Students. Trusted by Students.
            </p>
            <p className="mx-auto mt-3 max-w-lg animate-fade-in text-sm text-white/70 md:text-base" style={{ animationDelay: "0.2s" }}>
              The college-exclusive marketplace where students buy, sell, and save — 
              verified, safe, and right on your campus.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 animate-fade-in sm:flex-row sm:justify-center" style={{ animationDelay: "0.3s" }}>
              <Button asChild variant="hero" size="xl" className="bg-[#00d084] hover:bg-[#00b074] text-white border-none min-w-[200px]">
                <Link to="/browse">
                  Browse Listings <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 min-w-[200px]">
                <Link to="/sell">
                  Sell an Item
                </Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 0 960 40 720 30C480 20 240 50 0 20L0 60Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Why students love <span className="text-gradient">PeerKart</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              A marketplace designed specifically for the college experience.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="mb-4 inline-flex rounded-lg bg-pk-blue-pale p-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-base font-semibold text-card-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="border-t border-border bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                Fresh Listings
              </h2>
              <p className="mt-2 text-muted-foreground">Latest items from verified students.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/browse")}>
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          {errorInfo === "DATABASE_MISSING_TABLES" ? (
            <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-12 text-center mt-8">
              <h3 className="font-display text-xl font-bold text-destructive">Database Schema Missing!</h3>
              <p className="mt-2 text-muted-foreground">
                Please go to your Supabase Dashboard SQL Editor and run the SQL code provided by the assistant.
              </p>
            </div>
          ) : errorInfo ? (
            <div className="rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-12 text-center mt-8">
              <h3 className="font-display text-xl font-bold text-yellow-600">Connection Issue</h3>
              <p className="mt-2 text-muted-foreground">{errorInfo}</p>
            </div>
          ) : loadingRecent ? (
            <div className="py-20 text-center">
              <p className="text-lg text-muted-foreground animate-pulse">Loading recent listings...</p>
            </div>
          ) : recentListings.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-lg text-muted-foreground">No recent listings found.</p>
            </div>
          )}
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" onClick={() => navigate("/browse")}>View all listings</Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
