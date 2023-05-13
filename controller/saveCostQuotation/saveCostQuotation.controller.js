const CostManagement = require('../../models/costManagement/costManagement.schema');
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
const config = require('../../config/config');

exports.createCostManagement = async (req, res) => {
    console.log(await config.getQuotationTypesConfig(req.body.quotationType));
    try {
        const costManagement = new CostManagement({
            user: req.userData.user._id,
            quotationType: req.body.quotationType,
            quotationId: req.body.quotationId,
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

        const savedCostManagement = await costManagement.save();

        io.emit("cost_management", { costManagement, savedCostManagement });

        return apiResponse.successResponseWithData(
            res,
            "Data saved successfully.",
            savedCostManagement
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};