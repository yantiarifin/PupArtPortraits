# PupArt Portraits - Deployment Guide

## Table of Contents
- [Quick Context for Development](#quick-context-for-development)
- [🖼️ Adding New Portraits](#️-adding-new-portraits)
  - [For Production (Uploading to Live Site)](#for-production-uploading-to-live-site)
  - [Local Development Methods](#local-development---quick-method-one-command)
- [🎛️ Admin Panel Features](#️-admin-panel-features)
- [🖥️ Local Development Server](#️-local-development-server)
- [🎨 Tailwind CSS Production Build](#-tailwind-css-production-build)
- [💳 Stripe Payment Configuration](#-stripe-payment-configuration)
- [🚀 HostGator Deployment Instructions](#-hostgator-deployment-instructions)
- [📧 Support](#-support)
- [🔒 Security Notes](#-security-notes)

## Quick Context for Development
This is the PupArt Portraits e-commerce site. Key things to know:
- Orders/uploads are stored in `/public_html/pupart/` on Hostgator
- **Uploads are organized in folders**: `DogName-YYYY-MM-DD/` for easy retrieval
- Admin panel is at `/admin.html` with enhanced management features
- Uses PHP backend with `config.php` for environment detection
- FTP credentials configured in `deploy.sh` for easy deployment
- Local development uses Google Drive for orders/uploads storage
- Production automatically uses Hostgator server paths
- **Note**: .htaccess causes 500 errors on Hostgator - site runs without it
- **Important**: Max file upload size is 10MB (configured in php.ini)

## 🖼️ Adding New Portraits

### For Production (Uploading to Live Site)
After preparing portraits locally, upload them to Hostgator:

1. **Required files for each new portrait:**
   - `/portraits/DogName-YYYY-MM-DD.jpg` - Main portrait
   - `/portraits/previews/DogName-YYYY-MM-DD-thumb.jpg` - Thumbnail
   - `/portraits/no-bg/DogName-YYYY-MM-DD-nobg.png` - (Optional) For background preview
   - `portraits.json` - Updated manifest with new portrait info

2. **Upload methods:**
   - **Option A**: Run `./deploy.sh` and choose option 2 (syncs everything)
   - **Option B**: Upload individual files via Cyberduck/FileManager (faster for few files)

### Local Development - Quick Method (One Command)
```bash
npm run update-portraits
```

### Automatic Method (File Watcher)
Start the watcher to automatically process new portraits as you add them:
```bash
node scripts/watch-portraits.js
```

**What it does:**
- Monitors the `/portraits/` directory for new images
- Automatically creates thumbnails when new portraits are added
- Updates portraits.json manifest instantly
- Perfect for bulk adding portraits - just drop files in the folder!

**To stop:** Press `Ctrl + C`

### Manual Method
1. **Add portrait files** to `/portraits/` folder with naming format:
   ```
   DogName-YYYY-MM-DD.jpg
   ```

2. **Create preview thumbnails**:
   ```bash
   node scripts/resize.js
   ```

3. **Update the manifest**:
   ```bash
   python3 generate_portraits_manifest.py
   ```

4. **Update portrait parade list**:
   ```bash
   node scripts/update-portrait-parade.js
   ```

5. **Create no-background version** (for background change preview):
   - Remove background from portrait
   - Save to `/portraits/no-bg/` with exact naming:
   ```
   DogName-YYYY-MM-DD-nobg.png
   ```
   Note: Must match the original portrait's name and date exactly

## 📁 Upload Organization

When customers upload photos for new portraits, they are automatically organized:
- **Folder Structure**: `uploads/DogName-YYYY-MM-DD/`
- **Example**: A photo for "Bella" uploaded on Jan 4, 2025 goes to `uploads/Bella-2025-01-04/`
- **Benefits**:
  - Easy to find photos by dog name and date
  - No more searching through hundreds of timestamped files
  - Cleaner organization for order fulfillment

## 🎛️ Admin Panel Features

The admin panel (`/admin.html`) provides comprehensive order management:

### **Authentication**
- Password-protected access (default: `pupart2025`)
- Session-based authentication with automatic logout
- Change default password in `/api/config.php` before deployment

### **Order Management**
- **View Orders**: Complete order details with customer info and payment data
- **Sort Orders**: By date, dog name, mode (New/Existing/Manual), or status (Pending/Completed)
- **Color-Coded Labels**:
  - 🟠 **Orange**: New portraits (with uploaded photos)
  - 🟢 **Green**: Existing portraits (from portfolio)
  - 🟣 **Purple**: Manual orders (created through admin panel)

### **Order Operations**
- **Create Orders**: Manual order creation form with all customer and product details
- **Delete Orders**: Remove orders with confirmation dialog
- **Status Management**: Toggle between Pending/Completed status
- **Export Orders**: Download individual orders as JSON files

### **Customer Information**
- Full shipping addresses (street, city, state, ZIP)
- Contact information (name, email)
- Payment method details (Venmo username, card payments)

### **Advanced Features**
- **Mobile Responsive**: Full functionality on all devices
- **Real-time Updates**: Automatic refresh after order operations
- **Error Handling**: User-friendly error messages and validation
- **Secure Operations**: Authentication required for all admin functions

### **Payment Integration**
- **Stripe Integration**: Credit card payment processing (test/live modes)
- **Venmo Support**: Manual Venmo payment tracking
- **Order Totals**: Automatic calculation with shipping and tax

## 🖥️ Local Development Server

### Starting the Server
**Recommended - Use the startup script for proper file upload limits:**
```bash
./start-server.sh
```
This starts PHP with a 10MB upload limit instead of the default 2MB.

**Alternative methods:**
```bash
# Manual PHP with custom config
php -c php.ini -S localhost:8000

# Python (no file uploads)
python3 -m http.server 8000
```

Then access your site at `http://localhost:8000`

### Stopping the Server
Press `Ctrl + C` in the terminal

### If Port is Already in Use
If you get "Address already in use" error:

1. **Kill the process using port 8000**:
   ```bash
   lsof -ti:8000 | xargs kill -9
   ```

2. **Then restart the server**:
   ```bash
   php -S localhost:8000
   ```

**Alternative: Use a different port**:
```bash
php -S localhost:8001
```

## 🎨 Tailwind CSS Production Build

### Development Setup
1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **For development** (watches for changes):
   ```bash
   npm run build-css
   ```

3. **For production** (creates minified CSS):
   ```bash
   npm run build
   ```

### Important Files
- `output.css` - The compiled Tailwind CSS (upload this to HostGator)
- `input.css` - Source file with Tailwind directives (don't upload)
- `tailwind.config.js` - Tailwind configuration (don't upload)
- `package.json` & `node_modules/` - Development only (don't upload)

### Why This Matters
- The Tailwind CDN shows console warnings in production
- The compiled `output.css` is optimized and only includes used classes
- Results in smaller file size and better performance

## 💳 Stripe Payment Configuration

### **Setup Stripe Account**
1. Create account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Use **test keys** for development, **live keys** for production

### **Update Configuration Files**

**In `/scripts/stripe-config.js`:**
```javascript
// Replace with your Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_key_here'; // Test mode
// const STRIPE_PUBLISHABLE_KEY = 'pk_live_your_key_here'; // Live mode
```

**In `/api/create-checkout-session.php`:**
```php
// Replace with your Stripe secret key
$stripe_secret_key = 'sk_test_your_key_here'; // Test mode
// $stripe_secret_key = 'sk_live_your_key_here'; // Live mode
```

### **Key Types**
- **Test Keys**: Start with `pk_test_` and `sk_test_` - for development
- **Live Keys**: Start with `pk_live_` and `sk_live_` - for production
- **Never commit live keys to version control**

### **Testing Payments**
Use these test card numbers in test mode:
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- Use any future expiry date and any 3-digit CVC

## 🚀 HostGator Deployment Instructions

### Quick Deployment (Recommended)
Use the configured deploy script:
```bash
./deploy.sh
# Choose option 2 for FTP deployment
```

This will sync all files except orders/ and uploads/ directories to preserve existing data.

### Manual Deployment Options

#### Option 1: Using Cyberduck/FTP
- Connect using credentials in `deploy.sh`
- Upload changed files to `/public_html/pupart/`
- Skip orders/ and uploads/ folders

#### Option 2: Using cPanel File Manager
- Upload `pupart-deployment-safe.zip` if available
- Extract in `/public_html/pupart/`
- Choose "Overwrite" for existing files

### Important Configuration Notes
- Admin password is already set in `api/config.php` (production: `PupArt$3cur3_P@ssw0rd_2025!`)
- Email settings are configured for `orders@pupartportraits.com`
- Do NOT upload .htaccess file (causes 500 errors on Hostgator)

### Required Directories
These should already exist on your server:
```
/public_html/pupart/
  ├── uploads/     (chmod 755 or 775) - For customer photo uploads
  └── orders/      (chmod 755 or 775) - For order data storage
```

### Files Structure

```
/public_html/pupart/
  ├── api/
  │   ├── auth.php
  │   ├── config.php
  │   ├── create-checkout-session.php  ← Stripe payments
  │   ├── create-order.php            ← Manual order creation
  │   ├── delete-order.php            ← Order deletion
  │   ├── get-orders.php
  │   ├── submit-order.php
  │   ├── update-order-status.php     ← Order status management
  │   └── upload.php
  ├── images/
  │   ├── pupartlogo.svg
  │   ├── bg-*.png (all background images)
  │   └── ...
  ├── portraits/
  │   ├── portraits.json
  │   ├── previews/ (all thumbnail images)
  │   ├── no-bg/ (no-background portraits for preview feature)
  │   └── (all portrait images)
  ├── scripts/
  │   ├── script.js
  │   ├── stripe-config.js            ← Stripe configuration (update with LIVE keys)
  │   └── portrait-parade.js
  ├── index.html
  ├── admin.html                      ← Enhanced admin panel
  ├── success.html                    ← Stripe success page
  ├── output.css  ← Important: Compiled Tailwind CSS
  ├── styles.css
  ├── favicon.ico
  ├── favicon.svg
  ├── apple-touch-icon.png
  ├── site.webmanifest
  └── test-checklist.html
```

**DO NOT UPLOAD:**
- `node_modules/` folder
- `package.json`, `package-lock.json`
- `tailwind.config.js`
- `input.css`
- `.git/` folder

### 5. **Security Recommendations**

#### Protect Orders Directory
Create `.htaccess` file in `/public_html/pupart/orders/` folder:
```apache
Order deny,allow
Deny from all
```

#### Protect Uploads Directory
Create `.htaccess` file in `/public_html/pupart/uploads/` folder:
```apache
# Prevent PHP execution
<FilesMatch "\.php$">
    Order deny,allow
    Deny from all
</FilesMatch>
```

#### Optional: Move Sensitive Folders
If possible, move sensitive folders outside public_html:
```php
// In config.php, update paths:
define('UPLOAD_PATH', '/home/username/private/uploads/');
define('ORDERS_PATH', '/home/username/private/orders/');
```

### 5. **Test Your Deployment**

1. Navigate to `https://yourdomain.com/test-checklist.html`
2. Run all automated tests
3. Complete manual checklist items
4. Test order flow end-to-end

### 6. **PHP Requirements**

HostGator should have these by default, but verify:
- PHP 7.4 or higher
- JSON extension enabled
- File upload enabled
- `mail()` function enabled

### 7. **Troubleshooting**

**If uploads fail:**
- Check folder permissions (755 or 775)
- Verify PHP upload_max_filesize in php.ini
- Check error logs in cPanel

**If emails don't send:**
- Verify FROM_EMAIL uses your domain
- Check spam folder
- Contact HostGator support about mail() function

**If admin panel won't authenticate:**
- Clear browser cookies
- Verify password in config.php
- Check PHP session support

**If admin panel functions don't work:**
- Verify all API endpoints are uploaded (`/api/create-order.php`, `/api/delete-order.php`, etc.)
- Check PHP error logs for API endpoint errors
- Ensure orders.json file has write permissions
- Test API endpoints individually using `/test-checklist.html`

**If Stripe payments fail:**
- Verify Stripe keys are correct in both files
- Check browser console for JavaScript errors
- Ensure SSL certificate is valid (required for live payments)
- Test with Stripe's test card numbers first

**If manual order creation fails:**
- Check orders.json file permissions (755 or 775)
- Verify orders directory exists and is writable
- Check PHP error logs for JSON parsing errors

### 8. **Environment Detection**

The config.php automatically detects environment:
- **Local**: Uses Google Drive paths
- **Production**: Uses HostGator server paths

No code changes needed for this!

### 9. **Domain-Specific Updates**

Remember to update:
- Email addresses to use your domain
- Contact information in footer
- Any hardcoded URLs (though most are relative)

### 10. **Post-Launch Checklist**

**Security & Configuration:**
- [ ] Change admin password from default
- [ ] Update Stripe keys to live mode (when ready)
- [ ] Verify all email addresses use your domain
- [ ] Test SSL certificate works for payments

**Core Functionality:**
- [ ] Test complete order flow (new portraits)
- [ ] Test existing portrait ordering
- [ ] Verify Stripe payments work in live mode
- [ ] Check Venmo payment flow
- [ ] Confirm email notifications work

**Admin Panel:**
- [ ] Test admin login and logout
- [ ] Verify order sorting and filtering
- [ ] Test manual order creation
- [ ] Test order deletion and status updates
- [ ] Check mobile responsiveness of admin panel

**User Experience:**
- [ ] Test mobile menu and responsiveness
- [ ] Verify portrait search functionality
- [ ] Check all buttons and forms work
- [ ] Test file upload functionality
- [ ] Confirm success page displays after payment

**Optional:**
- [ ] Remove test-checklist.html from production
- [ ] Set up automated backups for orders.json
- [ ] Monitor error logs for issues

## 📧 Support

For issues specific to:
- **HostGator hosting**: Contact HostGator support
- **Application bugs**: Check browser console for errors
- **PHP errors**: Check error_log file in cPanel

## 🔒 Security Notes

- Never commit passwords to version control
- Regularly update admin password
- Monitor orders folder for unauthorized access
- Keep backups of portraits.json and orders

---

*Last updated: January 2025*