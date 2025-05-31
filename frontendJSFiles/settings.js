/**
 * Settings Management JavaScript
 * This file contains functions for creating, modifying, and deleting settings
 * through API calls to the backend and updates PM variables.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Ensure settings.json exists and is valid before initializing management
    fetch('/api/getAllSettings')
        .then(response => response.json())
        .then(data => {
            // Check if Default setting exists, create it if not
            let hasDefault = false;
            if (data.success && data.settings) {
                hasDefault = data.settings.some(setting => setting.name === 'Default');
            }

            if (!hasDefault) {
                // Create default setting if it doesn't exist
                fetch('/api/createSetting', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: 'Default',
                        calibrationFactor: 1.0,
                        offset: 0.0,
                        fineOffset: 0.0,
                        kp: 0.5,
                        ki: 0.3
                    })
                })
                .then(() => {
                    // After creating default setting, initialize management UI
                    initializeSettingsManagement();
                })
                .catch(error => {
                    console.error('Error creating default setting:', error);
                    initializeSettingsManagement();
                });
            } else {
                // Default setting already exists, proceed with initialization
                initializeSettingsManagement();
            }
        })
        .catch(error => {
            console.error('Error verifying settings data:', error);
            // Handle the error silently - the server will create an empty array if needed
            initializeSettingsManagement();
        });

    // Add settings.js to document header
    const scriptElement = document.createElement('script');
    scriptElement.type = 'module';
    scriptElement.src = './settings.js';
    document.head.appendChild(scriptElement);
    
    // Add settings.css to document header
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = './settings.css';
    document.head.appendChild(linkElement);
});

// Initialize settings management functionality
function initializeSettingsManagement() {
    // Get dialog elements
    const createSettingDialog = document.getElementById('s_create-setting-dialog');
    const modifySettingDialog = document.getElementById('s_modify-setting-dialog');
    const deleteSettingDialog = document.getElementById('s_delete-setting-dialog');
    
    // Get dialog buttons
    const createSettingBtn = document.getElementById('s_create-setting-btn');
    const modifySettingBtn = document.getElementById('s_modify-setting-btn');
    const deleteSettingBtn = document.getElementById('s_delete-setting-btn');
    
    // Get close buttons
    const closeBtns = document.querySelectorAll('.s_close-dialog');
    
    // Set up potentiometer output display
    setupPotOutputDisplay();
    
    // Open dialog event listeners
    if (createSettingBtn) {
        createSettingBtn.addEventListener('click', () => {
            createSettingDialog.style.display = 'block';
        });
    }
    
    if (modifySettingBtn) {
        modifySettingBtn.addEventListener('click', () => {
            populateSettingSelect();
            modifySettingDialog.style.display = 'block';
        });
    }
    
    if (deleteSettingBtn) {
        deleteSettingBtn.addEventListener('click', () => {
            populateSettingSelectForDelete();
            deleteSettingDialog.style.display = 'block';
        });
    }
    
    // Close dialog when clicking on X button
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            createSettingDialog.style.display = 'none';
            modifySettingDialog.style.display = 'none';
            deleteSettingDialog.style.display = 'none';
        });
    });
    
    // Close dialog when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === createSettingDialog) {
            createSettingDialog.style.display = 'none';
        }
        if (event.target === modifySettingDialog) {
            modifySettingDialog.style.display = 'none';
        }
        if (event.target === deleteSettingDialog) {
            deleteSettingDialog.style.display = 'none';
        }
    });
    
    // Form submission handlers
    const createSettingForm = document.getElementById('s_create-setting-form');
    const modifySettingForm = document.getElementById('s_modify-setting-form');
    const deleteSettingForm = document.getElementById('s_delete-setting-form');
    
    if (createSettingForm) {
        createSettingForm.addEventListener('submit', createSetting);
    }
    
    if (modifySettingForm) {
        modifySettingForm.addEventListener('submit', modifySetting);
        
        // When setting selection changes, update the form fields
        const settingSelect = document.getElementById('s_setting-select');
        if (settingSelect) {
            settingSelect.addEventListener('change', updateModifyForm);
        }
    }
    
    if (deleteSettingForm) {
        deleteSettingForm.addEventListener('submit', deleteSetting);
    }
    
    // Setting selection for applying to PM variables
    const settingDropdown = document.getElementById('s_setting-dropdown');
    if (settingDropdown) {
        settingDropdown.addEventListener('change', applySettingToPmVars);
    }
    
    // Load settings on init
    loadSettings();
}

// Set up the potentiometer output display functionality
function setupPotOutputDisplay() {
    const showPotCheckbox = document.getElementById('s_show_pot_output');
    const potOutputDisplay = document.getElementById('s_pot_output_display');
    const potOutputValue = document.getElementById('s_pot_output_value');
    
    // Initially hide the pot output display
    potOutputDisplay.style.display = 'none';
    
    // Toggle visibility of pot output based on checkbox
    showPotCheckbox.addEventListener('change', function() {
        potOutputDisplay.style.display = this.checked ? 'block' : 'none';
        
        if (this.checked) {
            // Start updating pot output value if checkbox is checked
            startPotOutputUpdates();
        }
    });
    
    // Function to update pot output value
    function updatePotOutput() {
        if (window.pmVars && typeof window.pmVars.pot_output !== 'undefined') {
            // Format to 2 decimal places
            potOutputValue.textContent = window.pmVars.pot_output.toFixed(2);
        } else {
            potOutputValue.textContent = 'N/A';
        }
    }
    
    // Start regular updates of pot output value
    function startPotOutputUpdates() {
        // Update immediately
        updatePotOutput();
        
        // Then update every 200ms if the checkbox is checked
        const interval = setInterval(() => {
            if (showPotCheckbox.checked) {
                updatePotOutput();
            } else {
                clearInterval(interval);
            }
        }, 200);
    }
}

// Fetch all settings from the server
function loadSettings() {
    fetch('/api/getAllSettings')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                displaySettings(data.settings);
                updateSettingDropdown(data.settings);
            } else {
                console.error('Failed to load settings:', data.message);
                showSettingNotification('Failed to load settings: ' + data.message, 'warning');
            }
        })
        .catch(error => {
            console.error('Error fetching settings:', error);
            // Don't show error notification on initial page load, but handle quietly
            const settingList = document.getElementById('s_setting-list');
            if (settingList) {
                settingList.innerHTML = '<tr><td colspan="6">No settings available or server error. Create a new setting to get started.</td></tr>';
            }
        });
}

// Display settings in the setting list table
function displaySettings(settings) {
    const settingList = document.getElementById('s_setting-list');
    if (!settingList) return;
    
    // Clear existing list
    settingList.innerHTML = '';
    
    // Create table header
    const headerRow = document.createElement('tr');
    ['Name', 'Calibration Factor', 'Offset', 'Fine Offset', 'Kp', 'Ki'].forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    settingList.appendChild(headerRow);
    
    // Add each setting to the table
    settings.forEach(setting => {
        const row = document.createElement('tr');
        
        // Add special class for Default setting
        if (setting.name === 'Default') {
            row.classList.add('s_default-setting');
        }
        
        // Name cell
        const nameCell = document.createElement('td');
        nameCell.textContent = setting.name;
        row.appendChild(nameCell);
        
        // Calibration Factor cell
        const calibrationFactorCell = document.createElement('td');
        calibrationFactorCell.textContent = setting.calibrationFactor;
        row.appendChild(calibrationFactorCell);
        
        // Offset cell
        const offsetCell = document.createElement('td');
        offsetCell.textContent = setting.offset;
        row.appendChild(offsetCell);
        
        // Fine Offset cell
        const fineOffsetCell = document.createElement('td');
        fineOffsetCell.textContent = setting.fineOffset;
        row.appendChild(fineOffsetCell);
        
        // Kp cell
        const kpCell = document.createElement('td');
        kpCell.textContent = setting.kp;
        row.appendChild(kpCell);
        
        // Ki cell
        const kiCell = document.createElement('td');
        kiCell.textContent = setting.ki;
        row.appendChild(kiCell);
        
        // Add the row to the table
        settingList.appendChild(row);
    });
}

// Update the setting dropdown for applying to PM variables
function updateSettingDropdown(settings) {
    const dropdown = document.getElementById('s_setting-dropdown');
    if (!dropdown) return;
    
    // Clear existing options except the default
    while (dropdown.options.length > 1) {
        dropdown.remove(1);
    }
    
    // Add setting options
    settings.forEach(setting => {
        const option = document.createElement('option');
        option.value = setting.name;
        option.textContent = setting.name;
        dropdown.appendChild(option);
    });
}

// Populate the setting selection dropdown for modification
function populateSettingSelect() {
    fetch('/api/getAllSettings')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const settingSelect = document.getElementById('s_setting-select');
                if (!settingSelect) return;
                
                // Clear existing options
                settingSelect.innerHTML = '';
                
                // Add a default option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select a setting';
                settingSelect.appendChild(defaultOption);
                
                // Add setting options (exclude Default setting from modification)
                data.settings.forEach(setting => {
                    if (setting.name !== 'Default') {
                        const option = document.createElement('option');
                        option.value = setting.name;
                        option.textContent = setting.name;
                        settingSelect.appendChild(option);
                    }
                });
            } else {
                console.error('Failed to load settings for select:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching settings for select:', error);
        });
}

// Populate the setting selection dropdown for deletion
function populateSettingSelectForDelete() {
    fetch('/api/getAllSettings')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const deleteSettingSelect = document.getElementById('s_delete-setting-select');
                if (!deleteSettingSelect) return;
                
                // Clear existing options
                deleteSettingSelect.innerHTML = '';
                
                // Add a default option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select a setting';
                deleteSettingSelect.appendChild(defaultOption);
                
                // Add setting options (exclude Default setting from deletion)
                data.settings.forEach(setting => {
                    if (setting.name !== 'Default') {
                        const option = document.createElement('option');
                        option.value = setting.name;
                        option.textContent = setting.name;
                        deleteSettingSelect.appendChild(option);
                    }
                });
            } else {
                console.error('Failed to load settings for delete:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching settings for delete:', error);
        });
}

// Update the modification form when a setting is selected
function updateModifyForm(event) {
    const selectedSettingName = event.target.value;
    if (!selectedSettingName) return;
    
    fetch('/api/getAllSettings')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const selectedSetting = data.settings.find(setting => setting.name === selectedSettingName);
                if (selectedSetting) {
                    document.getElementById('s_modify-calibration-factor').value = selectedSetting.calibrationFactor;
                    document.getElementById('s_modify-offset').value = selectedSetting.offset;
                    document.getElementById('s_modify-fine-offset').value = selectedSetting.fineOffset;
                    document.getElementById('s_modify-kp').value = selectedSetting.kp;
                    document.getElementById('s_modify-ki').value = selectedSetting.ki;
                }
            } else {
                console.error('Failed to get setting details:', data.message);
            }
        })
        .catch(error => {
            console.error('Error getting setting details:', error);
        });
}

// Apply selected setting to PM variables
function applySettingToPmVars(event) {
    const selectedSettingName = event.target.value;
    if (!selectedSettingName) return;
    
    fetch('/api/getAllSettings')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const selectedSetting = data.settings.find(setting => setting.name === selectedSettingName);
                if (selectedSetting && window.pmVars) {
                    // Apply setting values to PM variables
                    window.pmVars.main_gain = selectedSetting.calibrationFactor;
                    window.pmVars.offset = selectedSetting.offset;
                    window.pmVars.fine_offset = selectedSetting.fineOffset;
                    window.pmVars.kp = selectedSetting.kp;
                    window.pmVars.ki = selectedSetting.ki;
                    
                    showSettingNotification(`Applied setting "${selectedSetting.name}" to PM variables`);
                    console.log('Applied setting to PM variables:', {
                        name: selectedSetting.name,
                        main_gain: selectedSetting.calibrationFactor,
                        offset: selectedSetting.offset,
                        fine_offset: selectedSetting.fineOffset,
                        kp: selectedSetting.kp,
                        ki: selectedSetting.ki
                    });
                } else if (!window.pmVars) {
                    showSettingNotification('PM variables not available', 'error');
                }
            } else {
                console.error('Failed to get setting details:', data.message);
            }
        })
        .catch(error => {
            console.error('Error getting setting details:', error);
        });
}

// Create a new setting
function createSetting(event) {
    event.preventDefault();
    
    const name = document.getElementById('s_setting-name').value;
    const calibrationFactor = parseFloat(document.getElementById('s_calibration-factor').value);
    const offset = parseFloat(document.getElementById('s_offset').value);
    const fineOffset = parseFloat(document.getElementById('s_fine-offset').value);
    const kp = parseFloat(document.getElementById('s_kp').value);
    const ki = parseFloat(document.getElementById('s_ki').value);
    
    fetch('/api/createSetting', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, calibrationFactor, offset, fineOffset, kp, ki })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Clear form
            document.getElementById('s_setting-name').value = '';
            document.getElementById('s_calibration-factor').value = '';
            document.getElementById('s_offset').value = '';
            document.getElementById('s_fine-offset').value = '';
            document.getElementById('s_kp').value = '';
            document.getElementById('s_ki').value = '';
            
            // Close dialog
            document.getElementById('s_create-setting-dialog').style.display = 'none';
            
            // Show success message
            showSettingNotification('Setting created successfully!');
            
            // Reload settings
            loadSettings();
        } else {
            showSettingNotification('Failed to create setting: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error creating setting:', error);
        showSettingNotification('Error creating setting', 'error');
    });
}

// Modify an existing setting
function modifySetting(event) {
    event.preventDefault();
    
    const name = document.getElementById('s_setting-select').value;
    const newCalibrationFactor = parseFloat(document.getElementById('s_modify-calibration-factor').value);
    const newOffset = parseFloat(document.getElementById('s_modify-offset').value);
    const newFineOffset = parseFloat(document.getElementById('s_modify-fine-offset').value);
    const newKp = parseFloat(document.getElementById('s_modify-kp').value);
    const newKi = parseFloat(document.getElementById('s_modify-ki').value);
    
    fetch('/api/modifySetting', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, newCalibrationFactor, newOffset, newFineOffset, newKp, newKi })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Close dialog
            document.getElementById('s_modify-setting-dialog').style.display = 'none';
            
            // Show success message
            showSettingNotification('Setting updated successfully!');
            
            // Reload settings
            loadSettings();
        } else {
            showSettingNotification('Failed to update setting: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error updating setting:', error);
        showSettingNotification('Error updating setting', 'error');
    });
}

// Delete a setting
function deleteSetting(event) {
    event.preventDefault();
    
    const name = document.getElementById('s_delete-setting-select').value;
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the setting "${name}"?`)) {
        return;
    }
    
    fetch('/api/deleteSetting', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Close dialog
            document.getElementById('s_delete-setting-dialog').style.display = 'none';
            
            // Show success message
            showSettingNotification('Setting deleted successfully!');
            
            // Reload settings
            loadSettings();
        } else {
            showSettingNotification('Failed to delete setting: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error deleting setting:', error);
        showSettingNotification('Error deleting setting', 'error');
    });
}

// Show a notification message
function showSettingNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('s_notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 's_notification';
        notification.className = 's_notification';
        document.body.appendChild(notification);
    }
    
    // Set message and type
    notification.textContent = message;
    notification.className = `s_notification s_notification-${type} s_show`;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.className = 's_notification';
    }, 3000);
}

// Export functions for global access
window.settingsManagement = {
    loadSettings,
    createSetting,
    modifySetting,
    deleteSetting,
    applySettingToPmVars,
    showSettingNotification
};