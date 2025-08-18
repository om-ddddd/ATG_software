/**
 * Super Admin Module
 * Handles authentication and form management for Super Admin functionality
 */

class SuperAdmin {
    constructor() {
        this.isAuthenticated = false;
        this.hardcodedPassword = "admin123"; // Hardcoded password for now
        this.init();
    }

    init() {
        this.createModalHTML();
        this.attachEventListeners();
    }

    createModalHTML() {
        // Create the modal overlay and forms
        const modalHTML = `
            <!-- Super Admin Password Modal -->
            <div id="super-admin-overlay" class="super-admin-overlay">
                <div class="super-admin-modal">
                    <button class="super-admin-close" id="super-admin-close">&times;</button>
                    
                    <!-- Password Form -->
                    <div id="super-admin-password-form">
                        <h2>🔐 Super Admin Access</h2>
                        <form id="password-form">
                            <div class="super-admin-form-group">
                                <label for="admin-password">Enter Password:</label>
                                <input type="password" id="admin-password" placeholder="Enter super admin password" required>
                                <div class="super-admin-help-text">Enter the administrator password to access system settings</div>
                            </div>
                            <div class="super-admin-buttons">
                                <button type="submit" class="super-admin-btn super-admin-btn-primary">Login</button>
                                <button type="button" class="super-admin-btn super-admin-btn-secondary" id="cancel-password">Cancel</button>
                            </div>
                            <div id="password-error" class="super-admin-error" style="display: none;"></div>
                        </form>
                    </div>

                    <!-- Settings Form -->
                    <div id="super-admin-settings-form" style="display: none;">
                        <h2>⚙️ Super Admin Settings</h2>
                        
                        <!-- Current Values Display -->
                        <div class="super-admin-current-values">
                            <h3>Current Values:</h3>
                            <div class="value-item">
                                <span class="value-label">Multiplication Factor:</span>
                                <span class="value-number" id="current-multiplication">--</span>
                            </div>
                            <div class="value-item">
                                <span class="value-label">Forward:</span>
                                <span class="value-number" id="current-forward">--</span>
                            </div>
                            <div class="value-item">
                                <span class="value-label">Forward Derivative:</span>
                                <span class="value-number" id="current-forward-derivative">--</span>
                            </div>
                        </div>

                        <form id="settings-form" class="super-admin-form">
                            <div class="super-admin-form-group">
                                <label for="multiplication-factor">Multiplication Factor:</label>
                                <input type="number" id="multiplication-factor" step="0.01" placeholder="Enter multiplication factor" required>
                                <div class="super-admin-help-text">Scaling factor for signal multiplication</div>
                            </div>
                            
                            <div class="super-admin-form-row">
                                <div class="super-admin-form-group">
                                    <label for="forward">Forward:</label>
                                    <input type="number" id="forward" step="0.01" placeholder="Enter forward value" required>
                                    <div class="super-admin-help-text">Forward calculation parameter</div>
                                </div>
                                
                                <div class="super-admin-form-group">
                                    <label for="forward-derivative">Forward Derivative:</label>
                                    <input type="number" id="forward-derivative" step="0.01" placeholder="Enter forward derivative" required>
                                    <div class="super-admin-help-text">Forward derivative parameter</div>
                                </div>
                            </div>
                            
                            <div class="super-admin-buttons">
                                <button type="submit" class="super-admin-btn super-admin-btn-primary">Save Settings</button>
                                <button type="button" class="super-admin-btn super-admin-btn-secondary" id="reset-form">Reset</button>
                                <button type="button" class="super-admin-btn super-admin-btn-danger" id="logout-admin">Logout</button>
                            </div>
                            <div id="settings-message" style="display: none;"></div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Append to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    attachEventListeners() {
        // Find Super Admin button in menubar
        const superAdminBtn = this.findSuperAdminButton();
        if (superAdminBtn) {
            superAdminBtn.addEventListener('click', () => this.openModal());
        }

        // Modal event listeners
        const overlay = document.getElementById('super-admin-overlay');
        const closeBtn = document.getElementById('super-admin-close');
        const passwordForm = document.getElementById('password-form');
        const settingsForm = document.getElementById('settings-form');
        const cancelBtn = document.getElementById('cancel-password');
        const logoutBtn = document.getElementById('logout-admin');
        const resetBtn = document.getElementById('reset-form');

        // Close modal events
        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal();
        });

        // Form submissions
        passwordForm.addEventListener('submit', (e) => this.handlePasswordSubmit(e));
        settingsForm.addEventListener('submit', (e) => this.handleSettingsSubmit(e));

        // Other buttons
        logoutBtn.addEventListener('click', () => this.logout());
        resetBtn.addEventListener('click', () => this.resetForm());

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('show')) {
                this.closeModal();
            }
        });
    }

    findSuperAdminButton() {
        // First try to find by ID
        let button = document.getElementById('ma_super_admin');
        if (button) return button;

        // Fallback: Look for the Super Admin button by text content
        const buttons = document.querySelectorAll('button');
        for (let button of buttons) {
            if (button.textContent.trim() === 'Super Admin') {
                return button;
            }
        }
        console.warn('Super Admin button not found in menubar');
        return null;
    }

    openModal() {
        const overlay = document.getElementById('super-admin-overlay');
        overlay.classList.add('show');
        
        if (this.isAuthenticated) {
            this.showSettingsForm();
        } else {
            this.showPasswordForm();
        }
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = overlay.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    closeModal() {
        const overlay = document.getElementById('super-admin-overlay');
        overlay.classList.remove('show');
        this.clearMessages();
        this.clearPasswordField();
    }

    showPasswordForm() {
        document.getElementById('super-admin-password-form').style.display = 'block';
        document.getElementById('super-admin-settings-form').style.display = 'none';
    }

    showSettingsForm() {
        document.getElementById('super-admin-password-form').style.display = 'none';
        document.getElementById('super-admin-settings-form').style.display = 'block';
        this.loadCurrentValues();
    }

    handlePasswordSubmit(e) {
        e.preventDefault();
        const passwordInput = document.getElementById('admin-password');
        const password = passwordInput.value;
        const errorDiv = document.getElementById('password-error');

        if (password === this.hardcodedPassword) {
            this.isAuthenticated = true;
            this.showSettingsForm();
            this.clearMessages();
            console.log('Super Admin authenticated successfully');
        } else {
            this.showError('password-error', 'Invalid password. Please try again.');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    handleSettingsSubmit(e) {
        e.preventDefault();
        
        const multiplicationFactor = parseFloat(document.getElementById('multiplication-factor').value);
        const forward = parseFloat(document.getElementById('forward').value);
        const forwardDerivative = parseFloat(document.getElementById('forward-derivative').value);

        // Validate inputs
        if (isNaN(multiplicationFactor) || isNaN(forward) || isNaN(forwardDerivative)) {
            this.showError('settings-message', 'Please enter valid numeric values for all fields.');
            return;
        }

        // Here you would normally send to backend
        console.log('Settings to save:', {
            multiplicationFactor,
            forward,
            forwardDerivative
        });

        // For now, just show success message
        this.showSuccess('settings-message', 'Settings saved successfully!');
        
        // Update current values display
        this.updateCurrentValuesDisplay(multiplicationFactor, forward, forwardDerivative);

        // Save to backend API
        this.saveToBackend(multiplicationFactor, forward, forwardDerivative);

        // Update PM Variables
        this.updatePMVariables(multiplicationFactor, forward, forwardDerivative);
    }

    loadCurrentValues() {
        // Load current values from backend first, then fall back to pmVars
        this.loadFromBackend()
            .then((backendData) => {
                if (backendData) {
                    // Use backend data
                    this.updateCurrentValuesDisplay(
                        backendData.multiplicationFactor,
                        backendData.forward,
                        backendData.forwardDerivative
                    );
                    
                    // Pre-fill form with backend values
                    document.getElementById('multiplication-factor').value = backendData.multiplicationFactor;
                    document.getElementById('forward').value = backendData.forward;
                    document.getElementById('forward-derivative').value = backendData.forwardDerivative;
                } else {
                    // Fallback to pmVars if backend fails
                    this.loadFromPMVars();
                }
            })
            .catch((error) => {
                console.error('Error loading from backend, falling back to PM variables:', error);
                this.loadFromPMVars();
            });
    }

    loadFromPMVars() {
        // Load current values from pmVars or use defaults
        try {
            if (window.pmVars) {
                // Try to get values from pmVars if available
                const currentMultiplication = window.pmVars.point_95 || 0.95; // Using point_95 as multiplication factor for now
                const currentForward = window.pmVars.forward || 70;
                const currentForwardDerivative = window.pmVars.forward_derivative || 6000;

                this.updateCurrentValuesDisplay(currentMultiplication, currentForward, currentForwardDerivative);
                
                // Pre-fill form with current values
                document.getElementById('multiplication-factor').value = currentMultiplication;
                document.getElementById('forward').value = currentForward;
                document.getElementById('forward-derivative').value = currentForwardDerivative;
            } else {
                this.updateCurrentValuesDisplay('--', '--', '--');
            }
        } catch (error) {
            console.error('Error loading current values:', error);
            this.updateCurrentValuesDisplay('--', '--', '--');
        }
    }

    updateCurrentValuesDisplay(multiplication, forward, forwardDerivative) {
        document.getElementById('current-multiplication').textContent = multiplication;
        document.getElementById('current-forward').textContent = forward;
        document.getElementById('current-forward-derivative').textContent = forwardDerivative;
    }

    resetForm() {
        document.getElementById('settings-form').reset();
        this.loadCurrentValues(); // Reload current values
        this.clearMessages();
    }

    logout() {
        this.isAuthenticated = false;
        this.showPasswordForm();
        this.clearPasswordField();
        this.clearMessages();
        console.log('Super Admin logged out');
    }

    clearPasswordField() {
        const passwordInput = document.getElementById('admin-password');
        if (passwordInput) passwordInput.value = '';
    }

    clearMessages() {
        const errorDiv = document.getElementById('password-error');
        const messageDiv = document.getElementById('settings-message');
        
        if (errorDiv) {
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
        }
        
        if (messageDiv) {
            messageDiv.style.display = 'none';
            messageDiv.textContent = '';
            messageDiv.className = '';
        }
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.className = 'super-admin-error';
            element.style.display = 'block';
        }
    }

    showSuccess(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.className = 'super-admin-success';
            element.style.display = 'block';
        }
    }

    // Future method for backend integration
    async saveToBackend(multiplicationFactor, forward, forwardDerivative) {
        try {
            const response = await fetch('/api/super-admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    multiplicationFactor,
                    forward,
                    forwardDerivative
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Settings saved to backend:', result);
                this.showSuccess('settings-message', 'Settings saved successfully to server!');
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving to backend:', error);
            this.showError('settings-message', 'Failed to save settings to server. Please try again.');
        }
    }

    // Load current settings from backend
    async loadFromBackend() {
        try {
            const response = await fetch('/api/super-admin/settings', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Settings loaded from backend:', result);
                
                if (result.success && result.data) {
                    return result.data;
                }
            } else {
                console.warn('Failed to load settings from backend');
                return null;
            }
        } catch (error) {
            console.error('Error loading from backend:', error);
            return null;
        }
    }

    // Update PM Variables with new values
    updatePMVariables(multiplicationFactor, forward, forwardDerivative) {
        try {
            // Check if pmVars is available (from pm-variables.js)
            if (window.pmVars) {
                // Update the PM variables with new values
                window.pmVars.point_95 = multiplicationFactor;
                window.pmVars.forward = forward;
                window.pmVars.forward_derivative = forwardDerivative;
                
                console.log('PM Variables updated:', {
                    point_95: multiplicationFactor,
                    forward: forward,
                    forward_derivative: forwardDerivative
                });
                
                this.showSuccess('settings-message', 'Settings saved and PM variables updated!');
            } else {
                console.warn('PM Variables not available - settings saved to backend only');
            }
        } catch (error) {
            console.error('Error updating PM variables:', error);
            this.showError('settings-message', 'Settings saved to backend, but failed to update PM variables.');
        }
    }

    // Refresh PM Variables from backend (useful for external updates)
    async refreshPMVariablesFromBackend() {
        try {
            const backendData = await this.loadFromBackend();
            if (backendData && window.pmVars) {
                window.pmVars.point_95 = backendData.multiplicationFactor;
                window.pmVars.forward = backendData.forward;
                window.pmVars.forward_derivative = backendData.forwardDerivative;
                
                console.log('PM Variables refreshed from backend:', {
                    point_95: backendData.multiplicationFactor,
                    forward: backendData.forward,
                    forward_derivative: backendData.forwardDerivative
                });
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error refreshing PM variables from backend:', error);
            return false;
        }
    }
}

// Initialize Super Admin when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.superAdmin = new SuperAdmin();
    console.log('Super Admin module initialized');
});

// Export for use in other modules
export { SuperAdmin };
