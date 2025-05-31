/**
 * Water Level Management API Routes
 * This module contains all API endpoints for water level data management
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * Sets up water level CSV management routes
 * @param {Express.Application} app - The Express application instance
 * @param {Object} options - Configuration options
 */
function setupWaterLevelRoutes(app, options = {}) {
    const { fs_module, path_module, data_path } = options;
    
    // Use provided modules or defaults
    const fs_default = fs_module || fs;
    const path_default = path_module || path;
      // Use custom data path if provided, otherwise use default path
    const dataDirectory = data_path || path_default.join(__dirname, '../data/waterlevels');
      // Ensure the data directory exists
    try {
        if (!fs_default.existsSync(dataDirectory)) {
            fs_default.mkdirSync(dataDirectory, { recursive: true });
        }
    } catch (error) {
        // Will attempt to create directory on first write operation
    }
    
    // Helper function to get file path based on filename
    const getWaterLevelsPath = (filename = 'waterlevels.csv') => {
        // Sanitize filename to prevent directory traversal attacks
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        return path_default.join(dataDirectory, sanitizedFilename);
    };    // Helper function to ensure CSV file exists with headers
    const ensureCSVExists = (filePath) => {
        try {
            // Make sure directory exists
            const dirPath = path_default.dirname(filePath);
            if (!fs_default.existsSync(dirPath)) {
                fs_default.mkdirSync(dirPath, { recursive: true });
            }
            
            // Create file with headers if it doesn't exist
            if (!fs_default.existsSync(filePath)) {
                fs_default.writeFileSync(filePath, 'timestamp,actual_water_level,required_water_level\n');
            }        } catch (err) {
            throw new Error(`Failed to create/access CSV file: ${err.message}`);
        }
    };
    
    // Water level CSV management routes initialized
      // 1. Write water level data to CSV (with custom filename support)
    app.post('/api/writeWaterLevel', (req, res) => {
        try {
            const { timestamp, actual_water_level, required_water_level, filename } = req.body;

                if (!timestamp) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Missing timestamp' 
                });
            }
            
            if (typeof actual_water_level !== 'number') {
                return res.status(400).json({ 
                    success: false, 
                    message: `Invalid actual_water_level: must be a number, got ${typeof actual_water_level}` 
                });
            }
            
            if (typeof required_water_level !== 'number') {
                return res.status(400).json({ 
                    success: false, 
                    message: `Invalid required_water_level: must be a number, got ${typeof required_water_level}` 
                });
            }

            // Get file path (use custom filename if provided)
            const waterLevelsCsvPath = getWaterLevelsPath(filename);
            
            // Ensure CSV file exists with headers
            ensureCSVExists(waterLevelsCsvPath);

            // Create data row
            const newLine = `${timestamp},${actual_water_level},${required_water_level}\n`;
            
            // Append to CSV file
            fs_default.appendFileSync(waterLevelsCsvPath, newLine);
            
            res.status(201).json({ 
                success: true, 
                message: 'Water level data recorded successfully',
                filename: path_default.basename(waterLevelsCsvPath)
            });        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    });

    // 2. Read all water level data from CSV (with custom filename support)
    app.get('/api/readWaterLevels', (req, res) => {
        try {
            // Get filename from query parameter
            const { filename } = req.query;
            const waterLevelsCsvPath = getWaterLevelsPath(filename);
            
            if (!fs_default.existsSync(waterLevelsCsvPath)) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Water level data file not found',
                    filename: path_default.basename(waterLevelsCsvPath)
                });
            }
            
            const results = [];
            const fileContent = fs_default.readFileSync(waterLevelsCsvPath, 'utf8');
            const lines = fileContent.split('\n');
            
            // Skip header line and process data lines
            if (lines.length > 1) {
                const headers = lines[0].split(',');
                
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim() === '') continue;
                    
                    const values = lines[i].split(',');
                    const entry = {};
                    
                    for (let j = 0; j < headers.length; j++) {
                        const key = headers[j].trim();
                        const value = values[j] ? values[j].trim() : '';
                        
                        if (key === 'timestamp') {
                            entry[key] = value;
                        } else {
                            entry[key] = parseFloat(value);
                        }
                    }
                    
                    results.push(entry);
                }
            }
            
            res.status(200).json({ 
                success: true, 
                waterLevels: results,
                filename: path_default.basename(waterLevelsCsvPath)
            });        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Failed to read water level data' 
            });
        }
    });

    // 3. Clear all water level data from CSV (with custom filename support)
    app.post('/api/clearWaterLevels', (req, res) => {
        try {
            const { filename } = req.body;
            const waterLevelsCsvPath = getWaterLevelsPath(filename);
            
            // Write only headers to the file
            fs_default.writeFileSync(waterLevelsCsvPath, 'timestamp,actual_water_level,required_water_level\n');
            
            res.status(200).json({ 
                success: true, 
                message: 'Water level data cleared successfully',
                filename: path_default.basename(waterLevelsCsvPath)
            });
        } catch (error) {
            console.error('Error clearing water level data:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    });

    // 4. Download the water levels CSV file (with custom filename support)
    app.get('/api/downloadWaterLevels', (req, res) => {
        try {
            const { filename } = req.query;
            const waterLevelsCsvPath = getWaterLevelsPath(filename);
            
            if (!fs_default.existsSync(waterLevelsCsvPath)) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Water level data file not found',
                    filename: path_default.basename(waterLevelsCsvPath)
                });
            }
            
            const downloadFilename = path_default.basename(waterLevelsCsvPath);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${downloadFilename}`);
            
            const fileStream = fs_default.createReadStream(waterLevelsCsvPath);
            fileStream.pipe(res);
        } catch (error) {
            console.error('Error downloading water level data:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    });

    // 5. List all available water level files
    app.get('/api/listWaterLevelFiles', (req, res) => {
        try {
            const files = fs_default.readdirSync(dataDirectory)
                .filter(file => file.endsWith('.csv'))
                .map(file => {
                    const filePath = path_default.join(dataDirectory, file);
                    const stats = fs_default.statSync(filePath);
                    return {
                        filename: file,
                        size: stats.size,
                        modified: stats.mtime,
                        created: stats.birthtime
                    };
                });
            
            res.status(200).json({
                success: true,
                files: files
            });
        } catch (error) {
            console.error('Error listing water level files:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to list files'
            });
        }
    });

    // 6. Delete a specific water level file
    app.delete('/api/deleteWaterLevelFile', (req, res) => {
        try {
            const { filename } = req.body;
            
            if (!filename || filename === 'waterlevels.csv') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete default file or filename not provided'
                });
            }
            
            const waterLevelsCsvPath = getWaterLevelsPath(filename);
            
            if (!fs_default.existsSync(waterLevelsCsvPath)) {
                return res.status(404).json({
                    success: false,
                    message: 'File not found'
                });
            }
            
            fs_default.unlinkSync(waterLevelsCsvPath);
            
            res.status(200).json({
                success: true,
                message: 'File deleted successfully',
                filename: filename
            });
        } catch (error) {
            console.error('Error deleting water level file:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete file'
            });
        }
    });
}

module.exports = setupWaterLevelRoutes;
