const Contact = require('../../models/contacts/contacts.schema');
const apiResponse = require("../../helpers/apiResponse");

exports.save = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        const contact = new Contact({
            name,
            email,
            phone,
            message
        });
        const savedContact = await contact.save();
        return apiResponse.successResponseWithData(res, 'Contact saved successfully', savedContact);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};
