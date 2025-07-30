// Location: src/services/sns.service.js
const AWS = require('aws-sdk');
const { config } = require('dotenv');

// Load environment variables
config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
});

const sns = new AWS.SNS();

/**
 * Sends an SMS using AWS SNS
 * @param {string} phoneNumber - The phone number to send the SMS to
 * @param {string} message - The message to be sent
 * @returns {string} - Message ID of the sent SMS
 */
const sendSMS = async (phoneNumber, message) => {
  try {
    const formattedNumber = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+91${phoneNumber}`; // Assuming Indian numbers

    const params = {
      Message: message,
      PhoneNumber: formattedNumber,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional'
        }
      }
    };

    const result = await sns.publish(params).promise();
    return result.MessageId;
  } catch (error) {
    throw error;
  }
};

module.exports = { sendSMS };
