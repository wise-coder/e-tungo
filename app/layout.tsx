import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SplashScreen from "@/components/SplashScreen";
import { getBootstrapData } from "@/lib/db";
import {
  DEFAULT_DESCRIPTION,
  INDEX_ROBOTS,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGE_PATH,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "e-tungo | Rwanda Livestock & Animal Products Marketplace",
    template: "%s | e-tungo",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "Rwanda livestock marketplace",
    "livestock for sale Rwanda",
    "amatungo",
    "cattle",
    "goats",
    "pigs",
    "chickens",
    "rabbits",
    "milk",
    "eggs",
    "honey",
    "animal products Rwanda",
  ],
  alternates: { canonical: "/" },
  verification: {
    google: "XDXR3Q6GDJ9O6sPWf9OYkQqdCN-E72g8H2qvinrHjUM",
  },
  robots: INDEX_ROBOTS,
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "e-tungo | Rwanda Livestock & Animal Products Marketplace",
    description: DEFAULT_DESCRIPTION,
    url: "/",
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
    title: "e-tungo | Rwanda Livestock & Animal Products Marketplace",
    description: DEFAULT_DESCRIPTION,
    images: [SOCIAL_IMAGE_PATH],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let listings: Awaited<ReturnType<typeof getBootstrapData>>["listings"] = [];
  let wantedRequests: Awaited<ReturnType<typeof getBootstrapData>>["wantedRequests"] = [];
  try {
    ({ listings, wantedRequests } = await getBootstrapData());
  } catch (error) {
    // Public pages, including signup, must still render during a transient DB outage.
    console.error("Marketplace bootstrap unavailable:", error);
  }

  return (
    <html lang="rw">
      <body>
        <AppProvider initialListings={listings.filter(listing => listing.status !== "hidden")} initialWantedRequests={wantedRequests}>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </div>
        </AppProvider>
        <SplashScreen />
      </body>
    </html>
  );
}
