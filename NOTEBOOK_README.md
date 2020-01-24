1. AD419-generate-datafiles.ipynb

Inputs:
* ad419admin.csv: https://ad419datahelper.caes.ucdavis.edu/FinalReports and select "AD-419 Non-Admin Report".   Export to Excel, then save and export as CSV (needed to ensure negative numbers are formatted correctly).  Remove extraneous first row and final totals row.
* allprojects.csv: https://ad419datahelper.caes.ucdavis.edu/CurrentProjectsReport. Export to CSV.

Process: Run notebook once files are in place

Outputs: Multiple JSON files
* departments.json
* departmentTotals.json
* projects.json
* projectTotals.json


2. AD419data.ipynb (unused)

Inputs:
* ad419admin.csv

Outputs:
* caesgrouped.csv
* sankey.json


3. Add resulting JSON files to https://github.com/ucdavis/ad419-charts/tree/master/src/public/js