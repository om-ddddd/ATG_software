import html2canvas from "./node_modules/html2canvas/dist/html2canvas.esm.js";

// Placeholder comment - this is removed since the enhanced capture screenshot function is now in the DOMContentLoaded event handler

// Configuration variables
//const AUTO_SAVE_INTERVAL = 1000; // 10 seconds default, can be adjusted as needed

// Hook to the DOM content loaded event
document.addEventListener('DOMContentLoaded', () => {
  // Get UI elements
  const saveBtn = document.getElementById('save_btn');
  const printBtn = document.getElementById('print_btn');
  const autoSaveCheckbox = document.getElementById('autosave_checkbox');
  const osc = document.getElementById('oscilloscope');
  autoSaveCheckbox.checked = true; // Ensure checkbox is unchecked by default
  
  // Variable to store the interval ID for auto-save feature
  let autoSaveInterval = osc.getAttribute('capacity') || 707; // Default to 10 seconds if not set
  
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
  
  // Configure auto-save functionality
  if (autoSaveCheckbox) {
    autoSaveCheckbox.addEventListener('change', () => {
      if (autoSaveCheckbox.checked) {
        // Start auto-saving at the specified interval
        autoSaveInterval = setInterval(() => {
          console.log('Auto-saving screenshot...');
          captureScreenshot(false); // Pass false to indicate it's an auto-save
        }, AUTO_SAVE_INTERVAL);
        console.log(`Auto save enabled (every ${AUTO_SAVE_INTERVAL/1000} seconds)`);
      } else {
        // Stop auto-saving
        clearInterval(autoSaveInterval);
        console.log('Auto save disabled');
      }
    });
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
      
      // For manual saves, open in new window
      if (isManualSave) {
        const newWindow = window.open();
        newWindow.document.write(`<img src="${imgData}" alt="Screenshot" style="max-width: 100%">`);
      }

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
});
