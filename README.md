<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/6c703f93-1e37-4e23-9912-1c2dd5a69743" />
**e-tungo** is a simple and easy-to-use **Rwandan animals and animal-products marketplace** that connects farmers, livestock sellers, and buyers across Rwanda. Users can advertise, discover, and find animals and animal products such as cattle, goats, pigs, chickens, rabbits, milk, eggs, and honey, then contact each other directly.

## SEO

The app includes global and per-listing metadata, canonical URLs, Open Graph and Twitter cards, a branded social image, descriptive listing image alt text, Product/Offer JSON-LD, SEO-friendly category pages, `robots.txt`, and a dynamic `sitemap.xml` containing public pages and active listings. Account, admin, authentication, listing-creation, and other private routes are marked `noindex` and excluded from crawling.

Set `NEXT_PUBLIC_SITE_URL` to the production origin without a trailing slash. It defaults to `https://e-tungo.tungatechnologies.com`. Set the same value in Vercel for Production (and Preview if preview metadata needs its own origin).

Google's verification meta tag is included in the root metadata. To verify the Search Console **Domain property**, also add the TXT value shown by Search Console to the DNS record for the `e-tungo` host; HTML metadata alone only supports URL-prefix verification. After verification, submit `https://e-tungo.tungatechnologies.com/sitemap.xml` and review indexed pages and rich-result reports after Google has crawled the site.
