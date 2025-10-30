const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register admin (one-time). In production, remove or protect this endpoint.
router.post('/register', async (req,res)=> {
  try{
    const { name, email, password } = req.body;
    if(!email || !password) return res.status(400).json({ message: 'Please provide email and password' });
    let user = await User.findOne({ email });
    if(user) return res.status(400).json({ message: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    user = new User({ name, email, password: hashed, role: 'admin' });
    await user.save();
    return res.json({ message: 'Admin registered' });
  }catch(err){
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req,res)=> {
  try{
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ message: 'Provide email and password' });
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const payload = { id: user._id, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret_here', { expiresIn: '8h' });
    res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
  }catch(err){
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
