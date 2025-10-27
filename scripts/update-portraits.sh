#!/bin/bash

# Update Portraits Script
# Runs portrait manifest generation and thumbnail creation in sequence

echo "🎨 Starting portrait update process..."
echo ""

# Step 1: Generate portraits manifest
echo "📝 Generating portraits manifest..."
python3 generate_portraits_manifest.py

if [ $? -eq 0 ]; then
    echo "✅ Manifest generated successfully!"
else
    echo "❌ Error generating manifest"
    exit 1
fi

echo ""

# Step 2: Create thumbnail previews
echo "🖼️  Creating thumbnail previews..."
node scripts/resize.js

if [ $? -eq 0 ]; then
    echo "✅ Thumbnails created successfully!"
else
    echo "❌ Error creating thumbnails"
    exit 1
fi

echo ""

# Step 3: Update portrait parade list
echo "🎭 Updating portrait parade list..."
node scripts/update-portrait-parade.js

if [ $? -eq 0 ]; then
    echo "✅ Portrait parade updated successfully!"
else
    echo "❌ Error updating portrait parade"
    exit 1
fi

echo ""
echo "🎉 Portrait update complete!"