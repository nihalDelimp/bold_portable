const Tracking = require('../../models/tracking/tracking.schema');
const apiResponse = require("../../helpers/apiResponse");

exports.saveTracking = async (req, res) => {
    try {
    
        const tracking = new Tracking({
            quotationType: req.body.quotationType,
            quotationId: req.body.quotationId,
            address: req.body.address,
            driver_name: req.body.driver_name,
            driver_phone_number: req.body.driver_phone_number,
        });
    
        const data = await tracking.save();
    
        return apiResponse.successResponseWithData(
            res,
            "Data saved successfully.",
            data
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};