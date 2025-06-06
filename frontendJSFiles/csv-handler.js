/**
 * CSV Data Handler for Water Level Measurements
 * This module provides functions for interacting with water level CSV data from the frontend.
 */

// Variable to track if recording is active
let isRecording = false;
let recordingInterval = null;
const DEFAULT_INTERVAL = 1000; // Default to 1 second between readings
let dataPointCounter = 0; // Counter for data points instead of using timestamps

/**
 * Generate a CSV filename based on the selected tide and session timestamp
 * @returns {string} Formatted filename
 */
function generateCsvFilename() {
    // Get the selected tide name and instance timestamp from localStorage
    const selectedTideName = localStorage.getItem('selectedTideName') || 'default';
    const instance = localStorage.getItem('instance') || new Date().toISOString();
    
    // Clean up the instance string to make it filename-friendly
    const cleanInstance = instance.replace(/:/g, '-').replace(/\s/g, '_');
    
    return `${selectedTideName}_${cleanInstance}.csv`;
}

/**
 * Reset the data point counter to 0
 */
function resetCounter() {
    dataPointCounter = 0;
}

/**
 * Get the current counter value and increment it
 * @returns {number} Current counter value before increment
 */
function getAndIncrementCounter() {
    return dataPointCounter++;
}

/**
 * Start recording water level data to CSV
 * @param {number} interval - The interval in milliseconds between data points
 * @param {Function} onSuccess - Optional callback when recording starts successfully
 * @param {Function} onError - Optional callback when an error occurs
 * @returns {Promise<Object>} Status of the operation
 */
export function startRecording(interval = DEFAULT_INTERVAL, onSuccess = null, onError = null) {
    if (isRecording) {
        const message = 'Already recording water level data';
        if (onError) onError(new Error(message));
        return Promise.resolve({ success: false, message });
    }
    
    return new Promise((resolve, reject) => {
        try {
            // Note: Counter is not reset here anymore to maintain continuous numbering
            
            // Verify that pmVars is initialized
            if (!window.pmVars) {
                console.warn('pmVars not initialized, attempting to proceed with default values');
            }
              const filename = generateCsvFilename();
              
            // Store the current recording filename in localStorage for later use when downloading
            localStorage.setItem('currentRecordingFilename', filename);
            
            // Create initial record to initialize the CSV file
            recordDataPoint(filename)
                .then(result => {
                    if (result.success) {
                        isRecording = true;
                          // Set up interval for continuous recording
                        recordingInterval = setInterval(() => {
                            recordDataPoint(filename).catch(() => {
                                // Silent catch to avoid console errors
                            });
                        }, interval);
                        
                        const response = { 
                            success: true, 
                            message: 'Water level recording started', 
                            filename: filename 
                        };
                        
                        if (onSuccess) onSuccess(response);
                        resolve(response);
                    } else {
                        if (onError) onError(new Error(result.message));
                        reject(new Error(result.message));
                    }                })                .catch(err => {
                    const errorMsg = 'Failed to start recording: ' + err.message;
                    if (onError) onError(new Error(errorMsg));
                    reject(new Error(errorMsg));
                });
        } catch (error) {
            const errorMsg = 'Error setting up recording: ' + error.message;
            if (onError) onError(new Error(errorMsg));
            reject(new Error(errorMsg));
        }
    });
}

/**
 * Stop recording water level data
 * @param {Function} onSuccess - Optional callback when stopping is successful
 * @param {Function} onError - Optional callback when an error occurs
 * @returns {Promise<Object>} Status of the operation
 */
export function stopRecording(onSuccess = null, onError = null) {
    return new Promise((resolve, reject) => {
        try {
            if (!isRecording) {
                const message = 'Not currently recording';
                if (onError) onError(new Error(message));
                resolve({ success: false, message });
                return;
            }
            
            // Clear the recording interval
            if (recordingInterval) {
                clearInterval(recordingInterval);
                recordingInterval = null;
            }
            
            isRecording = false;
            
            const response = { 
                success: true, 
                message: 'Water level recording stopped' 
            };
            
            if (onSuccess) onSuccess(response);
            resolve(response);
        } catch (error) {
            const errorMsg = 'Error stopping recording: ' + error.message;
            if (onError) onError(new Error(errorMsg));
            reject(new Error(errorMsg));
        }
    });
}

/**
 * Record a single data point to the CSV file
 * @param {string} filename - The CSV filename to write to
 * @returns {Promise<Object>} Status of the operation
 */
export function recordDataPoint(filename = null) {
    return new Promise((resolve, reject) => {
        try {
            // Use the provided filename or generate one
            const csvFilename = filename || generateCsvFilename();
            
            // Get current water level values with better error handling
            let actualWaterLevel = 0;
            let requiredWaterLevel = 0;
            
            if (window.pmVars) {
                // Ensure we have valid numeric values
                actualWaterLevel = typeof window.pmVars.mainoutput === 'number' ? 
                    window.pmVars.mainoutput : 
                    parseFloat(window.pmVars.mainoutput || '0');
                    
                requiredWaterLevel = typeof window.pmVars.cum_sineinput === 'number' ? 
                    window.pmVars.cum_sineinput : 
                    parseFloat(window.pmVars.cum_sineinput || '0');
                    
                // Handle NaN values
                if (isNaN(actualWaterLevel)) actualWaterLevel = 0;
                if (isNaN(requiredWaterLevel)) requiredWaterLevel = 0;
            }
            
            // Get counter value as timestamp
            const counter = getAndIncrementCounter();
              // Make API request to write the data point
            fetch('/api/writeWaterLevel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    timestamp: counter.toString(),
                    actual_water_level: actualWaterLevel,
                    required_water_level: requiredWaterLevel,
                    filename: csvFilename
                })
            })
            .then(response => response.json())            .then(data => {
                if (data.success) {
                    resolve({
                        success: true,
                        message: 'Data point recorded',
                        counter,
                        actualWaterLevel,
                        requiredWaterLevel,
                        filename: csvFilename
                    });                } else {
                    reject(new Error(data.message || 'Failed to record data point'));
                }
            })
            .catch(error => {
                reject(new Error('Network error: ' + error.message));
            });
        } catch (error) {
            reject(new Error('Error recording data point: ' + error.message));
        }
    });
}

/**
 * Download the recorded CSV data
 * @param {string} customFilename - Optional custom filename for downloading
 * @returns {Promise<Object>} Status of the operation
 */
export function downloadCsvData(customFilename = null) {
    return new Promise((resolve, reject) => {
        try {
            // Get the ACTUAL filename used for recording (this is what exists on server)
            const actualFilename = localStorage.getItem('currentRecordingFilename') || generateCsvFilename();
            
            // Create download URL with the actual server filename
            const downloadUrl = `/api/downloadWaterLevels?filename=${encodeURIComponent(actualFilename)}`;
            
            // Use custom filename for the browser download if provided
            const displayFilename = customFilename || actualFilename;
            
            // Create a link element and trigger the download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = displayFilename; // This is what the browser will save it as
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            resolve({
                success: true,
                message: 'CSV download initiated',
                filename: displayFilename
            });
        } catch (error) {
            reject(new Error('Error downloading CSV data: ' + error.message));
        }
    });
}

/**
 * List all available CSV files
 * @returns {Promise<Object>} List of available files
 */
export function listCsvFiles() {
    return new Promise((resolve, reject) => {
        fetch('/api/listWaterLevelFiles')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    resolve({
                        success: true,
                        files: data.files
                    });
                } else {
                    reject(new Error(data.message || 'Failed to list files'));
                }
            })
            .catch(error => {
                reject(new Error('Network error: ' + error.message));
            });
    });
}

/**
 * Check if recording is currently active
 * @returns {boolean} True if recording, false otherwise
 */
export function isCurrentlyRecording() {
    return isRecording;
}
export function initializeCsvHandlers() {
    // Ensure we clean up properly when the page unloads
    window.addEventListener('beforeunload', () => {
        if (isRecording) {
            stopRecording();
        }
    });
    
    // console.log('CSV data handlers initialized');
    return { success: true };
}

// Export all the functions
export default {
    startRecording,
    stopRecording,
    recordDataPoint,
    downloadCsvData,
    listCsvFiles,
    isCurrentlyRecording,
    initializeCsvHandlers,
    // getKolkataTimestamp,
    generateCsvFilename
};

// Make CSV handler functions globally accessible for browser console
if (typeof window !== 'undefined') {
    window.csvHandler = {
        startRecording,
        stopRecording,
        recordDataPoint,
        downloadCsvData,
        listCsvFiles,
        isCurrentlyRecording,
        initializeCsvHandlers,
        generateCsvFilename,
        resetCounter,
        getAndIncrementCounter
    };
    
    // Also make individual functions available for convenience
    window.startRecording = startRecording;
    window.stopRecording = stopRecording;
    window.downloadCsvData = downloadCsvData;
    window.listCsvFiles = listCsvFiles;
    window.isCurrentlyRecording = isCurrentlyRecording;
    
    // console.log('CSV handler functions made globally available');
}