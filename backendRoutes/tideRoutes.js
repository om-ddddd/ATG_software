/**
 * Tide Management Routes
 * This module sets up REST API endpoints for managing tide data
 */

module.exports = function setupTideRoutes(app, options) {
    const fs = options.fs_module;
    const path = options.path_module;
    const JSON5 = options.json5_module;
    const tidePath = path.join(__dirname, 'tide.json');
    
    // 1. Create a new tide
    app.post('/api/createTide', (req, res) => {
        try {
            const { name, range, offset } = req.body;

            if (!name || typeof range !== 'number' || typeof offset !== 'number') {
                return res.status(400).json({ success: false, message: 'Invalid tide data' });
            }

            const tidesData = fs.existsSync(tidePath)
                ? JSON5.parse(fs.readFileSync(tidePath, 'utf8'))
                : [];

            // Check for duplicate tide name
            if (tidesData.some(tide => tide.name === name)) {
                return res.status(409).json({ success: false, message: 'Tide with this name already exists' });
            }

            tidesData.push({ name, range, offset });
            fs.writeFileSync(tidePath, JSON.stringify(tidesData, null, 2), 'utf8');

            res.status(201).json({ success: true, message: 'Tide created successfully' });
        } catch (error) {
            console.error('Error creating tide:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });

    // 2. Get all tides
    app.get('/api/getAllTides', (req, res) => {
        try {
            const tidesData = fs.existsSync(tidePath)
                ? JSON5.parse(fs.readFileSync(tidePath, 'utf8'))
                : [];

            res.status(200).json({ success: true, tides: tidesData });
        } catch (error) {
            console.error('Error reading tides:', error);
            res.status(500).json({ success: false, message: 'Failed to read tide data' });
        }
    });

    // 3. Modify a tide
    app.post('/api/modifyTide', (req, res) => {
        try {
            const { name, newRange, newOffset } = req.body;

            if (!name || typeof newRange !== 'number' || typeof newOffset !== 'number') {
                return res.status(400).json({ success: false, message: 'Invalid input' });
            }

            const tidesData = fs.existsSync(tidePath)
                ? JSON5.parse(fs.readFileSync(tidePath, 'utf8'))
                : [];

            const index = tidesData.findIndex(tide => tide.name === name);

            if (index === -1) {
                return res.status(404).json({ success: false, message: 'Tide not found' });
            }

            tidesData[index].range = newRange;
            tidesData[index].offset = newOffset;

            fs.writeFileSync(tidePath, JSON.stringify(tidesData, null, 2), 'utf8');

            res.status(200).json({ success: true, message: 'Tide updated successfully' });
        } catch (error) {
            console.error('Error modifying tide:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });
    
    // 4. Delete a tide
    app.post('/api/deleteTide', (req, res) => {
        try {
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ success: false, message: 'Tide name is required' });
            }

            const tidesData = fs.existsSync(tidePath)
                ? JSON5.parse(fs.readFileSync(tidePath, 'utf8'))
                : [];

            const updatedTides = tidesData.filter(tide => tide.name !== name);

            if (updatedTides.length === tidesData.length) {
                return res.status(404).json({ success: false, message: 'Tide not found' });
            }

            fs.writeFileSync(tidePath, JSON.stringify(updatedTides, null, 2), 'utf8');

            res.status(200).json({ success: true, message: 'Tide deleted successfully' });
        } catch (error) {
            console.error('Error deleting tide:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });
};