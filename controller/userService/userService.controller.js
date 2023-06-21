const UserService = require('../../models/userServices/userServices.schema');
const apiResponse = require("../../helpers/apiResponse");
const Notification = require('../../models/notification/notification.schema');
const { server } = require('../../server');
const io = require('socket.io')(server);

exports.save = async (req, res) => {
	try {

		const { service, serviceTypes, quotationId, quotationType } = req.body;

		// Create a new UserServices instance with the extracted data
		const newUserServices = new UserService({
			user: req.userData.user,
			service,
			serviceTypes,
			quotationId,
			quotationType
		});

		// Save the new UserServices instance to the database
		const savedUserServices = await newUserServices.save();

		// Save the new Notification for Admmin panel 
		const notification = new Notification({
			user: req.userData.user,
			quote_type: quotationType,
			quote_id: quotationId,
			type: "SERVICE_REQUEST",
			status_seen: false
		  });
		  await notification.save();

		io.emit("user_service_saved", { savedUserServices });

		return apiResponse.successResponseWithData(
			res,
			"Data saved successfully.",
			savedUserServices
		);
	} catch (error) {
		return apiResponse.ErrorResponse(res, error.message);
	}
};

exports.getAllUserServices = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1; 
		const limit = parseInt(req.query.limit) || 10;

		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;

		const totalDocuments = await UserService.countDocuments();

		const userServices = await UserService.find()
			.sort({ createdAt: -1 })
			.skip(startIndex)
			.limit(limit);

		const pagination = {
			currentPage: page,
			totalPages: Math.ceil(totalDocuments / limit),
			totalDocuments: totalDocuments
		};

		return apiResponse.successResponseWithData(
			res,
			"List of UserServices retrieved successfully.",
			{ userServices, pagination }
		);
	} catch (error) {
		return apiResponse.ErrorResponse(res, error.message);
	}
};
  
  