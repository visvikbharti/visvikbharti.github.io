/**
 * Weekly Progress Navigation Fix
 * Resolves issues with the weekly progress tracker navigation buttons
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Enhanced weekly progress navigation initializing...");
    
    // Initialize navigation buttons with improved selectors
    initializeWeeklyNavigation();
    
    // Setup archive interactions
    initializeArchiveSystem();
  });
  
  /**
   * Initialize the weekly progress navigation
   * Uses multiple selector strategies to ensure buttons are found
   */
  function initializeWeeklyNavigation() {
    // Try different selector strategies to find the buttons
    const prevWeekBtn = document.querySelector('#prev-week') || 
                        document.querySelector('.nav-button[aria-label="Previous week"]') || 
                        document.querySelector('button[aria-label="Previous week"]') ||
                        document.querySelector('button:first-child.progress-nav-button');
    
    const nextWeekBtn = document.querySelector('#next-week') || 
                        document.querySelector('.nav-button[aria-label="Next week"]') || 
                        document.querySelector('button[aria-label="Next week"]') ||
                        document.querySelector('button:last-child.progress-nav-button');
    
    const currentWeekBtn = document.querySelector('#current-week') || 
                           document.querySelector('.nav-button[aria-label="Current week"]') || 
                           document.querySelector('button[aria-label="Current week"]');
    
    console.log("Navigation buttons found:", 
                { prev: !!prevWeekBtn, current: !!currentWeekBtn, next: !!nextWeekBtn });
    
    // Add click event handlers with both standard and direct methods
    if (prevWeekBtn) {
      // Remove existing listeners to prevent duplicates
      prevWeekBtn.removeEventListener('click', navigatePrevWeek);
      // Add the new listener
      prevWeekBtn.addEventListener('click', navigatePrevWeek);
      // Add a data attribute for debugging
      prevWeekBtn.setAttribute('data-nav-initialized', 'true');
    }
    
    if (nextWeekBtn) {
      nextWeekBtn.removeEventListener('click', navigateNextWeek);
      nextWeekBtn.addEventListener('click', navigateNextWeek);
      nextWeekBtn.setAttribute('data-nav-initialized', 'true');
    }
    
    if (currentWeekBtn) {
      currentWeekBtn.removeEventListener('click', navigateCurrentWeek);
      currentWeekBtn.addEventListener('click', navigateCurrentWeek);
      currentWeekBtn.setAttribute('data-nav-initialized', 'true');
    }
    
    // For buttons without IDs, try to add IDs for easier referencing
    if (prevWeekBtn && !prevWeekBtn.id) prevWeekBtn.id = 'prev-week';
    if (nextWeekBtn && !nextWeekBtn.id) nextWeekBtn.id = 'next-week';
    if (currentWeekBtn && !currentWeekBtn.id) currentWeekBtn.id = 'current-week';
  }
  
  /**
   * Navigate to the previous week
   * Standalone function to avoid scope issues
   * @param {Event} e - The click event
   */
  function navigatePrevWeek(e) {
    e.preventDefault();
    console.log("Navigating to previous week");
    navigateWeeks(-1);
  }
  
  /**
   * Navigate to the next week
   * @param {Event} e - The click event
   */
  function navigateNextWeek(e) {
    e.preventDefault();
    console.log("Navigating to next week");
    navigateWeeks(1);
  }
  
  /**
   * Navigate to the current week
   * @param {Event} e - The click event
   */
  function navigateCurrentWeek(e) {
    e.preventDefault();
    console.log("Navigating to current week");
    
    // For testing purposes, we're using Week 15, 2025 as the "current" week
    // In a production environment, you would calculate the actual current week
    displayWeekData(15, 2025);
  }
  
  /**
   * Navigate between weeks
   * @param {number} direction - Direction to navigate (-1 for previous, 1 for next)
   */
  function navigateWeeks(direction) {
    // Find the week display using multiple selector strategies
    const weekDisplay = document.querySelector('#week-display') || 
                       document.querySelector('.week-display') ||
                       document.querySelector('div[id*="week-display"]');
    
    if (!weekDisplay) {
      console.error("Week display element not found");
      return;
    }
    
    const displayText = weekDisplay.textContent.trim();
    const matches = displayText.match(/Week (\d+),?\s+(\d{4})/);
    
    if (matches && matches.length === 3) {
      let week = parseInt(matches[1]);
      let year = parseInt(matches[2]);
      
      console.log(`Current week: ${week}, year: ${year}`);
      
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
   * Display week data
   * @param {number} week - Week number
   * @param {number} year - Year
   */
  function displayWeekData(week, year) {
    // Find elements using multiple selector strategies
    const weekDisplay = document.querySelector('#week-display') || 
                       document.querySelector('.week-display') ||
                       document.querySelector('div[id*="week-display"]');
    
    const weekRangeDisplay = document.querySelector('#week-range') || 
                            document.querySelector('.week-range') ||
                            document.querySelector('div[id*="week-range"]');
    
    if (!weekDisplay) {
      console.error("Week display element not found");
      return;
    }
    
    // Update week display
    weekDisplay.textContent = `Week ${week}, ${year}`;
    
    // Store current displayed week/year in localStorage for persistence
    localStorage.setItem('currentDisplayedWeek', week);
    localStorage.setItem('currentDisplayedYear', year);
    
    // Update date range if element exists
    if (weekRangeDisplay) {
      const weekRange = getDateRangeOfWeek(week, year);
      weekRangeDisplay.textContent = `${formatDate(weekRange.start)} - ${formatDate(weekRange.end)}`;
    }
    
    // Toggle visibility of content based on selected week
    const weekContentElements = document.querySelectorAll('[id^="content-week-"]');
    const targetContentId = `content-week-${week}-${year}`;
    let targetContentFound = false;
    
    weekContentElements.forEach(element => {
      if (element.id === targetContentId) {
        element.style.display = 'block';
        targetContentFound = true;
      } else {
        element.style.display = 'none';
      }
    });
    
    // If content for the selected week is not found, create placeholder
    if (!targetContentFound) {
      createPlaceholderContent(week, year);
    }
    
    // Update button states
    updateNavigationButtonsState(week, year);
  }
  
  /**
   * Create placeholder content for weeks without specific content
   * @param {number} week - Week number
   * @param {number} year - Year
   */
  function createPlaceholderContent(week, year) {
    // Find the content container
    const weekContent = document.querySelector('#week-content') || 
                       document.querySelector('.week-content') ||
                       document.querySelector('div[id*="content"]');
    
    if (!weekContent) {
      console.error("Week content container not found");
      return;
    }
    
    // Check if placeholder already exists
    let placeholder = document.getElementById('content-placeholder');
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.id = 'content-placeholder';
      weekContent.appendChild(placeholder);
    }
    
    placeholder.innerHTML = `
      <div class="progress-section">
        <h3>Week ${week}, ${year}</h3>
        <p>Progress report for this week is not available.</p>
        <p>Please navigate to Week 15, 2025 to view the current progress report.</p>
      </div>
    `;
    
    placeholder.style.display = 'block';
  }
  
  /**
   * Get date range for a week
   * @param {number} week - Week number
   * @param {number} year - Year
   * @returns {Object} Object with start and end dates
   */
  function getDateRangeOfWeek(week, year) {
    // Calculate first day of the week (assuming Monday as first day)
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = firstDayOfYear.getDay() - 1; // Adjust for Monday
    
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
   * Update navigation buttons state
   * @param {number} week - Week number
   * @param {number} year - Year
   */
  function updateNavigationButtonsState(week, year) {
    // Find the current week button
    const currentWeekBtn = document.querySelector('#current-week') || 
                          document.querySelector('button[aria-label="Current week"]') ||
                          document.querySelector('.nav-button[aria-label="Current week"]');
    
    if (!currentWeekBtn) return;
    
    // For this example, we'll consider Week 15, 2025 as the "current" week
    // In a production environment, you would calculate the actual current week
    if (week === 15 && year === 2025) {
      currentWeekBtn.disabled = true;
    } else {
      currentWeekBtn.disabled = false;
    }
  }
  
  /**
   * Initialize archive interactions system
   */
  function initializeArchiveSystem() {
    // Find all archive headers using multiple selectors
    const archiveHeaders = document.querySelectorAll('.archive-header, .archive-toggle, [data-toggle="archive"]');
    
    console.log(`Found ${archiveHeaders.length} archive headers`);
    
    archiveHeaders.forEach(header => {
      // Remove existing click listeners to prevent duplicates
      header.removeEventListener('click', toggleArchiveContent);
      
      // Add new click listener
      header.addEventListener('click', toggleArchiveContent);
      
      // Add a data attribute for debugging
      header.setAttribute('data-archive-initialized', 'true');
    });
    
    // Set up report view buttons
    const reportButtons = document.querySelectorAll('.view-report-btn, .load-report-btn');
    
    reportButtons.forEach(button => {
      // Remove existing click listeners to prevent duplicates
      button.removeEventListener('click', handleReportButtonClick);
      
      // Add new click listener
      button.addEventListener('click', handleReportButtonClick);
    });
  }
  
  /**
   * Toggle archive content visibility
   * @param {Event} e - The click event
   */
  function toggleArchiveContent(e) {
    e.preventDefault();
    console.log('Archive header clicked');
    
    // Find the parent archive item
    const archiveItem = this.closest('.archive-item') || this.parentElement;
    
    if (!archiveItem) {
      console.error('Could not find parent archive item');
      return;
    }
    
    // Toggle the open class
    archiveItem.classList.toggle('open');
    
    // Find and toggle content visibility
    const contentDiv = archiveItem.querySelector('.archive-content');
    if (contentDiv) {
      if (archiveItem.classList.contains('open')) {
        contentDiv.style.display = 'block';
        
        // Animate chevron if it exists
        const chevron = this.querySelector('.fa-chevron-down');
        if (chevron) {
          chevron.style.transform = 'rotate(180deg)';
        }
        
        // Load content if it's a placeholder
        if (contentDiv.textContent.trim() === 'Report content will load dynamically when clicked') {
          const week = archiveItem.dataset.week;
          const year = archiveItem.dataset.year;
          
          if (week && year) {
            loadArchiveContent(contentDiv, week, year);
          }
        }
      } else {
        contentDiv.style.display = 'none';
        
        // Reset chevron rotation if it exists
        const chevron = this.querySelector('.fa-chevron-down');
        if (chevron) {
          chevron.style.transform = '';
        }
      }
    }
  }
  
  /**
   * Handle report button clicks
   * @param {Event} e - The click event
   */
  function handleReportButtonClick(e) {
    e.preventDefault();
    
    const week = this.dataset.week;
    const year = this.dataset.year;
    
    if (week && year) {
      console.log(`Loading report for Week ${week}, ${year}`);
      displayWeekData(parseInt(week), parseInt(year));
    }
  }
  
  /**
   * Load archive content for a specific week
   * @param {HTMLElement} container - Container to put content in
   * @param {string} week - Week number
   * @param {string} year - Year
   */
  function loadArchiveContent(container, week, year) {
    console.log(`Loading archive content for Week ${week}, ${year}`);
    
    // Check for special case Week 14, 2025 with pre-defined content
    if (week === '14' && year === '2025') {
      container.innerHTML = `
        <div class="progress-section">
          <h3>Week 14, 2025 Summary</h3>
          <p>This week focused on SRA toolkit setup and initial download attempts.</p>
          <p>Key accomplishments:</p>
          <ul>
            <li>Thoroughly read the Shin et al. (2020) paper</li>
            <li>Drafted analysis pipeline for single-cell data</li>
            <li>Installed SRA toolkit and initiated data downloads</li>
            <li>Encountered institute Wi-Fi issues hindering downloads</li>
          </ul>
          <button class="nav-button" onclick="displayWeekData(14, 2025)">View Full Report</button>
        </div>
      `;
    } else {
      // Default generic content for other weeks
      container.innerHTML = `
        <div class="progress-section">
          <h3>Week ${week}, ${year} Summary</h3>
          <p>This week's progress has been archived.</p>
          <p>Key activities:</p>
          <ul>
            <li>Research progress</li>
            <li>Development activities</li>
            <li>Project coordination</li>
          </ul>
          <button class="nav-button" onclick="displayWeekData(${week}, ${year})">View Full Report</button>
        </div>
      `;
    }
  }
  
  // Call initialization on load and also after a short delay to handle dynamic content
  window.addEventListener('load', function() {
    // Immediate initialization
    initializeWeeklyNavigation();
    initializeArchiveSystem();
    
    // Delayed initialization to catch dynamically loaded content
    setTimeout(function() {
      initializeWeeklyNavigation();
      initializeArchiveSystem();
    }, 500);
  });
  
  // Re-initialize after any AJAX content loads
  document.addEventListener('DOMContentLoaded', function() {
    // Listen for potential custom events that might indicate content loading
    document.addEventListener('contentLoaded', function() {
      initializeWeeklyNavigation();
      initializeArchiveSystem();
    });
    
    // Also re-initialize on window resize in case of responsive layout changes
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        initializeWeeklyNavigation();
        initializeArchiveSystem();
      }, 250);
    });
  });