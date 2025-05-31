/**
 * Admin Authentication Module
 * Manages the login dialog and authentication for the application
 */

// Export the init function that will be called from index.html
export function initAdminAuth() {
  // Initialize the login dialog
  // setupLoginDialog();
}

/**
 * Setup the login dialog and authentication logic
 */
function setupLoginDialog() {
  // DOM elements
  const loginDialog = document.getElementById('loginDialog');
  const loginForm = document.getElementById('loginForm');
  const loginButton = document.getElementById('loginButton');
  const usernameInput = document.getElementById('loginUsername');
  const passwordInput = document.getElementById('loginPassword');
  const loginError = document.getElementById('loginError');
  
  // Event listener for login button
  loginButton.addEventListener('click', handleLogin);
  
  // Also allow Enter key to submit the form
  loginForm.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin();
    }
  });
  
  // Show the login dialog on startup
  showLoginDialog();

  // Focus on the username field when the dialog shows
  setTimeout(() => {
    usernameInput.focus();
  }, 100);

  /**
   * Show the login dialog and disable access to the application
   */
  function showLoginDialog() {
    // Clear the username and password fields
    usernameInput.value = '';
    passwordInput.value = '';
    
    // Hide any error messages that might be displayed
    if(loginError) {
      loginError.style.display = 'none';
    }
    
    loginDialog.style.display = 'block';
    // Disable clicks on the main application while login dialog is shown
    document.getElementById('editorRoot').style.pointerEvents = 'none';
    document.getElementById('editorRoot').style.opacity = '0.5';
  }

  /**
   * Hide the login dialog and enable access to the application
   */
  function hideLoginDialog() {
    loginDialog.style.display = 'none';
    // Enable clicks on the main application
    document.getElementById('editorRoot').style.pointerEvents = 'auto';
    document.getElementById('editorRoot').style.opacity = '1';
  }

  /**
   * Handle the login attempt
   */
  function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Validate credentials
    validateCredentials(username, password)
      .then(isValid => {
        if (isValid) {
          // Login successful
          hideLoginDialog();
          // Store login state
          sessionStorage.setItem('isLoggedIn', 'true');
        } else {
          // Login failed
          displayError('Invalid username or password');
          // Clear password field
          passwordInput.value = '';
          passwordInput.focus();
        }
      })
      .catch(error => {
        displayError('Authentication error: ' + error.message);
      });
  }

  /**
   * Display an error message in the login dialog
   */
  function displayError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
    
    // Hide the error message after 3 seconds
    setTimeout(() => {
      loginError.style.display = 'none';
    }, 3000);
  }

  /**
   * Validate login credentials against users.json
   */
  async function validateCredentials(username, password) {
    try {
      // Fetch users data from users.json
      const response = await fetch('./users.json');
      if (!response.ok) {
        throw new Error('Failed to load user data');
      }
      
      const userData = await response.json();
      
      // Check if admin credentials match
      if (userData.admin && 
          userData.admin.username === username && 
          userData.admin.password === password) {
        return true;
      }
      
      // Not valid
      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }
}

// Add event listener to check login status when the page is loaded or refreshed
window.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    // If not logged in, initialize the login dialog
    // initAdminAuth();
  } else {
    // If already logged in, make sure the application is accessible
    document.getElementById('loginDialog').style.display = 'none';
    document.getElementById('editorRoot').style.pointerEvents = 'auto';
    document.getElementById('editorRoot').style.opacity = '1';
  }
});

// Initialize auth when this module is loaded
// initAdminAuth();