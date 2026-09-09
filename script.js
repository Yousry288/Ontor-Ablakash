let yousryScore = 0;
let yassinScore = 0;

let events = [];

const WAIT_TIME = 24 * 60 * 60 * 1000;


/* =========================
   آخر نقطة
========================= */

let lastPoint =
    localStorage.getItem("lastPoint");

if (lastPoint) {

    try {

        lastPoint = JSON.parse(lastPoint);

    } catch (error) {

        lastPoint = null;

        localStorage.removeItem("lastPoint");

    }

}


/* =========================
   اللاعب المنتظر اختيار مكانه
========================= */

let pendingPlayer = null;


/* =========================
   إضافة نقطة
========================= */

function addPoint(player) {

    if (
        player !== "Yousry" &&
        player !== "Yassin"
    ) {

        return;

    }


    const now = Date.now();


    /* =========================
       التأكد من انتهاء 24 ساعة
    ========================= */

    if (lastPoint) {

        const timePassed =
            now - Number(lastPoint.time);


        if (timePassed < WAIT_TIME) {

            const remaining =
                WAIT_TIME - timePassed;


            const hours =
                Math.floor(
                    remaining /
                    (1000 * 60 * 60)
                );


            const minutes =
                Math.floor(
                    (
                        remaining %
                        (1000 * 60 * 60)
                    ) /
                    (1000 * 60)
                );


            alert(
                "🚫 لسه مينفعش تاخد نقطة!\n\n" +
                "🎯 آخر نقطة كانت لـ " +
                lastPoint.player +
                "\n\n⏱️ باقي تقريبًا " +
                hours +
                " ساعة و " +
                minutes +
                " دقيقة."
            );


            return;

        }

    }


    /* =========================
       التأكد من مفيش نَطْرة اليوم
    ========================= */

    if (isNoPointToday()) {

        alert(
            "🚫 تسجيل النقطة مقفول!\n\n" +
            "تم تسجيل «مفيش نَطْرة النهارده».\n\n" +
            "↩️ لازم تضغط «إلغاء القرار — توجد نَطْرة» الأول."
        );


        return;

    }


    /* =========================
       حفظ اللاعب مؤقتًا
    ========================= */

    pendingPlayer = player;


    /* =========================
       فتح نافذة اختيار المكان
    ========================= */

    const modal =
        document.getElementById(
            "question-modal"
        );


    if (modal) {

        modal.style.display = "flex";

    }

}


/* =========================
   اختيار مكان النَّطْرة
========================= */

function selectPointLocation(location) {

    if (!pendingPlayer) {

        return;

    }


    /* التأكد من المكان */

    if (
        typeof location !== "string" ||
        location.trim() === ""
    ) {

        return;

    }


    const player =
        pendingPlayer;


    const now =
        Date.now();


    /* =========================
       إضافة النقطة
    ========================= */

    if (player === "Yousry") {

        yousryScore++;

    }


    if (player === "Yassin") {

        yassinScore++;

    }


    /* =========================
       تسجيل آخر نقطة
    ========================= */

    lastPoint = {

        player: player,

        time: now

    };


    localStorage.setItem(
        "lastPoint",
        JSON.stringify(lastPoint)
    );


    /* =========================
       تسجيل الحدث
    ========================= */

    events.push({

        player: player,

        location: location.trim(),

        date:
            new Date(now)
                .toLocaleDateString("ar-EG"),

        time:
            new Date(now)
                .toLocaleTimeString("ar-EG"),

        type: "point",

        timestamp: now

    });


    saveEvents();


    /* =========================
       إغلاق نافذة اختيار المكان
    ========================= */

    const questionModal =
        document.getElementById(
            "question-modal"
        );


    if (questionModal) {

        questionModal.style.display = "none";

    }


    /* =========================
       إغلاق نافذة المكان المخصص
    ========================= */

    const customModal =
        document.getElementById(
            "custom-location-modal"
        );


    if (customModal) {

        customModal.style.display = "none";

    }


    /* =========================
       تصفير اللاعب المنتظر
    ========================= */

    pendingPlayer = null;


    /* =========================
       تحديث البيانات
    ========================= */

    updateEvents();

    updateStats();

    updateLeader();

    updateTimer();

    updateTodayStatus();


    /* =========================
       رسالة التأكيد
    ========================= */

    alert(
        "✅ " +
        player +
        " خد النَّطْرة 🎯\n\n" +
        "📍 المكان: " +
        location.trim()
    );


    /* =========================
       Refresh تلقائي
    ========================= */

    window.location.reload();

}


/* =========================
   فتح كتابة مكان مخصص
========================= */

function customLocation() {

    if (!pendingPlayer) {

        alert(
            "❌ اختار مين خد النقطة الأول."
        );

        return;

    }


    const questionModal =
        document.getElementById(
            "question-modal"
        );


    const customModal =
        document.getElementById(
            "custom-location-modal"
        );


    const input =
        document.getElementById(
            "custom-location-input"
        );


    /* إخفاء نافذة اختيار المكان */

    if (questionModal) {

        questionModal.style.display = "none";

    }


    /* فتح نافذة الكتابة */

    if (customModal) {

        customModal.style.display = "flex";

    }


    /* تنظيف مربع الكتابة */

    if (input) {

        input.value = "";

        setTimeout(function () {

            input.focus();

        }, 100);

    }

}


/* =========================
   تسجيل المكان المخصص
========================= */

function saveCustomLocation() {

    if (!pendingPlayer) {

        alert(
            "❌ مفيش لاعب محدد."
        );

        return;

    }


    const input =
        document.getElementById(
            "custom-location-input"
        );


    if (!input) {

        alert(
            "❌ مربع كتابة المكان مش موجود في الصفحة."
        );

        return;

    }


    const locationText =
        input.value.trim();


    /* التأكد إن المكان مكتوب */

    if (locationText === "") {

        alert(
            "⚠️ اكتب المكان الأول."
        );

        input.focus();

        return;

    }


    /* تسجيل النقطة */

    selectPointLocation(locationText);

}


/* =========================
   Enter لتسجيل المكان
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const input =
            document.getElementById(
                "custom-location-input"
            );


        if (!input) {

            return;

        }


        input.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    saveCustomLocation();

                }

            }
        );

    }
);


/* =========================
   إلغاء كتابة المكان
========================= */

function cancelCustomLocation() {

    const customModal =
        document.getElementById(
            "custom-location-modal"
        );


    if (customModal) {

        customModal.style.display = "none";

    }


    /* الرجوع لنافذة اختيار المكان */

    if (pendingPlayer) {

        const questionModal =
            document.getElementById(
                "question-modal"
            );


        if (questionModal) {

            questionModal.style.display = "flex";

        }

    }

}


/* =========================
   إلغاء سؤال المكان
========================= */

function cancelPointQuestion() {

    const modal =
        document.getElementById(
            "question-modal"
        );


    if (modal) {

        modal.style.display = "none";

    }


    pendingPlayer = null;

}


/* =========================
   مفيش نَطْرة النهارده
========================= */

function noPointToday() {

    const now =
        Date.now();


    const date =
        new Date(now)
            .toLocaleDateString("ar-EG");


    /* التأكد إن مفيش تسجيل
       لنفس اليوم */

    const alreadyRecorded =
        events.some(function (event) {

            return (
                event.type === "no-point" &&
                event.date === date
            );

        });


    if (alreadyRecorded) {

        alert(
            "🚫 تم تسجيل «مفيش نَطْرة النهارده» بالفعل."
        );


        return;

    }


    /* تسجيل الحدث */

    events.push({

        player: "مفيش نَطْرة",

        date: date,

        time:
            new Date(now)
                .toLocaleTimeString("ar-EG"),

        type: "no-point",

        timestamp: now

    });


    saveEvents();

    updateEvents();

    updateTodayStatus();


    alert(
        "✅ تم تسجيل: مفيش نَطْرة النهارده\n\n" +
        "🔒 تسجيل النقاط مقفول لحد إلغاء القرار."
    );


    /* Refresh تلقائي */

    window.location.reload();

}


/* =========================
   حفظ الأحداث
========================= */

function saveEvents() {

    localStorage.setItem(
        "events",
        JSON.stringify(events)
    );

}


/* =========================
   تحميل الأحداث
========================= */

function loadEvents() {

    const saved =
        localStorage.getItem("events");


    if (saved) {

        try {

            events =
                JSON.parse(saved);


            if (!Array.isArray(events)) {

                events = [];

            }

        } catch (error) {

            events = [];

        }

    }


    /* =========================
       حساب النقاط
    ========================= */

    yousryScore = 0;

    yassinScore = 0;


    events.forEach(function (event) {

        if (
            event.type === "point" &&
            event.player === "Yousry"
        ) {

            yousryScore++;

        }


        if (
            event.type === "point" &&
            event.player === "Yassin"
        ) {

            yassinScore++;

        }

    });


    /* =========================
       تحديث الأرقام
    ========================= */

    const yousryElement =
        document.getElementById(
            "yousry-score"
        );


    const yassinElement =
        document.getElementById(
            "yassin-score"
        );


    if (yousryElement) {

        yousryElement.textContent =
            yousryScore;

    }


    if (yassinElement) {

        yassinElement.textContent =
            yassinScore;

    }

}


/* =========================
   العداد
========================= */

function updateTimer() {

    const timer =
        document.getElementById(
            "timer"
        );


    const info =
        document.getElementById(
            "timer-info"
        );


    if (!timer || !info) {

        return;

    }


    /* مفيش نقطة */

    if (!lastPoint) {

        timer.textContent =
            "النقطة متاحة الآن 🔥";


        info.textContent =
            "مفيش نقطة مسجلة حاليًا";


        return;

    }


    const now =
        Date.now();


    const timePassed =
        now -
        Number(lastPoint.time);


    /* انتهاء الـ24 ساعة */

    if (timePassed >= WAIT_TIME) {

        timer.textContent =
            "النقطة متاحة الآن 🔥";


        info.textContent =
            "يلا مين الشاطر؟ 👀";


        return;

    }


    /* الوقت المتبقي */

    const remaining =
        WAIT_TIME -
        timePassed;


    const hours =
        Math.floor(
            remaining /
            (1000 * 60 * 60)
        );


    const minutes =
        Math.floor(
            (
                remaining %
                (1000 * 60 * 60)
            ) /
            (1000 * 60)
        );


    const seconds =
        Math.floor(
            (
                remaining %
                (1000 * 60)
            ) /
            1000
        );


    timer.textContent =
        hours +
        " ساعة : " +
        minutes +
        " دقيقة : " +
        seconds +
        " ثانية";


    info.textContent =
        "آخر نقطة كانت لـ " +
        lastPoint.player;

}


/* =========================
   حالة النقطة
========================= */

function updateTodayStatus() {

    const status =
        document.getElementById(
            "today-status"
        );


    if (!status) {

        return;

    }


    /* مفيش نَطْرة اليوم */

    if (isNoPointToday()) {

        status.textContent =
            "🚫 مفيش نَطْرة النهارده — النقطة مقفولة 🔒";


        return;

    }


    /* مفيش نقطة */

    if (!lastPoint) {

        status.textContent =
            "النقطة متاحة 🔥";


        return;

    }


    const remaining =
        WAIT_TIME -
        (
            Date.now() -
            Number(lastPoint.time)
        );


    /* انتهاء الـ24 ساعة */

    if (remaining <= 0) {

        status.textContent =
            "🎯 النقطة متاحة من جديد 🔥";


        return;

    }


    status.textContent =
        "🎯 آخر نقطة كانت لـ " +
        lastPoint.player;

}


/* =========================
   معرفة هل مفيش نَطْرة اليوم
========================= */

function isNoPointToday() {

    const today =
        new Date()
            .toLocaleDateString("ar-EG");


    return events.some(function (event) {

        return (
            event.type === "no-point" &&
            event.date === today
        );

    });

}


/* =========================
   سجل الأحداث
========================= */

function updateEvents() {

    const eventsContainer =
        document.getElementById(
            "events"
        );


    const eventCount =
        document.getElementById(
            "event-count"
        );


    if (!eventsContainer) {

        return;

    }


    eventsContainer.innerHTML = "";


    /* مفيش أحداث */

    if (events.length === 0) {

        eventsContainer.innerHTML = `

            <div class="empty">

                <div>🎯</div>

                <p>
                    مفيش أحداث لسه
                </p>

                <small>
                    أول نقطة هتظهر هنا
                </small>

            </div>

        `;


        if (eventCount) {

            eventCount.textContent =
                "0 حدث";

        }


        return;

    }


    /* عرض الأحدث أولًا */

    [...events]
        .reverse()
        .forEach(function (event) {

            const eventElement =
                document.createElement(
                    "div"
                );


            eventElement.className =
                "event";


            /* حدث مفيش نَطْرة */

            if (
                event.type === "no-point"
            ) {

                eventElement.innerHTML = `

                    <p>

                        🚫

                        <strong>
                            مفيش نَطْرة
                        </strong>

                    </p>

                    <small>

                        📅 ${event.date}

                        •

                        ⏰ ${event.time}

                    </small>

                `;

            }


            /* حدث نقطة */

            else {

                eventElement.innerHTML = `

                    <p>

                        🎯

                        <strong>
                            ${event.player}
                        </strong>

                        كسب النقطة

                    </p>

                    <small>

                        📍
                        ${event.location || "غير محدد"}

                        •

                        📅
                        ${event.date}

                        •

                        ⏰
                        ${event.time}

                    </small>

                `;

            }


            eventsContainer.appendChild(
                eventElement
            );

        });


    if (eventCount) {

        eventCount.textContent =
            events.length +
            " حدث";

    }

}


/* =========================
   الإحصائيات
========================= */

function updateStats() {

    const total =
        document.getElementById(
            "total-points"
        );


    const yousryWins =
        document.getElementById(
            "yousry-wins"
        );


    const yassinWins =
        document.getElementById(
            "yassin-wins"
        );


    if (total) {

        total.textContent =
            yousryScore +
            yassinScore;

    }


    if (yousryWins) {

        yousryWins.textContent =
            yousryScore;

    }


    if (yassinWins) {

        yassinWins.textContent =
            yassinScore;

    }

}


/* =========================
   المتصدر
========================= */

function updateLeader() {

    const leader =
        document.getElementById(
            "leader"
        );


    if (!leader) {

        return;

    }


    if (
        yousryScore === 0 &&
        yassinScore === 0
    ) {

        leader.textContent =
            "لسه مفيش نقاط 😎";


        return;

    }


    if (
        yousryScore >
        yassinScore
    ) {

        leader.textContent =
            "👑 Yousry متصدر بفارق " +
            (
                yousryScore -
                yassinScore
            ) +
            " نقطة";


        return;

    }


    if (
        yassinScore >
        yousryScore
    ) {

        leader.textContent =
            "👑 Yassin متصدر بفارق " +
            (
                yassinScore -
                yousryScore
            ) +
            " نقطة";


        return;

    }


    leader.textContent =
        "⚡ تعادل!";

}


/* =========================
   حذف آخر نَطْرة
========================= */

function deleteLastPoint() {

    let lastPointIndex = -1;


    /* البحث عن آخر نقطة */

    for (
        let i = events.length - 1;
        i >= 0;
        i--
    ) {

        if (
            events[i].type === "point"
        ) {

            lastPointIndex = i;

            break;

        }

    }


    /* لا توجد نقطة */

    if (
        lastPointIndex === -1
    ) {

        alert(
            "❌ مفيش نَطْرة تقدر تحذفها."
        );


        return;

    }


    const point =
        events[lastPointIndex];


    /* تأكيد الحذف */

    const confirmDelete =
        confirm(

            "⚠️ متأكد إنك عايز تحذف آخر نَطْرة؟\n\n" +

            "🎯 اللاعب: " +
            point.player +

            "\n📍 المكان: " +
            (
                point.location ||
                "غير محدد"
            ) +

            "\n📅 التاريخ: " +
            point.date +

            "\n⏰ الوقت: " +
            point.time

        );


    if (!confirmDelete) {

        return;

    }


    /* حذف النقطة */

    events.splice(
        lastPointIndex,
        1
    );


    /* إعادة حساب النقاط */

    yousryScore = 0;

    yassinScore = 0;


    events.forEach(function (event) {

        if (
            event.type === "point" &&
            event.player === "Yousry"
        ) {

            yousryScore++;

        }


        if (
            event.type === "point" &&
            event.player === "Yassin"
        ) {

            yassinScore++;

        }

    });


    /* البحث عن آخر نقطة موجودة */

    lastPoint = null;


    for (
        let i = events.length - 1;
        i >= 0;
        i--
    ) {

        if (
            events[i].type === "point"
        ) {

            lastPoint = {

                player:
                    events[i].player,

                time:
                    events[i].timestamp ||
                    Date.now()

            };


            break;

        }

    }


    /* حفظ آخر نقطة */

    if (lastPoint) {

        localStorage.setItem(
            "lastPoint",
            JSON.stringify(lastPoint)
        );

    } else {

        localStorage.removeItem(
            "lastPoint"
        );

    }


    saveEvents();


    updateEvents();

    updateStats();

    updateLeader();

    updateTimer();

    updateTodayStatus();


    alert(
        "✅ تم حذف آخر نَطْرة بنجاح."
    );


    /* Refresh تلقائي */

    window.location.reload();

}


/* =========================
   إلغاء مفيش نَطْرة
========================= */

function cancelNoPoint() {

    const today =
        new Date()
            .toLocaleDateString("ar-EG");


    const index =
        events.findIndex(function (event) {

            return (
                event.type === "no-point" &&
                event.date === today
            );

        });


    /* مفيش قرار */

    if (index === -1) {

        alert(
            "❌ مفيش قرار «مفيش نَطْرة النهارده» مسجل النهارده."
        );


        return;

    }


    /* تأكيد الإلغاء */

    const confirmCancel =
        confirm(

            "⚠️ هل أنت متأكد من إلغاء القرار؟\n\n" +

            "🎯 سيتم فتح تسجيل النقاط من جديد."

        );


    if (!confirmCancel) {

        return;

    }


    /* حذف قرار مفيش نَطْرة */

    events.splice(
        index,
        1
    );


    /*
       مهم:
       لا نمسح lastPoint هنا.
       لو فيه نقطة سابقة ولسه
       الـ24 ساعة مخلصتش، تفضل موجودة.
    */


    saveEvents();


    updateEvents();

    updateStats();

    updateLeader();

    updateTimer();

    updateTodayStatus();


    alert(

        "✅ تم إلغاء القرار.\n\n" +

        "🎯 يمكن تسجيل نقطة الآن، " +

        "إذا كانت الـ24 ساعة من آخر نقطة قد انتهت."

    );


    /* Refresh تلقائي */

    window.location.reload();

}


/* =========================
   تشغيل الموقع
========================= */

loadEvents();

updateEvents();

updateStats();

updateLeader();

updateTimer();

updateTodayStatus();


/* =========================
   تحديث العداد كل ثانية
========================= */

setInterval(function () {

    updateTimer();

    updateTodayStatus();

}, 1000);