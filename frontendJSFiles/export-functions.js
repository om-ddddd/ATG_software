import html2canvas from "../node_modules/html2canvas/dist/html2canvas.esm.js";
export function initializeExportFunctions() {
  const saveBtn = document.getElementById('save_btn');
  const printBtn = document.getElementById('print_btn');
  function generateFilename() {
    const timestamp = new Date().toISOString()
      .replace(/T/, '_')
      .replace(/\..+/, '')
      .replace(/:/g, '-');
    return `screenshot_${timestamp}.png`;
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
  } else {
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
