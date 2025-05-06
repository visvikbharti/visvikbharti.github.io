/**
 * Script to ensure Week 18 is shown by default
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log("Setting Week 18 as default week");
  
  // Try to find displayWeekData function and call it
  if (typeof displayWeekData === 'function') {
    setTimeout(function() {
      console.log("Calling displayWeekData directly");
      displayWeekData(18, 2025);
    }, 500);
  } else {
    console.log("displayWeekData function not found, using fallback method");
    
    // Fallback method - manually update display
    const weekDisplay = document.getElementById('week-display');
    const weekRange = document.getElementById('week-range');
    
    if (weekDisplay) weekDisplay.textContent = "Week 18, 2025";
    if (weekRange) weekRange.textContent = "April 29 - May 05, 2025";
    
    // Find and show Week 18 content
    const week17Content = document.getElementById('content-week-17-2025');
    const week18Content = document.getElementById('content-week-18-2025');
    
    if (week17Content) week17Content.style.display = 'none';
    if (week18Content) week18Content.style.display = 'block';
  }
});