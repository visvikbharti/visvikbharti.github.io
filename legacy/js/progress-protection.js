/**
 * Password Protection for Weekly Progress Page
 * Add this at the beginning of your progress.html file
 */

(function() {
    // Execute immediately when script loads
    document.addEventListener('DOMContentLoaded', function() {
      // Check if already authenticated in this session
      if (!sessionStorage.getItem('progressAuth')) {
        // Hide the actual content immediately to prevent flash
        hidePageContent();
        
        // Show the login overlay
        showLoginOverlay();
      }
    });
  
    // Hide all page content
    function hidePageContent() {
      const mainContent = document.querySelector('.main-container') || 
                          document.getElementById('main-content');
      
      if (mainContent) {
        // Save original display style but hide content
        mainContent.dataset.originalDisplay = mainContent.style.display;
        mainContent.style.display = 'none';
      }
    }
    
    // Show the login overlay
    function showLoginOverlay() {
      // Create login container
      const loginContainer = document.createElement('div');
      loginContainer.id = 'progress-login-overlay';
      loginContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #f0f2f5;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      `;
      
      // Create login form
      const loginForm = document.createElement('div');
      loginForm.style.cssText = `
        background-color: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        width: 90%;
        text-align: center;
      `;
      
      // Form content
      loginForm.innerHTML = `
        <h2 style="color: #2c3e50; margin-top: 0; margin-bottom: 20px;">Weekly Progress Access</h2>
        <p style="color: #555; margin-bottom: 25px;">This page contains research progress information. Please enter the access password to continue.</p>
        
        <div style="margin-bottom: 20px;">
          <input type="password" id="progress-password" 
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;" 
                 placeholder="Enter password">
        </div>
        
        <div>
          <button id="progress-login-btn" 
                  style="background-color: #3498db; color: white; border: none; padding: 10px 16px; 
                         border-radius: 4px; cursor: pointer; font-size: 16px; width: 100%;">
            Access Progress Report
          </button>
        </div>
        
        <div id="login-error" style="color: #e74c3c; margin-top: 15px; display: none;">
          Incorrect password. Please try again.
        </div>
        
        <div style="margin-top: 20px;">
          <a href="index.html" style="color: #3498db; text-decoration: none;">Return to Home Page</a>
        </div>
      `;
      
      // Add form to container
      loginContainer.appendChild(loginForm);
      
      // Add to document
      document.body.appendChild(loginContainer);
      
      // Add event listeners
      setupLoginEvents();
    }
    
    // Set up login form events
    function setupLoginEvents() {
      const loginBtn = document.getElementById('progress-login-btn');
      const passwordInput = document.getElementById('progress-password');
      
      if (loginBtn && passwordInput) {
        // Login on button click
        loginBtn.addEventListener('click', attemptLogin);
        
        // Also login on Enter key
        passwordInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            attemptLogin();
          }
        });
        
        // Focus the password field
        passwordInput.focus();
      }
    }
    
    // Attempt to login with provided password
    function attemptLogin() {
      const passwordInput = document.getElementById('progress-password');
      const errorMessage = document.getElementById('login-error');
      
      if (passwordInput && errorMessage) {
        const password = passwordInput.value.trim();
        
        // Check against the correct password
        // CHANGE THIS TO YOUR ACTUAL PASSWORD
        const correctPassword = "IGIB-CSIR-2025";
        
        if (password === correctPassword) {
          // Set authentication in session storage
          sessionStorage.setItem('progressAuth', 'true');
          
          // Remove the login overlay
          const overlay = document.getElementById('progress-login-overlay');
          if (overlay) {
            overlay.remove();
          }
          
          // Show the page content
          showPageContent();
        } else {
          // Show error message
          errorMessage.style.display = 'block';
          
          // Clear password field
          passwordInput.value = '';
          passwordInput.focus();
        }
      }
    }
    
    // Show the page content after successful login
    function showPageContent() {
      const mainContent = document.querySelector('.main-container') || 
                          document.getElementById('main-content');
      
      if (mainContent) {
        // Restore original display or default to block
        const originalDisplay = mainContent.dataset.originalDisplay;
        mainContent.style.display = originalDisplay || 'block';
      }
    }
  })();