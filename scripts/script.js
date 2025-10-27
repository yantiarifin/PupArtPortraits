  // Ensure scroll to top on page reload/navigation
  window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
  });

  // Test Mode: Show Test Option when ?test=true is in URL or when enabled via console
  function enableTestMode() {
    const testOption = document.getElementById('testOption');
    if (testOption) {
      testOption.classList.remove('hidden');
      console.log('Test mode enabled - Test Option is now visible');
    }
  }

  // Check URL parameters for test mode
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('test') === 'true') {
    enableTestMode();
  }

  // Also expose function to console for manual testing
  window.enableTestMode = enableTestMode;

  // Product Info Modal Functions
  window.showInfoModal = function(productType) {
    const modal = document.getElementById('infoModal');
    const modalContent = modal.querySelector('.bg-white');
    const title = document.getElementById('modalTitle');
    const content = document.getElementById('modalContent');

    const productInfo = {
      prints: {
        title: 'Print Details',
        content: `
          <img src="images/mockup-prints2.png" alt="Line of Prints Example" class="modal-image w-full h-auto rounded-lg mb-4">
          <h1 class="text-lg font-semibold mb-2 text-slate-800">Fur-Ever Memories.</h1>
          <h2 class="text-lg font-normal leading-snug modal-image mb-8">Museum-quality giclée printing ensures the highest standards of quality.</h2>
          <p>• Giclée technology produces for rich and vibrant colors with exceptional detail.</p>
          <p>• Produced on certified archival-quality fine art paper.</p>
          <p>• Uses fade-resistant pigment inks to ensure long-lasting color.</p>
          <p>• Professional, museum-quality finish ready for framing and display.</p>
        `
      },
      framed: {
        title: 'Framed Print Details',
        content: `
          <img src="images/mockup-framed.png" alt="Framed Print Example" class="modal-image w-full h-auto rounded-lg mb-4">
          <h1 class="text-lg font-semibold mb-2 text-slate-800">A Frame Worthy of Love. </h1>
          <p>• Handcrafted frames with meticulous professional mounting</p>
          <p>• Non-glare acrylic glazing for pristine clarity and protection</p>
          <p>• Elegant white window mat, precision-cut and mounted</p>
          <p>• Espresso walnut wood frame for a refined, enduring finish</p>
          <p>• Expertly handcrafted and completed entirely in the USA</p>
        `
      },
      canvas: {
        title: 'Canvas Details',
        content: `
          <img src="images/mockup-canvas.jpg" alt="Canvas Print Example" class="modal-image w-full h-auto rounded-lg mb-4">
          <h1 class="text-lg font-semibold mb-2 text-slate-800">Your Snugglebuggle On Canvas.</h1>
          <p>• Museum-quality canvas material</p>
          <p>• Stretched over 1.5" deep wood frame</p>
          <p>• Image wraps around edges</p>
          <p>• Ready to hang - no frame needed</p>
          <p>• Lightweight and durable</p>
          <p>• Includes hanging hardware pre-installed</p>
        `
      }
    };

    if (productInfo[productType]) {
      title.textContent = productInfo[productType].title;
      content.innerHTML = productInfo[productType].content;

      // Show modal with transition
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      modal.style.opacity = '0';
      modalContent.style.transform = 'scale(0.95)';

      // Trigger animation
      requestAnimationFrame(() => {
        modal.style.transition = 'opacity 200ms ease';
        modalContent.style.transition = 'transform 200ms ease';
        modal.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
      });

      document.body.style.overflow = 'hidden';
    }
  };

  window.closeInfoModal = function() {
    const modal = document.getElementById('infoModal');
    const modalContent = modal.querySelector('.bg-white');

    // Animate out
    modal.style.opacity = '0';
    modalContent.style.transform = 'scale(0.95)';

    // Hide after animation
    setTimeout(() => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      modal.style.opacity = '';
      modalContent.style.transform = '';
      document.body.style.overflow = '';
    }, 200);
  };

  // Close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeInfoModal();
    }
  });

  // Close modal on background click
  document.getElementById('infoModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'infoModal') {
      closeInfoModal();
    }
  });

  // Mobile Menu Toggle
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const mobileMenuPanel = document.getElementById('mobileMenuPanel');

  function openMobileMenu() {
    mobileMenu.classList.remove('hidden');
    setTimeout(() => {
      mobileMenuPanel.classList.remove('translate-x-full');
    }, 10);
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileMenuPanel.classList.add('translate-x-full');
    setTimeout(() => {
      mobileMenu.classList.add('hidden');
    }, 300);
    document.body.style.overflow = '';
  }

  // Open mobile menu
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openMobileMenu);
  }

  // Close mobile menu
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
  }

  // Close on overlay click
  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
  }

  // Close menu when clicking on a link
  const mobileMenuLinks = document.querySelectorAll('#mobileMenuPanel a');
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  const MANIFEST_URL = '/portraits/portraits.json';
  
  const resWrap = document.getElementById('existingResult');
  const listEl = document.getElementById('existingList');
  const metaEl = document.getElementById('existingMeta');
  const confirmBtn = document.getElementById('confirmExistingBtn');
  const notMineBtn = document.getElementById('notMineBtn');
  const findBtn = document.getElementById('findPortraitBtn');
  const petEl = document.getElementById('petName');
  const errEl = document.getElementById('existingError');
  const prints = document.getElementById('prints');
  const sumDogEl = document.getElementById('sumDog');

  const validationState = {
    dogName: false,
    photos: false,
    background: false
  };

  let currentOptions = [];
  let selectedIndex = -1;
  let uploadedFiles = []; // Store uploaded files globally
  let uploadedFileNames = []; // Store server filenames for final submission

  // =========================
  //  HELPER FUNCTIONS
  // =========================
  function slugifyName(s){ return (s||'').trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+$/,''); }
  function petKey(p){ return slugifyName(p); }
  
  // Upload files to server
  async function uploadFilesToServer(files) {
    // Show loader
    const photoLoader = document.getElementById('photoLoader');
    const photoInput = document.getElementById('photos');
    if (photoLoader) {
      photoLoader.classList.remove('hidden');
    }
    if (photoInput) {
      photoInput.disabled = true;
    }

    try {
      // Check if we're running locally without PHP
      const isLocalWithoutPHP = window.location.protocol === 'file:' ||
                                (window.location.hostname === 'localhost' && !window.location.port);

      if (isLocalWithoutPHP) {
        // Simulate upload for local testing without PHP
        console.log('Running in local mode without PHP server - simulating upload');
        // Add artificial delay to simulate upload time
        await new Promise(resolve => setTimeout(resolve, 1000));
        const simulatedFiles = files.map(file => {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const random = Math.random().toString(36).substring(2, 8);
          const extension = file.name.split('.').pop();
          return `dog-${timestamp}-${random}.${extension}`;
        });
        return simulatedFiles;
      }

      // Normal upload to PHP server
      const formData = new FormData();
      files.forEach(file => {
        formData.append('photos[]', file);
      });

      // Add dog name if available (from the input field)
      const dogNameInput = document.getElementById('dogNameNew');
      if (dogNameInput && dogNameInput.value) {
        formData.append('dogName', dogNameInput.value);
      }

      const response = await fetch('/api/upload.php', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      if (result.success) {
        // Return the full paths including the folder
        return result.files.map(f => f.url || f.filename);
      } else {
        // Log the full error details for debugging
        console.error('Upload failed with errors:', result.errors);
        throw new Error(result.errors.join(', '));
      }
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Upload error details:', error.message);
      throw error;
    } finally {
      // Hide loader
      if (photoLoader) {
        photoLoader.classList.add('hidden');
      }
      if (photoInput) {
        photoInput.disabled = false;
      }
    }
  }
  
  // Get print selections for order
  function getPrintSelections() {
    const selections = [];
    const checks = document.querySelectorAll('.sizeOption:checked');
    const qtys = document.querySelectorAll('.qtyInput');
    
    checks.forEach((checkbox, index) => {
      const qty = qtys[index] ? parseInt(qtys[index].value || '1') : 1;
      selections.push({
        size: checkbox.value,
        price: parseFloat(checkbox.dataset.price || '0'),
        quantity: qty
      });
    });
    
    // Check for digital file
    const digital = document.getElementById('digitalOnly');
    if (digital?.checked) {
      selections.push({
        size: 'Digital',
        price: parseFloat(digital.dataset.price || '20'),
        quantity: 1
      });
    }
    
    return selections;
  }
  
  // Submit complete order
  async function submitOrder(orderData) {
    try {
      const response = await fetch('/api/submit-order.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) throw new Error('Order submission failed');
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Order submission error:', error);
      throw error;
    }
  }

  // Hide all validation errors (used on page load and mode switching)
  function hideAllValidationErrors() {
    document.getElementById('nameError')?.classList.add('hidden');
    document.getElementById('photoError')?.classList.add('hidden');
    document.getElementById('bgError')?.classList.add('hidden');
    document.getElementById('validationSummary')?.classList.add('hidden');
    
    // Remove any error styling
    const nameInput = document.getElementById('dogNameNew');
    nameInput?.classList.remove('border-rose-300');
  }

  // =========================
  //  EXISTING PORTRAIT LOOKUP
  // =========================
  async function lookupPortraitByName(pet){
    const res = await fetch(MANIFEST_URL, { cache:'no-cache' });
    if(!res.ok) throw new Error('Could not load portrait index.');
    const index = await res.json();
    const key = petKey(pet);
    const entries = index[key];
    if(!entries || !entries.length) throw new Error('No portrait found for that name.');
    
    const norm = entries.map(e => {
      return {
        url: e.url,
        previewUrl: e.previewUrl,
        file: e.file || (e.url ? e.url.split('/').pop() : ''),
        date: e.date || ''
      };
    }).filter(x => x.url);
    
    norm.sort((a,b)=>(a.date||'').localeCompare(b.date||''));
    return norm;
  }

  function describeSelection(entry){
    const date = entry.date ? `Created: ${entry.date}` : '';
    return date || 'Portrait found';
  }

  function renderPortraitButtons(entries, selectedIndex, pet) {
    return entries.map((e,i)=>`
      <button type="button" role="option" data-index="${i}" aria-checked="${selectedIndex===i?'true':'false'}"
        class="group relative overflow-hidden rounded-lg ${selectedIndex===i ? 'ring-2 ring-slate-900' : 'ring-1 ring-slate-200'} hover:ring-slate-400 focus:outline-none">
        <img src="${e.previewUrl || e.url}" alt="${pet} portrait ${e.date ? '('+e.date+')':''}" class="thumbnail object-cover" style="width: 200px; height: 200px;">
      </button>
    `).join('');
  }

  function renderExistingOptions(pet, entries){
    currentOptions = entries;
    selectedIndex = entries.length === 1 ? 0 : -1;

    listEl.innerHTML = renderPortraitButtons(entries, selectedIndex, pet);

    if (selectedIndex === 0) {
      metaEl.textContent = describeSelection(entries[0]);
      confirmBtn.disabled = false;
    } else {
      metaEl.textContent = 'Choose one of the portraits above.';
      confirmBtn.disabled = true;
    }


    const handleClick = (e)=>{
      const btn = e.target.closest('[data-index]');
      if(!btn) return;
      selectedIndex = parseInt(btn.dataset.index,10);
      
      // Re-render with new selection
      listEl.innerHTML = renderPortraitButtons(entries, selectedIndex, pet);
      
      metaEl.textContent = describeSelection(currentOptions[selectedIndex]);
      confirmBtn.disabled = false;
      
      // Re-attach the same click handler
      listEl.onclick = handleClick;
    };
    
    listEl.onclick = handleClick;
  }

  // =========================
  //  FORM VALIDATION (SILENT until Continue clicked)
  // =========================
  function checkFieldValid(fieldName) {
    switch(fieldName) {
      case 'dogName':
        const nameInput = document.getElementById('dogNameNew');
        return nameInput.value.trim().length > 0;
        
      case 'photos':
        // Check if uploadedFiles exists and has items (defined in photo upload handler)
        return typeof uploadedFiles !== 'undefined' && uploadedFiles.length > 0;
        
      case 'background':
        const bgSelected = document.querySelector('#bgChoices [aria-checked="true"]');
        return !!bgSelected;
        
      default:
        return true;
    }
  }

  function updateValidationState() {
    validationState.dogName = checkFieldValid('dogName');
    validationState.photos = checkFieldValid('photos');
    // Background selection removed for new portraits
    // validationState.background = checkFieldValid('background');
    validationState.background = true; // Always valid since not required

    const allValid = validationState.dogName && validationState.photos; // Removed background requirement
    
    // Update button state
    const continueBtn = document.getElementById('continueToOrderBtn');
    if (continueBtn) {
      continueBtn.disabled = !allValid;
    }
    
    return allValid;
  }

  function showValidationErrors() {
    // Show individual field errors
    if (!validationState.dogName) {
      const nameError = document.getElementById('nameError');
      const nameInput = document.getElementById('dogNameNew');
      nameError.classList.remove('hidden');
      nameInput.classList.add('border-rose-300');
    }
    
    if (!validationState.photos) {
      const photoError = document.getElementById('photoError');
      photoError.textContent = 'Please upload at least one photo.';
      photoError.classList.remove('hidden');
    }

    // Background selection removed for new portraits
    // if (!validationState.background) {
    //   const bgError = document.getElementById('bgError');
    //   bgError.classList.remove('hidden');
    // }
    
    // Show validation summary
    const summary = document.getElementById('validationSummary');
    const list = document.getElementById('validationList');
    const errors = [];
    
    if (!validationState.dogName) errors.push('Enter your dog\'s name');
    if (!validationState.photos) errors.push('Upload at least one photo');
    // Background selection removed for new portraits
    // if (!validationState.background) errors.push('Select a background color');
    
    if (errors.length > 0) {
      list.innerHTML = errors.map(error => `<li>• ${error}</li>`).join('');
      summary.classList.remove('hidden');
    }
  }

  function validateFileSize(files) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const invalidFiles = [];
    
    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        invalidFiles.push(file.name);
      }
    });
    
    return {
      valid: invalidFiles.length === 0,
      invalidFiles
    };
  }

  // Track navigation history for back button (global scope)
  let navigationHistory = ['start'];
  
  // =========================
  //  EVENT LISTENERS
  // =========================
  document.addEventListener('DOMContentLoaded', () => {
    // Scroll to top on page load - multiple methods for better mobile support
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Hide all errors on page load
    hideAllValidationErrors();
    
    const backBtn = document.getElementById('backBtn');
    
    // Function to update back button visibility
    function updateBackButton() {
      if (backBtn) {
        if (navigationHistory.length > 1) {
          backBtn.classList.remove('hidden');
        } else {
          backBtn.classList.add('hidden');
        }
      }
    }
    
    // Handle back button click
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (navigationHistory.length > 1) {
          navigationHistory.pop(); // Remove current section
          const previousSection = navigationHistory[navigationHistory.length - 1];
          const element = document.getElementById(previousSection);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
          updateBackButton();
        }
      });
    }
    
    // Track when user navigates to new sections
    window.addToHistory = function(sectionId) {
      if (navigationHistory[navigationHistory.length - 1] !== sectionId) {
        navigationHistory.push(sectionId);
        updateBackButton();
      }
    }
    
    // Set initial button state
    updateValidationState();

    // Dog name input - just update summary and validation state (no error display)
    const nameInput = document.getElementById('dogNameNew');
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        updateValidationState();
        sumDogEl.textContent = nameInput.value.trim() || '—';
      });
    }
    
    // Continue button - ONLY place where we show validation errors
    const continueBtn = document.getElementById('continueToOrderBtn');
    if (continueBtn) {
      continueBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        if (updateValidationState()) {
          // Set default background for new portraits (since selection is removed)
          const sumBG = document.getElementById('sumBG');
          if (sumBG && (!sumBG.textContent || sumBG.textContent === '—')) {
            sumBG.textContent = 'Artist Choice';
          }

          // All valid - now upload the cached photos with the dog name
          continueBtn.disabled = true;
          continueBtn.textContent = 'Uploading photos...';

          try {
            // Upload the cached files now that we have the dog name
            if (uploadedFiles.length > 0 && uploadedFileNames.length === 0) {
              const serverFiles = await uploadFilesToServer(uploadedFiles);
              if (serverFiles && serverFiles.length > 0) {
                uploadedFileNames = serverFiles;

                // Update photo indicators to show uploaded
                const previews = document.querySelectorAll('#previews .absolute.bottom-1.left-1');
                previews.forEach(statusDiv => {
                  statusDiv.className = 'absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded';
                  statusDiv.innerHTML = '<i class="fas fa-check"></i> Uploaded';
                });
              }
            }

            // Proceed to next section
            continueBtn.textContent = 'Continue to Order Selection';
            continueBtn.disabled = false;
            prints.classList.remove('hidden');
            prints.scrollIntoView({behavior:'smooth', block:'start'});
          } catch (error) {
            console.error('Upload failed:', error);
            const photoError = document.getElementById('photoError');
            photoError.textContent = `Upload failed: ${error.message || 'Please try again.'}`;
            photoError.classList.remove('hidden');
            continueBtn.textContent = 'Continue to Order Selection';
            continueBtn.disabled = false;
          }
        } else {
          // Show validation errors
          showValidationErrors();
        }
      });
    }

    // Background selection - just update state (no error display)
    const bgList = document.getElementById('bgChoices');
    const sumBG = document.getElementById('sumBG');
    if (bgList) {
      bgList.addEventListener('click', (e) => {
        const btn = e.target.closest('[role="option"][data-value]');
        if (!btn) return;
        
        bgList.querySelectorAll('[role="option"]').forEach(el => {
          el.setAttribute('aria-checked','false');
          el.classList.remove('ring-2','ring-slate-900');
        });
        btn.setAttribute('aria-checked','true');
        btn.classList.add('ring-2','ring-slate-900');
        
        const name = btn.dataset.value || '';
        sumBG.textContent = name ? name.charAt(0).toUpperCase()+name.slice(1) : '—';
        
        updateValidationState();
      });
    }

    // Photo upload - show file errors immediately, but not validation errors
    const photoInput = document.getElementById('photos');
    const preview = document.getElementById('previews');
    const photoErr = document.getElementById('photoError');
    const dogNameSection = document.getElementById('dogNameSection');
    
    if (photoInput && preview) {
      photoInput.addEventListener('change', () => {
        photoErr?.classList.add('hidden');

        const newFiles = Array.from(photoInput.files || []);
        if (!newFiles.length) {
          return; // Don't clear existing photos if no new files selected
        }

        // Show file-specific errors (size, type)
        const sizeValidation = validateFileSize(newFiles);
        if (!sizeValidation.valid) {
          photoErr.textContent = `Files too large (10MB max): ${sizeValidation.invalidFiles.join(', ')}`;
          photoErr.classList.remove('hidden');
          photoInput.value = '';
          return;
        }

        const validNewFiles = newFiles.filter(f => /^image\/(jpeg|png|webp|gif)$/i.test(f.type));
        if (!validNewFiles.length) {
          photoErr.textContent = 'Please upload valid image files (JPG, PNG, WebP, GIF).';
          photoErr.classList.remove('hidden');
          photoInput.value = '';
          return;
        }

        // Add new files to existing ones (up to 3 total)
        const remainingSlots = 3 - uploadedFiles.length;
        const filesToAdd = validNewFiles.slice(0, remainingSlots);

        // Cache files locally without uploading yet
        if (filesToAdd.length > 0) {
          // Store files locally (not uploaded yet)
          uploadedFiles = [...uploadedFiles, ...filesToAdd];

          // Clear and re-render all previews
          preview.innerHTML = '';
          uploadedFiles.forEach((file, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'relative';

            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = file.name;
            img.className = 'h-40 w-40 rounded-md object-cover ring-1 ring-slate-200';

            // Add "pending upload" indicator
            const statusDiv = document.createElement('div');
            statusDiv.className = 'absolute bottom-1 left-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded';
            statusDiv.innerHTML = '<i class="fas fa-clock"></i> Ready';

            // Add remove button
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => {
              uploadedFiles.splice(index, 1);
              wrapper.remove();
              if (uploadedFiles.length === 0) {
                if (dogNameSection) dogNameSection.classList.add('hidden');
              }
              updateValidationState();
            };

            wrapper.appendChild(img);
            wrapper.appendChild(statusDiv);
            wrapper.appendChild(removeBtn);
            preview.appendChild(wrapper);
          });

          // Show dog name section after photos are selected
          if (uploadedFiles.length > 0 && dogNameSection) {
            dogNameSection.classList.remove('hidden');
          }

          updateValidationState();
        }

        if (uploadedFiles.length === 3) {
          photoErr.textContent = 'Maximum 3 photos reached.';
          photoErr.classList.remove('hidden');
        } else if (validNewFiles.length > remainingSlots) {
          photoErr.textContent = `Only ${filesToAdd.length} photo(s) added. Maximum 3 photos allowed.`;
          photoErr.classList.remove('hidden');
        }
        
        // Show dog name section after successful photo upload
        if (uploadedFiles.length > 0 && dogNameSection) {
          dogNameSection.classList.remove('hidden');
        }
        
        // Clear the file input for next selection
        photoInput.value = '';
        
        updateValidationState();
      });
    }

    // Pricing calculations
    function recompute(){
      let sub = 0;
      const checks = document.querySelectorAll('.sizeOption');
      const qtys = document.querySelectorAll('.qtyInput');
      const digital = document.getElementById('digitalOnly');

      checks.forEach((c,i)=>{
        const price = parseFloat(c.dataset.price||'0');
        const qEl = qtys[i];
        if (qEl) {
          qEl.disabled = !c.checked;
          // Show/hide the entire qty div container
          const qtyContainer = qEl.closest('div');
          if (qtyContainer) {
            if (c.checked) {
              qtyContainer.classList.remove('opacity-0');
              qtyContainer.classList.add('opacity-100');
            } else {
              qtyContainer.classList.remove('opacity-100');
              qtyContainer.classList.add('opacity-0');
            }
          }
          if (!c.checked && qEl.value) qEl.value = '';
          if (c.checked && qEl.value === '') {
            qEl.value = '1';
          }
        }
        const qty = c.checked ? (qEl ? Math.max(0, parseInt(qEl.value||'0',10)||0) : 1) : 0;
        sub += price * qty;
      });

      if (digital?.checked) sub += parseFloat(digital.dataset.price||'0');

      const fmt = n => `$${(Math.round(n*100)/100).toFixed(2)}`;
      document.getElementById('totalPrice').textContent = fmt(sub);
      document.getElementById('sumSubtotal').textContent = fmt(sub);
      document.getElementById('sumTotal').textContent = fmt(sub);

      // Enable/disable proceed to checkout button based on selections
      const proceedBtn = document.getElementById('proceedToCheckoutBtn');
      if (proceedBtn) {
        const hasSelections = [...checks].some(c => c.checked) || digital?.checked;
        proceedBtn.disabled = !hasSelections;
      }

      // Show/hide address fields based on selections
      const hasPhysicalItems = [...checks].some(c => c.checked);
      const onlyDigital = digital?.checked && !hasPhysicalItems;

      // Hide only address-related fields for digital-only orders
      const addressFields = document.querySelectorAll('#address, #city, #state, #zipCode');
      const addressContainers = [];

      // Find parent containers of address fields to hide entire rows
      addressFields.forEach(field => {
        const parent = field.closest('div');
        if (parent && !addressContainers.includes(parent)) {
          addressContainers.push(parent);
        }
      });

      if (onlyDigital) {
        // Hide address fields for digital-only orders
        addressContainers.forEach(container => {
          if (container) container.style.display = 'none';
        });
        // Update the shipping card title if it exists
        const shippingTitle = document.querySelector('#checkout h3');
        if (shippingTitle && shippingTitle.textContent.includes('Shipping')) {
          shippingTitle.textContent = 'Customer Information';
        }
      } else {
        // Show address fields for physical items
        addressContainers.forEach(container => {
          if (container) container.style.display = '';
        });
        // Restore the shipping card title
        const shippingTitle = document.querySelector('#checkout h3');
        if (shippingTitle && !shippingTitle.textContent.includes('Shipping')) {
          shippingTitle.textContent = 'Shipping Information';
        }
      }

      // Re-validate checkout form when switching between digital and physical
      if (typeof validateCheckoutForm === 'function') {
        validateCheckoutForm();
      }
    }

    document.addEventListener('change', recompute);
    document.addEventListener('input', recompute);
    recompute();

    // Proceed to checkout button
    const proceedToCheckoutBtn = document.getElementById('proceedToCheckoutBtn');
    if (proceedToCheckoutBtn) {
      proceedToCheckoutBtn.addEventListener('click', () => {
        // Copy order summary to checkout section
        const checkoutSection = document.getElementById('checkout');
        if (checkoutSection) {
          // Copy summary data to final summary
          document.getElementById('finalSumMode').textContent = document.getElementById('sumMode').textContent;
          document.getElementById('finalSumDog').textContent = document.getElementById('sumDog').textContent;
          document.getElementById('finalSumBG').textContent = document.getElementById('sumBG').textContent;
          document.getElementById('finalSumSubtotal').textContent = document.getElementById('sumSubtotal').textContent;
          
          // Calculate final totals with shipping
          const subtotal = parseFloat(document.getElementById('sumSubtotal').textContent.replace('$', '')) || 0;
          const shipping = SHIPPING_COST; // Use shipping cost from config
          const tax = Math.round((subtotal + shipping) * 0.08 * 100) / 100; // 8% tax
          const total = subtotal + shipping + tax;

          // Display shipping as "FREE" if cost is 0, otherwise show price
          document.getElementById('finalSumShipping').textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
          document.getElementById('finalSumTax').textContent = `$${tax.toFixed(2)}`;
          document.getElementById('finalSumTotal').textContent = `$${total.toFixed(2)}`;
          
          // Navigate to checkout
          window.addToHistory('checkout');
          checkoutSection.classList.remove('hidden');
          checkoutSection.scrollIntoView({behavior:'smooth', block:'start'});
        }
      });
    }

    // Form validation for place order button
    function validateCheckoutForm() {
      const placeOrderBtn = document.getElementById('placeOrderBtn');
      if (!placeOrderBtn) return;

      let isValid = true;

      // Check if only digital is selected
      const digitalOnly = document.getElementById('digitalOnly');
      const sizeOptions = document.querySelectorAll('.sizeOption:checked');
      const hasPhysicalItems = sizeOptions.length > 0;
      const onlyDigital = digitalOnly?.checked && !hasPhysicalItems;

      // Check required fields based on order type
      if (onlyDigital) {
        // For digital only, we just need name and email
        const requiredDigitalFields = ['firstName', 'lastName', 'email'];
        requiredDigitalFields.forEach(fieldId => {
          const field = document.getElementById(fieldId);
          if (!field || !field.value.trim()) {
            isValid = false;
          }
        });
      } else {
        // For physical items, check all shipping fields
        const requiredShippingFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode'];
        requiredShippingFields.forEach(fieldId => {
          const field = document.getElementById(fieldId);
          if (!field || !field.value.trim()) {
            isValid = false;
          }
        });
      }

      // Check payment method specific fields
      const venmoOption = document.getElementById('venmoOption');
      if (venmoOption && venmoOption.checked) {
        // Venmo validation
        const venmoUsername = document.getElementById('venmoUsername');
        if (!venmoUsername || !venmoUsername.value.trim()) {
          isValid = false;
        }
      }
      // Credit card option doesn't need additional validation
      // since we're using Stripe's redirect flow

      placeOrderBtn.disabled = !isValid;
    }

    // Add event listeners to all checkout form fields
    const checkoutSection = document.getElementById('checkout');
    if (checkoutSection) {
      const inputs = checkoutSection.querySelectorAll('input[type="text"], input[type="email"]');
      inputs.forEach(input => {
        input.addEventListener('input', validateCheckoutForm);
        input.addEventListener('change', validateCheckoutForm);
      });

      // Listen to payment method changes
      const paymentOptions = checkoutSection.querySelectorAll('input[name="paymentMethod"]');
      paymentOptions.forEach(option => {
        option.addEventListener('change', validateCheckoutForm);
      });

      // Listen to billing address checkbox
      const sameAsShipping = document.getElementById('sameAsShipping');
      if (sameAsShipping) {
        sameAsShipping.addEventListener('change', validateCheckoutForm);
      }

      // Initial validation
      validateCheckoutForm();
    }

    // Checkout form validation and submission
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Validate shipping form
        const shippingForm = document.getElementById('shippingForm');
        const paymentForm = document.getElementById('paymentForm');
        
        let isValid = true;

        // Check if only digital is selected
        const digitalOnly = document.getElementById('digitalOnly');
        const sizeOptions = document.querySelectorAll('.sizeOption:checked');
        const hasPhysicalItems = sizeOptions.length > 0;
        const onlyDigital = digitalOnly?.checked && !hasPhysicalItems;

        // Check required fields based on order type
        const requiredFields = onlyDigital
          ? ['firstName', 'lastName', 'email'] // Digital only needs name and email
          : ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode']; // Physical needs full address

        requiredFields.forEach(fieldId => {
          const field = document.getElementById(fieldId);
          if (!field || !field.value.trim()) {
            field.classList.add('border-rose-300');
            isValid = false;
          } else {
            field.classList.remove('border-rose-300');
          }
        });
        
        // Validate email format
        const emailField = document.getElementById('email');
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailField.value && !emailPattern.test(emailField.value)) {
          emailField.classList.add('border-rose-300');
          isValid = false;
        }
        
        // Validate payment method selection
        const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (!selectedPaymentMethod) {
          isValid = false;
        }
        
        // Check payment method specific fields
        if (selectedPaymentMethod?.value === 'venmo') {
          // Validate Venmo username
          const venmoUsername = document.getElementById('venmoUsername');
          if (!venmoUsername.value.trim()) {
            venmoUsername.classList.add('border-rose-300');
            isValid = false;
          } else {
            venmoUsername.classList.remove('border-rose-300');
          }
        } else if (selectedPaymentMethod?.value === 'card') {
          // Credit card payment validation is handled by Stripe Checkout
          // No additional validation needed here since Stripe handles payment details securely
        }
        
        if (isValid) {
          // Gather order data
          const orderData = {
            mode: document.getElementById('sumMode')?.textContent || 'new',
            dogName: document.getElementById('sumDog')?.textContent || '',
            background: document.getElementById('sumBG')?.textContent || '',
            uploadedPhotos: uploadedFileNames,
            existingPortrait: window.selectedExistingPortrait || null,
            prints: getPrintSelections(),
            shipping: {
              firstName: document.getElementById('firstName').value,
              lastName: document.getElementById('lastName').value,
              email: document.getElementById('email').value,
              address: document.getElementById('address').value,
              city: document.getElementById('city').value,
              state: document.getElementById('state').value,
              zipCode: document.getElementById('zipCode').value
            },
            payment: {
              method: selectedPaymentMethod.value
            },
            totals: {
              subtotal: parseFloat(document.getElementById('finalSumSubtotal').textContent.replace('$', '')) || 0,
              shipping: document.getElementById('finalSumShipping').textContent === 'FREE' ? 0 : parseFloat(document.getElementById('finalSumShipping').textContent.replace('$', '')) || 0,
              tax: parseFloat(document.getElementById('finalSumTax').textContent.replace('$', '')) || 0,
              total: parseFloat(document.getElementById('finalSumTotal').textContent.replace('$', '')) || 0
            }
          };
          
          // Add payment-specific data
          if (selectedPaymentMethod.value === 'venmo') {
            orderData.payment.venmoUsername = document.getElementById('venmoUsername').value;
          }
          // For credit card payments, billing address is handled by Stripe Checkout
          
          // Submit order
          placeOrderBtn.disabled = true;
          placeOrderBtn.textContent = 'Processing...';
          
          // Check if using credit card payment
          if (selectedPaymentMethod.value === 'card' && typeof stripe !== 'undefined') {
            // Handle credit card payments
            const isTestMode = STRIPE_PUBLISHABLE_KEY.includes('pk_test_');

            if (isTestMode) {
              // For TEST mode: Process payment without redirect
              fetch('/api/process-payment.php', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  amount: orderData.totals.total,
                  orderId: 'pending',
                  dogName: orderData.dogName,
                  customerName: orderData.shipping.firstName + ' ' + orderData.shipping.lastName,
                  email: orderData.shipping.email
                })
              })
              .then(response => response.json())
              .then(paymentResult => {
                if (paymentResult.success) {
                  // Payment successful in test mode, now submit the order
                  return submitOrder(orderData);
                } else {
                  throw new Error('Test payment failed');
                }
              })
              .then(result => {
                if (result.success) {
                  // Show custom success modal
                  showSuccessModal(result.orderId, orderData);

                  // Reset forms
                  shippingForm.reset();
                  paymentForm.reset();
                  uploadedFiles = [];
                  uploadedFileNames = [];

                  // Hide checkout section
                  document.getElementById('checkout').classList.add('hidden');
                } else {
                  throw new Error('Order submission failed');
                }
              })
              .catch(error => {
                console.error('Error:', error);
                alert('Payment processing failed. Please try again.');
                placeOrderBtn.disabled = false;
                placeOrderBtn.textContent = 'Place Order';
              });
            } else {
              // For LIVE mode: Use Stripe Checkout with redirect
              const items = [];
            
            // Get selected print sizes
            const sizeOptions = document.querySelectorAll('.sizeOption:checked');
            sizeOptions.forEach(option => {
              const size = option.value;
              const qtyInput = document.querySelector(`input[name="qty_${size}"]`);
              const quantity = parseInt(qtyInput?.value || 1);
              items.push({ type: size, quantity });
            });
            
            // Check for digital only
            const digitalOnly = document.getElementById('digitalOnly');
            if (digitalOnly?.checked) {
              items.push({ type: 'digital', quantity: 1 });
            }
            
            // Create Stripe checkout session
            fetch('/api/create-checkout-session.php', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                items: items,
                email: orderData.shipping.email,
                dogName: orderData.dogName || 'Portrait'
              })
            })
            .then(response => response.json())
            .then(session => {
              if (session.id) {
                // Save order data to localStorage for after payment
                localStorage.setItem('pendingOrder', JSON.stringify(orderData));
                // Redirect to Stripe Checkout
                return stripe.redirectToCheckout({ sessionId: session.id });
              } else {
                throw new Error('Failed to create checkout session');
              }
            })
            .catch(error => {
              console.error('Stripe error:', error);
              alert('Payment processing failed. Please try again or use Venmo.');
              placeOrderBtn.disabled = false;
              placeOrderBtn.textContent = 'Place Order';
            });
            }
          } else {
            // Original flow for Venmo payments
            submitOrder(orderData).then(result => {
              if (result && result.success) {
                // Show custom success modal
                showSuccessModal(result.orderId, orderData);

                // Reset forms
                shippingForm.reset();
                // paymentForm is a div, not a form, so we reset individual fields
                const cardInputs = document.querySelectorAll('#paymentForm input');
                cardInputs.forEach(input => input.value = '');
                uploadedFiles = [];
                uploadedFileNames = [];

                // Hide checkout section
                document.getElementById('checkout').classList.add('hidden');
              } else {
                console.error('Order submission response:', result);
                alert('Order submission failed. Please try again.');
                placeOrderBtn.disabled = false;
                placeOrderBtn.textContent = 'Place Order';
              }
            }).catch((error) => {
              console.error('Order submission error:', error);
              // Still show success modal if the order might have gone through
              // This handles cases where the server processed the order but response failed
              showSuccessModal('PENDING', orderData);

              // Reset forms
              shippingForm.reset();
              // paymentForm is a div, not a form, so we reset individual fields
              const cardInputs = document.querySelectorAll('#paymentForm input');
              cardInputs.forEach(input => input.value = '');
              uploadedFiles = [];
              uploadedFileNames = [];

              // Hide checkout section
              document.getElementById('checkout').classList.add('hidden');
            });
          }
        } else {
          alert('Please fill in all required fields correctly.');
        }
      });
    }

    // Format card number input (add spaces every 4 digits)
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
      cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '');
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = value;
      });
    }
    
    // Format expiry input (add slash after MM)
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
      expiryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
          value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
      });
    }

    // Payment method switching
    const venmoOption = document.getElementById('venmoOption');
    const cardOption = document.getElementById('cardOption');
    const venmoForm = document.getElementById('venmoForm');
    const cardForm = document.getElementById('paymentForm');
    
    function togglePaymentMethod() {
      if (venmoOption && venmoOption.checked) {
        venmoForm?.classList.remove('hidden');
        cardForm?.classList.add('hidden');
      } else {
        venmoForm?.classList.add('hidden');
        cardForm?.classList.remove('hidden');
      }
    }

    // Initialize on load - card is checked by default
    togglePaymentMethod();
    
    // Add event listeners for payment method change
    venmoOption?.addEventListener('change', togglePaymentMethod);
    cardOption?.addEventListener('change', togglePaymentMethod);
    
    // Billing address checkbox toggle
    const sameAsShippingCheckbox = document.getElementById('sameAsShipping');
    const billingAddressFields = document.getElementById('billingAddressFields');
    
    if (sameAsShippingCheckbox) {
      sameAsShippingCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          billingAddressFields?.classList.add('hidden');
        } else {
          billingAddressFields?.classList.remove('hidden');
        }
      });
    }

    // Existing portrait background selection with preview
    const existingBgList = document.getElementById('existingBgChoices');
    if (existingBgList) {
      existingBgList.addEventListener('click', (e) => {
        const btn = e.target.closest('[role="option"][data-value]');
        if (!btn) return;

        existingBgList.querySelectorAll('[role="option"]').forEach(el => {
          el.setAttribute('aria-checked','false');
        });
        btn.setAttribute('aria-checked','true');

        // Store selected background for existing portraits
        window.selectedExistingBackground = btn.dataset.value;

        // Update preview with new background
        updateBackgroundPreview(btn.dataset.value);

        // Enable continue button
        const continueBtn = document.getElementById('continueFromExistingBgBtn');
        if (continueBtn) {
          continueBtn.disabled = false;
        }
      });
    }

    // Function to update background preview
    function updateBackgroundPreview(backgroundName) {
      const previewArea = document.getElementById('bgPreviewArea');
      const canvas = document.getElementById('bgPreviewCanvas');

      if (!canvas || !window.selectedExistingPortrait) return;

      const ctx = canvas.getContext('2d');

      // Show preview area
      previewArea?.classList.remove('hidden');

      // Create background image path (handle "Surprise" -> "noselect")
      const bgName = backgroundName === 'Surprise' ? 'noselect' : backgroundName.toLowerCase();
      const bgImagePath = `/images/bg-${bgName}-preview.png`;

      // Get the no-background version path (assuming naming convention)
      const portraitFile = window.selectedExistingPortrait.file ||
                          (window.selectedExistingPortrait.url ? window.selectedExistingPortrait.url.split('/').pop() : '');
      const baseName = portraitFile.replace(/\.(jpg|png|jpeg)$/i, '');
      const noBgPath = `/portraits/no-bg/${baseName}-nobg.png`;

      // Load both images and composite them
      const bgImg = new Image();
      const portraitImg = new Image();

      bgImg.onload = function() {
        // Draw background first
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        // Load and draw portrait on top
        portraitImg.onload = function() {
          // Draw portrait at exact size (200x200) to match background
          ctx.drawImage(portraitImg, 0, 0, canvas.width, canvas.height);
        };

        portraitImg.onerror = function() {
          console.log('No-bg version not found');
          // Clear canvas and show error message
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw a light background
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw error message
          ctx.fillStyle = '#6b7280';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Preview not available', canvas.width / 2, canvas.height / 2 - 10);
          ctx.font = '10px sans-serif';
          ctx.fillText('for this portrait', canvas.width / 2, canvas.height / 2 + 5);
        };

        portraitImg.src = noBgPath;
      };

      bgImg.onerror = function() {
        // If background image fails to load, show error
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#666';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Background preview unavailable', canvas.width / 2, canvas.height / 2);
      };

      bgImg.src = bgImagePath;
    }
    
    // Continue button for existing portrait background selection
    const continueExistingBtn = document.getElementById('continueFromExistingBgBtn');
    if (continueExistingBtn) {
      continueExistingBtn.addEventListener('click', () => {
        if (!window.selectedExistingBackground || !window.selectedExistingPortrait) return;
        
        // Show the selected dog's image in the print selection thumbnail
        const thumbnail = document.getElementById('pupThumbnail');
        const caption = document.getElementById('thumbnailCaption');
        if (thumbnail && window.selectedExistingPortrait) {
          thumbnail.src = window.selectedExistingPortrait.previewUrl || window.selectedExistingPortrait.url;
          thumbnail.classList.remove('hidden');
          
          // Show caption indicating background will be updated
          if (caption) {
            caption.classList.remove('hidden');
          }
        }
        
        // Update order summary with selected background
        const sumBG = document.getElementById('sumBG');
        if (sumBG && window.selectedExistingBackground) {
          const bgName = window.selectedExistingBackground;
          sumBG.textContent = bgName === 'no-select' ? 'Surprise Me' : 
                             bgName.charAt(0).toUpperCase() + bgName.slice(1);
        }
        
        // Navigate to prints section
        window.addToHistory('prints');
        prints.classList.remove('hidden');
        prints.scrollIntoView({behavior:'smooth', block:'start'});
      });
    }
    
    // Button click handlers for navigation
    const newPortraitBtn = document.getElementById('newPortraitBtn');
    const existingPortraitBtn = document.getElementById('existingPortraitBtn');
    
    // "No, I need a new portrait" link
    if (newPortraitBtn) {
      newPortraitBtn.addEventListener('click', () => {
        const existingPanel = document.getElementById('existingPanel');
        const newPath = document.getElementById('newPath');
        const sumMode = document.getElementById('sumMode');
        
        // Add to navigation history
        window.addToHistory('newPath');
        
        // Hide all validation errors
        hideAllValidationErrors();
        
        // Show new portrait form, hide existing lookup
        if (existingPanel) existingPanel.classList.add('hidden');
        if (newPath) newPath.classList.remove('hidden');
        
        // Hide prints initially
        prints.classList.add('hidden');
        
        // Update summary
        if (sumMode) sumMode.textContent = 'New portrait';
        
        // Update validation state
        setTimeout(() => updateValidationState(), 100);
      });
    }
    
    // "Yes, I'm here to order prints" link
    if (existingPortraitBtn) {
      existingPortraitBtn.addEventListener('click', () => {
        const existingPanel = document.getElementById('existingPanel');
        const newPath = document.getElementById('newPath');
        const sumMode = document.getElementById('sumMode');
        
        // Add to navigation history
        window.addToHistory('existingPanel');
        
        // Hide all validation errors
        hideAllValidationErrors();
        
        // Show existing lookup, hide new portrait form
        if (existingPanel) existingPanel.classList.remove('hidden');
        if (newPath) newPath.classList.add('hidden');
        
        // Hide prints initially
        prints.classList.add('hidden');
        
        // Update summary
        if (sumMode) sumMode.textContent = 'Existing portrait';
      });
    }
  });

  // Existing portrait handlers
  if (findBtn) findBtn.onclick = async ()=>{
    errEl?.classList.add('hidden');
    resWrap?.classList.add('hidden');
    selectedIndex = -1;
    try{
      const pet = (petEl?.value || '').trim();
      if (!pet) throw new Error('Please enter a dog name.');
      const entries = await lookupPortraitByName(pet);
      renderExistingOptions(pet, entries);
      resWrap?.classList.remove('hidden');
      if (sumDogEl) sumDogEl.textContent = pet;
    }catch(e){
      if (errEl){ errEl.textContent = e.message || 'Something went wrong.'; errEl.classList.remove('hidden'); }
    }
  };

  if (confirmBtn) confirmBtn.onclick = ()=>{
    if (selectedIndex < 0 && currentOptions.length === 1) selectedIndex = 0;
    if (selectedIndex < 0) { alert('Please select the correct portrait first.'); return; }
    
    // Store selected portrait data for later use
    window.selectedExistingPortrait = currentOptions[selectedIndex];
    
    // Check if user wants to change background
    const changeBackgroundCheck = document.getElementById('changeBackgroundCheck');
    const shouldChangeBackground = changeBackgroundCheck && changeBackgroundCheck.checked;
    
    if (shouldChangeBackground) {
      // Navigate to background selection for existing portraits
      const existingBgPanel = document.getElementById('existingBackgroundPanel');
      if (existingBgPanel) {
        window.addToHistory('existingBackgroundPanel');
        existingBgPanel.classList.remove('hidden');
        existingBgPanel.scrollIntoView({behavior:'smooth', block:'start'});

        // Clear any previous background selection
        window.selectedExistingBackground = null;
        const existingBgChoices = document.getElementById('existingBgChoices');
        if (existingBgChoices) {
          existingBgChoices.querySelectorAll('[role="option"]').forEach(el => {
            el.setAttribute('aria-checked','false');
          });
        }

        // Hide preview area initially
        document.getElementById('bgPreviewArea')?.classList.add('hidden');
      }
    } else {
      // Go directly to prints section without background selection
      // Show the selected dog's image in the print selection thumbnail
      const thumbnail = document.getElementById('pupThumbnail');
      const caption = document.getElementById('thumbnailCaption');
      if (thumbnail && window.selectedExistingPortrait) {
        thumbnail.src = window.selectedExistingPortrait.previewUrl || window.selectedExistingPortrait.url;
        thumbnail.classList.remove('hidden');
        
        // Don't show caption since background isn't changing
        if (caption) {
          caption.classList.add('hidden');
        }
      }
      
      // Set default background in summary (keeping existing background)
      const sumBG = document.getElementById('sumBG');
      if (sumBG) {
        sumBG.textContent = 'Original';
      }
      
      // Navigate to prints section
      window.addToHistory('prints');
      prints.classList.remove('hidden');
      prints.scrollIntoView({behavior:'smooth', block:'start'});
    }
  };

  if (notMineBtn) notMineBtn.onclick = ()=>{
    resWrap?.classList.add('hidden');
    errEl?.classList.add('hidden');
    selectedIndex = -1;
    currentOptions = [];
    petEl?.focus();
  };

  // Success Modal Functions
  window.showSuccessModal = function(orderId, orderData) {
    // Populate modal with order details
    document.getElementById('modalOrderId').textContent = orderId;
    document.getElementById('modalDogName').textContent = orderData.dogName || '—';
    document.getElementById('modalTotal').textContent = `$${orderData.totals.total.toFixed(2)}`;
    document.getElementById('modalEmail').textContent = orderData.shipping.email;
    
    // Show Venmo instructions if payment method is Venmo
    const venmoInstructions = document.getElementById('venmoInstructions');
    if (orderData.payment.method === 'venmo') {
      venmoInstructions.classList.remove('hidden');
      document.getElementById('modalVenmoOrderId').textContent = orderId;
    } else {
      venmoInstructions.classList.add('hidden');
    }
    
    // Show modal with fade-in effect
    const modal = document.getElementById('successModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Re-enable place order button for future orders
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = 'Place Order';
    }
  };

  window.closeSuccessModal = function() {
    const modal = document.getElementById('successModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');

    // Navigate back to start
    document.getElementById('start').scrollIntoView({behavior:'smooth', block:'start'});
    navigationHistory = ['start'];

    // Clear all form data
    document.getElementById('newForm')?.reset();
    document.getElementById('printForm')?.reset();
    document.getElementById('shippingForm')?.reset();
    // paymentForm is a div, not a form, so we reset individual fields
    const paymentInputs = document.querySelectorAll('#paymentForm input');
    paymentInputs.forEach(input => input.value = '');

    // Reset order summary
    document.getElementById('sumDog').textContent = '—';
    document.getElementById('sumBG').textContent = '—';
    document.getElementById('sumSubtotal').textContent = '$0';
    document.getElementById('sumTax').textContent = '$0';
    document.getElementById('sumShip').textContent = SHIPPING_COST === 0 ? 'FREE' : `$${SHIPPING_COST.toFixed(2)}`;
    document.getElementById('sumTotal').textContent = '$0';
    
    // Hide prints section
    document.getElementById('prints').classList.add('hidden');
  };

  // Modal handlers (minimal JS for data attributes)
  document.addEventListener('click', function(e) {
    if (e.target.matches('[data-modal-toggle]')) {
      const modalId = e.target.getAttribute('data-modal-target');
      const modal = document.getElementById(modalId);
      modal.classList.toggle('hidden');
      modal.classList.toggle('flex');
    }
    if (e.target.matches('[data-modal-hide]')) {
      const modalId = e.target.getAttribute('data-modal-hide');
      document.getElementById(modalId).classList.add('hidden');
      document.getElementById(modalId).classList.remove('flex');
    }
  });

  // Contact Form Handler
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const submitButton = this.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;

      // Disable button and show loading state
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';

      const formData = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        message: document.getElementById('contactMessage').value
      };

      try {
        const response = await fetch('/api/send-contact.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
          // Show success message
          alert('Thank you for your message! We will get back to you soon.');

          // Reset form
          contactForm.reset();

          // Close modal
          const contactModal = document.getElementById('contactModal');
          if (contactModal) {
            contactModal.classList.add('hidden');
            contactModal.classList.remove('flex');
          }
        } else {
          alert(result.error || 'Failed to send message. Please try again.');
        }
      } catch (error) {
        console.error('Contact form error:', error);
        alert('Failed to send message. Please try again later.');
      } finally {
        // Re-enable button
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
      }
    });
  }
