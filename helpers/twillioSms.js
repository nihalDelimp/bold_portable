const twilio = require('twilio');

const accountSid = process.env.TWILLIO_SID;
const authToken = process.env.TWILLIO_TOKEN;
const fromPhone = process.env.TWILLIO_PHONE;

const client = twilio(accountSid, authToken);


exports.sendSMS = async (number, text) => {
    try {
        let formattedNumber = number;
        if (!number.startsWith('+91')) {
            formattedNumber = '+91' + number;
        }

        const message = await client.messages.create({
            body: text,
            from: fromPhone,
            to: formattedNumber, // Updated recipient phone number
        });

        console.log(message.sid);
    } catch (error) {
        console.error(error);
    }
};

    