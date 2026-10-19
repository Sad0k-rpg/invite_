const SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbxP3fr8fGcf9g6jdpcd3QHti_PUSAy2R2tJMlSSlP6tOPAnSUka54LwtlxQ13cgfz6j/exec";

let selectedOption = "";
let noAttempts = 0;

const noBtn = document.getElementById("noBtn");

function moveNoButton() {
    const card = document.getElementById("step1");
    noAttempts++;

    if (noAttempts === 10) {
        noBtn.innerText = "Still trying? 🙂";
    }

    if (noAttempts === 20) {
        noBtn.innerText = "That's not an option";
    }

    if (noAttempts === 40) {
        noBtn.innerText = "Just press Yes ❤️";
    }

    // Use the card as the positioning parent and measure the updated label.
    // Otherwise mobile positions can extend past the card's right edge.
    if (noBtn.parentElement !== card) card.appendChild(noBtn);
    const inset = 16;
    const maxX = Math.max(inset, card.clientWidth - noBtn.offsetWidth - inset);
    const maxY = Math.max(inset, card.clientHeight - noBtn.offsetHeight - inset);

    noBtn.style.position = "absolute";
    noBtn.style.left = Math.floor(inset + Math.random() * (maxX - inset)) + "px";
    noBtn.style.top = Math.floor(inset + Math.random() * (maxY - inset)) + "px";
}

noBtn.addEventListener("mouseover", moveNoButton);
noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("click", moveNoButton);
noBtn.addEventListener("touchstart", moveNoButton);

document.addEventListener("mousemove", (e) => {
    if (step1.classList.contains("hidden")) {
        return;
    }

    const rect = noBtn.getBoundingClientRect();

    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;

    const distance = Math.sqrt(
        Math.pow(e.clientX - btnCenterX, 2) +
        Math.pow(e.clientY - btnCenterY, 2)
    );

    if (distance < 140) {
        moveNoButton();
    }
});

document.getElementById("yesBtn").onclick = () => {
    step1.classList.add("hidden");
    step2.classList.remove("hidden");
};

document.getElementById("continueBtn").onclick = () => {
    step2.classList.add("hidden");
    step3.classList.remove("hidden");
};

const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const timeHint = document.getElementById("timeHint");

function isWeekday(dateValue) {
    if (!dateValue) return false;
    // Parse as a local calendar date so the selected day is timezone independent.
    const [year, month, day] = dateValue.split("-").map(Number);
    const weekday = new Date(year, month - 1, day).getDay();
    return weekday >= 1 && weekday <= 5;
}

function updateTimeAvailability() {
    const weekday = isWeekday(dateInput.value);
    if (weekday) {
        timeInput.min = "20:00";
        timeInput.max = "22:00";
    } else {
        timeInput.removeAttribute("min");
        timeInput.removeAttribute("max");
    }
    timeHint.textContent = !dateInput.value
        ? "Choose a date to see available times."
        : weekday ? "Monday to Friday: 20:00 to 22:00."
        : "Weekend: choose any time.";
    timeInput.setCustomValidity(
        weekday && timeInput.value && (timeInput.value < "20:00" || timeInput.value > "22:00")
            ? "On weekdays, please choose a time from 20:00 to 22:00."
            : ""
    );
}

function validateDateTime() {
    updateTimeAvailability();
    if (!dateInput.value || !timeInput.value) {
        alert("Please choose date and time");
        return false;
    }
    return timeInput.reportValidity();
}

dateInput.addEventListener("input", updateTimeAvailability);
dateInput.addEventListener("change", updateTimeAvailability);
timeInput.addEventListener("input", updateTimeAvailability);
timeInput.addEventListener("change", updateTimeAvailability);
updateTimeAvailability();

document.getElementById("dateBtn").onclick = () => {
    if (!validateDateTime()) return;

    step3.classList.add("hidden");
    step4.classList.remove("hidden");
};

document.querySelectorAll(".food").forEach(btn => {
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => {
        if (btn.classList.contains("selected")) {
            btn.classList.remove("selected");
            btn.setAttribute("aria-pressed", "false");
            selectedOption = "";
            return;
        }

        document.querySelectorAll(".food").forEach(item => {
            item.classList.remove("selected");
            item.setAttribute("aria-pressed", "false");
        });

        btn.classList.add("selected");
        btn.setAttribute("aria-pressed", "true");
        selectedOption = btn.dataset.option || btn.innerText;

        document.getElementById("customFood").value = "";
    });
});

document.getElementById("customFood").addEventListener("input", () => {
    document.querySelectorAll(".food").forEach(item => {
        item.classList.remove("selected");
        item.setAttribute("aria-pressed", "false");
    });

    selectedOption = document.getElementById("customFood").value.trim();
});

document.getElementById("customBtn").onclick = async () => {
    if (!validateDateTime()) {
        step4.classList.add("hidden");
        step3.classList.remove("hidden");
        timeInput.reportValidity();
        return;
    }
    const customValue = document.getElementById("customFood").value.trim();
    const comment = document.getElementById("comment").value.trim();

    if (customValue) {
        selectedOption = customValue;
    }

    if (!selectedOption) {
        alert("Please choose or write your option");
        return;
    }

    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    try {
        await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify({
                date,
                time,
                food: selectedOption,
                comment
            })
        });
    } catch (e) {
        console.log(e);
    }

    step4.classList.add("hidden");
    step5.classList.remove("hidden");
};

