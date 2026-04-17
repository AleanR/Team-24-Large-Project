"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTime = formatTime;
function formatTime(time) {
    let [t, modifier] = time.split(" ");
    let [hours, minutes] = t.split(":").map(Number);
    if (modifier === "PM" && hours !== 12)
        hours += 12;
    if (modifier === "AM" && hours === 12)
        hours = 0;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
//# sourceMappingURL=time.js.map