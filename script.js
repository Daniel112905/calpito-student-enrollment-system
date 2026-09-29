// 1. Get elements from the page
const form = document.getElementById("enrollment-form");
const tableBody = document.getElementById("enrollment-table-body");
const studentIdInput = document.getElementById("student-id");
const prefixInput = document.getElementById("prefix");
const firstNameInput = document.getElementById("first-name");
const middleNameInput = document.getElementById("middle-name");
const lastNameInput = document.getElementById("last-name");
const suffixInput = document.getElementById("suffix");
const emailInput = document.getElementById("email");
const courseSelect = document.getElementById("course");
const majorGroup = document.getElementById("major-group");
const majorSelect = document.getElementById("major");
const yearLevelSelect = document.getElementById("year-level");

// Turn off the browser's built-in validation popups so our own
// error messages (shown below each field) are used instead.
form.noValidate = true;

// 2. Helper functions for error messages
// Show a red error message below a field and mark it as invalid
function showError(input, message) {
  clearError(input); // avoid duplicate messages

  input.classList.add("error");

  const errorElement = document.createElement("p");
  errorElement.className = "error-message";
  errorElement.id = input.id + "-error";
  errorElement.textContent = message;

  input.parentElement.appendChild(errorElement);
}

// Remove the error message and error styling from a field
function clearError(input) {
  input.classList.remove("error");

  const errorElement = document.getElementById(input.id + "-error");
  if (errorElement) {
    errorElement.remove();
  }
}

// 3. Helper functions for the success message

// Show a green success message above the form
function showSuccess(message) {
  hideSuccess(); // remove any previous message

  const successElement = document.createElement("p");
  successElement.id = "success-message";
  successElement.className = "success-message";
  successElement.setAttribute("role", "status");
  successElement.textContent = message;

  form.parentElement.insertBefore(successElement, form);
}

function hideSuccess() {
  const successElement = document.getElementById("success-message");
  if (successElement) {
    successElement.remove();
  }
}

// 4. Validation functions
// Required text field with a minimum length
function validateRequired(input, minLength, message) {
  if (input.value.trim().length < minLength) {
    showError(input, message);
    return false;
  }
  return true;
}

// Optional text field: only checked if the user typed something
function validateOptional(input, minLength, message) {
  const value = input.value.trim();
  if (value.length > 0 && value.length < minLength) {
    showError(input, message);
    return false;
  }
  return true;
}

function validateEmail() {
  const email = emailInput.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    showError(emailInput, "Please enter a valid email address.");
    return false;
  }
  return true;
}

function validateCourse() {
  if (courseSelect.value === "") {
    showError(courseSelect, "Please select a course.");
    return false;
  }
  return true;
}

// Major is only required when BSIT is selected
function validateMajor() {
  if (courseSelect.value === "BSIT" && majorSelect.value === "") {
    showError(majorSelect, "Please select a major for BSIT.");
    return false;
  }
  return true;
}

function validateYearLevel() {
  if (yearLevelSelect.value === "") {
    showError(yearLevelSelect, "Please select a year level.");
    return false;
  }
  return true;
}

// Run every validation. Returns true only if ALL fields are valid.
function validateForm() {
  const allFields = [
    studentIdInput, prefixInput, firstNameInput, middleNameInput,
    lastNameInput, suffixInput, emailInput, courseSelect,
    majorSelect, yearLevelSelect
  ];
  allFields.forEach(clearError);

  // Run all checks (results are stored so every error is shown at once)
  const checks = [
    { input: studentIdInput, valid: validateRequired(studentIdInput, 5, "Student ID must be at least 5 characters.") },
    { input: prefixInput, valid: validateOptional(prefixInput, 2, "Prefix must be at least 2 characters.") },
    { input: firstNameInput, valid: validateRequired(firstNameInput, 3, "First name must be at least 3 characters.") },
    { input: middleNameInput, valid: validateOptional(middleNameInput, 2, "Middle name must be at least 2 characters.") },
    { input: lastNameInput, valid: validateRequired(lastNameInput, 2, "Last name must be at least 2 characters.") },
    { input: suffixInput, valid: validateOptional(suffixInput, 2, "Suffix must be at least 2 characters.") },
    { input: emailInput, valid: validateEmail() },
    { input: courseSelect, valid: validateCourse() },
    { input: majorSelect, valid: validateMajor() },
    { input: yearLevelSelect, valid: validateYearLevel() }
  ];

  // Find the first invalid field and focus it
  const firstInvalid = checks.find(function (check) {
    return !check.valid;
  });

  if (firstInvalid) {
    firstInvalid.input.focus();
    return false;
  }
  return true;
}

// 5. Show / hide the BSIT Major dropdown
function toggleMajorField() {
  if (courseSelect.value === "BSIT") {
    majorGroup.hidden = false;
  } else {
    majorGroup.hidden = true;
    majorSelect.value = ""; // clear the selected major
    clearError(majorSelect); // no error for non-BSIT courses
  }
}

// 6. Add a new row to the submitted data table
function addStudentToTable(student) {
  const row = document.createElement("tr");

  // Cells in the same order as the table headings
  const cellValues = [
    student.studentId,
    student.fullName,
    student.email,
    student.course,
    student.major,
    student.yearLevel
  ];

  cellValues.forEach(function (value) {
    const cell = document.createElement("td");
    cell.textContent = value; // textContent is safe for user input
    row.appendChild(cell);
  });

  tableBody.appendChild(row);
}

// Build the complete name, skipping any empty parts
function buildFullName() {
  const nameParts = [
    prefixInput.value.trim(),
    firstNameInput.value.trim(),
    middleNameInput.value.trim(),
    lastNameInput.value.trim(),
    suffixInput.value.trim()
  ];

  return nameParts
    .filter(function (part) {
      return part !== "";
    })
    .join(" ");
}

// 7. Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading
  hideSuccess();

  if (!validateForm()) {
    return; // stop here if there are errors
  }

  // Collect the valid data
  const student = {
    studentId: studentIdInput.value.trim(),
    fullName: buildFullName(),
    email: emailInput.value.trim(),
    course: courseSelect.value,
    major: courseSelect.value === "BSIT" ? majorSelect.value : "N/A",
    yearLevel: yearLevelSelect.value
  };

  // Show it in the table
  addStudentToTable(student);

  // Show success message
  showSuccess("Enrollment submitted successfully!");

  // Reset the form and hide the Major field again
  form.reset();
  toggleMajorField();
});

// 8. Clear errors when the user starts correcting a field
[
  studentIdInput, prefixInput, firstNameInput,
  middleNameInput, lastNameInput, suffixInput, emailInput
].forEach(function (input) {
  input.addEventListener("input", function () {
    clearError(input);
    hideSuccess();
  });
});

// Dropdowns: clear on "change"
[courseSelect, majorSelect, yearLevelSelect].forEach(function (select) {
  select.addEventListener("change", function () {
    clearError(select);
    hideSuccess();
  });
});

// Show or hide Major whenever the course changes
courseSelect.addEventListener("change", toggleMajorField);

// 9. Set the initial state when the page loads
toggleMajorField();