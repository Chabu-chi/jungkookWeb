const User = require('../models/User');


exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    const user = new User({ username, email, password });
    await user.save();
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
