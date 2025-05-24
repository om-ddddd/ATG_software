/**
 * Authentication module for handling user credentials and authentication dialog
 */

// Export function to initialize authentication
export function initializeAuth() {
    // Handle Change User Dialog
    document.addEventListener('DOMContentLoaded', () => {
        const okButton = document.getElementById('okChangeUser');
        const formElement = document.getElementById('changeUserForm');
        
        if (okButton) {
            okButton.addEventListener('click', async () => {
                // Get form values
                const userType = document.querySelector('input[name="userType"]:checked').value;
                const newUserName = document.getElementById('newUserName').value;
                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const retypePassword = document.getElementById('retypePassword').value;
                
                // Simple validation
                if (currentPassword.trim() === '') {
                    showError('Current password is required.');
                    return;
                }
                
                if (newPassword !== retypePassword) {
                    showError('New password and retyped password do not match.');
                    return;
                }
                
                if (newPassword && newPassword.length < 3) {
                    showError('New password must be at least 3 characters.');
                    return;
                }
                
                try {
                    // Create the request body
                    const requestBody = {
                        userType: userType,
                        newUserName: newUserName,
                        currentPassword: currentPassword,
                        newPassword: newPassword
                    };
                    
                    // Send the API request
                    const response = await fetch('/api/changeUser', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(requestBody)
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        // Get appropriate message based on user type
                        const userTypeText = userType === 'admin' ? 'Administrator' : 'User';
                        
                        // Customize success message
                        let successMsg = `${userTypeText} information updated successfully`;
                        if (newUserName && newPassword) {
                            successMsg = `${userTypeText} name and password updated successfully`;
                        } else if (newUserName) {
                            successMsg = `${userTypeText} name updated successfully`;
                        } else if (newPassword) {
                            successMsg = `${userTypeText} password updated successfully`;
                        }
                        
                        // Show success message with confirmation button
                        showSuccess(successMsg);
                        
                        // Clear form fields
                        document.getElementById('newUserName').value = '';
                        document.getElementById('currentPassword').value = '';
                        document.getElementById('newPassword').value = '';
                        document.getElementById('retypePassword').value = '';
                        
                        // No auto-close - user must click OK button
                    } else {
                        // Show error message
                        showError(result.message || 'Failed to update user information');
                    }
                } catch (error) {
                    showError('An error occurred while updating user information');
                    console.error('Change user API error:', error);
                }
            });
        }
        
        // Helper function to show error messages
        function showError(message) {
            let errorElement = document.querySelector('.error-message');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                formElement.appendChild(errorElement);
            }
            
            // Hide success message if any
            const successElement = document.querySelector('.success-message');
            if (successElement && successElement.style.display !== 'none') {
                successElement.classList.add('message-hiding');
                setTimeout(() => {
                    successElement.style.display = 'none';
                    successElement.classList.remove('message-hiding');
                }, 300);
            }
            
            // Create and display enhanced error message with icon
            errorElement.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="white"/>
                    </svg>
                    <span style="font-weight: 500;">${message}</span>
                </div>
            `;
            errorElement.style.display = 'block';
            errorElement.classList.add('message-showing');
            
            // Hide error after 4 seconds
            setTimeout(() => {
                errorElement.classList.remove('message-showing');
                errorElement.classList.add('message-hiding');
                
                setTimeout(() => {
                    errorElement.style.display = 'none';
                    errorElement.classList.remove('message-hiding');
                }, 300);
            }, 4000);
        }
        
        // Helper function to show success messages
        function showSuccess(message) {
            let successElement = document.querySelector('.success-message');
            if (!successElement) {
                successElement = document.createElement('div');
                successElement.className = 'success-message';
                formElement.appendChild(successElement);
            }
            
            // Hide error message if any
            const errorElement = document.querySelector('.error-message');
            if (errorElement && errorElement.style.display !== 'none') {
                errorElement.classList.add('message-hiding');
                setTimeout(() => {
                    errorElement.style.display = 'none';
                    errorElement.classList.remove('message-hiding');
                }, 300);
            }
            
            // Create and display enhanced message with icon and button
            successElement.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="white"/>
                    </svg>
                    <span style="font-weight: 500;">${message}</span>
                </div>
                <button type="button" class="confirm-btn" style="margin-top: 12px; padding: 6px 16px; background: rgba(255,255,255,0.3); color: white; border: none; border-radius: 3px; cursor: pointer; font-weight: 500; transition: background 0.2s;">OK</button>
            `;
            successElement.style.display = 'block';
            successElement.classList.add('message-showing');
            
            // Add event listener to the OK button
            const confirmBtn = successElement.querySelector('.confirm-btn');
            if (confirmBtn) {
                // Add hover effect
                confirmBtn.addEventListener('mouseover', () => {
                    confirmBtn.style.background = 'rgba(255,255,255,0.5)';
                });
                confirmBtn.addEventListener('mouseout', () => {
                    confirmBtn.style.background = 'rgba(255,255,255,0.3)';
                });
                
                confirmBtn.addEventListener('click', () => {
                    // Apply fade-out animation
                    successElement.classList.remove('message-showing');
                    successElement.classList.add('message-hiding');
                    
                    // Hide elements after animation completes
                    setTimeout(() => {
                        successElement.style.display = 'none';
                        successElement.classList.remove('message-hiding');
                        
                        // Close the dialog with fade effect
                        const dialog = document.getElementById('changeUserDialog');
                        dialog.style.opacity = '0';
                        
                        setTimeout(() => {
                            dialog.style.display = 'none';
                            dialog.style.opacity = '1'; // Reset for next time
                        }, 300);
                    }, 300);
                });
            }
        }
    });
}

// Auto-initialize when module is loaded
initializeAuth();
