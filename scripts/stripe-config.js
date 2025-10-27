// Stripe Configuration
// IMPORTANT: Replace with your actual Stripe publishable key
// Test key starts with: pk_test_
// Live key starts with: pk_live_
// Get your keys from: https://dashboard.stripe.com/apikeys

const STRIPE_PUBLISHABLE_KEY = 'pk_live_YOUR_STRIPE_PUBLISHABLE_KEY_HERE';

// Initialize Stripe
let stripe = null;
if (typeof Stripe !== 'undefined') {
    stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
}

// Price calculation (matches your current pricing)
const PRICES = {
    '8x8': 28,
    '10x10': 30,
    '12x12': 36,
    '20x20': 60,
    'digital': 20
};

const SHIPPING_COST = 0;
const TAX_RATE = 0.0875; // 8.75% - adjust for your location