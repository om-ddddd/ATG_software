/**
 * Simple Plot Handler - Essential plot functions only
 * Provides basic plot generation and download functionality
 */

class PlotHandler {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
        this.apiPath = '/api/plots';
    }

    /**
     * Make HTTP request with error handling
     * @param {string} url - Request URL
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} Response data
     */
    async makeRequest(url, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${url}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    /**
     * Generate a plot from CSV file
     * @param {string} csvFileName - Name of the CSV file to plot
     * @param {string} title - Optional plot title
     * @param {string} outputFileName - Optional output filename (if null, uses same name as CSV with .png extension)
     * @returns {Promise<Object>} Generation result
     */
    async createPlot(csvFileName, title = null, outputFileName = null) {
        const payload = { csvFileName };
        if (title) payload.title = title;
        
        // If no outputFileName provided, use same name as CSV but with .png extension
        if (!outputFileName) {
            outputFileName = csvFileName.replace(/\.csv$/i, '.png');
            console.log('Auto-generated plot filename from CSV:', outputFileName);
        }
        
        payload.outputFileName = outputFileName;

        return await this.makeRequest(`${this.apiPath}/generate`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    /**
     * Download a plot image
     * @param {string} fileName - Name of the image file to download
     * @returns {Promise<void>} Downloads file to browser
     */
    async downloadPlot(fileName) {
        const url = `${this.baseUrl}${this.apiPath}/download/${encodeURIComponent(fileName)}`;
        window.open(url, '_blank');
    }
}

// Global instance
const plotHandler = new PlotHandler();

// Simple usage functions

/**
 * Create plot from CSV file
 * @param {string} csvFileName - Name of CSV file
 * @param {string} customName - Optional custom filename for the plot
 */
async function createPlot(csvFileName, customName = null) {
    try {
        console.log('Creating plot...');
        const result = await plotHandler.createPlot(
            csvFileName,
            'Water Level Analysis',
            customName
        );
        console.log('Plot created successfully:', result.data.fileName);
        return result;
    } catch (error) {
        console.error('Failed to create plot:', error.message);
        throw error;
    }
}

/**
 * Download plot image
 * @param {string} fileName - Name of plot image file
 */
async function downloadPlot(fileName) {
    try {
        console.log('Downloading plot:', fileName);
        await plotHandler.downloadPlot(fileName);
        console.log('Download initiated');
    } catch (error) {
        console.error('Failed to download plot:', error.message);
        throw error;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PlotHandler, plotHandler, createPlot, downloadPlot };
}
