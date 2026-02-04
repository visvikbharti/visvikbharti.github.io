/**
 * Week 5, 2026 Initial Load Script
 * This script ensures Week 5 (2026) is displayed on initial page load,
 * but allows normal navigation to other weeks afterward
 */

(function() {
    'use strict';

    const TARGET_WEEK = 5;
    const TARGET_YEAR = 2026;
    const TARGET_RANGE = "January 25 - February 1, 2026";

    // Flag to track if user has navigated
    let userHasNavigated = false;

    function setInitialWeek() {
        // Only run if user hasn't started navigating
        if (userHasNavigated) return;

        console.log('[Week 5 Init] Setting initial Week 5, 2026 display...');

        // Update week display header
        const weekDisplay = document.getElementById('week-display');
        const weekRange = document.getElementById('week-range');

        if (weekDisplay) {
            weekDisplay.textContent = `Week ${TARGET_WEEK}, ${TARGET_YEAR}`;
        }

        if (weekRange) {
            weekRange.textContent = TARGET_RANGE;
        }

        // Hide all weeks then show Week 5, 2026
        const allWeeks = document.querySelectorAll('[id^="content-week-"]');
        allWeeks.forEach(el => {
            el.style.display = 'none';
        });

        const weekContent = document.getElementById('content-week-5-2026');
        if (weekContent) {
            weekContent.style.display = 'block';
        }

        // Set localStorage for current display
        localStorage.setItem('currentDisplayedWeek', TARGET_WEEK.toString());
        localStorage.setItem('currentDisplayedYear', TARGET_YEAR.toString());
    }

    // Listen for navigation clicks to stop overriding
    function setupNavigationListeners() {
        const prevBtn = document.getElementById('prev-week');
        const nextBtn = document.getElementById('next-week');
        const archiveButtons = document.querySelectorAll('.view-report-btn');
        const archiveItems = document.querySelectorAll('.archive-item');

        const markNavigated = () => {
            userHasNavigated = true;
            console.log('[Week 5 Init] User navigation detected, override disabled');
        };

        if (prevBtn) prevBtn.addEventListener('click', markNavigated);
        if (nextBtn) nextBtn.addEventListener('click', markNavigated);

        archiveButtons.forEach(btn => btn.addEventListener('click', markNavigated));
        archiveItems.forEach(item => item.addEventListener('click', markNavigated));
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setInitialWeek();
            setupNavigationListeners();
        });
    } else {
        setInitialWeek();
        setupNavigationListeners();
    }

    // Run once more after a short delay to ensure it takes effect
    setTimeout(() => {
        if (!userHasNavigated) {
            setInitialWeek();
        }
    }, 100);
})();
