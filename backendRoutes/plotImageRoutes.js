/**
 * Plot Image Generation API Routes
 * This module contains API endpoints for generating plot images from CSV data
 * Reads CSV files with water level data and generates plot images using Canvas
 */

const fs = require('fs-extra');
const path = require('path');
const { createCanvas } = require('canvas');
const csv = require('csv-parser');

/**
 * Sets up plot image generation routes
 * @param {Express.Application} app - The Express application instance
 * @param {Object} options - Configuration options
 */
function setupPlotImageRoutes(app, options = {}) {
    const { fs_module, path_module, data_path, server_port } = options;
    
    // Use provided modules or defaults
    const fs_default = fs_module || fs;
    const path_default = path_module || path;
    
    // Use custom data paths if provided, otherwise use default paths
   // Change this line in plotImageRoutes.js
const csvDirectory = path_default.join(options.data_path || path_default.join(require('os').homedir(), 'ATG', 'csv'));
const imagesDirectory = path_default.join(require('os').homedir(), 'ATG', 'plots'); // Store plot images in ~/ATG/plots
    
    // Ensure directories exist
    try {
        if (!fs_default.existsSync(csvDirectory)) {
            fs_default.mkdirSync(csvDirectory, { recursive: true });
        }
        if (!fs_default.existsSync(imagesDirectory)) {
            fs_default.mkdirSync(imagesDirectory, { recursive: true });
        }
    } catch (error) {
        console.log('Directory creation will be attempted on first operation');
    }

    // Plot configuration
    const PLOT_CONFIG = {
        // Canvas dimensions
        width: 1200,
        height: 800,
        
        // Plot area (leaving space for axes and labels)
        plotArea: {
            left: 80,
            top: 60,
            right: 1140,
            bottom: 720
        },
        
        // Colors
        colors: {
            background: '#ffffff',
            grid: '#e0e0e0',
            axes: '#333333',
            actualLevel: '#2196F3',    // Blue for actual water level
            requiredLevel: '#FF5722',  // Red for required water level
            text: '#333333'
        },
        
        // Y-axis configuration
        yAxis: {
            min: 0,
            max: 120,
            steps: 12  // Creates grid lines every 10 units
        }
    };

    /**
     * Read and parse CSV data
     * @param {string} csvFilePath - Path to CSV file
     * @returns {Promise<Array>} Array of data points
     */
    function readCSVData(csvFilePath) {
        return new Promise((resolve, reject) => {
            const data = [];
            
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (row) => {
                    // Parse the data - expecting columns: timestamp, actual_water_level, required_water_level
                    const dataPoint = {
                        timestamp: row.timestamp || row.Timestamp,
                        actualLevel: parseFloat(row.actual_water_level || row.ActualWaterLevel || 0),
                        requiredLevel: parseFloat(row.required_water_level || row.RequiredWaterLevel || 0),
                        rowNumber: data.length + 1
                    };
                    
                    // Only add valid data points
                    if (!isNaN(dataPoint.actualLevel) || !isNaN(dataPoint.requiredLevel)) {
                        data.push(dataPoint);
                    }
                })
                .on('end', () => {
                    resolve(data);
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }

    /**
     * Generate plot image from data
     * @param {Array} data - Array of data points
     * @param {string} title - Plot title
     * @returns {Canvas} Canvas object with the plot
     */
    function generatePlotImage(data, title = 'Water Level Monitoring') {
        const canvas = createCanvas(PLOT_CONFIG.width, PLOT_CONFIG.height);
        const ctx = canvas.getContext('2d');
        
        // Clear canvas with background color
        ctx.fillStyle = PLOT_CONFIG.colors.background;
        ctx.fillRect(0, 0, PLOT_CONFIG.width, PLOT_CONFIG.height);
        
        const plotArea = PLOT_CONFIG.plotArea;
        const plotWidth = plotArea.right - plotArea.left;
        const plotHeight = plotArea.bottom - plotArea.top;
        
        // Draw title
        ctx.fillStyle = PLOT_CONFIG.colors.text;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, PLOT_CONFIG.width / 2, 35);
        
        // Draw axes
        ctx.strokeStyle = PLOT_CONFIG.colors.axes;
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Y-axis
        ctx.moveTo(plotArea.left, plotArea.top);
        ctx.lineTo(plotArea.left, plotArea.bottom);
        // X-axis
        ctx.moveTo(plotArea.left, plotArea.bottom);
        ctx.lineTo(plotArea.right, plotArea.bottom);
        ctx.stroke();
        
        // Draw grid lines and Y-axis labels
        ctx.strokeStyle = PLOT_CONFIG.colors.grid;
        ctx.lineWidth = 1;
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillStyle = PLOT_CONFIG.colors.text;
        
        for (let i = 0; i <= PLOT_CONFIG.yAxis.steps; i++) {
            const yValue = (i / PLOT_CONFIG.yAxis.steps) * PLOT_CONFIG.yAxis.max;
            const yPos = plotArea.bottom - (i / PLOT_CONFIG.yAxis.steps) * plotHeight;
            
            // Grid line
            ctx.beginPath();
            ctx.moveTo(plotArea.left, yPos);
            ctx.lineTo(plotArea.right, yPos);
            ctx.stroke();
            
            // Label
            ctx.fillText(yValue.toFixed(0), plotArea.left - 10, yPos + 4);
        }
        
        // Y-axis label
        ctx.save();
        ctx.translate(25, PLOT_CONFIG.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Water Level', 0, 0);
        ctx.restore();
        
        // X-axis label
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Row Number', PLOT_CONFIG.width / 2, PLOT_CONFIG.height - 15);
        
        if (data.length === 0) {
            // No data message
            ctx.font = '18px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#666666';
            ctx.fillText('No data available', PLOT_CONFIG.width / 2, PLOT_CONFIG.height / 2);
            return canvas;
        }
        
        // Calculate scaling factors
        const maxRowNumber = data.length;
        const xScale = plotWidth / Math.max(maxRowNumber - 1, 1);
        const yScale = plotHeight / PLOT_CONFIG.yAxis.max;
        
        // Draw X-axis labels (row numbers)
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = PLOT_CONFIG.colors.text;
        const labelStep = Math.max(1, Math.floor(maxRowNumber / 10)); // Show ~10 labels
        
        for (let i = 0; i < data.length; i += labelStep) {
            const xPos = plotArea.left + i * xScale;
            ctx.fillText((i + 1).toString(), xPos, plotArea.bottom + 15);
        }
        
        // Draw data lines
        function drawDataLine(dataKey, color, label) {
            const validPoints = data.filter(d => !isNaN(d[dataKey]) && d[dataKey] !== null);
            if (validPoints.length < 2) return;
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            validPoints.forEach((point, index) => {
                const originalIndex = data.indexOf(point);
                const x = plotArea.left + originalIndex * xScale;
                const y = plotArea.bottom - (point[dataKey] / PLOT_CONFIG.yAxis.max) * plotHeight;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // Draw points
            ctx.fillStyle = color;
            validPoints.forEach((point) => {
                const originalIndex = data.indexOf(point);
                const x = plotArea.left + originalIndex * xScale;
                const y = plotArea.bottom - (point[dataKey] / PLOT_CONFIG.yAxis.max) * plotHeight;
                
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
        
        // Draw actual water level
        drawDataLine('actualLevel', PLOT_CONFIG.colors.actualLevel, 'Actual Level');
        
        // Draw required water level
        drawDataLine('requiredLevel', PLOT_CONFIG.colors.requiredLevel, 'Required Level');
        
        // Draw legend
        const legendY = plotArea.top + 20;
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        
        // Actual level legend
        ctx.fillStyle = PLOT_CONFIG.colors.actualLevel;
        ctx.fillRect(plotArea.right - 200, legendY, 20, 3);
        ctx.fillStyle = PLOT_CONFIG.colors.text;
        ctx.fillText('Actual Water Level', plotArea.right - 175, legendY + 5);
        
        // Required level legend
        ctx.fillStyle = PLOT_CONFIG.colors.requiredLevel;
        ctx.fillRect(plotArea.right - 200, legendY + 25, 20, 3);
        ctx.fillStyle = PLOT_CONFIG.colors.text;
        ctx.fillText('Required Water Level', plotArea.right - 175, legendY + 30);
        
        return canvas;
    }

    // Route 1: Generate plot from CSV file
    app.post('/api/plots/generate', async (req, res) => {
        try {
            const { csvFileName, title, outputFileName } = req.body;
            
            if (!csvFileName) {
                return res.status(400).json({
                    success: false,
                    message: 'CSV filename is required'
                });
            }
            
            const csvFilePath = path_default.join(csvDirectory, csvFileName);
            const outputFile = outputFileName || `plot_${Date.now()}.png`;
            const imagePath = path_default.join(imagesDirectory, outputFile);
            
            // Check if CSV file exists
            if (!fs_default.existsSync(csvFilePath)) {
                return res.status(404).json({
                    success: false,
                    message: 'CSV file not found'
                });
            }
            
            // Read CSV data
            const data = await readCSVData(csvFilePath);
            
            // Generate plot
            const canvas = generatePlotImage(data, title || `Plot from ${csvFileName}`);
            
            // Save image
            const buffer = canvas.toBuffer('image/png');
            fs_default.writeFileSync(imagePath, buffer);
            
            res.json({
                success: true,
                message: 'Plot generated successfully',
                data: {
                    fileName: outputFile,
                    imagePath: imagePath,
                    dataPoints: data.length,
                    generatedAt: new Date().toISOString()
                }
            });
            
        } catch (error) {
            console.error('Error generating plot:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate plot',
                error: error.message
            });
        }
    });

    // Route 2: List available CSV files
    app.get('/api/plots/csv-files', (req, res) => {
        try {
            const files = fs_default.readdirSync(csvDirectory)
                .filter(file => file.toLowerCase().endsWith('.csv'))
                .map(file => ({
                    name: file,
                    path: path_default.join(csvDirectory, file),
                    stats: fs_default.statSync(path_default.join(csvDirectory, file))
                }));
            
            res.json({
                success: true,
                data: files
            });
            
        } catch (error) {
            console.error('Error listing CSV files:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to list CSV files',
                error: error.message
            });
        }
    });

    // Route 3: List generated plot images
    app.get('/api/plots/images', (req, res) => {
        try {
            const files = fs_default.readdirSync(imagesDirectory)
                .filter(file => file.toLowerCase().match(/\.(png|jpg|jpeg)$/))
                .map(file => ({
                    name: file,
                    path: path_default.join(imagesDirectory, file),
                    stats: fs_default.statSync(path_default.join(imagesDirectory, file))
                }));
            
            res.json({
                success: true,
                data: files
            });
            
        } catch (error) {
            console.error('Error listing plot images:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to list plot images',
                error: error.message
            });
        }
    });

    // Route 4: Download plot image
    app.get('/api/plots/download/:fileName', (req, res) => {
        try {
            const fileName = req.params.fileName;
            const imagePath = path_default.join(imagesDirectory, fileName);
            
            if (!fs_default.existsSync(imagePath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Plot image not found'
                });
            }
            
            res.download(imagePath, fileName, (err) => {
                if (err) {
                    console.error('Error downloading plot image:', err);
                    res.status(500).json({
                        success: false,
                        message: 'Failed to download plot image',
                        error: err.message
                    });
                }
            });
            
        } catch (error) {
            console.error('Error downloading plot image:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to download plot image',
                error: error.message
            });
        }
    });

    // Route 5: Delete plot image
    app.delete('/api/plots/delete/:fileName', (req, res) => {
        try {
            const fileName = req.params.fileName;
            const imagePath = path_default.join(imagesDirectory, fileName);
            
            if (!fs_default.existsSync(imagePath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Plot image not found'
                });
            }
            
            fs_default.unlinkSync(imagePath);
            
            res.json({
                success: true,
                message: 'Plot image deleted successfully',
                data: {
                    fileName: fileName,
                    deletedAt: new Date().toISOString()
                }
            });
            
        } catch (error) {
            console.error('Error deleting plot image:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete plot image',
                error: error.message
            });
        }
    });

    // Route 6: Preview CSV data (first 10 rows)
    app.get('/api/plots/preview/:csvFileName', async (req, res) => {
        try {
            const csvFileName = req.params.csvFileName;
            const csvFilePath = path_default.join(csvDirectory, csvFileName);
            
            if (!fs_default.existsSync(csvFilePath)) {
                return res.status(404).json({
                    success: false,
                    message: 'CSV file not found'
                });
            }
            
            const data = await readCSVData(csvFilePath);
            const preview = data.slice(0, 10); // First 10 rows
            
            res.json({
                success: true,
                data: {
                    fileName: csvFileName,
                    totalRows: data.length,
                    preview: preview,
                    columns: data.length > 0 ? Object.keys(data[0]) : []
                }
            });
            
        } catch (error) {
            console.error('Error previewing CSV:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to preview CSV file',
                error: error.message
            });
        }
    });

    console.log('Plot image generation routes registered successfully');
}

module.exports = setupPlotImageRoutes;
