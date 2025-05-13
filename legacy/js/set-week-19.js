/**
 * Simplified script to ensure Week 19 is shown by default
 */
document.addEventListener('DOMContentLoaded', function() {
  // Directly set week 19 content without observers or complex logic
  const weekDisplay = document.getElementById('week-display');
  const weekRange = document.getElementById('week-range');
  
  if (weekDisplay) weekDisplay.textContent = "Week 19, 2025";
  if (weekRange) weekRange.textContent = "May 6 - May 12, 2025";
  
  // Hide other content and show week 19
  const week18Content = document.getElementById('content-week-18-2025');
  const week19Content = document.getElementById('content-week-19-2025');
  const week17Content = document.getElementById('content-week-17-2025');
  
  if (week18Content) week18Content.style.display = 'none';
  if (week17Content) week17Content.style.display = 'none';
  if (week19Content) week19Content.style.display = 'block';
});