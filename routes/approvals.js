const express = require('express');
const Expense = require('../models/Expense');
const Approval = require('../models/Approval');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get pending approvals for manager/admin
router.get('/pending', auth, async (req, res) => {
  try {
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const pendingExpenses = await Expense.findPendingByCompany(req.user.company_id);
    
    res.json({
      success: true,
      data: pendingExpenses
    });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching pending approvals' 
    });
  }
});

// Approve expense
router.post('/:id/approve', auth, async (req, res) => {
  try {
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    // Update expense status
    const updatedExpense = await Expense.updateStatus(req.params.id, 'approved');

    // Create approval record
    await Approval.create({
      expense_id: req.params.id,
      approver_id: req.user.id,
      status: 'approved',
      comment: 'Expense approved'
    });

    res.json({
      success: true,
      message: 'Expense approved successfully',
      data: updatedExpense
    });
  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error approving expense' 
    });
  }
});

// Reject expense
router.post('/:id/reject', auth, async (req, res) => {
  try {
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rejection comment is required' 
      });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    // Update expense status
    const updatedExpense = await Expense.updateStatus(
      req.params.id, 
      'rejected', 
      comment
    );

    // Create approval record
    await Approval.create({
      expense_id: req.params.id,
      approver_id: req.user.id,
      status: 'rejected',
      comment
    });

    res.json({
      success: true,
      message: 'Expense rejected successfully',
      data: updatedExpense
    });
  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error rejecting expense' 
    });
  }
});

module.exports = router;