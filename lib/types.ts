export type Language = "rw" | "en";

export type UserType = "farmer" | "buyer" | "business";

export type ListingCategory =
  | "cattle"
  | "goats"
  | "sheep"
  | "pigs"
  | "chickens"
  | "rabbits"
  | "fish"
  | "milk"
  | "eggs"
  | "honey"
  | "other";

export type ListingStatus = "active" | "sold" | "expired";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  district: string;
  userType: UserType;
  phoneVerified: boolean;
  createdAt: string;
  profileImage?: string;
  bio?: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerEmail?: string;
  sellerPhone: string;
  sellerPhoneVerified: boolean;
  sellerDistrict: string;
  category: ListingCategory;
  title: string;
  price: number;
  priceUnit?: string; // e.g. "per litre", "per tray", "each"
  quantity?: number;
  district: string;
  sector?: string;
  images: string[];
  status: ListingStatus;
  views: number;
  postedAt: string;
  boostedAt?: string;
  boostExpiresAt?: string;
  // Animal-specific
  breed?: string;
  sex?: "male" | "female";
  age?: string;
  weight?: string;
  milkProduction?: string;
  vaccinationStatus?: string;
  purpose?: string;
  // Chicken-specific
  chickenType?: "local" | "broiler" | "layer" | "chicks";
  // Milk-specific
  litresAvailable?: number;
  milkAvailability?: "daily" | "one-time";
  // Eggs-specific
  traysAvailable?: number;
  // General
  description?: string;
}

export interface WantedRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerDistrict: string;
  category: ListingCategory;
  title: string;
  quantity?: string;
  budget?: string;
  neededBy?: string;
  description?: string;
  postedAt: string;
  status: "open" | "closed";
}
