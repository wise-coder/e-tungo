import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import SplashScreen from "@/components/SplashScreen";
import { getBootstrapData } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "e-tungo | Trusted livestock marketplace in Rwanda",
  description:
    "e-tungo helps buyers and sellers connect over trusted livestock and farm products across Rwanda.",
  keywords: ["livestock", "Rwanda", "cattle", "goats", "amatungo", "marketplace"],
  openGraph: {
    title: "e-tungo",
    description: "Trusted livestock and farm product marketplace in Rwanda.",
    type: "website",
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
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <Footer />
          </div>
          <MobileBottomNav />
        </AppProvider>
        <SplashScreen />
      </body>
    </html>
  );
}
