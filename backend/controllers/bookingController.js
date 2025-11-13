const Booking = require('../models/Booking');

exports.getBookings = async (req, res) => {
  try {
    const username = req.query.username;
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    const bookings = await Booking.find({ user: username });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { username, location, room, startTime, endTime } = req.body;
    // Correct conflict check for overlapping bookings
    const conflict = await Booking.findOne({
      location,
      room,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    });
    
    if (conflict) {
      
      return res.status(409).json({ message: 'This time slot is already booked.' });
    }
    const booking = new Booking({ user: username, location, room, startTime, endTime });
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: 'Server error' });
  }
};
 
exports.deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
