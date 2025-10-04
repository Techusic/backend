const express = require('express');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get workflow configuration
router.get('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    // In a real application, you would fetch this from a workflow_rules table
    const workflowConfig = {
      multiLevelApprovals: {
        managerFirstApprover: true,
        approvalSequence: [
          { id: '1', name: 'Manager', role: 'manager' },
          { id: '2', name: 'Finance', role: 'finance' }
        ]
      },
      conditionalRules: {
        usePercentageRule: false,
        percentageThreshold: 60,
        useSpecificApprover: false,
        specificApprover: '',
        useHybridRule: false,
        hybridLogic: 'OR'
      }
    };

    res.json({
      success: true,
      data: workflowConfig
    });
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching workflow configuration' 
    });
  }
});

// Update workflow configuration
router.post('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const workflowConfig = req.body;

    // In a real application, you would save this to a workflow_rules table
    console.log('Workflow configuration updated:', workflowConfig);

    res.json({
      success: true,
      message: 'Workflow configuration updated successfully',
      data: workflowConfig
    });
  } catch (error) {
    console.error('Update workflow error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating workflow configuration' 
    });
  }
});

module.exports = router;