class Task {
    constructor(inputElement, productivity) {
      this.inputElement = inputElement;
      this.productivity = productivity;
    }
  
    get value() {
      return this.inputElement.value.trim();
    }
  
    get time() {
      return 5;
    }
  
    get score() {
      switch (this.productivity) {
        case '-2':
          return -10;
        case '2':
          return 10;
        default:
          return parseInt(this.productivity, 10);
      }
    }
  }

const timeColumn = document.getElementById("timeColumn");
const calendar = document.getElementById("calendar");

function createTimeInputs() {
    const currentTime = new Date();
    currentTime.setSeconds(0);
    currentTime.setMilliseconds(0);
    for (let i = 0; i < 24 * 60; i += 5) {
        const time = new Date(currentTime);
        time.setMinutes(i);

        const rowContainer = document.createElement("div");
        rowContainer.className = "row-container";

        if (i % 60 === 0) {
            rowContainer.classList.add("hour");
        } else if (i % 30 === 0) {
            rowContainer.classList.add("half-hour");
        } else if (i % 15 === 0) {
            rowContainer.classList.add("quarter-hour");
        }

        const timeElement = document.createElement("div");
        timeElement.textContent = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeElement.id = `time-${i}`;
        rowContainer.appendChild(timeElement);

        const textElement = document.createElement("div");
        textElement.innerHTML = `<input type="text" class="text-input" id="input-${i}" data-productivity="0" onkeydown="handleKeyDown(event, ${i})" onfocus="highlightTime(${i}, true)" onblur="highlightTime(${i}, false)">`;
        rowContainer.appendChild(textElement);

        const timerElement = document.createElement("div");
        timerElement.className = "timer";
        timerElement.id = `timer-${i}`;
        rowContainer.appendChild(timerElement);

        timeColumn.appendChild(rowContainer);
    }
}

function updateTimers() {
    let nextFieldWithText = null;

    for (let i = 24 * 60 - 5; i >= 0; i -= 5) {
        const inputElement = document.getElementById(`input-${i}`);
        const timerElement = document.getElementById(`timer-${i}`);

        if (inputElement && inputElement.value.trim() !== "") {
            if (nextFieldWithText !== null) {
                const minutesUntilNext = (nextFieldWithText - i);
                timerElement.textContent = `${minutesUntilNext} min`;
            } else {
                timerElement.textContent = "";
            }
            nextFieldWithText = i;
        } else {
            timerElement.textContent = "";
        }
    }
}

function handleKeyDown(event, i) {
    const inputElement = document.getElementById(`input-${i}`);

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        const newIndex = i + (event.key === 'ArrowUp' ? -5 : 5);
        const newInputElement = document.getElementById(`input-${newIndex}`);
        if (newInputElement) {
            newInputElement.focus();
        }
        updateTimers();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        let productivity = parseInt(inputElement.getAttribute('data-productivity'), 10);
        if (event.key === 'ArrowLeft' && productivity > -2) {
            productivity--;
        } else if (event.key === 'ArrowRight' && productivity < 2) {
            productivity++;
        }
        inputElement.setAttribute('data-productivity', productivity);
        const task = new Task(inputElement, productivity);
        updateRowColor(task);
        updateEmptyFieldsProductivity();
        displayProductivityTotals();
    }
}

function displayProductivityTotals() {
    const productivityTotals = {
        '-2': 0,
        '-1': 0,
        '0': 0,
        '1': 0,
        '2': 0
    };

    for (let i = 0; i < 24 * 60; i += 5) {
        const inputElement = document.getElementById(`input-${i}`);
        if (inputElement.value.trim() !== "") {
            const productivity = inputElement.getAttribute('data-productivity');
            const task = new Task(inputElement, productivity);
            productivityTotals[productivity] += task.time;
        }
    }

    const totalsContainer = document.getElementById("productivityTotals");
    totalsContainer.innerHTML = ['-2', '-1', '0', '1', '2']
        .map(key => `<div style="display: inline-block; margin-right: 10px;">${key}: ${productivityTotals[key]} minutes</div>`)
        .join("") + `<div style="display: inline-block; margin-right: 10px;">Total Score: ${calculateTotalScore()}</div>`;
}

function calculateTotalScore() {
    let totalScore = 0;

    for (let i = 0; i < 24 * 60; i += 5) {
        const inputElement = document.getElementById(`input-${i}`);
        if (inputElement.value.trim() !== "") {
            const productivity = inputElement.getAttribute('data-productivity');
            const task = new Task(inputElement, productivity);
            totalScore += task.time * task.score;
        }
    }

    return totalScore;
}

function updateRowColor(task) {
    const rowContainer = task.inputElement.parentElement.parentElement;

    rowContainer.classList.remove('red', 'orange', 'white', 'green', 'blue');
    switch (task.score) {
        case -2:
            rowContainer.classList.add('red');
            break;
        case -1:
            rowContainer.classList.add('orange');
            break;
        case 0:
            rowContainer.classList.add('white');
            break;
        case 1:
            rowContainer.classList.add('green');
            break;
        case 2:
            rowContainer.classList.add('blue');
            break;
    }
}

function highlightTime(i, isHighlighted) {
    const associatedTimeElement = document.getElementById(`time-${i}`);
    if (associatedTimeElement) {
        if (isHighlighted) {
            associatedTimeElement.classList.add('highlight');
        } else {
            associatedTimeElement.classList.remove('highlight');
        }
    }
}

function updateEmptyFieldsProductivity() {
    let previousProductivity = 0;
    for (let i = 0; i < 24 * 60; i += 5) {
        const inputElement = document.getElementById(`input-${i}`);
        if (inputElement.value.trim() === "") {
            inputElement.setAttribute('data-productivity', previousProductivity);
            const task = new Task(inputElement, previousProductivity);
            updateRowColor(task);
        } else {
            previousProductivity = parseInt(inputElement.getAttribute('data-productivity'), 10);
        }
    }
}

function scrollToCurrentTime() {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const index = Math.floor(minutes / 5);
    const inputElement = document.getElementById(`input-${index}`);
    if (inputElement) {
        inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inputElement.focus();
    }
}

function updateCursorPosition() {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const index = Math.floor(minutes / 5);

    const inputElement = document.getElementById(`input-${index}`);
    if (inputElement) {
        if (document.activeElement !== inputElement) {
            inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            inputElement.focus();
        }
    }
}

function syncScroll(element, others) {
    element.addEventListener('scroll', () => {
        others.forEach(other => {
            other.scrollTop = element.scrollTop;
        });
    });
}

function initializeCalendar() {
    // Replace this with your preferred calendar library, e.g. FullCalendar
    calendar.innerHTML = "<h3>Calendar placeholder</h3>";
}

function exportAsCSV() {
    const rows = [];
    for (let i = 0; i < 24 * 60; i += 5) {
        const inputElement = document.getElementById(`input-${i}`);
        const timeElement = document.getElementById(`time-${i}`);
        const timerElement = document.getElementById(`timer-${i}`);
        if (inputElement && inputElement.value.trim() !== "") {
            rows.push([timeElement.textContent, inputElement.value, timerElement.textContent || "5", inputElement.getAttribute('data-productivity') || "0"]);
        }
    }

    if (rows.length > 0) {
        const header = ["Time", "Text", "Duration", "Productivity"];
        const csvContent = [header, ...rows]
            .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
            .join("\r\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `journal_export_${new Date().toISOString().slice(0, 10)}.csv`;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("No data to export.");
    }
}

function jumpToLatestFieldWithText() {
    let latestFieldWithText = null;

    for (let i = 0; i < 24 * 60; i += 5) {
        const inputElement = document.getElementById(`input-${i}`);
        if (inputElement && inputElement.value.trim() !== "") {
            latestFieldWithText = i;
        }
    }

    if (latestFieldWithText !== null) {
        const inputElement = document.getElementById(`input-${latestFieldWithText}`);
        inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inputElement.focus();
    } else {
        alert("No latest field with text found.");
    }
}

function isDST(date) {
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);
    const stdTimeZoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());

    return date.getTimezoneOffset() < stdTimeZoneOffset;
}

function initializeGoogleCalendarApi() {
    gapi.load('client', () => {
        gapi.client.init({
            apiKey: 'YOUR_API_KEY',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
        }).then(() => {
            loadCalendarEvents();
        });
    });
}

async function loadCalendarEvents() {
    const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime'
    });

    const events = response.result.items;

    events.forEach(event => {
        const start = new Date(event.start.dateTime || event.start.date);
        const index = Math.floor((start.getHours() * 60 + start.getMinutes()) / 5);

        const calendarEvent = document.createElement("div");
        calendarEvent.className = "calendar-event";
        calendarEvent.textContent = event.summary;
        calendarEvent.style.top = `${index * 5}vh`;

        calendar.appendChild(calendarEvent);
    });
}


function jumpToCurrentField() {
    const now = new Date();
    const dstOffset = isDST(now) ? -1 : 0;
    const minutes = (now.getHours() + dstOffset) * 60 + now.getMinutes();
    const index = Math.floor(minutes / 5) * 5;

    const inputElement = document.getElementById(`input-${index}`);
    if (inputElement) {
        inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inputElement.focus();
    } else {
        alert("No current field found.");
    }
}


createTimeInputs();
updateTimers();
scrollToCurrentTime();
updateCursorPosition();
setInterval(updateCursorPosition, 60 * 1000);

syncScroll(timeColumn, [calendar]);
syncScroll(calendar, [timeColumn]);

initializeCalendar();

const exportButton = document.getElementById("exportButton");
exportButton.addEventListener("click", exportAsCSV);

const jumpToLatestButton = document.getElementById("jumpToLatest");
jumpToLatestButton.addEventListener("click", jumpToLatestFieldWithText);

const jumpToCurrentButton = document.getElementById("jumpToCurrent");
jumpToCurrentButton.addEventListener("click", jumpToCurrentField);
