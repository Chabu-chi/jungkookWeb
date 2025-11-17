// controllers/bookingController.js
const Booking = require('../models/Booking');

function parseSlotToTimes(dateStr, slotStr) {
  // slotStr expected "HH:MM-HH:MM"
  const [startStr, endStr] = slotStr.split('-');
  const startTime = new Date(`${dateStr}T${startStr}`);
  const endTime = new Date(`${dateStr}T${endStr}`);
  return { startTime, endTime };
}

exports.getBookings = async (req, res) => {
  try {
    const { username, date, room } = req.query;

    if (username) {
      const bookings = await Booking.find({ user: username }).sort({ date: 1, slot: 1 });
      return res.json(bookings);
    }

    if (date && room) {
      // return bookings for a specific date + room (used for availability)
      const bookings = await Booking.find({ date, room });
      return res.json(bookings);
    }

    return res.status(400).json({ message: 'Provide username OR (date and room) as query params' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { username, location, room, date, slot } = req.body;
    if (!username || !room || !date || !slot) {
      return res.status(400).json({ message: 'username, room, date and slot are required' });
    }

    // Validate slot is not in the past
    const now = new Date();
    const currentHour = now.getHours();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return res.status(400).json({ message: 'Cannot book for a past date. Please select today or a future date.' });
    }
    
    // If booking for today, check that slot start time is after current hour
    if (bookingDate.getTime() === today.getTime()) {
      const [startStr] = slot.split('-');
      const slotHour = parseInt(startStr.split(':')[0]);
      if (slotHour <= currentHour) {
        return res.status(400).json({ message: 'Cannot book a slot that has already passed. Please select a future time slot.' });
      }
    }

    // Compute start/end datetimes
    const { startTime, endTime } = parseSlotToTimes(date, slot);

    // Check conflict:
    // 1) same room + same date + exact same slot
    // 2) overlapping with existing booking times (for compatibility with old documents)
    const conflict = await Booking.findOne({
      room,
      date,
      $or: [
        { slot }, // exact same slot already booked
        {
          // overlapping times:
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflict) {
      return res.status(409).json({ message: 'This time slot is already booked.' });
    }

    const booking = new Booking({
      user: username,
      location: location || '',
      room,
      date,
      slot,
      startTime,
      endTime
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
  