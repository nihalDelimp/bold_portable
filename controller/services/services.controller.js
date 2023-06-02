const Service = require('../../models/services/services.schema');
const apiResponse = require("../../helpers/apiResponse");

exports.save = async (req, res) => {
    try {
        const { fullName, phone, postalCode, email, subject, message } = req.body;
        
        // Create a new instance of the Service model
        const newService = new Service({
            fullName,
            phone,
            postalCode,
            email,
            subject,
            message
        });

        // Save the new service to the database
        const createdService = await newService.save();
        
        return apiResponse.successResponseWithData(res, 'Service saved successfully', createdService);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};
