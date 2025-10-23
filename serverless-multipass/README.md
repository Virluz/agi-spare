# Serverless Multipass (Shopify Plus)

This is a minimal serverless endpoint that returns a Multipass login URL for a given customer email. Deploy it to Vercel/Netlify/Fly/etc. No full backend needed.

## Deploy (Vercel)

1. Create a new Vercel project from the `serverless-multipass` folder.
2. Set Environment Variables:
   - `SHOPIFY_MULTIPASS_SECRET`: Your Multipass secret from Shopify Plus admin.
   - `SHOPIFY_SHOP_DOMAIN`: your-shop.myshopify.com
3. Deploy.

## API

POST /api/multipass-login

Body JSON:
```
{
  "email": "user@example.com",
  "firstName": "John",    // optional
  "lastName": "Doe",      // optional
  "returnTo": "https://<your-shop>.myshopify.com/...." // optional
}
```

Response JSON:
```
{ "url": "https://<shop-domain>/account/login/multipass/<token>" }
```

Open the returned `url` in a webview or browser. If `returnTo` is provided, Shopify will redirect to that path after authenticating the customer — set this to your `checkoutUrl`.

## Notes
- Requires Shopify Plus.
- This function does not store any secrets client-side; all cryptographic operations are done server-side.
- Pair this with your app by calling it right before opening checkout.
