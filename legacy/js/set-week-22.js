/**
 * Simplified script to ensure Week 22 is shown by default
 */
document.addEventListener('DOMContentLoaded', function() {
  // Directly set week 22 content without observers or complex logic
  const weekDisplay = document.getElementById('week-display');
  const weekRange = document.getElementById('week-range');
  
  if (weekDisplay) weekDisplay.textContent = "Week 22, 2025";
  if (weekRange) weekRange.textContent = "May 26 - June 1, 2025";
  
  // Hide other content and show week 22
  const week17Content = document.getElementById('content-week-17-2025');
  const week18Content = document.getElementById('content-week-18-2025');
  const week19Content = document.getElementById('content-week-19-2025');
  const week20Content = document.getElementById('content-week-20-2025');
  const week22Content = document.getElementById('content-week-22-2025');
  
  if (week17Content) week17Content.style.display = 'none';
  if (week18Content) week18Content.style.display = 'none';
  if (week19Content) week19Content.style.display = 'none';
  if (week20Content) week20Content.style.display = 'none';
  if (week22Content) week22Content.style.display = 'block';
});