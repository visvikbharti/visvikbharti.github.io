# Weekly Progress Update Guide
**Created: July 7, 2025**
**Author: Documentation generated for Vishal Bharti's Portfolio**

## Overview
This guide provides step-by-step instructions for updating the weekly progress report on the portfolio website. The weekly progress system uses multiple JavaScript files that aggressively enforce which week is displayed, so all components must be updated together.

## Quick Checklist for Weekly Updates

When updating to a new week (e.g., from Week 26 to Week 27), you need to update **ALL** of the following:

### 1. Create New Week Report HTML File
- [ ] Create new report file: `legacy/pages/reports/week-XX-2025.html`
- [ ] Use the previous week's report as a template
- [ ] Update all dates, content, and progress information

### 2. Update progress.html (Main Progress Page)
- [ ] Update lines ~155-158: Change week display initialization
- [ ] Update lines ~179-182: Change authentication week display
- [ ] Update lines ~224-225: Change HTML week display elements
- [ ] Add new week content section after the previous week (around line 1150+)
- [ ] Add new week to archive section (around line 1800+)
- [ ] Update bottom script (around line 1992+): Change forced week display

### 3. Update JavaScript Files (CRITICAL!)
These files override everything else, so they MUST be updated:

#### A. weekly-progress.js
- [ ] Add new week to AVAILABLE_WEEKS object
- [ ] Update CURRENT_WEEK constant
- [ ] Verify CURRENT_YEAR is correct

#### B. force-week-23.js
- [ ] Update function name to forceShowWeekXX
- [ ] Update all week number references
- [ ] Update date range string
- [ ] Update content ID references

#### C. set-week-23.js
- [ ] Update function name to forceWeekXX
- [ ] Update week display text
- [ ] Update date range
- [ ] Update content element ID

#### D. week-23-override.js
- [ ] Update TARGET_WEEK constant
- [ ] Update TARGET_RANGE constant
- [ ] Update function name to absoluteForceWeekXX
- [ ] Replace ALL function calls throughout the file

## Detailed Instructions

### Step 1: Create Week Report File

1. Copy the previous week's report:
```bash
cp legacy/pages/reports/week-26-2025.html legacy/pages/reports/week-27-2025.html
```

2. Edit the new file and update:
   - Title tag
   - Week number and date range
   - Content sections
   - Progress bars
   - Technical details

### Step 2: Update progress.html

1. **Initial Display Section** (around line 155):
```javascript
// Change from:
document.getElementById('content-week-26-2025').style.display = 'block';
document.getElementById('week-range').textContent = "July 1 - July 7, 2025";
document.getElementById('week-display').textContent = "Week 26, 2025";

// To:
document.getElementById('content-week-27-2025').style.display = 'block';
document.getElementById('week-range').textContent = "July 8 - July 14, 2025";
document.getElementById('week-display').textContent = "Week 27, 2025";
```

2. **Add Week Content** (after previous week's </div>):
```html
<!-- Content for Week 27, 2025 -->
<div id="content-week-27-2025" style="display: block;">
    <!-- Week 27 report link -->
    <div class="progress-section">
        <h3><i class="fas fa-icon"></i> Week 27: Your Title Here</h3>
        <p><strong>Period:</strong> July 8 - July 14, 2025</p>
        <p>Summary of the week's work...</p>
        
        <div style="margin: 30px 0;">
            <a href="reports/week-27-2025.html" class="btn" style="background-color: #27ae60; color: white; padding: 15px 30px; border-radius: 5px; text-decoration: none; display: inline-flex; align-items: center; font-weight: bold; font-size: 18px;">
                <i class="fas fa-file-alt" style="margin-right: 10px;"></i> View Full Week 27 Report
            </a>
        </div>
        
        <!-- Add your content here -->
    </div>
</div>
```

3. **Add to Archive Section**:
```html
<div class="archive-item" data-week="27" data-year="2025">
    <div class="archive-header">
        <div class="archive-title">Week 27, 2025 (July 8 - July 14)</div>
        <i class="fas fa-chevron-down archive-toggle"></i>
    </div>
    <div class="archive-content">
        <p><strong>Focus:</strong> Your focus area</p>
        <p><strong>Key accomplishments:</strong></p>
        <ul>
            <li>Achievement 1</li>
            <li>Achievement 2</li>
        </ul>
        <button class="view-report-btn nav-button" data-week="27" data-year="2025">View Full Report</button>
    </div>
</div>
```

### Step 3: Update JavaScript Files

#### weekly-progress.js
```javascript
const AVAILABLE_WEEKS = {
    // ... existing weeks ...
    26: { year: 2025, range: "July 1 - July 7, 2025" },
    27: { year: 2025, range: "July 8 - July 14, 2025" }  // Add new week
};

const CURRENT_WEEK = 27;  // Update this
const CURRENT_YEAR = 2025;
```

#### force-week-23.js
```javascript
function forceShowWeek27() {  // Rename function
    console.log('[Force Week 27] Attempting to display Week 27...');
    
    // Update displays
    if (weekDisplay) {
        weekDisplay.textContent = "Week 27, 2025";
    }
    if (weekRange) {
        weekRange.textContent = "July 8 - July 14, 2025";
    }
    
    // Update content ID
    const week27Content = document.getElementById('content-week-27-2025');
}
```

#### set-week-23.js
Similar updates - change all 26 references to 27, update date ranges.

#### week-23-override.js
```javascript
const TARGET_WEEK = 27;
const TARGET_YEAR = 2025;
const TARGET_RANGE = "July 8 - July 14, 2025";
```

## Common Issues and Solutions

### Issue 1: Old week still showing
**Solution**: Clear browser cache, check all JavaScript files were updated

### Issue 2: Content not displaying
**Solution**: Verify the content div ID matches exactly in all files

### Issue 3: Archive not working
**Solution**: Check data-week and data-year attributes match

## Testing Checklist

After making updates:
1. [ ] Hard refresh the page (Ctrl+Shift+R / Cmd+Shift+R)
2. [ ] Check week number displays correctly
3. [ ] Verify date range is correct
4. [ ] Test "View Full Report" button
5. [ ] Check archive section shows new week
6. [ ] Test in incognito/private window
7. [ ] Verify password protection still works

## Git Commands for Updates

```bash
# Stage all changes
git add -A

# Commit with descriptive message
git commit -m "Add Week 27 (July 8-14, 2025) progress report

- Created week 27 report with [main topics]
- Updated all JavaScript files to display Week 27
- Added week 27 to archives
- Updated navigation to show current week"

# Push to GitHub
git push origin master
```

## File Structure Reference

```
visvikbharti.github.io/
├── legacy/
│   ├── pages/
│   │   ├── progress.html          # Main progress page
│   │   └── reports/               # Individual week reports
│   │       ├── week-26-2025.html
│   │       └── week-27-2025.html
│   └── js/
│       ├── weekly-progress.js     # Main navigation logic
│       ├── force-week-23.js       # Forces current week display
│       ├── set-week-23.js         # Sets default week
│       └── week-23-override.js    # Aggressive week override
```

## Important Notes

1. **JavaScript Override Priority**: The JavaScript files use aggressive techniques including:
   - MutationObservers
   - Multiple setTimeout calls
   - localStorage overrides
   - Direct DOM manipulation
   
2. **Order Matters**: Update files in this order:
   1. Create report HTML
   2. Update progress.html
   3. Update ALL JavaScript files
   4. Test thoroughly

3. **Caching Issues**: GitHub Pages CDN can cache files. If changes don't appear:
   - Wait 5-10 minutes
   - Use cache-busting query parameters
   - Test in private/incognito window

## Week Calculation Reference

Week numbers for 2025:
- Week 26: July 1-7
- Week 27: July 8-14
- Week 28: July 15-21
- Week 29: July 22-28
- Week 30: July 29 - Aug 4
- Week 31: Aug 5-11
- Week 32: Aug 12-18
- Week 33: Aug 19-25
- Week 34: Aug 26 - Sept 1

## Backup Reminder

Before making updates:
1. Backup current working version
2. Test changes locally if possible
3. Keep this guide updated with any new findings

---

**Last Updated**: July 7, 2025
**Next Week Update Due**: July 8, 2025 (Week 27)