/**
 * Extracts and calculates token usage from agent step logs
 * @param {Array} steps - Array of step objects from the agent execution
 * @returns {Object} Token summary with per-step breakdown and totals
 */
export function calculateTokenUsage(steps) {
  // Guard against non-array input
  if (!steps || !Array.isArray(steps)) {
    return {
      stepBreakdown: [],
      summary: {
        totalInputTokens: 0,
        totalOutputTokens: 0,
        grandTotal: 0,
        llmCallCount: 0,
        totalSteps: 0,
      },
    };
  }

  const stepBreakdown = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  steps.forEach((step, index) => {
    const stepData = {
      stepNumber: index + 1,
      stepId: step.step_id,
      stepName: step.step_name,
      stepType: step.step_type,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    };

    // Only LLM calls have token counts
    if (step.tokens) {
      stepData.inputTokens = step.tokens.promptTokenCount || 0;
      stepData.outputTokens = step.tokens.candidatesTokenCount || 0;
      stepData.totalTokens = step.tokens.totalTokenCount || 0;

      totalInputTokens += stepData.inputTokens;
      totalOutputTokens += stepData.outputTokens;
    }

    stepBreakdown.push(stepData);
  });

  return {
    stepBreakdown,
    summary: {
      totalInputTokens,
      totalOutputTokens,
      grandTotal: totalInputTokens + totalOutputTokens,
      llmCallCount: stepBreakdown.filter((s) => s.totalTokens > 0).length,
      totalSteps: steps.length,
    },
  };
}

/**
 * Formats token usage into a readable string
 * @param {Object} tokenUsage - Output from calculateTokenUsage
 * @returns {string} Formatted token report
 */
export function formatTokenReport(tokenUsage) {
  const { stepBreakdown, summary } = tokenUsage;

  let report = "=== Token Usage Report ===\n\n";
  report += "Per-Step Breakdown:\n";
  report += "-".repeat(80) + "\n";
  report += "Step | Name                  | Type      | Input    | Output   | Total\n";
  report += "-".repeat(80) + "\n";

  stepBreakdown.forEach((step) => {
    const name = step.stepName.padEnd(20).slice(0, 20);
    const type = step.stepType.padEnd(9).slice(0, 9);
    const input = step.inputTokens.toString().padStart(8);
    const output = step.outputTokens.toString().padStart(8);
    const total = step.totalTokens.toString().padStart(8);

    report += `${step.stepNumber.toString().padStart(4)} | ${name} | ${type} | ${input} | ${output} | ${total}\n`;
  });

  report += "-".repeat(80) + "\n\n";
  report += "Summary:\n";
  report += `  Total Input Tokens:  ${summary.totalInputTokens.toLocaleString()}\n`;
  report += `  Total Output Tokens: ${summary.totalOutputTokens.toLocaleString()}\n`;
  report += `  Grand Total:         ${summary.grandTotal.toLocaleString()}\n`;
  report += `  LLM Calls:           ${summary.llmCallCount}\n`;
  report += `  Total Steps:         ${summary.totalSteps}\n`;

  return report;
}

/**
 * Quick function to get just the totals
 * @param {Array} steps - Array of step objects
 * @returns {Object} Just the summary totals
 */
export function getTokenTotals(steps) {
  // Guard against non-array input
  if (!steps || !Array.isArray(steps)) {
    return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  }
  
  return steps.reduce(
    (acc, step) => {
      if (step && step.tokens) {
        acc.inputTokens += step.tokens.promptTokenCount || 0;
        acc.outputTokens += step.tokens.candidatesTokenCount || 0;
        acc.totalTokens += step.tokens.totalTokenCount || 0;
      }
      return acc;
    },
    { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
  );
}

// Example usage:
// const steps = [...]; // Your JSON array
// const usage = calculateTokenUsage(steps);
// console.log(formatTokenReport(usage));
// Or just: console.log(getTokenTotals(steps));
