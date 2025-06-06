/**
 * Screenshot Handler Module
 * This module contains utility functions for capturing, saving and downloading screenshots
 * Works with the backend screenshot routes to manage screenshots
 * 
 * Simplified version with direct API calls only - no intervals or automation logic
 */

/**
 * Generate a default filename for screenshots with timestamp
 * @param {string} extension - File extension (default: 'png')
 * @param {string} prefix - Filename prefix (default: 'screenshot')
 * @returns {string} - Generated filename
 */
export function generateScreenshotFilename(extension = 'png', prefix = 'screenshot') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}_${timestamp}.${extension}`;
}

/**
 * Saves a screenshot to the backend using the backend save route
 * Simple function that saves a single screenshot without automation logic
 * @param {string} customFilename - Optional custom filename for the screenshot
 * @param {string} filenamePrefix - Optional prefix for the filename (default: 'screenshot')
 * @param {Function} onSuccess - Optional callback when saving is successful
 * @param {Function} onError - Optional callback when an error occurs
 * @returns {Promise<Object>} Status of the operation
 */
export function saveScreenshotToBackend(customFilename = null, filenamePrefix = 'screenshot', onSuccess = null, onError = null) {
    return new Promise((resolve, reject) => {
        try {
            // Generate filename if not provided
            const filename = customFilename || generateScreenshotFilename('png', filenamePrefix);
            
            // Call the backend to save the screenshot
            fetch('/api/saveScreenshotToBackend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename: filename
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const result = {
                        success: true,
                        message: 'Screenshot saved successfully',
                        filename: data.filename,
                        savedAt: data.savedAt,
                        metadata: data.metadata
                    };
                    
                    if (onSuccess) onSuccess(result);
                    resolve(result);
                } else {
                    const errorMsg = `Failed to save screenshot: ${data.message || 'Unknown error'}`;
                    if (onError) onError(new Error(errorMsg));
                    reject(new Error(errorMsg));
                }
            })
            .catch(error => {
                const errorMsg = `Network error during save: ${error.message}`;
                if (onError) onError(new Error(errorMsg));
                reject(new Error(errorMsg));
            });
        } catch (error) {
            const errorMsg = `Error in saveScreenshot: ${error.message}`;
            if (onError) onError(new Error(errorMsg));
            reject(new Error(errorMsg));
        }
    });
}



/**
 * Captures a screenshot on button press and downloads it
 * Simple function that downloads a screenshot directly to the user's device
 * @param {string} customFilename - Optional custom filename for the screenshot
 * @returns {Promise<Object>} Status of the operation
 */
export function downloadScreenshotOnDemand(customFilename = null) {
    return new Promise((resolve, reject) => {
        try {
            // Generate filename if not provided
            const filename = customFilename || generateScreenshotFilename();
            
            // Use the capture and download API endpoint
            fetch('/api/captureScreenshotForDownload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename: filename
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Create a data URL from the base64 string
                    const dataUrl = `data:${data.mimeType};base64,${data.data}`;
                    
                    // Create a link element and trigger the download
                    const link = document.createElement('a');
                    link.href = dataUrl;
                    link.download = data.filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    resolve({
                        success: true,
                        message: 'Screenshot captured and downloaded successfully',
                        filename: data.filename,
                        capturedAt: data.capturedAt
                    });
                } else {
                    reject(new Error(data.message || 'Failed to capture and download screenshot'));
                }
            })
            .catch(error => {
                reject(new Error(`Network error: ${error.message}`));
            });
        } catch (error) {
            reject(new Error(`Error in downloadOnButtonPress: ${error.message}`));
        }
    });
}

/**
 * Initialize screenshot handlers
 * @returns {Object} Status of initialization
 */
export function initializeScreenshotHandlers() {
    // console.log('Screenshot handlers initialized');
    return { success: true };
}

// Export all the functions
export default {
    saveScreenshotToBackend,
    downloadScreenshotOnDemand,
    generateScreenshotFilename,
    initializeScreenshotHandlers
};