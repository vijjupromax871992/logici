// /backend/utils/availability.js
const { Booking } = require('../models');
const { Op } = require('sequelize');

const isWarehouseAvailable = async (warehouseId, startDate, endDate) => {
  const overlappingBookings = await Booking.findAll({
    where: {
      warehouse_id: warehouseId,
      [Op.or]: [
        {
          startDate: { [Op.lt]: endDate },
          endDate: { [Op.gt]: startDate },
        }
      ]
    }
  });
  return overlappingBookings.length === 0;
};

module.exports = { isWarehouseAvailable };
