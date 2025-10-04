const db = require('../config/database');

class Approval {
  static async create(approvalData) {
    const { expense_id, approver_id, status, comment } = approvalData;
    
    const query = `
      INSERT INTO approvals (expense_id, approver_id, status, comment) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    
    const result = await db.query(query, [expense_id, approver_id, status, comment]);
    return result.rows[0];
  }

  static async findByExpense(expenseId) {
    const query = `
      SELECT a.*, u.name as approver_name 
      FROM approvals a 
      JOIN users u ON a.approver_id = u.id 
      WHERE expense_id = $1 
      ORDER BY a.created_at
    `;
    const result = await db.query(query, [expenseId]);
    return result.rows;
  }

  static async findByApprover(approverId) {
    const query = `
      SELECT a.*, e.*, u.name as employee_name 
      FROM approvals a 
      JOIN expenses e ON a.expense_id = e.id 
      JOIN users u ON e.employee_id = u.id 
      WHERE a.approver_id = $1 AND a.status = 'pending'
      ORDER BY a.created_at DESC
    `;
    const result = await db.query(query, [approverId]);
    return result.rows;
  }
}

module.exports = Approval;