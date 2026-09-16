import type { Metadata } from "next";
import type { Listing, ListingCategory } from "@/lib/types";

const FALLBACK_SITE_URL = "https://e-tungo.vercel.app";

function normalizeSiteUrl(value?: string) {
  try {
    const url = new URL(value || FALLBACK_SITE_URL);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return FALLBACK_SITE_URL;
    }
    return url.origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const SITE_NAME = "e-tungo";
export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
export const DEFAULT_DESCRIPTION =
  "Buy and sell livestock and animal products across Rwanda. Discover cattle, goats, pigs, chickens, rabbits, milk, eggs, honey and more on e-tungo.";
export const SOCIAL_IMAGE_PATH = "/opengraph-image";

export const INDEX_ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export const NO_INDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  noarchive: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
};

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}

function socialTitle(title: string) {
  return title.toLowerCase().includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const fullTitle = socialTitle(title);

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: INDEX_ROBOTS,
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_RW",
      type: "website",
      images: [
        {
          url: SOCIAL_IMAGE_PATH,
          width: 1200,
          height: 630,
          alt: "e-tungo - Rwanda livestock and animal-products marketplace",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [SOCIAL_IMAGE_PATH],
    },
  };
}

export function createPrivateMetadata(title: string, path: string): Metadata {
  return {
    title,
    alternates: { canonical: path },
    robots: NO_INDEX_ROBOTS,
  };
}

function listingLocation(listing: Pick<Listing, "district">) {
  return listing.district.trim().toLowerCase() === "rwanda"
    ? "Rwanda"
    : `${listing.district.trim()}, Rwanda`;
}

export function listingImageAlt(
  listing: Pick<Listing, "title" | "district">,
  imageNumber?: number
) {
  const suffix = imageNumber ? ` - photo ${imageNumber}` : "";
  return `${listing.title} for sale in ${listingLocation(listing)}${suffix}`;
}

export function listingSeoTitle(listing: Pick<Listing, "title" | "district">) {
  const location = listing.district.trim() || "Rwanda";
  return /\bfor sale\b/i.test(listing.title)
    ? `${listing.title} in ${location}`
    : `${listing.title} for Sale in ${location}`;
}

export function listingSeoDescription(
  listing: Pick<Listing, "title" | "district" | "price" | "description" | "breed" | "status">
) {
  const price = new Intl.NumberFormat("en-RW").format(listing.price);
  const availability = listing.status === "sold" ? "This listing is sold." : "Available on e-tungo.";
  const details = listing.description?.trim() || (listing.breed ? `${listing.breed} listing.` : "");
  const description = `${listing.title} in ${listingLocation(listing)} for RWF ${price}. ${availability} ${details}`
    .replace(/\s+/g, " ")
    .trim();

  return description.length > 160 ? `${description.slice(0, 157).trimEnd()}...` : description;
}

export const SEO_CATEGORIES = {
  cattle: {
    name: "Cattle",
    description: "Browse cattle for sale across Rwanda, including cows, bulls and calves from livestock sellers on e-tungo.",
  },
  goats: {
    name: "Goats",
    description: "Find goats for sale across Rwanda from farmers and livestock sellers on e-tungo.",
  },
  pigs: {
    name: "Pigs",
    description: "Browse pigs and piglets for sale across Rwanda on the e-tungo livestock marketplace.",
  },
  chickens: {
    name: "Chickens",
    description: "Find local chickens, broilers and layers for sale across Rwanda on e-tungo.",
  },
  rabbits: {
    name: "Rabbits",
    description: "Browse rabbits for sale from farmers and livestock sellers across Rwanda on e-tungo.",
  },
  milk: {
    name: "Milk",
    description: "Find fresh milk listings and dairy suppliers across Rwanda on e-tungo.",
  },
  eggs: {
    name: "Eggs",
    description: "Browse fresh egg listings from poultry farmers and suppliers across Rwanda on e-tungo.",
  },
  honey: {
    name: "Honey",
    description: "Find Rwandan honey from beekeepers and trusted sellers across Rwanda on e-tungo.",
  },
} satisfies Partial<Record<ListingCategory, { name: string; description: string }>>;

export type SeoCategory = keyof typeof SEO_CATEGORIES;

export function isSeoCategory(value: string): value is SeoCategory {
  return Object.prototype.hasOwnProperty.call(SEO_CATEGORIES, value);
}
