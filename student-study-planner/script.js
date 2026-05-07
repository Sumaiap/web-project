let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

document.addEventListener("DOMContentLoaded", () => {
  setGreeting();
  setCurrentDate();
  updateAll();
});

function showPage(pageId, clickedButton) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active-page");
  });

  document.getElementById(pageId).classList.add("active-page");

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("active");
  });

  clickedButton.classList.add("active");

  updateAll();
}

function openTasksPage() {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active-page");
  });

  document.getElementById("tasksPage").classList.add("active-page");

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("active");
  });

  document.querySelectorAll(".nav-item")[2].classList.add("active");

  updateAll();
}

/* Greeting */
function setGreeting() {
  const hour = new Date().getHours();
  let greeting = "";

  if (hour >= 5 && hour < 12) {
    greeting = "Good morning";
  } else if (hour >= 12 && hour < 18) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }

  document.getElementById("greetingText").textContent = `${greeting}, Student`;
}

/* Date */
function setCurrentDate() {
  const today = new Date();

  document.getElementById("currentDate").textContent =
    today.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
}

/* Save */
function saveData() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* Update everything */
function updateAll() {
  renderDashboard();
  renderSubjects();
  renderSubjectOptions();
  renderTasks("all");
  renderDeadlines();
}

/* Dashboard */
function renderDashboard() {
  const unfinished = tasks.filter(task => task.status !== "done");
  const important = unfinished.filter(task => isImportantDeadline(task.deadline));

  document.getElementById("unfinishedTasksCount").textContent = unfinished.length;
  document.getElementById("subjectsCount").textContent = subjects.length;
  document.getElementById("importantDeadlinesCount").textContent = important.length;

  renderPriorities();
  renderActiveSubjects();
}

function renderPriorities() {
  const container = document.getElementById("prioritiesList");
  container.innerHTML = "";

  const priorityTasks = tasks
    .filter(task => task.status !== "done" && task.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  if (priorityTasks.length === 0) {
    container.innerHTML = `<div class="empty">No priority tasks yet.</div>`;
    return;
  }

  priorityTasks.forEach(task => {
    container.innerHTML += `
      <div class="item-card">
        <div>
          <small>${task.subject}</small>
          <h3>${task.title}</h3>
        </div>
        <div class="deadline">${formatDeadline(task.deadline)}</div>
      </div>
    `;
  });
}

function renderActiveSubjects() {
  const container = document.getElementById("activeSubjectsList");
  container.innerHTML = "";

  if (subjects.length === 0) {
    container.innerHTML = `<div class="empty">No subjects added yet.</div>`;
    return;
  }

  subjects.slice(0, 6).forEach(subject => {
    container.innerHTML += `
      <div class="subject-card">
        <small>${subject.code}</small>
        <h4>${subject.name}</h4>
      </div>
    `;
  });
}

/* Subjects */
function addSubject() {
  const code = document.getElementById("subjectCodeInput").value.trim();
  const name = document.getElementById("subjectNameInput").value.trim();

  if (code === "" || name === "") {
    alert("Please enter subject code and name.");
    return;
  }

  subjects.push({ code, name });

  document.getElementById("subjectCodeInput").value = "";
  document.getElementById("subjectNameInput").value = "";

  saveData();
  updateAll();
}

function renderSubjects() {
  const container = document.getElementById("subjectsPageList");
  container.innerHTML = "";

  if (subjects.length === 0) {
    container.innerHTML = `<div class="empty">No subjects added yet.</div>`;
    return;
  }

  subjects.forEach((subject, index) => {
    container.innerHTML += `
      <div class="subject-card">
        <small>${subject.code}</small>
        <h3>${subject.name}</h3>
        <br>
        <button onclick="deleteSubject(${index})">Delete</button>
      </div>
    `;
  });
}

function deleteSubject(index) {
  subjects.splice(index, 1);
  saveData();
  updateAll();
}

function renderSubjectOptions() {
  const select = document.getElementById("taskSubjectInput");
  select.innerHTML = `<option value="">Select subject</option>`;

  subjects.forEach(subject => {
    select.innerHTML += `
      <option value="${subject.code} - ${subject.name}">
        ${subject.code} - ${subject.name}
      </option>
    `;
  });
}

/* Tasks */
function addTask() {
  const title = document.getElementById("taskTitleInput").value.trim();
  const subject = document.getElementById("taskSubjectInput").value;
  const type = document.getElementById("taskTypeInput").value;
  const deadline = document.getElementById("taskDeadlineInput").value;

  if (title === "" || subject === "" || deadline === "") {
    alert("Please fill all task fields.");
    return;
  }

  tasks.push({
    title,
    subject,
    type,
    deadline,
    status: "pending"
  });

  document.getElementById("taskTitleInput").value = "";
  document.getElementById("taskSubjectInput").value = "";
  document.getElementById("taskDeadlineInput").value = "";

  saveData();
  updateAll();
}

function renderTasks(filter) {
  const container = document.getElementById("tasksList");
  container.innerHTML = "";

  let filteredTasks = tasks;

  if (filter === "Task") {
    filteredTasks = tasks.filter(task => task.type === "Task");
  } else if (filter === "Exam") {
    filteredTasks = tasks.filter(task => task.type === "Exam");
  } else if (filter === "done") {
    filteredTasks = tasks.filter(task => task.status === "done");
  }

  if (filteredTasks.length === 0) {
    container.innerHTML = `<div class="empty">No tasks or exams yet.</div>`;
    return;
  }

  filteredTasks.forEach((task, index) => {
    container.innerHTML += `
      <div class="item-card ${task.status === "done" ? "done" : ""}">
        <div>
          <small>${task.subject} • ${task.type}</small>
          <h3>${task.title}</h3>
          <small>${formatDate(task.deadline)}</small>
        </div>

        <div>
          <button onclick="markDone(${index})">Done</button>
          <button onclick="deleteTask(${index})">Delete</button>
        </div>
      </div>
    `;
  });
}

function markDone(index) {
  tasks[index].status = "done";
  saveData();
  updateAll();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveData();
  updateAll();
}

/* Deadlines */
function renderDeadlines() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === "done").length;
  const pending = total - completed;

  document.getElementById("totalTasksProgress").textContent = total;
  document.getElementById("completedTasksProgress").textContent = completed;
  document.getElementById("pendingTasksProgress").textContent = pending;

  const container = document.getElementById("deadlinesList");
  container.innerHTML = "";

  const upcoming = tasks
    .filter(task => task.status !== "done" && task.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  if (upcoming.length === 0) {
    container.innerHTML = `<div class="empty">No upcoming deadlines.</div>`;
    return;
  }

  upcoming.forEach(task => {
    container.innerHTML += `
      <div class="item-card">
        <div>
          <small>${task.subject} • ${task.type}</small>
          <h3>${task.title}</h3>
        </div>
        <div class="deadline">${formatDeadline(task.deadline)}</div>
      </div>
    `;
  });
}

/* Helpers */
function formatDate(dateValue) {
  const date = new Date(dateValue);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatDeadline(dateValue) {
  const today = new Date();
  const deadline = new Date(dateValue);

  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const diffDays = (deadline - today) / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return "DUE TODAY";
  if (diffDays === 1) return "DUE TOMORROW";
  if (diffDays > 1 && diffDays <= 7) return `IN ${diffDays} DAYS`;

  return formatDate(dateValue);
}

function isImportantDeadline(dateValue) {
  if (!dateValue) return false;

  const today = new Date();
  const deadline = new Date(dateValue);

  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const diffDays = (deadline - today) / (1000 * 60 * 60 * 24);

  return diffDays >= 0 && diffDays <= 3;
}
