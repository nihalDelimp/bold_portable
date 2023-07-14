const Inventory = require('../../models/inventory/inventory.schema');
const apiResponse = require("../../helpers/apiResponse");
const mailer = require("../../helpers/nodemailer");
const qrcode = require('qrcode');
const { v4: UUIDV4 } = require('uuid');
exports.saveNewGeneratedQrCOde = async (req, res) => {
    try {
        const { productName, description, category, quantity, gender } = req.body;

        const savedInventories = [];

        for (let i = 0; i < quantity; i++) {
            const inventoryNumber = i + 1;
            const uniqueId = UUIDV4(); // Generate a unique identifier

            const scanningValue = `${productName}-${uniqueId}-${category.join('-')}-${gender}`;

            // Create a new inventory instance
            const inventory = new Inventory({
                productName,
                description,
                category: Array.isArray(category) ? category : [category],
                quantity: 1, // Set quantity as 1 for each inventory
                gender,
                qrCode: await generateQRCode(scanningValue) // Generate and assign unique QR code
            });

            // Save the inventory record
            const savedInventory = await inventory.save();
            savedInventories.push(savedInventory);
        }

        return apiResponse.successResponseWithData(res, 'Inventories saved successfully', savedInventories);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

async function generateQRCode(scanningValue) {
    // Generate QR code and return the QR code image
    const qrCodeUrl = scanningValue;
    const qrCodeImage = await qrcode.toDataURL(qrCodeUrl);
    return qrCodeImage;
}




exports.getQrCodeDetails = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Current page number (default: 1)
        const limit = parseInt(req.query.limit) || 10; // Number of items per page (default: 10)

        // Calculate the number of documents to skip
        const skip = (page - 1) * limit;

        // Find inventory items with pagination
        const inventory = await Inventory.find()
            .skip(skip)
            .limit(limit)
            .exec();

        if (inventory.length === 0) {
            return apiResponse.notFoundResponse(res, 'Inventory not found');
        }

        return apiResponse.successResponseWithData(res, 'Inventory details', inventory);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.assignQrCodeToQuote = async (req, res) => {
    try {
        const { _ids, quoteId, quoteType } = req.body;

        // Find the inventories by IDs
        const inventories = await Inventory.find({ _id: { $in: _ids } });

        if (!inventories || inventories.length === 0) {
            return apiResponse.notFoundResponse(res, 'Inventories not found');
        }

        // Loop through each inventory and update the quote_id, quote_type, and status fields
        for (let i = 0; i < inventories.length; i++) {
            const inventory = inventories[i];

            // Check if the inventory is already assigned to an active quotation
            if (inventory.status === 'active') {
                return apiResponse.ErrorResponse(res, 'Inventory is already assigned to an active quotation');
            }

            // Update the quote_id, quote_type, and status fields
            inventory.quote_id = quoteId;
            inventory.quote_type = quoteType;
            inventory.status = 'active';

            // Generate and assign the QR code
            inventory.qrCode = await generateQRCode(inventory._id.toString());

            // Save the updated inventory
            await inventory.save();
        }

        return apiResponse.successResponse(res, 'QR codes assigned and inventory updated');
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};



exports.getQrCodesByStatus = async (req, res) => {
    try {
        const { status, page, limit } = req.query;

        const pageNumber = parseInt(page) || 1; // Current page number
        const limitNumber = parseInt(limit) || 10; // Number of items per page

        // Calculate the number of documents to skip
        const skip = (pageNumber - 1) * limitNumber;

        // Find QR codes with the provided status and apply pagination
        const qrCodes = await Inventory.find({ status })
            .skip(skip)
            .limit(limitNumber)
            .select('qrCode')
            .exec();

        if (!qrCodes || qrCodes.length === 0) {
            return apiResponse.notFoundResponse(res, 'No QR codes found');
        }

        return apiResponse.successResponseWithData(res, 'QR codes fetched successfully', qrCodes, qrCodes.length);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

