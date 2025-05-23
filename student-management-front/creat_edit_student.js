let currentStudentId = null;
const editModal = document.getElementById("editModal");
const createModal = document.getElementById("createModal");
const deleteModal = document.getElementById("deleteModal");
const closeButtons = document.querySelectorAll(".close");
const cancelButtons = document.querySelectorAll(".btn-cancel");

// Cache for dropdown options
const optionsCache = {
  sexes: [],
  nationalities: [],
  regions: [],
  faculties: [],
  kafedras: [],
  groups: [],
  educationTypes: [],
  statuses: [],
};

const endpointMap = {
  faculties: "http://localhost:3000/api/categorias/faculties",
  kafedras: "http://localhost:3000/api/categorias/kafedras",
  regions: "http://localhost:3000/api/categorias/regions",
  statuses: "http://localhost:3000/api/categorias/statuses",
  sexes: "http://localhost:3000/api/categorias/sexes",
  groups: "http://localhost:3000/api/categorias/groups",
  nationalities: "http://localhost:3000/api/categorias/nationalities",
  education_types: "http://localhost:3000/api/categorias/education_types",
};

// Helper function to calculate age from birth date
function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Check if user is 18+ years old
function isAdult(birthDate) {
  return calculateAge(birthDate) >= 18;
}

// Real-time age validation
function setupAgeValidation() {
  const birthDateInputs = [
    document.getElementById("createBirthDate"),
    document.getElementById("editBirthDate"),
  ];

  birthDateInputs.forEach((input) => {
    if (input) {
      input.addEventListener("change", function () {
        if (this.value) {
          if (!isAdult(this.value)) {
            alert("Student must be at least 18 years old!");
            this.value = ""; // Clear the invalid date
          }
        }
      });
    }
  });
}

// Real-time email validation
async function checkEmailExists(email, fieldId) {
  if (!email) return false;

  try {
    const response = await fetch(
      `http://localhost:3000/api/students/check-email?email=${email}`
    );
    const result = await response.json();

    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (result.exists) {
      field.style.borderColor = "red";
      if (errorElement) errorElement.textContent = "Email already exists";
      return true;
    } else {
      field.style.borderColor = "";
      if (errorElement) errorElement.textContent = "";
      return false;
    }
  } catch (error) {
    console.error("Error checking email:", error);
    return false;
  }
}

// Real-time passport validation
async function checkPassportExists(passport, fieldId) {
  if (!passport) return false;

  try {
    const response = await fetch(
      `http://localhost:3000/api/students/check-passport?passport=${passport}`
    );
    const result = await response.json();

    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (result.exists) {
      field.style.borderColor = "red";
      if (errorElement) errorElement.textContent = "Passport already exists";
      return true;
    } else {
      field.style.borderColor = "";
      if (errorElement) errorElement.textContent = "";
      return false;
    }
  } catch (error) {
    console.error("Error checking passport:", error);
    return false;
  }
}

// Setup real-time validation
function setupRealTimeValidation() {
  // Email validation
  const emailFields = [
    { field: document.getElementById("createEmail"), id: "createEmail" },
    { field: document.getElementById("editEmail"), id: "editEmail" },
  ];

  emailFields.forEach((item) => {
    if (item.field) {
      item.field.addEventListener("blur", async function () {
        await checkEmailExists(this.value, item.id);
      });
    }
  });

  // Passport validation
  const passportFields = [
    {
      field: document.getElementById("createPassportNumber"),
      id: "createPassportNumber",
    },
    {
      field: document.getElementById("editPassportNumber"),
      id: "editPassportNumber",
    },
  ];

  passportFields.forEach((item) => {
    if (item.field) {
      item.field.addEventListener("blur", async function () {
        await checkPassportExists(this.value, item.id);
      });
    }
  });

  // Age validation
  setupAgeValidation();
}

// Fetch and cache options for dropdowns
async function fetchAndCacheOptions() {
  try {
    const promises = Object.entries(endpointMap).map(async ([key, url]) => {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Error fetching ${key}: ${response.status}`);
      optionsCache[key] = await response.json();
    });
    await Promise.all(promises);
  } catch (err) {
    console.error("Error fetching options:", err);
    alert("Failed to load dropdown options. Check console for details.");
  }
}

// Helper function to get name by ID
function getNameById(id, collection) {
  if (!id) return "";
  const items = optionsCache[collection];
  if (!items) return id;

  const item = items.find((item) => item.id == id);
  if (!item) return id;

  if (collection === "groups" && item.groupe_type) {
    return `${item.name} (${item.groupe_type})`;
  }
  if (collection === "education_types") {
    return `${item.kind_learn || ""} ${item.education_form}`.trim();
  }
  return item.name || id;
}

// Populate a select element with options
function populateSelect(selectId, options, selectedValue = "") {
  const select = document.getElementById(selectId);
  if (!select) return;

  select.innerHTML = '<option value="">-- Select --</option>';

  options.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;

    if (selectId.includes("GroupName") && item.groupe_type) {
      option.textContent = `${item.name} (${item.groupe_type})`;
    } else if (selectId.includes("EducationForm") && item.kind_learn) {
      option.textContent = `${item.kind_learn} ${item.education_form}`.trim();
    } else {
      option.textContent = item.name;
    }

    if (item.id == selectedValue) {
      option.selected = true;
    }
    select.appendChild(option);
  });
}

// Initialize all dropdowns in modals with cached data
function initModalDropdowns(studentData = {}) {
  // Edit modal selects
  populateSelect("editSex", optionsCache.sexes, studentData.sex);
  populateSelect(
    "editNationality",
    optionsCache.nationalities,
    studentData.nationality_id
  );
  populateSelect("editRegion", optionsCache.regions, studentData.region_id);
  populateSelect("editFaculty", optionsCache.faculties, studentData.faculty_id);

  // Filter kafedras based on selected faculty
  // const facultyId = studentData.faculty_id || document.getElementById('editFaculty').value;
  // const filteredKafedras = optionsCache.kafedras.filter(k => k.faculty_id == facultyId);
  populateSelect("editKafedra", optionsCache.kafedras, studentData.kafedra_id);

  populateSelect("editGroupName", optionsCache.groups, studentData.group_id);
  populateSelect(
    "editEducationForm",
    optionsCache.education_types,
    studentData.education_type_id
  );
  populateSelect("editStatus", optionsCache.statuses, studentData.status_id);

  // Create modal selects (no selected values)
  populateSelect("createSex", optionsCache.sexes);
  populateSelect("createNationality", optionsCache.nationalities);
  populateSelect("createRegion", optionsCache.regions);
  populateSelect("createFaculty", optionsCache.faculties);
  populateSelect("createKafedra", optionsCache.kafedras); // Initially empty until faculty is selected
  populateSelect("createGroupName", optionsCache.groups);
  populateSelect("createEducationForm", optionsCache.education_types);
  populateSelect("createStatus", optionsCache.statuses);
}

// Fetch students data with resolved names
async function fetchStudents() {
  try {
    // First ensure options are cached
    await fetchAndCacheOptions();

    const response = await fetch("http://localhost:3000/api/students");
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const students = await response.json();

    const tbody = document.querySelector("#students-table tbody");
    tbody.innerHTML = ""; // Clear existing rows

    students.forEach((student) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.first_name}</td>
                <td>${student.last_name}</td>
                <td>${student.middle_name || ""}</td>
                <td>${student.birth_date || ""}</td>
                <td>${getNameById(student.sex, "sexes")}</td>
                <td>${student.passport_number || ""}</td>
                <td>${getNameById(student.nationality_id, "nationalities")}</td>
                <td>${getNameById(student.region_id, "regions")}</td>
                <td>${student.address || ""}</td>
                <td>${student.phone_number || ""}</td>
                <td>${student.email || ""}</td>
                <td>${getNameById(student.faculty_id, "faculties")}</td>
                <td>${getNameById(student.kafedra_id, "kafedras")}</td>
                <td>${getNameById(student.group_id, "groups")}</td>
                <td>${student.course || ""}</td>
                <td>${student.study_year || ""}</td>
                <td>${getNameById(
                  student.education_type_id,
                  "education_types"
                )}</td>
                <td>${student.enrollment_date || ""}</td>
                <td>${student.graduation_date || ""}</td>
                <td>${getNameById(student.status_id, "statuses")}</td>
                <td class="action-buttons">
                    <button class="action-btn edit-btn" data-id="${
                      student.id
                    }">Edit</button>
                    <button class="action-btn delete-btn" data-id="${
                      student.id
                    }">Delete</button>
                </td>
            `;
      row.setAttribute("id", student.id);
      row.setAttribute("class", "row");
      tbody.appendChild(row);
    });

    // Add event listeners to edit and delete buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const studentId = e.target.getAttribute("data-id");
        openEditModal(studentId);
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const studentId = e.target.getAttribute("data-id");
        openDeleteModal(studentId);
      });
    });

    // Add event listener for faculty change to filter kafedras
    document
      .getElementById("editFaculty")
      ?.addEventListener("change", function () {
        const facultyId = this.value;
        const filteredKafedras = optionsCache.kafedras.filter(
          (k) => k.faculty_id == facultyId
        );
        populateSelect("editKafedra", filteredKafedras);
      });

    document
      .getElementById("createFaculty")
      ?.addEventListener("change", function () {
        populateSelect("createKafedra", optionsCache.kafedras);
      });
  } catch (error) {
    console.error("Fetch error:", error);
    alert("Failed to fetch students data. Check console for details.");
  }
}
function openDeleteModal(studentId) {
  currentStudentId = studentId;
  deleteModal.style.display = "block";
}
// Open edit modal and populate with student data
async function openEditModal(studentId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/students/${studentId}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const student = await response.json();

    currentStudentId = studentId;

    // Initialize dropdowns with student data
    initModalDropdowns(student);

    // Populate the form fields
    document.getElementById("editFirstName").value = student.first_name || "";
    document.getElementById("editLastName").value = student.last_name || "";
    document.getElementById("editMiddleName").value = student.middle_name || "";
    document.getElementById("editBirthDate").value = student.birth_date || "";
    document.getElementById("editPassportNumber").value =
      student.passport_number || "";
    document.getElementById("editAddress").value = student.address || "";
    document.getElementById("editPhoneNumber").value =
      student.phone_number || "";
    document.getElementById("editEmail").value = student.email || "";
    document.getElementById("editCourse").value = student.course || "";
    document.getElementById("editStudyYear").value = student.study_year || "";
    document.getElementById("editEnrollmentDate").value =
      student.enrollment_date || "";
    document.getElementById("editGraduationDate").value =
      student.graduation_date || "";

    // Display the edit modal
    editModal.style.display = "block";
  } catch (error) {
    console.error("Failed to open edit modal:", error);
    alert("Failed to load student data. Check console for details.");
  }
}

// Open create modal
async function openCreateModal() {
  try {
    await fetchAndCacheOptions();
    initModalDropdowns();
    createModal.style.display = "block";
  } catch (error) {
    console.error("Error opening create modal:", error);
    alert("Failed to initialize form dropdowns.");
  }
}

// Close modal
function closeModal() {
  editModal.style.display = "none";
  createModal.style.display = "none";
  deleteModal.style.display = "none";
}

// Event listeners for modal close buttons
closeButtons.forEach((button) => {
  button.addEventListener("click", closeModal);
});

// Event listeners for cancel buttons
cancelButtons.forEach((button) => {
  button.addEventListener("click", closeModal);
});

// Close modal when clicking outside of it
window.addEventListener("click", (event) => {
  if (event.target === editModal) {
    closeModal();
  }
  if (event.target === createModal) {
    closeModal();
  }
  if (event.target === deleteModal) {
    closeModal();
  }
});

// Handle edit form submission
document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validate age
  const birthDate = document.getElementById("editBirthDate").value;
  if (birthDate && !isAdult(birthDate)) {
    alert("Student must be at least 18 years old!");
    return;
  }

  // Check for duplicate email/passport
  const email = document.getElementById("editEmail").value;
  const passport = document.getElementById("editPassportNumber").value;

  const emailExists = await checkEmailExists(email, "editEmail");
  const passportExists = await checkPassportExists(
    passport,
    "editPassportNumber"
  );

  if (emailExists || passportExists) {
    return;
  }

  const updatedStudent = {
    first_name: document.getElementById("editFirstName").value,
    last_name: document.getElementById("editLastName").value,
    middle_name: document.getElementById("editMiddleName").value,
    birth_date: birthDate,
    sex: document.getElementById("editSex").value,
    passport_number: passport,
    nationality_id: document.getElementById("editNationality").value,
    region_id: document.getElementById("editRegion").value,
    address: document.getElementById("editAddress").value,
    phone_number: document.getElementById("editPhoneNumber").value,
    email: email,
    faculty_id: document.getElementById("editFaculty").value,
    kafedra_id: document.getElementById("editKafedra").value,
    group_id: document.getElementById("editGroupName").value,
    course: document.getElementById("editCourse").value,
    study_year: document.getElementById("editStudyYear").value,
    education_type_id: document.getElementById("editEducationForm").value,
    enrollment_date: document.getElementById("editEnrollmentDate").value,
    graduation_date: document.getElementById("editGraduationDate").value,
    status_id: document.getElementById("editStatus").value,
  };

  try {
    const response = await fetch(
      `http://localhost:3000/api/students/${currentStudentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedStudent),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    closeModal();
    fetchStudents();
    alert("Student updated successfully!");
  } catch (error) {
    console.error("Error updating student:", error);
    alert("Failed to update student. Check console for details.");
  }
});

// Handle create form submission
document.getElementById("createForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validate age
  const birthDate = document.getElementById("createBirthDate").value;
  if (!birthDate || !isAdult(birthDate)) {
    alert("Student must be at least 18 years old!");
    return;
  }

  // Check for duplicate email/passport
  const email = document.getElementById("createEmail").value;
  const passport = document.getElementById("createPassportNumber").value;

  const emailExists = await checkEmailExists(email, "createEmail");
  const passportExists = await checkPassportExists(
    passport,
    "createPassportNumber"
  );

  if (emailExists || passportExists) {
    return;
  }

  const newStudent = {
    first_name: document.getElementById("createFirstName").value,
    last_name: document.getElementById("createLastName").value,
    middle_name: document.getElementById("createMiddleName").value,
    birth_date: birthDate,
    sex: document.getElementById("createSex").value,
    passport_number: passport,
    nationality_id: document.getElementById("createNationality").value,
    region_id: document.getElementById("createRegion").value,
    address: document.getElementById("createAddress").value,
    phone_number: document.getElementById("createPhoneNumber").value,
    email: email,
    faculty_id: document.getElementById("createFaculty").value,
    kafedra_id: document.getElementById("createKafedra").value,
    group_id: document.getElementById("createGroupName").value,
    course: document.getElementById("createCourse").value,
    study_year: document.getElementById("createStudyYear").value,
    education_type_id: document.getElementById("createEducationForm").value,
    enrollment_date: document.getElementById("createEnrollmentDate").value,
    graduation_date: document.getElementById("createGraduationDate").value,
    status_id: document.getElementById("createStatus").value,
  };

  try {
    const response = await fetch("http://localhost:3000/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newStudent),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    closeModal();
    document.getElementById("createForm").reset();
    fetchStudents();
    alert("Student created successfully!");
  } catch (error) {
    console.error("Error creating student:", error);
    alert("Failed to create student. Check console for details.");
  }
});

// Handle delete confirmation
document
  .querySelector(".btn-confirm-delete")
  .addEventListener("click", async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/students/${currentStudentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }

      closeModal();
      fetchStudents();
      alert("Student deleted successfully!");
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student. Check console for details.");
    }
  });

// Add event listeners for buttons
document.getElementById("refresh-btn").addEventListener("click", fetchStudents);
document
  .getElementById("create-btn")
  .addEventListener("click", openCreateModal);

// Initialize the application
window.addEventListener("DOMContentLoaded", () => {
  fetchStudents();
  setupRealTimeValidation();
});
