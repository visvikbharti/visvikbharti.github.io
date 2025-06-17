/**
 * Simplified script to ensure Week 24 is shown by default
 */
document.addEventListener('DOMContentLoaded', function() {
  // Force Week 24 display after a small delay to override any competing scripts
  function forceWeek24() {
    // Directly set week 24 content without observers or complex logic
    const weekDisplay = document.getElementById('week-display');
    const weekRange = document.getElementById('week-range');
    
    if (weekDisplay) weekDisplay.textContent = "Week 24, 2025";
    if (weekRange) weekRange.textContent = "June 10 - June 16, 2025";
    
    // Hide ALL week content divs first
    const allWeekContents = document.querySelectorAll('[id^="content-week-"]');
    allWeekContents.forEach(content => {
      content.style.display = 'none';
    });
    
    // Now show only week 24
    const week24Content = document.getElementById('content-week-24-2025');
    if (week24Content) {
      week24Content.style.display = 'block';
      console.log('Week 24 content displayed');
    } else {
      console.error('Week 24 content not found!');
    }
  }
  
  // Run immediately
  forceWeek24();
  
  // Also run after a short delay to override any other scripts
  setTimeout(forceWeek24, 100);
  setTimeout(forceWeek24, 500);
});