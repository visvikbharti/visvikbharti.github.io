/**
 * Feedback System for RNA Lab Navigator Progress Reports
 * 
 * This script provides client-side functionality for collecting and displaying PI feedback
 * using localStorage for persistence. In a production environment, this would be replaced
 * with server-side storage.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Check localStorage availability first
  if (!isStorageAvailable('localStorage')) {
    console.error('localStorage is not available. Feedback system will not work properly.');
    showErrorBanner('Your browser does not support local storage. Feedback features will not work properly.');
    return;
  }

  // Make sure we have valid author information
  ensureAuthorInfo();
  
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
  
  // Add auto-save functionality for feedback text
  addAutoSave();
});

/**
 * Detect localStorage availability
 */
function isStorageAvailable(type) {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Show error banner for critical issues
 */
function showErrorBanner(message) {
  const banner = document.createElement('div');
  banner.className = 'feedback-error-banner';
  banner.innerHTML = `
    <div class="feedback-error-message">
      <i class="fas fa-exclamation-triangle"></i> ${message}
    </div>
    <button class="feedback-error-close">&times;</button>
  `;
  
  document.body.insertBefore(banner, document.body.firstChild);
  
  banner.querySelector('.feedback-error-close').addEventListener('click', () => {
    banner.remove();
  });
}

/**
 * Ensure we have author information
 */
function ensureAuthorInfo() {
  // Check if author name is stored
  if (!localStorage.getItem('feedback_author_name')) {
    // Use default or prompt for name
    localStorage.setItem('feedback_author_name', "Dr. Debojyoti Chakraborty");
  }
}

/**
 * Get current author name
 */
function getAuthorName() {
  return localStorage.getItem('feedback_author_name') || "Dr. Debojyoti Chakraborty";
}

/**
 * Set up autosave functionality
 */
function addAutoSave() {
  // Find all feedback textareas
  const textareas = document.querySelectorAll('.pi-feedback-textarea');
  
  textareas.forEach(textarea => {
    const projectId = textarea.id.replace('pi-feedback-', '');
    
    // Load any previously autosaved content
    const autosaved = localStorage.getItem(`feedback_autosave_${projectId}`);
    if (autosaved) {
      textarea.value = autosaved;
    }
    
    // Set up input event for autosave
    textarea.addEventListener('input', function() {
      localStorage.setItem(`feedback_autosave_${projectId}`, this.value);
    });
  });
}

/**
 * Add export/import controls to each feedback section
 */
function addFeedbackControls() {
  // Find all feedback containers
  const feedbackContainers = document.querySelectorAll('.previous-feedback');
  
  feedbackContainers.forEach(container => {
    const containerId = container.id;
    if (containerId && containerId.startsWith('previous-feedback-')) {
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
        <button class="copy-feedback-btn" onclick="copyFeedbackToClipboard('${projectId}')">
          <i class="fas fa-copy"></i> Copy
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
  try {
    const feedbackTextarea = document.getElementById(`pi-feedback-${projectId}`);
    const feedbackStatusSelect = document.getElementById(`pi-feedback-status-${projectId}`);
    
    if (!feedbackTextarea || !feedbackStatusSelect) {
      showNotification('Could not find feedback form elements.', 'error');
      return;
    }
    
    const feedbackText = feedbackTextarea.value;
    const feedbackStatus = feedbackStatusSelect.value;
    
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
      author: getAuthorName()
    };
    
    // Get existing feedback for this project
    let projectFeedback = getProjectFeedback(projectId);
    
    // Add new feedback
    projectFeedback.push(feedback);
    
    // Save to localStorage
    localStorage.setItem(`feedback_${projectId}`, JSON.stringify(projectFeedback));
    
    // Clear the textarea and autosave
    feedbackTextarea.value = '';
    localStorage.removeItem(`feedback_autosave_${projectId}`);
    
    // Reload the feedback display
    loadFeedback(projectId);
    
    // Show success notification
    showNotification('Feedback saved successfully!', 'success');
    
    // Create backup of all feedback
    createFeedbackBackup();
  } catch (error) {
    console.error('Error saving feedback:', error);
    showNotification(`Error saving feedback: ${error.message}`, 'error');
  }
}

/**
 * Create backup of all feedback
 */
function createFeedbackBackup() {
  try {
    // Get all feedback keys
    const feedbackData = {};
    
    // Iterate all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('feedback_') && !key.includes('autosave')) {
        feedbackData[key] = localStorage.getItem(key);
      }
    }
    
    // Save backup
    if (Object.keys(feedbackData).length > 0) {
      localStorage.setItem('feedback_backup', JSON.stringify({
        timestamp: new Date().toISOString(),
        data: feedbackData
      }));
    }
  } catch (error) {
    console.error('Failed to create feedback backup:', error);
    // Non-critical, so don't show error to user
  }
}

/**
 * Restore feedback from backup if needed
 */
function restoreFromBackupIfNeeded() {
  try {
    const backup = localStorage.getItem('feedback_backup');
    if (!backup) return false;
    
    const backupData = JSON.parse(backup);
    if (!backupData.data) return false;
    
    let restoredCount = 0;
    
    // Check each feedback key
    Object.keys(backupData.data).forEach(key => {
      // Only restore if the key doesn't exist
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, backupData.data[key]);
        restoredCount++;
      }
    });
    
    if (restoredCount > 0) {
      showNotification(`Restored ${restoredCount} feedback items from backup.`, 'success');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to restore from backup:', error);
    return false;
  }
}

/**
 * Get all feedback for a specific project
 */
function getProjectFeedback(projectId) {
  try {
    const savedFeedback = localStorage.getItem(`feedback_${projectId}`);
    return savedFeedback ? JSON.parse(savedFeedback) : [];
  } catch (error) {
    console.error(`Error parsing feedback for project ${projectId}:`, error);
    // Try to recover from backup
    restoreFromBackupIfNeeded();
    // Return empty array if we can't parse the feedback
    return [];
  }
}

/**
 * Load and display all feedback for all projects on the page
 */
function loadAllFeedback() {
  // Attempt to restore from backup if needed
  restoreFromBackupIfNeeded();
  
  // Look for all feedback containers
  const feedbackContainers = document.querySelectorAll('.previous-feedback');
  
  if (feedbackContainers.length === 0) {
    console.warn('No feedback containers found on the page.');
    return;
  }
  
  feedbackContainers.forEach(container => {
    if (!container.id) {
      console.warn('Feedback container missing ID attribute:', container);
      return;
    }
    
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
  if (!feedbackContainer) {
    console.error(`Feedback container for project ${projectId} not found.`);
    return;
  }
  
  const projectFeedback = getProjectFeedback(projectId);
  
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
    <button class="copy-feedback-btn" onclick="copyFeedbackToClipboard('${projectId}')">
      <i class="fas fa-copy"></i> Copy
    </button>
  `;
  feedbackContainer.appendChild(toolbar);
  
  // Add feedback counter
  const feedbackCounter = document.createElement('div');
  feedbackCounter.className = 'feedback-counter';
  feedbackCounter.textContent = `${projectFeedback.length} feedback entries`;
  feedbackContainer.appendChild(feedbackCounter);
  
  if (projectFeedback.length === 0) {
    feedbackContainer.innerHTML += '<p class="no-feedback">No feedback has been provided yet.</p>';
    return;
  }
  
  // Sort feedback by date (newest first)
  projectFeedback.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Create feedback list container
  const feedbackList = document.createElement('div');
  feedbackList.className = 'feedback-list';
  
  // Display each feedback entry
  projectFeedback.forEach(feedback => {
    try {
      // Use safe defaults for missing properties
      const feedbackDate = feedback.date ? new Date(feedback.date).toLocaleString() : 'Unknown date';
      const statusClass = getStatusClass(feedback.status || 'question');
      const feedbackAuthor = feedback.author || getAuthorName();
      const feedbackContent = feedback.text || '';
      const feedbackId = feedback.id || Date.now();
      
      const feedbackEntry = document.createElement('div');
      feedbackEntry.className = 'feedback-entry';
      feedbackEntry.innerHTML = `
        <div class="feedback-header">
          <span class="feedback-author">${escapeHtml(feedbackAuthor)}</span>
          <span class="feedback-date">${feedbackDate}</span>
          <span class="feedback-status ${statusClass}">${formatStatus(feedback.status || 'question')}</span>
        </div>
        <div class="feedback-content">${escapeHtml(feedbackContent)}</div>
        <div class="feedback-actions">
          <button class="delete-feedback-btn" onclick="deleteFeedback('${projectId}', ${feedbackId})"><i class="fas fa-trash"></i></button>
        </div>
      `;
      
      feedbackList.appendChild(feedbackEntry);
    } catch (error) {
      console.error('Error rendering feedback entry:', error, feedback);
      // Continue to next feedback entry
    }
  });
  
  feedbackContainer.appendChild(feedbackList);
  
  // Add styles if not already present
  addFeedbackStyles();
}

/**
 * Delete a specific feedback entry
 */
function deleteFeedback(projectId, feedbackId) {
  if (confirm('Are you sure you want to delete this feedback?')) {
    try {
      let projectFeedback = getProjectFeedback(projectId);
      
      // Remove the specific feedback entry
      projectFeedback = projectFeedback.filter(feedback => feedback.id !== feedbackId);
      
      // Save the updated feedback array
      localStorage.setItem(`feedback_${projectId}`, JSON.stringify(projectFeedback));
      
      // Reload the feedback display
      loadFeedback(projectId);
      
      // Update backup
      createFeedbackBackup();
      
      showNotification('Feedback deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting feedback:', error);
      showNotification(`Error deleting feedback: ${error.message}`, 'error');
    }
  }
}

/**
 * Export feedback for a specific project
 */
function exportFeedback(projectId) {
  try {
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
  } catch (error) {
    console.error('Error exporting feedback:', error);
    showNotification(`Error exporting feedback: ${error.message}`, 'error');
  }
}

/**
 * Copy feedback to clipboard
 */
function copyFeedbackToClipboard(projectId) {
  try {
    const projectFeedback = getProjectFeedback(projectId);
    
    if (projectFeedback.length === 0) {
      showNotification('No feedback to copy.', 'error');
      return;
    }
    
    // Format feedback into text
    let feedbackText = `RNA Lab Navigator Feedback - ${projectId}\n\n`;
    
    projectFeedback.forEach(feedback => {
      const date = feedback.date ? new Date(feedback.date).toLocaleString() : 'Unknown date';
      feedbackText += `Date: ${date}\n`;
      feedbackText += `Status: ${formatStatus(feedback.status || 'question')}\n`;
      feedbackText += `From: ${feedback.author || getAuthorName()}\n`;
      feedbackText += "Feedback:\n";
      feedbackText += `${feedback.text || ''}\n\n`;
      feedbackText += "-----------------------------------\n\n";
    });
    
    // Use clipboard API if available, fallback to execCommand
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(feedbackText)
        .then(() => {
          showNotification('Feedback copied to clipboard!', 'success');
        })
        .catch(err => {
          console.error('Failed to copy feedback:', err);
          fallbackCopyToClipboard(feedbackText);
        });
    } else {
      fallbackCopyToClipboard(feedbackText);
    }
  } catch (error) {
    console.error('Error copying feedback:', error);
    showNotification(`Error copying feedback: ${error.message}`, 'error');
  }
}

/**
 * Fallback copy to clipboard using execCommand
 */
function fallbackCopyToClipboard(text) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';  // Prevent scrolling to bottom
    document.body.appendChild(textarea);
    textarea.select();
    
    const successful = document.execCommand('copy');
    
    document.body.removeChild(textarea);
    
    if (successful) {
      showNotification('Feedback copied to clipboard!', 'success');
    } else {
      showNotification('Failed to copy to clipboard. Please try the Export option instead.', 'error');
    }
  } catch (err) {
    console.error('Fallback clipboard copy failed:', err);
    showNotification('Failed to copy to clipboard. Please try the Export option instead.', 'error');
  }
}

/**
 * Show import dialog
 */
function showImportDialog(projectId) {
  try {
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
      <div class="import-message" id="import-validation-message"></div>
      <div class="import-buttons">
        <button class="import-cancel">Cancel</button>
        <button class="import-confirm">Import</button>
      </div>
    `;
    document.body.appendChild(dialog);
    
    // Add validation on input
    const textarea = dialog.querySelector('#import-data');
    const validationMessage = dialog.querySelector('#import-validation-message');
    const importButton = dialog.querySelector('.import-confirm');
    
    textarea.addEventListener('input', function() {
      try {
        if (!this.value.trim()) {
          validationMessage.textContent = '';
          validationMessage.className = 'import-message';
          importButton.disabled = true;
          return;
        }
        
        const data = JSON.parse(this.value);
        if (!data.feedback || !Array.isArray(data.feedback)) {
          validationMessage.textContent = 'Invalid format: Missing feedback array';
          validationMessage.className = 'import-message error';
          importButton.disabled = true;
        } else {
          validationMessage.textContent = `Valid format: Contains ${data.feedback.length} feedback entries`;
          validationMessage.className = 'import-message success';
          importButton.disabled = false;
        }
      } catch (e) {
        validationMessage.textContent = 'Invalid JSON format: ' + e.message;
        validationMessage.className = 'import-message error';
        importButton.disabled = true;
      }
    });
    
    // Add event listeners
    dialog.querySelector('.import-cancel').addEventListener('click', () => {
      document.body.removeChild(overlay);
      document.body.removeChild(dialog);
    });
    
    importButton.addEventListener('click', () => {
      const importText = dialog.querySelector('#import-data').value;
      const result = importFeedback(projectId, importText);
      
      if (result.success) {
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
      } else {
        validationMessage.textContent = result.message;
        validationMessage.className = 'import-message error';
      }
    });
    
    // Focus textarea
    textarea.focus();
  } catch (error) {
    console.error('Error showing import dialog:', error);
    showNotification(`Error showing import dialog: ${error.message}`, 'error');
  }
}

/**
 * Import feedback from JSON
 */
function importFeedback(projectId, jsonData) {
  try {
    if (!jsonData.trim()) {
      return { 
        success: false, 
        message: 'No data provided' 
      };
    }
    
    // Parse JSON data
    const importedData = JSON.parse(jsonData);
    
    // Validate import data structure
    if (!importedData.feedback || !Array.isArray(importedData.feedback)) {
      return { 
        success: false, 
        message: 'Invalid feedback data format: Missing feedback array' 
      };
    }
    
    if (importedData.feedback.length === 0) {
      return { 
        success: false, 
        message: 'No feedback entries found in import data' 
      };
    }
    
    // Get current feedback
    let currentFeedback = getProjectFeedback(projectId);
    
    // Track duplicate entries to avoid importing the same feedback twice
    let newEntries = 0;
    let duplicates = 0;
    const existingIds = new Set(currentFeedback.map(f => f.id));
    
    // Add imported feedback entries
    importedData.feedback.forEach(feedback => {
      // Make sure each feedback has required properties
      const validFeedback = {
        id: feedback.id || Date.now() + Math.floor(Math.random() * 1000),
        project: projectId,
        text: feedback.text || '',
        status: feedback.status || 'question',
        date: feedback.date || new Date().toISOString(),
        author: feedback.author || getAuthorName()
      };
      
      // Check for duplicates
      if (existingIds.has(validFeedback.id)) {
        duplicates++;
      } else {
        currentFeedback.push(validFeedback);
        existingIds.add(validFeedback.id);
        newEntries++;
      }
    });
    
    // Save merged feedback
    localStorage.setItem(`feedback_${projectId}`, JSON.stringify(currentFeedback));
    
    // Update backup
    createFeedbackBackup();
    
    // Reload display
    loadFeedback(projectId);
    
    let message = `Imported ${newEntries} new feedback entries.`;
    if (duplicates > 0) {
      message += ` Skipped ${duplicates} duplicate entries.`;
    }
    
    showNotification(message, 'success');
    
    return {
      success: true,
      message,
      count: newEntries
    };
  } catch (error) {
    console.error('Error importing feedback:', error);
    return { 
      success: false, 
      message: `Import failed: ${error.message}` 
    };
  }
}

/**
 * Email feedback (opens email client)
 */
function emailFeedback(projectId) {
  try {
    const projectFeedback = getProjectFeedback(projectId);
    
    if (projectFeedback.length === 0) {
      showNotification('No feedback to email.', 'error');
      return;
    }
    
    // Format feedback into text
    let feedbackText = `RNA Lab Navigator Feedback - ${projectId}\n\n`;
    
    projectFeedback.forEach(feedback => {
      const date = feedback.date ? new Date(feedback.date).toLocaleString() : 'Unknown date';
      feedbackText += `Date: ${date}\n`;
      feedbackText += `Status: ${formatStatus(feedback.status || 'question')}\n`;
      feedbackText += `From: ${feedback.author || getAuthorName()}\n`;
      feedbackText += "Feedback:\n";
      feedbackText += `${feedback.text || ''}\n\n`;
      feedbackText += "-----------------------------------\n\n";
    });
    
    // Create mailto link
    const subject = encodeURIComponent(`RNA Lab Navigator Feedback - ${projectId}`);
    const body = encodeURIComponent(feedbackText);
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    
    // Open email client
    const mailWindow = window.open(mailtoLink);
    
    // Check if window opened successfully
    if (!mailWindow || mailWindow.closed || typeof mailWindow.closed === 'undefined') {
      // Fallback if mailto fails (common on mobile)
      showNotification('Unable to open email client. Please use the Copy or Export option instead.', 'error');
      // Automatically fall back to copy
      copyFeedbackToClipboard(projectId);
    }
  } catch (error) {
    console.error('Error emailing feedback:', error);
    showNotification(`Error emailing feedback: ${error.message}. Please try the Copy option.`, 'error');
  }
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
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Show a notification message
 */
function showNotification(message, type) {
  try {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('feedback-notification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'feedback-notification';
      document.body.appendChild(notification);
    }
    
    // Clear any existing timeout
    if (notification.timeoutId) {
      clearTimeout(notification.timeoutId);
    }
    
    // Set notification class based on type
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">${message}</div>
      <button class="notification-close">&times;</button>
    `;
    
    // Add close button functionality
    const closeButton = notification.querySelector('.notification-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        notification.style.display = 'none';
      });
    }
    
    // Show notification
    notification.style.display = 'flex';
    
    // Hide after 5 seconds
    notification.timeoutId = setTimeout(() => {
      notification.style.display = 'none';
    }, 5000);
  } catch (error) {
    // Last resort fallback if notification system fails
    console.error('Notification error:', message, error);
    alert(`${type.toUpperCase()}: ${message}`);
  }
}

/**
 * Add CSS styles for feedback system
 */
function addFeedbackStyles() {
  if (document.getElementById('feedback-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'feedback-styles';
  
  style.innerHTML = `
    .feedback-error-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: #e74c3c;
      color: white;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10000;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    
    .feedback-error-message {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .feedback-error-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
    }
    
    .feedback-toolbar {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      border-bottom: 1px solid #eee;
      padding-bottom: 15px;
      flex-wrap: wrap;
    }
    
    .feedback-counter {
      text-align: right;
      color: #7f8c8d;
      font-size: 0.9em;
      margin-bottom: 15px;
    }
    
    .feedback-list {
      max-height: 500px;
      overflow-y: auto;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
    }
    
    .export-feedback-btn,
    .import-feedback-btn,
    .email-feedback-btn,
    .copy-feedback-btn {
      padding: 8px 12px;
      border: none;
      border-radius: 5px;
      color: white;
      cursor: pointer;
      font-size: 0.9em;
      display: flex;
      align-items: center;
      gap: 5px;
      min-width: 80px;
      justify-content: center;
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
    
    .copy-feedback-btn {
      background-color: #f39c12;
    }
    
    .export-feedback-btn:hover,
    .import-feedback-btn:hover,
    .email-feedback-btn:hover,
    .copy-feedback-btn:hover {
      opacity: 0.9;
    }
    
    .export-feedback-btn:disabled,
    .import-feedback-btn:disabled,
    .email-feedback-btn:disabled,
    .copy-feedback-btn:disabled {
      background-color: #95a5a6;
      cursor: not-allowed;
    }
    
    .feedback-entry {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .feedback-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      color: #666;
      font-size: 0.9em;
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
      flex-wrap: wrap;
      gap: 5px;
    }
    
    .feedback-author {
      font-weight: bold;
      color: #2980b9;
    }
    
    .feedback-content {
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
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
      justify-content: space-between;
      align-items: center;
      min-width: 300px;
      max-width: 80vw;
    }
    
    .notification-content {
      flex: 1;
    }
    
    .notification-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      margin-left: 10px;
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
      font-size: 12px;
    }
    
    .import-message {
      margin: 10px 0;
      padding: 5px;
      border-radius: 5px;
    }
    
    .import-message.error {
      background-color: #fde7e7;
      color: #e74c3c;
    }
    
    .import-message.success {
      background-color: #e6f7ee;
      color: #27ae60;
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
    
    .import-buttons button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
    
    /* Mobile Responsiveness */
    @media (max-width: 600px) {
      .feedback-toolbar {
        flex-direction: column;
        align-items: stretch;
      }
      
      .export-feedback-btn,
      .import-feedback-btn,
      .email-feedback-btn,
      .copy-feedback-btn {
        width: 100%;
      }
      
      .feedback-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .import-dialog {
        width: 95%;
        max-height: 90vh;
        overflow-y: auto;
      }
    }
  `;
  
  document.head.appendChild(style);
}