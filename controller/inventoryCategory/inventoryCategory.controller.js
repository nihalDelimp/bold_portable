const InventoryCategory = require('../../models/inventoryCategory/inventoryCategory.schema');
const apiResponse = require("../../helpers/apiResponse");

exports.save = async (req, res) => {
    try {
        const { name } = req.body;

        const inventoryCategory = new InventoryCategory({
            name,
        });

        const savedInventoryCategory = await inventoryCategory.save();

        return apiResponse.successResponseWithData(res, 'InventoryCategory saved successfully', savedInventoryCategory);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.list = async (req, res) => {
    try {
        let { limit = 3, page = 1 } = req.query;
        limit = parseInt(limit);
        page = parseInt(page);
        const skip = (page - 1) * limit;

        const totalCategories = await InventoryCategory.countDocuments();
        const categories = await InventoryCategory.find()
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
