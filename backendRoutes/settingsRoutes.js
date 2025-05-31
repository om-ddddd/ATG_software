/**
 * Settings Management Routes
 * This module provides API endpoints for managing calibration settings
 */

module.exports = function setupSettingsRoutes(app, options) {
    const fs = options.fs_module;
    const path = options.path_module;
    const JSON5 = options.json5_module;
    
    const settingsPath = path.join(__dirname, 'settings.json');

    // 1. Create a new setting
    app.post('/api/createSetting', (req, res) => {
        try {
            const { name, calibrationFactor, offset, fineOffset, kp, ki } = req.body;

            if (!name || typeof calibrationFactor !== 'number' || typeof offset !== 'number' || 
                typeof fineOffset !== 'number' || typeof kp !== 'number' || typeof ki !== 'number') {
                return res.status(400).json({ success: false, message: 'Invalid setting data' });
            }

            const settingsData = fs.existsSync(settingsPath)
                ? JSON5.parse(fs.readFileSync(settingsPath, 'utf8'))
                : [];

            // Check for duplicate setting name
            if (settingsData.some(setting => setting.name === name)) {
                return res.status(409).json({ success: false, message: 'Setting with this name already exists' });
            }

            settingsData.push({ name, calibrationFactor, offset, fineOffset, kp, ki });
            fs.writeFileSync(settingsPath, JSON.stringify(settingsData, null, 2), 'utf8');

            res.status(201).json({ success: true, message: 'Setting created successfully' });
        } catch (error) {
            console.error('Error creating setting:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });

    // 2. Get all settings
    app.get('/api/getAllSettings', (req, res) => {
        try {
            const settingsData = fs.existsSync(settingsPath)
                ? JSON5.parse(fs.readFileSync(settingsPath, 'utf8'))
                : [];

            res.status(200).json({ success: true, settings: settingsData });
        } catch (error) {
            console.error('Error reading settings:', error);
            res.status(500).json({ success: false, message: 'Failed to read settings data' });
        }
    });

    // 3. Modify a setting
    app.post('/api/modifySetting', (req, res) => {
        try {
            const { name, newCalibrationFactor, newOffset, newFineOffset, newKp, newKi } = req.body;

            if (!name || typeof newCalibrationFactor !== 'number' || typeof newOffset !== 'number' || 
                typeof newFineOffset !== 'number' || typeof newKp !== 'number' || typeof newKi !== 'number') {
                return res.status(400).json({ success: false, message: 'Invalid input' });
            }

            const settingsData = fs.existsSync(settingsPath)
                ? JSON5.parse(fs.readFileSync(settingsPath, 'utf8'))
                : [];

            const index = settingsData.findIndex(setting => setting.name === name);

            if (index === -1) {
                return res.status(404).json({ success: false, message: 'Setting not found' });
            }

            settingsData[index].calibrationFactor = newCalibrationFactor;
            settingsData[index].offset = newOffset;
            settingsData[index].fineOffset = newFineOffset;
            settingsData[index].kp = newKp;
            settingsData[index].ki = newKi;

            fs.writeFileSync(settingsPath, JSON.stringify(settingsData, null, 2), 'utf8');

            res.status(200).json({ success: true, message: 'Setting updated successfully' });
        } catch (error) {
            console.error('Error modifying setting:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });

    // 4. Delete a setting
    app.post('/api/deleteSetting', (req, res) => {
        try {
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ success: false, message: 'Setting name is required' });
            }

            const settingsData = fs.existsSync(settingsPath)
                ? JSON5.parse(fs.readFileSync(settingsPath, 'utf8'))
                : [];

            const updatedSettings = settingsData.filter(setting => setting.name !== name);

            if (updatedSettings.length === settingsData.length) {
                return res.status(404).json({ success: false, message: 'Setting not found' });
            }

            fs.writeFileSync(settingsPath, JSON.stringify(updatedSettings, null, 2), 'utf8');

            res.status(200).json({ success: true, message: 'Setting deleted successfully' });
        } catch (error) {
            console.error('Error deleting setting:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });
};