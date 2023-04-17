const logger = require("../../helpers/logger");
const apiResponse = require("../../helpers/apiResponse");
const Notification = require('../../models/notification/notification.schema');


exports.getUnseenNotifications = async (req, res) => {
    try {

        // Get the page number and page size from the query parameters
        const pageNumber = parseInt(req.query.pageNumber) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        console.log(pageNumber, pageSize)

        // Calculate the number of documents to skip based on the page number and page size
        const documentsToSkip = (pageNumber - 1) * pageSize;
        const unseenNotifications = await Notification.find({ status_seen: false, type: "CREATE_ORDER" })
            .populate({
                path: 'order',
                model: 'Order'
            })
            .populate({
                path: 'user',
                model: 'User',
                select: '-password -user_type -email'
            })
            .sort({ createdAt: -1 })
            .skip(documentsToSkip)
            .limit(pageSize);

        return apiResponse.successResponseWithData(res, 'Unseen notifications retrieved successfully', unseenNotifications, unseenNotifications.length);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.getSpecificUnseenNotificationsDeatils = async (req, res) => {
    try {
        const notificationId = req.params.id;

        const specificUnseenNotification = await Notification.findById(notificationId)
            .populate({
                path: 'order',
                model: 'Order'
            })
            .populate({
                path: 'user',
                model: 'User',
                select: '-password -user_type -email'
            });

        if (!specificUnseenNotification) {
            return apiResponse.notFoundResponse(res, 'Notification not found');
        }

        return apiResponse.successResponseWithData(res, 'Specific unseen notification retrieved successfully', specificUnseenNotification);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};



exports.markAllNotificationsAsSeen = async (req, res) => {
    try {
        // Update all the notifications for the user to set status_seen to true
        const updateResult = await Notification.updateMany({ $set: { status_seen: true } });

        // Return a success response with the number of updated documents
        return apiResponse.successResponseWithData(res, `Marked ${updateResult.nModified} notifications as seen`, updateResult);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};




exports.markUserAllNotificationsAsSeen = async (req, res) => {
    try {
        const { _id } = req.userData.user;
        // Update all the notifications for the user to set status_seen to true
        const updateResult = await Notification.updateMany(
            { user: _id }, // Add a filter to match the user's _id
            { $set: { status_seen: true } }
        );

        // Return a success response with the number of updated documents
        return apiResponse.successResponseWithData(res, `Marked ${updateResult.nModified} notifications as seen`, updateResult);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


// Define the patch route callback function in your controller file
exports.markSpecificNotificationsAsSeen = async (req, res) => {
    try {
        const notificationId = req.params.id;

        // Update the specific notification to set status_seen to true
        const updateResult = await Notification.updateOne({ _id: notificationId }, { $set: { status_seen: true } });

        // Return a success response with the updated document
        if (updateResult.nModified === 0) {
            return apiResponse.notFoundResponse(res, 'Notification not found');
        } else {
            const updatedNotification = await Notification.findById(notificationId).populate('order');
            return apiResponse.successResponseWithData(res, 'Notification marked as seen', updatedNotification);
        }
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};



// Get Cancel Order Notification for specific user
exports.getCancelOrderNotifications = async (req, res) => {
    try {
        const { _id } = req.userData.user;
        // Get the page number and page size from the query parameters
        const pageNumber = parseInt(req.query.pageNumber) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        console.log(pageNumber, pageSize)

        // Calculate the number of documents to skip based on the page number and page size
        const documentsToSkip = (pageNumber - 1) * pageSize;
        const cancelOrderNotifications = await Notification.find({ status_seen: false, type: "ORDER_CANCEL", user: _id })
            .populate({
                path: 'order',
                model: 'Order'
            })
            .sort({ createdAt: -1 })
            .skip(documentsToSkip)
            .limit(pageSize);

        return apiResponse.successResponseWithData(res, 'Unseen notifications retrieved successfully', cancelOrderNotifications, cancelOrderNotifications.length);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


// Get Specific Cancel Order Notification for specific user
exports.getSpecificCancelOrderNotifications = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;
        const notification = await Notification.findOne({ _id: notificationId, user: _id, type: "ORDER_CANCEL" })
            .populate({
                path: 'order',
                model: 'Order'
            })

        if (!notification) {
            return apiResponse.ErrorResponse(res, "Notification not found");
        }

        // Mark the notification as seen
        notification.status_seen = true;
        await notification.save();

        return apiResponse.successResponseWithData(res, 'Notification retrieved successfully', notification);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};
