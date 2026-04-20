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

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { ListingSkeleton } from "@/components/listings/ListingSkeleton";

const Browse = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | "all">("all");

  const { data: listings = [], isLoading, error: queryError } = useQuery({
    queryKey: ["listings", selectedCategory, debouncedSearch],
    queryFn: async () => {
      let query = supabase
        .from("items")
        .select(`
          *,
          profiles (
            full_name,
            college_name
          )
        `);

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      if (debouncedSearch) {
        query = query.ilike("title", `%${debouncedSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const errorInfo = queryError ? (queryError as any).message : null;
  const isTableMissing = queryError && (queryError as any).code === '42P01';

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
        {isTableMissing ? (
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
        ) : isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ListingSkeleton key={i} />
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
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
