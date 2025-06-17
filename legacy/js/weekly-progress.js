/**
 * Enhanced Weekly Progress Tracker JavaScript
 * For Vishal Bharti's Portfolio
 */

// Define available weeks data
const AVAILABLE_WEEKS = {
    17: { year: 2025, range: "April 21 - April 27, 2025" },
    18: { year: 2025, range: "April 28 - May 4, 2025" },
    19: { year: 2025, range: "May 5 - May 11, 2025" },
    20: { year: 2025, range: "May 12 - May 18, 2025" },
    22: { year: 2025, range: "May 26 - June 1, 2025" },
    23: { year: 2025, range: "June 2 - June 8, 2025" },
    24: { year: 2025, range: "June 10 - June 16, 2025" }
};

// Current week should be Week 24
const CURRENT_WEEK = 24;
const CURRENT_YEAR = 2025;

// Make these available globally
window.CURRENT_WEEK = CURRENT_WEEK;
window.CURRENT_YEAR = CURRENT_YEAR;

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
    
    // Set up PDF generation
    setupPDFGeneration();
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
    // Always show Week 24, 2025 regardless of date or stored values
    const currentWeek = CURRENT_WEEK;
    const currentYear = CURRENT_YEAR;
    
    // First, hide ALL week content divs
    const allWeekContents = document.querySelectorAll('[id^="content-week-"]');
    allWeekContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Force Week 24, 2025 to be displayed
    displayWeekData(currentWeek, currentYear);
    
    // Also store it in localStorage
    localStorage.setItem('currentDisplayedWeek', currentWeek);
    localStorage.setItem('currentDisplayedYear', currentYear);
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
    // Instead of current week, always show Week 24, 2025
    const currentWeek = CURRENT_WEEK;
    const currentYear = CURRENT_YEAR;
    
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
    
    // Hide all week content divs first
    const allWeekContents = document.querySelectorAll('[id^="content-week-"]');
    allWeekContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Show the specific week content
    const weekContentId = `content-week-${week}-${year}`;
    const weekContent = document.getElementById(weekContentId);
    if (weekContent) {
        weekContent.style.display = 'block';
        console.log(`Showing content for ${weekContentId}`);
    } else {
        console.log(`Week content not found: ${weekContentId}`);
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
    
    // Re-setup PDF generation after week change
    setupPDFGeneration();
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
    loadPreviousFeedback('muscle-hdr');
    loadPreviousFeedback('integration-2');
    
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

/**
 * Set up PDF generation functionality
 */
function setupPDFGeneration() {
    // Check if html2pdf.js is already loaded
    if (typeof html2pdf === 'undefined') {
        // Load html2pdf.js dynamically if not already loaded
        const scriptExists = document.querySelector('script[src*="html2pdf"]');
        if (!scriptExists) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.async = true;
            script.onload = () => setupReportGenerationListeners();
            document.head.appendChild(script);
        } else {
            // If script exists but hasn't loaded yet, wait for it
            setTimeout(setupReportGenerationListeners, 500);
        }
    } else {
        // If html2pdf is already loaded, set up listeners directly
        setupReportGenerationListeners();
    }
}

/**
 * Set up event listeners for report generation
 */
function setupReportGenerationListeners() {
    // Check if the download buttons exist and add listeners
    const downloadButtons = document.querySelectorAll('.report-download-btn');
    
    downloadButtons.forEach(button => {
        if (button.getAttribute('data-listener') !== 'true') {
            button.setAttribute('data-listener', 'true');
            
            button.addEventListener('click', function(e) {
                // Prevent the default download behavior to generate PDF first
                e.preventDefault();
                
                // Get the project identifier from the button's data attribute
                const projectId = this.getAttribute('data-project') || 'project-report';
                
                // Find the relevant section to capture
                const sectionId = this.getAttribute('data-section') || 
                               this.closest('.progress-section').id || 
                               document.querySelector('.progress-content.active').firstElementChild.id;
                
                const section = document.getElementById(sectionId) || 
                              this.closest('.progress-section') || 
                              document.querySelector('.progress-section');
                
                if (section) {
                    generatePDF(section, projectId);
                } else {
                    console.error('Could not find section to generate PDF from');
                    alert('Error: Could not find the content section to generate PDF. Please try again.');
                }
            });
        }
    });
}

/**
 * Generate PDF from the provided content
 * @param {HTMLElement} element - HTML element to convert to PDF
 * @param {string} filename - Name for the PDF file
 */
function generatePDF(element, filename) {
    // Show loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.className = 'pdf-loading';
    loadingEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
    loadingEl.style.position = 'fixed';
    loadingEl.style.top = '50%';
    loadingEl.style.left = '50%';
    loadingEl.style.transform = 'translate(-50%, -50%)';
    loadingEl.style.padding = '20px';
    loadingEl.style.background = 'rgba(0,0,0,0.7)';
    loadingEl.style.color = 'white';
    loadingEl.style.borderRadius = '5px';
    loadingEl.style.zIndex = '9999';
    document.body.appendChild(loadingEl);
    
    // Clone the element to avoid modifying the original
    const clonedElement = element.cloneNode(true);
    
    // Remove elements we don't want in the PDF
    const elementsToRemove = clonedElement.querySelectorAll('.feedback-container, .editable-section button, .pi-feedback-section, .download-report');
    elementsToRemove.forEach(el => el.parentNode.removeChild(el));
    
    // Make editable content non-editable
    const editableContent = clonedElement.querySelectorAll('[contenteditable="true"]');
    editableContent.forEach(el => el.removeAttribute('contenteditable'));
    
    // Add a title to the PDF
    const title = document.createElement('div');
    title.classList.add('pdf-title');
    title.innerHTML = `<h1>Muscle HDR-scRNA Analysis Pipeline</h1>
                       <h2>Weekly Technical Report</h2>
                       <h3>${getCurrentDateRange()}</h3>
                       <p>Prepared by: Vishal Bharti</p>
                       <p>Project Associate-II at IGIB CSIR</p>`;
    title.style.textAlign = 'center';
    title.style.marginBottom = '30px';
    clonedElement.insertBefore(title, clonedElement.firstChild);
    
    // Add project information
    const projectInfo = document.createElement('div');
    projectInfo.classList.add('project-info');
    projectInfo.innerHTML = `
        <div style="margin-bottom: 20px; padding: 10px; border-left: 4px solid #1976d2; background-color: #f5f5f5;">
            <p><strong>Project:</strong> Muscle HDR-scRNA Analysis Pipeline</p>
            <p><strong>PI:</strong> Dr. Debojyoti Chakraborty</p>
            <p><strong>Institution:</strong> Institute of Genomics and Integrative Biology (CSIR-IGIB)</p>
        </div>
    `;
    clonedElement.insertBefore(projectInfo, title.nextSibling);

    // Page style for PDF
    const pageStyle = `
        @page {
            margin: 1cm;
            size: A4;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            line-height: 1.5;
            color: #333;
        }
        .pdf-title {
            text-align: center;
            margin-bottom: 20px;
        }
        .pdf-title h1 {
            color: #1976d2;
            margin-bottom: 5px;
        }
        .pdf-title h2 {
            color: #555;
            margin-top: 0;
            margin-bottom: 10px;
        }
        .pdf-title h3 {
            color: #777;
            font-weight: normal;
            margin-top: 0;
        }
        .progress-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 10pt;
        }
        .progress-table th, .progress-table td {
            border: 1px solid #ddd;
            padding: 8px;
        }
        .progress-table th {
            background-color: #f2f2f2;
            text-align: left;
        }
        .progress-table td p {
            margin: 5px 0;
        }
        h3 {
            color: #1976d2;
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
            margin-top: 25px;
        }
        h4 {
            color: #2196f3;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        ul {
            margin-top: 5px;
        }
        .project-info {
            margin-bottom: 20px;
        }
    `;

    // Configure html2pdf options
    const opt = {
        margin: [15, 15, 20, 15], // top, right, bottom, left
        filename: `${filename}_report.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Generate PDF
    html2pdf().set(opt).from(clonedElement).toPdf().get('pdf').then(function(pdf) {
        // Add header and footer to each page
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            
            // Header with logo or text (simplified for now)
            pdf.setFontSize(8);
            pdf.setTextColor(100);
            const headerText = "CSIR-IGIB | Muscle HDR-scRNA Analysis Pipeline";
            pdf.text(headerText, 15, 10);
            
            // Footer with page number
            pdf.setFontSize(8);
            pdf.setTextColor(100);
            const footerText = `Page ${i} of ${totalPages} | Generated on ${new Date().toLocaleDateString()}`;
            pdf.text(footerText, pdf.internal.pageSize.getWidth() - 15, pdf.internal.pageSize.getHeight() - 10, {align: 'right'});
            
            // Add author info to footer
            const authorText = "Vishal Bharti | Project Associate-II at IGIB CSIR";
            pdf.text(authorText, 15, pdf.internal.pageSize.getHeight() - 10);
        }
        return pdf;
    }).save().then(function() {
        // Remove loading indicator
        document.body.removeChild(loadingEl);
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'pdf-success';
        successMsg.innerHTML = '<i class="fas fa-check-circle"></i> PDF generated successfully!';
        successMsg.style.position = 'fixed';
        successMsg.style.top = '10%';
        successMsg.style.left = '50%';
        successMsg.style.transform = 'translateX(-50%)';
        successMsg.style.padding = '15px 25px';
        successMsg.style.background = 'rgba(46, 204, 113, 0.9)';
        successMsg.style.color = 'white';
        successMsg.style.borderRadius = '5px';
        successMsg.style.zIndex = '9999';
        document.body.appendChild(successMsg);
        
        // Remove success message after 3 seconds
        setTimeout(() => {
            document.body.removeChild(successMsg);
        }, 3000);
    }).catch(function(error) {
        // Remove loading indicator
        document.body.removeChild(loadingEl);
        
        // Show error message
        console.error('PDF generation error:', error);
        alert('Error generating PDF: ' + (error.message || 'Unknown error'));
    });
}

/**
 * Get current date range for reporting
 * @returns {string} Formatted date range string
 */
function getCurrentDateRange() {
    // Get current week info from the page
    const weekDisplay = document.getElementById('week-display');
    const weekRange = document.getElementById('week-range');
    
    if (weekDisplay && weekRange) {
        return `${weekDisplay.textContent} (${weekRange.textContent})`;
    }
    
    // Fallback to current date
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString(undefined, options);
}

// Setup observer to call setupPDFGeneration when DOM changes
function setupObserver() {
    // Options for the observer (which mutations to observe)
    const config = { childList: true, subtree: true };
    
    // Callback function to execute when mutations are observed
    const callback = function(mutationsList, observer) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                setupPDFGeneration();
            }
        }
    };
    
    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);
    
    // Start observing the target node for configured mutations
    observer.observe(document.querySelector('#week-content') || document.body, config);
}

// Call the setup observer function on page load
window.addEventListener('load', setupObserver);