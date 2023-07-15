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
            const uniqueId = UUIDV4(); // Generate a unique identifier

            const scanningValue = `${productName}-${uniqueId}-${category.join('-')}-${gender}`;
            const formattedValue = scanningValue.replace(/\s/g, '');
            // Create a new inventory instance
            const inventory = new Inventory({
                productName,
                description,
                category: Array.isArray(category) ? category : [category],
                quantity: 1, // Set quantity as 1 for each inventory
                gender,
                qrCodeValue: formattedValue,
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
    const formattedValue = scanningValue.replace(/\s/g, '');
    const qrCodeUrl = encodeURIComponent(formattedValue);
    const qrCodeImage = await qrcode.toDataURL(qrCodeUrl);
    console.log(formattedValue)
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

        // Check if any inventory is already assigned to an active quotation
        const isAnyActive = inventories.some((inventory) => inventory.status === 'active');
        if (isAnyActive) {
            return apiResponse.ErrorResponse(res, 'One or more inventories are already assigned to an active quotation');
        }

        // Loop through each inventory and update the quote_id, quote_type, and status fields
        for (let i = 0; i < inventories.length; i++) {
            const inventory = inventories[i];

            // Update the quote_id, quote_type, and status fields
            inventory.quote_id = quoteId;
            inventory.quote_type = quoteType;
            inventory.status = 'active';

            // Append the quoteType and quoteId to the existing qrCodeValue
            const updatedQrCodeValue = `${inventory.qrCodeValue}-${quoteType}-${quoteId}`;

            // Generate and assign the updated QR code
            inventory.qrCode = await generateQRCode(updatedQrCodeValue);

            // Update the qrCodeValue field with the updated QR code value
            inventory.qrCodeValue = updatedQrCodeValue;

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
        const [qrCodes, totalCount] = await Promise.all([
            Inventory.find({ status })
                .skip(skip)
                .limit(limitNumber)
                .select('qrCode')
                .exec(),
            Inventory.countDocuments({ status })
        ]);

        if (!qrCodes || qrCodes.length === 0) {
            return apiResponse.notFoundResponse(res, 'No QR codes found');
        }

        const result = {
            qrCodes,
            totalCount
        };

        return apiResponse.successResponseWithData(res, 'QR codes fetched successfully', result);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.getQrCodesByQuotation = async (req, res) => {
    try {
        const { quoteId, quoteType } = req.params;
        console.log(quoteId, quoteType)

        // Find QR codes with the provided quotation ID and quotation type
        const qrCodes = await Inventory.find({ quote_id: quoteId, quote_type: quoteType })
            .select('qrCode')
            .exec();

        if (!qrCodes || qrCodes.length === 0) {
            return apiResponse.notFoundResponse(res, 'No QR codes found for the given quotation');
        }

        return apiResponse.successResponseWithData(res, 'QR codes fetched successfully', qrCodes);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};



exports.revertQrCodeValue = async (req, res) => {
    try {
        const { quoteId, quoteType } = req.body;

        // Find the inventories with the provided quoteId and quoteType in the qrCodeValue
        const inventories = await Inventory.find({ qrCodeValue: { $regex: `${quoteType}-${quoteId}$` } });

        if (!inventories || inventories.length === 0) {
            return apiResponse.notFoundResponse(res, 'Inventories not found with the provided quoteId and quoteType');
        }

        // Loop through each inventory and revert the qrCodeValue
        for (let i = 0; i < inventories.length; i++) {
            const inventory = inventories[i];

            // Remove the provided quoteId and quoteType from the qrCodeValue
            const updatedQrCodeValue = inventory.qrCodeValue.replace(`-${quoteType}-${quoteId}`, '');

            // Generate and assign the updated QR code
            inventory.qrCode = await generateQRCode(updatedQrCodeValue);

            // Update the qrCodeValue field with the updated QR code value
            inventory.qrCodeValue = updatedQrCodeValue;

            // Save the updated inventory
            await inventory.save();
        }

        return apiResponse.successResponse(res, 'QR codes reverted and inventory updated');
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

