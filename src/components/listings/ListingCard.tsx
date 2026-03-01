import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, type Listing } from "@/types";
import { ShieldCheck, Star, Clock } from "lucide-react";
import { getProxyUrl } from "@/lib/utils";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: { listing: any }) {
  const seller = listing.profiles;
  const displayImage = (listing.image_urls && listing.image_urls.length > 0) 
    ? listing.image_urls[0] 
    : listing.image_url;

  const getAgeLabel = (age: string) => {
    const options: Record<string, string> = {
      "new": "New",
      "<6m": "<6m",
      "6-12m": "6-12m",
      "1-2y": "1-2y",
      "2y+": "2y+"
    };
    return options[age] || age;
  };
  
  return (
    <Link to={`/listing/${listing.id}`}>
      <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={getProxyUrl(displayImage)}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs font-medium w-fit">
              {CATEGORY_LABELS[listing.category as keyof typeof CATEGORY_LABELS]}
            </Badge>
            {listing.age && (
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-[10px] font-medium w-fit border-none shadow-sm flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" /> {getAgeLabel(listing.age)}
              </Badge>
            )}
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
            {seller?.is_verified && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-pk-green text-pk-green" />
                <span>Verified Seller</span>
              </div>
            )}
          </div>

          {seller?.college_name && (
            <p className="mt-1 text-xs text-muted-foreground truncate">
              {seller.college_name}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
