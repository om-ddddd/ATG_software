/**
 * Administration Dialog Module
 * This module provides functionality for the user/admin credential management dialog
 */

// Function to initialize the administration functionality
export function initAdministration() {
    // Add event listener for the administration button
    const adminButton = document.getElementById('mm_administration');
    if (adminButton) {
        adminButton.addEventListener('click', openChangeUserDialog);
    }
    
    // Initialize the change user dialog functionality
    initChangeUserDialog();
}

// Initialize the change user dialog functionality
function initChangeUserDialog() {
    // Add event listeners for dialog actions
    document.getElementById('okChangeUser').addEventListener('click', handleChangeUser);
    document.getElementById('cancelChangeUser').addEventListener('click', closeChangeUserDialog);
    document.getElementById('closeChangeUserDialog').addEventListener('click', closeChangeUserDialog);
    
    // Form validation
    document.getElementById('newPassword').addEventListener('input', validatePassword);
    document.getElementById('retypePassword').addEventListener('input', validatePasswordMatch);
}

// Function to handle the change user form submission
function handleChangeUser() {
    // Get form values
    const userType = document.querySelector('input[name="userType"]:checked').value;
    const newUserName = document.getElementById('newUserName').value.trim();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const retypePassword = document.getElementById('retypePassword').value;
    
    // Basic validation
    if (currentPassword === '') {
        showMessage('Please enter your current password', 'error');
        return;
    }
    
    // Check if either username or password is being changed
    if (newUserName === '' && newPassword === '') {
        showMessage('Please enter a new username or password to change', 'error');
        return;
    }
    
    // Password validation if the user is attempting to change it
    if (newPassword !== '') {
        if (newPassword.length < 3) {
            showMessage('New password must be at least 3 characters long', 'error');
            return;
        }
        
        if (newPassword !== retypePassword) {
            showMessage('New passwords do not match', 'error');
            return;
        }
    }
    
    // Prepare request payload
    const payload = {
        userType: userType,
        currentPassword: currentPassword
    };
    
    // Only add new username and password if they are provided
    if (newUserName !== '') {
        payload.newUserName = newUserName;
    }
    
    if (newPassword !== '') {
        payload.newPassword = newPassword;
    }
    
    // Show loading message
    showMessage('Updating user information...', 'info');
    
    // Call the API
    fetch('/api/changeUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            // Update the UI with new username if it was changed
            if (newUserName !== '') {
                updateDisplayedUsername(newUserName, userType);
            }
            // Close the dialog after a short delay
            setTimeout(() => {
                closeChangeUserDialog();
                // Clear the form
                document.getElementById('changeUserForm').reset();
            }, 2000);
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('An error occurred while updating user information. Please try again later.', 'error');
    });
}

// Function to display messages to the user
function showMessage(message, type) {
    // Create message element if it doesn't exist
    let messageElement = document.getElementById('auth_changeUserMessage');
    
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'auth_changeUserMessage';
        const form = document.getElementById('changeUserForm');
        form.insertBefore(messageElement, form.querySelector('.auth-button-group'));
    }
    
    // Set message content and style
    messageElement.textContent = message;
    messageElement.className = 'auth_message ' + type;
    
    // For success messages, automatically hide after some time
    if (type === 'success') {
        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 500);
        }, 3000);
    }
}

// Function to open the dialog
export function openChangeUserDialog() {
    document.getElementById('changeUserDialog').style.display = 'block';
    // Clear any previous form data and messages
    document.getElementById('changeUserForm').reset();
    
    const messageElement = document.getElementById('auth_changeUserMessage');
    if (messageElement) {
        messageElement.style.display = 'none';
    }
}

// Function to close the dialog
export function closeChangeUserDialog() {
    document.getElementById('changeUserDialog').style.display = 'none';
    
    // Remove any displayed messages
    const messageElement = document.getElementById('auth_changeUserMessage');
    if (messageElement) {
        messageElement.style.display = 'none';
    }
}

// Function to validate password as user types
function validatePassword() {
    const password = document.getElementById('newPassword').value;
    const hint = document.querySelector('.auth-hint');
    
    if (password.length > 0 && password.length < 3) {
        hint.style.color = 'red';
    } else {
        hint.style.color = '';
    }
}

// Function to validate password match as user types
function validatePasswordMatch() {
    const password = document.getElementById('newPassword').value;
    const retypePassword = document.getElementById('retypePassword').value;
    const retypeField = document.getElementById('retypePassword');
    
    if (password && retypePassword && password !== retypePassword) {
        retypeField.classList.add('auth_error');
    } else {
        retypeField.classList.remove('auth_error');
    }
}

// Function to update displayed username in the app
function updateDisplayedUsername(newUsername, userType) {
    // Update any UI elements that display the username
    const userDisplayElements = document.querySelectorAll(`.${userType}-username-display`);
    if (userDisplayElements.length) {
        userDisplayElements.forEach(elem => {
            elem.textContent = newUsername;
        });
    }
    
    // If the current user's login matches the changed user type, update the login display
    const currentUserType = document.querySelector('.current-user-type')?.dataset?.userType;
    if (currentUserType === userType) {
        const loginDisplayElements = document.querySelectorAll('.current-user-name');
        if (loginDisplayElements.length) {
            loginDisplayElements.forEach(elem => {
                elem.textContent = newUsername;
            });
        }
    }
}