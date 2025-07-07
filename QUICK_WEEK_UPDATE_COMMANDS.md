# Quick Week Update Commands
**For fast copy-paste updates**

## Week 27 Example (July 8-14, 2025)

### 1. Create Report File
```bash
cp legacy/pages/reports/week-26-2025.html legacy/pages/reports/week-27-2025.html
```

### 2. Update progress.html - Find & Replace
```
Find: content-week-26-2025
Replace: content-week-27-2025

Find: Week 26, 2025
Replace: Week 27, 2025

Find: July 1 - July 7, 2025
Replace: July 8 - July 14, 2025
```

### 3. Add Week Content (insert after Week 26's closing </div>)
```html
<!-- Content for Week 27, 2025 -->
<div id="content-week-27-2025" style="display: block;">
    <!-- Week 27 report link -->
    <div class="progress-section">
        <h3><i class="fas fa-flask"></i> Week 27: [YOUR TITLE HERE]</h3>
        <p><strong>Period:</strong> July 8 - July 14, 2025</p>
        <p>[YOUR WEEK SUMMARY HERE]</p>
        
        <div style="margin: 30px 0;">
            <a href="reports/week-27-2025.html" class="btn" style="background-color: #27ae60; color: white; padding: 15px 30px; border-radius: 5px; text-decoration: none; display: inline-flex; align-items: center; font-weight: bold; font-size: 18px;">
                <i class="fas fa-file-alt" style="margin-right: 10px;"></i> View Full Week 27 Report
            </a>
        </div>
        
        <p><strong>Key Progress & Achievements:</strong></p>
        <ul>
            <li><strong>[TOPIC 1]:</strong> [Description]</li>
            <li><strong>[TOPIC 2]:</strong> [Description]</li>
            <li><strong>[TOPIC 3]:</strong> [Description]</li>
        </ul>
    </div>
</div>
```

### 4. Update JavaScript Files

**weekly-progress.js**
```javascript
// Add to AVAILABLE_WEEKS:
27: { year: 2025, range: "July 8 - July 14, 2025" },

// Update:
const CURRENT_WEEK = 27;
```

**ALL JS files - Find & Replace:**
```
Find: Week 26
Replace: Week 27

Find: week-26
Replace: week-27

Find: July 1 - July 7, 2025
Replace: July 8 - July 14, 2025

Find: forceWeek26
Replace: forceWeek27

Find: forceShowWeek26
Replace: forceShowWeek27

Find: absoluteForceWeek26
Replace: absoluteForceWeek27

Find: TARGET_WEEK = 26
Replace: TARGET_WEEK = 27
```

### 5. Git Commands
```bash
git add -A
git commit -m "Add Week 27 (July 8-14, 2025) progress report

- Created week 27 report: [main topics]
- Updated all JavaScript files to display Week 27
- Added week 27 to archives
- Updated navigation and date ranges"

git push origin master
```

## Common Week Date Ranges for 2025

```
Week 27: July 8 - July 14, 2025
Week 28: July 15 - July 21, 2025
Week 29: July 22 - July 28, 2025
Week 30: July 29 - August 4, 2025
Week 31: August 5 - August 11, 2025
Week 32: August 12 - August 18, 2025
Week 33: August 19 - August 25, 2025
Week 34: August 26 - September 1, 2025
Week 35: September 2 - September 8, 2025
Week 36: September 9 - September 15, 2025
```

## Debugging Commands

```bash
# Check which week is currently displayed
grep -n "Week [0-9]\+, 2025" legacy/pages/progress.html | head -5

# Find all week references in JS files
grep -n "Week [0-9]\+" legacy/js/*.js

# Check git status
git status

# View recent commits
git log --oneline -5
```

## Quick Test URLs
- Progress page: https://visvikbharti.github.io/legacy/pages/progress.html
- Password: qwerty

## Emergency Rollback
```bash
# If something goes wrong, revert last commit
git revert HEAD
git push origin master
```