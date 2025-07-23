const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hash });
  await user.save();
  res.status(201).json({ message: 'User registered' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token });
};

exports.googleAuth = (req, res) => {
  // Implement with passport-google-oauth20
  res.status(501).json({ message: 'Google OAuth not implemented' });
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
}; 