const mailer = require("../../helpers/nodemailer");
const sendSms = require("../../helpers/twillioSms.js");
const { server } = require('../../server');
const io = require('socket.io')(server);
const apiResponse = require("../../helpers/apiResponse");
const AdminEmail = require('../../models/adminEmail/adminEmail.schema');

exports.send = async (req, res) => {
	try {
		const { header, body } = req.body;

		const mailOptions = {
			from: process.env.MAIL_FROM,
			to: 'info@go-bold.ca',
			subject: header,
			text: body,
			html: `<html>
			   <body>
				 <p>Hi ${body}</p>
			   </body>
			 </html>`
		};

		mailer.sendMail(mailOptions);

		return apiResponse.successResponseWithData(
			res,
			"Mail sent successfully.",
		);
	} catch (error) {
		return apiResponse.ErrorResponse(res, error.message);
	}
};

exports.save = async (req, res) => {
	try {
		const { header, body, slug, description } = req.body;

		const adminEmail = new AdminEmail({
			header,
			body,
			slug,
			description
		});

		await adminEmail.save();

		return apiResponse.successResponseWithData(
			res,
			"Mail template saved successfully.",
			adminEmail
		);
	} catch (error) {
		return apiResponse.ErrorResponse(res, error.message);
	}
};

exports.updateBySlug = async (req, res) => {
	try {
		const { slug } = req.body;
		const { header, body, description } = req.body;

		const adminEmail = await AdminEmail.findOne({ slug });

		if (!adminEmail) {
			return apiResponse.notFoundResponse(res, "AdminEmail not found.");
		}

		if (!header || !body) {
			return apiResponse.validationError(res, "Header and Body are required fields.");
		}

		adminEmail.header = header;
		adminEmail.body = body;
		adminEmail.description = description;

		await adminEmail.save();

		return apiResponse.successResponseWithData(
			res,
			"AdminEmail updated successfully.",
			adminEmail
		);
	} catch (error) {
		return apiResponse.ErrorResponse(res, error.message);
	}
};
