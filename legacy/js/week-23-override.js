/**
 * Ultimate Week 39 Override Script
 * This script uses multiple strategies to ensure Week 39 is always displayed
 */

(function() {
    'use strict';

    const TARGET_WEEK = 39;
    const TARGET_YEAR = 2025;
    const TARGET_RANGE = "September 30 - October 6, 2025";

    function absoluteForceWeek39() {
        console.log('[Week 39 Override] Forcing Week 39 display...');

        // Strategy 1: Direct DOM manipulation
        const weekDisplay = document.getElementById('week-display');
        const weekRange = document.getElementById('week-range');

        if (weekDisplay) {
            weekDisplay.textContent = `Week ${TARGET_WEEK}, ${TARGET_YEAR}`;
            weekDisplay.innerHTML = `Week ${TARGET_WEEK}, ${TARGET_YEAR}`;
        }

        if (weekRange) {
            weekRange.textContent = TARGET_RANGE;
            weekRange.innerHTML = TARGET_RANGE;
        }

        // Strategy 2: Hide all weeks then show Week 39
        const allWeeks = document.querySelectorAll('[id^="content-week-"]');
        allWeeks.forEach(el => {
            el.style.cssText = 'display: none !important; visibility: hidden !important;';
            el.classList.remove('active', 'show', 'visible');
        });

        const week39Content = document.getElementById('content-week-39-2025');
        if (week39Content) {
            week39Content.style.cssText = 'display: block !important; visibility: visible !important;';
            week39Content.classList.add('active', 'show', 'visible');
        }
        
        // Strategy 3: Override localStorage
        localStorage.setItem('currentDisplayedWeek', TARGET_WEEK.toString());
        localStorage.setItem('currentDisplayedYear', TARGET_YEAR.toString());
        localStorage.setItem('currentWeek', TARGET_WEEK.toString());
        localStorage.setItem('selectedWeek', TARGET_WEEK.toString());
        
        // Strategy 4: Override window variables
        window.CURRENT_WEEK = TARGET_WEEK;
        window.CURRENT_YEAR = TARGET_YEAR;
        window.currentWeek = TARGET_WEEK;
        window.currentYear = TARGET_YEAR;
        
        // Strategy 5: Disable navigation buttons temporarily
        const prevBtn = document.getElementById('prev-week');
        const nextBtn = document.getElementById('next-week');
        
        if (prevBtn) prevBtn.style.pointerEvents = 'none';
        if (nextBtn) nextBtn.style.pointerEvents = 'none';
        
        // Re-enable after a delay
        setTimeout(() => {
            if (prevBtn) prevBtn.style.pointerEvents = 'auto';
            if (nextBtn) nextBtn.style.pointerEvents = 'auto';
        }, 2000);
    }
    
    // Run immediately
    absoluteForceWeek39();

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', absoluteForceWeek39);
    } else {
        setTimeout(absoluteForceWeek39, 0);
    }

    // Run when window loads
    window.addEventListener('load', absoluteForceWeek39);

    // Run multiple times with delays to ensure persistence
    const delays = [10, 50, 100, 200, 500, 1000, 1500, 2000];
    delays.forEach(delay => {
        setTimeout(absoluteForceWeek39, delay);
    });

    // Periodic check every second for first 10 seconds
    let counter = 0;
    const periodicCheck = setInterval(() => {
        const weekDisplay = document.getElementById('week-display');
        if (weekDisplay && weekDisplay.textContent !== `Week ${TARGET_WEEK}, ${TARGET_YEAR}`) {
            absoluteForceWeek39();
        }
        counter++;
        if (counter > 10) clearInterval(periodicCheck);
    }, 1000);
})();