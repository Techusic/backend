const db = require('../config/database');

class Company {
  static async create(companyData) {
    const { name, currency } = companyData;
    
    const query = `
      INSERT INTO companies (name, currency) 
      VALUES ($1, $2) 
      RETURNING *
    `;
    
    const result = await db.query(query, [name, currency]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM companies WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, updates) {
    const allowedFields = ['name', 'currency'];
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

    values.push(id);
    const query = `
      UPDATE companies 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }
}

module.exports = Company;