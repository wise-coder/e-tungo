# MongoDB Atlas Schema

Use these collections in your Atlas database:

- `listings`
- `wanted_requests`
- `meta`

The application seeds initial demo data automatically when both `listings` and `wanted_requests` are empty.

Recommended indexes:

- `listings`: `postedAt`, `sellerId`, `status`, `category`
- `wanted_requests`: `postedAt`, `buyerId`, `status`, `category`
- `meta`: `_id`

Environment variables:

- `MONGODB_URI`
- `MONGODB_DB_NAME` (for example: `e-tungo`)
