import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/ListingCard";
import { sampleListings } from "@/data/sampleListings";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Users, Zap, GraduationCap, ArrowRight } from "lucide-react";
import logo from "@/assets/peerkart-logo.png";

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
            <h1 className="animate-fade-in font-display text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl lg:text-7xl">
              Peer<span className="text-pk-green-light">Kart</span>
            </h1>
            <p className="mt-4 animate-fade-in font-display text-lg text-primary-foreground/80 md:text-xl" style={{ animationDelay: "0.1s" }}>
              Built by Students. Trusted by Students.
            </p>
            <p className="mx-auto mt-3 max-w-lg animate-fade-in text-sm text-primary-foreground/60 md:text-base" style={{ animationDelay: "0.2s" }}>
              The college-exclusive marketplace where students buy, sell, and save — 
              verified, safe, and right on your campus.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 animate-fade-in sm:flex-row sm:justify-center" style={{ animationDelay: "0.3s" }}>
              <Link to="/browse">
                <Button variant="hero" size="xl">
                  Browse Listings <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/sell">
                <Button variant="hero-outline" size="xl">
                  Sell an Item
                </Button>
              </Link>
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
            <Link to="/browse" className="hidden sm:block">
              <Button variant="outline" size="sm">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sampleListings.slice(0, 3).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link to="/browse">
              <Button variant="outline">View all listings</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="gradient-hero overflow-hidden rounded-2xl p-8 text-center md:p-16">
            <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              Ready to start selling?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-primary-foreground/70">
              Join thousands of students already saving money on campus.
            </p>
            <div className="mt-6">
              <Link to="/register">
                <Button variant="hero" size="xl">
                  Get Started Free <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
