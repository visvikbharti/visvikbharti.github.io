/**
 * Simplified script to ensure Week 25 is shown by default
 */
document.addEventListener('DOMContentLoaded', function() {
  // Force Week 25 display after a small delay to override any competing scripts
  function forceWeek25() {
    // Directly set week 25 content without observers or complex logic
    const weekDisplay = document.getElementById('week-display');
    const weekRange = document.getElementById('week-range');
    
    if (weekDisplay) weekDisplay.textContent = "Week 25, 2025";
    if (weekRange) weekRange.textContent = "June 17 - June 23, 2025";
    
    // Hide ALL week content divs first
    const allWeekContents = document.querySelectorAll('[id^="content-week-"]');
    allWeekContents.forEach(content => {
      content.style.display = 'none';
    });
    
    // Now show only week 25
    const week25Content = document.getElementById('content-week-25-2025');
    if (week25Content) {
      week25Content.style.display = 'block';
      console.log('Week 25 content displayed');
    } else {
      console.error('Week 25 content not found!');
    }
  }
  
  // Run immediately
  forceWeek25();
  
  // Also run after a short delay to override any other scripts
  setTimeout(forceWeek25, 100);
  setTimeout(forceWeek25, 500);
});