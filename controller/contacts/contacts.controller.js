const Contact = require('../../models/contacts/contacts.schema');
const apiResponse = require("../../helpers/apiResponse");
const mailer = require("../../helpers/nodemailer");

exports.save = async (req, res) => {
    try {
        const { first_name, last_name, company_name, email, phone, message, feedback } = req.body;
        const contact = new Contact({
            first_name,
            last_name,
            company_name,
            email,
            phone,
            message,
            feedback
        });
        const savedContact = await contact.save();

        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: email,
            subject: 'Thankyou for contacting us',
            text: `Hi ${first_name},\n\nThank you for reaching out to us. We appreciate your interest in our services and would like to inform you that we have received your inquiry.\nOur team is currently reviewing your request, and we will get back to you as soon as possible. We strive to provide timely and comprehensive assistance to all our valued customers.\n\nThank you`,
            html: `<p>Hi ${first_name},</p><p>Thank you for reaching out to us. We appreciate your interest in our services and would like to inform you that we have received your inquiry.</p><p>Our team is currently reviewing your request, and we will get back to you as soon as possible. We strive to provide timely and comprehensive assistance to all our valued customers.</p><p>Thank you,</p><p>Your Company Name</p>`
        };
        
        mailer.sendMail(mailOptions);

        return apiResponse.successResponseWithData(res, 'Contact saved successfully', savedContact);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};
