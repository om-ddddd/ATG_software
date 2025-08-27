/**
 * User Management API Routes
 * This module contains all API endpoints for user management
 */

const fs = require('fs-extra');
const path = require('path');
const JSON5 = require('json5');

/**
 * Sets up user management routes
 * @param {Express.Application} app - The Express application instance
 * @param {Object} options - Configuration options
 */
function setupUserRoutes(app, options = {}) {
    const { fs_module, path_module, json5_module } = options;
    
    // Use provided modules or defaults
    const fs_default = fs_module || fs;
    const path_default = path_module || path;
    const JSON5_default = json5_module || JSON5;
    
 //   console.log("User management routes initialized");
    
    // User management endpoint: Change username or password
    app.post('/api/changeUser', (req, res) => {
        try {
            const { userType, newUserName, currentPassword, newPassword } = req.body;
            const usersPath = path_default.join(__dirname, 'users.json');

            // Read the users.json file
            const usersData = JSON5_default.parse(fs_default.readFileSync(usersPath, 'utf8'));

            // Verify the current password
            if (!usersData[userType] || usersData[userType].password !== currentPassword) {
                return res.status(401).json({ success: false, message: 'Current password is incorrect' });
            }

            // Update username if provided
            if (newUserName && newUserName !== usersData[userType].username) {
                usersData[userType].username = newUserName;
            }

            // Update password if provided
            if (newPassword && newPassword.length >= 3) {
                usersData[userType].password = newPassword;
            } else if (newPassword) {
                return res.status(400).json({ success: false, message: 'Password must be at least 3 characters' });
            }

            // Save the updated user data
            fs_default.writeFileSync(usersPath, JSON.stringify(usersData, null, 2), 'utf8');

            res.status(200).json({ success: true, message: 'Credentials updated successfully' });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ success: false, message: 'Error updating user information' });
        }
    });
    
    // Add more user management routes as needed
    // For example:
    // - GET /api/users - Get all users
    // - POST /api/createUser - Create a new user
    // - DELETE /api/deleteUser - Delete a user
}

module.exports = setupUserRoutes;
