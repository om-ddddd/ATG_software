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
        
        // Add inline styles to ensure message displays properly
        messageElement.style.margin = '10px 0';
        messageElement.style.padding = '8px 12px';
        messageElement.style.borderRadius = '4px';
        messageElement.style.transition = 'opacity 0.3s ease';
        messageElement.style.fontSize = '14px';
        messageElement.style.textAlign = 'center';
        messageElement.style.display = 'block';
    }
    
    // Set message content and style based on type
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    messageElement.style.opacity = '1';
    
    // Apply type-specific styles
    if (type === 'error') {
        messageElement.style.backgroundColor = '#ffebee';
        messageElement.style.color = '#d32f2f';
        messageElement.style.border = '1px solid #ffcdd2';
    } else if (type === 'success') {
        messageElement.style.backgroundColor = '#e8f5e9';
        messageElement.style.color = '#388e3c';
        messageElement.style.border = '1px solid #c8e6c9';
        
        // For success messages, automatically hide after some time
        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 500);
        }, 3000);
    } else if (type === 'info') {
        messageElement.style.backgroundColor = '#e3f2fd';
        messageElement.style.color = '#1976d2';
        messageElement.style.border = '1px solid #bbdefb';
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
    
    // Reset form field styling
    document.getElementById('newUserName').style.borderColor = '';
    document.getElementById('currentPassword').style.borderColor = '';
    document.getElementById('newPassword').style.borderColor = '';
    document.getElementById('retypePassword').style.borderColor = '';
    
    // Reset hint colors
    const hint = document.querySelector('.auth-hint');
    if (hint) {
        hint.style.color = '';
    }
    
    // Remove any hint messages
    const lengthHint = document.getElementById('password_length_hint');
    if (lengthHint) {
        lengthHint.parentNode.removeChild(lengthHint);
    }
    
    const mismatchHint = document.getElementById('password_mismatch_hint');
    if (mismatchHint) {
        mismatchHint.parentNode.removeChild(mismatchHint);
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
    
    // Reset any error styling
    const inputFields = document.querySelectorAll('#changeUserForm input');
    inputFields.forEach(field => {
        field.style.borderColor = '';
    });
    
    // Remove any dynamic hint messages
    const lengthHint = document.getElementById('password_length_hint');
    if (lengthHint) {
        lengthHint.parentNode.removeChild(lengthHint);
    }
    
    const mismatchHint = document.getElementById('password_mismatch_hint');
    if (mismatchHint) {
        mismatchHint.parentNode.removeChild(mismatchHint);
    }
}

// Function to validate password as user types
function validatePassword() {
    const password = document.getElementById('newPassword').value;
    const hint = document.querySelector('.auth-hint');
    const passwordField = document.getElementById('newPassword');
    
    if (password.length > 0 && password.length < 3) {
        hint.style.color = 'red';
        passwordField.style.borderColor = 'red';
        
        // Add small hint message if it doesn't exist
        let hintMsg = document.getElementById('password_length_hint');
        if (!hintMsg && password.length > 0) {
            hintMsg = document.createElement('div');
            hintMsg.id = 'password_length_hint';
            hintMsg.style.color = 'red';
            hintMsg.style.fontSize = '12px';
            hintMsg.style.marginTop = '2px';
            hintMsg.textContent = 'Password is too short';
            passwordField.parentNode.appendChild(hintMsg);
        }
    } else {
        hint.style.color = '';
        passwordField.style.borderColor = '';
        
        // Remove hint message if it exists
        const hintMsg = document.getElementById('password_length_hint');
        if (hintMsg) {
            hintMsg.parentNode.removeChild(hintMsg);
        }
    }
    
    // Also validate matching if retype field has a value
    if (document.getElementById('retypePassword').value) {
        validatePasswordMatch();
    }
}

// Function to validate password match as user types
function validatePasswordMatch() {
    const password = document.getElementById('newPassword').value;
    const retypePassword = document.getElementById('retypePassword').value;
    const retypeField = document.getElementById('retypePassword');
    
    if (password && retypePassword && password !== retypePassword) {
        retypeField.style.borderColor = 'red';
        
        // Add mismatch message if it doesn't exist
        let mismatchMsg = document.getElementById('password_mismatch_hint');
        if (!mismatchMsg) {
            mismatchMsg = document.createElement('div');
            mismatchMsg.id = 'password_mismatch_hint';
            mismatchMsg.style.color = 'red';
            mismatchMsg.style.fontSize = '12px';
            mismatchMsg.style.marginTop = '2px';
            mismatchMsg.textContent = 'Passwords do not match';
            retypeField.parentNode.appendChild(mismatchMsg);
        }
    } else {
        retypeField.style.borderColor = '';
        
        // Remove mismatch message if it exists
        const mismatchMsg = document.getElementById('password_mismatch_hint');
        if (mismatchMsg) {
            mismatchMsg.parentNode.removeChild(mismatchMsg);
        }
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