const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client("YOUR_GOOGLE_CLIENT_ID");

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

exports.googleLogin = async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "YOUR_GOOGLE_CLIENT_ID",
    });
    const payload = ticket.getPayload();
    // Find or create user in your DB
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        email: payload.email,
        name: payload.name,
        // ...other fields as needed
      });
    }
    // Generate your own session/JWT token here
    // Example: const jwt = generateJWT(user);
    res.json({ user /*, token: jwt */ });
  } catch (err) {
    res.status(401).json({ error: "Invalid Google token" });
  }
};

exports.googleAuth = (req, res) => {
  // Implement with passport-google-oauth20
  res.status(501).json({ message: 'Google OAuth not implemented' });
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
}; 