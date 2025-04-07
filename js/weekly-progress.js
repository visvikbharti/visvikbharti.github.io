/**
 * Enhanced Weekly Progress Tracker JavaScript
 * For Vishal Bharti's Portfolio
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the progress tracker
    initializeProgressTracker();
    
    // Set up editable content sections
    setupEditableContent();
    
    // Set up feedback system
    setupFeedbackSystem();
    
    // Set up archive interactions
    setupArchiveInteractions();
    
    // Initialize the time allocation chart
    initializeTimeAllocationChart();
});

/**
 * Initialize the weekly progress tracker
 */
function initializeProgressTracker() {
    setupWeekNavigation();
    loadCurrentWeekData();
}

/**
 * Set up week navigation buttons
 */
function setupWeekNavigation() {
    const prevWeekBtn = document.getElementById('prev-week');
    const nextWeekBtn = document.getElementById('next-week');
    const currentWeekBtn = document.getElementById('current-week');
    
    if (prevWeekBtn && nextWeekBtn && currentWeekBtn) {
        prevWeekBtn.addEventListener('click', () => navigateWeeks(-1));
        nextWeekBtn.addEventListener('click', () => navigateWeeks(1));
        currentWeekBtn.addEventListener('click', () => navigateToCurrentWeek());
    }
}

/**
 * Load current week's data
 */
function loadCurrentWeekData() {
    // Get current date information
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();
    
    // Load from localStorage or use default
    const storedWeek = localStorage.getItem('currentDisplayedWeek');
    const storedYear = localStorage.getItem('currentDisplayedYear');
    
    if (storedWeek && storedYear) {
        displayWeekData(parseInt(storedWeek), parseInt(storedYear));
    } else {
        displayWeekData(currentWeek, currentYear);
    }
}

/**
 * Navigate between weeks
 * @param {number} direction - Direction to navigate (-1 for previous, 1 for next)
 */
function navigateWeeks(direction) {
    const weekDisplay = document.getElementById('week-display');
    if (!weekDisplay) return;
    
    const displayText = weekDisplay.textContent;
    const matches = displayText.match(/Week (\d+), (\d{4})/);
    
    if (matches && matches.length === 3) {
        let week = parseInt(matches[1]);
        let year = parseInt(matches[2]);
        
        // Calculate new week/year
        week += direction;
        
        // Handle week overflow/underflow
        if (week > 52) {
            week = 1;
            year += 1;
        } else if (week < 1) {
            week = 52;
            year -= 1;
        }
        
        displayWeekData(week, year);
    }
}

/**
 * Navigate to current week
 */
function navigateToCurrentWeek() {
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();
    
    displayWeekData(currentWeek, currentYear);
}

/**
 * Display week data
 * @param {number} week - Week number
 * @param {number} year - Year
 */
function displayWeekData(week, year) {
    const weekDisplay = document.getElementById('week-display');
    if (!weekDisplay) return;
    
    // Update week display
    weekDisplay.textContent = `Week ${week}, ${year}`;
    
    // Store current displayed week/year
    localStorage.setItem('currentDisplayedWeek', week);
    localStorage.setItem('currentDisplayedYear', year);
    
    // Get date range for the week
    const weekRange = getDateRangeOfWeek(week, year);
    const weekRangeDisplay = document.getElementById('week-range');
    
    if (weekRangeDisplay) {
        weekRangeDisplay.textContent = `${formatDate(weekRange.start)} - ${formatDate(weekRange.end)}`;
    }
    
    // Try to load stored content, otherwise keep current content (for this demo)
    // In a full implementation, you would load the appropriate content for the selected week
    
    // Update next/prev week buttons state
    updateNavigationButtonsState(week, year);
}

/**
 * Set up editable content sections
 */
function setupEditableContent() {
    const editableAreas = document.querySelectorAll('[contenteditable="true"]');
    
    editableAreas.forEach(area => {
        const storageKey = area.dataset.storageKey;
        
        // Load saved content if available
        if (storageKey) {
            const savedContent = localStorage.getItem(storageKey);
            if (savedContent) {
                area.innerHTML = savedContent;
            }
        }
        
        // Save content when it changes
        area.addEventListener('blur', () => {
            if (storageKey) {
                localStorage.setItem(storageKey, area.innerHTML);
            }
        });
    });
}

/**
 * Set up feedback system
 */
function setupFeedbackSystem() {
    const saveButtons = document.querySelectorAll('.save-feedback-btn');
    
    saveButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Save feedback button clicked for project:', button.dataset.project);
            const projectId = button.dataset.project;
            const textarea = document.getElementById(`pi-feedback-${projectId}`);
            const statusSelect = document.getElementById(`pi-feedback-status-${projectId}`);
            const previousFeedbackContainer = document.getElementById(`previous-feedback-${projectId}`);
    
            if (!textarea || !statusSelect || !previousFeedbackContainer) {
                console.error("Missing one or more required elements for project", projectId);
                return;
            }
            
            const feedbackText = textarea.value.trim();
            if (!feedbackText) {
                alert('Please enter your feedback before saving.');
                return;
            }
            
            const status = statusSelect.value;
            const timestamp = new Date().toLocaleString();
            
            // Create feedback item and add to display
            const feedbackItem = document.createElement('div');
            feedbackItem.className = `feedback-item ${status}`;
            feedbackItem.innerHTML = `
                <div class="feedback-header">
                    <span>Dr. Debojyoti Chakraborty Sir</span>
                    <span>${timestamp}</span>
                </div>
                <div class="feedback-content">${feedbackText}</div>
            `;
            previousFeedbackContainer.appendChild(feedbackItem);
            
            // Save to localStorage (original functionality)
            const feedbackKey = `feedback-${projectId}`;
            let storedFeedback = JSON.parse(localStorage.getItem(feedbackKey) || '[]');
            storedFeedback.push({
                text: feedbackText,
                status: status,
                timestamp: timestamp
            });
            localStorage.setItem(feedbackKey, JSON.stringify(storedFeedback));
            
            // Construct mailto link
            const subject = `Feedback on ${projectId} project from Dr. Debojyoti Chakraborty Sir`;
            const body = `Type: ${status}\nTimestamp: ${timestamp}\n\nFeedback:\n${feedbackText}\n\n`;
            const mailtoLink = `mailto:vishalvikashbharti@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            console.log("Opening mailto link:", mailtoLink);
            
            // Open email draft (check if popup blockers are disabled)
            // window.open(mailtoLink, '_blank');
            window.location.href = mailtoLink;
            
            // Clear textarea
            textarea.value = '';
            
            alert('Feedback saved and email notification prepared. Please send the email that opened.');
        });
    });
    
    
    // Load previous feedback
    loadPreviousFeedback('genexp');
    loadPreviousFeedback('stickforstats');
}

/**
 * Load previous feedback for a project
 * @param {string} projectId - Project identifier
 */
function loadPreviousFeedback(projectId) {
    const feedbackContainer = document.getElementById(`previous-feedback-${projectId}`);
    if (!feedbackContainer) return;
    
    const feedbackKey = `feedback-${projectId}`;
    const storedFeedback = JSON.parse(localStorage.getItem(feedbackKey) || '[]');
    
    if (storedFeedback.length > 0) {
        storedFeedback.forEach(feedback => {
            const feedbackItem = document.createElement('div');
            feedbackItem.className = `feedback-item ${feedback.status}`;
            feedbackItem.innerHTML = `
                <div class="feedback-header">
                    <span>Dr. Debojyoti Chakraborty Sir</span>
                    <span>${feedback.timestamp}</span>
                </div>
                <div class="feedback-content">${feedback.text}</div>
            `;
            feedbackContainer.appendChild(feedbackItem);
        });
    }
}

/**
 * Set up archive interactions
 */
function setupArchiveInteractions() {
    const archiveHeaders = document.querySelectorAll('.archive-header');
    
    archiveHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const archiveItem = header.parentElement;
            archiveItem.classList.toggle('open');
            
            // If opening and content is empty, load content
            if (archiveItem.classList.contains('open')) {
                const contentDiv = archiveItem.querySelector('.archive-content');
                if (contentDiv && contentDiv.textContent.trim() === 'Report content will load dynamically when clicked') {
                    const week = archiveItem.dataset.week;
                    const year = archiveItem.dataset.year;
                    if (week && year) {
                        loadArchiveContent(contentDiv, week, year);
                    }
                }
            }
        });
    });
}

/**
 * Load archive content for a specific week
 * @param {HTMLElement} container - Container to put content in
 * @param {string} week - Week number
 * @param {string} year - Year
 */
function loadArchiveContent(container, week, year) {
    // For demonstration purposes, we'll just show a placeholder message
    // In a real implementation, you would load the actual content from a server or localStorage
    container.innerHTML = `
        <div class="progress-section">
            <h3>Week ${week}, ${year} Summary</h3>
            <p>This week's focus was on [placeholder content for archived week].</p>
            <p>Key accomplishments:</p>
            <ul>
                <li>Task 1 completed</li>
                <li>Task 2 completed</li>
                <li>Task 3 in progress</li>
            </ul>
            <p>Please visit the archived reports section to view the full details for this week.</p>
        </div>
    `;
}

/**
 * Initialize time allocation chart
 */
function initializeTimeAllocationChart() {
    const chartCanvas = document.getElementById('time-allocation-chart');
    if (!chartCanvas) return;
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        // Add script to load Chart.js
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
        script.onload = () => createTimeAllocationChart(chartCanvas);
        document.head.appendChild(script);
    } else {
        createTimeAllocationChart(chartCanvas);
    }
}

/**
 * Create time allocation chart
 * @param {HTMLCanvasElement} canvas - Canvas element
 */
function createTimeAllocationChart(canvas) {
    // Sample data for the chart
    const data = {
        labels: ['Gene Expression Analysis', 'StickForStats Development', 'Literature Review', 'Meetings', 'Administrative Tasks'],
        datasets: [{
            label: 'Hours',
            data: [15, 12, 5, 3, 2],
            backgroundColor: [
                'rgba(26, 188, 156, 0.7)',
                'rgba(52, 152, 219, 0.7)',
                'rgba(155, 89, 182, 0.7)',
                'rgba(241, 196, 15, 0.7)',
                'rgba(231, 76, 60, 0.7)'
            ],
            borderColor: [
                'rgba(26, 188, 156, 1)',
                'rgba(52, 152, 219, 1)',
                'rgba(155, 89, 182, 1)',
                'rgba(241, 196, 15, 1)',
                'rgba(231, 76, 60, 1)'
            ],
            borderWidth: 1
        }]
    };
    
    // Chart configuration
    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} hours (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };
    
    // Create chart
    new Chart(canvas, config);
}

/**
 * Update navigation buttons state
 * @param {number} week - Week number
 * @param {number} year - Year
 */
function updateNavigationButtonsState(week, year) {
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();
    const currentWeekBtn = document.getElementById('current-week');
    
    // Only enable "Current Week" button if not on current week
    if (currentWeekBtn) {
        if (week === currentWeek && year === currentYear) {
            currentWeekBtn.disabled = true;
        } else {
            currentWeekBtn.disabled = false;
        }
    }
}

/**
 * Get week number for a date
 * @param {Date} date - Date to get week number for
 * @returns {number} Week number
 */
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Get date range for a week
 * @param {number} week - Week number
 * @param {number} year - Year
 * @returns {Object} Object with start and end dates
 */
function getDateRangeOfWeek(week, year) {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = firstDayOfYear.getDay() - 1; // Adjust to start week on Monday
    
    // Calculate first day of the week
    const firstDayOfWeek = new Date(year, 0, (week * 7) - daysOffset);
    
    // Calculate last day of the week
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
    
    return {
        start: firstDayOfWeek,
        end: lastDayOfWeek
    };
}

/**
 * Format a date as a string
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}