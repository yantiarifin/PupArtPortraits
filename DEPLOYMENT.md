# 🚀 PupArt Deployment Guide for HostGator

## Initial Setup on HostGator

### 1. Prepare HostGator Account
1. Log into your HostGator cPanel
2. Create a subdomain or folder for the project (e.g., `pupart.yourdomain.com` or `yourdomain.com/pupart`)
3. Note down your FTP/SSH credentials

### 2. Set Up Database (Optional - for future features)
1. In cPanel, go to "MySQL Databases"
2. Create a new database (e.g., `pupart_db`)
3. Create a database user and grant all privileges

### 3. Configure PHP Settings
1. In cPanel, go to "Select PHP Version"
2. Choose PHP 7.4 or higher (8.0+ recommended)
3. Enable these PHP extensions:
   - `gd` (for image processing)
   - `fileinfo`
   - `json`
   - `mbstring`

## Deployment Methods

### Method 1: Using Git (Recommended)

1. **Set up Git on HostGator:**
```bash
# SSH into your HostGator account
ssh username@yourdomain.com

# Navigate to your web directory
cd public_html

# Clone your repository
git clone https://github.com/yourusername/pupart.git
```

2. **Create a deployment workflow:**
```bash
# On your local machine
git add .
git commit -m "Your changes"
git push origin main

# On HostGator
cd public_html/pupart
git pull origin main
```

### Method 2: Using FTP

1. **Install FTP client:**
   - Mac: Use Cyberduck, FileZilla, or Transmit
   - Command line: Install `lftp` with `brew install lftp`

2. **Configure deploy.sh:**
```bash
# Edit deploy.sh with your credentials
nano deploy.sh

# Update these lines:
FTP_HOST="ftp.yourdomain.com"
FTP_USER="your-username"
FTP_PASS="your-password"
REMOTE_DIR="/public_html/pupart"
```

3. **Run deployment:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Method 3: Using cPanel File Manager

1. **Prepare files locally:**
```bash
# Create a deployment package
zip -r pupart-deploy.zip . \
  -x "*.git*" \
  -x "node_modules/*" \
  -x ".DS_Store" \
  -x "deploy.sh" \
  -x "generate_portraits_manifest.py"
```

2. **Upload via cPanel:**
   - Go to cPanel > File Manager
   - Navigate to your target directory
   - Upload the zip file
   - Extract the contents

## Production Configuration

### 1. Update config.php
Edit `/api/config.php` on the server:

```php
// Update these settings for production
define('ADMIN_PASSWORD', 'your-secure-password-here');
define('ADMIN_EMAIL', 'yantiarifin@gmail.com');
define('FROM_EMAIL', 'orders@yourdomain.com');
```

### 2. Set Up Directories
```bash
# Create necessary directories with proper permissions
mkdir -p uploads orders
chmod 755 uploads orders
```

### 3. Configure .htaccess
Create/update `.htaccess` in your root directory:

```apache
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Protect sensitive directories
RedirectMatch 403 /\.git
RedirectMatch 403 /orders/.*\.json$

# Set default index
DirectoryIndex index.html

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType text/css "access plus 1 week"
    ExpiresByType application/javascript "access plus 1 week"
</IfModule>
```

## Continuous Deployment Workflow

### Option 1: GitHub Actions (Automated)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to HostGator

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to HostGator via FTP
      uses: SamKirkland/FTP-Deploy-Action@4.0.0
      with:
        server: ftp.yourdomain.com
        username: ${{ secrets.FTP_USERNAME }}
        password: ${{ secrets.FTP_PASSWORD }}
        server-dir: /public_html/pupart/
        exclude: |
          .git*
          node_modules/
          *.log
          deploy.sh
          .github/
```

### Option 2: Manual Script (Simple)

Create `update.sh` on your local machine:

```bash
#!/bin/bash
# Quick update script

echo "📦 Updating PupArt on HostGator..."

# Add changes
git add .
git commit -m "$1"
git push origin main

# Deploy to server
ssh username@yourdomain.com "cd /public_html/pupart && git pull"

echo "✅ Update complete!"
```

Usage: `./update.sh "Fixed portrait display issue"`

### Option 3: Using rsync (Fast)

```bash
# Sync only changed files
rsync -avz --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'uploads/*' \
  --exclude 'orders/*' \
  ./ username@yourdomain.com:/public_html/pupart/
```

## Post-Deployment Checklist

- [ ] Test the homepage loads correctly
- [ ] Test portrait search functionality
- [ ] Upload a test photo (new portrait path)
- [ ] Complete a test order
- [ ] Verify order appears in admin panel
- [ ] Check email notifications are sent
- [ ] Test Venmo payment flow
- [ ] Verify SSL certificate is active
- [ ] Check mobile responsiveness
- [ ] Test all form validations

## Maintenance

### Backing Up Orders
```bash
# Download orders from server
scp -r username@yourdomain.com:/public_html/pupart/orders ./backups/
```

### Updating Portraits
1. Add new portraits locally
2. Run `node scripts/resize.js` to create thumbnails
3. Run `python3 generate_portraits_manifest.py`
4. Deploy changes

### Monitoring
- Set up uptime monitoring (e.g., UptimeRobot)
- Check HostGator's AWStats for traffic
- Monitor order submissions regularly

## Troubleshooting

### Issue: File uploads not working
- Check directory permissions: `chmod 755 uploads`
- Verify PHP upload settings in cPanel
- Check PHP error logs

### Issue: Emails not sending
- Configure SMTP in HostGator
- Update FROM_EMAIL in config.php to use your domain
- Check spam folder

### Issue: 500 Internal Server Error
- Check .htaccess syntax
- Verify PHP version compatibility
- Check error logs in cPanel

## Support

- HostGator Support: 1-866-96-GATOR
- cPanel Documentation: docs.cpanel.net
- Your files location: `/home/username/public_html/pupart/`

---

Remember to always test changes locally before deploying to production!