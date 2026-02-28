import { ShieldCheck, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/types";

interface TrustBadgeProps {
  seller: User;
}

export function TrustBadge({ seller }: TrustBadgeProps) {
  const level =
    seller.trust_score >= 90
      ? "Excellent"
      : seller.trust_score >= 75
        ? "Good"
        : "New";

  return (
    <div className="flex items-center gap-2">
      {seller.verified && (
        <Badge className="bg-pk-green text-accent-foreground gap-1">
          <ShieldCheck className="h-3 w-3" /> Verified
        </Badge>
      )}
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Star className="h-4 w-4 fill-pk-green text-pk-green" />
        <span className="font-medium text-foreground">{seller.trust_score}</span>
        <span>· {level}</span>
      </div>
    </div>
  );
}
