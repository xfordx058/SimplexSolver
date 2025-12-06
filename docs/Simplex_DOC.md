Simplex Method Solver — Code Documentation (Simplex.html)

Overview
--------
This document explains the full contents of `Simplex.html`. It is organized into three parts:

1. HTML structure — the page skeleton and main elements.
2. CSS (styles) — visual layout, classes and important style decisions.
3. JavaScript — full line-by-line explanation of the runtime code that parses inputs, builds the Simplex tableau, performs pivoting operations and renders the step-by-step solution.

If you prefer a quick pointer inside the HTML, there's a small comment at the top of `Simplex.html` that points here for detail.

-----------------------
# Simplex Solver — Project Code Explanation

This document gives a clear, beginner-friendly explanation of the site's important files: the main HTML pages and the JavaScript that makes the UI interactive and runs the Simplex algorithm.

Use this file as a reference when learning how the solver works or when making small improvements.

**Files covered:**
- `index.html` — public home page and links
- `Simplex.html` — the solver UI (inputs + results)
- `notes.html` — help and downloadable resources
- `about.html` — team page (visuals and specializations)
- `public/js/nav.js` — mobile nav toggle logic
- `public/js/ui.js` — theme toggle and small UI helpers
- `public/js/solver.js` — parser, Simplex algorithm, and renderer

---

**How to read this document**
- Each section explains what the file does, how it is structured, and the runtime logic where applicable.
- The JavaScript explanations are given in simple steps and show how data flows from input → algorithm → output.

**Quick summary of the runtime flow on the solver page**
1. User enters an objective and constraints in `Simplex.html`.
2. The page scripts parse those text inputs into numeric data.
3. The Simplex algorithm converts the data into a tableau and iteratively pivots to improve the objective.
4. Each iteration is recorded and then rendered as a readable step with highlighted pivot rows/columns and detailed arithmetic.

---

**1) `index.html` (Home page)**

- Purpose: marketing/entry page with links to other pages (Solver, Notes, About).
- Important parts:
  - `nav` at the top with `.nav-toggle` button for mobile.
  - Hero section with a headline and action buttons that link to the solver.
  - Small feature cards describing tutorials, advanced topics, and applications.
- Scripts: loads `js/nav.js` and `js/ui.js` to enable the mobile menu and theme toggle.

Behavior notes:
- The HTML is mostly static — `nav.js` finds the `.nav-toggle` button and enables open/close behavior for small screens. `ui.js` injects a theme toggle button and handles animations for elements with `.fade-up`.

---

**2) `Simplex.html` (Solver interface)**

- Purpose: lets a user enter a linear program (objective and constraints) and run the Simplex method.
- Important elements:
  - `input#objective` — text input for objective (e.g., `1.5x + 1.2y`).
  - `#constraints-container` — holds `.constraint-row` elements (each row: expression input, `<select>` comparator, RHS input).
  - `#add-constraint` — adds rows dynamically.
  - `#solve-btn` — starts the solver.
  - `#reset-btn` — restores default sample problem.
  - `#output-section` — hidden initially; populated with step-by-step results after solving.

How it behaves at runtime:
- When the user clicks "Solve Simplex", the script reads inputs, builds the tableau, runs the algorithm, and writes a sequence of tableaus and explanations into `#solution-steps` inside `#output-section`.

---

**3) `notes.html` (Documentation & Downloads)**

- Purpose: teaching notes, formatting tips, and downloads such as PDF slides and sample CSV.
- Content is static; the page uses `nav.js` and `ui.js` for navigation and theme. The downloads are standard `<a download>` links.

---

**4) `about.html` (Team page)**

- Purpose: describe the team and their specializations.
- Each team card includes an avatar, a short bio, a quote, and a `.spec-list` that shows small SVG icons and labels for specializations (we added these to improve clarity on mobile).
- On small screens the avatar is stacked above the text for better mobile layout.

---

**5) `public/js/nav.js` — Mobile menu & accessibility (simple)**

What it does (in plain language):
- Waits until the page is loaded.
- Finds the hamburger button (`.nav-toggle`) and the nav links container(s).
- When you click the hamburger:
  - it toggles a `mobile-open` class on the nav links so CSS can show or hide the dropdown,
  - updates `aria-expanded` so screen readers know the menu state,
  - swaps the icon content between `menu` and `close` to indicate open/closed state,
  - and toggles an `.open` class for a little animated effect.
- Clicking outside the nav or pressing Escape closes the menu.

Why this is helpful:
- Keeps the navigation usable on phones, provides keyboard accessibility, and gives visible state for assistive tech.

---

**6) `public/js/ui.js` — Theme toggle & small UI helpers**

Main responsibilities:
- Restore the user's saved theme (dark or light) immediately on page load to avoid a flash of wrong color.
- Insert a theme toggle button into the navigation if it's not already there. The toggle uses a sun/moon visual and toggles a `light-mode` class on the `body` as well as `data-theme` on `document.documentElement`.
- Use an `IntersectionObserver` to add `.visible` to `.fade-up` elements when they scroll into view so they animate smoothly.
- Use a `MutationObserver` so dynamically created content (like the solver's step cards) is also observed and animated.

Simple flow:
1. IIFE `initTheme` reads `localStorage['simplex-theme']` and sets `light` or `dark` before the page finishes rendering.
2. After DOM is ready it inserts the theme button and wires a click handler that toggles `light-mode` and updates `localStorage`.
3. Observers ensure elements animate in when they become visible.

Accessibility and persistence:
- The theme button uses `aria-pressed` and a descriptive `aria-label`, and the user's choice is saved so visiting another page preserves the theme.

---

**7) `public/js/solver.js` — Parser, Simplex algorithm, and renderer (detailed, but beginner-friendly)**

Overview first:
- This file handles everything on the solver page: reading inputs, converting the problem to a simplex tableau, running pivot iterations, and rendering each tableau and the arithmetic used.
- The file is structured into small functions so each piece is easier to understand and test.

Top-level wiring (what runs immediately):
- `DOMContentLoaded` handler wires these UI actions:
  - `#add-constraint` → dynamically adds a `.constraint-row`.
  - `#reset-btn` → restores sample objective and constraints and hides output.
  - `#solve-btn` → calls `solveSimplex()` to perform the computation.
  - Click delegation to toggle `.active` for step panels (expand/collapse tableau details).

Helper: `styleConstraintRows()`
- Applies alternating `.c-odd` / `.c-even` classes to constraint rows (visual striping).

Function: `solveSimplex()` — orchestrator
1. Reads `#objective` input and parses it with `parseExpression()`.
2. Iterates over `.constraint-row` elements to parse each constraint expression, operator, and RHS.
3. Calls `performSimplex(objective, constraints)`, receives a `solution` with an array of recorded `tableaus`.
4. Calls `displaySolution(solution)` to render everything and shows `#output-section`.

Function: `parseExpression(expression)` — simple text parser
- Example input: `"1.5x + 1.2y"` → output: `{ x: 1.5, y: 1.2 }`.
- How it works:
  - Ensures the expression starts with `+` or `-` for easier matching.
  - Uses a regex that finds an optional signed number and a single letter variable (e.g., `+1.5x`).
  - Handles implicit coefficients: `+x` -> `+1`, `-x` -> `-1`.
- Limitation: it expects single-letter variables (x, y, z) and simple linear terms.

Function: `performSimplex(objective, constraints)` — algorithm core
- What it builds:
  - `variableList`: sorted list of decision variables found in objective + constraints.
  - A `tableau` matrix: each constraint becomes a row with decision variable coefficients, slack columns, and the RHS.
  - A bottom objective row contains negative objective coefficients (maximization form) and a RHS of 0.
  - `basicVars`: initially `s1, s2, ...` (slack variables) for each constraint row.

- Iteration loop (repeat until optimal):
  1. Examine the objective row for negative entries — pick most negative index → `pivotCol` (variable entering basis).
  2. For that column compute ratios `RHS / value` for rows where the pivot column value is > 0. The smallest positive ratio selects the `pivotRow` (variable leaving basis).
  3. If no valid pivot row → problem is unbounded (error).
  4. Record current tableau snapshot and compute detailed arithmetic steps with `calculatePivotOperations()` for display.
  5. Normalize pivot row by dividing by the pivot element so the pivot becomes 1.
  6. Eliminate the pivot column from other rows by subtracting `factor * pivotRow`.
  7. Update `basicVars` and repeat.

- Safety: the implementation caps iterations (20) to prevent infinite loops in edge cases.

Function: `calculatePivotOperations(...)`
- Prepares human-readable strings like "old - pivotNormalized(factor) = new" for each cell changed during the elimination step.
- This is used by the renderer so students can see the exact arithmetic for each entry.

Function: `displaySolution(solution)`
- Renders the LP Model (original constraints with slack variables) and each recorded tableau as a collapsible section.
- Each tableau table highlights:
  - Pivot column (`pivot-col-cell`), pivot row (`pivot-row-cell`), and pivot element (`pivot-element`).
  - A small legend explains the color coding.
- If pivotOperations were recorded, a compact pivot table shows each arithmetic step.
- At the end a validation block substitutes solution values back into each original constraint and checks the objective.

Functions: `approximateFraction` and `formatNumber`
- Help present numbers nicely: convert common decimals to simple fractions when possible (e.g., `0.5` → `1/2`) and otherwise show 3 decimal places.
- This makes the displayed tableaus easier to read in educational contexts.

Limitations to be aware of (important for correctness):
- Parser expects single-letter variable names and simple linear terms; it won't handle parentheses or multi-letter variables.
- The implementation assumes slack variables solve the conversion (no two-phase Simplex), so `>=` constraints and certain equalities may need artificial variables for correct general handling. The code does not implement two-phase Simplex.

---

**Example quick walkthrough (small LP)**
Given:
- Maximize Z = 3x + 2y
- Subject to:
  - 2x + y <= 10
  - x + 2y <= 8

What the code does at a high level:
1. `parseExpression` turns `3x + 2y` into `{x:3, y:2}` and constraints into similar objects.
2. `performSimplex` builds an initial tableau whose rows look like:
   - `[2, 1, 1, 0, 10]`  // 2x + 1y + s1 = 10
   - `[1, 2, 0, 1, 8]`   // 1x + 2y + s2 = 8
   - objective row: `[-3, -2, 0, 0, 0]`
3. The algorithm finds the pivot column (most negative entry in objective row), calculates ratios to choose pivot row, normalizes and eliminates, records each tableau, and continues until no negative entries in the objective row remain.
4. `displaySolution` writes the step-by-step tableaus into the page with a friendly explanation and numeric checks.

---

**Next recommended tasks (optional)**
- Add inline code comments in `public/js/solver.js` to make the implementation easier to read directly in the editor (I can patch the file with beginner-friendly comments).
- Improve the parser to allow multi-letter variable names (e.g., `x1`, `y2`) or evaluate simple RHS expressions.
- Extend the algorithm to handle `>=` constraints and cases requiring artificial variables (two-phase Simplex).

If you want, I can now:
- (A) insert inline comments into `public/js/solver.js` so the code itself explains what each block does, or
- (B) create a short "Quick Start" example in this doc showing exact inputs and the first two tableau outputs (so you can compare behavior with the app).

Tell me which option you prefer and I will implement it next.
Tell me which option you prefer and I will implement it next.

---

## Step-by-step walkthrough: `public/js/solver.js`

This section explains the `solver.js` code in a very small-step, beginner-friendly way. Read this when you want to understand how the page reads user input, runs the Simplex algorithm, and shows the steps.

**Overview (one line):** the file wires buttons, parses text input, converts the LP to a tableau, runs Simplex pivot iterations, records each step, and renders readable HTML that shows every arithmetic step.

### 1) Top-level initialization and event wiring
- The code waits until the page is loaded using `document.addEventListener('DOMContentLoaded', ...)`. This ensures the HTML elements exist before JavaScript tries to access them.
- Inside that handler it finds and connects three main controls:
  - `#add-constraint` button: when clicked the code creates a new `.constraint-row` element (HTML inputs) and appends it to the `#constraints-container` so users can add more constraints.
  - `#reset-btn` button: restores the objective and constraints to default sample values, clears the results area, and reapplies alternating row styling.
  - `#solve-btn` button: starts the solver by calling `solveSimplex()`.
- The handler also listens for clicks on `.step-header` elements to toggle the visibility of their `nextElementSibling` (this makes step sections expandable/collapsible).

### 2) Small helper: `styleConstraintRows()`
- Purpose: add alternating classes (`c-odd` / `c-even`) to each `.constraint-row` so the UI visually separates them.
- How it works: it selects all `.constraint-row` elements and toggles classes based on index parity. Simple loop, no math.

### 3) Entry point: `solveSimplex()` (what it does, step-by-step)
- High-level goal: read user inputs, parse them into numeric structures, call the algorithm, then render the results.

Step flow inside `solveSimplex()`:
  1. Read objective string from `#objective` (e.g., `"1.5x + 1.2y"`).
  2. Call `parseExpression(objectiveInput)` to convert that string into an object mapping variable→coefficient (e.g., `{ x: 1.5, y: 1.2 }`).
  3. Iterate over each `.constraint-row`:
     - Read the expression (left side), the selected inequality (`<=`/`>=`/`=`), and the numeric RHS.
     - If valid, parse the expression with `parseExpression()` and push an object `{ expression, inequality, rhs }` into the `constraints` array.
  4. Call `performSimplex(objective, constraints)` which returns a `solution` object (tableaus, final values, variable list, etc.).
  5. Call `displaySolution(solution)` to render the recorded steps and final checks in the UI.
  6. Show the `#output-section` element (it was hidden initially).

Errors: the whole function is wrapped in `try/catch`; if anything fails it logs to the console and shows an alert to the user.

### 4) Small parser: `parseExpression(expression)`
- Purpose: convert a short linear expression string like `"1.5x + 1.2y"` into a machine-friendly object.
- Key ideas (beginner-friendly):
  - It forces the string to start with a plus or minus sign. This makes the regular expression matching predictable.
  - Uses a `RegExp` to find every "coefficient + variable" pair. The regex picks up optional sign and number and a single letter variable (e.g. `+3.5x` or `-y`).
  - Treats empty coefficients like `+x` as `+1` and `-x` as `-1`.
  - Returns an object where each variable name is a key and the parsed number is the value.
- Limitation: the parser expects single-letter variable names and simple numeric coefficients.

### 5) The Simplex engine: `performSimplex(objective, constraints)`
This is the core algorithm. The goal is to produce a sequence of tableaus (snapshots) showing how the Simplex method moves from an initial feasible solution to an optimal one.

High level steps (then we expand each):
- Build the variable list and initial tableau (rows for constraints, plus one objective row).
- Add slack variables for constraints (s1, s2, ...), and initialize `basicVars` with those slack names.
- Iteratively:
  - Choose pivot column (entering variable): column with the most negative coefficient in the objective row.
  - Choose pivot row (leaving variable): smallest positive ratio RHS / pivotVal among constraint rows.
  - Record the tableau, pivot choice, and arithmetic operations.
  - Pivot: normalize pivot row, eliminate pivot column from other rows, update `basicVars`.
  - Stop when there is no negative coefficient in the objective row or when an error (unbounded) occurs.

Detailed sub-steps used in the code:
  a) Collect all variables (from objective and constraints) into `variableList` and sort them. This defines the column order.
  b) For each constraint, build a row array: coefficients for decision variables (in variableList order), then a block of slack columns (identity matrix pattern), then RHS. Push that into `tableau` and set corresponding `basicVars` to `s1, s2...`.
  c) Build the objective row: negated objective coefficients (Max → use negative entries), zeros for slack columns, RHS 0. Append objective row to `tableau` and `basicVars.push('Z')`.
  d) Keep `allVariables` — a list that merges decision variables and slack variables so column indexes map to variable names.

Main loop (what the code does each iteration):
  - Inspect the objective row (last row of `tableau`) for negative numbers. If none found, the solution is optimal and we exit the loop.
  - Select `pivotCol`: the index of the most negative value in the objective row (excluding RHS).
  - For every constraint row, compute `ratio = RHS / tableau[i][pivotCol]` when `tableau[i][pivotCol] > 0`. Track the smallest positive ratio — its row becomes `pivotRow`.
  - If `pivotRow` remains `-1`, there is no valid pivot row (the problem is unbounded) and the code throws an error.
  - Record the current tableau snapshot (matrix copy, basicVars, variable names, pivot info, ratios) into `tableaus` so we can show it later.
  - Compute `pivotOperations` (see below) which records the primitive arithmetic (what the user would write on paper).
  - Do the algebraic pivot update:
     * `pivotElement = tableau[pivotRow][pivotCol]`.
     * Divide every value in the pivot row by `pivotElement` (normalize pivot row to 1).
     * For every other row, subtract `factor * pivotRow` where `factor` is that row's current pivot-column value, to make other rows have zero in pivot column.
     * Replace `basicVars[pivotRow]` with `allVariables[pivotCol]` (the entering variable now becomes basic for that row).
  - Increment iteration counter and check safety limit (if iteration > 20 throw an error to avoid infinite loops).

At the end of the loop the code appends a final tableau snapshot (no pivot info) and then builds a `solution` object:
- For each decision variable (the original decision vars, not slacks), if it appears in `basicVars` then its value is the RHS of that row; otherwise it is `0`.
- `z` is read from the RHS of the objective row.

### 6) Human-readable arithmetic: `calculatePivotOperations(tableau, pivotRow, pivotCol, basicVars, allVariables)`
- Purpose: produce strings and numbers showing how each cell is transformed during normalization and elimination.
- For the pivot row it stores operations like `oldValue (1/pivotElement) = newValue`.
- For other rows it stores operations like `oldValue - pivotNormalized(factor) = newValue`.
- The renderer uses these strings so learners can see the exact arithmetic that produced the next tableau.

### 7) Render the results: `displaySolution(solution)`
- Purpose: take the `solution` object and build readable HTML to show every recorded tableau and the final checks.

What it constructs for each recorded tableau:
  - A collapsible step section with a header `Tableau N`.
  - A table with columns: `Basic`, then each variable, then `RHS` and optionally a `Ratio` column.
  - For each row it fills cells with numbers (uses `formatNumber()` for nicer text), and adds CSS classes:
      * `pivot-element` for the pivot cell,
      * `pivot-row-cell` for other cells in pivot row,
      * `pivot-col-cell` for other cells in pivot column.
  - If `pivotOperations` exist the code adds a `pivot-table` that lists the arithmetic steps computed earlier.

After all tableaus the function builds a verification block:
  - Substitutes computed variable values back into each original constraint and shows whether the inequality holds.
  - Recomputes the objective from the final variable values and compares it to the reported `z`.

### 8) Number formatting helpers: `approximateFraction(value, maxDenominator, tol)` and `formatNumber(num)`
- `approximateFraction` tries denominators up to `maxDenominator` to find a small-integer fraction close to the value (e.g., `0.5` → `1/2`). Returns `{num, den, str}` when match is good.
- `formatNumber` first checks for trivial integers and known decimal→fraction mappings, then calls `approximateFraction` to attempt a readable fraction. If no fraction found it returns a decimal with 3 digits.

### 9) Rendering helpers: `renderLPStandard()` and `renderLPModel()`
- `renderLPStandard(tableau, objective)` builds a compact text representation of the current tableau as linear equations (useful for intermediate displays).
- `renderLPModel(solution, constraintRows)` produces a top-level LP model block that shows original constraints next to their canonical slack-variable forms (e.g., `2x + y <= 10 -> 2x + y + s1 = 10`). This helps learners connect input to canonical tableau.

### 10) Important limitations and notes (practical)
- The parser supports single-letter variables and expects numeric RHS values.
- The solver adds slack variables but does not implement a full two-phase Simplex with artificial variables, so some `>=` or equality constraints may not be handled correctly in all cases.
- A safety iteration limit is present to prevent infinite loops; for larger problems you may need to increase the cap or add anti-cycling logic.

### 11) Quick mental model (one-paragraph)
- Think of the tableau as a spreadsheet where each row is a basic variable expressed in terms of others plus a number (RHS). Each pivot step picks a column to enter (it looks promising for improving the objective) and a row to leave (smallest positive ratio keeps solutions feasible). The pivot algebra (normalize + eliminate) swaps the entering variable into the basis and records the arithmetic so you can follow it step-by-step.

If you'd like, I can now:
- (A) insert inline comments directly into `public/js/solver.js` (I will add beginner-friendly comments and short examples in the code), or
- (B) append a short worked example to this file showing exact inputs and the first two tableaus produced by the current implementation (so you can compare the app's output to the doc).

Tell me which option you want next and I'll implement it.

---

## Worked example (short)

This short example shows the exact inputs and the first two tableaus produced by the solver so you can match the app output to the math.

Problem (small, easy to verify):
- Maximize Z = 3x + 2y
- Subject to:
  - 2x +  y <= 10
  -  x + 2y <=  8

Step 0 — canonical initial tableau

Columns order: [x, y, s1, s2, RHS]

Initial tableau (rows as arrays):
- Row 1 (constraint 1): [2, 1, 1, 0, 10]   // 2x + 1y + 1·s1 + 0·s2 = 10
- Row 2 (constraint 2): [1, 2, 0, 1,  8]   // 1x + 2y + 0·s1 + 1·s2 = 8
- Objective (Z-row):         [-3, -2, 0, 0,  0] // negative objective coefficients for maximization

Explanation: slack variables `s1` and `s2` were added so each `<=` constraint becomes an equation.

Step 1 — choose pivot column and pivot row
- Pivot column: choose the most negative entry in the objective row → column `x` (value -3).
- Ratios (RHS / pivotColumnValue):
  - Row1: 10 / 2 = 5
  - Row2:  8 / 1 = 8
- Smallest positive ratio is 5 → pivot row = Row1, pivot element = 2 (the entry at intersection).

Normalize pivot row (divide Row1 by 2):
- Row1' = [1, 0.5, 0.5, 0, 5]

Eliminate pivot column from other rows:
- Row2 := Row2 - (factor=1) * Row1' → [0, 1.5, -0.5, 1, 3]
- Obj  := Obj  - (factor=-3) * Row1' → Obj + 3*Row1' → [0, -0.5, 1.5, 0, 15]

Tableau after Step 1:
- Row 1 (basic x): [1, 0.5, 0.5,   0, 5]
- Row 2 (basic s2):[0, 1.5, -0.5,  1, 3]
- Obj:             [0, -0.5, 1.5,  0, 15]

Step 2 — next pivot (choose entering variable y)
- Objective row still has a negative entry -0.5 in column `y` → pivot column = y.
- Ratios for pivot column `y`:
  - Row1: 5 / 0.5 = 10
  - Row2: 3 / 1.5 = 2  ← smallest, pivot row = Row2, pivot element = 1.5

Normalize pivot row (divide Row2 by 1.5):
- Row2' = [0, 1, -1/3, 2/3, 2]

Eliminate pivot column from other rows:
- Row1 := Row1 - 0.5 * Row2' → [1, 0, 2/3, -1/3, 4]
- Obj  := Obj - (-0.5) * Row2' → Obj + 0.5*Row2' → [0, 0, 4/3, 1/3, 16]

Final tableau (all objective coefficients ≥ 0) — optimal found:
- Row 1 (basic x): [1, 0, 0.666..., -0.333..., 4]
- Row 2 (basic y): [0, 1, -0.333...,  0.666..., 2]
- Obj:             [0, 0, 1.333...,   0.333..., 16]

Solution read from basics:
- x = 4 (Row1 RHS), y = 2 (Row2 RHS), Z = 16 (objective RHS).

Quick check: 3*4 + 2*2 = 12 + 4 = 16 ✓

Notes:
- If you run the app with these inputs, the solver will record the same pivot choices and tableaus. The `displaySolution` function will format the fractional entries (e.g., `2/3`) using the fraction approximation helpers so the steps are easy to read.

---

Done — the example above is now appended to this documentation file to help you match the code's output with hand calculations.
