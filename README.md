AD419-Charts

https://aes.ucdavis.edu/

## Setup

Run ` npm install ` in both the root directory and the ` processing ` directory.

## Run the website locally

` npm run debug `

## Publish the website

` npm run publish `

Publishes app to the repository's docs folder, which is deployed to GitHub Pages once merged to master.

# Yearly Data Update

In the `processing` directory, import the following two files:

Inputs:
* ad419admin.csv: https://ad419datahelper.caes.ucdavis.edu/FinalReports and select "AD-419 Non-Admin Report".   Export to Excel, then save and export as CSV (needed to ensure negative numbers are formatted correctly).  Remove extraneous first row and final totals row.
* allprojects.csv: https://ad419datahelper.caes.ucdavis.edu/CurrentProjectsReport. Export to CSV.

Now run the analytics process to generate output data files:

`node analytics.js ad419admin.csv allprojects.csv`

Outputs: Multiple JSON files
* departments.json
* departmentTotals.json
* projects.json
* projectTotals.json

Obsolete Outputs:
* caesgrouped.csv
* sankey.json

Add resulting JSON files to https://github.com/ucdavis/ad419-charts/tree/master/src/public/js, then update the year information in `index.html`, including
incrementing the year for the `app.js` script reference `<script src="./js/app.js?v=2022"></script>`, and you are ready to debug and eventually publish.