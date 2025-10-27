// Portrait Parade - Randomly displays different portraits on each page load
// No portrait appears more than once across all parade sections

(function() {
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {

    // Get all available portrait thumbnails from the previews directory
    const allPortraits = [
      'Ava-2025-08-03-thumb.jpg',
      'Bailey-2025-05-11-thumb.jpg',
      'Bear-2025-06-20-thumb.jpg',
      'Bella-2025-07-17-thumb.jpg',
      'Benny-2025-07-17-thumb.jpg',
      'Blossom-2025-10-11-thumb.jpg',
      'CJ-2025-09-06-thumb.jpg',
      'Chance-2025-09-14-thumb.jpg',
      'Coop-2025-06-04-thumb.jpg',
      'Desmon-2025-10-13-thumb.jpg',
      'Diamond-2025-10-21-thumb.jpg',
      'Dolly-2025-06-17-thumb.jpg',
      'Finn-2025-07-14-thumb.jpg',
      'Foxy-2025-09-14-thumb.jpg',
      'Frank-2025-10-25-thumb.jpg',
      'Frisco-2025-05-19-thumb.jpg',
      'Gogi-2025-06-03-thumb.jpg',
      'Goldie-2025-10-11-thumb.jpg',
      'Hades-2025-08-01-thumb.jpg',
      'Jasper-2025-08-17-thumb.jpg',
      'Junebug-2025-07-10-thumb.jpg',
      'Junebug-2025-09-14-thumb.jpg',
      'Kaiser-2025-09-14-thumb.jpg',
      'Larry-2025-09-24-thumb.jpg',
      'Lenny-2025-10-09-thumb.jpg',
      'Lily-2025-09-08-thumb.jpg',
      'Luca-2025-06-14-thumb.jpg',
      'Lulu-2025-10-01-thumb.jpg',
      'Maggie-2025-05-11-thumb.jpg',
      'Malcom-2025-07-07-thumb.jpg',
      'Marshall-2025-08-30-thumb.jpg',
      'Milaneso-2025-07-05-thumb.jpg',
      'Minnie-2025-05-28-thumb.jpg',
      'Molly-2025-05-22-thumb.jpg',
      'Mya-2025-06-07-thumb.jpg',
      'Nova-2025-05-11-thumb.jpg',
      'Panda-2025-10-12-thumb.jpg',
      'Penny-2025-09-30-thumb.jpg',
      'Perry-2025-09-14-thumb.jpg',
      'Pete-2025-09-23-thumb.jpg',
      'Poppy-2025-06-01-thumb.jpg',
      'Porkchop-2025-07-30-thumb.jpg',
      'Posie-2025-04-17-thumb.jpg',
      'Quinn-2025-09-06-thumb.jpg',
      'Remi-2025-08-31-thumb.jpg',
      'Rocky-2025-07-16-thumb.jpg',
      'Scooby-2025-07-26-thumb.jpg',
      'Scooby-2025-09-08-thumb.jpg',
      'Scotch-2025-09-14-thumb.jpg',
      'Seamus-2025-08-22-thumb.jpg',
      'Tater-2025-08-29-thumb.jpg',
      'Ted-2025-09-23-thumb.jpg',
      'Teddy-2025-07-12-thumb.jpg',
      'Tessa-2025-09-03-thumb.jpg',
      'Toby-2025-05-11-thumb.jpg',
      'Tony-2025-09-11-thumb.jpg',
      'Winston-2025-06-17-thumb.jpg',
      'Winston-2025-08-22-thumb.jpg',
      'Zappy-2025-06-23-thumb.jpg'
    ];

    // Parade sections configuration
    const parades = [
      { id: 'paradeStart', count: 6 },
      { id: 'paradeNew', count: 6 },
      { id: 'paradeExisting', count: 6 },
      { id: 'paradeExistingBg', count: 6 }
    ];

    // Calculate total portraits needed
    const totalNeeded = parades.reduce((sum, p) => sum + p.count, 0);

    // Make sure we have enough portraits
    if (allPortraits.length < totalNeeded) {
      console.warn('Not enough unique portraits for all parade sections');
    }

    // Shuffle array using Fisher-Yates algorithm
    function shuffleArray(array) {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }

    // Get random selection of portraits without duplicates
    const shuffledPortraits = shuffleArray(allPortraits);
    let portraitIndex = 0;

    // Update each parade section
    parades.forEach(parade => {
      const paradeElement = document.getElementById(parade.id);
      if (!paradeElement) return;

      // Clear existing images
      paradeElement.innerHTML = '';

      // Add new random portraits
      for (let i = 0; i < parade.count && portraitIndex < shuffledPortraits.length; i++) {
        const portrait = shuffledPortraits[portraitIndex++];
        const dogName = portrait.split('-')[0];

        const img = document.createElement('img');
        img.src = `/portraits/previews/${portrait}`;
        img.className = parade.id === 'paradeStart' && i === 0 ? 'h-100' : 'w-full';
        img.alt = `Sample portrait: ${dogName} the dog with artistic background`;

        // Add hidden class for mobile on certain images
        if (parade.id !== 'paradeStart' && i >= 3) {
          img.className += ' hidden md:block';
        }

        paradeElement.appendChild(img);
      }
    });

    // Optional: Add a subtle fade-in animation
    const allParadeImages = document.querySelectorAll('[id^="parade"] img');
    allParadeImages.forEach((img, index) => {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.5s ease-in';
      setTimeout(() => {
        img.style.opacity = '1';
      }, index * 50); // Stagger the fade-in
    });

  });
})();