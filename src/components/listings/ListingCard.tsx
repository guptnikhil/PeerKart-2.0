import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, type Listing } from "@/types";
import { ShieldCheck, Star } from "lucide-react";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link to={`/listing/${listing.id}`}>
      <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={listing.image_url}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute left-3 top-3">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs font-medium">
              {CATEGORY_LABELS[listing.category]}
            </Badge>
          </div>
          {listing.ai_score && listing.ai_score >= 85 && (
            <div className="absolute right-3 top-3">
              <Badge className="bg-pk-green text-accent-foreground gap-1 text-xs">
                <ShieldCheck className="h-3 w-3" /> Verified
              </Badge>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-display text-sm font-semibold text-card-foreground line-clamp-2 leading-snug">
            {listing.title}
          </h3>

          <div className="mt-2 flex items-center justify-between">
            <span className="font-display text-lg font-bold text-primary">
              ₹{listing.price.toLocaleString("en-IN")}
            </span>
            {listing.seller && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-pk-green text-pk-green" />
                <span>{listing.seller.trust_score}</span>
              </div>
            )}
          </div>

          {listing.seller && (
            <p className="mt-1 text-xs text-muted-foreground truncate">
              {listing.seller.college}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
