const Order = require('../../models/order/order.schema');
const Product = require('../../models/product/product.schema');
const apiResponse = require("../../helpers/apiResponse");
const logger = require("../../helpers/logger");
const Notification = require('../../models/notification/notification.schema');

exports.createOrder = async (req, res) => {
    try {
        const { userId, products, address, location } = req.body;
        console.log(req.body)
        const orderedProducts = [];
        for (const { productId, product_quantity, product_price } of products) {
            const productDetails = await Product.findById(productId);
            if (!productDetails) {
                throw new Error(`Product with id ${productId} not found`);
            }
            orderedProducts.push({
                product: productDetails._id,
                product_quantity,
                product_price
            });
        }

        // Calculate the total price of the order
        const totalPrice = orderedProducts.reduce((total, product) => {
            return total + product.product_quantity * product.product_price;
        }, 0);

        // Create a new order document with user id and ordered products
        const newOrder = new Order({
            user: userId,
            products: orderedProducts,
            total_price: totalPrice,
            address,
            location
        });

        // Save the new order document and populate the product field
        const savedOrder = await newOrder.save();
        const populatedOrder = await Order.findById(savedOrder._id)
            .populate({
                path: 'products.product',
                model: 'Product'
            })
            .populate({
                path: 'user',
                model: 'User',
                select: '-password -user_type -email'
            });

        // Create a new notification document with user id and order id
        const newNotification = new Notification({
            user: userId,
            order: savedOrder._id
        });

        // Save the new notification document
        const savedNotification = await newNotification.save();

        // Return success response with the populated order object
        return apiResponse.successResponseWithData(res, 'Order created successfully', populatedOrder);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.getOrderDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const orders = await Order.find({ user: userId }).populate({
            path: 'products.product',
            model: 'Product'
        });

        return apiResponse.successResponseWithData(res, 'Order fetched successfully', orders);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // Find the order with the specified ID
        const order = await Order.findById(orderId);

        if (!order) {
            return apiResponse.ErrorResponse(res, "Order not found")
        }

        // Update the order status to "cancelled"
        order.status = 'cancelled';
        await order.save();

        return apiResponse.successResponse(res, "Order cancelled succesfully")

    } catch (error) {
        console.error(error);
        return apiResponse.ErrorResponse(res, error.message)
    }
};

