import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/listings/WhatsAppButton";
import { TrustBadge } from "@/components/listings/TrustBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/types";
import { ArrowLeft, Calendar, MapPin, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProxyUrl } from "@/lib/utils";

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("items")
        .select(`
          *,
          profiles (
            full_name,
            college_name,
            whatsapp_number
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching listing:", error);
      } else {
        setListing(data);
      }
      setLoading(false);
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground animate-pulse">Fetching item details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Listing not found</h1>
          <Link to="/browse"><Button className="mt-4">Back to Browse</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const seller = listing.profiles;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Link to="/browse" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="overflow-hidden rounded-xl border border-border">
            <img
              src={getProxyUrl(listing.image_url)}
              alt={listing.title}
              className="h-full max-h-[500px] w-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{CATEGORY_LABELS[listing.category as keyof typeof CATEGORY_LABELS]}</Badge>
                {listing.ai_score && listing.ai_score >= 85 && (
                  <Badge className="bg-pk-green text-accent-foreground gap-1">
                    <ShieldCheck className="h-3 w-3" /> AI Verified ({listing.ai_score}%)
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                {listing.title}
              </h1>
              <p className="mt-3 font-display text-3xl font-bold text-primary">
                ₹{listing.price.toLocaleString("en-IN")}
              </p>
            </div>

            <p className="text-muted-foreground leading-relaxed">{listing.description}</p>

            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Listed {new Date(listing.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>

            {/* Seller info */}
            {seller && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-semibold text-card-foreground">{seller.full_name}</p>
                    <p className="text-xs text-muted-foreground">{seller.college_name}</p>
                  </div>
                  {/* TrustBadge component would need to be updated to handle real data */}
                </div>
                <WhatsAppButton
                  phoneNumber={seller.whatsapp_number}
                  itemTitle={listing.title}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ListingDetail;
