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


//Update products
exports.updateProducts = async (req, res, next) => {
    try {
        let { id } = req.params
        console.log(id)
        let { title, description, product_price } = req.body;
        console.log(req.file.path);
        if (id) {
            await Product.update(
                {
                    title,
                    description,
                    product_price,
                    product_image: req.file.path,
                    product_image_type: req.file.mimetype,
                }, { where: { id } },
            )
                .then(num => {
                    if (num <= 1) {
                        return apiResponse.successResponse(res, "Data updated Successfully")
                    } else {
                        return apiResponse.ErrorResponse(res, "Data not updated")
                    }
                }
                ).catch(err => {
                    return apiResponse.ErrorResponse(err, "Some Unexpected error occured")
                });
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
        if (id) {
            await Product.destroy({
                where: { id }
            }).then(num => {
                if (num == 1) {
                    res.send({
                        status: 1,
                        message: "Data_Deleted"
                    });
                } else {
                    res.send({
                        status: 0,
                        message: "Data_not_deleted"
                    });
                }
            })
                .catch(err => {
                    res.status(500).send({
                        status: 0,
                        message: "Data_not_deleted_error"
                    });
                });
        }
        else {
            console.log("He")
            // return apiResponse.ErrorResponse(res, error.message)
        }
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message)
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

//Get the specific Product
exports.getSpecificProducts = async (req, res, next) => {
    try {
        let { id } = req.params;
        let specific_product_list = await Product.findOne({ where: { id } });
        if (specific_product_list === null) {
            return apiResponse.ErrorResponse(res, "Sorry no data present")

        } else {

            return apiResponse.successResponseWithData(res, "Product_list", specific_product_list);
        }

    } catch (error) {
        logger.error(error);
        return apiResponse.ErrorResponse(res, error.message)
    }
}