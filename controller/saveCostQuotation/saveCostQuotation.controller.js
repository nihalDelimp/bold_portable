const costManagement = require('../../models/construction/costManagement.schema');
const apiResponse = require("../../helpers/apiResponse");
const logger = require("../../helpers/logger");
const { server } = require('../../server');
const DisasterRelief = require('../../models/disaster_relief/disasterRelief.schema');
const PersonalOrBusiness = require('../../models/personalOrBusiness/personal_or_business_site.schema');
const FarmOrchardWinery = require('../../models/farm_orchard_winery/farm_orchard_winery.schema');
const Event = require('../../models/event/event.schema');
const { default: mongoose } = require('mongoose');
const Notification = require('../../models/notification/notification.schema');
const io = require('socket.io')(server);

exports.createCostManagement = async (req, res) => {
    try {
        const costManagement = new costManagement({
          user: req.user._id, // Assuming that you have user authentication middleware in place that adds the user ID to the request object
          quotationType: req.body.quotationType,
          useAtNightCost: req.body.useAtNightCost,
          useInWinterCost: req.body.useInWinterCost,
          numberOfUnitsCost: req.body.numberOfUnitsCost,
          workersCost: req.body.workersCost,
          workersTypeCost: req.body.workersTypeCost,
          handWashingCost: req.body.handWashingCost,
          handSanitizerPumpCost: req.body.handSanitizerPumpCost,
          twiceWeeklyServicingCost: req.body.twiceWeeklyServicingCost,
          specialRequirementsCost: req.body.specialRequirementsCost,
          deliveryCost: req.body.deliveryCost,
          distanceFromKelownaCost: req.body.distanceFromKelownaCost,
          maxWorkersCost: req.body.maxWorkersCost,
        });
    
        const data = await costManagement.save();
    


        const notification = new Notification({
            user: quotation.user,
            quote_type: "construction",
            quote_id: construction._id,
            type: "CREATE_QUOTE",
            status_seen: false
        });
        await notification.save();

        return apiResponse.successResponseWithData(
            res,
            "Quotation has been created successfully",
            construction
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};