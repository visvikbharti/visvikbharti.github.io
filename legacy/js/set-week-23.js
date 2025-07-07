/**
 * Simplified script to ensure Week 26 is shown by default
 */
document.addEventListener('DOMContentLoaded', function() {
  // Force Week 26 display after a small delay to override any competing scripts
  function forceWeek26() {
    // Directly set week 26 content without observers or complex logic
    const weekDisplay = document.getElementById('week-display');
    const weekRange = document.getElementById('week-range');
    
    if (weekDisplay) weekDisplay.textContent = "Week 26, 2025";
    if (weekRange) weekRange.textContent = "July 1 - July 7, 2025";
    
    // Hide ALL week content divs first
    const allWeekContents = document.querySelectorAll('[id^="content-week-"]');
    allWeekContents.forEach(content => {
      content.style.display = 'none';
    });
    
    // Now show only week 26
    const week26Content = document.getElementById('content-week-26-2025');
    if (week26Content) {
      week26Content.style.display = 'block';
      console.log('Week 26 content displayed');
    } else {
      console.error('Week 26 content not found!');
    }
  }
  
  // Run immediately
  forceWeek26();
  
  // Also run after a short delay to override any other scripts
  setTimeout(forceWeek26, 100);
  setTimeout(forceWeek26, 500);
});