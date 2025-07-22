/**
 * Set Week 27 as the current week
 * This script ensures Week 27 (July 15-21, 2025) is displayed
 */

(function() {
    'use strict';
    
    // Set Week 27 as current
    const targetWeek = 27;
    const targetYear = 2025;
    const targetRange = "July 15 - July 21, 2025";
    
    function setWeek27() {
        // Update display elements
        const weekDisplay = document.getElementById('week-display');
        const weekRange = document.getElementById('week-range');
        
        if (weekDisplay) {
            weekDisplay.textContent = `Week ${targetWeek}, ${targetYear}`;
        }
        
        if (weekRange) {
            weekRange.textContent = targetRange;
        }
        
        // Hide all week content
        const allWeeks = document.querySelectorAll('[id^="content-week-"]');
        allWeeks.forEach(week => {
            week.style.display = 'none';
        });
        
        // Show Week 27 content
        const week27Content = document.getElementById('content-week-27-2025');
        if (week27Content) {
            week27Content.style.display = 'block';
        }
        
        // Update localStorage
        localStorage.setItem('currentDisplayedWeek', targetWeek.toString());
        localStorage.setItem('currentDisplayedYear', targetYear.toString());
        
        // Update global variables
        if (window.weekManager) {
            window.weekManager.currentWeek = targetWeek;
            window.weekManager.currentYear = targetYear;
        }
        
        console.log('Week 27 set as current week');
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setWeek27);
    } else {
        setWeek27();
    }
    
    // Also run on window load for good measure
    window.addEventListener('load', setWeek27);
    
})();