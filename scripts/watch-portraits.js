const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const portraitsDir = path.join(__dirname, '../portraits');

console.log('Watching for new portrait files...');

fs.watch(portraitsDir, (eventType, filename) => {
  if (eventType === 'rename' && /\.(jpg|jpeg|png|webp)$/i.test(filename)) {
    // Wait briefly to ensure file is fully written
    setTimeout(() => {
      console.log(`Detected new file: ${filename}`);
      // Run resize.js
      exec('node ./resize.js', (err, stdout, stderr) => {
        if (err) {
          console.error('Error running resize.js:', stderr);
          return;
        }
        console.log('Resized previews.');
        // Run manifest generator (Python)
        exec('cd .. && python3 generate_portraits_manifest.py', (err2, stdout2, stderr2) => {
          if (err2) {
            console.error('Error running manifest generator:', stderr2);
            return;
          }
          console.log('Updated portraits manifest.');
          // Update portrait parade list
          exec('node ./update-portrait-parade.js', (err3, stdout3, stderr3) => {
            if (err3) {
              console.error('Error updating portrait parade:', stderr3);
              return;
            }
            console.log('Updated portrait parade list.');
          });
        });
      });
    }, 1000);
  }
});