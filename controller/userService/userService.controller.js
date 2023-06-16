const UserService = require('../../models/userServices/userServices.schema');
const apiResponse = require("../../helpers/apiResponse");
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
  