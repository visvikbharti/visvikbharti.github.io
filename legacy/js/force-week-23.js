/**
 * Failsafe script to ensure Week 24 is always shown
 * This script runs on both DOMContentLoaded and window load events
 * Updated with more aggressive enforcement and debugging
 */

function forceShowWeek24() {
    console.log('[Force Week 24] Attempting to display Week 24...');
    
    // Update display elements
    const weekDisplay = document.getElementById('week-display');
    const weekRange = document.getElementById('week-range');
    
    if (weekDisplay) {
        weekDisplay.textContent = "Week 24, 2025";
        console.log('[Force Week 24] Updated week display to Week 24, 2025');
    }
    if (weekRange) {
        weekRange.textContent = "June 10 - June 16, 2025";
        console.log('[Force Week 24] Updated week range');
    }
    
    // Hide all week content divs
    const allWeekContents = document.querySelectorAll('[id^="content-week-"]');
    console.log(`[Force Week 24] Found ${allWeekContents.length} week content divs`);
    allWeekContents.forEach(content => {
        content.style.display = 'none';
        content.style.visibility = 'hidden';
    });
    
    // Show only Week 24 with high priority
    const week24Content = document.getElementById('content-week-24-2025');
    if (week24Content) {
        week24Content.style.display = 'block';
        week24Content.style.visibility = 'visible';
        // Force it to be visible with !important
        week24Content.setAttribute('style', 'display: block !important; visibility: visible !important;');
        console.log('[Force Week 24] Successfully displayed Week 24 content');
    } else {
        console.error('[Force Week 24] Week 24 content not found!');
        // List all content divs for debugging
        console.log('[Force Week 24] Available content divs:', 
            Array.from(document.querySelectorAll('[id^="content-week-"]')).map(el => el.id));
    }
    
    // Update localStorage
    localStorage.setItem('currentDisplayedWeek', '24');
    localStorage.setItem('currentDisplayedYear', '2025');
    
    // Override the CURRENT_WEEK constant if it exists
    if (typeof window.CURRENT_WEEK !== 'undefined') {
        window.CURRENT_WEEK = 24;
    }
    if (typeof window.CURRENT_YEAR !== 'undefined') {
        window.CURRENT_YEAR = 2025;
    }
}

// Run immediately
forceShowWeek24();

// Run on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceShowWeek24);
} else {
    // DOM is already loaded, run again
    forceShowWeek24();
}

// Also run on window load
window.addEventListener('load', forceShowWeek24);

// Run periodically for the first few seconds to ensure it sticks
let attempts = 0;
const forceInterval = setInterval(() => {
    forceShowWeek24();
    attempts++;
    if (attempts >= 10) { // Increased attempts
        clearInterval(forceInterval);
        console.log('[Force Week 24] Stopped forcing after 10 attempts');
    }
}, 300); // Run more frequently

// Additional safeguard: intercept any attempts to change the week
const originalSetTimeout = window.setTimeout;
window.setTimeout = function(fn, delay) {
    // If the function tries to change week display, override it
    const fnString = fn.toString();
    if (fnString.includes('Week 23') || fnString.includes('week-23')) {
        console.warn('[Force Week 24] Blocked attempt to change to Week 23');
        return originalSetTimeout(forceShowWeek24, 100);
    }
    return originalSetTimeout.apply(window, arguments);
};