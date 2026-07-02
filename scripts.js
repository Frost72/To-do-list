const calendarGrid = document.getElementById("calendarGrid");
const monthYear = document.getElementById("monthYear");

const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");
const sidebarLinks = document.querySelectorAll(".sidebar a");
const calendarSection = document.querySelector(".calendar");
const addTaskOpenBtn = document.querySelector(".new-tasks");
const addTaskSubmitBtn = document.querySelector(".add-task");
const newTaskContainer = document.querySelector(".new-contenier");
const taskModal = document.getElementById("taskModal");
const modalCloseBtn = document.querySelector(".modal-close");
const tasksList = document.querySelector(".tasks-list");
let currentDate = new Date();
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let editingTaskId = null;
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function resetTaskForm() {
    const inputs = document.querySelectorAll(".new-contenier input[type='text']");
    const dateInput = document.querySelector(".new-contenier input[type='date']");
    const priorityInput = document.querySelector(".new-contenier input[name='priority']:checked");

    if (inputs[0]) inputs[0].value = "";
    if (inputs[1]) inputs[1].value = "";
    if (dateInput) dateInput.value = "";
    if (priorityInput) priorityInput.checked = false;

    editingTaskId = null;
    if (addTaskSubmitBtn) {
        addTaskSubmitBtn.innerHTML = "<span>Добавить задачу</span>";
    }
}

function openTaskEditor(task) {
    if (!newTaskContainer || !taskModal) return;

    const inputs = newTaskContainer.querySelectorAll("input[type='text']");
    const dateInput = newTaskContainer.querySelector("input[type='date']");
    const priorityInput = newTaskContainer.querySelector(`input[name='priority'][value='${task.priority}']`);

    taskModal.style.display = "flex";
    if (inputs[0]) inputs[0].value = task.title;
    if (inputs[1]) inputs[1].value = task.description;
    if (dateInput) dateInput.value = task.deadline;
    if (priorityInput) priorityInput.checked = true;

    editingTaskId = task.id;
    if (addTaskSubmitBtn) {
        addTaskSubmitBtn.innerHTML = "<span>Сохранить</span>";
    }
}

let activeTaskFilter = "all";
let selectedCalendarDate = null;

function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getTasksByDate(date) {
    if (!date) return [];
    return tasks.filter(t => t.deadline === date);
}

function getUpcomingTasksByDate(date) {
    return getTasksByDate(date).filter(t => !t.done);
}

function getTasksByDateFiltered(date) {
    const list = getTasksByDate(date);
    if (activeTaskFilter === "upcoming") {
        return list.filter(t => !t.done);
    } else if (activeTaskFilter === "completed") {
        return list.filter(t => t.done);
    }
    return list;
}

function getUpcomingTasks() {
    return tasks.filter(t => !t.done);
}

function getCompletedTasks() {
    return tasks.filter(t => t.done);
}

function renderCurrentView() {
    if (activeTaskFilter === "upcoming") {
        renderTasks(getUpcomingTasks());
    } else if (activeTaskFilter === "completed") {
        renderTasks(getCompletedTasks());
    } else if (activeTaskFilter === "calendar") {
        const date = selectedCalendarDate || formatDate(new Date());
        renderTasks(getTasksByDateFiltered(date));
    } else {
        renderTasks();
    }
}

if (addTaskOpenBtn) {
    addTaskOpenBtn.addEventListener("click", () => {
        resetTaskForm();
        if (taskModal) taskModal.style.display = "flex";
    });
}

if (taskModal) {
    taskModal.addEventListener("click", (e) => {
        if (e.target === taskModal) {
            taskModal.style.display = "none";
        }
    });
}

if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", () => {
        if (taskModal) taskModal.style.display = "none";
    });
}

sidebarLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        sidebarLinks.forEach(item => item.classList.remove("active"));
        link.classList.add("active");

        const label = link.textContent.trim();

            if (label === "Календарь") {
            calendarSection.style.display = "block";
            activeTaskFilter = "calendar";
            selectedCalendarDate = formatDate(new Date());
            renderCurrentView();
        } else {
            calendarSection.style.display = "none";
            if (label === "Предстоящие") {
                activeTaskFilter = "upcoming";
            } else if (label === "Выполненные") {
                activeTaskFilter = "completed";
            } else {
                activeTaskFilter = "all";
            }
            selectedCalendarDate = null;
            renderCurrentView();
        }
    });
});

function renderCalendar() {
    if (!calendarGrid) return;

    calendarGrid.innerHTML = "";

    const weekdays = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

    weekdays.forEach(day => {
        const el = document.createElement("abbr");
        el.textContent = day;
        calendarGrid.appendChild(el);
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYear.textContent = currentDate.toLocaleString("ru-RU", {
        month: "long",
        year: "numeric"
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let startDay = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < startDay; i++) {
        calendarGrid.appendChild(document.createElement("div"));
    }

    const today = new Date();

    for (let day = 1; day <= daysInMonth; day++) {

        const fullDate = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

        const btn = document.createElement("button");
        btn.classList.add("day");
        btn.textContent = day;

        if (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {
            btn.setAttribute("today", "");
        }

        const dayTasks = getTasksByDate(fullDate);
        const pendingCount = dayTasks.filter(t => !t.done).length;
        const doneCount = dayTasks.filter(t => t.done).length;

        if (pendingCount > 0 || doneCount > 0) {
            const dotGroup = document.createElement("div");
            dotGroup.className = "calendar-dot-group";

            if (pendingCount > 0) {
                const dot = document.createElement("span");
                dot.className = "calendar-dot calendar-dot--pending";
                dotGroup.appendChild(dot);
            }

            if (doneCount > 0) {
                const dot = document.createElement("span");
                dot.className = "calendar-dot calendar-dot--done";
                dotGroup.appendChild(dot);
            }

            btn.appendChild(dotGroup);
            btn.title = `${pendingCount > 0 ? pendingCount + ' невыполненных' : ''}${pendingCount > 0 && doneCount > 0 ? ', ' : ''}${doneCount > 0 ? doneCount + ' выполненных' : ''}`;
        }

        btn.addEventListener("click", () => {
            document.querySelectorAll(".day[data-selected]")
                .forEach(el => el.removeAttribute("data-selected"));

            btn.setAttribute("data-selected", "");
            selectedCalendarDate = fullDate;
            renderTasks(getTasksByDateFiltered(fullDate));
        });

        calendarGrid.appendChild(btn);
    }
}

prevBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Обработчик добавления или редактирования задачи (кнопка в форме)
addTaskSubmitBtn.addEventListener("click", () => {
    const inputs = document.querySelectorAll(".new-contenier input[type='text']");
    const title = inputs[0].value.trim();
    const description = inputs[1].value.trim();
    const deadlineInput = document.querySelector(".new-contenier input[type='date']");
    const deadline = deadlineInput.value;
    const priority = document.querySelector(".new-contenier input[name='priority']:checked")?.value || "medium";

    if (!title) {
        alert("Введите тему задачи");
        return;
    }

    if (editingTaskId) {
        const task = tasks.find(t => t.id === editingTaskId);
        if (task) {
            task.title = title;
            task.description = description;
            task.deadline = deadline;
            task.priority = priority;
        }
    } else {
        const task = {
            id: Date.now(),
            title,
            description,
            deadline,
            priority,
            done: false,
            open: false
        };
        tasks.push(task);
    }

    saveTasks();
    renderCalendar();
    renderCurrentView();
    if (taskModal) taskModal.style.display = "none";
    editingTaskId = null;
    addTaskSubmitBtn.textContent = "Добавить задачу";

    inputs[0].value = "";
    inputs[1].value = "";
    deadlineInput.value = "";
});


function renderTasks(filtered = null) {
    if (!tasksList) return;
    tasksList.innerHTML = "";
    const list = Array.isArray(filtered) ? filtered : tasks;

    list.forEach(task => {
        const taskEl = document.createElement("div");
        taskEl.classList.add("task-card");
        if (task.done) {
            taskEl.classList.add("task-card--done");
        }
        taskEl.innerHTML = `
            <div class="task-header">
                <input type="checkbox" ${task.done ? "checked" : ""} data-id="${task.id}" />
                <h3>${task.title}</h3>
            </div>
            <div class="task-body">
                <p>${task.description}</p>
                <p>Дедлайн: ${task.deadline}</p>
                <p>Приоритет: ${task.priority}</p>
            </div>
            <div class="task-footer">
                <button class="delete" data-id="${task.id}">🗑️ Удалить</button>
                <button class="update" data-id="${task.id}">Редактировать</button>
            </div>
        `;
        tasksList.appendChild(taskEl);
    });

    // Вешаем делегированные обработчики на удаление и отметку
    tasksList.querySelectorAll(".delete").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = Number(e.currentTarget.dataset.id);
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderCurrentView();
            renderCalendar();
        });
    });

    tasksList.querySelectorAll("input[type='checkbox']").forEach(ch => {
        ch.addEventListener('change', (e) => {
            const id = Number(e.currentTarget.dataset.id);
            const t = tasks.find(t => t.id === id);
            const card = e.currentTarget.closest('.task-card');

            if (t) {
                t.done = e.currentTarget.checked;
                saveTasks();

                if (card) {
                    card.classList.add('task-card--pulse');
                    setTimeout(() => {
                        card.classList.remove('task-card--pulse');
                        renderCurrentView();
                        renderCalendar();
                    }, 260);
                } else {
                    renderCurrentView();
                    renderCalendar();
                }
            }
        });
    });

    tasksList.querySelectorAll(".update").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = Number(e.currentTarget.dataset.id);
            const task = tasks.find(t => t.id === id);
            if (task) {
                openTaskEditor(task);
            }
        });
    });
}

renderCalendar();
renderCurrentView();

if (addTaskOpenBtn) {
    let isHovering = false;
    let mouseX = 0;
    let mouseY = 0;
    
    addTaskOpenBtn.addEventListener('mouseenter', () => {
        isHovering = true;
    });
    
    addTaskOpenBtn.addEventListener('mouseleave', () => {
        isHovering = false;
        
        addTaskOpenBtn.style.transform = 'scale(1) skewX(0deg) skewY(0deg)';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isHovering) return;
        
        const rect = addTaskOpenBtn.getBoundingClientRect();
        const buttonCenterX = rect.left + rect.width / 2;
        const buttonCenterY = rect.top + rect.height / 2;
        
        
        const distX = (e.clientX - buttonCenterX) / rect.width;
        const distY = (e.clientY - buttonCenterY) / rect.height;
        
        
        const limitedX = Math.max(-0.5, Math.min(0.5, distX));
        const limitedY = Math.max(-0.5, Math.min(0.5, distY));
        

        const scaleX = 1 + Math.abs(limitedX) * 0.3;
        const scaleY = 1 + Math.abs(limitedY) * 0.3;
        const skewX = limitedX * 15;
        const skewY = limitedY * 15;
        
        addTaskOpenBtn.style.transform = `scaleX(${scaleX}) scaleY(${scaleY}) skewX(${skewX}deg) skewY(${skewY}deg)`;
    });
}