# CLAUDE.md

## Project Overview

Learning Analytics Dashboard — a client-side web application for visualizing and exploring student learning data from the "Understanding Data Visualisation" course at the University of Edinburgh. Built with D3.js and Vega-Lite, it provides interactive charts, filtering, and data tables across multiple dashboard pages.

**License:** MIT (Copyright 2022 Jackkk)

## Tech Stack

- **Languages:** JavaScript (ES6+), HTML5, CSS (inline/embedded)
- **Visualization:** D3.js v7.6.1, Vega v5.16.1, Vega-Lite v4.16.8, Vega-Embed v6.12.2, D3-Sankey
- **UI Framework:** UIKit v3.2.2 (loaded via CDN)
- **Package Manager:** pnpm (pnpm-lock.yaml present)
- **Build System:** None — static files served directly (no bundler, no transpilation)
- **Testing:** None configured
- **Linting/Formatting:** None configured
- **CI/CD:** None configured

## Repository Structure

```
BigCokee/
├── index.html          # Main dashboard landing page (sidebar nav, summary charts)
├── index.js            # Landing page logic (Vega-Embed charts, navigation handlers)
├── 1.html              # Page 1: Student Nationality & Target Analysis
├── 1.js                # Page 1 logic (Sankey diagram, Vega-Lite charts, filters)
├── 2.html              # Page 2: Course Activity & Participation
├── 2.js                # Page 2 logic (scatter, line, boxplot charts, filters)
├── 3.html              # Page 3: Participation & Learning Outcomes
├── 3.js                # Page 3 logic (bar, boxplot, line charts, filters)
├── chart.js            # ParentChart base class (ES6 module export for D3 charts)
├── LAD_simulation_dataset.csv  # Main dataset (~50 student records)
├── force.csv           # Student interaction network data (18 rows)
├── images/             # UI icons and screenshots (25 files)
├── package.json        # Minimal config (d3 dependency only)
├── pnpm-lock.yaml      # Lock file
├── .gitignore          # Standard Node.js ignores
├── LICENSE             # MIT
└── README.md           # GitHub profile template (not project docs)
```

## Architecture

### Page Structure

Each dashboard page follows the same pattern:
- An HTML file defining layout (fixed 1920x1580px), sidebar navigation, filter dropdowns, chart containers, and a data table area
- A corresponding JS file that loads CSV data via `d3.csv()`, builds visualizations, wires up filters, and renders tables

### Key Classes

- **`ParentChart`** (`chart.js`) — Base class for D3 visualizations. Provides: `add_svg()`, `add_margin()`, `add_chart_area()`, `add_label()`, `add_axis()`, `setZoom()`, tooltip helpers (`tips_show`/`tips_hide`), and `update_chart()` lifecycle.
- **`Sankey`** (`1.js`) — Extends visualization patterns to render Sankey flow diagrams showing relationships between student groups, pre-majors, and learning targets.

### Data Flow

1. CSV files are loaded asynchronously with `d3.csv()`
2. Data is enhanced with computed properties (e.g., `duration`, `participation`, `active_time`)
3. Filter state is managed via plain objects, updated through dropdown `change` events
4. On filter change, data is re-filtered, charts are redrawn, and tables are re-rendered

### Dependencies

Most libraries are loaded via CDN in HTML `<script>` tags. Only `d3` is declared in `package.json`. There is no module bundler — scripts use global scope except `chart.js` which uses ES6 `export default`.

## Development

### Running Locally

No build step. Serve the project root with any static HTTP server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js (npx)
npx serve .

# Using pnpm/npm
pnpm install   # installs d3 to node_modules (not used at runtime — CDN is used)
```

Then open `http://localhost:8000/index.html` in a browser.

### No Tests or Linting

There are no test files, test runners, linting tools, or formatting configurations. The `package.json` test script is a placeholder that exits with an error.

## Code Conventions

### JavaScript

- ES6 classes with constructors for chart components
- `async/await` for data loading (`d3.csv()`)
- Arrow functions for callbacks and inline handlers
- D3 method chaining pattern: `.selectAll().data().join().attr()`
- Vega-Lite specs defined as plain JavaScript objects, rendered with `vegaEmbed()`
- Dynamic category extraction: `[...new Set(data.map(d => d[col]))]`
- Filter functions built with `Object.entries().reduce()`

### Naming

- **Variables/functions:** camelCase (`changeEvent`, `drawTable`)
- **Methods:** snake_case with action verb prefixes (`add_svg`, `draw_chart`, `update_data`)
- **CSS classes/data fields:** snake_case (`student_pre_major`, `learning_trarget`)
- **HTML IDs:** descriptive, sometimes with number suffixes (`viz_bar2`, `goto_1`)

### Layout

- Fixed-width design (1920x1580px)
- CSS Grid for page layout with pixel-based column widths
- Card-based UI with shadow effects and border-radius
- Color palette: `#537DAB` (blue), `#EC7A79` (red), `#F89D54` (orange), `#62CF7D` (green), `#76B3F2` (light blue), `#FFA03F` (amber)

### Comments

- Inline comments are primarily in Chinese
- Minimal documentation in code

## Data Schema (LAD_simulation_dataset.csv)

Key fields: `student_name`, `pre_major`, `learning_target`, `nationality`, `student_ID`, `email`, `course_module`, `group_code`, `week`, `interaction_level`, `assessment`, `marks_LO1`-`marks_LO4`, `average_marks`, `participation_level`, session timestamps.

## Known Issues / Notes

- Some variable names contain typos (e.g., `fiter_func` instead of `filter_func`, `learning_trarget` instead of `learning_target`)
- Layout is fixed at 1920x1580px — not responsive
- `console.log` debug statements remain in production code
- Git commit messages are informal/placeholder ("asd", "asdasdsa")
