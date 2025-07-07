#!/bin/bash

# Weekly Progress Update Script
# Created: July 7, 2025
# This script helps automate some of the weekly update process

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Weekly Progress Update Helper${NC}"
echo "================================"

# Get current week info from user
read -p "Enter the new week number (e.g., 27): " NEW_WEEK
read -p "Enter the start date (e.g., July 8): " START_DATE
read -p "Enter the end date (e.g., July 14): " END_DATE
read -p "Enter the year (e.g., 2025): " YEAR

# Calculate previous week
PREV_WEEK=$((NEW_WEEK - 1))

echo -e "\n${YELLOW}Updating from Week $PREV_WEEK to Week $NEW_WEEK${NC}"
echo "Date range: $START_DATE - $END_DATE, $YEAR"

# Create report file
REPORT_FILE="legacy/pages/reports/week-${NEW_WEEK}-${YEAR}.html"
if [ -f "$REPORT_FILE" ]; then
    echo -e "${YELLOW}Report file already exists: $REPORT_FILE${NC}"
else
    echo -e "${GREEN}Creating new report file: $REPORT_FILE${NC}"
    cp "legacy/pages/reports/week-${PREV_WEEK}-${YEAR}.html" "$REPORT_FILE"
    echo "Please edit $REPORT_FILE to add your content"
fi

# Show files that need manual updates
echo -e "\n${YELLOW}Files that need manual updates:${NC}"
echo "1. $REPORT_FILE - Add your weekly content"
echo "2. legacy/pages/progress.html - Add week content section and archive entry"
echo "3. legacy/js/weekly-progress.js - Update AVAILABLE_WEEKS and CURRENT_WEEK"
echo "4. legacy/js/force-week-23.js - Update all week references"
echo "5. legacy/js/set-week-23.js - Update all week references"
echo "6. legacy/js/week-23-override.js - Update TARGET_WEEK and TARGET_RANGE"

# Create a checklist file
CHECKLIST_FILE="WEEK_${NEW_WEEK}_UPDATE_CHECKLIST.md"
cat > "$CHECKLIST_FILE" << EOF
# Week $NEW_WEEK Update Checklist
Generated: $(date)

## Files to Update

### 1. Report File: $REPORT_FILE
- [ ] Update title to "Week $NEW_WEEK, $YEAR ($START_DATE - $END_DATE)"
- [ ] Add weekly progress content
- [ ] Update all date references

### 2. progress.html
- [ ] Line ~156: Change to content-week-${NEW_WEEK}-${YEAR}
- [ ] Line ~157: Update to "$START_DATE - $END_DATE, $YEAR"
- [ ] Line ~158: Update to "Week $NEW_WEEK, $YEAR"
- [ ] Add new week content div after Week $PREV_WEEK
- [ ] Add archive entry for Week $NEW_WEEK

### 3. weekly-progress.js
- [ ] Add to AVAILABLE_WEEKS: ${NEW_WEEK}: { year: ${YEAR}, range: "$START_DATE - $END_DATE, $YEAR" }
- [ ] Update CURRENT_WEEK = ${NEW_WEEK}

### 4. force-week-23.js
- [ ] Rename function to forceShowWeek${NEW_WEEK}
- [ ] Update week display to "Week $NEW_WEEK, $YEAR"
- [ ] Update date range to "$START_DATE - $END_DATE, $YEAR"
- [ ] Update content ID to content-week-${NEW_WEEK}-${YEAR}

### 5. set-week-23.js
- [ ] Similar updates as force-week-23.js

### 6. week-23-override.js
- [ ] TARGET_WEEK = ${NEW_WEEK}
- [ ] TARGET_RANGE = "$START_DATE - $END_DATE, $YEAR"
- [ ] Update function names and references

## Testing
- [ ] Hard refresh browser
- [ ] Test in incognito window
- [ ] Verify week displays correctly
- [ ] Check archive functionality
- [ ] Test report link

## Git Commands
\`\`\`bash
git add -A
git commit -m "Add Week $NEW_WEEK ($START_DATE-$END_DATE, $YEAR) progress report"
git push origin master
\`\`\`
EOF

echo -e "\n${GREEN}Created checklist: $CHECKLIST_FILE${NC}"

# Search and replace helper
echo -e "\n${YELLOW}Search and Replace Patterns:${NC}"
echo "Replace: Week $PREV_WEEK → Week $NEW_WEEK"
echo "Replace: week-${PREV_WEEK}-${YEAR} → week-${NEW_WEEK}-${YEAR}"
echo "Replace: previous date range → $START_DATE - $END_DATE, $YEAR"

echo -e "\n${GREEN}Next steps:${NC}"
echo "1. Review the checklist in $CHECKLIST_FILE"
echo "2. Make all necessary updates"
echo "3. Test thoroughly"
echo "4. Commit and push changes"