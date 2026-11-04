const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const makeToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already used' });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    res.json({ token: makeToken(user), user: { id: user._id, name, email } });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Wrong email or password' });
    res.json({ token: makeToken(user), user: { id: user._id, name: user.name, email } });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// list of users (for the "assign to" dropdown)
router.get('/users', auth, async (req, res) => {
  res.json(await User.find().select('name email'));
});

module.exports = router;