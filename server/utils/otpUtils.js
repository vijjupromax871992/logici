const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

// Create SNS client
const snsClient = new SNSClient({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const sendSMS = async (mobileNumber, message) => {
  try {
    const params = {
      Message: message,
      PhoneNumber: mobileNumber,
    };

    const command = new PublishCommand(params);
    const result = await snsClient.send(command);
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = { sendSMS };
