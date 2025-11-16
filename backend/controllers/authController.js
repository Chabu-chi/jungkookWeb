const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(req.body);
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const user = new User({ username, email, password });
    await user.save();

    //const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '3h' });
    res.status(201).json({ username: username, email: email });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password)))
      return res.status(400).json({ message: 'Invalid credentials' });

    res.json({ username: user.username, email });
  } catch (error) {
    
    res.status(500).json({ message: 'Server error', error });
  }
};
