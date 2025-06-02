import html2canvas from "../node_modules/html2canvas/dist/html2canvas.esm.js";
import { downloadCsvData } from './csv-handler.js';
import { downloadScreenshotOnDemand } from './screenshot-handler.js';
export function initializeExportFunctions() {
  const saveBtn = document.getElementById('save_btn');
  const printBtn = document.getElementById('print_btn');
  const saveCsvBtn = document.getElementById('save_btn_csv');  
  function generateFilename(extension = 'png') {
  // Get selected tide name from localStorage
  const selectedTideName = localStorage.getItem('selectedTideName') || 'default'; 
  // Generate a new timestamp in Kolkata timezone at the time of saving
  const now = new Date();
  // Format the date and time in Kolkata timezone using Intl.DateTimeFormat
  const dateOptions = { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false // Use 24-hour format
  };
  // Format the date using Intl API with Kolkata timezone
  const kolkataFormatter = new Intl.DateTimeFormat('en-IN', dateOptions);
  const formattedParts = kolkataFormatter.formatToParts(now);
  // Extract date parts and construct the formatted string (YYYY-MM-DD HH:MM:SS)
  const dateParts = {};
  formattedParts.forEach(part => {
      dateParts[part.type] = part.value;
  });
  
  const timestamp = 
      `${dateParts.year}-${dateParts.month}-${dateParts.day}_${dateParts.hour}-${dateParts.minute}-${dateParts.second}`;
  
  // Create filename with both tide name and timestamp
  return `${selectedTideName}_${timestamp}.${extension}`;
}


  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      // captureScreenshot();
    });
  } 
  if (saveCsvBtn) {
    saveCsvBtn.addEventListener('click', () => {
      downloadWaterLevelData();
    });
  }
  // function captureScreenshot() {
  //   try {
  //     // Generate a custom filename for the screenshot using our existing function
  //     const screenshotFilename = generateFilename('png');
      
  //     // Use the screenshot-handler.js function to capture and download the screenshot
  //     downloadScreenshotOnDemand(screenshotFilename)
  //       .then(result => {
  //         // Provide feedback that screenshot was taken
  //         const saveBtn = document.getElementById('save_btn');
  //         if (saveBtn) {
  //           const originalText = saveBtn.textContent;
  //           saveBtn.textContent = 'Downloaded!';
  //           saveBtn.disabled = true;
            
  //           // Reset button after short delay
  //           setTimeout(() => {
  //             saveBtn.textContent = originalText;
  //             saveBtn.disabled = false;
  //           }, 2000);
  //         }
  //       })
  //       .catch(error => {
  //         console.error('Error capturing screenshot:', error);
  //         // Show error feedback to user
  //         alert('Failed to capture screenshot. Please try again.');
  //       });
  //   } catch (error) {
  //     console.error('Failed to capture screenshot:', error);
  //     alert('Failed to capture screenshot. Please try again.');
  //   }
  // } 
  
  
  function downloadWaterLevelData() {
    try {
      // Get selected tide name for user feedback
      const selectedTideName = localStorage.getItem('selectedTideName') || 'default';
      
      // Generate a custom CSV filename for the download
      const csvFilename = generateFilename('csv');
      
      // Use the csv-handler.js downloadCsvData function to download the actual file
      // but save it with our custom name
      downloadCsvData(csvFilename)
        .then(result => {
          // Provide subtle feedback that download started (e.g., button text change, etc.)
          const saveCsvBtn = document.getElementById('save_btn_csv');
          if (saveCsvBtn) {
            const originalText = saveCsvBtn.textContent;
            saveCsvBtn.textContent = 'Downloaded!';
            saveCsvBtn.disabled = true;
            
            // Reset button after short delay
            setTimeout(() => {
              saveCsvBtn.textContent = originalText;
              saveCsvBtn.disabled = false;
            }, 2000);
          }
        })
        .catch(error => {
          console.error('Error downloading CSV data:', error);
          // Show error feedback to user
          alert(`Failed to download data for ${selectedTideName}. Please try again.`);
        });
    } catch (error) {
      console.error('Failed to download CSV data:', error);
      alert('Failed to download data. Please try again.');
    }
  }
}
    // const element = document.getElementById('main_tab');
    // if (!element) {
    //   return;
    // }
    // const options = {
    //   allowTaint: true,
    //   useCORS: true,
    //   scrollX: 0,
    //   scrollY: 0,
    //   windowWidth: document.documentElement.scrollWidth,
    //   windowHeight: document.documentElement.scrollHeight,
    //   scale: window.devicePixelRatio || 1,
    // };    html2canvas(element, options).then(canvas => {
    //   const imgData = canvas.toDataURL('image/png');
    //   const link = document.createElement('a');
    //   link.href = imgData;link.download = generateFilename('png');
    //   link.click();
    // }).catch(error => {
    //   console.error('Error capturing screenshot:', error);
    // });