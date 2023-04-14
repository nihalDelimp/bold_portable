const Construction = require('../../models/construction/construction.schema');
const apiResponse = require("../../helpers/apiResponse");
const logger = require("../../helpers/logger");
const { server } = require('../../server');
const io = require('socket.io')(server);

exports.createSpecificQuotation = async (req, res) => {
    try {
        const {
            coordinator: { name, email, cellNumber },
            maxWorkers,
            weeklyHours,
            placementDate,
            restrictedAccess,
            placementLocation,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            useAtNight,
            useInWinter,
            deliveredPrice,
            specialRequirements,
        } = req.body;

        // Calculate the total number of hours
        const totalHours = maxWorkers * weeklyHours;

        // Calculate the number of units required
        const numUnits = Math.ceil(totalHours / 400);

        // Determine the service frequency
        let serviceFrequency = "Once per week";
        if (numUnits > 1) {
            serviceFrequency = `${numUnits} units serviced once per week`;
        }

        // Calculate delivered price
        let updatedDeliveredPrice = deliveredPrice;
        if (distanceFromKelowna > 10) {
            const additionalDistance = distanceFromKelowna - 10;
            updatedDeliveredPrice = deliveredPrice + additionalDistance * serviceCharge;
        }

        // Construct the quotation object
        const quotation = {
            coordinator: {
                name,
                email,
                cellNumber,
            },
            maxWorkers,
            weeklyHours,
            placementDate,
            restrictedAccess,
            placementLocation,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            deliveredPrice: updatedDeliveredPrice,
            useAtNight,
            useInWinter,
            specialRequirements,
            numUnits,
            serviceFrequency,
        };

        // Create a new Construction instance with the quotation object as properties
        const construction = new Construction(quotation);

        // Save the construction instance
        await construction.save();

        return apiResponse.successResponseWithData(
            res,
            "Quotation has been created successfully",
            construction
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};



// exports.createSpecificEventQuotation = async (req, res) => {
//     try {
//         const {
//             coordinator: { name, email, cellNumber },
//             maxWorkers,
//             weeklyHours,
//             placementDate,
//             restrictedAccess,
//             placementLocation,
//             useAtNight,
//             useInWinter,
//             specialRequirements,
//         } = req.body;

//         // Calculate the total number of hours
//         const totalHours = maxWorkers * weeklyHours;

//         // Calculate the number of units required
//         const numUnits = Math.ceil(totalHours / 400);

//         // Determine the service frequency
//         let serviceFrequency = "Once per week";
//         if (numUnits > 1) {
//             serviceFrequency = `${numUnits} units serviced once per week`;
//         }

//         // Construct the quotation object
//         const quotation = {
//             coordinator: {
//                 name,
//                 email,
//                 cellNumber,
//             },
//             maxWorkers,
//             weeklyHours,
//             placementDate,
//             restrictedAccess,
//             placementLocation,
//             useAtNight,
//             useInWinter,
//             specialRequirements,
//             numUnits,
//             serviceFrequency,
//         };

//         // Create a new Construction instance with the quotation object as properties
//         const construction = new Construction(quotation);

//         // Save the construction instance
//         await construction.save();

//         return apiResponse.successResponseWithData(
//             res,
//             "Quotation has been created successfully",
//             construction
//         );
//     } catch (error) {
//         return apiResponse.ErrorResponse(res, error.message);
//     }
// };

