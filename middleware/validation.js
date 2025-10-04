const Joi = require('joi');

const validateSignup = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).required(),
    role: Joi.string().valid('admin', 'manager', 'employee').required(),
    companyName: Joi.string().min(2).required(),
    currency: Joi.string().length(3).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      message: error.details[0].message 
    });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().valid('admin', 'manager', 'employee').required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      message: error.details[0].message 
    });
  }
  next();
};

const validateExpense = (req, res, next) => {
  const schema = Joi.object({
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).required(),
    category: Joi.string().required(),
    description: Joi.string().required(),
    expense_date: Joi.date().required(),
    paid_by: Joi.string().required(),
    remarks: Joi.string().allow(''),
    approver_name: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      message: error.details[0].message 
    });
  }
  next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validateExpense
};