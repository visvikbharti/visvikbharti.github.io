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
    
    if (prevWeekBtn) {
        prevWeekBtn.addEventListener('click', function() {
            navigateWeeks(-1);
        });
    }
    
    if (nextWeekBtn) {
        nextWeekBtn.addEventListener('click', function() {
            navigateWeeks(1);
        });
    }
    
    if (currentWeekBtn) {
        currentWeekBtn.addEventListener('click', function() {
            navigateToCurrentWeek();
        });
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
    if (!weekDisplay) {
        console.error("Week display element not found");
        return;
    }
    
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
        
        console.log(`Navigating to Week ${week}, ${year}`);
        displayWeekData(week, year);
    } else {
        console.error("Could not parse week and year from display text:", displayText);
    }
}

/**
 * Navigate to current week
 */
function navigateToCurrentWeek() {
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();
    
    console.log(`Navigating to current week: Week ${currentWeek}, ${currentYear}`);
    displayWeekData(currentWeek, currentYear);
}

/**
 * Display week data
 * @param {number} week - Week number
 * @param {number} year - Year
 */
function displayWeekData(week, year) {
    const weekDisplay = document.getElementById('week-display');
    if (!weekDisplay) {
        console.error("Week display element not found");
        return;
    }
    
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
    
    // Find the content container
    const contentContainer = document.getElementById('progress-content-container');
    if (!contentContainer) {
        console.error("Progress content container not found");
        return;
    }

    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();
    const isCurrentWeek = (week === currentWeek && year === currentYear);
    
    // For current week, display the current week content
    if (isCurrentWeek) {
        // If we're looking for the live content and we're in Week 15, 2025
        if (week === 15 && year === 2025) {
            // Ensure content is visible
            contentContainer.style.display = 'block';
            contentContainer.classList.add('active');
        } else {
            // For any other current week that isn't specifically modeled, show a placeholder
            contentContainer.innerHTML = `
                <div class="progress-section">
                    <h2>Current Week (${week}, ${year}) Progress</h2>
                    <p>Progress tracking for this week has not started yet.</p>
                </div>
            `;
        }
    } else {
        // For past weeks, check if we have archived content
        if (week === 14 && year === 2025) {
            // Week 14, 2025 has archived content prepared
            const archiveElement = document.getElementById('archive-week-14-2025');
            if (archiveElement) {
                contentContainer.innerHTML = archiveElement.innerHTML;
            } else {
                // Show generic archive content for Week 14, 2025
                contentContainer.innerHTML = `
                    <div class="progress-section">
                        <h2>Week 14, 2025 Progress</h2>
                        <p>This was the week where I started setting up the SRA toolkit and explored the Shin et al. (2020) paper analysis pipeline.</p>
                        <p>Please check the Archives section for more details about this week.</p>
                    </div>
                `;
            }
        } else {
            // Generic content for any other week
            contentContainer.innerHTML = `
                <div class="progress-section">
                    <h2>Week ${week}, ${year} Progress</h2>
                    <p>Progress content for this week is not available.</p>
                    <p>Please return to Current Week for live updates.</p>
                </div>
            `;
        }
        
        // Ensure content is visible
        contentContainer.style.display = 'block';
        contentContainer.classList.add('active');
    }
    
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
    // Load previous feedback first
    loadPreviousFeedback('genexp');
    loadPreviousFeedback('stickforstats');
    
    const saveButtons = document.querySelectorAll('.save-feedback-btn');
    
    saveButtons.forEach(button => {
        button.addEventListener('click', () => {
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
            
            // Save to localStorage
            const feedbackKey = `feedback-${projectId}`;
            let storedFeedback = JSON.parse(localStorage.getItem(feedbackKey) || '[]');
            storedFeedback.push({
                text: feedbackText,
                status: status,
                timestamp: timestamp
            });
            localStorage.setItem(feedbackKey, JSON.stringify(storedFeedback));
            
            // Create a separate email button
            const emailContainer = document.createElement('div');
            emailContainer.style.marginTop = '15px';
            emailContainer.style.padding = '10px';
            emailContainer.style.backgroundColor = '#f8f9fa';
            emailContainer.style.border = '1px solid #ddd';
            emailContainer.style.borderRadius = '5px';
            
            const subject = `Feedback on ${projectId} project from Dr. Debojyoti Chakraborty Sir`;
            const body = `Type: ${status}\nTimestamp: ${timestamp}\n\nFeedback:\n${feedbackText}`;
            
            emailContainer.innerHTML = `
                <p><strong>Feedback saved!</strong> To send this feedback to Vishal Bharti, please:</p>
                <ol>
                    <li>Click the button below to open your email client</li>
                    <li>Send the pre-formatted email that appears</li>
                </ol>
                <a href="mailto:vishalvikashbharti@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}" 
                   style="display: inline-block; background-color: #3498db; color: white; padding: 10px 15px; 
                   text-decoration: none; border-radius: 5px; margin-top: 10px; font-weight: bold;">
                   <i class="fas fa-envelope"></i> Send Feedback via Email
                </a>
            `;
            
            // Insert the email container after the feedback section
            const feedbackSection = document.querySelector(`.pi-feedback-section:has(#pi-feedback-${projectId})`);
            if (feedbackSection && feedbackSection.parentNode) {
                feedbackSection.parentNode.insertBefore(emailContainer, feedbackSection.nextSibling);
            } else {
                // Fallback if :has() selector is not supported
                const allFeedbackSections = document.querySelectorAll('.pi-feedback-section');
                allFeedbackSections.forEach(section => {
                    if (section.querySelector(`#pi-feedback-${projectId}`)) {
                        section.parentNode.insertBefore(emailContainer, section.nextSibling);
                    }
                });
            }
            
            // Clear textarea
            textarea.value = '';
        });
    });
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
    // For debugging
    console.log('Setting up archive interactions');
    
    const archiveHeaders = document.querySelectorAll('.archive-header');
    console.log('Found', archiveHeaders.length, 'archive headers');
    
    archiveHeaders.forEach(header => {
        header.addEventListener('click', function(event) {
            // Prevent default action if needed
            event.preventDefault();
            
            // Log which header was clicked
            console.log('Archive header clicked:', this.textContent.trim());
            
            // Get the parent archive item
            const archiveItem = this.parentElement;
            
            // Toggle the open class
            archiveItem.classList.toggle('open');
            console.log('Toggled open class on archive item');
            
            // If opening and content is placeholder, load content
            const contentDiv = archiveItem.querySelector('.archive-content');
            if (contentDiv && archiveItem.classList.contains('open')) {
                if (contentDiv.textContent.trim() === 'Report content will load dynamically when clicked') {
                    const week = archiveItem.dataset.week;
                    const year = archiveItem.dataset.year;
                    if (week && year) {
                        console.log(`Loading archive content for Week ${week}, ${year}`);
                        loadArchiveContent(contentDiv, week, year);
                    }
                }
            }
        });
    });
}

/**
 * Toggle archive item open/closed state
 * @param {HTMLElement} headerElement - The header element that was clicked
 */
function toggleArchiveItem(headerElement) {
    // Get the parent archive item
    const archiveItem = headerElement.parentElement;
    
    // Toggle the open class
    archiveItem.classList.toggle('open');
    
    // If opening and content is placeholder, load content
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
}

/**
 * Load archive content for a specific week
 * @param {HTMLElement} container - Container to put content in
 * @param {string} week - Week number
 * @param {string} year - Year
 */
function loadArchiveContent(container, week, year) {
    // First, check if we have an existing element with real content for this week
    const existingContentId = `archive-week-${week}-${year}`;
    const existingContentElement = document.getElementById(existingContentId);
    
    if (existingContentElement) {
        // If we have pre-populated content in the HTML, use that
        container.innerHTML = existingContentElement.innerHTML;
    } else {
        // Otherwise, show placeholder content as before
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