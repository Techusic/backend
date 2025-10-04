const express = require('express');
const Expense = require('../models/Expense');
const { auth } = require('../middleware/auth');
const { validateExpense } = require('../middleware/validation');

const router = express.Router();

// Get all expenses for current user
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.findByEmployee(req.user.id);
    
    res.json({
      success: true,
      data: expenses
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching expenses' 
    });
  }
});

// Get all expenses for company (admin/manager)
router.get('/company', auth, async (req, res) => {
  try {
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const expenses = await Expense.findByCompany(req.user.company_id);
    
    res.json({
      success: true,
      data: expenses
    });
  } catch (error) {
    console.error('Get company expenses error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching company expenses' 
    });
  }
});

// Create new expense
router.post('/', auth, validateExpense, async (req, res) => {
  try {
    const expenseData = {
      ...req.body,
      employee_id: req.user.id
    };

    const expense = await Expense.create(expenseData);
    
    res.status(201).json({
      success: true,
      message: 'Expense submitted successfully',
      data: expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating expense' 
    });
  }
});

// Get expense by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    // Check if user has access to this expense
    if (expense.employee_id !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching expense' 
    });
  }
});

module.exports = router;