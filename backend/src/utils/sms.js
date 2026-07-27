import AfricasTalking from 'africastalking';
import dotenv from 'dotenv';

dotenv.config();

const at = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME || 'sandbox',
});

const sms = at.SMS;

export const sendSMS = async (recipients, message) => {
  try {
    const formattedRecipients = recipients
      .filter(Boolean)
      .map((phone) => {
        const cleaned = phone.replace(/\s/g, '').replace(/^\+/, '');
        if (cleaned.startsWith('0')) {
          return `+254${cleaned.substring(1)}`;
        }
        if (cleaned.startsWith('254')) {
          return `+${cleaned}`;
        }
        return `+${cleaned}`;
      });

    if (formattedRecipients.length === 0) {
      console.log('No valid recipients for SMS');
      return { success: false, error: 'No valid recipients' };
    }

    const result = await sms.send({
      to: formattedRecipients,
      message,
      from: process.env.AT_SENDER_ID || 'STASENTRY',
    });

    console.log(`✅ SMS sent to ${formattedRecipients.join(', ')}`);
    return { success: true, result };
  } catch (error) {
    console.error('❌ SMS error:', error.message);
    return { success: false, error: error.message };
  }
};

