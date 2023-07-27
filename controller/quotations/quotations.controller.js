const Construction = require('../../models/construction/construction.schema');
const apiResponse = require("../../helpers/apiResponse");
const logger = require("../../helpers/logger");
const { server } = require('../../server');
const DisasterRelief = require('../../models/disasterRelief/disasterRelief.schema');
const PersonalOrBusiness = require('../../models/personalOrBusiness/personal_or_business_site.schema');
const FarmOrchardWinery = require('../../models/farm_orchard_winery/farm_orchard_winery.schema');
const Event = require('../../models/event/event.schema');
const { default: mongoose } = require('mongoose');
const Notification = require('../../models/notification/notification.schema');
const io = require('socket.io')(server);
const userHelper = require('../../helpers/user');
const Subscription = require("../stripe/models/subscription.schema");
const mailer = require("../../helpers/nodemailer");
const User = require('../../models/user/user.schema');
const RecreationalSite = require('../../models/recreationalSite/recreationalSite.schema');
const PDFDocument = require('pdfkit');

exports.createConstructionQuotation = async (req, res) => {
    try {

        let { error, user, message } = await userHelper.createUser(req.body.coordinator);

        if (error) {
            return apiResponse.ErrorResponse(res, message);
        }

        const _id = user._id.toString();

        const {
            coordinator: { name, email, cellNumber },
            maxWorkers,
            weeklyHours,
            placementDate,
            restrictedAccess,
            restrictedAccessDescription,
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
            productTypes,
            femaleWorkers,
            maleWorkers,
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
        } = req.body;

        const totalWorkers = parseInt(femaleWorkers) + parseInt(maleWorkers);

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
            restrictedAccessDescription,
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
            productTypes,
            femaleWorkers,
            maleWorkers,
            totalWorkers,
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
        console.log(error);
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.createRecreationalSiteQuotation = async (req, res) => {
    try {

        let { error, user, message } = await userHelper.createUser(req.body.coordinator);

        if (error) {
            return apiResponse.ErrorResponse(res, message);
        }

        const _id = user._id.toString();

        const {
            coordinator: { name, email, cellNumber },
            maxWorkers,
            weeklyHours,
            placementDate,
            placementLocation,
            restrictedAccess,
            restrictedAccessDescription,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            useAtNight,
            useInWinter,
            deliveredPrice,
            special_requirements,
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
        } = req.body;

        const totalWorkers = parseInt(femaleWorkers) + parseInt(maleWorkers);

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
            restrictedAccessDescription,
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
            productTypes,
            femaleWorkers,
            maleWorkers,
            totalWorkers,
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
        };

        // Create a new Construction instance with the quotation object as properties
        const recreationalSite = new RecreationalSite(quotation);

        // Save the construction instance
        await recreationalSite.save();


        const notification = new Notification({
            user: quotation.user,
            quote_type: "recreational-site",
            quote_id: recreationalSite._id,
            type: "CREATE_QUOTE",
            status_seen: false
        });
        await notification.save();

        return apiResponse.successResponseWithData(
            res,
            "Quotation has been created successfully",
            recreationalSite
        );
    } catch (error) {
        console.log(error);
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.updateConstructionQuotation = async (req, res) => {
    try {
        const { constructionId } = req.params; // Get the construction ID from the request parameters
        const { costDetails, type = "" } = req.body;

        // Find the existing Construction document
        const construction = await Construction.findById(constructionId);

        if (!construction) {
            return apiResponse.ErrorResponse(res, "Construction document not found.");
        }

        // Update the costDetails field
        construction.costDetails = costDetails;


        // Save the updated construction document
        await construction.save();
        if (type !== 'save') {
            const notification = new Notification({
                user: construction.user,
                quote_type: 'recreational-site',
                quote_id: construction._id,
                type: 'UPDATE_QUOTE',
                status_seen: false,
            });
            await notification.save();
            io.emit('update_quote', { construction });

            const user = await User.findById(construction.user);

            // Generate the PDF content
            const pdfDoc = new PDFDocument();

            // Create a buffer to store the PDF data
            let pdfBuffer = Buffer.alloc(0);
            pdfDoc.on('data', (chunk) => {
                pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
            });
            pdfDoc.on('end', () => {
                console.log(user.email)
                // Send the email with the PDF attachment
                const mailOptions = {
                    from: process.env.MAIL_FROM,
                    to: user.email,
                    subject: 'Quotation Update - Action Required',
                    text: `Hi,\n\nWe have updated your quotation with the requisite price and details. You can now proceed to make the payment and subscribe by logging into your dashboard.\n\nTo make the payment and subscribe, please follow these steps:\n1. Log in to your account on our website dashboard.\n2. Navigate to the "Quotations" section.\n3. Review the updated quotation with the final price and details.\n4. Click on the "Make Payment" or "Subscribe" button to proceed with the payment process.\n\nIf you encounter any issues or have any questions, please don't hesitate to contact our support team. We are here to assist you every step of the way.\n\nThank you for choosing Bold Portable.\n\nBest regards,\nBold Portable Team`,
                    attachments: [
                        {
                            filename: `quotation_update-${construction}.pdf`,
                            content: pdfBuffer,
                        },
                    ],
                };
                mailer.sendMail(mailOptions);
            });

            // Add quotation details to the PDF
            addQuotationDetails(pdfDoc, construction);

            // End the document
            pdfDoc.end();
        }

        return apiResponse.successResponseWithData(
            res,
            "Quotation has been updated successfully",
            construction
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};
const addQuotationDetails = (pdfDoc, quotationData) => {
    pdfDoc.text("Here's the complete Quotation");
    pdfDoc.text(`Hi ${quotationData.coordinator.name},`);
    pdfDoc.text('We have updated your quotation with the requisite price and details.');
    pdfDoc.text('');

    pdfDoc.text(`Quotation ID: ${quotationData._id}`);
    pdfDoc.text(`Quotation Type: ${quotationData.quotationType}`);
    pdfDoc.text(`Max Workers: ${quotationData.maxWorkers}`);
    pdfDoc.text(`Weekly Hours: ${quotationData.weeklyHours}`);
    // Add more quotation details as needed
    pdfDoc.text('');

    pdfDoc.text('Cost Details:');
    pdfDoc.text(`Twice Weekly Servicing: $${quotationData.costDetails.twiceWeeklyServicing}`);
    pdfDoc.text(`Use At Night Cost: $${quotationData.costDetails.useAtNightCost}`);
    pdfDoc.text(`Use In Winter Cost: $${quotationData.costDetails.useInWinterCost}`);
    pdfDoc.text(`Number of Units Cost: $${quotationData.costDetails.numberOfUnitsCost}`);
    pdfDoc.text(`Delivery Price: $${quotationData.costDetails.deliveryPrice}`);
    pdfDoc.text(`Workers Cost: $${quotationData.costDetails.workersCost}`);
    pdfDoc.text(`Hand Washing Cost: $${quotationData.costDetails.handWashingCost}`);
    pdfDoc.text(`Hand Sanitizer Pump Cost: $${quotationData.costDetails.handSanitizerPumpCost}`);
    pdfDoc.text(`Special Requirements Cost: $${quotationData.costDetails.specialRequirementsCost}`);
    pdfDoc.text(`Service Frequency Cost: $${quotationData.costDetails.serviceFrequencyCost}`);
    pdfDoc.text(`Weekly Hours Cost: $${quotationData.costDetails.weeklyHoursCost}`);
    // Add more cost details as needed

    pdfDoc.text(`Placement Date: ${new Date(quotationData.placementDate).toLocaleDateString()}`);
    pdfDoc.text(`Distance From Kelowna: ${quotationData.distanceFromKelowna} km`);
    pdfDoc.text(`Service Charge: $${quotationData.serviceCharge}`);
    pdfDoc.text(`Delivered Price: $${quotationData.deliveredPrice}`);
    pdfDoc.text(`Use At Night: ${quotationData.useAtNight ? 'Yes' : 'No'}`);
    pdfDoc.text(`Use In Winter: ${quotationData.useInWinter ? 'Yes' : 'No'}`);

    // Add more content to the PDF as needed
};

exports.updateRecreationalSiteQuotation = async (req, res) => {
    try {
        const { recreationalSiteId } = req.params; // Get the recreationalSite ID from the request parameters
        const { costDetails, type = '' } = req.body;
        // Find the existing recreationalSite document
        const recreationalSite = await RecreationalSite.findById(recreationalSiteId);

        if (!recreationalSite) {
            return apiResponse.ErrorResponse(res, 'RecreationalSite document not found.');
        }

        // Update the recreationalSite field
        recreationalSite.costDetails = costDetails;

        // Save the updated recreationalSite document
        await recreationalSite.save();
        if (type !== 'save') {
            const notification = new Notification({
                user: recreationalSite.user,
                quote_type: 'recreational-site',
                quote_id: recreationalSite._id,
                type: 'UPDATE_QUOTE',
                status_seen: false,
            });
            await notification.save();
            io.emit('update_quote', { recreationalSite });

            const user = await User.findById(recreationalSite.user);

            // Generate the PDF content
            const pdfDoc = new PDFDocument();

            // Create a buffer to store the PDF data
            let pdfBuffer = Buffer.alloc(0);
            pdfDoc.on('data', (chunk) => {
                pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
            });
            pdfDoc.on('end', () => {
                // Send the email with the PDF attachment
                const mailOptions = {
                    from: process.env.MAIL_FROM,
                    to: user.email,
                    subject: 'Quotation Update - Action Required',
                    text: `Hi,\n\nWe have updated your quotation with the requisite price and details. You can now proceed to make the payment and subscribe by logging into your dashboard.\n\nTo make the payment and subscribe, please follow these steps:\n1. Log in to your account on our website dashboard.\n2. Navigate to the "Quotations" section.\n3. Review the updated quotation with the final price and details.\n4. Click on the "Make Payment" or "Subscribe" button to proceed with the payment process.\n\nIf you encounter any issues or have any questions, please don't hesitate to contact our support team. We are here to assist you every step of the way.\n\nThank you for choosing Bold Portable.\n\nBest regards,\nBold Portable Team`,
                    attachments: [
                        {
                            filename: `quotation_update-${recreationalSiteId}.pdf`,
                            content: pdfBuffer,
                        },
                    ],
                };
                mailer.sendMail(mailOptions);
            });

            // Add quotation details to the PDF
            addQuotationDetails(pdfDoc, recreationalSite);

            // End the document
            pdfDoc.end();
        }

        return apiResponse.successResponseWithData(res, 'Quotation has been updated successfully', recreationalSite);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.createDisasterReliefQuotation = async (req, res) => {
    try {
        let { error, user, message } = await userHelper.createUser(req.body.coordinator);

        if (error) {
            return apiResponse.ErrorResponse(res, message);
        }

        const _id = user._id.toString();

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
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
            restrictedAccess,
            restrictedAccessDescription
        } = req.body;

        const totalWorkers = parseInt(femaleWorkers) + parseInt(maleWorkers);

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
            serviceFrequency,
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            totalWorkers,
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
            restrictedAccess,
            restrictedAccessDescription
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
        const { costDetails, type = "" } = req.body;

        // Find the existing construction document
        const disasterRelief = await DisasterRelief.findById(disasterReliefId);

        if (!disasterRelief) {
            return apiResponse.ErrorResponse(res, "Disaster Relief Quotation not found.");
        }

        // Update the costDetails field
        disasterRelief.costDetails = costDetails;

        // Save the updated disasterRelief document
        await disasterRelief.save();
        if (type !== 'save') {
            const notification = new Notification({
                user: disasterRelief.user,
                quote_type: 'recreational-site',
                quote_id: disasterRelief._id,
                type: 'UPDATE_QUOTE',
                status_seen: false,
            });
            await notification.save();
            io.emit('update_quote', { disasterRelief });

            const user = await User.findById(disasterRelief.user);

            // Generate the PDF content
            const pdfDoc = new PDFDocument();

            // Create a buffer to store the PDF data
            let pdfBuffer = Buffer.alloc(0);
            pdfDoc.on('data', (chunk) => {
                pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
            });
            pdfDoc.on('end', () => {
                // Send the email with the PDF attachment
                const mailOptions = {
                    from: process.env.MAIL_FROM,
                    to: user.email,
                    subject: 'Quotation Update - Action Required',
                    text: `Hi,\n\nWe have updated your quotation with the requisite price and details. You can now proceed to make the payment and subscribe by logging into your dashboard.\n\nTo make the payment and subscribe, please follow these steps:\n1. Log in to your account on our website dashboard.\n2. Navigate to the "Quotations" section.\n3. Review the updated quotation with the final price and details.\n4. Click on the "Make Payment" or "Subscribe" button to proceed with the payment process.\n\nIf you encounter any issues or have any questions, please don't hesitate to contact our support team. We are here to assist you every step of the way.\n\nThank you for choosing Bold Portable.\n\nBest regards,\nBold Portable Team`,
                    attachments: [
                        {
                            filename: `quotation_update-${disasterRelief}.pdf`,
                            content: pdfBuffer,
                        },
                    ],
                };
                mailer.sendMail(mailOptions);
            });

            // Add quotation details to the PDF
            addQuotationDetails(pdfDoc, disasterRelief);

            // End the document
            pdfDoc.end();
        }
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
        let { error, user, message } = await userHelper.createUser(req.body.coordinator);

        if (error) {
            return apiResponse.ErrorResponse(res, message);
        }

        const _id = user._id.toString();
        const {
            useType,
            coordinator: { name, email, cellNumber },
            maxWorkers,
            weeklyHours,
            placementDate,
            placementLocation,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            useAtNight,
            useInWinter,
            special_requirements,
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
            restrictedAccess,
            restrictedAccessDescription
        } = req.body;

        const totalWorkers = parseInt(femaleWorkers) + parseInt(maleWorkers);

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
            placementDate: placementDate,
            placementLocation,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            deliveredPrice,
            useAtNight: useAtNight,
            useInWinter: useInWinter,
            special_requirements,
            numUnits,
            serviceFrequency,
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            totalWorkers: parseInt(maleWorkers) + parseInt(femaleWorkers),
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
            restrictedAccess,
            restrictedAccessDescription
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
        const { costDetails, type = "" } = req.body;

        // Find the existing construction document
        const personalOrBusiness = await PersonalOrBusiness.findById(personalOrBusinessId);

        if (!personalOrBusiness) {
            return apiResponse.ErrorResponse(res, "Personal or Business Quotation not found.");
        }

        // Update the costDetails field
        personalOrBusiness.costDetails = costDetails;

        // Save the updated disasterRelief document
        await personalOrBusiness.save();
        if (type !== 'save') {
            const notification = new Notification({
                user: personalOrBusiness.user,
                quote_type: 'recreational-site',
                quote_id: personalOrBusiness._id,
                type: 'UPDATE_QUOTE',
                status_seen: false,
            });
            await notification.save();
            io.emit('update_quote', { personalOrBusiness });

            const user = await User.findById(personalOrBusiness.user);

            // Generate the PDF content
            const pdfDoc = new PDFDocument();

            // Create a buffer to store the PDF data
            let pdfBuffer = Buffer.alloc(0);
            pdfDoc.on('data', (chunk) => {
                pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
            });
            pdfDoc.on('end', () => {
                // Send the email with the PDF attachment
                const mailOptions = {
                    from: process.env.MAIL_FROM,
                    to: user.email,
                    subject: 'Quotation Update - Action Required',
                    text: `Hi,\n\nWe have updated your quotation with the requisite price and details. You can now proceed to make the payment and subscribe by logging into your dashboard.\n\nTo make the payment and subscribe, please follow these steps:\n1. Log in to your account on our website dashboard.\n2. Navigate to the "Quotations" section.\n3. Review the updated quotation with the final price and details.\n4. Click on the "Make Payment" or "Subscribe" button to proceed with the payment process.\n\nIf you encounter any issues or have any questions, please don't hesitate to contact our support team. We are here to assist you every step of the way.\n\nThank you for choosing Bold Portable.\n\nBest regards,\nBold Portable Team`,
                    attachments: [
                        {
                            filename: `quotation_update-${personalOrBusiness}.pdf`,
                            content: pdfBuffer,
                        },
                    ],
                };
                mailer.sendMail(mailOptions);
            });

            // Add quotation details to the PDF
            addQuotationDetails(pdfDoc, personalOrBusiness);

            // End the document
            pdfDoc.end();
        }
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
        let { error, user, message } = await userHelper.createUser(req.body.coordinator);

        if (error) {
            return apiResponse.ErrorResponse(res, message);
        }

        const _id = user._id.toString();
        const {
            useType,
            coordinator: { name, email, cellNumber },
            maxWorkers,
            weeklyHours,
            placementDate,
            placementLocation,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            useAtNight,
            useInWinter,
            special_requirements,
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
            restrictedAccess,
            restrictedAccessDescription
        } = req.body;

        const totalWorkers = parseInt(femaleWorkers) + parseInt(maleWorkers);

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
            placementDate,
            placementLocation,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            deliveredPrice,
            useAtNight: useAtNight,
            useInWinter: useInWinter,
            special_requirements,
            numUnits,
            serviceFrequency,
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            totalWorkers: parseInt(maleWorkers) + parseInt(femaleWorkers),
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
            restrictedAccess,
            restrictedAccessDescription
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
        const { costDetails, type = "" } = req.body;

        // Find the existing construction document
        const farmOrchardWinery = await FarmOrchardWinery.findById(farmOrchardWineryId);

        if (!farmOrchardWinery) {
            return apiResponse.ErrorResponse(res, "Farm, Orchard or Winery Quotation not found.");
        }

        // Update the costDetails field
        farmOrchardWinery.costDetails = costDetails;

        // Save the updated disasterRelief document
        await farmOrchardWinery.save();
        if (type !== 'save') {
            const notification = new Notification({
                user: farmOrchardWinery.user,
                quote_type: 'recreational-site',
                quote_id: farmOrchardWinery._id,
                type: 'UPDATE_QUOTE',
                status_seen: false,
            });
            await notification.save();
            io.emit('update_quote', { farmOrchardWinery });

            const user = await User.findById(farmOrchardWinery.user);

            // Generate the PDF content
            const pdfDoc = new PDFDocument();

            // Create a buffer to store the PDF data
            let pdfBuffer = Buffer.alloc(0);
            pdfDoc.on('data', (chunk) => {
                pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
            });
            pdfDoc.on('end', () => {
                // Send the email with the PDF attachment
                const mailOptions = {
                    from: process.env.MAIL_FROM,
                    to: user.email,
                    subject: 'Quotation Update - Action Required',
                    text: `Hi,\n\nWe have updated your quotation with the requisite price and details. You can now proceed to make the payment and subscribe by logging into your dashboard.\n\nTo make the payment and subscribe, please follow these steps:\n1. Log in to your account on our website dashboard.\n2. Navigate to the "Quotations" section.\n3. Review the updated quotation with the final price and details.\n4. Click on the "Make Payment" or "Subscribe" button to proceed with the payment process.\n\nIf you encounter any issues or have any questions, please don't hesitate to contact our support team. We are here to assist you every step of the way.\n\nThank you for choosing Bold Portable.\n\nBest regards,\nBold Portable Team`,
                    attachments: [
                        {
                            filename: `quotation_update-${farmOrchardWinery}.pdf`,
                            content: pdfBuffer,
                        },
                    ],
                };
                mailer.sendMail(mailOptions);
            });

            // Add quotation details to the PDF
            addQuotationDetails(pdfDoc, farmOrchardWinery);

            // End the document
            pdfDoc.end();
        }
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
        let { error, user, message } = await userHelper.createUser(req.body.coordinator);

        if (error) {
            return apiResponse.ErrorResponse(res, message);
        }

        const _id = user._id.toString();
        const {
            eventDetails: { eventName, eventDate, eventType, eventLocation, eventMapLocation },
            coordinator: { name, email, cellNumber },
            maxWorkers,
            weeklyHours,
            placementDate,
            placementLocation,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            useAtNight,
            useInWinter,
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
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
            restrictedAccess,
            restrictedAccessDescription
        } = req.body;

        const totalWorkers = parseInt(femaleWorkers) + parseInt(maleWorkers);

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
            placementDate,
            placementLocation,
            originPoint,
            distanceFromKelowna,
            serviceCharge,
            deliveredPrice,
            useAtNight: useAtNight,
            useInWinter: useInWinter,
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
            designatedWorkers,
            workerTypes,
            productTypes,
            femaleWorkers,
            maleWorkers,
            totalWorkers: parseInt(maleWorkers) + parseInt(femaleWorkers),
            handwashing,
            handSanitizerPump,
            twiceWeeklyService,
            dateTillUse,
            restrictedAccess,
            restrictedAccessDescription
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
        const { costDetails, type = "" } = req.body;

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
        if (type !== 'save') {
            const notification = new Notification({
                user: event.user,
                quote_type: 'recreational-site',
                quote_id: event._id,
                type: 'UPDATE_QUOTE',
                status_seen: false,
            });
            await notification.save();
            io.emit('update_quote', { event });

            const user = await User.findById(event.user);

            // Generate the PDF content
            const pdfDoc = new PDFDocument();

            // Create a buffer to store the PDF data
            let pdfBuffer = Buffer.alloc(0);
            pdfDoc.on('data', (chunk) => {
                pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
            });
            pdfDoc.on('end', () => {
                // Send the email with the PDF attachment
                const mailOptions = {
                    from: process.env.MAIL_FROM,
                    to: user.email,
                    subject: 'Quotation Update - Action Required',
                    text: `Hi,\n\nWe have updated your quotation with the requisite price and details. You can now proceed to make the payment and subscribe by logging into your dashboard.\n\nTo make the payment and subscribe, please follow these steps:\n1. Log in to your account on our website dashboard.\n2. Navigate to the "Quotations" section.\n3. Review the updated quotation with the final price and details.\n4. Click on the "Make Payment" or "Subscribe" button to proceed with the payment process.\n\nIf you encounter any issues or have any questions, please don't hesitate to contact our support team. We are here to assist you every step of the way.\n\nThank you for choosing Bold Portable.\n\nBest regards,\nBold Portable Team`,
                    attachments: [
                        {
                            filename: `quotation_update-${event}.pdf`,
                            content: pdfBuffer,
                        },
                    ],
                };
                mailer.sendMail(mailOptions);
            });

            // Add quotation details to the PDF
            addQuotationDetails(pdfDoc, event);

            // End the document
            pdfDoc.end();
        }
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
                RecreationalSite.find(),
            ]).then(([events, farmOrchardWineries, personalOrBusinesses, disasterReliefs, constructions, recreationalSite]) => {
                return [
                    ...events.map(event => ({ ...event.toObject(), type: 'event' })),
                    ...farmOrchardWineries.map(farmOrchardWinery => ({ ...farmOrchardWinery.toObject(), type: 'farm-orchard-winery' })),
                    ...personalOrBusinesses.map(personalOrBusiness => ({ ...personalOrBusiness.toObject(), type: 'personal-or-business' })),
                    ...disasterReliefs.map(disasterRelief => ({ ...disasterRelief.toObject(), type: 'disaster-relief' })),
                    ...constructions.map(construction => ({ ...construction.toObject(), type: 'construction' })),
                    ...recreationalSite.map(recreationalSite => ({ ...recreationalSite.toObject(), type: 'recreational-site' })),
                ];
            });
            quotations.sort((a, b) => b.createdAt - a.createdAt);

            // Filtering quotations with pending and cancelled status only
            const filteredQuotations = quotations.filter(quotation => quotation.status === 'pending' || quotation.status === 'cancelled');
            const count = filteredQuotations.length;

            return apiResponse.successResponseWithData(
                res,
                "Quotations retrieved successfully",
                {
                    quotations: filteredQuotations.slice((page - 1) * limit, page * limit),
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
                case 'recreational-site':
                    quotations = await RecreationalSite.find()
                        .skip((page - 1) * limit)
                        .limit(limit);
                    break;
                default:
                    throw new Error(`Quotation type '${quotationType}' not found`);
            }

            // Filtering quotations with pending and cancelled status only
            const filteredQuotations = quotations.filter(quotation => quotation.status === 'pending' || quotation.status === 'cancelled');
            const count = filteredQuotations.length;

            const quotationTypeFormatted = quotationType.replace(/-/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join('');

            const QuotationModel = mongoose.model(quotationTypeFormatted);

            return apiResponse.successResponseWithData(
                res,
                "Quotations retrieved successfully",
                {
                    quotations: filteredQuotations,
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
        const { user_type, _id } = req.userData.user;
        console.log(user_type, _id);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        let quotations = [];

        if (user_type === 'USER') {
            const [
                events,
                farmOrchardWineries,
                personalOrBusinesses,
                disasterReliefs,
                constructions,
                recreationalSite
            ] = await Promise.all([
                Event.find({ user: _id }),
                FarmOrchardWinery.find({ user: _id }),
                PersonalOrBusiness.find({ user: _id }),
                DisasterRelief.find({ user: _id }),
                Construction.find({ user: _id }),
                RecreationalSite.find({ user: _id }),
            ]);

            quotations = [
                ...events.map(event => ({ ...event.toObject(), type: 'event' })),
                ...farmOrchardWineries.map(farmOrchardWinery => ({ ...farmOrchardWinery.toObject(), type: 'farm-orchard-winery' })),
                ...personalOrBusinesses.map(personalOrBusiness => ({ ...personalOrBusiness.toObject(), type: 'personal-or-business' })),
                ...disasterReliefs.map(disasterRelief => ({ ...disasterRelief.toObject(), type: 'disaster-relief' })),
                ...constructions.map(construction => ({ ...construction.toObject(), type: 'construction' })),
                ...recreationalSite.map(recreationalSite => ({ ...recreationalSite.toObject(), type: 'recreational-site' }))
            ];

            quotations.sort((a, b) => b.createdAt - a.createdAt);
        } else {
            // Handle other user types if needed
            return apiResponse.ErrorResponse(res, "Invalid user_type");
        }

        const count = quotations.length;
        console.log("quotationsData", quotations)

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
        const { user_type, _id } = req.userData.user;
        console.log(user_type, _id);
        const quoteId = req.body.quote_id;

        if (user_type === 'USER') {
            const quotations = await Promise.all([
                Event.findOne({ _id: quoteId, user: _id }),
                FarmOrchardWinery.findOne({ _id: quoteId, user: _id }),
                PersonalOrBusiness.findOne({ _id: quoteId, user: _id }),
                DisasterRelief.findOne({ _id: quoteId, user: _id }),
                Construction.findOne({ _id: quoteId, user: _id }),
                RecreationalSite.findOne({ _id: quoteId, user: _id }),
            ]).then(async ([event, farmOrchardWinery, personalOrBusiness, disasterRelief, construction, recreationalSite]) => {
                const quotations = [];
                console.log('mjmsdgfjgsjdgjf', recreationalSite)
                if (event) {
                    quotations.push({ ...event.toObject(), type: 'event' });
                    const costDetails = event.costDetails;

                    const quotationId = event._id.toString();
                    const subscription = await Subscription.findOne({
                        quotationId: quotationId,
                        quotationType: "Event",
                        user: _id
                    });
                    if (subscription) {
                        quotations[0].subscription = subscription._id.toString();
                        quotations[0].subscriptionStatus = subscription.status;
                    }

                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                }
                if (farmOrchardWinery) {
                    quotations.push({ ...farmOrchardWinery.toObject(), type: 'farm-orchard-winery' });
                    const costDetails = farmOrchardWinery.costDetails;

                    const quotationId = farmOrchardWinery._id.toString();
                    const subscription = await Subscription.findOne({
                        quotationId: quotationId,
                        quotationType: "FarmOrchardWinery",
                        user: _id
                    });
                    if (subscription) {
                        quotations[0].subscription = subscription._id.toString();
                        quotations[0].subscriptionStatus = subscription.status;
                    }

                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                }
                if (personalOrBusiness) {
                    quotations.push({ ...personalOrBusiness.toObject(), type: 'personal-or-business' });
                    const costDetails = personalOrBusiness.costDetails;

                    const quotationId = personalOrBusiness._id.toString();
                    const subscription = await Subscription.findOne({
                        quotationId: quotationId,
                        quotationType: "PersonalOrBusiness",
                        user: _id
                    });
                    if (subscription) {
                        quotations[0].subscription = subscription._id.toString();
                        quotations[0].subscriptionStatus = subscription.status;
                    }

                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                }
                if (disasterRelief) {
                    quotations.push({ ...disasterRelief.toObject(), type: 'disaster-relief' });
                    const costDetails = disasterRelief.costDetails;

                    const quotationId = disasterRelief._id.toString();
                    const subscription = await Subscription.findOne({
                        quotationId: quotationId,
                        quotationType: "DisasterRelief",
                        user: _id
                    });
                    if (subscription) {
                        quotations[0].subscription = subscription._id.toString();
                        quotations[0].subscriptionStatus = subscription.status;
                    }

                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                }
                if (construction) {
                    quotations.push({ ...construction.toObject(), type: 'construction' });
                    const costDetails = construction.costDetails;

                    const quotationId = construction._id.toString();
                    const subscription = await Subscription.findOne({
                        quotationId: quotationId,
                        quotationType: "Construction",
                        user: _id
                    });
                    if (subscription) {
                        quotations[0].subscription = subscription._id.toString();
                        quotations[0].subscriptionStatus = subscription.status;
                    }
                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                }
                if (recreationalSite) {
                    quotations.push({ ...recreationalSite.toObject(), type: 'recreational-site' });
                    const costDetails = recreationalSite.costDetails;

                    const quotationId = recreationalSite._id.toString();
                    const subscription = await Subscription.findOne({
                        quotationId: quotationId,
                        quotationType: "RecreationalSite",
                        user: _id
                    });
                    if (subscription) {
                        quotations[0].subscription = subscription._id.toString();
                        quotations[0].subscriptionStatus = subscription.status;
                    }
                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
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
        } else {
            const quotations = await Promise.all([
                Event.findOne({ _id: quoteId }),
                FarmOrchardWinery.findOne({ _id: quoteId }),
                PersonalOrBusiness.findOne({ _id: quoteId }),
                DisasterRelief.findOne({ _id: quoteId }),
                Construction.findOne({ _id: quoteId }),
                RecreationalSite.findOne({ _id: quoteId }),
            ]).then(([event, farmOrchardWinery, personalOrBusiness, disasterRelief, construction, recreationalSite]) => {
                const quotations = [];
                if (event) {
                    quotations.push({ ...event.toObject(), type: 'event' });
                    const costDetails = event.costDetails;
                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                }
                if (farmOrchardWinery) {
                    quotations.push({ ...farmOrchardWinery.toObject(), type: 'farm-orchard-winery' });
                    const costDetails = farmOrchardWinery.costDetails;
                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                }
                if (personalOrBusiness) {
                    quotations.push({ ...personalOrBusiness.toObject(), type: 'personal-or-business' });
                    const costDetails = personalOrBusiness.costDetails;
                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                }
                if (disasterRelief) {
                    quotations.push({ ...disasterRelief.toObject(), type: 'disaster-relief' });
                    const costDetails = disasterRelief.costDetails;
                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                }
                if (construction) {
                    quotations.push({ ...construction.toObject(), type: 'construction' });
                    const costDetails = construction.costDetails;
                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
                }
                if (recreationalSite) {
                    quotations.push({ ...recreationalSite.toObject(), type: 'recreational-site' });
                    const costDetails = recreationalSite.costDetails;
                    if (costDetails) {
                        const costDetailsSum = Object.values(costDetails).reduce((acc, val) => acc + val, 0);
                        quotations[0].costDetailsSum = costDetailsSum;
                    }
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
        }
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.quotatByIdAndType = async (req, res) => {
    try {
        const { quotationId, quotationType } = req.query;
        const quoteModel = require(`../../models/${quotationType}/${quotationType}.schema`);
        const quotation = await quoteModel.find({
            _id: quotationId,
        });

        if (!quotation) {
            return apiResponse.ErrorResponse(res, "Quotation not found");
        }

        return apiResponse.successResponseWithData(
            res,
            "Quotation retrieved successfully",
            quotation
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};


exports.cancelQuotation = async (req, res) => {
    try {
        const { quotationId, quotationType } = req.body;

        let quotation;

        switch (quotationType) {
            case 'event':
                quotation = await Event.findOne({ _id: quotationId });
                break;
            case 'farm-orchard-winery':
                quotation = await FarmOrchardWinery.findOne({ _id: quotationId });
                break;
            case 'personal-or-business':
                quotation = await PersonalOrBusiness.findOne({ _id: quotationId });
                console.log('djkdjkd', quotation)
                break;
            case 'disaster-relief':
                quotation = await DisasterRelief.findOne({ _id: quotationId });
                break;
            case 'construction':
                quotation = await Construction.findOne({ _id: quotationId });
                break;
            case 'recreational-site':
                quotation = await RecreationalSite.findOne({ _id: quotationId });
                break;
            default:
                throw new Error(`Quotation type '${quotationType}' not found`);
        }

        quotation.status = 'cancelled';

        await quotation.save();

        return apiResponse.successResponse(res, "Quotations canceled");
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};
