const Construction = require('../../models/construction/construction.schema');
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

exports.createConstructionQuotation = async (req, res) => {
    try {
        const { _id } = req.userData.user;
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
            special_requirements,
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
            user: _id,
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
            special_requirements,
            numUnits,
            serviceFrequency,
        };

        // Create a new Construction instance with the quotation object as properties
        const construction = new Construction(quotation);

        // Save the construction instance
        await construction.save();


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

exports.createDisasterReliefQuotation = async (req, res) => {
    try {
        const { _id } = req.userData.user;
        const {
            disasterNature,
            coordinator: { name, email, cellNumber },
            maxWorkers,
            weeklyHours,
            placementDate,
            placementLocation,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            hazards,
            useAtNight,
            useInWinter,
            special_requirements,
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

        // Calculate the delivered price
        let deliveredPrice = 0;
        if (distanceFromKelowna > 10) {
            deliveredPrice = (distanceFromKelowna - 10) * serviceCharge;
        }

        // Construct the quotation object
        const quotation = {
            user: _id,
            disasterNature,
            coordinator: {
                name,
                email,
                cellNumber,
            },
            placementDate,
            placementLocation,
            maxWorkers,
            weeklyHours,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            deliveredPrice,
            hazards,
            useAtNight,
            useInWinter,
            special_requirements,
            numUnits,
            serviceFrequency
        };

        // Create a new DisasterRelief instance with the quotation object as properties
        const disasterRelief = new DisasterRelief(quotation);

        // Save the disaster relief instance
        await disasterRelief.save();

        const notification = new Notification({
            user: quotation.user,
            quote_type: "disaster-relief",
            quote_id: disasterRelief._id,
            type: "CREATE_QUOTE",
            status_seen: false
        });
        await notification.save();
        return apiResponse.successResponseWithData(
            res,
            "Quotation has been created successfully",
            disasterRelief
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.createPersonalOrBusinessQuotation = async (req, res) => {
    try {
        const { _id } = req.userData.user;
        const {
            useType,
            coordinator: { name, email, cellNumber },
            maxWorkers,
            weeklyHours,
            placementDatetime,
            placement_location,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            nightUse,
            winterUse,
            special_requirements,
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

        // Calculate the delivered price
        let deliveredPrice = 0;
        if (distanceFromKelowna > 10) {
            deliveredPrice = (distanceFromKelowna - 10) * serviceCharge;
        }

        // Construct the PersonalOrBusiness object
        const personalOrBusiness = new PersonalOrBusiness({
            user: _id,
            useType,
            coordinator: {
                name,
                email,
                cellNumber,
            },
            maxWorkers,
            weeklyHours,
            placement_datetime: placementDatetime,
            placement_location,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            deliveredPrice,
            useAtNight: nightUse, 
            useInWinter: winterUse,
            special_requirements: specialRequirements,
            numUnits,
            serviceFrequency
        });

        // Save the PersonalOrBusiness instance
        await personalOrBusiness.save();

        const notification = new Notification({
            user: personalOrBusiness.user,
            quote_type: "personal-or-business",
            quote_id: personalOrBusiness._id,
            type: "CREATE_QUOTE",
            status_seen: false
        });
        await notification.save();
        return apiResponse.successResponseWithData(
            res,
            "PersonalOrBusiness instance has been created successfully",
            personalOrBusiness
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.createFarmOrchardWineryQuotation = async (req, res) => {
    try {
        const { _id } = req.userData.user;
        const {
            useType,
            coordinator: { name, email, cellNumber },
            maxWorkers,
            weeklyHours,
            placement_datetime,
            placement_location,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            night_use,
            winter_use,
            special_requirements,
        } = req.body;

        // Calculate the total number of hours
        const totalHours = maxWorkers * weeklyHours;

        // Calculate the number of units required
        const numUnits = Math.ceil(totalHours / 400);
        console.log(numUnits, "Jskjak")
        // Determine the service frequency
        let serviceFrequency = "Once per week";
        if (numUnits > 1) {
            serviceFrequency = `${numUnits} units serviced once per week`;
        }

        // Calculate the delivered price
        let deliveredPrice = 0;
        if (distanceFromKelowna > 10) {
            deliveredPrice = (distanceFromKelowna - 10) * serviceCharge;
        }

        // Construct the FarmOrchardWinery object
        const farmOrchardWinery = new FarmOrchardWinery({
            user: _id,
            useType,
            coordinator: {
                name,
                email,
                cellNumber,
            },
            maxWorkers,
            weeklyHours,
            placement_datetime,
            placement_location,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            deliveredPrice,
            useAtNight: night_use, 
            useInWinter: winter_use,
            special_requirements,
            numUnits,
            serviceFrequency
        });

        // Save the FarmOrchardWinery instance
        await farmOrchardWinery.save();

        const notification = new Notification({
            user: farmOrchardWinery.user,
            quote_id: farmOrchardWinery._id,
            quote_type: "farm-orchard-winery",
            type: "CREATE_QUOTE",
            status_seen: false
        });
        await notification.save();

        return apiResponse.successResponseWithData(
            res,
            "FarmOrchardWinery instance has been created successfully",
            farmOrchardWinery
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.createEventQuotation = async (req, res) => {
    try {
        const { _id } = req.userData.user;
        const {
            eventDetails: { eventName, eventDate, eventType, eventLocation, eventMapLocation },
            coordinator: { name, email, cellNumber },
            maxWorkers,
            weeklyHours,
            placement_datetime,
            placement_location,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            night_use,
            winter_use,
            special_requirements,
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

        // Calculate the delivered price
        let deliveredPrice = 0;
        if (distanceFromKelowna > 10) {
            deliveredPrice = (distanceFromKelowna - 10) * serviceCharge;
        }

        // Construct the Event object
        const event = new Event({
            user: _id,
            coordinator: {
                name,
                email,
                cellNumber,
            },
            maxWorkers,
            weeklyHours,
            placement_datetime,
            placement_location,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            deliveredPrice,
            night_use,
            winter_use,
            special_requirements,
            numUnits,
            serviceFrequency,
            eventDetails: {
                eventName,
                eventDate,
                eventType,
                eventLocation,
                eventMapLocation
            }
        });

        // Save the Event instance
        await event.save();
        const notification = new Notification({
            user: event.user,
            quote_type: "event",
            quote_id: event._id,
            type: "CREATE_QUOTE",
            status_seen: false
        });
        await notification.save();
        return apiResponse.successResponseWithData(
            res,
            "Event instance has been created successfully",
            event
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.getAllQuotation = async (req, res) => {
    try {
        const { quotationType } = req.params;
        console.log(quotationType)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        let quotations;
        switch (quotationType) {
            case 'event':
                quotations = await Event.find()
                    .skip((page - 1) * limit)
                    .limit(limit);
                break;
            case 'farm-orchard-winery':
                quotations = await FarmOrchardWinery.find()
                    .skip((page - 1) * limit)
                    .limit(limit);
                break;
            case 'personal-or-business':
                quotations = await PersonalOrBusiness.find()
                    .skip((page - 1) * limit)
                    .limit(limit);
                break;
            case 'disaster-relief':
                quotations = await DisasterRelief.find()
                    .skip((page - 1) * limit)
                    .limit(limit);
                break;
            case 'construction':
                quotations = await Construction.find()
                    .skip((page - 1) * limit)
                    .limit(limit);
                break;
            default:
                throw new Error(`Quotation type '${quotationType}' not found`);
        }

        const quotationTypeFormatted = quotationType.replace(/-/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');

        const QuotationModel = mongoose.model(quotationTypeFormatted);

        const count = await QuotationModel.countDocuments();
        return apiResponse.successResponseWithData(
            res,
            "Quotations retrieved successfully",
            {
                quotations: quotations,
                page: page,
                pages: Math.ceil(count / limit),
                total: count
            }
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.getAllQuotationForUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const quotations = await Promise.all([
            Event.find(),
            FarmOrchardWinery.find(),
            PersonalOrBusiness.find(),
            DisasterRelief.find(),
            Construction.find(),
        ]).then(([events, farmOrchardWineries, personalOrBusinesses, disasterReliefs, constructions]) => {
            return [
                ...events.map(event => ({ ...event.toObject(), type: 'event' })),
                ...farmOrchardWineries.map(farmOrchardWinery => ({ ...farmOrchardWinery.toObject(), type: 'farm-orchard-winery' })),
                ...personalOrBusinesses.map(personalOrBusiness => ({ ...personalOrBusiness.toObject(), type: 'personal-or-business' })),
                ...disasterReliefs.map(disasterRelief => ({ ...disasterRelief.toObject(), type: 'disaster-relief' })),
                ...constructions.map(construction => ({ ...construction.toObject(), type: 'construction' })),
            ];
        });

        const count = await Event.countDocuments()
            + await FarmOrchardWinery.countDocuments()
            + await PersonalOrBusiness.countDocuments()
            + await DisasterRelief.countDocuments()
            + await Construction.countDocuments();

        return apiResponse.successResponseWithData(
            res,
            "Quotations retrieved successfully",
            {
                quotations: quotations.slice((page - 1) * limit, page * limit),
                page: page,
                pages: Math.ceil(count / limit),
                total: count
            }
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.getSpefcificQuotationQuoteId = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const quoteId = req.body.quote_id;

        const quotations = await Promise.all([
            Event.findOne({ _id: quoteId }),
            FarmOrchardWinery.findOne({ _id: quoteId }),
            PersonalOrBusiness.findOne({ _id: quoteId }),
            DisasterRelief.findOne({ _id: quoteId }),
            Construction.findOne({ _id: quoteId }),
        ]).then(([event, farmOrchardWinery, personalOrBusiness, disasterRelief, construction]) => {
            const quotations = [];
            if (event) {
                quotations.push({ ...event.toObject(), type: 'event' });
            }
            if (farmOrchardWinery) {
                quotations.push({ ...farmOrchardWinery.toObject(), type: 'farm-orchard-winery' });
            }
            if (personalOrBusiness) {
                quotations.push({ ...personalOrBusiness.toObject(), type: 'personal-or-business' });
            }
            if (disasterRelief) {
                quotations.push({ ...disasterRelief.toObject(), type: 'disaster-relief' });
            }
            if (construction) {
                quotations.push({ ...construction.toObject(), type: 'construction' });
            }
            return quotations;
        });

        if (quotations.length === 0) {
            return apiResponse.notFoundResponse(res, 'Quotation not found');
        }

        return apiResponse.successResponseWithData(
            res,
            "Quotation retrieved successfully",
            {
                quotation: quotations[0],
            }
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};
