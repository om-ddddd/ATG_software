/**
 * Tide Management JavaScript
 * This file contains functions for creating, modifying, and deleting tides
 * through API calls to the backend.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Ensure tide.json exists and is valid before initializing management
    fetch('/api/getAllTides')
        .then(() => {
            // If successful, initialize the tide management UI
            initializeTideManagement();
        })
        .catch(error => {
            console.error('Error verifying tide data:', error);
            // Handle the error silently - the server will create an empty array if needed
            initializeTideManagement();
        });
});

// Initialize tide management functionality
function initializeTideManagement() {
    // Get dialog elements
    const createTideDialog = document.getElementById('create-tide-dialog');
    const modifyTideDialog = document.getElementById('modify-tide-dialog');
    const deleteTideDialog = document.getElementById('delete-tide-dialog');
    
    // Get dialog buttons
    const createTideBtn = document.getElementById('create-tide-btn');
    const modifyTideBtn = document.getElementById('modify-tide-btn');
    const deleteTideBtn = document.getElementById('delete-tide-btn');
    
    // Get close buttons
    const closeBtns = document.querySelectorAll('.close-dialog');
    
    // Open dialog event listeners
    if (createTideBtn) {
        createTideBtn.addEventListener('click', () => {
            createTideDialog.style.display = 'block';
        });
    }
    
    if (modifyTideBtn) {
        modifyTideBtn.addEventListener('click', () => {
            populateTideSelect();
            modifyTideDialog.style.display = 'block';
        });
    }
    
    if (deleteTideBtn) {
        deleteTideBtn.addEventListener('click', () => {
            populateTideSelectForDelete();
            deleteTideDialog.style.display = 'block';
        });
    }
    
    // Close dialog when clicking on X button
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            createTideDialog.style.display = 'none';
            modifyTideDialog.style.display = 'none';
            deleteTideDialog.style.display = 'none';
        });
    });
    
    // Close dialog when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === createTideDialog) {
            createTideDialog.style.display = 'none';
        }
        if (event.target === modifyTideDialog) {
            modifyTideDialog.style.display = 'none';
        }
        if (event.target === deleteTideDialog) {
            deleteTideDialog.style.display = 'none';
        }
    });
    
    // Form submission handlers
    const createTideForm = document.getElementById('create-tide-form');
    const modifyTideForm = document.getElementById('modify-tide-form');
    const deleteTideForm = document.getElementById('delete-tide-form');
    
    if (createTideForm) {
        createTideForm.addEventListener('submit', createTide);
    }
    
    if (modifyTideForm) {
        modifyTideForm.addEventListener('submit', modifyTide);
        
        // When tide selection changes, update the form fields
        const tideSelect = document.getElementById('tide-select');
        if (tideSelect) {
            tideSelect.addEventListener('change', updateModifyForm);
        }
    }
    
    if (deleteTideForm) {
        deleteTideForm.addEventListener('submit', deleteTide);
    }
    
    // Load tides on init
    loadTides();
}

// Fetch all tides from the server
function loadTides() {
    fetch('/api/getAllTides')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                displayTides(data.tides);
                updateTideRangeDropdown(data.tides);
            } else {
                console.error('Failed to load tides:', data.message);
                showNotification('Failed to load tides: ' + data.message, 'warning');
            }
        })
        .catch(error => {
            console.error('Error fetching tides:', error);
            // Don't show error notification on initial page load, but handle quietly
            const tideList = document.getElementById('tide-list');
            if (tideList) {
                tideList.innerHTML = '<tr><td colspan="3">No tides available or server error. Create a new tide to get started.</td></tr>';
            }
        });
}

// Display tides in the tide list table
function displayTides(tides) {
    const tideList = document.getElementById('tide-list');
    if (!tideList) return;
    
    // Clear existing list
    tideList.innerHTML = '';
    
    // Create table header
    const headerRow = document.createElement('tr');
    ['Name', 'Range', 'Offset'].forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    tideList.appendChild(headerRow);
    
    // Add each tide to the table
    tides.forEach(tide => {
        const row = document.createElement('tr');
        
        // Name cell
        const nameCell = document.createElement('td');
        nameCell.textContent = tide.name;
        row.appendChild(nameCell);
        
        // Range cell
        const rangeCell = document.createElement('td');
        rangeCell.textContent = tide.range;
        row.appendChild(rangeCell);
        
        // Offset cell
        const offsetCell = document.createElement('td');
        offsetCell.textContent = tide.offset;
        row.appendChild(offsetCell);
        
        // Add the row to the table
        tideList.appendChild(row);
    });
}

// Update the tide range dropdown in the run tab
function updateTideRangeDropdown(tides) {
    const dropdown = document.getElementById('tide-range');
    if (!dropdown) return;
    
    // Clear existing options except the default
    while (dropdown.options.length > 1) {
        dropdown.remove(1);
    }
    
    // Add tide options
    tides.forEach(tide => {
        const option = document.createElement('option');
        option.value = tide.name;
        option.textContent = tide.name;
        dropdown.appendChild(option);
    });
}

// Populate the tide selection dropdown for modification
function populateTideSelect() {
    fetch('/api/getAllTides')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const tideSelect = document.getElementById('tide-select');
                if (!tideSelect) return;
                
                // Clear existing options
                tideSelect.innerHTML = '';
                
                // Add a default option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select a tide';
                tideSelect.appendChild(defaultOption);
                
                // Add tide options
                data.tides.forEach(tide => {
                    const option = document.createElement('option');
                    option.value = tide.name;
                    option.textContent = tide.name;
                    tideSelect.appendChild(option);
                });
            } else {
                console.error('Failed to load tides for select:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching tides for select:', error);
        });
}

// Populate the tide selection dropdown for deletion
function populateTideSelectForDelete() {
    fetch('/api/getAllTides')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const deleteTideSelect = document.getElementById('delete-tide-select');
                if (!deleteTideSelect) return;
                
                // Clear existing options
                deleteTideSelect.innerHTML = '';
                
                // Add a default option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select a tide';
                deleteTideSelect.appendChild(defaultOption);
                
                // Add tide options
                data.tides.forEach(tide => {
                    const option = document.createElement('option');
                    option.value = tide.name;
                    option.textContent = tide.name;
                    deleteTideSelect.appendChild(option);
                });
            } else {
                console.error('Failed to load tides for delete:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching tides for delete:', error);
        });
}

// Update the modification form when a tide is selected
function updateModifyForm(event) {
    const selectedTideName = event.target.value;
    if (!selectedTideName) return;
    
    fetch('/api/getAllTides')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const selectedTide = data.tides.find(tide => tide.name === selectedTideName);
                if (selectedTide) {
                    document.getElementById('modify-range').value = selectedTide.range;
                    document.getElementById('modify-offset').value = selectedTide.offset;
                }
            } else {
                console.error('Failed to get tide details:', data.message);
            }
        })
        .catch(error => {
            console.error('Error getting tide details:', error);
        });
}

// Create a new tide
function createTide(event) {
    event.preventDefault();
    
    const name = document.getElementById('tide-name').value;
    const range = parseFloat(document.getElementById('tide-range-input').value);
    const offset = parseFloat(document.getElementById('tide-offset').value);
    
    fetch('/api/createTide', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, range, offset })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Clear form
            document.getElementById('tide-name').value = '';
            document.getElementById('tide-range-input').value = '';
            document.getElementById('tide-offset').value = '';
            
            // Close dialog
            document.getElementById('create-tide-dialog').style.display = 'none';
            
            // Show success message
            showNotification('Tide created successfully!');
            
            // Reload tides
            loadTides();
        } else {
            showNotification('Failed to create tide: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error creating tide:', error);
        showNotification('Error creating tide', 'error');
    });
}

// Modify an existing tide
function modifyTide(event) {
    event.preventDefault();
    
    const name = document.getElementById('tide-select').value;
    const newRange = parseFloat(document.getElementById('modify-range').value);
    const newOffset = parseFloat(document.getElementById('modify-offset').value);
    
    fetch('/api/modifyTide', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, newRange, newOffset })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Close dialog
            document.getElementById('modify-tide-dialog').style.display = 'none';
            
            // Show success message
            showNotification('Tide updated successfully!');
            
            // Reload tides
            loadTides();
        } else {
            showNotification('Failed to update tide: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error updating tide:', error);
        showNotification('Error updating tide', 'error');
    });
}

// Delete a tide
function deleteTide(event) {
    event.preventDefault();
    
    const name = document.getElementById('delete-tide-select').value;
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the tide "${name}"?`)) {
        return;
    }
    
    fetch('/api/deleteTide', {
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
            document.getElementById('delete-tide-dialog').style.display = 'none';
            
            // Show success message
            showNotification('Tide deleted successfully!');
            
            // Reload tides
            loadTides();
        } else {
            showNotification('Failed to delete tide: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error deleting tide:', error);
        showNotification('Error deleting tide', 'error');
    });
}

// Show a notification message
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}
