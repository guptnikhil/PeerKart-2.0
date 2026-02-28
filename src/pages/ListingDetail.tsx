import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { sampleListings } from "@/data/sampleListings";
import { WhatsAppButton } from "@/components/listings/WhatsAppButton";
import { TrustBadge } from "@/components/listings/TrustBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/types";
import { ArrowLeft, Calendar, MapPin, ShieldCheck } from "lucide-react";

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const listing = sampleListings.find((l) => l.id === id);

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
              src={listing.image_url}
              alt={listing.title}
              className="h-full max-h-[500px] w-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{CATEGORY_LABELS[listing.category]}</Badge>
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
              {listing.seller && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {listing.seller.college}
                </div>
              )}
            </div>

            {/* Seller info */}
            {listing.seller && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-semibold text-card-foreground">{listing.seller.name}</p>
                    <p className="text-xs text-muted-foreground">{listing.seller.college}</p>
                  </div>
                  <TrustBadge seller={listing.seller} />
                </div>
                <WhatsAppButton
                  phoneNumber={listing.seller.whatsapp_number}
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
