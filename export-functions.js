import html2canvas from "./node_modules/html2canvas/dist/html2canvas.esm.js";

// This file handles export functionality like screenshots and printing
// Functions will be initialized when the accept button is clicked

// Function to set up export functionality - will be called from index.js after accept button is clicked
export function initializeExportFunctions() {
  // Get UI elements
  const saveBtn = document.getElementById('save_btn');
  const printBtn = document.getElementById('print_btn');
  const autoSaveCheckbox = document.getElementById('autosave_checkbox');
  const osc = document.getElementById('oscilloscope');
  autoSaveCheckbox.checked = true; // Start with autosave enabled
  
  // Variable to store the interval ID for auto-save feature
  let autoSaveInterval = null;
  
  // Set up file naming with timestamp
  function generateFilename() {
    const timestamp = new Date().toISOString()
      .replace(/T/, '_')
      .replace(/\..+/, '')
      .replace(/:/g, '-');
    return `screenshot_${timestamp}.png`;
  }

  // Configure print functionality
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      console.log('Print button clicked');
      window.print();
    });
  }

  // Configure save button functionality
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      console.log('Save button clicked');
      captureScreenshot(true); // Pass true to indicate it's a manual save
    });
  } else {
    console.error('Element #save_btn not found');
  }
  
  // Function to start autosave timer
  function startAutoSave() {
    // Stop any existing interval
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
    }
    
    // Get oscilloscope capacity and sample rate to calculate auto-save interval
    const capacity = (parseInt(osc?.getAttribute('capacity')) || 100) - 100;
    const sampleRate = parseFloat(osc?.getAttribute('sample-rate')) || 7.09;
    
    // Calculate the time it takes for the oscilloscope to complete one full cycle
    // The formula is (capacity / sample rate) * 1000 to convert to milliseconds
    const cycleTimeMs = Math.max(Math.floor((capacity / sampleRate) * 1000), 5000); // At least 5 seconds
    
    // Start auto-saving at the calculated interval based on oscilloscope cycle time
    autoSaveInterval = setInterval(() => {
      console.log('Auto-saving screenshot...');
      captureScreenshot(false); // Pass false to indicate it's an auto-save
    }, cycleTimeMs);
    
    console.log(`Auto save enabled (every ${cycleTimeMs / 1000} seconds, aligned with oscilloscope cycle)`);
  }
  
  // Function to stop autosave timer
  function stopAutoSave() {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
      autoSaveInterval = null;
      console.log('Auto save disabled');
    }
  }

  // Configure auto-save functionality
  if (autoSaveCheckbox) {
    // Set up the change event listener
    autoSaveCheckbox.addEventListener('change', () => {
      if (autoSaveCheckbox.checked) {
        startAutoSave();
      } else {
        stopAutoSave();
      }
    });
    
    // If checkbox is initially checked, start auto-save immediately
    if (autoSaveCheckbox.checked) {
      startAutoSave();
    }
  }

  // Enhanced screenshot function that accepts a parameter to distinguish between auto and manual saves
  function captureScreenshot(isManualSave = true) {
    const element = document.getElementById('main_tab'); // ✅ Fixed reference

    if (!element) {
      console.error('Element #main_tab not found');
      return;
    }

    const options = {
      allowTaint: true,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
      scale: window.devicePixelRatio || 1,
    };

    // Show loading indicator for manual saves only
    if (isManualSave) {
      console.log('Capturing screenshot, please wait...');
    }

    html2canvas(element, options).then(canvas => {
      const imgData = canvas.toDataURL('image/png');

      // Download the image with timestamp in filename
      const link = document.createElement('a');
      link.href = imgData;
      link.download = generateFilename();
      link.click();
      
      console.log(`Screenshot ${isManualSave ? 'saved' : 'auto-saved'} successfully`);
    }).catch(error => {
      console.error('Error capturing screenshot:', error);
    });
  }
}
