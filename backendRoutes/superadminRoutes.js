/**
 * Super Admin Routes Module
 * Handles API endpoints for Super Admin settings management
 * Manages three key parameters: multiplication factor, forward, and forward derivative
 */

const path = require('path');

/**
 * Setup Super Admin routes for the Express application
 * @param {Express.Application} app - Express application instance
 * @param {Object} dependencies - Required modules and configurations
 * @param {Object} dependencies.fs_module - File system module
 * @param {Object} dependencies.path_module - Path module
 * @param {Object} dependencies.json5_module - JSON5 module for parsing
 */
function setupSuperAdminRoutes(app, dependencies) {
    const fs = dependencies.fs_module;
    const pathModule = dependencies.path_module;
    const JSON5 = dependencies.json5_module;

    // Super Admin settings file path
    const SUPERADMIN_SETTINGS_FILE = pathModule.join(__dirname, '../backendRoutes/superadmin.json');

    // Default Super Admin settings
    const DEFAULT_SETTINGS = {
        multiplicationFactor: 0.95,
        forward: 70,
        forwardDerivative: 6000,
        lastUpdated: new Date().toISOString(),
        version: "1.0.0"
    };

    /**
     * Ensure the Super Admin settings file exists with default values
     */
    const ensureSettingsFile = async () => {
        try {
            await fs.access(SUPERADMIN_SETTINGS_FILE);
        } catch (error) {
            // File doesn't exist, create it with default settings
            await fs.writeFile(SUPERADMIN_SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
          //  console.log('Created Super Admin settings file with default values');
        }
    };

    /**
     * Read Super Admin settings from file
     */
    const readSettings = async () => {
        try {
            await ensureSettingsFile();
            const data = await fs.readFile(SUPERADMIN_SETTINGS_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading Super Admin settings:', error);
            return DEFAULT_SETTINGS;
        }
    };

    /**
     * Write Super Admin settings to file
     */
    const writeSettings = async (settings) => {
        try {
            // Add metadata
            const settingsWithMetadata = {
                ...settings,
                lastUpdated: new Date().toISOString(),
                version: "1.0.0"
            };

            await fs.writeFile(SUPERADMIN_SETTINGS_FILE, JSON.stringify(settingsWithMetadata, null, 2));
            return settingsWithMetadata;
        } catch (error) {
            console.error('Error writing Super Admin settings:', error);
            throw error;
        }
    };

    /**
     * Validate Super Admin settings input
     */
    const validateSettings = (settings) => {
        const errors = [];

        // Check if required fields exist
        if (settings.multiplicationFactor === undefined || settings.multiplicationFactor === null) {
            errors.push('Multiplication factor is required');
        } else if (typeof settings.multiplicationFactor !== 'number') {
            errors.push('Multiplication factor must be a number');
        }

        if (settings.forward === undefined || settings.forward === null) {
            errors.push('Forward value is required');
        } else if (typeof settings.forward !== 'number') {
            errors.push('Forward value must be a number');
        }

        if (settings.forwardDerivative === undefined || settings.forwardDerivative === null) {
            errors.push('Forward derivative is required');
        } else if (typeof settings.forwardDerivative !== 'number') {
            errors.push('Forward derivative must be a number');
        }

        // Range validations removed - no limits applied
        // Values can be any valid number

        return errors;
    };

    // ==========================================
    // API Routes
    // ==========================================

    /**
     * GET /api/super-admin/settings
     * Retrieve current Super Admin settings
     */
    app.get('/api/super-admin/settings', async (req, res) => {
        try {
            const settings = await readSettings();
            
            res.json({
                success: true,
                data: settings,
                message: 'Super Admin settings retrieved successfully'
            });

           // console.log('Super Admin settings retrieved successfully');
        } catch (error) {
            console.error('Error retrieving Super Admin settings:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve Super Admin settings',
                message: error.message
            });
        }
    });

    /**
     * POST /api/super-admin/settings
     * Update Super Admin settings
     */
    app.post('/api/super-admin/settings', async (req, res) => {
        try {
            const { multiplicationFactor, forward, forwardDerivative } = req.body;

            // Validate input
            const validationErrors = validateSettings({ multiplicationFactor, forward, forwardDerivative });
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: validationErrors
                });
            }

            // Prepare settings object
            const newSettings = {
                multiplicationFactor: parseFloat(multiplicationFactor),
                forward: parseFloat(forward),
                forwardDerivative: parseFloat(forwardDerivative)
            };

            // Save settings
            const savedSettings = await writeSettings(newSettings);

            res.json({
                success: true,
                data: savedSettings,
                message: 'Super Admin settings updated successfully'
            });

           // console.log('Super Admin settings updated:', newSettings);
        } catch (error) {
            console.error('Error updating Super Admin settings:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update Super Admin settings',
                message: error.message
            });
        }
    });

    /**
     * PUT /api/super-admin/settings
     * Update specific Super Admin setting
     */
    app.put('/api/super-admin/settings', async (req, res) => {
        try {
            const currentSettings = await readSettings();
            const updates = req.body;

            // Merge current settings with updates
            const updatedSettings = { ...currentSettings };

            if (updates.multiplicationFactor !== undefined) {
                updatedSettings.multiplicationFactor = parseFloat(updates.multiplicationFactor);
            }
            if (updates.forward !== undefined) {
                updatedSettings.forward = parseFloat(updates.forward);
            }
            if (updates.forwardDerivative !== undefined) {
                updatedSettings.forwardDerivative = parseFloat(updates.forwardDerivative);
            }

            // Validate merged settings
            const validationErrors = validateSettings(updatedSettings);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: validationErrors
                });
            }

            // Save updated settings
            const savedSettings = await writeSettings(updatedSettings);

            res.json({
                success: true,
                data: savedSettings,
                message: 'Super Admin settings updated successfully'
            });

           // console.log('Super Admin settings partially updated:', updates);
        } catch (error) {
            console.error('Error updating Super Admin settings:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update Super Admin settings',
                message: error.message
            });
        }
    });

    /**
     * DELETE /api/super-admin/settings
     * Reset Super Admin settings to defaults
     */
    app.delete('/api/super-admin/settings', async (req, res) => {
        try {
            const resetSettings = await writeSettings(DEFAULT_SETTINGS);

            res.json({
                success: true,
                data: resetSettings,
                message: 'Super Admin settings reset to defaults successfully'
            });

            //console.log('Super Admin settings reset to defaults');
        } catch (error) {
            console.error('Error resetting Super Admin settings:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to reset Super Admin settings',
                message: error.message
            });
        }
    });

    /**
     * GET /api/super-admin/health
     * Health check endpoint for Super Admin service
     */
    app.get('/api/super-admin/health', (req, res) => {
        res.json({
            success: true,
            status: 'healthy',
            service: 'Super Admin API',
            timestamp: new Date().toISOString(),
            endpoints: [
                'GET /api/super-admin/settings',
                'POST /api/super-admin/settings',
                'PUT /api/super-admin/settings',
                'DELETE /api/super-admin/settings',
                'GET /api/super-admin/health'
            ]
        });
    });

    /**
     * GET /api/super-admin/defaults
     * Get default Super Admin settings
     */
    app.get('/api/super-admin/defaults', (req, res) => {
        res.json({
            success: true,
            data: DEFAULT_SETTINGS,
            message: 'Default Super Admin settings retrieved successfully'
        });
    });

   // console.log('Super Admin routes initialized successfully');
   // console.log('Available endpoints:');
    //console.log('  - GET /api/super-admin/settings');
    //console.log('  - POST /api/super-admin/settings');
    //console.log('  - PUT /api/super-admin/settings');
    //console.log('  - DELETE /api/super-admin/settings');
    //console.log('  - GET /api/super-admin/health');
    //console.log('  - GET /api/super-admin/defaults');
}

module.exports = setupSuperAdminRoutes;
