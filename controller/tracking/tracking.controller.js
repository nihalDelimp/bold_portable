const Tracking = require('../../models/tracking/tracking.schema');
const apiResponse = require("../../helpers/apiResponse");

exports.saveTracking = async (req, res) => {
	try {

		let quotationType = req.body.quotationType;

		const quoteModel = require('../../models/' + quotationType.toLowerCase() + '/' + quotationType.toLowerCase() + '.schema');

		const modelInstance = await quoteModel.findById(req.body.quotationId);
	
		const tracking = new Tracking({
			quotationType: req.body.quotationType,
			quotationId: req.body.quotationId,
			subscriptionId: req.body.subscriptionId,
			address: req.body.address,
			driver_name: req.body.driver_name,
			driver_phone_number: req.body.driver_phone_number,
			user: modelInstance.user
		});

		

		console.log(quoteModel);
	
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
		const { driver_name, driver_phone_number, address } = req.body;
	
		const updatedAddress = address.map(address => ({
			address,
			timestamp: Date.now()
		}));

		const updatedTracking = await Tracking.findByIdAndUpdate(
			trackingId,
			{ $push: { address: { $each: updatedAddress } }, driver_name, driver_phone_number },
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
		/* for pagination */
		let { limit = 3, page = 1, status } = req.query;
        limit = parseInt(limit);
        page = parseInt(page);
        const skip = (page - 1) * limit;

		const { address, quotationType, driver_name } = req.query;
	
		/* initiate filter */
		const filters = {};
		if (address) filters.address = address;
		if (quotationType) filters.quotationType = quotationType;
		if (driver_name) filters.driver_name = driver_name;

		/* count total data */
		const totalCount = await Tracking.countDocuments(filters);
		const totalPages = Math.ceil(totalCount / limit);
  
		/* get data */
	  	const trackingList = await Tracking.find(filters)
			.populate({ path: "user", model: "User" })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);
		
		/* return response */
	  	return apiResponse.successResponseWithData(
			res,
			"Tracking list retrieved successfully.", 
			{
				trackingList,
				totalPages,
				currentPage: page,
				perPage: limit,
				totalCount
			}
		);
	} catch (error) {
	  	return apiResponse.ErrorResponse(res, error.message);
	}
};

exports.fetchTrackingList = async (req, res) => {
    try {
        const quotationType = req.query.quotationType;
        const quotationId = req.query.quotationId;
        const userId = req.query.userId;

        const trackingList = await Tracking.find({
            quotationType: quotationType,
            quotationId: quotationId,
			user: userId
        });

        return apiResponse.successResponseWithData(res, "Tracking list:", trackingList);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

  