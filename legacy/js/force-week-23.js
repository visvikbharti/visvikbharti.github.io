/**
 * Failsafe script to ensure Week 27 is always shown
 * This script runs on both DOMContentLoaded and window load events
 * Updated with more aggressive enforcement and debugging
 */

function forceShowWeek27() {
    console.log('[Force Week 27] Attempting to display Week 27...');
    
    // Update display elements
    const weekDisplay = document.getElementById('week-display');
    const weekRange = document.getElementById('week-range');
    
    if (weekDisplay) {
        weekDisplay.textContent = "Week 27, 2025";
        console.log('[Force Week 27] Updated week display to Week 27, 2025');
    }
    if (weekRange) {
        weekRange.textContent = "July 15 - July 21, 2025";
        console.log('[Force Week 27] Updated week range');
    }
    
    // Hide all week content divs
    const allWeekContents = document.querySelectorAll('[id^="content-week-"]');
    console.log(`[Force Week 27] Found ${allWeekContents.length} week content divs`);
    allWeekContents.forEach(content => {
        content.style.display = 'none';
        content.style.visibility = 'hidden';
    });
    
    // Show only Week 27 with high priority
    const week27Content = document.getElementById('content-week-27-2025');
    if (week27Content) {
        week27Content.style.display = 'block';
        week27Content.style.visibility = 'visible';
        // Force it to be visible with !important
        week27Content.setAttribute('style', 'display: block !important; visibility: visible !important;');
        console.log('[Force Week 27] Successfully displayed Week 27 content');
    } else {
        console.error('[Force Week 27] Week 27 content not found!');
        // List all content divs for debugging
        console.log('[Force Week 27] Available content divs:', 
            Array.from(document.querySelectorAll('[id^="content-week-"]')).map(el => el.id));
    }
    
    // Update localStorage
    localStorage.setItem('currentDisplayedWeek', '27');
    localStorage.setItem('currentDisplayedYear', '2025');
    
    // Override the CURRENT_WEEK constant if it exists
    if (typeof window.CURRENT_WEEK !== 'undefined') {
        window.CURRENT_WEEK = 27;
    }
    if (typeof window.CURRENT_YEAR !== 'undefined') {
        window.CURRENT_YEAR = 2025;
    }
}

// Run immediately
forceShowWeek27();

// Run on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceShowWeek26);
} else {
    // DOM is already loaded, run again
    forceShowWeek27();
}

// Also run on window load
window.addEventListener('load', forceShowWeek26);

// Run periodically for the first few seconds to ensure it sticks
let attempts = 0;
const forceInterval = setInterval(() => {
    forceShowWeek27();
    attempts++;
    if (attempts >= 10) { // Increased attempts
        clearInterval(forceInterval);
        console.log('[Force Week 27] Stopped forcing after 10 attempts');
    }
}, 300); // Run more frequently

// Additional safeguard: intercept any attempts to change the week
const originalSetTimeout = window.setTimeout;
window.setTimeout = function(fn, delay) {
    // If the function tries to change week display, override it
    const fnString = fn.toString();
    if (fnString.includes('Week 25') || fnString.includes('week-25')) {
        console.warn('[Force Week 27] Blocked attempt to change to Week 25');
        return originalSetTimeout(forceShowWeek26, 100);
    }
    return originalSetTimeout.apply(window, arguments);
};