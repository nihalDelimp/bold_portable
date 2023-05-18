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

exports.updateTracking = async (req, res) => {
	try {
		const { trackingId } = req.params;
		const { address, driver_name, driver_phone_number } = req.body;
	
		const updatedTracking = await Tracking.findByIdAndUpdate(
			trackingId,
			{ address, driver_name, driver_phone_number },
			{ new: true }
		);
	
		if (!updatedTracking) {
		  	return apiResponse.notFoundResponse(res, "Tracking not found.");
		}
	
		return apiResponse.successResponseWithData(
			res,
			"Tracking updated successfully.",
			updatedTracking
		);
	} catch (error) {
	return apiResponse.ErrorResponse(res, error.message);
	}
};

exports.getTrackingList = async (req, res) => {
	try {
		const { address, quotationType, driver_name } = req.query;
	
		const filters = {};
		if (address) filters.address = address;
		if (quotationType) filters.quotationType = quotationType;
		if (driver_name) filters.driver_name = driver_name;
  
	  	const trackingList = await Tracking.find(filters)
			.sort({ createdAt: -1, updatedAt: -1 });
  
	  	return apiResponse.successResponseWithData(res, "Tracking list retrieved successfully.", trackingList);
	} catch (error) {
	  	return apiResponse.ErrorResponse(res, error.message);
	}
};
  