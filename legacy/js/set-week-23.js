/**
 * Simplified script to ensure Week 27 is shown by default
 */
document.addEventListener('DOMContentLoaded', function() {
  // Force Week 27 display after a small delay to override any competing scripts
  function forceWeek27() {
    // Directly set week 26 content without observers or complex logic
    const weekDisplay = document.getElementById('week-display');
    const weekRange = document.getElementById('week-range');
    
    if (weekDisplay) weekDisplay.textContent = "Week 27, 2025";
    if (weekRange) weekRange.textContent = "July 15 - July 21, 2025";
    
    // Hide ALL week content divs first
    const allWeekContents = document.querySelectorAll('[id^="content-week-"]');
    allWeekContents.forEach(content => {
      content.style.display = 'none';
    });
    
    // Now show only week 27
    const week27Content = document.getElementById('content-week-27-2025');
    if (week27Content) {
      week27Content.style.display = 'block';
      console.log('Week 27 content displayed');
    } else {
      console.error('Week 27 content not found!');
    }
  }
  
  // Run immediately
  forceWeek27();
  
  // Also run after a short delay to override any other scripts
  setTimeout(forceWeek27, 100);
  setTimeout(forceWeek27, 500);
});