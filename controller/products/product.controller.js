const logger = require("../../helpers/logger");
const apiResponse = require("../../helpers/apiResponse");
const Product = require('../../models/product/product.schema');
const path = require('path');

//create new Products
exports.addNewProducts = async (req, res, next) => {
    try {
        let { title, description, product_price } = req.body;
        console.log(req.file.path)


        const product = new Product({
            title,
            description,
            product_image: req.file.path,
            product_image_type: req.file.mimetype,
            product_price
        });
        const savedProduct = await product.save();
        if (savedProduct) {
            logger.log("info", { fileName: path.basename(__filename), mesage: 'File uploaded Successfully' });
            return apiResponse.successResponseWithData(res, "Product Added Succesfully", savedProduct)

        } else {
            logger.log("warn", { fileName: path.basename(__filename), err });
            return apiResponse.ErrorResponse(res, err.message)
        }
    }
    catch (err) {
        logger.error(err);
        return apiResponse.ErrorResponse(res, err.message);
    }
};


//Update products
exports.updateProducts = async (req, res, next) => {
    try {
        let { id } = req.params;
        let { title, description, product_price } = req.body;
        const product = await Product.findByIdAndUpdate(id, { title, description, product_price }, { new: true });
        if (!product) {
            return apiResponse.ErrorResponse(res, "Data not updated")
        }
        else {
            return apiResponse.successResponseWithData(res, "Data updated Successfully", product)
        }
    }
    catch (err) {
        logger.error(err);
        return apiResponse.ErrorResponse(res, err.message);
    }
};

//Delete products
exports.deleteProducts = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return apiResponse.ErrorResponse(res, 'Product not found')
        } else {
            return apiResponse.successResponse(res, "Product Deleted Succesfully")
        }
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message)
    }
};

//get all products
exports.getAllProducts = async (req, res, next) => {
    try {
        const product_list = await Product.find();
        return apiResponse.successResponseWithData(res, "Product_list", product_list, product_list.length);

    } catch (error) {
        logger.error(error);
        return apiResponse.ErrorResponse(res, error.message)
    }
}

//Get the specific Product
exports.getSpecificProducts = async (req, res, next) => {
    try {
        let { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return apiResponse.ErrorResponse(res, "Sorry no product present")
        }
        else {
            return apiResponse.successResponseWithData(res, "Product_list", product);
        }
    } catch (error) {
        logger.error(error);
        return apiResponse.ErrorResponse(res, error.message)
    }
}