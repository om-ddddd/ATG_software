import html2canvas from "../node_modules/html2canvas/dist/html2canvas.esm.js";
export function initializeExportFunctions() {
  const saveBtn = document.getElementById('save_btn');
  const printBtn = document.getElementById('print_btn');
 function generateFilename() {
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
  return `${selectedTideName}_${timestamp}.png`;
}
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      captureScreenshot();
    });
  } 

  function captureScreenshot() {
    const element = document.getElementById('main_tab');
    if (!element) {
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
    html2canvas(element, options).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = generateFilename();
      link.click();
    }).catch(error => {
      console.error('Error capturing screenshot:', error);
    });
  }
}
