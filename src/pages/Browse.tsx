import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ListingCard } from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORY_LABELS, type ListingCategory } from "@/types";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

const categories: (ListingCategory | "all")[] = ["all", "textbooks", "electronics", "furniture", "clothing", "stationery", "sports", "other"];

const Browse = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | "all">("all");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    setErrorInfo(null);
    const { data, error } = await supabase
      .from("items")
      .select(`
        *,
        profiles (
          full_name,
          college_name
        )
      `); // Temporarily removed status filter to see if any items exist

    if (error) {
      console.error("Error fetching listings:", error);
      if (error.code === '42P01') {
        setErrorInfo("DATABASE_MISSING_TABLES");
      } else {
        setErrorInfo(error.message);
      }
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  const filtered = listings.filter((l: any) => {
    const title = l.title || "";
    const description = l.description || "";
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || l.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Browse Listings</h1>
          <p className="mt-2 text-muted-foreground">Loading listings...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Browse Listings</h1>
          <p className="mt-2 text-muted-foreground">Find what you need from verified students.</p>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === "all" ? "All" : CATEGORY_LABELS[cat]}
            </Button>
          ))}
        </div>

        {/* Results */}
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
        ) : filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No listings found. Try a different search.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Browse;
