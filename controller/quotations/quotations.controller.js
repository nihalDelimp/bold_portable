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
            designatedWorkers,
            workerTypes,
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
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
            designatedWorkers,
            workerTypes,
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
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

exports.updateConstructionQuotation = async (req, res) => {
    try {
      const { constructionId } = req.params; // Get the construction ID from the request parameters
      const { costDetails } = req.body;
  
      // Find the existing construction document
      const construction = await Construction.findById(constructionId);
  
      if (!construction) {
        return apiResponse.ErrorResponse(res, "Construction document not found.");
      }
  
      // Update the costDetails field
      construction.costDetails = costDetails;
  
      // Save the updated construction document
      await construction.save();
  
      const notification = new Notification({
        user: construction.user,
        quote_type: "construction",
        quote_id: construction._id,
        type: "UPDATE_QUOTE",
        status_seen: false
      });
      await notification.save();
      io.emit("update_quote", { construction });
  
      return apiResponse.successResponseWithData(
        res,
        "Quotation has been updated successfully",
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

exports.updateDisasterReliefQuotation = async (req, res) => {
    try {
      const { disasterReliefId } = req.params; // Get the construction ID from the request parameters
      const { costDetails } = req.body;
  
      // Find the existing construction document
      const disasterRelief = await DisasterRelief.findById(disasterReliefId);
  
      if (!disasterRelief) {
        return apiResponse.ErrorResponse(res, "Disaster Relief Quotation not found.");
      }
  
      // Update the costDetails field
      disasterRelief.costDetails = costDetails;
  
      // Save the updated disasterRelief document
      await disasterRelief.save();
  
      const notification = new Notification({
        user: disasterRelief.user,
        quote_type: "disaster_relief",
        quote_id: disasterRelief._id,
        type: "UPDATE_QUOTE",
        status_seen: false
      });
      await notification.save();
      io.emit("update_quote", { disasterRelief });
  
      return apiResponse.successResponseWithData(
        res,
        "Quotation has been updated successfully",
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
            special_requirements,
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



exports.updatePersonalOrBusinessQuotation = async (req, res) => {
    try {
      const { personalOrBusinessId } = req.params; // Get the construction ID from the request parameters
      const { costDetails } = req.body;
  
      // Find the existing construction document
      const personalOrBusiness = await PersonalOrBusiness.findById(personalOrBusinessId);
  
      if (!personalOrBusiness) {
        return apiResponse.ErrorResponse(res, "Personal or Business Quotation not found.");
      }
  
      // Update the costDetails field
      personalOrBusiness.costDetails = costDetails;
  
      // Save the updated disasterRelief document
      await personalOrBusiness.save();
  
      const notification = new Notification({
        user: personalOrBusiness.user,
        quote_type: "personal-or-business",
        quote_id: personalOrBusiness._id,
        type: "UPDATE_QUOTE",
        status_seen: false
      });
      await notification.save();
      io.emit("update_quote", { personalOrBusiness });
  
      return apiResponse.successResponseWithData(
        res,
        "Quotation has been updated successfully",
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


exports.updateFarmOrchardWineryQuotation = async (req, res) => {
    try {
      const { farmOrchardWineryId } = req.params; // Get the construction ID from the request parameters
      const { costDetails } = req.body;
  
      // Find the existing construction document
      const farmOrchardWinery = await FarmOrchardWinery.findById(farmOrchardWineryId);
  
      if (!farmOrchardWinery) {
        return apiResponse.ErrorResponse(res, "Farm, Orchard or Winery Quotation not found.");
      }
  
      // Update the costDetails field
      farmOrchardWinery.costDetails = costDetails;
  
      // Save the updated disasterRelief document
      await farmOrchardWinery.save();
  
      const notification = new Notification({
        user: farmOrchardWinery.user,
        quote_type: "farm-orchard-winery",
        quote_id: farmOrchardWinery._id,
        type: "UPDATE_QUOTE",
        status_seen: false
      });
      await notification.save();
      io.emit("update_quote", { farmOrchardWinery });
  
      return apiResponse.successResponseWithData(
        res,
        "Quotation has been updated successfully",
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
            peakUseTimes,
            peakTimeSlot,
            maxAttendees,
            alcoholServed,
            special_requirements,
            vipSection: {
                payPerUse,
                fencedOff,
                activelyCleaned
            },

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
            maxAttendees,
            alcoholServed,
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
            serviceFrequency,
            eventDetails: {
                eventName,
                eventDate,
                eventType,
                eventLocation,
                eventMapLocation
            },
            vipSection: {
                payPerUse,
                fencedOff,
                activelyCleaned
            },

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

exports.updateEventQuotation = async (req, res) => {
    try {
      const { eventId } = req.params; // Get the construction ID from the request parameters
      const { costDetails } = req.body;
  
      // Find the existing construction document
      const event = await Event.findById(eventId);
  
      if (!event) {
        return apiResponse.ErrorResponse(res, "Event Quotation not found.");
      }
  
      // Update the costDetails field
      event.costDetails = costDetails;
  
      // Save the updated disasterRelief document
      await event.save();
  
      const notification = new Notification({
        user: event.user,
        quote_type: "event",
        quote_id: event._id,
        type: "UPDATE_QUOTE",
        status_seen: false
      });
      await notification.save();
      io.emit("update_quote", { event });
  
      return apiResponse.successResponseWithData(
        res,
        "Quotation has been updated successfully",
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


        if (quotationType == 'all') {
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
        }
        else {
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
        }
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
