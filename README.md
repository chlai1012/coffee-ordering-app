This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
## Supabase Setup

This project uses Supabase for the `order` table and the API routes in `app/api/`. To connect Supabase:

1. Create or update `coffee-ordering-app/.env.local` with your project values:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```
2. Restart the Next.js development server after changing `.env.local`.
3. The Supabase client is created in `lib/supabaseClient.ts` and used in `app/api/order/route.ts`.

To verify the connection, you can use the temporary route at `http://localhost:3000/api/test-supabase` or inspect the `order` table directly in the Supabase dashboard.

## Supabase Requirements

For local development and deployment, make sure the following are configured:

- Add `@supabase/supabase-js` to `package.json`:
  ```bash
  npm install @supabase/supabase-js
  ```
- Set these environment variables in `coffee-ordering-app/.env.local` for development:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
  ```
- Set the same env vars in your deployment platform as secret/runtime env vars.
- Restart the Next.js server whenever `.env.local` changes.
- Confirm the `order` table exists in your Supabase project and has an appropriate SELECT policy if Row Level Security (RLS) is enabled.

This project uses [`next/font`](https://nextjs.org/docs/app/optimizing-fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
