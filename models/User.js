const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { email, password, name, role, company_id, manager_id } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const query = `
      INSERT INTO users (email, password, name, role, company_id, manager_id) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id, email, name, role, company_id, manager_id, created_at
    `;
    
    const result = await db.query(query, [
      email, 
      hashedPassword, 
      name, 
      role, 
      company_id, 
      manager_id
    ]);
    
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = `
      SELECT users.*, companies.name as company_name, companies.currency as company_currency 
      FROM users 
      LEFT JOIN companies ON users.company_id = companies.id 
      WHERE email = $1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT users.*, companies.name as company_name, companies.currency as company_currency 
      FROM users 
      LEFT JOIN companies ON users.company_id = companies.id 
      WHERE users.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByCompany(companyId) {
    const query = `
      SELECT id, name, email, role, manager_id, created_at 
      FROM users 
      WHERE company_id = $1 
      ORDER BY name
    `;
    const result = await db.query(query, [companyId]);
    return result.rows;
  }

  static async update(id, updates) {
    const allowedFields = ['name', 'role', 'manager_id'];
    const setClause = [];
    const values = [];
    let paramCount = 1;

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        setClause.push(`${field} = $${paramCount}`);
        values.push(updates[field]);
        paramCount++;
      }
    });

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const query = `
      UPDATE users 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount} 
      RETURNING id, name, email, role, manager_id, created_at, updated_at
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;