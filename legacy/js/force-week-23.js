/**
 * Failsafe script to ensure Week 26 is always shown
 * This script runs on both DOMContentLoaded and window load events
 * Updated with more aggressive enforcement and debugging
 */

function forceShowWeek26() {
    console.log('[Force Week 26] Attempting to display Week 26...');
    
    // Update display elements
    const weekDisplay = document.getElementById('week-display');
    const weekRange = document.getElementById('week-range');
    
    if (weekDisplay) {
        weekDisplay.textContent = "Week 26, 2025";
        console.log('[Force Week 26] Updated week display to Week 26, 2025');
    }
    if (weekRange) {
        weekRange.textContent = "July 1 - July 7, 2025";
        console.log('[Force Week 26] Updated week range');
    }
    
    // Hide all week content divs
    const allWeekContents = document.querySelectorAll('[id^="content-week-"]');
    console.log(`[Force Week 26] Found ${allWeekContents.length} week content divs`);
    allWeekContents.forEach(content => {
        content.style.display = 'none';
        content.style.visibility = 'hidden';
    });
    
    // Show only Week 26 with high priority
    const week26Content = document.getElementById('content-week-26-2025');
    if (week26Content) {
        week26Content.style.display = 'block';
        week26Content.style.visibility = 'visible';
        // Force it to be visible with !important
        week26Content.setAttribute('style', 'display: block !important; visibility: visible !important;');
        console.log('[Force Week 26] Successfully displayed Week 26 content');
    } else {
        console.error('[Force Week 26] Week 26 content not found!');
        // List all content divs for debugging
        console.log('[Force Week 26] Available content divs:', 
            Array.from(document.querySelectorAll('[id^="content-week-"]')).map(el => el.id));
    }
    
    // Update localStorage
    localStorage.setItem('currentDisplayedWeek', '26');
    localStorage.setItem('currentDisplayedYear', '2025');
    
    // Override the CURRENT_WEEK constant if it exists
    if (typeof window.CURRENT_WEEK !== 'undefined') {
        window.CURRENT_WEEK = 26;
    }
    if (typeof window.CURRENT_YEAR !== 'undefined') {
        window.CURRENT_YEAR = 2025;
    }
}

// Run immediately
forceShowWeek26();

// Run on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceShowWeek26);
} else {
    // DOM is already loaded, run again
    forceShowWeek26();
}

// Also run on window load
window.addEventListener('load', forceShowWeek26);

// Run periodically for the first few seconds to ensure it sticks
let attempts = 0;
const forceInterval = setInterval(() => {
    forceShowWeek26();
    attempts++;
    if (attempts >= 10) { // Increased attempts
        clearInterval(forceInterval);
        console.log('[Force Week 26] Stopped forcing after 10 attempts');
    }
}, 300); // Run more frequently

// Additional safeguard: intercept any attempts to change the week
const originalSetTimeout = window.setTimeout;
window.setTimeout = function(fn, delay) {
    // If the function tries to change week display, override it
    const fnString = fn.toString();
    if (fnString.includes('Week 25') || fnString.includes('week-25')) {
        console.warn('[Force Week 26] Blocked attempt to change to Week 25');
        return originalSetTimeout(forceShowWeek26, 100);
    }
    return originalSetTimeout.apply(window, arguments);
};