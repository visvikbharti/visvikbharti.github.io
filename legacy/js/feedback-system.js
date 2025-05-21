/**
 * Feedback System for RNA Lab Navigator Progress Reports
 * 
 * This script provides client-side functionality for collecting and displaying PI feedback
 * using localStorage for persistence. In a production environment, this would be replaced
 * with server-side storage.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Load all saved feedback when the page loads
  loadAllFeedback();
  
  // Initialize all save feedback buttons
  const saveButtons = document.querySelectorAll('.save-feedback-btn');
  
  saveButtons.forEach(button => {
    button.addEventListener('click', function() {
      const projectId = this.getAttribute('data-project');
      saveFeedback(projectId);
    });
  });
  
  // Add export/import controls
  addFeedbackControls();
});

/**
 * Add export/import controls to each feedback section
 */
function addFeedbackControls() {
  // Find all feedback containers
  const feedbackContainers = document.querySelectorAll('.previous-feedback');
  
  feedbackContainers.forEach(container => {
    const containerId = container.id;
    if (containerId.startsWith('previous-feedback-')) {
      const projectId = containerId.replace('previous-feedback-', '');
      
      // Create toolbar element
      const toolbar = document.createElement('div');
      toolbar.className = 'feedback-toolbar';
      toolbar.innerHTML = `
        <button class="export-feedback-btn" onclick="exportFeedback('${projectId}')">
          <i class="fas fa-file-export"></i> Export
        </button>
        <button class="import-feedback-btn" onclick="showImportDialog('${projectId}')">
          <i class="fas fa-file-import"></i> Import
        </button>
        <button class="email-feedback-btn" onclick="emailFeedback('${projectId}')">
          <i class="fas fa-envelope"></i> Email
        </button>
      `;
      
      // Insert toolbar at the beginning of the container
      if (container.firstChild) {
        container.insertBefore(toolbar, container.firstChild);
      } else {
        container.appendChild(toolbar);
      }
    }
  });
}

/**
 * Save feedback for a specific project
 */
function saveFeedback(projectId) {
  const feedbackText = document.getElementById(`pi-feedback-${projectId}`).value;
  const feedbackStatus = document.getElementById(`pi-feedback-status-${projectId}`).value;
  
  if (!feedbackText.trim()) {
    showNotification('Please enter some feedback before saving.', 'error');
    return;
  }
  
  // Create a feedback object
  const feedback = {
    id: Date.now(), // Use timestamp as unique ID
    project: projectId,
    text: feedbackText,
    status: feedbackStatus,
    date: new Date().toISOString(),
    author: "Dr. Debojyoti Chakraborty"
  };
  
  // Get existing feedback for this project
  let projectFeedback = getProjectFeedback(projectId);
  
  // Add new feedback
  projectFeedback.push(feedback);
  
  // Save to localStorage
  localStorage.setItem(`feedback_${projectId}`, JSON.stringify(projectFeedback));
  
  // Clear the textarea
  document.getElementById(`pi-feedback-${projectId}`).value = '';
  
  // Reload the feedback display
  loadFeedback(projectId);
  
  // Show success notification
  showNotification('Feedback saved successfully!', 'success');
}

/**
 * Get all feedback for a specific project
 */
function getProjectFeedback(projectId) {
  const savedFeedback = localStorage.getItem(`feedback_${projectId}`);
  return savedFeedback ? JSON.parse(savedFeedback) : [];
}

/**
 * Load and display all feedback for all projects on the page
 */
function loadAllFeedback() {
  // Look for all feedback containers
  const feedbackContainers = document.querySelectorAll('.previous-feedback');
  
  feedbackContainers.forEach(container => {
    const containerId = container.id;
    if (containerId.startsWith('previous-feedback-')) {
      const projectId = containerId.replace('previous-feedback-', '');
      loadFeedback(projectId);
    }
  });
}

/**
 * Load and display feedback for a specific project
 */
function loadFeedback(projectId) {
  const feedbackContainer = document.getElementById(`previous-feedback-${projectId}`);
  const projectFeedback = getProjectFeedback(projectId);
  
  if (!feedbackContainer) return;
  
  // Clear current content
  feedbackContainer.innerHTML = '';
  
  // Add toolbar for export/import
  const toolbar = document.createElement('div');
  toolbar.className = 'feedback-toolbar';
  toolbar.innerHTML = `
    <button class="export-feedback-btn" onclick="exportFeedback('${projectId}')">
      <i class="fas fa-file-export"></i> Export
    </button>
    <button class="import-feedback-btn" onclick="showImportDialog('${projectId}')">
      <i class="fas fa-file-import"></i> Import
    </button>
    <button class="email-feedback-btn" onclick="emailFeedback('${projectId}')">
      <i class="fas fa-envelope"></i> Email
    </button>
  `;
  feedbackContainer.appendChild(toolbar);
  
  if (projectFeedback.length === 0) {
    feedbackContainer.innerHTML += '<p class="no-feedback">No feedback has been provided yet.</p>';
    return;
  }
  
  // Sort feedback by date (newest first)
  projectFeedback.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Display each feedback entry
  projectFeedback.forEach(feedback => {
    const feedbackDate = new Date(feedback.date).toLocaleString();
    const statusClass = getStatusClass(feedback.status);
    
    const feedbackHTML = `
      <div class="feedback-entry">
        <div class="feedback-header">
          <span class="feedback-author">${feedback.author}</span>
          <span class="feedback-date">${feedbackDate}</span>
          <span class="feedback-status ${statusClass}">${formatStatus(feedback.status)}</span>
        </div>
        <div class="feedback-content">${feedback.text}</div>
        <div class="feedback-actions">
          <button class="delete-feedback-btn" onclick="deleteFeedback('${projectId}', ${feedback.id})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
    
    feedbackContainer.innerHTML += feedbackHTML;
  });
  
  // Add styles if not already present
  addFeedbackStyles();
}

/**
 * Delete a specific feedback entry
 */
function deleteFeedback(projectId, feedbackId) {
  if (confirm('Are you sure you want to delete this feedback?')) {
    let projectFeedback = getProjectFeedback(projectId);
    
    // Remove the specific feedback entry
    projectFeedback = projectFeedback.filter(feedback => feedback.id !== feedbackId);
    
    // Save the updated feedback array
    localStorage.setItem(`feedback_${projectId}`, JSON.stringify(projectFeedback));
    
    // Reload the feedback display
    loadFeedback(projectId);
    
    showNotification('Feedback deleted successfully!', 'success');
  }
}

/**
 * Export feedback for a specific project
 */
function exportFeedback(projectId) {
  const projectFeedback = getProjectFeedback(projectId);
  
  if (projectFeedback.length === 0) {
    showNotification('No feedback to export.', 'error');
    return;
  }
  
  // Create export object with metadata
  const exportData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    project: projectId,
    feedback: projectFeedback
  };
  
  // Convert to JSON string with pretty formatting
  const jsonData = JSON.stringify(exportData, null, 2);
  
  // Create download link
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `feedback_${projectId}_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
  
  showNotification('Feedback exported successfully!', 'success');
}

/**
 * Show import dialog
 */
function showImportDialog(projectId) {
  // Create dialog overlay
  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';
  document.body.appendChild(overlay);
  
  // Create dialog
  const dialog = document.createElement('div');
  dialog.className = 'import-dialog';
  dialog.innerHTML = `
    <h3>Import Feedback</h3>
    <p>Paste the exported JSON feedback data below:</p>
    <textarea class="import-textarea" id="import-data" placeholder='{
  "version": "1.0",
  "project": "${projectId}",
  "feedback": [...]
}'></textarea>
    <div class="import-buttons">
      <button class="import-cancel">Cancel</button>
      <button class="import-confirm">Import</button>
    </div>
  `;
  document.body.appendChild(dialog);
  
  // Add event listeners
  dialog.querySelector('.import-cancel').addEventListener('click', () => {
    document.body.removeChild(overlay);
    document.body.removeChild(dialog);
  });
  
  dialog.querySelector('.import-confirm').addEventListener('click', () => {
    const importText = dialog.querySelector('#import-data').value;
    importFeedback(projectId, importText);
    document.body.removeChild(overlay);
    document.body.removeChild(dialog);
  });
}

/**
 * Import feedback from JSON
 */
function importFeedback(projectId, jsonData) {
  try {
    // Parse JSON data
    const importedData = JSON.parse(jsonData);
    
    // Validate import data structure
    if (!importedData.feedback || !Array.isArray(importedData.feedback)) {
      throw new Error('Invalid feedback data format');
    }
    
    // Get current feedback
    let currentFeedback = getProjectFeedback(projectId);
    
    // Add imported feedback entries
    importedData.feedback.forEach(feedback => {
      // Make sure each feedback has a unique ID
      if (!feedback.id) {
        feedback.id = Date.now() + Math.floor(Math.random() * 1000);
      }
      
      // Add to current feedback
      currentFeedback.push(feedback);
    });
    
    // Save merged feedback
    localStorage.setItem(`feedback_${projectId}`, JSON.stringify(currentFeedback));
    
    // Reload display
    loadFeedback(projectId);
    
    showNotification(`Imported ${importedData.feedback.length} feedback entries.`, 'success');
  } catch (error) {
    showNotification(`Import failed: ${error.message}`, 'error');
  }
}

/**
 * Email feedback (opens email client)
 */
function emailFeedback(projectId) {
  const projectFeedback = getProjectFeedback(projectId);
  
  if (projectFeedback.length === 0) {
    showNotification('No feedback to email.', 'error');
    return;
  }
  
  // Format feedback into text
  let feedbackText = `RNA Lab Navigator Feedback - ${projectId}\n\n`;
  
  projectFeedback.forEach(feedback => {
    const date = new Date(feedback.date).toLocaleString();
    feedbackText += `Date: ${date}\n`;
    feedbackText += `Status: ${formatStatus(feedback.status)}\n`;
    feedbackText += `From: ${feedback.author}\n`;
    feedbackText += "Feedback:\n";
    feedbackText += `${feedback.text}\n\n`;
    feedbackText += "-----------------------------------\n\n";
  });
  
  // Create mailto link
  const subject = encodeURIComponent(`RNA Lab Navigator Feedback - ${projectId}`);
  const body = encodeURIComponent(feedbackText);
  const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
  
  // Open email client
  window.open(mailtoLink);
}

/**
 * Format the status value for display
 */
function formatStatus(status) {
  switch(status) {
    case 'approved': return 'Approved';
    case 'changes': return 'Changes Requested';
    case 'question': return 'Question';
    default: return status;
  }
}

/**
 * Get CSS class based on status
 */
function getStatusClass(status) {
  switch(status) {
    case 'approved': return 'status-approved';
    case 'changes': return 'status-changes';
    case 'question': return 'status-question';
    default: return '';
  }
}

/**
 * Show a notification message
 */
function showNotification(message, type) {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('feedback-notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'feedback-notification';
    document.body.appendChild(notification);
  }
  
  // Set notification class based on type
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Show notification
  notification.style.display = 'block';
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

/**
 * Add CSS styles for feedback system
 */
function addFeedbackStyles() {
  if (document.getElementById('feedback-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'feedback-styles';
  
  style.innerHTML = `
    .feedback-entry {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .feedback-toolbar {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      border-bottom: 1px solid #eee;
      padding-bottom: 15px;
    }
    
    .export-feedback-btn,
    .import-feedback-btn,
    .email-feedback-btn {
      padding: 8px 12px;
      border: none;
      border-radius: 5px;
      color: white;
      cursor: pointer;
      font-size: 0.9em;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .export-feedback-btn {
      background-color: #2ecc71;
    }
    
    .import-feedback-btn {
      background-color: #3498db;
    }
    
    .email-feedback-btn {
      background-color: #9b59b6;
    }
    
    .export-feedback-btn:hover,
    .import-feedback-btn:hover,
    .email-feedback-btn:hover {
      opacity: 0.9;
    }
    
    .feedback-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      color: #666;
      font-size: 0.9em;
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
    }
    
    .feedback-author {
      font-weight: bold;
      color: #2980b9;
    }
    
    .feedback-content {
      line-height: 1.5;
      white-space: pre-wrap;
    }
    
    .feedback-status {
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 0.8em;
    }
    
    .status-approved {
      background-color: #e6f7ee;
      color: #27ae60;
    }
    
    .status-changes {
      background-color: #fdebd0;
      color: #e67e22;
    }
    
    .status-question {
      background-color: #eaecee;
      color: #7f8c8d;
    }
    
    .no-feedback {
      color: #95a5a6;
      font-style: italic;
      text-align: center;
      margin-top: 15px;
    }
    
    .feedback-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
    }
    
    .delete-feedback-btn {
      background: none;
      border: none;
      color: #e74c3c;
      cursor: pointer;
      opacity: 0.5;
      transition: opacity 0.2s;
    }
    
    .delete-feedback-btn:hover {
      opacity: 1;
    }
    
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 5px;
      color: white;
      z-index: 9999;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      display: none;
    }
    
    .notification.success {
      background-color: #27ae60;
    }
    
    .notification.error {
      background-color: #e74c3c;
    }
    
    .pi-feedback-textarea {
      width: 100%;
      min-height: 100px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      resize: vertical;
      margin-bottom: 10px;
      font-family: Arial, sans-serif;
    }
    
    .pi-status-select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: white;
    }
    
    .save-feedback-btn {
      padding: 8px 15px;
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    
    .save-feedback-btn:hover {
      background-color: #2980b9;
    }
    
    .feedback-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    /* Import Dialog Styles */
    .import-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      max-width: 500px;
      width: 90%;
    }
    
    .import-dialog h3 {
      margin-top: 0;
      color: #2c3e50;
    }
    
    .import-textarea {
      width: 100%;
      min-height: 150px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      margin: 10px 0;
      font-family: monospace;
    }
    
    .import-buttons {
      display: flex;
      justify-content: space-between;
    }
    
    .import-buttons button {
      padding: 8px 15px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    
    .import-confirm {
      background-color: #2ecc71;
      color: white;
    }
    
    .import-cancel {
      background-color: #e74c3c;
      color: white;
    }
    
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 999;
    }
  `;
  
  document.head.appendChild(style);
}