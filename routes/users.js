const express = require('express');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users in company (admin only)
router.get('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const users = await User.findByCompany(req.user.company_id);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users' 
    });
  }
});

// Create new user (admin only)
router.post('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { email, password, name, role, manager_id } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    const userData = {
      email,
      password,
      name,
      role,
      company_id: req.user.company_id,
      manager_id: role === 'employee' ? manager_id : null
    };

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating user' 
    });
  }
});

// Update user (admin only)
router.put('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.role) updates.role = req.body.role;
    if (req.body.manager_id !== undefined) updates.manager_id = req.body.manager_id;

    const user = await User.update(req.params.id, updates);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating user' 
    });
  }
});

module.exports = router;