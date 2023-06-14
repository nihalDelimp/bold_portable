const Service = require('../../models/services/services.schema');
const apiResponse = require("../../helpers/apiResponse");

// exports.save = async (req, res) => {
//     try {
//         const { fullName, phone, postalCode, email, subject, message } = req.body;
        
//         // Create a new instance of the Service model
//         const newService = new Service({
//             fullName,
//             phone,
//             postalCode,
//             email,
//             subject,
//             message
//         });

//         // Save the new service to the database
//         const createdService = await newService.save();
        
//         return apiResponse.successResponseWithData(res, 'Service saved successfully', createdService);
//     } catch (error) {
//         return apiResponse.ErrorResponse(res, error.message);
//     }
// };

exports.save = async (req, res) => {
    try {
        const { name, categories, description } = req.body;

        // Create a new instance of the Service model
        const newService = new Service({
            name,
            categories,
            description,
        });

        // Save the new service to the database
        const savedService = await newService.save();

        return apiResponse.successResponseWithData(
            res,
            'Service saved successfully',
            savedService
        );

    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.getAllServices = async (req, res) => {
    try {
        // Retrieve all services from the database
        const allServices = await Service.find();

        return apiResponse.successResponseWithData(
            res,
            'Services retrieved successfully',
            allServices
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};
  
exports.deleteService = async (req, res) => {
    try {
        const serviceId = req.params.id;
    
        // Check if the service exists
        const service = await Service.findById(serviceId);
        if (!service) {
            return apiResponse.notFoundResponse(res, 'Service not found');
        }
    
        // Delete the service
        await Service.findByIdAndDelete(serviceId);
  
        return apiResponse.successResponse(res, 'Service deleted successfully');
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.updateService = async (req, res) => {
    try {
        const { id } = req.params; // Extract the service ID from the request parameters
        const { name, categories, description } = req.body; // Extract the updated service data from the request body

        // Find the service by ID
        const service = await Service.findById(id);

        // Check if the service exists
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Update the service data
        service.name = name;
        service.categories = categories;
        service.description = description;

        // Save the updated service
        const updatedService = await service.save();

        return res.status(200).json(updatedService);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};