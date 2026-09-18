export interface ContactChannel {
  icon: string;
  label: string;
  value: string;
  href: string;
}

export interface CompanyPageData {
  route: string;
  sourceUrl: string;
  title: string;
  subtitle?: string;
  paragraphs: string[];
  listItems: string[];
  channels?: ContactChannel[];
  fetchedAt: string;
}

export type CompanyRoute = "/about" | "/safety" | "/terms" | "/privacy" | "/contact";

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://e-tungo.vercel.app";

function externalSourceUrl(route: CompanyRoute) {
  const configuredOrigin = process.env.COMPANY_CONTENT_SOURCE_URL?.trim();
  if (!configuredOrigin) return null;

  try {
    const sourceOrigin = new URL(configuredOrigin);
    const siteOrigin = new URL(SITE_ORIGIN);
    if (!/^https?:$/.test(sourceOrigin.protocol) || sourceOrigin.origin === siteOrigin.origin) {
      return null;
    }
    return new URL(route, `${sourceOrigin.origin}/`).toString();
  } catch {
    return null;
  }
}

const FALLBACK_DATA: Record<CompanyRoute, Omit<CompanyPageData, "fetchedAt">> = {
  "/about": {
    route: "/about",
    sourceUrl: "https://e-tungo.vercel.app/about",
    title: "About e-tungo",
    paragraphs: [
      "e-tungo is a simple digital marketplace focused on livestock and animal products in Rwanda. Our mission is to connect farmers, buyers, restaurants, butcheries, hotels, cooperatives and traders in a fast, easy and trustworthy way.",
      "Gura. Gurisha. Byoroshye. — Buy. Sell. Easily.",
      "e-tungo is built for everyone — from rural farmers with basic smartphones to businesses looking for reliable suppliers across Rwanda.",
    ],
    listItems: [],
  },
  "/safety": {
    route: "/safety",
    sourceUrl: "https://e-tungo.vercel.app/safety",
    title: "Safety Tips",
    paragraphs: [],
    listItems: [
      "Always meet the seller in a safe, public place when possible.",
      "Inspect the animal in person before making any payment.",
      "Prefer sellers with a verified badge or complete contact details.",
      "Never send money before seeing the animal or product.",
      "Report suspicious listings using the Report button on listing pages.",
    ],
  },
  "/terms": {
    route: "/terms",
    sourceUrl: "https://e-tungo.vercel.app/terms",
    title: "Terms of Use",
    paragraphs: [
      "By using e-tungo, you agree to use the platform responsibly and honestly.",
      "Sellers are responsible for the accuracy of their listings. Do not post animals or products you do not own or intend to sell.",
      "Buyers are responsible for verifying animals before completing any transaction. e-tungo facilitates connections and is not responsible for the outcome of transactions.",
      "e-tungo reserves the right to remove listings that violate community standards or are reported as fraudulent.",
      "These terms may be updated at any time. Continued use of the platform implies acceptance.",
    ],
    listItems: [],
  },
  "/privacy": {
    route: "/privacy",
    sourceUrl: "https://e-tungo.vercel.app/privacy",
    title: "Privacy Policy",
    paragraphs: [
      "e-tungo collects minimal personal information: your name, email address, and district. If you choose to post buyer requests or add a contact number to a listing, that contact detail is stored with the post.",
      "Email is used to sign in. Contact details you provide for listings or requests are not shared with third parties without your consent.",
      "Listings you create are public and visible to all visitors of the platform.",
      "You can delete your listings and account at any time.",
      "We take reasonable measures to protect your data but cannot guarantee absolute security.",
    ],
    listItems: [],
  },
  "/contact": {
    route: "/contact",
    sourceUrl: "https://e-tungo.vercel.app/contact",
    title: "Contact Us",
    subtitle: "Have a question or need help? Reach us through any of the channels below.",
    paragraphs: [
      "Have a question or need help? Reach us through any of the channels below.",
    ],
    listItems: [],
    channels: [
      {
        icon: "📞",
        label: "Phone / WhatsApp",
        value: "0792633097",
        href: "https://wa.me/250792633097",
      },
      {
        icon: "✉️",
        label: "Email",
        value: "tungatechnologies@gmail.com",
        href: "mailto:tungatechnologies@gmail.com",
      },
    ],
  },
};

export async function fetchCompanyData(
  route: CompanyRoute
): Promise<CompanyPageData> {
  const fallback = FALLBACK_DATA[route];
  const sourceUrl = externalSourceUrl(route);

  if (!sourceUrl) {
    return {
      ...fallback,
      fetchedAt: new Date().toISOString(),
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(sourceUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; e-tungo-client/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 3600 },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Failed to fetch ${sourceUrl}: HTTP ${res.status}`);
    }

    const html = await res.text();
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    const containerHtml = mainMatch ? mainMatch[1] : html;

    const h1Match = containerHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = h1Match
      ? h1Match[1].replace(/<[^>]+>/g, "").trim()
      : fallback.title;

    const subtitleMatch = containerHtml.match(/<p[^>]*class="[^"]*text-gray-600[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
    const subtitle = subtitleMatch ? subtitleMatch[1].replace(/<[^>]+>/g, "").trim() : fallback.subtitle;

    const paragraphs = [...containerHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((m) => m[1].replace(/<[^>]+>/g, "").trim())
      .filter((p) => p.length > 0 && !p.includes("©") && !p.startsWith("←"));

    const listItems = [...containerHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((m) =>
        m[1]
          .replace(/<[^>]+>/g, "")
          .replace(/^[✅\s]+/, "")
          .trim()
      )
      .filter((item) => item.length > 0);

    let channels = fallback.channels;
    if (route === "/contact") {
      const channelMatches = [
        ...containerHtml.matchAll(
          /<span[^>]*class="[^"]*text-2xl[^"]*"[^>]*>([\s\S]*?)<\/span>[\s\S]*?<p[^>]*class="[^"]*font-semibold[^"]*"[^>]*>([\s\S]*?)<\/p>[\s\S]*?<p[^>]*class="[^"]*text-brand-700[^"]*"[^>]*>([\s\S]*?)<\/p>/gi
        ),
      ];

      if (channelMatches.length > 0) {
        channels = channelMatches.map((m) => {
          const icon = m[1].replace(/<[^>]+>/g, "").trim() || "📞";
          const label = m[2].replace(/<[^>]+>/g, "").trim();
          const value = m[3].replace(/<[^>]+>/g, "").trim();
          const href = value.includes("@")
            ? `mailto:${value}`
            : `https://wa.me/25${value.replace(/\D/g, "")}`;
          return { icon, label, value, href };
        });
      }
    }

    return {
      route,
      sourceUrl,
      title: title || fallback.title,
      subtitle: subtitle || fallback.subtitle,
      paragraphs: paragraphs.length > 0 ? paragraphs : fallback.paragraphs,
      listItems: listItems.length > 0 ? listItems : fallback.listItems,
      channels,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(
      `[fetchCompanyData] Using fallback content for ${route}:`,
      error instanceof Error ? error.message : error
    );
    return {
      ...fallback,
      fetchedAt: new Date().toISOString(),
    };
  }
}
