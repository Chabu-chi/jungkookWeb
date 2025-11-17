// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: String, required: true },
  location: { type: String, required: true }, // optional semantics (building)
  room: { type: String, required: true },     // fixed room name (e.g. "Room A")
  date: { type: String, required: true },     // YYYY-MM-DD
  slot: { type: String, required: true },     // e.g. "09:00-10:00"
  startTime: { type: Date }, // computed from date + slot (kept for compatibility)
  endTime: { type: Date }    // computed from date + slot
});

module.exports = mongoose.model('Booking', bookingSchema);
