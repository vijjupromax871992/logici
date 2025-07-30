// models/activityLog.js
module.exports = (sequelize, DataTypes) => {
  const ActivityLog = sequelize.define('ActivityLog', {
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entity_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entity_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'activity_logs',
    timestamps: true
  });

  return ActivityLog;
};