// ======================================================
// انطر أبلكاش 🔫
// Shared version using Supabase
// ======================================================

// ==============================
// SUPABASE
// ==============================

const SUPABASE_URL =
    "https://hiiqdsparnucyqypzzrx.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_w0onydYU7lyufVgksxJgIQ_YkfX1pSq";

const EVENTS_URL =
    SUPABASE_URL + "/rest/v1/events";

const SUPABASE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json"
};


// ==============================
// GAME DATA
// ==============================

let yousryScore = 0;
let yassinScore = 0;
let events = [];

const WAIT_TIME = 24 * 60 * 60 * 1000;

let pendingPlayer = null;
let isLoading = false;


// ==============================
// LOAD EVENTS FROM SUPABASE
// ==============================

async function loadEvents() {

    try {

        const response = await fetch(
            EVENTS_URL +
            "?select=id,created_at,player,location" +
            "&order=created_at.asc",
            {
                method: "GET",
                headers: SUPABASE_HEADERS
            }
        );

        if (!response.ok) {
            throw new Error("Supabase load error");
        }

        const data = await response.json();

        events = Array.isArray(data) ? data : [];

        calculateScores();
        updateAll();

    } catch (error) {

        console.error("Error loading events:", error);

    }
}


// ==============================
// SILENT LOAD
// ==============================

async function loadEventsSilently() {

    if (isLoading) return;

    isLoading = true;

    try {

        const response = await fetch(
            EVENTS_URL +
            "?select=id,created_at,player,location" +
            "&order=created_at.asc",
            {
                method: "GET",
                headers: SUPABASE_HEADERS
            }
        );

        if (!response.ok) {
            throw new Error("Supabase load error");
        }

        const data = await response.json();

        events = Array.isArray(data) ? data : [];

        calculateScores();
        updateAll();

    } catch (error) {

        console.error("Silent load error:", error);

    } finally {

        isLoading = false;

    }
}


// ==============================
// CALCULATE SCORES
// ==============================

function calculateScores() {

    yousryScore = 0;
    yassinScore = 0;

    events.forEach(function (event) {

        if (event.player === "Yousry") {
            yousryScore++;
        }

        if (event.player === "Yassin") {
            yassinScore++;
        }

    });

}


// ==============================
// CHECK LAST EVENT
// ==============================

function getLastEvent() {

    if (!events.length) {
        return null;
    }

    return events[events.length - 1];

}


// ==============================
// CHECK 24 HOURS
// ==============================

function canAddPoint() {

    const lastEvent = getLastEvent();

    if (!lastEvent) {
        return true;
    }

    const lastTime =
        new Date(lastEvent.created_at).getTime();

    const now = Date.now();

    return (now - lastTime) >= WAIT_TIME;

}


// ==============================
// ADD POINT
// ==============================

function addPoint(player) {

    if (!canAddPoint()) {

        alert(
            "لسه فيه فترة انتظار ⏳\n" +
            "لازم يعدي 24 ساعة من آخر نَطْرة."
        );

        return;
    }

    pendingPlayer = player;

    const modal =
        document.getElementById("question-modal");

    if (modal) {
        modal.style.display = "flex";
    }

}


// ==============================
// SELECT LOCATION
// ==============================

async function selectPointLocation(pointLocation) {

    if (!pendingPlayer) {
        return;
    }

    const player = pendingPlayer;

    pendingPlayer = null;

    const modal =
        document.getElementById("question-modal");

    if (modal) {
        modal.style.display = "none";
    }

    await savePoint(player, pointLocation);

}


// ==============================
// SAVE POINT
// ==============================

async function savePoint(player, pointLocation) {

    if (!canAddPoint()) {

        alert(
            "حد سجل نَطْرة بالفعل منذ أقل من 24 ساعة."
        );

        await loadEventsSilently();

        return;
    }

    try {

        const response = await fetch(
            EVENTS_URL,
            {
                method: "POST",

                headers: {
                    ...SUPABASE_HEADERS,
                    "Prefer": "return=representation"
                },

                body: JSON.stringify({
                    player: player,
                    location: pointLocation
                })
            }
        );

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(errorText);

            alert(
                "حصلت مشكلة في تسجيل النَطْرة ❌"
            );

            return;
        }

        await loadEvents();

    } catch (error) {

        console.error("Save point error:", error);

        alert(
            "مش قادر أوصل للسيرفر ❌"
        );

    }

}


// ==============================
// CUSTOM LOCATION
// ==============================

function openCustomLocation() {

    const questionModal =
        document.getElementById("question-modal");

    const customModal =
        document.getElementById("custom-location-modal");

    if (questionModal) {
        questionModal.style.display = "none";
    }

    if (customModal) {
        customModal.style.display = "flex";
    }

    const input =
        document.getElementById("custom-location-input");

    if (input) {

        input.value = "";

        setTimeout(function () {
            input.focus();
        }, 100);

    }

}


// ==============================
// SAVE CUSTOM LOCATION
// ==============================

async function saveCustomLocation() {

    const input =
        document.getElementById("custom-location-input");

    if (!input) {
        return;
    }

    const customLocation =
        input.value.trim();

    if (!customLocation) {

        alert("اكتب اسم المكان الأول.");

        return;
    }

    const customModal =
        document.getElementById("custom-location-modal");

    if (customModal) {
        customModal.style.display = "none";
    }

    await selectPointLocation(customLocation);

}


// ==============================
// CANCEL CUSTOM LOCATION
// ==============================

function cancelCustomLocation() {

    const customModal =
        document.getElementById("custom-location-modal");

    if (customModal) {
        customModal.style.display = "none";
    }

    const questionModal =
        document.getElementById("question-modal");

    if (questionModal) {
        questionModal.style.display = "flex";
    }

}


// ==============================
// CANCEL QUESTION
// ==============================

function cancelQuestion() {

    pendingPlayer = null;

    const modal =
        document.getElementById("question-modal");

    if (modal) {
        modal.style.display = "none";
    }

}


// ==============================
// ENTER KEY FOR CUSTOM LOCATION
// ==============================

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Enter") {
            return;
        }

        const customModal =
            document.getElementById("custom-location-modal");

        if (
            customModal &&
            customModal.style.display === "flex"
        ) {

            event.preventDefault();

            saveCustomLocation();

        }

    }
);


// ==============================
// NO POINT TODAY
// ==============================

async function noPointToday() {

    if (!canAddPoint()) {

        alert(
            "فيه نَطْرة مسجلة خلال آخر 24 ساعة."
        );

        return;
    }

    const confirmed = confirm(
        "متأكد إن مفيش نَطْرة النهارده؟"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            EVENTS_URL,
            {
                method: "POST",

                headers: {
                    ...SUPABASE_HEADERS,
                    "Prefer": "return=representation"
                },

                body: JSON.stringify({
                    player: "NO_POINT",
                    location: "مفيش نَطْرة النهارده"
                })
            }
        );

        if (!response.ok) {

            console.error(await response.text());

            alert(
                "حصلت مشكلة في تسجيل الحالة ❌"
            );

            return;
        }

        await loadEvents();

    } catch (error) {

        console.error(error);

        alert(
            "مش قادر أوصل للسيرفر ❌"
        );

    }

}


// ==============================
// CHECK IF LAST EVENT IS NO POINT
// ==============================

function isLastEventNoPoint() {

    const lastEvent = getLastEvent();

    if (!lastEvent) {
        return false;
    }

    return lastEvent.player === "NO_POINT";

}


// ==============================
// CANCEL NO POINT
// ==============================

async function cancelNoPoint() {

    const lastEvent = getLastEvent();

    if (!lastEvent) {
        return;
    }

    if (!isLastEventNoPoint()) {

        alert(
            "مفيش قرار «مفيش نَطْرة» لإلغائه."
        );

        return;
    }

    const confirmed = confirm(
        "متأكد إنك عايز تلغي «مفيش نَطْرة»؟"
    );

    if (!confirmed) {
        return;
    }

    await deleteEventById(lastEvent.id);

}


// ==============================
// DELETE LAST POINT
// ==============================

async function deleteLastPoint() {

    const lastEvent = getLastEvent();

    if (!lastEvent) {

        alert("مفيش أحداث للحذف.");

        return;
    }

    const confirmed = confirm(
        "متأكد إنك عايز تحذف آخر تسجيل؟"
    );

    if (!confirmed) {
        return;
    }

    await deleteEventById(lastEvent.id);

}


// ==============================
// DELETE EVENT
// ==============================

async function deleteEventById(id) {

    try {

        const response = await fetch(
            EVENTS_URL +
            "?id=eq." +
            encodeURIComponent(id),
            {
                method: "DELETE",
                headers: SUPABASE_HEADERS
            }
        );

        if (!response.ok) {

            console.error(await response.text());

            alert(
                "حصلت مشكلة أثناء الحذف ❌"
            );

            return;
        }

        await loadEvents();

    } catch (error) {

        console.error(error);

        alert(
            "مش قادر أوصل للسيرفر ❌"
        );

    }

}


// ==============================
// TIMER
// ==============================

function updateTimer() {

    const timerElement =
        document.getElementById("timer");

    const timerSection =
        document.getElementById("timer-section");

    const lastEvent = getLastEvent();

    if (!timerElement) {
        return;
    }

    if (!lastEvent) {

        timerElement.textContent =
            "متاح الآن 🟢";

        if (timerSection) {
            timerSection.style.display = "block";
        }

        return;
    }

    const lastTime =
        new Date(lastEvent.created_at).getTime();

    const now = Date.now();

    const remaining =
        WAIT_TIME - (now - lastTime);

    if (remaining <= 0) {

        timerElement.textContent =
            "متاح الآن 🟢";

        return;
    }

    const totalSeconds =
        Math.floor(remaining / 1000);

    const hours =
        Math.floor(totalSeconds / 3600);

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

    const seconds =
        totalSeconds % 60;

    timerElement.textContent =
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

}


// ==============================
// TODAY STATUS
// ==============================

function updateTodayStatus() {

    const element =
        document.getElementById("today-status");

    if (!element) {
        return;
    }

    const lastEvent = getLastEvent();

    if (!lastEvent) {

        element.textContent =
            "مفيش تسجيلات لسه النهارده.";

        return;
    }

    const eventTime =
        new Date(lastEvent.created_at);

    const now =
        new Date();

    const sameDay =
        eventTime.getFullYear() === now.getFullYear() &&
        eventTime.getMonth() === now.getMonth() &&
        eventTime.getDate() === now.getDate();

    if (!sameDay) {

        element.textContent =
            "مفيش تسجيلات النهارده.";

        return;
    }

    if (lastEvent.player === "Yousry") {

        element.textContent =
            "يسري كسب نَطْرة النهارده 🔫";

        return;
    }

    if (lastEvent.player === "Yassin") {

        element.textContent =
            "ياسين كسب نَطْرة النهارده 🔫";

        return;
    }

    if (lastEvent.player === "NO_POINT") {

        element.textContent =
            "مفيش نَطْرة النهارده 😴";

    }

}


// ==============================
// EVENT LOG
// ==============================

function updateEventLog() {

    const container =
        document.getElementById("event-log");

    if (!container) {
        return;
    }

    if (!events.length) {

        container.innerHTML =
            "<p>مفيش أحداث لسه.</p>";

        return;
    }

    let html = "";

    const reversedEvents =
        [...events].reverse();

    reversedEvents.forEach(function (event) {

        const date =
            new Date(event.created_at);

        const dateText =
            date.toLocaleDateString("ar-EG");

        const timeText =
            date.toLocaleTimeString(
                "ar-EG",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        if (event.player === "NO_POINT") {

            html += `
                <div class="event-item">
                    <strong>😴 مفيش نَطْرة النهارده</strong>
                    <span>${dateText} - ${timeText}</span>
                </div>
            `;

            return;
        }

        const playerName =
            event.player === "Yousry"
                ? "يسري"
                : "ياسين";

        html += `
            <div class="event-item">
                <strong>🔫 ${playerName} كسب النَطْرة</strong>
                <span>📍 ${escapeHTML(event.location || "غير محدد")}</span>
                <small>${dateText} - ${timeText}</small>
            </div>
        `;

    });

    container.innerHTML = html;

}


// ==============================
// STATS
// ==============================

function updateStats() {

    const yousryElement =
        document.getElementById("yousry-score");

    const yassinElement =
        document.getElementById("yassin-score");

    if (yousryElement) {
        yousryElement.textContent =
            yousryScore;
    }

    if (yassinElement) {
        yassinElement.textContent =
            yassinScore;
    }

    const totalElement =
        document.getElementById("total-points");

    if (totalElement) {

        totalElement.textContent =
            yousryScore + yassinScore;

    }

}


// ==============================
// LEADER
// ==============================

function updateLeader() {

    const element =
        document.getElementById("leader");

    if (!element) {
        return;
    }

    if (
        yousryScore === 0 &&
        yassinScore === 0
    ) {

        element.textContent =
            "مفيش متصدر لسه 😎";

        return;
    }

    if (yousryScore > yassinScore) {

        element.textContent =
            "المتصدر: يسري 🏆";

        return;
    }

    if (yassinScore > yousryScore) {

        element.textContent =
            "المتصدر: ياسين 🏆";

        return;
    }

    element.textContent =
        "تعادل 🤝";

}


// ==============================
// UPDATE ALL
// ==============================

function updateAll() {

    updateTimer();
    updateTodayStatus();
    updateEventLog();
    updateStats();
    updateLeader();

}


// ==============================
// ESCAPE HTML
// ==============================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


// ==============================
// START
// ==============================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await loadEvents();

        updateAll();

    }
);


// ==============================
// TIMER UPDATE
// ==============================

setInterval(
    function () {

        updateTimer();
        updateTodayStatus();

    },
    1000
);


// ==============================
// SYNC BETWEEN DEVICES
// ==============================
//
// كل جهاز بيسأل Supabase كل 5 ثواني
// عشان أي نَطْرة جديدة تظهر عند الطرف التاني.
//

setInterval(
    async function () {

        await loadEventsSilently();

    },
    5000
);
