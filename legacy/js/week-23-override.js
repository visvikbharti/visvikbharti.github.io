/**
 * Ultimate Week 24 Override Script
 * This script uses multiple strategies to ensure Week 24 is always displayed
 */

(function() {
    'use strict';
    
    const TARGET_WEEK = 25;
    const TARGET_YEAR = 2025;
    const TARGET_RANGE = "June 17 - June 23, 2025";
    
    function absoluteForceWeek25() {
        console.log('[Week 25 Override] Forcing Week 25 display...');
        
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
        
        // Strategy 2: Hide all weeks then show Week 24
        const allWeeks = document.querySelectorAll('[id^="content-week-"]');
        allWeeks.forEach(el => {
            el.style.cssText = 'display: none !important; visibility: hidden !important;';
            el.classList.remove('active', 'show', 'visible');
        });
        
        const week25Content = document.getElementById('content-week-25-2025');
        if (week25Content) {
            week25Content.style.cssText = 'display: block !important; visibility: visible !important;';
            week25Content.classList.add('active', 'show', 'visible');
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
        
        // Strategy 5: Disable week navigation temporarily
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
    
    // Strategy 6: Override any function that might change the week
    const originalQuerySelector = document.querySelector;
    document.querySelector = function(selector) {
        const result = originalQuerySelector.call(document, selector);
        if (selector === '#week-display' && result) {
            setTimeout(() => {
                if (result.textContent !== `Week ${TARGET_WEEK}, ${TARGET_YEAR}`) {
                    absoluteForceWeek25();
                }
            }, 0);
        }
        return result;
    };
    
    // Run immediately
    absoluteForceWeek25();
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', absoluteForceWeek25);
    } else {
        setTimeout(absoluteForceWeek25, 0);
    }
    
    // Run when window loads
    window.addEventListener('load', absoluteForceWeek25);
    
    // Run multiple times with delays
    const delays = [10, 50, 100, 200, 500, 1000, 1500, 2000];
    delays.forEach(delay => {
        setTimeout(absoluteForceWeek25, delay);
    });
    
    // Monitor for changes
    let observerActive = false;
    function startObserver() {
        if (observerActive || typeof MutationObserver === 'undefined') return;
        
        const observer = new MutationObserver((mutations) => {
            const weekDisplay = document.getElementById('week-display');
            if (weekDisplay && weekDisplay.textContent !== `Week ${TARGET_WEEK}, ${TARGET_YEAR}`) {
                absoluteForceWeek25();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
        
        observerActive = true;
        
        // Stop observing after 5 seconds to prevent performance issues
        setTimeout(() => {
            observer.disconnect();
            observerActive = false;
        }, 5000);
    }
    
    // Start observer when ready
    if (document.body) {
        startObserver();
    } else {
        document.addEventListener('DOMContentLoaded', startObserver);
    }
    
})();