/**
 * Failsafe script to ensure Week 23 is always shown
 * This script runs on both DOMContentLoaded and window load events
 * Updated with more aggressive enforcement and debugging
 */

function forceShowWeek23() {
    console.log('[Force Week 23] Attempting to display Week 23...');
    
    // Update display elements
    const weekDisplay = document.getElementById('week-display');
    const weekRange = document.getElementById('week-range');
    
    if (weekDisplay) {
        weekDisplay.textContent = "Week 23, 2025";
        console.log('[Force Week 23] Updated week display to Week 23, 2025');
    }
    if (weekRange) {
        weekRange.textContent = "June 2 - June 8, 2025";
        console.log('[Force Week 23] Updated week range');
    }
    
    // Hide all week content divs
    const allWeekContents = document.querySelectorAll('[id^="content-week-"]');
    console.log(`[Force Week 23] Found ${allWeekContents.length} week content divs`);
    allWeekContents.forEach(content => {
        content.style.display = 'none';
        content.style.visibility = 'hidden';
    });
    
    // Show only Week 23 with high priority
    const week23Content = document.getElementById('content-week-23-2025');
    if (week23Content) {
        week23Content.style.display = 'block';
        week23Content.style.visibility = 'visible';
        // Force it to be visible with !important
        week23Content.setAttribute('style', 'display: block !important; visibility: visible !important;');
        console.log('[Force Week 23] Successfully displayed Week 23 content');
    } else {
        console.error('[Force Week 23] Week 23 content not found!');
        // List all content divs for debugging
        console.log('[Force Week 23] Available content divs:', 
            Array.from(document.querySelectorAll('[id^="content-week-"]')).map(el => el.id));
    }
    
    // Update localStorage
    localStorage.setItem('currentDisplayedWeek', '23');
    localStorage.setItem('currentDisplayedYear', '2025');
    
    // Override the CURRENT_WEEK constant if it exists
    if (typeof window.CURRENT_WEEK !== 'undefined') {
        window.CURRENT_WEEK = 23;
    }
    if (typeof window.CURRENT_YEAR !== 'undefined') {
        window.CURRENT_YEAR = 2025;
    }
}

// Run immediately
forceShowWeek23();

// Run on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceShowWeek23);
} else {
    // DOM is already loaded, run again
    forceShowWeek23();
}

// Also run on window load
window.addEventListener('load', forceShowWeek23);

// Run periodically for the first few seconds to ensure it sticks
let attempts = 0;
const forceInterval = setInterval(() => {
    forceShowWeek23();
    attempts++;
    if (attempts >= 10) { // Increased attempts
        clearInterval(forceInterval);
        console.log('[Force Week 23] Stopped forcing after 10 attempts');
    }
}, 300); // Run more frequently

// Additional safeguard: intercept any attempts to change the week
const originalSetTimeout = window.setTimeout;
window.setTimeout = function(fn, delay) {
    // If the function tries to change week display, override it
    const fnString = fn.toString();
    if (fnString.includes('Week 22') || fnString.includes('week-22')) {
        console.warn('[Force Week 23] Blocked attempt to change to Week 22');
        return originalSetTimeout(forceShowWeek23, 100);
    }
    return originalSetTimeout.apply(window, arguments);
};