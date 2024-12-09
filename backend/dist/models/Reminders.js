import mongoose from "mongoose";
const ReminderSchema = new mongoose.Schema({
    message: { type: String, required: true },
    dateTime: { type: Date, required: true },
    status: { type: String, default: "Scheduled" },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const Reminder = mongoose.model("Reminder", ReminderSchema);
export const storeReminderInDatabase = async (message, dateTime) => {
    const newReminder = new Reminder({
        message,
        dateTime,
    });
    await newReminder.save();
    return newReminder;
};
export default Reminder;
//# sourceMappingURL=Reminders.js.map