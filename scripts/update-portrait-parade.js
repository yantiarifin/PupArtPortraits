#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Paths
const portraitsJsonPath = path.join(__dirname, '../portraits/portraits.json');
const paradeJsPath = path.join(__dirname, 'portrait-parade.js');

try {
    // Read portraits.json
    const portraitsData = JSON.parse(fs.readFileSync(portraitsJsonPath, 'utf8'));

    // Extract all preview filenames
    const allPortraits = [];

    Object.values(portraitsData).forEach(dogPortraits => {
        dogPortraits.forEach(portrait => {
            const previewFilename = path.basename(portrait.previewUrl);
            allPortraits.push(previewFilename);
        });
    });

    // Sort alphabetically for consistency
    allPortraits.sort();

    console.log(`Found ${allPortraits.length} portrait previews`);

    // Read current portrait-parade.js
    let paradeContent = fs.readFileSync(paradeJsPath, 'utf8');

    // Create the new array content with proper indentation
    const arrayContent = allPortraits
        .map(filename => `      '${filename}'`)
        .join(',\n');

    // Replace the array in the file
    const arrayPattern = /const allPortraits = \[\s*[\s\S]*?\s*\];/;
    const newArrayContent = `const allPortraits = [
${arrayContent}
    ];`;

    if (arrayPattern.test(paradeContent)) {
        paradeContent = paradeContent.replace(arrayPattern, newArrayContent);

        // Write the updated file
        fs.writeFileSync(paradeJsPath, paradeContent);
        console.log('✅ Updated portrait-parade.js with current portrait list');
    } else {
        console.error('❌ Could not find allPortraits array in portrait-parade.js');
        process.exit(1);
    }

} catch (error) {
    console.error('Error updating portrait parade:', error.message);
    process.exit(1);
}