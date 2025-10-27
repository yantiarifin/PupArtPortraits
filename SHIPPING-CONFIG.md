# Shipping Configuration

This document explains how to easily toggle between free shipping and paid shipping for PupArt.

## Current Status
🆓 **FREE SHIPPING** is currently enabled.

## How to Change Shipping Settings

### To Enable FREE Shipping (Current Setting)

1. **In `/scripts/stripe-config.js`:**
   ```javascript
   const SHIPPING_COST = 0;
   ```

2. **In `/api/create-checkout-session.php`:**
   ```php
   // Shipping is now FREE - no longer adding shipping charges
   // if (!empty($items) && $items[0]['type'] !== 'digital') {
   //     $line_items[] = [
   //         'price_data' => [
   //             'currency' => 'usd',
   //             'product_data' => [
   //                 'name' => 'Shipping',
   //             ],
   //             'unit_amount' => 1500, // $15.00
   //         ],
   //         'quantity' => 1,
   //     ];
   // }
   ```

### To Enable PAID Shipping ($15)

1. **In `/scripts/stripe-config.js`:**
   ```javascript
   const SHIPPING_COST = 15; // Change from 0 to 15
   ```

2. **In `/api/create-checkout-session.php`:**
   ```php
   // Add shipping if there are physical items
   if (!empty($items) && $items[0]['type'] !== 'digital') {
       $line_items[] = [
           'price_data' => [
               'currency' => 'usd',
               'product_data' => [
                   'name' => 'Shipping',
               ],
               'unit_amount' => 1500, // $15.00
           ],
           'quantity' => 1,
       ];
   }
   ```

## How It Works

- **Frontend Display**: The JavaScript automatically shows "FREE" when `SHIPPING_COST = 0`, or "$15.00" when `SHIPPING_COST = 15`
- **Stripe Checkout**: Only adds shipping line items when uncommented in the PHP file
- **Digital Orders**: Never charge shipping regardless of setting (digital files don't need shipping)
- **Physical Orders**: Collect shipping address but only charge if enabled

## To Change Shipping Amount

To use a different shipping amount (e.g., $10):

1. Change `SHIPPING_COST = 10` in stripe-config.js
2. Change `unit_amount => 1000` in create-checkout-session.php (amount in cents)

## After Making Changes

1. **Local Testing**: Restart your local server with `./start-server.sh`
2. **Live Site**: Upload the changed files to your server:
   - Upload `scripts/stripe-config.js` to `/public_html/pupart/scripts/`
   - Upload `api/create-checkout-session.php` to `/public_html/pupart/api/`

Changes take effect immediately - no restart needed!