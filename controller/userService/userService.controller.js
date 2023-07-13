const UserService = require('../../models/userServices/userServices.schema');
const apiResponse = require("../../helpers/apiResponse");
const Notification = require('../../models/notification/notification.schema');
const { server } = require('../../server');
const DisasterRelief = require('../../models/disasterRelief/disasterRelief.schema');
const PersonalOrBusiness = require('../../models/personalOrBusiness/personal_or_business_site.schema');
const FarmOrchardWinery = require('../../models/farm_orchard_winery/farm_orchard_winery.schema');
const Construction = require('../../models/construction/construction.schema');
const io = require('socket.io')(server);

exports.save = async (req, res) => {
	try {

		const { service, serviceTypes, quotationId, quotationType, email, phone, name, address, coordinates, status } = req.body;
		let images = [];

		if (req.files) {
            // multiple files uploaded
            images = req.files.map(file => ({
                image_path: file.path,
                image_type: file.mimetype
            }));
        } else {
            // single file uploaded
            images.push({
                image_path: req.file.path,
                image_type: req.file.mimetype
            });
        }

		let quotation;
		switch (quotationType) {
			case 'event':
				quotation = await Event.findOne({ _id: quotationId }).populate({ path: "user", model: "User" });
				break;
			case 'farm-orchard-winery':
				quotation = await FarmOrchardWinery.findOne({ _id: quotationId }).populate({ path: "user", model: "User" });
				break;
			case 'personal-or-business':
				quotation = await PersonalOrBusiness.findOne({ _id: quotationId }).populate({ path: "user", model: "User" });
				break;
			case 'disaster-relief':
				quotation = await DisasterRelief.findOne({ _id: quotationId }).populate({ path: "user", model: "User" });

				break;
			case 'construction':
				quotation = await Construction.findOne({ _id: quotationId }).populate({ path: "user", model: "User" });
				break;
			default:
				throw new Error(`Quotation type '${quotationType}' not found`).populate({ path: "user", model: "User" });
		}

		// Create a new UserServices instance with the extracted data
		const newUserServices = new UserService({
			 user: quotation.user,
			service,
			serviceTypes,
			quotationId,
			quotationType,
			email,
			phone,
			name,
			address,
			coordinates,
			status,
			images
		});

		// Save the new UserServices instance to the database
		const savedUserServices = await newUserServices.save();

	//	Save the new Notification for Admmin panel 
		const notification = new Notification({
			user: quotation.user,
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
  
  