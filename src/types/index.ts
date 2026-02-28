export interface User {
  id: string;
  email: string;
  college: string;
  whatsapp_number: string;
  trust_score: number;
  verified: boolean;
  credits: number;
  created_at: string;
  avatar_url?: string;
  name?: string;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category: ListingCategory;
  image_url: string;
  ai_score: number | null;
  status: ListingStatus;
  created_at: string;
  seller?: User;
}

export type ListingStatus = "active" | "sold" | "pending" | "flagged";

export type ListingCategory =
  | "textbooks"
  | "electronics"
  | "furniture"
  | "clothing"
  | "stationery"
  | "sports"
  | "other";

export const CATEGORY_LABELS: Record<ListingCategory, string> = {
  textbooks: "Textbooks",
  electronics: "Electronics",
  furniture: "Furniture",
  clothing: "Clothing",
  stationery: "Stationery",
  sports: "Sports",
  other: "Other",
};

export interface CreditLog {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  metadata: Record<string, unknown>;
  ip: string;
  created_at: string;
}
