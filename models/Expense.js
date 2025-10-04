const db = require('../config/database');

class Expense {
  static async create(expenseData) {
    const {
      employee_id,
      amount,
      currency,
      category,
      description,
      expense_date,
      paid_by,
      remarks,
      approver_name,
      status = 'pending'
    } = expenseData;

    const query = `
      INSERT INTO expenses (
        employee_id, amount, currency, category, description, 
        expense_date, paid_by, remarks, approver_name, status
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *
    `;

    const result = await db.query(query, [
      employee_id,
      amount,
      currency,
      category,
      description,
      expense_date,
      paid_by,
      remarks,
      approver_name,
      status
    ]);

    return result.rows[0];
  }

  static async findByEmployee(employeeId) {
    const query = `
      SELECT * FROM expenses 
      WHERE employee_id = $1 
      ORDER BY expense_date DESC, created_at DESC
    `;
    const result = await db.query(query, [employeeId]);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT e.*, u.name as employee_name, u.email as employee_email
      FROM expenses e
      JOIN users u ON e.employee_id = u.id
      WHERE e.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findPendingByCompany(companyId) {
    const query = `
      SELECT e.*, u.name as employee_name, u.email as employee_email
      FROM expenses e
      JOIN users u ON e.employee_id = u.id
      WHERE u.company_id = $1 AND e.status = 'pending'
      ORDER BY e.created_at DESC
    `;
    const result = await db.query(query, [companyId]);
    return result.rows;
  }

  static async updateStatus(id, status, rejectionComment = null) {
    const query = `
      UPDATE expenses 
      SET status = $1, rejection_comment = $2, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $3 
      RETURNING *
    `;
    const result = await db.query(query, [status, rejectionComment, id]);
    return result.rows[0];
  }

  static async findByCompany(companyId) {
    const query = `
      SELECT e.*, u.name as employee_name, u.email as employee_email
      FROM expenses e
      JOIN users u ON e.employee_id = u.id
      WHERE u.company_id = $1
      ORDER BY e.expense_date DESC, e.created_at DESC
    `;
    const result = await db.query(query, [companyId]);
    return result.rows;
  }
}

module.exports = Expense;