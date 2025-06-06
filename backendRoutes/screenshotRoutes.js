/**
 * Screenshot Management API Routes
 * This module contains all API endpoints for screenshot capture and management
 * Modified to use hardcoded element selection - frontend only sends filename
 */

const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const screenshot = require('screenshot-desktop');
const { createCanvas, loadImage } = require('canvas');

/**
 * Sets up screenshot management routes
 * @param {Express.Application} app - The Express application instance
 * @param {Object} options - Configuration options
 */
function setupScreenshotRoutes(app, options = {}) {
    const { fs_module, path_module, data_path, server_port } = options;
    
    // Use provided modules or defaults
    const fs_default = fs_module || fs;
    const path_default = path_module || path;
    
    // Use custom data path if provided, otherwise use default path
    const dataDirectory = data_path || path_default.join(__dirname, '../data/screenshots');
    
    // Ensure the data directory exists
    try {
        if (!fs_default.existsSync(dataDirectory)) {
            fs_default.mkdirSync(dataDirectory, { recursive: true });
        }
    } catch (error) {
        // Will attempt to create directory on first write operation
    }
      // HARDCODED CONFIGURATION - Edit these values as needed
    const SCREENSHOT_CONFIG = {
        // Hardcoded bounding box for capturing specific area
        // These coordinates define the area to capture from the active window
        captureArea: {
            x: 250,          // Left position (adjust as needed)
            y: 150,          // Top position (adjust as needed)
            width: 800,      // Width of area to capture (adjust as needed)
            height: 600      // Height of area to capture (adjust as needed)
        },
        
        // Screenshot area name (for logging and filenames)
        areaName: 'main_content',
        
        // Screenshot options
        options: {
            format: 'png',
            timeout: 30000
        }
    };
    
    // Helper function to get file path based on filename
    const getScreenshotPath = (filename = 'screenshot.png') => {
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        return path_default.join(dataDirectory, sanitizedFilename);
    };
    
    // Helper function to validate area coordinates
    const validateArea = (area, windowSize) => {
        const maxWidth = windowSize.width;
        const maxHeight = windowSize.height;
        
        return {
            x: Math.max(0, Math.min(area.x || 0, maxWidth - 1)),
            y: Math.max(0, Math.min(area.y || 0, maxHeight - 1)),
            width: Math.max(1, Math.min(area.width || maxWidth, maxWidth - (area.x || 0))),
            height: Math.max(1, Math.min(area.height || maxHeight, maxHeight - (area.y || 0)))
        };
    };
    
    // Helper function to generate default filename with timestamp
    const generateDefaultFilename = (extension = 'png', prefix = 'screenshot') => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return `${prefix}_${timestamp}.${extension}`;
    };
    
    // Helper function to validate filename
    const validateFilename = (filename, extension = 'png') => {
        if (!filename) {
            return generateDefaultFilename(extension);
        }
        
        const sanitized = filename
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .replace(/_{2,}/g, '_');
        
        const hasExtension = sanitized.toLowerCase().endsWith(`.${extension}`);
        return hasExtension ? sanitized : `${sanitized}.${extension}`;
    };
    
    // Helper function to format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
      // Core screenshot capture function using screenshot-desktop with hardcoded bounding box
    const captureScreenshot = async () => {
        try {
            // console.log('Capturing screenshot of current window with hardcoded bounding box');
            
            // Capture the entire screen
            const imgBuffer = await screenshot({ format: 'png' });
            
            // Load the image into canvas for cropping
            const image = await loadImage(imgBuffer);
            
            // Create canvas with dimensions for the cropped area
            const canvas = createCanvas(SCREENSHOT_CONFIG.captureArea.width, SCREENSHOT_CONFIG.captureArea.height);
            const ctx = canvas.getContext('2d');
            
            // Draw only the region specified by captureArea
            ctx.drawImage(
                image, 
                SCREENSHOT_CONFIG.captureArea.x, 
                SCREENSHOT_CONFIG.captureArea.y, 
                SCREENSHOT_CONFIG.captureArea.width, 
                SCREENSHOT_CONFIG.captureArea.height,
                0, 
                0, 
                SCREENSHOT_CONFIG.captureArea.width, 
                SCREENSHOT_CONFIG.captureArea.height
            );
            
            // Convert canvas to buffer and then to base64
            const screenshotBase64 = canvas.toBuffer('image/png').toString('base64');
            
            return {
                screenshot: screenshotBase64,
                validatedArea: SCREENSHOT_CONFIG.captureArea,
                captureInfo: {
                    areaName: SCREENSHOT_CONFIG.areaName,
                    captureArea: SCREENSHOT_CONFIG.captureArea,
                    timestamp: new Date().toISOString()
                }
            };
            
        } catch (error) {
            console.error('Error capturing screenshot:', error);
            throw new Error(`Screenshot capture failed: ${error.message}`);
        }
    };      // 1. Save screenshot directly to backend (Simplified - only filename needed)
    app.post('/api/saveScreenshotToBackend', async (req, res) => {
        try {
            const { filename } = req.body;
            
            // Use the port passed from ApplicationServer
            const port = server_port || req.app.get('port') || process.env.PORT || 3000;
            
            // Capture screenshot using hardcoded configuration
            const result = await captureScreenshot();
            
            // Generate final filename
            const areaSuffix = `_${SCREENSHOT_CONFIG.areaName}`;
            const defaultFilename = generateDefaultFilename('png', `backend_screenshot${areaSuffix}`);
            const finalFilename = validateFilename(filename || defaultFilename, 'png');
            const screenshotPath = getScreenshotPath(finalFilename);
            
            // Save screenshot to backend storage
            const imageBuffer = Buffer.from(result.screenshot, 'base64');
            fs_default.writeFileSync(screenshotPath, imageBuffer);
              // Log the save operation
            // console.log(`[${new Date().toISOString()}] Screenshot saved to backend: ${finalFilename} (area: ${SCREENSHOT_CONFIG.areaName}) by user: om-ddddd`);
            
            res.status(201).json({
                success: true,
                message: 'Screenshot saved to backend successfully',
                filename: finalFilename,
                savedAt: new Date().toISOString(),
                metadata: {
                    capturedArea: result.validatedArea,
                    captureInfo: result.captureInfo,
                    user: 'om-ddddd',
                    url: `http://localhost:${port}`,
                    fileSize: imageBuffer.length,
                    fileSizeFormatted: formatFileSize(imageBuffer.length),
                    storageLocation: 'backend'
                }
            });
            
        } catch (error) {
            console.error('Backend screenshot save error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to save screenshot to backend',
                details: error.message 
            });
        }
    });      // 2. Capture screenshot for frontend download (Simplified - only filename needed)
    app.post('/api/captureScreenshotForDownload', async (req, res) => {
        try {
            const { filename } = req.body;
            
            // Use the port passed from ApplicationServer
            const port = server_port || req.app.get('port') || process.env.PORT || 3000;
            
            // Capture screenshot using hardcoded configuration
            const result = await captureScreenshot();
            
            // Generate suggested filename
            const areaSuffix = `_${SCREENSHOT_CONFIG.areaName}`;
            const defaultFilename = generateDefaultFilename('png', `frontend_screenshot${areaSuffix}`);
            const suggestedFilename = validateFilename(filename || defaultFilename, 'png');
            
            // Log the capture operation
            // console.log(`[${new Date().toISOString()}] Screenshot captured for frontend download (area: ${SCREENSHOT_CONFIG.areaName}) by user: om-ddddd`);
            
            // Return screenshot data for frontend download dialog
            res.status(200).json({
                success: true,
                message: 'Screenshot captured successfully for download',
                filename: suggestedFilename,
                data: result.screenshot,
                mimeType: 'image/png',                capturedAt: new Date().toISOString(),
                metadata: {
                    capturedArea: result.validatedArea,
                    elementInfo: result.captureInfo,
                    user: 'om-ddddd',
                    url: `http://localhost:${port}`,
                    dataSize: result.screenshot.length,
                    storageLocation: 'frontend'
                }
            });
            
        } catch (error) {
            console.error('Frontend screenshot capture error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to capture screenshot for download',
                details: error.message 
            });
        }
    });
    
    // 3. Download screenshot file from backend storage
    app.get('/api/downloadScreenshot', (req, res) => {
        try {
            const { filename } = req.query;
            
            if (!filename) {
                return res.status(400).json({
                    success: false,
                    message: 'filename parameter is required'
                });
            }
            
            const screenshotPath = getScreenshotPath(filename);
            
            if (!fs_default.existsSync(screenshotPath)) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Screenshot file not found',
                    filename: filename
                });
            }
            
            const stats = fs_default.statSync(screenshotPath);
            const downloadFilename = path_default.basename(screenshotPath);
            
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
            res.setHeader('X-Filename', downloadFilename);
            res.setHeader('X-File-Size', stats.size.toString());
            res.setHeader('X-File-Size-Formatted', formatFileSize(stats.size));
            
            const fileStream = fs_default.createReadStream(screenshotPath);
            fileStream.pipe(res);
            
            // Log download
            // console.log(`[${new Date().toISOString()}] Screenshot downloaded: ${downloadFilename} by user: om-ddddd`);
            
        } catch (error) {
            console.error('Error downloading screenshot:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    });
    
    // 4. List all available screenshot files
    app.get('/api/listScreenshots', (req, res) => {
        try {
            const files = fs_default.readdirSync(dataDirectory)
                .filter(file => file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg'))
                .map(file => {
                    const filePath = path_default.join(dataDirectory, file);
                    const stats = fs_default.statSync(filePath);
                    return {
                        filename: file,
                        size: stats.size,
                        sizeFormatted: formatFileSize(stats.size),
                        modified: stats.mtime,
                        created: stats.birthtime,
                        extension: path_default.extname(file).toLowerCase(),
                        type: file.includes('backend_') ? 'backend' : 'frontend'
                    };
                })
                .sort((a, b) => new Date(b.modified) - new Date(a.modified));
            
            res.status(200).json({
                success: true,
                message: `Found ${files.length} screenshot files`,
                files: files,
                totalFiles: files.length,
                backendFiles: files.filter(f => f.type === 'backend').length,
                frontendFiles: files.filter(f => f.type === 'frontend').length
            });
            
        } catch (error) {
            console.error('Error listing screenshot files:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to list screenshot files'
            });
        }
    });
    
    // 5. Delete a specific screenshot file
    app.delete('/api/deleteScreenshot', (req, res) => {
        try {
            const { filename } = req.body;
            
            if (!filename) {
                return res.status(400).json({
                    success: false,
                    message: 'filename is required'
                });
            }
            
            const screenshotPath = getScreenshotPath(filename);
            
            if (!fs_default.existsSync(screenshotPath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Screenshot file not found'
                });
            }
            
            fs_default.unlinkSync(screenshotPath);
            
            // console.log(`[${new Date().toISOString()}] Screenshot deleted: ${filename} by user: om-ddddd`);
            
            res.status(200).json({
                success: true,
                message: 'Screenshot deleted successfully',
                filename: filename
            });
        } catch (error) {
            console.error('Error deleting screenshot file:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete screenshot file'
            });
        }
    });
}

module.exports = setupScreenshotRoutes;