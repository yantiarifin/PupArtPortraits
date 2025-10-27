#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// FTP credentials from deploy.sh
const FTP_HOST = '192.185.5.137';
const FTP_USER = 'admin2@pupartportraits.com';
const FTP_PASS = 'wKO7]jgYq#{;';

async function getRemotePortraits() {
    console.log('📡 Fetching remote portrait list from server...');

    const ftpCommand = `lftp -c "set ssl:verify-certificate no; open -u ${FTP_USER},'${FTP_PASS}' ${FTP_HOST}; ls portraits/previews/*.jpg; bye" 2>/dev/null | awk '{print $NF}' | xargs -n1 basename`;

    try {
        const { stdout } = await execPromise(ftpCommand);
        const files = stdout.trim().split('\n').filter(f => f).sort();
        return files;
    } catch (error) {
        console.error('Error fetching remote files:', error.message);
        return [];
    }
}

function getLocalPortraits() {
    console.log('📂 Reading local portrait previews...');

    const previewsDir = path.join(__dirname, '../portraits/previews');

    try {
        const files = fs.readdirSync(previewsDir)
            .filter(file => file.endsWith('.jpg'))
            .sort();
        return files;
    } catch (error) {
        console.error('Error reading local files:', error.message);
        return [];
    }
}

async function comparePortraits() {
    console.log('\n🔍 Comparing portrait previews: Local vs Server\n');
    console.log('=' .repeat(50));

    const [localFiles, remoteFiles] = await Promise.all([
        getLocalPortraits(),
        getRemotePortraits()
    ]);

    // Find differences
    const localOnly = localFiles.filter(f => !remoteFiles.includes(f));
    const remoteOnly = remoteFiles.filter(f => !localFiles.includes(f));
    const inBoth = localFiles.filter(f => remoteFiles.includes(f));

    // Display results
    console.log(`\n📊 SUMMARY:`);
    console.log(`  Local portraits:  ${localFiles.length}`);
    console.log(`  Remote portraits: ${remoteFiles.length}`);
    console.log(`  In sync:          ${inBoth.length}`);

    if (localOnly.length > 0) {
        console.log(`\n⚠️  LOCAL ONLY (need to upload):`);
        localOnly.forEach(file => console.log(`    📸 ${file}`));
    }

    if (remoteOnly.length > 0) {
        console.log(`\n⚠️  REMOTE ONLY (not in local):`);
        remoteOnly.forEach(file => console.log(`    🌐 ${file}`));
    }

    if (localOnly.length === 0 && remoteOnly.length === 0) {
        console.log(`\n✅ All portraits are in sync!`);
    } else {
        console.log(`\n❌ Portraits are NOT in sync`);
        console.log(`\n💡 To sync, run: ./deploy.sh`);
    }

    console.log('\n' + '=' .repeat(50));
}

// Run the comparison
comparePortraits().catch(console.error);