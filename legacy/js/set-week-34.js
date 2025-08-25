/**
 * Force Week 34 Display
 * August 19 - August 25, 2025
 * Manuscript Completion Week
 */

// Override any stored week values
localStorage.setItem('currentWeek', '34');
localStorage.setItem('currentYear', '2025');

// Set global variables
window.CURRENT_WEEK = 34;
window.CURRENT_YEAR = 2025;

// Force update on page load
document.addEventListener('DOMContentLoaded', function() {
    // Ensure Week 34 is displayed
    const weekDisplay = document.getElementById('current-week-display');
    if (weekDisplay) {
        weekDisplay.textContent = 'Week 34, 2025';
    }
    
    // Update week range display
    const weekRange = document.getElementById('week-range');
    if (weekRange) {
        weekRange.textContent = 'August 19 - August 25, 2025';
    }
    
    // Hide all other week contents
    const allWeekContents = document.querySelectorAll('[id^="content-week-"]');
    allWeekContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Show Week 34 content
    const week34Content = document.getElementById('content-week-34');
    if (week34Content) {
        week34Content.style.display = 'block';
    }
    
    // Highlight Week 34 in archive
    const archiveItems = document.querySelectorAll('.archive-item');
    archiveItems.forEach(item => {
        if (item.getAttribute('data-week') === '34') {
            item.classList.add('current-week');
        } else {
            item.classList.remove('current-week');
        }
    });
    
    console.log('Week 34 (August 19 - August 25, 2025) - Manuscript Completion Week set successfully');
});