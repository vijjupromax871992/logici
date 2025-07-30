// /backend/controllers/healthController.js
exports.checkHealth = async (req, res) => {
    try {
      res.status(200).json({ success: true, message: 'API is healthy' });
    } catch (error) {
      logger.error(`Error in Health Endpoint: ${error.message}\n${error.stack}`);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };
  