/**
 * Simplified script to ensure Week 20 is shown by default
 */
document.addEventListener('DOMContentLoaded', function() {
  // Directly set week 20 content without observers or complex logic
  const weekDisplay = document.getElementById('week-display');
  const weekRange = document.getElementById('week-range');
  
  if (weekDisplay) weekDisplay.textContent = "Week 20, 2025";
  if (weekRange) weekRange.textContent = "May 13 - May 19, 2025";
  
  // Hide other content and show week 20
  const week19Content = document.getElementById('content-week-19-2025');
  const week20Content = document.getElementById('content-week-20-2025');
  const week18Content = document.getElementById('content-week-18-2025');
  const week17Content = document.getElementById('content-week-17-2025');
  
  if (week19Content) week19Content.style.display = 'none';
  if (week18Content) week18Content.style.display = 'none';
  if (week17Content) week17Content.style.display = 'none';
  if (week20Content) week20Content.style.display = 'block';
});