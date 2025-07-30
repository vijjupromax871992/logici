// /backend/controllers/rolesController.js
const Role = require('../models/Role');

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch roles' });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name } = req.body;
    const role = await Role.create({ name });
    res.status(201).json({ success: true, data: role });
  } catch (error) {
    logger.error(`Error creating role: ${error.message}\n${error.stack}`); 
    res.status(500).json({ success: false, message: 'Failed to create role' });
  }
};
