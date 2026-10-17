const form = document.querySelector("#decision-form");
const decisionInput = document.querySelector("#decision");
const contextInput = document.querySelector("#context");
const timeframeInput = document.querySelector("#timeframe");
const results = document.querySelector("#results");
const resetButton = document.querySelector("#reset-button");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const decision = decisionInput.value.trim();
  const context = contextInput.value.trim();
  const timeframe = timeframeInput.value;

  if (!decision) {
    decisionInput.focus();
    return;
  }

  // Show a possible positive outcome
  document.querySelector("#positive-text").textContent =
    `One possible positive outcome is that exploring "${decision}" helps you make progress. For a ${timeframe} goal, small consistent steps can add up.`;

  // Show possible challenges
  document.querySelector("#challenge-text").textContent =
    context
      ? `Your situation — "${context}" — may affect how practical this choice is. Consider the time, effort, costs, and what you might need to give up.`
      : "The result is uncertain. Consider the time, effort, costs, and what you might need to give up before deciding.";

  // Suggest the next step
  document.querySelector("#next-text").textContent =
    "Write down your main goal, choose one small step you can test, and decide when you will review the result. Compare alternatives before making a major commitment.";

  // Display the results
  results.hidden = false;
  results.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
});

// Reset the form
resetButton.addEventListener("click", () => {
  form.reset();
  results.hidden = true;
  decisionInput.focus();

  form.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
});