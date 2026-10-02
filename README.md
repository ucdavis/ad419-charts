# AES Impact

https://aes.ucdavis.edu/

## Requirements

- Node.js 20.19 or later.
- npm.
- Access to the AD-419 Data Helper reports used for the annual update.

## Install and run locally

Install the website dependencies from the repository root:

```sh
npm install
```

Install the data-processing dependencies separately:

```sh
cd processing
npm install
```

Return to the repository root, then start the local Vite server:

```sh
npm run dev
```

The site is available at http://localhost:3000. Changes to source files reload automatically.

## Production build

```sh
npm run build
```

This generates the static deployment in `docs`. GitHub Pages publishes that folder after the changes are merged to `master`. Do not edit files in `docs` by hand; edit the source files and build again instead.

## Yearly data update

Complete the prior federal fiscal year's AD-419 processing by February 1, then update the site with the resulting data.

### 1. Export the two input reports

From the AD-419 Data Helper, download:

- `ad419admin.csv` from the [AD-419 Non-Admin Report](https://ad419datahelper.caes.ucdavis.edu/FinalReports). Export to Excel first, then save as CSV so negative numbers retain the expected format. Remove the extraneous first row and final totals row.
- `allprojects.csv` from the [Current Projects Report](https://ad419datahelper.caes.ucdavis.edu/CurrentProjectsReport).

Do not rename CSV column headings. The processing script requires the AD-419 `dept`, `project`, and funding fields, and the project-report `ProjectNumber1`, `Title`, and `ProjectDirector` fields.

### 2. Generate the data files

Place both CSV files in `processing`, then run:

```sh
cd processing
node analytics.js ad419admin.csv allprojects.csv
```

The script writes its results to `processing/output`. Only these four generated files are used by the current site:

- `departments.json`
- `departmentTotals.json`
- `projects.json`
- `projectTotals.json`

`caesgrouped.csv` and `sankey.json` are legacy outputs and are not used by the site.

### 3. Review mappings before copying data

New or renamed departments and funding codes require a mapping review:

- Every displayed department must have an entry in `processing/analytics.js` under `DEPARTMENTS`.
- A department's `category` must match a key in `src/public/js/categories.json`: currently `AG`, `ENV`, or `HUMAN`. Other values are excluded from the topic-based visualizations.
- Every funding-field key that should appear in the contributor visualization must have an entry in `src/public/js/sources.json`.
- Each project in `projectTotals.json` must also appear in `projects.json`; otherwise its project bubble cannot be rendered correctly.

Update these mappings deliberately when report codes change. Do not replace `categories.json`, `sources.json`, map data, or spotlight content with generated output.

### 4. Replace the site data

From `processing`, copy the four generated files into the website source:

```sh
cp output/departments.json output/departmentTotals.json output/projects.json output/projectTotals.json ../src/public/js/
```

Update the federal fiscal-year reporting period in `src/public/components/site-hero.template.html`.

### 5. Review and build

Run `npm run dev` from the repository root and review each topic—All projects, Agriculture, Environment, and Human and Social—especially the map, research bubbles, contributor totals, and tooltips.

When the data is correct, run:

```sh
npm run build
```

Commit the updated source data and generated `docs` folder together. Vite creates versioned JavaScript and CSS assets automatically, so there is no `app.js` version number to increment manually.
