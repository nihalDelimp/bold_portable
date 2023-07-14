const Inventory = require('../../models/inventory/inventory.schema');
const apiResponse = require("../../helpers/apiResponse");
const mailer = require("../../helpers/nodemailer");
const qrcode = require('qrcode');

exports.save = async (req, res) => {
    try {
        const { productName, description, price, category, quantity, quote_type, quote_id } = req.body;

        // Create a new inventory instance
        const inventory = new Inventory({
            productName,
            description,
            price,
            category,
            quantity,
            quote_type,
            quote_id,
        });

        // Save the inventory record
        const savedInventory = await inventory.save();

        // Generate QR code URL with the saved inventory's _id
        const qrCodeUrl = process.env.APP_URL + '/inventory/show?inventoryId=' + savedInventory._id.toString();

        // Generate QR code
        const qrCodeImage = await qrcode.toDataURL(qrCodeUrl);

        // Update the inventory with the generated QR code
        savedInventory.qrCode = qrCodeImage;
        await savedInventory.save();

        return apiResponse.successResponseWithData(res, 'Inventory saved successfully', savedInventory);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.show = async (req, res) => {
    try {
        const inventoryId = req.query.inventoryId;

        // Find inventory by ID
        const inventory = await Inventory.findById(inventoryId);

        if (!inventory) {
            return apiResponse.notFoundResponse(res, 'Inventory not found');
        }

        return apiResponse.successResponseWithData(res, 'Inventory detail', inventory);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};
