const logger = require("../../helpers/logger");
const db = require('../../models/index');
const apiResponse = require("../../helpers/apiResponse");
const path = require('path');

const Product = db.product;

//create new users
exports.addNewProducts = async (req, res, next) => {
    try {
        let { title, description, product_price } = req.body;
        console.log(req.file.path)
        await Product.create({
            title,
            description,
            product_image: req.file.path,
            product_image_type: req.file.mimetype,
            product_price
        }).then(data => {
            logger.log("info", { fileName: path.basename(__filename), mesage: 'File uploaded Successfully' });
            return apiResponse.successResponseWithData(res, "Data_created", data)
        }).catch(err => {
            logger.log("warn", { fileName: path.basename(__filename), err });
            return apiResponse.ErrorResponse(res, err.message)
        })
    }
    catch (err) {
        logger.error(err);
        return apiResponse.ErrorResponse(res, err.message);
    }
};

//Login for users
exports.getAllProducts = async (req, res, next) => {
    try {
        const product_list = await Product.findAll();
        return apiResponse.successResponseWithData(res, "Product_list", product_list, product_list.length);

    } catch (error) {
        logger.error(error);
        return apiResponse.ErrorResponse(res, error.message)
    }
}