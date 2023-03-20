const Order = require('../../models/order/order.schema');
const apiResponse = require("../../helpers/apiResponse");
const logger = require("../../helpers/logger");

exports.createOrder = async (req, res) => {
    try {
        const { userId, products } = req.body;
        console.log(userId, products, "helooo")
        // Calculate the total price of the order
        const totalPrice = products.reduce((total, product) => {
            return total + product.product_quantity * product.product_price;
        }, 0);

        // Create a new order document
        const newOrder = new Order({
            user: userId,
            products: products.map(product => ({
                product: product.productId,
                product_quantity: product.product_quantity,
                product_price: product.product_quantity * product.product_price
            })),
            total_price: totalPrice
        });

        // Save the new order document
        const savedOrder = await newOrder.save();

        return apiResponse.successResponseWithData(res, 'Order created successfully', savedOrder);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.getOrderDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        // Find all orders for the specified user
        const orders = await Order.find({ user: userId });

        return apiResponse.successResponseWithData(res, 'Order fetched successfully', orders);

    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message)

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

