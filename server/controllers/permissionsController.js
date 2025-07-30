// /backend/controllers/permissionsController.js
const Permission = require('../models/Permission');

exports.getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.status(200).json({ success: true, data: permissions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch permissions' });
  }
};

exports.createPermission = async (req, res) => {
  try {
    const { name } = req.body;
    const permission = await Permission.create({ name });
    res.status(201).json({ success: true, data: permission });
  } catch (error) {
    logger.error(`Error creating permission: ${error.message}\n${error.stack}`); 
    res.status(500).json({ success: false, message: 'Failed to create permission' });
  }
};
