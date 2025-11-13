const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: String, required: true },
  location: { type: String, required: true },
  room: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true }
});

module.exports = mongoose.model('Booking', bookingSchema);
