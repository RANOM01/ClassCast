import express from 'express';
import { User } from '../models/User.js';

const router = express.Router();

/**
 * Public signup - creates a Student account
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'Student', // Public signup is always Student
    });

    await user.save();

    // Create session
    req.session.userId = user._id.toString();
    req.session.role = user.role;
    req.session.name = user.name;
    req.session.email = user.email;

    return res.status(201).json({
      message: 'Account created successfully',
      user: user.toSafeObject(),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create account.', details: err.message });
  }
});

/**
 * User login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Set session
    req.session.userId = user._id.toString();
    req.session.role = user.role;
    req.session.name = user.name;
    req.session.email = user.email;

    return res.json({
      message: 'Signed in successfully',
      user: user.toSafeObject(),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to sign in.', details: err.message });
  }
});

/**
 * User logout
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out.' });
    }
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logged out successfully.' });
  });
});

/**
 * Current user status
 */
router.get('/me', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.json({ user: null });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.json({ user: null });
    }

    return res.json({ user: user.toSafeObject() });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch session user.', details: err.message });
  }
});

export default router;
