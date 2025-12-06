document.addEventListener("DOMContentLoaded", function () {
  // Add constraint button functionality
  document
    .getElementById("add-constraint")
    .addEventListener("click", function () {
      const container = document.getElementById("constraints-container");
      const newRow = document.createElement("div");
      newRow.className = "constraint-row";
      newRow.innerHTML = `
                    <input type="text" class="constraint-input" placeholder="e.g., 2x + 3y">
                    <select class="constraint-select">
                        <option value="<=" selected>&lt;=</option>
                        <option value=">=">&gt;=</option>
                        <option value="=">=</option>
                    </select>
                    <input type="text" class="constraint-rhs" placeholder="RHS">
                `;
      container.appendChild(newRow);
      styleConstraintRows();
    });

  // Reset button functionality
  document.getElementById("reset-btn").addEventListener("click", function () {
    document.getElementById("objective").value = "1.5x + 1.2y";

    const constraintsContainer = document.getElementById(
      "constraints-container"
    );
    constraintsContainer.innerHTML = "";

    // Add back the default constraints
    constraintsContainer.innerHTML = `
                    <div class="constraint-row">
                        <input type="text" class="constraint-input" placeholder="e.g., 2x + 3y" value="2x + 3y">
                        <select class="constraint-select">
                            <option value="<=" selected>&lt;=</option>
                            <option value=">=">&gt;=</option>
                            <option value="=">=</option>
                        </select>
                        <input type="text" class="constraint-rhs" placeholder="RHS" value="24">
                    </div>
                    <div class="constraint-row">
                        <input type="text" class="constraint-input" placeholder="e.g., 6x + 3y" value="6x + 3y">
                        <select class="constraint-select">
                            <option value="<=" selected>&lt;=</option>
                            <option value=">=">&gt;=</option>
                            <option value="=">=</option>
                        </select>
                        <input type="text" class="constraint-rhs" placeholder="RHS" value="48">
                    </div>
                `;

    styleConstraintRows();
    document.getElementById("output-section").style.display = "none";
  });

  // Solve button functionality
  document.getElementById("solve-btn").addEventListener("click", function () {
    solveSimplex();
  });

  // Toggle step sections
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("step-header")) {
      const content = e.target.nextElementSibling;
      content.classList.toggle("active");
    }
  });
  // style constraint rows on initial load
  styleConstraintRows();
});

function styleConstraintRows() {
  const rows = document.querySelectorAll(".constraint-row");
  rows.forEach((r, i) => {
    r.classList.remove("c-odd", "c-even");
    if (i % 2 === 0) r.classList.add("c-odd");
    else r.classList.add("c-even");
  });
}

function solveSimplex() {
  try {
    console.log('solveSimplex: starting');
    // Parse the objective function
    const objectiveInput = document.getElementById("objective").value;
    console.log('solveSimplex: objectiveInput=', objectiveInput);
    const objective = parseExpression(objectiveInput);
    console.log('solveSimplex: objective parsed=', objective);

    // Parse constraints
    const constraints = [];
    const constraintRows = document.querySelectorAll(".constraint-row");

    constraintRows.forEach((row) => {
      const expressionInput = row.querySelector(".constraint-input").value;
      const inequality = row.querySelector(".constraint-select").value;
      const rhs = parseFloat(row.querySelector(".constraint-rhs").value);

      if (expressionInput && !isNaN(rhs)) {
        const expression = parseExpression(expressionInput);
        constraints.push({
          expression: expression,
          inequality: inequality,
          rhs: rhs,
        });
      }
    });

    // Convert to canonical form and solve
    const solution = performSimplex(objective, constraints);
    console.log('solveSimplex: performSimplex returned', solution);

    // Display the solution
    displaySolution(solution);

    // Show the output section
    document.getElementById("output-section").style.display = "block";
  } catch (error) {
    console.error('solveSimplex: error ->', error);
    alert("Error: " + error.message + " (check console for details)");
  }
}

function parseExpression(expression) {
  // Simple parser for expressions like "1.5x + 1.2y"
  const terms = {};
  const regex = /([+-]?\s*\d*\.?\d*)\s*([a-zA-Z])/g;
  let match;

  // Add implicit + if not present at the beginning
  let expr = expression.trim();
  if (!expr.startsWith("-") && !expr.startsWith("+")) {
    expr = "+" + expr;
  }

  while ((match = regex.exec(expr)) !== null) {
    let coefficient = match[1].replace(/\s/g, "");
    const variable = match[2];

    if (coefficient === "+" || coefficient === "") {
      coefficient = "1";
    } else if (coefficient === "-") {
      coefficient = "-1";
    }

    terms[variable] = parseFloat(coefficient);
  }

  return terms;
}

function performSimplex(objective, constraints) {
  // Extract variables from objective and constraints
  const variables = new Set();

  // Add variables from objective
  Object.keys(objective).forEach((variable) => variables.add(variable));

  // Add variables from constraints
  constraints.forEach((constraint) => {
    Object.keys(constraint.expression).forEach((variable) =>
      variables.add(variable)
    );
  });

  const variableList = Array.from(variables).sort();
  const numVariables = variableList.length;
  const numConstraints = constraints.length;

  // Create initial tableau
  let tableau = [];
  let basicVars = [];

  // Add constraint rows
  for (let i = 0; i < numConstraints; i++) {
    const constraint = constraints[i];
    const row = [];

    // Add coefficients for decision variables
    for (let j = 0; j < numVariables; j++) {
      const variable = variableList[j];
      row.push(constraint.expression[variable] || 0);
    }

    // Add slack/surplus variables
    for (let j = 0; j < numConstraints; j++) {
      row.push(i === j ? 1 : 0);
    }

    // Add RHS
    row.push(constraint.rhs);

    tableau.push(row);
    basicVars.push(`s${i + 1}`);
  }

  // Add objective row
  const objRow = [];
  for (let j = 0; j < numVariables; j++) {
    const variable = variableList[j];
    objRow.push(-(objective[variable] || 0)); // Negative because we're maximizing
  }

  // Add zeros for slack variables in objective row
  for (let j = 0; j < numConstraints; j++) {
    objRow.push(0);
  }

  // Add RHS for objective row
  objRow.push(0);

  tableau.push(objRow);
  basicVars.push("Z");

  // Create the full variable list (decision + slack)
  const allVariables = [...variableList];
  for (let i = 0; i < numConstraints; i++) {
    allVariables.push(`s${i + 1}`);
  }

  // Solve using simplex method
  const tableaus = [];
  let iteration = 1;

  while (true) {
    // Check if we're optimal (no negative in objective row)
    const objRow = tableau[tableau.length - 1];
    let hasNegative = false;
    let pivotCol = -1;

    // Find the most negative in objective row (excluding RHS)
    let mostNegative = 0;
    for (let j = 0; j < objRow.length - 1; j++) {
      if (objRow[j] < mostNegative) {
        mostNegative = objRow[j];
        pivotCol = j;
        hasNegative = true;
      }
    }

    // If no negative, we're done
    if (!hasNegative) break;

    // Calculate ratios for pivot row selection
    const ratios = [];
    let pivotRow = -1;
    let minRatio = Infinity;

    // for (let i = 0; i < tableau.length - 1; i++) {
    //   const pivotVal = tableau[i][pivotCol];
    //   if (pivotVal > 0) {
    //     const ratio = tableau[i][tableau[i].length - 1] / pivotVal;
    //     ratios.push({
    //       value: ratio,
    //       text: `${formatNumber(
    //         tableau[i][tableau[i].length - 1]
    //       )} ÷ ${formatNumber(pivotVal)} = ${formatNumber(ratio)}`,
    //       isMin: false,
    //     });

    //     if (ratio < minRatio) {
    //       minRatio = ratio;
    //       pivotRow = i;
    //     }
    //   } else {
    //     ratios.push(null);
    //   }
    // }

      for (let i = 0; i < tableau.length - 1; i++) {
      const pivotVal = tableau[i][pivotCol];
      if (pivotVal > 0) {
        const ratio = tableau[i][tableau[i].length - 1] / pivotVal;
        ratios.push({
          value: ratio,
          text: `${
            tableau[i][tableau[i].length - 1]
          } ÷ ${formatNumber(pivotVal)} = ${formatNumber(ratio)}`,
          isMin: false,
        });

        if (ratio < minRatio) {
          minRatio = ratio;
          pivotRow = i;
        }
      } else {
        ratios.push(null);
      }
    }
  

    // If no positive pivot values, problem is unbounded
    if (pivotRow === -1) {
      throw new Error(
        "Problem is unbounded - no positive values in pivot column"
      );
    }

    // Mark the minimum ratio
    if (pivotRow !== -1) {
      ratios[pivotRow].isMin = true;
    }

    // Add null for objective row
    ratios.push(null);

    // Store current tableau
    const currentTableau = {
      number: iteration,
      basicVars: [...basicVars],
      variables: [...allVariables],
      matrix: tableau.map((row) => [...row]),
      ratios: [...ratios],
      pivotCol: pivotCol,
      pivotRow: pivotRow,
      pivotValue: tableau[pivotRow][pivotCol],
    };

    // Calculate pivot operations
    currentTableau.pivotOperations = calculatePivotOperations(
      tableau,
      pivotRow,
      pivotCol,
      basicVars,
      allVariables
    );

    tableaus.push(currentTableau);

    // Perform pivot operation
    const pivotElement = tableau[pivotRow][pivotCol];

    // Normalize pivot row
    for (let j = 0; j < tableau[pivotRow].length; j++) {
      tableau[pivotRow][j] /= pivotElement;
    }

    // Update other rows
    for (let i = 0; i < tableau.length; i++) {
      if (i !== pivotRow) {
        const factor = tableau[i][pivotCol];
        for (let j = 0; j < tableau[i].length; j++) {
          tableau[i][j] -= factor * tableau[pivotRow][j];
        }
      }
    }

    // Update basic variable
    basicVars[pivotRow] = allVariables[pivotCol];

    iteration++;

    // Safety check to prevent infinite loops
    if (iteration > 20) {
      throw new Error(
        "Maximum iterations exceeded. The problem might be unbounded or infeasible."
      );
    }
  }

  // Add final tableau
  tableaus.push({
    number: iteration,
    basicVars: [...basicVars],
    variables: [...allVariables],
    matrix: tableau.map((row) => [...row]),
    ratios: [],
    pivotCol: null,
    pivotRow: null,
    pivotValue: null,
    pivotOperations: null,
  });

  // Extract solution
  const solution = {};
  for (let i = 0; i < variableList.length; i++) {
    const variable = variableList[i];
    solution[variable] = 0;

    // Check if this variable is basic
    const basicIndex = basicVars.indexOf(variable);
    if (basicIndex !== -1) {
      solution[variable] = tableau[basicIndex][tableau[basicIndex].length - 1];
    }
  }

  solution.z =
    tableau[tableau.length - 1][tableau[tableau.length - 1].length - 1];

  return {
    tableaus: tableaus,
    solution: solution,
    variableList: variableList,
    constraints: constraints,
    objective: objective,
  };
}

function calculatePivotOperations(
  tableau,
  pivotRow,
  pivotCol,
  basicVars,
  allVariables
) {
  const pivotOperations = {
    pivotRow: [],
    otherRows: [],
  };

  const pivotElement = tableau[pivotRow][pivotCol];

  // Calculate pivot row operations
  for (let j = 0; j < tableau[pivotRow].length; j++) {
    const oldValue = tableau[pivotRow][j];
    const newValue = oldValue / pivotElement;
    pivotOperations.pivotRow.push({
      operation: `${formatNumber(oldValue)}(1/${formatNumber(
        pivotElement
      )}) = ${formatNumber(newValue)}`,
      result: newValue,
    });
  }

  // Calculate operations for other rows
  for (let i = 0; i < tableau.length; i++) {
    if (i !== pivotRow) {
      const rowOps = [];
      const factor = tableau[i][pivotCol];

      for (let j = 0; j < tableau[i].length; j++) {
        const oldValue = tableau[i][j];
        // pivotRowOriginal is the entry from the pivot row before normalization
        const pivotRowOriginal = tableau[pivotRow][j];
        const pivotNormalized = pivotRowOriginal / pivotElement;
        const newValue = oldValue - factor * pivotNormalized;

        // Format as: old - pivotNormalized(factor) = new  (matches requested layout)
        rowOps.push({
          operation: `${formatNumber(oldValue)} - ${formatNumber(
            pivotNormalized
          )}(${formatNumber(factor)}) = ${formatNumber(newValue)}`,
          result: newValue,
        });
      }

      pivotOperations.otherRows.push({
        rowName: basicVars[i],
        operations: rowOps,
      });
    }
  }

  return pivotOperations;
}

function displaySolution(solution) {
  console.log('displaySolution: rendering solution', solution);
  const stepsContainer = document.getElementById("solution-steps");
  if (!stepsContainer) {
    console.error('displaySolution: #solution-steps element not found!');
    // attempt to show a helpful message in the output section
    const out = document.getElementById('output-section');
    if (out) {
      out.style.display = 'block';
      out.innerHTML = '<div style="padding:18px;color:#ffd6a5;background:rgba(0,0,0,0.04);border-radius:8px;">Unexpected error: output container missing. See console for details.</div>';
    }
    return;
  }
  stepsContainer.innerHTML = "";

  // Get constraint rows for display
  const constraintRows = document.querySelectorAll(".constraint-row");
  // Display LP Model (once) above tableaus
  const lpModelBlock = renderLPModel(solution, constraintRows);
  if (lpModelBlock) stepsContainer.appendChild(lpModelBlock);

  // Display each tableau
  solution.tableaus.forEach((tableau, index) => {
    const stepSection = document.createElement("div");
    stepSection.className = "step-section fade-up";

    const stepHeader = document.createElement("div");
    stepHeader.className = "step-header";
    stepHeader.innerHTML = `Tableau ${tableau.number}`;

    const stepContent = document.createElement("div");
    stepContent.className = "step-content";

    // Create tableau table
    const table = document.createElement("table");

    // (per-tableau LP standard rendering removed — LP Model shown once)

    // Create header row
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = "<th>Basic</th>";

    tableau.variables.forEach((variable, hIndex) => {
      const th = document.createElement('th');
      th.innerHTML = variable;
      // highlight pivot column header
      if (tableau.pivotCol !== null && hIndex === tableau.pivotCol) {
        th.classList.add('pivot-col-header');
      }
      headerRow.appendChild(th);
    });

    headerRow.innerHTML += "<th>RHS</th>";
    if (tableau.ratios.length > 0) {
      headerRow.innerHTML += "<th>Ratio</th>";
    }

    table.appendChild(headerRow);

    // Create data rows
    tableau.matrix.forEach((row, rowIndex) => {
      const tr = document.createElement("tr");
      // mark pivot row for full-row highlighting
      if (tableau.pivotRow !== null && rowIndex === tableau.pivotRow) {
        tr.classList.add('pivot-row');
        // also add encircle-row to visually ring the row
        tr.classList.add('encircle-row');
      }

      // Basic variable
      tr.innerHTML = `<td>${tableau.basicVars[rowIndex]}</td>`;

      // Coefficients
      row.forEach((value, colIndex) => {
           const td = document.createElement("td");

    // First tableau → raw numbers; others → formatted numbers
    if (index === 0) {
        td.textContent = value;
    } else {
        td.textContent = formatNumber(value);
    }


        // Highlight pivot element / pivot row / pivot column
        if (tableau.pivotCol !== null) {
          if (rowIndex === tableau.pivotRow && colIndex === tableau.pivotCol) {
            td.classList.add("pivot-element");
          } else if (rowIndex === tableau.pivotRow) {
            td.classList.add("pivot-row-cell");
            // add small ring effect on row cells
            td.classList.add('encircle');
          } else if (colIndex === tableau.pivotCol) {
            td.classList.add("pivot-col-cell");
            // add encircle to column cells to visually ring them
            td.classList.add('encircle');
          }
        }

        tr.appendChild(td);
      });

      // Ratio
      if (tableau.ratios.length > 0 && tableau.ratios[rowIndex]) {
        const ratioTd = document.createElement("td");
        ratioTd.textContent = tableau.ratios[rowIndex].text;
        if (tableau.ratios[rowIndex].isMin) {
          ratioTd.innerHTML += ' <span class="success">← smallest ratio</span>';
        }
        tr.appendChild(ratioTd);
      } else if (tableau.ratios.length > 0) {
        tr.innerHTML += "<td></td>";
      }

      table.appendChild(tr);
    });

    const tableauWrapper = document.createElement('div');
    tableauWrapper.className = 'tableau-container';
    tableauWrapper.appendChild(table);
    stepContent.appendChild(tableauWrapper);

    // Add pivot information if applicable
    if (tableau.pivotCol !== null) {
      const pivotInfo = document.createElement("div");
      pivotInfo.innerHTML = `
                        <p><strong>Pivot Column:</strong> Most negative in Z-row: ${
                          tableau.variables[tableau.pivotCol]
                        }</p>
                        <p><strong>Pivot Row:</strong> Smallest positive ratio: ${
                          tableau.basicVars[tableau.pivotRow]
                        }</p>
                        <p><strong>Pivot Element:</strong> ${formatNumber(
                          tableau.pivotValue
                        )}</p>
                        <p><strong>Pivot Operation:</strong> P<sub>${
                          tableau.basicVars[tableau.pivotRow]
                        }</sub> = 1/k = 1/${formatNumber(
        tableau.pivotValue
      )}</p>
                    `;
      stepContent.appendChild(pivotInfo);

      // Show pivot operations if available
      if (tableau.pivotOperations) {
        // Add a clear heading for the elimination steps
        const title = document.createElement("h4");
        title.textContent = "Pivotal Elimination Steps";
        stepContent.appendChild(title);
        const pivotOps = document.createElement("div");
        pivotOps.className = "pivot-operations";

        // Legend for pivot color coding (uses CSS classes so colors stay in sync)
        const legend = document.createElement("div");
        legend.className = 'pivot-legend';
        legend.innerHTML = `
          <div class="legend-item"><span class="swatch swatch-pivot-element" aria-hidden="true"></span><span class="legend-label">Pivot element</span></div>
          <div class="legend-item"><span class="swatch swatch-pivot-col" aria-hidden="true"></span><span class="legend-label">Pivot column</span></div>
          <div class="legend-item"><span class="swatch swatch-pivot-row" aria-hidden="true"></span><span class="legend-label">Pivot row</span></div>
        `;
        stepContent.appendChild(legend);

        const pivotTable = document.createElement("table");
        pivotTable.className = "pivot-table";

        // Create header for pivot operations
        const headerRow = document.createElement("tr");
        const enterVar = tableau.variables[tableau.pivotCol] || "enter";
        // Pivot row header — show which variable enters
        headerRow.innerHTML = `<th>${
          tableau.basicVars[tableau.pivotRow]
        }(P<sub>${
          tableau.basicVars[tableau.pivotRow]
        }</sub>) = ${enterVar}</th>`;

        // Add headers for other rows (rows that are changed by elimination)
        tableau.pivotOperations.otherRows.forEach((rowOp) => {
          headerRow.innerHTML += `<th>${rowOp.rowName} - ${enterVar}(P<sub>${rowOp.rowName}</sub>) = ${rowOp.rowName}</th>`;
        });

        pivotTable.appendChild(headerRow);

        // Create rows for each operation
        const maxRows = Math.max(
          tableau.pivotOperations.pivotRow.length,
          ...tableau.pivotOperations.otherRows.map(
            (row) => row.operations.length
          )
        );

        for (let i = 0; i < maxRows; i++) {
          const row = document.createElement("tr");

          // Pivot row operations
          const pivotOp = tableau.pivotOperations.pivotRow[i] || {
            operation: "",
            result: "",
          };
          row.innerHTML += `<td>${pivotOp.operation}</td>`;

          // Other rows operations
          tableau.pivotOperations.otherRows.forEach((rowOp) => {
            const op = rowOp.operations[i] || { operation: "", result: "" };
            row.innerHTML += `<td>${op.operation}</td>`;
          });

          pivotTable.appendChild(row);
        }

        pivotOps.appendChild(pivotTable);
        stepContent.appendChild(pivotOps);
      }
    }

    stepSection.appendChild(stepHeader);
    stepSection.appendChild(stepContent);
    stepsContainer.appendChild(stepSection);

    try {
      
      requestAnimationFrame(() => stepSection.classList.add('visible'));
    } catch (e) {
      stepSection.classList.add('visible');
    }

    if (index === 0) {
      stepContent.classList.add("active");
    }
  });

  const solutionSection = document.createElement("div");
  solutionSection.className = "solution-section";

  // Optimal solution summary
  let solutionHTML = `<h3>Solution Verification</h3>`;
  const optParts = solution.variableList.map(v => `${v} = ${formatNumber(solution.solution[v])}`);
  solutionHTML += `<p><strong>Optimal Solution: ${optParts.join(', ')}, Z = ${formatNumber(solution.solution.z)}</strong></p>`;

  // Constraint step-by-step substitution checks
  solutionHTML += `<div class="validation"><h4>Constraint Validation</h4>`;
  solution.constraints.forEach((constraint, idx) => {
    // original constraint text
    const constraintInput = constraintRows[idx]?.querySelector('.constraint-input')?.value || '';
    const rhs = constraint.rhs;
    solutionHTML += `<p class="math-expression">${constraintInput} ${constraint.inequality} ${formatNumber(rhs)}</p>`;

    // substitution: e.g., 2(6) + 3(4)
    const multParts = [];
    const sumParts = [];
    let total = 0;
    solution.variableList.forEach(v => {
      const coeff = constraint.expression[v] || 0;
      if (Math.abs(coeff) < 1e-9) return;
      const varVal = solution.solution[v] || 0;
      multParts.push(`${formatNumber(coeff)}(${formatNumber(varVal)})`);
      const prod = coeff * varVal;
      sumParts.push(formatNumber(prod));
      total += prod;
    });

    solutionHTML += `<p>${multParts.join(' + ')}</p>`;
    solutionHTML += `<p>${sumParts.join(' + ')}</p>`;
    // comparison
    let isValid = false;
    if (constraint.inequality === '<=') isValid = total <= rhs + 1e-6;
    else if (constraint.inequality === '>=') isValid = total >= rhs - 1e-6;
    else isValid = Math.abs(total - rhs) < 1e-6;
    solutionHTML += `<p>${formatNumber(total)} ${constraint.inequality} ${formatNumber(rhs)} <span class="success">${isValid? '✔ True' : '✘ False'}</span></p>`;
  });

  // Objective check
  solutionHTML += `<h4>Objective Function Check</h4>`;
  const rawObjective = document.getElementById('objective')?.value || '';
  solutionHTML += `<p class="math-expression">Z = ${rawObjective}</p>`;
  const objMult = [];
  const objSumParts = [];
  let objTotal = 0;
  solution.variableList.forEach(v => {
    const coeff = solution.objective[v] || 0;
    if (Math.abs(coeff) < 1e-12) return;
    const val = solution.solution[v] || 0;
    objMult.push(`${formatNumber(coeff)}(${formatNumber(val)})`);
    const prod = coeff * val;
    objSumParts.push(formatNumber(prod));
    objTotal += prod;
  });
  solutionHTML += `<p>${objMult.join(' + ')}</p>`;
  solutionHTML += `<p>${objSumParts.join(' + ')}</p>`;
  const objValid = Math.abs(objTotal - solution.solution.z) < 1e-6;
  solutionHTML += `<p>${formatNumber(objTotal)} = ${formatNumber(solution.solution.z)} <span class="success">${objValid? '✔ True' : '✘ False'}</span></p>`;

  solutionHTML += `</div>`;
  solutionSection.innerHTML = solutionHTML;

  solutionSection.classList.add('fade-up');
  requestAnimationFrame(() => solutionSection.classList.add('visible'));
  stepsContainer.appendChild(solutionSection);
  // scroll user to results area on small screens
  try {
    document.getElementById('output-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {}
}

function approximateFraction(value, maxDenominator = 24, tol = 0.005) {
  // Returns an object {num, den, str} approximating value as an improper fraction (not mixed)
  if (!isFinite(value) || isNaN(value)) return null;
  const sign = value < 0 ? -1 : 1;
  let v = Math.abs(value);

  let best = {num: 0, den: 1, err: Math.abs(v - 0)};
  for (let den = 1; den <= maxDenominator; den++) {
    const num = Math.round(v * den);
    const approx = num / den;
    const err = Math.abs(v - approx);
    if (err < best.err) {
      best = {num, den, err};
    }
  }

  if (best.err <= tol) {
    const n = best.num * sign;
    const d = best.den;
    
    if (d === 1) {
      return {num: n, den: 1, str: String(n)};
    }

    return {num: n, den: d, str: `${n}/${d}`};
  }

  return null;
}

function formatNumber(num) {
  if (!isFinite(num) || isNaN(num)) return String(num);
  // small integers and zero
  if (Math.abs(num) < 1e-12) return '0';
  if (num === 1) return '1';
  if (num === -1) return '-1';

  // Try common exact fractions first (fast path)
  const common = {
    '0.5': '1/2',
    '-0.5': '-1/2',
    '0.25': '1/4',
    '-0.25': '-1/4',
    '0.75': '3/4',
    '-0.75': '-3/4',
    '1.5': '3/2',
    '-1.5': '-3/2',
    '0.3333333333': '1/3',
    '-0.3333333333': '-1/3',
    '0.6666666667': '2/3',
    '-0.6666666667': '-2/3',
    '0.2': '1/5',
    '-0.2': '-1/5',
    '0.1666666667': '1/6',
    '-0.1666666667': '-1/6'
  };

  for (const k in common) {
    if (Math.abs(num - parseFloat(k)) < 0.005) return common[k];
  }

  // Attempt rational approximation with denominators up to 24
  const approx = approximateFraction(num, 24, 0.006);
  if (approx && approx.str) return approx.str;

  // Fallback to fixed decimal
  return Number.isInteger(num) ? String(num) : num.toFixed(3);
}

function renderLPStandard(tableau, objective) {
  try {
    const container = document.createElement('div');
    container.className = 'lp-standard';
    const title = document.createElement('h4');
    title.textContent = 'Current LP (canonical)';
    container.appendChild(title);

    // Objective (Maximize)
    if (objective && Object.keys(objective).length > 0) {
      const objP = document.createElement('p');
      let parts = [];
      Object.keys(objective).forEach(v => {
        const coeff = objective[v] || 0;
        if (coeff === 0) return;
        parts.push(`${formatNumber(coeff)}${v}`);
      });
      objP.innerHTML = `<strong>Maximize Z =</strong> ${parts.join(' + ')}`;
      container.appendChild(objP);
    }

    // Constraints in current tableau (basic variable definitions)
    tableau.matrix.forEach((row, i) => {
      // skip objective row (we'll show basic vars only)
      if (tableau.basicVars[i] === 'Z') return;
      const basic = tableau.basicVars[i];
      const rhs = row[row.length - 1];
      const terms = [];
      tableau.variables.forEach((v, j) => {
        const coeff = row[j];
        if (Math.abs(coeff) < 1e-9) return;
        terms.push(`${formatNumber(coeff)}${v}`);
      });
      const p = document.createElement('p');
      p.innerHTML = `<strong>${basic} =</strong> ${terms.join(' + ')} ${terms.length ? '+' : ''} ${formatNumber(rhs)}`;
      container.appendChild(p);
    });

    return container;
  } catch (e) {
    return null;
  }
}

function renderLPModel(solution, constraintRows) {
  try {
    const container = document.createElement('div');
    container.className = 'lp-standard';
    const title = document.createElement('h3');
    title.textContent = 'LP Model';
    container.appendChild(title);

    // Objective original text (from input) and canonical form
    const rawObjective = document.getElementById('objective')?.value || '';
    const objParts = [];
    Object.keys(solution.objective || {}).forEach(v => {
      const coeff = solution.objective[v] || 0;
      if (coeff === 0) return;
            //objParts.push(`${formatNumber(coeff)}${v}`);
      objParts.push(`${coeff}${v}`);
    });
    const objLine = document.createElement('p');
    objLine.innerHTML = `Z = ${rawObjective} --> z - ${objParts.join(' - ').replace(/\+ -/g,' - ')} = 0`;
    container.appendChild(objLine);

    // Constraints: show original input and canonical with slack
    const slackCount = solution.constraints.length;
    solution.constraints.forEach((constraint, i) => {
      const rowInput = constraintRows[i]?.querySelector('.constraint-input')?.value || '';
      const inequality = constraint.inequality || '<=';
      const rhs = constraint.rhs;
      const slackName = `s${i+1}`;
      const canonLeftParts = [];
      // build left expression from constraint.expression using variable order
      Object.keys(constraint.expression).forEach(v => {
        const coeff = constraint.expression[v];
        if (Math.abs(coeff) < 1e-9) return;
        canonLeftParts.push(`${formatNumber(coeff)}${v}`);
      });
      const canonLine = `${canonLeftParts.join(' + ')} + ${slackName} = ${formatNumber(rhs)}`;
      const p = document.createElement('p');
      p.innerHTML = `${rowInput} ${inequality} ${formatNumber(rhs)} --> ${canonLine}`;
      container.appendChild(p);
    });

    // Non-negativity
    const decisionVars = solution.variableList.join(', ');
    const slackVars = Array.from({length: slackCount}, (_,i) => `s${i+1}`).join(', ');
    const nn = document.createElement('p');
    nn.innerHTML = `${decisionVars} >= 0 --> ${decisionVars}${slackCount? (', ' + slackVars) : ''} >= 0`;
    container.appendChild(nn);

    return container;
  } catch (e) {
    return null;
  }
}
