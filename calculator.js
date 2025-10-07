// Set up the theme based on system preference or saved state
if (
  localStorage.theme === "dark" ||
  (!("theme" in localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

/**
 * Calculator Class
 * Handles all state and logic for the calculator operations.
 */
class Calculator {
  constructor(previousOperandTextElement, currentOperandTextElement) {
    this.previousOperandTextElement = previousOperandTextElement;
    this.currentOperandTextElement = currentOperandTextElement;
    this.clear();
  }

  clear() {
    this.currentOperand = "";
    this.previousOperand = "";
    this.operation = undefined;
  }

  delete() {
    this.currentOperand = this.currentOperand.toString().slice(0, -1);
  }

  appendNumber(number) {
    // Prevent multiple decimal points
    if (number === "." && this.currentOperand.includes(".")) return;
    this.currentOperand = this.currentOperand.toString() + number.toString();
  }

  chooseOperation(operation) {
    if (this.currentOperand === "") return;
    if (this.previousOperand !== "") {
      this.compute();
    }
    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = "";
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);
    if (isNaN(prev) || isNaN(current)) return;

    switch (this.operation) {
      case "+":
        computation = prev + current;
        break;
      case "-":
        computation = prev - current;
        break;
      case "*":
        computation = prev * current;
        break;
      case "÷":
        // Handle division by zero
        if (current === 0) {
          computation = "Error";
        } else {
          computation = prev / current;
        }
        break;
      default:
        return;
    }

    // Format the result to avoid too many decimal places
    if (typeof computation === "number") {
      computation = parseFloat(computation.toFixed(10));
    }

    this.currentOperand = computation;
    this.operation = undefined;
    this.previousOperand = "";
  }

  getDisplayNumber(number) {
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split(".")[0]);
    const decimalDigits = stringNumber.split(".")[1];
    let integerDisplay;
    if (isNaN(integerDigits)) {
      integerDisplay = "";
    } else {
      // Use locale string for thousands separator
      integerDisplay = integerDigits.toLocaleString("en", {
        maximumFractionDigits: 0,
      });
    }
    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }

  updateDisplay() {
    // Display the current result or input
    this.currentOperandTextElement.innerText = this.getDisplayNumber(
      this.currentOperand
    );

    // Display the previous operand and operation
    if (this.operation != null) {
      this.previousOperandTextElement.innerText = `${this.getDisplayNumber(
        this.previousOperand
      )} ${this.operation}`;
    } else {
      this.previousOperandTextElement.innerText = "";
    }
  }
}

/**
 * Main DOM and Event Listener Setup
 */
document.addEventListener("DOMContentLoaded", () => {
  const numberButtons = document.querySelectorAll("[data-number]");
  const operationButtons = document.querySelectorAll("[data-operation]");
  const equalsButton = document.querySelector("[data-equals]");
  const deleteButton = document.querySelector("[data-delete]");
  const allClearButton = document.querySelector("[data-all-clear]");
  const previousOperandTextElement = document.querySelector(
    "[data-previous-operand]"
  );
  const currentOperandTextElement = document.querySelector(
    "[data-current-operand]"
  );
  const themeToggleButton = document.querySelector("#theme-toggle");

  const calculator = new Calculator(
    previousOperandTextElement,
    currentOperandTextElement
  );

  // 1. Button Click Handlers
  numberButtons.forEach((button) => {
    button.addEventListener("click", () => {
      calculator.appendNumber(button.innerText);
      calculator.updateDisplay();
    });
  });

  operationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      calculator.chooseOperation(button.innerText);
      calculator.updateDisplay();
    });
  });

  equalsButton.addEventListener("click", (button) => {
    calculator.compute();
    calculator.updateDisplay();
  });

  allClearButton.addEventListener("click", (button) => {
    calculator.clear();
    calculator.updateDisplay();
  });

  deleteButton.addEventListener("click", (button) => {
    calculator.delete();
    calculator.updateDisplay();
  });

  // 2. Dark Mode Toggle
  themeToggleButton.addEventListener("click", () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.theme = "light";
    } else {
      html.classList.add("dark");
      localStorage.theme = "dark";
    }
  });

  // 3. Keyboard Input Support
  document.addEventListener("keydown", (e) => {
    const key = e.key;

    // Numbers and Decimal
    if ((key >= "0" && key <= "9") || key === ".") {
      calculator.appendNumber(key);
      calculator.updateDisplay();
    }

    // Operators
    if (key === "+" || key === "-" || key === "*" || key === "/") {
      // Normalize the display for division if using the keyboard '/'
      const operation = key === "/" ? "÷" : key;
      calculator.chooseOperation(operation);
      calculator.updateDisplay();
    }

    // Equals and Enter
    if (key === "=" || key === "Enter") {
      e.preventDefault(); // Prevent default Enter key behavior (e.g., submitting forms)
      calculator.compute();
      calculator.updateDisplay();
    }

    // Backspace (Delete) and Delete
    if (key === "Backspace") {
      calculator.delete();
      calculator.updateDisplay();
    }

    // Escape (All Clear)
    if (key === "Escape") {
      calculator.clear();
      calculator.updateDisplay();
    }
  });
});
