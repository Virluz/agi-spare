// Minimal serverless endpoint for Shopify Multipass
// Environment variables required:
// - SHOPIFY_MULTIPASS_SECRET: Multipass secret from Shopify Plus
// - SHOPIFY_SHOP_DOMAIN: your-shop.myshopify.com

const Multipassify = require('multipassify');

module.exports = async (req, res) => {
    try {
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }

        const { email, firstName, lastName, returnTo } = req.body || {};
        if (!email) {
            res.status(400).json({ error: 'email is required' });
            return;
        }

        const secret = process.env.SHOPIFY_MULTIPASS_SECRET;
        const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN; // e.g. example.myshopify.com
        if (!secret || !shopDomain) {
            res.status(500).json({ error: 'Server not configured' });
            return;
        }

        const mp = new Multipassify(secret);

        const customerData = {
            email,
            first_name: firstName,
            last_name: lastName,
            // You can add more fields: tags, identifier, created_at, etc.
            ...(returnTo ? { return_to: returnTo } : {}),
        };

        const token = mp.encode(customerData);
        const url = `https://${shopDomain}/account/login/multipass/${token}`;
        res.status(200).json({ url });
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
};
