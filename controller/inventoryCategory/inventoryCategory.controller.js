const Inventory_management = require('../../models/inventory_management/inventory_management.schema');
const apiResponse = require("../../helpers/apiResponse");

exports.saveCategoryAndType = async (req, res) => {
    try {
        const { id, category, types } = req.body;
        console.log(id)
        // Check if the request body contains the inventory ID
        if (!id) {
            // If no ID is provided, create a new inventory
            const newInventory = new Inventory_management({ category, types });
            const savedInventory = await newInventory.save();
            return apiResponse.successResponseWithData(res, 'New inventory created successfully', savedInventory);
        }

        // Find the inventory by its ID
        const existingInventory = await Inventory_management.findById({ _id: id });

        if (existingInventory) {
            // If the inventory exists, update it with the new 'category' and 'types'
            existingInventory.category = category;
            existingInventory.types = types;
            await existingInventory.save();
            return apiResponse.successResponseWithData(res, 'Inventory Category and types updated successfully', existingInventory);
        } else {
            // If the inventory doesn't exist, create a new inventory and save it
            const newInventory = new Inventory_management({ category, types });
            const savedInventory = await newInventory.save();
            return apiResponse.successResponseWithData(res, 'New inventory created successfully', savedInventory);
        }
    } catch (error) {
        console.log(error.message);
        return apiResponse.ErrorResponse(res, error.message);
    }
};



exports.getCompleteDetails = async (req, res) => {
    try {
        let { limit = 3, page = 1 } = req.query;
        limit = parseInt(limit);
        page = parseInt(page);
        const skip = (page - 1) * limit;

        const totalCategories = await Inventory_management.countDocuments();
        const categories = await Inventory_management.find()
            .skip(skip)
            .limit(limit);

        const response = {
            categories,
            currentPage: page,
            totalPages: Math.ceil(totalCategories / limit),
            totalCategories,
        };

        return apiResponse.successResponseWithData(res, 'InventoryCategory list retrieved successfully', response);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};
