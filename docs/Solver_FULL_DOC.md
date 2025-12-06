# Simple Guide to `public/js/solver.js`

This page explains the solver in very simple words so anyone (even a child) can understand what the code does and how to use it.

---

## Big Picture (what this file does)

- It reads a math problem you type on the page (an objective and some rules called constraints).
- It uses a method called "Simplex" to find the best answer (like getting the most points possible).
- It shows each step on the page so you can watch the math happen.

Think of it like a calculator that shows every line of work.

---

## What you type on the page (inputs)

- Objective: a line like `3x + 2y` (this says "make 3 times x plus 2 times y as big as possible").
- Constraints: rules like `2x + y <= 10` (which means "this must be 10 or less").

Buttons the file uses:
- `Add constraint` — add another rule.
- `Reset` — put example numbers back.
- `Solve` — do the Simplex steps and show the result.

---

## Simple words for each part of the code

- styleConstraintRows()
  - Makes rows look nice by coloring odd/even rows.

- parseExpression(text)
  - Turns a short math phrase like `2x + 3y` into numbers the computer can use. Example: `{ x: 2, y: 3 }`.

- performSimplex(objective, constraints)
  - The engine that does the Simplex steps.
  - It builds a table (called a tableau) with numbers and then repeats: pick a column, pick a row, change the table, until the best answer is found.

- calculatePivotOperations(...)
  - Makes small sentences showing the arithmetic used to change the table so humans can read the work.

- displaySolution(solution)
  - Shows the table rows, the little math sentences, and a final check that the answer works with the original rules.

- approximateFraction(number)
  - If a number is 0.666..., it tries to show `2/3` instead of a long decimal. That is easier to read.

- formatNumber(number)
  - Uses friendly formats like `1/2` or `2/3` when possible, or shows a short decimal.

---

## How the solver works — step by step (very simple)

1. Read the objective and the constraints you typed.
2. Make the first table with all numbers (this includes extra columns called slack variables to turn `<=` rules into equations).
3. Look at the bottom row (the objective). If all numbers are good (no negative numbers for maximization), we are done.
4. If not done: pick the column with the most negative number.
5. For that column, find which row gives the smallest positive ratio (RHS ÷ column number). That row will change.
6. Make the pivot row have a 1 in the pivot place (divide the whole row by the pivot number).
7. Use that pivot row to make all other entries in the pivot column zero (subtract multiples of the pivot row).
8. Repeat from step 3 until no negative numbers remain in the bottom row.
9. Read the answers from the rows — those are the values for `x`, `y`, etc. The bottom-right number is the objective value.

---

## Example you can try on the page

Type this:
- Objective: `3x + 2y`
- Constraints:
  - `2x + y <= 10`
  - `x + 2y <= 8`

Click `Solve`. You should see step-by-step tables and the final answer: `x = 4`, `y = 2`, `Z = 16`.

---

## What the code shows on the page (outputs)

- A series of tables. Each table is one step in the Simplex method.
- For each step, it shows which number is the pivot, the math used to change rows, and which row/column is chosen.
- A final check that plugs the answer back into the original rules and the objective.

---

## Easy ideas to make it better later (simple suggestions)

- Accept names like `x1` or `x2` (right now the code expects single letters like `x`).
- Show warnings in the page if someone types bad numbers — don't just show an alert.
- Show pictures (small arrows) to explain pivot column and pivot row for kids.
- Add a button "Show only final answer" for quick use.

---


