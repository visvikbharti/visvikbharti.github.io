/**
 * Simplified script to ensure Week 23 is shown by default
 */
document.addEventListener('DOMContentLoaded', function() {
  // Force Week 23 display after a small delay to override any competing scripts
  function forceWeek23() {
    // Directly set week 23 content without observers or complex logic
    const weekDisplay = document.getElementById('week-display');
    const weekRange = document.getElementById('week-range');
    
    if (weekDisplay) weekDisplay.textContent = "Week 23, 2025";
    if (weekRange) weekRange.textContent = "June 2 - June 8, 2025";
    
    // Hide ALL week content divs first
    const allWeekContents = document.querySelectorAll('[id^="content-week-"]');
    allWeekContents.forEach(content => {
      content.style.display = 'none';
    });
    
    // Now show only week 23
    const week23Content = document.getElementById('content-week-23-2025');
    if (week23Content) {
      week23Content.style.display = 'block';
      console.log('Week 23 content displayed');
    } else {
      console.error('Week 23 content not found!');
    }
  }
  
  // Run immediately
  forceWeek23();
  
  // Also run after a short delay to override any other scripts
  setTimeout(forceWeek23, 100);
  setTimeout(forceWeek23, 500);
});